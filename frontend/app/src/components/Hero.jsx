const spines = [
  { w: 34, h: 168, color: "#7b2d26" },
  { w: 44, h: 204, color: "#2f5d62" },
  { w: 30, h: 146, color: "#e8a33d" },
  { w: 46, h: 188, color: "#4a3b6b" },
  { w: 36, h: 214, color: "#a63d40" },
  { w: 32, h: 158, color: "#5f7d5b" },
  { w: 42, h: 196, color: "#c98622" },
  { w: 36, h: 176, color: "#3c6e8f" },
  { w: 30, h: 208, color: "#6b3f2a" },
];

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <h1>Stories worth staying up for.</h1>

        <p>
          Hand-picked books for curious readers, from page-turners to quiet
          favorites. Find your next one on the shelves below.
        </p>

        <a className="primary-button" href="#catalog">
          Browse the shelves
        </a>
      </div>

      <div className="hero-shelf" aria-hidden="true">
        <div className="spines">
          {spines.map((spine, index) => (
            <span
              key={index}
              style={{
                flex: spine.w,
                height: spine.h,
                background: spine.color,
              }}
            />
          ))}
        </div>
        <div className="board" />
      </div>
    </section>
  );
}

export default Hero;
