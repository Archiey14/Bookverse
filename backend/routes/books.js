import { Router } from "express";
import { read } from "../db.js";
import { groupByBook, withStats } from "../stats.js";

const router = Router();

router.get("/", async (req, res) => {
    // String() keeps ?q=a&q=b (an array) from crashing the search
    const text = String(req.query.q ?? "").trim().toLowerCase();
    const { category, sort } = req.query;

    const [allBooks, allReviews] = await Promise.all([
        read("books"),
        read("reviews"),
    ]);

    // rating + review count include real reviews
    const reviewsByBook = groupByBook(allReviews);
    let books = allBooks.map((b) => withStats(b, reviewsByBook.get(b.id)));

    if (text) {
        books = books.filter((b) =>
            [b.title, b.author, b.category, ...(b.tags ?? [])].some((field) =>
                String(field).toLowerCase().includes(text)
            )
        );
    }

    if (category) {
        books = books.filter((b) => b.category === category);
    }

    // "price-low" / "price-high" are what the frontend sends;
    // "price-asc" / "price-desc" are kept as aliases.
    if (sort === "price-low" || sort === "price-asc") {
        books.sort((a, b) => a.price - b.price);
    } else if (sort === "price-high" || sort === "price-desc") {
        books.sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
        books.sort((a, b) => b.rating - a.rating);
    } else if (sort === "featured") {
        books.sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    res.json(books);
});

router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const [books, allReviews] = await Promise.all([
        read("books"),
        read("reviews"),
    ]);
    const book = books.find((b) => b.id === id);

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    res.json(
        withStats(
            book,
            allReviews.filter((r) => r.bookId === book.id)
        )
    );
});

export default router;
