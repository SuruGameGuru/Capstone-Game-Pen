import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { imageService } from '../services/imageService';
import { commentService } from '../services/commentService';
import '../styles/Display.css';

const Display = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Mock user data (replace with real auth when implemented)
  const currentUser = {
    id: 1,
    username: 'TestUser'
  };

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setIsLoading(true);
        const imageData = await imageService.getImage(id);
        if (imageData) {
          setImage(imageData);
          setLikeCount(imageData.like_count || 0);
        } else {
          setError('Image not found');
        }
      } catch (error) {
        console.error('Error fetching image:', error);
        setError('Failed to load image');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const commentsData = await commentService.getComments(id);
        setComments(commentsData);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchImage();
    fetchComments();
  }, [id]);

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

  const handleLike = async () => {
    try {
      await imageService.likeImage(id);
      setLiked(true);
      setLikeCount(prev => prev + 1);
    } catch (error) {
      console.error('Error liking image:', error);
    }
  };

  const handleDislike = async () => {
    try {
      await imageService.unlikeImage(id);
      setLiked(false);
      setLikeCount(prev => prev - 1);
    } catch (error) {
      console.error('Error unliking image:', error);
    }
  };

  const handleMessage = () => {
    // Navigate to direct message with the image author
    navigate(`/direct-message/${image.user_id}/${image.username}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmittingComment(true);
      const comment = await commentService.addComment(
        id,
        currentUser.id,
        currentUser.username,
        newComment.trim()
      );
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentService.deleteComment(commentId, currentUser.id);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

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
    navigate('/login');
  };

  const handleUploadClick = () => {
    navigate('/upload');
  };

  const handleExploreClick = () => {
    navigate('/explore');
  };

  const handleDraftsClick = () => {
    navigate('/drafts');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="display-page">
        <header className="display-header">
          <Link to="/" className="display-logo-title">
            <span className="game">GAME</span>
            <span className="pen">PEN</span>
          </Link>
          
          <div className="display-search">
            <input
              type="text"
              placeholder="Search Users..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <div className="display-icons">
            <div className="display-icon upload" title="Upload" onClick={handleUploadClick}></div>
            <div className="display-icon file" title="Explore" onClick={handleExploreClick}></div>
            <div className="display-icon drafts" title="Drafts" onClick={handleDraftsClick}></div>
            <div className="display-icon bell" title="Notifications"></div>
            <div className="display-profile-dropdown" ref={dropdownRef}>
              <button onClick={handleProfileClick} className="display-profile-btn">
                Profile ▼
              </button>
              {showProfileDropdown && (
                <div className="display-dropdown-menu">
                  <div className="display-dropdown-username">
                    {currentUser.username}
                  </div>
                  <button 
                    onClick={() => handleDropdownItemClick('/profile')}
                    className="display-dropdown-item"
                  >
                    My Profile
                  </button>
                  <button 
                    onClick={() => handleDropdownItemClick('/upload')}
                    className="display-dropdown-item"
                  >
                    Upload Content
                  </button>
                  <button 
                    onClick={() => handleDropdownItemClick('/drafts')}
                    className="display-dropdown-item"
                  >
                    My Drafts
                  </button>
                  <div className="display-dropdown-divider"></div>
                  <button 
                    onClick={handleLogout}
                    className="display-dropdown-item display-dropdown-logout"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="display-loading">Loading...</div>
      </div>
    );
  }

  if (error || !image) {
    return (
      <div className="display-page">
        <header className="display-header">
          <Link to="/" className="display-logo-title">
            <span className="game">GAME</span>
            <span className="pen">PEN</span>
          </Link>
          
          <div className="display-search">
            <input
              type="text"
              placeholder="Search Users..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <div className="display-icons">
            <div className="display-icon upload" title="Upload" onClick={handleUploadClick}></div>
            <div className="display-icon file" title="Explore" onClick={handleExploreClick}></div>
            <div className="display-icon drafts" title="Drafts" onClick={handleDraftsClick}></div>
            <div className="display-icon bell" title="Notifications"></div>
            <div className="display-profile-dropdown" ref={dropdownRef}>
              <button onClick={handleProfileClick} className="display-profile-btn">
                Profile ▼
              </button>
              {showProfileDropdown && (
                <div className="display-dropdown-menu">
                  <div className="display-dropdown-username">
                    {currentUser.username}
                  </div>
                  <button 
                    onClick={() => handleDropdownItemClick('/profile')}
                    className="display-dropdown-item"
                  >
                    My Profile
                  </button>
                  <button 
                    onClick={() => handleDropdownItemClick('/upload')}
                    className="display-dropdown-item"
                  >
                    Upload Content
                  </button>
                  <button 
                    onClick={() => handleDropdownItemClick('/drafts')}
                    className="display-dropdown-item"
                  >
                    My Drafts
                  </button>
                  <div className="display-dropdown-divider"></div>
                  <button 
                    onClick={handleLogout}
                    className="display-dropdown-item display-dropdown-logout"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="display-error">
          <h2>Error</h2>
          <p>{error || 'Image not found'}</p>
          <button onClick={handleBack} className="display-back-btn">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="display-page">
      {/* Fixed Top Navigation Bar */}
      <header className="display-header">
        <Link to="/" className="display-logo-title">
          <span className="game">GAME</span>
          <span className="pen">PEN</span>
        </Link>
        
        <div className="display-search">
          <input
            type="text"
            placeholder="Search Users..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="display-icons">
          <div className="display-icon upload" title="Upload" onClick={handleUploadClick}></div>
          <div className="display-icon file" title="Explore" onClick={handleExploreClick}></div>
          <div className="display-icon drafts" title="Drafts" onClick={handleDraftsClick}></div>
          <div className="display-icon bell" title="Notifications"></div>
          <div className="display-profile-dropdown" ref={dropdownRef}>
            <button onClick={handleProfileClick} className="display-profile-btn">
              Profile ▼
            </button>
            {showProfileDropdown && (
              <div className="display-dropdown-menu">
                <div className="display-dropdown-username">
                  {currentUser.username}
                </div>
                <button 
                  onClick={() => handleDropdownItemClick('/profile')}
                  className="display-dropdown-item"
                >
                  My Profile
                </button>
                <button 
                  onClick={() => handleDropdownItemClick('/upload')}
                  className="display-dropdown-item"
                >
                  Upload Content
                </button>
                <button 
                  onClick={() => handleDropdownItemClick('/drafts')}
                  className="display-dropdown-item"
                >
                  My Drafts
                </button>
                <div className="display-dropdown-divider"></div>
                <button 
                  onClick={handleLogout}
                  className="display-dropdown-item display-dropdown-logout"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <div className="display-container">
        <div className="display-box">
          <img src={image.url} alt={image.description || "Image"} className="display-img" />
          <div className="display-info">
            <h2 className="display-title">{image.description || "Untitled"}</h2>
            <p className="display-author">by {image.username || "Unknown"}</p>
            {image.genre && (
              <span className="display-genre">{image.genre}</span>
            )}
            <div className="display-description">
              {image.description || "No description available"}
            </div>
            <div className="display-actions">
              <div className="display-action-column">
                <button 
                  onClick={liked ? handleDislike : handleLike} 
                  className={`display-like-btn ${liked ? 'liked' : ''}`}
                >
                  {liked ? '💔 Unlike' : '❤️ Like'} ({likeCount})
                </button>
                <button 
                  onClick={handleDislike} 
                  className="display-dislike-btn"
                >
                  👎 Dislike
                </button>
              </div>
              <div className="display-action-column">
                <button onClick={handleMessage} className="display-message-btn">
                  ✉️ Message
                </button>
                <button onClick={handleBack} className="display-back-btn">
                  ← Back
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="display-comments-section">
          <h3 className="comments-title">Comments ({comments.length})</h3>
          
          {/* Add Comment Form */}
          <form onSubmit={handleSubmitComment} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="comment-input"
              rows="3"
              disabled={isSubmittingComment}
            />
            <button 
              type="submit" 
              className="comment-submit-btn"
              disabled={!newComment.trim() || isSubmittingComment}
            >
              {isSubmittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </form>

          {/* Comments List */}
          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-author">{comment.username}</span>
                    <span className="comment-date">{formatDate(comment.created_at)}</span>
                    {comment.user_id === currentUser.id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="comment-delete-btn"
                        title="Delete comment"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div className="comment-text">{comment.comment_text}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Display; 