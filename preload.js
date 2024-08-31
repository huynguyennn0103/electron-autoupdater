const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api',{
    logger: (index) => {console.log(`Running process ${index}`)},
    sendAsyncError: () => {
        console.log("Print async message 1") // Order: 1
        ipcRenderer.send('open-error-dialog')// Order: 3 (the reply is async)
        console.log("Print async message 2") // Order: 2
    },
    sendSyncError: () => {
        console.log("Print sync message 1")
        const reply = ipcRenderer.sendSync('open-sync-error-dialog')
        console.log(reply)
        console.log("Print sync message 2")
    },
    onAsyncReplyError: () => ipcRenderer.on('opened-error-dialog', (event, arg) => {
        console.log("Receive Async:", arg)
    }),
    onSyncReplyError: () => ipcRenderer.on('opened-sync-error-dialog', (event, arg) => {
        console.log("Receive Sync:", arg)
    }),
    openItemInFolder: () => ipcRenderer.send('open-item-in-folder'),
    openTextFile: () => ipcRenderer.send('open-text-file'),
    openExternalLink: () => ipcRenderer.send('open-external-link'),
    openZaloApp: () => ipcRenderer.send('open-zalo-app'),
    openMsTeams: () => ipcRenderer.send('open-msteams-app'),
    openTNMNDFromFile: () => ipcRenderer.send('open-tnmnd-from-file-app'),
    openTNMNDFromDeeplink: () => ipcRenderer.send('open-tnmnd-from-deeplink'),
})
