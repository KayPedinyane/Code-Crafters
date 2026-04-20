import { useState } from "react";
import "./login.css";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
<<<<<<< HEAD

=======
>>>>>>> origin/main
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const token = await userCredential.user.getIdToken();

      // ✅ FIX: SAVE TOKEN
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

<<<<<<< HEAD
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "Login failed");
      }

      if (data.role === "admin") {
        const adminResponse = await fetch("http://localhost:8080/admin", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const adminData = await adminResponse.json();

        if (!adminResponse.ok) {
          throw new Error(adminData?.message || "Admin access denied");
        }

=======
      const data = await response.json();

      if (data.role === "admin") {
>>>>>>> origin/main
        navigate("/admin");
      } else if (data.role === "user") {
        navigate("/applicant");
      } else if (data.role === "provider") {
        navigate("/provider");
      }
    } catch (err) {
      setError(err.message);
    }
  };

<<<<<<< HEAD
  const forgot_pword = () => {
    navigate("/forgot_p");
  };

  const handle_newacc = () => {
    navigate("/create-account");
  };

=======
>>>>>>> origin/main
  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
        <h2>Login</h2>

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

        {error && <p style={{ color: "red" }}>{error}</p>}
<<<<<<< HEAD

        <button type="button" onClick={forgot_pword}>
          Forgot password
        </button>

        <p>
          Don't have an account?{" "}
          <span className="new_acc" onClick={handle_newacc}>
            Create Account
          </span>
        </p>
=======
>>>>>>> origin/main
      </form>
    </div>
  );
}

export default Login;