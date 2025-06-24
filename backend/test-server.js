const http = require('http');

console.log('🧪 Testing server startup...');

// Test the health check endpoint
function testHealthCheck() {
  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/health',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Health check response: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('📋 Response data:', data);
      process.exit(0);
    });
  });

  req.on('error', (err) => {
    console.error('❌ Health check failed:', err.message);
    process.exit(1);
  });

  req.on('timeout', () => {
    console.error('⏰ Health check timed out');
    req.destroy();
    process.exit(1);
  });

  req.end();
}

// Wait 3 seconds for server to start, then test
setTimeout(testHealthCheck, 3000); 