// electrons render process run web pages and does not run node.js by default
// this file is used to help expose node js modules to the render process
// the reason for this design is for security reasons
const os = require('os');
const path = require('path');
const Toastify = require('toastify-js')
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('toastify', {
    toast: (options) => Toastify(options).showToast(),
})
contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => ipcRenderer.send(channel, data) ,
    on: () => (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
})

contextBridge.exposeInMainWorld('os', {
    homedir: () => os.homedir(),
})

contextBridge.exposeInMainWorld('path', {
    join: (...args) => path.join(...args),
})