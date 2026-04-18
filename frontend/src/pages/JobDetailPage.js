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

// ── Required fields that must be filled to apply ──
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

  // ── Get logged in user ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUser(user);
      else navigate("/");
    });
    return () => unsubscribe();
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

  // ── Check profile completeness ──
  // Returns { complete: bool, missing: [] }
  // ── Check profile completeness ──
  const checkProfileComplete = async (email) => {
    const missing = [];

    try {
      // Use email directly — no encoding
      const res  = await fetch(`${API}/profile/${email}`);
      const data = await res.json();

      console.log("Profile check result:", data); // debug

      if (!data || data.error) {
        return {
          complete: false,
          missing: ["Full Name", "Phone Number", "ID Number", "Gender",
                    "City", "Province", "Qualification", "Institution", "NQF Level"],
        };
      }

      // Check personal required fields
      Object.entries(REQUIRED_FIELDS).forEach(([field, label]) => {
        if (!data[field] || data[field].toString().trim() === "") {
          missing.push(label);
        }
      });

      // Check education required fields
      Object.entries(REQUIRED_EDUCATION).forEach(([field, label]) => {
        if (!data[field] || data[field].toString().trim() === "") {
          missing.push(label);
        }
      });

      return { complete: missing.length === 0, missing };

    } catch (err) {
      console.log("Profile check error:", err);
      // Fallback to localStorage
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
      return {
        complete: false,
        missing: ["Could not verify profile — please check your connection"],
      };
    }
  };

  // ── Handle Apply ──
  // ── Handle Apply ──
  const handleApply = async () => {
    if (!currentUser) return;
    setApplying(true);
    setApplyStatus(null);
    setMissingFields([]);

    const email = currentUser.email;

    // 1. Check profile completeness
    const { complete, missing } = await checkProfileComplete(email);

    if (!complete) {
      setMissingFields(missing);
      setApplyStatus("incomplete");
      setApplying(false);
      return;
    }

    setApplying(false);

    // 2. Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to apply for "${job.title}"?\n\nYour full profile details will be sent to the provider. You will receive further communication from them regarding your application.`
    );

    if (!confirmed) return;

    setApplying(true);

    // 3. Submit application
    try {
      const res  = await fetch(`${API}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicant_email: email,
          opportunity_id:  job.id,
        }),
      });
      const data = await res.json();
      console.log("Application response:", data);

      if (res.status === 409 || data?.message?.toLowerCase().includes("already")) {
        setApplyStatus("already");
      } else {
        setApplyStatus("success");
      }
    } catch (err) {
      console.log("Application error:", err);
      setApplyStatus("error");
    }

    setApplying(false);
  };

  if (loading) {
    return (
      <div className="detail-wrapper">
        <div className="not-found"><h2>Loading opportunity...</h2></div>
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
                background: TYPE_COLORS[job.type]?.bg || "#e3f2fd",
                color:      TYPE_COLORS[job.type]?.text || "#1565c0",
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
          </div>

          {/* ── RIGHT ── */}
          <div className="detail-right">
            <div className="apply-card">
              <div className="apply-closing">
                <span className="apply-closing-label">Application closes</span>
                <span className="apply-closing-date">{formatDate(job.closing_date)}</span>
              </div>

              <div className="apply-spots">
                <span className="spots-badge">{job.nqf_level}</span>
              </div>

              {/* ── Status messages ── */}
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
                  <span
                    className="apply-message-link"
                    onClick={() => navigate("/edit-profile")}
                  >
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
                <button
                  className="apply-btn"
                  style={{ background: "#e8f5e9", color: "#2e7d32", cursor: "default" }}
                  disabled
                >
                  ✓ Applied
                </button>
              ) : (
                <button
                  className="apply-btn"
                  onClick={handleApply}
                  disabled={applying}
                >
                  {applying ? "Checking profile..." : "Apply Now"}
                </button>
              )}

              <button className="save-btn">♡ Save opportunity</button>
              <div className="apply-note">
                Your full profile details including CV will be sent to the provider upon application.
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
                <span className="provider-value">{job.stipend}</span>
              </div>
              <div className="provider-row">
                <span className="provider-label">Status</span>
                <span className="provider-value" style={{ color: "#2e7d32", fontWeight: 600 }}>
                  {job.status || "Open"}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default JobDetailPage;