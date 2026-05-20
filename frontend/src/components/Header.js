import { useEffect, useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";

// ─── Helper ────────────────────────────────────────────────────────────────────

/**
 * Derives up to two initials from a name and surname.
 * Falls back to "?" if neither is available yet.
 *
 * Examples:
 *   getInitials("Jane", "Doe")  → "JD"
 *   getInitials("Jane", "")     → "J"
 *   getInitials("", "")         → "?"
 */
const getInitials = (name = "", surname = "") => {
  const first = name.trim()[0] ?? "";
  const last = surname.trim()[0] ?? "";
  return (first + last).toUpperCase() || "?";
};

// ─── Component ─────────────────────────────────────────────────────────────────

function Header() {
  const [admin, setAdmin] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // ── Fetch the logged-in admin's profile from Firebase + backend ─────────────
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;

      try {
        const token = await user.getIdToken(true);

        const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setAdmin(data);
      } catch (err) {
        console.error(err);
      }
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  const navItems = [
    { name: "Admin Dashboard", path: "/admin" },
    { name: "Provider Requests", path: "/requests" },
    { name: "Admins Page", path: "/admins" },
  ];

  // ── Sign out and redirect to login ──────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  // Derive initials once so we don't repeat the call in JSX
  const initials = admin ? getInitials(admin.name, admin.surname) : "…";

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <header style={styles.header}>

      {/* ── Top row: logo / admin info / profile ── */}
      <div style={styles.topRow}>

        {/* Brand logo */}
        <a
          href="/admin"
          style={styles.logoLink}
          aria-label="SkillsBridgeSA — go to dashboard"
        >
          <span aria-hidden="true" style={styles.logoIcon}>◈</span>
          <span style={styles.logoText}>
            SkillsBridge<span style={styles.logoAccent}>SA</span>
          </span>
        </a>

        {/* Logged-in admin's name and role, centred absolutely */}
        <div style={styles.centerInfo} aria-live="polite" aria-atomic="true">
          {/* aria-live announces the name once it loads for screen readers */}
          <p style={styles.adminName}>
            {admin ? `${admin.name} ${admin.surname}` : "Loading…"}
          </p>
          <p style={styles.adminRole}>
            {admin?.role ?? ""}
          </p>
        </div>

        {/* Profile avatar + logout */}
        <div style={styles.profileSection}>
          
          <button
            style={styles.avatarBtn}
            onClick={() => navigate("AdminProfile")}
            aria-label={
              admin
                ? `Open profile for ${admin.name} ${admin.surname}`
                : "Open profile"
            }
            title={admin ? `${admin.name} ${admin.surname}` : "Profile"}
          >
            {/* Show initials; screen readers get the full name from aria-label */}
            <span aria-hidden="true">{initials}</span>
          </button>

          <button style={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>

      </div>

      {/* ── Primary navigation ── */}
      <nav aria-label="Admin navigation" style={styles.navBar}>
        <ul style={styles.navList}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path} style={styles.navItem}>
                
                <button
                  style={styles.navBtn}
                  onClick={() => navigate(item.path)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span
                    style={{
                      ...styles.navText,
                      color: isActive ? "#00c853" : "#ffffff",
                    }}
                  >
                    {item.name}
                  </span>

                  {/* Visual active underline indicator */}
                  {isActive && (
                    <span aria-hidden="true" style={styles.activeIndicator} />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

    </header>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  header: {
    backgroundColor: "#0a1628",
    color: "#ffffff",
    padding: "15px 20px 0",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },

  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },

  /* ── Logo ── */
  logoLink: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
  },

  logoIcon: {
    color: "#00c853",
    fontSize: "24px",
  },

  logoText: {
    fontFamily: "Sora, sans-serif",
    fontWeight: 700,
    fontSize: "20px",
    color: "#ffffff",
    letterSpacing: "-0.3px",
  },

  logoAccent: {
    color: "#00c853",
  },

  /* ── Centre admin info ── */
  centerInfo: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    textAlign: "center",
    pointerEvents: "none", // prevent overlap from blocking logo / profile clicks
  },

  adminName: {
    fontSize: "24px",
    margin: 0,
    color: "#ffffff",
    fontWeight: 600,
  },

  adminRole: {
    fontSize: "16px",
    margin: 0,
    color: "#00c853",
  },

  /* ── Profile section ── */
  profileSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },

  // Circular avatar button showing the admin's initials
  avatarBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border: "2px solid #00c853",
    backgroundColor: "#0a1628",
    color: "#00c853",
    fontSize: "15px",
    fontWeight: 700,
    fontFamily: "Sora, sans-serif",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    letterSpacing: "0.5px",
    transition: "background-color 0.2s, color 0.2s",
  },

  logoutButton: {
    border: "none",
    backgroundColor: "#00c853",
    color: "#ffffff",
    padding: "5px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: 0,
  },

  /* ── Navigation ── */
  navBar: {
    marginTop: "15px",
    borderTop: "1px solid #00c853",
    paddingTop: "10px",
    paddingBottom: 0,
    marginBottom: 0,
  },

  navList: {
    display: "flex",
    justifyContent: "space-around",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },

  navItem: {
    position: "relative",
  },

  // Reset button styles so it looks like a nav link
  navBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0 0 5px",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  navText: {
    fontSize: "14px",
    fontWeight: "500",
  },

  activeIndicator: {
    position: "absolute",
    bottom: "-6px",
    left: 0,
    right: 0,
    height: "3px",
    backgroundColor: "#00c853",
    borderRadius: "2px",
  },
};

export default Header;
