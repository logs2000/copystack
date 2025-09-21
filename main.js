const { app, BrowserWindow, Tray, Menu, globalShortcut, clipboard, nativeImage, systemPreferences, dialog } = require('electron');
const { execSync } = require('child_process');
const path = require('path');
const AutoLaunch = require('auto-launch');

let tray = null;
let mainWindow = null;

// Create a simple tray icon
const createTrayIcon = () => {
  const iconSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <rect x="2" y="1" width="12" height="14" fill="none" stroke="black" stroke-width="1"/>
      <rect x="6" y="0" width="4" height="3" fill="none" stroke="black" stroke-width="1"/>
      <line x1="4" y1="5" x2="12" y2="5" stroke="black" stroke-width="1"/>
      <line x1="4" y1="7" x2="10" y2="7" stroke="black" stroke-width="1"/>
      <line x1="4" y1="9" x2="11" y2="9" stroke="black" stroke-width="1"/>
      <circle cx="13" cy="12" r="2" fill="green"/>
      <line x1="12" y1="12" x2="14" y2="12" stroke="white" stroke-width="1"/>
      <line x1="13" y1="11" x2="13" y2="13" stroke="white" stroke-width="1"/>
    </svg>
  `;
  
  const dataURL = 'data:image/svg+xml;base64,' + Buffer.from(iconSVG).toString('base64');
  return nativeImage.createFromDataURL(dataURL).resize({ width: 16, height: 16 });
};

// Function to handle append shortcut - SUPER SIMPLE
const handleAppendShortcut = () => {
  console.log('🔥 Ctrl+Shift+C pressed!');

  // Check accessibility permissions on macOS
  if (process.platform === 'darwin') {
    if (!systemPreferences.isTrustedAccessibilityClient(false)) {
      console.log('🔐 Requesting accessibility permissions...');

      // Show permission dialog
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Accessibility Permission Required',
        message: 'ClipAppend needs accessibility permissions to automatically copy selected text.',
        detail: 'Please grant accessibility permission in System Settings → Privacy & Security → Accessibility, then try again.',
        buttons: ['Open System Settings', 'Cancel'],
        defaultId: 0
      }).then(result => {
        if (result.response === 0) {
          // Open System Settings
          execSync('open "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"');
        }
      });

      return;
    }
  }

  // Get current clipboard content BEFORE simulating copy
  const currentClipboard = clipboard.readText() || '';
  console.log('📋 Current clipboard before copy:', currentClipboard ? `"${currentClipboard.substring(0, 30)}..."` : 'empty');

  // Clear clipboard temporarily to ensure clean copy
  clipboard.clear();

  // Simulate copy to get selected text
  const { execSync } = require('child_process');
  try {
    if (process.platform === 'darwin') {
      // macOS: Use AppleScript to copy selected text
      execSync(`osascript -e 'tell application "System Events" to keystroke "c" using command down'`);
    } else {
      // Windows/Linux: Use xdotool or similar (this might need adjustment)
      execSync(`xdotool key ctrl+c`);
    }

    // Small delay to let the copy operation complete
    setTimeout(() => {
      const selectedText = clipboard.readText() || '';
      console.log('📝 Selected text (clean copy):', selectedText ? `"${selectedText.substring(0, 25)}..."` : 'none');

      if (!selectedText) {
        console.log('💡 No text was selected to copy');
        // Restore original clipboard since nothing was selected
        if (currentClipboard) {
          clipboard.writeText(currentClipboard);
        }
        return;
      }

      // Append the selected text to the previous clipboard content with space
      const finalClipboard = currentClipboard
        ? currentClipboard + ' ' + selectedText
        : selectedText;

      clipboard.writeText(finalClipboard);

      console.log('✅ SUCCESS! Text appended to clipboard');
      console.log('📋 Previous:', `"${currentClipboard}"`);
      console.log('📋 Selected:', `"${selectedText}"`);
      console.log('📋 Final result:', `"${finalClipboard}"`);
    }, 100);

  } catch (error) {
    console.log('❌ Could not get selected text:', error.message);
    // Restore original clipboard on error
    if (currentClipboard) {
      clipboard.writeText(currentClipboard);
    }
  }
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    show: false, // Hidden by default - background service
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    title: 'ClipAppend - Background Service',
    skipTaskbar: true, // Don't show in taskbar
    minimizable: false,
    maximizable: false,
    closable: true
  });

  mainWindow.loadFile('index.html');

  // Keep window hidden - it's a background service
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
};

const createTray = () => {
  const icon = createTrayIcon();
  tray = new Tray(icon);
  
  const shortcutText = process.platform === 'darwin' ? '⌘⇧C' : 'Ctrl+Shift+C';
  const normalCopyText = process.platform === 'darwin' ? '⌘C' : 'Ctrl+C';
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '📋 ClipAppend v1.0',
      enabled: false
    },
    {
      type: 'separator'
    },
    {
      label: 'Keyboard Shortcuts:',
      enabled: false
    },
    {
      label: `${normalCopyText} - Normal copy`,
      enabled: false
    },
    {
      label: `${shortcutText} - Copy and append`,
      enabled: false
    },
    {
      type: 'separator'
    },
    {
      label: 'Instructions:',
      enabled: false
    },
    {
      label: '1. Select text',
      enabled: false
    },
    {
      label: `2. Press ${shortcutText}`,
      enabled: false
    },
    {
      label: '3. Text appends to clipboard!',
      enabled: false
    },
    {
      type: 'separator'
    },
    {
      label: '🗑️ Clear Clipboard',
      click: () => {
        clipboard.clear();
      }
    },
    {
      label: '⚙️ Settings Window',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        }
      }
    },
    {
      type: 'separator'
    },
    {
      label: '❌ Quit ClipAppend',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
  tray.setToolTip(`ClipAppend - ${shortcutText} to append text`);
  
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });
};

const registerShortcuts = () => {
  const appendShortcut = 'CommandOrControl+Shift+C';
  
  try {
    const registered = globalShortcut.register(appendShortcut, handleAppendShortcut);
    
    if (registered) {
      console.log('✅ Append shortcut registered:', appendShortcut);
    } else {
      console.log('❌ Failed to register append shortcut');
    }
  } catch (error) {
    console.log('Could not register shortcut:', error);
  }
};

app.whenReady().then(async () => {
  console.log('🚀 ClipAppend starting...');

  // Setup auto-launch
  const clipAppendAutoLauncher = new AutoLaunch({
    name: 'ClipAppend',
    path: process.execPath,
    isHidden: true // Start hidden
  });

  try {
    await clipAppendAutoLauncher.enable();
    console.log('✅ Auto-launch enabled');
  } catch (error) {
    console.log('⚠️ Could not enable auto-launch:', error.message);
  }

  // Hide dock icon on macOS (background service)
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  createWindow();
  console.log('✅ Window created (hidden)');

  createTray();
  console.log('✅ Tray created');

  registerShortcuts();
  console.log('✅ Shortcuts registered');

  const platform = process.platform;
  const normalCopy = platform === 'darwin' ? 'Cmd+C' : 'Ctrl+C';
  const appendCopy = platform === 'darwin' ? 'Cmd+Shift+C' : 'Ctrl+Shift+C';

  console.log('📱 ClipAppend is running as background service!');
  console.log(`📋 ${normalCopy}: Normal copy`);
  console.log(`➕ ${appendCopy}: Copy selection and append to clipboard`);
  console.log('📍 Look for clipboard icon in menu bar (top-right)');
  console.log('🪟 Right-click tray icon to access settings');
  console.log('🔄 Auto-launch enabled - ClipAppend will start automatically on login');
});

app.on('window-all-closed', () => {
  // Keep running as background service
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});