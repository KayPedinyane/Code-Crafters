import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./JobDetailPage.css";

const TYPE_COLORS = {
  Learnership:    { bg: "#e8f5e9", text: "#2e7d32" },
  Apprenticeship: { bg: "#fff3e0", text: "#e65100" },
  Internship:     { bg: "#e3f2fd", text: "#1565c0" },
};

function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://code-crafters-t8dp.onrender.com/opportunities/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setJob(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error fetching job:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="detail-wrapper">
        <div className="not-found">
          <h2>Loading opportunity...</h2>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="detail-wrapper">
        <div className="not-found">
          <h2>Opportunity not found</h2>
          <button onClick={() => navigate("/applicant")}>← Back to listings</button>
        </div>
      </div>
    );
  }

  // Requirements might be a string or array depending on DB
  const requirementsList = Array.isArray(job.requirements)
    ? job.requirements
    : job.requirements
    ? job.requirements.split(",").map((r) => r.trim())
    : [];

  return (
    <div className="detail-wrapper">

      {/* ── HEADER ── */}
      <header className="detail-header">
        <div className="detail-header-inner">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">SkillsBridge<span className="logo-accent">SA</span></span>
          </div>
          <button className="back-btn" onClick={() => navigate("/applicant")}>
            ← Back to opportunities
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="detail-hero">
        <div className="detail-hero-inner">
          <div className="detail-company-logo">
            {job.title ? job.title.charAt(0).toUpperCase() : "?"}
          </div>
          <div className="detail-hero-text">
            <span
              className="detail-type-badge"
              style={{
                background: TYPE_COLORS[job.type]?.bg || "#f0f0f0",
                color:      TYPE_COLORS[job.type]?.text || "#333",
              }}
            >
              {job.type || "Opportunity"}
            </span>
            <h1 className="detail-title">{job.title}</h1>
            <p className="detail-company">{job.sector} · {job.location}</p>
          </div>
        </div>
      </section>

      {/* ── INFO BAR ── */}
      <div className="detail-info-bar">
        {[
          { icon: "📍", label: "Location",   value: job.location },
          { icon: "💰", label: "Stipend",    value: `R${job.stipend}` },
          { icon: "⏱",  label: "Duration",   value: job.duration },
          { icon: "🎓", label: "NQF Level",  value: job.nqf_level },
          { icon: "🏢", label: "Sector",     value: job.sector },
          { icon: "📅", label: "Closing",    value: job.closing_date },
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

      {/* ── CONTENT ── */}
      <div className="detail-content">
        <div className="detail-grid">

          {/* Left column */}
          <div className="detail-left">

            <div className="detail-card">
              <h2 className="section-title">About this opportunity</h2>
              <p className="detail-description">{job.description}</p>
            </div>

            {requirementsList.length > 0 && (
              <div className="detail-card">
                <h2 className="section-title">Requirements</h2>
                <ul className="detail-list">
                  {requirementsList.map((req, i) => (
                    <li key={i} className="list-item">
                      <span className="list-bullet">✓</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

          {/* Right column — Apply card */}
          <div className="detail-right">
            <div className="apply-card">
              <div className="apply-closing">
                <span className="apply-closing-label">Application closes</span>
                <span className="apply-closing-date">{job.closing_date}</span>
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
                <span className="provider-label">Sector</span>
                <span className="provider-value">{job.sector}</span>
              </div>
              <div className="provider-row">
                <span className="provider-label">NQF Level</span>
                <span className="provider-value">{job.nqf_level}</span>
              </div>
              <div className="provider-row">
                <span className="provider-label">Duration</span>
                <span className="provider-value">{job.duration}</span>
              </div>
              <div className="provider-row">
                <span className="provider-label">Stipend</span>
                <span className="provider-value">R{job.stipend}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default JobDetailPage;