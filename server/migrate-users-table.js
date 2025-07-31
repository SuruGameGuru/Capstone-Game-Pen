const pool = require('./db');

async function migrateUsersTable() {
  try {
    console.log('Starting users table migration...');

    // Check if columns already exist
    const checkColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('banner_image', 'profile_picture')
    `);

    const existingColumns = checkColumns.rows.map(row => row.column_name);
    console.log('Existing columns:', existingColumns);

    // Add banner_image column if it doesn't exist
    if (!existingColumns.includes('banner_image')) {
      console.log('Adding banner_image column...');
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN banner_image TEXT
      `);
      console.log('banner_image column added successfully');
    } else {
      console.log('banner_image column already exists');
    }

    // Add profile_picture column if it doesn't exist
    if (!existingColumns.includes('profile_picture')) {
      console.log('Adding profile_picture column...');
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN profile_picture TEXT
      `);
      console.log('profile_picture column added successfully');
    } else {
      console.log('profile_picture column already exists');
    }

    // Update existing user (ID 1) with some default data if needed
    const updateUser = await pool.query(`
      UPDATE users 
      SET username = COALESCE(username, 'User Name')
      WHERE id = 1
    `);

    console.log('Migration completed successfully!');
    
    // Show the updated table structure
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('\nUpdated users table structure:');
    tableInfo.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

// Run the migration
migrateUsersTable(); 