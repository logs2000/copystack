#!/bin/bash

echo "🚀 Building CopyStack (Renamed from ClipAppend)"
echo "============================================="

cd /Users/loganrainey/Desktop/CodingProjects/clipappend

# Kill any running processes
echo "💀 Stopping any running processes..."
pkill -f "ClipAppend" 2>/dev/null || echo "No processes found"
pkill -f "CopyStack" 2>/dev/null || echo "No CopyStack processes found"

echo ""
echo "🔨 Building CopyStack..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ BUILD SUCCESSFUL!"
    echo ""
    echo "📚 CopyStack is ready!"
    echo ""
    echo "📱 How it works:"
    echo "   • Select text anywhere"
    echo "   • Press Cmd+Shift+C to append to clipboard stack"
    echo "   • Normal Cmd+C still works as before"
    echo "   • Paste with Cmd+V to get your collected text"
    echo ""
    echo "🚀 Starting CopyStack..."
    
    # Launch the app
    open dist/mac/CopyStack.app
    
    echo ""
    echo "✨ Look for CopyStack icon in your menu bar!"
    echo ""
    echo "📦 Files ready for sale:"
    echo "   • dist/mac/CopyStack.app - The Mac application"
    echo "   • dist/CopyStack.dmg - Installer for customers"
    echo ""
    echo "💰 Ready to sell! Check the sales page artifacts."
    
else
    echo "❌ Build failed. Check the error above."
fi