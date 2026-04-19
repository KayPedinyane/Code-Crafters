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

    const [message, setMessage] = useState('');
    const [displayText, setDisplayText] = useState('');
    const fullText = "Post an Opportunity";

    
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const [showPopup, setShowPopup] = useState(false);
    const popupRef = useRef(null);
    const initials = user.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "P";

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
        console.log('Form data:', JSON.stringify);
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
                        <span className="nav-link active">Post Opportunity</span>
                        <span className="nav-link" onClick={() => navigate('/my-listings')}>My Listings</span>
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
                            <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Johannesburg" />
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
                                <option value="NQF 4">NQF 4</option>
                                <option value="NQF 5">NQF 5</option>
                                <option value="NQF 6">NQF 6</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="requirements">Requirements</label>
                        <textarea id="requirements" name="requirements" value={formData.requirements} onChange={handleChange} placeholder="List the requirements..." />
                    </div>

                    <button type="submit" className="submit-btn">Post Opportunity</button>

                </form>
                {message && (
                    <p className={message.includes('Error') ? 'error-message' : 'success-message'}>
                        {message}
                    </p>
                )}
            </div>

        </div>
    );
}

export default ProviderOpportunityForm;
