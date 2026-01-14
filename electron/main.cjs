const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

// --- Logger Configuration ---
const logFile = path.join(app.getPath('userData'), 'update-log.txt');
function log(msg) {
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] ${msg}\n`;
    console.log(logMsg);
    try {
        fs.appendFileSync(logFile, logMsg);
    } catch (e) {
        console.error('Failed to write to log file', e);
    }
}
log('App started. Version: ' + app.getVersion());

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
            webviewTag: true
        },
    });

    // In production, load the local index.html. In dev, load localhost.
    const isDev = !app.isPackaged;
    if (isDev) {
        win.loadURL('http://localhost:3000');
        // win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(() => {
    createWindow();

    // Check for updates on startup
    if (app.isPackaged) {
        autoUpdater.checkForUpdatesAndNotify();
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// --- Auto Updater IPC ---
ipcMain.handle('check-for-updates', async () => {
    if (!app.isPackaged) {
        return { status: 'dev-mode' };
    }
    try {
        const result = await autoUpdater.checkForUpdates();
        return { status: 'checking', result };
    } catch (error) {
        console.error('Failed to check for updates:', error);
        throw error;
    }
});

ipcMain.handle('quit-and-install', () => {
    log('IPC: quit-and-install requested');
    autoUpdater.quitAndInstall();
});

ipcMain.handle('open-update-folder', async () => {
    const updateCacheDir = path.join(app.getPath('userData'), '__update__');
    log('IPC: Opening update folder: ' + updateCacheDir);
    if (fs.existsSync(updateCacheDir)) {
        shell.openPath(updateCacheDir);
        return { success: true };
    }
    return { success: false, error: 'Update folder not found' };
});

ipcMain.handle('get-update-log', async () => {
    if (fs.existsSync(logFile)) {
        return fs.readFileSync(logFile, 'utf8');
    }
    return 'Log file not found';
});

ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

// Forward autoUpdater events to renderer
const sendUpdateStatus = (status, data) => {
    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('update-status', { status, data });
    });
};

autoUpdater.on('checking-for-update', () => {
    log('AutoUpdater: Checking for update...');
    sendUpdateStatus('checking');
});
autoUpdater.on('update-available', (info) => {
    log('AutoUpdater: Update available: ' + JSON.stringify(info));
    sendUpdateStatus('available', info);
});
autoUpdater.on('update-not-available', (info) => {
    log('AutoUpdater: Update not available: ' + JSON.stringify(info));
    sendUpdateStatus('not-available', info);
});
autoUpdater.on('error', (err) => {
    log('AutoUpdater: Error: ' + err.toString());
    sendUpdateStatus('error', err.toString());
});
autoUpdater.on('download-progress', (progressObj) => {
    log(`AutoUpdater: Download progress: ${Math.floor(progressObj.percent)}% (${progressObj.transferred}/${progressObj.total})`);
    sendUpdateStatus('progress', progressObj);
});
autoUpdater.on('update-downloaded', (info) => {
    log('AutoUpdater: Update downloaded: ' + JSON.stringify(info));
    sendUpdateStatus('downloaded', info);
});


// --- IPC Handlers for Persistence ---

ipcMain.handle('save-file', async (event, filePath, content) => {
    try {
        fs.writeFileSync(filePath, content, 'utf-8');
        return { success: true };
    } catch (error) {
        console.error('Failed to save file:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('read-file', async (event, filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error('File does not exist');
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        return { success: true, content };
    } catch (error) {
        console.error('Failed to read file:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('ensure-dir', async (event, dirPath) => {
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        return { success: true };
    } catch (error) {
        console.error('Failed to create directory:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('save-receipt', async (event, filePath, buffer) => {
    try {
        fs.writeFileSync(filePath, Buffer.from(buffer));
        return { success: true };
    } catch (error) {
        console.error('Failed to save receipt:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('show-save-dialog', async () => {
    const result = await dialog.showSaveDialog({
        filters: [{ name: 'Summit Data', extensions: ['json'] }],
        defaultPath: 'summit_data.json'
    });
    return result;
});

ipcMain.handle('show-open-dialog', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Summit Data', extensions: ['json'] }]
    });
    return result;
});

ipcMain.handle('show-directory-dialog', async (event) => {
    console.log('IPC: show-directory-dialog called');
    try {
        const win = BrowserWindow.fromWebContents(event.sender);
        const result = await dialog.showOpenDialog(win, {
            properties: ['openDirectory'],
            title: 'Select Receipt Folder'
        });
        console.log('IPC: show-directory-dialog result:', result);
        return result;
    } catch (error) {
        console.error('IPC: show-directory-dialog error:', error);
        throw error;
    }
});


