require('dotenv').config();

console.log('🔍 Environment Variables Debug');
console.log('==============================');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ SET' : '❌ NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ SET' : '❌ NOT SET');
console.log('PORT:', process.env.PORT || '5001 (default)');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

if (process.env.MONGODB_URI) {
  console.log('\n📋 MONGODB_URI preview (first 50 chars):', process.env.MONGODB_URI.substring(0, 50) + '...');
} else {
  console.log('\n❌ MONGODB_URI is missing!');
  console.log('💡 Make sure to add MONGODB_URI to Railway environment variables');
}

console.log('\n🔧 Railway should set these variables:');
console.log('- MONGODB_URI=mongodb+srv://Cluster37098:God%20is%20good.1@cluster37098.hjijwmf.mongodb.net/forexcrypto?retryWrites=true&w=majority&appName=Cluster37098');
console.log('- JWT_SECRET=6e88518ad2d8689512af8a97092047933743bcacb62d877120d70391209791b24ede5b58e404a58163b2724a5531942c722730cfe3e7508f52f05b622c714560');

console.log('\n🔍 Checking if .env file exists and is readable...');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
console.log('Env file path:', envPath);
console.log('Env file exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  console.log('Env file content:');
  console.log(fs.readFileSync(envPath, 'utf8'));
} 