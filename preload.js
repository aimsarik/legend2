window.addEventListener('DOMContentLoaded', () => {
    const { contextBridge, ipcRenderer } = require('electron')

    contextBridge.exposeInMainWorld('electronAPI', {
        setPinter: (data, options, saleType, printer_name) => ipcRenderer.send('set-printer', data, options, saleType, printer_name),
        clearCache: () => ipcRenderer.send('clear-cache'),
    })
});