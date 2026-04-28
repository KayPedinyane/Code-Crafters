import './HomePage.css';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';

function HomePage() {
    const [view, setView] = useState('home')
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState('');
    const navigate = useNavigate;
    
    const handleSearch = (e) => {
        e.preventDefault();
        setView('opportunities')
    };

    return (
        <div>
            <header className="header">
                <div className="header-inner">

                    <div className="logo">
                        <span className="logo-icon">◈</span>
                        <span className="logo-text">
                            SkillsBridge<span className="logo-accent">SA</span>
                        </span>
                    </div>

                    <nav className="header-nav">
                        <span className="nav-link active">Home</span>
                        <span className="nav-link" onClick={() => navigate('/login')}>Login</span>
                        <span className="nav-link" onClick={() => navigate('/create')}>Sign up</span>
                    </nav>

                </div>
            </header>

            <main>
                <section className="hero">
                    {view === 'home' && (
                        <>
                            <h1>Find your learnership or internship</h1>
                            <p>Connecting South African youth with SETA-accredited opportunities</p>
                        </>
                    )}
                        <form className="search-form" onSubmit={handleSearch}>
                            <div className="search-field">
                                <input 
                                    id="search" 
                                    type="text"
                                    placeholder="Job title or sector"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    />
                            </div>
                            <div className="search-field">
                                <input 
                                    id="location" 
                                    type="text" 
                                    placeholder="City or province"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    />
                            </div>
                            <button id="submit" type="submit">Search</button>
                        </form>
                </section>

                {view === 'home' && (
                    <>
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
                    </>
                )}

                {view === 'opportunities' && (
                    <section className="opportunities">
                        <p>Opportunities will show here</p>
                    </section>
                )}
            </main>

            <footer>
                <p>© 2026 SkillsBridgeSA</p>
            </footer>
        </div>
    );
}

export default HomePage;