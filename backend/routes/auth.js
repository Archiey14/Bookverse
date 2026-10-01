import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { read, write } from "../db.js";

const router = Router();
const SECRET = "bookverse-dev-secret";

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  const users = await read("users");

  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const user = {
    id: Date.now(),
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role: "user",
  };

  users.push(user);
  await write("users", users);

  const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "7d" });

  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const users = await read("users");
  const user = users.find((u) => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "7d" });

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

export default router;