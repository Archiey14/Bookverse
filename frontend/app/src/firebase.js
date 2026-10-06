import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAUu8FY7fLz4mbUzJabJ8dC2okiWeQDRt8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bookverse-5a62c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bookverse-5a62c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bookverse-5a62c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "853892119767",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:853892119767:web:f3027623f0446adae08492",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
