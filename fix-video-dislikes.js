const { Pool } = require('pg');

// Use the same database configuration as your app
const pool = new Pool({
  connectionString: 'postgresql://gamepen_db_user:v9pZ79pQHXSc1A53mpkkKfaUQ9KKN0Br@dpg-d20h6g6mcj7s73b65fmg-a.ohio-postgres.render.com/gamepen_db',
  ssl: { rejectUnauthorized: false },
});

async function fixVideoDislikes() {
  try {
    console.log('🔍 Analyzing video_dislikes table...');
    
    // 1. Check if video_dislikes table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'video_dislikes'
      );
    `);

    if (tableExists.rows[0].exists) {
      console.log('✅ video_dislikes table exists');
    } else {
      console.log('❌ video_dislikes table does not exist - creating it...');
      
      // Create the table following the same pattern as the working dislikes table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS video_dislikes (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, video_id)
        );
      `);
      
      // Create indexes for better performance
      await pool.query('CREATE INDEX IF NOT EXISTS idx_video_dislikes_user_id ON video_dislikes(user_id)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_video_dislikes_video_id ON video_dislikes(video_id)');
      
      console.log('✅ video_dislikes table created successfully');
    }

    // 2. Check if dislikes table exists (for comparison)
    const dislikesTableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'dislikes'
      );
    `);

    if (dislikesTableExists.rows[0].exists) {
      console.log('✅ dislikes table exists (for images)');
    } else {
      console.log('❌ dislikes table does not exist (for images)');
    }

    // 3. Show table structures for comparison
    console.log('\n📋 Table structures:');
    
    if (tableExists.rows[0].exists) {
      const videoDislikesStructure = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'video_dislikes'
        ORDER BY ordinal_position
      `);
      
      console.log('\nvideo_dislikes table:');
      videoDislikesStructure.rows.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    if (dislikesTableExists.rows[0].exists) {
      const dislikesStructure = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'dislikes'
        ORDER BY ordinal_position
      `);
      
      console.log('\ndislikes table (for images):');
      dislikesStructure.rows.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    // 4. Test the video_dislikes table with a sample query
    console.log('\n🧪 Testing video_dislikes table...');
    try {
      const testQuery = await pool.query('SELECT COUNT(*) as count FROM video_dislikes');
      console.log(`✅ video_dislikes table is working - contains ${testQuery.rows[0].count} records`);
    } catch (error) {
      console.log('❌ video_dislikes table test failed:', error.message);
    }

    console.log('\n✅ Video dislikes fix completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

fixVideoDislikes();
