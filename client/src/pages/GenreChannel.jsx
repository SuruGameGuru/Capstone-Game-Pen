import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import GenreChannel from '../components/GenreChannel';
import '../styles/GenreChannel.css';

const GenreChannelPage = () => {
  const { genre } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userInfo, setUserInfo] = useState({
    username: 'Anonymous',
    userId: 'temp-user-id'
  });

  useEffect(() => {
    // Get user info from localStorage or context
    const token = localStorage.getItem('token');
    if (token) {
      // Decode JWT token to get user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserInfo({
          username: payload.username || 'Anonymous',
          userId: payload.id || 'temp-user-id'
        });
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.genre-profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleDropdownItemClick = (route) => {
    setShowProfileDropdown(false);
    navigate(route);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleUploadClick = () => {
    navigate('/upload');
  };

  const handleExploreClick = () => {
    navigate('/explore');
  };

  const handleDraftsClick = () => {
    navigate('/drafts');
  };

  if (!genre) {
    return <div className="error-message">No genre specified</div>;
  }

  return (
    <div className="genre-channel-page">
      {/* Fixed Top Navigation Bar */}
      <header className="genre-header">
        <Link to="/" className="genre-logo-title">
          <span className="game">GAME</span>
          <span className="pen">PEN</span>
        </Link>
        
        <div className="genre-search">
          <input
            type="text"
            placeholder="Search Users..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="genre-icons">
          <div className="genre-icon upload" title="Upload" onClick={handleUploadClick}></div>
          <div className="genre-icon file" title="Explore" onClick={handleExploreClick}></div>
          <div className="genre-icon drafts" title="Drafts" onClick={handleDraftsClick}></div>
          <div className="genre-icon bell" title="Notifications"></div>
          <div className="genre-profile-dropdown">
            <button onClick={handleProfileClick} className="genre-profile-btn">
              Profile ▼
            </button>
            {showProfileDropdown && (
              <div className="genre-dropdown-menu">
                <div className="genre-dropdown-username">
                  {userInfo.username}
                </div>
                <button 
                  onClick={() => handleDropdownItemClick('/profile')}
                  className="genre-dropdown-item"
                >
                  My Profile
                </button>
                <button 
                  onClick={() => handleDropdownItemClick('/upload')}
                  className="genre-dropdown-item"
                >
                  Upload Content
                </button>
                <button 
                  onClick={() => handleDropdownItemClick('/drafts')}
                  className="genre-dropdown-item"
                >
                  My Drafts
                </button>
                <div className="genre-dropdown-divider"></div>
                <button 
                  onClick={handleLogout}
                  className="genre-dropdown-item genre-dropdown-logout"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Chat Component */}
      <GenreChannel 
        genre={genre}
        username={userInfo.username}
        userId={userInfo.userId}
      />
    </div>
  );
};

export default GenreChannelPage;
