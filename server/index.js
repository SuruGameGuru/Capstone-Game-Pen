const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./Routes/auth'));
app.use('/api/images', require('./Routes/images'));
app.use('/api/messages', require('./Routes/messages'));
app.use('/api/comments', require('./Routes/comments'));
app.use('/api/friends', require('./Routes/friends'));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Track users in channels
const channelUsers = new Map(); // genre -> Set of socket IDs
const socketUsers = new Map(); // socket ID -> { username, userId, channels }

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a genre channel
  socket.on('join-genre-channel', async (genre) => {
    socket.join(genre);
    
    // Track user in channel
    if (!channelUsers.has(genre)) {
      channelUsers.set(genre, new Set());
    }
    channelUsers.get(genre).add(socket.id);
    
    // Track socket's channels
    if (!socketUsers.has(socket.id)) {
      socketUsers.set(socket.id, { 
        username: socket.username || 'Anonymous', 
        userId: socket.userId || 'temp-user-id',
        channels: new Set()
      });
    }
    socketUsers.get(socket.id).channels.add(genre);
    
    // Notify others in the channel
    socket.to(genre).emit('user-joined', {
      userId: socket.id,
      username: socket.username || 'Anonymous',
      genre: genre
    });
    
    // Send current users list to the joining user
    const currentUsers = Array.from(channelUsers.get(genre))
      .map(socketId => socketUsers.get(socketId))
      .filter(user => user && user.username !== 'Anonymous');
    
    socket.emit('channel-users', {
      genre: genre,
      users: currentUsers
    });
    
    // Load existing messages for the genre channel
    try {
      console.log(`🔄 Server: Loading messages for genre: ${genre}`);
      const messages = await loadGenreMessages(genre);
      console.log(`✅ Server: Loaded ${messages.length} messages for genre: ${genre}`);
      socket.emit('genre-messages-loaded', {
        genre: genre,
        messages: messages
      });
      console.log(`📤 Server: Sent genre-messages-loaded event for genre: ${genre}`);
    } catch (error) {
      console.error('❌ Server: Error loading genre messages:', error);
      socket.emit('genre-messages-error', { 
        genre: genre,
        message: 'Failed to load messages' 
      });
    }
    
    console.log(`User ${socket.username || 'Anonymous'} joined ${genre} channel`);
  });

  // Leave a genre channel
  socket.on('leave-genre-channel', (genre) => {
    socket.leave(genre);
    
    // Remove user from channel tracking
    if (channelUsers.has(genre)) {
      channelUsers.get(genre).delete(socket.id);
      if (channelUsers.get(genre).size === 0) {
        channelUsers.delete(genre);
      }
    }
    
    // Remove channel from socket's channels
    if (socketUsers.has(socket.id)) {
      socketUsers.get(socket.id).channels.delete(genre);
    }
    
    // Notify others in the channel
    socket.to(genre).emit('user-left', {
      userId: socket.id,
      username: socket.username || 'Anonymous',
      genre: genre
    });
    
    console.log(`User ${socket.username || 'Anonymous'} left ${genre} channel`);
  });

  // Send message to genre channel
  socket.on('send-genre-message', (data) => {
    const messageData = {
      id: Date.now(),
      userId: socket.id,
      username: data.username || 'Anonymous',
      message: data.message,
      genre: data.genre,
      timestamp: new Date().toISOString()
    };
    
    io.to(data.genre).emit('genre-message', messageData);
    
    // Save message to database (optional)
    saveMessageToDatabase(messageData);
  });

  // Direct messaging
  socket.on('send-direct-message', (data) => {
    const messageData = {
      id: Date.now(),
      fromUserId: socket.userId || socket.id,
      fromUsername: socket.username || data.fromUsername || 'Anonymous',
      toUserId: data.toUserId,
      message: data.message,
      timestamp: new Date().toISOString()
    };
    
    // Send to recipient
    io.to(data.toUserId).emit('direct-message', messageData);
    // Send back to sender for confirmation
    socket.emit('direct-message-sent', messageData);
    
    // Save message to database
    saveDirectMessageToDatabase(messageData);
  });

  // Load direct messages
  socket.on('load-direct-messages', async (data) => {
    try {
      const { fromUserId, toUserId } = data;
      const messages = await loadDirectMessages(fromUserId, toUserId);
      socket.emit('direct-messages-loaded', messages);
    } catch (error) {
      console.error('Error loading direct messages:', error);
      socket.emit('direct-messages-error', { message: 'Failed to load messages' });
    }
  });

  // Typing indicators
  socket.on('typing-start', (data) => {
    socket.to(data.genre || data.toUserId).emit('user-typing', {
      userId: socket.id,
      username: data.username || 'Anonymous'
    });
  });

  socket.on('typing-stop', (data) => {
    socket.to(data.genre || data.toUserId).emit('user-stopped-typing', {
      userId: socket.id
    });
  });

  // Set user information
  socket.on('set-user-info', (userInfo) => {
    socket.username = userInfo.username;
    socket.userId = userInfo.userId;
    
    // Update tracking
    if (socketUsers.has(socket.id)) {
      socketUsers.get(socket.id).username = userInfo.username;
      socketUsers.get(socket.id).userId = userInfo.userId;
    } else {
      socketUsers.set(socket.id, {
        username: userInfo.username,
        userId: userInfo.userId,
        channels: new Set()
      });
    }
    
    console.log(`User ${userInfo.username} (${userInfo.userId}) connected`);
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove user from all channels
    if (socketUsers.has(socket.id)) {
      const userData = socketUsers.get(socket.id);
      userData.channels.forEach(genre => {
        if (channelUsers.has(genre)) {
          channelUsers.get(genre).delete(socket.id);
          if (channelUsers.get(genre).size === 0) {
            channelUsers.delete(genre);
          }
          
          // Notify others in the channel
          socket.to(genre).emit('user-left', {
            userId: socket.id,
            username: userData.username,
            genre: genre
          });
        }
      });
      
      socketUsers.delete(socket.id);
    }
  });
});

// Helper function to save messages to database
async function saveMessageToDatabase(messageData) {
  try {
    const pool = require('./db');
    const query = `
      INSERT INTO chat_messages (user_id, username, message, genre, timestamp)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await pool.query(query, [
      messageData.userId,
      messageData.username,
      messageData.message,
      messageData.genre,
      messageData.timestamp
    ]);
  } catch (error) {
    console.error('Error saving message to database:', error);
  }
}

// Helper function to save direct messages to database
async function saveDirectMessageToDatabase(messageData) {
  try {
    const pool = require('./db');
    const query = `
      INSERT INTO direct_messages (from_user_id, from_username, to_user_id, message, timestamp)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await pool.query(query, [
      messageData.fromUserId,
      messageData.fromUsername,
      messageData.toUserId,
      messageData.message,
      messageData.timestamp
    ]);
  } catch (error) {
    console.error('Error saving direct message to database:', error);
  }
}

// Helper function to delete old messages (older than 72 hours)
async function deleteOldMessages() {
  try {
    const pool = require('./db');
    const query = `
      DELETE FROM direct_messages 
      WHERE timestamp < NOW() - INTERVAL '72 hours'
    `;
    const result = await pool.query(query);
    console.log(`Deleted ${result.rowCount} old direct messages`);
  } catch (error) {
    console.error('Error deleting old messages:', error);
  }
}

// Helper function to delete old chat messages (older than 72 hours)
async function deleteOldChatMessages() {
  try {
    const pool = require('./db');
    const query = `
      DELETE FROM chat_messages 
      WHERE timestamp < NOW() - INTERVAL '72 hours'
    `;
    const result = await pool.query(query);
    console.log(`Deleted ${result.rowCount} old chat messages`);
  } catch (error) {
    console.error('Error deleting old chat messages:', error);
  }
}

// Helper function to load direct messages from database
async function loadDirectMessages(fromUserId, toUserId) {
  try {
    const pool = require('./db');
    const query = `
      SELECT id, from_user_id, from_username, to_user_id, message, timestamp
      FROM direct_messages
      WHERE (from_user_id = $1 AND to_user_id = $2) OR (from_user_id = $2 AND to_user_id = $1)
      ORDER BY timestamp ASC
    `;
    const result = await pool.query(query, [fromUserId, toUserId]);
    return result.rows;
  } catch (error) {
    console.error('Error loading direct messages from database:', error);
    throw error;
  }
}

// Helper function to load genre messages from database
async function loadGenreMessages(genre) {
  try {
    console.log(`🔄 Server: loadGenreMessages called for genre: ${genre}`);
    const pool = require('./db');
    const query = `
      SELECT id, user_id, username, message, genre, timestamp
      FROM chat_messages
      WHERE genre = $1
      ORDER BY timestamp ASC
    `;
    const result = await pool.query(query, [genre]);
    console.log(`✅ Server: loadGenreMessages found ${result.rows.length} messages for genre: ${genre}`);
    return result.rows;
  } catch (error) {
    console.error('❌ Server: Error loading genre messages from database:', error);
    throw error;
  }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Schedule auto-deletion of old messages (every hour)
  setInterval(() => {
    deleteOldMessages();
    deleteOldChatMessages();
  }, 60 * 60 * 1000); // Run every hour
  
  // Run initial cleanup
  deleteOldMessages();
  deleteOldChatMessages();
});
