import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { imageService } from '../services/imageService';
import '../styles/Upload.css';

const MyArt = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [artContent, setArtContent] = useState([]);
  const [filteredArtContent, setFilteredArtContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedArt, setSelectedArt] = useState(null);
  const [editDescription, setEditDescription] = useState('');
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

  // Fetch user's art from API
  useEffect(() => {
    const fetchUserArt = async () => {
      try {
        setIsLoading(true);
        // For now, fetch all public art since we don't have user-specific filtering
        const fetchedImages = await imageService.getImages({ 
          is_public: true, 
          limit: 100 
        });
        // Filter for art images
        const artImages = fetchedImages.filter(img => 
          img.genre?.toLowerCase() === 'art' || 
          img.genre?.toLowerCase() === 'drawing' || 
          img.genre?.toLowerCase() === 'painting'
        );
        setArtContent(artImages);
        setFilteredArtContent(artImages);
      } catch (error) {
        console.error('Error fetching user art:', error);
        // Fallback to sample data
        const sampleArt = getSampleArtContent();
        setArtContent(sampleArt);
        setFilteredArtContent(sampleArt);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserArt();
  }, []);

  // Sample art content as fallback
  const getSampleArtContent = () => [
    {
      id: 1,
      title: 'Character Concept Art',
      icon: '🎨',
      description: 'Fantasy RPG character designs',
      thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg'
    },
    {
      id: 2,
      title: 'Level Design Sketches',
      icon: '🏗️',
      description: 'Environmental concepts for game stages',
      thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
    }
  ];

  // Filter art based on search term
  useEffect(() => {
    if (artContent.length > 0) {
      const filtered = artContent.filter(art => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (art.description && art.description.toLowerCase().includes(searchLower)) ||
          (art.genre && art.genre.toLowerCase().includes(searchLower)) ||
          (art.title && art.title.toLowerCase().includes(searchLower))
        );
      });
      setFilteredArtContent(filtered);
    }
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
    navigate('/upload');
  };

  const handleEditDescription = async () => {
    if (!selectedArt || !editDescription.trim()) return;
    
    try {
      const result = await imageService.updateImage(selectedArt.id, {
        description: editDescription
      });
      
      // Update local state with the response from server
      const updatedArt = result.image;
      setArtContent(prev => prev.map(art => art.id === selectedArt.id ? updatedArt : art));
      
      setShowPopup(false);
      setSelectedArt(null);
      setEditDescription('');
    } catch (error) {
      console.error('Error updating description:', error);
      alert('Failed to update description. Please try again.');
    }
  };

  const handleCropImage = () => {
    // TODO: Implement image cropping functionality
    console.log('Crop image:', selectedArt.id);
    alert('Image cropping feature coming soon!');
  };

  const handleDeleteArt = async () => {
    if (!selectedArt) return;
    
    if (window.confirm('Are you sure you want to delete this artwork? This action cannot be undone.')) {
      try {
        await imageService.deleteImage(selectedArt.id);
        
        // Remove from local state
        setArtContent(prev => prev.filter(art => art.id !== selectedArt.id));
        
        setShowPopup(false);
        setSelectedArt(null);
        setEditDescription('');
      } catch (error) {
        console.error('Error deleting art:', error);
        alert('Failed to delete artwork. Please try again.');
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
    </div>
  );
};

export default MyArt; 