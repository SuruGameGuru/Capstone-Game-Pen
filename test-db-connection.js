// Simple database connection test
const { Pool } = require('pg');
require('dotenv').config({ path: './server/.env' });

async function testDatabaseConnection() {
  console.log('🧪 Testing Database Connection...\n');

  try {
    // Create a new pool connection
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    console.log('1️⃣ Testing connection...');
    
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Database connection successful');

    // Test if users table exists
    console.log('\n2️⃣ Checking if users table exists...');
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('✅ Users table exists');
      
      // Check table structure
      console.log('\n3️⃣ Checking users table structure...');
      const structureCheck = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users'
        ORDER BY ordinal_position
      `);
      
      console.log('✅ Users table columns:');
      structureCheck.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type}`);
      });
      
      // Test a simple query
      console.log('\n4️⃣ Testing simple query...');
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      console.log(`✅ Users table has ${userCount.rows[0].count} users`);
      
    } else {
      console.log('❌ Users table does not exist');
      console.log('📋 You need to create the users table first');
    }

    client.release();
    await pool.end();
    
    console.log('\n🎉 Database connection test completed!');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n📋 Possible issues:');
    console.log('- Check your DATABASE_URL in .env file');
    console.log('- Make sure the database exists');
    console.log('- Check if the users table was created');
  }
}

// Run the test
testDatabaseConnection(); 