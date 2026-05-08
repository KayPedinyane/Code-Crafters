import './App.css';
import Login from "./login";
import React from "react";
import Create from "./create_acc";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Forgot from "./forgot";


//Home
import HomePage from './pages/HomePage';


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
import ProviderOpportunityForm from "./pages/ProviderOpportunityForm";
import ProviderHomePage from "./pages/ProviderHomePage";
import MyListings from "./pages/MyListings";
import ProviderProfile from "./pages/ProviderProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* HomePage routes */}
        <Route path="/" element={<HomePage />} />
        
        {/* Login routes */}
        <Route path="/login" element={<Login/>} />
        <Route path="/create" element={<Create />} />
        <Route path="/forgot" element={<Forgot />} />

        {/* Applicant routes — role "user" only */}
        <Route path="/applicant" element={
          <ProtectedRoute allowedRoles={["user"]}>
            <ApplicantHome />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={["user"]}>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/applicant/job/:id" element={
          <ProtectedRoute allowedRoles={["user"]}>
            <JobDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/edit-profile" element={
          <ProtectedRoute allowedRoles={["user"]}>
            <EditProfile />
          </ProtectedRoute>
        } />

        {/* Provider routes — role "provider" only */}
        <Route path="/provider" element={
          <ProtectedRoute allowedRoles={["provider"]}>
            <ProviderHomePage />
          </ProtectedRoute>
        } />
        <Route path="/post-opportunity" element={
          <ProtectedRoute allowedRoles={["provider"]}>
            <ProviderOpportunityForm />
          </ProtectedRoute>
        } />
        <Route path="/my-listings" element={
          <ProtectedRoute allowedRoles={["provider"]}>
            <MyListings />
          </ProtectedRoute>
        } />
        <Route path="/provider-profile" element={
          <ProtectedRoute allowedRoles={["provider"]}>
            <ProviderProfile />
          </ProtectedRoute>
        } />

        {/* Admin routes — role "admin" only */}
        <Route element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="/admin" element={<AdminDashBoard />} />
          <Route path="/requests" element={<ProviderRequests />} />
          <Route path="/admins" element={<AddAdmin />} />
        </Route>
        <Route path="/admin/job/:jobId" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <JobDetails />
          </ProtectedRoute>
        } />
        <Route path="/AdminProfile" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminProfile />
          </ProtectedRoute>
        } />
        <Route path="/providers/:id" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ProviderDetails />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;