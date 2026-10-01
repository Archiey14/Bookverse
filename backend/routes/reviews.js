import { Router } from "express";
import crypto from "crypto";
import { read, update } from "../db.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";

// Mounted at /api/books/:id/reviews
const router = Router({ mergeParams: true });

async function findBook(req, res) {
  const books = await read("books");
  const book = books.find((b) => b.id === Number(req.params.id));

  if (!book) {
    res.status(404).json({ message: "Book not found" });
    return null;
  }

  return book;
}

// What the public sees: no user ids, plus a flag for "this one is yours".
function present(review, currentUserId) {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    userName: review.userName,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    mine: currentUserId !== undefined && review.userId === currentUserId,
  };
}

// List a book's reviews (newest first)
router.get("/", optionalAuth, async (req, res) => {
  const book = await findBook(req, res);
  if (!book) return;

  const all = await read("reviews");

  const reviews = all
    .filter((review) => review.bookId === book.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  res.json(reviews.map((review) => present(review, req.user?.id)));
});

// Create your review, or update it if you already wrote one
router.post("/", requireAuth, async (req, res) => {
  const book = await findBook(req, res);
  if (!book) return;

  const rating = Number(req.body?.rating);
  const comment = String(req.body?.comment ?? "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ message: "Rating must be a whole number from 1 to 5." });
  }

  if (comment.length > 1000) {
    return res
      .status(400)
      .json({ message: "Reviews can be up to 1000 characters." });
  }

  const users = await read("users");
  const user = users.find((u) => u.id === req.user.id);

  if (!user) {
    return res
      .status(401)
      .json({ message: "Your session has expired. Please sign in again." });
  }

  const { review, created } = await update("reviews", (all) => {
    const now = new Date().toISOString();
    const existing = all.find(
      (r) => r.bookId === book.id && r.userId === user.id
    );

    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
      existing.userName = user.name;
      existing.updatedAt = now;
      return { review: existing, created: false };
    }

    const fresh = {
      id: crypto.randomUUID(),
      bookId: book.id,
      userId: user.id,
      userName: user.name,
      rating,
      comment,
      createdAt: now,
      updatedAt: now,
    };

    all.push(fresh);
    return { review: fresh, created: true };
  });

  res.status(created ? 201 : 200).json(present(review, user.id));
});

// Delete your own review
router.delete("/mine", requireAuth, async (req, res) => {
  const book = await findBook(req, res);
  if (!book) return;

  const removed = await update("reviews", (all) => {
    const index = all.findIndex(
      (r) => r.bookId === book.id && r.userId === req.user.id
    );

    if (index === -1) return false;

    all.splice(index, 1);
    return true;
  });

  if (!removed) {
    return res.status(404).json({ message: "You haven't reviewed this book." });
  }

  res.status(204).end();
});

export default router;
