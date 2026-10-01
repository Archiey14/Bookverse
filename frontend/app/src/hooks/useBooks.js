import { useCallback, useEffect, useState } from "react";
import axios from "axios";

// Loads the catalog from the backend once.
// `reload` fetches it again quietly (used after a new review changes a rating).
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

  const reload = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/books");
      setBooks(data);
    } catch {
      // keep showing the books we already have
    }
  }, []);

  return { books, loading, loadError, reload };
}
