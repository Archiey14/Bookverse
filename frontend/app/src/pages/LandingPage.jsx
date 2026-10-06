import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useBooks } from "../hooks/useBooks";
import BookCover from "../components/BookCover";
import Stars from "../components/Stars";
import { ShieldIcon } from "../components/Icons";
import ThemeToggle from "../components/ThemeToggle";
import "./LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const { books, loading } = useBooks();

  // Pick top 4 preview books
  const previewBooks = useMemo(() => {
    if (!books || books.length === 0) return [];
    return books.filter((b) => b.featured || b.bestseller).slice(0, 4);
  }, [books]);

  return (
    <div className="landing-wrapper">
      {/* Subtle Top Notification Bar */}
      <aside className="landing-topbar" aria-label="Bookverse announcement">
        <p>
          <span className="landing-pill">NEW</span> Complimentary doorstep shipping
          on all book orders over $40.
        </p>
      </aside>

      {/* Subtle Header */}
      <header className="landing-nav-header">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-brand" aria-label="Bookverse Home">
            <span className="landing-brand-mark">b.</span>
            <span className="landing-brand-name">
              book<span>verse</span>
            </span>
          </Link>

          <nav className="landing-nav-menu" aria-label="Landing Navigation">
            <a href="#preview">Preview Shelves</a>
            <a href="#philosophy">Our Ethos</a>
            <Link to="/books">Browse Store</Link>
          </nav>

          <div className="landing-nav-auth">
            <ThemeToggle />
            {isLoggedIn ? (
              <div className="landing-auth-logged">
                <span className="landing-user-label">
                  Hi, <b>{(user?.name || "Reader").split(" ")[0]}</b>
                </span>
                <Link to="/books" className="landing-cta-btn landing-cta-primary">
                  Enter Storefront <span>→</span>
                </Link>
                <button
                  type="button"
                  className="landing-logout-btn"
                  onClick={logout}
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="landing-auth-guest">
                <Link to="/login" className="landing-signin-link">
                  Sign in
                </Link>
                <Link to="/register" className="landing-cta-btn landing-cta-primary">
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="landing-main-content">
        {/* Hero Section */}
        <section className="landing-hero-section">
          <div className="landing-hero-container">
            <div className="landing-hero-badge">
              <span className="landing-sparkle">✦</span>
              <span>A SANCTUARY FOR CURIOUS READERS</span>
            </div>

            <h1 className="landing-hero-heading">
              Stories curated with care.
              <br />
              <em>A reading space without noise.</em>
            </h1>

            <p className="landing-hero-lead">
              Welcome to Bookverse — an independent digital bookstore crafted for
              people who cherish good literature. Explore hand-picked titles, build
              a synced personal library, and experience a subtle, distraction-free atmosphere.
            </p>

            <div className="landing-hero-buttons">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/books"
                    className="landing-btn-large landing-btn-accent"
                  >
                    Open Bookstore <span>→</span>
                  </Link>
                  <Link
                    to="/books?collection=bestsellers"
                    className="landing-btn-large landing-btn-subtle"
                  >
                    Browse Bestsellers
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="landing-btn-large landing-btn-accent"
                  >
                    Sign in to Enter <span>→</span>
                  </Link>
                  <Link
                    to="/register"
                    className="landing-btn-large landing-btn-subtle"
                  >
                    Create Free Account
                  </Link>
                </>
              )}
            </div>

            {/* Subtle Metrics Row */}
            <div className="landing-metrics-strip">
              <div className="landing-metric-item">
                <strong>1,200+</strong>
                <span>Curated Books</span>
              </div>
              <div className="landing-metric-divider" />
              <div className="landing-metric-item">
                <strong>4.9 / 5.0</strong>
                <span>Reader Satisfaction</span>
              </div>
              <div className="landing-metric-divider" />
              <div className="landing-metric-item">
                <strong>Free Shipping</strong>
                <span>On Orders Over $40</span>
              </div>
              <div className="landing-metric-divider" />
              <div className="landing-metric-item">
                <strong>100% Secure</strong>
                <span>Razorpay Payments</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sneak Peek Preview Shelves */}
        <section className="landing-section landing-preview-section" id="preview">
          <div className="landing-section-header">
            <span className="landing-subtle-tag">CURATED SELECTION</span>
            <h2>
              A taste of what&rsquo;s <em>on our shelves</em>
            </h2>
            <p className="landing-section-sub">
              Handpicked titles from our bestsellers and featured literature.
              Sign in to add books to your bag or personal wishlist.
            </p>
          </div>

          {loading ? (
            <p className="landing-loading">Loading curated books…</p>
          ) : (
            <div className="landing-preview-grid">
              {previewBooks.map((book) => (
                <div className="landing-book-card" key={book.id}>
                  <div
                    className="landing-book-cover-wrap"
                    onClick={() => navigate(`/book/${book.id}`)}
                    role="button"
                    tabIndex={0}
                  >
                    <BookCover book={book} size="L" decorative className="book3d" />
                    <span className="landing-book-preview-tag">
                      {isLoggedIn ? "View Details" : "Sign in to buy"}
                    </span>
                  </div>

                  <div className="landing-book-info">
                    <span className="landing-book-category">
                      {book.category}
                    </span>
                    <h3
                      className="landing-book-title"
                      onClick={() => navigate(`/book/${book.id}`)}
                    >
                      {book.title}
                    </h3>
                    <p className="landing-book-author">by {book.author}</p>

                    <div className="landing-book-meta">
                      <Stars rating={book.rating} />
                      <span className="landing-book-price">
                        ${book.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="landing-book-actions">
                      {isLoggedIn ? (
                        <Link
                          to={`/book/${book.id}`}
                          className="landing-book-btn"
                        >
                          View & Order
                        </Link>
                      ) : (
                        <Link
                          to="/login"
                          state={{ from: `/book/${book.id}` }}
                          className="landing-book-btn landing-book-btn-locked"
                        >
                          Sign in to order
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Subtle Ethos / Why Bookverse Section */}
        <section className="landing-section landing-ethos-section" id="philosophy">
          <div className="landing-section-header">
            <span className="landing-subtle-tag">THE BOOKVERSE WAY</span>
            <h2>
              Designed for tranquility, <em>built for readers</em>
            </h2>
            <p className="landing-section-sub">
              A serene layout with zero algorithmic intrusive ads, distraction-free
              browsing, and an uncompromising focus on beautiful books.
            </p>
          </div>

          <div className="landing-ethos-grid">
            <div className="landing-ethos-card">
              <span className="landing-ethos-number">01</span>
              <h3>Curation Over Clutter</h3>
              <p>
                We do not index millions of unvetted titles. Every story on our
                shelves is hand-selected for literary merit, reader enjoyment,
                and storytelling power.
              </p>
            </div>

            <div className="landing-ethos-card">
              <span className="landing-ethos-number">02</span>
              <h3>A Subtle & Tactile Layout</h3>
              <p>
                Soft parchment tones, delicate borders, and typography reminiscent
                of high-grade print book design. An interface that honors your time.
              </p>
            </div>

            <div className="landing-ethos-card">
              <span className="landing-ethos-number">03</span>
              <h3>Private & Reader-First</h3>
              <p>
                Your reading tastes belong to you. We synchronize your wishlist and
                bag securely without commercial advertising tracking or popups.
              </p>
            </div>
          </div>
        </section>

        {/* Literary Quote Section */}
        <section className="landing-quote-section">
          <blockquote className="landing-quote-box">
            <p className="landing-quote-text">
              &ldquo;I have always imagined that Paradise will be a kind of a
              library.&rdquo;
            </p>
            <cite className="landing-quote-author">— Jorge Luis Borges</cite>
          </blockquote>
        </section>

        {/* Final CTA Banner */}
        <section className="landing-cta-banner">
          <div className="landing-cta-banner-inner">
            <h2>Ready to open your next chapter?</h2>
            <p>
              Join Bookverse today. Sign in to unlock full bag features, build your
              wishlist, and receive personalized recommendations.
            </p>

            <div className="landing-cta-banner-buttons">
              {isLoggedIn ? (
                <Link
                  to="/books"
                  className="landing-btn-large landing-btn-accent"
                >
                  Enter Bookstore Now <span>→</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="landing-btn-large landing-btn-accent"
                  >
                    Sign in to Get Started <span>→</span>
                  </Link>
                  <Link
                    to="/register"
                    className="landing-btn-large landing-btn-subtle"
                  >
                    Create Free Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Subtle Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-col">
            <Link to="/" className="landing-brand">
              <span className="landing-brand-mark">b.</span>
              <span className="landing-brand-name">
                book<span>verse</span>
              </span>
            </Link>
            <p className="landing-footer-tagline">
              A quiet sanctuary for curious readers and beautiful books.
            </p>
          </div>

          <div className="landing-footer-col">
            <h5>Navigation</h5>
            <ul>
              <li><Link to="/books">Storefront</Link></li>
              <li><Link to="/books?collection=bestsellers">Bestsellers</Link></li>
              <li><Link to="/books?collection=new">New Arrivals</Link></li>
              <li><Link to="/books?collection=toprated">Top Rated</Link></li>
            </ul>
          </div>

          <div className="landing-footer-col">
            <h5>Account</h5>
            <ul>
              {isLoggedIn ? (
                <>
                  <li><Link to="/books">My Bag & Wishlist</Link></li>
                  <li><button type="button" className="landing-footer-btn" onClick={logout}>Log out</button></li>
                </>
              ) : (
                <>
                  <li><Link to="/login">Sign in</Link></li>
                  <li><Link to="/register">Create account</Link></li>
                </>
              )}
            </ul>
          </div>

          <div className="landing-footer-col">
            <h5>Legal & Trust</h5>
            <ul>
              <li><Link to="/terms">Terms & Conditions</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
            <p className="landing-footer-secure">
              <ShieldIcon size={16} /> Secure payments powered by Razorpay.
            </p>
            <small>© {new Date().getFullYear()} Bookverse. Crafted with care.</small>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
