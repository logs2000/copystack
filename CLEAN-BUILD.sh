#!/bin/bash

echo "🧹 Cleaning ClipAppend Project..."
echo "================================="

# Remove old build files and scripts
rm -f build*.sh
rm -f rebuild*.sh
rm -f run-app.sh
rm -f setup.sh
rm -f simple-build.sh
rm -f fixed-build.sh
rm -f ONE-CLICK-BUILD.sh
rm -f INSTALL.md
rm -f FINAL-INSTRUCTIONS.md
rm -f SUCCESS.md
rm -f README.md

# Clean build directory
rm -rf dist

# Clean node modules to fix dependency issues  
rm -rf node_modules
rm -f package-lock.json

echo "✅ Cleaned old files"
echo ""
echo "📦 Installing clean dependencies..."
npm install

echo ""
echo "🔨 Building ClipAppend..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! ClipAppend is ready!"
    echo ""
    echo "📱 How it works:"
    echo "   • Select text anywhere"
    echo "   • Press Ctrl+Shift+C (⌘⇧C on Mac)"  
    echo "   • Text gets appended to your clipboard!"
    echo "   • Normal Ctrl+C still works as before"
    echo ""
    echo "🚀 Starting ClipAppend..."
    
    # Launch the app
    open dist/mac/ClipAppend.app
    
    echo ""
    echo "✨ Look for the clipboard icon in your menu bar!"
    echo ""
    echo "📦 Ready to distribute:"
    echo "   • ClipAppend.app - The application" 
    echo "   • ClipAppend.dmg - Installer for customers"
    echo ""
    echo "💰 Ready to sell! Check HOW-TO-SELL.md for details."
    
else
    echo "❌ Build failed. Check the error above."
fi