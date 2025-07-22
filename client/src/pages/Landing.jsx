import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Landing.css';

const Landing = () => {
  const genres = [
    'Action',
    'Adventure',
    'RPG',
    'Strategy',
    'Puzzle',
    'Racing',
    'Sports',
    'Simulation',
    'Horror',
    'Comedy',
    'Fantasy',
    'Sci-Fi'
  ];

  const handleGenreClick = (genre) => {
    console.log('Genre clicked:', genre);
    // In a real app, this would navigate to the genre page or filter content
  };

  return (
  <div className="landing-page">
    {/* Fixed Top Navigation Bar */}
    <header className="landing-header">
      <div className="landing-header-inner">
        <div className="landing-logo-title">
          <span className="game">GAME</span>
          <span className="pen">PEN</span>
        </div>
        
        <div className="landing-search">
          <input type="text" placeholder="Search..." />
        </div>
        
        <nav className="landing-navbar">
          <Link to="/login">Login</Link>
          <span>/</span>
          <Link to="/signup">Sign Up</Link>
        </nav>
      </div>
    </header>

    {/* Main Content Layout */}
    <div className="landing-main">
      {/* Left Sidebar */}
      <aside className="landing-sidebar">
        <div className="landing-genres-header">
          Genres
        </div>
        <div className="landing-genres-list">
          {genres.map((genre, index) => (
            <button
              key={index}
              className="landing-genre-block"
              onClick={() => handleGenreClick(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="landing-content">
        <div className="landing-content-box landing-game-demos">
          Game Demos
        </div>
        <div className="landing-content-box landing-art-section">
          ART
        </div>
      </main>
    </div>
  </div>
  );
};

export default Landing;
