import { useNavigate } from "react-router-dom";
import "./AboutPage.css";

function AboutPage() {
  const navigate = useNavigate();
  return (
    <div className="about-wrapper">
      <header className="about-header">
        <div className="about-header-inner">
          <div className="logo" onClick={() => navigate("/applicant")} style={{ cursor: "pointer" }}>
            <span className="logo-icon">◈</span>
            <span className="logo-text">SkillsBridge<span className="logo-accent">SA</span></span>
          </div>
          <button className="about-back-btn" onClick={() => navigate("/applicant")}>← Back</button>
        </div>
      </header>

      <section className="about-hero">
        <div className="about-hero-inner">
          <div className="about-badge">🇿🇦 Made for South Africa</div>
          <h1 className="about-title">About <span className="about-green">SkillsBridge SA</span></h1>
          <p className="about-sub">Connecting South African youth with SETA-accredited learnerships, apprenticeships and internships from top employers nationwide.</p>
        </div>
      </section>

      <div className="about-content">

        <div className="about-section">
          <h2 className="about-section-title">Our Mission</h2>
          <p className="about-body">South Africa faces a significant youth unemployment challenge, with many young people unaware of or unable to access SETA-accredited learnerships, apprenticeships, and internship opportunities. At the same time, employers and training providers struggle to reach suitable applicants efficiently.</p>
          <p className="about-body">SkillsBridge SA was built to bridge this gap , a digital platform that streamlines the application and tracking process for both applicants and providers, aligned with the South African National Qualifications Framework (NQF) and powered by AI-driven matching.</p>
        </div>

        <div className="about-cards">
          {[
            { icon: "🎓", title: "NQF-Aligned",    desc: "All qualifications and skill tags are aligned to the South African NQF as defined by SAQA : the South African Qualifications Authority." },
            { icon: "✨", title: "AI-Powered",      desc: "Our smart matching engine analyses your NQF level, sector, skills and location to recommend the best opportunities for your profile." },
            { icon: "🔔", title: "Real-Time Alerts", desc: "Get notified in-app and by email when your application status changes, when matching opportunities are posted, and when deadlines approach." },
            { icon: "🔒", title: "Secure & Private", desc: "Your data is protected using Firebase Authentication and handled in accordance with POPIA : the Protection of Personal Information Act." },
          ].map(({ icon, title, desc }) => (
            <div className="about-card" key={title}>
              <span className="about-card-icon">{icon}</span>
              <h3 className="about-card-title">{title}</h3>
              <p className="about-card-desc">{desc}</p>
            </div>
          ))}
        </div>

        <div className="about-section">
          <h2 className="about-section-title">Built By</h2>
          <p className="about-body">SkillsBridge SA was designed and developed by the Code-Crafters team , five final-year Software Design students at the University of the Witwatersrand, Johannesburg, as part of the 2026 Software Design Project.</p>
          <div className="about-team">
            {[
              { name: "Mlungisi Mahlangu",  role: "Applicant Features & AI" },
              { name: "Zandile Mkontwana",  role: "Admin Features" },
              { name: "Ronie Hokwana",      role: "Provider Features" },
              { name: "Kutloano Diale",     role: "Login & Authentication" },
              { name: "Kamogelo Pedinyane", role: "Backend & Infrastructure" },
            ].map(({ name, role }) => (
              <div className="about-team-member" key={name}>
                <div className="about-team-avatar">{name.charAt(0)}</div>
                <div>
                  <p className="about-team-name">{name}</p>
                  <p className="about-team-role">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="about-section">
          <h2 className="about-section-title">Version & Legal</h2>
          <div className="about-meta-grid">
            <div className="about-meta-item"><span className="about-meta-label">Version</span><span className="about-meta-value">1.0.0</span></div>
            <div className="about-meta-item"><span className="about-meta-label">Released</span><span className="about-meta-value">22 May 2026</span></div>
            <div className="about-meta-item"><span className="about-meta-label">Platform</span><span className="about-meta-value">Web (Vercel + Render)</span></div>
            <div className="about-meta-item"><span className="about-meta-label">Contact</span><span className="about-meta-value">skillsbridgesa@gmail.com</span></div>
            <div className="about-meta-item"><span className="about-meta-label">Data Source</span><span className="about-meta-value">SAQA · Stats SA</span></div>
            <div className="about-meta-item"><span className="about-meta-label">Compliance</span><span className="about-meta-value">POPIA · NQF Act 67/2008</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AboutPage;