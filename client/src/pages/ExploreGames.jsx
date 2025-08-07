import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { videoService } from '../services/videoService';
import { profileService } from '../services/profileService';
import '../styles/ExploreGames.css';

const ExploreGames = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState(null);
  const dropdownRef = useRef(null);

  const [userData, setUserData] = useState({
    username: user?.username || 'User Name'
  });

  // Fetch videos on component mount
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const videoData = await videoService.getVideos({ is_public: true, limit: 100 });
        setVideos(videoData);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

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

  // Load user profile picture
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        if (!user) {
          console.log('No user logged in');
          return;
        }

        const userId = user.id;
        console.log('Loading profile for user ID:', userId);

        const profileData = await profileService.getUserProfile(userId);
        console.log('Profile data loaded:', profileData);

        setUserProfilePic(profileData.profilePicture || null);
        setUserData({
          username: profileData.username || user.username || 'User Name'
        });
      } catch (error) {
        console.error('Error loading user profile:', error);
        setUserProfilePic(null);
      }
    };

    loadUserProfile();
  }, [user]);

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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleShowMore = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setDisplayCount(prev => Math.min(prev + 30, filteredVideos.length));
    setIsLoading(false);
  };

  const handleContentClick = (video) => {
    navigate(`/display/video/${video.id}`);
  };

  const filteredVideos = videos.filter(video =>
    video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.genre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const displayedVideos = filteredVideos.slice(0, displayCount);
  const hasMoreContent = displayCount < filteredVideos.length;

  return (
    <div className="explore-page">
      <header className="explore-header">
        <Link to="/" className="explore-logo-title">
          <span className="game">GAME</span>
          <span className="pen">PEN</span>
        </Link>
        <div className="explore-search">
          <input
            type="text"
            placeholder="Search games..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <nav className="explore-navbar">
          <div className="explore-profile-dropdown" ref={dropdownRef}>
            <button onClick={handleProfileClick} className="explore-profile-btn">
              {userProfilePic ? (
                <img
                  src={userProfilePic}
                  alt="Profile Picture"
                  className="explore-profile-pic"
                />
              ) : (
                <div className="explore-profile-pic-placeholder">Profile</div>
              )}
            </button>
            {showProfileDropdown && (
              <div className="explore-dropdown-menu">
                <div className="explore-dropdown-username">
                  {userData.username}
                </div>
                <button 
                  onClick={() => handleDropdownItemClick('/profile')}
                  className="explore-dropdown-item"
                >
                  My Profile
                </button>
                <button 
                  onClick={() => handleDropdownItemClick('/upload')}
                  className="explore-dropdown-item"
                >
                  Upload Content
                </button>
                <button 
                  onClick={() => handleDropdownItemClick('/friends')}
                  className="explore-dropdown-item"
                >
                  Friends
                </button>
                <div className="explore-dropdown-divider"></div>
                <button 
                  onClick={handleLogout}
                  className="explore-dropdown-item explore-dropdown-logout"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>
      <main className="explore-main">
        <h1 className="explore-title">Explore Games</h1>
        <div className="explore-container">
          {loading ? (
            <div className="explore-loading">Loading videos...</div>
          ) : displayedVideos.length > 0 ? (
            <>
              <div className="explore-grid">
                {displayedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="explore-box"
                    onClick={() => handleContentClick(video)}
                  >
                    {video.url ? (
                      <video
                        src={video.url}
                        className="explore-box-thumbnail"
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
                        style={{
                          width: '100%',
                          height: '160px',
                          objectFit: 'cover',
                          borderRadius: '1rem 1rem 0 0',
                          marginBottom: '0.5rem'
                        }}
                      />
                    ) : (
                      <div className="explore-box-icon">🎮</div>
                    )}
                    <h3 className="explore-box-title">{video.description || 'Untitled Game Demo'}</h3>
                    <span className="explore-box-type">Game Demo</span>
                    <p className="explore-box-description">by {video.username}</p>
                    {video.genre && (
                      <span className="explore-box-genre">{video.genre}</span>
                    )}
                  </div>
                ))}
              </div>
              {hasMoreContent && (
                <div className="explore-show-more">
                  <button
                    className="explore-btn"
                    onClick={handleShowMore}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Show More'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="explore-empty">
              <div className="explore-empty-icon">🔍</div>
              <h2 className="explore-empty-title">No Game Demos Found</h2>
              <p className="explore-empty-text">
                Try adjusting your search terms or upload a new game demo.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
export default ExploreGames; 