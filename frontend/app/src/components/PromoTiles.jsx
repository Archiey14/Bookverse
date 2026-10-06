import { COLLECTIONS } from "../utils/collections";
import BookCover from "./BookCover";

// Three promo tiles, like the banner row on a bookstore homepage. Each one
// opens the catalog on a collection and shows two covers from it.
const TILES = [
  {
    key: "budget",
    theme: "promo-amber",
    title: "Great reads under $15",
    cta: "Shop budget picks",
  },
  {
    key: "hardcover",
    theme: "promo-sage",
    title: "Hardcover editions",
    cta: "Shop hardcovers",
  },
  {
    key: "short",
    theme: "promo-sky",
    title: "Quick reads",
    cta: "Shop short books",
  },
];

function PromoTiles({ books, onSelect }) {
  const tiles = TILES.map((tile) => {
    const matches = books.filter(COLLECTIONS[tile.key].match);
    return { ...tile, count: matches.length, covers: matches.slice(0, 2) };
  }).filter((tile) => tile.count > 0);

  if (tiles.length === 0) return null;

  return (
    <section className="promo-section" aria-label="Featured collections">
      <div className="promo-grid">
        {tiles.map((tile) => (
          <button
            type="button"
            key={tile.key}
            className={`promo-tile ${tile.theme}`}
            onClick={() => onSelect(tile.key)}
          >
            <span className="promo-copy">
              <small>
                {tile.count} {tile.count === 1 ? "book" : "books"}
              </small>
              <b>{tile.title}</b>
              <span>{tile.cta} →</span>
            </span>

            <span className="promo-covers" aria-hidden="true">
              {tile.covers.map((book) => (
                <span key={book.id}>
                  <BookCover book={book} size="M" decorative className="book3d" />
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default PromoTiles;
