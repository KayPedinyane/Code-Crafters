import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import "./EditProfile.css";

const API = "https://code-crafters-t8dp.onrender.com";

const Field = ({ label, name, required, errors, children }) => (
  <div className="ep-field">
    <label>
      {label} {required && <span className="ep-required">*</span>}
    </label>
    {children}
    {errors?.[name] && <span className="ep-error-msg">{errors[name]}</span>}
  </div>
);

function EditProfile() {
  const navigate = useNavigate();

  const [currentUser,  setCurrentUser]  = useState(null);
  const [currentEmail, setCurrentEmail] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) { setCurrentUser(user); setCurrentEmail(user.email); }
      else navigate("/");
    });
    return () => unsubscribe();
  }, []);

  const [personal, setPersonal] = useState({
    fullName: "", email: "", phone: "", idNumber: "",
    dateOfBirth: "", gender: "", race: "", disability: "",
    city: "", province: "",
  });

  const [education, setEducation] = useState({
    highestQualification: "", institution: "",
    yearCompleted: "", nqfLevel: "", subjects: "",
  });

  const [skillsList, setSkillsList] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [cvFile,     setCvFile]     = useState(null);
  const [cvName,     setCvName]     = useState(null);
  const [errors,     setErrors]     = useState({});
  const [saved, setSaved] = useState({
    personal: false, education: false, skills: false, cv: false
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!currentEmail) return;

    const localKey = `profile_${currentEmail}`;

    fetch(`${API}/profile/${encodeURIComponent(currentEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error && data.full_name) {
          // Database has data — use it
          const p = {
            fullName:    data.full_name     || "",
            email:       data.email         || currentEmail,
            phone:       data.phone         || "",
            idNumber:    data.id_number     || "",
            dateOfBirth: data.date_of_birth || "",
            gender:      data.gender        || "",
            race:        data.race          || "",
            disability:  data.disability    || "",
            city:        data.city          || "",
            province:    data.province      || "",
          };
          const e = {
            highestQualification: data.qualification  || "",
            institution:          data.institution    || "",
            yearCompleted:        data.year_completed || "",
            nqfLevel:             data.nqf_level      || "",
            subjects:             data.subjects       || "",
          };
          setPersonal(p);
          setEducation(e);
          setSkillsList(data.skills ? data.skills.split(",").map(s => s.trim()).filter(Boolean) : []);
          setCvName(data.cv_url || null);
          // Also save to localStorage as backup
          localStorage.setItem(localKey, JSON.stringify({ personal: p, education: e, skills: data.skills, cvName: data.cv_url }));
        } else {
          // No DB data — try localStorage
          const local = JSON.parse(localStorage.getItem(localKey));
          if (local) {
            if (local.personal)  setPersonal(local.personal);
            if (local.education) setEducation(local.education);
            if (local.skills)    setSkillsList(local.skills.split(",").map(s => s.trim()).filter(Boolean));
            if (local.cvName)    setCvName(local.cvName);
          } else {
            setPersonal((prev) => ({ ...prev, email: currentEmail }));
          }
        }
      })
      .catch(() => {
        // Network error — use localStorage
        const local = JSON.parse(localStorage.getItem(localKey));
        if (local) {
          if (local.personal)  setPersonal(local.personal);
          if (local.education) setEducation(local.education);
          if (local.skills)    setSkillsList(local.skills.split(",").map(s => s.trim()).filter(Boolean));
          if (local.cvName)    setCvName(local.cvName);
        } else {
          setPersonal((prev) => ({ ...prev, email: currentEmail }));
        }
      });
  }, [currentEmail]);

  const showSaved = (section) => {
    setSaved((prev) => ({ ...prev, [section]: true }));
    setTimeout(() => setSaved((prev) => ({ ...prev, [section]: false })), 3000);
  };

  // ── Save to localStorage helper ──
  const saveLocal = (updatedPersonal, updatedEducation, updatedSkills, updatedCvName) => {
    const localKey = `profile_${currentEmail}`;
    localStorage.setItem(localKey, JSON.stringify({
      personal:  updatedPersonal  || personal,
      education: updatedEducation || education,
      skills:    updatedSkills    !== undefined ? updatedSkills : skillsList.join(", "),
      cvName:    updatedCvName    !== undefined ? updatedCvName : cvName,
    }));
  };

  const handlePersonalChange  = (e) => setPersonal({ ...personal, [e.target.name]: e.target.value });
  const handleEducationChange = (e) => setEducation({ ...education, [e.target.name]: e.target.value });

  // ── Validation ──
  const validatePersonal = () => {
    const required = { fullName: "Full Name", phone: "Phone Number", idNumber: "ID Number", gender: "Gender", city: "City", province: "Province" };
    const newErrors = {};
    Object.keys(required).forEach((field) => {
      if (!personal[field] || personal[field].trim() === "") {
        newErrors[field] = `${required[field]} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEducation = () => {
    const required = { highestQualification: "Qualification", institution: "Institution", nqfLevel: "NQF Level" };
    const newErrors = {};
    Object.keys(required).forEach((field) => {
      if (!education[field] || education[field].trim() === "") {
        newErrors[field] = `${required[field]} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Save personal ──
  // ── Save everything at once ──
  const savePersonal = () => {
    if (!validatePersonal()) return;
    if (!validateEducation()) return;

    const payload = {
      email:          currentEmail,
      full_name:      personal.fullName,
      phone:          personal.phone,
      id_number:      personal.idNumber,
      date_of_birth:  personal.dateOfBirth,
      gender:         personal.gender,
      race:           personal.race,
      disability:     personal.disability,
      city:           personal.city,
      province:       personal.province,
      qualification:  education.highestQualification,
      institution:    education.institution,
      year_completed: education.yearCompleted,
      nqf_level:      education.nqfLevel,
      subjects:       education.subjects,
      skills:         skillsList.join(", "),
      cv_url:         cvFile ? cvFile.name : cvName,
    };

    console.log("Saving payload:", payload);

    fetch(`${API}/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Save all response:", data);
        // Save to localStorage too
        saveLocal(personal, education, skillsList.join(", "), cvFile ? cvFile.name : cvName);
        showSaved("personal");
        showSaved("education");
        showSaved("skills");
        if (cvFile || cvName) showSaved("cv");
      })
      .catch((err) => console.log("Save error:", err));
  };

  // ── Save education ──
  const saveEducation = () => {
    if (!validateEducation()) return;
    saveLocal(null, education, undefined, undefined);

    fetch(`${API}/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email:          currentEmail,
        qualification:  education.highestQualification,
        institution:    education.institution,
        year_completed: education.yearCompleted,
        nqf_level:      education.nqfLevel,
        subjects:       education.subjects,
      }),
    })
      .then((res) => res.json())
      .then((data) => { console.log("Education saved:", data); showSaved("education"); })
      .catch((err) => { console.log("Education save error:", err); showSaved("education"); });
  };

  // ── Save skills ──
  const saveSkills = () => {
    const skillsStr = skillsList.join(", ");
    saveLocal(null, null, skillsStr, undefined);

    fetch(`${API}/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: currentEmail, skills: skillsStr }),
    })
      .then((res) => res.json())
      .then((data) => { console.log("Skills saved:", data); showSaved("skills"); })
      .catch((err) => { console.log("Skills save error:", err); showSaved("skills"); });
  };

  // ── Save CV ──
  const saveCv = () => {
    const name = cvFile ? cvFile.name : cvName;
    if (!name) return;
    if (cvFile) setCvName(cvFile.name);
    saveLocal(null, null, undefined, name);

    fetch(`${API}/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: currentEmail, cv_url: name }),
    })
      .then((res) => res.json())
      .then((data) => { console.log("CV saved:", data); showSaved("cv"); })
      .catch((err) => { console.log("CV save error:", err); showSaved("cv"); });
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skillsList.includes(trimmed)) {
      setSkillsList([...skillsList, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill  = (skill) => setSkillsList(skillsList.filter((s) => s !== skill));
  const handleCvChange = (e) => { if (e.target.files[0]) setCvFile(e.target.files[0]); };

  if (!currentEmail) {
    return (
      <div className="ep-wrapper">
        <div style={{ textAlign: "center", padding: "120px 24px" }}>
          <p style={{ fontSize: 16, color: "#718096" }}>Loading your profile...</p>
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

      {/* ── PAGE TITLE ── */}
      <div className="ep-page-title">
        <div className="ep-page-title-inner">
          <h1>Edit Profile</h1>
          <p>Signed in as <strong style={{ color: "#00c853" }}>{currentEmail}</strong></p>
        </div>
      </div>

      <div className="ep-content">

        {/* ── 1. PERSONAL DETAILS ── */}
        <div className="ep-card">
          <div className="ep-card-header">
            <div className="ep-card-icon">👤</div>
            <div>
              <h2 className="ep-card-title">Personal Details</h2>
              <p className="ep-card-sub">Fields marked <span className="ep-required">*</span> are required to apply</p>
            </div>
          </div>

          <div className="ep-form-grid">
            <Field label="Full Name" name="fullName" required errors={errors}>
              <input
                name="fullName" value={personal.fullName}
                onChange={handlePersonalChange}
                placeholder="e.g. John Mkhize"
                className={errors.fullName ? "ep-input-error" : ""}
              />
            </Field>

            <Field label="Email Address" name="email">
              <input
                name="email" type="email" value={personal.email}
                onChange={handlePersonalChange}
                placeholder="e.g. John@email.com"
              />
            </Field>

            <Field label="Phone Number" name="phone" required errors={errors}>
              <input
                name="phone" value={personal.phone}
                onChange={handlePersonalChange}
                placeholder="e.g. 012 345 6789"
                className={errors.phone ? "ep-input-error" : ""}
              />
            </Field>

            <Field label="ID Number" name="idNumber" required errors={errors}>
              <input
                name="idNumber" value={personal.idNumber}
                onChange={handlePersonalChange}
                placeholder="13-digit SA ID number"
                className={errors.idNumber ? "ep-input-error" : ""}
              />
            </Field>

            <Field label="Date of Birth" name="dateOfBirth">
              <input
                name="dateOfBirth" type="date"
                value={personal.dateOfBirth}
                onChange={handlePersonalChange}
              />
            </Field>

            <Field label="Gender" name="gender" required errors={errors}>
              <select
                name="gender" value={personal.gender}
                onChange={handlePersonalChange}
                className={errors.gender ? "ep-input-error" : ""}
              >
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Prefer not to say</option>
              </select>
            </Field>

            <Field label="Race" name="race">
              <select name="race" value={personal.race} onChange={handlePersonalChange}>
                <option value="">Select race</option>
                <option>African</option>
                <option>Coloured</option>
                <option>Indian/Asian</option>
                <option>White</option>
                <option>Prefer not to say</option>
              </select>
            </Field>

            <Field label="Disability Status" name="disability">
              <select name="disability" value={personal.disability} onChange={handlePersonalChange}>
                <option value="">Select option</option>
                <option>No disability</option>
                <option>Yes, I have a disability</option>
              </select>
            </Field>

            <Field label="City" name="city" required errors={errors}>
              <input
                name="city" value={personal.city}
                onChange={handlePersonalChange}
                placeholder="e.g. Johannesburg"
                className={errors.city ? "ep-input-error" : ""}
              />
            </Field>

            <Field label="Province" name="province" required errors={errors}>
              <select
                name="province" value={personal.province}
                onChange={handlePersonalChange}
                className={errors.province ? "ep-input-error" : ""}
              >
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
            </Field>
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
              <p className="ep-card-sub">Fields marked <span className="ep-required">*</span> are required to apply</p>
            </div>
          </div>

          <div className="ep-form-grid">
            <Field label="Highest Qualification" name="highestQualification" required errors={errors}>
              <select
                name="highestQualification"
                value={education.highestQualification}
                onChange={handleEducationChange}
                className={errors.highestQualification ? "ep-input-error" : ""}
              >
                <option value="">Select qualification</option>
                <option>Grade 12 / Matric</option>
                <option>Certificate</option>
                <option>Diploma</option>
                <option>Bachelor's Degree</option>
                <option>Honours Degree</option>
                <option>Master's Degree</option>
                <option>Doctoral Degree</option>
              </select>
            </Field>

            <Field label="Institution Name" name="institution" required errors={errors}>
              <input
                name="institution" value={education.institution}
                onChange={handleEducationChange}
                placeholder="e.g. Name of the University"
                className={errors.institution ? "ep-input-error" : ""}
              />
            </Field>

            <Field label="Year Completed" name="yearCompleted">
              <input
                name="yearCompleted" value={education.yearCompleted}
                onChange={handleEducationChange}
                placeholder="e.g. 2024"
              />
            </Field>

            <Field label="NQF Level" name="nqfLevel" required errors={errors}>
              <select
                name="nqfLevel" value={education.nqfLevel}
                onChange={handleEducationChange}
                className={errors.nqfLevel ? "ep-input-error" : ""}
              >
                <option value="">Select NQF level</option>
                {["NQF 1","NQF 2","NQF 3","NQF 4","NQF 5",
                  "NQF 6","NQF 7","NQF 8","NQF 9","NQF 10"].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </Field>

            <div className="ep-field ep-field-full">
              <label>Relevant Subjects</label>
              <input
                name="subjects" value={education.subjects}
                onChange={handleEducationChange}
                placeholder="e.g. Mathematics, Physics, Economics, etc..."
              />
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
              <p className="ep-card-sub">Add skills relevant to the opportunities you are applying for</p>
            </div>
          </div>

          <div className="ep-skills-input-row">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
              placeholder="Type a skill and press Enter or Add"
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
              <p className="ep-card-sub">Upload your CV so employers can review it.</p>
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
        {/* ── SAVE ALL BUTTON ── */}
        <div className="ep-save-all-card">
          <div>
            <h3 className="ep-save-all-title">Save all changes</h3>
            <p className="ep-save-all-sub">This will save your personal details, education, skills and CV in one go</p>
          </div>
          <button className="ep-save-all-btn" onClick={savePersonal}>
            Save Everything
          </button>
        </div>

      </div>
    </div>
  );
}

export default EditProfile;