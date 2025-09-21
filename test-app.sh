#!/bin/bash

echo "🔧 Creating a test version of ClipAppend..."
echo "========================================="

cd /Users/loganrainey/Desktop/CodingProjects/clipappend

echo "💀 First, let's kill any running ClipAppend processes..."
pkill -f "ClipAppend" 2>/dev/null || echo "No ClipAppend processes found"

echo ""
echo "🧪 Building test version with visible window..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Starting ClipAppend with debugging..."
    echo ""
    echo "👀 What to look for:"
    echo "   1. A window should open immediately"  
    echo "   2. Check the menu bar for a clipboard icon"
    echo "   3. Look in Terminal for success messages"
    echo ""
    
    # Start the app and show any console output
    echo "🚀 Opening ClipAppend..."
    open "dist/mac/ClipAppend.app"
    
    echo "📊 App started! Check the console output above for any errors."
    echo ""
    echo "🧪 To test if it's working:"
    echo "   1. Select some text (like: Hello)"
    echo "   2. Press Cmd+Shift+C"
    echo "   3. Select different text (like: World)"  
    echo "   4. Press Cmd+Shift+C again"
    echo "   5. Paste somewhere - you should get: Hello[newline]World"
    echo ""
    echo "❌ To quit: Use Cmd+Q or the Quit option in the app menu"
    
else
    echo "❌ Build failed. Check the error above."
fi