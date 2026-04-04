const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Project...\n');

// Start Backend
console.log('📦 Starting Backend Server on port 5000...');
const backend = spawn('node', ['index.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

backend.on('error', (err) => {
  console.error('❌ Backend error:', err);
});

// Start Frontend after a delay
setTimeout(() => {
  console.log('\n📱 Starting Frontend Server on port 3000...');
  const frontend = spawn('npm', ['start'], {
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'inherit',
    shell: true
  });

  frontend.on('error', (err) => {
    console.error('❌ Frontend error:', err);
  });
}, 2000);

console.log('\n✅ Servers starting...');
console.log('Backend:  http://localhost:5000');
console.log('Frontend: http://localhost:3000\n');

// Handle process exit
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  backend.kill();
  process.exit(0);
});
