const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

// Test user data
const testUser = {
  email: 'testuser2@example.com',
  password: 'password123',
  firstName: 'Test',
  lastName: 'User',
  country: 'US',
  currency: 'USD',
  phone: '+1234567891'
};

async function testFullRegistration() {
  console.log('🚀 Testing Full Registration Flow...\n');

  try {
    // Step 1: Register new user
    console.log('📝 Step 1: Registering new user...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
    
    console.log('✅ Registration successful!');
    console.log('Response:', registerResponse.data);
    
    if (registerResponse.data.requiresVerification) {
      console.log('\n📧 Email verification required. Check your email for the verification code.');
      console.log('📬 Email sent to:', testUser.email);
      
      // Step 2: Test login without verification (should fail)
      console.log('\n🔒 Step 2: Testing login without verification (should fail)...');
      try {
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        console.log('❌ Login should have failed but succeeded:', loginResponse.data);
      } catch (loginError) {
        console.log('✅ Login correctly blocked without verification');
        console.log('Error message:', loginError.response?.data?.message || loginError.message);
      }
      
      // Step 3: Test email verification (you'll need to manually enter the code)
      console.log('\n🔐 Step 3: Email verification required');
      console.log('Please check your email and enter the verification code below.');
      console.log('You can also check the backend logs for the generated code.');
      
    } else {
      console.log('❌ Registration didn\'t require verification - this might be an issue');
    }
    
  } catch (error) {
    console.error('❌ Registration failed:', error.response?.data || error.message);
    
    if (error.response?.data?.message?.includes('already exists')) {
      console.log('\n🔄 User already exists, trying to login...');
      try {
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        console.log('✅ Login successful:', loginResponse.data);
      } catch (loginError) {
        console.log('❌ Login failed:', loginError.response?.data || loginError.message);
      }
    }
  }
}

// Test email verification with a code
async function testEmailVerification(code) {
  console.log(`\n🔐 Testing email verification with code: ${code}`);
  
  try {
    const verifyResponse = await axios.post(`${API_BASE}/auth/verify-email`, {
      email: testUser.email,
      code: code
    });
    
    console.log('✅ Email verification successful!');
    console.log('Response:', verifyResponse.data);
    
    // Test login after verification
    console.log('\n🔓 Testing login after verification...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log('✅ Login successful after verification!');
    console.log('Token:', loginResponse.data.token ? 'Present' : 'Missing');
    
  } catch (error) {
    console.error('❌ Email verification failed:', error.response?.data || error.message);
  }
}

// Test resend verification
async function testResendVerification() {
  console.log('\n📧 Testing resend verification...');
  
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

// Main execution
async function main() {
  await testFullRegistration();
  
  // Uncomment the lines below to test specific functions
  // await testResendVerification();
  // await testEmailVerification('123456'); // Replace with actual code
}

main().catch(console.error); 