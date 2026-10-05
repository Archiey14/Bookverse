import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import BookCatalog from "./components/BookCatalog";
import SidePanel from "./components/SidePanel";
import BookDetails from "./components/BookDetails";
import Footer from "./components/Footer";
import About from "./components/About";
import { useBooks } from "./hooks/useBooks";
import { useShop } from "./hooks/useShop";
import { useScrollLock } from "./hooks/useScrollLock";
import BookCard from "./components/BookCard";
import "./App.css";

function App() {
  const { books, loading, loadError } = useBooks();
  const {
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
  } = useShop(books);

  const location = useLocation();
  const initialTarget = location.state?.goTo;

  const [selectedBook, setSelectedBook] = useState(null);
  const [collection, setCollection] = useState(
    initialTarget === "bestsellers" ? "bestsellers" : "all",
  );
  const [catalogKey, setCatalogKey] = useState(0);

  const categories = useMemo(
    () => [
      "All Books",
      ...new Set(books.map((book) => book.category).filter(Boolean)),
    ],
    [books],
  );
  const recommendations = useMemo(() => {
  const selectedIds = new Set([
    ...wishlist,
    ...Object.entries(cart)
      .filter(([, quantity]) => Number(quantity) > 0)
      .map(([id]) => Number(id)),
  ]);

  const preferredCategories = new Set(
    books
      .filter((book) => selectedIds.has(book.id))
      .map((book) => book.category),
  );

  function score(book) {
    return (
      (preferredCategories.has(book.category) ? 10 : 0) +
      (book.bestseller ? 3 : 0) +
      (book.featured ? 2 : 0) +
      (Number(book.rating) || 0)
    );
  }

  return books
    .filter((book) => !selectedIds.has(book.id))
    .sort((a, b) => score(b) - score(a))
    .slice(0, 4);
}, [books, cart, wishlist]);


  useScrollLock(Boolean(panel || selectedBook));

  function goTo(target) {
    setCollection(target === "bestsellers" ? "bestsellers" : "all");
    setCatalogKey((key) => key + 1);
    document
      .getElementById("catalog")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="app-shell">
      <Header
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        onOpenPanel={setPanel}
        onNavigate={goTo}
      />

      <main>
        <Hero />

        {loading && <p className="empty-results">Loading books…</p>}
        {loadError && <p className="empty-results">{loadError}</p>}

        {!loading && !loadError && (
          <BookCatalog
            key={`${collection}-${catalogKey}`}
            collection={collection}
            onCollectionChange={setCollection}
            books={books}
            categories={categories}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onAddToCart={addToCart}
            onSelectBook={setSelectedBook}
          />
        )}

        {!loading && !loadError && recommendations.length > 0 && (
  <section className="catalog-section">
    <div className="section-heading">
      <div>
        <span className="eyebrow">FOR YOU</span>
        <h2>Recommended reads</h2>
        <p>Picked from the books in your bag and wishlist.</p>
      </div>
    </div>

    <div className="book-grid">
      {recommendations.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          isWishlisted={wishlist.includes(book.id)}
          onToggleWishlist={toggleWishlist}
          onAddToCart={addToCart}
          onSelectBook={setSelectedBook}
        />
      ))}
    </div>
  </section>
)}

        <About />
        <Footer onNotify={notify} />
      </main>

      <SidePanel
        panel={panel}
        onClose={() => setPanel("")}
        cart={cart}
        books={books}
        cartCount={cartCount}
        cartTotal={cartTotal}
        wishlistBooks={wishlistBooks}
        orders={orders}
        onChangeQuantity={changeQuantity}
        onAddToCart={addToCart}
        onCheckout={checkout}
      />

      <BookDetails
        book={selectedBook}
        isWishlisted={
          selectedBook ? wishlist.includes(selectedBook.id) : false
        }
        onClose={() => setSelectedBook(null)}
        onAddToCart={addToCart}
        onToggleWishlist={toggleWishlist}
      />

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;