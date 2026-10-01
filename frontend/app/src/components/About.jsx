function About() {
  return (
    <section className="about-section" id="about">
      <div className="about-copy">
        <span className="eyebrow">
          <span className="eyebrow-line" />
          OUR STORY
        </span>

        <h2>
          Made for the love of <em>a good story.</em>
        </h2>

        <p>
          Bookverse began with a simple belief: the right book at the right
          moment can change your week, or even your year. We wanted a place
          that feels more like a favorite shelf than a warehouse.
        </p>

        <p>
          That is why our collection stays small and hand-picked. Every title
          is chosen because a real reader would press it into a friend&rsquo;s
          hands and say, &ldquo;you have to read this.&rdquo;
        </p>
      </div>

      <div className="about-values">
        <div>
          <b>Curated, not crowded</b>
          <small>A thoughtful shelf instead of an endless scroll.</small>
        </div>
        <div>
          <b>Readers first</b>
          <small>Honest ratings and reviews from people who finished the book.</small>
        </div>
        <div>
          <b>Delivered with care</b>
          <small>Packed gently and shipped in 1&ndash;2 days.</small>
        </div>
      </div>
    </section>
  );
}

export default About;
