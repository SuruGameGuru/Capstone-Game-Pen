const pool = require('./db');

async function createFriendsSystem() {
  try {
    console.log('Creating friends system database tables...');

    // Create friends table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS friends (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        friend_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, friend_id)
      );
    `);
    console.log('✅ friends table created');

    // Create friend_requests table for tracking requests
    await pool.query(`
      CREATE TABLE IF NOT EXISTS friend_requests (
        id SERIAL PRIMARY KEY,
        from_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        to_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(from_user_id, to_user_id)
      );
    `);
    console.log('✅ friend_requests table created');

    // Add indexes for faster queries
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends (user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends (friend_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_friends_status ON friends (status);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_friend_requests_from_user_id ON friend_requests (from_user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_friend_requests_to_user_id ON friend_requests (to_user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests (status);`);
    console.log('✅ Friends system indexes created');

    console.log('✅ Friends system tables created successfully!');
  } catch (error) {
    console.error('Error creating friends system tables:', error);
  } finally {
    await pool.end();
  }
}

createFriendsSystem(); 