import { Link, useLocation } from "react-router-dom";
import UserMenu from "./UserMenu";
import Announcement from "./Announcement";
import "../App.css";

// Wraps the simpler pages (login, register, admin) with the same announcement
// bar, charcoal navbar and footer used on the homepage, so every page of the
// site looks like one place.
//
// mode="login"    -> navbar button offers "Create account"
// mode="register" -> navbar button offers "Sign in"
// no mode         -> navbar shows the signed-in user menu
function PageLayout({ mode, children }) {
  const location = useLocation();

  return (
    <div className="app-shell page-layout">
      <Announcement />

      <header className="topbar">
        <Link className="brand" to="/" aria-label="Bookverse home">
          <span className="brand-mark">b.</span>
          <span>
            book<span className="brand-light">verse</span>
          </span>
        </Link>

        <nav className="main-nav" aria-label="Main navigation">
          <Link to="/">Discover</Link>
          <Link to="/" state={{ goTo: "bestsellers" }}>
            Bestsellers
          </Link>
          <Link to="/" state={{ goTo: "about" }}>
            Our story
          </Link>
        </nav>

        <div className="header-actions">
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
          <span>Made for the love of a good story.</span>
          <span>©Shnoor 2025 Bookverse</span>
        </footer>
      )}
    </div>
  );
}

export default PageLayout;
