import { Router } from "express";
import { read } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/overview", requireAuth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }

  try {
    const [books, orders, users] = await Promise.all([
      read("books"),
      read("orders"),
      read("users"),
    ]);

    const paidInrOrders = orders.filter(
      (order) =>
        String(order.status).toLowerCase() === "paid" &&
        order.currency === "INR",
    );

    const totalRevenuePaise = paidInrOrders.reduce(
      (sum, order) => sum + (Number(order.amount) || 0),
      0,
    );

    const lowStockBooks = books
      .filter((book) => {
        const threshold = Number(book.lowStockThreshold ?? 5);
        return Number(book.stock) <= threshold;
      })
      .map(({ id, title, stock, lowStockThreshold }) => ({
        id,
        title,
        stock,
        lowStockThreshold: Number(lowStockThreshold ?? 5),
      }));

    return res.json({
      bookCount: books.length,
      userCount: users.length,
      orderCount: orders.length,
      paidOrderCount: paidInrOrders.length,
      totalRevenuePaise,
      lowStockBooks,
    });
  } catch (error) {
    console.error("Admin overview failed:", error.message);
    return res.status(500).json({ message: "Could not load admin dashboard." });
  }
});

export default router;