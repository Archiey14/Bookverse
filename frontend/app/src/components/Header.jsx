import UserMenu from "./UserMenu";

function Header({ cartCount, wishlistCount, onOpenPanel }) {
  return (
    <>
      <div className="announcement">
        Free shipping on orders over $40
      </div>

      <header className="topbar">
        <a
          className="brand"
          href="#top"
          onClick={() => onOpenPanel("")}
          aria-label="Bookverse home"
        >
          <span className="brand-mark">b.</span>
          <span>
            book<span className="brand-light">verse</span>
          </span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          <a href="#catalog">Discover</a>
          <a href="#catalog">Bestsellers</a>
          <a href="#about">Our story</a>
        </nav>

        <div className="header-actions">
          <button
            className="icon-button"
            onClick={() => onOpenPanel("wishlist")}
            aria-label={`Open wishlist, ${wishlistCount} saved books`}
          >
            ♡ <span className="tiny-count">{wishlistCount}</span>
          </button>

          <button
            className="icon-button"
            onClick={() => onOpenPanel("cart")}
            aria-label={`Open shopping bag, ${cartCount} books`}
          >
            Bag <span className="tiny-count">{cartCount}</span>
          </button>

          <UserMenu />
        </div>
      </header>
    </>
  );
}

export default Header;
