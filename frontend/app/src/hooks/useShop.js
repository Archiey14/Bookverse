import { useEffect, useMemo, useRef, useState } from "react";

function readSaved(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Cart, wishlist, orders, side panel and toast: shared by every page.
// Everything is saved in localStorage, so pages stay in sync.
export function useShop(books) {
  const [cart, setCart] = useState(() => readSaved("bookverse-cart", {}));
  const [wishlist, setWishlist] = useState(() =>
    readSaved("bookverse-wishlist", []),
  );
  const [orders, setOrders] = useState(() =>
    readSaved("bookverse-orders", []),
  );
  const [panel, setPanel] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  useEffect(() => {
    const timer = toastTimer;
    return () => window.clearTimeout(timer.current);
  }, []);

  const cartCount = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0,
  );

  const cartTotal = Object.entries(cart).reduce((total, [id, quantity]) => {
    const book = books.find((item) => item.id === Number(id));
    return total + (book ? book.price * quantity : 0);
  }, 0);

  const wishlistBooks = useMemo(
    () => books.filter((book) => wishlist.includes(book.id)),
    [books, wishlist],
  );

  function notify(message) {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2200);
  }

  function addToCart(book) {
    const inCart = cart[book.id] || 0;

    if (typeof book.stock === "number" && inCart >= book.stock) {
      notify(
        book.stock === 0
          ? `${book.title} is out of stock`
          : `Only ${book.stock} in stock`,
      );
      return;
    }

    const nextCart = { ...cart, [book.id]: inCart + 1 };

    setCart(nextCart);
    save("bookverse-cart", nextCart);
    notify(`${book.title} added to your bag`);
  }

  function changeQuantity(id, amount) {
    const book = books.find((item) => item.id === Number(id));
    const current = cart[id] || 0;

    if (amount > 0 && book && current >= book.stock) {
      notify(`Only ${book.stock} in stock`);
      return;
    }

    const nextCart = { ...cart };
    nextCart[id] = current + amount;

    if (nextCart[id] <= 0) {
      delete nextCart[id];
    }

    setCart(nextCart);
    save("bookverse-cart", nextCart);
  }

  function toggleWishlist(book) {
    const nextWishlist = wishlist.includes(book.id)
      ? wishlist.filter((id) => id !== book.id)
      : [...wishlist, book.id];

    setWishlist(nextWishlist);
    save("bookverse-wishlist", nextWishlist);
    notify(
      nextWishlist.includes(book.id)
        ? "Saved to your wishlist"
        : "Removed from wishlist",
    );
  }

  function checkout() {
    if (cartCount === 0) return;

    const nextOrders = [
      {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        total: cartTotal,
        status: "Order placed",
      },
      ...orders,
    ];

    setOrders(nextOrders);
    save("bookverse-orders", nextOrders);

    setCart({});
    save("bookverse-cart", {});

    setPanel("");
    notify("Demo order placed successfully!");
  }

  return {
    cart,
    wishlist,
    orders,
    panel,
    setPanel,
    toast,
    notify,
    cartCount,
    cartTotal,
    wishlistBooks,
    addToCart,
    changeQuantity,
    toggleWishlist,
    checkout,
  };
}
