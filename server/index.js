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
  socket.on('join-genre-channel', (genre) => {
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
      fromUserId: socket.id,
      fromUsername: data.fromUsername || 'Anonymous',
      toUserId: data.toUserId,
      message: data.message,
      timestamp: new Date().toISOString()
    };
    
    // Send to recipient
    io.to(data.toUserId).emit('direct-message', messageData);
    // Send back to sender for confirmation
    socket.emit('direct-message-sent', messageData);
    
    // Save message to database (optional)
    saveDirectMessageToDatabase(messageData);
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

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
