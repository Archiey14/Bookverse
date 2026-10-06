import { useMemo, useRef } from "react";
import { useScrollArrows } from "../hooks/useScrollArrows";
import BookCover from "./BookCover";
import Chevron from "./Chevron";

// The round "browse by category" strip right under the header.
// Every tile is built from the catalog itself: the cover shown is the
// top-rated book in that category, and the label is the category name.
function CategoryStrip({ books, loading, active = "All Books", onSelect }) {
  const trackRef = useRef(null);

  const tiles = useMemo(() => {
    const groups = new Map();

    for (const book of books) {
      if (!book.category) continue;

      const group = groups.get(book.category) ?? {
        name: book.category,
        count: 0,
        best: book,
      };

      group.count += 1;
      if ((book.rating || 0) > (group.best.rating || 0)) group.best = book;
      groups.set(book.category, group);
    }

    const list = [...groups.values()].sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name),
    );

    if (books.length === 0) return list;

    const topBook = [...books].sort(
      (a, b) => (b.rating || 0) - (a.rating || 0),
    )[0];

    return [{ name: "All Books", count: books.length, best: topBook }, ...list];
  }, [books]);

  const { canPrev, canNext, scroll } = useScrollArrows(trackRef, tiles.length);

  return (
    <section className="category-panel" aria-label="Browse by category">
      <button
        type="button"
        className="strip-arrow strip-arrow-edge"
        onClick={() => scroll(-1)}
        disabled={!canPrev}
        aria-label="Previous categories"
      >
        <Chevron direction="left" />
      </button>

      <div className="category-track" ref={trackRef}>
        {loading &&
          Array.from({ length: 8 }, (_, index) => (
            <div className="category-tile skeleton" key={index} aria-hidden="true">
              <span className="category-disc" />
              <span className="category-name">&nbsp;</span>
            </div>
          ))}

        {!loading &&
          tiles.map((tile) => (
            <button
              type="button"
              key={tile.name}
              className={
                active === tile.name ? "category-tile active" : "category-tile"
              }
              onClick={() => onSelect(tile.name)}
              aria-pressed={active === tile.name}
              title={`${tile.count} ${tile.count === 1 ? "book" : "books"}`}
            >
              <span className="category-disc">
                <span className="category-book">
                  <BookCover book={tile.best} size="M" decorative className="book3d" />
                </span>
              </span>
              <span className="category-name">{tile.name}</span>
            </button>
          ))}
      </div>

      <button
        type="button"
        className="strip-arrow strip-arrow-edge"
        onClick={() => scroll(1)}
        disabled={!canNext}
        aria-label="Next categories"
      >
        <Chevron direction="right" />
      </button>
    </section>
  );
}

export default CategoryStrip;
