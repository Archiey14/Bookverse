import { Link } from "react-router-dom";
import BookCover from "./BookCover";
import Stars from "./Stars";
import { EyeIcon, HeartIcon } from "./Icons";
import { getStockStatus } from "../utils/stock";

// One product card. `layout="list"` turns it into a wide row with the book's
// description, used by the catalog's list view.
//
// If a book has a `listPrice` higher than its `price`, the old price is shown
// struck through with a "% off" badge. Books without one just show the price.
function BookCard({
  book,
  isWishlisted = false,
  onToggleWishlist,
  onAddToCart,
  onSelectBook,
  quantity = 0,
  onChangeQuantity,
  layout = "grid",
}) {
  const { outOfStock, lowStock } = getStockStatus(book);
  const bookPath = `/book/${book.id}`;

  const listPrice = Number(book.listPrice) > book.price ? Number(book.listPrice) : 0;
  const discount = listPrice ? Math.round((1 - book.price / listPrice) * 100) : 0;

  const details = [
    book.format,
    book.pages && `${book.pages} pages`,
    book.publishedYear,
  ].filter(Boolean);

  return (
    <article className={`pcard pcard-${layout}`}>
      <div className="pcard-media">
        <Link
          className="pcard-cover"
          to={bookPath}
          tabIndex={-1}
          aria-hidden="true"
        >
          <BookCover book={book} size="L" decorative className="book3d" />
        </Link>

        <div className="pcard-badges">
          {book.bestseller && <span className="badge badge-best">Bestseller</span>}
          {discount > 0 && <span className="badge badge-off">{discount}% off</span>}
        </div>

        <button
          type="button"
          className={isWishlisted ? "pcard-heart saved" : "pcard-heart"}
          aria-pressed={isWishlisted}
          aria-label={
            isWishlisted
              ? `Remove ${book.title} from wishlist`
              : `Add ${book.title} to wishlist`
          }
          onClick={() => onToggleWishlist?.(book)}
        >
          <HeartIcon size={18} filled={isWishlisted} />
        </button>

        {onSelectBook && (
          <button
            type="button"
            className="pcard-quick"
            onClick={() => onSelectBook(book)}
            aria-label={`Quick view: ${book.title}`}
          >
            <EyeIcon size={16} /> Quick view
          </button>
        )}
      </div>

      <div className="pcard-body">
        <span className="pcard-category">{book.category}</span>

        <h3 className="pcard-title">
          <Link to={bookPath}>{book.title}</Link>
        </h3>

        <p className="pcard-author">by {book.author}</p>

        <Stars value={book.rating} count={book.reviews} />

        {layout === "list" && book.description && (
          <p className="pcard-desc">{book.description}</p>
        )}

        {layout === "list" && details.length > 0 && (
          <p className="pcard-details">{details.join(" · ")}</p>
        )}

        <div className="pcard-price">
          <b>${book.price.toFixed(2)}</b>
          {listPrice > 0 && <s>${listPrice.toFixed(2)}</s>}
        </div>

        {lowStock && <p className="pcard-stock low">Only {book.stock} left</p>}

        <div className="pcard-actions">
          {quantity > 0 ? (
            <div
              className="pcard-stepper"
              role="group"
              aria-label={`${book.title} quantity in bag`}
            >
              <button
                type="button"
                onClick={() => onChangeQuantity?.(book.id, -1)}
                aria-label="Remove one from bag"
              >
                −
              </button>
              <span aria-live="polite">{quantity}</span>
              <button
                type="button"
                onClick={() => onChangeQuantity?.(book.id, 1)}
                aria-label="Add one more to bag"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="pcard-add"
              disabled={outOfStock}
              onClick={() => onAddToCart?.(book)}
            >
              {outOfStock ? "Out of stock" : "Add to bag"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default BookCard;
