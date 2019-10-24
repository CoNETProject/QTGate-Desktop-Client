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
import * as Tool from './initSystem'

const MAX_INT = 9007199254740992
const debug = true
const pingFailureTime = 1000 * 60

const ErrorLogFile = join ( Tool.QTGateFolder, 'imap.log' )
const ErrorLogFileStream = join ( Tool.QTGateFolder, 'imapStream.log' )
let flag = 'w'
const saveLog = ( log: string, _console: boolean = true ) => {

    const Fs = require ('fs')
    const data = `${ new Date().toUTCString () }: ${ log }\r\n`
    _console ? console.log ( data ) : null
}
const debugOut = ( text: string, isIn: boolean, serialID: string ) => {
    const log = `【${ new Date().toISOString()}】【${ serialID }】${ isIn ? '<=' : '=>'} 【${ text }】`
    saveLog ( log )

}

interface qtGateImapwriteAppendPool {
    callback: (err?: Error) => void
    text: string
}
const idleInterval = 1000 * 60      // 3 mins
const noopInterval = 1000
const socketTimeOut = 1000 * 60

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
    public isWaitLogout = false
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
    private isImapUserLoginSuccess = false
    private waitingDoingIdleStop = false

    constructor ( public imapServer: qtGateImap, private exitWithDeleteBox: boolean, public debug: boolean ) {
        super ()
    }

    public idleStop () {
        if ( ! this.imapServer.idleSupport || this.runningCommand !== 'idle' || this.waitingDoingIdleStop ) { 
            return //saveLog ( `[${ this.imapServer.imapSerialID }]idleStop() skep! ! this.imapServer.idleSupport || this.runningCommand !== 'idle' = [ true ]`)
        }
        this.waitingDoingIdleStop = true
        clearTimeout ( this.idleNextStop )
        clearTimeout ( this.idleResponsrTime )
		this.cmd = this.runningCommand = `DONE`
		this.commandProcess = (  text: string, cmdArray: string[], next, callback ) => {
			return callback ()
		}
        
        this.debug ? debugOut( this.cmd, false, this.imapServer.imapSerialID ) : null
        if ( this.writable ) {
            this.idleResponsrTime = setTimeout(() => {
                console.log(`【${ new Date().toISOString() }】====================[ IDLE DONE time out ]`)
                this.imapServer.destroyAll ( null )
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
        this.debug ? debugOut ( `${commandLine}`, true, this.imapServer.imapSerialID ) : null

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
                    this.runningCommand = false
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
                    this.doCommandCallback ( new Error ( errs ))
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
                
                return this.createBox ( true, this.imapServer.listenFolder, ( err, newMail ) => {
                    
                    if ( err ) {
                        console.log (`========================= [${ this.imapServer.imapSerialID }] openBox Error do this.end ()`, err )
                        return this.imapServer.destroyAll( err )
                    }
                    /*
                    if ( this.isWaitLogout ) {
                        console.log (`capability this.waitLogout = true doing logout_process ()`)
                        return this.logout_process ( this.waitLogoutCallBack )
                    }
                    */
                    if ( /^inbox$/i.test ( this.imapServer.listenFolder )) {
                        console.log (`capability open inbox !`)
                        this.canDoLogout = this.ready = true
                        return this.imapServer.emit ( 'ready' )
                    }

                    if ( newMail && typeof this.imapServer.newMail === 'function') {
                        
                        this.imapServer.emit ( 'ready' )
                        //console.log (`[${ this.imapServer.imapSerialID }]capability doing newMail = true`)
                        return this.doNewMail ()
                    }
                    
                    if ( typeof this.imapServer.newMail === 'function' ) {
                        this.idleNoop ()
                    }
                    this.canDoLogout = this.ready = true
                    this.imapServer.emit ( 'ready' )
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

        this.Tag = `A${ this.imapServer.TagCount1() }`
        this.cmd = `${ this.Tag } CAPABILITY`
        this.debug ? debugOut ( this.cmd, false, this.imapServer.imapSerialID ) : null

        if ( this.writable )
            return this.push ( this.cmd + '\r\n')
        return this.imapServer.destroyAll( null)
    }

    public doNewMail () {
        
        this.reNewCount --
               
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
            ], ( err: Error, newMail ) => {
                
                this.runningCommand = null
                if ( err ) {
                    saveLog ( `ImapServerSwitchStream [${ this.imapServer.imapSerialID }] doNewMail ERROR! [${ err.message }]`)
                    return this.imapServer.destroyAll ( err )
                }
                    
                if ( haveMoreNewMail || havemore || newMail ) {
                    
                    return this.doNewMail ()
                }
                return this.idleNoop ( )
            })
            
        })
        
    }

    public checkLogout ( CallBack ) {

        if ( !this.isWaitLogout ) {
            //console.log (`[${ this.imapServer.imapSerialID }] checkLogout have not waiting logout`)
            return CallBack ()
        }
        const _callBack = () => {
            if ( this.exitWithDeleteBox ) {
            
                return this.deleteBox (() => {
                    return this.logout_process ( CallBack )
                })
            }
            return this.logout_process ( CallBack )    
        }

        if ( ! this.canDoLogout ) {
            this.isWaitLogout = true
            this.idleCallBack = _callBack
            return //console.trace (`[${ this.imapServer.imapSerialID }] checkLogout canDoLogout = false, set this.isWaitLogout = true &&  this.idleCallBack = CallBack`)
            
        }
        return _callBack ()
        
    }

    private idleNoop () {
        if ( this.isWaitLogout ) {
            if ( this.idleCallBack && typeof this.idleCallBack === 'function') {
                return this.idleCallBack()
            }
            return console.log (`idleNoop have this.isWaitLogout but have not this.idleCallBack ${ typeof this.idleCallBack }`)
        }
        this.canDoLogout = true
        let newSwitchRet = false
        this.runningCommand = 'idle'
        if ( ! this.ready ) {
            this.ready = true
            this.imapServer.emit ( 'ready' )
		}
		
        this.doCommandCallback = ( err => {
            if ( err ) {
                return this.imapServer.destroyAll ( null )
            }
            this.waitingDoingIdleStop = false
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
                    if ( /^RECENT$|^FETCH$|^EXISTS$/i.test ( cmdArray[2] )) {
                        if ( parseInt ( cmdArray[1])) {
                            newSwitchRet = true
                            
                            if ( ! this.callback ) {
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
                        return callback ()
                    }
                    if ( this.isWaitLogout ) {
                        this.idleStop ()
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
        
        this.debug ? debugOut ( this.cmd, false, this.imapServer.imapSerialID ) : null
        if ( this.writable ) {
            this.idleResponsrTime = setTimeout (() => {
                console.log (`【${ new Date().toISOString ()}】====================[ do IDLE time out ]`)
                this.imapServer.destroyAll ( null )
            }, 10000 )
            return this.push ( this.cmd + '\r\n')
        }
        return this.imapServer.destroyAll ( null )
        
    }

    private login ( text: string, cmdArray: string[], next, _callback ) {

        this.doCommandCallback = ( err: Error ) => {
            
            if ( ! err ) {
                this.isImapUserLoginSuccess = true
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
                    this.Tag = `A${ this.imapServer.TagCount1() }`
                    this.cmd = `${ this.Tag } LOGIN "${ this.imapServer.IMapConnect.imapUserName }" "${ this.imapServer.IMapConnect.imapUserPassword }"`
                    this.debug ? debugOut ( this.cmd, false, this.imapServer.imapSerialID ) : null
                    this.callback = this._login = true
                    if ( this.writable ) {
                        return next ( null, this.cmd + '\r\n' )
                    }
                        
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
            if ( err ) {
                if ( err.message && !/exists/i.test ( err.message )) {
                    return CallBack ( err )
                }
                
            }
                
            if ( openBox ) {
                return this.openBox ( CallBack )
            }
            return CallBack ()
        }
        this.commandProcess = ( text: string, cmdArray: string[], next, callback ) => {
            return callback ()
        }
        this.Tag = `A${ this.imapServer.TagCount1() }`
        this.cmd = `${ this.Tag } CREATE "${ folderName }"`
        this.debug ? debugOut ( this.cmd, false, this.imapServer.imapSerialID ) : null
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
                    if ( /^EXISTS$|^UIDNEXT$/i.test ( cmdArray [2])) {
                        if ( parseInt ( cmdArray[1]) || parseInt ( cmdArray[3])) {
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
        
        this.Tag = `A${ this.imapServer.TagCount1() }`
        this.cmd = `${ this.Tag } SELECT "${ this.imapServer.listenFolder }"${ conText }`
        this.debug ? debugOut ( this.cmd, false, this.imapServer.imapSerialID ) : null
        if ( this.writable )
            return this.push ( this.cmd + '\r\n')
        this.imapServer.destroyAll(null)
    }

    public _logout ( CallBack ) {
        //console.trace (`doing _logout typeof CallBack = [${ typeof CallBack }]`)
        if ( !this.isImapUserLoginSuccess ) {
            return CallBack ()
        }
        this.doCommandCallback = ( err, info: string ) => {
            
            return CallBack ( err )
		}
		
        clearTimeout ( this.idleResponsrTime )
        this.commandProcess = ( text: string, cmdArray: string[], next, _callback ) => {
            //console.log (`_logout doing this.commandProcess `)
            this.isImapUserLoginSuccess = false
            return _callback ()
		}
		
        this.Tag = `A${ this.imapServer.TagCount1() }`
		this.cmd = `${ this.Tag } LOGOUT`
		
        this.debug ? debugOut ( this.cmd, false, this.imapServer.imapSerialID ) : null
        if ( this.writable ) {
			this.appendWaitResponsrTimeOut = setTimeout (() => {
				
				return CallBack ()
			}, 1000 * 10 )

            return this.push ( this.cmd + '\r\n')
        }
        if ( CallBack && typeof CallBack === 'function') {
            return CallBack()
        }
        
    }

    public append ( text: string, subject: string, CallBack ) {
        //console.log (`[${ this.imapServer.imapSerialID }] ImapServerSwitchStream append => [${ text.length }]`)
        if ( typeof subject === 'function' ) {
			CallBack = subject
			subject = null
		}
        this.canDoLogout = false
        this.doCommandCallback = ( err, info: string ) => {
			this.canDoLogout = true
			if ( err && /TRYCREATE/i.test ( err.message )) {
				return this.createBox ( false, this.imapServer.writeFolder, err1 => {
					if ( err1 ) {
						return this.checkLogout (() => {
							return CallBack ( err, info )
						})
					}
					return this.append ( text, subject, CallBack )
				})
			}
            
            console.log (`[${ this.imapServer.imapSerialID }] append doCommandCallback `, err )
            return CallBack ( err, info )
            
		}
		

        let out = `Content-Type: application/octet-stream\r\nContent-Disposition: attachment\r\nMessage-ID:<${ Uuid.v4() }@>${ this.imapServer.domainName }\r\n${ subject ? 'Subject: '+ subject + '\r\n' : '' }Content-Transfer-Encoding: base64\r\nMIME-Version: 1.0\r\n\r\n${ text }`

        this.commandProcess = ( text1: string, cmdArray: string[], next, _callback ) => {
            switch ( cmdArray[0] ) {
                case '*':
                case '+': {

                    if ( ! this.imapServer.literalPlus && out.length && ! this.callback ) {
                        console.log (`====> append ! this.imapServer.literalPlus && out.length && ! this.callback = [${ ! this.imapServer.literalPlus && out.length && ! this.callback }]`)
                        this.debug ? debugOut ( out, false, this.imapServer.imapSerialID ) : null
                        this.callback = true
                        next ( null, out + '\r\n' )
                    }
                    return _callback ()
                }
                default:
                return _callback ()
            }
        }

        this.Tag = `A${ this.imapServer.TagCount1() }`
        this.cmd = `APPEND "${ this.imapServer.writeFolder }" {${ out.length }${ this.imapServer.literalPlus ? '+' : ''}}`
        this.cmd = `${ this.Tag } ${ this.cmd }`
        const time = out.length / 1000 + 20000
        this.debug ? debugOut ( this.cmd, false, this.imapServer.imapSerialID ) : null
        if ( !this.writable ) {
            //console.log (`[${ this.imapServer.imapSerialID }] ImapServerSwitchStream append !this.writable doing imapServer.socket.end ()`)
            return this.imapServer.socket.end ()
        }
            
        this.push ( this.cmd + '\r\n' )
        
        this.appendWaitResponsrTimeOut = setTimeout (() => {
            return this.doCommandCallback( new Error ( `IMAP append TIMEOUT` ))
		}, time )
		
        //console.log (`*************************************  append time = [${ time }] `)
        if ( this.imapServer.literalPlus ) {
            this.debug ? debugOut ( out, false, this.imapServer.imapSerialID ) : null
            this.push ( out + '\r\n' )
            out = null
        }
            
    }

    public appendStreamV3 ( Base64Data: string, subject: string = null, folderName: string, CallBack ) {

        if ( !this.canDoLogout ) {
            return CallBack ( new Error( `wImap busy!` ))
        }

        this.canDoLogout = false

        this.doCommandCallback = ( err ) => {
            this.debug ? saveLog (`appendStreamV2 doing this.doCommandCallback`) : null
            clearTimeout ( this.appendWaitResponsrTimeOut )
            this.canDoLogout = true
            if ( err ) {
                if ( /TRYCREATE/i.test( err.message )) {
                    return this.createBox ( false, this.imapServer.writeFolder, err1 => {
                        if ( err1 ) {
                            return CallBack ( err1 )
                        }
                        return this.appendStreamV3 ( Base64Data, subject, folderName, CallBack )
                    })
                }
                return CallBack ( err )
            }
            
            CallBack ()
        }


        const out = `Content-Type: application/octet-stream\r\nContent-Disposition: attachment\r\nMessage-ID:<${ Uuid.v4() }@>${ this.imapServer.domainName }\r\n${ subject ? 'Subject: '+ subject + '\r\n' : '' }Content-Transfer-Encoding: base64\r\nMIME-Version: 1.0\r\n\r\n`
        
            this.commandProcess = ( text1: string, cmdArray: string[], next, _callback ) => {
                switch ( cmdArray[0] ) {
                    case '*':
                    case '+': {
                        if ( ! this.imapServer.literalPlus && out.length && ! this.callback ) {
                            
                            this.callback = true
                            

                            this.debug ? debugOut ( out, false, this.imapServer.IMapConnect.imapUserName ) : null
                            next ( null, out + Base64Data + '\r\n' )
                        }
                        return _callback ()
                    }
                    default:
                    return _callback ()
                }
            }

            const _length = out.length + Base64Data.length
            this.Tag = `A${ this.imapServer.TagCount1() }`
            this.cmd = `APPEND "${ folderName }" {${ _length }${ this.imapServer.literalPlus ? '+' : ''}}`
            this.cmd = `${ this.Tag } ${ this.cmd }`
            const _time = _length / 1000 + 20000
            this.debug ? debugOut ( this.cmd, false, this.imapServer.IMapConnect.imapUserName ) : null
            if ( !this.writable ) {
                return this.doCommandCallback ( new Error ('! imap.writable '))
            }
                
            this.push ( this.cmd + '\r\n' )

            this.appendWaitResponsrTimeOut = setTimeout (() => {
                
                return this.emit ( 'error', new Error ('appendStreamV3 mail serrver write timeout!') )
                 
            }, _time )

            //console.log (`*************************************  append time = [${ time }] `)
            if ( this.imapServer.literalPlus ) {
                
                
                this.debug ? debugOut ( out, false, this.imapServer.IMapConnect.imapUserName ) : null
                this.push ( out )
                this.push ( Base64Data + '\r\n' )
                
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

        this.Tag = `A${ this.imapServer.TagCount1() }`
        this.cmd = `${ this.Tag } UID SEARCH UNSEEN`
        this.debug ? debugOut ( this.cmd, false, this.imapServer.imapSerialID ) : null
        if ( this.writable )
            return this.push ( this.cmd + '\r\n')
        return this.imapServer.destroyAll ( null )
    }

    public fetch ( fetchNum, callback ) {

        this.doCommandCallback = ( err ) => {
            //console.log (`ImapServerSwitchStream doing doCommandCallback [${ newSwitchRet }]`)
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
                    if ( /^RECENT$/i.test ( cmdArray[2]) && parseInt ( cmdArray[1]) > 0 ) {
                        newSwitchRet = true
                    }
                    return _callback ()
                }
                default:
                return _callback ()
            }
        }
        //console.log (`ImapServerSwitchStream doing UID FETCH `)
        this.cmd = `UID FETCH ${ fetchNum } ${ this.imapServer.fetchAddCom }`
        this.Tag = `A${ this.imapServer.TagCount1() }`
        this.cmd = `${ this.Tag } ${ this.cmd }`
        this.debug ? debugOut ( this.cmd, false, this.imapServer.imapSerialID ) : null
        if ( this.writable ) {
            return this.push ( this.cmd + '\r\n' )
        }
            
        return this.imapServer.logout ()
    }

    private deleteBox ( CallBack ) {
        this.doCommandCallback = CallBack
        this.commandProcess = ( text1: string, cmdArray: string[], next, _callback ) => {
            return _callback ()
        }
        this.cmd = `DELETE "${ this.imapServer.listenFolder }"`
        this.Tag = `A${ this.imapServer.TagCount1() }`
        this.cmd = `${ this.Tag } ${ this.cmd }`
        this.debug ? debugOut ( this.cmd, false, this.imapServer.imapSerialID ) : null
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
        this.Tag = `A${ this.imapServer.TagCount1() }`
        this.cmd = `${ this.Tag } ${ this.cmd }`
        this.debug ? debugOut ( this.cmd, false, this.imapServer.imapSerialID ) : null
        if ( this.writable )
            return this.push ( this.cmd + '\r\n' )
        return this.imapServer.destroyAll ( null )
    }

    public logout ( callback: () => void ) {
        if ( this.isWaitLogout ) {
            return callback ()
        }
            
        this.isWaitLogout = true
        this.checkLogout ( callback )
    }

    public logout_process ( callback ) {
        //console.trace ('logout')
        if ( ! this.writable ) {
            console.log (`logout_process [! this.writable] run return callback ()`)
            if ( callback && typeof callback === 'function') {
                return callback ()
            }
            
        }
            
        const doLogout = () => {
            
            return this._logout ( callback )
        }
        if ( this.imapServer.listenFolder && this.runningCommand ) {
            //console.trace ()
            //saveLog  (`logout_process [${ this.imapServer.imapSerialID }] this.imapServer.listenFolder && this.runningCommand = [${ this.runningCommand }]`)
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
        this.Tag = `A${ this.imapServer.TagCount1() }`
        this.cmd = `${ this.Tag } ${ this.cmd }`
        this.debug ? debugOut ( this.cmd, false, this.imapServer.imapSerialID ) : null
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
                    
                    if ( /^RECENT$|^EXPUNGE$/i.test ( cmdArray[2]) && parseInt (cmdArray[1]) > 0 ) {
                        newSwitchRet = true
                    }
                    return _callback ()
                }
                default:
                return _callback ()
            }
        }
        
        this.Tag = `A${ this.imapServer.TagCount1() }`
        this.cmd = `${ this.Tag } EXPUNGE`
        this.debug ? debugOut ( this.cmd, false, this.imapServer.imapSerialID ) : null
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
                    saveLog ( `IMAP listAllMailBox this.commandProcess text = [${ text }]` )
                    if ( /^LIST/i.test ( cmdArray [1] ) ) {
                        boxes.push ( cmdArray[2] + ',' + cmdArray[4] )
                    } 
                    return _callback ()
                }
                default:
                return _callback ()
            }
        }

        this.Tag = `A${ this.imapServer.TagCount1() }`
        this.cmd = `${ this.Tag } LIST "" "*"`
        this.debug ? debugOut ( this.cmd, false, this.imapServer.imapSerialID ) : null
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
    public imapEnd = false
    
    public imapSerialID = Crypto.createHash ( 'md5' ).update ( this.listenFolder + this.writeFolder ).digest ('hex').toUpperCase()
    
    
    private port: number = typeof this.IMapConnect.imapPortNumber === 'object' ? this.IMapConnect.imapPortNumber[0]: this.IMapConnect.imapPortNumber
    public TagCount1 () {
        if ( ++ this.tagcount < MAX_INT )
            return this.tagcount
        return this.tagcount = 0
    }
    private connectTimeOut = null

    private connect () {
        const _connect = () => {
            
			this.socket.setKeepAlive ( true )
			
			clearTimeout ( this.connectTimeOut )
			
            this.socket .pipe ( this.imapStream ).pipe ( this.socket ).once ( 'error', err => {
				this.destroyAll ( err )
			}).once ( 'end', () => {
				this.destroyAll ( null )
			})
        }

        if ( ! this.IMapConnect.imapSsl ) {
            this.socket = Net.createConnection ({ port: this.port, host: this.IMapConnect.imapServer }, _connect )
        } else {
            this.socket  = Tls.connect ({ rejectUnauthorized: ! this.IMapConnect.imapIgnoreCertificate, host: this.IMapConnect.imapServer, port: this.port }, _connect )
        }
        this.socket.once ( 'error', err => {
			this.emit ( 'error', err )
		})
    
        this.connectTimeOut = setTimeout (() => {
            console.log (`qtGateImap on connect socket tiemout! this.imapStream.end`)
            if ( this.socket && typeof this.socket.end === 'function' ) {
                this.socket.end ()
            }
            this.imapStream.end ()
            this.emit ( 'error', new Error ('Connect timeout!'))
        }, socketTimeOut )


    }

    constructor ( public IMapConnect: imapConnect, public listenFolder: string, public deleteBoxWhenEnd: boolean, public writeFolder: string, private debug: boolean, public newMail: ( mail ) => void ) {
        super ()
        //saveLog ( `new qtGateImap imapSerialID [${ this.imapSerialID }] listenFolder [${ this.listenFolder }] writeFolder [${ this.writeFolder }]`, true )
        this.connect ()
        this.once ( `error`, err => {
            saveLog ( `[${ this.imapSerialID }] this.on error ${ err && err.message ? err.message : null }`)
            this.imapEnd = true
            this.destroyAll ( err )
            
        })
        
        
    }

    public destroyAll ( err: Error ) {
        
        this.imapStream.logout (() => {
            
            this.imapEnd = true

            if ( this.socket && typeof this.socket.end === 'function' ) {
                this.socket.end ()
            }
            this.emit ( 'end', err )
                
        })
        
        
    }

    public logout () {
        if ( this.imapEnd ) {
            return 
        }
        this.imapEnd = true
        return this.imapStream.logout (() => {
            
            if ( this.socket && typeof this.socket.end === 'function' ) {
                
                this.socket.end()
            }
            
            return this.emit ( 'end' )
        })
    }

}

const appendFromFile1 = ( imap: ImapServerSwitchStream, fileName: string, CallBack ) => {
    
    
    return Fs.stat ( fileName, ( err, stat: Fs.Stats ) => {
        if ( err ) {
            saveLog ( `[]appendFromFile s.stat got error! [${ err.message }]` )
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
        
        imap.Tag = `A${ imap.imapServer.TagCount1() }`
        imap.cmd = `${ imap.Tag } APPEND "${ imap.imapServer.writeFolder }" {${ stat.size }${ imap.imapServer.literalPlus ? '+' : ''}}`
        const time = stat.size / 1000 + 20000
        imap.debug ? debugOut ( imap.cmd, false, this.imapServer.imapSerialID ) : null
        if ( ! imap.writable ) {
            return imap.end ()
        }
            
        imap.push ( imap.cmd + '\r\n' )

        imap.appendWaitResponsrTimeOut = setTimeout (() => {
            return this.emit ( 'error', new Error ('appendFromFile1  write timeout!') )
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
    public canAppend = false
    private appendPool: qtGateImapwriteAppendPool[]  = []
    private appenfFilesPool: { fileName: string, CallBack: any }[] = []

    public appendFromFile3 ( dataStream: string, subject: string, folderName: string, CallBack ) {
        return this.imapStream.appendStreamV3 ( dataStream, subject, folderName, CallBack )
    }

    public append1 ( text: string, subject, _callback ) {
        return this.imapStream.append ( text, subject, _callback )
	}
	

    
    constructor ( IMapConnect: imapConnect, writeFolder: string ) {
        super ( IMapConnect, null, false, writeFolder, debug, null )
        
        this.once ( 'ready', () => {
            this.canAppend = true
		})
		
		this.once ( 'error', err => {

		})
        
    }

    public ListAllFolders ( CallBack ) {
        if ( ! this.canAppend ) {
            return CallBack ( new Error ( 'not ready!' ))            
        }
        return this.imapStream.listAllMailBox ( CallBack )
    }

    public deleteBox ( boxName: string, CallBack ) {
        return this.imapStream.deleteAMailBox ( boxName, CallBack )
    }

    public deleteAllBox ( folders: string[], CallBack ) {
        
        const uu = folders.shift ()
        if ( !uu ) {
            return CallBack ()
        }
        const uuu = uu.split (',')[1]
        
        if ( !uuu || /\//.test( uuu )) {
            return this.deleteAllBox ( folders, CallBack )
        }

        return this.deleteBox ( uuu, err1 => {
            if ( err1 ) {
                console.log ( uu, uuu )
                console.log ( err1 )
            }
            return this.deleteAllBox ( folders, CallBack )
        })
        
    }
}
        
export class qtGateImapRead extends qtGateImap {

    private openBox = false

    public fetchAndDelete ( Uid: string, CallBack ) {
        if ( !this.openBox ) {
            return CallBack ( new Error ('not ready!'))
        }
            
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
        console.log ( `getMailAttached error! can't faind mail attahced start!\n${ email.toString() }`)
        return ''
    }
    const attachment = email.slice ( attachmentStart + 4 )
    return Buffer.from ( attachment.toString(), 'base64' )
}

export const getMailSubject = ( email: Buffer ) => {
	const ret = email.toString().split ('\r\n\r\n')[0].split('\r\n')
	
	const yy = ret.find ( n => {
		return /^subject: /i.test( n )
	})
	if ( !yy || !yy.length ) {
		saveLog(`\n\n${ ret } \n`)
		return ''
	}
	return yy.split(/^subject: /i)[1]
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
        saveLog ( `imapBasicTest wImap.once ( 'ready' )`)
        wImap.append1 ( ramdomText.toString ('base64'), null, ( err, code: string ) => {
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
    saveLog ( `start test imap [${ IMapConnect.imapUserName }]`, true )
    let callbackCall = false
    let startTime = null
    let wImap: qtGateImapwrite = null
    const listenFolder = Uuid.v4 ()
    const ramdomText = Crypto.randomBytes ( 20 )
    let timeout: NodeJS.Timer = null

    const doCallBack = ( err?: Error, ret? ) => {
        if ( ! callbackCall ) {
            
            //saveLog (`imapAccountTest doing callback err [${ err && err.message ? err.message : `undefine `}] ret [${ ret ? ret : 'undefine'}]`)
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

            wImap.append1 ( ramdomText.toString ('base64'), null, err => {
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
		wImap.once ( 'error', err => {
			
			rImap.logout ()
			rImap = null
			saveLog (`wImap.once ( 'error') before send message! do imapAccountTest again!`)
			return imapAccountTest ( IMapConnect, CallBack )
            
		})

		

    })

    rImap.once ( 'end', err => {
        saveLog ( `rImap.once ( 'end' ) [${ err && err.message ? err.message : 'err = undefine' }]`, true )
        if (! callbackCall && !err ) {
            saveLog (`rImap.once ( 'end') before finished test! do imapAccountTest again!`, true )
            return imapAccountTest ( IMapConnect, CallBack )
        }
        return doCallBack ( err, null )
    })

    rImap.once ( 'error', err => {
        saveLog ( `rImap.once ( 'error' ) [${ err.message }]`, true )
        return doCallBack ( err )
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


interface mailPool {
    CallBack: () => void
	mail: Buffer
	uuid: string
}

export class imapPeer extends Event.EventEmitter {
    private mailPool: mailPool[] = []
    public domainName = this.imapData.imapUserName.split('@')[1]
    private waitingReplyTimeOut: NodeJS.Timer = null
    private pingUuid = null
    private doingDestroy = false
    
    public peerReady = false
    private readyForSendMail = false
    public newMail: ( data: any, subject ) => void
    private makeWImap = false
    private makeRImap = false
    private pingCount = 1
    public needPing = false
    public needPingTimeOut = null

    private mail ( email: Buffer ) {
        
		
		const subject = getMailSubject ( email )
		const attr = getMailAttached (  email ).toString ()
		
		if ( subject ) {
			
			return this.newMail ( attr, subject )
		}
		saveLog(`\n\nnew mail to this.deCrypto!\n\n`)
        return this.deCrypto ( attr, ( err, data ) => {
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
                return saveLog ( `imapPeer mail deCrypto JSON.parse got ERROR [${ ex.message }] data = [${ Util.inspect ( data )}]`, true )
            }
            
            if ( uu.ping && uu.ping.length ) {
                saveLog ( `GOT PING [${ uu.ping }]`, true )
                
                if ( ! this.peerReady ) {
                    
                    if ( /outlook\.com/i.test ( this.imapData.imapServer)) {
                        saveLog ( `doing outlook server support!`)
                        return setTimeout (() => {
                            saveLog (`outlook replyPing ()`, true )
                            this.replyPing ( uu )
                            return this.Ping ()
                        }, 5000 )
                    }
                    this.replyPing ( uu )
                    return saveLog ( `THIS peerConnect have not ready send ping!`, true)

                }
                return this.replyPing ( uu )
            }
            
            if ( uu.pong && uu.pong.length ) {
                //saveLog ( `===> new PONG come!`, true )
                if ( !this.pingUuid ) {
                    return saveLog ( `GOT in the past PONG [${ uu.pong }]!`, true )
                }
                if ( this.pingUuid !== uu.pong ) {
                    return saveLog ( `GOT unknow PONG [${ uu.pong }]! this.pingUuid = [${ this.pingUuid }]`, true )
                }
                
                saveLog ( `imapPeer connected Clear waitingReplyTimeOut!`, true )
                this.pingUuid = null
                this.peerReady = true
                this.pingCount = 0
                this.needPingTimeOut = setTimeout (() => {
                    this.needPing = true
                }, pingFailureTime )
                clearTimeout ( this.waitingReplyTimeOut )
               
                return this.emit ('ready')
            }

            return this.newMail ( uu, null )
            
        })

    }

    public trySendToRemote ( email: Buffer, uuid, CallBack ) {
        if ( !this.wImap || !this.wImap.canAppend ) {
            return this.mailPool.push ({
                CallBack: CallBack,
				mail: email,
				uuid: uuid
            })
        }
        this.wImap.canAppend = false
        return this.wImap.append1 ( email.toString ( 'base64' ), uuid, err => {
            
            if ( err ) {
                return this.trySendToRemote ( email, uuid, CallBack )
			}
			this.wImap.canAppend = true
            CallBack ()
            if ( this.mailPool.length ) {
                const uu = this.mailPool.shift ()
                if ( uu ) {
                    return this.trySendToRemote ( uu.mail, uu.uuid, uu.CallBack )
                }
            }
        })
        
    }

    private replyPing ( uu ) {

        return this.encryptAndAppendWImap1 ( JSON.stringify ({ pong: uu.ping }), null, err => {
            if ( err ) {
                saveLog (`reply Ping ERROR! [${ err.message ? err.message : null }]`)
            }
        })
        
    }

    private encryptAndAppendWImap1 ( mail: string, uuid: string, CallBack ) {

        if ( !this.wImap ) {
            const info = `encryptAndAppendWImap error: no wImap`
            CallBack ( new Error ( info ))
            this.newWriteImap ()
            return saveLog ( info )
        }

        if ( !this.wImap.canAppend ) {
            const info = `encryptAndAppendWImap error: canAppend = false`
            CallBack ( new Error ( info ))
            return saveLog ( info )
        }

        this.wImap.canAppend = false
        return Async.waterfall ([
            next => this.enCrypto ( mail, next ),
            ( data, next ) => {
                
                return this.wImap.append1 ( Buffer.from ( data ).toString ('base64'), uuid, next )
            }
        ], err => { {

		}
			if ( err ) {
				return CallBack ( err )
			}
            
            this.wImap.canAppend = true
            return CallBack ()
        })
    }

    private setTimeOutOfPing () {

        clearTimeout ( this.waitingReplyTimeOut )
        clearTimeout ( this.needPingTimeOut )
        this.needPing = false
        saveLog ( `Make Time Out for a Ping, ping ID = [${ this.pingUuid }]`, true )
        return this.waitingReplyTimeOut = setTimeout (() => {
            saveLog ( `ON setTimeOutOfPing this.emit ( 'pingTimeOut' ) `, true )
            
            
            return this.emit ( 'pingTimeOut' )
        }, pingPongTimeOut )
    }
    
    public Ping () {
        
        if ( this.pingUuid ) {
            return saveLog (`Ping already waiting other ping, STOP!`)
        }

        const pingUuid = Uuid.v4 ()
        
        return this.encryptAndAppendWImap1 ( JSON.stringify ({ ping: pingUuid }), null, err => {
            if ( err ) {
                return this.destroy ( err )
            }
            this.pingUuid = pingUuid
            return this.setTimeOutOfPing ()
        })
    }

    public rImap: qtGateImapRead = null


    public newWriteImap () {
        if ( this.makeWImap || this.wImap && this.wImap.imapStream && this.wImap.imapStream.writable ) {
            return console.log ( `newWriteImap this.wImap.imapStream.writable = [${ this.wImap.imapStream.writable }] this.makeWImap [${ this.makeWImap  }]`)
        }
        this.makeWImap = true
        //saveLog ( `====== > newWriteImap`, true )
        this.wImap = new qtGateImapwrite ( this.imapData, this.writeBox )

        this.wImap.once ( 'end', err => {
			console.log ( `wImap end ! [${ err && err.message ? err.message : null }]! try reBuild wImap!` )
			return this.newWriteImap()
        })

        this.wImap.once ( 'error', err => {
            if ( this.wImap.socket && this.wImap.socket.end && typeof this.wImap.socket.end === 'function' ) {
                this.wImap.socket.end ()
            }
            this.wImap.removeAllListeners ()
			this.wImap = null
			if ( err.message )
            saveLog (`imapPeer wImap END`)
            
        })

        this.wImap.once ( 'ready', () => {
            saveLog ( `wImap.once ( 'ready') doing this.makeWImap = false`, true )
            this.makeWImap = false
            const supportOutlook = () => {
                
                return this.makeWriteFolder (() => {
                    console.log (`supportOutlook makeWriteFolder callback!`)
                    return this.Ping ()
                })
            }

            
            this.once ( `wFolder`, () => {
                //this.wImap.destroyAll ( null )
                return supportOutlook ()
            })
                
            
            
            
            this.newReadImap ()
            return this.Ping ()
        })
    }

    public newReadImap() {

        if ( this.makeRImap || this.rImap && this.rImap.imapStream && this.rImap.imapStream.readable ) {
            return saveLog (`newReadImap have rImap.imapStream.readable = true, stop!`, true )
        }
        this.makeRImap = true
        //saveLog ( `=====> newReadImap!`, true )


        this.rImap = new qtGateImapRead ( this.imapData, this.listenBox, false, email => {
            this.mail ( email )
        })

        this.rImap.once ( 'ready', () => {
            this.makeRImap = false
            saveLog ( `this.rImap.once on ready `)

        })

        this.rImap.once ( 'error', err => {
            this.makeRImap = false
            saveLog ( `rImap on Error [${ err.message }]`, true )
            if ( err && err.message && /auth|login|log in|Too many simultaneous|UNAVAILABLE/i.test ( err.message )) {
                return this.destroy (1)
            }
            if ( this.rImap && this.rImap.destroyAll && typeof this.rImap.destroyAll === 'function') {
                return this.rImap.destroyAll (null)
            }
            

        })

        this.rImap.once ( 'end', err => {
            
            this.rImap = null
            this.makeRImap = false
            if ( typeof this.exit === 'function') {
                saveLog (`imapPeer rImap on END!`)
                this.exit ( err )
                return this.exit = null
            }
            saveLog (`imapPeer rImap on END! but this.exit have not a function `)
            
            
        })
    }

    public wImap: qtGateImapwrite = null

    constructor ( public imapData: imapConnect, private listenBox: string, private writeBox: string,
        private enCrypto: ( text: string, callback: ( err?: Error, data?: string ) => void ) => void,
        private deCrypto: ( text: string, callback: ( err?: Error, data?: string ) => void ) => void,
        public exit: ( err?: number ) => void) {
        super ()
        saveLog ( `doing peer account [${ imapData.imapUserName }] listen with[${ listenBox }], write with [${ writeBox }] `)

        this.newWriteImap ()
    }

    private makeWriteFolder ( CallBack ) {
        
        let uu = new qtGateImapRead ( this.imapData, this.writeBox, false, null )
        uu.once ( 'ready', () => {
            console.log (`makeWriteFolder on ready! `)
            uu.destroyAll ( null )
            CallBack ()
        })
        uu.once ( 'error', err => {
            saveLog ( `makeWriteFolder error! do again!`)
            uu = null
            return this.makeWriteFolder ( CallBack )
        })
        uu.once ( 'end', () => {
            uu = null
            return CallBack ()
        })
    }

    public destroy ( err?: number ) {
        
        clearTimeout ( this.waitingReplyTimeOut )
        if ( this.doingDestroy ) {
            console.log (`destroy but this.doingDestroy = ture`)
            return
        }
            
        this.doingDestroy = true
        this.peerReady = false
       
        if ( this.wImap ) {
            this.wImap.logout ()
            
        }
        if ( this.rImap ) {
            this.rImap.logout ()
            
        }
        if ( this.removeAllListeners && typeof this.removeAllListeners === 'function' )
            this.removeAllListeners ()
        if  ( this.exit && typeof this.exit === 'function' ) {
            this.exit ( err )
            this.exit = null
        }
	}
	
	public sendDataToUuidFolder ( data: string, uuid: string, CallBack ) {
		
    
		let _return = false
		
		let wImap = new qtGateImapwrite ( this.imapData, uuid )
		
		wImap.once ( 'error', err => {
			wImap.destroyAll ( err )
			if ( err && err.message && /auth|login|log in|Too many simultaneous|UNAVAILABLE|OVERQUOTA/i.test ( err.message )) {
				saveLog ( `SendToRemoteFromFile wImap.once ( 'error' ) [${ err }]`)
				if ( !_return ) {
					_return = true
					return CallBack ( err )
				}
				
			}
			_return = true
			return this.sendDataToUuidFolder ( data, uuid, CallBack )
		})

		wImap.once ( 'end', () => {
			wImap = null
			if ( !_return ) {
				_return = true
				return CallBack ()
			}
		})

		wImap.once ( 'ready', () => {
			
			return Async.series ([
				next => wImap.imapStream.createBox ( false, uuid, next ),
				next => wImap.appendFromFile3 ( data, uuid, uuid, next ),
				next => wImap.destroyAll ( next )
			], CallBack )
		})
	}

}




