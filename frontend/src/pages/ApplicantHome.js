import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import "./ApplicantHome.css";

const API = "https://code-crafters-t8dp.onrender.com";

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

  const [activeView, setActiveView] = useState("opportunities");

  // ── Firebase logged in user + profile name from DB ──
  const [currentUser,   setCurrentUser]   = useState(null);
  const [profileName,   setProfileName]   = useState("");

  // ── Fetch profile name from database ──
  const fetchProfileName = async (email) => {
    try {
      const res  = await fetch(`${API}/profile/${email}`);
      const data = await res.json();
      if (data && !data.error && data.full_name) {
        setProfileName(data.full_name);
      }
    } catch {
      // silently fail — will use email prefix as fallback
    }
  };

  // ── Check for matching new opportunities and notify ──
  const checkMatchingOpportunities = async (user) => {
    if (!user) return;
    try {
      const profileRes = await fetch(`${API}/profile/${user.email}`);
      const profile    = await profileRes.json();
      if (!profile || profile.error || !profile.nqf_level) return;

      const jobsRes = await fetch(`${API}/opportunities`);
      const allJobs = await jobsRes.json();
      if (!Array.isArray(allJobs)) return;

      const notifiedKey      = `notified_jobs_${user.email}`;
      const alreadyNotified  = JSON.parse(localStorage.getItem(notifiedKey)) || [];

      const matchingNewJobs = allJobs.filter((job) => {
        const isNew      = !alreadyNotified.includes(job.id);
        const nqfMatch   = profile.nqf_level && job.nqf_level && job.nqf_level === profile.nqf_level;
        const sectorMatch = profile.qualification && job.sector &&
          job.sector.toLowerCase().includes((profile.qualification || "").toLowerCase().split(" ")[0]);
        return isNew && (sectorMatch || nqfMatch);
      });

      for (const job of matchingNewJobs) {
        await fetch(`${API}/notifications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_email: user.email,
            message: `🎯 New opportunity matching your profile: "${job.title}" in ${job.sector} (${job.nqf_level}) — closes ${job.closing_date ? new Date(job.closing_date).toLocaleDateString("en-ZA") : "soon"}.`,
          }),
        }).catch(() => {});
        alreadyNotified.push(job.id);
      }

      localStorage.setItem(notifiedKey, JSON.stringify(alreadyNotified));
      if (matchingNewJobs.length > 0) fetchNotifications();
    } catch {
      // silent fail
    }
  };

  // ── Check for opportunities closing within 3 days ──
  const checkClosingDeadlines = async (user) => {
    if (!user) return;
    try {
      const jobsRes = await fetch(`${API}/opportunities`);
      const allJobs = await jobsRes.json();
      if (!Array.isArray(allJobs)) return;

      const today          = new Date();
      const threeDaysLater = new Date();
      threeDaysLater.setDate(today.getDate() + 3);

      const closingKey      = `notified_closing_${user.email}`;
      const alreadyNotified = JSON.parse(localStorage.getItem(closingKey)) || [];

      const closingSoon = allJobs.filter((job) => {
        if (!job.closing_date) return false;
        const closingDate    = new Date(job.closing_date);
        const isClosingSoon  = closingDate >= today && closingDate <= threeDaysLater;
        const notYetNotified = !alreadyNotified.includes(job.id);
        return isClosingSoon && notYetNotified;
      });

      for (const job of closingSoon) {
        const closingDate = new Date(job.closing_date);
        const daysLeft    = Math.ceil((closingDate - today) / (1000 * 60 * 60 * 24));
        await fetch(`${API}/notifications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_email: user.email,
            message: `⏰ Reminder: "${job.title}" closes in ${daysLeft} day${daysLeft === 1 ? "" : "s"} (${closingDate.toLocaleDateString("en-ZA")}). Don't miss out!`,
          }),
        }).catch(() => {});
        alreadyNotified.push(job.id);
      }

      localStorage.setItem(closingKey, JSON.stringify(alreadyNotified));
      if (closingSoon.length > 0) fetchNotifications();
    } catch {
      // silent fail
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchProfileName(user.email);
        checkMatchingOpportunities(user);
        checkClosingDeadlines(user);
      } else {
        navigate("/");
      }
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Display name: use profile full name if saved, else email prefix ──
  const displayName = profileName
    || currentUser?.displayName
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

  // ── Notifications ──
  const [notifications,     setNotifications]     = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifsLoading,     setNotifsLoading]     = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    fetchNotifications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchNotifications = () => {
    if (!currentUser) return;
    setNotifsLoading(true);
    fetch(`${API}/notifications/${currentUser.email}`)
      .then((res) => res.json())
      .then((data) => {
        setNotifications(Array.isArray(data) ? data : []);
        setNotifsLoading(false);
      })
      .catch(() => setNotifsLoading(false));
  };

  const markAllRead = () => {
    notifications.forEach((n) => {
      if (!n.is_read) {
        fetch(`${API}/notifications/${n.id}/read`, { method: "PATCH" }).catch(() => {});
      }
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // ── Opportunities ──
  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/opportunities`)
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
  const [applications, setApplications] = useState([]);
  const [appsLoading,  setAppsLoading]  = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  const loadApplications = () => {
    if (!currentUser) return;
    setAppsLoading(true);
    fetch(`${API}/applications/${encodeURIComponent(currentUser.email)}`)
      .then((res) => res.json())
      .then((data) => { setApplications(Array.isArray(data) ? data : []); setAppsLoading(false); })
      .catch(() => setAppsLoading(false));
  };

  useEffect(() => {
    if (activeView === "applications") loadApplications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, currentUser]);

  const filteredApplications = applications.filter((app) =>
    statusFilter === "All" || app.status?.toLowerCase() === statusFilter.toLowerCase()
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

          {/* ── NOTIFICATION BELL ── */}
          <div className="notif-wrapper" ref={notifRef}>
            <div
              className="notif-bell"
              onClick={() => {
                setShowNotifications((prev) => !prev);
                if (!showNotifications) fetchNotifications();
              }}
            >
              <span className="notif-bell-icon">🔔</span>
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
              )}
            </div>

            {showNotifications && (
              <div className="notif-dropdown">
                <div className="notif-header">
                  <span className="notif-title">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="notif-mark-read" onClick={markAllRead}>
                      Mark all read
                    </span>
                  )}
                </div>
                {notifsLoading ? (
                  <div className="notif-empty"><p>Loading...</p></div>
                ) : notifications.length === 0 ? (
                  <div className="notif-empty">
                    <span className="notif-empty-icon">🔔</span>
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="notif-list">
                    {notifications.map((n) => (
                      <div key={n.id} className={`notif-item ${!n.is_read ? "notif-unread" : ""}`}>
                        <div className="notif-dot-wrapper">
                          {!n.is_read && <span className="notif-dot" />}
                        </div>
                        <div className="notif-body">
                          <p className="notif-message">{n.message}</p>
                          <span className="notif-time">
                            {n.created_at
                              ? new Date(n.created_at).toLocaleDateString("en-ZA", {
                                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                                })
                              : "Recently"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

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
                    onClick={() => {
                      const confirmed = window.confirm("Are you sure you want to sign out?");
                      if (confirmed) auth.signOut().then(() => navigate("/"));
                    }}
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
                    {/* #107 — show company name from DB, fallback to sector */}
                    <p className="card-company">{job.company_name || job.company || job.sector}</p>
                    <div className="card-tags">
                      <span className="tag tag-sector">{job.sector}</span>
                      <span className="tag tag-nqf">{job.nqf_level}</span>
                    </div>
                    <div className="card-details">
                      <div className="detail-row"><span className="detail-icon">📍</span><span>{job.location}</span></div>
                      <div className="detail-row"><span className="detail-icon">💰</span><span>{job.stipend}</span></div>
                      <div className="detail-row"><span className="detail-icon">⏱</span><span>{job.duration}</span></div>
                      <div className="detail-row"><span className="detail-icon">📅</span><span>Closes {job.closing_date ? new Date(job.closing_date).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }) : "N/A"}</span></div>
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
          <section className="hero">
            <div className="hero-inner">
              <p className="hero-eyebrow">Your Applications</p>
              <h1 className="hero-title">My <span className="hero-highlight">Applications</span></h1>
              <p className="hero-sub">Track the status of every opportunity you have applied for.</p>
              <div className="hero-stats">
                <div className="stat"><span className="stat-num">{applications.length}</span><span className="stat-label">Applied</span></div>
                <div className="stat-divider"/>
                <div className="stat">
                  <span className="stat-num">{applications.filter(a => a.status?.toLowerCase() === "shortlisted").length}</span>
                  <span className="stat-label">Shortlisted</span>
                </div>
                <div className="stat-divider"/>
                <div className="stat">
                  <span className="stat-num">{applications.filter(a => a.status?.toLowerCase() === "accepted").length}</span>
                  <span className="stat-label">Accepted</span>
                </div>
              </div>
            </div>
            <div className="hero-pattern"/>
          </section>

          <main className="main-content">
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
                      background:  STATUS_COLORS[s].bg,
                      color:       STATUS_COLORS[s].text,
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
                  const status = app.status
                    ? app.status.charAt(0).toUpperCase() + app.status.slice(1).toLowerCase()
                    : "Pending";
                  const colors = STATUS_COLORS[status] || { bg: "#f0f0f0", text: "#333" };
                  return (
                    <div
                      key={app.id || index}
                      className="job-card"
                      style={{ animationDelay: `${index * 0.07}s` }}
                    >
                      <div className="app-status-banner" style={{ background: colors.bg, color: colors.text }}>
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
                      <p className="card-company">{app.company_name || app.company || app.sector}</p>
                      <div className="card-tags">
                        <span className="tag tag-sector">{app.sector}</span>
                        <span className="tag tag-nqf">{app.nqf_level}</span>
                      </div>
                      <div className="card-details">
                        <div className="detail-row"><span className="detail-icon">📍</span><span>{app.location}</span></div>
                        <div className="detail-row"><span className="detail-icon">💰</span><span>{app.stipend}</span></div>
                        <div className="detail-row"><span className="detail-icon">⏱</span><span>{app.duration}</span></div>
                        <div className="detail-row"><span className="detail-icon">📅</span><span>Closes {app.closing_date ? new Date(app.closing_date).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }) : "N/A"}</span></div>
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