import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

function readToken(req) {
  const header = req.headers.authorization ?? "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
}

// Blocks the request unless it carries a valid login token.
// On success, req.user is { id, role }.
export function requireAuth(req, res, next) {
  const token = readToken(req);

  if (!token) {
    return res.status(401).json({ message: "Please sign in to continue." });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res
      .status(401)
      .json({ message: "Your session has expired. Please sign in again." });
  }
}

// Lets the request through either way; sets req.user only if the token is valid.
export function optionalAuth(req, res, next) {
  const token = readToken(req);

  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      // an invalid token just means "not signed in"
    }
  }

  next();
}
