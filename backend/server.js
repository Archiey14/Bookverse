import express from "express";
import cors from "cors";
import booksRouter from "./routes/books.js";
import reviewsRouter from "./routes/reviews.js";
import authRouter from "./routes/auth.js";
import paymentsRouter from "./routes/payments.js";
import adminRouter from "./routes/admin.js";
import accountRouter from "./routes/account.js";
import { PORT } from "./config.js";
import { connectDatabase } from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/books/:id/reviews", reviewsRouter);
app.use("/api/books", booksRouter);
app.use("/api/auth", authRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/account/state", accountRouter);

app.get("/api/test", (req, res) => {
  res.json({ message: "BookVerse API is working!" });
});

async function startServer() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log("Server running on http://localhost:" + PORT);
    });
  } catch (error) {
    console.error("Could not start Bookverse API:", error);
    console.dir(
      [...(error.reason?.servers ?? [])].map(([host, server]) => ({
        host,
        error: server.error?.message,
      })),
      { depth: null },
    );
    process.exit(1);
  }
}

startServer();
