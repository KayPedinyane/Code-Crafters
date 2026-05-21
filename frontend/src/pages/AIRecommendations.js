import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./AIRecommendations.css";

const API = "https://code-crafters-t8dp.onrender.com";

const TYPE_COLORS = {
  Learnership:    { bg: "#e8f5e9", text: "#2e7d32" },
  Apprenticeship: { bg: "#fff3e0", text: "#e65100" },
  Internship:     { bg: "#e3f2fd", text: "#1565c0" },
};

function formatStipend(stipend) {
  if (!stipend) return "N/A";
  const s = stipend.toString().trim();
  if (s.startsWith("R") || s.startsWith("r")) return s;
  return `R${s}`;
}

// ── Smart matching engine (no API needed) ──
function scoreJob(job, profile) {
  let score = 0;
  const reasons = [];
  const tips    = [];

  // 1. NQF level match (highest weight — 35 pts)
  if (profile.nqf_level && job.nqf_level) {
    const profileNQF = parseInt(profile.nqf_level.replace(/\D/g, ""));
    const jobNQF     = parseInt(job.nqf_level.replace(/\D/g, ""));
    if (!isNaN(profileNQF) && !isNaN(jobNQF)) {
      if (profileNQF === jobNQF) {
        score += 35;
        reasons.push(`Your NQF ${profileNQF} qualification is a perfect match for this opportunity.`);
      } else if (Math.abs(profileNQF - jobNQF) === 1) {
        score += 20;
        reasons.push(`Your NQF ${profileNQF} is close to the required NQF ${jobNQF}.`);
        tips.push(`Consider upgrading your qualification to NQF ${jobNQF} for a stronger application.`);
      } else {
        tips.push(`This role requires NQF ${jobNQF} — your current NQF ${profileNQF} may need upskilling.`);
      }
    }
  }
  

  // 2. Sector / qualification match (25 pts)
  const qualification = (profile.qualification || "").toLowerCase();
  const sector        = (job.sector || "").toLowerCase();
  const jobTitle      = (job.title || "").toLowerCase();

  const SECTOR_KEYWORDS = {
    "information technology": ["it", "computer", "software", "technology", "data", "digital", "coding", "programming", "network", "cyber"],
    "finance": ["finance", "accounting", "bookkeeping", "economics", "financial", "banking", "audit"],
    "healthcare": ["health", "nursing", "medical", "care", "pharmacy", "dental", "clinical"],
    "engineering": ["engineering", "mechanical", "electrical", "civil", "construction", "technical"],
    "education": ["education", "teaching", "training", "early childhood", "school"],
    "business": ["business", "management", "administration", "marketing", "sales", "commerce", "logistics"],
    "agriculture": ["agriculture", "farming", "environmental", "natural resources"],
    "hospitality": ["hospitality", "tourism", "catering", "hotel", "travel"],
  };

  let sectorMatched = false;
  for (const [key, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    const qualMatch    = keywords.some(k => qualification.includes(k));
    const sectorMatch  = keywords.some(k => sector.includes(k)) || sector.includes(key);
    const titleMatch   = keywords.some(k => jobTitle.includes(k));
    if (qualMatch && (sectorMatch || titleMatch)) {
      score += 25;
      reasons.push(`Your ${profile.qualification} aligns well with the ${job.sector} sector.`);
      sectorMatched = true;
      break;
    }
  }
  if (!sectorMatched && qualification) {
    // Partial word match
    const qualWords = qualification.split(" ").filter(w => w.length > 3);
    const anyMatch  = qualWords.some(w => sector.includes(w) || jobTitle.includes(w));
    if (anyMatch) {
      score += 12;
      reasons.push(`Your qualification has some relevance to the ${job.sector} sector.`);
    }
  }

  // 3. Skills match (20 pts)
  const skills    = (profile.skills || "").toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
  const jobDesc   = (job.description || "").toLowerCase();
  const jobReqs   = (job.requirements || "").toLowerCase();
  const jobText   = `${jobDesc} ${jobReqs} ${jobTitle} ${sector}`;

  let skillMatches = 0;
  const matchedSkills = [];
  skills.forEach(skill => {
    if (skill.length > 2 && jobText.includes(skill)) {
      skillMatches++;
      matchedSkills.push(skill);
    }
  });

  if (skillMatches >= 3) {
    score += 20;
    reasons.push(`Your skills (${matchedSkills.slice(0, 3).join(", ")}) are directly relevant.`);
  } else if (skillMatches >= 1) {
    score += 10;
    reasons.push(`Some of your skills (${matchedSkills.join(", ")}) are relevant to this role.`);
    tips.push("Adding more relevant skills to your profile will improve your match score.");
  } else if (skills.length > 0) {
    tips.push("Consider adding skills specific to this sector to strengthen your application.");
  }

  // 4. Location match (15 pts)
  const profileProvince = (profile.province || "").toLowerCase();
  const profileCity     = (profile.city || "").toLowerCase();
  const jobLocation     = (job.location || "").toLowerCase();

  if (profileCity && jobLocation.includes(profileCity)) {
    score += 15;
    reasons.push(`This opportunity is in ${job.location}, where you are based.`);
  } else if (profileProvince && jobLocation.includes(profileProvince)) {
    score += 10;
    reasons.push(`This opportunity is in your province (${profile.province}).`);
  } else if (jobLocation.includes("remote") || jobLocation.includes("nationwide") || jobLocation.includes("south africa")) {
    score += 8;
    reasons.push("This opportunity is open to applicants across South Africa.");
  } else {
    tips.push(`This role is in ${job.location} — consider if you're open to relocating.`);
  }

  // 5. Subjects match (5 pts bonus)
  const subjects = (profile.subjects || "").toLowerCase();
  if (subjects && jobText) {
    const subjectWords = subjects.split(/[,\s]+/).filter(w => w.length > 3);
    const subjectMatch = subjectWords.some(w => jobText.includes(w));
    if (subjectMatch) {
      score += 5;
      reasons.push("Your academic subjects are relevant to this opportunity.");
    }
  }

  // ── Build final why text ──
  const why = reasons.length > 0
    ? reasons.slice(0, 2).join(" ")
    : `This ${job.type || "opportunity"} in ${job.sector} may align with your career goals.`;

  const tip = tips.length > 0
    ? tips[0]
    : "Make sure your profile is complete and your CV is up to date before applying.";

  // ── Match label ──
  let match_label = "Good Match";
  if (score >= 70)      match_label = "Excellent Match";
  else if (score >= 45) match_label = "Strong Match";

  return { score: Math.min(score, 100), match_label, why, tip };
}

function AIRecommendations() {
  const navigate = useNavigate();
  const [currentUser,      setCurrentUser]      = useState(null);
  const [profile,          setProfile]          = useState(null);
  const [jobs,             setJobs]             = useState([]);
  const [recommendations,  setRecommendations]  = useState([]);
  const [loading,          setLoading]          = useState(false);
  const [hasRun,           setHasRun]           = useState(false);
  const [dataLoading,      setDataLoading]      = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUser(user);
      else navigate("/");
    });
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    setDataLoading(true);
    Promise.all([
      fetch(`${API}/profile/${currentUser.email}`).then(r => r.json()),
      fetch(`${API}/opportunities`).then(r => r.json()),
    ]).then(([profileData, jobsData]) => {
      if (profileData && !profileData.error) setProfile(profileData);
      if (Array.isArray(jobsData)) {
        setJobs(jobsData.filter(j => !j.closing_date || new Date(j.closing_date) >= new Date()));
      }
      setDataLoading(false);
    }).catch(() => setDataLoading(false));
  }, [currentUser]);

  const getRecommendations = () => {
    if (!profile || jobs.length === 0) return;
    setLoading(true);
    setRecommendations([]);

    // Small timeout for UX — makes it feel like it's "thinking"
    setTimeout(() => {
      const scored = jobs
        .map(job => {
          const { score, match_label, why, tip } = scoreJob(job, profile);
          return { job, score, match_label, why, tip };
        })
        .filter(r => r.score >= 10)                        // only relevant results
        .sort((a, b) => b.score - a.score)                 // highest score first
        .slice(0, 5);                                      // top 5

      setRecommendations(scored);
      setHasRun(true);
      setLoading(false);
    }, 1800);
  };

  const matchColor = (label) => {
    if (label === "Excellent Match") return { bg: "#e8f5e9", text: "#2e7d32", border: "#a5d6a7" };
    if (label === "Strong Match")    return { bg: "#e3f2fd", text: "#1565c0", border: "#90caf9" };
    return                                  { bg: "#fff3e0", text: "#e65100", border: "#ffcc80" };
  };

  const profileComplete = profile && profile.full_name && profile.nqf_level;

  return (
    <div className="ai-wrapper">

      {/* ── HEADER ── */}
      <header className="ai-header">
        <div className="ai-header-inner">
          <div className="logo" onClick={() => navigate("/applicant")} style={{ cursor: "pointer" }}>
            <span className="logo-icon">◈</span>
            <span className="logo-text">SkillsBridge<span className="logo-accent">SA</span></span>
          </div>
          <button className="ai-back-btn" onClick={() => navigate("/applicant")}>
            ← Back to opportunities
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="ai-hero">
        <div className="ai-hero-inner">
          <div className="ai-hero-badge">✨ Smart Matching</div>
          <h1 className="ai-hero-title">
            Personalised <span className="ai-hero-green">Opportunity</span> Matches
          </h1>
          <p className="ai-hero-sub">
            Our smart matching engine analyses your profile, NQF level, skills and location
            to find the learnerships most likely to lead to your success — instantly, for free.
          </p>
        </div>
      </section>

      <div className="ai-content">

        {/* ── HOW IT WORKS ── */}
        {!hasRun && !loading && (
          <div className="ai-how-it-works">
            <h3 className="ai-how-title">How matching works</h3>
            <div className="ai-how-grid">
              {[
                { icon: "🎓", label: "NQF Level",    desc: "Matches your qualification level to role requirements" },
                { icon: "🏢", label: "Sector",       desc: "Aligns your field of study with opportunity sectors" },
                { icon: "⚡", label: "Skills",       desc: "Compares your skills to what employers need" },
                { icon: "📍", label: "Location",     desc: "Prioritises opportunities near you" },
              ].map(({ icon, label, desc }) => (
                <div key={label} className="ai-how-item">
                  <span className="ai-how-icon">{icon}</span>
                  <span className="ai-how-label">{label}</span>
                  <span className="ai-how-desc">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PROFILE SUMMARY CARD ── */}
        {profile && !dataLoading && (
          <div className="ai-profile-card">
            <div className="ai-profile-header">
              <div className="ai-profile-avatar">{(profile.full_name || "A").charAt(0).toUpperCase()}</div>
              <div>
                <h3 className="ai-profile-name">{profile.full_name || currentUser?.email}</h3>
                <p className="ai-profile-meta">
                  {[profile.qualification, profile.nqf_level, profile.city, profile.province]
                    .filter(Boolean).join(" · ")}
                </p>
              </div>
              {/* Match readiness score */}
              <div className="ai-readiness">
                <div className="ai-readiness-ring">
                  <svg viewBox="0 0 36 36" width="52" height="52">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3"/>
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#00c853" strokeWidth="3"
                      strokeDasharray={`${Math.min(
                        [profile.full_name, profile.nqf_level, profile.qualification,
                         profile.skills, profile.province, profile.city].filter(Boolean).length / 6 * 94.2, 94.2
                      )} 94.2`}
                      strokeLinecap="round" transform="rotate(-90 18 18)"
                    />
                    <text x="18" y="22" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0a1628">
                      {Math.round([profile.full_name, profile.nqf_level, profile.qualification,
                        profile.skills, profile.province, profile.city].filter(Boolean).length / 6 * 100)}%
                    </text>
                  </svg>
                </div>
                <span className="ai-readiness-label">Match<br/>Ready</span>
              </div>
            </div>
            {profile.skills && (
              <div className="ai-skills-row">
                {profile.skills.split(",").map(s => s.trim()).filter(Boolean).map(skill => (
                  <span key={skill} className="ai-skill-tag">{skill}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── WARNING: incomplete profile ── */}
        {!dataLoading && !profileComplete && (
          <div className="ai-warning">
            <span>⚠️</span>
            <div>
              <strong>Complete your profile for better matches</strong>
              <p>Add your NQF level, qualification and skills to get accurate recommendations.</p>
            </div>
            <button className="ai-warning-btn" onClick={() => navigate("/edit-profile")}>
              Complete Profile →
            </button>
          </div>
        )}

        {/* ── GENERATE BUTTON ── */}
        {!hasRun && (
          <div className="ai-cta">
            <button
              className={`ai-generate-btn ${loading ? "ai-generate-btn-loading" : ""}`}
              onClick={getRecommendations}
              disabled={loading || dataLoading || !profileComplete}
            >
              {loading ? (
                <><span className="ai-spinner">⟳</span> Analysing your profile...</>
              ) : (
                <>✨ Find My Best Matches</>
              )}
            </button>
            <p className="ai-cta-sub">
              Analyses {jobs.length} available opportunities · Free · Instant
            </p>
          </div>
        )}

        {/* ── LOADING STATE ── */}
        {loading && (
          <div className="ai-loading">
            <div className="ai-loading-dots"><span/><span/><span/></div>
            <p>Matching your profile against {jobs.length} opportunities…</p>
            <div className="ai-loading-steps">
              {["Checking NQF levels…", "Comparing sectors…", "Analysing skills…", "Scoring locations…"].map((step, i) => (
                <span key={i} className="ai-loading-step" style={{ animationDelay: `${i * 0.4}s` }}>{step}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── NO RESULTS ── */}
        {hasRun && !loading && recommendations.length === 0 && (
          <div className="ai-no-results">
            <span>🔍</span>
            <h3>No strong matches found</h3>
            <p>This could be because your profile needs more detail. Try adding your NQF level, qualification, skills and location.</p>
            <button className="ai-warning-btn" onClick={() => navigate("/edit-profile")}>Update Profile →</button>
          </div>
        )}

        {/* ── RESULTS ── */}
        {recommendations.length > 0 && !loading && (
          <div className="ai-results">
            <div className="ai-results-header">
              <div>
                <h2 className="ai-results-title">Your Top {recommendations.length} Matches</h2>
                <p className="ai-results-sub">Based on your NQF level, sector, skills and location</p>
              </div>
              <button className="ai-refresh-btn" onClick={() => { setHasRun(false); setRecommendations([]); }}>
                ↻ Re-run
              </button>
            </div>

            <div className="ai-cards">
              {recommendations.map((rec, index) => {
                const { job, score, match_label, why, tip } = rec;
                const colors  = matchColor(match_label);
                const typeCol = TYPE_COLORS[job.type] || { bg: "#f0f0f0", text: "#333" };
                const daysLeft = job.closing_date
                  ? Math.ceil((new Date(job.closing_date) - new Date()) / 86400000)
                  : null;
                return (
                  <div key={job.id} className="ai-card" style={{ animationDelay: `${index * 0.1}s` }}>

                    <div className="ai-rank-badge">#{index + 1} Match</div>

                    {/* Match score bar */}
                    <div className="ai-match-row">
                      <span className="ai-match-label"
                        style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                        {match_label}
                      </span>
                      <div className="ai-score-bar-wrap">
                        <div className="ai-score-bar" style={{ width: `${score}%`, background: colors.text }} />
                      </div>
                      <span className="ai-score-num" style={{ color: colors.text }}>{score}%</span>
                    </div>

                    {/* Job header */}
                    <div className="ai-card-top">
                      <div className="ai-company-logo">{job.title.charAt(0).toUpperCase()}</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span className="type-badge" style={{ background: typeCol.bg, color: typeCol.text }}>
                          {job.type || "Opportunity"}
                        </span>
                        {daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 && (
                          <span className="ai-closing-pill">⏰ {daysLeft}d left</span>
                        )}
                      </div>
                    </div>

                    <h3 className="ai-card-title">{job.title}</h3>
                    <p className="ai-card-company">{job.company_name || job.company || job.sector}</p>

                    <div className="ai-card-details">
                      <span>📍 {job.location}</span>
                      <span>💰 {formatStipend(job.stipend) || "N/A"}</span>
                      <span>⏱ {job.duration || "N/A"}</span>
                      <span>🎓 {job.nqf_level}</span>
                    </div>

                    {/* Why this matches */}
                    <div className="ai-why">
                      <p className="ai-why-label">🎯 Why this matches you</p>
                      <p className="ai-why-text">{why}</p>
                    </div>

                    {/* Tip */}
                    <div className="ai-tip">
                      <span className="ai-tip-icon">💡</span>
                      <span className="ai-tip-text">{tip}</span>
                    </div>

                    <button className="ai-apply-btn"
                      onClick={() => navigate(`/applicant/job/${job.id}`, { state: { job } })}>
                      View & Apply →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AIRecommendations;
