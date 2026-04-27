import './HomePage.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState('');
    const navigate = useNavigate;

    const handleSearch = (e) => {
        e.preventDefault();
        
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (location) params.set('location', location);

        navigate(`/applicant?${params.toString()}`);
    };

    return (
        <div>
            <header className="header">
                <nav className="nav-buttons">
                    <p className="logo">SkillsBridgeSA</p>
                    <div className="nav-buttons">
                        <button className="btn-outline">Log in</button>
                        <button className="btn-primary">Sign up</button>
                    </div>
                </nav>
            </header>

            <main>

                <section className="hero">
                    <h1>Find your learnership or internship</h1>
                    <p>Connecting South African youth with SETA-accredited opportunities</p>

                    <form className="search-form" onSubmit={handleSearch}>
                        <div className="search-form">
                            <label htmlFor="search">What are you looking for?</label>
                            <input 
                                id="search" 
                                type="text"
                                placeholder="Job title or sector"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                />
                        </div>
                        <div className="search-field">
                            <label htmlFor="location">Location</label>
                            <input 
                                id="location" 
                                type="text" 
                                placeholder="City or province"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                />
                        </div>
                        <button type="submit">Search</button>
                    </form>
                </section>

                <section className="sectors">
                    <h2>Browse by sector</h2>
                    <div className="sectors-grid">
                        <article className="sector-card">
                            <h3>ICT</h3>
                            <p>Software, networking and technical support</p>
                        </article>
                        <article className="sector-card">
                            <h3>Engineering</h3>
                            <p>Design, construction, planning, development, and mechanics</p>
                        </article>
                        <article className="sector-card">
                            <h3>Finance</h3>
                            <p>Money management, investment, budgeting, and forecasting.</p>
                        </article>
                    </div>
                </section>

                <section className="how-it-works">
                    <h2>How it works</h2>
                </section>
            </main>

            <footer>
                <p>© 2026 SkillsBridgeSA</p>
            </footer>
        </div>
    );
}

export default HomePage;