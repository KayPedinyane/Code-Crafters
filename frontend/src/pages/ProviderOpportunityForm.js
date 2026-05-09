/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import {auth} from '../firebase';
import './ProviderOpportunityForm.css';
import { useNavigate } from 'react-router-dom';


function ProviderOpportunityForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        stipend: '',
        location: '',
        duration: '',
        requirements: '',
        closing_date: '',
        sector: '',
        nqf_level: ''
    });

    const [cities, setCities] = useState([]);
    const [citiesLoading, setCitiesLoading] = useState(false);

    const [notification, setNotification] = useState([]);
    const [showNotification, setShowNotification] = useState(false);

    const[providerStatus, setProviderStatus] = useState(null);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/provider-profile`)
            .then(res => res.json())
            .then(providers => {
                const me = providers.find(p => p.email === user.email);
                if(me){
                    setProviderStatus(me.status);

                }

                else{
                    setProviderStatus('pending');
                }
            })
            .catch(() => setProviderStatus('null'));
    }, []);
            


    const [message, setMessage] = useState('');
    const [displayText, setDisplayText] = useState('');
    const fullText = "Post an Opportunity";

    const user = JSON.parse(localStorage.getItem("user")) || {};
    const [showPopup, setShowPopup] = useState(false);
    const popupRef = useRef(null);
    const initials = user.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "P";

    const detectLocation = () => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
                    .then(res => res.json())
                    .then(data => {
                        const detected = (data.city || data.locality || '').trim();

                        // Match detected city to the cities dropdown (case-insensitive)
                        const match = cities.find(c =>
                            c.toLowerCase() === detected.toLowerCase()
                        );

                        setFormData(prev => ({ ...prev, location: match || detected }));
                    })
                    .catch(() => {});
            },
            () => {}
        );
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setShowPopup(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if(providerStatus !== 'accepted') {
            setMessage('Your provider account is still pending approval. You cannot post opportunities yet.');
            return;
        }

        fetch(`${process.env.REACT_APP_API_URL}/opportunities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: formData.title,
                description: formData.description,
                stipend: formData.stipend,
                location: formData.location,
                duration: formData.duration,
                requirements: formData.requirements,
                closing_date: formData.closing_date,
                provider_id: user.id,
                sector: formData.sector,
                nqf_level: formData.nqf_level
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                setMessage(`Error: ${data.error}`);
            } else {
                setMessage('Opportunity posted successfully!');
            }
        })
        .catch(() => setMessage('Something went wrong, try again'));
    };

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

    useEffect(() => {
        setCitiesLoading(true);
        fetch('https://countriesnow.space/api/v0.1/countries/cities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country: 'South Africa' })
        })
        .then(res => res.json())
        .then(data => {
            if (data.data) setCities(data.data.sort());
        })
        .catch(() => setCities([]))
        .finally(() => setCitiesLoading(false));
    }, []);

    // Auto-detect only after cities are loaded so the match can work
    useEffect(() => {
        if (cities.length > 0) {
            detectLocation();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cities]);

    const NQF_LEVELS = [
        { value: 'NQF 1', label: 'NQF 1 – Grade 9' },
        { value: 'NQF 2', label: 'NQF 2 – Grade 10 / ABET Level 4' },
        { value: 'NQF 3', label: 'NQF 3 – Grade 11' },
        { value: 'NQF 4', label: 'NQF 4 – Grade 12 / Matric' },
        { value: 'NQF 5', label: 'NQF 5 – Higher Certificate' },
        { value: 'NQF 6', label: 'NQF 6 – Diploma / Advanced Certificate' },
        { value: 'NQF 7', label: "NQF 7 – Bachelor's Degree / Advanced Diploma" },
        { value: 'NQF 8', label: 'NQF 8 – Honours / Postgraduate Diploma' },
        { value: 'NQF 9', label: "NQF 9 – Master's Degree" },
        { value: 'NQF 10', label: 'NQF 10 – Doctoral Degree' },
    ];

    return (
        <div className="form-container">

            {/* ── HEADER ── */}
            <header className="form-header">
                <div className="header-inner">

                    <div className="logo">
                        <span className="logo-icon">◈</span>
                        <span className="logo-text">
                            SkillsBridge<span className="logo-accent">SA</span>
                        </span>
                    </div>

                    <nav className="header-nav">
                        <span className="nav-link" onClick={() => navigate('/provider')}>Dashboard</span>
                        <span className="nav-link" onClick={() => navigate('/my-listings')}>My Listings</span>
                        <span className="nav-link active">Post Opportunity</span>
                    </nav>

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

            {/* ── HERO ── */}
            <div className="form-hero">
                <div className="form-hero-inner">
                    <p className="hero-eyebrow">Provider Portal</p>
                    <h2 className="form-title">
                        {displayText}<span className="cursor">|</span>
                    </h2>
                    <div className="ambient-line"></div>
                </div>
                <div className="hero-pattern"></div>
            </div>

            {/* ── FORM ── */}
            <div className="form-body">
                <form className="opportunity-form" onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Junior Developer Learnership" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Describe the opportunity..." />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="stipend">Stipend (R)</label>
                            <input type="text" id="stipend" name="stipend" value={formData.stipend} onChange={handleChange} placeholder="e.g. R3000/month" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="location">Location</label>
                            <select
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                            >
                                <option value="">
                                    {citiesLoading ? 'Loading cities...' : 'Select City'}
                                </option>
                                {cities.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={detectLocation}
                                style={{ marginTop: '6px', padding: '5px 10px', fontSize: '12px', cursor: 'pointer' }}
                            >
                                Detect Location
                            </button>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="duration">Duration</label>
                            <input type="text" id="duration" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. 12 months" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="closing_date">Closing Date</label>
                            <input type="date" id="closing_date" name="closing_date" value={formData.closing_date} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="sector">Sector</label>
                            <select id="sector" name="sector" value={formData.sector} onChange={handleChange}>
                                <option value="">Select Sector</option>
                                <option value="ICT">ICT</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Finance">Finance</option>
                                <option value="Healthcare">Healthcare</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="nqf_level">NQF Level</label>
                            <select id="nqf_level" name="nqf_level" value={formData.nqf_level} onChange={handleChange}>
                                <option value="">Select NQF Level</option>
                                {NQF_LEVELS.map(level => (
                                    <option key={level.value} value={level.value}>{level.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="requirements">Requirements</label>
                        <textarea id="requirements" name="requirements" value={formData.requirements} onChange={handleChange} placeholder="List the requirements..." />
                    </div>

                    <button type="submit" className="submit-btn" disabled={providerStatus !== 'accepted'} style={{opacity: providerStatus !== 'accepted' ? 0.6 : 1, cursor: providerStatus !== 'accepted' ? 'not-allowed' : 'pointer'  }}>
                        {providerStatus === 'accepted' ? 'Post Opportunity' : 'Pending Approval'}
                    </button>

                </form>
                {message && (
                    <p className={message.includes('Error') ? 'error-message' : 'success-message'}>
                        {message}
                    </p>
                )}
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

export default ProviderOpportunityForm;