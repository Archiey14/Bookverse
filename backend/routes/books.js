import { Router } from "express";
import { read } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
    const { q = "", category, sort } = req.query;
    let books = await read("books");

    if (q) {
        const text = q.toLowerCase();
        books = books.filter((b) =>
            [b.title, b.author, b.category].some((field) =>
                field.toLowerCase().includes(text)
            )
        );
    }

    if (category) {
        books = books.filter((b) => b.category === category);
    }

    if (sort === "price-asc") books.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") books.sort((a, b) => b.price - a.price);
    if (sort === "rating") books.sort((a, b) => b.rating - a.rating);

    res.json(books);
});

router.get("/:id", async (req, res) => {
    const books = await read("books");
    const book = books.find((b) => b.id === Number(req.params.id));

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }
    res.json(book);
});

export default router;