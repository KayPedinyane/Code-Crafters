import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);

  // FETCH JOB
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/admin/jobs/${jobId}`)
      .then((res) => res.json())
      .then((data) => setJob(data))
      .catch((err) => console.error(err));
  }, [jobId]);

  // UPDATE STATUS
  const updateStatus = async (status) => {
    try {
      await fetch(
        `${process.env.REACT_APP_API_URL}/admin/jobs/${jobId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      setJob((prev) => ({ ...prev, status }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = () => updateStatus("approved");
  const handleReject = () => updateStatus("rejected");
  const handleUndo = () => updateStatus("pending");

  if (!job) {
    return <p style={{ color: "white" }}>Loading job...</p>;
  }

  return (
    <main style={styles.container}>
      <button style={styles.backButton} onClick={() => navigate("/admin")}>← Back</button>
      <article style={styles.card}>

        {/* HEADER */}
        <header style={styles.header}>
          <h1 style={styles.heading}>{job.title}</h1>

          <p style={styles.subHeading}>
            {job.location}
          </p>
        </header>

        {/* BODY */}
        <section style={styles.body}>
          <div style={styles.grid}>

            <div style={styles.infoCardFull}>
              <strong>Description</strong>
              <span>{job.description}</span>
            </div>

            <div style={styles.infoCard}>
              <strong>Provider</strong>
              <span>{job.provider}</span>
            </div>

            <div style={styles.infoCard}>
              <strong>Location</strong>
              <span>{job.location}</span>
            </div>

            <div style={styles.infoCard}>
              <strong>Stipend</strong>
              <span>{job.stipend}</span>
            </div>

            <div style={styles.infoCard}>
              <strong>Status</strong>
              <span>{job.status}</span>
            </div>

          </div>
        </section>

        {/* FOOTER */}
        <footer style={styles.buttonContainer}>

          {/* Pending */}
          {job.status === "pending" && (
            <>
              <button
                style={styles.approve}
                onClick={handleApprove}
              >
                Approve
              </button>

              <button
                style={styles.reject}
                onClick={handleReject}
              >
                Reject
              </button>
            </>
          )}

          {/* Approved / Rejected */}
          {job.status !== "pending" && (
            <button
              style={styles.undo}
              onClick={handleUndo}
            >
              Undo
            </button>
          )}

        </footer>
      </article>
    </main>
  );
}

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

    backgroundColor:  "#0a1628",
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

    backgroundColor:  "#0a1628",
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

  approve: {
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

export default JobDetails;