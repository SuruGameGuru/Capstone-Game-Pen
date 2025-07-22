// Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// import './Navbar.css';

const Navbar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleChange = (event) => {
    setQuery(event.target.value);
    if (onSearch) {
      onSearch(event.target.value);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo">
            GamePen
          </Link>
        </div>
        
        <div className="navbar-search">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search games, artists, developers..."
              value={query}
              onChange={handleChange}
              className="search-input"
            />
            <button className="search-button">
              <span className="search-icon">🔍</span>
            </button>
          </div>
        </div>

        <div className="navbar-menu">
          <Link to="/explore" className="nav-link">Explore</Link>
          <Link to="/upload" className="nav-link">Upload</Link>
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/signup" className="nav-link signup-btn">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
