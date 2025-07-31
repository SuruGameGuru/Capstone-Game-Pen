const pool = require('./db');

async function createChatTables() {
  try {
    console.log('Creating chat database tables...');

    // Create chat_messages table for genre channels
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        genre VARCHAR(100) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ chat_messages table created');

    // Create direct_messages table for private conversations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS direct_messages (
        id SERIAL PRIMARY KEY,
        from_user_id VARCHAR(255) NOT NULL,
        from_username VARCHAR(255) NOT NULL,
        to_user_id VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ direct_messages table created');

    // Create indexes for better performance
    await pool.query('CREATE INDEX IF NOT EXISTS idx_chat_messages_genre ON chat_messages(genre)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_direct_messages_users ON direct_messages(from_user_id, to_user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_direct_messages_timestamp ON direct_messages(timestamp)');
    
    console.log('✅ Chat table indexes created');
    console.log('✅ All chat tables created successfully!');

  } catch (error) {
    console.error('Error creating chat tables:', error);
  } finally {
    await pool.end();
  }
}

createChatTables(); 