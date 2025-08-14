const pool = require('./db');

async function migrateVideoDislikes() {
  try {
    console.log('🔄 Starting video_dislikes table migration...');

    // Create video_dislikes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS video_dislikes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, video_id)
      );
    `);
    console.log('✅ video_dislikes table created');

    // Create indexes for better performance
    await pool.query('CREATE INDEX IF NOT EXISTS idx_video_dislikes_user_id ON video_dislikes(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_video_dislikes_video_id ON video_dislikes(video_id)');
    console.log('✅ video_dislikes indexes created');

    // Verify table was created
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'video_dislikes'
      );
    `);

    if (tableExists.rows[0].exists) {
      console.log('✅ video_dislikes table migration completed successfully!');
      
      // Show table structure
      const tableStructure = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'video_dislikes'
        ORDER BY ordinal_position
      `);
      
      console.log('\n📋 video_dislikes table structure:');
      tableStructure.rows.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    } else {
      console.log('❌ video_dislikes table was not created');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
migrateVideoDislikes(); 