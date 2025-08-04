import io from 'socket.io-client';

class ChatService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.messageCallbacks = new Map();
    this.typingCallbacks = new Map();
    this.registeredListeners = new Set(); // Track registered listeners
  }

  // Connect to Socket.IO server
  connect(userInfo = null) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:3001');

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
      this.isConnected = true;
      
      if (userInfo) {
        this.socket.emit('set-user-info', userInfo);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      this.isConnected = false;
    });

    // Register global message loading listeners
    this.socket.on('genre-messages-loaded', (data) => {
      this.notifyMessageCallbacks('genre-messages-loaded', data);
    });

    this.socket.on('genre-messages-error', (data) => {
      this.notifyMessageCallbacks('genre-messages-error', data);
    });

    return this.socket;
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.registeredListeners.clear();
    }
  }

  // Join a genre channel
  joinGenreChannel(genre, username) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    
    this.socket.emit('join-genre-channel', genre);
    
    // Only register listeners once per channel
    const channelKey = `genre-${genre}`;
    if (!this.registeredListeners.has(channelKey)) {
      // Listen for messages in this channel
      this.socket.on('genre-message', (messageData) => {
        if (messageData.genre === genre) {
          this.notifyMessageCallbacks('genre', messageData);
        }
      });

      // Listen for user join/leave events
      this.socket.on('user-joined', (userData) => {
        if (userData.genre === genre) {
          this.notifyMessageCallbacks('user-joined', userData);
        }
      });

      this.socket.on('user-left', (userData) => {
        if (userData.genre === genre) {
          this.notifyMessageCallbacks('user-left', userData);
        }
      });

      // Listen for channel users list
      this.socket.on('channel-users', (data) => {
        if (data.genre === genre) {
          this.notifyMessageCallbacks('channel-users', data);
        }
      });

      // Message loading listeners are now global (registered in connect method)
      // this.socket.on('genre-messages-loaded', (data) => {
      //   if (data.genre === genre) {
      //     this.notifyMessageCallbacks('genre-messages-loaded', data);
      //   }
      // });

      // this.socket.on('genre-messages-error', (data) => {
      //   if (data.genre === genre) {
      //     this.notifyMessageCallbacks('genre-messages-error', data);
      //   }
      // });

      this.registeredListeners.add(channelKey);
    }
  }

  // Leave a genre channel
  leaveGenreChannel(genre) {
    if (!this.socket) return;
    
    this.socket.emit('leave-genre-channel', genre);
    
    // Remove listeners for this channel
    const channelKey = `genre-${genre}`;
    if (this.registeredListeners.has(channelKey)) {
      this.socket.off('genre-message');
      this.socket.off('user-joined');
      this.socket.off('user-left');
      this.socket.off('channel-users');
      // Don't remove message loading listeners as they're needed when rejoining
      // this.socket.off('genre-messages-loaded');
      // this.socket.off('genre-messages-error');
      this.registeredListeners.delete(channelKey);
    }
  }

  // Send message to genre channel
  sendGenreMessage(genre, message, username) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    
    this.socket.emit('send-genre-message', {
      genre,
      message,
      username
    });
  }

  // Send direct message
  sendDirectMessage(toUserId, message, fromUsername) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    
    this.socket.emit('send-direct-message', {
      toUserId,
      message,
      fromUsername
    });
  }

  // Listen for direct messages
  listenForDirectMessages(callback) {
    if (!this.socket) return;
    
    this.socket.on('direct-message', callback);
    this.socket.on('direct-message-sent', callback);
  }

  // Typing indicators
  startTyping(genre = null, toUserId = null, username) {
    if (!this.socket) return;
    
    this.socket.emit('typing-start', {
      genre,
      toUserId,
      username
    });
  }

  stopTyping(genre = null, toUserId = null) {
    if (!this.socket) return;
    
    this.socket.emit('typing-stop', {
      genre,
      toUserId
    });
  }

  // Listen for typing indicators
  listenForTyping(callback) {
    if (!this.socket) return;
    
    this.socket.on('user-typing', callback);
    this.socket.on('user-stopped-typing', callback);
  }

  // Register message callbacks
  onMessage(type, callback) {
    if (!this.messageCallbacks.has(type)) {
      this.messageCallbacks.set(type, []);
    }
    this.messageCallbacks.get(type).push(callback);
  }

  // Remove message callbacks
  offMessage(type, callback = null) {
    if (this.messageCallbacks.has(type)) {
      if (callback) {
        const callbacks = this.messageCallbacks.get(type);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      } else {
        // Remove all callbacks for this type
        this.messageCallbacks.delete(type);
      }
    }
  }

  // Notify message callbacks
  notifyMessageCallbacks(type, data) {
    if (this.messageCallbacks.has(type)) {
      this.messageCallbacks.get(type).forEach(callback => {
        callback(data);
      });
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }

  // Clear all callbacks (useful for cleanup)
  clearAllCallbacks() {
    this.messageCallbacks.clear();
    this.typingCallbacks.clear();
  }
}

// Create singleton instance
const chatService = new ChatService();
export default chatService; 