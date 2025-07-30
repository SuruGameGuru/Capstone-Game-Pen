const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get user's friends list
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(`
      SELECT f.*, u.username, u.id as friend_user_id
      FROM friends f
      JOIN users u ON (f.friend_id = u.id OR f.user_id = u.id)
      WHERE (f.user_id = $1 OR f.friend_id = $1) 
      AND f.status = 'accepted'
      AND u.id != $1
    `, [userId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Failed to get friends' });
  }
});

// Get pending friend requests
router.get('/:userId/requests', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(`
      SELECT fr.*, u.username, u.id as from_user_id
      FROM friend_requests fr
      JOIN users u ON fr.from_user_id = u.id
      WHERE fr.to_user_id = $1 AND fr.status = 'pending'
    `, [userId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ error: 'Failed to get friend requests' });
  }
});

// Send friend request
router.post('/request', async (req, res) => {
  try {
    const { fromUserId, toUserId } = req.body;
    
    if (!fromUserId || !toUserId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (fromUserId === toUserId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }
    
    // Check if already friends or request exists
    const existingFriend = await pool.query(`
      SELECT * FROM friends 
      WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)
    `, [fromUserId, toUserId]);
    
    if (existingFriend.rows.length > 0) {
      return res.status(400).json({ error: 'Already friends or request pending' });
    }
    
    const existingRequest = await pool.query(`
      SELECT * FROM friend_requests 
      WHERE (from_user_id = $1 AND to_user_id = $2) OR (from_user_id = $2 AND to_user_id = $1)
    `, [fromUserId, toUserId]);
    
    if (existingRequest.rows.length > 0) {
      return res.status(400).json({ error: 'Friend request already exists' });
    }
    
    const result = await pool.query(`
      INSERT INTO friend_requests (from_user_id, to_user_id)
      VALUES ($1, $2)
      RETURNING *
    `, [fromUserId, toUserId]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

// Accept friend request
router.post('/accept', async (req, res) => {
  try {
    const { requestId, userId } = req.body;
    
    // Update request status
    await pool.query(`
      UPDATE friend_requests 
      SET status = 'accepted' 
      WHERE id = $1 AND to_user_id = $2
    `, [requestId, userId]);
    
    // Get the request details
    const requestResult = await pool.query(`
      SELECT * FROM friend_requests WHERE id = $1
    `, [requestId]);
    
    if (requestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Friend request not found' });
    }
    
    const request = requestResult.rows[0];
    
    // Add to friends table
    await pool.query(`
      INSERT INTO friends (user_id, friend_id, status)
      VALUES ($1, $2, 'accepted'), ($2, $1, 'accepted')
    `, [request.from_user_id, request.to_user_id]);
    
    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ error: 'Failed to accept friend request' });
  }
});

// Reject friend request
router.post('/reject', async (req, res) => {
  try {
    const { requestId, userId } = req.body;
    
    await pool.query(`
      UPDATE friend_requests 
      SET status = 'rejected' 
      WHERE id = $1 AND to_user_id = $2
    `, [requestId, userId]);
    
    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ error: 'Failed to reject friend request' });
  }
});

// Remove friend
router.delete('/:userId/:friendId', async (req, res) => {
  try {
    const { userId, friendId } = req.params;
    
    await pool.query(`
      DELETE FROM friends 
      WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)
    `, [userId, friendId]);
    
    res.json({ message: 'Friend removed' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

// Check if users are friends
router.get('/:userId/:friendId/status', async (req, res) => {
  try {
    const { userId, friendId } = req.params;
    
    const result = await pool.query(`
      SELECT status FROM friends 
      WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)
    `, [userId, friendId]);
    
    if (result.rows.length > 0) {
      res.json({ status: result.rows[0].status });
    } else {
      res.json({ status: 'not_friends' });
    }
  } catch (error) {
    console.error('Check friend status error:', error);
    res.status(500).json({ error: 'Failed to check friend status' });
  }
});

module.exports = router; 