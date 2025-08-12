import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { imageService } from '../services/imageService';
import { profileService } from '../services/profileService';
import '../styles/ExploreArt.css';

const ExploreArt = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
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

  // Fetch art images from API
  useEffect(() => {
    const fetchArtImages = async () => {
      try {
        setIsInitialLoading(true);
        const fetchedImages = await imageService.getImages({ 
          is_public: true, 
          limit: 100 
        });
        // Show all images (no genre filtering)
        setImages(fetchedImages);
        setFilteredImages(fetchedImages);
      } catch (error) {
        console.error('Error fetching art images:', error);
        // Fallback to sample data
        const sampleArt = getSampleArtContent();
        setImages(sampleArt);
        setFilteredImages(sampleArt);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchArtImages();
  }, []);

  // Sample art content as fallback
  const getSampleArtContent = () => [
    { id: 1, title: 'Character Concept Art', type: 'Art', icon: '🎨', description: 'Fantasy RPG character designs' },
    { id: 2, title: 'UI Mockups', type: 'Art', icon: '📱', description: 'Mobile game interface designs' },
    { id: 3, title: 'Storyboard Sequences', type: 'Art', icon: '🎬', description: 'Animated cinematic sequences' },
    { id: 4, title: 'Landscape Paintings', type: 'Art', icon: '🏔️', description: 'Digital landscape artwork' },
    { id: 5, title: 'Character Animations', type: 'Art', icon: '🕺', description: 'Smooth character movement cycles' },
    { id: 6, title: 'Pixel Art Collection', type: 'Art', icon: '👾', description: 'Retro-style pixel artwork' },
    { id: 7, title: '3D Model Renders', type: 'Art', icon: '🗿', description: 'Detailed 3D character models' },
    { id: 8, title: 'Digital Illustrations', type: 'Art', icon: '🖼️', description: 'Fantasy book illustrations' },
    { id: 9, title: 'Texture Pack', type: 'Art', icon: '🧱', description: 'Game environment textures' },
    { id: 10, title: 'Logo Designs', type: 'Art', icon: '🏷️', description: 'Brand and game logos' },
    { id: 11, title: 'Concept Sketches', type: 'Art', icon: '✏️', description: 'Initial design concepts' },
    { id: 12, title: 'Icon Set', type: 'Art', icon: '📋', description: 'UI icon collection' },
    { id: 13, title: 'Poster Designs', type: 'Art', icon: '📰', description: 'Game promotional posters' },
    { id: 14, title: 'Character Portraits', type: 'Art', icon: '👤', description: 'Character profile artwork' },
    { id: 15, title: 'Background Art', type: 'Art', icon: '🌅', description: 'Scenic background paintings' },
    { id: 16, title: 'Monster Designs', type: 'Art', icon: '👹', description: 'Enemy creature concepts' },
    { id: 17, title: 'Weapon Designs', type: 'Art', icon: '🔫', description: 'Game weapon artwork' },
    { id: 18, title: 'Vehicle Models', type: 'Art', icon: '🚗', description: '3D vehicle designs' },
    { id: 19, title: 'Environment Art', type: 'Art', icon: '🌍', description: 'World environment designs' },
    { id: 20, title: 'Item Icons', type: 'Art', icon: '💎', description: 'Game item artwork' }
  ];

  // Filter images based on search term
  useEffect(() => {
    if (images.length > 0) {
      const filtered = images.filter(image => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (image.description && image.description.toLowerCase().includes(searchLower)) ||
          (image.genre && image.genre.toLowerCase().includes(searchLower)) ||
          (image.username && image.username.toLowerCase().includes(searchLower))
        );
      });
      setFilteredImages(filtered);
    }
  }, [searchTerm, images]);

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
    setDisplayCount(prev => Math.min(prev + 30, filteredImages.length));
    setIsLoading(false);
  };

  const handleContentClick = (content) => {
    if (content.url) {
      // Real image - navigate to display page
      navigate(`/display/${content.id}`);
    } else {
      // Sample data - just log for now
      console.log('Opening content:', content);
    }
  };

  const displayedContent = filteredImages.slice(0, displayCount);
  const hasMoreContent = displayCount < filteredImages.length;

  if (isInitialLoading) {
    return (
      <div className="explore-page">
        <header className="explore-header">
          <Link to="/" className="explore-logo-title">
            <span className="game">GAME</span>
            <span className="pen">PEN</span>
          </Link>
        </header>
        <div className="explore-loading">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

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
            placeholder="Search art..."
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
        <h1 className="explore-title">Explore Art</h1>
        <div className="explore-container">
          {displayedContent.length > 0 ? (
            <>
              <div className="explore-grid">
                {displayedContent.map((content) => (
                  <div
                    key={content.id}
                    className="explore-box"
                    onClick={() => handleContentClick(content)}
                  >
                    {content.url ? (
                      // Real image from API
                      <div className="explore-box-image">
                        <img 
                          src={content.url} 
                          alt={content.description || "Art"} 
                          className="explore-thumbnail"
                        />
                      </div>
                    ) : (
                      // Fallback icon for sample data
                      <div className="explore-box-icon">{content.icon}</div>
                    )}
                    <h3 className="explore-box-title">
                      {content.description || content.title || "Untitled Art"}
                    </h3>
                    <span className="explore-box-type">
                      {content.genre || content.type || "Art"}
                    </span>
                    <p className="explore-box-description">
                      {content.description || "No description available"}
                    </p>
                    {content.username && (
                      <p className="explore-box-author">by {content.username}</p>
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
              <h2 className="explore-empty-title">No Art Found</h2>
              <p className="explore-empty-text">
                Try adjusting your search terms or browse all art.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
export default ExploreArt; 