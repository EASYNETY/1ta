#!/bin/bash
# start-with-monitoring.sh - Start the application with memory monitoring

echo "🚀 Starting 1Tech Academy Frontend with Memory Monitoring..."

# Create logs directory if it doesn't exist
mkdir -p logs

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down..."
    if [ ! -z "$MEMORY_PID" ]; then
        kill $MEMORY_PID 2>/dev/null
    fi
    if [ ! -z "$APP_PID" ]; then
        kill $APP_PID 2>/dev/null
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if PM2 is available
if command -v pm2 &> /dev/null; then
    echo "📊 Using PM2 for process management..."
    
    # Stop any existing processes
    pm2 stop ecosystem.config.js 2>/dev/null || true
    
    # Start with PM2
    pm2 start ecosystem.config.js
    
    # Start memory monitoring in background
    echo "🔍 Starting memory monitor..."
    node scripts/memory-monitor.js start &
    MEMORY_PID=$!
    
    # Show PM2 status
    pm2 status
    
    # Follow logs
    echo "📝 Following application logs (Ctrl+C to stop)..."
    pm2 logs --lines 50
    
else
    echo "⚠️  PM2 not found, starting with Node.js directly..."
    
    # Start memory monitoring in background
    echo "🔍 Starting memory monitor..."
    node scripts/memory-monitor.js start &
    MEMORY_PID=$!
    
    # Start the application
    echo "🌐 Starting Next.js application..."
    npm run start:memory-safe &
    APP_PID=$!
    
    # Wait for the application to start
    sleep 5
    
    # Show initial memory report
    echo "📊 Initial memory report:"
    node scripts/memory-monitor.js report
    
    # Wait for processes
    wait $APP_PID
fi

# Cleanup
cleanup
