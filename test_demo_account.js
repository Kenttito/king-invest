const axios = require('axios');

// Test demo account functionality
async function testDemoAccount() {
  try {
    // First, let's login to get a token
    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@yourplatform.com',
      password: 'admin123'
    });
    
    const token = loginRes.data.token;
    console.log('Login successful, token received');
    
    // Test getting demo account
    console.log('\nFetching demo account...');
    const accountRes = await axios.get('http://localhost:5001/api/demo/account', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Demo account data:', JSON.stringify(accountRes.data, null, 2));
    
    // Test resetting demo account
    console.log('\nResetting demo account...');
    const resetRes = await axios.post('http://localhost:5001/api/demo/reset', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Reset demo account data:', JSON.stringify(resetRes.data, null, 2));
    
    // Test a small trade
    console.log('\nTesting a small trade...');
    const tradeRes = await axios.post('http://localhost:5001/api/demo/trade', {
      asset: 'BTCUSDT',
      type: 'Buy',
      amount: 0.001, // Very small amount
      price: 50000
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Trade result:', JSON.stringify(tradeRes.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testDemoAccount(); 