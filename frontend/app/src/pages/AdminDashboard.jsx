import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import "./AdminDashboard.css";

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("bookverse-user"));
  } catch {
    return null;
  }
}

function AdminDashboard() {
  const [user] = useState(readUser);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("bookverse-token");

  useEffect(() => {
    if (!token || user?.role !== "admin") {
      setLoading(false);
      return;
    }

    let active = true;

    axios
      .get("/api/admin/overview", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data: overview }) => {
        if (active) setData(overview);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Could not load the admin dashboard.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, user]);

  const money = (paise) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format((Number(paise) || 0) / 100);

  const stats = data
    ? [
        ["Books", data.bookCount],
        ["Users", data.userCount],
        ["Orders", data.orderCount],
        ["Paid orders", data.paidOrderCount],
        ["Paid revenue", money(data.totalRevenuePaise)],
      ]
    : [];

  return (
    <PageLayout>
      <section className="admin-page">
        <Link className="page-back" to="/">
          ← Back to Bookverse
        </Link>

        <span className="eyebrow">
          <span className="eyebrow-line" />
          BEHIND THE SHELVES
        </span>
        <h1>
          Admin <em>dashboard.</em>
        </h1>

        {!token || user?.role !== "admin" ? (
          <p className="admin-message" role="alert">
            Admin access required. Sign in with an admin account.
          </p>
        ) : loading ? (
          <p className="admin-message">Loading dashboard…</p>
        ) : error ? (
          <p className="admin-message" role="alert">
            {error}
          </p>
        ) : data ? (
          <>
            <div className="admin-stats">
              {stats.map(([label, value]) => (
                <div className="admin-card admin-stat" key={label}>
                  <span>{label}</span>
                  <b>{value}</b>
                </div>
              ))}
            </div>

            <section className="admin-card">
              <h2>Low stock</h2>
              {data.lowStockBooks.length === 0 ? (
                <p>No books are low on stock.</p>
              ) : (
                <ul>
                  {data.lowStockBooks.map((book) => (
                    <li key={book.id}>
                      {book.title}: {book.stock} left (alert at{" "}
                      {book.lowStockThreshold})
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        ) : null}
      </section>
    </PageLayout>
  );
}

export default AdminDashboard;
