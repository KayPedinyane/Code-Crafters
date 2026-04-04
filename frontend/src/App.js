import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from "./Pages/AdminDashBoard";
import JobDetails from "./Pages/Job_Details";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/job/:id" element={<JobDetails />} />
      </Routes>
    </Router>
  );
}

export default App;