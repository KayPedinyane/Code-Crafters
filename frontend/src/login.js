import { useState } from "react";
import "./login.css";
import { auth, googleProvider } from "./firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingGoogleData, setPendingGoogleData] = useState(null);
  const navigate = useNavigate();

  const postLoginFlow = async (firebaseUser) => {
    const token = await firebaseUser.getIdToken(true);
    localStorage.setItem("token", token);
    const API_URL = process.env.REACT_APP_API_URL;

    const loginRes = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email: firebaseUser.email }),
    });

    if (!loginRes.ok) {
      const err = await loginRes.json();
      setError(err.error || "Login failed");
      return;
    }

    const data = await loginRes.json();

    const profileRes = await fetch(`${API_URL}/api/user/${firebaseUser.uid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const profileData = profileRes.ok ? await profileRes.json() : {};

    localStorage.setItem("user", JSON.stringify({
      uid: firebaseUser.uid,
      id: profileData.id || data.id,
      email: profileData.email || firebaseUser.email,
      role: data.role,
      name: profileData.contact_person || profileData.company_name || firebaseUser.email,
      company_name: profileData.company_name || "",
      contact_person: profileData.contact_person || "",
    }));

    const role = data.role;
    if (role === "admin") navigate("/admin");
    else if (role === "user") navigate("/applicant");
    else if (role === "provider") navigate("/provider");
    else setError("Unknown user role: " + role);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        setError("Please verify your email before logging in.");
        return;
      }
      await postLoginFlow(userCredential.user);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const token = await firebaseUser.getIdToken(true);
      const API_URL = process.env.REACT_APP_API_URL;

      const checkRes = await fetch(`${API_URL}/api/user/${firebaseUser.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (checkRes.ok) {
        await postLoginFlow(firebaseUser);
      } else {
        setPendingGoogleData({ firebaseUser, token });
        setShowRoleModal(true);
      }
    } catch (err) {
      if (err.code === "auth/cancelled-popup-request") return;
      if (err.code === "auth/popup-blocked") {
        setError("Popup blocked — please allow popups for localhost in your browser settings.");
        return;
      }
      console.error(err);
      setError(err.message || "Google login failed");
    }
  };

  const handleRoleSelect = async (role) => {
    setShowRoleModal(false);
    setError("");
    try {
      const { firebaseUser, token } = pendingGoogleData;
      const API_URL = process.env.REACT_APP_API_URL;

      const createRes = await fetch(`${API_URL}/api/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        setError(err.error || "Failed to create account");
        return;
      }

      await postLoginFlow(firebaseUser);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to complete sign up");
    } finally {
      setPendingGoogleData(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedToken = localStorage.getItem("token");
    if (!storedUser || !storedToken) { setError("No user logged in"); return; }
    try {
      setError("");
      const API_URL = process.env.REACT_APP_API_URL;
      const res = await fetch(`${API_URL}/api/user/${storedUser.uid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete account");
      }
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
        <h2 style={{ color: "white" }}>Login</h2>
        <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
        <button
  onClick={handleGoogleLogin}
  className="auth-button auth-google"
>
  <img
    src="https://developers.google.com/identity/images/g-logo.png"
    alt="Google"
  />
  Continue with Google
</button>
        <p style={{ color: "white", marginTop: "10px" }}>
          Don't have an account?{" "}
          <span onClick={() => navigate("/create")} style={{ cursor: "pointer", color: "lightblue" }}>
            Create Account
          </span>
        </p>
        <p style={{ color: "white" }}>
          <span onClick={() => navigate("/forgot")} style={{ cursor: "pointer", color: "lightblue" }}>
            Forgot Password?
          </span>

        </p>
        <button type="button" onClick={handleDelete}
          style={{ backgroundColor: "red", color: "white", padding: "10px", border: "none", borderRadius: "5px" }}>
          Delete Account
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}

export default Login;