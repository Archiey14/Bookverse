import { useRef } from "react";
import { useScrollArrows } from "../hooks/useScrollArrows";
import BookCard from "./BookCard";
import Chevron from "./Chevron";

// A titled, horizontally scrolling row of books ("Best sellers", "New
// arrivals"...) with a "See all" link and left/right arrows.
function BookShelf({
  title,
  subtitle,
  books,
  onSeeAll,
  wishlist,
  cart,
  onToggleWishlist,
  onAddToCart,
  onSelectBook,
  onChangeQuantity,
}) {
  const trackRef = useRef(null);
  const { canPrev, canNext, scroll } = useScrollArrows(trackRef, books.length);

  if (books.length === 0) return null;

  return (
    <section className="shelf-section">
      <div className="shelf-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>

        <div className="shelf-actions">
          {onSeeAll && (
            <button className="text-link" onClick={onSeeAll}>
              See all
            </button>
          )}
          <button
            className="strip-arrow"
            onClick={() => scroll(-1)}
            disabled={!canPrev}
            aria-label={`Scroll ${title} left`}
          >
            <Chevron direction="left" />
          </button>
          <button
            className="strip-arrow"
            onClick={() => scroll(1)}
            disabled={!canNext}
            aria-label={`Scroll ${title} right`}
          >
            <Chevron direction="right" />
          </button>
        </div>
      </div>

      <div className="shelf-track" ref={trackRef}>
        {books.map((book) => (
          <div className="shelf-item" key={book.id}>
            <BookCard
              book={book}
              isWishlisted={wishlist.includes(book.id)}
              onToggleWishlist={onToggleWishlist}
              onAddToCart={onAddToCart}
              onSelectBook={onSelectBook}
              quantity={cart[book.id] || 0}
              onChangeQuantity={onChangeQuantity}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default BookShelf;
