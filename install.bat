@echo off
REM ShowCall Companion Module Installation Script for Windows

echo Installing ShowCall Companion Module...
echo ==================================

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed. Please install Node.js first:
    echo https://nodejs.org/
    pause
    exit /b 1
)

REM Install dependencies
echo Installing dependencies...
npm install

if %errorlevel% equ 0 (
    echo.
    echo ✅ Installation successful!
    echo.
    echo Next steps:
    echo 1. Open Bitfocus Companion
    echo 2. Go to Settings ^> Developer modules
    echo 3. Add this folder as a module
    echo 4. Restart Companion
    echo 5. Add ShowCall connection in Companion
    echo.
    echo Make sure ShowCall v1.5.0+ is running with WebSocket support.
) else (
    echo.
    echo ❌ Installation failed. Please check the error messages above.
    echo Try running 'npm install' manually to see detailed error information.
)

pause