// server/Routes/images.js
const express = require('express');
const router = express.Router();
const multer = require('../multerConfig');
const { authenticateToken } = require('../middleware/auth');
const pool = require('../db');
const cloudinary = require('../cloudinaryConfig');

// Upload image (public or draft) - WITH AUTHENTICATION
router.post('/upload', authenticateToken, multer.single('image'), async (req, res) => {
  try {
    // Use optional chaining and provide defaults for req.body fields
    const description = req.body?.description || '';
    const genre = req.body?.genre || '';
    const isPublic = req.body?.isPublic === 'true' || req.body?.isPublic === true || true;
    const userId = req.user.id; // Use authenticated user ID
    
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Upload to Cloudinary manually since we're using memory storage
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'game-pen-uploads',
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(req.file.buffer);
    });

    const imageUrl = uploadResult.secure_url;
    
    const query = `
      INSERT INTO images (user_id, url, description, is_public, genre)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [userId, imageUrl, description, isPublic, genre];
    const result = await pool.query(query, values);
    
    res.status(201).json({
      message: 'Image uploaded successfully',
      image: result.rows[0]
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading image' });
  }
});

// Get images (with filters: public, drafts, genre, user)
router.get('/', async (req, res) => {
  try {
    const { genre, user_id, is_public, limit = 20, offset = 0 } = req.query;
    
    let query = 'SELECT i.*, u.username FROM images i JOIN users u ON i.user_id = u.id WHERE 1=1';
    const values = [];
    let paramCount = 0;
    
    if (genre) {
      paramCount++;
      query += ` AND i.genre = $${paramCount}`;
      values.push(genre);
    }
    
    if (user_id) {
      paramCount++;
      query += ` AND i.user_id = $${paramCount}`;
      values.push(user_id);
    }
    
    if (is_public !== undefined) {
      paramCount++;
      query += ` AND i.is_public = $${paramCount}`;
      values.push(is_public === 'true');
    }
    
    query += ` ORDER BY i.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(parseInt(limit), parseInt(offset));
    
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ message: 'Error fetching images' });
  }
});

// Check if user has liked an image - WITH AUTHENTICATION (must come before /:id)
router.get('/:id/check-like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Use authenticated user ID
    
    const result = await pool.query(
      'SELECT * FROM likes WHERE user_id = $1 AND image_id = $2',
      [userId, id]
    );
    
    res.json({ liked: result.rows.length > 0 });
  } catch (error) {
    console.error('Check like error:', error);
    res.status(500).json({ message: 'Error checking like status' });
  }
});

// Dislike image - WITH AUTHENTICATION (must come before /:id)
router.post('/:id/dislike', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Use authenticated user ID
    
    // Check if already disliked
    const existingDislike = await pool.query(
      'SELECT * FROM dislikes WHERE user_id = $1 AND image_id = $2',
      [userId, id]
    );
    
    if (existingDislike.rows.length > 0) {
      return res.status(400).json({ message: 'Already disliked this image' });
    }
    
    // Remove like if it exists (cross-switching)
    const likeDeleteResult = await pool.query(
      'DELETE FROM likes WHERE user_id = $1 AND image_id = $2',
      [userId, id]
    );
    console.log(`🔍 Dislike endpoint: Deleted ${likeDeleteResult.rowCount} likes for user ${userId}, image ${id}`);
    
    // Add dislike
    await pool.query(
      'INSERT INTO dislikes (user_id, image_id) VALUES ($1, $2)',
      [userId, id]
    );
    
    res.json({ message: 'Image disliked successfully' });
  } catch (error) {
    console.error('Dislike error:', error);
    res.status(500).json({ message: 'Error disliking image' });
  }
});

// Undislike image - WITH AUTHENTICATION (must come before /:id)
router.post('/:id/undislike', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Use authenticated user ID
    
    const result = await pool.query(
      'DELETE FROM dislikes WHERE user_id = $1 AND image_id = $2',
      [userId, id]
    );
    
    if (result.rowCount === 0) {
      return res.status(400).json({ message: 'Dislike not found' });
    }
    
    res.json({ message: 'Image undisliked successfully' });
  } catch (error) {
    console.error('Undislike error:', error);
    res.status(500).json({ message: 'Error undisliking image' });
  }
});

// Check if user has disliked an image - WITH AUTHENTICATION (must come before /:id)
router.get('/:id/check-dislike', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Use authenticated user ID
    
    const result = await pool.query(
      'SELECT * FROM dislikes WHERE user_id = $1 AND image_id = $2',
      [userId, id]
    );
    
    res.json({ disliked: result.rows.length > 0 });
  } catch (error) {
    console.error('Check dislike error:', error);
    res.status(500).json({ message: 'Error checking dislike status' });
  }
});

// Like image - WITH AUTHENTICATION (must come before /:id)
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Use authenticated user ID
    
    // Check if already liked
    const existingLike = await pool.query(
      'SELECT * FROM likes WHERE user_id = $1 AND image_id = $2',
      [userId, id]
    );
    
    if (existingLike.rows.length > 0) {
      return res.status(400).json({ message: 'Already liked this image' });
    }
    
    // Remove dislike if it exists (cross-switching)
    const dislikeDeleteResult = await pool.query(
      'DELETE FROM dislikes WHERE user_id = $1 AND image_id = $2',
      [userId, id]
    );
    console.log(`🔍 Like endpoint: Deleted ${dislikeDeleteResult.rowCount} dislikes for user ${userId}, image ${id}`);
    
    // Add like
    await pool.query(
      'INSERT INTO likes (user_id, image_id) VALUES ($1, $2)',
      [userId, id]
    );
    
    res.json({ message: 'Image liked successfully' });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ message: 'Error liking image' });
  }
});

// Unlike image - WITH AUTHENTICATION (must come before /:id)
router.post('/:id/unlike', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Use authenticated user ID
    
    const result = await pool.query(
      'DELETE FROM likes WHERE user_id = $1 AND image_id = $2',
      [userId, id]
    );
    
    if (result.rowCount === 0) {
      return res.status(400).json({ message: 'Like not found' });
    }
    
    res.json({ message: 'Image unliked successfully' });
  } catch (error) {
    console.error('Unlike error:', error);
    res.status(500).json({ message: 'Error unliking image' });
  }
});

// Get single image by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT i.*, u.username, 
             (SELECT COUNT(*) FROM likes WHERE image_id = i.id) as like_count,
             (SELECT COUNT(*) FROM dislikes WHERE image_id = i.id) as dislike_count
      FROM images i 
      JOIN users u ON i.user_id = u.id 
      WHERE i.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({ message: 'Error fetching image' });
  }
});

// Update image description - WITH AUTHENTICATION
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { description, genre } = req.body;
    const userId = req.user.id; // Use authenticated user ID
    
    // Check if image exists and belongs to user
    const checkQuery = 'SELECT * FROM images WHERE id = $1 AND user_id = $2';
    const checkResult = await pool.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Image not found or access denied' });
    }
    
    // Update the image
    const updateQuery = `
      UPDATE images 
      SET description = COALESCE($1, description), 
          genre = COALESCE($2, genre)
      WHERE id = $3 AND user_id = $4
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [description, genre, id, userId]);
    
    res.json({
      message: 'Image updated successfully',
      image: result.rows[0]
    });
  } catch (error) {
    console.error('Update image error:', error);
    res.status(500).json({ message: 'Error updating image' });
  }
});

// Delete image - WITH AUTHENTICATION
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Use authenticated user ID
    
    // Get image details first
    const imageResult = await pool.query(
      'SELECT * FROM images WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (imageResult.rows.length === 0) {
      return res.status(404).json({ message: 'Image not found or unauthorized' });
    }
    
    const image = imageResult.rows[0];
    
    // Delete from Cloudinary
    if (image.url) {
      const publicId = image.url.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }
    
    // Delete likes first (due to foreign key constraint)
    await pool.query('DELETE FROM likes WHERE image_id = $1', [id]);
    
    // Delete comments first (due to foreign key constraint)
    await pool.query('DELETE FROM comments WHERE image_id = $1', [id]);
    
    // Delete the image
    await pool.query('DELETE FROM images WHERE id = $1', [id]);
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: 'Error deleting image' });
  }
});

module.exports = router; 