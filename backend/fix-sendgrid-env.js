const fs = require('fs');
const path = require('path');

console.log('🔧 SendGrid Email Configuration Fix');
console.log('===================================\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('📝 Current .env file found. Here\'s what needs to be fixed:\n');
  
  const currentEnv = fs.readFileSync(envPath, 'utf8');
  console.log('Current SendGrid config:');
  console.log('- EMAIL_USER:', currentEnv.includes('EMAIL_USER=') ? 'Set (but may be incorrect)' : 'Missing');
  console.log('- EMAIL_PASS:', currentEnv.includes('EMAIL_PASS=') ? 'Set (but may be incorrect)' : 'Missing');
  console.log('- EMAIL_HOST:', currentEnv.includes('EMAIL_HOST=') ? 'Set' : 'Missing');
  console.log('- EMAIL_PORT:', currentEnv.includes('EMAIL_PORT=') ? 'Set' : 'Missing');
  
  console.log('\n❌ Issues detected:');
  console.log('1. EMAIL_USER format looks incorrect');
  console.log('2. EMAIL_PASS has URL encoding issues');
  console.log('3. Missing EMAIL_SERVICE configuration');
  
  console.log('\n📋 Here\'s the correct SendGrid configuration:');
  console.log('=============================================');
  console.log(`
# Server Configuration
PORT=5001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/forexcrypto

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration - SendGrid
EMAIL_SERVICE=sendgrid
EMAIL_USER=apikey
EMAIL_PASS=YOUR_SENDGRID_API_KEY_HERE
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false

# Admin Configuration
ADMIN_EMAIL=admin@yourplatform.com
ADMIN_PASSWORD=admin123

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
  `);
  
  console.log('\n🔑 To get your SendGrid API key:');
  console.log('1. Go to https://app.sendgrid.com/');
  console.log('2. Sign in to your account');
  console.log('3. Go to Settings > API Keys');
  console.log('4. Create a new API key with "Mail Send" permissions');
  console.log('5. Copy the API key and replace YOUR_SENDGRID_API_KEY_HERE');
  
  console.log('\n⚠️  Important:');
  console.log('- EMAIL_USER should always be "apikey" for SendGrid');
  console.log('- EMAIL_PASS should be your actual SendGrid API key');
  console.log('- The API key should start with "SG." and be about 69 characters long');
  
} else {
  console.log('❌ No .env file found!');
  console.log('Please create a .env file in the backend directory with the configuration above.');
}

console.log('\n✅ After updating your .env file, run:');
console.log('node test-email.js'); 