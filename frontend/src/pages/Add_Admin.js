import { useEffect, useState } from "react";

// ─── Validation helpers ────────────────────────────────────────────────────────

// Only letters and spaces; 2–50 characters
const NAME_REGEX = /^[a-zA-Z\s]{2,50}$/;

// Standard email format: local@domain.tld
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Min 8 chars, at least one uppercase letter, at least one digit
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

/**
 * Validates the entire form and returns an errors object.
 * Each key maps to a human-readable error string, or "" if valid.
 */
const validateForm = (form) => ({
  name: NAME_REGEX.test(form.name.trim())
    ? ""
    : "2–50 letters only",
  surname: NAME_REGEX.test(form.surname.trim())
    ? ""
    : "2–50 letters only",
  email: EMAIL_REGEX.test(form.email.trim())
    ? ""
    : "Enter a valid email address",
  password: PASSWORD_REGEX.test(form.password)
    ? ""
    : "Min 8 chars, 1 uppercase, 1 number",
});

/** Returns true when every error string in the errors object is empty. */
const isFormValid = (errors) => Object.values(errors).every((e) => e === "");

// ─── Component ─────────────────────────────────────────────────────────────────

function AdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);

  // Controlled form state
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
  });

  // Per-field error messages; only shown after the user has touched a field
  const [errors, setErrors] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
  });

  // Tracks which fields the user has interacted with so we don't show
  // errors on fields they haven't touched yet
  const [touched, setTouched] = useState({
    name: false,
    surname: false,
    email: false,
    password: false,
  });

  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  // ── Fetch existing admins on mount ──────────────────────────────────────────
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/admin/admins`)
      .then((res) => res.json())
      .then((data) => setAdmins(Array.isArray(data) ? data : []))
      .catch(() => showToast("Failed to load admins", "error"));
  }, []);

  // ── Generic field change handler ────────────────────────────────────────────
  /**
   * For Name / Surname we also block disallowed characters while the user
   * types (only letters and spaces are passed through).
   * For Email and Password we allow free typing and validate on change.
   */
  const handleChange = (field, value) => {
    // Silently block non-letter characters for name fields while typing
    if ((field === "name" || field === "surname") && value !== "") {
      if (!/^[a-zA-Z\s]*$/.test(value)) return; // reject the keystroke
      if (value.length > 50) return;             // enforce max length
    }

    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);

    // Re-validate this field immediately so feedback is live after first touch
    if (touched[field]) {
      const newErrors = validateForm(updatedForm);
      setErrors((prev) => ({ ...prev, [field]: newErrors[field] }));
    }
  };

  // ── Mark field as touched on blur and show its error ────────────────────────
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const newErrors = validateForm(form);
    setErrors((prev) => ({ ...prev, [field]: newErrors[field] }));
  };

  // ── Add admin ───────────────────────────────────────────────────────────────
  const addAdmin = async () => {
    // Mark all fields as touched so all errors become visible on submit
    setTouched({ name: true, surname: true, email: true, password: true });

    const newErrors = validateForm(form);
    setErrors(newErrors);

    // Abort if any field is invalid
    if (!isFormValid(newErrors)) {
      showToast("Please fix the errors before submitting", "error");
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

      // Reset form and all validation state after success
      setForm({ name: "", surname: "", email: "", password: "" });
      setErrors({ name: "", surname: "", email: "", password: "" });
      setTouched({ name: false, surname: false, email: false, password: false });

      showToast("Admin added successfully!", "success");
    } catch {
      showToast("Server error", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Delete admin ────────────────────────────────────────────────────────────
  const deleteAdmin = async (firebase_uid) => {
    try {
      await fetch(
        `${process.env.REACT_APP_API_URL}/admin/admins/${firebase_uid}`,
        { method: "DELETE" }
      );

      setAdmins((prev) => prev.filter((a) => a.firebase_uid !== firebase_uid));
      showToast("Admin removed", "success");
    } catch {
      showToast("Failed to delete admin", "error");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <main style={styles.page}>

      {/* ── Toast notification ── */}
      {toast.message && (
        <aside
          role="status"          /* live region so screen readers announce it */
          aria-live="polite"
          style={{
            ...styles.toast,
            backgroundColor: toast.type === "success" ? "#00c853" : "#ff5252",
          }}
        >
          {toast.message}
        </aside>
      )}

      <h1 style={styles.title}>Admin Management</h1>

      <div style={styles.grid}>

        {/* ── Add admin form ── */}
        <section aria-labelledby="add-admin-heading" style={styles.card}>
          <h2 id="add-admin-heading" style={styles.sectionTitle}>
            Add New Admin
          </h2>

          {/* fieldset groups the related inputs semantically */}
          <fieldset style={styles.fieldset}>
            <legend style={styles.visuallyHidden}>New admin details</legend>

            {/* Name */}
            <div style={styles.fieldGroup}>
              <label htmlFor="admin-name" style={styles.label}>
                Name <span aria-hidden="true" style={styles.required}>*</span>
              </label>
              <input
                id="admin-name"
                style={{
                  ...styles.input,
                  borderColor: touched.name && errors.name ? "#ff5252" : "transparent",
                }}
                placeholder="e.g. Jane"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                aria-required="true"
                aria-invalid={touched.name && !!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                autoComplete="given-name"
              />
              {/* Error only renders after the field has been touched */}
              {touched.name && errors.name && (
                <span id="name-error" role="alert" style={styles.errorMsg}>
                  {errors.name}
                </span>
              )}
            </div>

            {/* Surname */}
            <div style={styles.fieldGroup}>
              <label htmlFor="admin-surname" style={styles.label}>
                Surname <span aria-hidden="true" style={styles.required}>*</span>
              </label>
              <input
                id="admin-surname"
                style={{
                  ...styles.input,
                  borderColor: touched.surname && errors.surname ? "#ff5252" : "transparent",
                }}
                placeholder="e.g. Doe"
                value={form.surname}
                onChange={(e) => handleChange("surname", e.target.value)}
                onBlur={() => handleBlur("surname")}
                aria-required="true"
                aria-invalid={touched.surname && !!errors.surname}
                aria-describedby={errors.surname ? "surname-error" : undefined}
                autoComplete="family-name"
              />
              {touched.surname && errors.surname && (
                <span id="surname-error" role="alert" style={styles.errorMsg}>
                  {errors.surname}
                </span>
              )}
            </div>

            {/* Email */}
            <div style={styles.fieldGroup}>
              <label htmlFor="admin-email" style={styles.label}>
                Email <span aria-hidden="true" style={styles.required}>*</span>
              </label>
              <input
                id="admin-email"
                type="email"          /* triggers native email keyboard on mobile */
                inputMode="email"
                style={{
                  ...styles.input,
                  borderColor: touched.email && errors.email ? "#ff5252" : "transparent",
                }}
                placeholder="e.g. jane@example.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                aria-required="true"
                aria-invalid={touched.email && !!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                autoComplete="email"
              />
              {touched.email && errors.email && (
                <span id="email-error" role="alert" style={styles.errorMsg}>
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div style={styles.fieldGroup}>
              <label htmlFor="admin-password" style={styles.label}>
                Password <span aria-hidden="true" style={styles.required}>*</span>
              </label>
              <input
                id="admin-password"
                type="password"
                style={{
                  ...styles.input,
                  borderColor: touched.password && errors.password ? "#ff5252" : "transparent",
                }}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                aria-required="true"
                aria-invalid={touched.password && !!errors.password}
                aria-describedby="password-hint password-error"
                autoComplete="new-password"
              />
              {/* Static hint always visible so the user knows the rules upfront */}
              <span id="password-hint" style={styles.hint}>
                At least 8 characters, 1 uppercase letter, and 1 number
              </span>
              {touched.password && errors.password && (
                <span id="password-error" role="alert" style={styles.errorMsg}>
                  {errors.password}
                </span>
              )}
            </div>

          </fieldset>

          <button
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onClick={addAdmin}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Adding…" : "Add Admin"}
          </button>
        </section>

        {/* ── Existing admins list ── */}
        <section aria-labelledby="existing-admins-heading" style={styles.card}>
          <h2 id="existing-admins-heading" style={styles.sectionTitle}>
            Existing Admins
          </h2>

          {admins.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
              No admins found.
            </p>
          ) : (
            /* Semantic list so assistive tech announces "X items" */
            <ul style={styles.list} aria-label="Admin accounts">
              {admins.map((admin) => (
                <li key={admin.firebase_uid} style={styles.adminCard}>
                  {/* Article groups the admin's details as a self-contained unit */}
                  <article>
                    <strong>{admin.name} {admin.surname}</strong>
                    <p style={{ margin: "2px 0 0", color: "#00c853" }}>
                      {admin.email}
                    </p>
                    <small style={{ color: "rgba(255,255,255,0.5)" }}>
                      {admin.role}
                    </small>
                  </article>

                  <button
                    style={styles.deleteBtn}
                    onClick={() => deleteAdmin(admin.firebase_uid)}
                    /* Descriptive label for screen readers */
                    aria-label={`Remove admin ${admin.name}`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

      </div>
    </main>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

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
    fontSize: "1.6rem",
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
    fontSize: "1.1rem",
  },

  // Remove default fieldset styling
  fieldset: {
    border: "none",
    margin: 0,
    padding: 0,
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "12px",
  },

  label: {
    fontSize: "0.8rem",
    marginBottom: "4px",
    color: "rgba(255,255,255,0.75)",
    fontWeight: 500,
  },

  required: {
    color: "#ff5252",
    marginLeft: "2px",
  },

  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "2px solid transparent", /* overridden to red on error */
    backgroundColor: "rgba(255,255,255,0.9)",
    color: "#111",
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.2s",
  },

  errorMsg: {
    color: "#ff5252",
    fontSize: "0.75rem",
    marginTop: "4px",
  },

  hint: {
    color: "rgba(255,255,255,0.45)",
    fontSize: "0.72rem",
    marginTop: "4px",
  },

  // Hidden visually but readable by screen readers
  visuallyHidden: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0,0,0,0)",
    whiteSpace: "nowrap",
    border: 0,
  },

  button: {
    width: "100%",
    padding: "10px",
    marginTop: "4px",
    backgroundColor: "#00c853",
    border: "none",
    borderRadius: "6px",
    color: "white",
    fontWeight: 600,
    fontSize: "0.95rem",
    transition: "opacity 0.2s",
  },

  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },

  adminCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    backgroundColor: "#0a1628",
    border: "1px solid rgba(255,255,255,0.1)",
  },

  deleteBtn: {
    backgroundColor: "#ff5252",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    color: "white",
    fontWeight: 600,
    flexShrink: 0,
  },

  toast: {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "12px 18px",
    borderRadius: "8px",
    color: "white",
    zIndex: 9999,
    fontWeight: 500,
  },
};

export default AdminsPage;
