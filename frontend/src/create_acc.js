  import { useState } from "react";
import "./create_acc.css";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "./firebase";
//import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
function Create(){

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const Navigate = useNavigate();

    const create = async (e) =>{
         e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
    /* await setDoc(doc(db, "users", userCredential.user.uid), {
        email: email,
        role: role,          
      });*/
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      alert("Account created! A verification email has been sent. Please check your inbox.");
      console.log("User created:", userCredential.user);
    Navigate("/");
    } catch (err) {
      setError(err.message);
    }
    };
return(
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
      {/*  <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="">Select Role</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
        </select>*/}
        <button type="submit">Register</button>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <p style={{ color: "white" }}>
          Already have an account?{" "}
          <span className="login-link" onClick={() => Navigate("/")}>
            Login
          </span>
        </p>
      </form>
    </div>
);
}
export default Create;