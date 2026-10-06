import { useMemo } from "react";
import { compareRating } from "../utils/collections";
import BookCover from "./BookCover";
import { HeartIcon, SearchIcon } from "./Icons";

// A focused storefront landing hero: explain what Bookverse offers, then
// give readers a clear path into the real catalog and featured books.
function Hero({ books = [], onNavigate, onSelectBook }) {
  const picks = useMemo(
    () =>
      [...books]
        .sort(
          (a, b) =>
            Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
            compareRating(a, b),
        )
        .slice(0, 3),
    [books],
  );

  const featured = picks[1] ?? picks[0];

  return (
    <section className="landing-hero" id="top" aria-labelledby="landing-title">
      <div className="landing-hero-inner">
        <div className="landing-hero-copy">
          <span className="landing-eyebrow">
            <span aria-hidden="true" /> A BOOKSHOP FOR CURIOUS READERS
          </span>

          <h1 id="landing-title">
            Find a book that feels like <em>yours.</em>
          </h1>

          <p className="landing-description">
            Discover thoughtful picks, reader favorites, and stories for every
            kind of day. Your next great read is waiting on the shelf.
          </p>

          <div className="landing-actions">
            <button
              type="button"
              className="landing-primary"
              onClick={() => onNavigate("all")}
            >
              Explore the shelves <span aria-hidden="true">→</span>
            </button>
            <button
              type="button"
              className="landing-secondary"
              onClick={() => onNavigate("bestsellers")}
            >
              See reader favorites
            </button>
          </div>

          <div className="landing-highlights" aria-label="Bookverse features">
            <div>
              <span className="landing-highlight-icon" aria-hidden="true"><SearchIcon size={18} /></span>
              <span>
                <b>Find your kind of story</b>
                <small>Browse by topic, author, or category.</small>
              </span>
            </div>
            <div>
              <span className="landing-highlight-icon" aria-hidden="true"><HeartIcon size={18} /></span>
              <span>
                <b>Keep good reads close</b>
                <small>Save favorites to your personal wishlist.</small>
              </span>
            </div>
          </div>
        </div>

        <div className="landing-hero-art" role="group" aria-label="Featured books from Bookverse">
          <div className="landing-art-glow" aria-hidden="true" />
          <div className="landing-book-stack">
            {picks.map((book, index) => (
              <button
                type="button"
                className={`landing-book landing-book-${index + 1}`}
                key={book.id}
                onClick={() => onSelectBook?.(book)}
                aria-label={`View ${book.title} by ${book.author}`}
              >
                <BookCover book={book} size="L" priority={index === 1} decorative />
              </button>
            ))}
            {picks.length === 0 && (
              <div className="landing-empty-books" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            )}
          </div>

          {featured && (
            <button
              type="button"
              className="landing-feature-card"
              onClick={() => onSelectBook?.(featured)}
              aria-label={`Quick view: ${featured.title} by ${featured.author}`}
            >
              <span className="landing-feature-label">A GOOD PLACE TO START</span>
              <b>{featured.title}</b>
              <small>by {featured.author}</small>
              <span className="landing-feature-rating">
                <span aria-hidden="true">★</span> {featured.rating || "Reader favorite"}
                {featured.reviews > 0 && ` · ${featured.reviews.toLocaleString()} reviews`}
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default Hero;
