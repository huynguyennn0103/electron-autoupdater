console.log('Main process working')

const {BrowserWindow, app, ipcMain, dialog, Menu, shell, MenuItem, globalShortcut, Tray} = require('electron');
const path = require('path');
const url = require('url');

const NUM_OF_RENDERERS = 1;
const NUM_OF_CHILD_RENDERERS = 1;
const listOfWindows = [];
const listOfUrlLoad = ["https://id.vnggames.app/v2", "https://id.vnggames.app"]
const deeplink = 'vga-test-deeplink'

const createWindow = () => {
    console.log('[STEP] createWindow is called');
    // Each of these windown has it own process called renderer process and isolated from each other
    for(let i = 1; i <= NUM_OF_RENDERERS; i++){
        let win = new BrowserWindow({
            show: false,
            title: `Browser Window ${i}`,
            width: 800,
            height: 600,
            maxHeight: 800,
            maxWidth: 1000,
            backgroundColor:'#f3dcc1',
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                sandbox: false,
            }
        })
        win.loadURL(url.format({
            pathname: path.join(__dirname, `index${i}.html`),
            protocol: 'file',
            slashes: true
        }))
        win.webContents.openDevTools();
        win.on('closed', () => {
            win = null;
            console.log(`[STEP] closed ${i} is called`);
        })
        win.once('ready-to-show', () => {
            win.show();
        })
        listOfWindows.push(win)
    }
    
    for(let i = 0; i < NUM_OF_CHILD_RENDERERS; i++){
        const childWindow = new BrowserWindow({show: false, parent: listOfWindows[i], title: `Child of BrowserWindow ${i}`})
        childWindow.loadURL(listOfUrlLoad[i]);
        childWindow.webContents.on('will-frame-navigate', (details, url) => {
            console.log("[STEP] will-frame-navigatee in webcontent", details, url)
        })
        childWindow.webContents.on('will-navigate', (details, url) => {
            console.log("[STEP] will-navigate in webcontent", details, url)
        })
        childWindow.webContents.on('will-redirect', (details, url) => {
            console.log("[STEP] will-redirect in webcontent", details, url)
        })
        childWindow.webContents.on('did-redirect-navigation', (details, url) => {
            console.log("[STEP] did-redirect-navigation in webcontent", details, url)
        })
        childWindow.webContents.on('did-frame-navigate', (details, url) => {
            console.log("[STEP] did-frame-navigate in webcontent", details, url)
        })
        childWindow.webContents.on('did-navigate', (details, url) => {
            console.log("[STEP] did-navigate in webcontent",details, url)
        })

        childWindow.webContents.on('did-start-navigation', (details, url) => {
            console.log("[STEP] did-start-navigation in webcontent", details, url)
        })
        childWindow.webContents.on('did-navigate-in-page', (details, url) => {
            console.log("[STEP] did-navigate-in-page in webcontent", details, url)
        })
        childWindow.once('ready-to-show', () => {
            console.log("[STEP] Children window ready to show")
            childWindow.show()
        });
    }
    // const childWindow = new BrowserWindow({parent: listOfWindows[0], modal: true, title: 'Child of BrowserWindow 1'})

}

if (process.defaultApp) {
    if (process.argv.length >= 2) {
      console.log("[STEP] Go to this step process.argv.length >= 2")
      app.setAsDefaultProtocolClient(deeplink, process.execPath, [path.resolve(process.argv[1])])
    }
} else {
    console.log("[STEP] Set as default protocol client")
    app.setAsDefaultProtocolClient(deeplink)
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  console.log("[STEP] Not unique instance, get quit()")
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    console.log("[STEP] on Second Instance")
    const mainWindow = listOfWindows[0];
    if (mainWindow) {
      console.log("[STEP] Main window exists")
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
    const url = new URL(commandLine.pop())
    dialog.showErrorBox('Welcome Back', `You arrived searchParams from url: ${url.searchParams}`)
  })
}

app.on('open-url', (event, url) => {
    console.log("[STEP] open url")
    dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`)
})

app.on('ready', () => {
    createWindow();
    // Application menu
    const templateApplicationMenu = [
        {
            label: 'Edit',
            submenu: [
                {role: 'undo'},
                {role: 'redo'},
                {type: 'separator'},
                {role: 'cut'},
                {role: 'copy'},
                {role: 'paste'},
                {role: 'pasteandmatchstyle'},
                {role: 'delete'},
                {role: 'selectall'}
            ]
        },
        {
            label: 'Options',
            submenu: [
                {
                    label: 'submenu1',
                    click: () => {console.log('Clicked submenu 1')}
                }, 
                {
                    label: 'submenu2'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Help',
                    submenu: [
                        {
                            label: 'About electron',
                            click: function(){
                                shell.openExternal('http://electron.atom.io')
                            },
                            accelerator: 'CmdOrCtrl + Shift + H'
                        }
                    ]
                }
            ]
        }
    ]
    const applicationMenu = Menu.buildFromTemplate(templateApplicationMenu)
    Menu.setApplicationMenu(applicationMenu)

    // Context Menu
    const contextMenu = new Menu()
    contextMenu.append(
        new MenuItem({
            label: 'Hello',
            click: () => console.log('Context menu item clicked')
        }))

    contextMenu.append(
        new MenuItem({
            role: 'selectall'
        })
    )

    for(let i = 0; i < NUM_OF_RENDERERS; i++){
        listOfWindows[i].webContents.on('context-menu', (e, params) => {
            contextMenu.popup(listOfWindows[i], params.x, params.y)
        })
    }

    // Global shortcut
    for(let i = 1; i <= NUM_OF_RENDERERS; i++){
        globalShortcut.register(`Alt+${i}`, function(){
            listOfWindows[i-1].show()
        })
    }

    // Tray & Context menu

    const trayContextMenuTemplate = [{   
        label: 'Audio',
        submenu: [
            {
                label: 'Low',
                type: 'radio',
                checked: true
            },
            {
                label: 'High',
                type: 'radio'
            }
        ]
    },
    {   
        label: 'Video',
        submenu: [
            {
                label: '1280x720',
                type: 'radio',
                checked: true
            },
            {
                label: '1920x1080',
                type: 'radio'
            }
        ]
    }]    
    const iconPath = path.join(__dirname, 'logo.jpg')
    let tray = new Tray(iconPath)
    const trayContextMenu = Menu.buildFromTemplate(trayContextMenuTemplate)
    tray.setContextMenu(trayContextMenu);
    tray.setToolTip('Tray Application')

});
// Global shortcut
app.on('will-quit', function(){
    console.log('[STEP] will-quit is called')
    globalShortcut.unregisterAll()
})

// [MAC specifically]
app.on('window-all-closed', () => {
    console.log('[STEP] window-all-closed is called')
    if(process.platform !== 'darwin'){
        console.log('[STEP] window-all-closed -> quit is called')
        app.quit()
    }
})

// [MAC specifically]
app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})

ipcMain.on('open-error-dialog', function(event){
    dialog.showErrorBox('An error message', 'Demo of an error message')
    event.sender.send('opened-error-dialog', '[ASYNC] Main process opened the error dialog')
})

ipcMain.on('open-sync-error-dialog', function(event){
    dialog.showErrorBox('An error message', 'Demo of an error message')
    event.returnValue = '[SYNC] Main process opened the error dialog'
})

ipcMain.on('open-item-in-folder', function(event){
    shell.showItemInFolder('D:\\')
})

ipcMain.on('open-text-file', function(event){
    shell.openPath('file://D:\\DesktopApp\\StartingApp\\test.txt')
})

ipcMain.on('open-external-link', function(event){
    shell.openExternal('http://electron.atom.io')
})

ipcMain.on('open-zalo-app', function(event){
    shell.openExternal('zalo://')
})

ipcMain.on('open-msteams-app', function(event){
    shell.openExternal('msteams://')
})

ipcMain.on('open-tnmnd-from-file-app', function(event){
    shell.openPath('C:\\Program Files\\TNMND\\MoonlightBladeM.exe')
})

ipcMain.on('open-tnmnd-from-deeplink', function(event){
    shell.openExternal('gg-984745454866530319://')
})

/*
    Main process (node debugger): has access to all the computer resources (hardisk, files, secure,... )
    Renderer process (Chromium debugger): has access to UI/UX
    Main process -> n Renderer process (windows) and each windows are isolated from each other due to multi-processing architecture of chromnium

    IPC:
    Async IPC: Not blocking other operations
    Sync IPC: Blocking other operations

    Remote (deprecated)
    Using sync IPC

    Application menu: Menu in navbar
    Context menu: Menu when right-click

    Local shortcut: Worked when app is focused
    Global shortcut: Worked when app is not focused

    Shell module: Open file/folder/external URL
*/