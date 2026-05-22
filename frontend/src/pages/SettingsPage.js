import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  auth,
} from "../firebase";
import {
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from "firebase/auth";
import "./SettingsPage.css";

const API = "https://code-crafters-t8dp.onrender.com";

const DEFAULT_PREFS = {
  emailStatusChange: true,
  emailMatching:     true,
  emailClosing:      true,
  inAppAll:          true,
};

const DEFAULT_APPEARANCE = {
  theme:    "light",   // light | dark | system
  fontSize: "medium",  // small | medium | large
  compact:  false,
};

// ── Apply theme to document ──
function applyTheme(theme) {
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [currentUser,    setCurrentUser]    = useState(null);
  const [activeSection,  setActiveSection]  = useState("account");
  const [saveMsg,        setSaveMsg]        = useState(null);

  // ── Password ──
  const [currentPass,  setCurrentPass]  = useState("");
  const [newPass,      setNewPass]      = useState("");
  const [confirmPass,  setConfirmPass]  = useState("");
  const [showPasses,   setShowPasses]   = useState({ current: false, new: false, confirm: false });
  const [passMsg,      setPassMsg]      = useState(null);
  const [passLoading,  setPassLoading]  = useState(false);

  // ── Notifications ──
  const [notifPrefs,   setNotifPrefs]   = useState(DEFAULT_PREFS);

  // ── Appearance ──
  const [appearance,   setAppearance]   = useState(DEFAULT_APPEARANCE);

  // ── Delete account ──
  const [deletePass,   setDeletePass]   = useState("");
  const [deleteMsg,    setDeleteMsg]    = useState(null);
  const [deleteLoading,setDeleteLoading]= useState(false);
  const [confirmDelete,setConfirmDelete]= useState(false);

  // ── Load prefs on mount ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        const saved = JSON.parse(localStorage.getItem(`notif_prefs_${user.email}`) || "null");
        if (saved) setNotifPrefs({ ...DEFAULT_PREFS, ...saved });
        const ap = JSON.parse(localStorage.getItem(`appearance_${user.email}`) || "null");
        if (ap) {
          setAppearance({ ...DEFAULT_APPEARANCE, ...ap });
          applyTheme(ap.theme || "light");
          if (ap.fontSize) document.documentElement.setAttribute("data-fontsize", ap.fontSize);
          if (ap.compact) document.documentElement.setAttribute("data-compact", "true");
        }
      } else {
        navigate("/");
      }
    });
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Listen for system dark mode changes ──
  useEffect(() => {
    if (appearance.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [appearance.theme]);

  const saveNotifPrefs = (updated) => {
    setNotifPrefs(updated);
    localStorage.setItem(`notif_prefs_${currentUser.email}`, JSON.stringify(updated));
    showSaveMsg("Notification preferences saved!");
  };

  const saveAppearance = (updated) => {
    setAppearance(updated);
    localStorage.setItem(`appearance_${currentUser.email}`, JSON.stringify(updated));
    applyTheme(updated.theme);
    document.documentElement.setAttribute("data-fontsize", updated.fontSize);
    document.documentElement.setAttribute("data-compact", updated.compact ? "true" : "false");
    showSaveMsg("Appearance settings saved!");
  };

  const showSaveMsg = (text) => {
    setSaveMsg(text);
    setTimeout(() => setSaveMsg(null), 3000);
  };

  // ── Change password ──
  const handlePasswordChange = async () => {
    setPassMsg(null);
    if (!currentPass) { setPassMsg({ type: "error", text: "Enter your current password." }); return; }
    if (!newPass)     { setPassMsg({ type: "error", text: "Enter a new password." }); return; }
    if (newPass.length < 8) { setPassMsg({ type: "error", text: "New password must be at least 8 characters." }); return; }
    if (!/[A-Z]/.test(newPass)) { setPassMsg({ type: "error", text: "Include at least one uppercase letter." }); return; }
    if (!/[0-9]/.test(newPass)) { setPassMsg({ type: "error", text: "Include at least one number." }); return; }
    if (newPass !== confirmPass) { setPassMsg({ type: "error", text: "Passwords do not match." }); return; }
    if (newPass === currentPass) { setPassMsg({ type: "error", text: "New password must differ from current." }); return; }

    setPassLoading(true);
    try {
      const cred = EmailAuthProvider.credential(currentUser.email, currentPass);
      await reauthenticateWithCredential(currentUser, cred);
      await updatePassword(currentUser, newPass);
      setPassMsg({ type: "success", text: "Password updated successfully! ✓" });
      setCurrentPass(""); setNewPass(""); setConfirmPass("");
    } catch (err) {
      const msg =
        err.code === "auth/wrong-password"     ? "Current password is incorrect." :
        err.code === "auth/too-many-requests"  ? "Too many attempts. Try again later." :
        err.code === "auth/weak-password"      ? "Password is too weak." :
        "Failed to update password. Please try again.";
      setPassMsg({ type: "error", text: msg });
    }
    setPassLoading(false);
  };

  // ── Delete account ──
  const handleDeleteAccount = async () => {
    if (!deletePass) { setDeleteMsg({ type: "error", text: "Enter your password to confirm deletion." }); return; }
    setDeleteLoading(true);
    try {
      const cred = EmailAuthProvider.credential(currentUser.email, deletePass);
      await reauthenticateWithCredential(currentUser, cred);
      // Delete profile from DB
      await fetch(`${API}/profile/${encodeURIComponent(currentUser.email)}`, { method: "DELETE" }).catch(() => {});
      await deleteUser(currentUser);
      localStorage.clear();
      navigate("/");
    } catch (err) {
      const msg =
        err.code === "auth/wrong-password" ? "Password is incorrect." :
        "Failed to delete account. Please try again.";
      setDeleteMsg({ type: "error", text: msg });
    }
    setDeleteLoading(false);
  };

  // ── Password strength ──
  const getStrength = (p) => {
    if (!p) return null;
    let score = 0;
    if (p.length >= 8)         score++;
    if (p.length >= 12)        score++;
    if (/[A-Z]/.test(p))       score++;
    if (/[0-9]/.test(p))       score++;
    if (/[^A-Za-z0-9]/.test(p))score++;
    if (score <= 1) return { label: "Weak",   color: "#e53e3e", width: "25%" };
    if (score <= 2) return { label: "Fair",   color: "#e65100", width: "50%" };
    if (score <= 3) return { label: "Good",   color: "#2196f3", width: "75%" };
    return                   { label: "Strong", color: "#00c853", width: "100%" };
  };

  const strength = getStrength(newPass);

  const sections = [
    { id: "account",       icon: "⚙️",  label: "Account" },
    { id: "notifications", icon: "🔔",  label: "Notifications" },
    { id: "appearance",    icon: "🎨",  label: "Appearance" },
    { id: "privacy",       icon: "🔒",  label: "Privacy & Data" },
    { id: "danger",        icon: "⚠️",  label: "Delete Account" },
  ];

  return (
    <div className="settings-wrapper">

      {/* ── HEADER ── */}
      <header className="settings-header">
        <div className="settings-header-inner">
          <div className="logo" onClick={() => navigate("/applicant")} style={{ cursor: "pointer" }}>
            <span className="logo-icon">◈</span>
            <span className="logo-text">SkillsBridge<span className="logo-accent">SA</span></span>
          </div>
          {saveMsg && (
            <div className="settings-save-toast">{saveMsg}</div>
          )}
          <button className="settings-back-btn" onClick={() => navigate("/applicant")}>← Back</button>
        </div>
      </header>

      <div className="settings-layout">

        {/* ── SIDEBAR ── */}
        <aside className="settings-sidebar">
          <div className="settings-user-card">
            <div className="settings-user-avatar">
              {(currentUser?.email || "?")[0].toUpperCase()}
            </div>
            <p className="settings-user-email">{currentUser?.email}</p>
            <p className="settings-user-label">Applicant</p>
          </div>

          <nav className="settings-nav">
            {sections.map(sec => (
              <button
                key={sec.id}
                className={`settings-nav-btn ${activeSection === sec.id ? "settings-nav-active" : ""}`}
                onClick={() => setActiveSection(sec.id)}
              >
                <span className="settings-nav-icon">{sec.icon}</span>
                <span>{sec.label}</span>
                {sec.id === "danger" && <span className="settings-nav-danger-dot" />}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── MAIN ── */}
        <main className="settings-main">

          {/* ══ ACCOUNT ══ */}
          {activeSection === "account" && (
            <div className="settings-section">
              <h2 className="settings-section-title">Account Settings</h2>

              <div className="settings-card">
                <h3 className="settings-card-title">Email Address</h3>
                <p className="settings-card-sub">Your login email is linked to Firebase and cannot be changed here. Contact support to update it.</p>
                <div className="settings-email-display">
                  <span>✉️</span>
                  <span>{currentUser?.email}</span>
                  <span className="settings-verified-badge">✓ Verified</span>
                </div>
              </div>

              <div className="settings-card">
                <h3 className="settings-card-title">Change Password</h3>
                <p className="settings-card-sub">Use a strong password — at least 8 characters with uppercase letters and numbers.</p>

                <div className="settings-form">
                  {/* Current password */}
                  <div className="settings-input-wrap">
                    <input
                      type={showPasses.current ? "text" : "password"}
                      placeholder="Current password"
                      value={currentPass}
                      onChange={e => setCurrentPass(e.target.value)}
                      className="settings-input"
                    />
                    <button className="settings-eye-btn" onClick={() => setShowPasses(p => ({ ...p, current: !p.current }))}>
                      {showPasses.current ? "🙈" : "👁"}
                    </button>
                  </div>

                  {/* New password */}
                  <div className="settings-input-wrap">
                    <input
                      type={showPasses.new ? "text" : "password"}
                      placeholder="New password"
                      value={newPass}
                      onChange={e => setNewPass(e.target.value)}
                      className="settings-input"
                    />
                    <button className="settings-eye-btn" onClick={() => setShowPasses(p => ({ ...p, new: !p.new }))}>
                      {showPasses.new ? "🙈" : "👁"}
                    </button>
                  </div>

                  {/* Strength indicator */}
                  {strength && (
                    <div className="settings-strength-bar">
                      <div className="settings-strength-track">
                        <div className="settings-strength-fill" style={{ width: strength.width, background: strength.color }} />
                      </div>
                      <span className="settings-strength-label" style={{ color: strength.color }}>{strength.label}</span>
                    </div>
                  )}

                  {/* Confirm password */}
                  <div className="settings-input-wrap">
                    <input
                      type={showPasses.confirm ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPass}
                      onChange={e => setConfirmPass(e.target.value)}
                      className={`settings-input ${confirmPass && confirmPass !== newPass ? "settings-input-error" : ""}`}
                    />
                    <button className="settings-eye-btn" onClick={() => setShowPasses(p => ({ ...p, confirm: !p.confirm }))}>
                      {showPasses.confirm ? "🙈" : "👁"}
                    </button>
                  </div>
                  {confirmPass && confirmPass !== newPass && (
                    <p className="settings-field-error">Passwords do not match</p>
                  )}

                  <div className="settings-password-rules">
                    {[
                      { rule: "At least 8 characters",       met: newPass.length >= 8 },
                      { rule: "One uppercase letter",         met: /[A-Z]/.test(newPass) },
                      { rule: "One number",                   met: /[0-9]/.test(newPass) },
                    ].map(({ rule, met }) => (
                      <div key={rule} className={`settings-rule ${met ? "settings-rule-met" : ""}`}>
                        <span>{met ? "✓" : "○"}</span>
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>

                  {passMsg && (
                    <div className={`settings-msg ${passMsg.type === "success" ? "settings-msg-success" : "settings-msg-error"}`}>
                      {passMsg.text}
                    </div>
                  )}

                  <button className="settings-save-btn" onClick={handlePasswordChange} disabled={passLoading}>
                    {passLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══ NOTIFICATIONS ══ */}
          {activeSection === "notifications" && (
            <div className="settings-section">
              <h2 className="settings-section-title">Notification Preferences</h2>
              <p className="settings-section-sub">These preferences are saved to your device. Your provider will still be able to send you status updates.</p>

              <div className="settings-card">
                <h3 className="settings-card-title">📧 Email Notifications</h3>
                <p className="settings-card-sub">Control which emails you receive from SkillsBridge SA.</p>
                {[
                  {
                    key: "emailStatusChange",
                    label: "Application status updates",
                    desc: "Emails when your application is shortlisted, accepted or rejected",
                    icon: "📋",
                    required: true,
                  },
                  {
                    key: "emailMatching",
                    label: "New matching opportunities",
                    desc: "Emails when a new opportunity matches your NQF level and qualifications",
                    icon: "🎯",
                  },
                  {
                    key: "emailClosing",
                    label: "Closing deadline reminders",
                    desc: "Reminders when opportunities close within 3 days",
                    icon: "⏰",
                  },
                ].map(({ key, label, desc, icon, required }) => (
                  <div className="settings-toggle-row" key={key}>
                    <div className="settings-toggle-info">
                      <span className="settings-toggle-icon">{icon}</span>
                      <div>
                        <p className="settings-toggle-label">
                          {label}
                          {required && <span className="settings-required-badge">Required</span>}
                        </p>
                        <p className="settings-toggle-desc">{desc}</p>
                      </div>
                    </div>
                    <label className="settings-toggle">
                      <input
                        type="checkbox"
                        checked={notifPrefs[key]}
                        disabled={required}
                        onChange={e => saveNotifPrefs({ ...notifPrefs, [key]: e.target.checked })}
                      />
                      <span className="settings-toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>

              <div className="settings-card">
                <h3 className="settings-card-title">🔔 In-App Notifications</h3>
                {[
                  {
                    key: "inAppAll",
                    label: "All in-app notifications",
                    desc: "Show bell icon alerts for applications, matches and deadlines",
                    icon: "🔔",
                  },
                ].map(({ key, label, desc, icon }) => (
                  <div className="settings-toggle-row" key={key}>
                    <div className="settings-toggle-info">
                      <span className="settings-toggle-icon">{icon}</span>
                      <div>
                        <p className="settings-toggle-label">{label}</p>
                        <p className="settings-toggle-desc">{desc}</p>
                      </div>
                    </div>
                    <label className="settings-toggle">
                      <input
                        type="checkbox"
                        checked={notifPrefs[key]}
                        onChange={e => saveNotifPrefs({ ...notifPrefs, [key]: e.target.checked })}
                      />
                      <span className="settings-toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>

              <div className="settings-info-box">
                <span>ℹ️</span>
                <p>Email notifications are sent from <strong>skillsbridgesa@gmail.com</strong>. Check your spam folder if you are not receiving them.</p>
              </div>
            </div>
          )}

          {/* ══ APPEARANCE ══ */}
          {activeSection === "appearance" && (
            <div className="settings-section">
              <h2 className="settings-section-title">Appearance</h2>

              <div className="settings-card">
                <h3 className="settings-card-title">Theme</h3>
                <p className="settings-card-sub">Choose how SkillsBridge SA looks for you.</p>
                <div className="settings-theme-grid">
                  {[
                    { id: "light",  icon: "☀️", label: "Light",          desc: "Clean white background" },
                    { id: "dark",   icon: "🌙", label: "Dark",           desc: "Easy on the eyes at night" },
                    { id: "system", icon: "💻", label: "System Default", desc: "Match your device setting" },
                  ].map(t => (
                    <button
                      key={t.id}
                      className={`settings-theme-card ${appearance.theme === t.id ? "settings-theme-active" : ""}`}
                      onClick={() => saveAppearance({ ...appearance, theme: t.id })}
                    >
                      <span className="settings-theme-icon">{t.icon}</span>
                      <span className="settings-theme-label">{t.label}</span>
                      <span className="settings-theme-desc">{t.desc}</span>
                      {appearance.theme === t.id && <span className="settings-theme-check">✓ Active</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="settings-card">
                <h3 className="settings-card-title">Text Size</h3>
                <p className="settings-card-sub">Adjust the size of text across the application.</p>
                <div className="settings-font-options">
                  {[
                    { id: "small",  label: "Small",  sample: "Aa" },
                    { id: "medium", label: "Medium", sample: "Aa" },
                    { id: "large",  label: "Large",  sample: "Aa" },
                  ].map(f => (
                    <button
                      key={f.id}
                      className={`settings-font-card ${appearance.fontSize === f.id ? "settings-font-active" : ""}`}
                      onClick={() => saveAppearance({ ...appearance, fontSize: f.id })}
                    >
                      <span className={`settings-font-sample settings-font-${f.id}`}>{f.sample}</span>
                      <span className="settings-font-label">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="settings-card">
                <h3 className="settings-card-title">Layout</h3>
                <div className="settings-toggle-row">
                  <div className="settings-toggle-info">
                    <span className="settings-toggle-icon">📐</span>
                    <div>
                      <p className="settings-toggle-label">Compact mode</p>
                      <p className="settings-toggle-desc">Reduce spacing to show more content at once</p>
                    </div>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={appearance.compact}
                      onChange={e => saveAppearance({ ...appearance, compact: e.target.checked })}
                    />
                    <span className="settings-toggle-slider" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ══ PRIVACY ══ */}
          {activeSection === "privacy" && (
            <div className="settings-section">
              <h2 className="settings-section-title">Privacy & Data</h2>

              <div className="settings-card">
                <h3 className="settings-card-title">What We Collect</h3>
                <p className="settings-card-sub">SkillsBridge SA collects only what is necessary to match you with opportunities and process your applications.</p>
                <div className="settings-privacy-list">
                  {[
                    { icon: "👤", title: "Personal details",        desc: "Name, ID number, contact details — shared with providers only when you apply." },
                    { icon: "🎓", title: "Education & qualifications", desc: "Used to match you with NQF-aligned opportunities and power AI recommendations." },
                    { icon: "📍", title: "Location",                desc: "Province and city — used to show relevant local opportunities." },
                    { icon: "📋", title: "Applications",            desc: "Records of opportunities you have applied for and their statuses." },
                    { icon: "🔔", title: "Notification history",    desc: "In-app notifications stored to allow you to review past alerts." },
                  ].map(({ icon, title, desc }) => (
                    <div className="settings-privacy-item" key={title}>
                      <span className="settings-privacy-icon">{icon}</span>
                      <div>
                        <p className="settings-toggle-label">{title}</p>
                        <p className="settings-toggle-desc">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="settings-card">
                <h3 className="settings-card-title">Your Rights (POPIA)</h3>
                <p className="settings-card-sub">In accordance with the Protection of Personal Information Act (POPIA), you have the right to:</p>
                <div className="settings-rights-list">
                  {[
                    "Access the personal information we hold about you",
                    "Request correction of inaccurate personal information",
                    "Request deletion of your personal information",
                    "Object to the processing of your personal information",
                    "Lodge a complaint with the Information Regulator",
                  ].map(right => (
                    <div key={right} className="settings-right-item">
                      <span className="settings-right-check">✓</span>
                      <span>{right}</span>
                    </div>
                  ))}
                </div>
                <button
                  className="settings-save-btn"
                  style={{ marginTop: 16 }}
                  onClick={() => window.open("mailto:skillsbridgesa@gmail.com?subject=Data Request (POPIA)&body=Please provide / correct / delete my personal data.%0A%0AEmail: " + currentUser?.email)}
                >
                  Submit Data Request →
                </button>
              </div>
            </div>
          )}

          {/* ══ DANGER ZONE ══ */}
          {activeSection === "danger" && (
            <div className="settings-section">
              <h2 className="settings-section-title">Delete Account</h2>

              <div className="settings-card settings-card-danger">
                <h3 className="settings-card-title settings-danger-title">⚠️ Delete Account</h3>
                <p className="settings-card-sub">
                  This will permanently delete your account, profile, and all applications. <strong>This action cannot be undone.</strong>
                </p>

                {!confirmDelete ? (
                  <button
                    className="settings-danger-btn"
                    onClick={() => setConfirmDelete(true)}
                  >
                    Delete My Account
                  </button>
                ) : (
                  <div className="settings-delete-confirm">
                    <div className="settings-delete-warning">
                      ⚠️ Are you absolutely sure? This will delete your profile, all applications, and cannot be reversed.
                    </div>
                    <input
                      type="password"
                      placeholder="Enter your password to confirm"
                      value={deletePass}
                      onChange={e => setDeletePass(e.target.value)}
                      className="settings-input settings-input-danger"
                    />
                    {deleteMsg && (
                      <div className={`settings-msg ${deleteMsg.type === "success" ? "settings-msg-success" : "settings-msg-error"}`}>
                        {deleteMsg.text}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 12 }}>
                      <button
                        className="settings-danger-btn"
                        onClick={handleDeleteAccount}
                        disabled={deleteLoading}
                      >
                        {deleteLoading ? "Deleting..." : "Yes, Delete My Account"}
                      </button>
                      <button
                        className="settings-save-btn"
                        style={{ background: "#718096" }}
                        onClick={() => { setConfirmDelete(false); setDeletePass(""); setDeleteMsg(null); }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}