const path = require('path')
const {app, BrowserWindow} = require('electron');
const { create } = require('domain');
const isMac = process.platform === 'darwin'
const isDev = process.env.NODE_ENV !== 'production'

function createMainWindow() {
    const mainWindow = new BrowserWindow({
        title: 'Image Resize',
        width: isDev ? 1000: 500,
        height: 800
    });

    // open devtools if in dev end
    if(isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

app.whenReady().then(() => {
    createMainWindow();

    // this assures we always have atleast 1 window when app starts up
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    })
});

app.on('window-all-close', () => {
    if (!isMac) {
        app.quit();
    }
})