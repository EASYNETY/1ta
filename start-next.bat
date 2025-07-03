@echo off
REM start-next.bat - Simple Next.js starter for PM2

echo Starting Next.js application...

REM Set memory limits
set NODE_OPTIONS=--openssl-legacy-provider --max-old-space-size=1024 --expose-gc
set NODE_ENV=production
set PORT=3000

REM Start Next.js
node_modules\.bin\next.cmd start
