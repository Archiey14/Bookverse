import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SidePanel from "../components/SidePanel";
import BookCard from "../components/BookCard";
import { useBooks } from "../hooks/useBooks";
import { useShop } from "../hooks/useShop";
import { useScrollLock } from "../hooks/useScrollLock";
import { getStockStatus } from "../utils/stock";
import "../App.css";

function BookPage() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  useScrollLock(Boolean(panel));

  const book = books.find((item) => item.id === Number(id));

  // Books that share the most tags with this one (same category as a tiebreak)
  const related = useMemo(() => {
    if (!book) return [];

    return books
      .filter((item) => item.id !== book.id)
      .map((item) => {
        const sharedTags = (item.tags ?? []).filter((tag) =>
          (book.tags ?? []).includes(tag),
        ).length;
        const sameCategory = item.category === book.category ? 1 : 0;
        return { item, score: sharedTags * 2 + sameCategory };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(({ item }) => item);
  }, [book, books]);

  // Start at the top whenever a different book is opened
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Browser tab title
  useEffect(() => {
    if (!book) return;
    const previous = document.title;
    document.title = `${book.title} · Bookverse`;
    return () => {
      document.title = previous;
    };
  }, [book]);

  function goHome(target) {
    if (target === "top") navigate("/");
    else navigate("/", { state: { goTo: target } });
  }

  async function share() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: book.title, url });
      } catch {
        // the person closed the share sheet
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      notify("Link copied to clipboard");
    } catch {
      notify("Couldn't copy the link");
    }
  }

  const stock = book ? getStockStatus(book) : null;
  const isWishlisted = book ? wishlist.includes(book.id) : false;

  const facts = book
    ? [
        ["Publisher", book.publisher],
        ["Published", book.publishedYear],
        ["Pages", book.pages],
        ["Format", book.format],
        ["Language", book.language],
        ["ISBN", book.isbn],
      ].filter(([, value]) => value)
    : [];

  return (
    <div className="app-shell">
      <Header
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        onOpenPanel={setPanel}
        onNavigate={goHome}
      />

      <main>
        <section className="book-page" id="top">
          <Link className="page-back" to="/">
            ← Back to all books
          </Link>

          {loading && <p className="empty-results">Loading book…</p>}
          {loadError && <p className="empty-results">{loadError}</p>}

          {!loading && !loadError && !book && (
            <div className="empty-results">
              <p>We couldn&rsquo;t find that book.</p>
              <Link className="primary-button" to="/">
                Browse the collection
              </Link>
            </div>
          )}

          {book && (
            <div className="book-page-grid">
              <div
                className={`detail-cover book-page-cover cover-${book.id % 5}`}
              >
                <img
                  src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`}
                  alt={`Cover of ${book.title}`}
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
                <span>{book.title}</span>
              </div>

              <div className="book-page-copy">
                <span className="eyebrow">{book.category}</span>
                <h1>{book.title}</h1>
                <p className="author">by {book.author}</p>

                <p className="rating">
                  ★ {book.rating}{" "}
                  <small>
                    ({book.reviews.toLocaleString()} reader reviews)
                  </small>
                </p>

                <p>{book.description}</p>

                {book.tags?.length > 0 && (
                  <ul className="tag-list" aria-label="Topics">
                    {book.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                )}

                <dl className="book-page-facts">
                  {facts.map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="detail-stock">
                  {!stock.outOfStock && <span aria-hidden="true">✓ </span>}
                  {stock.message}
                </div>

                <div className="book-page-actions">
                  <b>${book.price.toFixed(2)}</b>

                  <button
                    className="primary-button"
                    disabled={stock.outOfStock}
                    onClick={() => addToCart(book)}
                  >
                    Add to bag <span>→</span>
                  </button>

                  <button
                    className="icon-button"
                    aria-label={
                      isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                    }
                    onClick={() => toggleWishlist(book)}
                  >
                    {isWishlisted ? "♥" : "♡"}
                  </button>
                </div>

                <div className="book-page-actions">
                  {book.previewUrl && (
                    <a
                      className="secondary-button"
                      href={book.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Preview <span aria-hidden="true">↗</span>
                    </a>
                  )}
                  <button className="secondary-button" onClick={share}>
                    Share
                  </button>
                </div>

                <small className="demo-note">
                  Book preview and reader reviews are sample information.
                </small>
              </div>
            </div>
          )}
        </section>

        {related.length > 0 && (
          <section className="catalog-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">KEEP READING</span>
                <h2>
                  You might also <em>like.</em>
                </h2>
              </div>
            </div>

            <div className="book-grid related-grid">
              {related.map((item) => (
                <BookCard
                  key={item.id}
                  book={item}
                  isWishlisted={wishlist.includes(item.id)}
                  onToggleWishlist={toggleWishlist}
                  onAddToCart={addToCart}
                  onSelectBook={(selected) => navigate(`/book/${selected.id}`)}
                />
              ))}
            </div>
          </section>
        )}

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

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default BookPage;
