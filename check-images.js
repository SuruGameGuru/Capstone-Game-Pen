const pool = require('./server/db');

async function checkImages() {
  try {
    console.log('🔍 Checking images in database...\n');
    
    const result = await pool.query('SELECT * FROM images ORDER BY created_at DESC');
    
    if (result.rows.length === 0) {
      console.log('📭 No images found in database');
    } else {
      console.log(`📸 Found ${result.rows.length} image(s):\n`);
      result.rows.forEach((image, index) => {
        console.log(`${index + 1}. ID: ${image.id}`);
        console.log(`   URL: ${image.url}`);
        console.log(`   Description: ${image.description || 'No description'}`);
        console.log(`   Genre: ${image.genre || 'No genre'}`);
        console.log(`   Public: ${image.is_public ? 'Yes' : 'No'}`);
        console.log(`   User ID: ${image.user_id}`);
        console.log(`   Created: ${image.created_at}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Error checking images:', error);
  } finally {
    await pool.end();
  }
}

checkImages(); 