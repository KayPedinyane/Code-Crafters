import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import "./JobDetailPage.css";

const API = "https://code-crafters-t8dp.onrender.com";

const TYPE_COLORS = {
  Learnership:    { bg: "#e8f5e9", text: "#2e7d32" },
  Apprenticeship: { bg: "#fff3e0", text: "#e65100" },
  Internship:     { bg: "#e3f2fd", text: "#1565c0" },
};

const REQUIRED_FIELDS = {
  full_name: "Full Name",
  phone:     "Phone Number",
  id_number: "ID Number",
  gender:    "Gender",
  city:      "City",
  province:  "Province",
};

const REQUIRED_EDUCATION = {
  qualification: "Highest Qualification",
  institution:   "Institution",
  nqf_level:     "NQF Level",
};

function JobDetailPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const location     = useLocation();

  const [job,           setJob]           = useState(location.state?.job || null);
  const [loading,       setLoading]       = useState(!location.state?.job);
  const [currentUser,   setCurrentUser]   = useState(null);
  const [applying,      setApplying]      = useState(false);
  const [applyStatus,   setApplyStatus]   = useState(null);
  const [missingFields, setMissingFields] = useState([]);

  // ── Scroll to top when page opens ──
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // ── Get logged in user ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUser(user);
      else navigate("/");
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch job if not passed via navigation ──
  useEffect(() => {
    if (!job) {
      fetch(`${API}/opportunities`)
        .then((res) => res.json())
        .then((data) => {
          const found = data.find((j) => j.id === parseInt(id));
          setJob(found || null);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id, job]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-ZA", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

  const requirementsList = Array.isArray(job?.requirements)
    ? job.requirements
    : job?.requirements
    ? job.requirements.split(",").map((r) => r.trim())
    : [];

  // ── Check if deadline has passed ──
  const isExpired = job?.closing_date && new Date(job.closing_date) < new Date();

  // ── Check profile completeness ──
  const checkProfileComplete = async (email) => {
    const missing = [];
    try {
      const res  = await fetch(`${API}/profile/${email}`);
      const data = await res.json();
      if (!data || data.error) {
        return {
          complete: false,
          missing: ["Full Name", "Phone Number", "ID Number", "Gender",
                    "City", "Province", "Qualification", "Institution", "NQF Level"],
        };
      }
      Object.entries(REQUIRED_FIELDS).forEach(([field, label]) => {
        if (!data[field] || data[field].toString().trim() === "") missing.push(label);
      });
      Object.entries(REQUIRED_EDUCATION).forEach(([field, label]) => {
        if (!data[field] || data[field].toString().trim() === "") missing.push(label);
      });
      return { complete: missing.length === 0, missing };
    } catch (err) {
      const local = JSON.parse(localStorage.getItem(`profile_${email}`));
      if (local?.personal) {
        const p = local.personal;
        const e = local.education || {};
        if (!p.fullName)             missing.push("Full Name");
        if (!p.phone)                missing.push("Phone Number");
        if (!p.idNumber)             missing.push("ID Number");
        if (!p.gender)               missing.push("Gender");
        if (!p.city)                 missing.push("City");
        if (!p.province)             missing.push("Province");
        if (!e.highestQualification) missing.push("Qualification");
        if (!e.institution)          missing.push("Institution");
        if (!e.nqfLevel)             missing.push("NQF Level");
        return { complete: missing.length === 0, missing };
      }
      return { complete: false, missing: ["Could not verify profile — please check your connection"] };
    }
  };

  // ── Handle Apply ──
  const handleApply = async () => {
    if (!currentUser) return;
    setApplying(true);
    setApplyStatus(null);
    setMissingFields([]);

    const email = currentUser.email;
    const { complete, missing } = await checkProfileComplete(email);

    if (!complete) {
      setMissingFields(missing);
      setApplyStatus("incomplete");
      setApplying(false);
      return;
    }

    setApplying(false);

    const confirmed = window.confirm(
      `Are you sure you want to apply for "${job.title}"?\n\nYour full profile details will be sent to the provider. You will receive further communication from them regarding your application.`
    );
    if (!confirmed) return;

    setApplying(true);

    try {
      const res  = await fetch(`${API}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicant_email: email, opportunity_id: job.id }),
      });
      const data = await res.json();

      if (res.status === 409 || data?.message?.toLowerCase().includes("already")) {
        setApplyStatus("already");
      } else if (res.status === 201 || res.ok) {
        setApplyStatus("success");
        fetch(`${API}/notifications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_email: email,
            message: `Your application for "${job.title}" has been received. You will be notified of any updates.`,
          }),
        }).catch(() => {});
      } else {
        setApplyStatus("error");
      }
    } catch {
      setApplyStatus("error");
    }

    setApplying(false);
  };

  if (loading) {
    return (
      <div className="detail-wrapper">
        <div className="not-found">
          <div className="loading-spinner">⏳</div>
          <h2>Loading opportunity...</h2>
          <p>Please wait while we fetch the details.</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="detail-wrapper">
        <div className="not-found">
          <span style={{ fontSize: 48 }}>🔍</span>
          <h2>Opportunity not found</h2>
          <p>This opportunity may have been removed or is no longer available.</p>
          <button onClick={() => navigate("/applicant")}>← Back to listings</button>
        </div>
      </div>
    );
  }

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
            <div className="detail-badges">
              <span
                className="detail-type-badge"
                style={{
                  background: TYPE_COLORS[job.type]?.bg || "#e3f2fd",
                  color:      TYPE_COLORS[job.type]?.text || "#1565c0",
                }}
              >
                {job.type || "Opportunity"}
              </span>
              {isExpired && (
                <span className="detail-expired-badge">Closed</span>
              )}
              {!isExpired && (
                <span className="detail-open-badge">Open</span>
              )}
            </div>
            <h1 className="detail-title">{job.title}</h1>
            <p className="detail-company">
              {job.company_name || job.company || job.sector} · {job.location}
            </p>
          </div>
        </div>
      </section>

      {/* ── INFO BAR ── */}
      <div className="detail-info-bar">
        {[
          { icon: "📍", label: "Location",  value: job.location },
          { icon: "💰", label: "Stipend",   value: job.stipend  },
          { icon: "⏱",  label: "Duration",  value: job.duration },
          { icon: "🎓", label: "NQF Level", value: job.nqf_level },
          { icon: "🏢", label: "Sector",    value: job.sector   },
          { icon: "📅", label: "Closing",   value: formatDate(job.closing_date) },
        ].map(({ icon, label, value }) => (
          <div className="info-item" key={label}>
            <span className="info-icon">{icon}</span>
            <div>
              <span className="info-label">{label}</span>
              <span className="info-value">{value || "N/A"}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div className="detail-content">
        <div className="detail-grid">

          {/* ── LEFT ── */}
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

            {/* ── What to expect card ── */}
            <div className="detail-card">
              <h2 className="section-title">What to expect</h2>
              <div className="expect-grid">
                <div className="expect-item">
                  <span className="expect-icon">📄</span>
                  <div>
                    <span className="expect-label">Application</span>
                    <span className="expect-value">Submit your profile and CV online</span>
                  </div>
                </div>
                <div className="expect-item">
                  <span className="expect-icon">🔍</span>
                  <div>
                    <span className="expect-label">Review</span>
                    <span className="expect-value">Provider reviews your application</span>
                  </div>
                </div>
                <div className="expect-item">
                  <span className="expect-icon">📞</span>
                  <div>
                    <span className="expect-label">Shortlisting</span>
                    <span className="expect-value">Shortlisted candidates are contacted</span>
                  </div>
                </div>
                <div className="expect-item">
                  <span className="expect-icon">🎓</span>
                  <div>
                    <span className="expect-label">Placement</span>
                    <span className="expect-value">Successful applicants begin the programme</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT ── */}
          <div className="detail-right">
            <div className="apply-card">
              <div className="apply-closing">
                <span className="apply-closing-label">Application closes</span>
                <span
                  className="apply-closing-date"
                  style={{ color: isExpired ? "#c53030" : "var(--text-primary)" }}
                >
                  {formatDate(job.closing_date)}
                </span>
                {isExpired && (
                  <span style={{ fontSize: 12, color: "#c53030", fontWeight: 500 }}>
                    This opportunity has closed
                  </span>
                )}
              </div>

              <div className="apply-spots">
                <span className="spots-badge">{job.nqf_level}</span>
              </div>

              {/* Status messages */}
              {applyStatus === "success" && (
                <div className="apply-message apply-message-success">
                  <strong>✓ Application submitted!</strong>
                  <p>Your profile details have been sent to the provider. Go to My Applications to track your status.</p>
                </div>
              )}
              {applyStatus === "incomplete" && (
                <div className="apply-message apply-message-error">
                  <strong>✕ Incomplete profile</strong>
                  <p>Please complete the following before applying:</p>
                  <ul className="missing-list">
                    {missingFields.map((field) => (
                      <li key={field}>• {field}</li>
                    ))}
                  </ul>
                  <span className="apply-message-link" onClick={() => navigate("/edit-profile")}>
                    Complete your profile →
                  </span>
                </div>
              )}
              {applyStatus === "already" && (
                <div className="apply-message apply-message-warning">
                  ℹ You have already applied for this opportunity.
                </div>
              )}
              {applyStatus === "error" && (
                <div className="apply-message apply-message-error">
                  <strong>✕ Something went wrong</strong>
                  <p>Could not submit your application. Please try again.</p>
                </div>
              )}

              {/* Apply button */}
              {applyStatus === "success" ? (
                <button className="apply-btn" style={{ background: "#e8f5e9", color: "#2e7d32", cursor: "default" }} disabled>
                  ✓ Applied
                </button>
              ) : isExpired ? (
                <button className="apply-btn" style={{ background: "#f0f0f0", color: "#999", cursor: "not-allowed" }} disabled>
                  Applications Closed
                </button>
              ) : (
                <button className="apply-btn" onClick={handleApply} disabled={applying}>
                  {applying ? "Checking profile..." : "Apply Now"}
                </button>
              )}

              <button className="save-btn">♡ Save opportunity</button>
              <div className="apply-note">
                Your full profile details including CV will be sent to the provider upon application.
              </div>
            </div>

            {/* Programme details */}
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
                <span className="provider-value">{job.stipend}</span>
              </div>
              <div className="provider-row">
                <span className="provider-label">Status</span>
                <span className="provider-value" style={{ color: isExpired ? "#c53030" : "#2e7d32", fontWeight: 600 }}>
                  {isExpired ? "Closed" : job.status || "Open"}
                </span>
              </div>
            </div>

            {/* Tips card */}
            <div className="tips-card">
              <h3 className="tips-title">💡 Application tips</h3>
              <ul className="tips-list">
                <li>Complete your full profile before applying</li>
                <li>Upload an up-to-date CV</li>
                <li>Make sure your NQF level matches the requirement</li>
                <li>Apply before the closing date</li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetailPage;