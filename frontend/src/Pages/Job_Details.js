import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);

  // FETCH JOB FROM DATABASE
  useEffect(() => {
    fetch(`http://localhost:5000/jobs/${jobId}`)
      .then((res) => res.json())
      .then((data) => setJob(data))
      .catch((err) => console.error(err));
  }, [jobId]);

  const handleApprove = async () => {
    try {
      await fetch(`http://localhost:5000/jobs/${jobId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "approved" }),
      });

      navigate("/admin");
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async () => {
    try {
      await fetch(`http://localhost:5000/jobs/${jobId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "rejected" }),
      });

      navigate("/admin");
    } catch (err) {
      console.error(err);
    }
  };

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
        </section>

        {job.status === "new" && (
          <footer style={styles.buttonContainer}>
            <button style={styles.approve} onClick={handleApprove}>
              Approve
            </button>
            <button style={styles.reject} onClick={handleReject}>
              Reject
            </button>
          </footer>
        )}
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
};

export default JobDetails;