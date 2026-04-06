import logo from './logo.svg';
import './App.css';
import Login from "./login";
import React from "react";
import FirebaseTest from "./firebasetest";
function App() {
   return (
    <div className="App">
      <FirebaseTest />
    </div>
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
