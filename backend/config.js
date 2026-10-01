// Settings that can be overridden with environment variables, e.g.
//   JWT_SECRET=some-long-random-string npm run dev
export const JWT_SECRET = process.env.JWT_SECRET || "bookverse-dev-secret";
export const PORT = Number(process.env.PORT) || 5001;
