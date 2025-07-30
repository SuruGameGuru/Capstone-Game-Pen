const cloudinary = require('./server/cloudinaryConfig');
const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    console.log('🧪 Testing Cloudinary upload...\n');
    
    // Create a simple test image (1x1 pixel PNG)
    const testImagePath = './test-image.png';
    
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
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(testImagePath, {
      folder: 'gamepen-test',
      public_id: `test-${Date.now()}`
    });
    
    console.log('✅ Upload successful!');
    console.log('📸 Image URL:', result.secure_url);
    console.log('🆔 Public ID:', result.public_id);
    console.log('📁 Folder:', result.folder);
    
    // Clean up test file
    fs.unlinkSync(testImagePath);
    console.log('🧹 Cleaned up test file');
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
  }
}

testUpload(); 