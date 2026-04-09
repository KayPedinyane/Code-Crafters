import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import Header from "../components/Header";

function Job_Details({ jobs, setJobs }) {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [undoJob, setUndoJob] = useState(null);

  const job = useMemo(() => {
    return jobs.find((j) => j.id === parseInt(jobId));
  }, [jobs, jobId]);

  if (!job) return <p>Job not found</p>;

  const handleStatusChange = (status) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, status } : j))
    );
    setUndoJob({ id: job.id, prevStatus: job.status });
  };

  const handleUndo = () => {
    if (!undoJob) return;
    setJobs((prev) =>
      prev.map((j) =>
        j.id === undoJob.id ? { ...j, status: undoJob.prevStatus } : j
      )
    );
    setUndoJob(null);
  };

  return (
    <>
      <Header />

      <main style={styles.page}>
        <article style={styles.container}>
          <header>
            <h2>{job.title}</h2>
          </header>

          <section>
            <p><strong>Location:</strong> {job.location}</p>
            <p><strong>Provider:</strong> {job.provider}</p>
            <p><strong>Description:</strong> {job.description}</p>
            <p><strong>Duration:</strong> {job.duration}</p>
            <p><strong>Stipend:</strong> {job.stipend}</p>
            <p><strong>Requirements:</strong> {job.requirements}</p>
          </section>

          {job.status === "new" && (
            <section
              style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <button
                style={styles.approve}
                onClick={() => handleStatusChange("approved")}
              >
                Approve
              </button>
              <button
                style={styles.reject}
                onClick={() => handleStatusChange("rejected")}
              >
                Reject
              </button>
            </section>
          )}

          {undoJob && (
            <section style={{ marginTop: "20px" }}>
              <button style={styles.undo} onClick={handleUndo}>
                Undo
              </button>
            </section>
          )}
        </article>
      </main>
    </>
  );
}

const styles = {
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
    backgroundColor: "orange",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
    backgroundColor: "#d7dde0",
  },
  page: {
    backgroundColor: "#b9c1c5",
    minHeight: "100vh",
    padding: "20px",
  },
};

export default Job_Details;