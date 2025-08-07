import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { profileService } from '../services/profileService';
import Logo from '../components/Logo';
import { imageService } from '../services/imageService';
import '../styles/Explore.css';
import '../styles/Profile.css'; // Import for profile button style

const Explore = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(30);
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState(null);
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

  // Fetch images from API
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setIsInitialLoading(true);
        const fetchedImages = await imageService.getImages({ 
          is_public: true, 
          limit: 100 
        });
        setImages(fetchedImages);
        setFilteredImages(fetchedImages);
      } catch (error) {
        console.error('Error fetching images:', error);
        // Fallback to sample data if API fails
        setImages(getSampleContent());
        setFilteredImages(getSampleContent());
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Sample content data as fallback
  const getSampleContent = () => [
    { id: 1, title: 'Space Adventure Game', type: 'Game', icon: '🎮', description: '2D platformer with unique gravity mechanics' },
    { id: 2, title: 'Character Concept Art', type: 'Art', icon: '🎨', description: 'Fantasy RPG character designs' },
    { id: 3, title: 'Level Design Sketches', type: 'Game', icon: '🏗️', description: 'Environmental concepts for game stages' },
    { id: 4, title: 'UI Mockups', type: 'Art', icon: '📱', description: 'Mobile game interface designs' },
    { id: 5, title: 'Sound Effects Collection', type: 'Audio', icon: '🔊', description: 'Custom audio for horror game' },
    { id: 6, title: 'Storyboard Sequences', type: 'Art', icon: '🎬', description: 'Animated cinematic sequences' },
    { id: 7, title: 'Puzzle Game Demo', type: 'Game', icon: '🧩', description: 'Brain-teasing puzzle mechanics' },
    { id: 8, title: 'Landscape Paintings', type: 'Art', icon: '🏔️', description: 'Digital landscape artwork' },
    { id: 9, title: 'Racing Game Prototype', type: 'Game', icon: '🏎️', description: 'High-speed racing simulation' },
    { id: 10, title: 'Character Animations', type: 'Art', icon: '🕺', description: 'Smooth character movement cycles' },
    { id: 11, title: 'Background Music', type: 'Audio', icon: '🎵', description: 'Atmospheric game soundtrack' },
    { id: 12, title: 'Pixel Art Collection', type: 'Art', icon: '👾', description: 'Retro-style pixel artwork' },
    { id: 13, title: 'Strategy Game', type: 'Game', icon: '⚔️', description: 'Turn-based tactical gameplay' },
    { id: 14, title: '3D Model Renders', type: 'Art', icon: '🗿', description: 'Detailed 3D character models' },
    { id: 15, title: 'Voice Acting Demo', type: 'Audio', icon: '🎭', description: 'Character voice performances' },
    { id: 16, title: 'RPG World Map', type: 'Game', icon: '🗺️', description: 'Open world exploration game' },
    { id: 17, title: 'Digital Illustrations', type: 'Art', icon: '🖼️', description: 'Fantasy book illustrations' },
    { id: 18, title: 'Arcade Game', type: 'Game', icon: '🕹️', description: 'Classic arcade-style gameplay' },
    { id: 19, title: 'Texture Pack', type: 'Art', icon: '🧱', description: 'Game environment textures' },
    { id: 20, title: 'Ambient Sounds', type: 'Audio', icon: '🌲', description: 'Environmental audio effects' },
    { id: 21, title: 'Stealth Game', type: 'Game', icon: '👁️', description: 'Sneak-based gameplay mechanics' },
    { id: 22, title: 'Logo Designs', type: 'Art', icon: '🏷️', description: 'Brand and game logos' },
    { id: 23, title: 'Fighting Game', type: 'Game', icon: '🥊', description: 'Combat system prototype' },
    { id: 24, title: 'Concept Sketches', type: 'Art', icon: '✏️', description: 'Initial design concepts' },
    { id: 25, title: 'Menu Music', type: 'Audio', icon: '🎼', description: 'Game menu background music' },
    { id: 26, title: 'Simulation Game', type: 'Game', icon: '🏭', description: 'City building simulation' },
    { id: 27, title: 'Icon Set', type: 'Art', icon: '📋', description: 'UI icon collection' },
    { id: 28, title: 'Sports Game', type: 'Game', icon: '⚽', description: 'Multiplayer sports gameplay' },
    { id: 29, title: 'Poster Designs', type: 'Art', icon: '📰', description: 'Game promotional posters' },
    { id: 30, title: 'Jingle Collection', type: 'Audio', icon: '🎶', description: 'Short musical themes' },
    { id: 31, title: 'Adventure Game', type: 'Game', icon: '🗡️', description: 'Story-driven adventure' },
    { id: 32, title: 'Character Portraits', type: 'Art', icon: '👤', description: 'Character profile artwork' },
    { id: 33, title: 'Rhythm Game', type: 'Game', icon: '🥁', description: 'Music-based gameplay' },
    { id: 34, title: 'Background Art', type: 'Art', icon: '🌅', description: 'Scenic background paintings' },
    { id: 35, title: 'Soundtrack Album', type: 'Audio', icon: '💿', description: 'Complete game soundtrack' },
    { id: 36, title: 'Puzzle Platformer', type: 'Game', icon: '🧩', description: 'Combined puzzle and platforming' },
    { id: 37, title: 'Monster Designs', type: 'Art', icon: '👹', description: 'Enemy creature concepts' },
    { id: 38, title: 'Racing Soundtrack', type: 'Audio', icon: '🏁', description: 'High-energy racing music' },
    { id: 39, title: 'Tower Defense', type: 'Game', icon: '🏰', description: 'Strategic defense gameplay' },
    { id: 40, title: 'Weapon Designs', type: 'Art', icon: '🔫', description: 'Game weapon artwork' },
    { id: 41, title: 'Horror Game', type: 'Game', icon: '👻', description: 'Atmospheric horror experience' },
    { id: 42, title: 'Vehicle Models', type: 'Art', icon: '🚗', description: '3D vehicle designs' },
    { id: 43, title: 'Battle Music', type: 'Audio', icon: '⚔️', description: 'Combat encounter music' },
    { id: 44, title: 'Sandbox Game', type: 'Game', icon: '🏖️', description: 'Open-ended creative gameplay' },
    { id: 45, title: 'Environment Art', type: 'Art', icon: '🌍', description: 'World environment designs' },
    { id: 46, title: 'Victory Fanfare', type: 'Audio', icon: '🏆', description: 'Achievement celebration music' },
    { id: 47, title: 'Roguelike Game', type: 'Game', icon: '🎲', description: 'Procedurally generated gameplay' },
    { id: 48, title: 'Item Icons', type: 'Art', icon: '💎', description: 'Game item artwork' },
    { id: 49, title: 'Loading Music', type: 'Audio', icon: '⏳', description: 'Game loading screen music' },
    { id: 50, title: 'Visual Novel', type: 'Game', icon: '📖', description: 'Story-focused narrative game' }
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

  const handleShowMore = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
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

  // Helper function to get content type icon
  const getContentIcon = (genre) => {
    const genreLower = genre?.toLowerCase();
    if (genreLower === 'art' || genreLower === 'drawing' || genreLower === 'painting') return '🎨';
    if (genreLower === 'game' || genreLower === 'gaming') return '🎮';
    if (genreLower === 'audio' || genreLower === 'music' || genreLower === 'sound') return '🎵';
    return '📄';
  };

  if (isInitialLoading) {
    return (
      <div className="explore-page">
        <header className="explore-header">
          <Logo />
        </header>
        <div className="explore-loading">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="explore-page">
      {/* Fixed Top Navigation Bar */}
      <header className="explore-header">
        <Logo />
        
        <div className="explore-search">
          <input
            type="text"
            placeholder="Search content..."
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
                {/* <button 
                  onClick={() => handleDropdownItemClick('/drafts')}
                  className="explore-dropdown-item"
                >
                  My Drafts
                </button> */}
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

      {/* Main Content */}
      <main className="explore-main">
        <h1 className="explore-title">Explore Content</h1>
        
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
                          alt={content.description || "Content"} 
                          className="explore-thumbnail"
                        />
                      </div>
                    ) : (
                      // Fallback icon for sample data
                      <div className="explore-box-icon">{content.icon}</div>
                    )}
                    <h3 className="explore-box-title">
                      {content.description || content.title || "Untitled"}
                    </h3>
                    <span className="explore-box-type">
                      {content.genre || content.type || "Content"}
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
              <h2 className="explore-empty-title">No Content Found</h2>
              <p className="explore-empty-text">
                Try adjusting your search terms or browse all content.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Explore;
