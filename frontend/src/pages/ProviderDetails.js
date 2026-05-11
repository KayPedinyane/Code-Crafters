import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function ProviderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [toast, setToast] = useState("");

  // ======================
  // TOAST
  // ======================
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

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
        showToast("Failed to load provider");
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

      let message = "";

      if (status === "accepted") {
        message = "Provider accepted successfully";
      } else if (status === "rejected") {
        message = "Provider rejected successfully";
      } else if (status === "new") {
        message = "Moved back to new requests";
      }

      showToast(message);

      setTimeout(() => {
        navigate("/requests");
      }, 2600);

    } catch (err) {
      console.error(err);
      showToast("Something went wrong");
    }
  };

  if (!provider) {
    return <p style={{ color: "white" }}>Loading...</p>;
  }

  const status = provider.status?.toLowerCase();

  return (
    <main style={styles.container}>

      {/* TOAST */}
      {toast && <div style={styles.toast}>{toast}</div>}
      <button style={styles.backButton} onClick={() => navigate("/requests")}>← Back</button>
      <article style={styles.card}>

        {/* HEADER */}
        <header style={styles.header}>
          <h1 style={styles.heading}>
            {provider.company_name}
          </h1>

          <p style={styles.subHeading}>
            {provider.industry}
          </p>
        </header>

        {/* BODY */}
        <section style={styles.body}>
          <div style={styles.grid}>
            <div style={styles.infoCard}>
              <strong>Email</strong>
              <span>{provider.email}</span>
            </div>

            <div style={styles.infoCard}>
              <strong>Contact Person</strong>
              <span>{provider.contact_person}</span>
            </div>

            <div style={styles.infoCard}>
              <strong>Phone</strong>
              <span>{provider.phone}</span>
            </div>

            <div style={styles.infoCard}>
              <strong>Website</strong>
              <span>{provider.website}</span>
            </div>

            <div style={styles.infoCard}>
              <strong>Address</strong>
              <span>{provider.address}</span>
            </div>

            <div style={styles.infoCard}>
              <strong>Province</strong>
              <span>{provider.province}</span>
            </div>

            <div style={styles.infoCardFull}>
              <strong>Status</strong>
              <span>{provider.status}</span>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={styles.buttonContainer}>

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

          {(status === "accepted" || status === "rejected") && (
            <button
              onClick={() => updateStatus("new")}
              style={styles.undo}
            >
              Undo Request
            </button>
          )}
        </footer>

      </article>
    </main>
  );
}

// ======================
// STYLES
// ======================
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundImage: "url('/Admin_images/admin_pic3.jpeg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    padding: "30px",
  },

  card: {
    width: "65%",
    maxWidth: "900px",
    borderRadius: "12px",
    overflow: "hidden",

    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",

    border: "1px solid rgba(255,255,255,0.25)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    color: "white",
  },

  header: {
    backgroundColor: "#0a1628",
    color: "white",
    padding: "22px",
    textAlign: "center",
  },

  heading: {
    margin: 0,
    fontSize: "2rem",
  },

  subHeading: {
    marginTop: "8px",
    color: "#00c853",
    fontSize: "1rem",
  },

  body: {
    padding: "30px",

    background: "rgba(255, 255, 255, 0.08)",

    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",

    borderTop: "1px solid rgba(255,255,255,0.1)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
  },

infoCard: {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  padding: "15px",
  borderRadius: "10px",

  backgroundColor: "#0a1628",
  color: "white",

  border: "1px solid rgba(255,255,255,0.15)",
},

infoCardFull: {
  gridColumn: "1 / span 2",
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  padding: "15px",
  borderRadius: "10px",
  textAlign: "center",
  backgroundColor: "#0a1628",
  color: "white",

  border: "1px solid rgba(255,255,255,0.15)",
},

  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    padding: "20px",

    background: "rgba(255, 255, 255, 0.08)",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },

  accept: {
    backgroundColor: "green",
    color: "white",
    padding: "10px 22px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  reject: {
    backgroundColor: "red",
    color: "white",
    padding: "10px 22px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  undo: {
    backgroundColor: "#f9b53f",
    color: "white",
    padding: "10px 22px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  toast: {
    position: "fixed",
    top: "20px",
    right: "20px",
    backgroundColor: "#00c853",
    color: "white",
    padding: "12px 16px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    zIndex: 9999,
    fontWeight: "bold",
  },

  backButton: {
    position: "absolute",
    top: "20px",
    left: "20px",
    backgroundColor: "rgba(0,0,0,0.5)",
    color: "white",
    border: "none",
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default ProviderDetails;