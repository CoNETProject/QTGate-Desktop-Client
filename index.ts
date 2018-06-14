/*!
 * Copyright 2018 CoNET Technology Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const DEBUG = false
const port = 3000

import { join } from  'path'
import { format } from 'url'

const { app, BrowserWindow, Tray, Menu, dialog, autoUpdater, desktopCapturer, shell } = require ( 'electron' )
  
const handleSquirrelEvent = () => {
    if ( process.argv.length === 1 || process.platform !== 'win32') {
      return false;
    }
  
    const ChildProcess = require('child_process');
    const path = require('path');
  
    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);
  
    const spawn = function(command, args) {
      let spawnedProcess, error;
  
      try {
        spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
      } catch (error) {}
  
      return spawnedProcess;
    }

    const spawnUpdate = function(args) {
      return spawn(updateDotExe, args);
    }
  
    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
      case '--squirrel-install':
      case '--squirrel-updated':
        // Optionally do things such as:
        // - Add your .exe to the PATH
        // - Write to the registry for things like file associations and
        //   explorer context menus
  
        // Install desktop and start menu shortcuts
        spawnUpdate(['--createShortcut', exeName]);
  
        setTimeout(app.quit, 1000);
        return true;
  
      case '--squirrel-uninstall':
        // Undo anything you did in the --squirrel-install and
        // --squirrel-updated handlers
  
        // Remove desktop and start menu shortcuts
        spawnUpdate(['--removeShortcut', exeName]);
  
        setTimeout(app.quit, 1000);
        return true;
  
      case '--squirrel-obsolete':
        // This is called on the outgoing version of your app before
        // we update to the new version - it's the opposite of
        // --squirrel-updated
  
        app.quit()
        return true
    }
  }

  if ( handleSquirrelEvent()) {
// squirrel event handled and app will exit in 1000ms, so don't do anything else
}

const makeSingleInstance = () => {

    //  For Mac App Store build
    if ( process.platform ==='darwin' ) {
        return false
    }
        
    return app.makeSingleInstance (() => {
        createWindow ()
    })
}

if ( makeSingleInstance ()) {
    app.quit ()
}

// squirrel event handled and app will exit in 1000ms, so don't do anything else
const version = app.getVersion()

let localServer1 = null

let tray = null
let mainWindow = null
let doReady = false

const _doUpdate = ( tag_name: string, _port ) => {
	let url = null
	
    if ( process.platform === 'darwin' ) {
        url = `http://127.0.0.1:${ _port }/update/mac?ver=${ tag_name }`
    } else 
    if ( process.platform === 'win32' ) {
        url = `http://127.0.0.1:${ _port }/latest/${ tag_name }/`
    } else {
        console.log (`process.platform === linux`)
		return
	}
    
    autoUpdater.on ( 'update-availabe', () => {
        console.log ( 'update available' )
    })

    autoUpdater.on ( 'error', err => {
        console.log ( 'systemError autoUpdater.on error ' + err.message )
    })

    autoUpdater.on('checking-for-update', () => {
        console.log ( `checking-for-update [${ url }]` )
    })

    autoUpdater.on( 'update-not-available', () => {
        console.log ( 'update-not-available' )
    })

    autoUpdater.on( 'update-downloaded', e => {
        console.log ( "Install?" )
        autoUpdater.quitAndInstall ()
    })

    autoUpdater.setFeedURL ( url )
    autoUpdater.checkForUpdates ()
}

const createWindow = () => {
    shell.openExternal (`http://127.0.0.1:${ port }`)

}

const data11 = [
    {
        tray: [
            
            {
                label: '打开',
                click: createWindow
            },
            {
                role: 'quit',
                label: '退出',
                accelerator: 'Command+Q'
            }
        ]
    },{
    tray: [
            {
                label: 'オープン',
                click: createWindow
            },
            {
                role: 'quit',
                label: '退出',
                accelerator: 'Command+Q'
            }
        ]
    },{
    tray: [
            {
                label: 'open',
                click: createWindow
            },
            {
                role: 'quit',
                accelerator: 'Command+Q'
            }
        ]
    },{
    tray: [
            {
                label: '打開',
                click: createWindow
            },{
                role: 'quit',
                label: '退出',
                accelerator: 'Command+Q'
            }
        ]
    }
]

const getLocalLanguage = ( lang: string ) => {
    if ( /^zh-TW|^zh-HK|^zh-SG/i.test ( lang ))
        return 3
    if ( /^zh/i.test ( lang ))
        return 0
    if ( /^ja/i.test ( lang ))
        return 1
    return 2
}

let localLanguage = getLocalLanguage ( app.getLocale ())

const isMacOS = process.platform === 'darwin'

const template = [{
        submenu:[
        { role: 'undo', visible: isMacOS },
        { role: 'redo', visible: isMacOS },
        { role: 'selectall', visible: isMacOS },
        { role: 'copy', visible: isMacOS },
        { role: 'paste', visible: isMacOS },
        { role: 'quit', visible: isMacOS }
        ]
    }]

const appReady = () => {
    
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
    if ( ! localServer1 ) {
        
            localServer1 = new BrowserWindow ({ show: DEBUG })
            
            localServer1._doUpdate = _doUpdate
            DEBUG ? localServer1.webContents.openDevTools() : null
            //localServer1.maximize ()
            localServer1.loadURL ( format ({
                pathname: join( __dirname, 'index.html'),
                protocol: 'file:',
                slashes: true
            }))

            setTimeout (() => {
                shell.openExternal (`http://127.0.0.1:${ port }`)
            }, 2000 )

            /*
            setTimeout (() => {
                const checkUpload = new BrowserWindow ({ show: DEBUG })
                checkUpload.rendererSidePort = port
                DEBUG ? checkUpload.webContents.openDevTools() : null
                checkUpload.loadURL ( format ({
                    pathname: join ( __dirname, 'app/update.html'),
                    protocol: 'file:',
                    slashes: true
                }))
            }, 500 )
            */
        
    } else {
        
        createWindow ()
    }

    if ( !tray ) {
        tray = new Tray ( join ( __dirname, '16x16.png' ))
        tray.on( 'click', () => {
            
            return createWindow ()
            
        })

        const contextMenu = Menu.buildFromTemplate ( data11 [ localLanguage ].tray )
        
        tray.setContextMenu ( contextMenu )
    }
    
}

const initialize = () => {

    app.once ( 'ready', () => {
        if ( doReady )
            return 
        doReady = true
        
        return appReady ()
    })

    app.once ('will-finish-launching', () => {
        /*
        if ( doReady )
            return 
        doReady = true
        
        return appReady ()
        */
    })

    app.on ( 'window-all-closed', () => {
        app.quit()
    })

}

initialize()

