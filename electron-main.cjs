console.log('Electron resolve:', require.resolve('electron'));
const electron = require('electron');
console.log('Electron type:', typeof electron);
const { app } = electron;
console.log('App exists?', !!app);
if (app) {
    app.whenReady().then(() => {
        const { BrowserWindow } = require('electron');
        new BrowserWindow().loadURL('http://localhost:3000');
    });
}
