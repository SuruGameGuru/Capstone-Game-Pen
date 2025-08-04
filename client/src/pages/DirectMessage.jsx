import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import chatService from '../services/chatService';
import '../styles/DirectMessage.css';

const DirectMessage = () => {
  const { friendId, friendUsername } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Connect to chat service with real user data
    chatService.connect({ username: user.username, userId: user.id });
    
    // Load existing messages from database
    loadMessages();
    
    // Listen for new direct messages
    chatService.listenForDirectMessages((message) => {
      // Prevent duplicates by checking if message already exists
      setMessages(prev => {
        const messageExists = prev.some(existingMsg => 
          existingMsg.id === message.id || 
          (existingMsg.fromUserId === message.fromUserId && 
           existingMsg.message === message.message && 
           Math.abs(new Date(existingMsg.timestamp) - new Date(message.timestamp)) < 1000)
        );
        
        if (messageExists) {
          return prev; // Don't add duplicate
        }
        return [...prev, message];
      });
    });
    
    setIsLoading(false);
    
    return () => {
      chatService.offMessage('direct-message');
    };
  }, [user, friendId, navigate]);

  const loadMessages = async () => {
    try {
      // Request messages from server
      chatService.socket.emit('load-direct-messages', {
        fromUserId: user.id,
        toUserId: friendId
      });
      
      // Listen for loaded messages
      chatService.socket.once('direct-messages-loaded', (loadedMessages) => {
        setMessages(loadedMessages);
        setIsLoading(false);
      });
      
      chatService.socket.once('direct-messages-error', (error) => {
        console.error('Failed to load messages:', error);
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Error loading messages:', error);
      setIsLoading(false);
    }
  };

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
    if (!newMessage.trim() || !user) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    // Send via chat service - let the server handle message delivery
    try {
      chatService.sendDirectMessage(friendId, messageText, user.username);
    } catch (error) {
      console.error('Error sending message:', error);
      // If sending failed, restore the message to input
      setNewMessage(messageText);
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
    // Use authService for proper logout
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
                    {user?.username || 'User'}
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
                  {user?.username || 'User'}
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
                className={`message ${message.fromUserId === user.id ? 'sent' : 'received'}`}
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