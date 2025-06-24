require('dotenv').config();

console.log('🔍 Debugging Environment Variables...\n');

console.log('Environment Variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('EMAIL_USER:', process.env.EMAIL_USER);

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