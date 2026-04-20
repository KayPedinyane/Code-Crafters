/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from 'react';
import './MyListings.css';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

function MyListings() {
  const navigate = useNavigate();

  // ── User from localStorage ──
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Provider" };
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "P";

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

  // ── Listings state ──
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Modal state ──
  const [selected, setSelected] = useState(null);
  const [modalTab, setModalTab] = useState(null);

  // ── Applicants state ──
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [applicantProfile, setApplicantProfile] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const [notification, setNotification] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const uid = user?.uid;

    if (!uid) { setLoading(false); return; }

    fetch(`${process.env.REACT_APP_API_URL}/api/user/${uid}`)
      .then(res => res.json())
      .then(userData => {
        const pid = userData.id;
        return fetch(`${process.env.REACT_APP_API_URL}/opportunities/provider/${pid}`);
      })
      .then(res => res.json())
      .then(data => { setListings(data); setLoading(false); })
      .catch(err => { console.error('Error:', err); setLoading(false); });
  }, []);

  // ── Fetch applicants for selected job ──
  const fetchApplicants = () => {
    if (!selected) return;
    setApplicantsLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/applications/opportunities/${selected.id}`)
      .then(res => res.json())
      .then(data => {
        setApplicants(Array.isArray(data) ? data : []);
        setApplicantsLoading(false);
      })
      .catch(() => setApplicantsLoading(false));
  };

  //Fetch applicant profile when selectedApplicant changes
  const fetchApplicantProfile = (email,applicant) => {
    fetch(`${process.env.REACT_APP_API_URL}/profile/${email}`)
      .then(res => res.json())
      .then(data => {
        setApplicantProfile(data);
        setSelectedApplicant(applicant);
      })
      .catch(() => setSelectedApplicant(null));
  };
  
  // ── Update application status ──
  const updateStatus = (applicationId, newStatus) => {
    fetch(`${process.env.REACT_APP_API_URL}/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(() => fetchApplicants()); // refresh list after update
  };

 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (modalTab === "applicants" && selected) {
      fetchApplicants();
    }
  }, [modalTab, selected]);

  // ── Open modal, reset to details tab ──
  const openModal = (job) => {
    setSelected(job);
    setModalTab("details");
    setApplicants([]);
  };

  // ── Status badge helper ──
  const statusClass = (status) => {
    if (status === 'approved')    return 'status-badge status-approved';
    if (status === 'removed')     return 'status-badge status-removed';
    return 'status-badge status-pending';
  };

  const appStatusColors = {
    pending:     { bg: "#fff3e0", text: "#e65100" },
    shortlisted: { bg: "#e3f2fd", text: "#1565c0" },
    accepted:    { bg: "#e8f5e9", text: "#2e7d32" },
    rejected:    { bg: "#fff5f5", text: "#c53030" },
  };

  // ── Fetch notifications ──
  const fetchNotifications = () => {
  fetch(`${process.env.REACT_APP_API_URL}/notifications/${user.email}`)
    .then(res => res.json())
    .then(data => setNotification(Array.isArray(data) ? data : []))
    .catch(() => {});
  };

  const markAsRead = (notificationId) => {
  fetch(`${process.env.REACT_APP_API_URL}/notifications/${notificationId}/read`, {
    method: 'PATCH'
  }).then(() => fetchNotifications());
  };

  useEffect(() => { fetchNotifications(); }, []);

  return (
    <div className="listings-container">

      {/* ── HEADER ── */}
      <header className="listings-header">
        <div className="header-inner">

          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">
              SkillsBridge<span className="logo-accent">SA</span>
            </span>
          </div>

          <nav className="header-nav">
            <span className="nav-link" onClick={() => navigate('/provider')}>Dashboard</span>
            <span className="nav-link active">My Listings</span>
            <span className="nav-link" onClick={() => navigate('/post-opportunity')}>Post Opportunity</span>
          </nav>

          {/* Profile chip with popup */}
          <div className="profile-chip-wrapper" ref={popupRef}>
            <div className="profile-chip" onClick={() => setShowPopup((prev) => !prev)}>
              <div className="chip-avatar">{initials}</div>
              <div className="chip-info">
                <span className="chip-name">{user.name}</span>
                <span className="chip-role">Provider</span>
              </div>
              <span className="chip-arrow">{showPopup ? "⌃" : "›"}</span>
            </div>

            {showPopup && (
              <div className="profile-popup">
                <div className="popup-top">
                  <div className="popup-avatar">{initials}</div>
                  <p className="popup-name">{user.name}</p>
                  <p className="popup-email">{user.email}</p>
                  <span className="popup-edit"
                    onClick={() => { setShowPopup(false); navigate("/provider-profile"); }}>
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

                  <div className="popup-menu-item" onClick={() => { setShowPopup(false); setShowNotification(true); }}>
                  <span className="popup-menu-icon">🔔</span><span>Notifications</span>
                  </div>

                  <div className="popup-menu-item popup-signout"
                    onClick={() => auth.signOut().then(() => { localStorage.clear(); navigate('/'); })}>
                    <span className="popup-menu-icon">↩</span><span>Sign out</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* ── HERO ── */}
      <section className="listings-hero">
        <div className="listings-hero-inner">
          <p className="hero-eyebrow">Provider Portal</p>
          <h1 className="hero-title">My <span>Listings</span></h1>
          <p className="hero-sub">View and manage all opportunities you have posted.</p>
        </div>
        <div className="hero-pattern" />
      </section>

      {/* ── MAIN ── */}
      <main className="listings-main">

        <div className="results-bar">
          <span className="results-count">
            <strong>{listings.length}</strong> opportunit{listings.length === 1 ? 'y' : 'ies'} posted
          </span>
          <button className="post-btn" onClick={() => navigate('/post-opportunity')}>
            + Post New
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            <span className="empty-icon">⏳</span>
            <h3>Loading your listings...</h3>
            <p>Fetching your posted opportunities</p>
          </div>

        ) : listings.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <h3>No listings yet</h3>
            <p>You haven't posted any opportunities yet.</p>
            <button className="post-btn" onClick={() => navigate('/post-opportunity')}>
              Post your first opportunity
            </button>
          </div>

        ) : (
          <div className="listings-grid">
            {listings.map((job, index) => (
              <div
                key={job.id}
                className="listing-card"
                style={{ animationDelay: `${index * 0.07}s` }}
                onClick={() => openModal(job)}
              >
                <div className="card-top">
                  <div className="company-logo">
                    {job.title ? job.title.charAt(0).toUpperCase() : '?'}
                  </div>
                  <span className={statusClass(job.status)}>
                    {job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : 'Pending'}
                  </span>
                </div>

                <h3 className="card-title">{job.title}</h3>
                <p className="card-sector">{job.sector}</p>

                <div className="card-tags">
                  <span className="tag tag-sector">{job.sector}</span>
                  <span className="tag tag-nqf">{job.nqf_level}</span>
                </div>

                <div className="card-details">
                  <div className="detail-row"><span className="detail-icon">📍</span><span>{job.location}</span></div>
                  <div className="detail-row"><span className="detail-icon">💰</span><span>R{job.stipend}</span></div>
                  <div className="detail-row"><span className="detail-icon">⏱</span><span>{job.duration}</span></div>
                  <div className="detail-row"><span className="detail-icon">📅</span><span>Closes {job.closing_date ? new Date(job.closing_date).toLocaleDateString("en-ZA") : "N/A"}</span></div>
                </div>

                <div className="card-footer">
                  <span className="tag tag-nqf">{job.nqf_level}</span>
                  <span className="view-btn">View Details →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── APPLICANT PROFILE MODAL ── */}
        {selectedApplicant && applicantProfile && (
          <div className="modal-overlay" onClick={() => { setSelectedApplicant(null); setApplicantProfile(null); }}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>

                <div className="modal-header">
                  <h2 className="modal-title">{applicantProfile.full_name || selectedApplicant.applicant_email}</h2>
                  <button className="modal-close" onClick={() => { setSelectedApplicant(null); setApplicantProfile(null); }}>✕</button>
                </div>

            <div className="modal-divider" />

            <div className="modal-grid">
              <div className="modal-section">
                <span className="modal-label">Email</span>
                <span className="modal-value">{applicantProfile.email}</span>
            </div>
            <div className="modal-section">
              <span className="modal-label">Phone</span>
              <span className="modal-value">{applicantProfile.phone || 'N/A'}</span>
            </div>
            <div className="modal-section">
              <span className="modal-label">City</span>
              <span className="modal-value">{applicantProfile.city || 'N/A'}</span>
            </div>
            <div className="modal-section">
              <span className="modal-label">Province</span>
              <span className="modal-value">{applicantProfile.province || 'N/A'}</span>
            </div>
            <div className="modal-section">
              <span className="modal-label">Qualification</span>
              <span className="modal-value">{applicantProfile.qualification || 'N/A'}</span>
            </div>
          <div className="modal-section">
              <span className="modal-label">Institution</span>
              <span className="modal-value">{applicantProfile.institution || 'N/A'}</span>
          </div>
          <div className="modal-section">
              <span className="modal-label">Year Completed</span>
              <span className="modal-value">{applicantProfile.year_completed || 'N/A'}</span>
          </div>
          <div className="modal-section">
              <span className="modal-label">NQF Level</span>
              <span className="modal-value">{applicantProfile.nqf_level || 'N/A'}</span>
          </div>
        </div>

        <div className="modal-divider" />

        <div className="modal-section">
            <span className="modal-label">Subjects</span>
            <span className="modal-value">{applicantProfile.subjects || 'N/A'}</span>
        </div>

        <div className="modal-section">
            <span className="modal-label">Skills</span>
        <   span className="modal-value">{applicantProfile.skills || 'N/A'}</span>
        </div>

        {applicantProfile.cv_url && (
            <div className="modal-section">
            <span className="modal-label">CV</span>
          
            <a href={applicantProfile.cv_url || '#'}
            target="_blank"
            rel="noreferrer"
            className="cv-link"
            >
            View CV →
            </a>
          </div>
        )}

        <div className = "modal-divider" />

        <div className = "applicants-actions" style = {{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              className="action-btn action-accept"
              onClick={() => {
                updateStatus(selectedApplicant.id, "accepted");
                setSelectedApplicant(null);
                setApplicantProfile(null);
              
              }}
            >
              Accept
            </button>
            <button
              className="action-btn action-shortlist"
              onClick={() => {
                updateStatus(selectedApplicant.id, "shortlisted");
                setSelectedApplicant(null);
                setApplicantProfile(null);
              }}
            >
              Shortlist
            </button>
            <button  className="action-btn action-reject"
              onClick={() => {
                updateStatus(selectedApplicant.id, "rejected");
                setSelectedApplicant(null);
                setApplicantProfile(null);
              }}
            >
              Reject
            </button>

          </div>
        </div>


      </div>
      
      )}

      </main>

      {/* ── MODAL ── */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>

            {/* Modal header */}
            <div className="modal-header">
              <h2 className="modal-title">{selected.title}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>

            {/* Tabs */}
            <div className="modal-tabs">
              <button
                className={`modal-tab ${modalTab === "details" ? "modal-tab-active" : ""}`}
                onClick={() => setModalTab("details")}
              >
                Details
              </button>
              <button
                className={`modal-tab ${modalTab === "applicants" ? "modal-tab-active" : ""}`}
                onClick={() => setModalTab("applicants")}
              >
                Applicants
                {applicants.length > 0 && (
                  <span className="tab-badge">{applicants.length}</span>
                )}
              </button>
            </div>

            {/* ── DETAILS TAB ── */}
            {modalTab === "details" && (
              <>
                <div className="modal-badges">
                  <span className={statusClass(selected.status)}>
                    {selected.status ? selected.status.charAt(0).toUpperCase() + selected.status.slice(1) : 'Pending'}
                  </span>
                  <span className="tag tag-sector">{selected.sector}</span>
                  <span className="tag tag-nqf">{selected.nqf_level}</span>
                </div>

                <div className="modal-divider" />

                <div className="modal-grid">
                  <div className="modal-section">
                    <span className="modal-label">Location</span>
                    <span className="modal-value">📍 {selected.location}</span>
                  </div>
                  <div className="modal-section">
                    <span className="modal-label">Stipend</span>
                    <span className="modal-value">💰 R{selected.stipend}</span>
                  </div>
                  <div className="modal-section">
                    <span className="modal-label">Duration</span>
                    <span className="modal-value">⏱ {selected.duration}</span>
                  </div>
                  <div className="modal-section">
                    <span className="modal-label">Closing Date</span>
                    <span className="modal-value">📅 {selected.closing_date ? new Date(selected.closing_date).toLocaleDateString("en-ZA") : "N/A"}</span>
                  </div>
                </div>

                <div className="modal-divider" />

                <div className="modal-section">
                  <span className="modal-label">Description</span>
                  <span className="modal-value">{selected.description}</span>
                </div>

                <div className="modal-section">
                  <span className="modal-label">Requirements</span>
                  <span className="modal-value">{selected.requirements}</span>
                </div>
              </>
            )}

            {/* ── APPLICANTS TAB ── */}
            {modalTab === "applicants" && (
              <div className="applicants-list">
                {applicantsLoading ? (
                  <div className="empty-state">
                    <span className="empty-icon">⏳</span>
                    <h3>Loading applicants...</h3>
                  </div>

                ) : applicants.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">👥</span>
                    <h3>No applicants yet</h3>
                    <p>No one has applied for this opportunity yet.</p>
                  </div>

                ) : (
                  applicants.map((app) => {
                    const colors = appStatusColors[app.status] || appStatusColors.pending;
                    return (
                      <div key={app.id} className="applicant-row">
                        <div className="applicant-avatar">
                          {app.applicant_email ? app.applicant_email[0].toUpperCase() : '?'}
                        </div>
                        <div className="applicant-info">
                          <span className="applicant-email">{app.applicant_email}</span>
                          <span className="applicant-date">
                            Applied {app.applied_at ? new Date(app.applied_at).toLocaleDateString("en-ZA") : "recently"}
                          </span>
                        </div>
                        <span
                          className="applicant-status"
                          style={{ background: colors.bg, color: colors.text }}
                        >
                          {app.status || "pending"}
                        </span>
                        
                          <button
                            className="action-btn action-view"
                            onClick={() =>  {
                              fetchApplicantProfile(app.applicant_email,app);
                              setSelected(null);
                            }}
                          >
                          View Profile
                          </button>
                        </div>
                    
                    );
                  })
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {showNotification && (
    <div className="modal-overlay" onClick={() => setShowNotification(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Notifications</h2>
          <button className="modal-close" onClick={() => setShowNotification(false)}>✕</button>
        </div>
        <ul className="notif-list">
          {notification.length === 0 ? (
            <p className="notif-empty">No notifications yet</p>
          ) : notification.map((notif) => (
            <li key={notif.id} className={`notif-item ${!notif.is_read ? 'notif-unread' : ''}`}
              onClick={() => markAsRead(notif.id)}>
              <p className="notif-message">{notif.message}</p>
              <time className="notif-time">{new Date(notif.created_at).toLocaleDateString("en-ZA")}</time>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )}

    </div>
  );
}

export default MyListings;
