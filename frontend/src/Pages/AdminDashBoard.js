import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

function AdminDashBoard({ jobs }) {
  const navigate = useNavigate();

  const newJobs = jobs.filter((job) => job.status === "new");
  const approvedJobs = jobs.filter((job) => job.status === "approved");
  const rejectedJobs = jobs.filter((job) => job.status === "rejected");

  const handleClick = (id) => {
    navigate(`/job/${id}`);
  };

  const renderJobs = (jobList) => {
    if (jobList.length === 0) return <p>No jobs</p>;

    return jobList.map((job) => (
      <article
        key={job.id}
        style={styles.card}
        onClick={() => handleClick(job.id)}
      >
        <header style={styles.cardHeader}>
          <h3 style={{ margin: 0 }}>{job.title}</h3>
        </header>

        <section style={styles.cardBody}>
          <p>{job.location}</p>
          <p>{job.provider}</p>
          <p>{job.stipend}</p>
        </section>
      </article>
    ));
  };

  return (
    <>
      <Header />

      <main style={styles.mainContainer}>
        <section style={styles.column}>
          <h2>New Jobs</h2>
          {renderJobs(newJobs)}
        </section>

        <section style={styles.column}>
          <h2>Approved Jobs</h2>
          {renderJobs(approvedJobs)}
        </section>

        <section style={styles.column}>
          <h2>Rejected Jobs</h2>
          {renderJobs(rejectedJobs)}
        </section>
      </main>
    </>
  );
}

const styles = {
  mainContainer: {
    display: "flex",
    gap: "20px",
    padding: "20px",
    backgroundColor: "#b9c1c5",
  },
  column: {
    flex: 1,
    backgroundColor: "#e1e6ee",
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
    backgroundColor: "#0a1628",
    color: "white",
    padding: "10px",
  },
  cardBody: {
    padding: "10px",
    backgroundColor: "#b9c1c5",
  },
};

export default AdminDashBoard;