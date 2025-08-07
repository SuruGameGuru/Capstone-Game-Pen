import React, { useState, useEffect, useRef, useCallback } from 'react';
import chatService from '../services/chatService';
import { profileService } from '../services/profileService';
import UserPopup from './UserPopup';
import '../styles/GenreChannel.css';

const GenreChannel = ({ genre, username, userId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [userProfilePics, setUserProfilePics] = useState({});
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Memoize callback functions to prevent unnecessary re-renders
  const handleGenreMessage = useCallback((messageData) => {
    setMessages(prev => [...prev, messageData]);
  }, []);

  const handleUserJoined = useCallback((userData) => {
    setOnlineUsers(prev => new Set([...prev, userData.username]));
    // Fetch profile picture for the new user
    if (userData.username && userData.username !== username) {
      fetchUserProfilePic(userData.username);
    }
  }, [username]);

  const handleUserLeft = useCallback((userData) => {
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userData.username);
      return newSet;
    });
  }, []);

  const handleChannelUsers = useCallback((data) => {
    if (data.genre === genre) {
      const userList = data.users.map(user => user.username);
      setOnlineUsers(new Set([...userList, username])); // Include current user
      
      // Fetch profile pictures for all users
      userList.forEach(userUsername => {
        if (userUsername !== username) {
          fetchUserProfilePic(userUsername);
        }
      });
    }
  }, [genre, username]);

  const handleGenreMessagesLoaded = useCallback((data) => {
    console.log('🎯 GenreChannel: Received loaded messages for', data.genre, ':', data.messages);
    if (data.genre === genre) {
      console.log('✅ GenreChannel: Setting messages for', genre, ':', data.messages.length, 'messages');
      setMessages(data.messages);
    } else {
      console.log('❌ GenreChannel: Genre mismatch. Expected:', genre, 'Received:', data.genre);
    }
  }, [genre]);

  const handleGenreMessagesError = useCallback((data) => {
    console.log('❌ GenreChannel: Error loading messages for', data.genre, ':', data.message);
    if (data.genre === genre) {
      console.error('Failed to load genre messages:', data.message);
    }
  }, [genre]);

  const handleTypingIndicator = useCallback((data) => {
    if (data.userId !== chatService.socket?.id) {
      if (data.username) {
        setTypingUsers(prev => new Set([...prev, data.username]));
      } else {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.username);
          return newSet;
        });
      }
    }
  }, []);

  const handleUserClick = (userUsername) => {
    // Don't show popup for current user
    if (userUsername === username) return;
    
    setSelectedUser({
      id: `user-${userUsername}`, // Mock user ID - in real app this would come from the server
      username: userUsername
    });
    setShowUserPopup(true);
  };

  const handleCloseUserPopup = () => {
    setShowUserPopup(false);
    setSelectedUser(null);
  };

  // Fetch profile picture for a user
  const fetchUserProfilePic = async (username) => {
    try {
      // This would need to be implemented based on your backend API
      // For now, we'll use a placeholder approach
      const profileData = await profileService.getUserProfileByUsername(username);
      if (profileData && profileData.profilePicture) {
        setUserProfilePics(prev => ({
          ...prev,
          [username]: profileData.profilePicture
        }));
      }
    } catch (error) {
      console.error('Error fetching profile picture for', username, ':', error);
    }
  };

  // Get user avatar (profile pic or initial)
  const getUserAvatar = (username) => {
    const profilePic = userProfilePics[username];
    if (profilePic) {
      return (
        <img 
          src={profilePic} 
          alt={`${username}'s profile`} 
          className="user-avatar-img"
        />
      );
    }
    return (
      <div className="user-avatar-initial">
        {username.charAt(0).toUpperCase()}
      </div>
    );
  };

  useEffect(() => {
    console.log('🔄 GenreChannel: useEffect triggered for genre:', genre);
    
    // Connect to chat service
    chatService.connect({ username, userId });

    // Join the genre channel
    console.log('🔄 GenreChannel: Joining channel:', genre);
    chatService.joinGenreChannel(genre, username);

    // Register message callbacks
    console.log('🔄 GenreChannel: Registering callbacks for genre:', genre);
    chatService.onMessage('genre', handleGenreMessage);
    chatService.onMessage('user-joined', handleUserJoined);
    chatService.onMessage('user-left', handleUserLeft);
    chatService.onMessage('channel-users', handleChannelUsers);
    chatService.onMessage('genre-messages-loaded', handleGenreMessagesLoaded);
    chatService.onMessage('genre-messages-error', handleGenreMessagesError);

    // Listen for typing indicators
    chatService.listenForTyping(handleTypingIndicator);

    // Cleanup on unmount
    return () => {
      console.log('🔄 GenreChannel: Cleanup for genre:', genre);
      chatService.leaveGenreChannel(genre);
      chatService.offMessage('genre');
      chatService.offMessage('user-joined');
      chatService.offMessage('user-left');
      chatService.offMessage('channel-users');
      chatService.offMessage('genre-messages-loaded');
      chatService.offMessage('genre-messages-error');
      // Don't clear all callbacks as it prevents message loading when rejoining
      // chatService.clearAllCallbacks();
    };
  }, [genre, username, userId, handleGenreMessage, handleUserJoined, handleUserLeft, handleChannelUsers, handleGenreMessagesLoaded, handleGenreMessagesError, handleTypingIndicator]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (newMessage.trim()) {
      chatService.sendGenreMessage(genre, newMessage.trim(), username);
      setNewMessage('');
      stopTyping();
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      chatService.startTyping(genre, null, username);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1000);
  };

  const stopTyping = () => {
    setIsTyping(false);
    chatService.stopTyping(genre, null, username);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="genre-channel-container">
      {/* User Sidebar */}
      <div className="genre-channel-sidebar">
        <div className="sidebar-header">
          <h3>Online Users</h3>
          <span className="user-count">{onlineUsers.size}</span>
        </div>
        <div className="user-list">
          {Array.from(onlineUsers).map((user, index) => (
            <div 
              key={index} 
              className="user-item"
              onClick={() => handleUserClick(user)}
              style={{ cursor: user === username ? 'default' : 'pointer' }}
            >
              <div className="user-avatar">
                {getUserAvatar(user)}
              </div>
              <span className="user-name">{user}</span>
              {user === username && <span className="current-user-indicator">(You)</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="genre-channel">
        <div className="channel-header">
          <h2>#{genre} Channel</h2>
          <div className="online-users">
            <span className="online-count">{onlineUsers.size} online</span>
          </div>
        </div>

        <div className="messages-container">
          {messages.map((message) => (
            <div key={message.id} className="message">
              <div className="message-header">
                <span 
                  className="message-username"
                  onClick={() => handleUserClick(message.username)}
                  style={{ cursor: message.username === username ? 'default' : 'pointer' }}
                >
                  {message.username}
                </span>
                <span className="message-time">{formatTime(message.timestamp)}</span>
              </div>
              <div className="message-content">{message.message}</div>
            </div>
          ))}
          
          {typingUsers.size > 0 && (
            <div className="typing-indicator">
              {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder={`Message #${genre}...`}
            className="message-input"
          />
          <button type="submit" className="send-button" disabled={!newMessage.trim()}>
            Send
          </button>
        </form>
      </div>

      {/* User Popup */}
      {showUserPopup && selectedUser && (
        <UserPopup 
          user={selectedUser}
          onClose={handleCloseUserPopup}
          currentUserId={userId}
        />
      )}
    </div>
  );
};

export default GenreChannel; 