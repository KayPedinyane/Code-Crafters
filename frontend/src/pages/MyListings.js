import React, { useEffect, useState } from 'react';
import './MyListings.css';
import { useNavigate } from 'react-router-dom';

function MyListings() {
  const navigate = useNavigate();

  // ── User from localStorage ──
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Provider" };
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "P";

  // ── State ──
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // opportunity shown in modal

  // ── Fetch provider's listings ──
  // provider_id is currently hardcoded as 1 until Firebase UID is linked in the DB
  const PROVIDER_ID = 1;

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/opportunities/provider/${PROVIDER_ID}`)
      .then((res) => res.json())
      .then((data) => {
        setListings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching listings:', err);
        setLoading(false);
      });
  }, []);

  // ── Status badge helper ──
  const statusClass = (status) => {
    if (status === 'approved') return 'status-badge status-approved';
    if (status === 'removed')  return 'status-badge status-removed';
    return 'status-badge status-pending';
  };

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
          </nav>

          <div className="profile-chip" onClick={() => navigate('/profile')}>
            <div className="chip-avatar">{initials}</div>
            <div className="chip-info">
              <span className="chip-name">{user.name}</span>
              <span className="chip-role">Provider</span>
            </div>
            <span className="chip-arrow">›</span>
          </div>

        </div>
      </header>

      {/* ── HERO ── */}
      <section className="listings-hero">
        <div className="listings-hero-inner">
          <p className="hero-eyebrow">Provider Portal</p>
          <h1 className="hero-title">My <span>Opportunity Listings</span></h1>
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

        {/* Loading */}
        {loading ? (
          <div className="empty-state">
            <span className="empty-icon">⏳</span>
            <h3>Loading your listings...</h3>
            <p>Fetching your posted opportunities</p>
          </div>

        /* Empty */
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <h3>No listings yet</h3>
            <p>You haven't posted any opportunities yet.</p>
            <button className="post-btn" onClick={() => navigate('/post-opportunity')}>
              Post your first opportunity
            </button>
          </div>

        /* Grid */
        ) : (
          <div className="listings-grid">
            {listings.map((job, index) => (
              <div
                key={job.id}
                className="listing-card"
                style={{ animationDelay: `${index * 0.07}s` }}
                onClick={() => setSelected(job)}
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
                  <div className="detail-row">
                    <span className="detail-icon">📍</span>
                    <span>{job.location}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">💰</span>
                    <span>R{job.stipend}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">⏱</span>
                    <span>{job.duration}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">📅</span>
                    <span>Closes {job.closing_date}</span>
                  </div>
                </div>

                <div className="card-footer">
                  <span className="tag tag-nqf">{job.nqf_level}</span>
                  <span className="view-btn">View Details →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── DETAIL MODAL ── */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>

            <div className="modal-header">
              <h2 className="modal-title">{selected.title}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>

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
                <span className="modal-value">📅 {selected.closing_date}</span>
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

          </div>
        </div>
      )}

    </div>
  );
}

export default MyListings;
