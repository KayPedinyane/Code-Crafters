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

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await sendEmailVerification(userCredential.user);

      const token = await userCredential.user.getIdToken();



      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/create`, {

        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          email,
          role
        })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to save user to database"
        );
      }

      alert("Account created! Please verify your email.");
      navigate("/");
    } catch (err) {
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

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >

          <option value="user">Applicant</option>


          <option value="provider">Provider</option>
        </select>

        <button type="submit">Register</button>

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