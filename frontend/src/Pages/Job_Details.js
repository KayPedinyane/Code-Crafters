import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "../components/Header";

function Job_Details({ jobs, setJobs }) {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [undoJob, setUndoJob] = useState(null);

  const job = jobs.find((j) => j.id === parseInt(jobId));
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
    <div>
      <Header />
      <main style={{ padding: "20px" }}>
        <h2>{job.title}</h2>
        <p><strong>Location:</strong> {job.location}</p>
        <p><strong>Provider:</strong> {job.provider}</p>
        <p><strong>Description:</strong> {job.description}</p>
        <p><strong>Duration:</strong> {job.duration}</p>
        <p><strong>Stipend:</strong> {job.stipend}</p>
        <p><strong>Requirements:</strong> {job.requirements}</p>

        {job.status === "new" && (
          <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
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
          </div>
        )}

        {undoJob && (
          <div style={{ marginTop: "20px" }}>
            <button style={styles.undo} onClick={handleUndo}>
              Undo
            </button>
          </div>
        )}
      </main>
    </div>
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
};

export default Job_Details;