import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { read, update } from "../db.js";
import { JWT_SECRET } from "../config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serviceAccountPath = path.join(__dirname, "../firebase-service-account.json");

let firebaseAuth = null;
if (fs.existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
    if (!getApps().length) {
      initializeApp({
        credential: cert(serviceAccount),
      });
      console.log("Firebase Admin initialized successfully.");
    }
    firebaseAuth = getAuth();
  } catch (err) {
    console.error("Failed to initialize Firebase Admin:", err.message);
  }
}

const router = Router();
const googleClient = new OAuth2Client();

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

  if (
    !user ||
    !user.password ||
    !(await bcrypt.compare(password ?? "", user.password))
  ) {
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

router.post("/google", async (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const credential = String(req.body?.credential ?? "");

  if (!clientId) {
    return res.status(503).json({
      message: "Google sign-in is not configured on the server.",
    });
  }

  if (!credential) {
    return res.status(400).json({ message: "Google credential is required." });
  }

  let profile;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    profile = ticket.getPayload();
  } catch (error) {
    console.error("Google ID token verification failed:", error.message);
    return res.status(401).json({ message: "Google sign-in could not be verified." });
  }

  if (!profile?.sub || !profile.email || profile.email_verified !== true) {
    return res.status(401).json({
      message: "Google must provide a verified email address to sign in.",
    });
  }

  const email = profile.email.trim().toLowerCase();
  const result = await update("users", (users) => {
    let user = users.find(
      (entry) => String(entry.email).toLowerCase() === email,
    );

    if (user?.googleId && user.googleId !== profile.sub) {
      return { conflict: true };
    }

    if (user) {
      // Google has verified ownership of this email. Link it to the existing
      // account so its orders, wishlist, and admin role remain attached.
      user.googleId = profile.sub;
      if (!user.name && profile.name) user.name = profile.name;
    } else {
      user = {
        id: Date.now(),
        name: profile.name || email.split("@")[0],
        email,
        googleId: profile.sub,
        role: "user",
      };
      users.push(user);
    }

    return { user };
  });

  if (result.conflict) {
    return res.status(409).json({
      message: "This email is linked to a different Google account.",
    });
  }

  const user = result.user;
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

router.post("/firebase-google", async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "Firebase ID token is required." });
  }

  if (!firebaseAuth) {
    return res.status(503).json({
      message: "Firebase Admin is not configured on the server.",
    });
  }

  let decodedToken;
  try {
    decodedToken = await firebaseAuth.verifyIdToken(idToken);
  } catch (error) {
    console.error("Firebase ID token verification failed:", error.message);
    return res.status(401).json({ message: "Google sign-in could not be verified." });
  }

  const { uid, email, name, picture } = decodedToken;
  if (!email) {
    return res.status(400).json({
      message: "Google account must provide an email address.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const result = await update("users", (users) => {
    let user = users.find(
      (entry) => String(entry.email).toLowerCase() === normalizedEmail,
    );

    if (user) {
      user.firebaseUid = uid;
      if (!user.name && name) user.name = name;
      if (picture && !user.avatar) user.avatar = picture;
    } else {
      user = {
        id: Date.now(),
        name: name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        firebaseUid: uid,
        avatar: picture || null,
        role: "user",
      };
      users.push(user);
    }

    return { user };
  });

  const user = result.user;
  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" },
  );

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

export default router;
