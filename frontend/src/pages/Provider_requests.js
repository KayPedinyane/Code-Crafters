import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ProviderRequests() {
  const navigate = useNavigate();

  const [newRequests, setNewRequests] = useState([]);
  const [activeProviders, setActiveProviders] = useState([]);
  const [rejectedProviders, setRejectedProviders] = useState([]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/provider-profile`
        );

        const data = await res.json();

        // safety check (prevents filter crash)
        if (!Array.isArray(data)) {
          console.error("Expected array but got:", data);
          return;
        }

        setNewRequests(
          data.filter((p) => p.status?.toLowerCase() === "new")
        );

        setActiveProviders(
          data.filter((p) => p.status?.toLowerCase() === "accepted")
        );

        setRejectedProviders(
          data.filter((p) => p.status?.toLowerCase() === "rejected")
        );
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchProviders();
  }, []);

  const ProviderCard = ({ provider }) => (
    <li>
      <div
        style={styles.card}
        onClick={() => navigate(`/providers/${provider.id}`)}
      >
        <strong>{provider.name}</strong>
        <small style={styles.email}>{provider.email}</small>
      </div>
    </li>
  );

  return (
    <main style={styles.page}>
      <h2 style={styles.title}>Provider Management</h2>

      <section style={styles.grid}>
        {/* NEW REQUESTS */}
        <article style={styles.column}>
          <h3 style={styles.columnTitle}>New Requests</h3>

          <ul style={styles.list}>
            {newRequests.length === 0 ? (
              <p style={styles.empty}>No new requests</p>
            ) : (
              newRequests.map((p) => (
                <ProviderCard key={p.id} provider={p} />
              ))
            )}
          </ul>
        </article>

        {/* Accepted */}
        <article style={styles.column}>
          <h3 style={styles.columnTitle}>Active Providers</h3>

          <ul style={styles.list}>
            {activeProviders.length === 0 ? (
              <p style={styles.empty}>No active providers</p>
            ) : (
              activeProviders.map((p) => (
                <ProviderCard key={p.id} provider={p} />
              ))
            )}
          </ul>
        </article>

        {/* REJECTED */}
        <article style={styles.column}>
          <h3 style={styles.columnTitle}>Rejected Providers</h3>

          <ul style={styles.list}>
            {rejectedProviders.length === 0 ? (
              <p style={styles.empty}>No rejected providers</p>
            ) : (
              rejectedProviders.map((p) => (
                <ProviderCard key={p.id} provider={p} />
              ))
            )}
          </ul>
        </article>
      </section>
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
    textAlign: "center",
    color: "#00c853",
    marginBottom: "20px",
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

  card: {
    backgroundColor: "#0a1628",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "10px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
  },

  email: {
    fontSize: "12px",
    opacity: 0.7,
  },

  empty: {
    color: "#aaa",
    fontSize: "14px",
  },
};

export default ProviderRequests;