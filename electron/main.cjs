const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

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


