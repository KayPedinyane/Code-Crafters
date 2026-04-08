import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ApplicantHome.css";
import JOBS from "../data/jobs";

const SECTORS = ["All Sectors", "ICT", "Engineering", "Finance", "Healthcare", "Retail", "Construction"];
const NQF_LEVELS = ["All NQF Levels", "NQF 4", "NQF 5", "NQF 6"];
const LOCATIONS = ["All Locations", "Johannesburg, Gauteng", "Cape Town, Western Cape", "Sandton, Gauteng", "Durban, KwaZulu-Natal"];
const TYPES = ["All Types", "Learnership", "Apprenticeship", "Internship"];

const TYPE_COLORS = {
  Learnership: { bg: "#e8f5e9", text: "#2e7d32" },
  Apprenticeship: { bg: "#fff3e0", text: "#e65100" },
  Internship: { bg: "#e3f2fd", text: "#1565c0" },
};


function ApplicantHome(){
    const navigate=useNavigate();

    const [filters, setFilters] = useState({ sector: "", nqfLevel: "", location: "", type: "" });

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const clearFilters = () => {
        setFilters({ sector: "", nqfLevel: "", location: "", type: "" });
    };

    // Filter logic
    const filteredJobs = JOBS.filter((job) => {
        return (
        (!filters.sector || filters.sector === "All Sectors" || job.sector === filters.sector) &&
        (!filters.nqfLevel || filters.nqfLevel === "All NQF Levels" || job.nqfLevel === filters.nqfLevel) &&
        (!filters.location || filters.location === "All Locations" || job.location === filters.location) &&
        (!filters.type || filters.type === "All Types" || job.type === filters.type)
        );
    }); 
    const hasActiveFilters = Object.values(filters).some((v) => v !== "" && !v.startsWith("All"));

    return(

        <div className="home-wrapper">
            {/*-----Header-----*/}
            <header className="home-header">
                <div className="header-inner">
                    <div className="logo">
                        <span className="logo-icon">◈</span>
                        <span className="logo-text">SkillsBridge<span className="logo-accent">SA</span></span>
                    </div>
                    <nav className="header-nav">
                        <span className="nav-link active">Opportunities</span>
                        <span className="nav-link">My Applications</span>   
                    </nav>
                    {/* Profile chip */}
                    <div className="profile-chip" onClick={() => navigate("/profile")}>
                        <div className="chip-avatar">M</div>
                        <div className="chip-info">
                            <span className="chip-name">Mlungisi</span>
                            <span className="chip-role">Applicant</span>
                        </div>
                        <span className="chip-arrow">›</span>
                    </div>
                </div>

            </header>
            {/*----Hero Banner----*/}
            <section className="hero">
                <div className="hero-inner">
                    <p className="hero-eyebrow">SETA-Accredited Opportunities</p>
                    <h1 className="hero-title">Find your <span className="hero-highlight">Learnership</span> or Internship</h1>
                    <p className="hero-sub">Connecting South African youth with accredited skills development programmes from top employers nationwide.</p>
                    <div className="hero-stats">
                        <div className="stat"><span className="stat-num">{JOBS.length}</span><span className="stat-label">Opportunities</span></div>
                        <div className="stat-divider"/>
                        <div className="stat"><span className="stat-num">6</span><span className="stat-label">Sectors</span></div>
                        <div className="stat-divider"/>
                        <div className="stat"><span className="stat-num">58</span><span className="stat-label">Spots Available</span></div>
                    </div>
                </div>
                <div className="hero-pattern"/>

            </section>

            {/*---Main content---*/}
            <main className="main-content">

                {/*--filter Bar---*/}
                <div className="filter-section">
                    <div className="filter-header">
                        <h2 className="filter-title">Filter Opportunities</h2>
                        {hasActiveFilters && (
                            <button className="clear-btn" onClick={clearFilters}>✕ Clear filters</button>
                        )}
                    </div>
                    <div className="filter-controls">
                        {[
                        { name: "sector", options: SECTORS },
                        { name: "nqfLevel", options: NQF_LEVELS },
                        { name: "location", options: LOCATIONS },
                        { name: "type", options: TYPES },
                        ].map(({ name, options }) => (
                        <div className="select-wrapper" key={name}>
                            <select name={name} value={filters[name]} onChange={handleFilterChange}>
                            {options.map((opt) => (
                                <option key={opt} value={opt.startsWith("All") ? "" : opt}>{opt}</option>
                            ))}
                            </select>
                            <span className="select-arrow">▾</span>
                        </div>
                        ))}
          
                </div>
                
                </div>
                {/* Results count */}
                <div className="results-bar">
                <span className="results-count">
                    Showing <strong>{filteredJobs.length}</strong> of <strong>{JOBS.length}</strong> opportunities
                </span>
                </div>

        

                {/* Job Grid */}
                {filteredJobs.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">🔍</span>
                    <h3>No opportunities match your filters</h3>
                    <p>Try adjusting or clearing your filters</p>
                    <button className="clear-btn-lg" onClick={clearFilters}>Clear all filters</button>
                </div>
                ) : (
                <div className="job-grid">
                    {filteredJobs.map((job, index) => (
                    <div
                        key={job.id}
                        className="job-card"
                        style={{ animationDelay: `${index * 0.07}s` }}
                        onClick={() => navigate(`/job/${job.id}`)}
                    >
                        <div className="card-top">
                        <div className="company-logo">{job.company.charAt(0)}</div>
                        <span
                            className="type-badge"
                            style={{ background: TYPE_COLORS[job.type]?.bg, color: TYPE_COLORS[job.type]?.text }}
                        >
                            {job.type}
                        </span>
                        </div>

                        <h3 className="card-title">{job.title}</h3>
                        <p className="card-company">{job.company}</p>

                        <div className="card-tags">
                        <span className="tag tag-sector">{job.sector}</span>
                        <span className="tag tag-nqf">{job.nqfLevel}</span>
                        </div>

                        <div className="card-details">
                        <div className="detail-row">
                            <span className="detail-icon">📍</span>
                            <span>{job.location}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-icon">💰</span>
                            <span>{job.stipend}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-icon">⏱</span>
                            <span>{job.duration}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-icon">📅</span>
                            <span>Closes {job.closing}</span>
                        </div>
                        </div>

                        <div className="card-footer">
                        <span className="spots">{job.spots} spot{job.spots > 1 ? "s" : ""} left</span>
                        <span className="view-btn">View Details →</span>
                        </div>
                    </div>
                    ))}
                </div>
                )}
                

            </main>


        </div>
    );

}

export default ApplicantHome;