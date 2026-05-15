import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect} from "react";
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

// ── Confetti burst ──
function triggerConfetti() {
  const colors = ["#00c853", "#0a1628", "#ffd600", "#00bcd4", "#ff6b6b"];
  for (let i = 0; i < 70; i++) {
    const el = document.createElement("div");
    const size = 6 + Math.random() * 8;
    el.style.cssText = `
      position:fixed; width:${size}px; height:${size}px;
      border-radius:${Math.random() > 0.5 ? "50%" : "2px"};
      background:${colors[Math.floor(Math.random() * colors.length)]};
      left:${Math.random() * 100}vw; top:-10px;
      animation: confettiFall ${1.2 + Math.random() * 1.5}s ease-in forwards;
      z-index:9999; pointer-events:none;
      transform: rotate(${Math.random() * 360}deg);
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}

function JobDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [job,           setJob]           = useState(location.state?.job || null);
  const [loading,       setLoading]       = useState(!location.state?.job);
  const [currentUser,   setCurrentUser]   = useState(null);
  const [applying,      setApplying]      = useState(false);
  const [applyStatus,   setApplyStatus]   = useState(null);
  const [missingFields, setMissingFields] = useState([]);
  const [saved,         setSaved]         = useState(false);
  const [shareToast,    setShareToast]    = useState(false);

  // ── Scroll to top ──
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);

  // ── Auth ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
      if (user && job) {
        const savedList = JSON.parse(localStorage.getItem(`saved_jobs_${user.email}`) || "[]");
        setSaved(savedList.includes(job.id));
      }
    });
    return () => unsub();
  }, [job]);

  // ── Fetch job if not passed ──
  useEffect(() => {
    if (job) return;
    fetch(`${API}/opportunities`)
      .then(r => r.json())
      .then(data => {
        const found = data.find(j => j.id === parseInt(id));
        setJob(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, job]);

  // ── Fetch related jobs (same sector) ──

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
  };

  const requirementsList = Array.isArray(job?.requirements)
    ? job.requirements
    : job?.requirements
    ? job.requirements.split(",").map(r => r.trim())
    : [];

  const isExpired = job?.closing_date && new Date(job.closing_date) < new Date();

  const daysLeft = job?.closing_date
    ? Math.ceil((new Date(job.closing_date) - new Date()) / 86400000)
    : null;

  // ── Toggle save ──
  const handleSave = () => {
    if (!currentUser) { navigate("/login"); return; }
    const key  = `saved_jobs_${currentUser.email}`;
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    const next = saved ? list.filter(id => id !== job.id) : [...new Set([...list, job.id])];
    localStorage.setItem(key, JSON.stringify(next));
    setSaved(!saved);
  };

  // ── Share ──
  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: job.title, text: `Check out this opportunity: ${job.title}`, url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      });
    }
  };

  // ── Profile completeness ──
  const checkProfileComplete = async (email) => {
    const missing = [];
    try {
      const res  = await fetch(`${API}/profile/${email}`);
      const data = await res.json();
      if (!data || data.error) {
        return { complete: false, missing: ["Full Name","Phone Number","ID Number","Gender","City","Province","Qualification","Institution","NQF Level"] };
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

  // ── Apply ──
  const handleApply = async () => {
    if (!currentUser) { setApplyStatus("notLoggedIn"); return; }

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
      `Are you sure you want to apply for "${job.title}"?\n\nYour full profile details will be sent to the provider.`
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
        triggerConfetti(); // 🎉
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
          <div className="detail-loading-spinner" />
          <h2>Loading opportunity…</h2>
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

      {/* ── CONFETTI STYLE ── */}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>

      {/* ── SHARE TOAST ── */}
      {shareToast && (
        <div className="share-toast">✓ Link copied to clipboard!</div>
      )}

      {/* ── HEADER ── */}
      <header className="detail-header">
        <div className="detail-header-inner">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">SkillsBridge<span className="logo-accent">SA</span></span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button className="back-btn" onClick={() => navigate(-1)}>← Back to Opportunities</button>
        
          </div>
        </div>
      </header>

      {/* ── CLOSING COUNTDOWN BANNER ── */}
      {!isExpired && daysLeft !== null && daysLeft <= 5 && (
        <div className="closing-countdown-bar">
          ⏰ This opportunity closes in <strong>{daysLeft} day{daysLeft === 1 ? "" : "s"}</strong> — don't miss out!
        </div>
      )}

      {/* ── HERO ── */}
      <section className="detail-hero">
        <div className="detail-hero-inner">
          <div className="detail-company-logo">
            {job.title ? job.title.charAt(0).toUpperCase() : "?"}
          </div>
          <div className="detail-hero-text">
            <div className="detail-badges">
              <span className="detail-type-badge"
                style={{ background: TYPE_COLORS[job.opportunity_type]?.bg || "#e3f2fd",
                        color: TYPE_COLORS[job.opportunity_type]?.text || "#1565c0" }}>
                {job.opportunity_type || "Opportunity"}
              </span>
              {isExpired
                ? <span className="detail-expired-badge">Closed</span>
                : <span className="detail-open-badge">Open</span>
              }
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
          { icon: "📍", label: "Location",  value: job.location  },
          { icon: "💰", label: "Stipend",   value: job.stipend   },
          { icon: "⏱",  label: "Duration",  value: job.duration  },
          { icon: "🎓", label: "NQF Level", value: job.nqf_level },
          { icon: "🏢", label: "Sector",    value: job.sector    },
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
                      <span className="list-bullet">✓</span>{req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Application process timeline ── */}
            <div className="detail-card">
              <h2 className="section-title">What to expect</h2>
              <div className="timeline">
                {[
                  { icon: "📄", label: "Apply",       desc: "Submit your profile and CV online",           step: 1 },
                  { icon: "🔍", label: "Review",      desc: "Provider reviews your application",           step: 2 },
                  { icon: "📞", label: "Shortlisting", desc: "Shortlisted candidates are contacted",        step: 3 },
                  { icon: "🎓", label: "Placement",   desc: "Successful applicants begin the programme",   step: 4 },
                ].map(({ icon, label, desc, step }) => (
                  <div className="timeline-step" key={step}>
                    <div className="timeline-dot">
                      <span className="timeline-icon">{icon}</span>
                    </div>
                    <div className="timeline-content">
                      <span className="timeline-label">{label}</span>
                      <span className="timeline-desc">{desc}</span>
                    </div>
                    {step < 4 && <div className="timeline-line" />}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── RIGHT ── */}
          <div className="detail-right">
            <div className="apply-card">

              <div className="apply-closing">
                <span className="apply-closing-label">Application closes</span>
                <span className="apply-closing-date"
                  style={{ color: isExpired ? "#c53030" : daysLeft !== null && daysLeft <= 3 ? "#e65100" : "var(--text-primary)" }}>
                  {formatDate(job.closing_date)}
                </span>
                {!isExpired && daysLeft !== null && daysLeft <= 7 && (
                  <span className="days-left-pill" style={{ background: daysLeft <= 3 ? "#fff3e0" : "#f0fdf4", color: daysLeft <= 3 ? "#e65100" : "#2e7d32" }}>
                    {daysLeft <= 0 ? "Closes today!" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
                  </span>
                )}
                {isExpired && (
                  <span style={{ fontSize: 12, color: "#c53030", fontWeight: 500 }}>This opportunity has closed</span>
                )}
              </div>

              <div className="apply-spots">
                <span className="spots-badge">{job.nqf_level}</span>
              </div>

              {/* ── Status messages ── */}
              {applyStatus === "success" && (
                <div className="apply-message apply-message-success">
                  <strong> Application submitted!</strong>
                  <p>Your profile details have been sent to the provider. Check My Applications to track your status.</p>
                </div>
              )}
              {applyStatus === "incomplete" && (
                <div className="apply-message apply-message-error">
                  <strong>✕ Incomplete profile</strong>
                  <p>Please complete the following before applying:</p>
                  <ul className="missing-list">
                    {missingFields.map((field) => <li key={field}>• {field}</li>)}
                  </ul>
                  <span className="apply-message-link" onClick={() => navigate("/edit-profile")}>
                    Complete your profile →
                  </span>
                </div>
              )}
              {applyStatus === "notLoggedIn" && (
                <div className="apply-message apply-message-error">
                  <strong>Please log in to apply</strong>
                  <p>You need an account to apply for opportunities.</p>
                  <span className="apply-message-link" onClick={() => navigate("/login")}>Log in or Sign up →</span>
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

              {/* ── Apply button ── */}
              {applyStatus === "success" ? (
                <button className="apply-btn apply-btn-success" disabled>✓ Applied Successfully</button>
              ) : isExpired ? (
                <button className="apply-btn apply-btn-closed" disabled>Applications Closed</button>
              ) : (
                <button className="apply-btn" onClick={handleApply} disabled={applying}>
                  {applying ? <span className="btn-spinner" /> : null}
                  {applying ? "Checking profile…" : "Apply Now"}
                </button>
              )}

              {/* ── Save & Share row ── */}
              <div className="action-row">
                <button className={`save-btn ${saved ? "save-btn-active" : ""}`} onClick={handleSave}>
                  {saved ? "🔖 Saved" : "🏷 Save"}
                </button>
               
                <button className="share-btn-sm" onClick={handleShare} title="Share this opportunity">🔗 Share</button>
              </div>

              <div className="apply-note">
                Your full profile details including CV will be sent to the provider upon application.
              </div>
            </div>

            {/* ── Programme details ── */}
            <div className="provider-card">
              <h3 className="provider-title">Programme details</h3>
              {[
                { label: "Sector",    value: job.sector    },
                { label: "NQF Level", value: job.nqf_level },
                { label: "Duration",  value: job.duration  },
                { label: "Stipend",   value: job.stipend   },
                { label: "Status",    value: isExpired ? "Closed" : (job.status || "Open"),
                  style: { color: isExpired ? "#c53030" : "#2e7d32", fontWeight: 600 } },
              ].map(({ label, value, style }) => (
                <div className="provider-row" key={label}>
                  <span className="provider-label">{label}</span>
                  <span className="provider-value" style={style}>{value || "N/A"}</span>
                </div>
              ))}
            </div>

            {/* ── Tips card ── */}
            <div className="tips-card">
              <h3 className="tips-title">💡 Application tips</h3>
              <ul className="tips-list">
                <li>Complete your full profile before applying</li>
                <li>Upload an up-to-date CV</li>
                <li>Make sure your NQF level matches the requirement</li>
                <li>Apply before the closing date</li>
                <li>Check your email after applying for a confirmation</li>
              </ul>
            </div>

          </div>
        </div>


      </div>
    </div>
  );
}

export default JobDetailPage;
