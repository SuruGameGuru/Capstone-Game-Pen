import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { videoService } from '../services/videoService';
import { profileService } from '../services/profileService';
import '../styles/Upload.css';

const MyGames = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [userProfilePic, setUserProfilePic] = useState(null);
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

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setEditDescription(video.description || '');
    setShowPopup(true);
  };

  const handleEditDescription = async () => {
    if (!selectedVideo || !editDescription.trim()) return;
    
    try {
      await videoService.updateVideo(selectedVideo.id, { description: editDescription });
      
      // Update the video in the local state
      setVideos(prevVideos => 
        prevVideos.map(video => 
          video.id === selectedVideo.id 
            ? { ...video, description: editDescription }
            : video
        )
      );
      
      setShowPopup(false);
      setSelectedVideo(null);
      setEditDescription('');
    } catch (error) {
      console.error('Error updating video description:', error);
      alert('Failed to update video description. Please try again.');
    }
  };

  const handleDeleteVideo = async () => {
    if (!selectedVideo) return;
    
    if (!window.confirm('Are you sure you want to delete this game demo? This action cannot be undone.')) {
      return;
    }
    
    try {
      await videoService.deleteVideo(selectedVideo.id);
      
      // Remove the video from the local state
      setVideos(prevVideos => 
        prevVideos.filter(video => video.id !== selectedVideo.id)
      );
      
      setShowPopup(false);
      setSelectedVideo(null);
      setEditDescription('');
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video. Please try again.');
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedVideo(null);
    setEditDescription('');
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
              {userProfilePic ? (
                <img
                  src={userProfilePic}
                  alt="Profile Picture"
                  className="upload-profile-pic"
                />
              ) : (
                <div className="upload-profile-pic-placeholder">Profile</div>
              )}
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
                onClick={() => handleVideoClick(video)}
              >
                {video.url ? (
                  <video
                    src={video.url}
                    className="upload-box-thumbnail"
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
                  <div className="upload-box-icon">🎮</div>
                )}
                <h3 className="upload-box-title">{video.description || 'Untitled Game Demo'}</h3>
                <span className="upload-box-type">Game Demo</span>
                <p className="upload-box-description">{video.genre || 'No genre'}</p>
                <button className="upload-action-btn">Edit</button>
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

      {/* Video Action Popup */}
      {showPopup && selectedVideo && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>Edit Game Demo</h3>
              <button className="popup-close" onClick={closePopup}>×</button>
            </div>
            
            <div className="popup-body">
              {selectedVideo.url && (
                <div className="popup-image">
                  <video 
                    src={selectedVideo.url} 
                    controls 
                    style={{ width: '100%', maxHeight: '200px' }}
                  />
                </div>
              )}
              
              <div className="popup-info">
                <div className="popup-section">
                  <h4>Description</h4>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Enter video description..."
                    rows="3"
                  />
                </div>
                
                <div className="popup-section">
                  <h4>Genre</h4>
                  <p>{selectedVideo.genre || 'No genre specified'}</p>
                </div>
              </div>
            </div>
            
            <div className="popup-actions">
              <button 
                className="popup-btn popup-btn-primary"
                onClick={handleEditDescription}
              >
                Save Changes
              </button>
              <button 
                className="popup-btn popup-btn-secondary"
                onClick={closePopup}
              >
                Cancel
              </button>
              <button 
                className="popup-btn popup-btn-danger"
                onClick={handleDeleteVideo}
              >
                Delete Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGames; 