import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

function AdminDashBoard({ jobs }) {
  const navigate = useNavigate();

  const newJobs = jobs.filter((job) => job.status === "new");
  const approvedJobs = jobs.filter((job) => job.status === "approved");
  const rejectedJobs = jobs.filter((job) => job.status === "rejected");

  const renderJobs = (jobList) => {
    if (jobList.length === 0) return <p>No jobs</p>;

    return jobList.map((job) => (
      <div
        key={job.id}
        style={styles.card}
        onClick={() => navigate(`/job/${job.id}`)}
      >
        <div style={styles.cardHeader}>{job.title}</div>
        <div style={styles.cardBody}>
          <p>{job.location}</p>
          <p>{job.provider}</p>
          <p>{job.stipend}</p>
        </div>
      </div>
    ));
  };

  return (
    <div>
      <Header />

      <main style={styles.mainContainer}>
        <div style={styles.column}>
          <h2>New Jobs</h2>
          {renderJobs(newJobs)}
        </div>
        <div style={styles.column}>
          <h2>Approved Jobs</h2>
          {renderJobs(approvedJobs)}
        </div>
        <div style={styles.column}>
          <h2>Rejected Jobs</h2>
          {renderJobs(rejectedJobs)}
        </div>
      </main>
    </div>
  );
}

const styles = {
  mainContainer: {
    display: "flex",
    gap: "20px",
    padding: "20px",
  },
  column: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: "15px",
    borderRadius: "8px",
    minHeight: "400px",
  },
  card: {
    border: "1px solid #ccc",
    marginBottom: "10px",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: "white",
    overflow: "hidden",
  },
  cardHeader: {
    backgroundColor: "#014421", // pine green
    color: "white",
    padding: "10px",
    fontWeight: "bold",
  },
  cardBody: { padding: "10px" },
};

export default AdminDashBoard;