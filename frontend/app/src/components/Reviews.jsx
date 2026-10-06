import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import "./Reviews.css";

function Stars({ value }) {
  return (
    <span
      className="reviews-stars"
      role="img"
      aria-label={`${value} out of 5 stars`}
    >
      {"★".repeat(value)}
      <span>{"★".repeat(5 - value)}</span>
    </span>
  );
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Reader reviews for one book: the list, plus a form to write, edit or
// delete your own review. `onChanged` runs after a change so the page can
// refresh the book's star average.
function Reviews({ bookId, onChanged }) {
  const { token, isLoggedIn } = useAuth();
  const signedIn = isLoggedIn;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const myReview = reviews.find((review) => review.mine);

  useEffect(() => {
    let cancelled = false;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios
      .get(`/api/books/${bookId}/reviews`, { headers })
      .then(({ data }) => {
        if (cancelled) return;
        setReviews(data);

        // Fill the form with your existing review so you can edit it
        const mine = data.find((review) => review.mine);
        if (mine) {
          setRating(mine.rating);
          setComment(mine.comment);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError("Couldn't load reviews. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bookId, token]);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setNotice("");

    if (rating === 0) {
      setFormError("Please choose a star rating.");
      return;
    }

    setSaving(true);

    try {
      const { data } = await axios.post(
        `/api/books/${bookId}/reviews`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setReviews((current) =>
        current.some((review) => review.id === data.id)
          ? current.map((review) => (review.id === data.id ? data : review))
          : [data, ...current],
      );
      setNotice(
        myReview ? "Your review was updated." : "Thanks! Your review is live.",
      );
      onChanged?.();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          "Couldn't save your review. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setFormError("");
    setNotice("");
    setSaving(true);

    try {
      await axios.delete(`/api/books/${bookId}/reviews/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReviews((current) => current.filter((review) => !review.mine));
      setRating(0);
      setComment("");
      setNotice("Your review was deleted.");
      onChanged?.();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          "Couldn't delete your review. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="catalog-section reviews-section" id="reviews">
      <div className="section-heading">
        <div>
          <span className="eyebrow">READER REVIEWS</span>
          <h2>
            What readers <em>think.</em>
          </h2>
        </div>
      </div>

      <div className="reviews-layout">
        <div className="reviews-form-card">
          {signedIn ? (
            <form onSubmit={handleSubmit}>
              <h3>{myReview ? "Edit your review" : "Write a review"}</h3>

              <div className="reviews-field">
                <span id="rating-label">Your rating</span>
                <div
                  className="reviews-picker"
                  role="radiogroup"
                  aria-labelledby="rating-label"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={rating === n}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      className={n <= rating ? "on" : ""}
                      onClick={() => {
                        setRating(n);
                        setNotice("");
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <label className="reviews-field">
                <span>
                  Your thoughts <small>(optional)</small>
                </span>
                <textarea
                  value={comment}
                  onChange={(event) => {
                    setComment(event.target.value);
                    setNotice("");
                  }}
                  placeholder="What did you like or dislike about this book?"
                  rows={5}
                  maxLength={1000}
                />
                <small className="reviews-count">{comment.length}/1000</small>
              </label>

              {formError && (
                <div className="reviews-error" role="alert">
                  {formError}
                </div>
              )}
              {notice && (
                <div className="reviews-notice" role="status">
                  {notice}
                </div>
              )}

              <div className="reviews-actions">
                <button
                  className="primary-button"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : myReview
                      ? "Update review"
                      : "Post review"}{" "}
                  <span>→</span>
                </button>

                {myReview && (
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={handleDelete}
                    disabled={saving}
                  >
                    Delete
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="reviews-signin">
              <h3>Share your thoughts</h3>
              <p>Sign in to unlock reader reviews and post your feedback.</p>
              <Link
                className="primary-button"
                to="/login"
                state={{ from: `/book/${bookId}` }}
              >
                Sign in to review <span>→</span>
              </Link>
            </div>
          )}
        </div>

        <div className="reviews-list">
          {loading && <p className="reviews-empty">Loading reviews…</p>}
          {loadError && <p className="reviews-empty">{loadError}</p>}

          {!loading && !loadError && reviews.length === 0 && (
            <p className="reviews-empty">
              No reviews yet. Be the first to share what you think.
            </p>
          )}

          {reviews.map((review) => (
            <article className="reviews-item" key={review.id}>
              <header>
                <div>
                  <Stars value={review.rating} />
                  <b>{review.userName}</b>
                  {review.mine && <em className="reviews-you">You</em>}
                </div>
                <time dateTime={review.createdAt}>
                  {formatDate(review.createdAt)}
                </time>
              </header>
              {review.comment && <p>{review.comment}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Reviews;
