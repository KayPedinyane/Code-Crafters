import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import "./SettingsPage.css";

function SettingsPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeSection, setActiveSection] = useState("account");

  // Password change
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass]         = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passMsg, setPassMsg]         = useState(null);
  const [passLoading, setPassLoading] = useState(false);

  // Notification preferences (localStorage)
  const [notifPrefs, setNotifPrefs] = useState({
    emailStatusChange: true,
    emailMatching: true,
    emailClosing: true,
    inAppAll: true,
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        const saved = JSON.parse(localStorage.getItem(`notif_prefs_${user.email}`) || "null");
        if (saved) setNotifPrefs(saved);
      } else navigate("/");
    });
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveNotifPrefs = (updated) => {
    setNotifPrefs(updated);
    localStorage.setItem(`notif_prefs_${currentUser.email}`, JSON.stringify(updated));
  };

  const handlePasswordChange = async () => {
    if (!newPass || !currentPass) { setPassMsg({ type: "error", text: "Please fill in all fields." }); return; }
    if (newPass !== confirmPass)  { setPassMsg({ type: "error", text: "New passwords do not match." }); return; }
    if (newPass.length < 6)       { setPassMsg({ type: "error", text: "Password must be at least 6 characters." }); return; }

    setPassLoading(true);
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPass);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPass);
      setPassMsg({ type: "success", text: "Password updated successfully!" });
      setCurrentPass(""); setNewPass(""); setConfirmPass("");
    } catch (err) {
      const msg = err.code === "auth/wrong-password"
        ? "Current password is incorrect."
        : err.code === "auth/too-many-requests"
        ? "Too many attempts. Please try again later."
        : "Failed to update password. Please try again.";
      setPassMsg({ type: "error", text: msg });
    }
    setPassLoading(false);
  };

  const sections = [
    { id: "account",       label: "⚙️ Account",       icon: "⚙️" },
    { id: "notifications", label: "🔔 Notifications",  icon: "🔔" },
    { id: "privacy",       label: "🔒 Privacy",        icon: "🔒" },
    { id: "appearance",    label: "🎨 Appearance",     icon: "🎨" },
  ];

  return (
    <div className="settings-wrapper">
      <header className="settings-header">
        <div className="settings-header-inner">
          <div className="logo" onClick={() => navigate("/applicant")} style={{ cursor: "pointer" }}>
            <span className="logo-icon">◈</span>
            <span className="logo-text">SkillsBridge<span className="logo-accent">SA</span></span>
          </div>
          <button className="settings-back-btn" onClick={() => navigate("/applicant")}>← Back</button>
        </div>
      </header>

      <div className="settings-content">
        <div className="settings-sidebar">
          <h2 className="settings-sidebar-title">Settings</h2>
          {sections.map(sec => (
            <button key={sec.id}
              className={`settings-nav-btn ${activeSection === sec.id ? "settings-nav-active" : ""}`}
              onClick={() => setActiveSection(sec.id)}>
              {sec.label}
            </button>
          ))}
        </div>

        <div className="settings-main">

          {/* ── ACCOUNT ── */}
          {activeSection === "account" && (
            <div className="settings-section">
              <h2 className="settings-section-title">Account Settings</h2>

              <div className="settings-card">
                <h3 className="settings-card-title">Email Address</h3>
                <p className="settings-card-sub">Your login email cannot be changed here. Contact support if needed.</p>
                <div className="settings-email-display">
                  <span>✉️</span>
                  <span>{currentUser?.email}</span>
                </div>
              </div>

              <div className="settings-card">
                <h3 className="settings-card-title">Change Password</h3>
                <p className="settings-card-sub">Use a strong password with at least 6 characters.</p>
                <div className="settings-form">
                  <input type="password" placeholder="Current password" value={currentPass}
                    onChange={e => setCurrentPass(e.target.value)} className="settings-input" />
                  <input type="password" placeholder="New password" value={newPass}
                    onChange={e => setNewPass(e.target.value)} className="settings-input" />
                  <input type="password" placeholder="Confirm new password" value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)} className="settings-input" />
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

          {/* ── NOTIFICATIONS ── */}
          {activeSection === "notifications" && (
            <div className="settings-section">
              <h2 className="settings-section-title">Notification Preferences</h2>

              <div className="settings-card">
                <h3 className="settings-card-title">Email Notifications</h3>
                <p className="settings-card-sub">Choose which emails you receive from SkillsBridge SA.</p>
                {[
                  { key: "emailStatusChange", label: "Application status updates", desc: "When your application is shortlisted, accepted or rejected" },
                  { key: "emailMatching",     label: "New matching opportunities", desc: "When a new opportunity matches your profile" },
                  { key: "emailClosing",      label: "Closing deadline reminders", desc: "When an opportunity you haven't applied to is closing soon" },
                ].map(({ key, label, desc }) => (
                  <div className="settings-toggle-row" key={key}>
                    <div>
                      <p className="settings-toggle-label">{label}</p>
                      <p className="settings-toggle-desc">{desc}</p>
                    </div>
                    <label className="settings-toggle">
                      <input type="checkbox" checked={notifPrefs[key]}
                        onChange={e => saveNotifPrefs({ ...notifPrefs, [key]: e.target.checked })} />
                      <span className="settings-toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>

              <div className="settings-card">
                <h3 className="settings-card-title">In-App Notifications</h3>
                {[
                  { key: "inAppAll", label: "All in-app notifications", desc: "Show notification bell alerts for all activity" },
                ].map(({ key, label, desc }) => (
                  <div className="settings-toggle-row" key={key}>
                    <div>
                      <p className="settings-toggle-label">{label}</p>
                      <p className="settings-toggle-desc">{desc}</p>
                    </div>
                    <label className="settings-toggle">
                      <input type="checkbox" checked={notifPrefs[key]}
                        onChange={e => saveNotifPrefs({ ...notifPrefs, [key]: e.target.checked })} />
                      <span className="settings-toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PRIVACY ── */}
          {activeSection === "privacy" && (
            <div className="settings-section">
              <h2 className="settings-section-title">Privacy & Data</h2>
              <div className="settings-card">
                <h3 className="settings-card-title">Your Data</h3>
                <p className="settings-card-sub">SkillsBridge SA collects only the information needed to match you with opportunities and process your applications.</p>
                <div className="settings-privacy-list">
                  {[
                    { icon: "👤", title: "Personal details", desc: "Name, ID number, contact details — used to identify you to providers when you apply." },
                    { icon: "🎓", title: "Education & qualifications", desc: "Used to match you with NQF-aligned opportunities and power AI recommendations." },
                    { icon: "📍", title: "Location", desc: "Province and city — used to show relevant local opportunities." },
                    { icon: "📋", title: "Applications", desc: "Records of opportunities you have applied for and their statuses." },
                    { icon: "🔔", title: "Notification history", desc: "In-app notifications are stored to allow you to review past alerts." },
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
                <h3 className="settings-card-title">Data Requests</h3>
                <p className="settings-card-sub">You have the right to request a copy of your data or request deletion in accordance with POPIA (Protection of Personal Information Act).</p>
                <button className="settings-save-btn" onClick={() => window.alert("Send your data request to skillsbridgesa@gmail.com and we will respond within 30 days.")}>
                  Request My Data
                </button>
              </div>
            </div>
          )}

          {/* ── APPEARANCE ── */}
          {activeSection === "appearance" && (
            <div className="settings-section">
              <h2 className="settings-section-title">Appearance</h2>
              <div className="settings-card">
                <h3 className="settings-card-title">Theme</h3>
                <p className="settings-card-sub">Choose how SkillsBridge SA looks for you.</p>
                <div className="settings-theme-options">
                  {[
                    { id: "light", label: "☀️ Light", desc: "Clean white background" },
                    { id: "system", label: "💻 System Default", desc: "Match your device setting" },
                  ].map(t => (
                    <div key={t.id} className="settings-theme-card settings-theme-active">
                      <span className="settings-theme-label">{t.label}</span>
                      <span className="settings-theme-desc">{t.desc}</span>
                      <span className="settings-theme-check">✓ Active</span>
                    </div>
                  ))}
                </div>
                <p className="settings-card-sub" style={{ marginTop: 12 }}>
                  Dark mode coming soon — stay tuned!
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default SettingsPage;