import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

function ProviderRequests() {
  const navigate = useNavigate();

  // Sample data (replace with API later)
  const [newRequests, setNewRequests] = useState([
    { id: 1, name: "Provider A", email: "a@email.com" },
    { id: 2, name: "Provider B", email: "b@email.com" },
    { id: 3, name: "Provider C", email: "c@email.com" },
  ]);

  const [providers, setProviders] = useState([
    { id: 4, name: "Provider X", status: "Active" },
    { id: 5, name: "Provider Y", status: "Active" },
  ]);

  const [rejected, setRejected] = useState([
    { id: 6, name: "Provider Z", reason: "Incomplete documents" },
  ]);

  // ✅ Move request to ACCEPTED
  const handleApprove = (req) => {
    setNewRequests((prev) => prev.filter((r) => r.id !== req.id));

    setProviders((prev) => [
      ...prev,
      { id: req.id, name: req.name, status: "Active" },
    ]);
  };

  // ❌ Move request to REJECTED
  const handleReject = (req) => {
    setNewRequests((prev) => prev.filter((r) => r.id !== req.id));

    setRejected((prev) => [
      ...prev,
      { id: req.id, name: req.name, reason: "Rejected by admin" },
    ]);
  };

  return (
    <>
      <main style={styles.page}>
        <h2 style={styles.title}>Provider Management</h2>

        <section style={styles.grid}>
          {/* NEW REQUESTS */}
          <article style={styles.column}>
            <h3 style={styles.columnTitle}>New Requests</h3>

            <ul style={styles.list}>
              {newRequests.map((req) => (
                <li key={req.id}>
                  <button
                    style={styles.itemButton}
                    onClick={() => navigate(`/providers/${req.id}`)} // ✅ ONLY CHANGE HERE
                  >
                    <strong>{req.name}</strong>
                    <small>{req.email}</small>
                  </button>
                </li>
              ))}
            </ul>
          </article>

          {/* EXISTING PROVIDERS */}
          <article style={styles.column}>
            <h3 style={styles.columnTitle}>Existing Providers</h3>

            <ul style={styles.list}>
              {providers.map((p) => (
                <li key={p.id} style={styles.card}>
                  <strong>{p.name}</strong>
                  <p style={styles.status}>{p.status}</p>
                </li>
              ))}
            </ul>
          </article>

          {/* REJECTED */}
          <article style={styles.column}>
            <h3 style={styles.columnTitle}>Rejected Requests</h3>

            <ul style={styles.list}>
              {rejected.map((r) => (
                <li key={r.id} style={styles.cardRejected}>
                  <strong>{r.name}</strong>
                  <p style={styles.reason}>{r.reason}</p>
                </li>
              ))}
            </ul>
          </article>
        </section>

        {/* preview panel (kept but NOT required anymore) */}
        <Outlet />
      </main>
    </>
  );
}

const styles = {
  page: {
    padding: "20px",
    color: "white",
    backgroundColor: "transparent",
    minHeight: "100vh",
  },

  title: {
    marginBottom: "20px",
    textAlign: "center",
    color: "#00c853",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "20px",
  },

  column: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: "15px",
    borderRadius: "14px",
    minHeight: "400px",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  },

  columnTitle: {
    marginBottom: "10px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    paddingBottom: "8px",
    color: "#00c853",
  },

  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },

  itemButton: {
    width: "100%",
    backgroundColor: "#0a1628",
    border: "none",
    color: "white",
    padding: "10px",
    marginBottom: "10px",
    textAlign: "left",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
  },

  card: {
    backgroundColor: "#0a1628",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "6px",
  },

  status: {
    color: "#00c853",
    fontSize: "12px",
  },

  cardRejected: {
    backgroundColor: "#0a1628",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "6px",
  },

  reason: {
    color: "#ff5252",
    fontSize: "12px",
  },
};

export default ProviderRequests;