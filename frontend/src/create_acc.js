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

const isStrongPassword = (p) =>
  /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/.test(p);


function Create() {
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role,            setRole]            = useState("user");
  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [error,           setError]           = useState("");
  const [submitting,      setSubmitting]      = useState(false);
  const [passwordFocused,  setPasswordFocused]  = useState(false);
  const [submitAttempted,  setSubmitAttempted]  = useState(false);
  const navigate = useNavigate();

  const allMet = requirements.every(({ test }) => test(password));


  const create = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitAttempted(true);

    if (!isStrongPassword(password)) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    let firebaseUser = null;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUser = userCredential.user;

      const token = await firebaseUser.getIdToken(true);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role })
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
    } finally {
      setSubmitting(false);
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

      {/* ══ CENTER — Create Account Form ══ */}
      <div className="create-form-side">
        <div className="create-form-box">

          <div className="form-header">
            <p className="form-eyebrow">Get started</p>
            <h2 className="form-title">Create your account</h2>
            <p className="form-subtitle">
              Already have an account?{" "}
              <span className="form-footer-link" onClick={() => navigate("/login")}>
                Sign in →
              </span>
            </p>
          </div>

          <form onSubmit={create}>
            <div className="input-group">

              {/* Email */}
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

              {/* Password */}
              <div className="input-field">
                <label className="input-label">Password</label>
                <div className="pw-field-wrapper">
                  <div className="input-wrap">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="pw-toggle"
                      onClick={() => setShowPassword(p => !p)}
                      tabIndex={-1}
                    >
                      {showPassword ? "🙈" : "👁"}
                    </button>
                  </div>

                  {/* ── Requirements checklist ── */}
                  {(passwordFocused || (submitAttempted && !allMet)) && (
                    <div className="pw-requirements">
                      {requirements.map(({ id, label, test }) => {
                        const met = test(password);
                        return (
                          <p key={id} className={`pw-req-item ${met ? "pw-req-met" : "pw-req-unmet"}`}>
                            {met ? "✓" : "✗"} {label}
                          </p>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="input-field">
                <label className="input-label">Confirm password</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowConfirm(p => !p)}
                    tabIndex={-1}
                  >
                    {showConfirm ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div className="input-field">
                <label className="input-label">I am joining as a</label>
                <div className="role-toggle">
                  <button
                    type="button"
                    className={`role-toggle-btn ${role === "user" ? "role-toggle-active" : ""}`}
                    onClick={() => setRole("user")}
                  >
                    🎓 Applicant
                  </button>
                  <button
                    type="button"
                    className={`role-toggle-btn ${role === "provider" ? "role-toggle-active" : ""}`}
                    onClick={() => setRole("provider")}
                  >
                    🏢 Provider
                  </button>
                </div>
              </div>

            </div>

            <button className="create-btn" type="submit" disabled={submitting}>
              {submitting ? "Creating account..." : "Create account →"}
            </button>
          </form>

          {error && (
            <div className="error-msg">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <div className="form-footer">
            <p className="form-footer-text">
              By creating an account you agree to our{" "}
              <span className="form-footer-link">Terms of Service</span>
              {" "}and{" "}
              <span className="form-footer-link">Privacy Policy</span>
            </p>
          </div>

        </div>
      </div>

      {/* ══ RIGHT — Floating Cards ══ */}
      <div className="create-right-panel">
        <div className="brand-card-float">
          <div className="float-card">
            <div className="float-card-label">Step 1</div>
            <div className="float-card-value">Create account</div>
            <div className="float-card-sub">● Takes 30 seconds</div>
          </div>
          <div className="float-card">
            <div className="float-card-label">Step 2</div>
            <div className="float-card-value">Complete profile</div>
            <div className="float-card-sub">● Unlock all features</div>
          </div>
          <div className="float-card">
            <div className="float-card-label">Step 3</div>
            <div className="float-card-value">Apply & get placed</div>
            <div className="float-card-sub">● Track in real-time</div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Create;