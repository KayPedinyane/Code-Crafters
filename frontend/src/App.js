import './App.css';
import Login from "./login";
import React from "react";
import Create from "./create_acc";
import { BrowserRouter , Routes, Route } from "react-router-dom";
import Forgot from "./forgot";


// Admin
import AdminDashBoard from "./pages/AdminDashboard";
import JobDetails from "./pages/Job_Details";
// Applicant
import ApplicantHome from "./pages/ApplicantHome";
import ProfilePage from "./pages/ProfilePage";
import JobDetailPage from "./pages/JobDetailPage";
// Provider
import ProviderOpportunityForm from "./pages/ProviderOpportunityForm";
import ProviderHomePage from "./pages/ProviderHomePage";
import MyListings from "./pages/MyListings";
import ProviderProfile from "./pages/ProviderProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*login-route*/}
        <Route path="/" element={<Login />} />   
        <Route path="/create-account" element={<Create />} />
        <Route path ="/forgot_p" element = {<Forgot/>}/>
        {/* Default route */}
        <Route path="/" element={<Login />} />
        {/* Applicant routes */}
        <Route path="/applicant" element={<ApplicantHome />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/applicant/job/:id" element={<JobDetailPage />} />
        {/* Provider routes */}
        <Route path="/post-opportunity" element={<ProviderOpportunityForm />} />
        <Route path="/provider" element={<ProviderHomePage />} />
        <Route path="/my-listings" element={<MyListings />} />
        <Route path="/provider-profile" element={<ProviderProfile />} />
        {/* Admin routes */}
        <Route path="/admin" element={<AdminDashBoard />} />
        <Route path="/admin/job/:jobId" element={<JobDetails />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;