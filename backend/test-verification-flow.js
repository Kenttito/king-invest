const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

// Test the complete verification flow
async function testVerificationFlow() {
  const timestamp = Date.now();
  const testEmail = `test-verification-${timestamp}@example.com`;
  const testUser = {
    email: testEmail,
    password: 'testpassword123',
    firstName: 'Verification',
    lastName: 'Test',
    country: 'US',
    currency: 'USD',
    phone: `+1${timestamp.toString().slice(-10)}`, // Use timestamp for unique phone
    role: 'user'
  };

  console.log('🧪 Testing Complete Email Verification Flow');
  console.log('===========================================');
  console.log('Test email:', testEmail);
  console.log('Test phone:', testUser.phone);
  console.log('');

  try {
    // Step 1: Register user
    console.log('📝 Step 1: Registering user...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
    console.log('✅ Registration successful:', registerResponse.data.message);
    console.log('');

    // Step 2: Try to login (should fail)
    console.log('🔐 Step 2: Attempting login without verification...');
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

    // Step 3: Test resend verification
    console.log('📧 Step 3: Testing resend verification...');
    try {
      const resendResponse = await axios.post(`${API_BASE}/auth/resend-verification`, {
        email: testEmail
      });
      console.log('✅ Resend verification successful:', resendResponse.data.message);
    } catch (resendError) {
      console.log('❌ Resend verification failed:', resendError.response?.data?.message || resendError.message);
    }
    console.log('');

    console.log('🎉 Email verification flow test completed!');
    console.log('');
    console.log('📧 Check your email for verification codes');
    console.log('📧 You should receive emails at:', testEmail);
    console.log('');
    console.log('💡 To verify the account, use:');
    console.log(`POST ${API_BASE}/auth/verify-email`);
    console.log('Body: { "email": "' + testEmail + '", "code": "VERIFICATION_CODE" }');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
if (require.main === module) {
  testVerificationFlow().catch(console.error);
}

module.exports = { testVerificationFlow }; 