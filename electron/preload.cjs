const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    saveFile: (filePath, content) => ipcRenderer.invoke('save-file', filePath, content),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
    showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
    ensureDir: (dirPath) => ipcRenderer.invoke('ensure-dir', dirPath),
    saveReceipt: (filePath, buffer) => ipcRenderer.invoke('save-receipt', filePath, buffer)
});
