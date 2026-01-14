const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    saveFile: (filePath, content) => ipcRenderer.invoke('save-file', filePath, content),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
    showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
    showDirectoryDialog: () => ipcRenderer.invoke('show-directory-dialog'),
    ensureDir: (dirPath) => ipcRenderer.invoke('ensure-dir', dirPath),

    saveReceipt: (filePath, buffer) => ipcRenderer.invoke('save-receipt', filePath, buffer),

    // Updates
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
    openUpdateFolder: () => ipcRenderer.invoke('open-update-folder'),
    getUpdateLog: () => ipcRenderer.invoke('get-update-log'),
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    onUpdateStatus: (callback) => {
        const subscription = (_event, value) => callback(value);
        ipcRenderer.on('update-status', subscription);
        return () => ipcRenderer.removeListener('update-status', subscription);
    }
});
