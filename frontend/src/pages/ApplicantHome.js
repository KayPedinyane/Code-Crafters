import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./ApplicantHome.css";

const DUMMY_JOBS =[
    { id:1 ,title:"IT Learnership" ,company:"Vodacom" ,location:" Johannesburg" ,sector:"ICT" ,nqfLevel:"NQF 4" ,stipend:"R3500/month" ,closing:"2026-05-30" },
    { id:2 ,title:"Engineering Apprenticeship" ,company:"Eskom" ,location:"Cape Town" ,sector:"Engineering" ,nqfLevel:"NQF 5" ,stipend:"R4500/month" ,closing:"2025-07-15"},
    { id:3 ,title:"Finance Internship" ,company:"Standard Bank" ,location:"Sandton" ,sector:"Finance" ,nqfLevel:"NQF 6" ,stipend:"R5000/month" ,closing:"2025-07-01"},
    { id:4 ,title:"Healthcare Learnership" ,company:"Netcare" ,location:"Durban" ,sector:"Healthcare" ,nqfLevel:"NQF 4" ,stipend:"R3000/month" ,closing:"2026-09-04"},
    
];


function ApplicantHome(){

    const navigate= useNavigate();

    const [filters, setFilters]= useState({sector:"", nqflevel:"", location:"",});

    const handleFilterChange = (e) =>{
        setFilters({...filters, [e.target.name]: e.target.value });
    };

    return(
        <div className="home-container">

            {/*-------Profile Section----- */}
            <div className="profile-card" onClick ={() => navigate("/profile")}>
                <div className="profile-Initials">M</div>
                <div className="profile-info">
                    <h2>Mlungisi Mahlangu</h2>
                    <p>View and edit Profile </p>
                </div>
            </div>

            {/*---Filter Section----*/}

            <div className="filter-bar">
                <h3>Filter Opportunities...</h3>
                <div className="filter-controls">
                    <select name="sector" value={filters.sector} onChange={handleFilterChange}>
                        <option value="">All Sectors</option>
                        <option value="ICT">ICT</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Finance">Finance</option>
                        <option value="Healthcare">Healthcare</option>
                        
                    </select>
                    <select name="nqflevel" value={filters.nqfLevel} onChange={handleFilterChange}>
                        <option value="">All NQF Levels</option>
                        <option value="NQF 4">NQF 4</option>
                        <option value="NQF 5">NQF 5</option>
                        <option value="NQF 6">NQF 6</option>
                        
                    </select>
                    <select name="location" value={filters.location} onChange={handleFilterChange}>
                        <option value="">All Locations</option>
                        <option value="Cape Town">Cape Town</option>
                        <option value="Johannesburg">Johannesburg</option>
                        <option vlaue="Durban">Durban</option>
                    </select>
                </div>
            </div>

            {/*----Job listing section----*/}
            <div className="listings-section">
                <h3>Available Opportunities</h3>
                <div className="job-grid">
                    {DUMMY_JOBS.map((job) =>(
                        <div key={job.id} className="job-card" onClick ={() =>alert(`You clicked: ${job.title}`)}>
                            <h4>{job.title}</h4>
                            <p className="company">{job.company}</p>
                            <div className="job-tags">
                                <span className="tag">{job.sector}</span>
                                <span className="tag">{job.nqfLevel}</span>
                            </div>
                            <p className="job-details">📍 {job.location}</p>
                            <p className="job-details">💰 {job.stipend}</p>
                            <p className="job-details">📅 {job.closing}</p>

                        </div>
                    ) )}

                </div>
            </div>


        </div>
    );
}

export default ApplicantHome;