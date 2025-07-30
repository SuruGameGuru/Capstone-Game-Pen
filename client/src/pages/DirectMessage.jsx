import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import chatService from '../services/chatService';
import '../styles/DirectMessage.css';

const DirectMessage = () => {
  const { friendId, friendUsername } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Mock user data (replace with real auth when implemented)
  const currentUser = {
    id: 1,
    username: 'TestUser'
  };

  useEffect(() => {
    // Connect to chat service
    chatService.connect({ username: currentUser.username, userId: currentUser.id });
    
    // Load existing messages (this would come from the database in a real app)
    setIsLoading(false);
  }, [friendId]);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      id: Date.now(),
      fromUserId: currentUser.id,
      fromUsername: currentUser.username,
      toUserId: friendId,
      message: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, messageData]);
    setNewMessage('');

    // Send via chat service
    try {
      chatService.sendDirectMessage(friendId, newMessage.trim(), currentUser.username);
    } catch (error) {
      console.error('Error sending message:', error);
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

  const handleFriendsClick = () => {
    navigate('/friends');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <div className="direct-message-page">
        <header className="direct-message-header">
          <Link to="/" className="direct-message-logo-title">
            <span className="game">GAME</span>
            <span className="pen">PEN</span>
          </Link>
          
          <div className="direct-message-search">
            <input
              type="text"
              placeholder="Search Users..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <div className="direct-message-icons">
            <div className="direct-message-icon upload" title="Upload" onClick={handleUploadClick}></div>
            <div className="direct-message-icon file" title="Explore" onClick={handleExploreClick}></div>
            <div className="direct-message-icon drafts" title="Drafts" onClick={handleDraftsClick}></div>
            <div className="direct-message-icon bell" title="Notifications"></div>
            <div className="direct-message-profile-dropdown" ref={dropdownRef}>
              <button onClick={handleProfileClick} className="direct-message-profile-btn">
                Profile ▼
              </button>
              {showProfileDropdown && (
                <div className="direct-message-dropdown-menu">
                  <div className="direct-message-dropdown-username">
                    {currentUser.username}
                  </div>
                  <button 
                    onClick={() => handleDropdownItemClick('/profile')}
                    className="direct-message-dropdown-item"
                  >
                    My Profile
                  </button>
                  <button 
                    onClick={() => handleDropdownItemClick('/upload')}
                    className="direct-message-dropdown-item"
                  >
                    Upload Content
                  </button>
                  <button 
                    onClick={() => handleDropdownItemClick('/drafts')}
                    className="direct-message-dropdown-item"
                  >
                    My Drafts
                  </button>
                  <button 
                    onClick={() => handleDropdownItemClick('/friends')}
                    className="direct-message-dropdown-item"
                  >
                    Friends
                  </button>
                  <div className="direct-message-dropdown-divider"></div>
                  <button 
                    onClick={handleLogout}
                    className="direct-message-dropdown-item direct-message-dropdown-logout"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="direct-message-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="direct-message-page">
      {/* Fixed Top Navigation Bar */}
      <header className="direct-message-header">
        <Link to="/" className="direct-message-logo-title">
          <span className="game">GAME</span>
          <span className="pen">PEN</span>
        </Link>
        
        <div className="direct-message-search">
          <input
            type="text"
            placeholder="Search Users..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="direct-message-icons">
          <div className="direct-message-icon upload" title="Upload" onClick={handleUploadClick}></div>
          <div className="direct-message-icon file" title="Explore" onClick={handleExploreClick}></div>
          <div className="direct-message-icon drafts" title="Drafts" onClick={handleDraftsClick}></div>
          <div className="direct-message-icon bell" title="Notifications"></div>
          <div className="direct-message-profile-dropdown" ref={dropdownRef}>
            <button onClick={handleProfileClick} className="direct-message-profile-btn">
              Profile ▼
            </button>
            {showProfileDropdown && (
              <div className="direct-message-dropdown-menu">
                <div className="direct-message-dropdown-username">
                  {currentUser.username}
                </div>
                <button 
                  onClick={() => handleDropdownItemClick('/profile')}
                  className="direct-message-dropdown-item"
                >
                  My Profile
                </button>
                <button 
                  onClick={() => handleDropdownItemClick('/upload')}
                  className="direct-message-dropdown-item"
                >
                  Upload Content
                </button>
                <button 
                  onClick={() => handleDropdownItemClick('/drafts')}
                  className="direct-message-dropdown-item"
                >
                  My Drafts
                </button>
                <button 
                  onClick={() => handleDropdownItemClick('/friends')}
                  className="direct-message-dropdown-item"
                >
                  Friends
                </button>
                <div className="direct-message-dropdown-divider"></div>
                <button 
                  onClick={handleLogout}
                  className="direct-message-dropdown-item direct-message-dropdown-logout"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="direct-message-container">
        {/* Chat Header */}
        <div className="direct-message-chat-header">
          <button onClick={() => navigate(-1)} className="back-btn">
            ← Back
          </button>
          <div className="chat-info">
            <div className="friend-avatar">
              {friendUsername.charAt(0).toUpperCase()}
            </div>
            <div className="friend-details">
              <h2 className="friend-name">{friendUsername}</h2>
              <span className="chat-status">Direct Message</span>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="direct-message-messages">
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.fromUserId === currentUser.id ? 'sent' : 'received'}`}
              >
                <div className="message-content">
                  <p>{message.message}</p>
                  <span className="message-time">{formatTime(message.timestamp)}</span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="direct-message-input-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${friendUsername}...`}
            className="direct-message-input"
          />
          <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default DirectMessage; 