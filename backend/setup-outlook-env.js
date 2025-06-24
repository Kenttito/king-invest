const fs = require('fs');
const path = require('path');

console.log('🔧 Outlook Email Configuration Setup');
console.log('====================================\n');

// Check if .env already exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  console.log('This script will overwrite it. Continue? (y/N)');
  
  // In a real scenario, you'd want to read from stdin
  // For now, we'll just show what the file should contain
  console.log('\n📝 Here\'s what your .env file should contain for Outlook:\n');
} else {
  console.log('📝 Creating .env file with Outlook configuration...\n');
}

const envContent = `# Server Configuration
PORT=5001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/forexcrypto

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration - Outlook/Hotmail
EMAIL_SERVICE=outlook
EMAIL_USER=your-outlook-email@outlook.com
EMAIL_PASS=your-outlook-app-password
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false

# Admin Configuration
ADMIN_EMAIL=admin@yourplatform.com
ADMIN_PASSWORD=admin123

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
`;

console.log(envContent);

console.log('\n📋 Next Steps:');
console.log('1. Copy the configuration above');
console.log('2. Create a .env file in the backend directory');
console.log('3. Paste the configuration and update with your credentials:');
console.log('   - Replace your-outlook-email@outlook.com with your actual email');
console.log('   - Replace your-outlook-app-password with your app password');
console.log('4. Save the file');
console.log('5. Run: node test-email.js to test the configuration');
console.log('6. Run: node server.js to start the server');

console.log('\n🔐 Getting Outlook App Password:');
console.log('1. Go to https://account.microsoft.com/security');
console.log('2. Sign in with your Outlook account');
console.log('3. Enable "Two-step verification"');
console.log('4. Go to "App passwords"');
console.log('5. Create a new app password');
console.log('6. Use that password in your .env file');

console.log('\n📖 For detailed instructions, see: outlook-email-setup.md'); 