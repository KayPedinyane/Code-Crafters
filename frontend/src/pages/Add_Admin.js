import { useEffect, useState } from "react";

function AdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
  });

  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  // FETCH ADMINS
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/admin/admins`)
      .then((res) => res.json())
      .then((data) => setAdmins(Array.isArray(data) ? data : []))
      .catch(() => showToast("Failed to load admins", "error"));
  }, []);

  // ADD ADMIN
  const addAdmin = async () => {
    if (!form.name || !form.email) {
      showToast("Please fill required fields", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/admins`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Failed to add admin", "error");
        return;
      }

      setAdmins((prev) => [...prev, data]);
      setForm({
        name: "",
        surname: "",
        email: "",
      });

      showToast("Admin added successfully!", "success");
    } catch {
      showToast("Server error", "error");
    } finally {
      setLoading(false);
    }
  };

  // DELETE ADMIN
  const deleteAdmin = async (id) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/admin/admins/${id}`, {
        method: "DELETE",
      });

      setAdmins((prev) => prev.filter((a) => a.id !== id));
      showToast("Admin removed", "success");
    } catch {
      showToast("Failed to delete admin", "error");
    }
  };

  return (
    <main style={styles.page}>

      {/* TOAST */}
      {toast.message && (
        <div
          style={{
            ...styles.toast,
            backgroundColor:
              toast.type === "success" ? "#00c853" : "#ff5252",
          }}
        >
          {toast.message}
        </div>
      )}

      <h2 style={styles.title}>Admin Management</h2>

      <div style={styles.grid}>

        {/* FORM */}
        <section style={styles.card}>
          <h3 style={styles.sectionTitle}>Add New Admin</h3>

          <input
            style={styles.input}
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            style={styles.input}
            placeholder="Surname"
            value={form.surname}
            onChange={(e) => setForm({ ...form, surname: e.target.value })}
          />

          <input
            style={styles.input}
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <button
            style={styles.button}
            onClick={addAdmin}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Admin"}
          </button>
        </section>

        {/* LIST */}
        <section style={styles.card}>
          <h3 style={styles.sectionTitle}>Existing Admins</h3>

          <ul style={styles.list}>
            {admins.map((admin) => (
              <li key={admin.id}>
                <div style={styles.adminCard}>
                  <div>
                    <strong>{admin.name}</strong>
                    <p style={{ margin: 0 }}>{admin.email}</p>
                    <small>{admin.role}</small>
                  </div>

                  <button
                    style={styles.deleteBtn}
                    onClick={() => deleteAdmin(admin.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "30px",
    color: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "transparent",
  },

  title: {
    color: "#00c853",
    marginBottom: "20px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "30px",
    width: "100%",
    maxWidth: "1000px",
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    padding: "20px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.2)",
  },

  sectionTitle: {
    textAlign: "center",
    color: "#00c853",
    marginBottom: "15px",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "6px",
    border: "none",
  },

  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#00c853",
    border: "none",
    cursor: "pointer",
    color: "white",
  },

  list: {
    listStyle: "none",
    padding: 0,
  },

  adminCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    backgroundColor: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
  },

  deleteBtn: {
    backgroundColor: "#ff5252",
    border: "none",
    padding: "6px 10px",
    cursor: "pointer",
    color: "white",
  },

  toast: {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "12px 18px",
    borderRadius: "8px",
    color: "white",
    zIndex: 9999,
  },
};

export default AdminsPage;