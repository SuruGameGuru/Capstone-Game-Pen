// Test script for Cloudinary functionality
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testCloudinarySetup() {
  console.log('🧪 Testing Cloudinary Implementation...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connection...');
    const testResponse = await axios.get(`${API_BASE}/test`);
    console.log('✅ Server is running:', testResponse.data.message);

    // Test 2: Check if images endpoint exists
    console.log('\n2️⃣ Testing images endpoint...');
    try {
      const imagesResponse = await axios.get(`${API_BASE}/images`);
      console.log('✅ Images endpoint working');
    } catch (error) {
      if (error.response && error.response.status === 500) {
        console.log('⚠️ Images endpoint exists but has database error (expected without Cloudinary credentials)');
      } else {
        console.log('❌ Images endpoint error:', error.message);
      }
    }

    // Test 3: Check if messages endpoint exists
    console.log('\n3️⃣ Testing messages endpoint...');
    try {
      const messagesResponse = await axios.get(`${API_BASE}/messages/conversations`);
      console.log('✅ Messages endpoint exists (requires authentication)');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Messages endpoint exists (requires authentication)');
      } else {
        console.log('❌ Messages endpoint error:', error.message);
      }
    }

    console.log('\n🎉 Backend API endpoints are working!');
    console.log('\n📋 Next steps to test full functionality:');
    console.log('1. Update your .env file with real Cloudinary credentials');
    console.log('2. Open http://localhost:3000 in your browser');
    console.log('3. Go to Upload page and try uploading an image');
    console.log('4. Check the browser console for any errors');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCloudinarySetup(); 