const axios = require('axios');
const crypto = require('crypto');

const API_BASE = 'http://localhost:5001/api';

// Generate a random email for testing
function generateTestEmail() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `test-${timestamp}-${random}@example.com`;
}

// Test registration with email verification
async function testRegistrationWithEmail() {
  const testEmail = generateTestEmail();
  const testUser = {
    email: testEmail,
    password: 'testpassword123',
    firstName: 'Test',
    lastName: 'User',
    country: 'US',
    currency: 'USD',
    phone: '+1234567890',
    role: 'user'
  };

  console.log('🧪 Testing Registration with Email Verification');
  console.log('================================================');
  console.log('Test email:', testEmail);
  console.log('');

  try {
    // Step 1: Register user
    console.log('📝 Step 1: Registering user...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
    console.log('✅ Registration successful:', registerResponse.data.message);
    console.log('');

    // Step 2: Check if user was created in database
    console.log('📋 Step 2: Checking user in database...');
    const userResponse = await axios.get(`${API_BASE}/auth/user/${testEmail}`);
    console.log('✅ User found in database');
    console.log('Email confirmed:', userResponse.data.emailConfirmed);
    console.log('Is active:', userResponse.data.isActive);
    console.log('');

    // Step 3: Try to login (should fail without verification)
    console.log('🔐 Step 3: Attempting login without verification...');
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email: testEmail,
        password: 'testpassword123'
      });
      console.log('❌ Login should have failed but succeeded');
    } catch (loginError) {
      if (loginError.response && loginError.response.status === 403) {
        console.log('✅ Login correctly blocked - email verification required');
        console.log('Message:', loginError.response.data.message);
      } else {
        console.log('❌ Unexpected error during login:', loginError.message);
      }
    }
    console.log('');

    // Step 4: Manual verification (simulate user entering code)
    console.log('📧 Step 4: Email verification process...');
    console.log('📧 Check your email for the verification code');
    console.log('📧 The verification code should be sent to:', testEmail);
    console.log('');
    console.log('💡 To complete verification, use the frontend or API:');
    console.log(`POST ${API_BASE}/auth/verify-email`);
    console.log('Body: { "email": "' + testEmail + '", "code": "VERIFICATION_CODE" }');
    console.log('');

    // Step 5: Clean up (optional)
    console.log('🧹 Step 5: Cleanup...');
    console.log('💡 To delete test user, use:');
    console.log(`DELETE ${API_BASE}/auth/user/${testEmail}`);
    console.log('');

    console.log('🎉 Registration with email verification test completed!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Check your email for the verification code');
    console.log('2. Use the code to verify the account');
    console.log('3. Try logging in again');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
if (require.main === module) {
  testRegistrationWithEmail().catch(console.error);
}

module.exports = { testRegistrationWithEmail }; 