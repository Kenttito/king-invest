require('dotenv').config();

// Test the reset URL generation logic
const resetUrl = `${process.env.FRONTEND_URL || 'https://kenttito.github.io/king-invest'}/reset-password?token=test-token`;

console.log('🔍 Password Reset URL Test');
console.log('==========================');
console.log('FRONTEND_URL env var:', process.env.FRONTEND_URL || 'NOT SET');
console.log('Generated reset URL:', resetUrl);
console.log('=========================='); 