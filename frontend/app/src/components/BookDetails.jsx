function BookDetails({ book, onClose, onAddToCart, onToggleWishlist }) {
  if (!book) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <section
        className="detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close book details"
        >
          ×
        </button>

        <div className={`detail-cover cover-${book.id % 5}`}>
          <img
            src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`}
            alt={`Cover of ${book.title}`}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <span>{book.title}</span>
        </div>

        <div className="detail-copy">
          <span className="eyebrow">{book.category}</span>
          <h2 id="book-detail-title">{book.title}</h2>
          <p className="author">by {book.author}</p>

          <p className="rating">
            ★ {book.rating}{" "}
            <small>({book.reviews.toLocaleString()} reader reviews)</small>
          </p>

          <p>{book.description}</p>

          <div className="detail-stock">
            <span aria-hidden="true">✓</span> In stock · ships in 1–2 days
          </div>

          <div className="detail-actions">
            <b>${book.price.toFixed(2)}</b>
            <button
              className="primary-button"
              onClick={() => {
                onAddToCart(book);
                onClose();
              }}
            >
              Add to bag <span>→</span>
            </button>
            <button
              className="icon-button"
              aria-label="Add to wishlist"
              onClick={() => onToggleWishlist(book)}
            >
              ♡
            </button>
          </div>

          <small className="demo-note">
            Book preview and reader reviews are sample information.
          </small>
        </div>
      </section>
    </div>
  );
}

export default BookDetails;