import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Upload.css';
import '../styles/Profile.css'; // For profile-route-btn

const Upload = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Sample game content
  const gameContent = [
    { id: 1, title: 'Space Adventure Game', icon: '🎮', description: '2D platformer with unique gravity mechanics' },
    { id: 2, title: 'Puzzle Game Demo', icon: '🧩', description: 'Brain-teasing puzzle mechanics' },
    { id: 3, title: 'Racing Game Prototype', icon: '🏎️', description: 'High-speed racing simulation' },
    { id: 4, title: 'Strategy Game', icon: '⚔️', description: 'Turn-based tactical gameplay' },
    { id: 5, title: 'RPG World Map', icon: '🗺️', description: 'Open world exploration game' },
    { id: 6, title: 'Arcade Game', icon: '🕹️', description: 'Classic arcade-style gameplay' },
    { id: 7, title: 'Stealth Game', icon: '👁️', description: 'Sneak-based gameplay mechanics' },
    { id: 8, title: 'Fighting Game', icon: '🥊', description: 'Combat system prototype' },
    { id: 9, title: 'Simulation Game', icon: '🏭', description: 'City building simulation' },
    { id: 10, title: 'Sports Game', icon: '⚽', description: 'Multiplayer sports gameplay' },
    { id: 11, title: 'Adventure Game', icon: '🗡️', description: 'Story-driven adventure' },
    { id: 12, title: 'Rhythm Game', icon: '🥁', description: 'Music-based gameplay' },
    { id: 13, title: 'Puzzle Platformer', icon: '🧩', description: 'Combined puzzle and platforming' },
    { id: 14, title: 'Tower Defense', icon: '🏰', description: 'Strategic defense gameplay' },
    { id: 15, title: 'Horror Game', icon: '👻', description: 'Atmospheric horror experience' }
  ];

  // Sample art content
  const artContent = [
    { id: 1, title: 'Character Concept Art', icon: '🎨', description: 'Fantasy RPG character designs' },
    { id: 2, title: 'Level Design Sketches', icon: '🏗️', description: 'Environmental concepts for game stages' },
    { id: 3, title: 'UI Mockups', icon: '📱', description: 'Mobile game interface designs' },
    { id: 4, title: 'Storyboard Sequences', icon: '🎬', description: 'Animated cinematic sequences' },
    { id: 5, title: 'Landscape Paintings', icon: '🏔️', description: 'Digital landscape artwork' },
    { id: 6, title: 'Character Animations', icon: '🕺', description: 'Smooth character movement cycles' },
    { id: 7, title: 'Pixel Art Collection', icon: '👾', description: 'Retro-style pixel artwork' },
    { id: 8, title: '3D Model Renders', icon: '🗿', description: 'Detailed 3D character models' },
    { id: 9, title: 'Texture Pack', icon: '🧱', description: 'Game environment textures' },
    { id: 10, title: 'Logo Designs', icon: '🏷️', description: 'Brand and game logos' },
    { id: 11, title: 'Concept Sketches', icon: '✏️', description: 'Initial design concepts' },
    { id: 12, title: 'Icon Set', icon: '📋', description: 'UI icon collection' },
    { id: 13, title: 'Poster Designs', icon: '📰', description: 'Game promotional posters' },
    { id: 14, title: 'Character Portraits', icon: '👤', description: 'Character profile artwork' },
    { id: 15, title: 'Background Art', icon: '🌅', description: 'Scenic background paintings' }
  ];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleUploadClick = (content) => {
    // Handle upload click - would open upload modal or navigate to upload form
    console.log('Upload clicked for:', content);
  };

  const handleNewUpload = (type) => {
    // Handle new upload creation
    console.log('Create new', type, 'upload');
  };

  const filteredGameContent = gameContent.filter(content =>
    content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredArtContent = artContent.filter(content =>
    content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="upload-page">
      {/* Fixed Top Navigation Bar */}
      <header className="upload-header">
        <div className="upload-logo-title">
          <span className="game">GAME</span>
          <span className="pen">PEN</span>
        </div>
        
        <div className="upload-search">
          <input
            type="text"
            placeholder="Search uploads..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <nav className="upload-navbar">
          <Link to="/">Home</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/profile" className="profile-route-btn" title="Profile">
            <span role="img" aria-label="profile">👤</span>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="upload-main">
        <h1 className="upload-title">Upload Content</h1>
        
        <div className="upload-container">
          {/* Games Section */}
          <h2 className="upload-section-header">Games</h2>
          <div className="upload-row">
            {filteredGameContent.map((content) => (
              <div 
                key={content.id} 
                className="upload-box"
                onClick={() => handleUploadClick(content)}
              >
                <div className="upload-box-icon">{content.icon}</div>
                <h3 className="upload-box-title">{content.title}</h3>
                <span className="upload-box-type">Game</span>
                <p className="upload-box-description">{content.description}</p>
                <button className="upload-action-btn">Upload</button>
              </div>
            ))}
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
            {filteredArtContent.map((content) => (
              <div 
                key={content.id} 
                className="upload-box"
                onClick={() => handleUploadClick(content)}
              >
                <div className="upload-box-icon">{content.icon}</div>
                <h3 className="upload-box-title">{content.title}</h3>
                <span className="upload-box-type">Art</span>
                <p className="upload-box-description">{content.description}</p>
                <button className="upload-action-btn">Upload</button>
              </div>
            ))}
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

          {/* Empty State */}
          {filteredGameContent.length === 0 && filteredArtContent.length === 0 && searchTerm && (
            <div className="upload-empty">
              <div className="upload-empty-icon">🔍</div>
              <h2 className="upload-empty-title">No Uploads Found</h2>
              <p className="upload-empty-text">
                Try adjusting your search terms or create new content.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Upload;
