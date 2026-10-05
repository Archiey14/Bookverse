import { Router } from "express";
import { read, update } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const states = await read("shoppingStates");
    const state = states.find(
      (entry) => String(entry.userId) === String(req.user.id),
    );

    return res.json({
      cart: state?.cart ?? {},
      wishlist: state?.wishlist ?? [],
    });
  } catch (error) {
    console.error("Could not load shopping state:", error.message);
    return res.status(500).json({ message: "Could not load your bag and wishlist." });
  }
});

router.put("/", requireAuth, async (req, res) => {
  const cartInput = req.body?.cart;
  const wishlistInput = req.body?.wishlist;

  if (!cartInput || typeof cartInput !== "object" || Array.isArray(cartInput)) {
    return res.status(400).json({ message: "Invalid bag data." });
  }

  if (!Array.isArray(wishlistInput)) {
    return res.status(400).json({ message: "Invalid wishlist data." });
  }

  try {
    const books = await read("books");
    const validBookIds = new Set(books.map((book) => Number(book.id)));
    const cart = {};

    for (const [rawId, rawQuantity] of Object.entries(cartInput)) {
      const bookId = Number(rawId);
      const quantity = Number(rawQuantity);
      const book = books.find((entry) => Number(entry.id) === bookId);

      if (
        !validBookIds.has(bookId) ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 20 ||
        (typeof book.stock === "number" && quantity > book.stock)
      ) {
        return res.status(400).json({ message: "Invalid bag item." });
      }

      cart[bookId] = quantity;
    }

    const wishlist = [
      ...new Set(
        wishlistInput
          .map(Number)
          .filter((bookId) => Number.isInteger(bookId) && validBookIds.has(bookId)),
      ),
    ];

    const savedState = await update("shoppingStates", (states) => {
      let state = states.find(
        (entry) => String(entry.userId) === String(req.user.id),
      );

      if (!state) {
        state = { userId: req.user.id, cart: {}, wishlist: [] };
        states.push(state);
      }

      state.cart = cart;
      state.wishlist = wishlist;
      state.updatedAt = new Date().toISOString();
      return { cart: state.cart, wishlist: state.wishlist };
    });

    return res.json(savedState);
  } catch (error) {
    console.error("Could not save shopping state:", error.message);
    return res.status(500).json({ message: "Could not save your bag and wishlist." });
  }
});

export default router;
