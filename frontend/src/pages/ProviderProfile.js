/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import './ProviderProfile.css';
import { useNavigate } from 'react-router-dom';
import SA_SECTORS from '../constants/sectors';

function ProviderProfile() {
  const navigate = useNavigate();

  const loggedInUser = JSON.parse(localStorage.getItem("user")) || {};
  const email = loggedInUser.email || '';
  const initials = email ? email.slice(0, 2).toUpperCase() : 'P';

  const [provinces, setProvinces] = useState([]);
  const [provincesLoading, setProvincesLoading] = useState(false);

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
  const [isFirstSetup, setIsFirstSetup] = useState(false);

  // Fetch SA provinces
  useEffect(() => {
    setProvincesLoading(true);
    fetch('https://countriesnow.space/api/v0.1/countries/states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: 'South Africa' })
    })
      .then(res => res.json())
      .then(data => {
        const stateNames = data.data?.states?.map(s => s.name) || [];
        setProvinces(stateNames);
        setProvincesLoading(false);
      })
      .catch(() => setProvincesLoading(false));
  }, []);

  // Fetch existing provider profile
  useEffect(() => {
    if (!email) { setLoading(false); return; }

    fetch(`${process.env.REACT_APP_API_URL}/provider-profile`)
      .then(res => res.json())
      .then(providers => {
        const me = providers.find(p => p.email === email);
        if (me) {
          setProfile({
            company_name:   me.company_name   || '',
            contact_person: me.contact_person || '',
            phone:          me.phone          || '',
            industry:       me.industry       || '',
            website:        me.website        || '',
            address:        me.address        || '',
            province:       me.province       || ''
          });
          if (!me.company_name) setIsFirstSetup(true);
        } else {
          setIsFirstSetup(true);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

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
            name: profile.company_name || profile.contact_person || currentUser.name,
            company_name: profile.company_name || '',
            contact_person: profile.contact_person || ''
          }));
          if (isFirstSetup) {
            setIsFirstSetup(false);
            setTimeout(() => navigate('/provider'), 1500);
          }
        }
      })
      .catch(() => setMessage('Something went wrong, try again'));
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-state">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">

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

      <section className="profile-hero">
        <div className="profile-hero-inner">
          <p className="hero-eyebrow">Provider Portal</p>
          <h1 className="hero-title">
            {isFirstSetup ? <>Complete Your <span>Setup</span></> : <>My <span>Profile</span></>}
          </h1>
          <p className="hero-sub">
            {isFirstSetup
              ? 'Fill in your company details to submit your provider application to the admin.'
              : 'Manage your company information and contact details.'}
          </p>
        </div>
        <div className="hero-pattern" />
      </section>

      {isFirstSetup && (
        <div style={{
          maxWidth: 700, margin: '24px auto 0', padding: '14px 20px',
          background: '#e6f4ea', border: '1px solid #00c853',
          borderRadius: 8, color: '#1b5e20', fontSize: 14
        }}>
          👋 Welcome! Please complete your company profile below. Once saved, your application will be sent to our admin team for review.
        </div>
      )}

      <main className="profile-main">
        <form className="profile-card" onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Email</label>
            <div className="email-row">{email}</div>
          </div>

          <div className="form-group">
            <label htmlFor="company_name">Company Name *</label>
            <input
              type="text"
              id="company_name"
              name="company_name"
              value={profile.company_name}
              onChange={handleChange}
              placeholder="e.g. Acme Corporation"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contact_person">Contact Person *</label>
              <input
                type="text"
                id="contact_person"
                name="contact_person"
                value={profile.contact_person}
                onChange={handleChange}
                placeholder="e.g. Jane Doe"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="number"
                id="phone"
                name="phone"
                value={profile.phone}
                onChange={(e) => {
                  const digits = e.target.value.slice(0, 10);
                  setProfile({ ...profile, phone: digits });
                }}
                placeholder="e.g. 0711234567"
                onKeyDown={(e) => {
                  if (['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault();
                }}
                required
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
                <option value="">Select Sector</option>
                {SA_SECTORS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
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
                <option value="">{provincesLoading ? 'Loading provinces...' : 'Select Province'}</option>
                {provinces.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="save-btn">
            {isFirstSetup ? 'Submit Application →' : 'Save Profile'}
          </button>

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