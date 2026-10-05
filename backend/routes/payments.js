import { Router } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { read, update } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import nodemailer from "nodemailer";

const router = Router();
const USD_TO_INR_DEMO_RATE = 84;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>\"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '\"': "&quot;",
    "'": "&#39;",
  })[character]);
}

async function sendOrderConfirmation(order, user) {
  const email = process.env.GMAIL_USER;
  const appPassword = process.env.GMAIL_APP_PASSWORD;

  if (!email || !appPassword) {
    throw new Error("Gmail email settings are missing from backend/.env");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: appPassword,
    },
  });

  const itemRows = order.items
    .map(
      (item) =>
        `<tr><td>${escapeHtml(item.title)}</td><td>${item.quantity}</td><td>₹${(
          (item.pricePaise * item.quantity) /
          100
        ).toFixed(2)}</td></tr>`,
    )
    .join("");

  const total = (order.amount / 100).toFixed(2);
  const orderReference = escapeHtml(String(order.id).slice(-8));
  const name = escapeHtml(user.name || "book lover");
  const textItems = order.items
    .map(
      (item) =>
        `${item.title} × ${item.quantity} — ₹${(
          (item.pricePaise * item.quantity) /
          100
        ).toFixed(2)}`,
    )
    .join("\n");

  await transporter.sendMail({
    from: `Bookverse <${email}>`,
    to: user.email,
    subject: "Thank you for your Bookverse order",
    text: `Hi ${user.name || "book lover"},\n\nThank you for your order!\n\n${textItems}\n\nTotal paid: ₹${total}\nOrder reference: ${orderReference}\n\nHappy reading,\nBookverse`,
    html: `<div style="font-family:Arial,sans-serif;color:#29251f;max-width:600px;margin:auto"><h1 style="color:#79552c">Thank you for your order, ${name}!</h1><p>We’re glad you chose Bookverse. Here are your order details:</p><table style="width:100%;border-collapse:collapse"><thead><tr><th>Book</th><th>Qty</th><th>Price</th></tr></thead><tbody>${itemRows}</tbody></table><p><strong>Total paid: ₹${total}</strong></p><p>Order reference: ${orderReference}</p><p>Happy reading,<br>Bookverse</p></div>`,
  });

  return true;
}

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  console.log("[payment config]", {
    keyIdLoaded: Boolean(keyId),
    secretLoaded: Boolean(keySecret),
  });

  if (!keyId || !keySecret) {
    const error = new Error("Razorpay test keys are not configured.");
    error.status = 503;
    throw error;
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

// Front end sends book IDs and quantities.
// The backend looks up prices itself before creating the Razorpay order.
router.get("/orders", requireAuth, async (req, res) => {
  try {
    const allOrders = await read("orders");

    const userOrders = allOrders
      .filter((order) => String(order.userId) === String(req.user.id))
      .map((order) => ({
        id: order.id,
        date: new Date(order.paidAt || order.createdAt).toLocaleDateString(),
        total: Number(order.amount) / 100,
        status: order.status === "paid" ? "Paid" : "Pending",
      }));

    return res.json(userOrders);
  } catch (error) {
    console.error("Could not load user orders:", error.message);
    return res.status(500).json({ message: "Could not load your orders." });
  }
});

router.post("/create-order", requireAuth,async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    const books = await read("books");
    let totalPaise = 0;
    const orderItems = [];

    for (const item of items) {
      const book = books.find((entry) => entry.id === Number(item.bookId));
      const quantity = Number(item.quantity);

      if (!book || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        return res.status(400).json({ message: "Invalid cart item." });
      }

      const pricePaise = Math.round(
       Number(book.price) * USD_TO_INR_DEMO_RATE * 100,
      );

      if (!Number.isFinite(pricePaise) || pricePaise <= 0) {
        return res.status(400).json({ message: "Invalid book price." });
      }

      totalPaise += pricePaise * quantity;
      orderItems.push({
        bookId: book.id,
        title: book.title,
        quantity,
        pricePaise,
      });
    }

    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount: totalPaise,
      currency: "INR",
      receipt: `bv_${Date.now()}`,
    });

    await update("orders", (orders) => {
      orders.push({
      id: razorpayOrder.id,
      userId: req.user.id,
      items: orderItems,
      amount: totalPaise,
      currency: "INR",
      status: "pending",
      createdAt: new Date().toISOString(),
      });
    });

    return res.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error("Create payment order failed:", error.message);
    return res
      .status(error.status || 500)
      .json({ message: error.status ? error.message : "Could not create payment order." });
  }
});

// Verify Razorpay's signed checkout response on the backend.
router.post("/verify", requireAuth, async (req, res) => {
  try {
    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ message: "Missing payment verification details." });
    }

    const orders = await read("orders");
    const order = orders.find(
      (entry) => entry.id === orderId && String(entry.userId) === String(req.user.id),
    );
    if (!order) {
      return res.status(404).json({ message: "Payment order not found." });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(503).json({ message: "Razorpay keys are not configured." });
    }

    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${order.id}|${paymentId}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expected, "hex");
    const receivedBuffer = Buffer.from(signature, "hex");

    const signatureIsValid =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!signatureIsValid) {
      return res.status(400).json({ message: "Payment signature is invalid." });
    }

    await update("orders", (currentOrders) => {
      const currentOrder = currentOrders.find(
        (entry) => entry.id === orderId && String(entry.userId) === String(req.user.id),
      );
      if (!currentOrder) return;
      currentOrder.status = "paid";
      currentOrder.paymentId = paymentId;
      currentOrder.paidAt = new Date().toISOString();
    });

    let emailSent = Boolean(order.emailSentAt);
    if (!emailSent) {
      try {
        const users = await read("users");
        const user = users.find((entry) => String(entry.id) === String(req.user.id));
        if (user?.email) {
          emailSent = await sendOrderConfirmation(order, user);
          if (emailSent) {
            await update("orders", (currentOrders) => {
              const currentOrder = currentOrders.find(
                (entry) => entry.id === orderId && String(entry.userId) === String(req.user.id),
              );
              if (currentOrder) currentOrder.emailSentAt = new Date().toISOString();
            });
          }
        }
      } catch (emailError) {
        console.error("Order confirmation email failed:", emailError.message);
      }
    }

    return res.json({
      success: true,
      emailSent,
      message: "Payment verified successfully.",
    });
  } catch (error) {
    console.error("Payment verification failed:", error.message);
    return res.status(500).json({ message: "Could not verify payment." });
  }
});

export default router;
