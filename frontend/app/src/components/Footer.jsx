function Footer({ onNotify, showBar = true }) {
  function subscribe(event) {
    event.preventDefault();
    event.currentTarget.reset();
    onNotify("Thanks for subscribing!");
  }

  return (
    <>
      <section className="benefit-strip">
        <div>
          <span>✦</span>
          <b>Curated with care</b>
          <small>Books chosen by real readers</small>
        </div>
        <div>
          <span>♧</span>
          <b>Free shipping</b>
          <small>On orders over $40</small>
        </div>
        <div>
          <span>♡</span>
          <b>Read, love, repeat</b>
          <small>Easy 30-day returns</small>
        </div>
      </section>

      <section className="newsletter">
        <div>
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
      </section>

      <section className="quote-banner">
        <span className="quote-mark">“</span>
        <p>
          A book is a little world you can carry
          <br />
          with you wherever you go.
        </p>
        <span className="quote-credit">— THE BOOKVERSE PROMISE</span>
      </section>

      {showBar && (
        <footer className="site-footer">
          <a className="brand" href="#top">
            <span className="brand-mark">b.</span>
            <span>
              book<span className="brand-light">verse</span>
            </span>
          </a>
          <span>Made for the love of a good story.</span>
          <span>©Shnoor 2025 Bookverse</span>
        </footer>
      )}
    </>
  );
}

export default Footer;