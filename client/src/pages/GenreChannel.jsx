import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { profileService } from '../services/profileService';
import GenreChannel from '../components/GenreChannel';
import '../styles/GenreChannel.css';

const GenreChannelPage = () => {
  const { genre } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState(null);
  const dropdownRef = useRef(null);

  const [userData, setUserData] = useState({
    username: user?.username || 'User Name'
  });

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
    setShowProfileDropdown(false);
    navigate('/');
  };

  const handleUploadClick = () => {
    navigate('/upload');
  };

  const handleExploreClick = () => {
    navigate('/explore');
  };

  // const handleDraftsClick = () => {
  //   navigate('/drafts');
  // };

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
          {/* <div className="genre-icon drafts" title="Drafts" onClick={handleDraftsClick}></div> */}
          <div className="genre-icon bell" title="Notifications"></div>
          <div className="genre-profile-dropdown" ref={dropdownRef}>
            <button onClick={handleProfileClick} className="genre-profile-btn">
              {userProfilePic ? (
                <img
                  src={userProfilePic}
                  alt="Profile Picture"
                  className="genre-profile-pic"
                />
              ) : (
                <div className="genre-profile-pic-placeholder">Profile</div>
              )}
            </button>
            {showProfileDropdown && (
              <div className="genre-dropdown-menu">
                <div className="genre-dropdown-username">
                  {userData.username}
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
                  onClick={() => handleDropdownItemClick('/friends')}
                  className="genre-dropdown-item"
                >
                  Friends
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
        username={userData.username}
        userId={user?.id || 'temp-user-id'}
      />
    </div>
  );
};

export default GenreChannelPage;
