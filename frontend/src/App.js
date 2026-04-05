import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashBoard from "./Pages/AdminDashBoard";
import Job_Details from "./Pages/Job_Details";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminDashBoard />} />
        <Route path="/job/:id" element={<Job_Details />} />
      </Routes>
    </Router>
  );
}

export default App;