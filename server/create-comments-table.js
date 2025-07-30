const pool = require('./db');

async function createCommentsTable() {
  try {
    console.log('Creating comments database table...');

    // Create comments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        image_id INTEGER REFERENCES images(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        username VARCHAR(255) NOT NULL,
        comment_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ comments table created');

    // Add indexes for faster queries
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_comments_image_id ON comments (image_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments (user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments (created_at);`);
    console.log('✅ Comments table indexes created');

    console.log('✅ Comments table created successfully!');
  } catch (error) {
    console.error('Error creating comments table:', error);
  } finally {
    await pool.end();
  }
}

createCommentsTable(); 