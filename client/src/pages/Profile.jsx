import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { imageService } from '../services/imageService';
import { profileService } from '../services/profileService';
import DominantColorThumbnail from '../components/DominantColorThumbnail';
import ImageCropper from '../components/ImageCropper';
import '../styles/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [isLoadingArt, setIsLoadingArt] = useState(true);
  const [latestArtImage, setLatestArtImage] = useState(null);
  const [showBannerCropper, setShowBannerCropper] = useState(false);
  const [showProfilePicCropper, setShowProfilePicCropper] = useState(false);
  const [tempBannerImage, setTempBannerImage] = useState(null);
  const [tempProfilePicImage, setTempProfilePicImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const dropdownRef = useRef(null);
  const popupRef = useRef(null);

  const [userData, setUserData] = useState({
    username: 'User Name',
    profilePic: null,
    bannerImage: null
  });

  const [editData, setEditData] = useState({
    username: userData.username,
    profilePic: null,
    bannerImage: null
  });

  // Fetch latest art for profile art button thumbnail
  useEffect(() => {
    const fetchLatestArt = async () => {
      try {
        setIsLoadingArt(true);
        const artImages = await imageService.getLatestArt(1);
        if (artImages.length > 0) {
          setLatestArtImage(artImages[0]);
        }
      } catch (error) {
        console.error('Error fetching latest art:', error);
      } finally {
        setIsLoadingArt(false);
      }
    };

    fetchLatestArt();
  }, []);

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // For now, we'll use a hardcoded user ID since auth is disabled
        const userId = 1; // This should come from auth context when enabled
        const profileData = await profileService.getUserProfile(userId);
        
        setUserData({
          username: profileData.username || 'User Name',
          profilePic: profileData.profilePicture || null,
          bannerImage: profileData.bannerImage || null
        });
      } catch (error) {
        console.error('Error loading user profile:', error);
        // Keep default values if loading fails
      }
    };

    loadUserProfile();
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

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on the ImageCropper overlay
      if (event.target.closest('.image-cropper-overlay')) {
        return;
      }
      
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowEditPopup(false);
      }
    };

    if (showEditPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEditPopup]);

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

  const handleEditProfile = () => {
    setEditData({
      username: userData.username,
      profilePic: userData.profilePic,
      bannerImage: userData.bannerImage
    });
    setShowEditPopup(true);
  };

  const handleBannerUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTempBannerImage(e.target.result);
        setShowBannerCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePicUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTempProfilePicImage(e.target.result);
        setShowProfilePicCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerCrop = (croppedImageUrl) => {
    setEditData({
      ...editData,
      bannerImage: croppedImageUrl
    });
    setShowBannerCropper(false);
    setTempBannerImage(null);
  };

  const handleProfilePicCrop = (croppedImageUrl) => {
    setEditData({
      ...editData,
      profilePic: croppedImageUrl
    });
    setShowProfilePicCropper(false);
    setTempProfilePicImage(null);
  };

  const handleBannerCropCancel = () => {
    setShowBannerCropper(false);
    setTempBannerImage(null);
  };

  const handleProfilePicCropCancel = () => {
    setShowProfilePicCropper(false);
    setTempProfilePicImage(null);
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setSaveError('');

      // For now, we'll use a hardcoded user ID since auth is disabled
      const userId = 1; // This should come from auth context when enabled

      // Prepare profile data for update
      const profileData = {
        username: editData.username
      };

      // If there are new images, upload them to Cloudinary first
      if (editData.bannerImage && editData.bannerImage !== userData.bannerImage) {
        try {
          const bannerUrl = await profileService.uploadImageToCloudinary(editData.bannerImage, 'banners');
          profileData.bannerImage = bannerUrl;
        } catch (error) {
          console.error('Failed to upload banner:', error);
          // Fallback: use the data URL directly (not recommended for production)
          profileData.bannerImage = editData.bannerImage;
        }
      }

      if (editData.profilePic && editData.profilePic !== userData.profilePic) {
        try {
          const profilePicUrl = await profileService.uploadImageToCloudinary(editData.profilePic, 'profile-pics');
          profileData.profilePicture = profilePicUrl;
        } catch (error) {
          console.error('Failed to upload profile picture:', error);
          // Fallback: use the data URL directly (not recommended for production)
          profileData.profilePicture = editData.profilePic;
        }
      }

      // Update profile in backend
      const updatedUser = await profileService.updateUserProfile(userId, profileData);

      // Update local state with the response from server
      setUserData({
        username: updatedUser.username,
        profilePic: updatedUser.profilePicture,
        bannerImage: updatedUser.bannerImage
      });

      setShowEditPopup(false);
      
      // Show success message (you could add a toast notification here)
      alert('Profile updated successfully!');
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveError('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditPopup(false);
  };

  const handleMyGamesClick = () => {
    navigate('/mygames');
  };

  const handleMyArtClick = () => {
    navigate('/myart');
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
        <Link to="/" className="profile-logo-title">
          <span className="game">GAME</span>
          <span className="pen">PEN</span>
        </Link>
        
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
          <div className="profile-profile-dropdown" ref={dropdownRef}>
            <button onClick={handleProfileClick} className="profile-profile-btn">
              Profile ▼
            </button>
            {showProfileDropdown && (
              <div className="profile-dropdown-menu">
                <div className="profile-dropdown-username">
                  {userData.username}
                </div>
                <button 
                  onClick={() => handleDropdownItemClick('/profile')}
                  className="profile-dropdown-item"
                >
                  My Profile
                </button>
                <button 
                  onClick={() => handleDropdownItemClick('/upload')}
                  className="profile-dropdown-item"
                >
                  Upload Content
                </button>
                <button 
                  onClick={() => handleDropdownItemClick('/drafts')}
                  className="profile-dropdown-item"
                >
                  My Drafts
                </button>
                <button 
                  onClick={() => handleDropdownItemClick('/friends')}
                  className="profile-dropdown-item"
                >
                  Friends
                </button>
                <div className="profile-dropdown-divider"></div>
                <button 
                  onClick={handleLogout}
                  className="profile-dropdown-item profile-dropdown-logout"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Banner Section */}
      <section className="profile-banner">
        {userData.bannerImage ? (
          <img 
            src={userData.bannerImage} 
            alt="Profile Banner" 
            className="profile-banner-image"
          />
        ) : (
          <div className="profile-banner-text">
            Profile Banner
          </div>
        )}
        <button className="profile-edit-button" onClick={handleEditProfile}>
          EDIT PROFILE
        </button>
      </section>

      {/* User Info Bar */}
      <section className="profile-user-info">
        <div className="profile-pic">
          {userData.profilePic ? (
            <img 
              src={userData.profilePic} 
              alt="Profile Picture" 
              className="profile-pic-image"
            />
          ) : (
            <div className="profile-pic-placeholder">
              Profile pic
            </div>
          )}
        </div>
        <div className="profile-username">
          {userData.username}
        </div>
      </section>

      {/* User Content Panel */}
      <main className="profile-content">
        <div className="profile-content-box" onClick={handleMyGamesClick} style={{cursor: 'pointer'}}>
          <h2 className="profile-content-title">
            User Game Demos
          </h2>
          <div className="profile-content-placeholder">
            Your game demos will appear here
          </div>
        </div>
        
        <div className="profile-content-box" onClick={handleMyArtClick} style={{cursor: 'pointer'}}>
          <h2 className="profile-content-title">
            User Art file
          </h2>
          <div className="profile-content-placeholder">
            {isLoadingArt ? (
              <div style={{ 
                width: '100%', 
                height: '100%', 
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                borderRadius: '1rem'
              }}>
                Loading...
              </div>
            ) : latestArtImage ? (
              <DominantColorThumbnail 
                imageUrl={latestArtImage.url}
                alt={latestArtImage.description || "Latest Art"}
                className="profile-art-thumbnail"
              />
            ) : (
              <div className="profile-content-placeholder">
                Your art files will appear here
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Profile Popup */}
      {showEditPopup && (
        <div className="profile-popup-overlay">
          <div className="profile-popup-content" ref={popupRef}>
            <div className="profile-popup-header">
              <h2>Edit Profile</h2>
              <button 
                className="profile-popup-close"
                onClick={handleCancelEdit}
              >
                ×
              </button>
            </div>
            
            <div className="profile-popup-body">
              {/* Username Section */}
              <div className="profile-popup-section">
                <h3>Username</h3>
                <input
                  type="text"
                  value={editData.username}
                  onChange={(e) => setEditData({...editData, username: e.target.value})}
                  className="profile-popup-input"
                  placeholder="Enter username"
                />
              </div>

              {/* Banner Upload Section */}
              <div className="profile-popup-section">
                <h3>Profile Banner</h3>
                <div className="profile-popup-upload-area">
                  {editData.bannerImage ? (
                    <img 
                      src={editData.bannerImage} 
                      alt="Banner Preview" 
                      className="profile-popup-banner-preview"
                    />
                  ) : (
                    <div className="profile-popup-upload-placeholder">
                      Click to upload banner
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="profile-popup-file-input"
                    id="banner-upload"
                  />
                  <label htmlFor="banner-upload" className="profile-popup-upload-btn">
                    Upload Banner
                  </label>
                </div>
                <p className="profile-popup-help-text">
                  Upload an image and crop it to fit your banner (3:1 ratio)
                </p>
              </div>

              {/* Profile Picture Upload Section */}
              <div className="profile-popup-section">
                <h3>Profile Picture</h3>
                <div className="profile-popup-upload-area">
                  {editData.profilePic ? (
                    <img 
                      src={editData.profilePic} 
                      alt="Profile Pic Preview" 
                      className="profile-popup-pic-preview"
                    />
                  ) : (
                    <div className="profile-popup-upload-placeholder">
                      Click to upload profile picture
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicUpload}
                    className="profile-popup-file-input"
                    id="pic-upload"
                  />
                  <label htmlFor="pic-upload" className="profile-popup-upload-btn">
                    Upload Picture
                  </label>
                </div>
                <p className="profile-popup-help-text">
                  Upload an image and crop it to fit your profile picture (1:1 ratio)
                </p>
              </div>
            </div>

            <div className="profile-popup-actions">
              <button onClick={handleCancelEdit} className="profile-popup-btn profile-popup-btn-secondary" disabled={isSaving}>
                Cancel
              </button>
              <button onClick={handleSaveProfile} className="profile-popup-btn profile-popup-btn-primary" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            
            {saveError && (
              <div className="profile-popup-error">
                {saveError}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Banner Image Cropper */}
      {showBannerCropper && (
        <ImageCropper
          imageSrc={tempBannerImage}
          onCrop={handleBannerCrop}
          onCancel={handleBannerCropCancel}
          aspectRatio={3}
          cropType="banner"
        />
      )}

      {/* Profile Picture Image Cropper */}
      {showProfilePicCropper && (
        <ImageCropper
          imageSrc={tempProfilePicImage}
          onCrop={handleProfilePicCrop}
          onCancel={handleProfilePicCropCancel}
          aspectRatio={1}
          cropType="profile"
        />
      )}
    </div>
  );
};

export default Profile;
