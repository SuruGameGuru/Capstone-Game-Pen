import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoService } from '../services/videoService';
import Logo from '../components/Logo';
import '../styles/ExploreGames.css';

const ExploreGames = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch videos on component mount
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const videoData = await videoService.getVideos({ is_public: true, limit: 100 });
        setVideos(videoData);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleShowMore = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setDisplayCount(prev => Math.min(prev + 30, filteredVideos.length));
    setIsLoading(false);
  };

  const handleContentClick = (video) => {
    navigate(`/display/video/${video.id}`);
  };

  const filteredVideos = videos.filter(video =>
    video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.genre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const displayedVideos = filteredVideos.slice(0, displayCount);
  const hasMoreContent = displayCount < filteredVideos.length;

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
          {loading ? (
            <div className="explore-loading">Loading videos...</div>
          ) : displayedVideos.length > 0 ? (
            <>
              <div className="explore-grid">
                {displayedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="explore-box"
                    onClick={() => handleContentClick(video)}
                  >
                    <div className="explore-box-icon">🎮</div>
                    <h3 className="explore-box-title">{video.description || 'Untitled Game Demo'}</h3>
                    <span className="explore-box-type">Game Demo</span>
                    <p className="explore-box-description">by {video.username}</p>
                    {video.genre && (
                      <span className="explore-box-genre">{video.genre}</span>
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
              <h2 className="explore-empty-title">No Game Demos Found</h2>
              <p className="explore-empty-text">
                Try adjusting your search terms or upload a new game demo.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
export default ExploreGames; 