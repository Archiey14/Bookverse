import { Router } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { read, update } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const USD_TO_INR_DEMO_RATE = 84;

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

    return res.json({ success: true, message: "Payment verified successfully." });
  } catch (error) {
    console.error("Payment verification failed:", error.message);
    return res.status(500).json({ message: "Could not verify payment." });
  }
});

export default router;
