import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Header from "./components/Header";
import CategoryStrip from "./components/CategoryStrip";
import Hero from "./components/Hero";
import PromoTiles from "./components/PromoTiles";
import BookShelf from "./components/BookShelf";
import FeaturedAuthors from "./components/FeaturedAuthors";
import BookCatalog from "./components/BookCatalog";
import ShelfSkeleton from "./components/ShelfSkeleton";
import SidePanel from "./components/SidePanel";
import BookDetails from "./components/BookDetails";
import About from "./components/About";
import Footer from "./components/Footer";
import { useBooks } from "./hooks/useBooks";
import { useShop } from "./hooks/useShop";
import { useScrollLock } from "./hooks/useScrollLock";
import { useAuth } from "./hooks/useAuth";
import {
  compareNewest,
  compareRating,
  isCollection,
} from "./utils/collections";
import { buildParams } from "./utils/shopLinks";
import "./App.css";

const SHELF_SIZE = 10;
const MIN_SHELF = 3;

// The books page.
//
//   category strip -> banner -> promo tiles -> shelves -> authors -> catalog
//
// What the catalog is showing (collection, category, search) is kept in the
// address bar: /?collection=bestsellers, /?category=Fiction, /?q=atomic.
function App() {
  const { isLoggedIn } = useAuth();
  const { books, loading, loadError } = useBooks();
  const {
    cart,
    wishlist,
    orders,
    panel,
    setPanel,
    toast,
    toastKey,
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
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [selectedBook, setSelectedBook] = useState(null);
  useScrollLock(Boolean(panel || selectedBook));

  // ----- What is being browsed (from the address bar) -----
  const collectionParam = params.get("collection");
  const collection = isCollection(collectionParam) ? collectionParam : "all";
  const category = params.get("category") || "All Books";
  const query = params.get("q") ?? "";

  function update(patch) {
    setParams(buildParams({ collection, category, q: query, ...patch }));
  }

  function showOnly(values) {
    setParams(buildParams(values));
  }

  // ----- Scroll to the catalog when the view changes -----
  const lastView = useRef(null);

  useEffect(() => {
    if (loading) return;

    const key = `${collection}|${category}|${query}`;
    const previous = lastView.current;
    lastView.current = key;

    const filtered = collection !== "all" || category !== "All Books" || query !== "";

    if (previous === key) return;
    if (previous === null && !filtered) return;

    if (!filtered) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    document
      .getElementById("catalog")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [loading, collection, category, query]);

  // Links from other pages (login, register) that say where to land
  const landingTarget = location.state?.goTo;

  useEffect(() => {
    if (!landingTarget) return;

    if (isCollection(landingTarget) && landingTarget !== "all") {
      setParams(buildParams({ collection: landingTarget }), { replace: true });
      return;
    }

    if (landingTarget === "about" && loading) return;

    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: null,
    });

    if (landingTarget === "about") {
      document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [landingTarget, loading, location.pathname, location.search, navigate, setParams]);

  // ----- Lists for the shelves -----
  const bestsellers = useMemo(
    () =>
      books
        .filter((book) => book.bestseller)
        .sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
        .slice(0, SHELF_SIZE),
    [books],
  );

  const newArrivals = useMemo(
    () => [...books].sort(compareNewest).slice(0, SHELF_SIZE),
    [books],
  );

  const topRated = useMemo(
    () => [...books].sort(compareRating).slice(0, SHELF_SIZE),
    [books],
  );

  const categoryNames = useMemo(
    () => [...new Set(books.map((book) => book.category).filter(Boolean))].sort(),
    [books],
  );

  // Books like the ones already in the bag or wishlist
  const recommendations = useMemo(() => {
    const selectedIds = new Set([
      ...wishlist,
      ...Object.entries(cart)
        .filter(([, quantity]) => Number(quantity) > 0)
        .map(([id]) => Number(id)),
    ]);

    if (selectedIds.size === 0) return [];

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
      .slice(0, SHELF_SIZE);
  }, [books, cart, wishlist]);

  const cardProps = {
    wishlist,
    cart,
    onToggleWishlist: toggleWishlist,
    onAddToCart: addToCart,
    onSelectBook: setSelectedBook,
    onChangeQuantity: changeQuantity,
  };

  const ready = !loading && !loadError;

  return (
    <div className="app-shell sf-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Header
        books={books}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        onOpenPanel={setPanel}
      />

      <main id="main">
        {!isLoggedIn && (
          <aside className="guest-feature-notice" role="status" aria-label="Member notice">
            <div className="guest-feature-notice-inner">
              <span className="guest-notice-badge">MEMBER FEATURES</span>
              <p className="guest-notice-text">
                You are browsing in preview mode. <b>Sign in</b> to unlock your personal
                bag, synced wishlist, order tracking, and custom recommendations.
              </p>
              <div className="guest-notice-actions">
                <Link to="/login" className="guest-notice-link-btn guest-notice-primary">
                  Sign in
                </Link>
                <Link to="/register" className="guest-notice-link-btn guest-notice-secondary">
                  Create account
                </Link>
              </div>
            </div>
          </aside>
        )}

        <Hero
          books={books}
          onNavigate={(target) => showOnly({ collection: target })}
          onSelectBook={setSelectedBook}
        />

        <CategoryStrip
          books={books}
          loading={loading}
          active={category}
          onSelect={(name) => showOnly({ category: name })}
        />

        {ready && (
          <PromoTiles
            books={books}
            onSelect={(key) => showOnly({ collection: key })}
          />
        )}

        {loading && (
          <>
            <ShelfSkeleton />
            <ShelfSkeleton />
          </>
        )}

        {loadError && (
          <div className="load-error" role="alert">
            <b>We couldn’t load the books</b>
            <p>{loadError}</p>
            <button
              type="button"
              className="primary-button"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        )}

        {ready && (
          <>
            {bestsellers.length >= MIN_SHELF && (
              <BookShelf
                title="Bestsellers"
                subtitle="The books readers can’t put down"
                books={bestsellers}
                onSeeAll={() => showOnly({ collection: "bestsellers" })}
                {...cardProps}
              />
            )}

            {newArrivals.length >= MIN_SHELF && (
              <BookShelf
                title="New arrivals"
                subtitle="Fresh on the shelves"
                books={newArrivals}
                onSeeAll={() => showOnly({ collection: "new" })}
                {...cardProps}
              />
            )}

            {/* Personalized recommendations feature: shown when user is logged in */}
            {isLoggedIn && recommendations.length >= MIN_SHELF && (
              <BookShelf
                title="Recommended for you"
                subtitle="Picked from the books in your bag and wishlist"
                books={recommendations}
                {...cardProps}
              />
            )}

            {topRated.length >= MIN_SHELF && (
              <BookShelf
                title="Top rated"
                subtitle="Highest rated by readers"
                books={topRated}
                onSeeAll={() => showOnly({ collection: "toprated" })}
                {...cardProps}
              />
            )}

            <FeaturedAuthors
              books={books}
              onSelect={(name) => showOnly({ q: name })}
            />

            <BookCatalog
              books={books}
              collection={collection}
              category={category}
              query={query}
              onChange={update}
              onClearAll={() => setParams(new URLSearchParams())}
              wishlist={wishlist}
              cart={cart}
              onToggleWishlist={toggleWishlist}
              onAddToCart={addToCart}
              onSelectBook={setSelectedBook}
              onChangeQuantity={changeQuantity}
            />
          </>
        )}

        <About />
        <Footer
          onNotify={notify}
          onOpenPanel={setPanel}
          categories={categoryNames}
        />
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
        wishlist={wishlist}
        onClose={() => setSelectedBook(null)}
        onAddToCart={addToCart}
        onToggleWishlist={toggleWishlist}
      />

      {toast && (
        <div className="toast" key={toastKey} role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
