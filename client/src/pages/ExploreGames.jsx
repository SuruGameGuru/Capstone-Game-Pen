import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import '../styles/ExploreGames.css';

const ExploreGames = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Sample content data - replace with API call in real app
  const allContent = [
    // ... (copy game items from Explore.jsx)
  ];

  const gameContent = allContent.filter(content => content.type === 'Game');

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleShowMore = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setDisplayCount(prev => Math.min(prev + 30, gameContent.length));
    setIsLoading(false);
  };

  const handleContentClick = (content) => {
    navigate(`/display/${content.id}`);
  };

  const filteredContent = gameContent.filter(content =>
    content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const displayedContent = filteredContent.slice(0, displayCount);
  const hasMoreContent = displayCount < filteredContent.length;

  return (
    <div className="explore-page">
      <header className="explore-header">
        <Logo />
        <div className="explore-search">
          <input
            type="text"
            placeholder="Search games..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <nav className="explore-navbar">
          {/* Add navigation links as needed */}
        </nav>
      </header>
      <main className="explore-main">
        <h1 className="explore-title">Explore Games</h1>
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
              <h2 className="explore-empty-title">No Games Found</h2>
              <p className="explore-empty-text">
                Try adjusting your search terms or browse all games.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
export default ExploreGames; 