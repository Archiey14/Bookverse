// Five stars filled to the book's rating (4.6 -> 92% filled), done with CSS so
// partial stars look right at any size.
function Stars({ value = 0, count }) {
  const rating = Math.max(0, Math.min(5, Number(value) || 0));

  return (
    <span className="stars-row">
      <span
        className="stars"
        role="img"
        aria-label={`Rated ${rating.toFixed(1)} out of 5`}
      >
        <span className="stars-fill" style={{ width: `${(rating / 5) * 100}%` }}>
          ★★★★★
        </span>
        <span aria-hidden="true">★★★★★</span>
      </span>
      <span className="stars-value">{rating.toFixed(1)}</span>
      {typeof count === "number" && (
        <span className="stars-count">({count.toLocaleString()})</span>
      )}
    </span>
  );
}

export default Stars;
