const { spawn } = require('child_process');
const path = require('path');

// Change to backend directory
process.chdir(path.join(__dirname, 'backend'));

// Start the server
const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, 'backend')
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
}); 