const { app, BrowserWindow, Tray, Menu, globalShortcut, clipboard, nativeImage } = require('electron');
const path = require('path');

let tray = null;
let mainWindow = null;
let pendingAppend = false;

// Create a more visible tray icon
const createTrayIcon = () => {
  const iconSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <rect x="1" y="1" width="14" height="14" fill="black" stroke="none"/>
      <rect x="2" y="2" width="12" height="12" fill="white" stroke="none"/>
      <rect x="3" y="4" width="10" height="1" fill="black"/>
      <rect x="3" y="6" width="8" height="1" fill="black"/>
      <rect x="3" y="8" width="9" height="1" fill="black"/>
      <rect x="3" y="10" width="7" height="1" fill="black"/>
      <circle cx="14" cy="13" r="2" fill="green"/>
      <text x="14" y="15" font-size="3" text-anchor="middle" fill="white">+</text>
    </svg>
  `;
  
  const dataURL = 'data:image/svg+xml;base64,' + Buffer.from(iconSVG).toString('base64');
  return nativeImage.createFromDataURL(dataURL).resize({ width: 16, height: 16 });
};

const handleAppendShortcut = () => {
  const currentClipboard = clipboard.readText() || '';
  pendingAppend = true;
  
  const startTime = Date.now();
  const checkInterval = setInterval(() => {
    const newClipboard = clipboard.readText() || '';
    
    if (pendingAppend && newClipboard !== currentClipboard) {
      const appendedText = currentClipboard ? currentClipboard + '\n' + newClipboard : newClipboard;
      clipboard.writeText(appendedText);
      pendingAppend = false;
      clearInterval(checkInterval);
    }
    
    if (Date.now() - startTime > 2000) {
      pendingAppend = false;
      clearInterval(checkInterval);
    }
  }, 50);
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    show: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    title: 'CopyStack - Advanced Clipboard Tool'
  });

  mainWindow.loadFile('index.html');
  
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
};

const createTray = () => {
  try {
    console.log('🔍 Creating CopyStack tray icon...');
    const icon = createTrayIcon();
    tray = new Tray(icon);
    
    console.log('✅ CopyStack tray created successfully');
    
    const shortcutText = process.platform === 'darwin' ? '⌘⇧C' : 'Ctrl+Shift+C';
    const normalCopyText = process.platform === 'darwin' ? '⌘C' : 'Ctrl+C';
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '📚 CopyStack v1.0 - ACTIVE!',
        enabled: false
      },
      {
        type: 'separator'
      },
      {
        label: '✅ Advanced clipboard tool running',
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
        label: '🧪 Test: Select text and press ' + shortcutText,
        enabled: false
      },
      {
        type: 'separator'
      },
      {
        label: '🗑️ Clear Clipboard',
        click: () => {
          clipboard.clear();
          console.log('🗑️ Clipboard cleared');
        }
      },
      {
        label: '⚙️ Show Settings',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
            console.log('🪟 Settings window shown');
          }
        }
      },
      {
        type: 'separator'
      },
      {
        label: '❌ Quit CopyStack',
        click: () => {
          console.log('💫 Quitting CopyStack...');
          app.isQuiting = true;
          app.quit();
        }
      }
    ]);
    
    tray.setContextMenu(contextMenu);
    tray.setToolTip('CopyStack - Advanced Clipboard Tool');
    
    console.log('✅ CopyStack menu configured');
    
    tray.on('click', () => {
      console.log('👆 CopyStack tray clicked!');
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });
    
    tray.on('double-click', () => {
      console.log('👆👆 CopyStack tray double-clicked!');
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
    
    console.log('✅ CopyStack tray icon should be visible in menu bar!');
    
  } catch (error) {
    console.error('❌ Failed to create CopyStack tray:', error);
  }
};

const registerShortcuts = () => {
  const appendShortcut = 'CommandOrControl+Shift+C';
  
  try {
    const registered = globalShortcut.register(appendShortcut, handleAppendShortcut);
    
    if (registered) {
      console.log('✅ CopyStack shortcut registered:', appendShortcut);
    } else {
      console.log('❌ Failed to register CopyStack shortcut');
    }
  } catch (error) {
    console.log('❌ CopyStack shortcut error:', error);
  }
};

app.on('window-all-closed', (event) => {
  event.preventDefault();
});

app.whenReady().then(() => {
  console.log('🚀 CopyStack starting...');
  
  createWindow();
  console.log('✅ CopyStack window created');
  
  createTray();
  console.log('✅ CopyStack tray setup');
  
  registerShortcuts();
  console.log('✅ CopyStack shortcuts active');
  
  const platform = process.platform;
  const normalCopy = platform === 'darwin' ? 'Cmd+C' : 'Ctrl+C';
  const appendCopy = platform === 'darwin' ? 'Cmd+Shift+C' : 'Ctrl+Shift+C';
  
  console.log('📚 CopyStack is ready!');
  console.log(`📋 ${normalCopy}: Normal copy`);
  console.log(`➕ ${appendCopy}: Advanced append copy`);
  console.log('📍 Look for CopyStack icon in menu bar');
  console.log('🪟 Settings window is visible');
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('activate', () => {
  if (mainWindow && !mainWindow.isVisible()) {
    mainWindow.show();
  }
});