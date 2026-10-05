const benefits = [
  {
    title: "Curated with care",
    text: "Books chosen by real readers",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
        <path d="M19 16v4M17 18h4" />
      </svg>
    ),
  },
  {
    title: "Free shipping",
    text: "On orders over $40",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
        <circle cx="7.5" cy="17.5" r="1.8" />
        <circle cx="17.5" cy="17.5" r="1.8" />
      </svg>
    ),
  },
  {
    title: "Read, love, repeat",
    text: "Easy 30-day returns",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" />
      </svg>
    ),
  },
];

function Footer({ onNotify, showBar = true }) {
  function subscribe(event) {
    event.preventDefault();
    event.currentTarget.reset();
    onNotify("Thanks for subscribing!");
  }

  return (
    <>
      <section className="benefit-strip">
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

      <section className="newsletter">
        <div className="newsletter-card">
          <div className="newsletter-copy">
            <span className="eyebrow">NOTES FROM THE BOOKVERSE</span>
            <h2>
              Good reads, <em>good mail.</em>
            </h2>
            <p>
              New favorites, reading lists, and a little inspiration. Once a
              month, in your inbox.
            </p>
          </div>

          <form onSubmit={subscribe}>
            <input
              type="email"
              placeholder="Your email address"
              aria-label="Your email address"
              required
            />
            <button>
              Count me in <span>→</span>
            </button>
          </form>
        </div>
      </section>

      <section className="quote-banner">
        <span className="quote-mark">“</span>
        <p>A book is a little world you can carry with you wherever you go.</p>
        <span className="quote-credit">THE BOOKVERSE PROMISE</span>
      </section>

      {showBar && (
        <footer className="site-footer">
          <a className="brand" href="#top">
            <span className="brand-mark">b.</span>
            <span>
              book<span className="brand-light">verse</span>
            </span>
          </a>
          <span className="footer-tagline">Made for the love of a good story.</span>
          <span className="footer-legal">© Shnoor 2025 Bookverse</span>
        </footer>
      )}
    </>
  );
}

export default Footer;
