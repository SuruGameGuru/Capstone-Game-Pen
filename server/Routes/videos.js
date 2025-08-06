// server/Routes/videos.js
const express = require('express');
const router = express.Router();
const multer = require('../multerConfig');
const { authenticateToken } = require('../middleware/auth');
const pool = require('../db');
const cloudinary = require('../cloudinaryConfig');

// Upload video (public or draft) - WITH AUTHENTICATION
router.post('/upload', authenticateToken, multer.single('video'), async (req, res) => {
  try {
    // Use optional chaining and provide defaults for req.body fields
    const description = req.body?.description || '';
    const genre = req.body?.genre || '';
    const isPublic = req.body?.isPublic === 'true' || req.body?.isPublic === true || true;
    const userId = req.user.id; // Use authenticated user ID
    
    if (!req.file) {
      return res.status(400).json({ message: 'No video file provided' });
    }

    // Upload to Cloudinary manually since we're using memory storage
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'game-pen-videos',
          resource_type: 'video',
          allowed_formats: ['mp4', 'mov', 'avi', 'webm', 'mkv'],
          transformation: [
            { width: 1280, height: 720, crop: 'limit' },
            { quality: 'auto' }
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(req.file.buffer);
    });

    const videoUrl = uploadResult.secure_url;
    
    const query = `
      INSERT INTO videos (user_id, url, description, is_public, genre)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [userId, videoUrl, description, isPublic, genre];
    const result = await pool.query(query, values);
    
    res.status(201).json({
      message: 'Video uploaded successfully',
      video: result.rows[0]
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading video' });
  }
});

// Get videos (with filters: public, drafts, genre, user)
router.get('/', async (req, res) => {
  try {
    const { genre, user_id, is_public, limit = 20, offset = 0 } = req.query;
    
    let query = 'SELECT v.*, u.username FROM videos v JOIN users u ON v.user_id = u.id WHERE 1=1';
    const values = [];
    let paramCount = 0;
    
    if (genre) {
      paramCount++;
      query += ` AND v.genre = $${paramCount}`;
      values.push(genre);
    }
    
    if (user_id) {
      paramCount++;
      query += ` AND v.user_id = $${paramCount}`;
      values.push(user_id);
    }
    
    if (is_public !== undefined) {
      paramCount++;
      query += ` AND v.is_public = $${paramCount}`;
      values.push(is_public === 'true');
    }
    
    query += ` ORDER BY v.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(parseInt(limit), parseInt(offset));
    
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ message: 'Error fetching videos' });
  }
});

// Get single video by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT v.*, u.username,
             (SELECT COUNT(*) FROM video_likes WHERE video_id = v.id) as like_count,
             (SELECT COUNT(*) FROM video_dislikes WHERE video_id = v.id) as dislike_count
      FROM videos v 
      JOIN users u ON v.user_id = u.id 
      WHERE v.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ message: 'Error fetching video' });
  }
});

// Get latest videos
router.get('/latest/:limit', async (req, res) => {
  try {
    const { limit = 10 } = req.params;
    
    const query = `
      SELECT v.*, u.username 
      FROM videos v 
      JOIN users u ON v.user_id = u.id 
      WHERE v.is_public = true 
      ORDER BY v.created_at DESC 
      LIMIT $1
    `;
    
    const result = await pool.query(query, [parseInt(limit)]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get latest videos error:', error);
    res.status(500).json({ message: 'Error fetching latest videos' });
  }
});

// Check if user has liked a video - WITH AUTHENTICATION
router.get('/:id/check-like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const query = `
      SELECT COUNT(*) as count 
      FROM video_likes 
      WHERE video_id = $1 AND user_id = $2
    `;
    
    const result = await pool.query(query, [id, userId]);
    const hasLiked = parseInt(result.rows[0].count) > 0;
    
    res.json({ hasLiked });
  } catch (error) {
    console.error('Check video like error:', error);
    res.status(500).json({ message: 'Error checking video like status' });
  }
});

// Like a video - WITH AUTHENTICATION
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if already liked
    const checkQuery = `
      SELECT COUNT(*) as count 
      FROM video_likes 
      WHERE video_id = $1 AND user_id = $2
    `;
    
    const checkResult = await pool.query(checkQuery, [id, userId]);
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      return res.status(400).json({ message: 'Video already liked' });
    }
    
    // Remove dislike if it exists (cross-switching)
    await pool.query(
      'DELETE FROM video_dislikes WHERE video_id = $1 AND user_id = $2',
      [id, userId]
    );
    
    // Add like
    const insertQuery = `
      INSERT INTO video_likes (video_id, user_id)
      VALUES ($1, $2)
    `;
    
    await pool.query(insertQuery, [id, userId]);
    
    res.json({ message: 'Video liked successfully' });
  } catch (error) {
    console.error('Like video error:', error);
    res.status(500).json({ message: 'Error liking video' });
  }
});

// Unlike a video - WITH AUTHENTICATION
router.delete('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const query = `
      DELETE FROM video_likes 
      WHERE video_id = $1 AND user_id = $2
    `;
    
    const result = await pool.query(query, [id, userId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Like not found' });
    }
    
    res.json({ message: 'Video unliked successfully' });
  } catch (error) {
    console.error('Unlike video error:', error);
    res.status(500).json({ message: 'Error unliking video' });
  }
});

// Get video like count
router.get('/:id/likes', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT COUNT(*) as count 
      FROM video_likes 
      WHERE video_id = $1
    `;
    
    const result = await pool.query(query, [id]);
    const likeCount = parseInt(result.rows[0].count);
    
    res.json({ likeCount });
  } catch (error) {
    console.error('Get video likes error:', error);
    res.status(500).json({ message: 'Error fetching video likes' });
  }
});

// Dislike a video - WITH AUTHENTICATION
router.post('/:id/dislike', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if already disliked
    const checkQuery = `
      SELECT COUNT(*) as count 
      FROM video_dislikes 
      WHERE video_id = $1 AND user_id = $2
    `;
    
    const checkResult = await pool.query(checkQuery, [id, userId]);
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      return res.status(400).json({ message: 'Video already disliked' });
    }
    
    // Remove like if it exists (cross-switching)
    await pool.query(
      'DELETE FROM video_likes WHERE video_id = $1 AND user_id = $2',
      [id, userId]
    );
    
    // Add dislike
    const insertQuery = `
      INSERT INTO video_dislikes (video_id, user_id)
      VALUES ($1, $2)
    `;
    
    await pool.query(insertQuery, [id, userId]);
    
    res.json({ message: 'Video disliked successfully' });
  } catch (error) {
    console.error('Dislike video error:', error);
    res.status(500).json({ message: 'Error disliking video' });
  }
});

// Undislike a video - WITH AUTHENTICATION
router.post('/:id/undislike', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const query = `
      DELETE FROM video_dislikes 
      WHERE video_id = $1 AND user_id = $2
    `;
    
    const result = await pool.query(query, [id, userId]);
    
    if (result.rowCount === 0) {
      return res.status(400).json({ message: 'Dislike not found' });
    }
    
    res.json({ message: 'Video undisliked successfully' });
  } catch (error) {
    console.error('Undislike video error:', error);
    res.status(500).json({ message: 'Error undisliking video' });
  }
});

// Check if user has disliked a video - WITH AUTHENTICATION
router.get('/:id/check-dislike', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const query = `
      SELECT COUNT(*) as count 
      FROM video_dislikes 
      WHERE video_id = $1 AND user_id = $2
    `;
    
    const result = await pool.query(query, [id, userId]);
    const hasDisliked = parseInt(result.rows[0].count) > 0;
    
    res.json({ hasDisliked });
  } catch (error) {
    console.error('Check video dislike error:', error);
    res.status(500).json({ message: 'Error checking video dislike status' });
  }
});

// Get video dislike count
router.get('/:id/dislikes', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT COUNT(*) as count 
      FROM video_dislikes 
      WHERE video_id = $1
    `;
    
    const result = await pool.query(query, [id]);
    const dislikeCount = parseInt(result.rows[0].count);
    
    res.json({ dislikeCount });
  } catch (error) {
    console.error('Get video dislikes error:', error);
    res.status(500).json({ message: 'Error fetching video dislikes' });
  }
});

// Delete video - WITH AUTHENTICATION (only video owner)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if user owns the video
    const checkQuery = `
      SELECT user_id FROM videos WHERE id = $1
    `;
    
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this video' });
    }
    
    // Delete video likes first (due to foreign key constraint)
    await pool.query('DELETE FROM video_likes WHERE video_id = $1', [id]);
    
    // Delete video dislikes first (due to foreign key constraint)
    await pool.query('DELETE FROM video_dislikes WHERE video_id = $1', [id]);
    
    // Delete the video
    const deleteQuery = `
      DELETE FROM videos WHERE id = $1
    `;
    
    await pool.query(deleteQuery, [id]);
    
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ message: 'Error deleting video' });
  }
});

module.exports = router; 