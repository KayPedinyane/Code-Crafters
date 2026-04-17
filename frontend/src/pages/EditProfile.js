import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css";

function EditProfile() {
  const navigate = useNavigate();

  // ── Get logged in user email ──
  // TEMPORARY: using placeholder until login saves to localStorage
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const currentEmail = storedUser?.email || "current-user";

  // ── Load saved data from localStorage on page open ──
  const savedPersonal = JSON.parse(localStorage.getItem(`profile_personal_${currentEmail}`)) || {
    fullName: "", email: currentEmail, phone: "", idNumber: "",
    dateOfBirth: "", gender: "", race: "", disability: "", city: "", province: "",
  };

  const savedEducation = JSON.parse(localStorage.getItem(`profile_education_${currentEmail}`)) || {
    highestQualification: "", institution: "", yearCompleted: "", nqfLevel: "", subjects: "",
  };

  const savedSkills = JSON.parse(localStorage.getItem(`profile_skills_${currentEmail}`)) || [];
  const savedCvName = localStorage.getItem(`profile_cv_name_${currentEmail}`) || null;

  // ── State ──
  const [personal,   setPersonal]   = useState(savedPersonal);
  const [education,  setEducation]  = useState(savedEducation);
  const [skillsList, setSkillsList] = useState(savedSkills);
  const [skillInput, setSkillInput] = useState("");
  const [cvFile,     setCvFile]     = useState(null);
  const [cvName,     setCvName]     = useState(savedCvName);
  const [saved, setSaved] = useState({ personal: false, education: false, skills: false, cv: false });

  const fileInputRef = useRef(null);

  const showSaved = (section) => {
    setSaved((prev) => ({ ...prev, [section]: true }));
    setTimeout(() => setSaved((prev) => ({ ...prev, [section]: false })), 2500);
  };

  const handlePersonalChange  = (e) => setPersonal({ ...personal, [e.target.name]: e.target.value });
  const handleEducationChange = (e) => setEducation({ ...education, [e.target.name]: e.target.value });

  // ── Save handlers ──
  const savePersonal = () => {
    localStorage.setItem(`profile_personal_${currentEmail}`, JSON.stringify(personal));
    // Also update the user object so header shows correct name
    const user = JSON.parse(localStorage.getItem("user")) || {};
    localStorage.setItem("user", JSON.stringify({ ...user, name: personal.fullName, email: personal.email || currentEmail }));
    showSaved("personal");
  };

  const saveEducation = () => {
    localStorage.setItem(`profile_education_${currentEmail}`, JSON.stringify(education));
    showSaved("education");
  };

  const saveSkills = () => {
    localStorage.setItem(`profile_skills_${currentEmail}`, JSON.stringify(skillsList));
    showSaved("skills");
  };

  const saveCv = () => {
    if (cvFile) {
      localStorage.setItem(`profile_cv_name_${currentEmail}`, cvFile.name);
      setCvName(cvFile.name);
      showSaved("cv");
    }
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skillsList.includes(trimmed)) {
      setSkillsList([...skillsList, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill) => setSkillsList(skillsList.filter((s) => s !== skill));

  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (file) setCvFile(file);
  };

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

      {/* ── PAGE TITLE ── */}
      <div className="ep-page-title">
        <div className="ep-page-title-inner">
          <h1>Edit Profile</h1>
          <p>Keep your information up to date to improve your chances.</p>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="ep-content">

        {/* ── 1. PERSONAL DETAILS ── */}
        <div className="ep-card">
          <div className="ep-card-header">
            <div className="ep-card-icon">👤</div>
            <div>
              <h2 className="ep-card-title">Personal Details</h2>
              <p className="ep-card-sub">Your basic personal information</p>
            </div>
          </div>

          <div className="ep-form-grid">
            <div className="ep-field">
              <label>Full Name</label>
              <input name="fullName" value={personal.fullName} onChange={handlePersonalChange} placeholder="e.g. Mlungisi Mahlangu" />
            </div>
            <div className="ep-field">
              <label>Email Address</label>
              <input name="email" type="email" value={personal.email} onChange={handlePersonalChange} placeholder="e.g. mlungisi@email.com" />
            </div>
            <div className="ep-field">
              <label>Phone Number</label>
              <input name="phone" value={personal.phone} onChange={handlePersonalChange} placeholder="e.g. 071 234 5678" />
            </div>
            <div className="ep-field">
              <label>ID Number</label>
              <input name="idNumber" value={personal.idNumber} onChange={handlePersonalChange} placeholder="13-digit SA ID number" />
            </div>
            <div className="ep-field">
              <label>Date of Birth</label>
              <input name="dateOfBirth" type="date" value={personal.dateOfBirth} onChange={handlePersonalChange} />
            </div>
            <div className="ep-field">
              <label>Gender</label>
              <select name="gender" value={personal.gender} onChange={handlePersonalChange}>
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Prefer not to say</option>
              </select>
            </div>
            <div className="ep-field">
              <label>Race</label>
              <select name="race" value={personal.race} onChange={handlePersonalChange}>
                <option value="">Select race</option>
                <option>African</option>
                <option>Coloured</option>
                <option>Indian/Asian</option>
                <option>White</option>
                <option>Prefer not to say</option>
              </select>
            </div>
            <div className="ep-field">
              <label>Disability Status</label>
              <select name="disability" value={personal.disability} onChange={handlePersonalChange}>
                <option value="">Select option</option>
                <option>No disability</option>
                <option>Yes, I have a disability</option>
                <option>Prefer not to say</option>
              </select>
            </div>
            <div className="ep-field">
              <label>City</label>
              <input name="city" value={personal.city} onChange={handlePersonalChange} placeholder="e.g. Johannesburg" />
            </div>
            <div className="ep-field">
              <label>Province</label>
              <select name="province" value={personal.province} onChange={handlePersonalChange}>
                <option value="">Select province</option>
                <option>Gauteng</option>
                <option>Western Cape</option>
                <option>KwaZulu-Natal</option>
                <option>Eastern Cape</option>
                <option>Limpopo</option>
                <option>Mpumalanga</option>
                <option>North West</option>
                <option>Free State</option>
                <option>Northern Cape</option>
              </select>
            </div>
          </div>

          <div className="ep-save-row">
            {saved.personal && <span className="ep-saved-msg">✓ Personal details saved!</span>}
            <button className="ep-save-btn" onClick={savePersonal}>Save Personal Details</button>
          </div>
        </div>

        {/* ── 2. EDUCATION ── */}
        <div className="ep-card">
          <div className="ep-card-header">
            <div className="ep-card-icon">🎓</div>
            <div>
              <h2 className="ep-card-title">Education</h2>
              <p className="ep-card-sub">Your highest qualification and academic background</p>
            </div>
          </div>

          <div className="ep-form-grid">
            <div className="ep-field">
              <label>Highest Qualification</label>
              <select name="highestQualification" value={education.highestQualification} onChange={handleEducationChange}>
                <option value="">Select qualification</option>
                <option>Grade 12 / Matric</option>
                <option>Certificate (NQF 4-5)</option>
                <option>Diploma (NQF 6)</option>
                <option>Bachelor's Degree (NQF 7)</option>
                <option>Honours Degree (NQF 8)</option>
                <option>Master's Degree (NQF 9)</option>
                <option>Doctoral Degree (NQF 10)</option>
              </select>
            </div>
            <div className="ep-field">
              <label>Institution Name</label>
              <input name="institution" value={education.institution} onChange={handleEducationChange} placeholder="e.g. University of Johannesburg" />
            </div>
            <div className="ep-field">
              <label>Year Completed</label>
              <input name="yearCompleted" value={education.yearCompleted} onChange={handleEducationChange} placeholder="e.g. 2024" />
            </div>
            <div className="ep-field">
              <label>NQF Level</label>
              <select name="nqfLevel" value={education.nqfLevel} onChange={handleEducationChange}>
                <option value="">Select NQF level</option>
                {["NQF 1","NQF 2","NQF 3","NQF 4","NQF 5","NQF 6","NQF 7","NQF 8","NQF 9","NQF 10"].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="ep-field ep-field-full">
              <label>Relevant Subjects</label>
              <input name="subjects" value={education.subjects} onChange={handleEducationChange} placeholder="e.g. ALgebra , Calculus, Design , etc..." />
            </div>
          </div>

          <div className="ep-save-row">
            {saved.education && <span className="ep-saved-msg">✓ Education saved!</span>}
            <button className="ep-save-btn" onClick={saveEducation}>Save Education</button>
          </div>
        </div>

        {/* ── 3. SKILLS ── */}
        <div className="ep-card">
          <div className="ep-card-header">
            <div className="ep-card-icon">⚡</div>
            <div>
              <h2 className="ep-card-title">Skills</h2>
              <p className="ep-card-sub">Add your skills.</p>
            </div>
          </div>

          <div className="ep-skills-input-row">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
              placeholder="Type a skill and press Enter or Add (e.g.Communication)"
            />
            <button className="ep-add-skill-btn" onClick={addSkill}>Add</button>
          </div>

          {skillsList.length > 0 && (
            <div className="ep-skills-list">
              {skillsList.map((skill) => (
                <span key={skill} className="ep-skill-tag">
                  {skill}
                  <span className="ep-skill-remove" onClick={() => removeSkill(skill)}>✕</span>
                </span>
              ))}
            </div>
          )}

          <div className="ep-save-row">
            {saved.skills && <span className="ep-saved-msg">✓ Skills saved!</span>}
            <button className="ep-save-btn" onClick={saveSkills}>Save Skills</button>
          </div>
        </div>

        {/* ── 4. CV UPLOAD ── */}
        <div className="ep-card">
          <div className="ep-card-header">
            <div className="ep-card-icon">📄</div>
            <div>
              <h2 className="ep-card-title">Upload CV</h2>
              <p className="ep-card-sub">Upload your CV so employers can review your qualifications</p>
            </div>
          </div>

          <div className="ep-cv-dropzone" onClick={() => fileInputRef.current.click()}>
            {cvFile || cvName ? (
              <>
                <span className="ep-cv-icon">✓</span>
                <p className="ep-cv-filename">{cvFile ? cvFile.name : cvName}</p>
                <p className="ep-cv-hint">Click to replace</p>
              </>
            ) : (
              <>
                <span className="ep-cv-icon">↑</span>
                <p className="ep-cv-label">Click to upload your CV</p>
                <p className="ep-cv-hint">PDF, DOC, or DOCX — max 10MB</p>
              </>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.doc,.docx"
            style={{ display: "none" }}
            onChange={handleCvChange}
          />

          <div className="ep-save-row">
            {saved.cv && <span className="ep-saved-msg">✓ CV saved!</span>}
            <button
              className="ep-save-btn"
              onClick={saveCv}
              style={{ opacity: (cvFile || cvName) ? 1 : 0.5 }}
            >
              Save CV
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default EditProfile;