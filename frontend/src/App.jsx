import { useNavigate } from 'react-router-dom';
import './App.css'

function App() {
  const navigate = useNavigate();

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">MoodFlix</div>
        <div className="nav-links">
          <a href="#" className="active">Home</a>
          <a href="#">Movies</a>
          <a href="#">TV Shows</a>
          <a href="#">My List</a>
        </div>
        <button className="get-started-btn" onClick={() => navigate('/login')}>
          Login/Sign-Up
        </button>
        
      </nav>

      <header className="hero">
        <div className="hero-content">
          <h1>How are you feeling today?</h1>
          <button className="get-btn" onClick={() => navigate('/mood')}>
          Get-Started
        </button>
        </div>
      </header>
    </div>
  )
}

export default App
