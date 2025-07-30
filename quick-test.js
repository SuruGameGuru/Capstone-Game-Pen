// Quick test for authentication
const axios = require('axios');

async function quickTest() {
  try {
    console.log('🧪 Quick Authentication Test...\n');
    
    // Test signup
    console.log('1️⃣ Testing signup...');
    const signupResponse = await axios.post('http://localhost:3001/api/auth/signup', {
      username: 'testuser456',
      email: 'test456@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      dateOfBirth: '1990-01-01'
    });
    
    console.log('✅ Signup successful!');
    console.log('Token:', signupResponse.data.token ? 'Received' : 'Missing');
    
    // Test protected endpoint with token
    console.log('\n2️⃣ Testing protected endpoint...');
    const imagesResponse = await axios.get('http://localhost:3001/api/images', {
      headers: {
        'Authorization': `Bearer ${signupResponse.data.token}`
      }
    });
    
    console.log('✅ Protected endpoint working!');
    console.log('Response:', imagesResponse.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Error:', error.response.status, error.response.data);
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

quickTest(); 