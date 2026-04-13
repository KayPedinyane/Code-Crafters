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

      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log("Backend response:", data);
      if (data.role === "admin") {
      
        const response = await fetch("http://localhost:8080/admin", {
        method: "GET",
        headers: {
        Authorization: `Bearer ${token}`
        }
        });

      const adminData = await response.json();
      console.log(adminData);
      navigate("/AdminDashBoard");
    } 
    
    else if (data.role === "user") {
      navigate("/ApplicantHome");
    } 
    
    else if(data.role === "provider") {
        navigate("./src/ProviderHomePage");
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