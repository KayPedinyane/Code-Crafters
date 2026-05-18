import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import "./EditProfile.css";
import { NQF_LEVELS, QUALIFICATION_TYPES } from "../utils/nqfData";
import { PROVINCES, CITIES_BY_PROVINCE } from "../utils/saLocations";

const API = "https://code-crafters-t8dp.onrender.com";

const INSTITUTION_TYPES = [
  "University", "University of Technology", "TVET College",
  "Private College", "High School", "Other",
];

const INSTITUTIONS_BY_TYPE = {
  "University": [
    "University of Cape Town (UCT)", "University of the Witwatersrand (Wits)",
    "Stellenbosch University", "University of Pretoria (UP)",
    "University of KwaZulu-Natal (UKZN)", "University of Johannesburg (UJ)",
    "University of the Free State (UFS)", "Rhodes University",
    "University of the Western Cape (UWC)", "North-West University (NWU)",
    "University of Limpopo", "University of Venda", "University of Zululand",
    "Walter Sisulu University", "Sol Plaatje University",
    "University of Mpumalanga", "Sefako Makgatho Health Sciences University",
  ],
  "University of Technology": [
    "Cape Peninsula University of Technology (CPUT)", "Durban University of Technology (DUT)",
    "Mangosuthu University of Technology (MUT)", "Tshwane University of Technology (TUT)",
    "Vaal University of Technology (VUT)", "Central University of Technology (CUT)",
  ],
  "TVET College": [
    "Ekurhuleni East TVET College", "Ekurhuleni West TVET College",
    "South West Gauteng TVET College", "Tshwane North TVET College",
    "Tshwane South TVET College", "West Coast TVET College",
    "False Bay TVET College", "College of Cape Town", "Boland TVET College",
    "Buffalo City TVET College", "King Hintsa TVET College", "Lovedale TVET College",
    "Elangeni TVET College", "Esayidi TVET College", "Umgungundlovu TVET College",
    "Flavius Mareka TVET College", "Motheo TVET College", "Lephalale TVET College",
    "Mopani South East TVET College", "Sekhukhune TVET College", "Nkangala TVET College",
    "Ehlanzeni TVET College", "Orbit TVET College", "Taletso TVET College",
    "Northern Cape Urban TVET College", "Sol Plaatje TVET College",
  ],
  "Private College": [
    "Rosebank College", "Boston City Campus", "Damelin", "CTI Education Group",
    "IIE MSA (Management College of Southern Africa)", "Richfield Graduate Institute",
    "Varsity College", "Academy of York", "Oxbridge Academy",
    "SA College of Applied Psychology (SACAP)",
  ],
  "High School": [],
  "Other": [],
};

function parseSAID(idNumber) {
  if (!idNumber || idNumber.length < 6) return null;
  const year  = idNumber.substring(0, 2);
  const month = idNumber.substring(2, 4);
  const day   = idNumber.substring(4, 6);
  const currentYear = new Date().getFullYear() % 100;
  const fullYear    = parseInt(year) <= currentYear ? `20${year}` : `19${year}`;
  const dateStr     = `${fullYear}-${month}-${day}`;
  const date        = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  return dateStr;
}

// ── Profile completion calculator ──
function calcCompletion(personal, education, skillsList, cvName) {
  const checks = [
    personal.fullName, personal.phone, personal.idNumber,
    personal.gender, personal.city, personal.province,
    education.highestQualification, education.institution, education.nqfLevel,
    skillsList.length > 0 ? "yes" : "",
    cvName ? "yes" : "",
  ];
  const filled = checks.filter(v => v && v.toString().trim() !== "").length;
  return Math.round((filled / checks.length) * 100);
}

const Field = ({ label, name, required, errors, hint, children }) => (
  <div className="ep-field">
    <label>
      {label} {required && <span className="ep-required">*</span>}
    </label>
    {children}
    {hint && <span className="ep-hint">{hint}</span>}
    {errors?.[name] && <span className="ep-error-msg">⚠ {errors[name]}</span>}
  </div>
);

function EditProfile() {
  const navigate = useNavigate();
  const [currentEmail, setCurrentEmail] = useState(null);
  const [activeSection, setActiveSection] = useState("personal");
  const [saveAllLoading, setSaveAllLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentEmail(user.email);
      else navigate("/");
    });
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [personal, setPersonal] = useState({
    fullName: "", phone: "", idNumber: "", dateOfBirth: "",
    gender: "", race: "", disability: "", city: "", province: "",
  });

  const availableCities = personal.province ? (CITIES_BY_PROVINCE[personal.province] || []) : [];

  const [education, setEducation] = useState({
    highestQualification: "", institutionType: "", institution: "",
    yearCompleted: "", nqfLevel: "", subjects: "",
  });

  const availableInstitutions = education.institutionType
    ? (INSTITUTIONS_BY_TYPE[education.institutionType] || [])
    : [];

  const [skillsList, setSkillsList]         = useState([]);
  const [skillInput, setSkillInput]         = useState("");
  const [suggestedSkills]                   = useState(["Microsoft Office", "Communication", "Problem Solving", "Teamwork", "Time Management", "Data Analysis", "Customer Service", "Project Management"]);
  const [cvFile,     setCvFile]             = useState(null);
  const [cvName,     setCvName]             = useState(null);
  const [personalErrors,  setPersonalErrors]  = useState({});
  const [educationErrors, setEducationErrors] = useState({});
  const [saved, setSaved] = useState({ personal: false, education: false, skills: false, cv: false });
  const fileInputRef = useRef(null);

  const completion = calcCompletion(personal, education, skillsList, cvName);

  // ── Load profile from DB ──
  useEffect(() => {
    if (!currentEmail) return;
    const localKey = `profile_${currentEmail}`;
    fetch(`${API}/profile/${encodeURIComponent(currentEmail)}`)
      .then(r => r.json())
      .then(data => {
        if (data && !data.error && data.full_name) {
          const p = {
            fullName:    data.full_name     || "",
            phone:       data.phone         || "",
            idNumber:    data.id_number     || "",
            dateOfBirth: data.date_of_birth ? data.date_of_birth.substring(0, 10) : "",
            gender:      data.gender        || "",
            race:        data.race          || "",
            disability:  data.disability    || "",
            city:        data.city          || "",
            province:    data.province      || "",
          };
          const e = {
            highestQualification: data.qualification    || "",
            institutionType:      data.institution_type || "",
            institution:          data.institution      || "",
            yearCompleted:        data.year_completed   || "",
            nqfLevel:             data.nqf_level        || "",
            subjects:             data.subjects         || "",
          };
          setPersonal(p);
          setEducation(e);
          setSkillsList(data.skills ? data.skills.split(",").map(s => s.trim()).filter(Boolean) : []);
          setCvName(data.cv_url || null);
          localStorage.setItem(localKey, JSON.stringify({ personal: p, education: e, skills: data.skills, cvName: data.cv_url }));
        } else {
          const local = JSON.parse(localStorage.getItem(localKey));
          if (local) {
            if (local.personal)  setPersonal(local.personal);
            if (local.education) setEducation(local.education);
            if (local.skills)    setSkillsList(local.skills.split(",").map(s => s.trim()).filter(Boolean));
            if (local.cvName)    setCvName(local.cvName);
          }
        }
      })
      .catch(() => {
        const local = JSON.parse(localStorage.getItem(`profile_${currentEmail}`));
        if (local) {
          if (local.personal)  setPersonal(local.personal);
          if (local.education) setEducation(local.education);
          if (local.skills)    setSkillsList(local.skills.split(",").map(s => s.trim()).filter(Boolean));
          if (local.cvName)    setCvName(local.cvName);
        }
      });
  }, [currentEmail]);

  const showSaved = (section) => {
    setSaved(prev => ({ ...prev, [section]: true }));
    setTimeout(() => setSaved(prev => ({ ...prev, [section]: false })), 3000);
  };

  const saveLocal = (p, e, skills, cv) => {
    localStorage.setItem(`profile_${currentEmail}`, JSON.stringify({
      personal:  p     || personal,
      education: e     || education,
      skills:    skills !== undefined ? skills : skillsList.join(", "),
      cvName:    cv     !== undefined ? cv     : cvName,
    }));
  };

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setPersonal(prev => ({ ...prev, phone: digits }));
      return;
    }
    if (name === "idNumber") {
      const digits = value.replace(/\D/g, "").slice(0, 13);
      const dob    = digits.length >= 6 ? parseSAID(digits) : "";
      setPersonal(prev => ({ ...prev, idNumber: digits, dateOfBirth: dob || prev.dateOfBirth }));
      return;
    }
    if (name === "province") {
      setPersonal(prev => ({ ...prev, province: value, city: "" }));
      return;
    }
    setPersonal(prev => ({ ...prev, [name]: value }));
  };

  const handleEducationChange = (e) => {
    const { name, value } = e.target;
    if (name === "institutionType") {
      setEducation(prev => ({ ...prev, institutionType: value, institution: "" }));
      return;
    }
    if (name === "yearCompleted") {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      setEducation(prev => ({ ...prev, yearCompleted: digits }));
      return;
    }
    setEducation(prev => ({ ...prev, [name]: value }));
  };

  const validatePersonal = () => {
    const required = { fullName: "Full Name", phone: "Phone Number", idNumber: "ID Number", gender: "Gender", city: "City", province: "Province" };
    const errs = {};
    Object.keys(required).forEach(field => {
      if (!personal[field] || personal[field].trim() === "") errs[field] = `${required[field]} is required`;
    });
    if (personal.phone && personal.phone.length !== 10)   errs.phone    = "Phone number must be exactly 10 digits";
    if (personal.idNumber && personal.idNumber.length !== 13) errs.idNumber = "ID number must be exactly 13 digits";
    setPersonalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateEducation = () => {
    const required = { highestQualification: "Highest Qualification", institutionType: "Institution Type", institution: "Institution", nqfLevel: "NQF Level" };
    const errs = {};
    Object.keys(required).forEach(field => {
      if (!education[field] || education[field].trim() === "") errs[field] = `${required[field]} is required`;
    });
    setEducationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const savePersonal = () => {
    if (!validatePersonal()) return;
    const payload = {
      email: currentEmail, full_name: personal.fullName, phone: personal.phone,
      id_number: personal.idNumber, date_of_birth: personal.dateOfBirth,
      gender: personal.gender, race: personal.race, disability: personal.disability,
      city: personal.city, province: personal.province,
    };
    fetch(`${API}/profile`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(r => r.json())
      .then(() => { saveLocal(personal, null, undefined, undefined); showSaved("personal"); })
      .catch(err => console.log("Personal save error:", err));
  };

  const saveEducation = () => {
    if (!validateEducation()) return;
    const payload = {
      email: currentEmail, qualification: education.highestQualification,
      institution_type: education.institutionType, institution: education.institution,
      year_completed: education.yearCompleted, nqf_level: education.nqfLevel,
      subjects: education.subjects,
    };
    fetch(`${API}/profile`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(r => r.json())
      .then(() => { saveLocal(null, education, undefined, undefined); showSaved("education"); })
      .catch(err => console.log("Education save error:", err));
  };

  const saveSkills = () => {
    const skillsStr = skillsList.join(", ");
    saveLocal(null, null, skillsStr, undefined);
    fetch(`${API}/profile`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: currentEmail, skills: skillsStr }) })
      .then(r => r.json())
      .then(() => showSaved("skills"))
      .catch(err => console.log("Skills save error:", err));
  };

  const saveCv = () => {
    const name = cvFile ? cvFile.name : cvName;
    if (!name) return;
    if (cvFile) setCvName(cvFile.name);
    saveLocal(null, null, undefined, name);
    fetch(`${API}/profile`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: currentEmail, cv_url: name }) })
      .then(r => r.json())
      .then(() => showSaved("cv"))
      .catch(err => console.log("CV save error:", err));
  };

  const saveAll = () => {
    const personalOk  = validatePersonal();
    const educationOk = validateEducation();
    if (!personalOk || !educationOk) return;
    setSaveAllLoading(true);
    const payload = {
      email: currentEmail, full_name: personal.fullName, phone: personal.phone,
      id_number: personal.idNumber, date_of_birth: personal.dateOfBirth,
      gender: personal.gender, race: personal.race, disability: personal.disability,
      city: personal.city, province: personal.province,
      qualification: education.highestQualification, institution_type: education.institutionType,
      institution: education.institution, year_completed: education.yearCompleted,
      nqf_level: education.nqfLevel, subjects: education.subjects,
      skills: skillsList.join(", "), cv_url: cvFile ? cvFile.name : cvName,
    };
    fetch(`${API}/profile`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(r => r.json())
      .then(() => {
        saveLocal(personal, education, skillsList.join(", "), cvFile ? cvFile.name : cvName);
        showSaved("personal"); showSaved("education"); showSaved("skills");
        if (cvFile || cvName) showSaved("cv");
        setSaveAllLoading(false);
      })
      .catch(err => { console.log("Save all error:", err); setSaveAllLoading(false); });
  };

  const addSkill = (skill) => {
    const trimmed = (skill || skillInput).trim();
    if (trimmed && !skillsList.includes(trimmed)) {
      setSkillsList(prev => [...prev, trimmed]);
      setSkillInput("");
    }
  };
  const removeSkill    = (skill) => setSkillsList(prev => prev.filter(s => s !== skill));
  const handleCvChange = (e)     => { if (e.target.files[0]) setCvFile(e.target.files[0]); };

  const SECTIONS = [
    { id: "personal",   icon: "👤", label: "Personal"  },
    { id: "education",  icon: "🎓", label: "Education"  },
    { id: "skills",     icon: "⚡", label: "Skills"     },
    { id: "cv",         icon: "📄", label: "CV Upload"  },
  ];

  if (!currentEmail) {
    return (
      <div className="ep-wrapper">
        <div style={{ textAlign: "center", padding: "120px 24px" }}>
          <div className="ep-loading-spinner" />
          <p style={{ marginTop: 16, fontSize: 15, color: "#718096" }}>Loading your profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ep-wrapper">

      {/* ── HEADER ── */}
      <header className="ep-header">
        <div className="ep-header-inner">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">SkillsBridge<span className="logo-accent">SA</span></span>
          </div>
          <button className="ep-back-btn" onClick={() => navigate("/applicant")}>
            ← Back to opportunities
          </button>
        </div>
      </header>

      {/* ── PAGE TITLE + COMPLETION ── */}
      <div className="ep-page-title">
        <div className="ep-page-title-inner">
          <div>
            <h1>Edit Profile</h1>
            <p>Signed in as <strong style={{ color: "#00c853" }}>{currentEmail}</strong></p>
          </div>
          {/* Completion ring */}
          <div className="ep-completion-widget">
            <svg viewBox="0 0 36 36" width="72" height="72">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3"/>
              <circle cx="18" cy="18" r="15" fill="none" stroke="#00c853" strokeWidth="3"
                strokeDasharray={`${completion * 0.942} 94.2`}
                strokeLinecap="round" transform="rotate(-90 18 18)"
                style={{ transition: "stroke-dasharray 0.6s ease" }}
              />
              <text x="18" y="21" textAnchor="middle" fontSize="9" fontWeight="700" fill="white">{completion}%</text>
            </svg>
            <div>
              <p className="ep-completion-label">Profile strength</p>
              <p className="ep-completion-sub">{completion < 100 ? "Keep going!" : "Complete ✓"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION TABS ── */}
      <div className="ep-tabs">
        {SECTIONS.map(s => (
          <button key={s.id}
            className={`ep-tab ${activeSection === s.id ? "ep-tab-active" : ""}`}
            onClick={() => setActiveSection(s.id)}>
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      <div className="ep-content">

        {/* ── 1. PERSONAL DETAILS ── */}
        {activeSection === "personal" && (
          <div className="ep-card ep-card-animated">
            <div className="ep-card-header">
              <div className="ep-card-icon">👤</div>
              <div>
                <h2 className="ep-card-title">Personal Details</h2>
                <p className="ep-card-sub">Fields marked <span className="ep-required">*</span> are required to apply</p>
              </div>
              {saved.personal && <span className="ep-saved-badge">✓ Saved!</span>}
            </div>

            <div className="ep-form-grid">

              <Field label="Full Name" name="fullName" required errors={personalErrors}>
                <input name="fullName" value={personal.fullName} onChange={handlePersonalChange}
                  placeholder="e.g. John Mkhize" className={personalErrors.fullName ? "ep-input-error" : ""} />
              </Field>

              <div className="ep-field">
                <label>Email Address</label>
                <input value={currentEmail} disabled style={{ opacity: 0.6, cursor: "not-allowed", background: "#f0f0f0" }} />
                <span className="ep-hint">Email cannot be changed — this is your login email</span>
              </div>

              <Field label="Phone Number (SA — 10 digits)" name="phone" required errors={personalErrors}
                hint={`${personal.phone.length}/10 digits`}>
                <input name="phone" value={personal.phone} onChange={handlePersonalChange}
                  placeholder="e.g. 0821234567" maxLength={10} inputMode="numeric"
                  className={personalErrors.phone ? "ep-input-error" : ""} />
              </Field>

              <Field label="SA ID Number (13 digits)" name="idNumber" required errors={personalErrors}
                hint={`${personal.idNumber.length}/13 digits${personal.idNumber.length === 13 ? " ✓ Date of birth auto-filled" : ""}`}>
                <input name="idNumber" value={personal.idNumber} onChange={handlePersonalChange}
                  placeholder="e.g. 0001014800086" maxLength={13} inputMode="numeric"
                  className={personalErrors.idNumber ? "ep-input-error" : ""} />
              </Field>

              <div className="ep-field">
                <label>Date of Birth <span style={{ fontSize: 11, color: "#718096" }}>(auto-filled from ID)</span></label>
                <input name="dateOfBirth" type="date" value={personal.dateOfBirth} onChange={handlePersonalChange}
                  disabled={personal.idNumber.length === 13}
                  style={personal.idNumber.length === 13 ? { opacity: 0.7, background: "#f0f0f0" } : {}} />
              </div>

              <Field label="Gender" name="gender" required errors={personalErrors}>
                <select name="gender" value={personal.gender} onChange={handlePersonalChange}
                  className={personalErrors.gender ? "ep-input-error" : ""}>
                  <option value="">Select gender</option>
                  <option>Male</option><option>Female</option>
                  <option>Non-binary</option><option>Prefer not to say</option>
                </select>
              </Field>

              <Field label="Race" name="race">
                <select name="race" value={personal.race} onChange={handlePersonalChange}>
                  <option value="">Select race</option>
                  <option>African/Black</option><option>Coloured</option>
                  <option>Indian/Asian</option><option>White</option>
                  <option>Prefer not to say</option>
                </select>
              </Field>

              <Field label="Disability Status" name="disability">
                <select name="disability" value={personal.disability} onChange={handlePersonalChange}>
                  <option value="">Select option</option>
                  <option>No disability</option>
                  <option>Yes, I have a disability</option>
                  <option>Prefer not to say</option>
                </select>
              </Field>

              <Field label="Province" name="province" required errors={personalErrors}>
                <select name="province" value={personal.province} onChange={handlePersonalChange}
                  className={personalErrors.province ? "ep-input-error" : ""}>
                  <option value="">Select province</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>

              <Field label="City" name="city" required errors={personalErrors}>
                {personal.province ? (
                  <select name="city" value={personal.city} onChange={handlePersonalChange}
                    className={personalErrors.city ? "ep-input-error" : ""}>
                    <option value="">Select city</option>
                    {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="Other">Other (not listed)</option>
                  </select>
                ) : (
                  <input name="city" value="" placeholder="Select a province first"
                    disabled style={{ opacity: 0.5, cursor: "not-allowed" }} />
                )}
              </Field>

            </div>

            <div className="ep-save-row">
              <button className="ep-save-btn" onClick={savePersonal}>Save Personal Details</button>
              <button className="ep-next-btn" onClick={() => setActiveSection("education")}>Next: Education →</button>
            </div>
          </div>
        )}

        {/* ── 2. EDUCATION ── */}
        {activeSection === "education" && (
          <div className="ep-card ep-card-animated">
            <div className="ep-card-header">
              <div className="ep-card-icon">🎓</div>
              <div>
                <h2 className="ep-card-title">Education</h2>
                <p className="ep-card-sub">Fields marked <span className="ep-required">*</span> are required to apply</p>
              </div>
              {saved.education && <span className="ep-saved-badge">✓ Saved!</span>}
            </div>

            <div className="ep-form-grid">

              <Field label="Highest Qualification" name="highestQualification" required errors={educationErrors}>
                <select name="highestQualification" value={education.highestQualification} onChange={handleEducationChange}
                  className={educationErrors.highestQualification ? "ep-input-error" : ""}>
                  <option value="">Select qualification</option>
                  {QUALIFICATION_TYPES.map(q => <option key={q.value} value={q.value}>{q.value} — {q.nqf}</option>)}
                </select>
              </Field>

              <Field label="NQF Level" name="nqfLevel" required errors={educationErrors}>
                <select name="nqfLevel" value={education.nqfLevel} onChange={handleEducationChange}
                  className={educationErrors.nqfLevel ? "ep-input-error" : ""}>
                  <option value="">Select NQF level</option>
                  {NQF_LEVELS.map(level => <option key={level.value} value={level.value}>{level.label} — {level.description}</option>)}
                </select>
              </Field>

              <Field label="Institution Type" name="institutionType" required errors={educationErrors}>
                <select name="institutionType" value={education.institutionType} onChange={handleEducationChange}
                  className={educationErrors.institutionType ? "ep-input-error" : ""}>
                  <option value="">Select institution type</option>
                  {INSTITUTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>

              <Field label="Institution Name" name="institution" required errors={educationErrors}>
                {education.institutionType && availableInstitutions.length > 0 ? (
                  <select name="institution" value={education.institution} onChange={handleEducationChange}
                    className={educationErrors.institution ? "ep-input-error" : ""}>
                    <option value="">Select institution</option>
                    {availableInstitutions.map(i => <option key={i} value={i}>{i}</option>)}
                    <option value="Other">Other (not listed)</option>
                  </select>
                ) : (
                  <input name="institution" value={education.institution} onChange={handleEducationChange}
                    placeholder={!education.institutionType ? "Select institution type first" : "Enter your institution name"}
                    disabled={!education.institutionType}
                    style={!education.institutionType ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                    className={educationErrors.institution ? "ep-input-error" : ""} />
                )}
              </Field>

              <Field label="Year Completed" name="yearCompleted">
                <input name="yearCompleted" value={education.yearCompleted} onChange={handleEducationChange}
                  placeholder="e.g. 2024" maxLength={4} inputMode="numeric" />
              </Field>

              <div className="ep-field ep-field-full">
                <label>Relevant Subjects / Majors</label>
                <input name="subjects" value={education.subjects} onChange={handleEducationChange}
                  placeholder="e.g. Mathematics, Physics, Business Studies, etc." />
              </div>

            </div>

            <div className="ep-save-row">
              <button className="ep-back-section-btn" onClick={() => setActiveSection("personal")}>← Personal</button>
              <button className="ep-save-btn" onClick={saveEducation}>Save Education</button>
              <button className="ep-next-btn" onClick={() => setActiveSection("skills")}>Next: Skills →</button>
            </div>
          </div>
        )}

        {/* ── 3. SKILLS ── */}
        {activeSection === "skills" && (
          <div className="ep-card ep-card-animated">
            <div className="ep-card-header">
              <div className="ep-card-icon">⚡</div>
              <div>
                <h2 className="ep-card-title">Skills</h2>
                <p className="ep-card-sub">Add skills relevant to the opportunities you are applying for</p>
              </div>
              {saved.skills && <span className="ep-saved-badge">✓ Saved!</span>}
            </div>

            <div className="ep-skills-input-row">
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addSkill()}
                placeholder="Type a skill and press Enter or Add" />
              <button className="ep-add-skill-btn" onClick={() => addSkill()}>Add</button>
            </div>

            {/* Suggested skills */}
            <div className="ep-suggested-skills">
              <span className="ep-suggested-label">Suggested:</span>
              {suggestedSkills.filter(s => !skillsList.includes(s)).slice(0, 6).map(s => (
                <button key={s} className="ep-suggested-chip" onClick={() => addSkill(s)}>{s} +</button>
              ))}
            </div>

            {skillsList.length > 0 && (
              <div className="ep-skills-list">
                {skillsList.map(skill => (
                  <span key={skill} className="ep-skill-tag">
                    {skill}
                    <span className="ep-skill-remove" onClick={() => removeSkill(skill)}>✕</span>
                  </span>
                ))}
              </div>
            )}

            {skillsList.length === 0 && (
              <div className="ep-skills-empty">
                <span>⚡</span>
                <p>No skills added yet. Add some to stand out to employers!</p>
              </div>
            )}

            <div className="ep-save-row">
              <button className="ep-back-section-btn" onClick={() => setActiveSection("education")}>← Education</button>
              <button className="ep-save-btn" onClick={saveSkills}>Save Skills</button>
              <button className="ep-next-btn" onClick={() => setActiveSection("cv")}>Next: CV →</button>
            </div>
          </div>
        )}

        {/* ── 4. CV UPLOAD ── */}
        {activeSection === "cv" && (
          <div className="ep-card ep-card-animated">
            <div className="ep-card-header">
              <div className="ep-card-icon">📄</div>
              <div>
                <h2 className="ep-card-title">Upload CV</h2>
                <p className="ep-card-sub">Upload your CV so employers can review it</p>
              </div>
              {saved.cv && <span className="ep-saved-badge">✓ Saved!</span>}
            </div>

            <div className="ep-cv-dropzone" onClick={() => fileInputRef.current.click()}>
              {cvFile || cvName ? (
                <>
                  <span className="ep-cv-icon ep-cv-icon-success">✓</span>
                  <p className="ep-cv-filename">{cvFile ? cvFile.name : cvName}</p>
                  <p className="ep-cv-hint">Click to replace your CV</p>
                </>
              ) : (
                <>
                  <span className="ep-cv-icon">☁</span>
                  <p className="ep-cv-label">Click to upload your CV</p>
                  <p className="ep-cv-hint">PDF, DOC, or DOCX — max 10MB</p>
                </>
              )}
            </div>

            <input type="file" ref={fileInputRef} accept=".pdf,.doc,.docx"
              style={{ display: "none" }} onChange={handleCvChange} />

            <div className="ep-cv-tips">
              <p>💡 <strong>CV tips:</strong> Keep it to 1–2 pages · Use clear headings · Include your contact details · Tailor it to each opportunity</p>
            </div>

            <div className="ep-save-row">
              <button className="ep-back-section-btn" onClick={() => setActiveSection("skills")}>← Skills</button>
              <button className="ep-save-btn" onClick={saveCv}
                style={{ opacity: (cvFile || cvName) ? 1 : 0.5 }}>Save CV</button>
            </div>
          </div>
        )}

        {/* ── SAVE ALL ── */}
        <div className="ep-save-all-card">
          <div className="ep-save-all-left">
            <div className="ep-save-all-ring">
              <svg viewBox="0 0 36 36" width="56" height="56">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3"/>
                <circle cx="18" cy="18" r="15" fill="none" stroke="#00c853" strokeWidth="3"
                  strokeDasharray={`${completion * 0.942} 94.2`}
                  strokeLinecap="round" transform="rotate(-90 18 18)" />
                <text x="18" y="21" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0a1628">{completion}%</text>
              </svg>
            </div>
            <div>
              <h3 className="ep-save-all-title">Save everything at once</h3>
              <p className="ep-save-all-sub">Saves personal, education, skills and CV in one go</p>
            </div>
          </div>
          <button className="ep-save-all-btn" onClick={saveAll} disabled={saveAllLoading}>
            {saveAllLoading ? <span className="ep-btn-spinner" /> : null}
            {saveAllLoading ? "Saving…" : "Save Everything"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default EditProfile;
