import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Admin
import AdminDashBoard from "./Pages/AdminDashBoard";
import JobDetails from "./Pages/Job_Details";

// Applicant
// Applicant (now uppercase Pages)
import ApplicantHome from "./Pages/ApplicantHome";
import ProfilePage from "./Pages/ProfilePage";
import JobDetailPage from "./Pages/JobDetailPage";

// Provider
import ProviderOpportunityForm from "./ProviderOpportunityForm";
import ProviderHomePage from "./ProviderHomePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default route */}
        <Route path="/" element={<AdminDashBoard />} />

        {/* Applicant routes */}
        <Route path="/applicant" element={<ApplicantHome />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/job/:id" element={<JobDetailPage />} />

        {/* Provider routes */}
        <Route path="/post-opportunity" element={<ProviderOpportunityForm />} />
        <Route path="/provider" element={<ProviderHomePage />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminDashBoard />} />
        <Route path="/job/:jobId" element={<JobDetails />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;