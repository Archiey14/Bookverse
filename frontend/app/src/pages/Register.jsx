import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  // Pages like /book/:id send people here and expect them to come back
  const from = location.state?.from || "/";
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post("/api/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("bookverse-token", data.token);
      localStorage.setItem("bookverse-user", JSON.stringify(data.user));
      navigate(from);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <aside className="auth-art">
        <Link className="brand" to="/" aria-label="Bookverse home">
          <span className="brand-mark">b.</span>
          <span>
            book<span className="brand-light">verse</span>
          </span>
        </Link>

        <div className="auth-art-copy">
          <span className="eyebrow">
            <span className="eyebrow-line" />
            JOIN THE BOOKVERSE
          </span>
          <h1>
            Start your reading <em>journey.</em>
          </h1>
          <p>
            Create a free account to save your favorite books, build a
            wishlist and track every order.
          </p>
        </div>

        <div className="hero-art">
          <span className="plant plant-one">✳</span>
          <span className="plant plant-two">✳</span>
          <span className="sun-disc" />
          <div className="hero-book">
            <small>THE ART OF</small>
            <strong>BEGINNING AGAIN</strong>
            <i>a story for the in-between</i>
          </div>
          <div className="book-stack">
            <span />
            <span />
            <span />
          </div>
        </div>

        <p className="auth-quote">A good book changes everything.</p>
      </aside>

      <main className="auth-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <Link className="brand auth-mobile-brand" to="/">
            <span className="brand-mark">b.</span>
            <span>
              book<span className="brand-light">verse</span>
            </span>
          </Link>

          <Link className="auth-back" to="/">
            ← Back to home
          </Link>

          <div>
            <h2>
              Create your <em>account.</em>
            </h2>
            <p className="auth-sub">
              It only takes a minute. Your next favorite book is waiting.
            </p>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <label>
            Full name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              autoComplete="name"
              required
            />
          </label>

          <label>
            Email address
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <div className="auth-password">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <label>
            Confirm password
            <input
              type={showPassword ? "text" : "password"}
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              placeholder="Type your password again"
              autoComplete="new-password"
              required
            />
          </label>

          <button
            className="primary-button auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"} <span>→</span>
          </button>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login" state={location.state}>
              Sign in
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}

export default Register;
