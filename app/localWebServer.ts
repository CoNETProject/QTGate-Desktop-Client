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

import * as Express from 'express'
import * as Path from 'path'
import * as HTTP from 'http'
import * as SocketIo from 'socket.io'
import * as Tool from './tools/initSystem'
import * as Async from 'async'
import * as Fs from 'fs'
import * as Util from 'util'
import * as Uuid from 'node-uuid'
import * as Imap from './tools/imap'
import CoNETConnectCalss from './tools/coNETConnect'
import * as Crypto from 'crypto'
import * as mime from 'mime-types'

Express.static.mime.define({ 'multipart/related': ['mht'] })
//Express.static.mime.define({ 'message/rfc822' : ['mhtml','mht'] })
Express.static.mime.define({ 'application/x-mimearchive' : ['mhtml','mht'] })
Express.static.mime.define({ 'multipart/related' : ['mhtml','mht'] })

interface localConnect {
	socket: SocketIO.Socket
	login: boolean
	listenAfterPasswd: boolean
}

let logFileFlag = 'w'
const conetImapAccount = /^qtgate_test\d\d?@icloud.com$/i

const saveLog = ( err: {} | string ) => {
	if ( !err ) {
		return 
	}
	const data = `${ new Date().toUTCString () }: ${ typeof err === 'object' ? ( err['message'] ? err['message'] : '' ) : err }\r\n`
	console.log ( data )
	return Fs.appendFile ( Tool.ErrorLogFile, data, { flag: logFileFlag }, () => {
		return logFileFlag = 'a'
	})
}

const saveServerStartup = ( localIpaddress: string ) => {
	const info = `\n*************************** CoNET Platform [ ${ Tool.CoNET_version } ] server start up *****************************\n` +
			`Access url: http://${localIpaddress}:${ Tool.LocalServerPortNumber }\n`
	saveLog ( info )
}

const saveServerStartupError = ( err: {} ) => {
	const info = `\n*************************** CoNET Platform [ ${ Tool.CoNET_version } ] server startup falied *****************************\n` +
			`platform ${ process.platform }\n` +
			`${ err['message'] }\n`
	saveLog ( info )
}

const imapErrorCallBack = ( message: string ) => {
	if ( message && message.length ) {
		if ( /auth|login|log in|Too many simultaneous|UNAVAILABLE/i.test( message )) {
			return 1
		}
			
		if ( /ECONNREFUSED/i.test ( message )) {
			return 5
		}

		if (/OVERQUOTA/i.test ( message )) {
			return 6
		}
			
		if ( /certificate/i.test ( message )) {
			return 2
		}
			
		if ( /timeout|ENOTFOUND/i.test ( message )) {
			return 0
		}

		return 5
	}
	
	return -1

}


export default class localServer {
	private expressServer = Express()
	private httpServer = HTTP.createServer ( this.expressServer )
	private socketServer = SocketIo ( this.httpServer )
	private socketServer_CoSearch = this.socketServer.of ('/CoSearch')
	public config: install_config  = null
	public keyPair: keypair = null
	public savedPasswrod: string = ''
	public imapConnectData: IinputData = null
	public localConnected: Map < string, localConnect > = new Map ()
	private CoNETConnectCalss: CoNETConnectCalss = null
	private openPgpKeyOption = null
	private sessionHashPool = []
	private Pbkdf2Password = null
	private nodeList = [{
		email: 'node@Kloak.app',
		keyID:'',
		key: ''
	}]

	private requestPool: Map < string, SocketIO.Socket > = new Map()


	private catchCmd ( mail: string, uuid: string ) {
		if ( !this.imapConnectData.sendToQTGate ) {
			this.imapConnectData.sendToQTGate = true
			Tool.saveEncryptoData (  Tool.imapDataFileName1, this.imapConnectData, this.config, this.savedPasswrod, err => {

			})
		}
		console.log ( `Get response from CoNET uuid [${ uuid }] length [${ mail.length }]`)
		const socket = this.requestPool.get ( uuid )
		if ( !socket ) {
			return console.log (`Get cmd that have no matched socket \n\n`, mail )
		}

		socket.emit ( 'doingRequest', mail, uuid )
	}
	
	private tryConnectCoNET ( socket: SocketIO.Socket, sessionHash: string ) {
		console.log (`doing tryConnectCoNET`)
		//		have CoGate connect

		if ( this.CoNETConnectCalss ) {
			return this.CoNETConnectCalss.Ping()
		}

		let sendMail = false
		const _exitFunction = err => {
			console.trace ( `makeConnect on _exitFunction err this.CoNETConnectCalss destroy!`, err )
			this.CoNETConnectCalss = null
			
		}

		const makeConnect = () => {
			
			return this.CoNETConnectCalss = new CoNETConnectCalss ( this.imapConnectData, this.socketServer, !this.imapConnectData.sendToQTGate, this.nodeList[0].email,
				this.openPgpKeyOption, this.keyPair.publicKey, ( mail, uuid ) => {
				return this.catchCmd ( mail, uuid )
			}, _exitFunction )
			
		}
		
		return makeConnect ()
		
	}

	private listenAfterPassword ( socket: SocketIO.Socket, sessionHash: string ) {
		
		socket.on ( 'checkImap', ( emailAddress: string, password: string, timeZone, tLang, CallBack1 ) => {
			CallBack1()
			console.log (`localServer on checkImap!`)
			const imapServer = Tool.getImapSmtpHost( emailAddress )
			this.imapConnectData = {
				email: this.config.account,
				account: this.config.account,
				smtpServer: imapServer.smtp,
				smtpUserName: emailAddress,
				smtpPortNumber: imapServer.SmtpPort,
				smtpSsl: imapServer.smtpSsl,
				smtpIgnoreCertificate: false,
				smtpUserPassword: password,
				imapServer: imapServer.imap,
				imapPortNumber: imapServer.ImapPort,
				imapSsl: imapServer.imapSsl,
				imapUserName: emailAddress,
				imapIgnoreCertificate: false,
				imapUserPassword: password,
				timeZoneOffset: timeZone,
				language: tLang,
				imapTestResult: null,
				clientFolder: Uuid.v4(),
				serverFolder: Uuid.v4(),
				randomPassword: Uuid.v4(),
				uuid: Uuid.v4(),
				confirmRisk: false,
				clientIpAddress: null,
				ciphers: null,
				sendToQTGate: false

			}

			return this.doingCheckImap ( socket )
		})

		socket.on ( 'tryConnectCoNET', CallBack1 => {
			const uuid = Uuid.v4()
			CallBack1( uuid )

			const _callBack = ( ...data ) => {
				socket.emit ( uuid, ...data )
			}
			console.log (`socket on tryConnectCoNET!\n\n`)
			if ( !this.imapConnectData ) {
				console.log (`socket.on ( 'tryConnectCoNET') !this.imapConnectData \n\n `)
				return _callBack ( 'systemError' )
				
			}
			if ( !this.imapConnectData.confirmRisk ) {
				this.imapConnectData.confirmRisk = true
				
				return Tool.saveEncryptoData (  Tool.imapDataFileName1, this.imapConnectData, this.config, this.savedPasswrod, err => {
					return this.tryConnectCoNET ( socket, sessionHash )
				})
			}
			return this.tryConnectCoNET ( socket, sessionHash )
			
		})

		socket.on ( 'sendRequestMail', CallBack1 => {

			
			CallBack1 ()
			if ( !this.CoNETConnectCalss ) {
				return console.log (`localServer on sendRequestMail Error! have no this.CoNETConnectCalss!`)
			}
			socket.emit ( 'tryConnectCoNETStage', null, 2, false )
			if ( this.CoNETConnectCalss ) {
				console.log (`localWebServer on sendRequestMail !`)
				return this.CoNETConnectCalss.sendRequestMail ()
			}
			console.log (`localWebServer on sendRequestMail have no CoNETConnectCalss create CoNETConnectCalss`)
			return this.tryConnectCoNET ( socket, sessionHash )
			
		})

		socket.on ( 'checkActiveEmailSubmit', ( text, CallBack1 ) => {
			const uuid = Uuid.v4()
			CallBack1( uuid )
			
			const _callBack = ( ...data ) => {
				socket.emit ( uuid, ...data )
			}

			const key = Buffer.from ( text, 'base64' ).toString ()
			console.log (`checkActiveEmailSubmit`, key )
			if ( key && key.length ) {
				console.log ( `active key success! \n[${ key }]`)
				
				this.keyPair.publicKey = this.config.keypair.publicKey = key
				this.keyPair.verified = this.config.keypair.verified = true
				this.imapConnectData.sendToQTGate = true
				_callBack ()
				Tool.saveEncryptoData ( Tool.imapDataFileName1, this.imapConnectData, this.config, this.savedPasswrod, err => {
					if ( err ) {
						saveLog (`Tool.saveConfig return Error: [${ err.message }]`)
					}
				})
				return Tool.saveConfig ( this.config, err => {
					if ( err ) {
						saveLog (`Tool.saveConfig return Error: [${ err.message }]`)
					}
					
					
				})
				
			}
			
		})

		socket.on ( 'doingRequest', ( uuid, request, CallBack1 ) => {
			const _uuid = Uuid.v4()
			CallBack1 ( _uuid )

			const _callBack = ( ...data ) => {
				socket.emit ( _uuid, ...data )
			}
			this.requestPool.set ( uuid, socket )
			
			console.log (`on doingRequest uuid = [${ uuid }]\n${ request }\n`)

			if ( this.CoNETConnectCalss ) {
				saveLog (`doingRequest on ${ uuid }`)
				return this.CoNETConnectCalss.requestCoNET_v1 ( uuid, request, _callBack )
			}
			saveLog ( `doingRequest on ${ uuid } but have not CoNETConnectCalss need restart! socket.emit ( 'systemErr' )`)
			socket.emit ( 'systemErr' )
		})

		socket.on ( 'getFilesFromImap', ( files: string, CallBack1 ) => {
			const uuid = Uuid.v4()
			CallBack1( uuid )

			const _callBack = ( ...data ) => {
				socket.emit ( uuid, ...data )
			}
			
			if ( typeof files !== 'string' || !files.length ) {
				return _callBack ( new Error ('invalidRequest'))
			}
			const _files = files.split (',')
			console.log (`socket.on ('getFilesFromImap') _files = [${ _files }] _files.length = [${ _files.length }]`  )
			
			let ret = ''
			return Async.eachSeries ( _files, ( n, next ) => {
				console.log (`Async.eachSeries _files[${ n }]`)
				return this.CoNETConnectCalss.getFile ( n, ( err, data ) => {
					if ( err ) {
						return next ( err )
					}
					ret += data.toString ()
					return next ()
				})
			}, err => {
				if ( err ) {
					return _callBack ( err )
				}
				
				//console.log (`******************** getFilesFromImap success all [${ ret.length }] fies!\n\n${ ret }\n\n`)

				
				return _callBack ( null, ret )
			})
			
		})

		socket.on ( 'sendMedia', ( uuid, rawData, CallBack1 ) => {
			const _uuid = Uuid.v4()
			CallBack1( _uuid )

			const _callBack = ( ...data ) => {
				socket.emit ( _uuid, ...data )
			}
			return this.CoNETConnectCalss.sendDataToANewUuidFolder ( Buffer.from ( rawData ).toString ( 'base64' ), uuid, uuid, _callBack )
		})

		socket.on ( 'mime', ( _mime, CallBack1 ) => {
			const _uuid = Uuid.v4()
			CallBack1( _uuid )

			const _callBack = ( ...data ) => {
				socket.emit ( _uuid, ...data )
			}
			let y = mime.lookup( _mime )
			if ( !y ) {
				return _callBack ( new Error ('no mime'))
			}
			return _callBack ( null, y )
		})
/*
		socket.on ('getUrl', ( url: string, CallBack ) => {
			const uu = new URLSearchParams ( url )
			if ( !uu || typeof uu.get !== 'function' ) {
				console.log (`getUrl [${ url }] have not any URLSearchParams`)
				return CallBack ()
			}
			
			return CallBack ( null, uu.get('imgrefurl'), uu.get('/imgres?imgurl'))
		})
*/
	}

	private doingCheckImap ( socket: SocketIO.Socket ) {
		this.imapConnectData.imapTestResult = false
		return Async.series ([
			next => Imap.imapAccountTest ( this.imapConnectData, err => {
				if ( err ) {
					
					return next ( err )
				}
				console.log (`imapAccountTest success!`, typeof next )
				socket.emit ( 'imapTest' )
				return next ()
			}),
			next => Tool.smtpVerify ( this.imapConnectData, next )
		], ( err: Error ) => {
			
			if ( err ) {
				console.log (`doingCheckImap Async.series Error!`, err )
				return socket.emit ( 'smtpTest', imapErrorCallBack ( err.message ))
			}

			this.imapConnectData.imapTestResult = true
			return Tool.saveEncryptoData ( Tool.imapDataFileName1, this.imapConnectData, this.config, this.savedPasswrod, err => {
				console.log (`socket.emit ( 'imapTestFinish' )`)
				socket.emit ( 'imapTestFinish' , this.imapConnectData )
			})
			
		})
			
		
	}

	private socketServerConnected ( socket: SocketIO.Socket ) {
		const clientName = `[${ socket.id }][ ${ socket.conn.remoteAddress }]`
		let sessionHash = ''
		const clientObj: localConnect = {
			listenAfterPasswd: false,
			socket: socket,
			login: false
		}

		saveLog ( `socketServerConnected ${ clientName } connect ${ this.localConnected.size }`)


		socket.once ( 'init', Callback1 => {
			const uuid = Uuid.v4()
			Callback1 ( uuid )
			const ret = Tool.emitConfig ( this.config, false )
			//console.log ( Util.inspect( ret, false, 3, true  ))
			//console.log ( `typeof Callback1 [${ typeof Callback1 }]`)
			return socket.emit ( uuid, null, ret )
		})

		socket.once ( 'agreeClick', () => {
			this.config.firstRun = false
			return Tool.saveConfig ( this.config, saveLog )
		})

		socket.on ( 'checkPemPassword', ( password: string, CallBack1 ) => {

			const uuid = Uuid.v4()
			CallBack1 ( uuid )

			this.sessionHashPool.push ( sessionHash = Crypto.randomBytes ( 10 ).toString ('hex'))

			const passwordFail = ( imap ) => {

				//onsole.log (`passwordFail this.Pbkdf2Password = [${ this.Pbkdf2Password }]`)
				return socket.emit ( uuid, null, imap, this.Pbkdf2Password, sessionHash )
				
			}

			if ( !this.config.keypair || !this.config.keypair.publicKey ) {
				console.log ( `checkPemPassword !this.config.keypair` )
				return passwordFail ( true )
			}

			if ( !password || password.length < 5 ) {
				console.log (`! password `)
				return passwordFail ( true )
			}
			
			if ( this.savedPasswrod && this.savedPasswrod.length ) {
				if ( this.savedPasswrod !== password ) {
					console.log ( `savedPasswrod !== password `)
					return passwordFail ( true )
				}
				
				this.listenAfterPassword ( socket, sessionHash )
				return passwordFail ( this.imapConnectData )
				
				
			}
			
			return Async.waterfall ([
				next => Tool.getPbkdf2 ( this.config, password, next ),
				( Pbkdf2Password: Buffer, next ) => {
					this.Pbkdf2Password = Pbkdf2Password.toString ( 'hex' )
					
					Tool.getKeyPairInfo ( this.config.keypair.publicKey, this.config.keypair.privateKey, this.Pbkdf2Password, next )
				},
				( key, next ) => {
					//console.log ( `checkPemPassword Tool.getKeyPairInfo success!`)
					if ( ! key.passwordOK ) {
						this.Pbkdf2Password = null
						saveLog ( `[${ clientName }] on checkPemPassword had try password! [${ password }]` )
						return passwordFail ( true )
					}
					//console.log (`checkPemPassword this.Pbkdf2Password = [${ this.Pbkdf2Password}]`)
					this.savedPasswrod = password
					
					this.keyPair = key
					clientObj.listenAfterPasswd = clientObj.login = true
					this.localConnected.set ( clientName, clientObj )
					return Tool.makeGpgKeyOption ( this.config, this.savedPasswrod, next )
				},
				( option_KeyOption, next ) => {
					console.log (`checkPemPassword Tool.makeGpgKeyOption success!`)
					this.openPgpKeyOption = option_KeyOption

					return Tool.readEncryptoFile ( Tool.imapDataFileName1, password, this.config, next )
			}], ( err: Error, data: string ) => {
				console.log (`checkPemPassword Async.waterfall success!`)
				if ( err ) {
					if ( !( err.message && /no such file/i.test( err.message ))) {
						passwordFail ( err )
						return saveLog ( `Tool.makeGpgKeyOption return err [${ err && err.message ? err.message : null }]` )
					}
				}

				
				// console.log (`this.sessionHashPool.push!\n${ this.sessionHashPool }\n${ this.sessionHashPool.length }`)
				this.listenAfterPassword ( socket, sessionHash )

				try {
					this.imapConnectData = JSON.parse ( data )
					
				} catch ( ex ) {
					return passwordFail ( ex )
				}
				this.localConnected.set ( clientName, clientObj )
					
				return passwordFail ( this.imapConnectData )
			})
			
		})

		socket.on ( 'deleteKeyPairNext', CallBack1 => {
			CallBack1()
			console.log ( `on deleteKeyPairNext` )
			const thisConnect = this.localConnected.get ( clientName )

			if ( this.localConnected.size > 1 && thisConnect && ! thisConnect.login ) {
				console.log (`this.localConnected = [${ Util.inspect( this.localConnected, false, 2, true )}], thisConnect.login = [${ thisConnect.login }]`)
				return this.socketServer.emit ( 'deleteKeyPairNoite' )
			}
			const info = `socket on deleteKeyPairNext, delete key pair now.`
			
			saveLog ( info )
			this.config = Tool.InitConfig ()
			this.config.firstRun = false
			this.keyPair = null
			Tool.saveConfig ( this.config, saveLog )
			if ( this.CoNETConnectCalss ) {
				this.CoNETConnectCalss.destroy ( 2 )
				this.CoNETConnectCalss = null
			}
			sessionHash = ''
			Tool.deleteImapFile ()
			return this.socketServer.emit ( 'init', null, this.config )
		})

		socket.on ( 'NewKeyPair', ( preData: INewKeyPair, CallBack1 ) => {
			const uuid = Uuid.v4()
			CallBack1( uuid )

			const _callBack = ( ...data ) => {
				socket.emit ( uuid, ...data )
			}
			//		already have key pair

			if ( this.config.keypair && this.config.keypair.createDate ) {
				return saveLog (`[${ clientName }] on NewKeyPair but system already have keypair: ${ this.config.keypair.publicKeyID } stop and return keypair.`)
			}

			this.savedPasswrod = preData.password
			return Tool.getPbkdf2 ( this.config, this.savedPasswrod, ( err, Pbkdf2Password: Buffer ) => {
				if ( err ) {
					saveLog ( `NewKeyPair getPbkdf2 Error: [${ err.message }]`)
					return _callBack ('systemError')
				}
				
				preData.password = Pbkdf2Password.toString ( 'hex' )
				//console.log (`preData.password = [${ preData.password }]`)
				return Tool.newKeyPair( preData.email, preData.nikeName, preData.password, ( err, retData )=> {
					if ( err ) {
						console.log ( err )
						_callBack ()
						return saveLog (`CreateKeyPairProcess return err: [${ err.message }]`)
					}
					
				
					if ( ! retData ) {
						const info = `newKeyPair return null key!`
						saveLog ( info )
						console.log ( info )
						return _callBack ( )
					}
					
					if ( !clientObj.listenAfterPasswd ) {
						clientObj.listenAfterPasswd = clientObj.login = true
						
						this.localConnected.set ( clientName, clientObj )
						this.sessionHashPool.push ( sessionHash = Crypto.randomBytes (10).toString ('hex'))
						//console.log ( `this.sessionHashPool.push!\n${ this.sessionHashPool }\n${ this.sessionHashPool.length }`)
						this.listenAfterPassword ( socket, sessionHash )
					}
					
					return Tool.getKeyPairInfo ( retData.publicKey, retData.privateKey, preData.password, ( err, key ) => {
						if ( err ) {
							const info = `Tool.getKeyPairInfo Error [${ err.message ? err.message : 'null err message '}]`
							return _callBack ( 'systemError' )
						}
						this.keyPair = this.config.keypair = key
						this.config.account = this.config.keypair.email
						return Tool.makeGpgKeyOption ( this.config, this.savedPasswrod, ( err, data ) => {
							if ( err ) {
								return saveLog ( err.message )
							}
							this.openPgpKeyOption = data
							Tool.saveConfig ( this.config, saveLog )
							
							return _callBack ( null, this.config.keypair, sessionHash )
						})
						
					})
				})
								
			})
			
		})


	}

	constructor( private cmdResponse: ( cmd: QTGateAPIRequestCommand ) => void, test: boolean ) {
		//Express.static.mime.define({ 'message/rfc822' : ['mhtml','mht'] })
		//Express.static.mime.define ({ 'multipart/related' : ['mhtml','mht'] })
		Express.static.mime.define ({ 'application/x-mimearchive' : ['mhtml','mht'] })
		this.expressServer.set ( 'views', Path.join ( __dirname, 'views' ))
		this.expressServer.set ( 'view engine', 'pug' )
		this.expressServer.use ( Express.static ( Tool.QTGateFolder ))
		this.expressServer.use ( Express.static ( Path.join ( __dirname, 'public' )))
		this.expressServer.use ( Express.static ( Path.join ( __dirname, 'html' )))
	
		
		
		this.expressServer.get ( '/', ( req, res ) => {

            res.render( 'home', { title: 'home', proxyErr: false  })
		})

		this.socketServer.on ( 'connection', socker => {
			return this.socketServerConnected ( socker )
		})
		

		this.httpServer.once ( 'error', err => {
			console.log (`httpServer error`, err )
			saveServerStartupError ( err )
			return process.exit (1)
		})

		

		Async.series ([
			next => Tool.checkSystemFolder ( next ),
			next => Tool.checkConfig ( next )	
		], ( err, data ) => {
			if ( err ) {
				return saveServerStartupError ( err )
			}
			
			this.config = data['1']
			if ( !test ) {
				this.httpServer.listen ( Tool.LocalServerPortNumber, () => {
					return saveServerStartup ( `localhost`)
				})
			}
		})
		
	}
}
