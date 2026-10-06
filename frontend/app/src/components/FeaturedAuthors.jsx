import { useMemo } from "react";

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

// "Featured authors": the authors with the most reader reviews in the
// catalog. Clicking one searches the catalog for that author.
function FeaturedAuthors({ books, onSelect }) {
  const authors = useMemo(() => {
    const map = new Map();

    for (const book of books) {
      if (!book.author) continue;
      const entry = map.get(book.author) ?? {
        name: book.author,
        count: 0,
        reviews: 0,
      };
      entry.count += 1;
      entry.reviews += book.reviews || 0;
      map.set(book.author, entry);
    }

    return [...map.values()].sort((a, b) => b.reviews - a.reviews).slice(0, 10);
  }, [books]);

  if (authors.length < 3) return null;

  return (
    <section className="authors-section">
      <div className="shelf-head">
        <div>
          <h2>Featured authors</h2>
          <p>Writers our readers keep coming back to</p>
        </div>
      </div>

      <div className="authors-row">
        {authors.map((author, index) => (
          <button
            key={author.name}
            className="author-tile"
            onClick={() => onSelect(author.name)}
          >
            <span className={`author-avatar avatar-${index % 5}`}>
              {initials(author.name)}
            </span>
            <b>{author.name}</b>
            <small>
              {author.count} {author.count === 1 ? "book" : "books"}
            </small>
          </button>
        ))}
      </div>
    </section>
  );
}

export default FeaturedAuthors;
