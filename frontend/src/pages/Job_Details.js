import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function JobDetails() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);

  // FETCH JOB
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/admin/jobs/${jobId}`)
      .then((res) => res.json())
      .then((data) => setJob(data))
      .catch((err) => console.error(err));
  }, [jobId]);

  const updateStatus = async (status) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/admin/jobs/${jobId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      setJob((prev) => ({ ...prev, status }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = () => updateStatus("approved");
  const handleReject = () => updateStatus("rejected");
  const handleUndo = () => updateStatus("pending");

  if (!job) {
    return <p>Loading job...</p>;
  }

  return (
    <main style={styles.container}>
      <article style={styles.card}>
        <header style={styles.header}>
          <h1>{job.title}</h1>
          <p>{job.location}</p>
        </header>

        <section style={styles.body}>
          <p>{job.description}</p>
          <p><strong>Provider:</strong> {job.provider}</p>
          <p><strong>Stipend:</strong> {job.stipend}</p>
          <p><strong>Status:</strong> {job.status}</p>
        </section>

        <footer style={styles.buttonContainer}>
          {/* Pending → Approve/Reject */}
          {job.status === "pending" && (
            <>
              <button style={styles.approve} onClick={handleApprove}>
                Approve
              </button>
              <button style={styles.reject} onClick={handleReject}>
                Reject
              </button>
            </>
          )}

          {/* Approved/Rejected → Undo ALWAYS visible */}
          {job.status !== "pending" && (
            <button style={styles.undo} onClick={handleUndo}>
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
    backgroundColor: "#b9c1c5",
    padding: "30px",
  },

  card: {
    width: "60%",
    backgroundColor: "white",
    borderRadius: "10px",
    overflow: "hidden",
  },

  header: {
    backgroundColor: "#0a1628",
    color: "white",
    padding: "15px",
    textAlign: "center",
  },

  body: {
    padding: "20px",
    backgroundColor: "#e1e6ee",
    textAlign: "center",
  },

  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    padding: "20px",
    backgroundColor: "#e1e6ee",
  },

  approve: {
    backgroundColor: "green",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  reject: {
    backgroundColor: "red",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  undo: {
    backgroundColor: "#f9b53f",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default JobDetails;
