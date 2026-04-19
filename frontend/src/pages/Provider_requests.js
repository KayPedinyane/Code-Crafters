import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

function ProviderRequests() {
  const navigate = useNavigate();

  const [newRequests, setNewRequests] = useState([]);
  const [providers, setProviders] = useState([]);
  const [rejected, setRejected] = useState([]);

  // Fetch data from backend
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await fetch("http://localhost:5000/providers");

        if (!res.ok) {
          const text = await res.text();
          console.error("Server returned non-JSON:", text);
          return;
        }

        const data = await res.json();

        // Split by status
        setNewRequests(data.filter((p) => p.status === "Pending"));
        setProviders(data.filter((p) => p.status === "Active"));
        setRejected(data.filter((p) => p.status === "Rejected"));
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchProviders();
  }, []);

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
                    onClick={() => navigate(`/providers/${req.id}`)}
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
                <li key={p.id}>
                  <button
                    style={styles.itemButton}
                    onClick={() => navigate(`/providers/${p.id}`)}
                  >
                    <strong>{p.name}</strong>
                    <small style={styles.status}>{p.status}</small>
                  </button>
                </li>
              ))}
            </ul>
          </article>

          {/* REJECTED */}
          <article style={styles.column}>
            <h3 style={styles.columnTitle}>Rejected Requests</h3>

            <ul style={styles.list}>
              {rejected.map((r) => (
                <li key={r.id}>
                  <button
                    style={styles.itemButton}
                    onClick={() => navigate(`/providers/${r.id}`)}
                  >
                    <strong>{r.name}</strong>
                    <small style={styles.reason}>
                      {r.reason || "Rejected"}
                    </small>
                  </button>
                </li>
              ))}
            </ul>
          </article>

        </section>

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

  status: {
    color: "#00c853",
    fontSize: "12px",
  },

  reason: {
    color: "#ff5252",
    fontSize: "12px",
  },
};

export default ProviderRequests;