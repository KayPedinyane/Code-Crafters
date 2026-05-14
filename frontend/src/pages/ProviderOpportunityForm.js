/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import {auth} from '../firebase';
import './ProviderOpportunityForm.css';
import { useNavigate } from 'react-router-dom';


function ProviderOpportunityForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        opportunity_type: '',
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

    // Validation and form state
    const [fieldValidation, setFieldValidation] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const requiredFields = ['title', 'opportunity_type', 'description', 'stipend', 'location', 'duration', 'requirements', 'closing_date', 'sector', 'nqf_level'];

    // Calculate form completion percentage
    const calculateProgress = () => {
        const filledFields = requiredFields.filter(field => formData[field] && formData[field].toString().trim() !== '');
        return Math.round((filledFields.length / requiredFields.length) * 100);
    };

    const progress = calculateProgress();

    // Validate individual field
    const validateField = (name, value) => {
        const isEmpty = !value || (typeof value === 'string' && value.trim() === '');
        
        if (name === 'stipend' && value) {
            const isValidNumber = !isNaN(value) && value > 0;
            return !isEmpty && isValidNumber;
        }
        
        if (name === 'closing_date' && value) {
            const isValidDate = new Date(value) > new Date();
            return !isEmpty && isValidDate;
        }
        
        return !isEmpty;
    };

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
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Update validation state for this field
        if (requiredFields.includes(name)) {
            const isValid = validateField(name, value);
            setFieldValidation(prev => ({
                ...prev,
                [name]: isValid
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if(providerStatus !== 'accepted') {
            setMessage('Your provider account is still pending approval. You cannot post opportunities yet.');
            return;
        }

        setIsLoading(true);

        fetch(`${process.env.REACT_APP_API_URL}/opportunities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: formData.title,
                opportunity_type: formData.opportunity_type,
                description: formData.description,
                stipend: formData.stipend,
                location: formData.location,
                duration: formData.duration ? `${formData.duration} months` : '',
                requirements: formData.requirements,
                closing_date: formData.closing_date,
                provider_id: user.id,
                sector: formData.sector,
                nqf_level: formData.nqf_level
            })
        })
        .then(response => response.json())
        .then(data => {
            setIsLoading(false);
            if (data.error) {
                setMessage(`Error: ${data.error}`);
            } else {
                setShowSuccess(true);
                setMessage('Opportunity posted successfully!');
                setTimeout(() => {
                    navigate('/my-listings');
                }, 1500);
            }
        })
        .catch(() => {
            setIsLoading(false);
            setMessage('Something went wrong, try again');
        });
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

            {/* ── PROGRESS INDICATOR ── */}
            <div className="form-progress-container">
                <div className="form-progress">
                    <span className="progress-label">Progress</span>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="progress-text">{progress}%</span>
                </div>
            </div>

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

                    <div className={`form-group ${fieldValidation.title ? 'valid' : ''}`}>
                        <label htmlFor="title">
                            <span className="label-icon"></span> Title
                        </label>
                        <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Junior Developer Learnership" />
                        {fieldValidation.title && <span className="field-icon">✓</span>}
                    </div>

                    <div className={`form-group ${fieldValidation.description ? 'valid' : ''}`}>
                        <label htmlFor="description">
                            <span className="label-icon"></span> Description
                        </label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Describe the opportunity..." />
                        {fieldValidation.description && <span className="field-icon">✓</span>}
                    </div>

                    <div className={`form-group ${fieldValidation.opportunity_type ? 'valid' : ''}`}>
                        <label htmlFor="opportunity_type">
                            <span className="label-icon"></span> Opportunity Type
                        </label>
                        <select id="opportunity_type" name="opportunity_type" value={formData.opportunity_type} onChange={handleChange}>
                            <option value="">Select Type</option>
                            <option value="Internship">Internship</option>
                            <option value="Learnership">Learnership</option>
                            <option value="Apprenticeship">Apprenticeship</option>
                        </select>
                        {fieldValidation.opportunity_type && <span className="field-icon">✓</span>}
                    </div>

                    <div className="form-row">
                        <div className={`form-group ${fieldValidation.stipend ? 'valid' : ''}`}>
                            <label htmlFor="stipend">
                                <span className="label-icon"></span> Stipend (R)
                            </label>
                            <input type="number" id="stipend" name="stipend" value={formData.stipend} onChange={handleChange} placeholder="e.g. 3500" min="0" step="0.01" onKeyDown={(e) => {if (['-','+','e','E'].includes(e.key)) e.preventDefault();}} />
                            {fieldValidation.stipend && <span className="field-icon">✓</span>}
                        </div>
                        <div className={`form-group ${fieldValidation.location ? 'valid' : ''}`}>
                            <label htmlFor="location">
                                <span className="label-icon"></span> Location
                            </label>
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
                            {fieldValidation.location && <span className="field-icon">✓</span>}
                            <button
                                type="button"
                                onClick={detectLocation}
                                className="detect-location-btn"
                            >
                                 Detect Your Location
                            </button>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className={`form-group ${fieldValidation.duration ? 'valid' : ''}`}>
                            <label htmlFor="duration">
                                <span className="label-icon"></span> Duration
                            </label>
                            <input
                                type = "number"
                                id="duration"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                placeholder="e.g. 12"
                                min="1"
                                step="1"
                                onKeyDown={(e) => {if (['-','+','e','E'].includes(e.key)) e.preventDefault();}}
                                style={{flex: '1'}}
                            />
                            {fieldValidation.duration && <span className="field-icon">✓</span>}
                            <span style ={{
                                padding : '10px 14px',
                                background: '#f3f4f6',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                color: '#6b7280',
                                fontweight: '500',
                                whitespace: 'nowrap',
                            
                            }}>months</span>
                        </div>
                        <div className={`form-group ${fieldValidation.closing_date ? 'valid' : ''}`}>
                            <label htmlFor="closing_date">
                                <span className="label-icon"></span> Closing Date
                            </label>
                            <input type="date" id="closing_date" name="closing_date" value={formData.closing_date} onChange={handleChange} />
                            {fieldValidation.closing_date && <span className="field-icon">✓</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className={`form-group ${fieldValidation.sector ? 'valid' : ''}`}>
                            <label htmlFor="sector">
                                <span className="label-icon"></span> Sector
                            </label>
                            <select id="sector" name="sector" value={formData.sector} onChange={handleChange}>
                                <option value="">Select Sector</option>
                                <option value="ICT">ICT</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Finance">Finance</option>
                                <option value="Healthcare">Healthcare</option>
                            </select>
                            {fieldValidation.sector && <span className="field-icon">✓</span>}
                        </div>
                        <div className={`form-group ${fieldValidation.nqf_level ? 'valid' : ''}`}>
                            <label htmlFor="nqf_level">
                                <span className="label-icon"></span> NQF Level
                            </label>
                            <select id="nqf_level" name="nqf_level" value={formData.nqf_level} onChange={handleChange}>
                                <option value="">Select NQF Level</option>
                                {NQF_LEVELS.map(level => (
                                    <option key={level.value} value={level.value}>{level.label}</option>
                                ))}
                            </select>
                            {fieldValidation.nqf_level && <span className="field-icon">✓</span>}
                        </div>
                    </div>

                    <div className={`form-group ${fieldValidation.requirements ? 'valid' : ''}`}>
                        <label htmlFor="requirements">
                            <span className="label-icon"></span> Requirements
                        </label>
                        <textarea id="requirements" name="requirements" value={formData.requirements} onChange={handleChange} placeholder="List the requirements..." />
                        {fieldValidation.requirements && <span className="field-icon">✓</span>}
                    </div>

                    <button 
                        type="submit" 
                        className={`submit-btn ${isLoading ? 'loading' : ''} ${showSuccess ? 'success' : ''}`}
                        disabled={providerStatus !== 'accepted'} 
                        style={{opacity: providerStatus !== 'accepted' ? 0.6 : 1, cursor: providerStatus !== 'accepted' ? 'not-allowed' : 'pointer'  }}
                    >
                        {isLoading ? 'Posting...' : showSuccess ? 'Success!' : providerStatus === 'accepted' ? 'Post Opportunity' : 'Pending Approval'}
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