/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import {auth} from '../firebase';
import './ProviderOpportunityForm.css';
import { useNavigate } from 'react-router-dom';
import NotificationPanel from '../components/NotificationPanel';


function ProviderOpportunityForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        opportunity_type: '',
        description: '',
        stipend: '',
        location: '',
        province: '',
        duration: '',
        requirements: '',
        closing_date: '',
        sector: '',
        nqf_level: ''
    });

    const SA_SECTORS = [
        { value: 'Agriculture', label: 'Agriculture (AgriSETA)' },
        { value: 'Banking', label: 'Banking (BANKSETA)' },
        { value: 'Chemical Industries', label: 'Chemical Industries (CHIETA)' },
        { value: 'Construction', label: 'Construction (CETA)' },
        { value: 'Education & Training', label: 'Education & Training (ETDP SETA)' },
        { value: 'Energy & Water', label: 'Energy & Water (EWSETA)' },
        { value: 'Finance & Accounting', label: 'Finance & Accounting (FASSET)' },
        { value: 'Food & Beverages', label: 'Food & Beverages (FoodBev SETA)' },
        { value: 'Healthcare', label: 'Healthcare (HWSETA)' },
        { value: 'ICT & Media', label: 'ICT & Media (MICT SETA)' },
        { value: 'Insurance', label: 'Insurance (INSETA)' },
        { value: 'Local Government', label: 'Local Government (LG SETA)' },
        { value: 'Manufacturing & Engineering', label: 'Manufacturing & Engineering (merSETA)' },
        { value: 'Mining & Minerals', label: 'Mining & Minerals (MQA)' },
        { value: 'Public Service', label: 'Public Service (PSETA)' },
        { value: 'Safety & Security', label: 'Safety & Security (SASSETA)' },
        { value: 'Services', label: 'Services (SSETA)' },
        { value: 'Tourism & Hospitality', label: 'Tourism & Hospitality (THETA)' },
        { value: 'Transport', label: 'Transport (TETA)' },
        { value: 'Wholesale & Retail', label: 'Wholesale & Retail (W&RSETA)' },
        { value: 'Fibre Processing & Manufacturing', label: 'Fibre Processing & Manufacturing (FP&M SETA)' }
    ];

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

    const [provinces, setProvinces] = useState([]);
    const [provincesLoading, setProvincesLoading] = useState(false);
    const [cities, setCities] = useState([]);
    const [citiesLoading, setCitiesLoading] = useState(false);
    const [selectedCity, setSelectedCity] = useState('');

    const [notification, setNotification] = useState([]);
    const [showNotification, setShowNotification] = useState(false);

    const [providerStatus, setProviderStatus] = useState(null);

    const [fieldValidation, setFieldValidation] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [requirementInput, setRequirementInput] = useState('');
    const [requirementsList, setRequirementsList] = useState([]);

    const [message, setMessage] = useState('');
    const [displayText, setDisplayText] = useState('');
    const fullText = "Post an Opportunity";

    const user = JSON.parse(localStorage.getItem("user")) || {};
    const [showPopup, setShowPopup] = useState(false);
    const popupRef = useRef(null);
    const initials = user.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "P";

    const requiredFields = ['title', 'opportunity_type', 'description', 'stipend', 'location', 'duration', 'requirements', 'closing_date', 'sector', 'nqf_level'];

    const calculateProgress = () => {
        const filledFields = requiredFields.filter(field => formData[field] && formData[field].toString().trim() !== '');
        return Math.round((filledFields.length / requiredFields.length) * 100);
    };

    const progress = calculateProgress();

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

    const addRequirement = () => {
        const trimmed = requirementInput.trim();
        if (!trimmed) return;
        const updated = [...requirementsList, trimmed];
        setRequirementsList(updated);
        setFormData(prev => ({ ...prev, requirements: updated.join('\n') }));
        setRequirementInput('');
    };

    const removeRequirement = (index) => {
        const updated = requirementsList.filter((_, i) => i !== index);
        setRequirementsList(updated);
        setFormData(prev => ({ ...prev, requirements: updated.join('\n') }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (requiredFields.includes(name)) {
            const isValid = validateField(name, value);
            setFieldValidation(prev => ({ ...prev, [name]: isValid }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (providerStatus !== 'accepted') {
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
                setTimeout(() => { navigate('/my-listings'); }, 1500);
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

    const markAllAsRead = () => {
        const unread = notification.filter(n => !n.is_read);
        Promise.all(
            unread.map(n =>
                fetch(`${process.env.REACT_APP_API_URL}/notifications/${n.id}/read`, { method: 'PATCH' })
            )
        ).then(() => fetchNotifications());
    };

    const detectLocation = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                    const data = await res.json();
                    const detectedCity = (data.city || data.locality || '').trim();
                    const detectedProvince = (data.principalSubdivision || '').trim();
                    if (detectedProvince) {
                        setFormData(prev => ({ ...prev, province: detectedProvince, location: '' }));
                        setSelectedCity('');
                    }
                    if (detectedCity && detectedProvince) {
                        setTimeout(() => {
                            setFormData(prev => ({ ...prev, location: `${detectedCity}, ${detectedProvince}` }));
                            setSelectedCity(detectedCity);
                        }, 1500);
                    }
                } catch (err) {
                    console.error('Location detection failed:', err);
                }
            },
            (err) => console.error('Geolocation error:', err)
        );
    };

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/provider-profile`)
            .then(res => res.json())
            .then(providers => {
                const me = providers.find(p => p.email === user.email);
                if (me) { setProviderStatus(me.status); }
                else { setProviderStatus('pending'); }
            })
            .catch(() => setProviderStatus('null'));
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setShowPopup(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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

    useEffect(() => { fetchNotifications(); }, []);

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
        })
        .catch(() => {})
        .finally(() => setProvincesLoading(false));
    }, []);

    useEffect(() => {
        if (!formData.province) return;
        setCitiesLoading(true);
        setCities([]);
        fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country: 'South Africa', state: formData.province })
        })
        .then(res => res.json())
        .then(data => { setCities(data.data || []); })
        .catch(() => setCities([]))
        .finally(() => setCitiesLoading(false));
    }, [formData.province]);

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
                                    <span className="popup-edit" onClick={() => { setShowPopup(false); navigate("/provider-profile"); }}>Edit</span>
                                </div>
                                <div className="popup-divider" />
                                <div className="popup-menu">
                                    <div className='popup-menu-item' onClick={() => { setShowPopup(false); navigate("/provider-settings"); }}>
                                        <span className="popup-menu-icon">⚙</span><span>Settings</span>
                                    </div>
                                    <div className="popup-menu-item">
                                        <span className="popup-menu-icon">?</span><span>Help</span>
                                    </div>
                                    <div className="popup-menu-item" onClick={() => { setShowPopup(false); setShowNotification(true); }}>
                                        <span className="popup-menu-icon">🔔</span><span>Notifications</span>
                                    </div>
                                    <div className="popup-menu-item popup-signout" onClick={() => auth.signOut().then(() => { localStorage.clear(); navigate('/'); })}>
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
                            <input type="number" id="stipend" name="stipend" value={formData.stipend} onChange={handleChange} placeholder="e.g. 3500" min="0" step="0.01" onKeyDown={(e) => { if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault(); }} />
                            {fieldValidation.stipend && <span className="field-icon">✓</span>}
                        </div>

                        <div className={`form-group ${formData.province ? 'valid' : ''}`}>
                            <label htmlFor="province">
                                <span className="label-icon"></span> Province
                            </label>
                            <select
                                id="province"
                                name="province"
                                value={formData.province}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, province: e.target.value, location: '' }));
                                    setSelectedCity('');
                                }}
                            >
                                <option value="">{provincesLoading ? 'Loading provinces...' : 'Select Province'}</option>
                                {provinces.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>

                        <div className={`form-group ${fieldValidation.location ? 'valid' : ''}`}>
                            <label htmlFor="location">
                                <span className="label-icon"></span> City
                            </label>
                            <select
                                id="location"
                                name="location"
                                value={selectedCity}
                                onChange={(e) => {
                                    const city = e.target.value;
                                    setSelectedCity(city);
                                    setFormData(prev => ({
                                        ...prev,
                                        location: city && prev.province ? `${city}, ${prev.province}` : city
                                    }));
                                    if (requiredFields.includes('location')) {
                                        setFieldValidation(prev => ({ ...prev, location: !!city }));
                                    }
                                }}
                                disabled={!formData.province || citiesLoading}
                            >
                                <option value="">
                                    {!formData.province ? 'Select a province first' : citiesLoading ? 'Loading cities...' : 'Select City'}
                                </option>
                                {cities.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                            {fieldValidation.location && <span className="field-icon">✓</span>}
                            <button type="button" onClick={detectLocation} className="detect-location-btn">
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
                                type="number"
                                id="duration"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                placeholder="e.g. 12"
                                min="1"
                                step="1"
                                onKeyDown={(e) => { if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault(); }}
                                style={{ flex: '1' }}
                            />
                            {fieldValidation.duration && <span className="field-icon">✓</span>}
                            <span style={{
                                padding: '10px 14px',
                                background: '#f3f4f6',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                color: '#6b7280',
                                fontWeight: '500',
                                whiteSpace: 'nowrap',
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
                                {SA_SECTORS.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
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

                    {/* ── REQUIREMENTS ── */}
                    <div className="form-group">
                        <label htmlFor="requirements">
                            <span className="label-icon"></span> Requirements
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                value={requirementInput}
                                onChange={(e) => setRequirementInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRequirement(); } }}
                                placeholder="e.g. Matric certificate"
                                style={{ flex: 1 }}
                            />
                            <button type="button" onClick={addRequirement} style={{
                                padding: '10px 16px',
                                background: '#1a1a2e',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}>+ Add</button>
                        </div>
                        {requirementsList.length > 0 && (
                            <ul style={{ marginTop: '10px', paddingLeft: '0', listStyle: 'none' }}>
                                {requirementsList.map((req, index) => (
                                    <li key={index} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '8px 12px',
                                        marginBottom: '6px',
                                        background: '#f3f4f6',
                                        borderRadius: '6px',
                                        fontSize: '14px'
                                    }}>
                                        <span>• {req}</span>
                                        <button type="button" onClick={() => removeRequirement(index)} style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#c53030',
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                            lineHeight: 1
                                        }}>✕</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <button
                        type="submit"
                        className={`submit-btn ${isLoading ? 'loading' : ''} ${showSuccess ? 'success' : ''}`}
                        disabled={providerStatus !== 'accepted'}
                        style={{ opacity: providerStatus !== 'accepted' ? 0.6 : 1, cursor: providerStatus !== 'accepted' ? 'not-allowed' : 'pointer' }}
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
                <NotificationPanel
                    notifications={notification}
                    onClose={() => setShowNotification(false)}
                    onMarkRead={markAsRead}
                    onMarkAllRead={markAllAsRead}
                />
            )}

        </div>
    );
}

export default ProviderOpportunityForm;