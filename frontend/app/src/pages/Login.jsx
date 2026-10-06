import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";
import PageLayout from "../components/PageLayout";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { useScrollLock } from "../hooks/useScrollLock";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Strictly prevent window/page scrolling while on the login page
  useScrollLock(true);

  // Additional defense: prevent touchmove/wheel on window if needed
  useEffect(() => {
    document.body.classList.add("login-no-scroll");
    document.documentElement.classList.add("login-no-scroll");

    const preventDefaultScroll = (e) => {
      // Allow internal scrolling inside the auth form if the screen is tiny, but prevent window scroll
      if (!e.target.closest(".auth-panel")) {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", preventDefaultScroll, { passive: false });
    window.addEventListener("touchmove", preventDefaultScroll, { passive: false });

    return () => {
      document.body.classList.remove("login-no-scroll");
      document.documentElement.classList.remove("login-no-scroll");
      window.removeEventListener("wheel", preventDefaultScroll);
      window.removeEventListener("touchmove", preventDefaultScroll);
    };
  }, []);

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
      login(data.token, data.user);
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

  const handleGoogleCredential = useCallback(
    async (credential) => {
      setError("");
      setLoading(true);

      try {
        const { data } = await axios.post("/api/auth/google", { credential });
        login(data.token, data.user);
        navigate(from);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Google sign-in failed. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [from, login, navigate],
  );

  return (
    <PageLayout mode="login">
      <div className="auth-page auth-page-login">
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
              Sign in to unlock full bookstore features: your personal wishlist,
              bag, personalized recommendations, and orders together.
            </p>
          </div>
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
                Sign in with your email and password to access all features.
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
              {loading ? "Signing in..." : "Sign in to Unlock Features"} <span>→</span>
            </button>

            <div className="auth-divider">
              <span>or continue with</span>
            </div>
            <GoogleSignInButton
              onCredential={handleGoogleCredential}
              onError={setError}
            />

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
