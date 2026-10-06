import { Link, useLocation } from "react-router-dom";
import UserMenu from "./UserMenu";
import Announcement from "./Announcement";
import ThemeToggle from "./ThemeToggle";
import "../App.css";

// Wraps pages (login, register, admin) with a consistent, subtle header and footer.
// mode="login"    -> navbar button offers "Create account", scroll is locked
// mode="register" -> navbar button offers "Sign in"
// no mode         -> navbar shows the signed-in user menu
function PageLayout({ mode, children }) {
  const location = useLocation();

  return (
    <div className={`app-shell page-layout ${mode ? `page-layout-${mode}` : ""}`}>
      {mode !== "login" && <Announcement />}

      <header className="topbar">
        <Link className="brand" to="/" aria-label="Bookverse home">
          <span className="brand-mark">b.</span>
          <span>
            book<span className="brand-light">verse</span>
          </span>
        </Link>

        <nav className="main-nav" aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/books">Store</Link>
          <Link to="/books" state={{ goTo: "bestsellers" }}>
            Bestsellers
          </Link>
          <Link to="/books" state={{ goTo: "about" }}>
            Our story
          </Link>
        </nav>

        <div className="header-actions">
          <ThemeToggle />
          {mode === "login" && (
            <Link className="sign-in" to="/register" state={location.state}>
              Create account
            </Link>
          )}
          {mode === "register" && (
            <Link className="sign-in" to="/login" state={location.state}>
              Sign in
            </Link>
          )}
          {!mode && <UserMenu />}
        </div>
      </header>

      <main className="page-main">{children}</main>

      {!mode && (
        <footer className="site-footer">
          <Link className="brand" to="/">
            <span className="brand-mark">b.</span>
            <span>
              book<span className="brand-light">verse</span>
            </span>
          </Link>
          <div className="site-footer-links">
            <Link to="/terms">Terms & Conditions</Link>
            <span aria-hidden="true">·</span>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
          <span>© Shnoor {new Date().getFullYear()} Bookverse</span>
        </footer>
      )}
    </div>
  );
}

export default PageLayout;
