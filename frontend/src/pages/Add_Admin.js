import { useEffect, useState } from "react";

function AdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "admin",
  });

  // FETCH ADMINS
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/admin/admins`)
      .then((res) => res.json())
      .then((data) => setAdmins(data))
      .catch((err) => console.error(err));
  }, []);

  // ADD ADMIN
  const addAdmin = async () => {
    if (!form.name || !form.email) return;

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/admins`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const newAdmin = await res.json();
      setAdmins((prev) => [...prev, newAdmin]);

      setForm({ name: "", email: "", role: "admin" });
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE ADMIN
  const deleteAdmin = async (id) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/admin/admins/${id}`, {
        method: "DELETE",
      });

      setAdmins((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main style={styles.page}>
      <h2 style={styles.title}>Admin Management</h2>

      {/* ADD ADMIN FORM */}
      <section style={styles.formCard}>
        <h3 style={{ color: "#00c853" }}>Add New Admin</h3>

        <input
          style={styles.input}
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          style={styles.input}
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <button style={styles.button} onClick={addAdmin}>
          Add Admin
        </button>
      </section>

      {/* ADMIN LIST */}
      <section style={styles.listCard}>
        <h3 style={{ color: "#00c853" }}>Existing Admins</h3>

        <ul style={styles.list}>
          {admins.map((admin) => (
            <li key={admin.id}>
              <article style={styles.card}>
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
              </article>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

const styles = {
  page: {
    padding: "20px",
    color: "white",
    minHeight: "100vh",
    backgroundColor: "transparent",
  },

  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#00c853",
  },

  formCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",

    padding: "15px",
    borderRadius: "14px",

    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
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
    border: "none",
    padding: "10px",
    cursor: "pointer",
    width: "100%",
  },

  listCard: {
    backgroundColor: "rgba(17, 26, 46, 0.55)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",

    padding: "15px",
    borderRadius: "12px",

    border: "1px solid rgba(255,255,255,0.15)",
    },

  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },

  card: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    backgroundColor: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",

    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",

    border: "1px solid rgba(255,255,255,0.1)",
    },

  deleteBtn: {
    backgroundColor: "#ff5252",
    border: "none",
    padding: "6px 10px",
    cursor: "pointer",
  },

  
};

export default AdminsPage;