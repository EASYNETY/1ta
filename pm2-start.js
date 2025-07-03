#!/usr/bin/env node
// pm2-start.js - Windows-compatible PM2 starter

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Next.js application via PM2 wrapper...');

// Set memory limits
process.env.NODE_OPTIONS = '--openssl-legacy-provider --max-old-space-size=1024 --expose-gc';

// Find the Next.js binary
const isWindows = process.platform === 'win32';
const nextBin = path.join(__dirname, 'node_modules', '.bin', isWindows ? 'next.cmd' : 'next');

console.log('📍 Next.js binary:', nextBin);
console.log('💾 Memory limit: 1024MB');
console.log('🌐 Starting on port:', process.env.PORT || 3000);

// Start Next.js
const child = spawn(nextBin, ['start'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: process.env.PORT || 3000
  },
  shell: isWindows
});

// Handle process events
child.on('error', (error) => {
  console.error('❌ Failed to start Next.js:', error);
  process.exit(1);
});

child.on('close', (code) => {
  console.log(`🛑 Next.js process exited with code ${code}`);
  process.exit(code);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down...');
  child.kill('SIGTERM');
});

console.log('✅ PM2 wrapper initialized, Next.js starting...');
