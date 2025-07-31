import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UserPopup.css';

const UserPopup = ({ user, onClose, currentUserId }) => {
  const navigate = useNavigate();
  const [isFriend, setIsFriend] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    // Check if users are friends
    checkFriendStatus();
    
    // Close popup when clicking outside
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [user.id]);

  const checkFriendStatus = async () => {
    try {
      const response = await fetch(`/api/friends/${currentUserId}/${user.id}/status`);
      if (response.ok) {
        const data = await response.json();
        setIsFriend(data.status === 'accepted');
        setIsRequestSent(data.status === 'pending');
      }
    } catch (error) {
      console.error('Error checking friend status:', error);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromUserId: currentUserId,
          toUserId: user.id
        }),
      });

      if (response.ok) {
        setIsRequestSent(true);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Failed to send friend request');
    }
  };

  const handleRemoveFriend = async () => {
    try {
      const response = await fetch(`/api/friends/${currentUserId}/${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIsFriend(false);
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('Failed to remove friend');
    }
  };

  const handleMessageUser = () => {
    navigate(`/direct-message/${user.id}/${user.username}`);
    onClose();
  };

  return (
    <div className="user-popup-overlay">
      <div className="user-popup" ref={popupRef}>
        <div className="user-popup-header">
          <div className="user-popup-avatar">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="user-popup-info">
            <h3 className="user-popup-name">{user.username}</h3>
            <span className="user-popup-status">Online</span>
          </div>
          <button onClick={onClose} className="user-popup-close">
            ×
          </button>
        </div>
        
        <div className="user-popup-actions">
          <button 
            onClick={handleMessageUser}
            className="user-popup-action-btn message"
          >
            💬 Message
          </button>
          
          {!isFriend && !isRequestSent && (
            <button 
              onClick={handleSendFriendRequest}
              className="user-popup-action-btn friend"
            >
              👥 Add Friend
            </button>
          )}
          
          {isRequestSent && (
            <button 
              className="user-popup-action-btn pending"
              disabled
            >
              ⏳ Request Sent
            </button>
          )}
          
          {isFriend && (
            <button 
              onClick={handleRemoveFriend}
              className="user-popup-action-btn remove"
            >
              ❌ Remove Friend
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPopup; 