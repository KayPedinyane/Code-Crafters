import React, { useEffect, useState } from 'react';
import './ProviderHomePage.css';
import { useNavigate } from 'react-router-dom';

function ProviderHomePage() {
  const navigate = useNavigate();
  const [displayText, setDisplayText] = useState('');
  const fullText = "Empowering the next generation of South African talent";

  // Pull user from localStorage (same pattern as teammate)
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Provider" };
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "P";

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
            <span className="nav-link" onClick={() => navigate('/my-listings')}>
              My Listings
            </span>
          </nav>

          <div className="profile-chip" onClick={() => navigate('/provider-profile')}>
            <div className="chip-avatar">{initials}</div>
            <div className="chip-info">
              <span className="chip-name">{user.name}</span>
              <span className="chip-role">Provider</span>
            </div>
            <span className="chip-arrow">›</span>
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
