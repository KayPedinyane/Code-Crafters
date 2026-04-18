import { useState } from "react";
import "./login.css";
import { auth } from './firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      
      const API_URL = "https://code-crafters-t8dp.onrender.com"
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email: userCredential.user.email })
      });

      const data = await response.json();
      console.log("Backend response:", data);

      localStorage.setItem("user", JSON.stringify({
        email: userCredential.user.email,
        uid: userCredential.user.uid,
        id: data.id,
        role: data.role,
        name: data.email,
    }));

      if (data.role === "admin") {
      navigate("/admin");
    } 
    
    else if (data.role === "user") {
      navigate("/applicant");
    } 
    
    else if(data.role === "provider") {
      navigate("/provider")
    }
    

  }
    catch (err) {
      setError(err.message);
    }
  };

  const forgot_pword = () => {
    try {
      navigate("/forgot_p");
    } catch (err) {
      console.error("Navigation error:", err);
    }
  };

  const handle_newacc = () => {
    try {
      navigate("/create-account");
    } catch (err) {
      console.error("Navigation error:", err);
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>

        {error && <p style={{ color: 'red' }}>{error}</p>}

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