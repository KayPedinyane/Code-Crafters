import { useState, useEffect } from "react";
import "./login.css";
import { auth, googleProvider } from "./firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
 
function Login() {
  const [email,             setEmail]             = useState("");
  const [password,          setPassword]          = useState("");
  const [showPassword,      setShowPassword]      = useState(false);
  const [error,             setError]             = useState("");
  const [loading,           setLoading]           = useState(true);
  const [submitting,        setSubmitting]        = useState(false);
  const [showRoleModal,     setShowRoleModal]     = useState(false);
  const [pendingGoogleData, setPendingGoogleData] = useState(null);
  const navigate = useNavigate();
 
  const postLoginFlow = async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken(true);
      localStorage.setItem("token", token);
      const API_URL = process.env.REACT_APP_API_URL;
 
      const loginRes = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: firebaseUser.email }),
      });
 
      if (!loginRes.ok) {
        const err = await loginRes.json();
        setError(err.error || "Login failed");
        setSubmitting(false);
        return;
      }
 
      const data = await loginRes.json();
 
      const userObj = {
        uid: firebaseUser.uid,
        id: data.id,
        email: firebaseUser.email,
        role: data.role,
        name: firebaseUser.email,
        company_name: "",
        contact_person: "",
      };
 
      if (data.role === "provider") {
        try {
          const providerRes = await fetch(`${API_URL}/provider-profile`);
          const providers   = await providerRes.json();
          const me = providers.find(p => p.email === firebaseUser.email);
          if (me) {
            userObj.name         = me.name || me.company_name || firebaseUser.email;
            userObj.company_name = me.name || me.company_name || "";
          }
        } catch (_) {}
      }
 
      localStorage.setItem("user", JSON.stringify(userObj));
 
      const role = data.role;
      if      (role === "admin")    navigate("/admin");
      else if (role === "user")     navigate("/applicant");
      else if (role === "provider") navigate("/provider");
      else {
        setError("Unknown user role: " + role);
        setSubmitting(false);
      }
    } catch (err) {
      console.error("postLoginFlow error:", err);
      setError(err.message || "Login flow failed");
      setSubmitting(false);
    }
  };
 
  const handleGoogleUser = async (firebaseUser) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL;
      const token   = await firebaseUser.getIdToken(true);
 
      const loginRes = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: firebaseUser.email }),
      });
 
      if (loginRes.ok) {
        await postLoginFlow(firebaseUser);
      } else if (loginRes.status === 404) {
        setPendingGoogleData({ firebaseUser, token });
        setShowRoleModal(true);
        setSubmitting(false);
      } else {
        const err = await loginRes.json();
        setError(err.error || "Login failed");
        setSubmitting(false);
      }
    } catch (err) {
      console.error("handleGoogleUser error:", err);
      setError(err.message || "Google login failed");
      setSubmitting(false);
    }
  };
 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => setLoading(false));
    return unsubscribe;
  }, []);
 
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        setError("Please verify your email before logging in.");
        setSubmitting(false);
        return;
      }
      await postLoginFlow(userCredential.user);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };
 
  const handleGoogleLogin = async () => {
    setError("");
    setSubmitting(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await handleGoogleUser(result.user);
    } catch (err) {
      if (err.code === "auth/popup-blocked") {
        setError("Popup blocked — please allow popups for this site.");
      } else if (err.code !== "auth/cancelled-popup-request") {
        setError(err.message || "Google login failed");
      }
      setSubmitting(false);
    }
  };
 
  const handleRoleSelect = async (role) => {
    setShowRoleModal(false);
    setError("");
    setSubmitting(true);
    try {
      const { firebaseUser, token } = pendingGoogleData;
      const API_URL = process.env.REACT_APP_API_URL;
 
      const createRes = await fetch(`${API_URL}/api/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
 
      if (!createRes.ok) {
        const err = await createRes.json();
        setError(err.error || "Failed to create account");
        setSubmitting(false);
        return;
      }
 
      await postLoginFlow(firebaseUser);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to complete sign up");
      setSubmitting(false);
    } finally {
      setPendingGoogleData(null);
    }
  };
 
  // Loading screen
  const isTest = process.env.NODE_ENV === "test";
  if (loading && !isTest) {
    return (
      <div className="login-loading">
        <div className="loading-logo">SkillsBridge<span>SA</span></div>
        <div className="loading-bar"><div className="loading-bar-fill" /></div>
        <p className="loading-text">Signing you in...</p>
      </div>
    );
  }
 
  return (
    <div className="login-page">
 
      {/* ══ LEFT — Brand Panel ══ */}
      <div className="login-brand">
        <div className="brand-logo">
          <span className="brand-logo-icon">◈</span>
          <span className="brand-logo-text">
            SkillsBridge<span className="brand-logo-accent">SA</span>
          </span>
        </div>
 
        <div className="brand-center">
          <p className="brand-eyebrow">SETA-Accredited Platform</p>
          <h1 className="brand-headline">
            Your <span>career</span><br />starts here
          </h1>
          <p className="brand-sub">
            South Africa's leading platform connecting youth with learnerships,
            apprenticeships and internships from top employers nationwide.
          </p>
          <div className="brand-stats">
            <div className="brand-stat">
              <span className="brand-stat-dot" />
              <span className="brand-stat-num">20</span>
              <div className="brand-stat-label">Sectors<br />covered</div>
            </div>
            <div className="brand-stat">
              <span className="brand-stat-dot" />
              <span className="brand-stat-num">NQF</span>
              <div className="brand-stat-label">Accredited<br />programmes</div>
            </div>
            <div className="brand-stat">
              <span className="brand-stat-dot" />
              <span className="brand-stat-num">Free</span>
              <div className="brand-stat-label">Always free<br />for applicants</div>
            </div>
          </div>
        </div>
 
        <p className="brand-footer">© 2026 SkillsBridgeSA · Built by Code-Crafters</p>
      </div>
 
      {/* ══ CENTER — Login Form ══ */}
      <div className="login-form-side">
        <div className="login-form-box">
 
          <div className="form-header">
            <p className="form-eyebrow">Welcome back</p>
            <h2 className="form-title">Sign in to your account</h2>
            <p className="form-subtitle">
              Don't have an account?{" "}
              <span className="form-footer-link" onClick={() => navigate("/create")}>
                Create one free →
              </span>
            </p>
          </div>
 
          <form onSubmit={handleLogin}>
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
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowPassword((p) => !p)}
                    tabIndex={-1}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>
            </div>
 
            <div className="forgot-row">
              <span className="forgot-link" onClick={() => navigate("/forgot")}>
                Forgot password?
              </span>
            </div>
 
            <button className="login-btn" type="submit" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in →"}
            </button>
          </form>
 
          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">or continue with</span>
            <div className="divider-line" />
          </div>
 
          <button className="google-btn" type="button" onClick={handleGoogleLogin} disabled={submitting}>
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" />
            Continue with Google
          </button>
 
          {error && (
            <div className="error-msg">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}
 
          <div className="form-footer">
            <p className="form-footer-text">
              By signing in you agree to our{" "}
              <span className="form-footer-link">Terms of Service</span>
              {" "}and{" "}
              <span className="form-footer-link">Privacy Policy</span>
            </p>
          </div>
 
        </div>
      </div>
 
      {/* ══ RIGHT — Floating Cards ══ */}
      <div className="login-right-panel">
        <div className="brand-card-float">
          <div className="float-card">
            <div className="float-card-label">Latest opportunity</div>
            <div className="float-card-value">ICT Learnership</div>
            <div className="float-card-sub">● Now open</div>
          </div>
          <div className="float-card">
            <div className="float-card-label">Applications</div>
            <div className="float-card-value">Tracked live</div>
            <div className="float-card-sub">● Real-time updates</div>
          </div>
          <div className="float-card">
            <div className="float-card-label">AI matching</div>
            <div className="float-card-value">✨ Personalised</div>
            <div className="float-card-sub">● Powered by SkillsBridgeSA</div>
          </div>
        </div>
      </div>
 
      {/* ══ ROLE MODAL ══ */}
      {showRoleModal && (
        <div className="role-modal-overlay">
          <div className="role-modal">
            <h3 className="role-modal-title">Welcome to SkillsBridgeSA</h3>
            <p className="role-modal-sub">
              First time here! Choose how you'll be using the platform.
            </p>
            <div className="role-options">
              <button className="role-btn" onClick={() => handleRoleSelect("user")}>
                <span className="role-btn-icon">🎓</span>
                <span className="role-btn-label">Applicant</span>
                <span className="role-btn-desc">Looking for learnerships & jobs</span>
              </button>
              <button className="role-btn" onClick={() => handleRoleSelect("provider")}>
                <span className="role-btn-icon">🏢</span>
                <span className="role-btn-label">Provider</span>
                <span className="role-btn-desc">Posting opportunities</span>
              </button>
            </div>
          </div>
        </div>
      )}
 
    </div>
  );
}
 
export default Login;