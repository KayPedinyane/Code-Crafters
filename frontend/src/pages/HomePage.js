function HomePage() {
    return (
        <div>
            <header>
                <nav>
                    <p>SkillsBridgeSA</p>
                    <div>
                        <button>Log in</button>
                        <button>Sign up</button>
                    </div>
                </nav>
            </header>

            <main>

                <section>
                    <h1>Find your learnership or internship</h1>
                    <p>Connecting South African youth with SETA-accredited opportunities</p>

                    <form>
                        <label htmlFor="search">What are you looking for?</label>
                        <input id="search" type="text" placeholder="Job title or sector"></input>

                        <label htmlFor="location">Location</label>
                        <input id="location" type="text" placeholder="City or province"></input>

                        <button type="submit">Search</button>
                    </form>
                </section>

                <section>
                    <h2>Browse by sector</h2>
                </section>

                <section>
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