const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

const testUser = {
  email: 'testuser2@example.com',
  password: 'password123'
};

const verificationCode = '77CC70';

async function testEmailVerification() {
  console.log('🔐 Testing Email Verification Step...\n');
  
  try {
    // Step 1: Verify email with the code
    console.log('📧 Step 1: Verifying email with code:', verificationCode);
    const verifyResponse = await axios.post(`${API_BASE}/auth/verify-email`, {
      email: testUser.email,
      code: verificationCode
    });
    
    console.log('✅ Email verification successful!');
    console.log('Response:', verifyResponse.data);
    
    // Step 2: Test login after verification
    console.log('\n🔓 Step 2: Testing login after verification...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log('✅ Login successful after verification!');
    console.log('Token present:', loginResponse.data.token ? 'Yes' : 'No');
    console.log('User data:', {
      email: loginResponse.data.user?.email,
      firstName: loginResponse.data.user?.firstName,
      lastName: loginResponse.data.user?.lastName,
      emailConfirmed: loginResponse.data.user?.emailConfirmed
    });
    
    // Step 3: Test that the user can now access protected routes
    console.log('\n🛡️ Step 3: Testing protected route access...');
    const token = loginResponse.data.token;
    
    if (token) {
      try {
        const profileResponse = await axios.get(`${API_BASE}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Protected route access successful!');
        console.log('Profile data:', profileResponse.data);
      } catch (profileError) {
        console.log('❌ Protected route access failed:', profileError.response?.data || profileError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.response?.data || error.message);
    
    if (error.response?.data?.message?.includes('Invalid verification code')) {
      console.log('\n💡 The verification code might be incorrect or expired.');
      console.log('Try running the registration test again to get a fresh code.');
    }
  }
}

// Test resend verification as well
async function testResendVerification() {
  console.log('\n📧 Testing Resend Verification...');
  
  try {
    const resendResponse = await axios.post(`${API_BASE}/auth/resend-verification`, {
      email: testUser.email
    });
    
    console.log('✅ Resend verification successful!');
    console.log('Response:', resendResponse.data);
    
  } catch (error) {
    console.error('❌ Resend verification failed:', error.response?.data || error.message);
  }
}

async function main() {
  await testEmailVerification();
  await testResendVerification();
}

main().catch(console.error); 