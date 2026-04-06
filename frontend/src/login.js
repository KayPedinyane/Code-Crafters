import { useState } from "react";
import "./login.css";   
import { auth } from './firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import { Navigate, useNavigate } from "react-router-dom";


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken(); 
     
      console.log('Firebase Token:', token);
      //got token from firebase ,yanong backend(database)
      //-> fetch type of user from db,
      //->checkar type of use 
      //depending on ans abv ->Navigate(to specific page depending on type of user);
    } 
    catch (err) {
      setError(err.message);
    }
  }
  const forgot_pword = () =>{
    try{
      //Navigate(eya to forgot pword page)
    }
    catch (err) {
    console.error("Navigation error:", err);
  }
  } 

  const handle_newacc = () =>{
     try{
      //Navigate(eya to create accouunt page )
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