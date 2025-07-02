@echo off
echo 🔨 Building 1Tech Academy Frontend (Safe Mode)...

REM Clear any existing build
echo 🧹 Cleaning previous build...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out

REM Set memory limits for build
echo 💾 Setting memory limits...
set NODE_OPTIONS=--openssl-legacy-provider --max-old-space-size=4096

REM Install dependencies if needed
echo 📦 Checking dependencies...
if not exist node_modules (
    echo Installing dependencies...
    npm install --legacy-peer-deps
)

REM Build the application
echo 🚀 Building application...
npm run build

if %ERRORLEVEL% EQU 0 (
    echo ✅ Build successful!
    echo 🌐 You can now run: npm start
) else (
    echo ❌ Build failed!
    echo 🔧 Trying alternative build method...
    
    REM Try with even more memory
    set NODE_OPTIONS=--openssl-legacy-provider --max-old-space-size=6144
    npm run build
    
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Alternative build successful!
    ) else (
        echo ❌ Build still failing. Try development mode: npm run dev
    )
)

pause
