import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { imageService } from '../services/imageService';
import { profileService } from '../services/profileService';
import ImageUpload from '../components/ImageUpload';
import '../styles/Upload.css';
import '../styles/ImageUpload.css';

const MyArt = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [artContent, setArtContent] = useState([]);
  const [filteredArtContent, setFilteredArtContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedArt, setSelectedArt] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState(null);
  const dropdownRef = useRef(null);



  const [userData, setUserData] = useState({
    username: user?.username || 'User Name'
  });

  // Debug: Log user context
  useEffect(() => {
    console.log('MyArt: User context updated:', user);
    console.log('MyArt: User ID:', user?.id);
    console.log('MyArt: User username:', user?.username);
    setUserData({
      username: user?.username || 'User Name'
    });
  }, [user]);

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

  // Fetch user's art from API
  useEffect(() => {
    const fetchUserArt = async () => {
      console.log('MyArt: fetchUserArt called, user:', user);
      if (!user?.id) {
        console.log('MyArt: No user ID available');
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('MyArt: Fetching images for user ID:', user.id);
        console.log('MyArt: API URL being used:', process.env.REACT_APP_API_URL || 'http://localhost:3001');
        console.log('MyArt: Token available:', !!localStorage.getItem('token'));
        
        // Try different approaches to see what works
        let fetchedImages = [];
        
        // First try: Get all user's images (like ExploreArt but with user_id)
        console.log('MyArt: Making API call with user_id filter...');
        fetchedImages = await imageService.getImages({ 
          user_id: user.id,
          limit: 100 
        });
        
        console.log('MyArt: Fetched images with user_id filter:', fetchedImages);
        console.log('MyArt: Number of images found:', fetchedImages.length);
        
        // If no images found, try without user_id filter to see if any images exist
        if (fetchedImages.length === 0) {
          console.log('MyArt: No images found with user_id filter, trying without filter...');
          const allImages = await imageService.getImages({ 
            limit: 100 
          });
          console.log('MyArt: All images in database:', allImages);
        }
        
        // For now, show all user images without genre filtering (like ExploreArt)
        const artImages = fetchedImages;
        
        console.log('MyArt: Final art images to display:', artImages);
        
        setArtContent(artImages);
        setFilteredArtContent(artImages);
      } catch (error) {
        console.error('Error fetching user art:', error);
        setArtContent([]);
        setFilteredArtContent([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserArt();
  }, [user?.id]);



  // Filter art based on search term
  useEffect(() => {
    const filtered = artContent.filter(art => {
      if (!searchTerm.trim()) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        (art.description && art.description.toLowerCase().includes(searchLower)) ||
        (art.genre && art.genre.toLowerCase().includes(searchLower)) ||
        (art.title && art.title.toLowerCase().includes(searchLower))
      );
    });
    setFilteredArtContent(filtered);
  }, [searchTerm, artContent]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleArtClick = (art) => {
    setSelectedArt(art);
    setEditDescription(art.description || '');
    setShowPopup(true);
  };

  const handleNewUpload = () => {
    setShowUploadModal(true);
  };

  const handleUploadSuccess = (data) => {
    setShowUploadModal(false);
    alert('Upload successful!');
    
    console.log('MyArt: Upload success data:', data);
    
    // Add the new image to the current list (like ExploreArt approach)
    if (data && data.image) {
      const newImage = data.image;
      console.log('MyArt: Adding new image to list:', newImage);
      setArtContent(prev => [newImage, ...prev]);
      setFilteredArtContent(prev => [newImage, ...prev]);
    }
  };

  const handleUploadError = (error) => {
    alert(`Upload failed: ${error}`);
  };

  const handleEditDescription = async () => {
    if (!selectedArt || !editDescription.trim()) {
      alert('Please enter a description');
      return;
    }
    
    try {
      const result = await imageService.updateImage(selectedArt.id, {
        description: editDescription
      });
      
      // Update local state with the response from server
      const updatedArt = result.image || result;
      setArtContent(prev => prev.map(art => art.id === selectedArt.id ? updatedArt : art));
      setFilteredArtContent(prev => prev.map(art => art.id === selectedArt.id ? updatedArt : art));
      
      setShowPopup(false);
      setSelectedArt(null);
      setEditDescription('');
      alert('Description updated successfully!');
    } catch (error) {
      console.error('Error updating description:', error);
      alert(`Failed to update description: ${error.message || 'Please try again.'}`);
    }
  };

  const handleCropImage = () => {
    // TODO: Implement image cropping functionality
    console.log('Crop image:', selectedArt.id);
    alert('Image cropping feature is planned for future updates. For now, you can edit the description or delete the image.');
  };

  const handleDeleteArt = async () => {
    if (!selectedArt) return;
    
    if (window.confirm('Are you sure you want to delete this artwork? This action cannot be undone.')) {
      try {
        await imageService.deleteImage(selectedArt.id);
        
        // Remove from local state
        setArtContent(prev => prev.filter(art => art.id !== selectedArt.id));
        setFilteredArtContent(prev => prev.filter(art => art.id !== selectedArt.id));
        
        setShowPopup(false);
        setSelectedArt(null);
        setEditDescription('');
        alert('Artwork deleted successfully!');
      } catch (error) {
        console.error('Error deleting art:', error);
        alert(`Failed to delete artwork: ${error.message || 'Please try again.'}`);
      }
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedArt(null);
    setEditDescription('');
  };

  if (isLoading) {
    return (
      <div className="upload-page">
        <header className="upload-header">
          <Link to="/" className="upload-logo-title">
            <span className="game">GAME</span>
            <span className="pen">PEN</span>
          </Link>
        </header>
        <div className="upload-loading">Loading...</div>
      </div>
    );
  }

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
            placeholder="Search my art..."
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
        <h1 className="upload-title">My Uploaded Art</h1>
        <div className="upload-container">
          <h2 className="upload-section-header">Art</h2>
          <div className="upload-row">
            {filteredArtContent.map((art) => (
              <div
                key={art.id}
                className="upload-box"
                onClick={() => handleArtClick(art)}
              >
                {art.url ? (
                  <img
                    src={art.url}
                    alt={art.description || "Art"}
                    className="upload-box-thumbnail"
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '1rem 1rem 0 0',
                      marginBottom: '0.5rem'
                    }}
                  />
                ) : (
                  <div className="upload-box-icon">{art.icon}</div>
                )}
                <h3 className="upload-box-title">
                  {art.description || art.title || "Untitled Art"}
                </h3>
                <span className="upload-box-type">
                  {art.genre || "Art"}
                </span>
                <p className="upload-box-description">
                  {art.description || "No description available"}
                </p>
                <button className="upload-action-btn">Edit</button>
              </div>
            ))}
            {/* Add New Art Box */}
            <div
              className="upload-box"
              onClick={handleNewUpload}
            >
              <div className="upload-box-icon">➕</div>
              <h3 className="upload-box-title">Add New Art</h3>
              <span className="upload-box-type">Art</span>
              <p className="upload-box-description">Upload new artwork</p>
              <button className="upload-action-btn">Create</button>
            </div>
          </div>
          {/* Empty State */}
          {filteredArtContent.length === 0 && searchTerm && (
            <div className="upload-empty">
              <div className="upload-empty-icon">🔍</div>
              <h2 className="upload-empty-title">No Art Found</h2>
              <p className="upload-empty-text">
                Try adjusting your search terms or create new art.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Art Action Popup */}
      {showPopup && selectedArt && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>Edit Artwork</h3>
              <button className="popup-close" onClick={closePopup}>×</button>
            </div>
            
            <div className="popup-body">
              {selectedArt.url && (
                <div className="popup-image">
                  <img src={selectedArt.url} alt={selectedArt.description || "Art"} />
                </div>
              )}
              
              <div className="popup-info">
                <p><strong>Genre:</strong> {selectedArt.genre || 'Not specified'}</p>
                <p><strong>Upload Date:</strong> {selectedArt.created_at ? new Date(selectedArt.created_at).toLocaleDateString() : 'Unknown'}</p>
                <p><strong>Current Description:</strong> {selectedArt.description || 'No description'}</p>
              </div>
              
              <div className="popup-actions">
                <div className="popup-section">
                  <h4>Edit Description</h4>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Enter new description..."
                    rows="3"
                  />
                  <button 
                    className="popup-btn popup-btn-primary"
                    onClick={handleEditDescription}
                    disabled={!editDescription.trim()}
                  >
                    Save Description
                  </button>
                </div>
                
                <div className="popup-section">
                  <h4>Image Actions</h4>
                  <button 
                    className="popup-btn popup-btn-secondary"
                    onClick={handleCropImage}
                  >
                    ✂️ Crop Image
                  </button>
                  <button 
                    className="popup-btn popup-btn-danger"
                    onClick={handleDeleteArt}
                  >
                    🗑️ Delete Artwork
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="upload-modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="upload-modal-header">
              <h2>Upload New Art</h2>
              <button 
                className="upload-modal-close"
                onClick={() => setShowUploadModal(false)}
              >
                ×
              </button>
            </div>
            <ImageUpload 
              uploadType="art"
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyArt; 