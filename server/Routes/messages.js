// server/Routes/messages.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const pool = require('../db');

// Create DM channel (just create a message entry for now) - TEMPORARILY DISABLED AUTH FOR TESTING
router.post('/start', async (req, res) => {
  try {
    const { receiver_id, content } = req.body;
    const sender_id = 1; // Temporary hardcoded user ID for testing
    
    if (!receiver_id || !content) {
      return res.status(400).json({ message: 'Receiver ID and content are required' });
    }
    
    const query = `
      INSERT INTO messages (sender_id, receiver_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [sender_id, receiver_id, content];
    const result = await pool.query(query, values);
    
    res.status(201).json({
      message: 'Message sent successfully',
      messageData: result.rows[0]
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Get conversation between two users - TEMPORARILY DISABLED AUTH FOR TESTING
router.get('/conversation/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = 1; // Temporary hardcoded user ID for testing
    
    const query = `
      SELECT m.*, u.username as sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = $1 AND m.receiver_id = $2)
         OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at ASC
    `;
    
    const result = await pool.query(query, [currentUserId, userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Error fetching conversation' });
  }
});

// Get all conversations for current user - TEMPORARILY DISABLED AUTH FOR TESTING
router.get('/conversations', async (req, res) => {
  try {
    const currentUserId = 1; // Temporary hardcoded user ID for testing
    
    const query = `
      SELECT DISTINCT 
        CASE 
          WHEN m.sender_id = $1 THEN m.receiver_id
          ELSE m.sender_id
        END as other_user_id,
        u.username as other_user_name,
        m.content as last_message,
        m.created_at as last_message_time
      FROM messages m
      JOIN users u ON (
        CASE 
          WHEN m.sender_id = $1 THEN m.receiver_id
          ELSE m.sender_id
        END = u.id
      )
      WHERE m.sender_id = $1 OR m.receiver_id = $1
      ORDER BY m.created_at DESC
    `;
    
    const result = await pool.query(query, [currentUserId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Error fetching conversations' });
  }
});

module.exports = router; 