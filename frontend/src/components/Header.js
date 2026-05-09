import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";

function Header() {
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;

      try {
        const token = await user.getIdToken(true);

        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/admin/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setAdmin(data);
      } catch (err) {
        console.error(err);
      }
    });

    return () => unsubscribe();
  }, []);

  const navItems = [
    { name: "Admin Dashboard", path: "/admin" },
    { name: "Provider Requests", path: "/requests" },
    { name: "Admins Page", path: "/admins" },
  ];

  return (
    <header style={styles.header}>

      {/* TOP ROW */}
      <section style={styles.topRow}>

        {/* LOGO */}
        <div style={styles.logo}>
          <span style={styles.logoIcon}>◈</span>
          <span style={styles.logoText}>
            SkillsBridge<span style={styles.logoAccent}>SA</span>
          </span>
        </div>

        {/* CENTER ADMIN INFO */}
        <section style={styles.centerInfo}>
          <h1 style={styles.name}>
            {admin ? `${admin.name} ${admin.surname}` : "Loading..."}
          </h1>
          <p style={styles.role}>
            {admin ? admin.role : ""}
          </p>
        </section>

        {/* PROFILE BUTTON */}
        <button
          style={styles.profile}
          onClick={() => navigate("AdminProfile")}
          aria-label="Open profile"
        >
          👤
        </button>

      </section>

      {/* NAVIGATION */}
      <section style={styles.navBar}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <section
              key={item.path}
              style={styles.navItem}
              onClick={() => navigate(item.path)}
            >
              <strong
                style={{
                  ...styles.navText,
                  color: isActive ? "#00c853" : "#ffffff",
                }}
              >
                {item.name}
              </strong>

              {isActive && <section style={styles.activeIndicator} />}
            </section>
          );
        })}
      </section>

    </header>
  );
}

const styles = {
  header: {
    backgroundColor: "#0a1628",
    color: "#ffffff",
    padding: "15px 20px",
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

  /* LOGO */
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  logoIcon: {
    color: "#00c853",
    fontSize: "22px",
  },

  logoText: {
    fontFamily: "Sora, sans-serif",
    fontWeight: 700,
    fontSize: "18px",
    color: "#ffffff",
    letterSpacing: "-0.3px",
  },

  logoAccent: {
    color: "#00c853",
  },

  /* CENTER INFO */
  centerInfo: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    textAlign: "center",
  },

  name: {
    fontSize: "18px",
    margin: 0,
    color: "#ffffff",
  },

  role: {
    fontSize: "12px",
    margin: 0,
    color: "#00c853",
  },

  /* PROFILE */
  profile: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "#ffffff",
    color: "#0a1628",
    fontSize: "18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  /* NAV */
  navBar: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "15px",
    borderTop: "1px solid #00c853",
    paddingTop: "10px",
  },

  navItem: {
    position: "relative",
    cursor: "pointer",
    paddingBottom: "5px",
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