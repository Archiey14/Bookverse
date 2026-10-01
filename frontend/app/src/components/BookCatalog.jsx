import { useMemo, useState } from "react";
import { categories } from "../data/books";
import BookCard from "./BookCard";

function BookCatalog({
  books,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onSelectBook,
}) {
  const [category, setCategory] = useState("All Books");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");

  const visibleBooks = useMemo(() => {
    let result = books.filter((book) => {
      const matchesCategory =
        category === "All Books" || book.category === category;

      const searchableText =
        `${book.title} ${book.author} ${book.category}`.toLowerCase();

      return matchesCategory && searchableText.includes(query.toLowerCase());
    });

    if (sort === "price-low") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sort === "price-high") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [books, category, query, sort]);

  return (
    <section className="catalog-section" id="catalog">
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE BOOKSHELF</span>
          <h2>
            Find your next <em>favorite.</em>
          </h2>
        </div>

        <label className="sort-control">
          Sort by
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="featured">Featured</option>
            <option value="rating">Top rated</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </label>
      </div>

      <div className="catalog-tools">
        <div className="category-list">
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? "category active" : "category"}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, author, category..."
            aria-label="Search books by title, author, or category"
          />
        </label>
      </div>

      <p className="results-note">
        {visibleBooks.length} thoughtful reads <span>·</span> picked for you
      </p>

      {visibleBooks.length > 0 ? (
        <div className="book-grid">
          {visibleBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isWishlisted={wishlist.includes(book.id)}
              onToggleWishlist={onToggleWishlist}
              onAddToCart={onAddToCart}
              onSelectBook={onSelectBook}
            />
          ))}
        </div>
      ) : (
        <div className="empty-results">
          No books found. Try a different search or category.
        </div>
      )}

      <div className="catalog-bottom">
        <button
          onClick={() => {
            setCategory("All Books");
            setQuery("");
          }}
        >
          Show all books <span>→</span>
        </button>
      </div>
    </section>
  );
}

export default BookCatalog;