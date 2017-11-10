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

import * as Fs from 'fs'
import * as Os from 'os'
import * as Path from 'path'
import * as Async from 'async'
const $ = require ('jquery')

const { autoUpdater, remote } = require ( "electron" )
const preQTGateFolder = Path.join ( Os.homedir(), '.QTGate' )
const QTGateFolder = Path.join ( preQTGateFolder, 'latest' )
const ErrorLogFile = Path.join ( preQTGateFolder, 'update.log' )
let flag = 'a'
const saveLog = ( log: string ) => {
	const data = `${ new Date().toUTCString () }: ${ log }\r\n`
	Fs.appendFile ( ErrorLogFile, data, { flag: flag }, err => {
		flag = 'a'
	})
}

const hideWindowDownload = ( downloadUrl, saveFilePath, Callback ) => {
    saveLog (`hideWindowDownload downloadUrl [${ downloadUrl }] saveFilePath [${ saveFilePath }]`)
    return remote.getCurrentWindow().hideWindowDownload ( downloadUrl, saveFilePath, Callback )
}

const checkUpdateFolder = ( updateFolder: string, CallBack ) => {
    
    return Fs.readdir ( updateFolder, ( err, files ) => {
        if ( err ) {
            return Fs.mkdir ( updateFolder, err1 => {
                if ( err1 ) {
                    saveLog (`Fs.mkdir [${ updateFolder }] got ERROR: [${ JSON.stringify ( err1 )}]` )
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
    const verName = name.substr (1)
    
    return checkUpdateFolder ( updateFolder, err => {
        if ( err ) {
            return saveLog ( `checkUpdateFolder got error! stop getDownloadFiles [${ JSON.stringify ( err )}]` )
        }
        saveLog ( `getDownloadFiles updateFolder =[${ updateFolder }]`)
        const downloadFiles: string[] = []
        switch ( process.platform ) {
            case 'win32': {
                if ( Os.arch() === 'ia32') {
                    downloadFiles.push ( 'RELEASES.ia32' )
                    downloadFiles.push ( `qtgate-${ verName }-delta.ia32.nupkg` )
                    downloadFiles.push ( `qtgate.Setup.${ verName }.ia32.exe` )
                    downloadFiles.push ( `qtgate-${ verName }-full.ia32.nupkg` )
                } else {
                    downloadFiles.push ( 'RELEASES' )
                    downloadFiles.push ( `qtgate-${ verName }-delta.nupkg` )
                    downloadFiles.push ( `qtgate.Setup.${ verName }.exe` )
                    downloadFiles.push ( `qtgate-${ verName }-full.nupkg` )
                }
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
        saveLog ( `downloadFiles = ${ downloadFiles } `)
        return Async.eachSeries ( downloadFiles, ( n: string, next ) => {
            return hideWindowDownload ( getUrlFromAssets ( n, assets ), Path.join ( updateFolder, n.replace ( /.ia32/,'' ) ), next )
        }, CallBack )
      
    })

        
}

$( document ).ready (() => {
    const url = 'https://api.github.com/repos/QTGate/QTGate-Desktop-Client/releases/latest'
    $.getJSON ( url )
    .done ( json => {
        if ( ! json ) {
            saveLog ( `Check update got null JSON!` )
            return remote.getCurrentWindow ().close ()
        }
        const localVer = 'v' + remote.app.getVersion()
        if ( json.tag_name <= localVer ) {
            saveLog ( `same version localVer = [${ localVer}] tag_name = [${ json.tag_name }]`)
            return remote.getCurrentWindow ().close ()
        }
        saveLog ( `localVer[${ localVer }] > json.tag_name [${ json.tag_name }] [${ json.tag_name <= localVer }]`)
        return getDownloadFiles ( json.tag_name, json.assets, err => {
            if ( err ) {
                saveLog ( `getDownloadFiles tag_name = [${ json.tag_name }], assets = [${ json.assets }] got error! [${ err }]`)
                return remote.getCurrentWindow ().close ()
            }
            const url = `http://127.0.0.1:${ remote.getCurrentWindow().rendererSidePort }/doingUpdate?ver=${ json.tag_name }`
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
