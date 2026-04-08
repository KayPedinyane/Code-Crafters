import { BrowserRouter, Routes, Route } from "react-router-dom";
import ApplicantHome from "./pages/ApplicantHome";
import ProfilePage from "./pages/ProfilePage";
import JobDetailPage from "./pages/JobDetailPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ApplicantHome />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/job/:id" element={<JobDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;