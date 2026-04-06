import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

function AdminDashBoard() {
  const navigate = useNavigate();

  // Mock jobs with status
  const [jobs] = useState([
    {
      id: 1,
      title: "Software Developer Learnership",
      location: "Johannesburg",
      provider: "Tech Corp",
      stipend: "R5000/month",
      status: "new",
    },
    {
      id: 2,
      title: "Data Analyst Internship",
      location: "Cape Town",
      provider: "Data Inc",
      stipend: "R7000/month",
      status: "approved",
    },
    {
      id: 3,
      title: "Electrical Apprenticeship",
      location: "Durban",
      provider: "Power Skills Ltd",
      stipend: "R4500/month",
      status: "rejected",
    },
    {
      id: 4,
      title: "Web Developer Internship",
      location: "Pretoria",
      provider: "Web Solutions",
      stipend: "R6000/month",
      status: "new",
    },
  ]);

  // Filter jobs
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
        {/* Green title header */}
        <div style={styles.cardHeader}>{job.title}</div>

        {/* Card body */}
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
    overflow: "hidden", // keeps rounded corners clean
  },

  cardHeader: {
    backgroundColor: "#014421", // pine green
    color: "white",
    padding: "10px",
    fontWeight: "bold",
  },

  cardBody: {
    padding: "10px",
  },
};

export default AdminDashBoard;