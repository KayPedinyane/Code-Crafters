import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";

function Job_Details() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock job data
  const jobs = [
    {
      id: "1",
      title: "Software Developer Learnership",
      location: "Johannesburg",
      provider: "Tech Corp",
      description: "Gain hands-on experience in software development.",
      duration: "12 months",
      stipend: "R5000/month",
      requirements: "Basic programming knowledge",
    },
    {
      id: "2",
      title: "Data Analyst Internship",
      location: "Cape Town",
      provider: "Data Inc",
      description: "Work with data and analytics tools.",
      duration: "6 months",
      stipend: "R7000/month",
      requirements: "Excel and SQL",
    },
    {
      id: "3",
      title: "Electrical Apprenticeship",
      location: "Durban",
      provider: "Power Skills Ltd",
      description: "Learn electrical systems and installations.",
      duration: "12 months",
      stipend: "R4500/month",
      requirements: "Basic electrical knowledge",
    },
  ];

  const job = jobs.find((j) => j.id === id);

  if (!job) return <p>Job not found</p>;

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

        <br />

        <button
          onClick={() => {
            console.log("Approved job:", job.id);
            navigate("/");
          }}
          style={styles.approve}
        >
          Approve
        </button>

        <button
          onClick={() => {
            console.log("Rejected job:", job.id);
            navigate("/");
          }}
          style={styles.reject}
        >
          Reject
        </button>
      </main>
    </div>
  );
}

const styles = {
  approve: {
    backgroundColor: "green",
    color: "white",
    padding: "10px 20px",
    marginRight: "10px",
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

export default Job_Details;
