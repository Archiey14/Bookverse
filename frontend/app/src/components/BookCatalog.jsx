import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import BookCard from "./BookCard";
import {
  ChevronDownIcon,
  CloseIcon,
  FilterIcon,
  GridIcon,
  ListIcon,
} from "./Icons";
import { useScrollLock } from "../hooks/useScrollLock";
import {
  COLLECTIONS,
  compareNewest,
  compareRating,
} from "../utils/collections";

const PAGE_SIZE = 12;
const VIEW_KEY = "bookverse-view";

// Upper bound is inclusive, so "Under $15" matches the budget collection.
const PRICE_BANDS = [
  { id: "any", label: "Any price" },
  { id: "u15", label: "Under $15", lo: 0, hi: 15 },
  { id: "15-25", label: "$15 – $25", lo: 15, hi: 25 },
  { id: "25-40", label: "$25 – $40", lo: 25, hi: 40 },
  { id: "o40", label: "Over $40", lo: 40, hi: Infinity },
];

const RATING_STEPS = [4.5, 4, 3];

const SORT_OPTIONS = [
  ["featured", "Featured"],
  ["newest", "Newest first"],
  ["rating", "Top rated"],
  ["popular", "Most reviewed"],
  ["price-low", "Price: low to high"],
  ["price-high", "Price: high to low"],
  ["title", "Title: A–Z"],
];

const EMPTY_FILTERS = { price: "any", formats: [], rating: 0, inStock: false };

function readView() {
  try {
    return localStorage.getItem(VIEW_KEY) === "list" ? "list" : "grid";
  } catch {
    return "grid";
  }
}

function matchesQuery(book, needle) {
  if (!needle) return true;
  const text = `${book.title} ${book.author} ${book.category} ${(book.tags ?? []).join(" ")}`;
  return text.toLowerCase().includes(needle);
}

// `skip` leaves one facet out, so each facet can show how many books it
// would give *if you picked it* while the other filters still apply.
function matchesFacets(book, filters, skip) {
  if (skip !== "price" && filters.price !== "any") {
    const band = PRICE_BANDS.find((item) => item.id === filters.price);
    if (band && !(book.price > band.lo && book.price <= band.hi)) return false;
  }
  if (
    skip !== "format" &&
    filters.formats.length > 0 &&
    !filters.formats.includes(book.format)
  ) {
    return false;
  }
  if (skip !== "rating" && filters.rating > 0) {
    if ((Number(book.rating) || 0) < filters.rating) return false;
  }
  if (skip !== "stock" && filters.inStock && book.stock === 0) return false;
  return true;
}

function sortBooks(list, sort) {
  const sorted = [...list];

  switch (sort) {
    case "newest":
      sorted.sort(compareNewest);
      break;
    case "rating":
      sorted.sort(compareRating);
      break;
    case "popular":
      sorted.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
      break;
    case "price-low":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "title":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      sorted.sort(
        (a, b) => Number(b.featured) - Number(a.featured) || compareRating(a, b),
      );
  }

  return sorted;
}

function pageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const wanted = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  const items = [];
  wanted.forEach((page, index) => {
    if (index > 0 && page - wanted[index - 1] > 1) items.push(`gap-${page}`);
    items.push(page);
  });
  return items;
}

function sentenceCase(text) {
  return text.charAt(0) + text.slice(1).toLowerCase();
}

function FilterGroup({ title, children }) {
  return (
    <details className="filter-group" open>
      <summary>
        <span>{title}</span>
        <ChevronDownIcon size={16} />
      </summary>
      <div className="filter-body">{children}</div>
    </details>
  );
}

function Option({ type, name, label, count, checked, disabled, onChange }) {
  return (
    <label className={disabled ? "opt disabled" : "opt"}>
      <input
        type={type}
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <span className="opt-label">{label}</span>
      <span className="opt-count">{count}</span>
    </label>
  );
}

function FilterPanel({
  categoryRows,
  allCount,
  category,
  onCategory,
  priceRows,
  formatRows,
  ratingRows,
  anyRatingCount,
  stockCount,
  filters,
  onFilters,
  activeCount,
  resultCount,
  onClear,
  onClose,
}) {
  function toggleFormat(name) {
    const formats = filters.formats.includes(name)
      ? filters.formats.filter((item) => item !== name)
      : [...filters.formats, name];
    onFilters({ formats });
  }

  return (
    <>
      <div className="filters-head">
        <h2>
          <FilterIcon size={18} /> Filters
          {activeCount > 0 && <span className="filters-count">{activeCount}</span>}
        </h2>
        {activeCount > 0 && (
          <button type="button" className="text-link" onClick={onClear}>
            Clear all
          </button>
        )}
        <button
          type="button"
          className="filters-close"
          onClick={onClose}
          aria-label="Close filters"
        >
          <CloseIcon size={20} />
        </button>
      </div>

      <FilterGroup title="Category">
        <Option
          type="radio"
          name="filter-category"
          label="All books"
          count={allCount}
          checked={category === "All Books"}
          onChange={() => onCategory("All Books")}
        />
        {categoryRows.map((row) => (
          <Option
            key={row.name}
            type="radio"
            name="filter-category"
            label={row.name}
            count={row.count}
            checked={category === row.name}
            disabled={row.count === 0 && category !== row.name}
            onChange={() => onCategory(row.name)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Price">
        {priceRows.map((row) => (
          <Option
            key={row.id}
            type="radio"
            name="filter-price"
            label={row.label}
            count={row.count}
            checked={filters.price === row.id}
            disabled={row.count === 0 && filters.price !== row.id}
            onChange={() => onFilters({ price: row.id })}
          />
        ))}
      </FilterGroup>

      {formatRows.length > 0 && (
        <FilterGroup title="Format">
          {formatRows.map((row) => (
            <Option
              key={row.name}
              type="checkbox"
              name="filter-format"
              label={row.name}
              count={row.count}
              checked={filters.formats.includes(row.name)}
              disabled={row.count === 0 && !filters.formats.includes(row.name)}
              onChange={() => toggleFormat(row.name)}
            />
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Customer rating">
        <Option
          type="radio"
          name="filter-rating"
          label="Any rating"
          count={anyRatingCount}
          checked={filters.rating === 0}
          onChange={() => onFilters({ rating: 0 })}
        />
        {ratingRows.map((row) => (
          <Option
            key={row.value}
            type="radio"
            name="filter-rating"
            label={`${row.value}★ & up`}
            count={row.count}
            checked={filters.rating === row.value}
            disabled={row.count === 0 && filters.rating !== row.value}
            onChange={() => onFilters({ rating: row.value })}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Availability">
        <Option
          type="checkbox"
          name="filter-stock"
          label="In stock only"
          count={stockCount}
          checked={filters.inStock}
          onChange={(event) => onFilters({ inStock: event.target.checked })}
        />
      </FilterGroup>

      <div className="filters-foot">
        <button type="button" className="primary-button" onClick={onClose}>
          Show {resultCount} {resultCount === 1 ? "book" : "books"}
        </button>
      </div>
    </>
  );
}

// The main catalog, in the style of a big bookstore's listing page:
// filters on the left, sort + grid/list toggle on top, pagination below.
//
// What is being browsed (collection, category, search text) lives in the
// address bar and arrives as props, so the category strip, header search and
// shelves can all drive it. The sidebar filters, sort, view and page are local.
function BookCatalog({
  books,
  collection,
  category,
  query,
  onChange,
  onClearAll,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onSelectBook,
  cart,
  onChangeQuantity,
}) {
  const config = COLLECTIONS[collection] ?? COLLECTIONS.all;

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [view, setView] = useState(readView);
  const [drawer, setDrawer] = useState(false);
  const [sortChoice, setSortChoice] = useState({ collection, value: "" });
  const [pageState, setPageState] = useState({ page: 1, sig: "" });

  useScrollLock(drawer);

  // A new collection starts from that collection's own sort order
  const sort =
    sortChoice.collection === collection && sortChoice.value
      ? sortChoice.value
      : config.sort;

  const needle = query.trim().toLowerCase();

  const scoped = useMemo(
    () => books.filter((book) => config.match(book) && matchesQuery(book, needle)),
    [books, config, needle],
  );

  const allCategories = useMemo(
    () => [...new Set(books.map((book) => book.category).filter(Boolean))].sort(),
    [books],
  );

  const allFormats = useMemo(
    () => [...new Set(books.map((book) => book.format).filter(Boolean))].sort(),
    [books],
  );

  const inCategory = (book) => category === "All Books" || book.category === category;

  // Facet counts
  const categoryRows = allCategories.map((name) => ({
    name,
    count: scoped.filter(
      (book) => book.category === name && matchesFacets(book, filters),
    ).length,
  }));
  const allCount = scoped.filter((book) => matchesFacets(book, filters)).length;

  const priceRows = PRICE_BANDS.map((band) => ({
    ...band,
    count: scoped.filter(
      (book) =>
        inCategory(book) &&
        matchesFacets(book, filters, "price") &&
        (band.id === "any" || (book.price > band.lo && book.price <= band.hi)),
    ).length,
  }));

  const formatRows = allFormats.map((name) => ({
    name,
    count: scoped.filter(
      (book) =>
        inCategory(book) &&
        matchesFacets(book, filters, "format") &&
        book.format === name,
    ).length,
  }));

  const ratingBase = scoped.filter(
    (book) => inCategory(book) && matchesFacets(book, filters, "rating"),
  );
  const ratingRows = RATING_STEPS.map((value) => ({
    value,
    count: ratingBase.filter((book) => (Number(book.rating) || 0) >= value).length,
  }));

  const stockCount = scoped.filter(
    (book) =>
      inCategory(book) && matchesFacets(book, filters, "stock") && book.stock !== 0,
  ).length;

  const visible = sortBooks(
    scoped.filter((book) => inCategory(book) && matchesFacets(book, filters)),
    sort,
  );

  // Pagination: the page resets by itself when anything about the list changes
  const signature = [
    collection,
    category,
    needle,
    sort,
    filters.price,
    filters.formats.join(","),
    filters.rating,
    filters.inStock,
  ].join("|");

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const page =
    pageState.sig === signature ? Math.min(pageState.page, totalPages) : 1;
  const start = (page - 1) * PAGE_SIZE;
  const pageBooks = visible.slice(start, start + PAGE_SIZE);

  function goToPage(next) {
    setPageState({ page: next, sig: signature });
    document
      .getElementById("catalog-results")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function patchFilters(patch) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  function changeView(next) {
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      // the choice just won't be remembered
    }
  }

  function clearAll() {
    setFilters(EMPTY_FILTERS);
    onClearAll();
  }

  // The chips above the results, each one removes a single filter
  const chips = [];
  if (collection !== "all") {
    chips.push({
      key: "collection",
      label: sentenceCase(config.eyebrow),
      remove: () => onChange({ collection: "all" }),
    });
  }
  if (category !== "All Books") {
    chips.push({
      key: "category",
      label: category,
      remove: () => onChange({ category: "All Books" }),
    });
  }
  if (needle) {
    chips.push({
      key: "query",
      label: `“${query.trim()}”`,
      remove: () => onChange({ q: "" }),
    });
  }
  if (filters.price !== "any") {
    chips.push({
      key: "price",
      label: PRICE_BANDS.find((band) => band.id === filters.price)?.label,
      remove: () => patchFilters({ price: "any" }),
    });
  }
  for (const format of filters.formats) {
    chips.push({
      key: `format-${format}`,
      label: format,
      remove: () =>
        patchFilters({ formats: filters.formats.filter((item) => item !== format) }),
    });
  }
  if (filters.rating > 0) {
    chips.push({
      key: "rating",
      label: `${filters.rating}★ & up`,
      remove: () => patchFilters({ rating: 0 }),
    });
  }
  if (filters.inStock) {
    chips.push({
      key: "stock",
      label: "In stock",
      remove: () => patchFilters({ inStock: false }),
    });
  }

  const sidebarActive =
    (category !== "All Books" ? 1 : 0) +
    (filters.price !== "any" ? 1 : 0) +
    filters.formats.length +
    (filters.rating > 0 ? 1 : 0) +
    (filters.inStock ? 1 : 0);

  const trimmedQuery = query.trim();
  const heading = trimmedQuery
    ? `Results for “${trimmedQuery}”`
    : category !== "All Books"
      ? category
      : config.title;
  const eyebrow =
    category !== "All Books" && collection === "all" && !trimmedQuery
      ? "CATEGORY"
      : config.eyebrow;

  const end = Math.min(start + PAGE_SIZE, visible.length);

  return (
    <section className="catalog" id="catalog" aria-labelledby="catalog-title">
      {drawer && (
        <button
          type="button"
          className="filters-scrim"
          aria-label="Close filters"
          onClick={() => setDrawer(false)}
        />
      )}

      <aside
        className={drawer ? "filters open" : "filters"}
        aria-label="Filters"
        onKeyDown={(event) => {
          if (event.key === "Escape") setDrawer(false);
        }}
      >
        <FilterPanel
          categoryRows={categoryRows}
          allCount={allCount}
          category={category}
          onCategory={(name) => onChange({ category: name })}
          priceRows={priceRows}
          formatRows={formatRows}
          ratingRows={ratingRows}
          anyRatingCount={ratingBase.length}
          stockCount={stockCount}
          filters={filters}
          onFilters={patchFilters}
          activeCount={sidebarActive}
          resultCount={visible.length}
          onClear={clearAll}
          onClose={() => setDrawer(false)}
        />
      </aside>

      <div className="results" id="catalog-results">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">›</span>
          <span>Books</span>
          {category !== "All Books" && (
            <>
              <span aria-hidden="true">›</span>
              <span aria-current="page">{category}</span>
            </>
          )}
        </nav>

        <div className="results-head">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2 id="catalog-title">{heading}</h2>
            <p className="results-count" aria-live="polite">
              {visible.length === 0
                ? "No books found"
                : `Showing ${start + 1}–${end} of ${visible.length} ${
                    visible.length === 1 ? "book" : "books"
                  }`}
            </p>
          </div>

          <div className="results-tools">
            <button
              type="button"
              className="filters-open"
              onClick={() => setDrawer(true)}
            >
              <FilterIcon size={18} /> Filters
              {sidebarActive > 0 && (
                <span className="filters-count">{sidebarActive}</span>
              )}
            </button>

            <label className="sort-select">
              <span>Sort by</span>
              <select
                value={sort}
                onChange={(event) =>
                  setSortChoice({ collection, value: event.target.value })
                }
              >
                {SORT_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <div className="view-toggle" role="group" aria-label="Layout">
              <button
                type="button"
                aria-pressed={view === "grid"}
                aria-label="Grid view"
                onClick={() => changeView("grid")}
              >
                <GridIcon size={18} />
              </button>
              <button
                type="button"
                aria-pressed={view === "list"}
                aria-label="List view"
                onClick={() => changeView("list")}
              >
                <ListIcon size={18} />
              </button>
            </div>
          </div>
        </div>

        {chips.length > 0 && (
          <div className="chips" aria-label="Active filters">
            {chips.map((chip) => (
              <button
                type="button"
                key={chip.key}
                className="chip"
                onClick={chip.remove}
                aria-label={`Remove filter: ${chip.label}`}
              >
                {chip.label} <CloseIcon size={14} />
              </button>
            ))}
            <button type="button" className="text-link" onClick={clearAll}>
              Clear all
            </button>
          </div>
        )}

        {pageBooks.length > 0 ? (
          <div className={view === "list" ? "pgrid is-list" : "pgrid"}>
            {pageBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                layout={view}
                isWishlisted={wishlist.includes(book.id)}
                onToggleWishlist={onToggleWishlist}
                onAddToCart={onAddToCart}
                onSelectBook={onSelectBook}
                quantity={cart[book.id] || 0}
                onChangeQuantity={onChangeQuantity}
              />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <b>No books match these filters</b>
            <p>Try removing a filter or searching for something else.</p>
            <button type="button" className="primary-button" onClick={clearAll}>
              Clear all filters
            </button>
          </div>
        )}

        {totalPages > 1 && (
          <nav className="pagination" aria-label="Pagination">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
            >
              ← Previous
            </button>

            {pageList(page, totalPages).map((item) =>
              typeof item === "string" ? (
                <span key={item} className="pagination-gap" aria-hidden="true">
                  …
                </span>
              ) : (
                <button
                  type="button"
                  key={item}
                  className={item === page ? "active" : ""}
                  aria-current={item === page ? "page" : undefined}
                  aria-label={`Page ${item}`}
                  onClick={() => goToPage(item)}
                >
                  {item}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
            >
              Next →
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}

export default BookCatalog;
