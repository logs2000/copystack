const { app, BrowserWindow, Tray, Menu, globalShortcut, clipboard, nativeImage, systemPreferences, dialog, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');

let tray = null;
let mainWindow = null;
let pendingAppend = false;

// Create adaptive tray icon based on OS theme
const createTrayIcon = () => {
  try {
    if (process.platform === 'darwin') {
      // macOS: Always use black logo and let the system handle inversion
      // macOS automatically inverts menu bar icons based on the menu bar appearance
      const logoPath = path.join(__dirname, 'CSLogo - Black.png');
      
      if (fs.existsSync(logoPath)) {
        const image = nativeImage.createFromPath(logoPath);
        const resizedImage = image.resize({ width: 16, height: 16 });
        // Mark as template image so macOS can handle theme adaptation automatically
        resizedImage.setTemplateImage(true);
        console.log('Using black template logo for macOS (system will auto-invert)');
        return resizedImage;
      }
    } else {
      // Windows/Linux: use black logo for light taskbars
      const logoPath = path.join(__dirname, 'CSLogo - Black.png');
      if (fs.existsSync(logoPath)) {
        const image = nativeImage.createFromPath(logoPath);
        console.log('Using black logo for Windows/Linux');
        return image.resize({ width: 16, height: 16 });
      }
    }
    
    // Fallback to black logo
    const blackLogoPath = path.join(__dirname, 'CSLogo - Black.png');
    if (fs.existsSync(blackLogoPath)) {
      const image = nativeImage.createFromPath(blackLogoPath);
      const resizedImage = image.resize({ width: 16, height: 16 });
      if (process.platform === 'darwin') {
        resizedImage.setTemplateImage(true);
      }
      console.log('Using black logo as fallback');
      return resizedImage;
    }
    
    // Final fallback - simple CS text icon
  const iconSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
        <text x="8" y="11" font-family="Arial, sans-serif" font-size="8" font-weight="bold" text-anchor="middle" fill="black">CS</text>
    </svg>
  `;
  
  const dataURL = 'data:image/svg+xml;base64,' + Buffer.from(iconSVG).toString('base64');
    const image = nativeImage.createFromDataURL(dataURL).resize({ width: 16, height: 16 });
    if (process.platform === 'darwin') {
      image.setTemplateImage(true);
    }
    return image;
  } catch (error) {
    console.error('Failed to create tray icon:', error);
    // Emergency fallback
    return nativeImage.createEmpty();
  }
};

// Note: No need to update tray icon for theme changes when using template images
// macOS automatically handles the inversion based on menu bar appearance

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
    width: 600,
    height: 700,
    show: false, // Hidden by default - background service
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    title: 'CopyStack Settings',
    skipTaskbar: true, // Don't show in taskbar
    minimizable: false,
    maximizable: false,
    resizable: false
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
        label: 'CopyStack v1.0 - Running',
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
        label: `${shortcutText} - Stack clipboard`,
      enabled: false
    },
    {
      type: 'separator'
    },
    {
        label: 'Clear Clipboard',
      click: () => {
        clipboard.clear();
          console.log('Clipboard cleared');
      }
    },
    {
        label: 'Settings & Instructions',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
            mainWindow.focus();
            console.log('Settings window shown');
          }
      }
    },
    {
      type: 'separator'
    },
    {
        label: 'Quit CopyStack',
      click: () => {
          console.log('Quitting CopyStack...');
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

// Open accessibility settings
const openAccessibilitySettings = () => {
  if (process.platform === 'darwin') {
    require('child_process').exec('open "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"');
  } else if (process.platform === 'win32') {
    // Windows accessibility settings
    require('child_process').exec('ms-settings:easeofaccess');
  } else {
    // Linux - varies by distro, try common locations
    require('child_process').exec('gnome-control-center universal-access || unity-control-center universal-access || systemsettings5 kcm_accessibility');
  }
};

// Check and prompt for accessibility permissions
const checkAccessibilityPermissions = async (showDialog = true) => {
  if (process.platform === 'darwin') {
    // First, try to check if we already have permission
    let hasPermission = systemPreferences.isTrustedAccessibilityClient(false);
    
    if (!hasPermission) {
      // Request permission with prompt - this will cause the app to appear in the list
      hasPermission = systemPreferences.isTrustedAccessibilityClient(true);
      console.log('Requested accessibility permission - app should now appear in System Settings');
    }
    
    if (!hasPermission && showDialog) {
      console.log('Accessibility permission required');
      
      // Show permission dialog
      const result = await dialog.showMessageBox(null, {
        type: 'info',
        title: 'CopyStack Setup Required',
        message: 'CopyStack needs accessibility permissions to function properly.',
        detail: 'CopyStack should now appear in System Settings → Privacy & Security → Accessibility.\n\nPlease enable CopyStack in the list, then restart the app.\n\nThis allows CopyStack to capture selected text when you press Cmd+Shift+C.',
        buttons: ['Open System Settings', 'Continue Anyway', 'Quit'],
        defaultId: 0,
        cancelId: 2
      });
      
      if (result.response === 0) {
        openAccessibilitySettings();
      } else if (result.response === 2) {
        app.quit();
        return false;
      }
    }
    
    return hasPermission;
  }
  
  return true; // Not macOS, assume permissions are fine
};

app.whenReady().then(async () => {
  console.log('CopyStack starting...');
  
  // Hide dock icon completely - pure background service
  if (process.platform === 'darwin') {
    app.dock.hide();
  }
  
  createWindow();
  console.log('CopyStack window created (hidden)');
  
  createTray();
  console.log('CopyStack tray setup');
  
  // Note: Theme change listener not needed when using template images
  // macOS automatically handles icon appearance based on menu bar theme
  
  // Check accessibility permissions with startup dialog
  const hasPermissions = await checkAccessibilityPermissions(true);
  
  registerShortcuts();
  console.log('CopyStack shortcuts registered');
  
  const platform = process.platform;
  const normalCopy = platform === 'darwin' ? 'Cmd+C' : 'Ctrl+C';
  const appendCopy = platform === 'darwin' ? 'Cmd+Shift+C' : 'Ctrl+Shift+C';
  
  console.log('CopyStack is running as background service!');
  console.log(`${normalCopy}: Normal copy`);
  console.log(`${appendCopy}: Stack clipboard`);
  console.log('Look for CopyStack icon in menu bar');
  
  if (!hasPermissions && process.platform === 'darwin') {
    console.log('Warning: Accessibility permissions not granted - some features may not work');
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('activate', () => {
  if (mainWindow && !mainWindow.isVisible()) {
    mainWindow.show();
  }
});