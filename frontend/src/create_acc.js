import { useState } from "react";
import "./create_acc.css";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

function Create() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const create = async (e) => {
  e.preventDefault();
  setError("");

  if (password !== confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  let firebaseUser = null;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    firebaseUser = userCredential.user;

    // Force token refresh to ensure email claim is populated
    const token = await firebaseUser.getIdToken(true); // 👈 true = force refresh

    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ role }) // email comes from verified token on backend
    });

    if (!response.ok) {
      const errData = await response.json(); // 👈 actually read the error
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
    <div className="create-container">
      <form className="create-box" onSubmit={create}>
        <h2>Create Account</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

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

        {/* ROLE SELECT */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="user">Applicant</option>
          <option value="provider">Provider</option>
        </select>

        <button type="submit">Register</button>

        {/* ERROR MESSAGE */}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <p style={{ color: "white" }}>
          Already have an account?{" "}
          <span className="login-link" onClick={() => navigate("/")}>
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

export default Create;