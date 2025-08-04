const pool = require('./db');

async function fixDatabaseSchema() {
  try {
    console.log('Starting comprehensive database schema fixes...');

    // 1. Fix users table - add missing columns if they don't exist
    console.log('\n1. Checking users table...');
    const userColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('banner_image', 'profile_picture')
    `);

    const existingUserColumns = userColumns.rows.map(row => row.column_name);
    
    if (!existingUserColumns.includes('banner_image')) {
      console.log('Adding banner_image column to users table...');
      await pool.query('ALTER TABLE users ADD COLUMN banner_image TEXT');
      console.log('✅ banner_image column added');
    } else {
      console.log('✅ banner_image column already exists');
    }

    if (!existingUserColumns.includes('profile_picture')) {
      console.log('Adding profile_picture column to users table...');
      await pool.query('ALTER TABLE users ADD COLUMN profile_picture TEXT');
      console.log('✅ profile_picture column added');
    } else {
      console.log('✅ profile_picture column already exists');
    }

    // 2. Fix images table - add missing columns if they don't exist
    console.log('\n2. Checking images table...');
    const imageColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'images' 
      AND column_name IN ('updated_at')
    `);

    const existingImageColumns = imageColumns.rows.map(row => row.column_name);
    
    if (!existingImageColumns.includes('updated_at')) {
      console.log('Adding updated_at column to images table...');
      await pool.query('ALTER TABLE images ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      console.log('✅ updated_at column added');
    } else {
      console.log('✅ updated_at column already exists');
    }

    // 3. Check if likes table exists, create if not
    console.log('\n3. Checking likes table...');
    const likesTableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'likes'
      );
    `);

    if (!likesTableExists.rows[0].exists) {
      console.log('Creating likes table...');
      await pool.query(`
        CREATE TABLE likes (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          image_id INTEGER REFERENCES images(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, image_id)
        );
      `);
      console.log('✅ likes table created');
    } else {
      console.log('✅ likes table already exists');
    }

    // 4. Check if comments table exists, create if not
    console.log('\n4. Checking comments table...');
    const commentsTableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'comments'
      );
    `);

    if (!commentsTableExists.rows[0].exists) {
      console.log('Creating comments table...');
      await pool.query(`
        CREATE TABLE comments (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          image_id INTEGER REFERENCES images(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ comments table created');
    } else {
      console.log('✅ comments table already exists');
    }

    // 5. Check if friends table exists, create if not
    console.log('\n5. Checking friends table...');
    const friendsTableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'friends'
      );
    `);

    if (!friendsTableExists.rows[0].exists) {
      console.log('Creating friends table...');
      await pool.query(`
        CREATE TABLE friends (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          friend_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, friend_id)
        );
      `);
      console.log('✅ friends table created');
    } else {
      console.log('✅ friends table already exists');
    }

    // 6. Check if friend_requests table exists, create if not
    console.log('\n6. Checking friend_requests table...');
    const friendRequestsTableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'friend_requests'
      );
    `);

    if (!friendRequestsTableExists.rows[0].exists) {
      console.log('Creating friend_requests table...');
      await pool.query(`
        CREATE TABLE friend_requests (
          id SERIAL PRIMARY KEY,
          requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          status VARCHAR(20) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(requester_id, user_id)
        );
      `);
      console.log('✅ friend_requests table created');
    } else {
      console.log('✅ friend_requests table already exists');
    }

    // 7. Check if chat_messages table exists, create if not
    console.log('\n7. Checking chat_messages table...');
    const chatMessagesTableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'chat_messages'
      );
    `);

    if (!chatMessagesTableExists.rows[0].exists) {
      console.log('Creating chat_messages table...');
      await pool.query(`
        CREATE TABLE chat_messages (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          channel VARCHAR(50) NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ chat_messages table created');
    } else {
      console.log('✅ chat_messages table already exists');
    }

    // 8. Check if direct_messages table exists, create if not
    console.log('\n8. Checking direct_messages table...');
    const directMessagesTableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'direct_messages'
      );
    `);

    if (!directMessagesTableExists.rows[0].exists) {
      console.log('Creating direct_messages table...');
      await pool.query(`
        CREATE TABLE direct_messages (
          id SERIAL PRIMARY KEY,
          sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ direct_messages table created');
    } else {
      console.log('✅ direct_messages table already exists');
    }

    // 9. Show final table structures
    console.log('\n9. Final table structures:');
    
    const usersStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('\nUsers table:');
    usersStructure.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    const imagesStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'images'
      ORDER BY ordinal_position
    `);
    
    console.log('\nImages table:');
    imagesStructure.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    const likesStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'likes'
      ORDER BY ordinal_position
    `);
    
    console.log('\nLikes table:');
    likesStructure.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // 10. Test data counts
    console.log('\n10. Data counts:');
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const imageCount = await pool.query('SELECT COUNT(*) FROM images');
    const likeCount = await pool.query('SELECT COUNT(*) FROM likes');
    const commentCount = await pool.query('SELECT COUNT(*) FROM comments');
    const friendCount = await pool.query('SELECT COUNT(*) FROM friends');
    const friendRequestCount = await pool.query('SELECT COUNT(*) FROM friend_requests');
    const chatMessageCount = await pool.query('SELECT COUNT(*) FROM chat_messages');
    const directMessageCount = await pool.query('SELECT COUNT(*) FROM direct_messages');
    
    console.log(`Users: ${userCount.rows[0].count}`);
    console.log(`Images: ${imageCount.rows[0].count}`);
    console.log(`Likes: ${likeCount.rows[0].count}`);
    console.log(`Comments: ${commentCount.rows[0].count}`);
    console.log(`Friends: ${friendCount.rows[0].count}`);
    console.log(`Friend Requests: ${friendRequestCount.rows[0].count}`);
    console.log(`Chat Messages: ${chatMessageCount.rows[0].count}`);
    console.log(`Direct Messages: ${directMessageCount.rows[0].count}`);

    console.log('\n✅ Database schema fixes completed successfully!');

  } catch (error) {
    console.error('❌ Database schema fix failed:', error);
  } finally {
    await pool.end();
  }
}

// Run the fixes
fixDatabaseSchema(); 