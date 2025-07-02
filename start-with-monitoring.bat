@echo off
REM start-with-monitoring.bat - Start the application with memory monitoring (Windows)

echo 🚀 Starting 1Tech Academy Frontend with Memory Monitoring...

REM Create logs directory if it doesn't exist
if not exist logs mkdir logs

REM Check if PM2 is available
where pm2 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo 📊 Using PM2 for process management...
    
    REM Stop any existing processes
    pm2 stop ecosystem.config.js 2>nul
    
    REM Start with PM2
    pm2 start ecosystem.config.js
    
    REM Start memory monitoring in background
    echo 🔍 Starting memory monitor...
    start /B node scripts/memory-monitor.js start
    
    REM Show PM2 status
    pm2 status
    
    REM Follow logs
    echo 📝 Following application logs (Ctrl+C to stop)...
    pm2 logs --lines 50
    
) else (
    echo ⚠️  PM2 not found, starting with Node.js directly...
    
    REM Start memory monitoring in background
    echo 🔍 Starting memory monitor...
    start /B node scripts/memory-monitor.js start
    
    REM Start the application
    echo 🌐 Starting Next.js application...
    npm run start:memory-safe
)

pause
