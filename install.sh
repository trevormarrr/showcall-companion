#!/bin/bash
# ShowCall Companion Module Installation Script

echo "Installing ShowCall Companion Module..."
echo "=================================="

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed. Please install Node.js first:"
    echo "https://nodejs.org/"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Installation successful!"
    echo ""
    echo "Next steps:"
    echo "1. Open Bitfocus Companion"
    echo "2. Go to Settings > Developer modules"
    echo "3. Add this folder as a module"
    echo "4. Restart Companion"
    echo "5. Add ShowCall connection in Companion"
    echo ""
    echo "Make sure ShowCall v1.5.0+ is running with WebSocket support."
else
    echo ""
    echo "❌ Installation failed. Please check the error messages above."
    echo "Try running 'npm install' manually to see detailed error information."
fi