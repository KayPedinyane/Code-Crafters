import React, { useEffect, useState, useRef } from 'react';
import './ProviderHomePage.css';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

function ProviderHomePage() {
  const navigate = useNavigate();
  const [displayText, setDisplayText] = useState('');
  const fullText = "Empowering the next generation of South African talent";

  // ── User from localStorage ──
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Provider" };
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "P";

  // ── Profile popup ──
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);

  //Provider Notifications
  const [notification, setNotification] = useState([]);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    function handleClickOutside(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowPopup(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Typewriter effect ──
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setDisplayText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);

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


  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchNotifications(); }, []);

  return (
    <div className="provider-container">

      {/* ── HEADER ── */}
      <header className="provider-header">
        <div className="header-inner">

          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">
              SkillsBridge<span className="logo-accent">SA</span>
            </span>
          </div>

          <nav className="header-nav">
            <span className="nav-link active">Dashboard</span>
            <span className="nav-link" onClick={() => navigate('/my-listings')}>My Listings</span>
            <span className="nav-link" onClick={() => navigate('/post-opportunity')}>Post Opportunity</span>
          </nav>

          {/* ── PROFILE CHIP WITH POPUP ── */}
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
                  <span
                    className="popup-edit"
                    onClick={() => { setShowPopup(false); navigate("/provider-profile"); }}
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

                  <div className="popup-menu-item" onClick={() => { setShowPopup(false); setShowNotification(true); }}>
                    <span className="popup-menu-icon">🔔</span><span>Notifications</span>
                  </div>

                  <div
                    className="popup-menu-item popup-signout"
                    onClick={() => auth.signOut().then(() => { localStorage.clear(); navigate('/'); })}
                  >
                    <span className="popup-menu-icon">↩</span><span>Sign out</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* ── BANNER ── */}
      <div className="provider-banner">
        <div className="provider-banner-inner">
          <p className="banner-eyebrow">Skills Development Platform</p>
          <h2 className="typewriter-text">
            {displayText}<span className="cursor">|</span>
          </h2>
          <div className="ambient-line"></div>
        </div>
        <div className="banner-pattern"></div>
      </div>

     
      {/* ── WELCOME SECTION ── */}
      <div className="provider-welcome">
        <div className="welcome-inner">
          <div className="welcome-text">
            <h2 className="welcome-title">Welcome back, <span>{user.name}</span> 👋</h2>
            <p className="welcome-sub">Manage your listings, review applicants and grow your talent pipeline.</p>
          </div>
          <button className="welcome-cta" onClick={() => navigate('/post-opportunity')}>
            + Post an Opportunity
          </button>
        </div>

        <div className="quick-cards">
          <div className="quick-card" onClick={() => navigate('/my-listings')}>
            <div className="quick-card-icon">📋</div>
            <div className="quick-card-body">
              <h3>My Listings</h3>
              <p>View and manage all your posted opportunities</p>
            </div>
            <span className="quick-card-arrow">→</span>
          </div>

          <div className="quick-card" onClick={() => navigate('/post-opportunity')}>
            <div className="quick-card-icon">✏️</div>
            <div className="quick-card-body">
              <h3>Post Opportunity</h3>
              <p>Create a new learnership, internship or apprenticeship</p>
            </div>
            <span className="quick-card-arrow">→</span>
          </div>

          <div className="quick-card" onClick={() => { setShowPopup(false); setShowNotification(true); }}>
            <div className="quick-card-icon">🔔</div>
            <div className="quick-card-body">
              <h3>Notifications</h3>
              <p>See who has applied for your opportunities</p>
            </div>
            {notification.filter(n => !n.is_read).length > 0 && (
              <span className="quick-card-badge">
                {notification.filter(n => !n.is_read).length}
              </span>
            )}
          </div>
        </div>
      </div>

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

export default ProviderHomePage;
