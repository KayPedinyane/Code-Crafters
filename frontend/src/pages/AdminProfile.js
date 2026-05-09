import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

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

  return (
    <main style={styles.page}>
      {toast && <div style={styles.toast}>{toast}</div>}

      <button style={styles.backButton} onClick={() => navigate("/admin")}>← Back</button>
      <section style={styles.card}>
        {/* Avatar */}
        <div style={styles.avatar}>👤</div>

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

  avatar: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    backgroundColor: "#0a1628",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "40px",
    margin: "0 auto 20px",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "6px",
    border: "none",
  },

  button: {
    backgroundColor: "#00c853",
    padding: "10px",
    border: "none",
    width: "100%",
    cursor: "pointer",
    color: "white",
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

  backButton: {
  position: "absolute",
  top: "20px",
  left: "20px",
  backgroundColor: "rgba(0,0,0,0.5)",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
  },
};

export default AdminProfile;