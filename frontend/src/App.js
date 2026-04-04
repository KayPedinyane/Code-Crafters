import { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch('https://crafters-backend-fbbrctfrdsegcqdj.southafricanorth-01.azurewebsites.net/')
      .then(res => res.text())
      .then(data => setStatus(data))
      .catch(err => setStatus('Backend not reachable'));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Backend says: {status}</p>
      </header>
    </div>
  );
}

export default App;