const axios = require('axios');
require('dotenv').config({ path: './server/.env' });

const API_URL = 'http://localhost:3001/api';

async function debugGenreMessages() {
  try {
    console.log('🔍 DEBUGGING GENRE MESSAGE PERSISTENCE');
    console.log('=====================================\n');

    console.log('1. Testing login for user...');
    
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test456@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    
    console.log('✅ User logged in:', user.username, '(ID:', user.id, ')');
    
    console.log('\n2. Testing database connection and message insertion...');
    
    const { Pool } = require('pg');
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    // Test inserting a new message
    const insertQuery = `
      INSERT INTO chat_messages (user_id, username, message, genre, timestamp)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, user_id, username, message, genre, timestamp
    `;
    
    const testMessage = `Debug test message at ${new Date().toLocaleTimeString()}`;
    const testGenre = 'Action';
    
    const insertResult = await pool.query(insertQuery, [
      user.id,
      user.username,
      testMessage,
      testGenre,
      new Date().toISOString()
    ]);
    
    console.log('✅ Message inserted:', insertResult.rows[0]);
    
    console.log('\n3. Testing message retrieval for Action channel...');
    
    const selectQuery = `
      SELECT id, user_id, username, message, genre, timestamp
      FROM chat_messages
      WHERE genre = $1
      ORDER BY timestamp DESC
      LIMIT 10
    `;
    
    const selectResult = await pool.query(selectQuery, [testGenre]);
    
    console.log(`📝 Found ${selectResult.rows.length} messages for ${testGenre} channel:`);
    selectResult.rows.forEach((msg, index) => {
      console.log(`  ${index + 1}. [${msg.timestamp}] ${msg.username}: ${msg.message}`);
    });
    
    console.log('\n4. Testing server-side message loading function...');
    
    // Test the exact query that the server uses
    const serverQuery = `
      SELECT id, user_id, username, message, genre, timestamp
      FROM chat_messages
      WHERE genre = $1
      ORDER BY timestamp ASC
    `;
    
    const serverResult = await pool.query(serverQuery, [testGenre]);
    
    console.log(`🔄 Server would load ${serverResult.rows.length} messages for ${testGenre}:`);
    serverResult.rows.forEach((msg, index) => {
      console.log(`  ${index + 1}. [${msg.timestamp}] ${msg.username}: ${msg.message}`);
    });
    
    console.log('\n5. Testing all genres...');
    
    const genres = ['Action', 'Comedy', 'Adventure', 'Simulation'];
    
    for (const genre of genres) {
      const genreResult = await pool.query(serverQuery, [genre]);
      console.log(`📊 ${genre}: ${genreResult.rows.length} messages`);
    }
    
    console.log('\n6. Testing recent messages across all genres...');
    
    const recentQuery = `
      SELECT genre, COUNT(*) as message_count, 
             MAX(timestamp) as latest_message
      FROM chat_messages
      WHERE genre IN ('Action', 'Comedy', 'Adventure', 'Simulation')
      GROUP BY genre
      ORDER BY genre
    `;
    
    const recentResult = await pool.query(recentQuery);
    
    console.log('📈 Recent activity summary:');
    recentResult.rows.forEach(row => {
      console.log(`  ${row.genre}: ${row.message_count} messages (latest: ${row.latest_message})`);
    });
    
    await pool.end();
    
    console.log('\n✅ Debug test completed!');
    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('1. Check if messages are being saved to database (✅ above)');
    console.log('2. Check if server is loading messages when joining channels');
    console.log('3. Check if frontend is receiving loaded messages');
    console.log('4. Check if frontend is displaying received messages');
    console.log('5. Check browser console for any errors');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugGenreMessages(); 