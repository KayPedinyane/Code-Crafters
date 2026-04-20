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

      {/* ── ACTIONS ── */}
      <div className="provider-actions">
        <button onClick={() => navigate('/post-opportunity')}>
          POST AN OPPORTUNITY
        </button>
      </div>

    </div>
  );
}

export default ProviderHomePage;
