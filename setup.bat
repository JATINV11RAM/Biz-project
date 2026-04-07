@echo off
REM BizSaathi Backend Setup Script
REM Run this file to install dependencies

echo ========================================
echo BizSaathi Backend Setup
echo ========================================
echo.
echo Installing npm dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: npm install failed!
    echo Make sure Node.js and npm are installed
    echo Download from: https://nodejs.org
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Fill in API keys in .env.local file
echo 2. Run: npm run dev
echo 3. Test endpoints locally
echo.
echo Press any key to close...
pause
