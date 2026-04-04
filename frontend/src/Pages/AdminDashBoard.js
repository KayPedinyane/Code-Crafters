import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

function AdminDashboard() {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/admin/jobs?status=pending")
      .then(res => res.json())
      .then(data => setJobs(data));
  }, []);

  return (
    <div>
      <Header />

      <main style={{ padding: "20px" }}>
        <h2>Posted Jobs</h2>

        {jobs.map(job => (
          <div
            key={job.id}
            style={styles.card}
            onClick={() => navigate(`/job/${job.id}`)}
          >
            <h3>{job.title}</h3>
            <p>{job.location}</p>
          </div>
        ))}
      </main>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #ccc",
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "8px",
    cursor: "pointer"
  }
};

export default AdminDashboard;