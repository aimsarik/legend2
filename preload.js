window.addEventListener('DOMContentLoaded', () => {
    const { contextBridge, ipcRenderer } = require('electron')

    contextBridge.exposeInMainWorld('electronAPI', {
        setPinter: (data) => ipcRenderer.send('set-printer', data),
        clearCache: () => ipcRenderer.send('clear-cache'),
    })
})