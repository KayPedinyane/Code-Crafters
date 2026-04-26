import { useState } from "react";
import "./login.css";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handle_newacc = () => {
    navigate("/create");
  };

  const handle_forgot = () => {
    navigate("/forgot");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // OPTIONAL (recommended): check email verification
      if (!userCredential.user.emailVerified) {
        setError("Please verify your email before logging in.");
        return;
      }

      const token = await userCredential.user.getIdToken();
      localStorage.setItem("token", token);

      const API_URL = process.env.REACT_APP_API_URL;

      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: userCredential.user.email,
        }),
      });

      const data = await response.json();

      const uid = userCredential.user.uid;
      const profileRes = await fetch(`${API_URL}/api/user/${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();

      localStorage.setItem("user", JSON.stringify({
        uid,
        id:             profileData.id             || data.id,
        email:          profileData.email          || userCredential.user.email,
        role:           profileData.role           || data.role,
        name:           profileData.contact_person || profileData.company_name || userCredential.user.email,
        company_name:   profileData.company_name   || "",
        contact_person: profileData.contact_person || "",
      }));

      if (data.role === "admin") {
        navigate("/admin");
      } else if (data.role === "user") {
        navigate("/applicant");
      } else if (data.role === "provider") {
        navigate("/provider");
      } else {
        setError("Unknown user role");
      }

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
        <h2 style={{ color: "white" }}>Login</h2>

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

        <button type="submit">Login</button>

        <p style={{ color: "white", marginTop: "10px" }}>
          Don't have an account?{" "}
          <span
            className="new_acc"
            onClick={handle_newacc}
            style={{ cursor: "pointer", color: "blue" }}
          >
            Create Account
          </span>
        </p>

        <p style={{ color: "white" }}>
          <span
            onClick={handle_forgot}
            style={{ cursor: "pointer", color: "lightblue" }}
          >
            Forgot Password?
          </span>
        </p>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}

export default Login;