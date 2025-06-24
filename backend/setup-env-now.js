const fs = require('fs');
const path = require('path');

// Environment variables for SendGrid email configuration
const envContent = `# Server Configuration
PORT=5001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/forexcrypto

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration - SendGrid SMTP
EMAIL_PROVIDER=sendgrid
EMAIL_SERVICE=sendgrid
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=2525
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=SG.your-sendgrid-api-key-here

# Alternative Gmail Configuration (commented out)
# EMAIL_PROVIDER=gmail
# EMAIL_SERVICE=gmail
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_SECURE=false
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password

# Email Verification
EMAIL_VERIFICATION_ENABLED=true
VERIFICATION_CODE_EXPIRY=86400000

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=admin123

# Security
BCRYPT_ROUNDS=12
`;

const envPath = path.join(__dirname, '.env');

try {
  // Check if .env file already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists. Backing up to .env.backup');
    fs.copyFileSync(envPath, path.join(__dirname, '.env.backup'));
  }

  // Write new .env file
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('');
  console.log('📧 EMAIL SETUP REQUIRED:');
  console.log('1. Replace "SG.your-sendgrid-api-key-here" with your actual SendGrid API key');
  console.log('2. Replace "your-verified-sender@yourdomain.com" with your verified sender email');
  console.log('');
  console.log('🔧 To get SendGrid API key:');
  console.log('   - Go to https://app.sendgrid.com/settings/api_keys');
  console.log('   - Create a new API key with "Mail Send" permissions');
  console.log('   - Copy the API key and replace it in the .env file');
  console.log('');
  console.log('📧 To verify sender email:');
  console.log('   - Go to https://app.sendgrid.com/settings/sender_auth');
  console.log('   - Verify your sender email address');
  console.log('');
  console.log('🚀 After updating the .env file, restart your server:');
  console.log('   cd backend && node server.js');
  
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  console.log('');
  console.log('📝 MANUAL SETUP:');
  console.log('Create a .env file in the backend directory with the following content:');
  console.log('');
  console.log(envContent);
} 