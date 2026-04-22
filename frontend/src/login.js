import { useState } from "react";
import "./login.css";
import { auth, googleProvider } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { signInWithPopup } from "firebase/auth";
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
 const postLoginFlow = async (firebaseUser) => {
  const token = await firebaseUser.getIdToken();
  localStorage.setItem("token", token);

  const API_URL = process.env.REACT_APP_API_URL;

  const response = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      email: firebaseUser.email,
    }),
  });

  const data = await response.json();

  const uid = firebaseUser.uid;

  const profileRes = await fetch(`${API_URL}/api/user/${uid}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const profileData = await profileRes.json();

  localStorage.setItem(
    "user",
    JSON.stringify({
      uid,
      id: profileData.id || data.id,
      email: profileData.email || firebaseUser.email,
      role: profileData.role || data.role,
      name:
        profileData.contact_person ||
        profileData.company_name ||
        firebaseUser.email,
      company_name: profileData.company_name || "",
      contact_person: profileData.contact_person || "",
    })
  );

  if (data.role === "admin") {
    navigate("/admin");
  } else if (data.role === "user") {
    navigate("/applicant");
  } else if (data.role === "provider") {
    navigate("/provider");
  } else {
    setError("Unknown user role");
  }
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

    if (!userCredential.user.emailVerified) {
      setError("Please verify your email before logging in.");
      return;
    }

    await postLoginFlow(userCredential.user);

  } catch (err) {
    setError(err.message);
  }
};
const signin_google = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    console.log("Google user:", user);

    const token = await user.getIdToken();
    localStorage.setItem("token", token);

    const API_URL = process.env.REACT_APP_API_URL;

   
    const res = await fetch(`${API_URL}/api/user/${user.uid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

   
    if (!res.ok) {
     
      navigate("/create");
      return;
    }

    const profileData = await res.json();

    
    await postLoginFlow(user);

  } catch (error) {
    console.error("Google sign-in error:", error);
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
        <button onClick={signin_google}>
          Sign in with Google
        </button>
        <p style={{ color: "white", marginTop: "10px", whiteSpace: "nowrap" }}>
          Don't have an account?{" "}
          <span
            className="new_acc"
            onClick={handle_newacc}
            style={{ cursor: "pointer", color: "lightblue" }}
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