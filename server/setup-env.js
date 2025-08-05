const fs = require('fs');
const path = require('path');

const envContent = `# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=gamepen_db
DB_PASSWORD=your_password_here
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_${Date.now()}

# Server Configuration
PORT=3001
CLIENT_URL=http://localhost:3000

# Cloudinary Configuration (if using)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Environment
NODE_ENV=development
`;

const envPath = path.join(__dirname, '.env');

try {
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file already exists');
  } else {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully');
    console.log('📝 Please update the database password and other values in the .env file');
  }
} catch (error) {
  console.error('❌ Error creating .env file:', error);
} 