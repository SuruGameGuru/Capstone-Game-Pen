import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { imageService } from '../services/imageService';
import { videoService } from '../services/videoService';
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

  const [latestArtImages, setLatestArtImages] = useState([]);
  const [latestGameVideos, setLatestGameVideos] = useState([]);
  const [isLoadingArt, setIsLoadingArt] = useState(true);
  const [isLoadingGames, setIsLoadingGames] = useState(true);

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

  // Fetch latest 6 art images for thumbnail
  useEffect(() => {
    const fetchLatestArt = async () => {
      try {
        console.log('Landing: Fetching latest art...');
        setIsLoadingArt(true);
        const artImages = await imageService.getLatestArt(6);
        console.log('Landing: Latest art images:', artImages);
        if (artImages.length > 0) {
          console.log('Landing: Setting latest art images:', artImages);
          setLatestArtImages(artImages);
        } else {
          console.log('Landing: No art images found');
          setLatestArtImages([]);
        }
      } catch (error) {
        console.error('Error fetching latest art:', error);
        setLatestArtImages([]);
      } finally {
        setIsLoadingArt(false);
      }
    };

    fetchLatestArt();
  }, []);

  // Fetch latest 6 game videos for thumbnail
  useEffect(() => {
    const fetchLatestGames = async () => {
      try {
        console.log('Landing: Fetching latest games...');
        setIsLoadingGames(true);
        const gameVideos = await videoService.getLatestVideos(6);
        console.log('Landing: Latest game videos:', gameVideos);
        if (gameVideos.length > 0) {
          console.log('Landing: Setting latest game videos:', gameVideos);
          setLatestGameVideos(gameVideos);
        } else {
          console.log('Landing: No game videos found');
          setLatestGameVideos([]);
        }
      } catch (error) {
        console.error('Error fetching latest games:', error);
        setLatestGameVideos([]);
      } finally {
        setIsLoadingGames(false);
      }
    };

    fetchLatestGames();
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
                                    {/* <button 
                  onClick={() => handleDropdownItemClick('/drafts')}
                  className="landing-dropdown-item"
                >
                  My Drafts
                </button> */}
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
        {/* Game Demos Glass Button */}
        <div
          className="landing-glass-btn landing-game-demos-btn"
          onClick={() => navigate('/explore/games')}
        >
          <div className="landing-glass-btn-title">
            Game Demos
          </div>
          <div className="landing-thumbnails-scroll-container">
            {isLoadingGames ? (
              <div className="landing-thumbnails-loading">Loading...</div>
            ) : latestGameVideos.length > 0 ? (
              latestGameVideos.map((gameVideo, index) => (
                <button
                  key={gameVideo.id || index}
                  className="landing-thumbnail-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/explore/games');
                  }}
                >
                  <video
                    src={gameVideo.url}
                    className="landing-thumbnail-img"
                    muted
                    preload="metadata"
                    onLoadedData={(e) => {
                      // Seek to 2nd frame (0.1 seconds) for thumbnail
                      e.target.currentTime = 0.1;
                    }}
                    onSeeked={(e) => {
                      // Pause at the 2nd frame
                      e.target.pause();
                    }}
                  />
                </button>
              ))
            ) : (
              <div className="landing-thumbnails-placeholder">
                <img
                  src="https://via.placeholder.com/80x80.png?text=Games"
                  alt="Game Placeholder"
                  className="landing-thumbnail-img"
                />
              </div>
            )}
          </div>
        </div>

        {/* Art Glass Button */}
        <div
          className="landing-glass-btn landing-art-btn"
          onClick={() => navigate('/explore/art')}
        >
          <div className="landing-glass-btn-title">
            ART
          </div>
          <div className="landing-thumbnails-scroll-container">
            {isLoadingArt ? (
              <div className="landing-thumbnails-loading">Loading...</div>
            ) : latestArtImages.length > 0 ? (
              latestArtImages.map((artImage, index) => (
                <button
                  key={artImage.id || index}
                  className="landing-thumbnail-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/explore/art');
                  }}
                >
                  <DominantColorThumbnail 
                    imageUrl={artImage.url}
                    alt={artImage.description || `Art ${index + 1}`}
                    className="landing-thumbnail-img"
                  />
                </button>
              ))
            ) : (
              <div className="landing-thumbnails-placeholder">
                <img
                  src="https://via.placeholder.com/80x80.png?text=Art"
                  alt="Art Placeholder"
                  className="landing-thumbnail-img"
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  </div>
  );
};

export default Landing;
