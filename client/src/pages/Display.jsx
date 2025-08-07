import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { imageService } from '../services/imageService';
import { videoService } from '../services/videoService';
import { commentService } from '../services/commentService';
import { profileService } from '../services/profileService';
import '../styles/Display.css';

const Display = () => {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [content, setContent] = useState(null);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userProfilePic, setUserProfilePic] = useState(null);
  const dropdownRef = useRef(null);
  
  // Determine if this is a video or image based on URL or type parameter
  const isVideo = type === 'video' || window.location.pathname.includes('/video/');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        let contentData;
        
        if (isVideo) {
          contentData = await videoService.getVideo(id);
          if (contentData) {
            setLikeCount(contentData.like_count || 0);
            setDislikeCount(contentData.dislike_count || 0);
            
            // Check if current user has liked or disliked this video
            if (user) {
              const [hasLiked, hasDisliked] = await Promise.all([
                videoService.checkIfLiked(id),
                videoService.checkIfDisliked(id)
              ]);
              setLiked(hasLiked);
              setDisliked(hasDisliked);
            }
          }
        } else {
          contentData = await imageService.getImage(id);
          if (contentData) {
            setLikeCount(contentData.like_count || 0);
            setDislikeCount(contentData.dislike_count || 0);
            
            // Check if current user has liked or disliked this image
            if (user) {
              const [hasLiked, hasDisliked] = await Promise.all([
                imageService.checkIfLiked(id),
                imageService.checkIfDisliked(id)
              ]);
              setLiked(hasLiked);
              setDisliked(hasDisliked);
            }
          }
        }
        
        if (contentData) {
          setContent(contentData);
        } else {
          setError(isVideo ? 'Video not found' : 'Image not found');
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        setError('Failed to load content');
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

    fetchContent();
    fetchComments();
  }, [id, user, isVideo]);

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
      } catch (error) {
        console.error('Error loading user profile:', error);
        setUserProfilePic(null);
      }
    };

    loadUserProfile();
  }, [user]);

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      if (isVideo) {
        if (liked) {
          // User already liked, so unlike
          await videoService.unlikeVideo(id);
          setLiked(false);
          setLikeCount(prev => prev - 1);
        } else {
          // User hasn't liked, so like
          await videoService.likeVideo(id);
          setLiked(true);
          setLikeCount(prev => prev + 1);
          
          // Backend will automatically remove dislike if it exists
          if (disliked) {
            setDisliked(false);
            setDislikeCount(prev => prev - 1);
          }
        }
      } else {
        if (liked) {
          // User already liked, so unlike
          await imageService.unlikeImage(id);
          setLiked(false);
          setLikeCount(prev => prev - 1);
        } else {
          // User hasn't liked, so like
          await imageService.likeImage(id);
          setLiked(true);
          setLikeCount(prev => prev + 1);
          
          // Backend will automatically remove dislike if it exists
          if (disliked) {
            setDisliked(false);
            setDislikeCount(prev => prev - 1);
          }
        }
      }
    } catch (error) {
      console.error('Error handling like:', error);
      if (error.message.includes('401')) {
        alert('Please log in to like content');
        navigate('/login');
      } else {
        alert('Failed to like content. Please try again.');
      }
    }
  };

  const handleDislike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      if (isVideo) {
        if (disliked) {
          // User already disliked, so undislike
          await videoService.undislikeVideo(id);
          setDisliked(false);
          setDislikeCount(prev => prev - 1);
        } else {
          // User hasn't disliked, so dislike
          await videoService.dislikeVideo(id);
          setDisliked(true);
          setDislikeCount(prev => prev + 1);
          
          // Backend will automatically remove like if it exists
          if (liked) {
            setLiked(false);
            setLikeCount(prev => prev - 1);
          }
        }
      } else {
        if (disliked) {
          // User already disliked, so undislike
          await imageService.undislikeImage(id);
          setDisliked(false);
          setDislikeCount(prev => prev - 1);
        } else {
          // User hasn't disliked, so dislike
          await imageService.dislikeImage(id);
          setDisliked(true);
          setDislikeCount(prev => prev + 1);
          
          // Backend will automatically remove like if it exists
          if (liked) {
            setLiked(false);
            setLikeCount(prev => prev - 1);
          }
        }
      }
    } catch (error) {
      console.error('Error handling dislike:', error);
      if (error.message.includes('401')) {
        alert('Please log in to dislike content');
        navigate('/login');
      } else {
        alert('Failed to dislike content. Please try again.');
      }
    }
  };

  const handleMessage = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Don't allow messaging yourself
    if (content && content.user_id === user.id) {
      alert('You cannot message yourself!');
      return;
    }
    
    // Navigate to direct message with the content author
    if (content && content.user_id && content.username) {
      navigate(`/direct-message/${content.user_id}/${content.username}`);
    } else {
      alert('Unable to start conversation. User information not available.');
    }
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
        user.id,
        user.username,
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
      await commentService.deleteComment(commentId, user.id);
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleUploadClick = () => {
    navigate('/upload');
  };

  const handleExploreClick = () => {
    navigate('/explore');
  };

  // const handleDraftsClick = () => {
  //   navigate('/drafts');
  // };

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
            {/* <div className="display-icon drafts" title="Drafts" onClick={handleDraftsClick}></div> */}
            <div className="display-icon bell" title="Notifications"></div>
            <div className="display-profile-dropdown" ref={dropdownRef}>
              <button onClick={handleProfileClick} className="display-profile-btn">
                {userProfilePic ? (
                  <img
                    src={userProfilePic}
                    alt="Profile Picture"
                    className="display-profile-pic"
                  />
                ) : (
                  <div className="display-profile-pic-placeholder">Profile</div>
                )}
              </button>
              {showProfileDropdown && (
                <div className="display-dropdown-menu">
                  <div className="display-dropdown-username">
                    {user?.username || 'User'}
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
                  {/* <button 
                    onClick={() => handleDropdownItemClick('/drafts')}
                    className="display-dropdown-item"
                  >
                    My Drafts
                  </button> */}
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

  if (error || !content) {
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
            {/* <div className="display-icon drafts" title="Drafts" onClick={handleDraftsClick}></div> */}
            <div className="display-icon bell" title="Notifications"></div>
            <div className="display-profile-dropdown" ref={dropdownRef}>
              <button onClick={handleProfileClick} className="display-profile-btn">
                {userProfilePic ? (
                  <img
                    src={userProfilePic}
                    alt="Profile Picture"
                    className="display-profile-pic"
                  />
                ) : (
                  <div className="display-profile-pic-placeholder">Profile</div>
                )}
              </button>
              {showProfileDropdown && (
                <div className="display-dropdown-menu">
                  <div className="display-dropdown-username">
                    {user?.username || 'User'}
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
                  {/* <button 
                    onClick={() => handleDropdownItemClick('/drafts')}
                    className="display-dropdown-item"
                  >
                    My Drafts
                  </button> */}
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
          <p>{error || (isVideo ? 'Video not found' : 'Image not found')}</p>
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
          {/* <div className="display-icon drafts" title="Drafts" onClick={handleDraftsClick}></div> */}
          <div className="display-icon bell" title="Notifications"></div>
          <div className="display-profile-dropdown" ref={dropdownRef}>
            <button onClick={handleProfileClick} className="display-profile-btn">
              {userProfilePic ? (
                <img
                  src={userProfilePic}
                  alt="Profile Picture"
                  className="display-profile-pic"
                />
              ) : (
                <div className="display-profile-pic-placeholder">Profile</div>
              )}
            </button>
            {showProfileDropdown && (
              <div className="display-dropdown-menu">
                <div className="display-dropdown-username">
                  {user?.username || 'User'}
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
                {/* <button 
                  onClick={() => handleDropdownItemClick('/drafts')}
                  className="display-dropdown-item"
                >
                  My Drafts
                </button> */}
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
          {isVideo ? (
            <video 
              src={content?.url} 
              controls 
              className="display-video"
              style={{ width: '100%', maxHeight: '600px' }}
            />
          ) : (
            <img src={content?.url} alt={content?.description || "Image"} className="display-img" />
          )}
          <div className="display-info">
            <h2 className="display-title">{content?.description || "Untitled"}</h2>
            <p className="display-author">by {content?.username || "Unknown"}</p>
            {content?.genre && (
              <span className="display-genre">{content.genre}</span>
            )}
            <div className="display-description">
              {content?.description || "No description available"}
            </div>
            <div className="display-actions">
              <div className="display-action-column">
                <button 
                  onClick={handleLike} 
                  className={`display-like-btn ${liked ? 'liked' : ''}`}
                >
                  ❤️ Like ({likeCount})
                </button>
                <button 
                  onClick={handleDislike} 
                  className={`display-dislike-btn ${disliked ? 'disliked' : ''}`}
                >
                  👎 Dislike ({dislikeCount})
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
                    {comment.user_id === user.id && (
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