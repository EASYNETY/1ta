@echo off
echo 🚀 Starting 1Tech Academy Frontend with PM2...

REM Navigate to the correct directory
cd /d "%~dp0"

REM Stop any existing processes
echo 🛑 Stopping existing processes...
pm2 stop all 2>nul
pm2 delete all 2>nul

REM Check if build exists
if not exist .next (
    echo ⚠️  No build found. Building first...
    call build-safe.bat
)

REM Start with PM2 using correct syntax
echo 📊 Starting with PM2...
pm2 start npm --name "frontend" --max-memory-restart 1G -- start

REM Show status
echo ✅ PM2 Status:
pm2 status

echo 📝 To view logs: pm2 logs
echo 🔍 To monitor: pm2 monit
echo 🛑 To stop: pm2 stop frontend

pause
