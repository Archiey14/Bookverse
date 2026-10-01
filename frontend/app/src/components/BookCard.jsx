function BookCard({
  book,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onSelectBook,
}) {
  return (
    <article className="book-card">
      <button
        className={`cover-wrap cover-${book.id % 5}${isWishlisted ? " saved" : ""}`}
        onClick={() => onSelectBook(book)}
        aria-label={`View details for ${book.title}`}
      >
        <img
          src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`}
          alt={`Cover of ${book.title}`}
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        <span className="cover-fallback">{book.title}</span>

        <span
          className="heart-button"
          role="button"
          tabIndex={0}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(event) => {
            event.stopPropagation();
            onToggleWishlist(book);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.stopPropagation();
              onToggleWishlist(book);
            }
          }}
        >
          {isWishlisted ? "♥" : "♡"}
        </span>

        <span className="quick-view">Quick view</span>
      </button>

      <div className="book-meta">
        <span>{book.category}</span>
        <span className="rating">
          ★ {book.rating} <small>({book.reviews.toLocaleString()})</small>
        </span>
      </div>

      <h3>
        <button className="book-title-button" onClick={() => onSelectBook(book)}>
          {book.title}
        </button>
      </h3>

      <p className="author">by {book.author}</p>

      <div className="card-bottom">
        <b>${book.price.toFixed(2)}</b>
        <button onClick={() => onAddToCart(book)}>
          Add to bag <span>＋</span>
        </button>
      </div>
    </article>
  );
}

export default BookCard;