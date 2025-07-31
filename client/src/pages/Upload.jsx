import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ImageUpload from '../components/ImageUpload';
import '../styles/Upload.css';
import '../styles/Profile.css'; // For profile-route-btn
import '../styles/ImageUpload.css';

const Upload = () => {
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState('art');
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

  const handleNewUpload = (type) => {
    setUploadType(type);
    setShowUploadModal(true);
  };

  const handleUploadSuccess = (data) => {
    setShowUploadModal(false);
    alert('Upload successful!');
    // You could refresh the content list here
  };

  const handleUploadError = (error) => {
    alert(`Upload failed: ${error}`);
  };

  return (
    <div className="upload-page">
      {/* Fixed Top Navigation Bar */}
      <header className="upload-header">
        <Link to="/" className="upload-logo-title">
          <span className="game">GAME</span>
          <span className="pen">PEN</span>
        </Link>
        
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

      {/* Main Content */}
      <main className="upload-main">
        <h1 className="upload-title">Upload Content</h1>
        
        <div className="upload-container">
          {/* Games Section */}
          <h2 className="upload-section-header">Games</h2>
          <div className="upload-row">
            {/* Add New Game Box */}
            <div 
              className="upload-box"
              onClick={() => handleNewUpload('game')}
            >
              <div className="upload-box-icon">➕</div>
              <h3 className="upload-box-title">Add New Game</h3>
              <span className="upload-box-type">Game</span>
              <p className="upload-box-description">Upload a new game project</p>
              <button className="upload-action-btn">Create</button>
            </div>
          </div>

          {/* Art Section */}
          <h2 className="upload-section-header">Art</h2>
          <div className="upload-row">
            {/* Add New Art Box */}
            <div 
              className="upload-box"
              onClick={() => handleNewUpload('art')}
            >
              <div className="upload-box-icon">➕</div>
              <h3 className="upload-box-title">Add New Art</h3>
              <span className="upload-box-type">Art</span>
              <p className="upload-box-description">Upload new artwork</p>
              <button className="upload-action-btn">Create</button>
            </div>
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="upload-modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="upload-modal-header">
              <h2>Upload New {uploadType === 'art' ? 'Art' : 'Game'}</h2>
              <button 
                className="upload-modal-close"
                onClick={() => setShowUploadModal(false)}
              >
                ×
              </button>
            </div>
            <ImageUpload 
              uploadType={uploadType}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
