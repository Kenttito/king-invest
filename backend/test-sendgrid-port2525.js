require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🧪 SendGrid Test with Port 2525');
console.log('================================\n');

// Try SendGrid with port 2525 (alternative to 587)
const sendGridConfig = {
  host: 'smtp.sendgrid.net',
  port: 2525,  // Alternative port
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.EMAIL_PASS
  }
};

console.log('📧 Configuration:');
console.log('- Host:', sendGridConfig.host);
console.log('- Port:', sendGridConfig.port);
console.log('- User:', sendGridConfig.auth.user);
console.log('- Pass:', sendGridConfig.auth.pass ? 
  (sendGridConfig.auth.pass.startsWith('SG.') ? 
    `✓ Valid format (${sendGridConfig.auth.pass.length} chars)` : 
    '❌ Invalid format') : 
  '❌ Missing');

if (!process.env.EMAIL_PASS) {
  console.log('\n❌ No API key found!');
  process.exit(1);
}

console.log('\n🔧 Creating transporter with port 2525...');
const transporter = nodemailer.createTransport(sendGridConfig);

console.log('🔍 Testing connection...');
transporter.verify()
  .then(() => {
    console.log('✅ SendGrid connection successful on port 2525!');
    console.log('\n💡 If this works, update your .env file:');
    console.log('EMAIL_PORT=2525');
  })
  .catch((error) => {
    console.log('❌ Port 2525 also failed:', error.message);
    console.log('\n🔍 This suggests either:');
    console.log('1. Network connectivity issues');
    console.log('2. Invalid API key');
    console.log('3. SendGrid service issues');
    console.log('4. Firewall blocking connections');
  }); 