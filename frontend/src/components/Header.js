import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";

function Header() {
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) return;

        const token = await user.getIdToken();

        const res = await fetch("/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setAdmin(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAdmin();
  }, []);

  const navItems = [
    { name: "Admin Dashboard", path: "/admin" },
    { name: "Provider Requests", path: "/requests" },
    { name: "Admins Page", path: "/admins" },
  ];

  return (
    <header style={styles.header}>
      {/* Top Section */}
      <section style={styles.topRow}>
        <section style={styles.nameContainer}>
          <h1 style={styles.name}>
            {admin ? admin.name : "Loading..."}
          </h1>
          <p style={styles.role}>
            {admin ? admin.role : ""}
          </p>
        </section>

        <button
          style={styles.profile}
          onClick={() => navigate("/admin/profile")}
          aria-label="Open profile"
        >
          👤
        </button>
      </section>

      {/* Bottom Navigation Tabs */}
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
                  color: isActive ? "#00c853" : "white",
                }}
              >
                {item.name}
              </strong>

              {/* Active Indicator :"slide effect" */}
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
  color: "white",
  padding: "15px 20px",
  display: "flex",
  flexDirection: "column",

  position: "sticky",
  top: 0,
  zIndex: 1000,
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  nameContainer: {
    textAlign: "left",
  },

  name: {
    fontSize: "22px",
    margin: 0,
  },

  role: {
    fontSize: "13px",
    margin: 0,
    color: "#00c853",
  },

  profile: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    backgroundColor: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "22px",
    cursor: "pointer",
    border: "none",
  },

  navBar: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "15px",
    borderTop: "1px solid rgb(72, 237, 60)",
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