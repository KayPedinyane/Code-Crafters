import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

function AdminDashBoard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);

  //FETCH DATA FROM BACKEND
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/admin/jobs`)
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((err) => console.error("Error fetching jobs:", err));
  }, []);

  //categorizing jobs based on status
  const newJobs = jobs.filter((job) => job.status === "pending");
  const approvedJobs = jobs.filter((job) => job.status === "approved");
  const rejectedJobs = jobs.filter((job) => job.status === "rejected");

  //when job is clicked, go to job details page
  const handleClick = (id) => {
    navigate(`/admin/job/${id}`);
  };

  //reuseable function for specifying available jobs for each column
  const renderJobs = (jobList) => {
    if (!jobList.length) return <p>No jobs</p>;

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
          <p><strong>Location:</strong> {job.location}</p>
          <p><strong>Provider:</strong> {job.provider}</p>
          <p><strong>Stipend:</strong> {job.stipend}</p>
        </section>
      </article>
    ));
  };

  //for the admindashboard function
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
    minHeight: "100vh",
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