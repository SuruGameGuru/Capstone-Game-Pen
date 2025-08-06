import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { videoService } from '../services/videoService';
import '../styles/Upload.css';

const MyGames = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  const [userData, setUserData] = useState({
    username: user?.username || 'User Name'
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

  // Fetch user's videos on component mount
  useEffect(() => {
    const fetchUserVideos = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const videoData = await videoService.getUserVideos(user.id, false); // Get all videos (public and private)
        setVideos(videoData);
      } catch (error) {
        console.error('Error fetching user videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserVideos();
  }, [user?.id]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleUploadClick = (video) => {
    // Navigate to video display page
    navigate(`/display/video/${video.id}`);
  };

  const handleNewUpload = () => {
    // Navigate to upload page
    navigate('/upload');
  };

  const filteredVideos = videos.filter(video =>
    video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.genre?.toLowerCase().includes(searchTerm.toLowerCase())
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
                {/* <button 
                  onClick={() => handleDropdownItemClick('/drafts')}
                  className="upload-dropdown-item"
                >
                  My Drafts
                </button> */}
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
          <h2 className="upload-section-header">Game Demos</h2>
          <div className="upload-row">
            {loading ? (
              <div className="upload-loading">Loading your game demos...</div>
            ) : filteredVideos.map((video) => (
              <div
                key={video.id}
                className="upload-box"
                onClick={() => handleUploadClick(video)}
              >
                <div className="upload-box-icon">🎮</div>
                <h3 className="upload-box-title">{video.description || 'Untitled Game Demo'}</h3>
                <span className="upload-box-type">Game Demo</span>
                <p className="upload-box-description">{video.genre || 'No genre'}</p>
                <button className="upload-action-btn">View</button>
              </div>
            ))}
            {/* Add New Game Box */}
            <div
              className="upload-box"
              onClick={handleNewUpload}
            >
              <div className="upload-box-icon">➕</div>
              <h3 className="upload-box-title">Add New Game Demo</h3>
              <span className="upload-box-type">Game Demo</span>
              <p className="upload-box-description">Upload a new game demo video</p>
              <button className="upload-action-btn">Create</button>
            </div>
          </div>
          {/* Empty State */}
          {filteredVideos.length === 0 && !loading && (
            <div className="upload-empty">
              <div className="upload-empty-icon">🎮</div>
              <h2 className="upload-empty-title">No Game Demos Found</h2>
              <p className="upload-empty-text">
                {searchTerm ? 'Try adjusting your search terms or' : ''} Upload your first game demo!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyGames; 