import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Friends.css';

const Friends = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Mock user data (replace with real auth when implemented)
  const currentUser = {
    id: 1,
    username: 'TestUser'
  };

  useEffect(() => {
    fetchFriends();
    fetchPendingRequests();
  }, []);

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

  const fetchFriends = async () => {
    try {
      const response = await fetch(`/api/friends/${currentUser.id}`);
      if (response.ok) {
        const friendsData = await response.json();
        setFriends(friendsData);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch(`/api/friends/${currentUser.id}/requests`);
      if (response.ok) {
        const requestsData = await response.json();
        setPendingRequests(requestsData);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          userId: currentUser.id
        }),
      });

      if (response.ok) {
        fetchFriends();
        fetchPendingRequests();
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const response = await fetch('/api/friends/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          userId: currentUser.id
        }),
      });

      if (response.ok) {
        fetchPendingRequests();
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      const response = await fetch(`/api/friends/${currentUser.id}/${friendId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchFriends();
      }
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const handleMessageFriend = (friendId, friendUsername) => {
    // Navigate to direct message with this friend
    navigate(`/direct-message/${friendId}/${friendUsername}`);
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

  const filteredFriends = friends.filter(friend => 
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="friends-page">
        <header className="friends-header">
          <Link to="/" className="friends-logo-title">
            <span className="game">GAME</span>
            <span className="pen">PEN</span>
          </Link>
          
          <div className="friends-search">
            <input
              type="text"
              placeholder="Search Friends..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <div className="friends-icons">
            <div className="friends-icon upload" title="Upload" onClick={handleUploadClick}></div>
            <div className="friends-icon file" title="Explore" onClick={handleExploreClick}></div>
            <div className="friends-icon drafts" title="Drafts" onClick={handleDraftsClick}></div>
            <div className="friends-icon bell" title="Notifications"></div>
            <div className="friends-profile-dropdown" ref={dropdownRef}>
              <button onClick={handleProfileClick} className="friends-profile-btn">
                Profile ▼
              </button>
              {showProfileDropdown && (
                <div className="friends-dropdown-menu">
                  <div className="friends-dropdown-username">
                    {currentUser.username}
                  </div>
                  <button 
                    onClick={() => handleDropdownItemClick('/profile')}
                    className="friends-dropdown-item"
                  >
                    My Profile
                  </button>
                  <button 
                    onClick={() => handleDropdownItemClick('/upload')}
                    className="friends-dropdown-item"
                  >
                    Upload Content
                  </button>
                  <button 
                    onClick={() => handleDropdownItemClick('/drafts')}
                    className="friends-dropdown-item"
                  >
                    My Drafts
                  </button>
                  <button 
                    onClick={() => handleDropdownItemClick('/friends')}
                    className="friends-dropdown-item"
                  >
                    Friends
                  </button>
                  <div className="friends-dropdown-divider"></div>
                  <button 
                    onClick={handleLogout}
                    className="friends-dropdown-item friends-dropdown-logout"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="friends-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="friends-page">
      {/* Fixed Top Navigation Bar */}
      <header className="friends-header">
        <Link to="/" className="friends-logo-title">
          <span className="game">GAME</span>
          <span className="pen">PEN</span>
        </Link>
        
        <div className="friends-search">
          <input
            type="text"
            placeholder="Search Friends..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="friends-icons">
          <div className="friends-icon upload" title="Upload" onClick={handleUploadClick}></div>
          <div className="friends-icon file" title="Explore" onClick={handleExploreClick}></div>
          <div className="friends-icon drafts" title="Drafts" onClick={handleDraftsClick}></div>
          <div className="friends-icon bell" title="Notifications"></div>
          <div className="friends-profile-dropdown" ref={dropdownRef}>
            <button onClick={handleProfileClick} className="friends-profile-btn">
              Profile ▼
            </button>
            {showProfileDropdown && (
              <div className="friends-dropdown-menu">
                <div className="friends-dropdown-username">
                  {currentUser.username}
                </div>
                <button 
                  onClick={() => handleDropdownItemClick('/profile')}
                  className="friends-dropdown-item"
                >
                  My Profile
                </button>
                <button 
                  onClick={() => handleDropdownItemClick('/upload')}
                  className="friends-dropdown-item"
                >
                  Upload Content
                </button>
                <button 
                  onClick={() => handleDropdownItemClick('/drafts')}
                  className="friends-dropdown-item"
                >
                  My Drafts
                </button>
                <button 
                  onClick={() => handleDropdownItemClick('/friends')}
                  className="friends-dropdown-item"
                >
                  Friends
                </button>
                <div className="friends-dropdown-divider"></div>
                <button 
                  onClick={handleLogout}
                  className="friends-dropdown-item friends-dropdown-logout"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="friends-container">
        <h1 className="friends-title">Friends</h1>

        {/* Pending Friend Requests */}
        {pendingRequests.length > 0 && (
          <div className="friends-section">
            <h2 className="section-title">Pending Friend Requests ({pendingRequests.length})</h2>
            <div className="friends-grid">
              {pendingRequests.map((request) => (
                <div key={request.id} className="friend-card pending">
                  <div className="friend-avatar">
                    {request.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="friend-info">
                    <h3 className="friend-name">{request.username}</h3>
                    <p className="friend-status">Wants to be your friend</p>
                  </div>
                  <div className="friend-actions">
                    <button 
                      onClick={() => handleAcceptRequest(request.id)}
                      className="friend-action-btn accept"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleRejectRequest(request.id)}
                      className="friend-action-btn reject"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div className="friends-section">
          <h2 className="section-title">Your Friends ({filteredFriends.length})</h2>
          {filteredFriends.length === 0 ? (
            <div className="no-friends">
              <p>You don't have any friends yet.</p>
              <p>Start chatting in genre channels to make new friends!</p>
            </div>
          ) : (
            <div className="friends-grid">
              {filteredFriends.map((friend) => (
                <div key={friend.id} className="friend-card">
                  <div className="friend-avatar">
                    {friend.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="friend-info">
                    <h3 className="friend-name">{friend.username}</h3>
                    <p className="friend-status">Friend</p>
                  </div>
                  <div className="friend-actions">
                    <button 
                      onClick={() => handleMessageFriend(friend.friend_user_id || friend.user_id, friend.username)}
                      className="friend-action-btn message"
                    >
                      Message
                    </button>
                    <button 
                      onClick={() => handleRemoveFriend(friend.friend_user_id || friend.user_id)}
                      className="friend-action-btn remove"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends; 