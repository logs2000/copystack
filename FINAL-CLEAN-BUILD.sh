#!/bin/bash

echo "🧹 Cleaning up CopyStack project for distribution..."
echo "=================================================="

cd /Users/loganrainey/Desktop/CodingProjects/clipappend

# Remove old build scripts and documentation
echo "🗑️  Removing old files..."
rm -f build*.sh 2>/dev/null
rm -f rebuild*.sh 2>/dev/null  
rm -f run-app.sh 2>/dev/null
rm -f setup.sh 2>/dev/null
rm -f simple-build.sh 2>/dev/null
rm -f fixed-build.sh 2>/dev/null
rm -f ONE-CLICK-BUILD.sh 2>/dev/null
rm -f INSTALL.md 2>/dev/null
rm -f FINAL-INSTRUCTIONS.md 2>/dev/null  
rm -f SUCCESS.md 2>/dev/null

# Clean build artifacts
echo "🧹 Cleaning build files..."
rm -rf dist 2>/dev/null
rm -rf node_modules 2>/dev/null
rm -f package-lock.json 2>/dev/null

echo "✅ Project cleaned!"
echo ""
echo "📦 Installing fresh dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed!"
    echo ""
    echo "🔨 Building CopyStack..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 SUCCESS! CopyStack is ready!"
        echo ""
        echo "📱 How it works:"
        echo "   1. Select text anywhere"
        echo "   2. Press Ctrl+Shift+C (⌘⇧C on Mac)"
        echo "   3. Text stacks to your clipboard!"
        echo "   4. Normal Ctrl+C still works as before"
        echo ""
        echo "🚀 Starting CopyStack..."
        open dist/mac/CopyStack.app
        
        echo ""
        echo "📦 Files ready for distribution:"
        ls -la dist/mac/ 2>/dev/null || echo "   • CopyStack.app"
        ls -la dist/*.dmg 2>/dev/null || echo "   • CopyStack.dmg"
        echo ""
        echo "💰 Ready to sell! Check HOW-TO-SELL.md for details."
        echo ""
        echo "✨ Look for the CopyStack icon in your menu bar!"
        
    else
        echo "❌ Build failed. Check errors above."
    fi
else
    echo "❌ Dependency installation failed."
fi