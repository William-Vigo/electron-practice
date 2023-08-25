const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');
const {app, BrowserWindow, Menu, ipcMain, shell, ipcRenderer } = require('electron');
const { create } = require('domain');
const isMac = process.platform === 'darwin'
const isDev = process.env.NODE_ENV !== 'production'

let mainWindow;

// create the main window
function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'Image Resize',
        width: isDev ? 1000: 500,
        height: 800,
        webPreferences: {
        // certain node_modules require these to be set
            contextIsolation: true,
            nodeIntegration: true,
        // this is to enable node modules in our window,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // open devtools if in dev end
    if(isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

// Create about window
function createAboutWindow() {
    const aboutWindow = new BrowserWindow({
        title: 'About Image Sizer',
        width: 300,
        height: 300
    });

    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}

const menu = [
    ...(isMac ? [{
        label: app.name,
        submenu: [
            {
                label: 'About',
                click: createAboutWindow
            }
        ]
    }] : []),
    {
        role: 'fileMenu',
    },
    ...(!isMac ? [{
        label: 'Help',
        submenu: [
            {
                label: 'About',
                click: createAboutWindow
            }
        ]
    }]: [])
]

// App is ready
app.whenReady().then(() => {
    createMainWindow();

    // Implement Menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu)

    // Remove mainWindow from memory on close
    mainWindow.on('closed', () => (mainwindow = null));

    // this assures we always have atleast 1 window when app starts up
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    })

});


// Respond to ipcRenderer resize
ipcMain.on('image:resize', (e, options) => {
    options.dest = path.join(os.homedir(), 'imageresizer')
    resizeImage(options);
})


// Resize the image
async function resizeImage({imgPath, width, height, dest }) {
    try {
        // create path
        const newPath = await resizeImg(fs.readFileSync(imgPath), {
            width: +width, // + converts string to number
            height: +height,
        });
        
        // create file name
        const filename = path.basename(imgPath);

        // create dst folder if does not exists
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest)
        }

        // write file to destination
        fs.writeFileSync(path.join(dest,filename), newPath)

        // send success message to renderer
        mainWindow.webContents.send('image:done')

        // open dest folder so user can see image
        shell.openPath(dest)
    } catch (error) {
        console.log(error)
    }
}

app.on('window-all-close', () => {
    if (!isMac) {
        app.quit();
    }
})