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
        <p>
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
  );
}

export default App;
