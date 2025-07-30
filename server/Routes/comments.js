const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get comments for an image
router.get('/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    
    const result = await pool.query(`
      SELECT c.*, u.username 
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.image_id = $1
      ORDER BY c.created_at DESC
    `, [imageId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to get comments' });
  }
});

// Add a comment to an image
router.post('/', async (req, res) => {
  try {
    const { imageId, userId, username, commentText } = req.body;
    
    if (!imageId || !userId || !username || !commentText) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = await pool.query(`
      INSERT INTO comments (image_id, user_id, username, comment_text)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [imageId, userId, username, commentText]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Delete a comment (only by the comment author)
router.delete('/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId } = req.body; // In a real app, this would come from auth middleware
    
    const result = await pool.query(`
      DELETE FROM comments 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [commentId, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found or unauthorized' });
    }
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router; 