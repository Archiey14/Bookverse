import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./UserMenu.css";

function UserMenu() {
  const { user, isLoggedIn, logout } = useAuth();

  if (!isLoggedIn || !user) {
    return (
      <div className="auth-nav-buttons">
        <Link className="sign-in" to="/login">
          Sign in
        </Link>
        <Link className="sign-in sign-in-register" to="/register">
          Register
        </Link>
      </div>
    );
  }

  const firstName = (user.name || "reader").split(" ")[0];

  return (
    <>
      <span className="user-greeting">
        Hi, <b>{firstName}</b>
      </span>

      {user.role === "admin" && (
        <Link className="sign-in" to="/admin">
          Admin dashboard
        </Link>
      )}

      <button className="sign-in" onClick={logout} type="button">
        Log out
      </button>
    </>
  );
}

export default UserMenu;
