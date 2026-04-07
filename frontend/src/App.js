
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import AdminDashBoard from "./Pages/AdminDashBoard";
import Job_Details from "./Pages/Job_Details";

function App() {
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: "Software Developer Learnership",
      location: "Johannesburg",
      provider: "Tech Corp",
      stipend: "R5000/month",
      status: "new",
      description: "Gain hands-on experience in software development",
      duration: "12 months",
      requirements: "Basic programming knowledge",
    },
    {
      id: 2,
      title: "Data Analyst Internship",
      location: "Cape Town",
      provider: "Data Inc",
      stipend: "R7000/month",
      status: "approved",
      description: "Work with data and analytics tools",
      duration: "6 months",
      requirements: "Excel and SQL",
    },
    {
      id: 3,
      title: "Electrical Apprenticeship",
      location: "Durban",
      provider: "Power Skills Ltd",
      stipend: "R4500/month",
      status: "rejected",
      description: "Learn electrical systems and installations",
      duration: "12 months",
      requirements: "Basic electrical knowledge",
    },
    {
      id: 4,
      title: "Web Developer Internship",
      location: "Pretoria",
      provider: "Web Solutions",
      stipend: "R6000/month",
      status: "new",
      description: "Learn front-end and back-end web development",
      duration: "6 months",
      requirements: "HTML, CSS, JavaScript",
    },
  ]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminDashBoard jobs={jobs} setJobs={setJobs} />} />
        <Route path="/job/:jobId" element={<Job_Details jobs={jobs} setJobs={setJobs} />} />
      </Routes>
    </Router>
  );
}

export default App;