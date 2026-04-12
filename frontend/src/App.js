import logo from './logo.svg';
import './App.css';
import Login from "./login";
import React from "react";
import Create from "./create_acc";
import FirebaseTest from "./firebasetest";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Forgot from "./forgot";
function App() {
  
  
  

   return (
     <Router>
      <Routes>
        <Route path="/" element={<Login />} />   
        <Route path="/create-account" element={<Create />} />
        <Route path ="/forgot_p" element = {<Forgot/>}/>
      </Routes>
    </Router>
  );


    /*<div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          <h1>Hello World</h1>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>

  );*/
}

export default App;
