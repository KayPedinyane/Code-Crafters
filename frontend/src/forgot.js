import { useState } from "react";
import { auth } from "./firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./forgot.css";

function Forgot() {
  const [email,       setEmail]       = useState("");
  const [error,       setError]       = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [sent,        setSent]        = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="forgot-page">

      {/* ══ LEFT — Brand Panel ══ */}
      <div className="forgot-brand">
        <div className="brand-logo">
          <span className="brand-logo-icon">◈</span>
          <span className="brand-logo-text">
            SkillsBridge<span className="brand-logo-accent">SA</span>
          </span>
        </div>

        <div className="brand-center">
          <p className="brand-eyebrow">Account Recovery</p>
          <h1 className="brand-headline">
            Reset your <span>password</span><br />securely
          </h1>
          <p className="brand-sub">
            Enter your registered email address and we'll send you
            a secure link to reset your password instantly.
          </p>

          <div className="brand-steps">
            <div className="brand-step">
              <div className="brand-step-num">1</div>
              <div className="brand-step-text">
                <span className="brand-step-title">Enter your email</span>
                <span className="brand-step-sub">The one you used to sign up</span>
              </div>
            </div>
            <div className="brand-step">
              <div className="brand-step-num">2</div>
              <div className="brand-step-text">
                <span className="brand-step-title">Check your inbox</span>
                <span className="brand-step-sub">Reset link sent within seconds</span>
              </div>
            </div>
            <div className="brand-step">
              <div className="brand-step-num">3</div>
              <div className="brand-step-text">
                <span className="brand-step-title">Set new password</span>
                <span className="brand-step-sub">Securely regain access</span>
              </div>
            </div>
          </div>
        </div>

        <p className="brand-footer">© 2026 SkillsBridgeSA · Built by Code-Crafters</p>
      </div>

      {/* ══ CENTER — Form ══ */}
      <div className="forgot-form-side">
        <div className="forgot-form-box">

          {!sent ? (
            <>
              <div className="form-header">
                <div className="forgot-icon-wrap">
                  <span className="forgot-icon">🔑</span>
                </div>
                <p className="form-eyebrow">Password recovery</p>
                <h2 className="form-title">Forgot your password?</h2>
                <p className="form-subtitle">
                  No worries , enter your email and we'll send a reset link right away.
                </p>
              </div>

              <form onSubmit={handleReset}>
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

                <button className="forgot-btn" type="submit" disabled={submitting}>
                  {submitting ? "Sending..." : "Send reset link →"}
                </button>
              </form>

              {error && (
                <div className="error-msg">
                  <span>⚠</span>
                  <span>{error}</span>
                </div>
              )}
            </>
          ) : (
            /* ── Success state ── */
            <div className="forgot-success">
              <div className="success-icon-wrap">
                <span className="success-icon">✉</span>
                <div className="success-ring" />
              </div>
              <p className="form-eyebrow">Email sent</p>
              <h2 className="form-title">Check your inbox</h2>
              <p className="form-subtitle" style={{ marginBottom: 24 }}>
                We sent a password reset link to<br />
                <strong style={{ color: "#00c853" }}>{email}</strong>
              </p>
              <div className="success-note">
                <span>💡</span>
                <span>Didn't get it? Check your spam folder or try again in a minute.</span>
              </div>
              <button
                className="forgot-btn"
                style={{ marginTop: 24 }}
                onClick={() => { setSent(false); setEmail(""); }}
              >
                Try a different email
              </button>
            </div>
          )}

          <div className="form-footer">
            <p className="form-footer-text">
              Remember your password?{" "}
              <span className="form-footer-link" onClick={() => navigate("/login")}>
                Back to sign in →
              </span>
            </p>
          </div>

        </div>
      </div>

      {/* ══ RIGHT — decorative panel ══ */}
      <div className="forgot-right-panel">
        <div className="forgot-deco">
          <div className="deco-card">
            <div className="deco-card-icon">🔒</div>
            <div className="deco-card-title">Secure reset</div>
            <div className="deco-card-sub">Links expire in 1 hour</div>
          </div>
          <div className="deco-card">
            <div className="deco-card-icon">⚡</div>
            <div className="deco-card-title">Instant delivery</div>
            <div className="deco-card-sub">Email arrives in seconds</div>
          </div>
          <div className="deco-card">
            <div className="deco-card-icon">🛡️</div>
            <div className="deco-card-title">Your data is safe</div>
            <div className="deco-card-sub">Powered by Firebase Auth</div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Forgot;