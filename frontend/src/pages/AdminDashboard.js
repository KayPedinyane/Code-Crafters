import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashBoard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/admin/jobs`)
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((err) => console.error("Error fetching jobs:", err));
  }, []);

  const newJobs = jobs.filter((job) => job.status === "pending");
  const approvedJobs = jobs.filter((job) => job.status === "approved");
  const rejectedJobs = jobs.filter((job) => job.status === "rejected");

  const handleClick = (id) => {
    navigate(`/admin/job/${id}`);
  };

  const renderJobs = (jobList, isClickable = false) => {
    if (!jobList.length) return <p style={styles.empty}>No jobs</p>;

    return (
      <ul style={styles.list}>
        {jobList.map((job) => (
          <li key={job.id}>
            <article
              style={{
                ...styles.card,
                cursor: isClickable ? "pointer" : "default",
              }}
              onClick={() => isClickable && handleClick(job.id)}
            >
              <header style={styles.cardHeader}>
                <h3 style={{ margin: 0 }}>{job.title}</h3>
              </header>

              <section style={styles.cardBody}>
                <p><strong>Location:</strong> {job.location}</p>
                <p><strong>Provider:</strong> {job.provider}</p>
                <p><strong>Stipend:</strong> {job.stipend}</p>
              </section>
            </article>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <main style={styles.page}>
      <h2 style={styles.title}>Admin Dashboard</h2>

      <section style={styles.grid}>
        {/* NEW JOBS */}
        <section style={styles.column}>
          <h3 style={styles.columnTitle}>New Jobs</h3>
          {renderJobs(newJobs, true)}
        </section>

        {/* APPROVED JOBS */}
        <section style={styles.column}>
          <h3 style={styles.columnTitle}>Approved Jobs</h3>
          {renderJobs(approvedJobs)}
        </section>

        {/* REJECTED JOBS */}
        <section style={styles.column}>
          <h3 style={styles.columnTitle}>Rejected Jobs</h3>
          {renderJobs(rejectedJobs)}
        </section>
      </section>
    </main>
  );
}

const styles = {
  page: {
    padding: "20px",
    color: "white",
    minHeight: "100vh",
    backgroundColor: "transparent",
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
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: "15px",
    borderRadius: "14px",
    minHeight: "400px",

    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",

    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  },

  columnTitle: {
    marginBottom: "10px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    paddingBottom: "8px",
    color: "#00c853",
  },

  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },

  card: {
    background: "#1a2742",
    marginBottom: "10px",
    borderRadius: "8px",
    overflow: "hidden",
  },

  cardHeader: {
    backgroundColor: "#0a1628",
    color: "white",
    padding: "10px",
  },

  cardBody: {
    padding: "10px",
    backgroundColor: "#16233b",
  },

  empty: {
    color: "#aaa",
    fontSize: "14px",
  },
};
export default AdminDashBoard;