import { useMemo, useState } from "react";
import { books } from "./data/books";
import Header from "./components/Header";
import Hero from "./components/Hero";
import BookCatalog from "./components/BookCatalog";
import SidePanel from "./components/SidePanel";
import BookDetails from "./components/BookDetails";
import Footer from "./components/Footer";
import "./App.css";

function readSaved(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [cart, setCart] = useState(() => readSaved("bookverse-cart", {}));
  const [wishlist, setWishlist] = useState(() =>
    readSaved("bookverse-wishlist", []),
  );
  const [orders, setOrders] = useState(() =>
    readSaved("bookverse-orders", []),
  );
  const [panel, setPanel] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [toast, setToast] = useState("");

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
    [wishlist],
  );

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  function addToCart(book) {
    const nextCart = {
      ...cart,
      [book.id]: (cart[book.id] || 0) + 1,
    };

    setCart(nextCart);
    localStorage.setItem("bookverse-cart", JSON.stringify(nextCart));
    notify(`${book.title} added to your bag`);
  }

  function changeQuantity(id, amount) {
    const nextCart = { ...cart };
    nextCart[id] = (nextCart[id] || 0) + amount;

    if (nextCart[id] <= 0) {
      delete nextCart[id];
    }

    setCart(nextCart);
    localStorage.setItem("bookverse-cart", JSON.stringify(nextCart));
  }

  function toggleWishlist(book) {
    const nextWishlist = wishlist.includes(book.id)
      ? wishlist.filter((id) => id !== book.id)
      : [...wishlist, book.id];

    setWishlist(nextWishlist);
    localStorage.setItem(
      "bookverse-wishlist",
      JSON.stringify(nextWishlist),
    );
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
    localStorage.setItem("bookverse-orders", JSON.stringify(nextOrders));

    setCart({});
    localStorage.setItem("bookverse-cart", JSON.stringify({}));

    setPanel("");
    notify("Demo order placed successfully!");
  }

  return (
    <div className="app-shell">
      <Header
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        onOpenPanel={setPanel}
      />

      <main>
        <Hero />

        <BookCatalog
          books={books}
          wishlist={wishlist}
          onToggleWishlist={toggleWishlist}
          onAddToCart={addToCart}
          onSelectBook={setSelectedBook}
        />

        <Footer onNotify={notify} />
      </main>

      <SidePanel
        panel={panel}
        onClose={() => setPanel("")}
        cart={{ ...cart, books }}
        cartCount={cartCount}
        cartTotal={cartTotal}
        wishlistBooks={wishlistBooks}
        orders={orders}
        onChangeQuantity={changeQuantity}
        onAddToCart={addToCart}
        onCheckout={checkout}
        onNotify={notify}
        onOpenPanel={setPanel}
        catalogCount={books.length}
      />

      <BookDetails
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onAddToCart={addToCart}
        onToggleWishlist={toggleWishlist}
      />

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;