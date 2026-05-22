import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";


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

function AdminProfile() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // =========================
  // FETCH PROFILE 
  // =========================
  useEffect(() => {
  const auth = getAuth();

  const unsubscribe = auth.onAuthStateChanged(async (user) => {
    if (!user) {
      console.error("No logged-in user");
      return;
    }

    try {
      // get fresh Firebase token 
      const token = await user.getIdToken();

      console.log("TOKEN:", token);

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // handle backend errors
      if (!res.ok) {
        const errText = await res.text();
        console.error("Server error:", errText);
        throw new Error("Failed to fetch admin profile");
      }

      const data = await res.json();

      

      setAdmin(data);
    } catch (err) {
      console.error("Fetch profile error:", err);
      showToast("Failed to load profile");
    }
  });

  return () => unsubscribe();
}, []);
  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
  };

  // =========================
  // SAVE PROFILE
  // =========================
  const saveProfile = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/admin-profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(admin),
        }
      );

      if (!res.ok) throw new Error();

      setEditMode(false);
      
      showToast("Profile updated");
    } catch {
      showToast("Update failed");
    }
  };

  // =========================
  // LOADING STATE
  // =========================
  if (!admin) {
    return (
      <p style={{ color: "white", textAlign: "center" }}>
        Loading profile...
      </p>
    );
  }

  const initials = admin ? getInitials(admin.name, admin.surname) : "…";

  return (
    <main style={styles.page}>
      {toast && <div style={styles.toast}>{toast}</div>}

      <button style={styles.backButton} onClick={() => navigate("/admin")}>← Back</button>
      <button style={styles.analyticsButton} onClick={() => navigate("/analytics")}>📊 Analytics</button>
      <section style={styles.card}>
        <div style={styles.profileSection}>
          {/* Avatar */}
          <div style={styles.avatar}>
            <span aria-hidden="true">{initials}</span>
          </div>
        </div>

        {/* Name */}
        <input
          name="name"
          value={admin.name || ""}
          disabled={!editMode}
          onChange={handleChange}
          style={styles.input}
          placeholder="Name"
        />

        {/* Surname */}
        <input
          name="surname"
          value={admin.surname || ""}
          disabled={!editMode}
          onChange={handleChange}
          style={styles.input}
          placeholder="Surname"
        />

        {/* Email */}
        <input
          name="email"
          value={admin.email || ""}
          disabled={!editMode}
          onChange={handleChange}
          style={styles.input}
          placeholder="Email"
        />

        {/* Buttons */}
        {!editMode ? (
          <button style={styles.button} onClick={() => setEditMode(true)}>
            Edit Profile
          </button>
        ) : (
          <div style={{ display: "flex", gap: "10px" }}>
            <button style={styles.save} onClick={saveProfile}>
              Save
            </button>

            <button
              style={styles.cancel}
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

const styles = {
  page: {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "transparent",
  color: "white",
  backgroundImage: "url('/Admin_images/admin_pic3.jpeg')",
  position: "relative",
  },

  card: {
    width: "400px",
    padding: "25px",
    borderRadius: "15px",
    backgroundColor: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    textAlign: "center",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "rgba(235, 245, 240, 0.94)",
    fontSize: "16px",
  },

  button: {
    backgroundColor: "#00c853",
    padding: "10px",
    border: "none",
    width: "100%",
    cursor: "pointer",
    color: "white",
  },
  analyticsButton: {
    position: "absolute",
    top: "20px",
    right: "20px",
    backgroundColor: "#00c853",
    color: "white",
    border: "none",
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },

  save: {
    flex: 1,
    backgroundColor: "#00c853",
    border: "none",
    padding: "10px",
    cursor: "pointer",
    color: "white",
  },

  cancel: {
    flex: 1,
    backgroundColor: "#ff5252",
    border: "none",
    padding: "10px",
    cursor: "pointer",
    color: "white",
  },

  toast: {
    position: "fixed",
    top: "20px",
    right: "20px",
    backgroundColor: "#00c853",
    padding: "10px 15px",
    borderRadius: "8px",
  },

  /* ── Profile section ── */
  profileSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    marginBottom: "20px",
  },

  // Circular avatar button showing the admin's initials
  avatar: {
    width: "70px",
    height: "70px",
    borderRadius: "60%",
    border: "3px solid #00c853",
    backgroundColor: "#0a1628",
    color: "#00c853",
    fontSize: "30px",
    fontWeight: 700,
    fontFamily: "Sora, sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    letterSpacing: "0.9px",
    transition: "background-color 0.2s, color 0.2s",
  },

  backButton: {
  position: "absolute",
  top: "20px",
  left: "20px",
  backgroundColor: "#00c853",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
  },
};

export default AdminProfile;