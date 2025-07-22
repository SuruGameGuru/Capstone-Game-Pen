import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [userData, setUserData] = useState({
    username: 'User Name',
    profilePic: null
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEditProfile = () => {
    // Handle edit profile logic here
    console.log('Edit profile clicked');
  };

  const handleDraftsClick = () => {
    navigate('/drafts');
  };

  const handleUploadClick = () => {
    navigate('/upload');
  };

  const handleExploreClick = () => {
    navigate('/explore');
  };

  return (
    <div className="profile-page">
      {/* Fixed Top Navigation Bar */}
      <header className="profile-header">
        <div className="profile-logo-title">
          <span className="game">GAME</span>
          <span className="pen">PEN</span>
        </div>
        
        <div className="profile-search">
          <input
            type="text"
            placeholder="Search Users..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="profile-icons">
          <div className="profile-icon upload" title="Upload" onClick={handleUploadClick}></div>
          <div className="profile-icon file" title="Explore" onClick={handleExploreClick}></div>
          <div className="profile-icon drafts" title="Drafts" onClick={handleDraftsClick}></div>
          <div className="profile-icon bell" title="Notifications"></div>
          <div className="profile-icon profile" title="Profile"></div>
        </div>
      </header>

      {/* Profile Banner Section */}
      <section className="profile-banner">
        <div className="profile-banner-text">
          Profile Banner
        </div>
        <button className="profile-edit-button" onClick={handleEditProfile}>
          EDIT PROFILE
        </button>
      </section>

      {/* User Info Bar */}
      <section className="profile-user-info">
        <div className="profile-pic">
          Profile pic
        </div>
        <div className="profile-username">
          {userData.username}
        </div>
      </section>

      {/* User Content Panel */}
      <main className="profile-content">
        <div className="profile-content-box">
          <h2 className="profile-content-title">
            User Game Demos
          </h2>
          <div className="profile-content-placeholder">
            Your game demos will appear here
          </div>
        </div>
        
        <div className="profile-content-box">
          <h2 className="profile-content-title">
            User Art file
          </h2>
          <div className="profile-content-placeholder">
            Your art files will appear here
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
