import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import UserMenu from "./UserMenu";
import Announcement from "./Announcement";
import BookCover from "./BookCover";
import ThemeToggle from "./ThemeToggle";
import {
  BagIcon,
  ChevronDownIcon,
  HeartIcon,
  MenuIcon,
  ReceiptIcon,
  SearchIcon,
  TruckIcon,
} from "./Icons";
import { BUDGET_LIMIT } from "../utils/collections";
import { buildParams, shopPath } from "../utils/shopLinks";

const NAV_LINKS = [
  { key: "bestsellers", label: "Bestsellers" },
  { key: "new", label: "New arrivals" },
  { key: "toprated", label: "Top rated" },
  { key: "budget", label: `Under $${BUDGET_LIMIT}` },
  { key: "hardcover", label: "Hardcover" },
  { key: "short", label: "Quick reads" },
];

function searchText(book) {
  return `${book.title} ${book.author} ${book.category} ${(book.tags ?? []).join(" ")}`.toLowerCase();
}

// Search bar with a category picker and live suggestions.
// Remounted (via `key`) whenever the address bar's search changes, so the
// text always matches the results being shown.
function SearchBox({ books, categories, initialQuery, initialCategory }) {
  const navigate = useNavigate();
  const id = useId();
  const rootRef = useRef(null);
  const [text, setText] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const suggestions = useMemo(() => {
    const needle = text.trim().toLowerCase();
    if (needle.length < 2) return [];

    return books
      .filter(
        (book) =>
          (!category || book.category === category) &&
          searchText(book).includes(needle),
      )
      .sort(
        (a, b) =>
          Number(b.title.toLowerCase().startsWith(needle)) -
          Number(a.title.toLowerCase().startsWith(needle)),
      )
      .slice(0, 6);
  }, [books, text, category]);

  const showList = open && suggestions.length > 0;
  const seeAllIndex = suggestions.length;

  function submit(event) {
    event.preventDefault();
    setOpen(false);
    navigate(shopPath({ q: text.trim(), category }));
  }

  function openBook(book) {
    setOpen(false);
    navigate(`/book/${book.id}`);
  }

  function onKeyDown(event) {
    if (!showList) {
      if (event.key === "ArrowDown" && suggestions.length > 0) {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => (index >= seeAllIndex ? 0 : index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => (index <= 0 ? seeAllIndex : index - 1));
    } else if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
    } else if (event.key === "Enter" && active >= 0 && active < seeAllIndex) {
      event.preventDefault();
      openBook(suggestions[active]);
    }
  }

  return (
    <form
      className="sf-search"
      role="search"
      ref={rootRef}
      onSubmit={submit}
      onBlur={(event) => {
        if (!rootRef.current?.contains(event.relatedTarget)) {
          setOpen(false);
          setActive(-1);
        }
      }}
    >
      <label className="sr-only" htmlFor={`${id}-category`}>
        Search in
      </label>
      <select
        id={`${id}-category`}
        className="sf-search-category"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
      >
        <option value="">All categories</option>
        {categories.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor={`${id}-input`}>
        Search books by title, author or topic
      </label>
      <input
        id={`${id}-input`}
        className="sf-search-input"
        type="search"
        value={text}
        placeholder="Search by title, author or topic"
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${id}-option-${active}` : undefined}
        onChange={(event) => {
          setText(event.target.value);
          setActive(-1);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />

      <button className="sf-search-button" type="submit">
        <SearchIcon size={20} />
        <span>Search</span>
      </button>

      {showList && (
        <ul className="sf-suggest" id={`${id}-list`} role="listbox">
          {suggestions.map((book, index) => (
            <li
              key={book.id}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={active === index}
              className={active === index ? "active" : ""}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActive(index)}
              onClick={() => openBook(book)}
            >
              <span className="sf-suggest-cover">
                <BookCover book={book} size="S" decorative />
              </span>
              <span className="sf-suggest-text">
                <b>{book.title}</b>
                <small>
                  {book.author} · {book.category}
                </small>
              </span>
              <span className="sf-suggest-price">${book.price.toFixed(2)}</span>
            </li>
          ))}

          <li
            id={`${id}-option-${seeAllIndex}`}
            role="option"
            aria-selected={active === seeAllIndex}
            className={
              active === seeAllIndex ? "sf-suggest-all active" : "sf-suggest-all"
            }
            onMouseDown={(event) => event.preventDefault()}
            onMouseEnter={() => setActive(seeAllIndex)}
            onClick={submit}
          >
            See all results for “{text.trim()}”
          </li>
        </ul>
      )}
    </form>
  );
}

// "All categories" button with a dropdown of every category.
function CategoryMenu({ categories }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="sf-catmenu" ref={rootRef}>
      <button
        type="button"
        className="sf-catmenu-button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
      >
        <MenuIcon size={18} />
        <span>All categories</span>
        <ChevronDownIcon size={16} />
      </button>

      {open && (
        <div className="sf-catmenu-panel">
          <Link to="/" onClick={() => setOpen(false)}>
            All books
          </Link>
          {categories.map((name) => (
            <Link
              key={name}
              to={shopPath({ category: name })}
              onClick={() => setOpen(false)}
            >
              {name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Announcement bar + sticky white header (logo, search, account, wishlist,
// bag) + navy navigation bar. Used on the books page and every book page.
function Header({ books = [], cartCount = 0, wishlistCount = 0, onOpenPanel }) {
  const [params] = useSearchParams();
  const { pathname } = useLocation();

  const onShop = pathname === "/" || pathname === "/books";
  const urlQuery = onShop ? (params.get("q") ?? "") : "";
  const urlCategory = onShop ? (params.get("category") ?? "") : "";
  const activeCollection = onShop ? params.get("collection") : null;

  const categories = useMemo(
    () => [...new Set(books.map((book) => book.category).filter(Boolean))].sort(),
    [books],
  );

  function open(panel) {
    return () => onOpenPanel?.(panel);
  }

  return (
    <>
      <Announcement />

      <header className="sf-header">
        <div className="sf-main">
          <Link
            className="sf-logo"
            to="/"
            aria-label="BookVerse home"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span className="sf-logo-mark">b.</span>
            <span className="sf-logo-text">
              book<span>verse</span>
            </span>
          </Link>

          <SearchBox
            key={`${urlQuery}|${urlCategory}`}
            books={books}
            categories={categories}
            initialQuery={urlQuery}
            initialCategory={urlCategory}
          />

          <div className="sf-actions">
            <UserMenu />

            <span className="sf-divider" aria-hidden="true" />

            <button
              type="button"
              className="sf-action"
              onClick={open("wishlist")}
              aria-label={`Open wishlist, ${wishlistCount} saved books`}
            >
              <span className="sf-action-icon">
                <HeartIcon size={22} />
                {wishlistCount > 0 && <i className="sf-badge">{wishlistCount}</i>}
              </span>
              <span className="sf-action-label">Wishlist</span>
            </button>

            <button
              type="button"
              className="sf-action"
              onClick={open("orders")}
              aria-label="Open your orders"
            >
              <span className="sf-action-icon">
                <ReceiptIcon size={22} />
              </span>
              <span className="sf-action-label">Orders</span>
            </button>

            <button
              type="button"
              className="sf-action"
              onClick={open("cart")}
              aria-label={`Open shopping bag, ${cartCount} books`}
            >
              <span className="sf-action-icon">
                <BagIcon size={22} />
                {cartCount > 0 && <i className="sf-badge">{cartCount}</i>}
              </span>
              <span className="sf-action-label">Bag</span>
            </button>

            <span className="sf-divider" aria-hidden="true" />

            <ThemeToggle />
          </div>
        </div>

        <nav className="sf-nav" aria-label="Main navigation">
          <div className="sf-nav-inner">
            <CategoryMenu categories={categories} />

            <div className="sf-nav-links">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.key}
                  to={`/?${buildParams({ collection: item.key })}`}
                  className={activeCollection === item.key ? "active" : ""}
                  aria-current={activeCollection === item.key ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <span className="sf-nav-note">
              <TruckIcon size={18} /> Free shipping over $40
            </span>
          </div>
        </nav>
      </header>
    </>
  );
}

export default Header;
