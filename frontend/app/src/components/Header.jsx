import UserMenu from "./UserMenu";
import Announcement from "./Announcement";

function Icon({ children }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function Header({ cartCount, wishlistCount, onOpenPanel, onNavigate }) {
  function go(target) {
    return (event) => {
      event.preventDefault();
      onNavigate(target);
    };
  }

  return (
    <>
      <Announcement />

      <header className="topbar">
        <a
          className="brand"
          href="/"
          onClick={(event) => {
            event.preventDefault();
            onOpenPanel("");
            onNavigate("top");
          }}
          aria-label="Bookverse home"
        >
          <span className="brand-mark">b.</span>
          <span>
            book<span className="brand-light">verse</span>
          </span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          <a href="#catalog" onClick={go("discover")}>Discover</a>
          <a href="#catalog" onClick={go("bestsellers")}>Bestsellers</a>
          <a href="#about" onClick={go("about")}>Our story</a>
        </nav>

        <div className="header-actions">
          <button
            className="icon-button"
            onClick={() => onOpenPanel("wishlist")}
            aria-label={`Open wishlist, ${wishlistCount} saved books`}
          >
            <Icon>
              <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
            </Icon>
            <span className="label">Wishlist</span>
            <span className="tiny-count">{wishlistCount}</span>
          </button>

          <button
            className="icon-button"
            onClick={() => onOpenPanel("cart")}
            aria-label={`Open shopping bag, ${cartCount} books`}
          >
            <Icon>
              <path d="M5 8h14l-1 12H6L5 8z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </Icon>
            <span className="label">Bag</span>
            <span className="tiny-count">{cartCount}</span>
          </button>

          <button
            className="icon-button"
            onClick={() => onOpenPanel("orders")}
            aria-label="Open your orders"
          >
            <Icon>
              <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
              <path d="M9 8h6M9 12h6" />
            </Icon>
            <span className="label">Orders</span>
          </button>

          <span className="header-divider" aria-hidden="true" />

          <UserMenu />
        </div>
      </header>
    </>
  );
}

export default Header;
