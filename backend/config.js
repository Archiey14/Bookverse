import "dotenv/config";

export const JWT_SECRET = process.env.JWT_SECRET || "bookverse-dev-secret";
export const PORT = Number(process.env.PORT) || 5001;
