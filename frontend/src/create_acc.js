import { useState } from "react";
import "./create_acc.css";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

const requirements = [
  { id: "length",    label: "At least 8 characters",       test: (p) => p.length >= 8 },
  { id: "uppercase", label: "One uppercase letter (A–Z)",  test: (p) => /[A-Z]/.test(p) },
  { id: "number",    label: "One number (0–9)",            test: (p) => /[0-9]/.test(p) },
  { id: "symbol",    label: "One symbol (!@#$%^&*)",       test: (p) => /[!@#$%^&*]/.test(p) },
];

function PasswordRequirements({ password, show }) {
  if (!show) return null;

  return (
    <div className="pw-requirements">
      <p className="pw-req-title">Password must have:</p>
      <ul className="pw-req-list">
        {requirements.map(({ id, label, test }) => {
          const met = test(password);
          return (
            <li key={id} className={`pw-req-item ${met ? "met" : "unmet"}`}>
              <span className="pw-req-icon">{met ? "✓" : "✗"}</span>
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Create() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const navigate = useNavigate();

  const isStrongPassword = (p) =>
    /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/.test(p);

  const allMet = requirements.every(({ test }) => test(password));
  const showRequirements = passwordFocused || (submitAttempted && !allMet);

  const create = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitAttempted(true);

    if (!isStrongPassword(password)) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    let firebaseUser = null;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUser = userCredential.user;
      const token = await firebaseUser.getIdToken(true);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const errData = await response.json();
        await firebaseUser.delete();
        throw new Error(errData.error || "Failed to save user to database.");
      }

      await sendEmailVerification(firebaseUser);
      alert("Account created! Please verify your email before logging in.");
      navigate("/");

    } catch (err) {
      if (firebaseUser && err.code !== "auth/email-already-in-use") {
        try { await firebaseUser.delete(); } catch (_) {}
      }
      setError(err.message);
    }
  };

  return (
    <div className="create-page">
      <div className="create-brand">
        ...
      </div>

      <div className="create-form-side">
        <div className="create-form-box">

          <div className="form-header">
            ...
          </div>

          <form onSubmit={create}>

            {/* Email */}
            <div className="input-field">
              ...
            </div>

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <select value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="user">Applicant</option>
              <option value="provider">Provider</option>
            </select>

            <button type="submit">Register</button>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <p style={{ color: "white" }}>
              Already have an account?{" "}
              <span className="login-link" onClick={() => navigate("/login")}>
                Login
              </span>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}

export default Create;