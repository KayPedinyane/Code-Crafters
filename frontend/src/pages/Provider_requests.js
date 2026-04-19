import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

function ProviderRequests() {
  const navigate = useNavigate();

  const [newRequests, setNewRequests] = useState([]);
  const [providers, setProviders] = useState([]);
  const [rejected, setRejected] = useState([]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/provider-profile`);

        if (!res.ok) {
          const text = await res.text();
          console.error("Server returned non-JSON:", text);
          return;
        }

        const data = await res.json();

        setNewRequests(data.filter((p) => p.status === "new"));
        setProviders(data.filter((p) => p.status === "active"));
        setRejected(data.filter((p) => p.status === "rejected"));

      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchProviders();
  }, []);

  return (
    <main style={styles.page}>
      <h2 style={styles.title}>Provider Management</h2>

      <section style={styles.grid}>

        {/* NEW REQUESTS */}
        <article style={styles.column}>
          <h3 style={styles.columnTitle}>New Requests</h3>

          <ul style={styles.list}>
            {newRequests.map((req) => (
              <li key={req.id}>
                <div style={styles.itemCard}>
                  <div>
                    <strong>{req.name}</strong>
                    <p style={styles.email}>{req.email}</p>
                  </div>

                  <div style={styles.buttonRow}>
                    <button style={styles.accept}>Accept</button>
                    <button style={styles.reject}>Reject</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </article>

        {/* ACTIVE PROVIDERS */}
        <article style={styles.column}>
          <h3 style={styles.columnTitle}>Active Providers</h3>

          <ul style={styles.list}>
            {providers.map((p) => (
              <li key={p.id}>
                <div style={styles.itemCard}>
                  <strong>{p.name}</strong>
                  <small style={styles.status}>{p.status}</small>
                </div>
              </li>
            ))}
          </ul>
        </article>

        {/* REJECTED */}
        <article style={styles.column}>
          <h3 style={styles.columnTitle}>Rejected</h3>

          <ul style={styles.list}>
            {rejected.map((r) => (
              <li key={r.id}>
                <div style={styles.itemCard}>
                  <strong>{r.name}</strong>
                  <small style={{ color: "#ff5252" }}>Rejected</small>
                </div>
              </li>
            ))}
          </ul>
        </article>

      </section>

      <Outlet />
    </main>
  );
}

const styles = {
  page: {
    padding: "20px",
    color: "white",
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
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    padding: "15px",
    borderRadius: "14px",
    minHeight: "400px",
  },

  columnTitle: {
    marginBottom: "10px",
    color: "#00c853",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    paddingBottom: "8px",
  },

  list: {
    listStyle: "none",
    padding: 0,
  },

  itemCard: {
    backgroundColor: "#0a1628",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  email: {
    fontSize: "12px",
    opacity: 0.7,
    margin: 0,
  },

  buttonRow: {
    display: "flex",
    gap: "8px",
  },

  accept: {
    backgroundColor: "#00c853",
    border: "none",
    padding: "5px 10px",
    cursor: "pointer",
    color: "white",
    borderRadius: "5px",
  },

  reject: {
    backgroundColor: "#ff5252",
    border: "none",
    padding: "5px 10px",
    cursor: "pointer",
    color: "white",
    borderRadius: "5px",
  },

  status: {
    color: "#00c853",
    fontSize: "12px",
  },
};

export default ProviderRequests;