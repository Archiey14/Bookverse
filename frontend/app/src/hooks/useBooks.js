import { useEffect, useState } from "react";
import axios from "axios";

// Loads the catalog from the backend once.
export function useBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    axios
      .get("/api/books")
      .then(({ data }) => setBooks(data))
      .catch(() => setLoadError("Couldn't load books. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  return { books, loading, loadError };
}
