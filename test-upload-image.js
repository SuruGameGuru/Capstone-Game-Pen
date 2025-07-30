const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUploadImage() {
  try {
    console.log('🧪 Testing image upload to server...\n');
    
    // Create a simple test image (1x1 pixel PNG)
    const testImagePath = './test-upload-image.png';
    
    // Create a minimal PNG file for testing
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
      0x49, 0x48, 0x44, 0x52, // IHDR
      0x00, 0x00, 0x00, 0x01, // width: 1
      0x00, 0x00, 0x00, 0x01, // height: 1
      0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
      0x90, 0x77, 0x53, 0xDE, // CRC
      0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
      0x49, 0x44, 0x41, 0x54, // IDAT
      0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // compressed data
      0x00, 0x00, 0x00, 0x00, // IEND chunk length
      0x49, 0x45, 0x4E, 0x44, // IEND
      0xAE, 0x42, 0x60, 0x82  // CRC
    ]);
    
    fs.writeFileSync(testImagePath, pngData);
    console.log('✅ Created test image file');
    
    // Create form data
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImagePath));
    formData.append('description', 'Test Art Upload - Beautiful digital artwork');
    formData.append('genre', 'art');
    formData.append('isPublic', 'true');
    
    // Upload to server
    const response = await fetch('http://localhost:3001/api/images/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Upload successful!');
    console.log('📸 Image ID:', result.image.id);
    console.log('📸 Image URL:', result.image.url);
    console.log('📝 Description:', result.image.description);
    console.log('🎨 Genre:', result.image.genre);
    
    // Test fetching the image
    console.log('\n🔍 Testing image retrieval...');
    const getResponse = await fetch(`http://localhost:3001/api/images/${result.image.id}`);
    
    if (getResponse.ok) {
      const imageData = await getResponse.json();
      console.log('✅ Image retrieval successful!');
      console.log('📸 Retrieved URL:', imageData.url);
    } else {
      console.log('❌ Image retrieval failed');
    }
    
    // Clean up test file
    fs.unlinkSync(testImagePath);
    console.log('🧹 Cleaned up test file');
    
    console.log('\n🎉 Test completed successfully!');
    console.log('📱 You can now check the explore pages to see the uploaded image.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUploadImage(); 