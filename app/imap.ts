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
import { start } from 'repl';
import { Buffer } from 'buffer';

const MAX_INT = 9007199254740992
const debug = true
const QTGateFolder = join ( homedir(), '.QTGate' )
const ErrorLogFile = join ( QTGateFolder, 'imap.log' )
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
    private _buffer = Buffer.alloc (0)
    public serverCommandError ( err: Error, CallBack ) {
        this.imapServer.emit ( 'error', err )
        if ( CallBack )
            CallBack ( err )
    }
    public Tag: string = null
    public cmd: string = null
    public callback = false
    private doCommandCallback = null
    private _login = false
    private first = true
    private idleCallBack = null
    private waitLogout = false
    private waitLogoutCallBack = null
    private _newMailChunk = Buffer.alloc (0)
    public idleResponsrTime: NodeJS.Timer = null
    private canDoLogout = false
    private ready = false
    public appendWaitResponsrTimeOut:NodeJS.Timer = null
    private runningCommand = null
    private nextRead = true
    public idleNextStop :NodeJS.Timer = null

    constructor ( public imapServer: qtGateImap, private eachMail: boolean, private exitWithDeleteBox: boolean, private debug: boolean ) {
        super ()
        if ( eachMail ) {
            this.imapServer.on ( 'nextNewMail', () => {
                this.nextRead = true
                if ( this.runningCommand !== 'idle' )
                    return
                if ( this.imapServer.idleSupport ) {
                    return this.idleStop ()
                }
    
            })
        }
        
    }

    public idleStop () {
        if ( !this.imapServer.idleSupport || this.runningCommand !== 'idle' ) {
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

    private preProcessCommane ( commandLine: string, _next, callback ) {

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
                        return this.serverCommandError ( new Error ( `this.Tag[${ this.Tag }] !== cmdArray[0] [${ cmdArray[0] }]` ), callback )
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

    private checkFetchEnd () {

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
                if ( this.eachMail )
                    this.nextRead = false
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

    private doNewMail () {
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
                if (! newMailIds || ! newMailIds.length || ! this.nextRead ) {
                    this.runningCommand = null
                    return this.idleNoop()
                }
                let haveMoreNewMail = false
                
                return Async.waterfall ([
                    next => this.fetch ( newMailIds, next ),
                    ( _moreNew, next ) => {
                        haveMoreNewMail = _moreNew
                        this.flagsDeleted ( newMailIds, next )
                    },
                    ( data, next ) => {
                        
                        this.expunge ( next )
                    }
                ], ( err, newMail ) => {
                    this.runningCommand = null
                    if ( err )
                        return this.imapServer.destroyAll ( err )
                    if ( this.nextRead && ( haveMoreNewMail || havemore || newMail ))
                        return this.doNewMail ()
                    return this.idleNoop ()
                })
                
            })
        })
        
        
    }

    private checkLogout ( CallBack ) {

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
                    return this.imapServer.destroyAll(null)
                this.runningCommand = null
                if ( this.idleCallBack ) {
                    this.idleCallBack ()
                    return this.idleCallBack = null
                }
                //console.log(`IDLE DONE newSwitchRet = [${newSwitchRet}] nextRead = [${this.nextRead}]`)
                if ( this.nextRead && newSwitchRet ) {
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
                                if ( this.nextRead ) {
                                    this.idleStop ()
                                }
                                
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

    private createBox ( CallBack ) {

        this.doCommandCallback = ( err ) => {
            if ( err )
                return CallBack ( err )
            return this.openBox ( CallBack )
        }
        this.commandProcess = ( text: string, cmdArray: string[], next, callback ) => {
            return callback ()
        }
        this.Tag = `A${ this.imapServer.TagCount }`
        this.cmd = `${ this.Tag } CREATE "${ this.imapServer.listenFolder }"`
        this.debug ? debugOut ( this.cmd, false ) : null
        if ( this.writable )
            return this.push ( this.cmd + '\r\n')
        return this.imapServer.destroyAll(null)

    }

    private openBox ( CallBack ) {
        let newSwitchRet = false
        this.doCommandCallback = ( err ) => {
            if ( err ) {
                return this.createBox ( CallBack )
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
        this.cmd = `SELECT "${ this.imapServer.listenFolder }"${ conText }`
        this.Tag = `A${ this.imapServer.TagCount }`
        this.cmd = `${ this.Tag } SELECT "${ this.imapServer.listenFolder }"${ conText }`
        this.debug ? debugOut ( this.cmd, false ) : null
        if ( this.writable )
            return this.push ( this.cmd + '\r\n')
        this.imapServer.destroyAll(null)
    }

    private _logout ( callabck ) {
        this.doCommandCallback = callabck
        clearTimeout ( this.idleResponsrTime )
        this.commandProcess = ( text: string, cmdArray: string[], next, _callback ) => {
            return _callback ()
        }
        
        this.Tag = `A${ this.imapServer.TagCount }`
        this.cmd = `${ this.Tag } LOGOUT`
        this.debug ? debugOut ( this.cmd, false ) : null
        if ( this.writable )
            return this.push ( this.cmd + '\r\n')
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

    private seachUnseen ( callabck ) {
        let newSwitchRet = null
        let moreNew = false
        this.doCommandCallback = ( err ) => {
            if ( err )
                return callabck ( err )
            return callabck(null, newSwitchRet, moreNew)
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
                            
                            newSwitchRet = this.eachMail ? cmdArray[2] : uu
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
        return this.imapServer.destroyAll ( null )
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

    public logout ( callback: () => void ) {
        if ( this.waitLogout )
            return callback
        this.waitLogout = true
        this.checkLogout ( callback )
    }

    private logout_process ( callback ) {
        console.log (`logout_process typeof callback = [${ typeof callback}]`)
        if ( ! this.writable ) {
            console.log (`logout_process [! this.writable] run return callback ()`)
            return callback ()
        }
            
        const doLogout = () => {
            console.log (`logout_process doLogout()`)
            if ( this.imapServer.listenFolder && this.imapServer.deleteBoxWhenEnd ) {
                return Async.series ([
                    next => { /^INBOX$/i.test( this.imapServer.listenFolder ) ? next () : this.deleteBox ( next )},
                    next => this._logout ( next )
                ], callback )
            }
            return this._logout ( callback )
        }
        if ( this.imapServer.listenFolder && this.runningCommand ) {
            console.log (`logout_process [this.imapServer.listenFolder && this.runningCommand], doing this.idleStop ()`)
            this.idleCallBack = doLogout
            return this.idleStop ()
        }

        doLogout ()
    }

    public flagsDeleted ( num: string, callback ) {
        this.doCommandCallback = callback
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

    public expunge ( callback ) {

        let newSwitchRet = false
        this.doCommandCallback = ( err ) => {

            return callback ( err, newSwitchRet )
        }
        this.commandProcess = ( text: string, cmdArray: string[], next , _callback ) => {
            switch ( cmdArray[0] ) {
                case '*': {
                    if ( /^EXPUNGE$/i.test ( cmdArray [2])) {
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
        
        this.Tag = `A${ this.imapServer.TagCount }`
        this.cmd = `${ this.Tag } EXPUNGE`
        this.debug ? debugOut ( this.cmd, false ) : null
        if ( this.writable )
            return this.push ( this.cmd + '\r\n')
        return this.imapServer.destroyAll ( null )
    }
}

export class qtGateImap extends Event.EventEmitter {
    public socket: Net.Socket
    public imapStream: ImapServerSwitchStream = new ImapServerSwitchStream ( this, this.isEachMail, this.deleteBoxWhenEnd, this.debug )
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
                saveLog (`qtGateImap got process uncaught Exception [${ err && err.message ? err.messgae : 'err message null '}]`)
                this.destroyAll ( err )
            }

            process.once ( 'uncaughtException', catchUncaughtException )
               
            const jj = Tls.connect ({ rejectUnauthorized: ! this.IMapConnect.imapIgnoreCertificate, host: this.IMapConnect.imapServer, port: this.port }, () => {
                
                //      remove Listener when Transport Layer Security connected success!
                process.removeListener ( 'uncaughtException', catchUncaughtException )

                jj.once ( 'error', err => {
                    saveLog (`jj.once ( 'error' ) listenFolder[${ this.listenFolder }] writeFolder [${ this.writeFolder }]`)
                    this.destroyAll ( err )
                })
                
                jj.once ( 'end', () => {
                    saveLog (`jj.once ( 'end' ) listenFolder[${ this.listenFolder }] writeFolder [${ this.writeFolder }]`)
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

    constructor ( public IMapConnect: imapConnect, public listenFolder: string, private isEachMail: boolean, public deleteBoxWhenEnd: boolean, public writeFolder: string, private debug: boolean, public newMail: ( mail ) => void ) {
        super ()
        this.connect ()
        this.once ( `error`, err => {
            saveLog ( `qtGateImap on error [${err.messag}]` )
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
        this.imapStream.logout (() => {
            this.destroyAll ( null )
        })
    }

}

export class qtGateImapwrite extends qtGateImap {

    private ready = false
    public canAppend = false
    private appendPool: qtGateImapwriteAppendPool[]  = []

    public append ( text: string, _callback ) {

        if ( ! this.ready )
            return _callback ( new Error ( 'not ready!' ))
        if ( this.canAppend ) {
            this.canAppend = false
            return this.imapStream.append ( text, ( err, code ) => {
                this.canAppend = true
                _callback ( err, code )
                const uu = this.appendPool.pop ()
                if ( uu ) {
                    return this.append ( uu.text, uu.callback )
                }
            })
        }
        const waitData: qtGateImapwriteAppendPool = {
            callback: _callback,
            text: text
        }
        return this.appendPool.unshift ( waitData )
    }
    
    constructor ( IMapConnect: imapConnect, writeFolder: string ) {
        super ( IMapConnect, null, false, false, writeFolder, debug, null )
        this.once ( 'ready', () => {
            console.log ( `qtGateImapWrite [${ writeFolder }] ready`)
            this.ready = this.canAppend = true
        })
        
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

    constructor ( IMapConnect: imapConnect, listenFolder: string, isEachMail: boolean, deleteBoxWhenEnd: boolean, newMail: ( mail ) => void ) {
        super ( IMapConnect, listenFolder, isEachMail, deleteBoxWhenEnd, null, debug, newMail )
        this.once ( 'ready', () => {
            this.openBox = true
            console.log ( `qtGateImapRead [${ listenFolder }] ready`)
        })
    }
    
}

export const getMailAttached = ( email: Buffer ) => {
    const attachmentStart = email.indexOf('\r\n\r\n')
    if ( attachmentStart < 0 ) {
        console.log(`getMailAttached error! can't faind mail attahced start!`)
        return null
    }
    const attachment = email.slice( attachmentStart + 4 )
    return Buffer.from ( attachment.toString(), 'base64' )
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
        let rImap = new qtGateImapRead ( IMapConnect, listenFolder, false, false, mail => {
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
    saveLog ( `start test imap [${ JSON.stringify (IMapConnect) }]`)
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
    
    let rImap = new qtGateImapRead ( IMapConnect, listenFolder, false, false, mail => {
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

const pingPongTimeOut = 1000 * 30

export class imapPeer extends Event.EventEmitter {
    private mailPool = []
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
                return saveLog ( `deCrypto GOT ERROR! [${ err.message }]` )
            }
            let uu = null
            try {
                uu = JSON.parse ( data )
            } catch ( ex ) {
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
            if ( err && err.message && /AUTH|certificate|LOGIN/i.test ( err.message )) {
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
            if ( /outlook\.com/i.test ( this.imapData.imapServer )) {
                saveLog ( `outlook support!`)
                return this.once ( 'wFolder', () => {
                    saveLog ( `this.once ( 'wFolder') do makeWriteFolder!`)
                    return this.makeWriteFolder (() => {
                        return this.Ping ()
                    })
                })
            }
        })
    }

    private newReadImap() {
        saveLog (`newReadImap!`)
        this.rImap = new qtGateImapRead ( this.imapData, this.listenBox, false, false, email => {
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
            if ( err && err.message && /AUTH|certificate|LOGIN/i.test ( err.message )) {
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
        
        let uu = new qtGateImapRead ( this.imapData, this.writeBox, false, false, email => {})
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
