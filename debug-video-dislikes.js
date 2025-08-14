const { Pool } = require('pg');
const axios = require('axios');

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://gamepen_db_user:v9pZ79pQHXSc1A53mpkkKfaUQ9KKN0Br@dpg-d20h6g6mcj7s73b65fmg-a.ohio-postgres.render.com/gamepen_db',
  ssl: { rejectUnauthorized: false },
});

// API connection
const API_BASE_URL = 'https://gamepen-backend.onrender.com/api';

async function debugVideoDislikes() {
  try {
    console.log('🔍 Comprehensive Video Dislikes Debug...\n');

    // 1. Check database tables
    console.log('1. Database Tables Check:');
    
    const tables = ['videos', 'video_likes', 'video_dislikes', 'users'];
    for (const table of tables) {
      const exists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        );
      `, [table]);
      console.log(`   ${table}: ${exists.rows[0].exists ? '✅ EXISTS' : '❌ MISSING'}`);
    }

    // 2. Check if there are any videos in the database
    console.log('\n2. Videos in Database:');
    const videosResult = await pool.query('SELECT COUNT(*) as count FROM videos');
    const videoCount = parseInt(videosResult.rows[0].count);
    console.log(`   Found ${videoCount} videos`);

    if (videoCount > 0) {
      const sampleVideo = await pool.query('SELECT id, description FROM videos LIMIT 1');
      console.log(`   Sample video ID: ${sampleVideo.rows[0].id}`);
      console.log(`   Sample video description: ${sampleVideo.rows[0].description}`);
    }

    // 3. Check if there are any users in the database
    console.log('\n3. Users in Database:');
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(usersResult.rows[0].count);
    console.log(`   Found ${userCount} users`);

    if (userCount > 0) {
      const sampleUser = await pool.query('SELECT id, username FROM users LIMIT 1');
      console.log(`   Sample user ID: ${sampleUser.rows[0].id}`);
      console.log(`   Sample username: ${sampleUser.rows[0].username}`);
    }

    // 4. Test video_dislikes table structure
    console.log('\n4. video_dislikes Table Structure:');
    try {
      const structure = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'video_dislikes'
        ORDER BY ordinal_position
      `);
      
      if (structure.rows.length > 0) {
        structure.rows.forEach(col => {
          console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
      } else {
        console.log('   ❌ No columns found - table might not exist properly');
      }
    } catch (error) {
      console.log(`   ❌ Error checking structure: ${error.message}`);
    }

    // 5. Test backend endpoints (if we have a video and user)
    if (videoCount > 0 && userCount > 0) {
      console.log('\n5. Backend Endpoints Test:');
      
      const videoId = (await pool.query('SELECT id FROM videos LIMIT 1')).rows[0].id;
      console.log(`   Testing with video ID: ${videoId}`);

      // Test video get endpoint
      try {
        const videoResponse = await axios.get(`${API_BASE_URL}/videos/${videoId}`);
        console.log(`   ✅ GET /videos/${videoId}: ${videoResponse.status}`);
        console.log(`   Video data:`, {
          id: videoResponse.data.id,
          like_count: videoResponse.data.like_count,
          dislike_count: videoResponse.data.dislike_count
        });
      } catch (error) {
        console.log(`   ❌ GET /videos/${videoId}: ${error.response?.status || error.message}`);
      }

      // Test video dislikes endpoint
      try {
        const dislikesResponse = await axios.get(`${API_BASE_URL}/videos/${videoId}/dislikes`);
        console.log(`   ✅ GET /videos/${videoId}/dislikes: ${dislikesResponse.status}`);
        console.log(`   Dislike count: ${dislikesResponse.data.dislikeCount}`);
      } catch (error) {
        console.log(`   ❌ GET /videos/${videoId}/dislikes: ${error.response?.status || error.message}`);
      }
    }

    // 6. Check for any existing video dislikes
    console.log('\n6. Existing Video Dislikes:');
    try {
      const dislikesResult = await pool.query('SELECT COUNT(*) as count FROM video_dislikes');
      const dislikeCount = parseInt(dislikesResult.rows[0].count);
      console.log(`   Found ${dislikeCount} video dislikes`);
      
      if (dislikeCount > 0) {
        const sampleDislike = await pool.query('SELECT * FROM video_dislikes LIMIT 1');
        console.log(`   Sample dislike:`, sampleDislike.rows[0]);
      }
    } catch (error) {
      console.log(`   ❌ Error checking dislikes: ${error.message}`);
    }

    // 7. Test a simple insert into video_dislikes
    console.log('\n7. Testing video_dislikes Insert:');
    if (videoCount > 0 && userCount > 0) {
      const videoId = (await pool.query('SELECT id FROM videos LIMIT 1')).rows[0].id;
      const userId = (await pool.query('SELECT id FROM users LIMIT 1')).rows[0].id;
      
      try {
        // First, delete any existing dislike for this user/video
        await pool.query('DELETE FROM video_dislikes WHERE user_id = $1 AND video_id = $2', [userId, videoId]);
        
        // Try to insert a test dislike
        const insertResult = await pool.query(
          'INSERT INTO video_dislikes (user_id, video_id) VALUES ($1, $2) RETURNING *',
          [userId, videoId]
        );
        console.log(`   ✅ Test insert successful:`, insertResult.rows[0]);
        
        // Clean up the test data
        await pool.query('DELETE FROM video_dislikes WHERE user_id = $1 AND video_id = $2', [userId, videoId]);
        console.log(`   ✅ Test data cleaned up`);
      } catch (error) {
        console.log(`   ❌ Test insert failed: ${error.message}`);
      }
    }

    console.log('\n✅ Debug completed!');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

debugVideoDislikes();
