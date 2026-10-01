import express from "express";
import cors from "cors";
import booksRouter from "./routes/books.js";

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.use("/api/books", booksRouter);

app.get("/api/test", (req, res) => {
  res.json({ message: "BookVerse API is working!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});