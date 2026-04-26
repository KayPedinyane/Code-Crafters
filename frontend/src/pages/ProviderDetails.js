import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function ProviderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);

  // ======================
  // FETCH PROVIDER
  // ======================
  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/provider-profile/${id}`
        );

        if (!res.ok) throw new Error("Failed to fetch provider");

        const data = await res.json();
        setProvider(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProvider();
  }, [id]);

  // ======================
  // UPDATE STATUS
  // ======================
  const updateStatus = async (status) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/provider-profile/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) throw new Error("Update failed");

      navigate("/requests");
    } catch (err) {
      console.error(err);
    }
  };

  if (!provider) {
    return <p style={{ color: "white" }}>Loading...</p>;
  }

  const status = provider.status?.toLowerCase();

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h2 style={styles.title}>Provider Details</h2>

        <section style={styles.grid}>
          <p><b>Email:</b> {provider.email}</p>
          <p><b>Company:</b> {provider.company_name}</p>
          <p><b>Contact Person:</b> {provider.contact_person}</p>
          <p><b>Phone:</b> {provider.phone}</p>
          <p><b>Industry:</b> {provider.industry}</p>
          <p><b>Website:</b> {provider.website}</p>
          <p><b>Address:</b> {provider.address}</p>
          <p><b>Province:</b> {provider.province}</p>
          <p><b>Status:</b> {provider.status}</p>
        </section>

        <section style={styles.actions}>
          {/* For NEW providers show Accept + Reject */}
          {status === "new" && (
            <>
              <button
                onClick={() => updateStatus("accepted")}
                style={styles.accept}
              >
                Accept
              </button>

              <button
                onClick={() => updateStatus("rejected")}
                style={styles.reject}
              >
                Reject
              </button>
            </>
          )}

          {/* For Accepted or Rejected show Undo */}
          {(status === "accepted" || status === "rejected") && (
            <button
              onClick={() => updateStatus("new")}
              style={styles.undo}
            >
              Undo Request
            </button>
          )}
        </section>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    color: "white",
    backgroundImage: "url('/Admin_images/admin_pic3.jpeg')",
  },

  card: {
    width: "650px",
    padding: "25px",
    borderRadius: "14px",
    backgroundColor: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  },

  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#00c853",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "20px",
  },

  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },

  accept: {
    flex: 1,
    backgroundColor: "#00c853",
    border: "none",
    padding: "12px",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  reject: {
    flex: 1,
    backgroundColor: "#ff5252",
    border: "none",
    padding: "12px",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  undo: {
    width: "100%",
    backgroundColor: "#ffb300",
    border: "none",
    padding: "12px",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default ProviderDetails;