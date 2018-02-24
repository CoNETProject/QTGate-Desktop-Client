/*!
 * Copyright 2017 QTGate systems Inc. All Rights Reserved.
 *
 * QTGate systems Inc.
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

const DEBUG = true

import * as Fs from 'fs'
import * as Os from 'os'
import { join, resolve, basename } from  'path'
import { series } from 'async'
import * as freePort from 'portastic'
import { format } from 'url'
import { spawn } from 'child_process'
import * as path from 'path'
import * as Crypto from 'crypto'

const { app, BrowserWindow, Tray, Menu, dialog, autoUpdater, desktopCapturer } = require ( 'electron' )
  
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
    if ( process.mas )
        return false
    return app.makeSingleInstance (() => {
        createWindow ()
    })
}

if ( makeSingleInstance ()) {
    app.quit ()
}

// squirrel event handled and app will exit in 1000ms, so don't do anything else
const version = app.getVersion()

enum lang { 'zh', 'ja', 'en', 'tw' }
const QTGateFolder = join ( Os.homedir(), '.QTGate' )
const QTGateLatest = join ( QTGateFolder, 'latest' )
const QTGateTemp = join ( QTGateFolder, 'tempfile' )
const QTGateVideo = join ( QTGateTemp, 'videoTemp')

let isSingleInstanceCheck = true
let localServer1 = null

let tray = null
let mainWindow = null
let doReady = false
const ErrorLogFile = join ( QTGateFolder, 'indexError.log' )
export let port = 3000 + Math.round ( 10000 * Math.random ())

const takeScreen = ( CallBack ) => {
    
    desktopCapturer.getSources ({ types: [ 'window', 'screen' ], thumbnailSize: { width: 850, height: 480 }}, ( error, sources ) => {
        if ( error ) throw error
        const debug = true
        sources.forEach ( n => {
            
            if ( n.name === 'QTGate' ) {
                const screenshotFileName = Crypto.randomBytes(10).toString('hex') + '.png'
                const screenshotSavePath = path.join ( QTGateTemp, screenshotFileName )
                Fs.writeFile ( screenshotSavePath, n.thumbnail.toPng(), error => {
                    if ( error ) {
                        console.log ( error )
                        return CallBack ( error )
                    }
                        

                    CallBack ( null, screenshotFileName )
                    /*
                    let win = new remote.BrowserWindow ({
                        minWidth: 900,
                        minHeight: 600,
                        backgroundColor: '#ffffff',
                    })
                    if ( debug ) {
                        win.webContents.openDevTools()
                        win.maximize()
                        
                    }
                    win.loadURL ( `http://127.0.0.1:${ this.config().serverPort }/feedBack?imagFile=${ screenshotUrl }` )
                    win.once ( 'closed', () => {
                        win = null
                    })
                    */
                })
            }
        })
        
    })
    
}

const hideWindowDownload = ( downloadUrl, saveFilePath, Callback ) => {
    let _err = null
    if ( !downloadUrl ) {
        return Callback ( new Error ( 'no url' )) 
    }
    Fs.access ( saveFilePath, err => {
        if ( ! err ) {
            return Callback ()
        }
        
        let win = new BrowserWindow ({ show: DEBUG })
        DEBUG ? win.webContents.openDevTools() : null
        //win.maximize ()
        //win.setIgnoreMouseEvents ( true )

        let startTime = 0
        let downloadBytes = 0
    
        win.webContents.session.once ( 'will-download', ( event, item, webContents ) => {

            item.setSavePath ( saveFilePath )
            //startTime = new Date ().getTime ()
            console.log ( `start download file from [${ downloadUrl }]\r\n saveTo [${ saveFilePath }]`)
            /*
            const DEBUG = true
                item.on ( 'updated', ( event, state ) => {
                    if ( state === 'interrupted') {
                        if ( DEBUG )
                            console.log ( 'hideWindowDownload: Download is interrupted but can be resumed' + item.getURL() )
                        return
                    }
    
                    if ( item.isPaused ()) {
                        if ( DEBUG )
                            console.log ( 'hideWindowDownload: Download is interrupted but can be resumed' + item.getURL())
                        return
                    }
                    downloadBytes = item.getReceivedBytes()
                    if ( DEBUG )
                        console.log ( `${item.getFilename()} Received bytes: ${item.getReceivedBytes()}`)
                    return 
                })
            */
            item.once ( 'done', ( event, state ) => {
                if ( state === 'completed' ) {
                    console.log ( `download [${ saveFilePath }] success!`)

                    return win.close ()
                }

                return Fs.unlink ( saveFilePath, err => {
                    _err = new Error ( state )
                    console.log ( `Download failed: ${state}` )
                    return win.close ()
                })
                
            })
        })
        win.once ( 'closed', () => {
            
            win = null
            if ( _err )
                return Callback ( _err )
            return Callback ()
        })
        return win.loadURL ( downloadUrl )
    })
}

const saveLog = ( log: string ) => {
	const data = `${ new Date().toUTCString () }: ${ log }\r\n`
	Fs.appendFile ( ErrorLogFile, data, err => {
		
	})
}

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
    saveLog (`start update with url [${ url }] [${ tag_name }] [${ Buffer.from (tag_name).toString('hex')}]`)
    autoUpdater.on ( 'update-availabe', () => {
        saveLog ( 'update available' )
    })

    autoUpdater.on ( 'error', err => {
        saveLog ( 'systemError autoUpdater.on error ' + err.message )
    })

    autoUpdater.on('checking-for-update', () => {
        saveLog ( `checking-for-update [${ url }]` )
    })

    autoUpdater.on( 'update-not-available', () => {
        saveLog ( 'update-not-available' )
    })

    autoUpdater.on( 'update-downloaded', e => {
        saveLog ( "Install?" )
        autoUpdater.quitAndInstall ()
    })

    autoUpdater.setFeedURL ( url )
    autoUpdater.checkForUpdates ()
}

const dirTitleErr = [
    [
        '文件夹创建错误',
        'フォルダ作成エラー',
        'Create folder error',
        '文件夾創建錯誤'
    ],
    [
        'QTGate在[__folder__]位置创建文件夹错误，QTGate安装不能够继续进行，请检查您的系统。',
        'QTGateは[__folder__]にフォルダを作成エラー、QTGateはインストールができません。あなたのシステムをチェックしてください。',
        'QTGate install got error when make a folder at [__folder__], please check your OS system and do QTGate install again.',
        'QTGate在[__folder__]位置創建文件夾錯誤，QTGate安裝不能夠繼續進行，請檢查您的系統。'
    ]
]

const createWindow = () => {
    if ( mainWindow && typeof mainWindow.isMinimized === 'function') {
        if ( mainWindow.isMinimized() )
            mainWindow.restore ()
        mainWindow.focus ()
        saveLog ('createWindow have mainWindow')
        return 
    }
    saveLog ('createWindow have not mainWindow')
    mainWindow = new BrowserWindow ({
        width: 850,
        height: 480,
        minWidth: 850,
        minHeight: 480,
        resizable: DEBUG,
        show: false,
        backgroundColor: '#ffffff',
        icon: process.platform === 'linux' ? join ( __dirname, 'app/public/assets/images/512x512.png' ) : join ( __dirname, 'app/qtgate.icns' )
    })
    mainWindow.loadURL ( `http://127.0.0.1:${ port }/` )
    if ( DEBUG ) {
        mainWindow.webContents.openDevTools()
        mainWindow.maximize()
    }
    
    mainWindow.once ( 'closed', () => {
        
        if ( process.platform === 'win32' || process.platform === 'darwin' )
            return mainWindow = null
        
        return app.quit()
    })

    mainWindow.once ( 'ready-to-show', () => {

        return mainWindow.show()
    })

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

const showError = ( title: string, detail: string, app ) => {
    dialog.showErrorBox ( title, detail)
    if ( app )
        return app.quit()
}

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

const checkFolder = ( folder: string, CallBack: ( err?: Error ) => void ) => {
    Fs.access ( folder, err => {
        if ( err ) {
            return Fs.mkdir ( folder, err1 => {
                if ( err1 ) {
                    console.log ( err1 )
                    return CallBack ( err1 )
                }
                return CallBack ()
            })
        }
        return CallBack ()
    })
}

const findPort = ( CallBack ) => {
    return freePort.test ( port ).then ( isOpen => {
        if ( isOpen )
            return CallBack ()
        ++ port
        return findPort ( CallBack )
    })
}
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
    series([
        next => checkFolder ( QTGateFolder, next ),
        next => checkFolder ( QTGateLatest, next ),
        next => checkFolder ( QTGateTemp, next ),
        next => checkFolder ( QTGateVideo, next )
    ], err => {
        console.log (`appReady series runback err [${ err }]`)
        const menu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(menu)
        if ( ! localServer1 ) {
            findPort(() => {
                localServer1 = new BrowserWindow ({ show: DEBUG })
                localServer1.setIgnoreMouseEvents ( !DEBUG )
                localServer1.rendererSidePort = port
                localServer1.debug = DEBUG
                localServer1.createWindow = createWindow
                localServer1.takeScreen = takeScreen
                localServer1._doUpdate = _doUpdate
                DEBUG ? localServer1.webContents.openDevTools() : null
                //localServer1.maximize ()
                localServer1.loadURL ( format ({
                    pathname: join( __dirname, 'index.html'),
                    protocol: 'file:',
                    slashes: true
                }))

                setTimeout (() => {
                    const checkUpload = new BrowserWindow ({ show: DEBUG })
                    checkUpload.rendererSidePort = port
                    checkUpload.hideWindowDownload = hideWindowDownload
                    DEBUG ? checkUpload.webContents.openDevTools() : null
                    checkUpload.loadURL ( format ({
                        pathname: join ( __dirname, 'app/update.html'),
                        protocol: 'file:',
                        slashes: true
                    }))
                }, 500 )
            })
        } else {
            saveLog ( `app.once ( 'ready') have localServer1 & createWindow()` )
            createWindow ()
        }

        if ( !tray ) {
            tray = new Tray ( join ( __dirname, '16x16.png' ))
            tray.on( 'click', () => {
                saveLog (`tray.on( 'click') `)
                return createWindow ()
                
            })

            const contextMenu = Menu.buildFromTemplate ( data11 [ localLanguage ].tray )
            
            tray.setContextMenu ( contextMenu )
        }
    })
}

const initialize = () => {

    app.once ( 'ready', () => {
        if ( doReady )
            return 
        doReady = true
        saveLog (`app.once ( 'ready')`)
        return appReady ()
    })

    app.once ('will-finish-launching', () => {
        if ( doReady )
            return 
        doReady = true
        saveLog (`app.once ('will-finish-launching')`)
        return appReady ()
    })

    app.on ( 'window-all-closed', () => {
        app.quit()
    })

}

initialize()

