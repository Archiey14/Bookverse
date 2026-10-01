import { useState } from "react";
import { Link } from "react-router-dom";
import "./UserMenu.css";

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("bookverse-user"));
  } catch {
    return null;
  }
}

function UserMenu() {
  const [user, setUser] = useState(readUser);

  function logout() {
    localStorage.removeItem("bookverse-token");
    localStorage.removeItem("bookverse-user");
    setUser(null);
  }

  if (!user) {
    return (
      <Link className="sign-in" to="/login">
        Sign in
      </Link>
    );
  }

  const firstName = (user.name || "reader").split(" ")[0];

  return (
    <>
      <span className="user-greeting">
        Hi, <b>{firstName}</b>
      </span>
      <button className="sign-in" onClick={logout}>
        Log out
      </button>
    </>
  );
}

export default UserMenu;
