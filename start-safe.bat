@echo off
echo 🚀 Starting 1Tech Academy Frontend with Memory Safety...

REM Stop any existing PM2 processes
echo 🛑 Stopping existing processes...
pm2 stop all 2>nul
pm2 delete all 2>nul

REM Method 1: Try with ecosystem config
echo 📊 Starting with PM2 ecosystem config...
pm2 start ecosystem.config.js

REM Check if it started successfully
timeout /t 5 /nobreak >nul
pm2 status

echo ✅ Application started! Check the status above.
echo 📝 To view logs: pm2 logs
echo 🔍 To monitor: pm2 monit
echo 🛑 To stop: pm2 stop all

pause
