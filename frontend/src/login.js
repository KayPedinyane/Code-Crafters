import { useState, useEffect } from "react";
import "./login.css";
import { auth, googleProvider } from "./firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingGoogleData, setPendingGoogleData] = useState(null);
  const navigate = useNavigate();

  const postLoginFlow = async (firebaseUser) => {
    try {
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
        setLoading(false);
        return;
      }

      const data = await loginRes.json();

      const profileRes = await fetch(`${API_URL}/api/user/${firebaseUser.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = profileRes.ok ? await profileRes.json() : {};

      localStorage.setItem(
        "user",
        JSON.stringify({
          uid: firebaseUser.uid,
          id: profileData.id || data.id,
          email: profileData.email || firebaseUser.email,
          role: data.role,
          name:
            profileData.contact_person ||
            profileData.company_name ||
            firebaseUser.email,
          company_name: profileData.company_name || "",
          contact_person: profileData.contact_person || "",
        })
      );

      const role = data.role;
      if (role === "admin") navigate("/admin");
      else if (role === "user") navigate("/applicant");
      else if (role === "provider") navigate("/provider");
      else {
        setError("Unknown user role: " + role);
        setLoading(false);
      }
    } catch (err) {
      console.error("postLoginFlow error:", err);
      setError(err.message || "Login flow failed");
      setLoading(false);
    }
  };

  //  DEFINED BEFORE handleGoogleLogin
  const handleGoogleUser = async (firebaseUser) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL;
      const token = await firebaseUser.getIdToken(true);

      const loginRes = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: firebaseUser.email }),
      });

      if (loginRes.ok) {
        await postLoginFlow(firebaseUser);
      } else if (loginRes.status === 404) {
        setPendingGoogleData({ firebaseUser, token });
        setShowRoleModal(true);
        setLoading(false);
      } else {
        const err = await loginRes.json();
        setError(err.error || "Login failed");
        setLoading(false);
      }
    } catch (err) {
      console.error("handleGoogleUser error:", err);
      setError(err.message || "Google login failed");
      setLoading(false);
    }
  };

 
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      
      setLoading(false);
      unsubscribe();
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (!userCredential.user.emailVerified) {
        setError("Please verify your email before logging in.");
        setLoading(false);
        return;
      }
      await postLoginFlow(userCredential.user);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

 
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await handleGoogleUser(result.user);
    } catch (err) {
      if (err.code === "auth/popup-blocked") {
        setError("Popup blocked — please allow popups for this site.");
      } else if (err.code === "auth/cancelled-popup-request") {
        // user closed popup — do nothing
      } else {
        setError(err.message || "Google login failed");
      }
      setLoading(false);
    }
  };

  const handleRoleSelect = async (role) => {
    setShowRoleModal(false);
    setError("");
    setLoading(true);
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
        setLoading(false);
        return;
      }

      await postLoginFlow(firebaseUser);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to complete sign up");
      setLoading(false);
    } finally {
      setPendingGoogleData(null);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "white",
          fontSize: "18px",
          backgroundColor: "#1a1a2e",
        }}
      >
        Signing you in...
      </div>
    );
  }

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

      {/* Divider */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        margin: "12px 0",
      }}>
        <hr style={{ flex: 1, borderColor: "rgba(255,255,255,0.3)" }} />
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>or</span>
        <hr style={{ flex: 1, borderColor: "rgba(255,255,255,0.3)" }} />
      </div>

      {/* Google Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="auth-button auth-google"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          width: "100%",
          padding: "10px",
          backgroundColor: "white",
          color: "#444",
          border: "1px solid #ddd",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "500",
          fontSize: "14px",
        }}
      >
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google"
          style={{ width: "18px", height: "18px" }}
        />
        Continue with Google
      </button>

      <p style={{ color: "white", marginTop: "10px" }}>
        Don't have an account?{" "}
        <span
          onClick={() => navigate("/create")}
          style={{ cursor: "pointer", color: "lightblue" }}
        >
          Create Account
        </span>
      </p>
      <p style={{ color: "white" }}>
        <span
          onClick={() => navigate("/forgot")}
          style={{ cursor: "pointer", color: "lightblue" }}
        >
          Forgot Password?
        </span>
      </p>
    
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>

    {showRoleModal && (
      <div
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          <h3>Select your role to continue</h3>
          <button
            onClick={() => handleRoleSelect("user")}
            style={{ margin: "10px", padding: "10px 20px" }}
          >
            Applicant
          </button>
          <button
            onClick={() => handleRoleSelect("provider")}
            style={{ margin: "10px", padding: "10px 20px" }}
          >
            Provider
          </button>
        </div>
      </div>
    )}
  </div>
);
}

export default Login;
