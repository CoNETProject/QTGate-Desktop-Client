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

import * as Imap from './imap'
import * as Net from 'net'
import * as Async from 'async'
import * as Crypto from 'crypto'
import * as Stream from 'stream'
import * as Dns from 'dns'
import * as res from './res'
import * as Fs from 'fs'

import * as Path from 'path'
import * as Os from 'os'

const corePeerCount = 6
const maxUpline = 10
const debug = true
const debugOut = text => {
    console.log(`【${new Date().toTimeString()}】【${text}】`)
}
const dnsLookup = ( hostName: string, CallBack ) => {
	return Dns.lookup ( hostName, { all: true }, CallBack )
}

const makeWImap = ( imapData: IinputData, writeFolder: string, wImapPool: Imap.qtGateImapwrite[], keepConnect: boolean ) => {
	let error = null
	const connect = () => {
		const wImap = new Imap.qtGateImapwrite ( imapData, writeFolder )
		wImap.once ( 'end', err => {
			console.log (`\n wImap.once ( 'end' )`, err )
			const index = wImapPool.findIndex ( n => { return n.writeFolder === writeFolder })
			if ( index > -1 ) {
				wImapPool.splice ( index, 1 )
			}
			const exitWithUnContinue = err && err.message && /auth|login|log in|Too many simultaneous|UNAVAILABLE/i.test( err.message ) ? true : false
			
			if ( keepConnect && ! exitWithUnContinue ) {
				console.log (`[${ writeFolder }] keepConnect now doing connect()`)
				error = null
				return connect ()
			}
			console.log ( `wImap [${ writeFolder }] exit & STOP with error [${ error }]`)
		})
	
		wImap.once ( 'ready', () => {
			wImapPool.push ( wImap )
		})
	
		wImap.once ( 'error', err => {
			console.log (`wImap.once ( 'error') `, err )
			return error = err
		})
	}
	
	return connect ()

}

const makeRImap = ( imapData: IinputData, readFolder: string, rImapPool: Imap.qtGateImapRead[], keepConnect: boolean, newMail: ( mail: Buffer ) => void ) => {
	let error = null
	const connect = () => {
		const rImap = new Imap.qtGateImapRead (imapData, readFolder, false, newMail )
		rImap.once ( 'end', err => {
			console.log (`\n [${ readFolder }] rImap.once ( 'end' )`, err )
			const index = rImapPool.findIndex ( n => { return n.listenFolder === readFolder })
			if ( index > -1 ) {
				rImapPool.splice ( index, 1 )
			}
			const exitWithUnContinue = err && err.message && /auth|login|log in|Too many simultaneous|UNAVAILABLE/i.test( err.message ) ? true : false
			
			if ( keepConnect && ! exitWithUnContinue ) {
				console.log (`rImap [${ readFolder }] keepConnect now doing connect()`)
				error = null
				return connect ()
			}
			console.log ( `rImap [${ readFolder }] exit & STOP with error [${ error }]`)
		})
	
		rImap.once ( 'ready', () => {
			rImapPool.push ( rImap )
		})
	
		rImap.once ( 'error', err => {
			console.log (`rImap.once ( 'error') `, err )
			return error = err
		})
		return rImap
	}
	
	return connect ()
	

}

class decryptClass {
	private init = false
	private derivedKey: Buffer = null
	constructor ( private password: string, private iv: Buffer, private salt: Buffer, private iterations: number ) {
	}

	public decrypt ( chunk: Buffer, CallBack ) {
        if ( ! chunk || ! chunk.length )
			return CallBack ( new Error ( 'decryptClass decrypt chunk is null' ))
		const encryptTag = chunk.readInt8 (0)
		const _buf = chunk.slice (1)
		if ( encryptTag === 0 ) {
			console.log (`_decrypt: not encrypt data `)
			return CallBack ( null, _buf )
		}
		const _decrypt = () => {
			const decipher = Crypto.createDecipheriv ( 'aes-256-gcm', this.derivedKey, this.iv )
			decipher.setAuthTag ( _buf.slice ( 0, 16 ))
			const _decryptBuf = _buf.slice (16)
			try {
				return CallBack ( null, Buffer.concat ([ decipher.update ( _decryptBuf), decipher.final()]))
			}
			catch (e) {
				console.log(`===> class decryptStream _decrypt error【${_decryptBuf.length}】:[${e}]`)
				console.log( chunk.toString('hex'))
				return CallBack ( e )
			}
		}
		if ( !this.derivedKey ) {
			return Crypto.pbkdf2 ( this.password, this.salt, this.iterations, 32, 'sha512', ( err, data ) => {
				if ( err ) {
					return console.log ( `decryptClass Crypto.pbkdf2 error`, err )
				}
				this.derivedKey = data
				return _decrypt ()
			})
		}
		return _decrypt ()
	}
}

class transferHandle extends Stream.Transform {
	public serial = 0
	public remoteSerial = 0
	private salt: Buffer = null
	private iv: Buffer = null
	private iterations = Math.round ( 10000 + 90000 * Math.random ())
	private derivedKey: Buffer = null
	private remoteChunkPool: Map < number, Buffer > = new Map ()
	public cancel = false
	public stoped = false
	private decrypt: decryptClass = null
	private initEncrypt ( CallBack ) {
		Async.waterfall([
            next => Crypto.randomBytes ( 64, next ),
            ( data, next ) => {
                this.salt = data
                Crypto.randomBytes ( 12, next )
            },
            ( data, next ) => {
                this.iv = data
                Crypto.pbkdf2 ( this.password, this.salt, this.iterations, 32, 'sha512', next )
            }
        ], ( err, derivedKey ) => {
            if ( err ) {
				return CallBack ( err )
            }
            this.derivedKey = derivedKey
            return CallBack()
        })
	}

	private getHeader ( cancel: boolean ) {
		const serial = Buffer.alloc(4)
        if ( cancel ) {
            return Buffer.concat ([ Buffer.from ( this.series, 'hex' ), serial ])
		}
		serial.writeInt32BE ( this.serial, 0 )
        const firstPart = Buffer.concat ([ Buffer.from ( this.series, 'hex' ), serial ])
        if ( this.serial ++ !== 0 ) {
            return firstPart
        }
        const iterations = Buffer.allocUnsafe (4)
		iterations.writeInt32BE ( this.iterations, 0 )
		//console.log (`getHeader: series [${ this.series }] salt[${ this.salt.toString('hex')}] iterations [${ this.iterations }] iv [${ this.iv.toString('hex')}]`)
        return Buffer.concat ([ firstPart, this.salt, iterations, this.iv ])
	}

	private encryptChunk ( chunk: Buffer ) {
		if ( !chunk.length )
			return chunk
		const cipher = Crypto.createCipheriv ( 'aes-256-gcm', this.derivedKey, this.iv )
		const _buf = Buffer.concat ([ cipher.update ( chunk ), cipher.final ()])
		const tag = cipher.getAuthTag ();
		const encryptTag = Buffer.alloc (1, 1)
		return Buffer.concat ([ encryptTag, tag, _buf ])
	}

	public getEncryptChunk ( chunk: Buffer, CallBack ) {
		if ( ! this.serial ) {
			return this.initEncrypt ( err => {
                if ( err ) {
                    console.log ( `class transferHandle initEncrypt error`, err )
                    return CallBack ( err )
				}
				
				const out = Buffer.concat ([ this.getHeader( false ), this.encryptChunk ( chunk )])
                return CallBack ( null, out.toString ( 'base64' ), true ) 
            })
		}
		const highLivel = this.sslConnect && this.serial < 6
        if (( highLivel || !this.sslConnect ) && chunk.length )
            return CallBack ( null, Buffer.concat ([ this.getHeader ( false ), this.encryptChunk ( chunk )]).toString ( 'base64' ), highLivel )
        const y = Buffer.concat([ this.getHeader ( false ), Buffer.alloc (1), chunk ]).toString ( 'base64')
        return CallBack ( null, y, highLivel )
	}

	public decryptChunk ( chunk: Buffer, CallBack ) {
		let offset = 0
        if ( this.remoteSerial === 0 ) {
			
            const salt = chunk.slice ( 0, 64 )
            const iterations = chunk.readInt32BE ( 64 )
			const iv = chunk.slice ( 68, 80 )
			//console.log (`this is first decryptChunk [${ this.series }]`)
            //console.log ( `salt[${ salt.toString ('hex') }]` )
            //console.log ( `iterations[${ iterations }]` )
            //console.log ( `iv[${ iv.toString ('hex') }]` )
            this.decrypt = new decryptClass ( this.password, iv, salt, iterations ) 
            offset = 80
		}
		
        return this.decrypt.decrypt ( chunk.slice ( offset ), CallBack )
	}

	constructor ( public series: string, private password: string, public sslConnect: boolean, private imapControl: imapPeerControl ) {
		super ()
		this.once ( 'cancel', () => {
			console.log (`transferHandle on end!`)
			return this.stopConnect (() => {})
		})
	}

	public _transform ( chunk, encoding, next ) {

		let doNext = false			///		pause
        return this.getEncryptChunk ( chunk, ( err, data: string, highLevel ) => {
            if ( err ) {
                console.log ( '_transform getEncryptChunk error:', err )
                return next ( err )
            }
            const waitNext = () => {
                const imapWrite = this.imapControl.getWImapHendle ( highLevel )
                if ( ! imapWrite ) {
                    console.log( `waitNext waiting writeImapReady[${ this.imapControl.wImapLength }] highLevel[${ highLevel }]`)
                    return setTimeout (() => {
                        return waitNext ()
                    }, highLevel ? 100 : 600 )
                }
                if ( highLevel || ! highLevel && this.imapControl.imapTotalCount < maxUpline ) {
                    if ( ! doNext ) {
						doNext = true
						//		can get next data!
                        next()
                    }
				}
				debug ? debugOut (`===> [${ this.series }] [${ this.serial }][${ data.length }]`): null
                return imapWrite.append ( data, err => {
					
                    this.imapControl.returnWImap ( imapWrite ) 
                    if ( err ) {
                        console.log( `==============>  peer.sendMassage got ERROR!`, err)
                        return waitNext ()
					}
					console.log (`imapWrite.append success! [${ imapWrite.writeFolder }]`)
                    if ( ! doNext )
                        next ()
                })
			}
			
            return waitNext ()
        })
	}

	public fromRemote ( chunk: Buffer, serial: number ) {
		if ( this.remoteSerial < serial ) {

            return this.remoteChunkPool.set ( serial, chunk )
        }
        if ( this.remoteSerial > serial ) {
            if ( serial === 0 && chunk.length < 20 ) {
                debug ? debugOut ( `got cancel event!`) : null
                return this.emit ( 'cancel' )
            }
            return debug ? debugOut ( `【${chunk.length}】transferHandle fromRemote remoteSerial {${this.remoteSerial}} > serial {${serial}} ERROR!`) : null
        }
        if ( this.cancel || !this.writable ) {
            debug ? debugOut( `this conn was cancel skip [${serial}][${chunk.length}]`) : null
            return;
        }
        if ( chunk.length < 20 ) {
            debug ? debugOut ( `fromRemote chunk [${ chunk.length }]`) : null
            return this.end ()
        }
        if ( this.writable ) {
            return this.decryptChunk ( chunk, ( err, data ) => {
                if ( err ) {
                    debugOut( `fromRemote [${ this.series }] decryptChunk got ERROR [${ err }]`)
                    return this.end()
                }
                debug ? debugOut(`<===== [${this.remoteSerial}] [${this.series}] [${data.length}]`) : null
                this.push ( data )
                this.remoteSerial++
                const _chunk = this.remoteChunkPool.get ( this.remoteSerial )
                if ( ! _chunk )
                    return
                console.log( `this.remoteChunkPool.size= [${this.remoteChunkPool.size}]`)
                this.remoteChunkPool.delete ( this.remoteSerial )
                return this.fromRemote ( _chunk, this.remoteSerial )
            })
        }
	}

	public stopConnect ( CallBack ) {
		console.log (`stopConnect!`)
		if ( this.stoped ) {
			console.log (`stopConnect! stoped = true!`)
			return CallBack()
		}
		console.log (`stopConnect! send stop to remote!`)
		this.stoped = true
		const ret = Buffer.concat ([ this.getHeader ( true ), Buffer.alloc (1)]).toString ( 'base64' )

        return doSend ( ret, this.imapControl, true, CallBack )
	}


}

const doSend = ( data: string, imapControl: imapPeerControl, level: boolean, CallBack ) => {
	const send = imapControl.getWImapHendle ( level )
	if ( !send ) {
		return setTimeout (() => {
			return doSend ( data, imapControl, level, CallBack )
		}, level ? 100 : 500 )
	}
	debug ? debugOut (`====> 【${ data.length }】`) : null
	return send.append ( data, err => {
		imapControl.returnWImap ( send ) 
		if ( err ) {
			console.log ( `==============>  peer.sendMassage got ERROR!`, err )
			return doSend ( data, imapControl, level, CallBack )
		}
		return CallBack ()
	})
}

interface nslookupCallBack {
	callback:  ( err?: Error, data?: any ) => void
	transferHandle: transferHandle
}

class imapPeerControl {
	private wImapPool: Imap.qtGateImapwrite[] = []
	public rImapPool: Imap.qtGateImapRead[] = []
	public imapTotalCount = corePeerCount * 2
	private doingUpline = false
	private doingDownLineTimeOut: NodeJS.Timer = null
	//private wImapNameArray = Array.from ( new Array ( maxUpline - this.imapTotalCount ), (x, i ) => corePeerCount + i )
	public seriesPool: Map < string, transferHandle > = new Map ()
	public nslookupPool: Map < string, nslookupCallBack > = new Map ()

	public get wImapLength () {
		return this.wImapPool.length
	}

	public sendDownLineSigner ( char: number, CallBack ) {
		const data = Buffer.from ( `0000`, 'hex' )
		data.writeInt8 ( char, 1 )
		console.log (`==============> want line DOWN [${ char }]`)
		return doSend ( data.toString ( 'base64' ), this, true, CallBack )
	}

	private sendUpLineSigner ( char: number, CallBack ) {

		const data = Buffer.from ( `0100`, 'hex' )
		data.writeInt8 ( char, 1 )
		console.log (`==============> want line UP [${ char }]`)
		return doSend ( data.toString ( 'base64' ), this, true, CallBack )
	}
	/*
	private _downWImapLine () {
		if ( this.wImapPool.length > corePeerCount + 1 ) {
			const uu = this.wImapPool.shift ()
			if ( !uu )
				return
			const u = parseInt ( uu.writeFolder.split ('-')[0])
			if ( u < corePeerCount ) {
				this.wImapPool.push ( uu )
				return this.downWImapLine ()
			}
			this.sendDownLineSigner ( u, () => {})
			uu.logout ()
			this.imapTotalCount --
			this.wImapNameArray.push ( u )
		}
	}
	
	private downWImapLine () {
		clearTimeout ( this.doingDownLineTimeOut )
		return this.doingDownLineTimeOut = setTimeout (() => {
			return this._downWImapLine ()
		}, 10000 )
		
	}
	*/

	constructor ( public imapData: IinputData, private writeFolder: string, private readFolder: string, server: boolean ) {
		
		for ( let i = 0; i < corePeerCount;  i ++ ) {
			const _readFolder = i + '-' + this.readFolder
			const _writeFolder = i + '-' + this.writeFolder
			if ( server || !server && i < 3 ) {
				makeWImap ( imapData, _writeFolder, this.wImapPool, true )
			}
			if ( server && i < 3 || ! server ) {
				makeRImap ( imapData, _readFolder, this.rImapPool, true, mail => {
					this.newMail ( mail )
				})
			}
	
		}
		console.log (`**************************  rImapPool [${ this.rImapPool.length }] wImapPool [${ this.wImapPool.length }]`)
	}

	public exit () {
		Async.each ( this.wImapPool, n => {
			n.logout ()
		})
	}

	public newMail ( mail: Buffer ) {}

	public nslookupRequest ( domainName: string, CallBack ) {
		const serial = Crypto.randomBytes (20).toString ('hex')
		let conn = new transferHandle ( serial, this.imapData.randomPassword, true, this )
		const command = {
			hostName: domainName
		}
		const data: nslookupCallBack = {
			callback: CallBack,
			transferHandle: conn
		}
		this.nslookupPool.set ( serial, data )
		conn.write ( Buffer.from ( JSON.stringify ( command )))

	}

	public _newConnect ( serial: string, sslconnect: boolean, CallBack: ( err?: Error, conn?: transferHandle ) => void ) {
		if ( !serial || !serial.length ) {
			return this._newConnect ( Crypto.randomBytes (20).toString ('hex'), sslconnect, CallBack )
		}
		let conn = new transferHandle ( serial, this.imapData.randomPassword, sslconnect, this )
		
		conn.once ( 'cancel', () => {
			console.trace ( `conn on cancel`)
            this.seriesPool.delete ( conn.series )
            conn.end ()
            conn = null
        })
		this.seriesPool.set ( conn.series, conn )
		return CallBack ( null, conn )
	}
	//		auto up lines
	/*
	public needMoreWrite () {

		if ( this.imapTotalCount + 1 > maxUpline || this.doingUpline ) {
			return console.log (`needMoreWrite have this.imapTotalCount + 1 [${ this.imapTotalCount + 1 }] > maxUpline [${ maxUpline }] || this.doingUpline [${ this.doingUpline }]`)
		}
			
		this.doingUpline = true
		const char = this.wImapNameArray.shift ()
		console.log ( `needMoreWrite [${ char }] wImapNameArray [${ this.wImapNameArray.length }]`)
		return this.sendUpLineSigner ( char, () => {})

	}
	*/
	public returnWImap ( wImap ) {
		//clearTimeout ( this.doingDownLineTimeOut )
		this.wImapPool.push ( wImap )
		//return this.downWImapLine ()
	}

	public getWImapHendle ( highLevel: boolean ) {
        if ( this.wImapPool.length < 2 && ! highLevel ) {
			//this.needMoreWrite ()
			return null
        }
		const ret = this.wImapPool.shift ()
		if ( !ret ) {
			//this.needMoreWrite ()
		}
		return ret
	}
	/*
	public rImapControl ( buf: Buffer ) {
		const char = buf.readInt8(1)
		const rFolderName = char + '-' + this.readFolder
		const wFolderName = char + '-' + this.writeFolder
		switch ( buf[0] ) {
			//		delete listen
			case 0: {
				console.log (`rImapControl got delete rImap! [${ rFolderName }]`)
				const index = this.rImapPool.findIndex ( n => { return n.listenFolder === rFolderName })
				if ( index < 0 ) {
					return console.log (`Got wImap control from remote want release listen name [${ rFolderName }], but can't find from rImapPool.`)
				}
				let rImap = this.rImapPool [ index ]
				rImap.logout ()
				rImap = null
				this.rImapPool.splice ( index, 1 )
				this.imapTotalCount --
				return console.log (`Got wImap control from remote want release listen name [${ rFolderName }] success!\nwImapPool.length [${ this.wImapLength }] rImapPool.length [${ this.rImapPool.length }]\n totalPeerCount [${ this.imapTotalCount }]`)
			}
			//		want add a listen
			case 1: {
				console.log ( `rImapControl got want add a listen rImap! [${ rFolderName }]`)
				this.imapTotalCount ++
				const uu = makeRImap ( this.imapData, rFolderName, this.rImapPool, true, mail => {
					this.newMail ( mail )
				})
				return uu.once ( 'ready', () => {
					console.log ( `rImapControl got rImap ready!` )
					const buf = Buffer.from ('0200', 'hex')
					buf.writeInt8 ( parseInt ( rFolderName ), 1 )
					doSend ( buf.toString( 'base64' ), this, true, () => {})
				})
			}

			case 2: {

				this.doingUpline = false
				if ( this.rImapPool.findIndex ( n => { return n.listenFolder === rFolderName }) > -1 ) {
					return console.log ( `========= ********* got more read folder but [${ wFolderName }] already in rImapPool `)
				}
				if ( this.wImapNameArray.findIndex ( n => { return n === char }) > -1 ) {
					return console.log ( `========= ********* got more read folder but [${ wFolderName }] still in wImapNameArray ${ this.wImapNameArray }`)
				}
				++ this.imapTotalCount
				makeWImap ( this.imapData, wFolderName, this.wImapPool, true )
				return console.log (`*************  make a new WImap success! the total wImap [${ this.wImapPool.length }]`)
			}

			default: {
				return console.log (`Got unknow control message [${ buf.toString ('hex')}]`)
			}
		}
	}
	*/

}

export class imapClientControl extends imapPeerControl {
	
	constructor ( private _imapData: IinputData ) {
		super ( _imapData, _imapData.serverFolder, _imapData.clientFolder, false )
	}

	public newMail ( mail: Buffer ) {

		const buf = Imap.getMailAttached ( mail )
        if ( ! buf.length )
            return
		//			wImap control 
		if ( buf.length === 2 ) {
			return //this.rImapControl ( buf )
		}

		const seriesNumber = buf.slice ( 0, 20 ).toString ('hex')
		const nslookupCallBack = this.nslookupPool.get ( seriesNumber )
		
        const serial = buf.readInt32BE ( 20 )
		const _buf = buf.slice ( 24 )

		if ( nslookupCallBack ) {

			return nslookupCallBack.transferHandle.decryptChunk ( _buf, ( err, data ) => {
				if ( err ) {
					nslookupCallBack.callback ( err )
					return console.log (`nslookupCallBack decryptChunk got ERROR!`, err )
				}
				return nslookupCallBack.callback ( null, data )
			})
		}
        const series = this.seriesPool.get ( seriesNumber )
        if ( ! series ) {
            return console.log ( `imapClientControl got newMail but can't find series [${ seriesNumber }] serial [${ serial }]`)
        }
        return series.fromRemote ( _buf, serial )
	}

	public stopProxyConnect ( socket: Net.Socket ) {
		if ( socket && typeof socket.end === 'function')
			socket.end ( res.HTTP_403 )
		socket = null
	}

	public newRemoteRequest ( socket: Net.Socket, com: VE_IPptpStream, isSsl: boolean ) {
		return this._newConnect ( null, isSsl, ( err, conn ) => {
			if ( err ) {
				return this.stopProxyConnect ( socket )
			}
			socket.once ( 'end', () => {
				//console.log ( `proxy on end!`)
				return conn.emit ('cancel')
			})
			socket.once ( 'error', err => {
				console.log ( `proxy on error`, err )
				return conn.emit ('cancel')
			})
			conn.pipe ( socket ).pipe ( conn )
			const _buf = Buffer.from ( JSON.stringify ( com ))
            conn.write ( _buf )
		})
	}

}

export class imapServerControl extends imapPeerControl {
	private sendDisconnectToClient ( conn: transferHandle, CallBack ) {
		conn.stopConnect ( CallBack )
	}

	private writeToRemote ( data: string, highLevel: boolean, CallBack ) {
        return doSend ( data, this, highLevel, CallBack )
	}
	
	private newNetConnect ( chunk: Buffer, seriesNumber: string ) {
		
		let conn: transferHandle = null
        Async.waterfall([
            next => this._newConnect ( seriesNumber, false, next ),
            ( _conn, next ) => {
                conn = _conn
                conn.decryptChunk ( chunk, next )
            }
        ], ( err, data: Buffer ) => {
            //    
            if ( err ) {
                return this.sendDisconnectToClient ( conn, () => {
                    console.log( `imapServerControl newNetConnect newConnect got ERROR, can't make NET.connet `)
                })
			}
			//console.log (`newNetConnect decryptChunk success! [${ data.toString()}]`)
            try {
								//		rImap control
				
                const command = JSON.parse ( data.toString () )
                //      nslookup request
                if ( command.hostName && command.hostName.length ) {
					console.log (`GOT domain request! 【${ command.hostName }】`)
                    return Async.waterfall([
                        next => dnsLookup ( command.hostName, next ),
                        ( data, next ) => conn.getEncryptChunk ( Buffer.from ( JSON.stringify ( data )), next )
                    ], ( err, data: Buffer ) => {
                        conn = null
                        if ( err ) {
                            return this.sendDisconnectToClient ( conn, () => {
                                console.log( `imapServerControl newNetConnect dnsLookup got ERROR:`, err )
                            })
                        }
                        return this.writeToRemote ( data.toString ( 'base64'), true , err => {
							if ( err )
								return console.log (`writeToRemote got ERROR:`, err )
						})
                    })
				}
				
                if ( command.host && command.host.length
                    && command.port && typeof command.port === 'number' && command.port > 1 && command.port < 65535 ) {
                    const jjj = Buffer.from ( command.buffer, 'base64' )
                    console.log ( `new connect 【${command.host}:${command.port}】ssl【${ command.ssl }】`)
                    conn.sslConnect = command.ssl
                    let socket = Net.connect ({ port: command.port, host: command.host }, () => {
                        if (! socket || ! socket.writable) {
                            console.log( `===============> error! socket.writable false!`)
                            console.log(`port[${command.port}], host [${command.host}]`)
                            return closefun
                        }
                        conn.remoteSerial ++
                        socket.write ( jjj )
					})
					
                    const closefun = () => {
                        if ( conn && conn.cancel ) {
                            console.log ( 'closefun conn.cancel !')
                            if ( conn.writable )
                                conn.write ( Buffer.alloc(0), () => {
                                    if ( conn.end && typeof conn.end === 'function')
                                        conn.end()
                                    conn = null
                                    console.log ( 'conn.end() success!')
                                })
                            conn = null
                        }
                        if ( socket && typeof socket.end === 'function' ) {
                            socket.end()
                            socket = null
                            
                        }
                        
					}
					
                    socket.once ( 'error', err => {
                        console.log ( 'gateway tcp socket error', err )
                        closefun ()
					})
					
                    socket.once ( 'close', err => {
                        closefun ()
					})
					
                    conn.once ( 'end', () => {
                        this.seriesPool.delete ( seriesNumber )
                        //console.log ('conn.once on END ')
                        closefun ()
                    })
                    return socket.pipe ( conn ).pipe ( socket )
				}
				
                console.log(`FORMAT ERROR VE_IPptpStream:`)
                console.log(`typeof command.buffer[${typeof command.buffer}] command.buffer.length [${command.buffer.length}]`)
                console.log(`command.host [${command.host.length}]`)
                console.log(`typeof command.port[${typeof command.port}]`)
            }
            catch (ex) {
                return this.sendDisconnectToClient ( conn, () => {
                    console.log(`==========> imapServerControl newNetConnect try JSON.parse ( data ) got ERROR:`, ex)
                })
            }
        })
	}

	constructor ( private _imapData: IinputData ) {
		super ( _imapData, _imapData.clientFolder, _imapData.serverFolder, true )
	}

	public newMail ( mail: Buffer ) {

		const buf = Imap.getMailAttached ( mail )
        if ( ! buf.length ) {
			//console.log ( `GOT new Mail but have not attachedment [${ mail.toString() }]`)
			return
		}
		if ( buf.length === 2 ) {
			return //this.rImapControl ( buf )
		}

        const seriesNumber = buf.slice ( 0, 20 ).toString ( 'hex' )
        const serial = buf.readInt32BE ( 20 )
		const _buf = buf.slice ( 24 )
		//console.log ( ` ====> seriesNumber = [${ seriesNumber }] serial = [${ serial }] _buf length [${ _buf.length }]\n`)

        if ( serial > 0 || _buf.length < 10 ) {
            const series = this.seriesPool.get ( seriesNumber )
            if (! series ) {
                return console.log ( `imapServerControl newMail can't find series[${ seriesNumber }]`)
            }
            return series.fromRemote ( _buf, serial )
        }
        return this.newNetConnect ( _buf, seriesNumber )
	}

}
const QTGateFolder = Path.join ( Os.homedir(), '.QTGate' )
const tempFiles = Path.join ( QTGateFolder, 'tempfile' )
const QTGateVideo = Path.join ( tempFiles, 'videoTemp' )

export const readMediaToFile1 = ( imapPeer: Imap.imapPeer, fileName: string, dirPath: string, CallBack ) => {
    let _callback = false
    let rImap = new Imap.qtGateImapRead ( imapPeer.imapData, fileName, true, mail => {
        const retText = Imap.getMailAttachedBase64 ( mail )
        
		rImap.logout ()
		
        return Fs.writeFile ( Path.join ( dirPath, fileName) , 'utf8', err => {
            _callback = true
            return CallBack ( err )
        })
        
	})

    rImap.once ( 'end', err => {
		
		rImap = null
    })
}