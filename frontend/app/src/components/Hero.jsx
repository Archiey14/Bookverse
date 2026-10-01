function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <span className="eyebrow">
          <span className="eyebrow-line" />
          YOUR NEXT CHAPTER STARTS HERE
        </span>

        <h1>
          Stories worth
          <br />
          staying <em>up for.</em>
        </h1>

        <p>
          Find your next can’t-put-it-down. Thoughtful reads, handpicked for
          curious minds.
        </p>

        <a className="primary-button" href="#catalog">
          Explore the collection <span>→</span>
        </a>

        <div className="reader-note">
          <span className="reader-spark">✦</span>
          <span>
            <b>Loved by readers</b>
            <br />
            A little joy in every delivery
          </span>
        </div>
      </div>

      <div className="hero-art" aria-label="Illustration of a featured book">
        <div className="sun-disc" />
        <div className="plant plant-one">✳</div>
        <div className="plant plant-two">✳</div>

        <div className="book-stack">
          <span />
          <span />
          <span />
        </div>

        <div className="hero-book">
          <small>THE ART OF</small>
          <strong>
            BEGINNING
            <br />
            AGAIN
          </strong>
          <i>a story for the in-between</i>
        </div>

        <div className="hero-caption">
          A good book
          <br />
          changes everything.
        </div>
      </div>

      <div className="hero-index">
        01 <span /> 04
      </div>
    </section>
  );
}

export default Hero;