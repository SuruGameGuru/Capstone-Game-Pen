import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Explore.css';
import '../styles/Profile.css'; // Import for profile button style

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(30);
  const [isLoading, setIsLoading] = useState(false);

  // Sample content data - in a real app, this would come from an API
  const allContent = [
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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleShowMore = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setDisplayCount(prev => Math.min(prev + 30, allContent.length));
    setIsLoading(false);
  };

  const handleContentClick = (content) => {
    // Handle content click - would route to presentation/playable version
    console.log('Opening content:', content);
    // In a real app, this would navigate to the content detail page
    // navigate(`/content/${content.id}`);
  };

  const filteredContent = allContent.filter(content =>
    content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedContent = filteredContent.slice(0, displayCount);
  const hasMoreContent = displayCount < filteredContent.length;

  return (
    <div className="explore-page">
      {/* Fixed Top Navigation Bar */}
      <header className="explore-header">
        <div className="explore-logo-title">
          <span className="game">GAME</span>
          <span className="pen">PEN</span>
        </div>
        
        <div className="explore-search">
          <input
            type="text"
            placeholder="Search content..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <nav className="explore-navbar">
          <Link to="/">Home</Link>
          <Link to="/upload">Upload</Link>
          <Link to="/profile" className="profile-route-btn" title="Profile">
            {/* You can use a user icon, emoji, or initials here */}
            <span role="img" aria-label="profile">👤</span>
          </Link>
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
                    <div className="explore-box-icon">{content.icon}</div>
                    <h3 className="explore-box-title">{content.title}</h3>
                    <span className="explore-box-type">{content.type}</span>
                    <p className="explore-box-description">{content.description}</p>
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
