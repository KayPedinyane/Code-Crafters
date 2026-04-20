import './App.css';
import Login from "./login";
import React from "react";
import Create from "./create_acc";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Forgot from "./forgot";

// Admin
import AdminLayout from "./layouts/AdminLayout";
import AdminDashBoard from "./pages/AdminDashboard";
import JobDetails from "./pages/Job_Details";
import ProviderRequests from "./pages/Provider_requests";
import AddAdmin from "./pages/Add_Admin";
import AdminProfile from "./pages/AdminProfile";
import ProviderDetails from './pages/ProviderDetails';

// Applicant
import ApplicantHome from "./pages/ApplicantHome";
import ProfilePage from "./pages/ProfilePage";
import JobDetailPage from "./pages/JobDetailPage";
import EditProfile from "./pages/EditProfile";

// Provider
import ProviderOpportunityForm from "./ProviderOpportunityForm";
import ProviderHomePage from "./ProviderHomePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login routes */}
        <Route path="/" element={<Login />} />
        <Route path="/create-account" element={<Create />} />
        <Route path="/forgot_p" element={<Forgot />} />

        {/* Applicant routes */}
        <Route path="/applicant" element={<ApplicantHome />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/applicant/job/:id" element={<JobDetailPage />} />
        <Route path="/edit-profile" element={<EditProfile />} />

        {/* Provider routes */}
        <Route path="/post-opportunity" element={<ProviderOpportunityForm />} />
        <Route path="/provider" element={<ProviderHomePage />} />

        {/* Admin routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashBoard />} />
          <Route path="/requests" element={<ProviderRequests />} />
          <Route path="/admins" element={<AddAdmin />} />
        </Route>
        <Route path="/admin/job/:jobId" element={<JobDetails />} />
        <Route path="/AdminProfile" element={<AdminProfile />} />
        <Route path="/providers/:id" element={<ProviderDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;