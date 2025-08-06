// server/migrate-video-tables.js
const { Pool } = require('pg');
require('dotenv').config();

// Use Render's DATABASE_URL if available, otherwise fall back to individual env vars
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DB_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  // Fallback to individual env vars if DATABASE_URL not available
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'gamepen_db',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

const videoTablesSQL = `
-- Create videos table for game demos
CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  genre VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create video likes table
CREATE TABLE IF NOT EXISTS video_likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, video_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_genre ON videos(genre);
CREATE INDEX IF NOT EXISTS idx_videos_is_public ON videos(is_public);
CREATE INDEX IF NOT EXISTS idx_video_likes_user_id ON video_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_video_likes_video_id ON video_likes(video_id);
`;

async function migrateVideoTables() {
  try {
    console.log('🔄 Starting video tables migration...');
    
    // Execute the migration
    await pool.query(videoTablesSQL);
    
    console.log('✅ Video tables migration completed successfully!');
    console.log('📋 Created tables:');
    console.log('   - videos');
    console.log('   - video_likes');
    console.log('   - Related indexes');
    
    // Verify tables were created
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('videos', 'video_likes')
      ORDER BY table_name;
    `);
    
    console.log('🔍 Verification - Tables found:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateVideoTables();
}

module.exports = { migrateVideoTables }; 