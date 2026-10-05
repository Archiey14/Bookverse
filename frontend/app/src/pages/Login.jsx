import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";
import PageLayout from "../components/PageLayout";
import ShelfArt from "../components/ShelfArt";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  // Pages like /book/:id send people here and expect them to come back
  const from = location.state?.from || "/";
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post("/api/auth/login", form);
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
    <PageLayout mode="login">
      <div className="auth-page">
        <aside className="auth-art">
          <div className="auth-art-copy">
            <span className="eyebrow">
              <span className="eyebrow-line" />
              WELCOME BACK
            </span>
            <h1>
              Your next chapter <em>awaits.</em>
            </h1>
            <p>
              Sign in to keep your wishlist, your bag and your orders together,
              all in one cozy place.
            </p>
          </div>

          <ShelfArt />
        </aside>

        <section className="auth-panel">
          <form className="auth-form" onSubmit={handleSubmit}>
            <Link className="auth-back" to="/">
              ← Back to home
            </Link>

            <div>
              <h2>
                Welcome <em>back.</em>
              </h2>
              <p className="auth-sub">
                Sign in with your email and password to continue.
              </p>
            </div>

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

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
                  placeholder="Your password"
                  autoComplete="current-password"
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

            <button
              className="primary-button auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"} <span>→</span>
            </button>

            <p className="auth-switch">
              New to Bookverse?{" "}
              <Link to="/register" state={location.state}>
                Create an account
              </Link>
            </p>
          </form>
        </section>
      </div>
    </PageLayout>
  );
}

export default Login;
