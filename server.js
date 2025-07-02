#!/usr/bin/env node
// server.js - Production server with memory management

const { spawn } = require('child_process');
const path = require('path');

// Memory management settings
const MEMORY_LIMIT = '1024'; // MB
const NODE_OPTIONS = [
  '--max-old-space-size=' + MEMORY_LIMIT,
  '--expose-gc',
  '--optimize-for-size',
  '--gc-interval=100',
  '--openssl-legacy-provider'
];

console.log('🚀 Starting 1Tech Academy Frontend Server...');
console.log('💾 Memory limit:', MEMORY_LIMIT + 'MB');
console.log('⚙️  Node options:', NODE_OPTIONS.join(' '));

// Memory monitoring
function logMemoryUsage() {
  if (global.gc) {
    global.gc();
  }
  
  const usage = process.memoryUsage();
  const memoryUsage = {
    rss: Math.round(usage.rss / 1024 / 1024),
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
    external: Math.round(usage.external / 1024 / 1024)
  };
  
  console.log(`📊 Memory: RSS ${memoryUsage.rss}MB, Heap ${memoryUsage.heapUsed}/${memoryUsage.heapTotal}MB, External ${memoryUsage.external}MB`);
  
  // Warning if memory usage is high
  if (memoryUsage.heapUsed > 800) {
    console.warn('⚠️  High memory usage detected:', memoryUsage.heapUsed + 'MB');
  }
}

// Log memory usage every 30 seconds
setInterval(logMemoryUsage, 30000);

// Initial memory log
setTimeout(logMemoryUsage, 5000);

// Find Next.js binary
const nextBin = path.join(__dirname, 'node_modules', '.bin', 'next');
const nextCmd = process.platform === 'win32' ? nextBin + '.cmd' : nextBin;

// Start Next.js server
const server = spawn('node', [
  ...NODE_OPTIONS.map(opt => `--${opt.replace('--', '')}`),
  nextCmd,
  'start'
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: process.env.PORT || 3000,
    NODE_OPTIONS: NODE_OPTIONS.join(' ')
  }
});

// Handle server events
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`🛑 Server exited with code ${code}`);
  process.exit(code);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  server.kill('SIGTERM');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  if (global.gc) {
    console.log('🧹 Running garbage collection...');
    global.gc();
  }
  // Don't exit immediately, let PM2 handle restart
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  if (global.gc) {
    console.log('🧹 Running garbage collection...');
    global.gc();
  }
});

console.log('✅ Server startup script initialized');
