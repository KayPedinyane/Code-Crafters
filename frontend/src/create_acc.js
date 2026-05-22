import { useState } from "react";
import "./create_acc.css";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

const requirements = [
  { id: "length",    label: "At least 8 characters",       test: (p) => p.length >= 8 },
  { id: "uppercase", label: "One uppercase letter (A–Z)",  test: (p) => /[A-Z]/.test(p) },
  { id: "number",    label: "One number (0–9)",            test: (p) => /[0-9]/.test(p) },
  { id: "symbol",    label: "One symbol (!@#$%^&*)",       test: (p) => /[!@#$%^&*]/.test(p) },
];

function Create() {
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role,            setRole]            = useState("user");
  const [error,           setError]           = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const navigate = useNavigate();

  const isStrongPassword = (p) =>
    /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/.test(p);

  const allMet = requirements.every(({ test }) => test(password));

  const create = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitAttempted(true);

    if (!isStrongPassword(password)) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    let firebaseUser = null;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUser = userCredential.user;
      const token = await firebaseUser.getIdToken(true);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const errData = await response.json();
        await firebaseUser.delete();
        throw new Error(errData.error || "Failed to save user to database.");
      }

      await sendEmailVerification(firebaseUser);
      alert("Account created! Please verify your email before logging in.");
      navigate("/");
    } catch (err) {
      if (firebaseUser && err.code !== "auth/email-already-in-use") {
        try { await firebaseUser.delete(); } catch (_) {}
      }
      setError(err.message);
    }
  };

  return (
    <div className="create-page">

      {/* ══ LEFT — Brand Panel ══ */}
      <div className="create-brand">
        <div className="brand-logo">
          <span className="brand-logo-icon">◈</span>
          <span className="brand-logo-text">
            SkillsBridge<span className="brand-logo-accent">SA</span>
          </span>
        </div>

        <div className="brand-center">
          <p className="brand-eyebrow">Join the platform</p>
          <h1 className="brand-headline">
            Start your <span>journey</span><br />today
          </h1>
          <p className="brand-sub">
            Create your free account and connect with SETA-accredited
            learnerships, apprenticeships and internships from top
            employers across South Africa.
          </p>
          <div className="brand-stats">
            <div className="brand-stat">
              <span className="brand-stat-dot" />
              <span className="brand-stat-num">Free</span>
              <div className="brand-stat-label">Always free<br />for applicants</div>
            </div>
            <div className="brand-stat">
              <span className="brand-stat-dot" />
              <span className="brand-stat-num">NQF</span>
              <div className="brand-stat-label">Accredited<br />programmes</div>
            </div>
          </div>
        </div>

        <p className="brand-footer">© 2026 SkillsBridgeSA · Built by Code-Crafters</p>
      </div>

      
      <div className="create-form-side">
        <div className="create-form-box">

          <div className="form-header">
            <p className="form-eyebrow">Get started</p>
            <h2 className="form-title">Create your account</h2>
           
          </div>

          <form onSubmit={create}>
            <div className="input-group">

             
              <div className="input-field">
                <label className="input-label">Email address</label>
                <div className="input-wrap">
                  <span className="input-icon">✉</span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              
              <div className="input-field">
                <label className="input-label">Password</label>
                <div className="pw-field-wrapper">
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    className={submitAttempted && !allMet ? "input-error" : ""}
                    required
                  />
                  {(passwordFocused || (submitAttempted && !allMet)) && (
                    <div className="pw-requirements">
                      {requirements.map(({ id, label, test }) => {
                        const met = test(password);
                        return (
                          <p
                            key={id}
                            style={{
                              margin: "4px 0",
                              fontSize: "13px",
                              color: met ? "#4ade80" : "#f87171",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            {met ? "✓" : "✗"} {label}
                          </p>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="input-field">
                <label className="input-label">Confirm password</label>
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={error === "Passwords do not match." ? "input-error" : ""}
                  required
                />
              </div>

              
              <div className="input-field">
                <label className="input-label">I am a</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} required>
                  <option value="user">Applicant</option>
                  <option value="provider">Provider</option>
                </select>
              </div>

              <button type="submit">Register</button>

              {error && <p className="form-error">{error}</p>}

              <p style={{ color: "white", marginTop: "10px" }}>
                Already have an account?{" "}
                <span
                  className="login-link"
                  onClick={() => navigate("/login")}
                  style={{ color: "#4ade80", cursor: "pointer" }}
                >
                  Login
                </span>
              </p>

            </div>
          </form>

        </div>
      </div>

    </div>
  );
}

export default Create;