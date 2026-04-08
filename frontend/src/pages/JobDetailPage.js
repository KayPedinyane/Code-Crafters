import { useParams, useNavigate } from "react-router-dom";
import JOBS from "../data/jobs";
import "./JobDetailPage.css";

function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const job = JOBS.find((j) => j.id === parseInt(id));

  // Safety check
  if (!job) {
    return (
      <div className="detail-wrapper">
        <div className="not-found">
          <h2>Opportunity not found</h2>
          <button onClick={() => navigate("/")}>← Back to listings</button>
        </div>
      </div>
    );
  }

  const TYPE_COLORS = {
    Learnership:   { bg: "#e8f5e9", text: "#2e7d32" },
    Apprenticeship:{ bg: "#fff3e0", text: "#e65100" },
    Internship:    { bg: "#e3f2fd", text: "#1565c0" },
  };

  return (
    <div className="detail-wrapper">

      {/* ── TOP NAV ── */}
      <header className="detail-header">
        <div className="detail-header-inner">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">SkillsBridge<span className="logo-accent">SA</span></span>
          </div>
          <button className="back-btn" onClick={() => navigate("/")}>
            ← Back to opportunities
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="detail-hero">
        <div className="detail-hero-inner">
          <div className="detail-company-logo">{job.company.charAt(0)}</div>
          <div className="detail-hero-text">
            <span
              className="detail-type-badge"
              style={{ background: TYPE_COLORS[job.type]?.bg, color: TYPE_COLORS[job.type]?.text }}
            >
              {job.type}
            </span>
            <h1 className="detail-title">{job.title}</h1>
            <p className="detail-company">{job.company} · {job.provider}</p>
          </div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <div className="detail-content">

        {/* Quick info bar */}
        <div className="detail-info-bar">
          {[
            { icon: "📍", label: "Location",  value: job.location },
            { icon: "💰", label: "Stipend",   value: job.stipend },
            { icon: "⏱",  label: "Duration",  value: job.duration },
            { icon: "🎓", label: "NQF Level", value: job.nqfLevel },
            { icon: "🏢", label: "SETA",      value: job.seta },
            { icon: "👥", label: "Spots",     value: `${job.spots} available` },
          ].map(({ icon, label, value }) => (
            <div className="info-item" key={label}>
              <span className="info-icon">{icon}</span>
              <div>
                <span className="info-label">{label}</span>
                <span className="info-value">{value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="detail-grid">

          {/* Left column */}
          <div className="detail-left">
            <div className="detail-card">
              <h2 className="section-title">About this opportunity</h2>
              <p className="detail-description">{job.description}</p>
            </div>

            <div className="detail-card">
              <h2 className="section-title">Requirements</h2>
              <ul className="detail-list">
                {job.requirements.map((req, i) => (
                  <li key={i} className="list-item">
                    <span className="list-bullet">✓</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div className="detail-card">
              <h2 className="section-title">What you'll do</h2>
              <ul className="detail-list">
                {job.responsibilities.map((res, i) => (
                  <li key={i} className="list-item">
                    <span className="list-bullet list-bullet-arrow">→</span>
                    {res}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right column — Apply card */}
          <div className="detail-right">
            <div className="apply-card">
              <div className="apply-closing">
                <span className="apply-closing-label">Application closes</span>
                <span className="apply-closing-date">{job.closing}</span>
              </div>
              <div className="apply-spots">
                <span className="spots-badge">{job.spots} spots remaining</span>
              </div>
              <button className="apply-btn">Apply Now</button>
              <button className="save-btn">♡ Save opportunity</button>
              <div className="apply-note">
                You will receive a confirmation notification once your application is received.
              </div>
            </div>

            <div className="provider-card">
              <h3 className="provider-title">Programme details</h3>
              <div className="provider-row">
                <span className="provider-label">Provider</span>
                <span className="provider-value">{job.provider}</span>
              </div>
              <div className="provider-row">
                <span className="provider-label">SETA</span>
                <span className="provider-value">{job.seta}</span>
              </div>
              <div className="provider-row">
                <span className="provider-label">Sector</span>
                <span className="provider-value">{job.sector}</span>
              </div>
              <div className="provider-row">
                <span className="provider-label">NQF Level</span>
                <span className="provider-value">{job.nqfLevel}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default JobDetailPage;