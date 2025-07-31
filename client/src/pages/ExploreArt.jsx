import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { imageService } from '../services/imageService';
import Logo from '../components/Logo';
import '../styles/ExploreArt.css';

const ExploreArt = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const navigate = useNavigate();

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
      <header className="explore-header">
        <Logo />
        <div className="explore-search">
          <input
            type="text"
            placeholder="Search art..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <nav className="explore-navbar">
          {/* Add navigation links as needed */}
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