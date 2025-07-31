import React, { useState, useEffect, useRef } from 'react';
import chatService from '../services/chatService';
import '../styles/DirectMessage.css';

const DirectMessage = ({ recipientId, recipientUsername, currentUsername, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Connect to chat service
    chatService.connect({ username: currentUsername, userId: currentUserId });

    // Listen for direct messages
    chatService.listenForDirectMessages((messageData) => {
      if (messageData.fromUserId === recipientId || messageData.toUserId === recipientId) {
        setMessages(prev => [...prev, messageData]);
      }
    });

    // Listen for typing indicators
    chatService.listenForTyping((data) => {
      if (data.userId === recipientId) {
        if (data.username) {
          setIsRecipientTyping(true);
        } else {
          setIsRecipientTyping(false);
        }
      }
    });

    // Cleanup on unmount
    return () => {
      chatService.disconnect();
    };
  }, [recipientId, recipientUsername, currentUsername, currentUserId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (newMessage.trim()) {
      chatService.sendDirectMessage(recipientId, newMessage.trim(), currentUsername);
      setNewMessage('');
      stopTyping();
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      chatService.startTyping(null, recipientId, currentUsername);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1000);
  };

  const stopTyping = () => {
    setIsTyping(false);
    chatService.stopTyping(null, recipientId);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isOwnMessage = (message) => {
    return message.fromUserId === currentUserId || message.toUserId === recipientId;
  };

  return (
    <div className="direct-message">
      <div className="dm-header">
        <h2>Message with {recipientUsername}</h2>
        {isRecipientTyping && (
          <span className="typing-status">{recipientUsername} is typing...</span>
        )}
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${isOwnMessage(message) ? 'own-message' : 'other-message'}`}
          >
            <div className="message-header">
              <span className="message-username">{message.fromUsername}</span>
              <span className="message-time">{formatTime(message.timestamp)}</span>
            </div>
            <div className="message-content">{message.message}</div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          placeholder={`Message ${recipientUsername}...`}
          className="message-input"
        />
        <button type="submit" className="send-button" disabled={!newMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default DirectMessage; 