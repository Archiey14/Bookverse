import { useEffect, useMemo, useState } from "react";
import { compareNewest, compareRating } from "../utils/collections";
import BookCover from "./BookCover";
import Chevron from "./Chevron";

// The big rotating banner. Each slide promotes one collection and shows
// three covers picked from your catalog. Slides advance every 6 seconds,
// pause on hover/focus, and do not auto-play for people who prefer reduced
// motion.
const SLIDES = [
  {
    id: "bestsellers",
    theme: "banner-amber",
    eyebrow: "Bestsellers",
    title: "The books everyone is talking about",
    text: "Our most-loved titles, chosen by thousands of readers.",
    cta: "Shop bestsellers",
    target: "bestsellers",
  },
  {
    id: "new",
    theme: "banner-sage",
    eyebrow: "New arrivals",
    title: "Fresh on the shelves this month",
    text: "The latest additions to the BookVerse collection.",
    cta: "See new arrivals",
    target: "new",
  },
  {
    id: "toprated",
    theme: "banner-sky",
    eyebrow: "Top rated",
    title: "Reader favorites, rated the highest",
    text: "Start with the books readers rate best of all.",
    cta: "See top rated",
    target: "toprated",
  },
];

function Hero({ books = [], onNavigate }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides = useMemo(() => {
    const picks = {
      bestsellers: books
        .filter((book) => book.bestseller)
        .sort((a, b) => (b.reviews || 0) - (a.reviews || 0)),
      new: [...books].sort(compareNewest),
      toprated: [...books].sort(compareRating),
    };

    return SLIDES.map((slide) => ({
      ...slide,
      books: (picks[slide.id] ?? []).slice(0, 3),
    }));
  }, [books]);

  useEffect(() => {
    if (paused) return undefined;

    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return undefined;

    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % SLIDES.length),
      6000,
    );

    return () => window.clearInterval(timer);
  }, [paused, index]);

  function step(direction) {
    setIndex((current) => (current + direction + SLIDES.length) % SLIDES.length);
  }

  return (
    <section
      className="banner-section"
      id="top"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <h1 className="sr-only">BookVerse online bookstore</h1>

      <div className="banner">
        <div
          className="banner-track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, slideIndex) => (
            <div
              key={slide.id}
              className={`banner-slide ${slide.theme}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${slideIndex + 1} of ${slides.length}`}
              aria-hidden={slideIndex !== index}
              inert={slideIndex !== index}
            >
              <div className="banner-copy">
                <span className="eyebrow">{slide.eyebrow}</span>
                <h2>{slide.title}</h2>
                <p>{slide.text}</p>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => onNavigate(slide.target)}
                >
                  {slide.cta} <span aria-hidden="true">→</span>
                </button>
              </div>

              <div className="banner-covers" aria-hidden="true">
                {slide.books.map((book) => (
                  <span className="banner-cover" key={book.id}>
                    <BookCover book={book} size="L" decorative className="book3d" />
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="banner-arrow banner-arrow-prev"
          onClick={() => step(-1)}
          aria-label="Previous slide"
        >
          <Chevron direction="left" />
        </button>
        <button
          type="button"
          className="banner-arrow banner-arrow-next"
          onClick={() => step(1)}
          aria-label="Next slide"
        >
          <Chevron direction="right" />
        </button>

        <div className="banner-dots">
          {slides.map((slide, slideIndex) => (
            <button
              type="button"
              key={slide.id}
              className={slideIndex === index ? "active" : ""}
              onClick={() => setIndex(slideIndex)}
              aria-label={`Go to slide ${slideIndex + 1}`}
              aria-current={slideIndex === index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;
