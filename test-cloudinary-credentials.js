// Test Cloudinary credentials
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: 'dqxoutwou',
  api_key: '139997416795352',
  api_secret: 'eJnOTu7bmsvomCyjxKYDKCqf350'
});

async function testCloudinaryCredentials() {
  console.log('🧪 Testing Cloudinary Credentials...\n');

  try {
    // Test 1: Check if we can access Cloudinary
    console.log('1️⃣ Testing Cloudinary connection...');
    
    // Try to get account info (this will verify credentials)
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful!');
    console.log('Response:', result);

    // Test 2: Check if we can list resources
    console.log('\n2️⃣ Testing resource access...');
    const resources = await cloudinary.api.resources({
      type: 'upload',
      max_results: 1
    });
    console.log('✅ Resource access working!');
    console.log(`Found ${resources.resources.length} resources`);

    console.log('\n🎉 Your Cloudinary credentials are working perfectly!');
    console.log('\n📋 You can now:');
    console.log('- Upload images to Cloudinary');
    console.log('- Test the full upload functionality');
    console.log('- Use the frontend upload form');

  } catch (error) {
    console.error('❌ Cloudinary test failed:', error.message);
    console.log('\n📋 Possible issues:');
    console.log('- Check if credentials are correct');
    console.log('- Verify Cloudinary account is active');
    console.log('- Check internet connection');
  }
}

// Run the test
testCloudinaryCredentials(); 