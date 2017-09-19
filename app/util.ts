import * as Fs from 'fs'
import * as Os from 'os'
import * as Path from 'path'
import * as Async from 'async'
const $ = require ('jquery')

const { autoUpdater, remote } = require ( "electron" )
const preQTGateFolder = Path.join ( Os.homedir(), '.QTGate' )
const QTGateFolder = Path.join ( Os.homedir(), '.QTGate/latest' )
const ErrorLogFile = Path.join ( preQTGateFolder, 'systemError.log' )

const saveLog = ( log: string ) => {
	const data = `${ new Date().toUTCString () }: ${ log }\r\n`
	Fs.appendFile ( ErrorLogFile, data, { encoding: 'utf8' }, err => {})
}

const hideWindowDownload = ( downloadUrl, saveFilePath, Callback ) => {
    if ( !downloadUrl ) {
        saveLog ( `hideWindowDownload downloadUrl string null error! downloadUrl = [${ downloadUrl }], saveFilePath = [${ saveFilePath }]`)
        return Callback ( new Error ('no url')) 
    }
    Fs.access ( saveFilePath, err => {
        if ( !err ) {
            saveLog ( `[${ saveFilePath }] already have skip!`)
            return Callback ()
        }
        let win = new remote.BrowserWindow ({ visible: false })
        win.setIgnoreMouseEvents ( true )

        let startTime = 0
        let downloadBytes = 0
    
        win.webContents.session.once ( 'will-download', ( event, item, webContents ) => {
            item.setSavePath ( saveFilePath )
            startTime = new Date ().getTime ()
            //console.log ( `start download file from [${ downloadUrl }]\r\n saveTo [${ saveFilePath }]`)
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
                win.close()
                const stopTime = new Date().getTime ()
                if ( state === 'completed' ) {
                    const fileLength = Math.round ( downloadBytes / 1024 ) 
                    const speed = fileLength / (( stopTime - startTime )/1000 )
                    saveLog ( `hideWindowDownload: success: [${ item.getFilename() }] totalBytes[${ fileLength }] KBytes speed[${ speed }]Kb/s`)
                    
                    return Callback ()
                }
                saveLog (`${ downloadUrl } Download failed: ${ state }`)
                return Fs.unlink ( saveFilePath, err => {
                    return Callback ( new Error ( state ))
                })
                
            })
        })
    
        win.once ( 'closed', () => {
            saveLog (`${ downloadUrl } on closed, windows = [${ remote.BrowserWindow.getAllWindows().length }]`)
            win = null
        })
    
        return win.loadURL ( downloadUrl )
    })
}

const checkUpdateFolder = ( updateFolder: string, CallBack ) => {
    
    return Fs.readdir ( updateFolder, ( err, files ) => {
        if ( err ) {
            return Fs.mkdir ( updateFolder, err1 => {
                if ( err1 ) {
                    console.log (`Fs.mkdir [${ updateFolder }] got ERROR: `, err1 )
                    return CallBack ( err1 )
                }
                return CallBack ()
            })
        }
        return CallBack ()
    })
}

const getUrlFromAssets = ( fileName: string, assets: any[] ) => {
	try {
        const index = assets.findIndex ( m => { return m.name.toLowerCase() === fileName.toLowerCase() })
		return assets[ index ].browser_download_url
	} catch ( e ) {
		return null
	}
}

const getDownloadFiles = ( name: string, assets: any[], CallBack ) => {
    const updateFolder = Path.join ( QTGateFolder, name )
    const verName = name.substr(1)
    
    checkUpdateFolder ( updateFolder, err => {
        if ( err ) {
            return console.log ( `checkUpdateFolder got error! stop getDownloadFiles`, err )
        }
        console.log (`getDownloadFiles updateFolder =[${ updateFolder }]`)
        const downloadFiles: string[] = []
        switch ( process.platform ) {
            case 'win32': {
                downloadFiles.push ( 'RELEASES' )
                downloadFiles.push ( `qtgate-${ verName }-delta.nupkg` )
                downloadFiles.push ( `qtgate.Setup.${ verName }.exe` )
                downloadFiles.push ( `qtgate-${ verName }-full.nupkg` )
                break
            }
            case 'darwin': {
                downloadFiles.push ( `qtgate-${ verName }-mac.zip` )
                break
            }
            default: {
                downloadFiles.push ( `qtgate-${ verName }-x86_64.AppImage` )
                break
            }
        }
        console.log ( `downloadFiles = ${ downloadFiles } `)
        return Async.eachSeries ( downloadFiles, ( n, next ) => {
            hideWindowDownload ( getUrlFromAssets ( n, assets ), Path.join ( updateFolder, n ), next )
        }, CallBack )
      
    })

        
}


$( document ).ready (() => {
    const url = 'https://api.github.com/repos/QTGate/QTGate-Desktop-Client/releases/latest'
    $.getJSON ( url )
    .done ( json => {
        if ( !json ) {
            saveLog (`Check update got null JSON!`)
            return remote.getCurrentWindow ().close ()
        }
        const localVer = 'v' + remote.app.getVersion()
        if ( localVer <= json.tag_name ) {
            saveLog ( `same version localVer = [${ localVer}] tag_name = [${ json.tag_name }]`)
            return remote.getCurrentWindow ().close ()
        }
        return getDownloadFiles ( json.tag_name, json.assets, err => {
            if ( err ) {
                saveLog (`getDownloadFiles tag_name = [${ json.tag_name }], assets = [${ json.assets }] got error!`)
                return remote.getCurrentWindow ().close ()
            }
            const url = `http://127.0.0.1:${ remote.getCurrentWindow().rendererSidePort }/doingUpdate?ver='${ json.tag_name }'`
            $.ajax ({
                type: 'GET',
                url: url,
                timeout: 5000,
                success: () => {
                    saveLog ( `new update [${ json.tag_name }] download success, ready for update!`)
                    return remote.getCurrentWindow ().close ()
                },
                error: ( xhr, textStatus, errorThrown ) => {
                    saveLog ( `local server url [${ url }] do not working`)
                    return remote.getCurrentWindow ().close ()
                }
            })

        })
        
    }).fail (( jqxhr, textStatus, error ) => {
        saveLog ( `Check update got ERROR! url = [${ url }] ${ JSON.stringify ( error )}` )
        return remote.getCurrentWindow ().close ()
    })
})
