import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { imageService } from '../services/imageService';
import DominantColorThumbnail from '../components/DominantColorThumbnail';
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
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [latestArtImage, setLatestArtImage] = useState(null);
  const [isLoadingArt, setIsLoadingArt] = useState(true);

  // const isLoggedIn = !!localStorage.getItem('token');
  const isLoggedIn = true; // Temporarily set to true for testing

  const handleLogout = () => {
    // localStorage.removeItem('token');
    setShowProfileDropdown(false);
    navigate('/');
  };

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleDropdownItemClick = (route) => {
    setShowProfileDropdown(false);
    navigate(route);
  };

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

  // Fetch latest art image for thumbnail
  useEffect(() => {
    const fetchLatestArt = async () => {
      try {
        console.log('Landing: Fetching latest art...');
        setIsLoadingArt(true);
        const artImages = await imageService.getLatestArt(1);
        console.log('Landing: Latest art images:', artImages);
        if (artImages.length > 0) {
          console.log('Landing: Setting latest art image:', artImages[0]);
          setLatestArtImage(artImages[0]);
        } else {
          console.log('Landing: No art images found');
        }
      } catch (error) {
        console.error('Error fetching latest art:', error);
      } finally {
        setIsLoadingArt(false);
      }
    };

    fetchLatestArt();
  }, []);

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
          {isLoggedIn ? (
            <>
              <button onClick={handleLogout} className="landing-logout-btn">Logout</button>
              <div className="landing-profile-dropdown" ref={dropdownRef}>
                <button onClick={handleProfileClick} className="landing-profile-btn">
                  Profile ▼
                </button>
                {showProfileDropdown && (
                  <div className="landing-dropdown-menu">
                    <button 
                      onClick={() => handleDropdownItemClick('/profile')}
                      className="landing-dropdown-item"
                    >
                      My Profile
                    </button>
                    <button 
                      onClick={() => handleDropdownItemClick('/upload')}
                      className="landing-dropdown-item"
                    >
                      Upload Content
                    </button>
                    <button 
                      onClick={() => handleDropdownItemClick('/drafts')}
                      className="landing-dropdown-item"
                    >
                      My Drafts
                    </button>
                    <div className="landing-dropdown-divider"></div>
                    <button 
                      onClick={handleLogout}
                      className="landing-dropdown-item landing-dropdown-logout"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <span>/</span>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
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
              onClick={() => navigate(`/genre/${genre}`)}
            >
              {genre}
            </button>
          ))}
        </div>
      </aside>
      {/* Main Content Area */}
      <main className="landing-content">
        <div
          className="landing-content-box landing-game-demos"
          onClick={() => navigate('/explore/games')}
        >
          Game Demos
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 'bold', color: '#000' }}>
            ART
          </div>
          <div
            className="landing-content-box landing-art-section"
            onClick={() => navigate('/explore/art')}
          >
            {isLoadingArt ? (
              <div 
                className="landing-art-thumbnail"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  borderRadius: '1rem', 
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666'
                }}
              >
                Loading...
              </div>
            ) : latestArtImage ? (
              <DominantColorThumbnail 
                imageUrl={latestArtImage.url}
                alt={latestArtImage.description || "Latest Art"}
                className="landing-art-thumbnail"
              />
            ) : (
              <img
                src="https://via.placeholder.com/120x120.png?text=Latest+Art"
                alt="Latest Art Thumbnail"
                className="landing-art-thumbnail"
                style={{ width: '100%', height: '100%', borderRadius: '1rem', objectFit: 'cover' }}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  </div>
  );
};

export default Landing;
