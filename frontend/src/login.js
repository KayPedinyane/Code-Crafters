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

      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

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

        navigate("./pages/AdminDashBoard");
      } else if (data.role === "user") {
        navigate("./pages/ApplicantHome");
      } else if (data.role === "provider") {
        navigate("/ProviderHomePage");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const forgot_pword = () => {
    navigate("/forgot_p");
  };

  const handle_newacc = () => {
    navigate("/create-account");
  };

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

        <button type="button" onClick={forgot_pword}>
          Forgot password
        </button>

        <p>
          Don't have an account?{" "}
          <span className="new_acc" onClick={handle_newacc}>
            Create Account
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login;