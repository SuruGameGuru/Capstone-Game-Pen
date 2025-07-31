import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Upload.css';

const MyGames = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [userData, setUserData] = useState({
    username: 'User Name'
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleDropdownItemClick = (route) => {
    setShowProfileDropdown(false);
    navigate(route);
  };

  const handleLogout = () => {
    setShowProfileDropdown(false);
    navigate('/');
  };

  // Replace with real user-uploaded games from API
  const [gameContent] = useState([
    { id: 1, title: 'Space Adventure Game', icon: '🎮', description: '2D platformer with unique gravity mechanics' },
    { id: 2, title: 'Puzzle Game Demo', icon: '🧩', description: 'Brain-teasing puzzle mechanics' },
    // ...more user games
  ]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleUploadClick = (content) => {
    // Handle upload click - would open upload modal or navigate to upload form
    console.log('Upload clicked for:', content);
  };

  const handleNewUpload = () => {
    // Handle new upload creation
    console.log('Create new game upload');
  };

  const filteredGameContent = gameContent.filter(content =>
    content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="upload-page">
      <header className="upload-header">
        <Link to="/" className="upload-logo-title">
          <span className="game">GAME</span>
          <span className="pen">PEN</span>
        </Link>
        <div className="upload-search">
          <input
            type="text"
            placeholder="Search my games..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <nav className="upload-navbar">
          <Link to="/">Home</Link>
          <Link to="/explore">Explore</Link>
          <div className="upload-profile-dropdown" ref={dropdownRef}>
            <button onClick={handleProfileClick} className="upload-profile-btn">
              Profile ▼
            </button>
            {showProfileDropdown && (
              <div className="upload-dropdown-menu">
                <div className="upload-dropdown-username">
                  {userData.username}
                </div>
                <button 
                  onClick={() => handleDropdownItemClick('/profile')}
                  className="upload-dropdown-item"
                >
                  My Profile
                </button>
                <button 
                  onClick={() => handleDropdownItemClick('/upload')}
                  className="upload-dropdown-item"
                >
                  Upload Content
                </button>
                <button 
                  onClick={() => handleDropdownItemClick('/drafts')}
                  className="upload-dropdown-item"
                >
                  My Drafts
                </button>
                <div className="upload-dropdown-divider"></div>
                <button 
                  onClick={handleLogout}
                  className="upload-dropdown-item upload-dropdown-logout"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>
      <main className="upload-main">
        <h1 className="upload-title">My Uploaded Games</h1>
        <div className="upload-container">
          <h2 className="upload-section-header">Games</h2>
          <div className="upload-row">
            {filteredGameContent.map((content) => (
              <div
                key={content.id}
                className="upload-box"
                onClick={() => handleUploadClick(content)}
              >
                <div className="upload-box-icon">{content.icon}</div>
                <h3 className="upload-box-title">{content.title}</h3>
                <span className="upload-box-type">Game</span>
                <p className="upload-box-description">{content.description}</p>
                <button className="upload-action-btn">Upload</button>
              </div>
            ))}
            {/* Add New Game Box */}
            <div
              className="upload-box"
              onClick={handleNewUpload}
            >
              <div className="upload-box-icon">➕</div>
              <h3 className="upload-box-title">Add New Game</h3>
              <span className="upload-box-type">Game</span>
              <p className="upload-box-description">Upload a new game project</p>
              <button className="upload-action-btn">Create</button>
            </div>
          </div>
          {/* Empty State */}
          {filteredGameContent.length === 0 && searchTerm && (
            <div className="upload-empty">
              <div className="upload-empty-icon">🔍</div>
              <h2 className="upload-empty-title">No Games Found</h2>
              <p className="upload-empty-text">
                Try adjusting your search terms or create a new game.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyGames; 