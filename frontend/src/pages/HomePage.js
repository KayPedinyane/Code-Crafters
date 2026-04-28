import './HomePage.css';
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from "react";

const SECTORS = ["All Sectors", "ICT", "Engineering", "Finance", "Healthcare", "Retail", "Construction"];
const NQF_LEVELS = ["All NQF Levels", "NQF 4", "NQF 5", "NQF 6"];
const LOCATIONS = ["All Locations", "Johannesburg", "Cape Town", "Sandton", "Durban"];
const TYPES = ["All Types", "Learnership", "Apprenticeship", "Internship"]

const TYPE_COLORS = {
  Learnership:    { bg: "#e8f5e9", text: "#2e7d32" },
  Apprenticeship: { bg: "#fff3e0", text: "#e65100" },
  Internship:     { bg: "#e3f2fd", text: "#1565c0" },
};

function HomePage() {
    const [view, setView] = useState('home')
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState('');
    const [jobs, setJobs] = useState([]);
    const navigate = useNavigate;

    const params = new URLSearchParams(location.search);
    const searchQuery = params.get('search') || '';
    const locationQuery = params.get('location') || '';
    
    // ── My Applications ──
      const [applications,    setApplications]    = useState([]);
      const [appsLoading,     setAppsLoading]     = useState(false);
      const [statusFilter,    setStatusFilter]    = useState("All");

// ── Opportunities ──
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("https://code-crafters-t8dp.onrender.com/opportunities")
        .then((res) => res.json())
        .then((data) => { setJobs(data); setLoading(false); })
        .catch(() => setLoading(false));
    }, []);

    const [filters, setFilters] = useState({ sector: "", nqfLevel: "", location: "", type: "" });
    const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
    const clearFilters = () => setFilters({ sector: "", nqfLevel: "", location: "", type: "" });

    const filteredJobs = jobs.filter((job) => {
    const sectorMatch   = filters.sector   === "" || job.sector    === filters.sector;
    const nqfMatch      = filters.nqfLevel === "" || job.nqf_level === filters.nqfLevel;
    const locationMatch = filters.location === "" || job.location  === filters.location;
    const typeMatch     = filters.type     === "" || job.type      === filters.type;

    // Search filters from homepage
    const searchMatch = searchQuery === "" ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.sector.toLowerCase().includes(searchQuery.toLowerCase());

        const locationQueryMatch = locationQuery === "" ||
        job.location.toLowerCase().includes(locationQuery.toLowerCase());

        return sectorMatch && nqfMatch && locationMatch && typeMatch && searchMatch && locationQueryMatch;
    });

    const hasActiveFilters = Object.values(filters).some((v) => v !== "" && !v.startsWith("All"));

    const filteredApplications = applications.filter((app) =>
        statusFilter === "All" || app.status?.toLowerCase() === statusFilter.toLowerCase()
    );

    const handleSearch = (e) => {
        e.preventDefault();
        setView('opportunities')
    };

    return (
        <div>
            <header className="header">
                <div className="header-inner">

                    <div className="logo">
                        <span className="logo-icon">◈</span>
                        <span className="logo-text">
                            SkillsBridge<span className="logo-accent">SA</span>
                        </span>
                    </div>

                    <nav className="header-nav">
                        <span className="nav-link active">Home</span>
                        <span className="nav-link" onClick={() => navigate('/login')}>Login</span>
                        <span className="nav-link" onClick={() => navigate('/create')}>Sign up</span>
                    </nav>

                </div>
            </header>

            <main>
                <section className="hero">
                    {view === 'home' && (
                        <>
                            <h1>Find your learnership or internship</h1>
                            <p>Connecting South African youth with SETA-accredited opportunities</p>
                        </>
                    )}
                        <form className="search-form" onSubmit={handleSearch}>
                            <div className="search-field">
                                <input 
                                    id="search" 
                                    type="text"
                                    placeholder="Job title or sector"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    />
                            </div>
                            <div className="search-field">
                                <input 
                                    id="location" 
                                    type="text" 
                                    placeholder="City or province"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    />
                            </div>
                            <button id="submit" type="submit">Search</button>
                        </form>
                </section>

                {view === 'home' && (
                    <>
                        <section className="sectors">
                            <h2>Browse by sector</h2>
                            <div className="sectors-grid">
                                <article className="sector-card">
                                    <h3>ICT</h3>
                                    <p>Software, networking and technical support</p>
                                </article>
                                <article className="sector-card">
                                    <h3>Engineering</h3>
                                    <p>Design, construction, planning, development, and mechanics</p>
                                </article>
                                <article className="sector-card">
                                    <h3>Finance</h3>
                                    <p>Money management, investment, budgeting, and forecasting.</p>
                                </article>
                            </div>
                        </section>

                        <section className="how-it-works">
                            <h2>How it works</h2>
                        </section>
                    </>
                )}

                {view === 'opportunities' && (
                    <section className="opportunities">
                        {/* Filter Bar */}
                        <div className="filter-section">
                            <div className="filter-header">
                                <h2 className="filter-title">Filter Opportunities</h2>
                                {hasActiveFilters && (
                                <button className="clear-btn" onClick={clearFilters}>✕ Clear filters</button>
                                )}
                            </div>
                            <div className="filter-controls">
                                {[
                                { name: "sector",   options: SECTORS    },
                                { name: "nqfLevel", options: NQF_LEVELS },
                                { name: "location", options: LOCATIONS  },
                                { name: "type",     options: TYPES      },
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

                        <div className="results-bar">
                            <span className="results-count">
                                Showing <strong>{filteredJobs.length}</strong> of <strong>{jobs.length}</strong> opportunities
                            </span>
                        </div>

                        {loading ? (
                        <div className="empty-state">
                            <span className="empty-icon">⏳</span>
                            <h3>Loading opportunities...</h3>
                            <p>Fetching live data from the database</p>
                        </div>
                        ) : filteredJobs.length === 0 ? (
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
                                onClick={() => navigate(`/applicant/job/${job.id}`, { state: { job } })}
                            >
                                <div className="card-top">
                                <div className="company-logo">
                                    {job.title ? job.title.charAt(0).toUpperCase() : "?"}
                                </div>
                                <span
                                    className="type-badge"
                                    style={{
                                    background: TYPE_COLORS[job.type]?.bg || "#f0f0f0",
                                    color:      TYPE_COLORS[job.type]?.text || "#333",
                                    }}
                                >
                                    {job.type || "Opportunity"}
                                </span>
                                </div>
                                <h3 className="card-title">{job.title}</h3>
                                <p className="card-company">{job.sector}</p>
                                <div className="card-tags">
                                <span className="tag tag-sector">{job.sector}</span>
                                <span className="tag tag-nqf">{job.nqf_level}</span>
                                </div>
                                <div className="card-details">
                                <div className="detail-row"><span className="detail-icon">📍</span><span>{job.location}</span></div>
                                <div className="detail-row"><span className="detail-icon">💰</span><span>{job.stipend}</span></div>
                                <div className="detail-row"><span className="detail-icon">⏱</span><span>{job.duration}</span></div>
                                <div className="detail-row"><span className="detail-icon">📅</span><span>Closes {job.closing_date}</span></div>
                                </div>
                                <div className="card-footer">
                                <span className="spots">{job.nqf_level || "Open"}</span>
                                <span className="view-btn">View Details →</span>
                                </div>
                            </div>
                            ))}
                        </div>
                        )}
                    </section>
                )}
            </main>

            <footer>
                <p>© 2026 SkillsBridgeSA</p>
            </footer>
        </div>
    );
}

export default HomePage;