import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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

  const cardStyle = {
    background: "#fff",
    border: "1px solid #e5e1dc",
    borderRadius: "12px",
    padding: "20px",
  };

  return (
    <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 20px" }}>
      <p><Link to="/">← Back to Bookverse</Link></p>
      <h1>Admin dashboard</h1>

      {!token || user?.role !== "admin" ? (
        <p role="alert">Admin access required. Sign in with an admin account.</p>
      ) : loading ? (
        <p>Loading dashboard…</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : data ? (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              margin: "24px 0",
            }}
          >
            <div style={cardStyle}><b>Books</b><p>{data.bookCount}</p></div>
            <div style={cardStyle}><b>Users</b><p>{data.userCount}</p></div>
            <div style={cardStyle}><b>Orders</b><p>{data.orderCount}</p></div>
            <div style={cardStyle}><b>Paid orders</b><p>{data.paidOrderCount}</p></div>
            <div style={cardStyle}><b>Paid revenue</b><p>{money(data.totalRevenuePaise)}</p></div>
          </div>

          <section style={cardStyle}>
            <h2>Low stock</h2>
            {data.lowStockBooks.length === 0 ? (
              <p>No books are low on stock.</p>
            ) : (
              <ul>
                {data.lowStockBooks.map((book) => (
                  <li key={book.id}>
                    {book.title}: {book.stock} left
                    (alert at {book.lowStockThreshold})
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </main>
  );
}

export default AdminDashboard;