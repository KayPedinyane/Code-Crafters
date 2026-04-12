import { useState } from "react";
import "./login.css";   
import { auth } from './firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import { Navigate, useNavigate } from "react-router-dom";


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const Navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken(); 
     
      console.log('Firebase Token:', token);
      //got token from firebase ,yanong backend(database)
      
      //->checkar type of use 
      //-> fetch type of user from db,
      //depending on ans abv ->Navigate(to specific page depending on type of user);
    } 
    catch (err) {
      setError(err.message);
    }
  }
  const forgot_pword = () =>{
    try{
      Navigate("./forgot_p");
    }
    catch (err) {
    console.error("Navigation error:", err);
  }
  } 

  const handle_newacc = () =>{
     try{
      Navigate("./create-account");
    }
    catch (err) {
    console.error("Navigation error:", err);
  }
  }

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin} >
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
        {error && <p style={{color:'red'}}>{error}</p>}


        <button type ="button" onClick={forgot_pword}>
          Forgot password
          </button>

           <p>
          Don't have an account?{' '}
          <span className="new_acc" onClick={handle_newacc}
          >
            Create Account
          </span>
        </p>
      </form>
   
    </div>

   
  );
}

export default Login;