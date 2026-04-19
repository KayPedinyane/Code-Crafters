import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import "./ApplicantHome.css";

const SECTORS = ["All Sectors", "ICT", "Engineering", "Finance", "Healthcare", "Retail", "Construction"];
const NQF_LEVELS = ["All NQF Levels", "NQF 4", "NQF 5", "NQF 6"];
const LOCATIONS = ["All Locations", "Johannesburg", "Cape Town", "Sandton", "Durban"];
const TYPES = ["All Types", "Learnership", "Apprenticeship", "Internship"];
const STATUSES = ["All", "Pending", "Shortlisted", "Accepted", "Rejected"];

const TYPE_COLORS = {
  Learnership:    { bg: "#e8f5e9", text: "#2e7d32" },
  Apprenticeship: { bg: "#fff3e0", text: "#e65100" },
  Internship:     { bg: "#e3f2fd", text: "#1565c0" },
};

const STATUS_COLORS = {
  Pending:     { bg: "#fff3e0", text: "#e65100" },
  Shortlisted: { bg: "#e3f2fd", text: "#1565c0" },
  Accepted:    { bg: "#e8f5e9", text: "#2e7d32" },
  Rejected:    { bg: "#fff5f5", text: "#c53030" },
};

function ApplicantHome() {
  const navigate = useNavigate();

  // ── Active view: 'opportunities' or 'applications' ──
  const [activeView, setActiveView] = useState("opportunities");

  // ── Firebase logged in user ──
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUser(user);
      else navigate("/");
    });
    return () => unsubscribe();
  }, []);

  const displayName = currentUser?.displayName
    || currentUser?.email?.split("@")[0]
    || "Applicant";
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  // ── Profile popup ──
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowPopup(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Opportunities ──
  const [jobs,    setJobs]    = useState([]);
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
    return sectorMatch && nqfMatch && locationMatch && typeMatch;
  });

  const hasActiveFilters = Object.values(filters).some((v) => v !== "" && !v.startsWith("All"));

  // ── My Applications ──
  const [applications,    setApplications]    = useState([]);
  const [appsLoading,     setAppsLoading]     = useState(false);
  const [statusFilter,    setStatusFilter]    = useState("All");

  const loadApplications = () => {
    if (!currentUser) return;
    setAppsLoading(true);
    fetch(`https://code-crafters-t8dp.onrender.com/applications/${encodeURIComponent(currentUser.email)}`)
      .then((res) => res.json())
      .then((data) => { setApplications(Array.isArray(data) ? data : []); setAppsLoading(false); })
      .catch(() => setAppsLoading(false));
  };

  // Load applications when switching to that view
  useEffect(() => {
    if (activeView === "applications") loadApplications();
  }, [activeView, currentUser]);

  const filteredApplications = applications.filter((app) =>
    statusFilter === "All" || app.status === statusFilter
  );

  return (
    <div className="home-wrapper">

      {/* ── HEADER ── */}
      <header className="home-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">SkillsBridge<span className="logo-accent">SA</span></span>
          </div>

          {/* Nav tabs */}
          <nav className="header-nav">
            <span
              className={`nav-link ${activeView === "opportunities" ? "active" : ""}`}
              onClick={() => setActiveView("opportunities")}
            >
              Opportunities
            </span>
            <span
              className={`nav-link ${activeView === "applications" ? "active" : ""}`}
              onClick={() => setActiveView("applications")}
            >
              My Applications
              {applications.length > 0 && (
                <span className="nav-badge">{applications.length}</span>
              )}
            </span>
          </nav>

          {/* Profile chip */}
          <div className="profile-chip-wrapper" ref={popupRef}>
            <div className="profile-chip" onClick={() => setShowPopup((prev) => !prev)}>
              <div className="chip-avatar">{initials}</div>
              <div className="chip-info">
                <span className="chip-name">{displayName}</span>
                <span className="chip-role">Applicant</span>
              </div>
              <span className="chip-arrow">{showPopup ? "⌃" : "›"}</span>
            </div>

            {showPopup && (
              <div className="profile-popup">
                <div className="popup-top">
                  <div className="popup-avatar">{initials}</div>
                  <p className="popup-name">{displayName}</p>
                  <p className="popup-email">{currentUser?.email}</p>
                  <span
                    className="popup-edit"
                    onClick={() => { setShowPopup(false); navigate("/edit-profile"); }}
                  >
                    Edit
                  </span>
                </div>
                <div className="popup-divider" />
                <div className="popup-menu">
                  <div className="popup-menu-item">
                    <span className="popup-menu-icon">⚙</span><span>Settings</span>
                  </div>
                  <div className="popup-menu-item">
                    <span className="popup-menu-icon">?</span><span>Help</span>
                  </div>
                  <div
                    className="popup-menu-item popup-signout"
                    onClick={() => auth.signOut().then(() => navigate("/"))}
                  >
                    <span className="popup-menu-icon">↩</span><span>Sign out</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* ── SLIDING VIEWS ── */}
      <div className="views-container">

        {/* ══ OPPORTUNITIES VIEW ══ */}
        <div className={`view-panel ${activeView === "opportunities" ? "view-active" : "view-hidden"}`}>

          {/* Hero */}
          <section className="hero">
            <div className="hero-inner">
              <p className="hero-eyebrow">SETA-Accredited Opportunities</p>
              <h1 className="hero-title">Find Your <span className="hero-highlight">Learnership</span> or Internship</h1>
              <p className="hero-sub">Connecting South African youth with accredited skills development programmes from top employers nationwide.</p>
              <div className="hero-stats">
                <div className="stat"><span className="stat-num">{jobs.length}</span><span className="stat-label">Opportunities</span></div>
                <div className="stat-divider"/>
                <div className="stat"><span className="stat-num">6</span><span className="stat-label">Sectors</span></div>
                <div className="stat-divider"/>
                <div className="stat"><span className="stat-num">58</span><span className="stat-label">Spots Available</span></div>
              </div>
            </div>
            <div className="hero-pattern"/>
          </section>

          <main className="main-content">
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
          </main>
        </div>

        {/* ══ MY APPLICATIONS VIEW ══ */}
        <div className={`view-panel ${activeView === "applications" ? "view-active" : "view-hidden"}`}>

          {/* Applications Hero */}
          <section className="hero">
            <div className="hero-inner">
              <p className="hero-eyebrow">Your Applications</p>
              <h1 className="hero-title">My <span className="hero-highlight">Applications</span></h1>
              <p className="hero-sub">Track the status of every opportunity you have applied for.</p>
              <div className="hero-stats">
                <div className="stat"><span className="stat-num">{applications.length}</span><span className="stat-label">Applied</span></div>
                <div className="stat-divider"/>
                <div className="stat">
                  <span className="stat-num">{applications.filter(a => a.status === "Shortlisted").length}</span>
                  <span className="stat-label">Shortlisted</span>
                </div>
                <div className="stat-divider"/>
                <div className="stat">
                  <span className="stat-num">{applications.filter(a => a.status === "Accepted").length}</span>
                  <span className="stat-label">Accepted</span>
                </div>
              </div>
            </div>
            <div className="hero-pattern"/>
          </section>

          <main className="main-content">

            {/* Status filter */}
            <div className="filter-section">
              <div className="filter-header">
                <h2 className="filter-title">Filter by Status</h2>
                {statusFilter !== "All" && (
                  <button className="clear-btn" onClick={() => setStatusFilter("All")}>✕ Clear</button>
                )}
              </div>
              <div className="status-filter-pills">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    className={`status-pill ${statusFilter === s ? "status-pill-active" : ""}`}
                    onClick={() => setStatusFilter(s)}
                    style={statusFilter === s && STATUS_COLORS[s] ? {
                      background: STATUS_COLORS[s].bg,
                      color:      STATUS_COLORS[s].text,
                      borderColor: STATUS_COLORS[s].text,
                    } : {}}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="results-bar">
              <span className="results-count">
                Showing <strong>{filteredApplications.length}</strong> of <strong>{applications.length}</strong> applications
              </span>
            </div>

            {appsLoading ? (
              <div className="empty-state">
                <span className="empty-icon">⏳</span>
                <h3>Loading your applications...</h3>
              </div>
            ) : applications.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📋</span>
                <h3>No applications yet</h3>
                <p>Browse opportunities and click Apply Now to get started</p>
                <button className="clear-btn-lg" onClick={() => setActiveView("opportunities")}>
                  Browse Opportunities
                </button>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🔍</span>
                <h3>No {statusFilter} applications</h3>
                <button className="clear-btn-lg" onClick={() => setStatusFilter("All")}>Show all</button>
              </div>
            ) : (
              <div className="job-grid">
                {filteredApplications.map((app, index) => {
                  const status = app.status || "Pending";
                  const colors = STATUS_COLORS[status] || { bg: "#f0f0f0", text: "#333" };
                  return (
                    <div
                      key={app.id || index}
                      className="job-card"
                      style={{ animationDelay: `${index * 0.07}s` }}
                    >
                      {/* Status banner at top of card */}
                      <div
                        className="app-status-banner"
                        style={{ background: colors.bg, color: colors.text }}
                      >
                        <span className="app-status-dot" style={{ background: colors.text }}/>
                        <strong>{status}</strong>
                      </div>

                      <div className="card-top">
                        <div className="company-logo">
                          {app.title ? app.title.charAt(0).toUpperCase() : "?"}
                        </div>
                        <span
                          className="type-badge"
                          style={{
                            background: TYPE_COLORS[app.type]?.bg || "#f0f0f0",
                            color:      TYPE_COLORS[app.type]?.text || "#333",
                          }}
                        >
                          {app.type || "Opportunity"}
                        </span>
                      </div>

                      <h3 className="card-title">{app.title}</h3>
                      <p className="card-company">{app.sector}</p>

                      <div className="card-tags">
                        <span className="tag tag-sector">{app.sector}</span>
                        <span className="tag tag-nqf">{app.nqf_level}</span>
                      </div>

                      <div className="card-details">
                        <div className="detail-row"><span className="detail-icon">📍</span><span>{app.location}</span></div>
                        <div className="detail-row"><span className="detail-icon">💰</span><span>{app.stipend}</span></div>
                        <div className="detail-row"><span className="detail-icon">⏱</span><span>{app.duration}</span></div>
                        <div className="detail-row"><span className="detail-icon">📅</span><span>Closes {app.closing_date}</span></div>
                      </div>

                      <div className="card-footer">
                        <span className="spots" style={{ background: colors.bg, color: colors.text }}>
                          {status}
                        </span>
                        <span className="app-applied-date">
                          Applied {app.applied_at ? new Date(app.applied_at).toLocaleDateString("en-ZA") : "recently"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>

      </div>
    </div>
  );
}

export default ApplicantHome;