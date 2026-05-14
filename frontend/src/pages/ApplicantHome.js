import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useLocation } from 'react-router-dom';
import "./ApplicantHome.css";
import "./AIRecommendations.css"
import { NQF_LEVELS as NQF_DATA, SECTORS as SECTOR_LIST } from "../utils/nqfData";
import { ALL_CITIES } from "../utils/saLocations";

const API = "https://code-crafters-t8dp.onrender.com";

const SECTORS    = ["All Sectors",    ...SECTOR_LIST];
const NQF_LEVELS = ["All NQF Levels", ...NQF_DATA.map(n => n.value)];
const LOCATIONS  = ["All Locations",  ...ALL_CITIES.slice(0, 20)];
const TYPES      = ["All Types", "Learnership", "Apprenticeship", "Internship"];
const STATUSES   = ["All", "Pending", "Shortlisted", "Accepted", "Rejected"];

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

function timeAgo(dateStr) {
  if (!dateStr) return "Recently";
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return -1;
  return Math.ceil(diff / 86400000);
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ── Confetti burst on application success ──
function triggerConfetti() {
  const colors = ["#00c853", "#0a1628", "#ffd600", "#00bcd4", "#ff6b6b"];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement("div");
    el.style.cssText = `
      position:fixed; width:8px; height:8px; border-radius:50%;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      left:${Math.random() * 100}vw; top:-10px;
      animation: confettiFall ${1.2 + Math.random() * 1.5}s ease-in forwards;
      z-index:9999; pointer-events:none;
      transform: rotate(${Math.random() * 360}deg);
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}

// ── Profile completeness calculator ──
function getProfileCompletion(profile) {
  if (!profile) return 0;
  const fields = ["full_name","phone","id_number","gender","city","province","qualification","institution","nqf_level"];
  const filled = fields.filter(f => profile[f] && profile[f].toString().trim() !== "").length;
  return Math.round((filled / fields.length) * 100);
}

function SkeletonCard() {
  return (
    <div className="job-card skeleton-card">
      <div className="skeleton skeleton-top" />
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-sub" />
      <div className="skeleton skeleton-tags" />
      <div className="skeleton skeleton-details" />
      <div className="skeleton skeleton-footer" />
    </div>
  );
}

function ApplicantHome() {
  const location = useLocation();
  const params        = new URLSearchParams(location.search);
  const searchQuery   = params.get('search')   || '';
  const locationQuery = params.get('location') || '';

  const navigate = useNavigate();
  const [activeView,       setActiveView]       = useState("opportunities");
  const [currentUser,      setCurrentUser]      = useState(null);
  const [profileName,      setProfileName]      = useState("");
  const [profileData,      setProfileData]      = useState(null);
  const [searchInput,      setSearchInput]      = useState(searchQuery);
  const [showScrollTop,    setShowScrollTop]    = useState(false);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const [savedJobs,        setSavedJobs]        = useState([]);
  const [activeTab,        setActiveTab]        = useState("all"); // all | saved
  const searchRef = useRef(null);

  // ── Keyboard shortcut: Ctrl+K / Cmd+K focuses search ──
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setActiveView("opportunities");
        setTimeout(() => searchRef.current?.focus(), 100);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fetchProfileName = async (email) => {
    try {
      const res  = await fetch(`${API}/profile/${email}`);
      const data = await res.json();
      if (data && !data.error && data.full_name) {
        setProfileName(data.full_name);
        setProfileData(data);

        // Show welcome banner only on first login of the day
        const lastSeen = localStorage.getItem(`last_seen_${email}`);
        const today    = new Date().toDateString();
        if (lastSeen !== today) {
          setShowWelcomeBanner(true);
          localStorage.setItem(`last_seen_${email}`, today);
          setTimeout(() => setShowWelcomeBanner(false), 5000);
        }
      }
    } catch {}
  };

  const checkMatchingOpportunities = async (user) => {
    if (!user) return;
    try {
      const profileRes = await fetch(`${API}/profile/${user.email}`);
      const profile    = await profileRes.json();
      if (!profile || profile.error || !profile.nqf_level) return;
      const jobsRes = await fetch(`${API}/opportunities`);
      const allJobs = await jobsRes.json();
      if (!Array.isArray(allJobs)) return;
      const notifiedKey     = `notified_jobs_${user.email}`;
      const alreadyNotified = JSON.parse(localStorage.getItem(notifiedKey)) || [];
      const matchingNewJobs = allJobs.filter((job) => {
        const isNew       = !alreadyNotified.includes(job.id);
        const nqfMatch    = profile.nqf_level && job.nqf_level && job.nqf_level === profile.nqf_level;
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
    } catch {}
  };

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
    } catch {}
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchProfileName(user.email);
        checkMatchingOpportunities(user);
        checkClosingDeadlines(user);
        // Load saved jobs
        const saved = JSON.parse(localStorage.getItem(`saved_jobs_${user.email}`) || "[]");
        setSavedJobs(saved);
      } else {
        navigate("/");
      }
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayName = profileName || currentUser?.displayName || currentUser?.email?.split("@")[0] || "Applicant";
  const initials    = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const completion  = getProfileCompletion(profileData);

  // ── Save/unsave a job ──
  const toggleSaveJob = (e, jobId) => {
    e.stopPropagation();
    if (!currentUser) return;
    const key     = `saved_jobs_${currentUser.email}`;
    const current = JSON.parse(localStorage.getItem(key) || "[]");
    const updated = current.includes(jobId) ? current.filter(id => id !== jobId) : [...current, jobId];
    localStorage.setItem(key, JSON.stringify(updated));
    setSavedJobs(updated);
  };

  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) setShowPopup(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [notifications,     setNotifications]     = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifsLoading,     setNotifsLoading]     = useState(false);
  const notifRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
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
      .then((data) => { setNotifications(Array.isArray(data) ? data : []); setNotifsLoading(false); })
      .catch(() => setNotifsLoading(false));
  };

  const markAllRead = () => {
    notifications.forEach((n) => {
      if (!n.is_read) fetch(`${API}/notifications/${n.id}/read`, { method: "PATCH" }).catch(() => {});
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/opportunities`)
      .then((res) => res.json())
      .then((data) => {
        const open = Array.isArray(data)
          ? data.filter(job => !job.closing_date || new Date(job.closing_date) >= new Date())
          : [];
        setJobs(open);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const [filters, setFilters] = useState({ sector: "", nqfLevel: "", location: "", type: "" });
  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const clearFilters = () => { setFilters({ sector: "", nqfLevel: "", location: "", type: "" }); setSearchInput(""); setActiveTab("all"); };

  const baseJobs = activeTab === "saved" ? jobs.filter(j => savedJobs.includes(j.id)) : jobs;

  const filteredJobs = baseJobs.filter((job) => {
    const sectorMatch        = filters.sector   === "" || job.sector    === filters.sector;
    const nqfMatch           = filters.nqfLevel === "" || job.nqf_level === filters.nqfLevel;
    const locationMatch      = filters.location === "" || job.location  === filters.location;
    const typeMatch          = filters.type     === "" || job.type      === filters.type;
    const searchMatch        = searchInput === "" ||
      job.title?.toLowerCase().includes(searchInput.toLowerCase()) ||
      job.sector?.toLowerCase().includes(searchInput.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchInput.toLowerCase()) ||
      (job.company_name || "").toLowerCase().includes(searchInput.toLowerCase());
    const locationQueryMatch = locationQuery === "" ||
      job.location?.toLowerCase().includes(locationQuery.toLowerCase());
    return sectorMatch && nqfMatch && locationMatch && typeMatch && searchMatch && locationQueryMatch;
  });

  const hasActiveFilters = Object.values(filters).some((v) => v !== "" && !v.startsWith("All")) || searchInput !== "";

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

  const handleSignOut = () => {
    const ok = window.confirm("Are you sure you want to sign out?");
    if (ok) signOut(auth).then(() => navigate("/"));
  };

  return (
    <div className="home-wrapper">

      {/* ── WELCOME BANNER ── */}
      {showWelcomeBanner && (
        <div className="welcome-banner">
          <span className="welcome-wave">👋</span>
          <span>{getGreeting()}, <strong>{displayName.split(" ")[0]}</strong>! Welcome back to SkillsBridge SA.</span>
          <button className="welcome-close" onClick={() => setShowWelcomeBanner(false)}>✕</button>
        </div>
      )}

      {/* ── PROFILE COMPLETION NUDGE ── */}
      {completion < 100 && completion > 0 && activeView === "opportunities" && (
        <div className="completion-bar-wrapper" onClick={() => navigate("/edit-profile")}>
          <div className="completion-bar-inner">
            <div className="completion-bar-text">
              <span>Profile {completion}% complete</span>
              <span className="completion-cta">Complete your profile to apply faster →</span>
            </div>
            <div className="completion-track">
              <div className="completion-fill" style={{ width: `${completion}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <header className="home-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">SkillsBridge<span className="logo-accent">SA</span></span>
          </div>

          <nav className="header-nav">
            <span className={`nav-link ${activeView === "opportunities" ? "active" : ""}`}
              onClick={() => setActiveView("opportunities")}>
              Opportunities
            </span>
            <span className="nav-link ai-nav-link"
              onClick={() => navigate("/ai-recommendations")}>
              ✨ AI Match
            </span>
            <span className={`nav-link ${activeView === "applications" ? "active" : ""}`}
              onClick={() => setActiveView("applications")}>
              My Applications
              {applications.length > 0 && <span className="nav-badge">{applications.length}</span>}
            </span>
          </nav>

        

          {/* Notification Bell */}
          <div className="notif-wrapper" ref={notifRef}>
            <div className="notif-bell"
              onClick={() => { setShowNotifications((prev) => !prev); if (!showNotifications) fetchNotifications(); }}>
              <span className="notif-bell-icon">🔔</span>
              {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
            </div>

            {showNotifications && (
              <div className="notif-dropdown">
                <div className="notif-header">
                  <span className="notif-title">Notifications</span>
                  <div style={{ display: "flex", gap: 12 }}>
                    {unreadCount > 0 && <span className="notif-mark-read" onClick={markAllRead}>Mark all read</span>}
                  </div>
                </div>
                {notifsLoading ? (
                  <div className="notif-empty"><p>Loading...</p></div>
                ) : notifications.length === 0 ? (
                  <div className="notif-empty">
                    <span className="notif-empty-icon">🔔</span>
                    <p>No notifications yet</p>
                    <span style={{ fontSize: 12, color: "#718096" }}>Apply for opportunities to get started</span>
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
                          <span className="notif-time">{timeAgo(n.created_at)}</span>
                        </div>
                        <button className="notif-dismiss" onClick={() => deleteNotification(n.id)} title="Dismiss">✕</button>
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
                  <div className="popup-avatar-large">{initials}</div>
                  <p className="popup-name">{displayName}</p>
                  <p className="popup-email">{currentUser?.email}</p>

                  {/* Profile completion ring */}
                  <div className="popup-completion">
                    <div className="completion-ring">
                      <svg viewBox="0 0 36 36" width="56" height="56">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3"/>
                        <circle cx="18" cy="18" r="15" fill="none" stroke="#00c853" strokeWidth="3"
                          strokeDasharray={`${completion * 0.942} 94.2`}
                          strokeLinecap="round"
                          transform="rotate(-90 18 18)"
                        />
                        <text x="18" y="22" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0a1628">{completion}%</text>
                      </svg>
                    </div>
                    <div>
                      <p className="completion-label">Profile strength</p>
                      <p className="completion-sublabel">{completion < 100 ? "Complete to apply faster" : "Profile complete ✓"}</p>
                    </div>
                  </div>

                  <span className="popup-edit"
                    onClick={() => { setShowPopup(false); navigate("/edit-profile"); }}>
                    Edit Profile →
                  </span>
                </div>
                <div className="popup-divider" />

                {/* Quick stats */}
                <div className="popup-stats">
                  <div className="popup-stat">
                    <span className="popup-stat-num">{applications.length}</span>
                    <span className="popup-stat-label">Applied</span>
                  </div>
                  <div className="popup-stat-divider" />
                  <div className="popup-stat">
                    <span className="popup-stat-num">{applications.filter(a => a.status?.toLowerCase() === "shortlisted").length}</span>
                    <span className="popup-stat-label">Shortlisted</span>
                  </div>
                  <div className="popup-stat-divider" />
                  <div className="popup-stat">
                    <span className="popup-stat-num">{savedJobs.length}</span>
                    <span className="popup-stat-label">Saved</span>
                  </div>
                </div>

                <div className="popup-divider" />
                <div className="popup-menu">
                  
                  <div className="popup-menu-item" onClick={() => { setShowPopup(false); navigate("/edit-profile"); }}>
                    <span className="popup-menu-icon">⚙️</span><span>Settings & Profile</span>
                  </div>
                  <div className="popup-menu-item" onClick={() => {
                    setShowPopup(false);
                    window.alert("SkillsBridge SA\n\nVersion 1.0.0\n\nConnecting South African youth with SETA-accredited learnerships, apprenticeships, and internships from top employers nationwide.\n\nBuilt by Code-Crafters Team · 2026");
                  }}>
                    <span className="popup-menu-icon">ℹ️</span><span>About SkillsBridge SA</span>
                  </div>
                  <div className="popup-menu-item" onClick={() => {
                    setShowPopup(false);
                    window.alert("Help & Support\n\n• To apply: Complete your profile first, then click 'Apply Now' on any opportunity.\n• Notifications: Check the bell icon for status updates.\n• AI Match: Use the ✨ AI Match feature for personalised recommendations.\n• Email: skillsbridgesa@gmail.com");
                  }}>
                    <span className="popup-menu-icon">❓</span><span>Help & Support</span>
                  </div>
                  <div className="popup-menu-item popup-signout" onClick={handleSignOut}>
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

              {/* ── HERO SEARCH BAR ── */}
              <div className="hero-search">
                <span className="hero-search-icon">🔍</span>
                <input
                  ref={searchRef}
                  className="hero-search-input"
                  placeholder="Search by job title, sector, company or location..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                {searchInput && (
                  <button className="hero-search-clear" onClick={() => setSearchInput("")}>✕</button>
                )}
            
              </div>


              <div className="hero-stats">
                <div className="stat"><span className="stat-num">{jobs.length}</span><span className="stat-label">Opportunities</span></div>
                <div className="stat-divider"/>
                <div className="stat"><span className="stat-num">{[...new Set(jobs.map(j => j.sector))].length}</span><span className="stat-label">Sectors</span></div>
                <div className="stat-divider"/>
                <div className="stat">
                  <span className="stat-num">{jobs.filter(j => daysUntil(j.closing_date) !== null && daysUntil(j.closing_date) >= 0).length}</span>
                  <span className="stat-label">Still Open</span>
                </div>
                <div className="stat-divider"/>
                <div className="stat"><span className="stat-num">{savedJobs.length}</span><span className="stat-label">Saved</span></div>
              </div>
            </div>
            <div className="hero-pattern"/>
          </section>

          <main className="main-content">

            {/* ── Tab: All / Saved ── */}
            <div className="view-tabs">
              <button className={`view-tab ${activeTab === "all" ? "view-tab-active" : ""}`} onClick={() => setActiveTab("all")}>
                All Opportunities <span className="tab-count">{jobs.length}</span>
              </button>
              <button className={`view-tab ${activeTab === "saved" ? "view-tab-active" : ""}`} onClick={() => setActiveTab("saved")}>
                🔖 Saved <span className="tab-count">{savedJobs.length}</span>
              </button>
            </div>

            <div className="filter-section">
              <div className="filter-header">
                <h2 className="filter-title">Filter Opportunities</h2>
                {hasActiveFilters && <button className="clear-btn" onClick={clearFilters}>✕ Clear all</button>}
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
                {searchInput && <span className="search-query-tag"> for "<strong>{searchInput}</strong>"</span>}
              </span>
            </div>

            {loading ? (
              <div className="job-grid">
                {[1,2,3,4,5,6].map((i) => <SkeletonCard key={i} />)}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">{activeTab === "saved" ? "🔖" : "🔍"}</span>
                <h3>{activeTab === "saved" ? "No saved opportunities yet" : "No opportunities found"}</h3>
                <p>{activeTab === "saved" ? "Tap the bookmark icon on any listing to save it." : searchInput ? `No results for "${searchInput}". Try a different search term.` : "Try adjusting your filters."}</p>
                <button className="clear-btn-lg" onClick={clearFilters}>Clear all filters</button>
              </div>
            ) : (
              <div className="job-grid">
                {filteredJobs.map((job, index) => {
                  const days          = daysUntil(job.closing_date);
                  const isClosingSoon = days !== null && days >= 0 && days <= 3;
                  const isExpired     = days !== null && days < 0;
                  const isSaved       = savedJobs.includes(job.id);
                  return (
                    <div
                      key={job.id}
                      className={`job-card ${isExpired ? "job-card-expired" : ""}`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                      onClick={() => !isExpired && navigate(`/applicant/job/${job.id}`, { state: { job } })}
                    >
                      {isClosingSoon && !isExpired && (
                        <div className="closing-ribbon">⏰ Closing in {days} day{days === 1 ? "" : "s"}</div>
                      )}
                      {isExpired && <div className="expired-ribbon">Closed</div>}

                      <div className="card-top">
                        <div className="company-logo">
                          {job.title ? job.title.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span className="type-badge"
                            style={{ background: TYPE_COLORS[job.type]?.bg || "#f0f0f0", color: TYPE_COLORS[job.type]?.text || "#333" }}>
                            {job.type || "Opportunity"}
                          </span>
                          {/* Save/bookmark button */}
                          <button
                            className={`save-job-btn ${isSaved ? "save-job-btn-active" : ""}`}
                            onClick={(e) => toggleSaveJob(e, job.id)}
                            title={isSaved ? "Remove from saved" : "Save opportunity"}
                          >
                            {isSaved ? "🔖" : "🏷"}
                          </button>
                        </div>
                      </div>
                      <h3 className="card-title">{job.title}</h3>
                      <p className="card-company">{job.company_name || job.company || job.sector}</p>
                      <div className="card-tags">
                        <span className="tag tag-sector">{job.sector}</span>
                        <span className="tag tag-nqf">{job.nqf_level}</span>
                      </div>
                      <div className="card-details">
                        <div className="detail-row"><span className="detail-icon">📍</span><span>{job.location}</span></div>
                        <div className="detail-row"><span className="detail-icon">💰</span><span>{job.stipend}</span></div>
                        <div className="detail-row"><span className="detail-icon">⏱</span><span>{job.duration}</span></div>
                        <div className="detail-row">
                          <span className="detail-icon">📅</span>
                          <span style={{ color: isClosingSoon ? "#e65100" : isExpired ? "#c53030" : "inherit" }}>
                            {isExpired ? "Closed" : `Closes ${job.closing_date ? new Date(job.closing_date).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }) : "N/A"}`}
                          </span>
                        </div>
                      </div>
                      <div className="card-footer">
                        <span className="spots">{job.nqf_level || "Open"}</span>
                        <span className="view-btn">{isExpired ? "View Details" : "Apply Now →"}</span>
                      </div>
                    </div>
                  );
                })}
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
                <div className="stat-divider"/>
                <div className="stat">
                  <span className="stat-num">{applications.filter(a => a.status?.toLowerCase() === "pending").length}</span>
                  <span className="stat-label">Pending</span>
                </div>
              </div>
            </div>
            <div className="hero-pattern"/>
          </section>

          <main className="main-content">
            <div className="filter-section">
              <div className="filter-header">
                <h2 className="filter-title">Filter by Status</h2>
                {statusFilter !== "All" && <button className="clear-btn" onClick={() => setStatusFilter("All")}>✕ Clear</button>}
              </div>
              <div className="status-filter-pills">
                {STATUSES.map((s) => (
                  <button key={s}
                    className={`status-pill ${statusFilter === s ? "status-pill-active" : ""}`}
                    onClick={() => setStatusFilter(s)}
                    style={statusFilter === s && STATUS_COLORS[s] ? {
                      background: STATUS_COLORS[s].bg, color: STATUS_COLORS[s].text, borderColor: STATUS_COLORS[s].text,
                    } : {}}>
                    {s}
                    {s !== "All" && (
                      <span className="pill-count">
                        {applications.filter(a => a.status?.toLowerCase() === s.toLowerCase()).length}
                      </span>
                    )}
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
              <div className="job-grid">{[1,2,3].map((i) => <SkeletonCard key={i} />)}</div>
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
                    <div key={app.id || index} className="job-card" style={{ animationDelay: `${index * 0.05}s` }}>
                      <div className="app-status-banner" style={{ background: colors.bg, color: colors.text }}>
                        <span className="app-status-dot" style={{ background: colors.text }}/>
                        <strong>{status}</strong>
                        {status === "Accepted" && <span style={{ marginLeft: "auto" }}>🎉</span>}
                        {status === "Shortlisted" && <span style={{ marginLeft: "auto" }}>⭐</span>}
                      </div>
                      <div className="card-top">
                        <div className="company-logo">{app.title ? app.title.charAt(0).toUpperCase() : "?"}</div>
                        <span className="type-badge"
                          style={{ background: TYPE_COLORS[app.type]?.bg || "#f0f0f0", color: TYPE_COLORS[app.type]?.text || "#333" }}>
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
                        <div className="detail-row"><span className="detail-icon">📅</span>
                          <span>Closes {app.closing_date ? new Date(app.closing_date).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }) : "N/A"}</span>
                        </div>
                      </div>
                      <div className="card-footer">
                        <span className="spots" style={{ background: colors.bg, color: colors.text }}>{status}</span>
                        <span className="app-applied-date">Applied {app.applied_at ? timeAgo(app.applied_at) : "recently"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── SCROLL TO TOP ── */}
      {showScrollTop && (
        <button className="scroll-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑</button>
      )}

      {/* ── CONFETTI KEYFRAME (injected once) ── */}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export { triggerConfetti };
export default ApplicantHome;
