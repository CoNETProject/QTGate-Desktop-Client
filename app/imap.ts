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

/// 
import * as Net from 'net'
import * as Tls from 'tls'
import * as Stream from 'stream'
import * as Event from 'events'
import * as Uuid from 'node-uuid'
import * as Async from 'async'
import * as Crypto from 'crypto'
import * as Util from 'util'
import { join } from 'path'
import { homedir }from 'os'
import { setTimeout, clearTimeout } from 'timers';
import { start } from 'repl'
import { Buffer } from 'buffer'
import * as Fs from 'fs'
import * as Upload from './uploadFile'

const MAX_INT = 9007199254740992
const debug = true
const QTGateFolder = join ( homedir(), '.QTGate' )
const ErrorLogFile = join ( QTGateFolder, 'imap.log' )
const ErrorLogFileStream = join ( QTGateFolder, 'imapStream.log' )
let flag = 'w'
const saveLog = ( log: string ) => {

    const Fs = require ('fs')
	const data = `${ new Date().toUTCString () }: ${ log }\r\n`
	Fs.appendFile ( ErrorLogFile, data, { flag: flag }, err => {
		flag = 'a'
	})
}
const debugOut = ( text: string, isIn: boolean ) => {
    const log = `【${ new Date().toISOString()}】${ isIn ? '<=' : '=>'} 【${ text }】`
    saveLog ( log )
}

interface qtGateImapwriteAppendPool {
    callback: (err?: Error) => void
    text: string
}
const idleInterval = 1000 * 60      // 3 mins
const noopInterval = 1000
const socketTimeOut = 1000 * 5

class ImapServerSwitchStream extends Stream.Transform {
    public commandProcess ( text: string, cmdArray: string[], next, callback ) {}
    public name: string
    public _buffer = Buffer.alloc (0)
    public serverCommandError ( err: Error, CallBack ) {
        this.imapServer.emit ( 'error', err )
        if ( CallBack )
            CallBack ( err )
    }
    public Tag: string = null
    public cmd: string = null
    public callback = false
    public doCommandCallback = null
    private _login = false
    private first = true
    private idleCallBack = null
    public waitLogout = false
    public waitLogoutCallBack = null
    private _newMailChunk = Buffer.alloc (0)
    public idleResponsrTime: NodeJS.Timer = null
    public canDoLogout = false
    private ready = false
    public appendWaitResponsrTimeOut:NodeJS.Timer = null
    public runningCommand = null
    //private nextRead = true
    public idleNextStop :NodeJS.Timer = null
    private reNewCount = 0

    constructor ( public imapServer: qtGateImap, private exitWithDeleteBox: boolean, public debug: boolean ) {
        super ()
        /*
        if ( eachMail ) {
            this.imapServer.on ( 'nextNewMail', () => {
                this.reNewCount ++
                console.log ( `**** imapServer on nextNewMail!` )
                this.nextRead = true
                if ( this.runningCommand !== 'idle' )
                    return
                if ( this.imapServer.idleSupport ) {
                    return this.idleStop ()
                }
    
            })
        }
        */
    }

    public idleStop () {
        if ( ! this.imapServer.idleSupport || this.runningCommand !== 'idle' ) {
            return 
        }
        clearTimeout ( this.idleNextStop )
        clearTimeout ( this.idleResponsrTime )
        this.cmd = this.runningCommand = `DONE`
        const cc = Crypto.randomBytes (10).toString('base64')
        this.debug ? debugOut(this.cmd + `【${ cc }】`, false) : null
        if ( this.writable ) {
            this.idleResponsrTime = setTimeout(() => {
                console.log(`【${ new Date().toISOString() }】[${ cc }]====================[ IDLE DONE time out ]`)
                this.imapServer.destroyAll(null)
            }, 30000 )

            return this.push ( this.cmd + '\r\n' )
        }
        return this.imapServer.destroyAll ( null )

    }

    private doCapability ( capability ) {
        this.imapServer.serverSupportTag = capability
        this.imapServer.idleSupport = /IDLE/i.test ( capability )
        this.imapServer.condStoreSupport = /CONDSTORE/i.test ( capability )
        this.imapServer.literalPlus = /LITERAL\+/i.test ( capability )
        const ii = /X\-GM\-EXT\-1/i.test ( capability )
        const ii1 = /CONDSTORE/i.test ( capability )
        const listenFolder = this.imapServer.listenFolder
        return this.imapServer.fetchAddCom = `(${ ii ? 'X-GM-THRID X-GM-MSGID X-GM-LABELS ': '' }${ ii1 ? 'MODSEQ ' : ''}BODY[])`
    }

    public preProcessCommane ( commandLine: string, _next, callback ) {

        const cmdArray = commandLine.split (' ')
        this.debug ? debugOut ( `${ this.imapServer.listenFolder ? this.imapServer.listenFolder : '' } ${commandLine}`, true ) : null

        if ( this._login ) {
            switch ( commandLine[0] ) {

                case '+':                                    /////       +
                case '*': {                                  /////       *
                    return this.commandProcess ( commandLine, cmdArray, _next, callback )
                }

                case 'I':           //  IDLE
                case 'D':           //  NODE
                case 'N':           //  NOOP
                case 'A': {                                  /////       A
                    clearTimeout ( this.appendWaitResponsrTimeOut )
                    clearTimeout ( this.idleResponsrTime )

                    if ( this.Tag !== cmdArray[0] ) {
                        return this.serverCommandError ( new Error ( `this.Tag[${ this.Tag }] !== cmdArray[0] [${ cmdArray[0] }]\ncommandLine[${ commandLine }]` ), callback )
                    }
                    if ( /^ok$/i.test ( cmdArray[1] )) {

                        if ( /^IDLE$/i.test ( cmdArray [0]) )
                            clearTimeout ( this.idleResponsrTime )
                       
                        this.doCommandCallback ( null, commandLine )
                        return callback ()
                    }
                    const errs = cmdArray.slice (2).join(' ')
                    this.doCommandCallback ( new Error (errs ))
                    return callback ()

                }
                default:
                    return this.serverCommandError ( new Error (`_commandPreProcess got switch default error!` ), callback )
            }
        }
        return this.login ( commandLine, cmdArray, _next, callback )
    }

    public checkFetchEnd () {

        if ( this._buffer.length <= this.imapServer.fetching ) {
            return null
        }
        
        const body = this._buffer.slice ( 0, this.imapServer.fetching )
        const uu = this._buffer.slice ( this.imapServer.fetching )
        
        let index1 = uu.indexOf ('\r\n* ')
        let index = uu.indexOf ('\r\nA') 

        index = index < 0 || index1 > 0 && index > index1 ? index1 : index

        if ( index < 0 )
            return null

        this._buffer = uu.slice ( index + 2 )
        this.imapServer.fetching = null
        return body
        
    }

    public _transform ( chunk: Buffer, encoding, next ) {
        
        this.callback = false
        //console.log ('************************************** ImapServerSwitchStream _transform chunk **************************************')
        //console.log ( chunk.toString ())
        //console.log ('************************************** ImapServerSwitchStream _transform chunk **************************************')
        this._buffer = Buffer.concat ([ this._buffer, chunk ])
        
        const doLine = () => {
            const __CallBack = () => {
                
                let index = -1
                if (!this._buffer.length || (index = this._buffer.indexOf('\r\n')) < 0) {
                    if (!this.callback) {
                        //      this is for IDLE do DONE command
                        //this.emit ( 'hold' )
                        this.callback = true
                        return next()
                    }
                    //      did next with other function
                    return
                }

                const _buf = this._buffer.slice ( 0, index )
                if ( _buf.length ) {
                    return this.preProcessCommane ( _buf.toString (), next, () => {
                        this._buffer = this._buffer.slice ( index + 2 )
                        return doLine ()
                    })
                }
                if (! this.callback ) {
                    this.callback = true
                    return next()
                }
                return
            }

            if ( this.imapServer.fetching ) {
                //console.log ('************************************** ImapServerSwitchStream _transform chunk **************************************')
                //console.log ( this._buffer.toString ())
                //console.log ('************************************** ImapServerSwitchStream _transform chunk **************************************')
                const _buf1 = this.checkFetchEnd ()
                
                //  have no fill body get next chunk
                if ( ! _buf1 ) {
                    if (!this.callback) {
                        this.callback = true
                        return next()
                    }
                    return
                }
                /*
                console.log ('************************************** ImapServerSwitchStream _transform chunk **************************************')
                console.log ( _buf1.length )
                console.log ( _buf1.toString ())
                */
                
                
                this.imapServer.newMail ( _buf1 )
                
            }
            return __CallBack ()
        }

        return doLine ()
    }

    private capability () {

        this.doCommandCallback = ( err ) => {
            if ( this.imapServer.listenFolder ) {
                
                return this.openBox (( err, newMail ) => {
                    
                    if ( err ) {
                        console.log (`========================= [ this.openBox return err ] do this.end ()`, err )
                        return this.imapServer.destroyAll( err )
                    }
                    if ( this.waitLogout ) {
                        return this.logout_process ( this.waitLogoutCallBack )
                    }
                    
                    if ( /^inbox$/i.test ( this.imapServer.listenFolder )) {
                        this.canDoLogout = this.ready = true
                        return this.imapServer.emit ( 'ready' )
                    }

                    if ( newMail ) {
                        return this.doNewMail ()
                    }
                    this.canDoLogout = true
                    return this.idleNoop ()
                })
            }
            this.canDoLogout = this.ready = true
            this.imapServer.emit ( 'ready' )
        }

        this.commandProcess = ( text: string, cmdArray: string[], next, callback ) => {
            switch ( cmdArray[0] ) {
                case '*': {                                  /////       *
                    //          check imap server is login ok
                    if ( /^CAPABILITY$/i.test ( cmdArray [1] ) && cmdArray.length > 2 ) {
                        const kkk = cmdArray.slice (2).join (' ')
                        this.doCapability ( kkk )
                    }
                    return callback ()
                }
                default:
                return callback ()
            }
        }

        this.Tag = `A${ this.imapServer.TagCount }`
        this.cmd = `${ this.Tag } CAPABILITY`
        this.debug ? debugOut ( this.cmd, false ) : null

        if ( this.writable )
            return this.push ( this.cmd + '\r\n')
        return this.imapServer.destroyAll( null)
    }

    public doNewMail () {
        saveLog ( `ImapServerSwitchStream [${ this.imapServer.listenFolder }] doNewMail!`)
        this.reNewCount --
        this.canDoLogout = true
        this.checkLogout (() => {
            if ( /LOGOUT/.test ( this.cmd ))
                return 
            this.canDoLogout = false
            this.runningCommand = 'doNewMail'
            this.seachUnseen (( err, newMailIds, havemore ) => {
                if ( err ) {
                    return this.imapServer.destroyAll ( err )
                }
                if (! newMailIds || ! newMailIds.length ) {
                    
                    this.runningCommand = null
                    return this.idleNoop()
                }
                let haveMoreNewMail = false
                
                return Async.waterfall ([
                    next => this.fetch ( newMailIds, next ),
                    ( _moreNew, next ) => {
                        haveMoreNewMail = _moreNew
                        return this.flagsDeleted ( newMailIds, next )
                    },
                    next => {
                        return this.expunge ( next )
                    }
                ], ( err, newMail ) => {
                    
                    this.runningCommand = null
                    if ( err ) {
                        saveLog ( `ImapServerSwitchStream [${ this.imapServer.listenFolder }] doNewMail ERROR! [${ err.message }]`)
                        return this.imapServer.destroyAll ( err )
                    }
                        
                    if ( haveMoreNewMail || havemore || newMail ) {
                        
                        return this.doNewMail ()
                    }
                    return this.idleNoop ( )
                })
                
            })
        })
        
    }

    public checkLogout ( CallBack ) {

        if ( this.waitLogout ) {

            if ( ! this.canDoLogout ) {
                return this.logout_process ( CallBack )
            }
                
            if ( this.exitWithDeleteBox ) {
                return this.deleteBox (() => {
                    return this.logout_process ( CallBack )
                })
            }
            return this.logout_process ( CallBack )
        }
        CallBack ()
    }

    private idleNoop () {

        this.canDoLogout = true
        this.checkLogout (() => {
            if ( /LOGOUT/.test ( this.cmd ))
                return 
            let newSwitchRet = false
            this.runningCommand = 'idle'
            if ( ! this.ready ) {
                this.ready = true
                this.imapServer.emit ( 'ready' )
            }
            this.doCommandCallback = ( err => {
                if ( err )
                    return this.imapServer.destroyAll ( null )
                this.runningCommand = null
                if ( this.idleCallBack ) {
                    this.idleCallBack ()
                    return this.idleCallBack = null
                }
                //console.log(`IDLE DONE newSwitchRet = [${newSwitchRet}] nextRead = [${this.nextRead}]`)
                if ( newSwitchRet || this.reNewCount > 0 ) {
                    return this.doNewMail ()
                }
    
                if ( this.imapServer.idleSupport ) {
                    return this.idleNoop ()
                }
    
                setTimeout (() => {
                    return this.idleNoop ()
                }, noopInterval )
            })
       
            this.idleNextStop = this.imapServer.idleSupport
                ? setTimeout (() => {
                    this.idleStop ()
                }, idleInterval )
                : null
            this.commandProcess = (  text: string, cmdArray: string[], next, callback ) => {
                switch ( cmdArray[0] ) {
                    case '+':
                    case '*': {
                        clearTimeout ( this.idleResponsrTime )
                        if ( /^RECENT$|^EXISTS$/i.test ( cmdArray[2] )) {
                            if ( parseInt ( cmdArray[1])) {
                                newSwitchRet = true
                                
                                if ( !this.callback) {
                                    this.callback = true 
                                    next()
                                }
                                
                                this.idleStop ()
                                
                                
                                /*
                                if ( this.nextRead ) {
                                    clearTimeout(idleNoopTime)
                                    return this.idleStop()
                                }
                                    
                                console.log(`idle got RECENT, but this.nextRead === false [${this.nextRead}]`)
                                */
                            }
                        }
                        return callback ()
                    }
                    default:
                    return callback ()
                }
            }
            
            const name = this.imapServer.idleSupport ? 'IDLE' : 'NOOP'
            this.Tag = `${ name }`
            this.cmd = `${ name } ${ name }`
            const cc = Crypto.randomBytes (10).toString('base64')
            this.debug ? debugOut ( this.cmd + `【${ cc }】`, false ) : null
            if ( this.writable ) {
                this.idleResponsrTime = setTimeout (() => {
                    console.log (`【${ new Date().toISOString ()}】【${ cc }】====================[ do IDLE time out ]`)
                    this.imapServer.destroyAll(null)
                }, 30000 )
                return this.push ( this.cmd + '\r\n')
            }
            return this.imapServer.destroyAll(null)
        })
    }

    private login ( text: string, cmdArray: string[], next, _callback ) {

        this.doCommandCallback = ( err: Error ) => {
            
            if ( ! err ) {

                return this.capability ()
            }
            
            return this.imapServer.destroyAll ( err )
        }

        this.commandProcess = (  text: string, cmdArray: string[], next, callback ) => {
            switch ( cmdArray[0] ) {
                case '+':
                case '*': {
                    return callback ()
                }
                default:
                return callback ()
            }
        }
        
        switch ( cmdArray[0] ) {
            
            case '*': {                                  /////       *
                //          check imap server is login ok
                if ( /^ok$/i.test ( cmdArray [1]) && this.first ) {
                    this.first = false
                    this.Tag = `A${ this.imapServer.TagCount }`
                    this.cmd = `${ this.Tag } LOGIN "${ this.imapServer.IMapConnect.imapUserName }" "${ this.imapServer.IMapConnect.imapUserPassword }"`
                    this.debug ? debugOut ( this.cmd, false ) : null
                    this.callback = this._login = true
                    if ( this.writable )
                        return next ( null, this.cmd + '\r\n' )
                    this.imapServer.destroyAll(null)
                }
                //
                return _callback ()
            }
            default:
            
            return this.serverCommandError ( new Error ( `login switch default ERROR!` ), _callback )
        }

    }

    public createBox ( openBox: boolean, folderName: string, CallBack ) {

        this.doCommandCallback = ( err ) => {
            if ( err )
                return CallBack ( err )
            if ( openBox ) {
                return this.openBox ( CallBack )
            }
            return CallBack ()
        }
        this.commandProcess = ( text: string, cmdArray: string[], next, callback ) => {
            return callback ()
        }
        this.Tag = `A${ this.imapServer.TagCount }`
        this.cmd = `${ this.Tag } CREATE "${ folderName }"`
        this.debug ? debugOut ( this.cmd, false ) : null
        if ( this.writable ) {
            return this.push ( this.cmd + '\r\n')
        }
        
        return this.imapServer.destroyAll ( null )

    }

    private openBox ( CallBack ) {
        let newSwitchRet = false
        this.doCommandCallback = ( err ) => {
            if ( err ) {
                return this.createBox ( true, this.imapServer.listenFolder, CallBack )
            }
            CallBack ( null, newSwitchRet )
        }

        this.commandProcess = ( text: string, cmdArray: string[], next, _callback ) => {
            switch ( cmdArray[0] ) {
                case '*': {
                    if ( /^EXISTS$/i.test ( cmdArray [2])) {
                        if ( parseInt ( cmdArray[1])) {
                            newSwitchRet = true
                        }
                    }
                    return _callback ()
                }
                default:
                return _callback ()
            }
        }

        const conText = this.imapServer.condStoreSupport ? ' (CONDSTORE)' : ''
        
        this.Tag = `A${ this.imapServer.TagCount }`
        this.cmd = `${ this.Tag } SELECT "${ this.imapServer.listenFolder }"${ conText }`
        this.debug ? debugOut ( this.cmd, false ) : null
        if ( this.writable )
            return this.push ( this.cmd + '\r\n')
        this.imapServer.destroyAll(null)
    }

    public _logout ( callabck ) {
        this.doCommandCallback = callabck
        clearTimeout ( this.idleResponsrTime )
        this.commandProcess = ( text: string, cmdArray: string[], next, _callback ) => {
            return _callback ()
        }
        this.Tag = `A${ this.imapServer.TagCount }`
        this.cmd = `${ this.Tag } LOGOUT`
        this.debug ? debugOut ( this.cmd, false ) : null
        if ( this.writable ) {
            return this.push ( this.cmd + '\r\n')
        }
        callabck()
    }

    public append ( text: string, CallBack ) {
        if ( this.waitLogout ) {
            return this.logout_process ( this.waitLogoutCallBack )
        }
        this.canDoLogout = false
        this.doCommandCallback = ( err, info: string ) => {
            this.canDoLogout = true
            this.checkLogout (() => {
                CallBack ( err, info )
            })
        }
        let out = `Content-Type: application/octet-stream\r\nContent-Disposition: attachment\r\nMessage-ID:<${ Uuid.v4() }@>${ this.imapServer.domainName }\r\nContent-Transfer-Encoding: base64\r\nMIME-Version: 1.0\r\n\r\n${ text }`

        this.commandProcess = ( text1: string, cmdArray: string[], next, _callback ) => {
            switch ( cmdArray[0] ) {
                case '*':
                case '+': {
                    if ( ! this.imapServer.literalPlus && out.length && ! this.callback ) {
                        this.debug ? debugOut ( out, false ) : null
                        this.callback = true
                        next ( null, out + '\r\n' )
                    }
                    return _callback ()
                }
                default:
                return _callback ()
            }
        }

        this.Tag = `A${ this.imapServer.TagCount }`
        this.cmd = `APPEND "${ this.imapServer.writeFolder }" {${ out.length }${ this.imapServer.literalPlus ? '+' : ''}}`
        this.cmd = `${ this.Tag } ${ this.cmd }`
        const time = out.length / 1000 + 2000
        this.debug ? debugOut ( this.cmd, false ) : null
        if ( !this.writable )
            return this.imapServer.socket.end ()
        this.push ( this.cmd + '\r\n' )

        this.appendWaitResponsrTimeOut = setTimeout (() => {
            return this.imapServer.socket.end ()
        }, time )
        //console.log (`*************************************  append time = [${ time }] `)
        if ( this.imapServer.literalPlus ) {
            this.push ( out + '\r\n' )
            out = null
        }
            
    }

    public appendStream ( readStream: Stream.Readable, length: number, CallBack ) {
        if ( this.waitLogout ) {
            return this.logout_process ( this.waitLogoutCallBack )
        }
        this.canDoLogout = false
        this.doCommandCallback = () => {
            this.canDoLogout = true
            this.checkLogout ( CallBack )
        }
        let out = `Content-Type: application/octet-stream\r\nContent-Disposition: attachment\r\nMessage-ID:<${ Uuid.v4() }@>${ this.imapServer.domainName }\r\nContent-Transfer-Encoding: base64\r\nMIME-Version: 1.0\r\n\r\n`
        this.commandProcess = ( text1: string, cmdArray: string[], next, _callback ) => {
            switch ( cmdArray[0] ) {
                case '*':
                case '+': {
                    if ( ! this.imapServer.literalPlus && out.length && ! this.callback ) {
                        this.debug ? debugOut ( out, false ) : null
                        this.callback = true
                        readStream.once ( 'end', () => {
                            console.log ( `========> stream on end!` )
                        })
                        next ( null, out )
                        readStream.pipe ( this.imapServer.imapStream )
                    }
                    return _callback ()
                }
                default:
                return _callback ()
            }
        }
        const _length = out.length + length
        this.Tag = `A${ this.imapServer.TagCount }`
        this.cmd = `APPEND "${ this.imapServer.writeFolder }" {${ _length }${ this.imapServer.literalPlus ? '+' : ''}}`
        this.cmd = `${ this.Tag } ${ this.cmd }`
        const time = out.length / 1000 + 2000
        this.debug ? debugOut ( this.cmd, false ) : null
        if ( !this.writable )
            return this.imapServer.socket.end ()
        this.push ( this.cmd + '\r\n' )

        this.appendWaitResponsrTimeOut = setTimeout (() => {
            return this.imapServer.socket.end ()
        }, time )
        //console.log (`*************************************  append time = [${ time }] `)
        if ( this.imapServer.literalPlus ) {
            readStream.once ( 'end', () => {
                console.log ( `========> stream on end!` )
            })
            this.push ( out + '\r\n' )
            readStream.pipe ( this.imapServer.imapStream  )
            out = null
        }
    }

    public seachUnseen ( callabck ) {
        let newSwitchRet = null
        let moreNew = false
        this.doCommandCallback = ( err ) => {
            if ( err )
                return callabck ( err )
            return callabck ( null, newSwitchRet, moreNew )
        }
        this.commandProcess = ( text: string, cmdArray: string[], next, _callback ) => {
            switch ( cmdArray[0] ) {
                case '*': {
                    if ( /^SEARCH$/i.test ( cmdArray [1] ) ) {
                        const uu1 = cmdArray[2] && cmdArray[2].length > 0 ? parseInt ( cmdArray[2] ) : 0
                        if ( cmdArray.length > 2 && uu1 ) {
                            if ( ! cmdArray [ cmdArray.length - 1 ].length )
                                cmdArray.pop ()
                            
                            const uu = cmdArray.slice ( 2 ).join ( ',' )
                            if ( /\,/.test ( uu [ uu.length - 1 ]) )
                                uu.substr ( 0, uu.length - 1 )
                            
                            newSwitchRet =  uu
                            moreNew = cmdArray.length > 3
                        }
                    } 
                    return _callback ()
                }
                default:
                return _callback ()
            }
        }

        this.Tag = `A${ this.imapServer.TagCount }`
        this.cmd = `${ this.Tag } UID SEARCH UNSEEN`
        this.debug ? debugOut ( this.cmd, false ) : null
        if ( this.writable )
            return this.push ( this.cmd + '\r\n')
        return this.imapServer.destroyAll ( null )
    }

    public fetch ( fetchNum, callback ) {

        this.doCommandCallback = ( err ) => {
            return callback ( err, newSwitchRet )
        }
        
        let newSwitchRet = false

        this.commandProcess = ( text1: string, cmdArray: string[], next, _callback ) => {
            switch ( cmdArray[0] ) {
                case '*': {
                    if ( /^FETCH$/i.test ( cmdArray [ 2 ] ) && /BODY\[\]/i.test ( cmdArray [ cmdArray.length - 2 ])) {
                        const last = cmdArray[ cmdArray.length - 1 ]
                        if ( /\{\d+\}/.test ( last )) {
                            this.imapServer.fetching = parseInt ( last.substr ( 1, last.length - 2 ))
                        }
                        return _callback ()
                    }
                    if ( /^RECENT$/i.test ( cmdArray[2]) && parseInt (cmdArray[1]) > 0 ) {
                        newSwitchRet = true
                    }
                    return _callback ()
                }
                default:
                return _callback ()
            }
        }

        this.cmd = `UID FETCH ${ fetchNum } ${ this.imapServer.fetchAddCom }`
        this.Tag = `A${ this.imapServer.TagCount }`
        this.cmd = `${ this.Tag } ${ this.cmd }`
        this.debug ? debugOut ( this.cmd, false ) : null
        if ( this.writable )
            return this.push ( this.cmd + '\r\n' )
        return this.imapServer.logout ()
    }

    private deleteBox ( CallBack ) {
        this.doCommandCallback = CallBack
        this.commandProcess = ( text1: string, cmdArray: string[], next, _callback ) => {
            return _callback ()
        }
        this.cmd = `DELETE "${ this.imapServer.listenFolder }"`
        this.Tag = `A${ this.imapServer.TagCount }`
        this.cmd = `${ this.Tag } ${ this.cmd }`
        this.debug ? debugOut ( this.cmd, false ) : null
        if ( this.writable )
            return this.push ( this.cmd + '\r\n' )
        return this.imapServer.destroyAll ( null )
    }

    public deleteAMailBox ( boxName: string, CallBack ) {
        
        this.doCommandCallback = err => {

            return CallBack ( err )
        }
        this.commandProcess = ( text1: string, cmdArray: string[], next, _callback ) => {
            return _callback ()
        }
        this.cmd = `DELETE "${ boxName }"`
        this.Tag = `A${ this.imapServer.TagCount }`
        this.cmd = `${ this.Tag } ${ this.cmd }`
        this.debug ? debugOut ( this.cmd, false ) : null
        if ( this.writable )
            return this.push ( this.cmd + '\r\n' )
        return this.imapServer.destroyAll ( null )
    }

    public logout ( callback: () => void ) {
        if ( this.waitLogout )
            return callback
        this.waitLogout = true
        this.checkLogout ( callback )
    }

    public logout_process ( callback ) {
        
        if ( ! this.writable ) {
            console.log (`logout_process [! this.writable] run return callback ()`)
            return callback ()
        }
            
        const doLogout = () => {
            
            if ( this.imapServer.listenFolder && this.imapServer.deleteBoxWhenEnd ) {
                return Async.series ([
                    next => { /^INBOX$/i.test( this.imapServer.listenFolder ) ? next () : this.deleteBox ( next )},
                    next => this._logout ( next )
                ], callback )
            }
            return this._logout ( callback )
        }
        if ( this.imapServer.listenFolder && this.runningCommand ) {
            saveLog  (`logout_process [this.imapServer.listenFolder && this.runningCommand], doing this.idleStop ()`)
            this.idleCallBack = doLogout
            return this.idleStop ()
        }

        doLogout ()
    }

    public flagsDeleted ( num: string, CallBack ) {
        this.doCommandCallback = err => {
            //saveLog ( `ImapServerSwitchStream this.flagsDeleted [${ this.imapServer.listenFolder }] doing flagsDeleted success! typeof CallBack = [${ typeof CallBack }]`)
            return CallBack ( err )
        }
        this.commandProcess = ( text1: string, cmdArray: string[], next, _callback ) => {
            return _callback ()
        }
        this.cmd = `UID STORE ${ num } FLAGS.SILENT (\\Deleted)`
        this.Tag = `A${ this.imapServer.TagCount }`
        this.cmd = `${ this.Tag } ${ this.cmd }`
        this.debug ? debugOut ( this.cmd, false ) : null
        if ( this.writable )
            return this.push ( this.cmd + '\r\n' )
        return this.imapServer.destroyAll ( null )
    }

    public expunge ( CallBack ) {

        let newSwitchRet = false
        this.doCommandCallback = err => {
            
            return CallBack ( err, newSwitchRet )
        }
        this.commandProcess = ( text: string, cmdArray: string[], next , _callback ) => {
            switch ( cmdArray[0] ) {
                case '*': {
                    if ( /^EXPUNGE$/i.test ( cmdArray [2])) {
                        if ( parseInt ( cmdArray[1])) {
                            
                        }
                    }
                    if ( /^RECENT$/i.test ( cmdArray[2]) && parseInt (cmdArray[1]) > 0 ) {
                        newSwitchRet = true
                    }
                    return _callback ()
                }
                default:
                return _callback ()
            }
        }
        
        this.Tag = `A${ this.imapServer.TagCount }`
        this.cmd = `${ this.Tag } EXPUNGE`
        this.debug ? debugOut ( this.cmd, false ) : null
        if ( this.writable )
            return this.push ( this.cmd + '\r\n')
        return this.imapServer.destroyAll ( null )
    }

    public listAllMailBox ( CallBack ) {
        let boxes = []
        this.doCommandCallback = ( err ) => {
            if ( err )
                return CallBack ( err )
            return CallBack ( null, boxes )
        }
        this.commandProcess = ( text: string, cmdArray: string[], next, _callback ) => {
            switch ( cmdArray[0] ) {
                case '*': {
                    saveLog ( text )
                    if ( /^LIST/i.test ( cmdArray [1] ) ) {
                        boxes.push ( cmdArray[2] + ',' + cmdArray[4] )
                    } 
                    return _callback ()
                }
                default:
                return _callback ()
            }
        }

        this.Tag = `A${ this.imapServer.TagCount }`
        this.cmd = `${ this.Tag } LIST "" "*"`
        this.debug ? debugOut ( this.cmd, false ) : null
        if ( this.writable )
            return this.push ( this.cmd + '\r\n')
        return this.imapServer.destroyAll ( null )
    }
}

export class qtGateImap extends Event.EventEmitter {
    public socket: Net.Socket
    public imapStream: ImapServerSwitchStream = new ImapServerSwitchStream ( this, this.deleteBoxWhenEnd, this.debug )
    public newSwitchRet = null
    public newSwitchError = null
    public fetching = null
    private tagcount = 0
    public domainName = this.IMapConnect.imapUserName.split ('@')[1]
    public serverSupportTag = null
    public idleSupport = null
    public condStoreSupport = null
    public literalPlus = null
    public fetchAddCom = ''
    private port = parseInt ( this.IMapConnect.imapPortNumber )
    public get TagCount () {
        if ( ++ this.tagcount < MAX_INT )
            return this.tagcount
        return this.tagcount = 0
    }
    private connectTimeOut = null

    private connect () {

        const handleEvent = () => {
            //  socket event 
                this.socket.once ( 'error', err => {
                    console.log ( `imap socket on ERROR [${ err }]` )
                    this.destroyAll ( err )
                })

            //-

            //  imapStream event

                this.imapStream.once ( 'ready', () => {
                    console.log ( `this.imapStream.once ready! [${ this.listenFolder }][${ this.writeFolder }]`)
                    this.emit ( 'ready' )
                })
            //-
        }

        const onConnect = () => {
            clearTimeout ( this.connectTimeOut )
            handleEvent ()
            this.socket.pipe ( this.imapStream ).pipe ( this.socket )
            
        }

        if ( ! this.IMapConnect.imapSsl ) {
            this.socket = Net.createConnection ({ port: this.port, host: this.IMapConnect.imapServer }, onConnect )
        } else {
            //      for Uncaught Error: socket hang up
            //      https://stackoverflow.com/questions/40228074/nodejs-tlssocket-onhangup
            //  
            const catchUncaughtException = err => {
                console.log ( `********* qtGateImap got process uncaught Exception [${ err }]`)
                this.destroyAll ( null )
            }

            process.once ( 'uncaughtException', catchUncaughtException )

            const jj = Tls.connect ({ rejectUnauthorized: ! this.IMapConnect.imapIgnoreCertificate, host: this.IMapConnect.imapServer, port: this.port }, () => {

                process.removeListener ( 'uncaughtException', catchUncaughtException )

                jj.once ( 'error', err => {
                    console.log (`jj.once ( 'error' ) listenFolder[${ this.listenFolder }] writeFolder [${ this.writeFolder }]`)
                    this.destroyAll ( err )
                })
                jj.once ( 'end', () => {
                    
                    this.destroyAll ( null )
                })
                
                this.socket = jj
                clearTimeout ( this.connectTimeOut )
            })
            
            jj.pipe ( this.imapStream ).pipe ( jj )
        }

    
        this.connectTimeOut = setTimeout (() => {
            if ( this.socket ) {
                if ( this.socket.destroy )
                    return this.socket.destroy ()
                this.socket.end ()
            }
            this.imapStream.end ()
        }, socketTimeOut )
    }

    constructor ( public IMapConnect: imapConnect, public listenFolder: string, public deleteBoxWhenEnd: boolean, public writeFolder: string, private debug: boolean, public newMail: ( mail ) => void ) {
        super ()
        this.connect ()
        this.once ( `error`, err => {
            console.trace ( `qtGateImap on error [${ err  }]` )
        })
        
    }

    public destroyAll ( err: Error ) {
        
        clearTimeout ( this.imapStream.idleResponsrTime )
        clearTimeout ( this.imapStream.appendWaitResponsrTimeOut )
        clearTimeout ( this.imapStream.idleNextStop )
        this.emit ( 'end', err )
        if ( this.socket && typeof this.socket.end === 'function' )
            this.socket.end()
        
    }

    public logout () {
        return this.imapStream.logout (() => {
            return this.destroyAll ( null )
        })
    }

}

const appendFromFile = ( imap: ImapServerSwitchStream, fileName: string, CallBack ) => {
    if ( imap.waitLogout ) {
        return imap.logout_process ( imap.waitLogoutCallBack )
    }
    
    return Fs.stat ( fileName, ( err, stat: Fs.Stats ) => {
        if ( err ) {
            saveLog ( `appendFromFile s.stat got error! [${ err.message }]` )
            return CallBack ( err )
        }
        
        imap.canDoLogout = false
        imap.doCommandCallback = ( err, info: string ) => {
            saveLog ( `appendFromFile doCommandCallback err [${ err }], info [${ info }]`)
            imap.canDoLogout = true
            return imap.checkLogout (() => {
                return CallBack ( err, info )
            })
        }
        let readFile = Fs.createReadStream ( fileName, { encoding: 'utf8' })
        readFile.once ( 'close', () => {
            saveLog (`appendFromFile readFile.once close! imap.writable [${ imap.writable }]`)
            if ( imap.writable ) {
                return imap.push ('\r\n\r\n')
            }
            
            //imap.resume()
            //return Fs.unlink ( fileName, () => {})
        })

        imap.commandProcess = ( text1: string, cmdArray: string[], _next, _callback ) => {
            switch ( cmdArray [0] ) {
                case '*':
                case '+': {
                    if ( ! imap.imapServer.literalPlus && readFile && ! imap.callback ) {
                        imap.callback = true
                        readFile.on ( 'data', ( chunk: Buffer ) => {
                            return _next ( chunk )
                        })
                        _next ()
                    }
                    return _callback ()
                }
                default:
                return _callback ()
            }
        }
        
        imap.Tag = `A${ imap.imapServer.TagCount }`
        imap.cmd = `${ imap.Tag } APPEND "${ imap.imapServer.writeFolder }" {${ stat.size }${ imap.imapServer.literalPlus ? '+' : ''}}`
        const time = stat.size / 1000 + 2000
        imap.debug ? debugOut ( imap.cmd, false ) : null
        if ( ! imap.writable ) {
            return imap.imapServer.socket.end ()
        }
            
        imap.push ( imap.cmd + '\r\n' )

        imap.appendWaitResponsrTimeOut = setTimeout (() => {
            return imap.imapServer.socket.end ()
        }, time )
        //console.log (`*************************************  append time = [${ time }] `)
        if ( imap.imapServer.literalPlus ) {
            return readFile.on ( 'data', ( chunk: Buffer ) => {
                if ( imap.writable ) {
                    //saveLog (`appendFromFile append stream length [${ chunk.length }]`)
                    return imap.push ( chunk.toString() )
                }
                return imap.imapServer.socket.end ()
            })
        }
    })
}

export class qtGateImapwrite extends qtGateImap {

    private ready = false
    public canAppend = false
    private appendPool: qtGateImapwriteAppendPool[]  = []
    private appenfFilesPool: { fileName: string, CallBack: any }[] = []

    public appendFromFile3 ( fileName: string, CallBack ) {
        if ( ! this.ready || !this.canAppend  ) {
            return this.appenfFilesPool.push ({
                fileName: fileName,
                CallBack: CallBack
            })
        }
        this.canAppend = false
        return appendFromFile ( this.imapStream, fileName, err => {
            this.canAppend = true
            //saveLog ( `qtGateImapwrite appendFromFile CallBack err = [${ err && err.message ? err.message : null }]`)
            CallBack ( err )
            if ( this.appenfFilesPool.length ) {
                const uu = this.appenfFilesPool.shift ()
                return this.appendFromFile3 ( uu.fileName, uu.CallBack )
            }
        })
        
    }

    public append ( text: string, _callback ) {
        
        if ( ! this.ready ) {
            return _callback ( new Error ( 'not ready!' ))            
        }
        if ( this.canAppend ) {
            this.canAppend = false
            return this.imapStream.append ( text, ( err, code ) => {
                this.canAppend = true
                _callback ( err, code )
                const uu = this.appendPool.shift ()
                if ( uu ) {
                    return this.append ( uu.text, uu.callback )
                }
            })
        }
        const waitData: qtGateImapwriteAppendPool = {
            callback: _callback,
            text: text
        }
        return this.appendPool.push ( waitData )
    }
    
    constructor ( IMapConnect: imapConnect, writeFolder: string ) {
        super ( IMapConnect, null, false, writeFolder, debug, null )
        this.once ( 'ready', () => {
            this.ready = this.canAppend = true
        })
        
    }

    public ListAllFolders ( CallBack ) {
        if ( ! this.ready ) {
            return CallBack ( new Error ( 'not ready!' ))            
        }
        return this.imapStream.listAllMailBox ( CallBack )
    }

    public deleteBox ( boxName: string, CallBack ) {
        return this.imapStream.deleteAMailBox ( boxName, CallBack )
    }
}
        
export class qtGateImapRead extends qtGateImap {

    private openBox = false

    public fetchAndDelete ( Uid: string, CallBack ) {
        if ( !this.openBox )
            return CallBack ( new Error ('not ready!'))
        return Async.series ([
            next => this.imapStream.fetch ( Uid, next ),
            next => this.imapStream.flagsDeleted ( Uid, next ),
            next => this.imapStream.expunge ( next )
        ], CallBack )
    }

    constructor ( IMapConnect: imapConnect, listenFolder: string, deleteBoxWhenEnd: boolean, newMail: ( mail ) => void ) {
        super ( IMapConnect, listenFolder, deleteBoxWhenEnd, null, debug, newMail )
        this.once ( 'ready', () => {
            this.openBox = true
        })
    }
    
}

export const getMailAttached = ( email: Buffer ) => {
    
    const attachmentStart = email.indexOf ('\r\n\r\n')
    if ( attachmentStart < 0 ) {
        console.log (`getMailAttached error! can't faind mail attahced start!`)
        return null
    }
    const attachment = email.slice ( attachmentStart + 4 )
    return Buffer.from ( attachment.toString(), 'base64')
}

export const getMailAttachedBase64 = ( email: Buffer ) => {
    
    const attachmentStart = email.indexOf ('\r\n\r\n')
    if ( attachmentStart < 0 ) {
        console.log ( `getMailAttached error! can't faind mail attahced start!`)
        return null
    }
    const attachment = email.slice ( attachmentStart + 4 )
    return attachment.toString()
}

export const imapBasicTest = ( IMapConnect: imapConnect, CallBack ) => {
    saveLog ( `start imapBasicTest imap [${ JSON.stringify (IMapConnect) }]`)
    let callbackCall = false
    let append = false
    let timeout: NodeJS.Timer = null
    const listenFolder = 'INBOX'
    let getText = false
    const ramdomText = Crypto.randomBytes ( 1024*100 )

    const doCallBack = ( err, ret ) => {
        if ( ! callbackCall ) {
            callbackCall = true
            clearTimeout ( timeout )
            return CallBack ( err, ret )
        }
    }
    
    let wImap = new qtGateImapwrite ( IMapConnect, listenFolder )

    const doCatchMail = ( id, _CallBack ) => {
        let didFatch = false
        
        let err: Error = null
        let rImap = new qtGateImapRead ( IMapConnect, listenFolder, false, mail => {
            saveLog (`new mail`)
            const attach = getMailAttached ( mail )
            if ( ! attach ) {
                err = new Error ( `imapAccountTest ERROR: can't read attachment!`)
            } else 
            if ( ramdomText.compare ( attach ) !== 0 ) {
                err = new Error ( `imapAccountTest ERROR: attachment changed!`)
            } else {

                getText = true
            }   
            
        })

        rImap.once ( 'ready', () => {
            rImap.fetchAndDelete ( id, _err => {
                didFatch = true
                if ( _err ) {
                    err = _err
                }
                saveLog (`rImap.fetchAndDelete finished by err [${ err && err.message ? err.message : null }]` )
                rImap.logout ()
                rImap = null
            })
        })

        rImap.once ( 'end', err => {
            if ( !didFatch ) {
                saveLog (`doCatchMail rImap.once end but didFatch = false try again!`)
                return doCatchMail ( id, _CallBack )
            }
            _CallBack ( err , getText )
        })
    }

    wImap.once ( 'ready', () => {
        saveLog (`imapBasicTest wImap.once ( 'ready' )`)
        wImap.append ( ramdomText.toString ('base64'), ( err, code: string ) => {
            append = true
            if ( err ) {
                saveLog (`wImap.append got error [${ err.message }]`)
                return doCallBack ( err, null )
            }

            if ( !code ) {
                saveLog (`wImap.append got no append id!`)
                return doCallBack ( new Error (`no append id!`), null )
            }
            const uid = code.substring ( code.search(/\[/), code.search(/\]/)).split (' ')[2]
            wImap.logout ()
            wImap = null
            doCatchMail ( uid, doCallBack )
        })
        
    })

    wImap.once ( 'end', err => {
        if ( !append && ! err ) {
            saveLog (`imapBasicTest wImap.once ( 'end', err = [${ err && err.message ? err.message : 'undefine'}] but !startTime do imapBasicTest again! )`)
            return imapBasicTest ( IMapConnect, CallBack )
        }
        return doCallBack ( err, null )
    })

    wImap.once ( 'error', err => {
        return doCallBack ( err, null )
    })
}

export const imapAccountTest = ( IMapConnect: imapConnect, CallBack ) => {
    saveLog ( `start test imap [${ JSON.stringify ( IMapConnect ) }]`)
    let callbackCall = false
    let startTime = null
    let wImap: qtGateImapwrite = null
    const listenFolder = Uuid.v4 ()
    const ramdomText = Crypto.randomBytes ( 20 )
    let timeout: NodeJS.Timer = null

    const doCallBack = ( err, ret ) => {
        if ( ! callbackCall ) {
            console.trace ('imapAccountTest doCallBack')
            saveLog (`imapAccountTest doing callback err [${ err && err.messgae ? err.messgae : `undefine `}] ret [${ ret ? ret : 'undefine'}]`)
            callbackCall = true
            clearTimeout ( timeout )
            return CallBack ( err, ret )
        }
    }
    
    let rImap = new qtGateImapRead ( IMapConnect, listenFolder, false, mail => {
        rImap.logout ()
        rImap = null
        const attach = getMailAttached ( mail )
        saveLog ( `test rImap on new mail! ` )
        if ( ! attach ) {
            return doCallBack ( new Error ( `imapAccountTest ERROR: can't read attachment!`), null )
        }
        if ( ramdomText.compare ( attach ) !== 0 ) {
            return doCallBack ( new Error ( `imapAccountTest ERROR: attachment changed!`), null )
        }

        return doCallBack ( null, new Date().getTime () - startTime )
    })

    rImap.once ( 'ready', () => {
        saveLog ( `rImap.once ( 'ready' ) do new qtGateImapwrite`)
        wImap = new qtGateImapwrite ( IMapConnect, listenFolder )
        let sendMessage = false
        wImap.once ( 'ready', () => {
            saveLog (`wImap.once ( 'ready' )`)

            wImap.append ( ramdomText.toString ('base64'), err => {
                sendMessage = true
                wImap.logout ()
                wImap = null
                if ( err ) {
                    rImap.logout ()
                    rImap = null
                    saveLog (`wImap.append err [${ err.message ? err.message : 'none err.message'}]` )
                    return doCallBack ( err, null )
                }
                startTime = new Date ().getTime ()
                timeout = setTimeout (() => {
                    if ( rImap ) {
                        rImap.logout ()
                    }
                    if ( wImap ) {
                        wImap.logout ()
                    }
                    saveLog (`imapAccountTest doing timeout`)
                    doCallBack ( new Error ( 'timeout' ), null )
                }, pingPongTimeOut )
            })
        })

        wImap.once ( 'end', () => {
            if ( !sendMessage ) {
                rImap.logout ()
                rImap = null
                saveLog (`wImap.once ( 'end') before send message! do imapAccountTest again!`)
                return imapAccountTest ( IMapConnect, CallBack )
            }
        })
    })

    rImap.once ( 'end', err => {
        saveLog (`rImap.once ( 'end' ) [${ err && err.message ? err.message : 'err = undefine' }]`)
        if (! callbackCall && !err ) {
            saveLog (`rImap.once ( 'end') before finished test! do imapAccountTest again!`)
            return imapAccountTest ( IMapConnect, CallBack )
        }
        return doCallBack ( err, null )
    })

    rImap.once ( 'error', err => {
        saveLog (`rImap.once ( 'error' ) [${ err.message }]`)
        return doCallBack ( err, null )
    })


}

export const imapGetMediaFile = ( IMapConnect: imapConnect, fileName: string, CallBack ) => {
    let rImap = new qtGateImapRead ( IMapConnect, fileName, true, mail => {
        rImap.logout ()
        const retText = getMailAttachedBase64 ( mail )
        return CallBack ( null, retText )
    })
}

const pingPongTimeOut = 1000 * 30

export class imapPeer extends Event.EventEmitter {
    private mailPool = []
    public domainName = this.imapData.imapUserName.split('@')[1]
    public rImapReady = false
    private waitingReplyTimeOut: NodeJS.Timer = null
    private pingUuid = null
    private doingDestroy = false
    private wImapReady = false
    private peerReady = false
    private sendFirstPing = false
    public newMail: ( data: any ) => void
    private makeWImap = false


    private mail ( email: Buffer ) {

        const attr = getMailAttached (  email ).toString ()
        
        this.deCrypto ( attr, ( err, data ) => {
            if ( err ) {
                saveLog ( email.toString())
                saveLog ('******************')
                saveLog ( attr )
                saveLog ('****************************************')
                return saveLog ( `deCrypto GOT ERROR! [${ err.message }]` )
            }
            let uu = null
            try {
                uu = JSON.parse ( data )
            } catch ( ex ) {
                saveLog ( data )
                return saveLog ( `imapPeer mail deCrypto JSON.parse got ERROR [${ ex.message }]`)
            }
            if ( uu.ping && uu.ping.length ) {
                saveLog ( 'GOT PING REPLY PONG!' )
                
                if ( ! this.peerReady ) {
                    
                    if ( /outlook\.com/i.test ( this.imapData.imapServer)) {
                        saveLog ( `doing outlook server support!`)
                        return setTimeout (() => {
                            saveLog (`outlook replyPing ()`)
                            this.pingUuid = null
                            this.replyPing ( uu )
                            return this.Ping ( )
                        }, 5000 )
                    }
                    this.replyPing ( uu )
                    saveLog ( `THIS peerConnect have not ready send ping!`)

                    this.pingUuid = null
                    return this.Ping ( )
                }
                return this.replyPing ( uu )
            }
            
            if ( uu.pong && uu.pong.length ) {
                if ( !this.pingUuid || this.pingUuid !== uu.pong ) {
                    return saveLog (`Invalid ping uuid [${ JSON.stringify ( uu )}]`)
                }
                saveLog ( `imapPeer connected Clear waitingReplyTimeOut!`)
                this.pingUuid = null
                clearTimeout ( this.waitingReplyTimeOut )
                return this.emit ('ready')
            }
            return this.newMail (uu )
                
            
        })

    }

    public trySendToRemote ( email: Buffer, CallBack ) {
        if ( this.wImap && this.wImapReady ) {
            return this.wImap.append ( email.toString ( 'base64' ), err => {
                if ( err) {
                    if ( err.message && /TRYCREATE/i.test( err.message )) {
                        this.emit ('wFolder')
                    }
                    saveLog (`this.wImap.append ERROR: [${ err.message ? err.message : '' }]`)
                }
                return CallBack ( err )
            })
        }
        this.sendMailPool.push ( email )
        this.newWriteImap ()
        return CallBack ()
    }


    private replyPing ( uu ) {
        
        return this.enCrypto ( JSON.stringify ({ pong: uu.ping }), ( err, data ) => {
            return this.trySendToRemote ( Buffer.from ( data ), () => {
                saveLog ( `replyPing ${ JSON.stringify ( uu )}` )
            })
        })
    }

    private setTimeOutOfPing () {

        saveLog (`setTimeOutOfPing`)
        clearTimeout ( this.waitingReplyTimeOut )
        return this.waitingReplyTimeOut = setTimeout (() => {
            saveLog (`ON setTimeOutOfPing this.emit ( 'pingTimeOut' ) `)
            this.emit ( 'pingTimeOut' )
        }, pingPongTimeOut)
    }
    
    public Ping () {

        this.pingUuid = Uuid.v4 ()
        saveLog ( `Ping! ${ this.pingUuid }` )
        return this.enCrypto ( JSON.stringify ({ ping: this.pingUuid }), ( err, data ) => {
            if ( err ) {
                return saveLog ( `Ping enCrypto error: [${ err.message }]`)
            }
            return this.trySendToRemote ( Buffer.from ( data ), () => {
                return this.setTimeOutOfPing ()
            })
        })
    }

    private rImap: qtGateImapRead = null

    private sendMailPool: Buffer[] = []

    private sendAllMail () {

        if ( ! this.sendMailPool.length || ! this.wImapReady )
            return saveLog ( `sendAllMail do nothing! sendMailPool.length [${ this.sendMailPool.length }] wImapReady [${ this.wImapReady }]`)

        const uu = this.sendMailPool.pop ()
        if ( !uu )
            return saveLog ( `sendAllMail this.sendMailPool.pop () got nothing!` )
        this.trySendToRemote ( uu, () => {})
    }

    private newWriteImap() {
        if ( this.makeWImap || this.wImap ) {
            return
        }
        this.makeWImap = true
        saveLog (`newWriteImap`)
        this.wImap = new qtGateImapwrite ( this.imapData, this.writeBox )

        this.wImap.once ( 'end', err => {
            saveLog ( `this.wImap.once end ! [${ err && err.message ? err.message : null }]!` )
            this.wImap = null
            this.wImapReady = false
            this.makeWImap = false
            if ( this.sendMailPool.length > 0 ) {
                saveLog ( `this.wImap.once end ! sendMailPool.length > 0 [${ this.sendMailPool.length }] newWriteImap () ` )
                
                return this.newWriteImap ()
            }
        })

        this.wImap.once ( 'error', err => {
            if ( err && err.message && /auth|login|log in|Too many simultaneous|UNAVAILABLE/i.test ( err.message )) {
                return this.destroy (1)
            }
            saveLog ( `imapPeer this.wImap on error [${ err.message }]`)
            this.wImapReady = false
            this.wImap = null
            //this.wImap.destroyAll(null)
        })

        this.wImap.once ( 'ready', () => {
            saveLog ( `wImap.once ( 'ready')`)
            this.wImapReady = true
            if ( this.sendFirstPing ) {
                this.sendAllMail ()
                return saveLog ( `this.wImap.once on ready! already sent ping`)
            }
                
            this.sendFirstPing = true
            this.Ping ()
            //if ( /outlook\.com/i.test ( this.imapData.imapServer )) {
                
                return this.once ( 'wFolder', () => {
                    saveLog ( `this.once ( 'wFolder') do makeWriteFolder!`)
                    return this.makeWriteFolder (() => {
                        return this.Ping ()
                    })
                })
            //}
        })
    }

    private newReadImap() {
        saveLog (`newReadImap!`)
        this.rImap = new qtGateImapRead ( this.imapData, this.listenBox, false, email => {
            this.mail ( email )
        })

        this.rImap.once ( 'ready', () => {
            saveLog ( `this.rImap.once on ready `)
            this.rImapReady = true
            
            if ( !this.wImap ) {
                saveLog ( `now make new wImap! `)
                return this.newWriteImap ()
            }
            
        })
        this.rImap.once ( 'error', err => {
            saveLog ( `rImap on Error [${ err.message }]`)
            if ( err && err.message && /auth|login|log in|Too many simultaneous|UNAVAILABLE/i.test ( err.message )) {
                return this.destroy (1)
            }
            this.rImap.destroyAll (null)

        })
        this.rImap.once ( 'end', err => {
            
            this.rImap = null
            if ( !this.doingDestroy && !err ) {
                return this.newReadImap ()
            }
            this.exit ( err )
        })
    }

    private wImap: qtGateImapwrite = null

    constructor ( public imapData: imapConnect, private listenBox: string, private writeBox: string,
        private enCrypto: ( text: string, callback: ( err?: Error, data?: string ) => void ) => void,
        private deCrypto: ( text: string, callback: ( err?: Error, data?: string ) => void ) => void,
        private exit: ( err?: number ) => void) {
        super ()
        saveLog ( `doing peer account [${ imapData.imapUserName }] listen with[${ listenBox }], write with [${ writeBox }] `)
        this.newReadImap ()
    }

    private makeWriteFolder (CallBack) {
        
        let uu = new qtGateImapRead ( this.imapData, this.writeBox, false, email => {})
        uu.once ( 'ready', () => {
            uu.destroyAll ( null )
            this.pingUuid = null
            this.wImap.destroyAll (null)
            return CallBack ()
        })
        uu.once ( 'error', err => {
            saveLog ( `makeWriteFolder error! do again!`)
            uu = null
            return this.makeWriteFolder ( CallBack )
        })
        uu.once ( 'end', () => {
            uu = null
        })
    }

    public destroy ( err?: number ) {
        console.trace ('destroy')
        if ( this.doingDestroy )
            return
        this.doingDestroy = true
        this.rImapReady = false
        this.wImapReady = false
       
        if (this.wImap) {
            this.wImap.destroyAll (null)
            this.wImap = null
        }
        if ( this.rImap ) {
            this.rImap.destroyAll ( null )
            this.rImap = null
        }
        if ( this.removeAllListeners && typeof this.removeAllListeners === 'function' )
            this.removeAllListeners ()
        if  ( this.exit && typeof this.exit === 'function' ) {
            this.exit ( err )
            this.exit = null
        }
    }

    private sendDone () {
        return Async.waterfall ([
            next => this.enCrypto ( JSON.stringify ({ done: new Date().toISOString()}), next),
            ( data, next ) => this.trySendToRemote ( Buffer.from ( data ), next )
        ], err => {
            if ( err )
                return saveLog (`sendDone got error [${ err.message }]`)
        })
    }

}

export const sendMediaData = ( imapPeer: imapPeer, mediaData: string, CallBack ) => {
    const writeBox = Uuid.v4 ()
    let _return = false
    let _err = null
    let wImap = new qtGateImapwrite ( imapPeer.imapData, writeBox )
    wImap.once ( 'error', err => {
        _err = err
        wImap.logout ()
        if ( err.message && /auth|login|log in|Too many simultaneous|UNAVAILABLE/i.test ( err.message )) {
            if ( !_return ) {
                _return = true
                return CallBack ( err )
            }
            return
        }
        return sendMediaData ( imapPeer, mediaData, CallBack )
    })

    wImap.once ( 'end', err => {
        wImap = null
        //saveLog ( `trySendToRemoteFromFile on end! err = [${ err }]` )
        if ( !_return ) {
            _return = true
            return CallBack ( _err, writeBox )
        }
    })

    wImap.once ( 'ready', () => {
        //saveLog ( `trySendToRemoteFromFile wImap on ready for [${ fileName }]`)
        return Async.series ([
            next => wImap.imapStream.createBox ( false, writeBox, next ),
            next => wImap.append ( mediaData, next )
        ], err => {
            _err = err
            wImap.logout ()
        })
    })
}

export const trySendToRemoteFromFile1Less10MB4 = ( imapPeer: imapPeer, fileName: string, CallBack ) => {
    //saveLog (`doing trySendToRemoteFromFile1Less10MB fileName = [${ fileName }]`)
    const filePath = fileName.split ('/videoTemp/')
    const writeBox = filePath[ filePath.length - 1 ]
    let _return = false
    let wImap = new qtGateImapwrite ( imapPeer.imapData, writeBox )
    wImap.once ( 'error', err => {
        wImap.logout ()
        if ( err && err.message && /auth|login|log in|Too many simultaneous|UNAVAILABLE/i.test ( err.message )) {
            
            if ( !_return ) {
                _return = true
                return CallBack ( err )
            }
            return
        }
        return trySendToRemoteFromFile1Less10MB4 ( imapPeer, fileName, CallBack )
    })

    wImap.once ( 'end', err => {
        wImap = null
        Fs.unlink (fileName, () => {
            //saveLog ( `trySendToRemoteFromFile on end! err = [${ err }]` )
            if ( !_return ) {
                _return = true
                return CallBack ( err )
            }
        })
        
    })

    wImap.once ( 'ready', () => {
        //saveLog ( `trySendToRemoteFromFile wImap on ready for [${ fileName }]`)
        return Async.series ([
            next => wImap.imapStream.createBox ( false, writeBox, next ),
            next=> wImap.appendFromFile3 ( fileName, next ),
            next => wImap.logout ()
        ], err => {
            if ( err ){
                return wImap.destroyAll( err )
            }
        })
        
    })
}

const saveLogForstreamImap = ( log: any ) => {
    const Fs = require ('fs')
	const data = `${ new Date().toUTCString () }: ${ log }\r\n`
	Fs.appendFile ( ErrorLogFileStream, data, { flag: flag }, err => {
		flag = 'a'
	})
}

const debugOutStream = ( text: string, isIn: boolean ) => {
    const log = `【${ new Date().toISOString()}】${ isIn ? '<=' : '=>'} 【${ text }】`
    saveLogForstreamImap ( log )
}

class streamImap extends Stream.Transform {
    public pipeWriteFile = false
    
    public writeStream: Stream.Writable = null
    public _callback = false
    public commandProcess ( text: string, cmdArray: string[], next, callback ) {}
    private _login = false
    private needCheckHeader = true
    private _bufHeader = ''
    private Tag = ''
    private cmd = ''
    private first = true
    private doCommandCallback: ( err?: Error, data?: any ) => void = null
    private _buffer = Buffer.allocUnsafe (0)
    private tagcount = 0
    private serverSupportTag = ''
    private idleSupport = false
    private condStoreSupport = false
    private literalPlus = false
    private fetchAddCom = ''
    private fetching = 0
    private socket = null
    private reConnecting = false
    private port = parseInt ( this.IMapConnect.imapPortNumber )
    private connectTimeOut: NodeJS.Timer = null

    private resetConnect ( socket ) {
        if ( this.reConnecting ) {
            return
        }
        this.reConnecting = true
        if ( socket ) {
            if ( typeof socket.pipe === 'function' ) {
                socket.unpipe ()
            }
            if ( socket.removeAllListeners && typeof socket.removeAllListeners === 'function' )  {
                socket.removeAllListeners ()
            }
            if ( typeof socket.end === 'function' ) {
                socket.end()
            }
        }
        
        socket = null
        this.reConnecting = true
        return this.doConnect ()
    }

    private doConnect () {

        saveLogForstreamImap (`start streamImap `)
        const handleEvent = () => {
            //  socket event 
                this.socket.once ( 'error', err => {
                    saveLogForstreamImap ( `streamImap IMAP server socket on ERROR [${ err.message }]` )
                    this.destroyAll ()
                })
        }

        const onConnect = () => {
            saveLogForstreamImap (`streamImap onConnect!`)
            clearTimeout ( this.connectTimeOut )
            handleEvent ()
            this.socket.pipe ( this ).pipe ( this.socket )
            
        }

        this.once ( 'error', err => {
            saveLogForstreamImap (`this.once ( 'error' ) err = [${ err.message }]`)
            return this.destroyAll ()
        })

        if ( ! this.IMapConnect.imapSsl ) {
            this.socket = Net.createConnection ({ port: this.port, host: this.IMapConnect.imapServer }, onConnect )
        } else {
            //      for Uncaught Error: socket hang up
            //      https://stackoverflow.com/questions/40228074/nodejs-tlssocket-onhangup
            //  
            const catchUncaughtException = err => {
                saveLogForstreamImap ( `********* streamImap got process uncaught Exception [${ err.message }]`)
                this.destroyAll ()
            }

            process.once ( 'uncaughtException', catchUncaughtException )

            const jj = Tls.connect ({ rejectUnauthorized: ! this.IMapConnect.imapIgnoreCertificate, host: this.IMapConnect.imapServer, port: this.port }, () => {
                saveLogForstreamImap (`streamImap Tls.connect success!`)
                process.removeListener ( 'uncaughtException', catchUncaughtException )

                jj.once ( 'error', err => {
                    saveLogForstreamImap (`Tls.connect once ( 'error' ) listenFolder[${ this.folderName }]`)
                    return this.resetConnect ( jj )
                })
                jj.setTimeout( 10000 )
                jj.once ( 'timeout', () => {
                    
                    saveLogForstreamImap ( `Tls.connect once ( 'timeout' ) listenFolder[${ this.folderName }]`)
                    return this.resetConnect ( jj )
                    
                })

                jj.once ( 'end', () => {
                    if ( this.reConnecting ) {
                        return saveLogForstreamImap (`jj.once ( 'end', ) & this.reConnecting = true!`)
                        
                    }
                    saveLogForstreamImap ( `jj.once end destroyAll ()`)
                    return this.destroyAll ()
                })
                
                this.socket = jj
                clearTimeout ( this.connectTimeOut )
                this.socket.pipe ( this ).pipe ( this.socket )
            })
        }

    
        this.connectTimeOut = setTimeout (() => {
            return this.destroyAll ()
        }, socketTimeOut )
    }

    constructor ( private IMapConnect: imapConnect, private folderName: string, private writeFileName: string ) { 
        super ()
        this.doConnect ()
    }

    private doCapability ( capability ) {
        this.serverSupportTag = capability
        this.idleSupport = /IDLE/i.test ( capability )
        this.condStoreSupport = /CONDSTORE/i.test ( capability )
        this.literalPlus = /LITERAL\+/i.test ( capability )
        const ii = /X\-GM\-EXT\-1/i.test ( capability )
        const ii1 = /CONDSTORE/i.test ( capability )
        return this.fetchAddCom = `(${ ii ? 'X-GM-THRID X-GM-MSGID X-GM-LABELS ': '' }${ ii1 ? 'MODSEQ ' : ''}BODY[])`
    }

    public get TagCount () {
        if ( ++ this.tagcount < MAX_INT )
            return this.tagcount
        return this.tagcount = 0
    }

    private deleteBox ( CallBack ) {
        this.doCommandCallback = CallBack
        this.commandProcess = ( text1: string, cmdArray: string[], next, _callback ) => {
            return _callback ()
        }
        this.cmd = `DELETE "${ this.folderName }"`
        this.Tag = `A${ this.TagCount }`
        this.cmd = `${ this.Tag } ${ this.cmd }`
        debug ? debugOutStream ( this.cmd, false ) : null
        if ( this.writable ) {
            return this.push ( this.cmd + '\r\n' )
        }
            
        return this.logout ()
    }

    public serverCommandError ( err: Error, CallBack ) {
        this.emit ( 'error', err )
        if ( CallBack && typeof CallBack === 'function' ) {
            CallBack ( err )
        }
    }

    public seachUnseen ( CallBack ) {
        let newSwitchRet = null
        let moreNew = false
        this.doCommandCallback = err => {
            if ( err )
                return CallBack ( err )
            return CallBack ( null, newSwitchRet, moreNew )
        }
        this.commandProcess = ( text: string, cmdArray: string[], next, _callback ) => {
            switch ( cmdArray[0] ) {
                case '*': {
                    if ( /^SEARCH$/i.test ( cmdArray [1] ) ) {
                        const uu1 = cmdArray[2] && cmdArray[2].length > 0 ? parseInt ( cmdArray[2] ) : 0
                        if ( cmdArray.length > 2 && uu1 ) {
                            if ( ! cmdArray [ cmdArray.length - 1 ].length )
                                cmdArray.pop ()
                            
                            const uu = cmdArray.slice ( 2 ).join ( ',' )
                            if ( /\,/.test ( uu [ uu.length - 1 ]) )
                                uu.substr ( 0, uu.length - 1 )
                            
                            newSwitchRet =  uu
                            moreNew = cmdArray.length > 3
                        }
                    } 
                }
                default:
                return _callback ()
            }
        }

        this.Tag = `A${ this.TagCount }`
        this.cmd = `${ this.Tag } UID SEARCH UNSEEN`
        debug ? debugOutStream ( this.cmd, false ) : null
        if ( this.writable ) {
            return this.push ( this.cmd + '\r\n')
        }
        return this.logout ()
    }

    private capability () {

        this.doCommandCallback = err => {
            if ( err ) {
                return this.logout ()
            }
            return this.doNewMail ()
        }

        this.commandProcess = ( text: string, cmdArray: string[], next, callback ) => {
            switch ( cmdArray[0] ) {
                case '*': {                                  /////       *
                    //          check imap server is login ok
                    if ( /^CAPABILITY$/i.test ( cmdArray [1] ) && cmdArray.length > 2 ) {
                        const kkk = cmdArray.slice (2).join (' ')
                        this.doCapability ( kkk )
                    }
                    return callback ()
                }
                default:
                return callback ()
            }
        }

        this.Tag = `A${ this.TagCount }`
        this.cmd = `${ this.Tag } CAPABILITY`
        debug ? debugOutStream ( this.cmd, false ) : null

        if ( this.writable ) {
            return this.push ( this.cmd + '\r\n')
        }
            
        return this.logout ()
    }

    private login ( text: string, cmdArray: string[], next, _callback ) {

        this.doCommandCallback = ( err: Error ) => {
            
            if ( err ) {
                return this.emit ( 'error', err )
            }
            return this.capability ()
            
        }

        this.commandProcess = (  text: string, cmdArray: string[], next, callback ) => {
            switch ( cmdArray[0] ) {
                case '+':
                case '*': {
                    return callback ()
                }
                default:
                return callback ()
            }
        }
        
        switch ( cmdArray[0] ) {
            
            case '*': {                                  /////       *
                //          check imap server is login ok
                if ( /^ok$/i.test ( cmdArray [1]) && this.first ) {
                    this.first = false
                    this.Tag = `A${ this.TagCount }`
                    this.cmd = `${ this.Tag } LOGIN "${ this.IMapConnect.imapUserName }" "${ this.IMapConnect.imapUserPassword }"`
                    debug ? debugOutStream ( this.cmd, false ) : null
                    this._callback = this._login = true
                    if ( this.writable ) {
                        return next ( null, this.cmd + '\r\n' )
                    }
                        
                    return this.logout ()
                }
                //
                return _callback ()
            }

            default: {
                return this.serverCommandError ( new Error ( `login switch default ERROR!` ), _callback )
            }
            
        }

    }

    private openBox ( CallBack ) {
        let newSwitchRet = false

        this.doCommandCallback = ( err ) => {
            if ( err ) {
                return CallBack ( err )
            }
            CallBack ( null, newSwitchRet )
        }

        this.commandProcess = ( text: string, cmdArray: string[], next, _callback ) => {
            switch ( cmdArray[0] ) {
                case '*': {
                    if ( /^EXISTS$/i.test ( cmdArray [2])) {
                        if ( parseInt ( cmdArray[1])) {
                            newSwitchRet = true
                        }
                    }
                    return _callback ()
                }
                default:
                return _callback ()
            }
        }

        const conText = this.condStoreSupport ? ' (CONDSTORE)' : ''
       
        this.Tag = `A${ this.TagCount }`
        this.cmd = `${ this.Tag } SELECT "${ this.folderName }"${ conText }`
        debug ? debugOutStream ( this.cmd, false ) : null
        if ( this.writable ) {
            return this.push ( this.cmd + '\r\n')
        }
            
        return this.logout ()
    }


    private logout () {
        return this._logout (() => {
            return this.destroyAll ()
        })
    }

    private _logout ( CallBack ) {
        this.doCommandCallback = CallBack
        this.commandProcess = ( text: string, cmdArray: string[], next, _callback ) => {
            return _callback ()
        }
        
        this.Tag = `A${ this.TagCount }`
        this.cmd = `${ this.Tag } LOGOUT`
        debug ? debugOutStream ( this.cmd, false ) : null
        if ( this.writable ) {
            return this.push ( this.cmd + '\r\n')
        }  
        CallBack ()
    }

    private streamCheckEnd () {
        let _buf = this._buffer.slice ( 0, this.fetching )

        if ( this.needCheckHeader ) {
            this._bufHeader += _buf.toString()
            const con = this._bufHeader.split ( '\r\n\r\n' )
            if ( con.length < 2 ) {
                return this._buffer = Buffer.allocUnsafe (0)
            }
            this.needCheckHeader = false
            _buf = Buffer.from ( con[1] )

        }
        this.push ( _buf )
        //this.push ( Buffer.from ( _buf.toString(), 'base64' ))

        this._buffer = this._buffer.slice ( this.fetching )
        this.fetching -= this._bufHeader.length || _buf.length
        this._bufHeader = ''
        saveLogForstreamImap ( `fetch fetching [${ this.fetching }]`)
        if ( ! this.fetching ) {
            saveLogForstreamImap ( `streamCheckEnd on this.fetching === 0 doing end process!`)
            saveLogForstreamImap (`${ this._buffer.toString()}`)
            this.pipeWriteFile = false
            this.unpipe ( this.writeStream )
        }

    }

    private createFatchFile () {
        saveLogForstreamImap ( `doing createFatchFile [${ this.writeFileName }] this.fetching = [${ this.fetching }]`)
        this.pipeWriteFile = true
        this.writeStream = Fs.createWriteStream ( this.writeFileName, { encoding:'utf8'/* 'binary' */})
        
        return this.pipe ( this.writeStream )
    }

    public fetch ( fetchNum, CallBack ) {
        saveLogForstreamImap ( `doing streamImap fetch`)
        this.doCommandCallback = err => {
            return CallBack ( err )
        }

        this.commandProcess = ( text1: string, cmdArray: string[], next, _callback ) => {
            switch ( cmdArray[0] ) {
                case '*': {
                    if ( /^FETCH$/i.test ( cmdArray [ 2 ] ) && /BODY\[\]/i.test ( cmdArray [ cmdArray.length - 2 ])) {
                        const last = cmdArray[ cmdArray.length - 1 ]
                        if ( /\{\d+\}/.test ( last )) {
                            this.fetching = parseInt ( last.substr ( 1, last.length - 2 ))
                            this.createFatchFile()
                        }
                    }
                }
                default: {
                    return _callback ()
                }
            }
        }

        this.cmd = `UID FETCH ${ fetchNum } ${ this.fetchAddCom }`
        this.Tag = `A${ this.TagCount }`
        this.cmd = `${ this.Tag } ${ this.cmd }`
        debug ? debugOutStream ( this.cmd, false ) : null
        if ( this.writable ) {
            return this.push ( this.cmd + '\r\n' )
        }
        return this.logout ()
    }

    public expunge ( CallBack ) {

        let newSwitchRet = false
        this.doCommandCallback = err => {
            
            return CallBack ( err, newSwitchRet )
        }
        this.commandProcess = ( text: string, cmdArray: string[], next , _callback ) => {
            switch ( cmdArray[0] ) {
                case '*': {
                    if ( /^EXPUNGE$/i.test ( cmdArray [2])) {
                        if ( parseInt ( cmdArray[1])) {
                            
                        }
                    }
                    return _callback ()
                }
                default:
                return _callback ()
            }
        }
        
        this.Tag = `A${ this.TagCount }`
        this.cmd = `${ this.Tag } EXPUNGE`
        debug ? debugOutStream ( this.cmd, false ) : null
        if ( this.writable ) {
            return this.push ( this.cmd + '\r\n')
        }
            
        return this.logout ()
    }

    public flagsDeleted ( num: string, CallBack ) {
        this.doCommandCallback = err => {
            return CallBack ( err )
        }
        this.commandProcess = ( text1: string, cmdArray: string[], next, _callback ) => {
            return _callback ()
        }
        this.cmd = `UID STORE ${ num } FLAGS.SILENT (\\Deleted)`
        this.Tag = `A${ this.TagCount }`
        this.cmd = `${ this.Tag } ${ this.cmd }`
        debug ? debugOutStream ( this.cmd, false ) : null
        if ( this.writable ) {
            return this.push ( this.cmd + '\r\n' )
        }
            
        return this.logout ()
    }

    public doNewMail () {
        saveLogForstreamImap ( `streamImap [${ this.folderName }] doNewMail!`)
        let newMailIds = ''
        return Async.waterfall ([
            next => this.openBox ( next ),
            ( newmail, next ) => this.seachUnseen ( next ),
            ( _newMailIds, next ) => {
                newMailIds = _newMailIds
                this.fetch ( newMailIds, next )
            },
            next => this.flagsDeleted ( newMailIds, next ),
            next => this.expunge ( next ),
            next => this.deleteBox ( next )
        ], err => {
            if ( err ) {
                saveLogForstreamImap ( `streamImap [${ this.folderName }] doNewMail ERROR! [${ err.message }]`)
                return this.logout ()
            }
        })
            
        
        
    }

    public _transform ( chunk: Buffer, encoding, next ) {
        
        this._callback = false
        this._buffer = Buffer.concat ([ this._buffer, chunk ])

        const doLine = () => {
            const __CallBack = () => {
                
                let index = -1
                if ( ! this._buffer.length || ( index = this._buffer.indexOf ('\r\n')) < 0 ) {
                    if ( ! this._callback ) {
                        this._callback = true
                        return next()
                    }
                    return
                }
                if ( index === 0 ) {
                    this._buffer = this._buffer.slice ( 2 )
                    return __CallBack ()
                }
                const _buf = this._buffer.slice ( 0, index )
                if ( _buf.length ) {
                    return this.preProcessCommane ( _buf.toString (), next, () => {
                        this._buffer = this._buffer.slice ( index + 2 )
                        return doLine ()
                    })
                }
                if (! this._callback ) {
                    this._callback = true
                    return next()
                }
                return
            }
            
            if ( this.pipeWriteFile ) {
                this.streamCheckEnd ()
                if ( ! this._buffer.length ) {
                    if ( ! this._callback ) {
                        this._callback = true
                        return next()
                    }
                    return
                }
                
            }
            return __CallBack ()
            
        }
        saveLogForstreamImap ( `_transform chunk.length = [${ chunk.length }]` )
        return doLine ()
    }

    public preProcessCommane ( commandLine: string, _next, callback ) {

        const cmdArray = commandLine.split (' ')
        debug ? debugOutStream ( `${ this.folderName } ${ commandLine }`, true ) : null

        if ( this._login ) {
            switch ( commandLine[0] ) {

                case '+':                                    /////       +
                case '*': {                                  /////       *
                    return this.commandProcess ( commandLine, cmdArray, _next, callback )
                }

                case 'I':           //  IDLE
                case 'D':           //  NODE
                case 'N':           //  NOOP
                case 'A': {                                  /////       A

                    if ( this.Tag !== cmdArray[0] ) {
                        return this.serverCommandError ( new Error ( `this.Tag[${ this.Tag }] !== cmdArray[0] [${ cmdArray[0] }]\ncommandLine[${ commandLine }]` ), callback )
                    }
                    if ( /^ok$/i.test ( cmdArray[1] )) {
                       
                        this.doCommandCallback ( null, commandLine )
                        return callback ()
                    }
                    const errs = cmdArray.slice (2).join(' ')
                    this.doCommandCallback ( new Error (errs ))
                    return callback ()

                }
                default:{
                    return this.serverCommandError ( new Error (`_commandPreProcess got switch default error! commandLine = [${ commandLine }]` ), callback )
                }
                    
            }
        }
        return this.login ( commandLine, cmdArray, _next, callback )
    }

    private destroyAll () {
        if ( this.socket ) {
            if ( typeof this.socket.end === 'function' ) {
                this.socket.end ()
            }
            if ( typeof this.socket.removeAllListeners === 'function' ) {
                this.socket.removeAllListeners ()
            }
            this.socket = null
        }
        return this.emit ('end')
    }

}

export const imapGetMediaFilesFromString = ( IMapConnect: imapConnect, files: string, folder: string, CallBack ) => {
    const fileArray = files.split (',')
    if ( !fileArray.length ) {
        return CallBack ( new Error (' no file!' ))
    }
    Async.eachSeries ( fileArray, ( n, next ) => {
        Async.waterfall ([
            _next => imapGetMediaFile ( IMapConnect, n, _next ),
            ( mediaData, _next ) => Fs.writeFile ( join ( folder, n ), mediaData, 'utf8' , _next )
            
        ], next )
         
    }, err => {
        if ( err ) {
            return CallBack ( err )
        }
        return Upload.joinFiles ( files, CallBack )
    })
}