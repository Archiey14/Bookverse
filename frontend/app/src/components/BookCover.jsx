import { useState } from "react";

// Colours for the generated cover shown when Open Library has no image.
const TONES = [
  ["#17324d", "#2f6f8f"],
  ["#4a2c5a", "#a24c7c"],
  ["#22463a", "#4f9a79"],
  ["#5a2d1a", "#c07a3e"],
  ["#1f2a44", "#5a6fb0"],
  ["#5c1f2b", "#c0505e"],
];

// One book cover, everywhere on the site.
//
//   size       Open Library size: "S", "M" or "L"
//   decorative true when the cover sits next to the title (empty alt text)
//   className  extra classes for the wrapper (e.g. "book3d" for the spine look)
//
// If the image is missing, blocked or just a 1px placeholder, a designed
// fallback cover with the title and author is drawn instead of a blank box.
function BookCover({
  book = {},
  size = "L",
  decorative = false,
  priority = false,
  className = "",
}) {
  const src =
    book.cover ||
    (book.isbn
      ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-${size}.jpg`
      : "");
  const [failedSrc, setFailedSrc] = useState("");
  const failed = !src || failedSrc === src;
  const [from, to] = TONES[(Number(book.id) || 0) % TONES.length];

  return (
    <span className={`bcover ${className}`.trim()}>
      {failed ? (
        <span
          className="bcover-fallback"
          style={{ background: `linear-gradient(155deg, ${from}, ${to})` }}
          role={decorative ? undefined : "img"}
          aria-label={decorative ? undefined : `Cover of ${book.title}`}
        >
          <b aria-hidden="true">{book.title}</b>
          <small aria-hidden="true">{book.author}</small>
        </span>
      ) : (
        <img
          src={src}
          alt={decorative ? "" : `Cover of ${book.title}`}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={(event) => {
            // Open Library can answer with a 1x1 gif instead of a 404
            if (event.currentTarget.naturalWidth <= 1) setFailedSrc(src);
          }}
          onError={() => setFailedSrc(src)}
        />
      )}
    </span>
  );
}

export default BookCover;
