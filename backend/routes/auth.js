import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { read, update } from "../db.js";
import { JWT_SECRET } from "../config.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedName = String(name ?? "").trim();
  const normalizedEmail = String(email ?? "").trim().toLowerCase();

  if (!normalizedName || !normalizedEmail || !password) {
    return res.status(400).json({
      message: "Name, email and password are required",
    });
  }

  const user = {
    id: Date.now(),
    name: normalizedName,
    email: normalizedEmail,
    password: await bcrypt.hash(password, 10),
    role: "user",
  };

  const created = await update("users", (users) => {
    if (
      users.some(
        (existing) =>
          String(existing.email).toLowerCase() === normalizedEmail,
      )
    ) {
      return false;
    }

    users.push(user);
    return true;
  });

  if (!created) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" },
  );

  return res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

router.post("/login", async (req, res) => {
  const normalizedEmail = String(req.body?.email ?? "").trim().toLowerCase();
  const password = req.body?.password;
  const users = await read("users");
  const user = users.find(
    (entry) => String(entry.email).toLowerCase() === normalizedEmail,
  );

  if (!user || !(await bcrypt.compare(password ?? "", user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" },
  );

  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

export default router;
