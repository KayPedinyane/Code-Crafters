import React, { useState, useEffect } from 'react';
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
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
                provider_id: 1,
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

    const isError = message.includes('Error');

    return (
        <div className="form-container">

            {/* ── HEADER ── */}
            <header className="form-header">
                <div className="header-inner">

                    <a href="/" className="logo" aria-label="SkillsBridgeSA home">
                        <span className="logo-icon" aria-hidden="true">◈</span>
                        <span className="logo-text">
                            SkillsBridge<span className="logo-accent">SA</span>
                        </span>
                    </a>

                    <nav className="header-nav" aria-label="Primary navigation">
                        <a className="nav-link" onClick={() => navigate('/provider')} role="link">Dashboard</a>
                        <a className="nav-link" onClick={() => navigate('/my-listings')} role="link">My Listings</a>
                    </nav>

                    <button
                        className="profile-chip"
                        onClick={() => navigate('/profile')}
                        aria-label={`View profile for ${user.name}`}
                    >
                        <span className="chip-avatar" aria-hidden="true">{initials}</span>
                        <span className="chip-info">
                            <span className="chip-name">{user.name}</span>
                            <span className="chip-role">Provider</span>
                        </span>
                        <span className="chip-arrow" aria-hidden="true">›</span>
                    </button>

                </div>
            </header>

            {/* ── HERO ── */}
            <section className="form-hero" aria-label="Page heading">
                <div className="form-hero-inner">
                    <p className="hero-eyebrow">Provider Portal</p>
                    <h1 className="form-title" aria-live="polite">
                        {displayText}<span className="cursor" aria-hidden="true">|</span>
                    </h1>
                    <hr className="ambient-line" aria-hidden="true" />
                </div>
                <div className="hero-pattern" aria-hidden="true" />
            </section>

            {/* ── FORM ── */}
            <main className="form-body">
                <form
                    className="opportunity-form"
                    onSubmit={handleSubmit}
                    noValidate
                    aria-label="Post a new opportunity"
                >
                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Junior Developer Learnership"
                            autoComplete="off"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the opportunity..."
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="stipend">Stipend (R)</label>
                            <input
                                type="text"
                                id="stipend"
                                name="stipend"
                                value={formData.stipend}
                                onChange={handleChange}
                                placeholder="e.g. R3000/month"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="location">Location</label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g. Johannesburg"
                                autoComplete="address-level2"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="duration">Duration</label>
                            <input
                                type="text"
                                id="duration"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                placeholder="e.g. 12 months"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="closing_date">Closing Date</label>
                            <input
                                type="date"
                                id="closing_date"
                                name="closing_date"
                                value={formData.closing_date}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="sector">Sector</label>
                            <select
                                id="sector"
                                name="sector"
                                value={formData.sector}
                                onChange={handleChange}
                            >
                                <option value="">Select Sector</option>
                                <option value="ICT">ICT</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Finance">Finance</option>
                                <option value="Healthcare">Healthcare</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="nqf_level">NQF Level</label>
                            <select
                                id="nqf_level"
                                name="nqf_level"
                                value={formData.nqf_level}
                                onChange={handleChange}
                            >
                                <option value="">Select NQF Level</option>
                                <option value="NQF 4">NQF 4</option>
                                <option value="NQF 5">NQF 5</option>
                                <option value="NQF 6">NQF 6</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="requirements">Requirements</label>
                        <textarea
                            id="requirements"
                            name="requirements"
                            value={formData.requirements}
                            onChange={handleChange}
                            placeholder="List the requirements..."
                        />
                    </div>

                    <button type="submit" className="submit-btn">Post Opportunity</button>

                </form>

                {message && (
                    <p
                        role={isError ? 'alert' : 'status'}
                        className={isError ? 'error-message' : 'success-message'}
                    >
                        {message}
                    </p>
                )}
            </main>

        </div>
    );
}

export default ProviderOpportunityForm;