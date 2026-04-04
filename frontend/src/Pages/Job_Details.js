import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/Header";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/admin/jobs/${id}`)
      .then(res => res.json())
      .then(data => setJob(data));
  }, [id]);

  const approveJob = () => {
    fetch(`http://localhost:5000/admin/jobs/${id}/approve`, {
      method: "POST"
    }).then(() => navigate("/"));
  };

  const removeJob = () => {
    fetch(`http://localhost:5000/admin/jobs/${id}/reject`, {
      method: "POST"
    }).then(() => navigate("/"));
  };

  if (!job) return <p>Loading...</p>;

  return (
    <div>
      <Header />

      <main style={{ padding: "20px" }}>
        <h2>{job.title}</h2>

        <p><strong>Description:</strong> {job.description}</p>
        <p><strong>Location:</strong> {job.location}</p>
        <p><strong>Stipend:</strong> {job.stipend}</p>
        <p><strong>Duration:</strong> {job.duration}</p>
        <p><strong>Requirements:</strong> {job.requirements}</p>

        <h3>Provider Info</h3>
        <p>{job.providerName}</p>

        <button onClick={approveJob} style={styles.approve}>
          Approve
        </button>

        <button onClick={removeJob} style={styles.reject}>
          Remove
        </button>
      </main>
    </div>
  );
}

const styles = {
  approve: {
    backgroundColor: "#0B3D2E",
    color: "white",
    padding: "10px",
    marginRight: "10px",
    border: "none",
    borderRadius: "5px"
  },
  reject: {
    backgroundColor: "red",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "5px"
  }
};

export default JobDetails;