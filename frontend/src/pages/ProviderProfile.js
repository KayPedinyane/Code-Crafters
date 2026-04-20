/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import './ProviderProfile.css';
import { useNavigate } from 'react-router-dom';

function ProviderProfile() {
  const navigate = useNavigate();

  // ── Get logged in user from localStorage ──
  const loggedInUser = JSON.parse(localStorage.getItem("user")) || {};
  const email = loggedInUser.email || '';
  const initials = email ? email.slice(0, 2).toUpperCase() : 'P';

  // ── State ──
  const [profile, setProfile] = useState({
    company_name: '',
    contact_person: '',
    phone: '',
    industry: '',
    website: '',
    address: '',
    province: ''
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }

    fetch(`${process.env.REACT_APP_API_URL}/provider-profile/${email}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setProfile({
            company_name:   data.company_name   || '',
            contact_person: data.contact_person || '',
            phone:          data.phone          || '',
            industry:       data.industry       || '',
            website:        data.website        || '',
            address:        data.address        || '',
            province:       data.province       || ''
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // ── handleChange ──
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // ── handleSubmit ──
  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');

    fetch(`${process.env.REACT_APP_API_URL}/provider-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, ...profile })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setMessage(`Error: ${data.error}`);
        } else {
          setMessage('Profile saved successfully!');
          const currentUser = JSON.parse(localStorage.getItem("user")) || {};
          localStorage.setItem("user", JSON.stringify({
            ...currentUser,
            name: profile.company_name || currentUser.name
          }));
        }
      })
      .catch(() => setMessage('Something went wrong, try again'));
  };

  // ── Show loading while fetching ──
  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-state">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">

      {/* ── HEADER ── */}
      <header className="profile-header">
        <div className="header-inner">

          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">
              SkillsBridge<span className="logo-accent">SA</span>
            </span>
          </div>

          <nav className="header-nav">
            <span className="nav-link" onClick={() => navigate('/provider')}>Dashboard</span>
            <span className="nav-link" onClick={() => navigate('/post-opportunity')}>Post Opportunity</span>
            <span className="nav-link" onClick={() => navigate('/my-listings')}>My Listings</span>
            <span className="nav-link active">Profile</span>
          </nav>

          <div className="profile-chip">
            <div className="chip-avatar">{initials}</div>
            <div className="chip-info">
              <span className="chip-name">{email}</span>
              <span className="chip-role">Provider</span>
            </div>
            <span className="chip-arrow">›</span>
          </div>

        </div>
      </header>

      {/* ── HERO ── */}
      <section className="profile-hero">
        <div className="profile-hero-inner">
          <p className="hero-eyebrow">Provider Portal</p>
          <h1 className="hero-title">My <span>Profile</span></h1>
          <p className="hero-sub">Manage your company information and contact details.</p>
        </div>
        <div className="hero-pattern" />
      </section>

      {/* ── MAIN ── */}
      <main className="profile-main">
        <form className="profile-card" onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Email</label>
            <div className="email-row">{email}</div>
          </div>

          <div className="form-group">
            <label htmlFor="company_name">Company Name</label>
            <input
              type="text"
              id="company_name"
              name="company_name"
              value={profile.company_name}
              onChange={handleChange}
              placeholder="e.g. Acme Corporation"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contact_person">Contact Person</label>
              <input
                type="text"
                id="contact_person"
                name="contact_person"
                value={profile.contact_person}
                onChange={handleChange}
                placeholder="e.g. Jane Doe"
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="e.g. 011 123 4567"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="industry">Industry</label>
              <select
                id="industry"
                name="industry"
                value={profile.industry}
                onChange={handleChange}
              >
                <option value="">Select Industry</option>
                <option value="ICT">ICT</option>
                <option value="Engineering">Engineering</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Retail">Retail</option>
                <option value="Construction">Construction</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="website">Website</label>
              <input
                type="text"
                id="website"
                name="website"
                value={profile.website}
                onChange={handleChange}
                placeholder="e.g. www.company.co.za"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={profile.address}
                onChange={handleChange}
                placeholder="e.g. 123 Main Street, Sandton"
              />
            </div>
            <div className="form-group">
              <label htmlFor="province">Province</label>
              <select
                id="province"
                name="province"
                value={profile.province}
                onChange={handleChange}
              >
                <option value="">Select Province</option>
                <option value="Gauteng">Gauteng</option>
                <option value="Western Cape">Western Cape</option>
                <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                <option value="Eastern Cape">Eastern Cape</option>
                <option value="Limpopo">Limpopo</option>
                <option value="Mpumalanga">Mpumalanga</option>
                <option value="North West">North West</option>
                <option value="Free State">Free State</option>
                <option value="Northern Cape">Northern Cape</option>
              </select>
            </div>
          </div>

          <button type="submit" className="save-btn">Save Profile</button>

          {message && (
            <p className={message.includes('Error') ? 'error-message' : 'success-message'}>
              {message}
            </p>
          )}

        </form>
      </main>

    </div>
  );
}

export default ProviderProfile;