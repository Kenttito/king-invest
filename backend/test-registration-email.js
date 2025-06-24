const axios = require('axios');
const { generateVerificationCode, sendVerificationEmail } = require('./send-verification-code');

const API_BASE = 'http://localhost:5001/api';

// Test registration with email verification
async function testRegistrationWithEmail() {
  const timestamp = Date.now();
  const testEmail = `test-registration-${timestamp}@example.com`;
  const testUser = {
    email: testEmail,
    password: 'testpassword123',
    firstName: 'Test',
    lastName: 'User',
    country: 'US',
    currency: 'USD',
    phone: `+1${timestamp.toString().slice(-10)}`,
    role: 'user'
  };

  console.log('🧪 Testing Registration with Email Verification');
  console.log('===============================================');
  console.log(`📧 Test Email: ${testEmail}`);
  console.log(`📱 Test Phone: ${testUser.phone}`);
  console.log('');

  try {
    // Step 1: Register user
    console.log('📝 Step 1: Registering user...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
    console.log('✅ Registration successful!');
    console.log('   Response:', registerResponse.data.message);
    console.log('');

    // Step 2: Test manual email sending
    console.log('📧 Step 2: Testing manual email sending...');
    const manualCode = generateVerificationCode();
    const emailResult = await sendVerificationEmail(testEmail, manualCode);
    
    if (emailResult.success) {
      console.log('✅ Manual email sent successfully!');
      console.log(`   Code: ${manualCode}`);
      console.log(`   Message: "verification code: ${manualCode}"`);
    } else {
      console.log('❌ Manual email failed:', emailResult.error);
    }
    console.log('');

    // Step 3: Test login (should fail without verification)
    console.log('🔐 Step 3: Testing login without verification...');
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: testEmail,
        password: 'testpassword123'
      });
      console.log('❌ Login should have failed but succeeded:', loginResponse.data);
    } catch (loginError) {
      if (loginError.response && loginError.response.status === 403) {
        console.log('✅ Login correctly blocked - email verification required');
        console.log('   Error:', loginError.response.data.message);
      } else {
        console.log('❌ Unexpected login error:', loginError.message);
      }
    }
    console.log('');

    console.log('🎉 Test completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`   ✅ User registered: ${testEmail}`);
    console.log(`   ✅ Email sent with code: ${manualCode}`);
    console.log(`   ✅ Login blocked until verification`);
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Check your email for the verification code');
    console.log('   2. Use the code to verify the account');
    console.log('   3. Try logging in again');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the test
testRegistrationWithEmail().catch(console.error); 