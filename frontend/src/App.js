import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Admin
import AdminDashBoard from "./Pages/AdminDashBoard";
import Job_Details from "./Pages/Job_Details";

// Applicant
import ApplicantHome from "./pages/ApplicantHome";
import ProfilePage from "./pages/ProfilePage";

// Provider
import ProviderOpportunityForm from "./ProviderOpportunityForm";
import ProviderHomePage from "./ProviderHomePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Applicant routes */}
        <Route path="/" element={<ApplicantHome />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Provider routes */}
        <Route path="/post-opportunity" element={<ProviderOpportunityForm />} />
        <Route path="/provider" element={<ProviderHomePage />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminDashBoard />} />
        <Route path="/job/:jobId" element={<Job_Details />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;