import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ReturnIcon, ShieldIcon, SparkIcon, TruckIcon } from "./Icons";
import { BUDGET_LIMIT } from "../utils/collections";
import { shopPath } from "../utils/shopLinks";

const benefits = [
  {
    title: "Curated with care",
    text: "Books chosen by real readers",
    icon: <SparkIcon size={22} />,
  },
  {
    title: "Free shipping",
    text: "On orders over $40",
    icon: <TruckIcon size={22} />,
  },
  {
    title: "Easy returns",
    text: "Hassle-free 30-day returns",
    icon: <ReturnIcon size={22} />,
  },
  {
    title: "Secure checkout",
    text: "Payments handled by Razorpay",
    icon: <ShieldIcon size={22} />,
  },
];

const SHOP_LINKS = [
  ["Bestsellers", { collection: "bestsellers" }],
  ["New arrivals", { collection: "new" }],
  ["Top rated", { collection: "toprated" }],
  [`Under $${BUDGET_LIMIT}`, { collection: "budget" }],
  ["Hardcover editions", { collection: "hardcover" }],
  ["Quick reads", { collection: "short" }],
];

// Benefits strip, newsletter, link columns and the legal bar.
//
//   categories   category names for the "Browse" column (optional)
//   onOpenPanel  opens the bag / wishlist / orders panel (optional)
//   showBar      false hides the bottom legal bar
function Footer({ onNotify, onOpenPanel, categories = [], showBar = true }) {
  const topCategories = useMemo(() => categories.slice(0, 7), [categories]);

  function subscribe(event) {
    event.preventDefault();
    event.currentTarget.reset();
    onNotify?.("Thanks for subscribing!");
  }

  return (
    <>
      <section className="benefit-strip" aria-label="Why shop with us">
        {benefits.map((item) => (
          <div className="benefit" key={item.title}>
            <span className="benefit-icon">{item.icon}</span>
            <div className="benefit-text">
              <b>{item.title}</b>
              <small>{item.text}</small>
            </div>
          </div>
        ))}
      </section>

      <footer className="sf-footer">
        <div className="sf-footer-top">
          <div className="sf-newsletter">
            <h2>Good reads, good mail.</h2>
            <p>
              New favorites and reading lists, once a month. No spam, ever.
            </p>
            <form onSubmit={subscribe}>
              <input
                type="email"
                placeholder="Your email address"
                aria-label="Your email address"
                required
              />
              <button type="submit">Subscribe</button>
            </form>
          </div>

          <div className="sf-footer-cols">
            <nav aria-label="Shop">
              <h3>Shop</h3>
              <ul>
                {SHOP_LINKS.map(([label, values]) => (
                  <li key={label}>
                    <Link to={shopPath(values)}>{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>

            {topCategories.length > 0 && (
              <nav aria-label="Browse by category">
                <h3>Browse</h3>
                <ul>
                  {topCategories.map((name) => (
                    <li key={name}>
                      <Link to={shopPath({ category: name })}>{name}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <nav aria-label="Your account">
              <h3>Your account</h3>
              <ul>
                <li>
                  <Link to="/login">Sign in</Link>
                </li>
                <li>
                  <Link to="/register">Create account</Link>
                </li>
                {onOpenPanel && (
                  <>
                    <li>
                      <button type="button" onClick={() => onOpenPanel("cart")}>
                        Your bag
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => onOpenPanel("wishlist")}>
                        Wishlist
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => onOpenPanel("orders")}>
                        Your orders
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </div>
        </div>

        {showBar && (
          <div className="sf-footer-bar">
            <Link className="sf-logo" to="/" aria-label="BookVerse home">
              <span className="sf-logo-mark">b.</span>
              <span className="sf-logo-text">
                book<span>verse</span>
              </span>
            </Link>
            <span>Made for the love of a good story.</span>
            <span>© Shnoor {new Date().getFullYear()} Bookverse</span>
          </div>
        )}
      </footer>
    </>
  );
}

export default Footer;
