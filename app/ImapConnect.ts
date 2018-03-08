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
import * as Encrypt from './encrypt'
import localServer from './localServer'
import * as Util from 'util'
import * as Async from 'async'
import * as SaveLog from './saveLog'
const saveLog = SaveLog.saveLog

const sentRequestMailWaitTimeOut = 1000 * 60 * 2
const commandRequestTimeOutTime = 1000 * 30

export default class ImapConnect extends Imap.imapPeer {
	private QTGatePublicKey: string = null
	private password: string = null
	private sendReqtestMail = false
	private QTGateServerready = false
	public localGlobalIpAddress = null
	private sendConnectRequestMail = false
	private timeOutWhenSendConnectRequestMail: NodeJS.Timer = null
	public imapDomain = this.imapData.imapUserName.split ('@')[1]

	private errNumber ( err ) {
		if ( typeof err === 'number')
			return err
		if ( !err || ! err.message )
			return null
		const message = err.message
		if ( /auth|login|log in|Too many simultaneous|UNAVAILABLE/i.test( message ))
			return 3
		if ( /ECONNREFUSED/i.test ( message ))
			return 4
		if ( /certificate/i.test ( message ))
			return 5
		if ( /timeout/i.test ( message )) {
			return 7
		}
		if ( /peer not ready/i.test ( message ))
			return 0
		return 6
		
	}

	private _enCrypto ( text, CallBack ) {
		return Encrypt.encryptWithKey ( text, this.QTGatePublicKey, this.localServer.config.keypair.privateKey, this.password, CallBack )
	}

	private _deCrypto ( text, CallBack ) {
		return Encrypt.deCryptoWithKey1 ( text, this.QTGatePublicKey, this.localServer.config.keypair.privateKey, this.password, CallBack )
	}

	public sendMailBack () {
		saveLog (`sendMailBack`)
		return this.sendRequestMail ()
	}


	private commandCallBackPool: Map <string, requestPoolData > = new Map ()

	/*
	private clearServerListenFolder () {
		saveLog ( `doing clearServerListenFolder!`)
		const iRead = new Imap.qtGateImapRead ( this.imapData, this.imapData.serverFolder, false, true, () =>{return})
		return iRead.once ( 'ready', () => {
			saveLog (`doing clearServerListenFolder on ready now destroyAll!`)
			iRead.destroyAll (null)
		})
	}
	*/

	private makeTimeOutEvent ( request: boolean ) {
		saveLog ( `doing makeTimeOutEvent` )
		clearTimeout ( this.timeOutWhenSendConnectRequestMail )
		return this.timeOutWhenSendConnectRequestMail = setTimeout (() => {
			
			if ( request ) {
				const _callBack = this.commandCallBackPool.forEach(n => {
					return n.CallBack ( new Error ('tiemout'))
				})
				this.commandCallBackPool = new Map()
				return this.localServer.requestHaveNotResponseError ()
			}
			return this.destroy (0)
		}, request ? commandRequestTimeOutTime : sentRequestMailWaitTimeOut )

	}

	private sendRequestMail () {
		//this.clearServerListenFolder ()
		this.qtGateConnectEmitData.qtGateConnecting = 6
		this.socket.emit ( 'qtGateConnect', this.qtGateConnectEmitData )
		return this.localServer.sendEmailTest ( this.imapData, err => {
			if ( err ) {
				this._exit (1)
				/*
				if ( err.message && /554 5\.2\.0/.test ( err.message )) {
					this.socket.emit ( 'checkActiveEmailError', 3 )
					return saveLog ( `class [ImapConnect] connect QTGate timeout! send request mail to QTGate! ERROR [${ err.message })]`)
				}
				this.socket.emit ( 'checkActiveEmailError', 9 )
				return saveLog ( `class [ImapConnect] connect QTGate timeout! send request mail to QTGate! ERROR [${ err.message })]`)
				*/
			}
			this.makeTimeOutEvent ( false )
			
			return saveLog ( `class [ImapConnect] connect QTGate timeout! send request mail to QTGate! success`)
		})
	}

	private doSendConnectMail () {

		clearTimeout ( this.timeOutWhenSendConnectRequestMail )
		saveLog ( `doSendConnectMail` )

		if ( ! this.imapData.confirmRisk ) {
			saveLog ( `doSendConnectMail emit [qtGateConnect] qtGateConnectEmitData.qtGateConnecting = 0`)
			this.qtGateConnectEmitData.qtGateConnecting = 0
			this.socket.emit ( 'qtGateConnect', this.qtGateConnectEmitData )
			return 
		}
		return this.sendRequestMail ()

	}

	private showConnectingView () {
		this.qtGateConnectEmitData.qtGateConnecting = 1
		return this.socket.emit ( 'qtGateConnect', this.qtGateConnectEmitData )
	}

	constructor ( public imapData: IinputData, private qtGateConnectEmitData: IQtgateConnect, private timeOutSendRequestMail: boolean,
			private localServer: localServer, password: string,  private _exit: ( err?: number ) => void, private socket: SocketIO.Socket ) {
		super ( imapData, imapData.clientFolder, imapData.serverFolder, ( text, CallBack ) => {
			this._enCrypto ( text, CallBack )
		}, ( text, CallBack ) => {
			this._deCrypto ( text, CallBack )
		}, err => {
			if ( _exit ) {
				_exit ( this.errNumber ( err ))
				_exit = null
			}
		})
		
		this.showConnectingView ()
		
		if ( qtGateConnectEmitData.needSentMail ) {
			saveLog (`ImapConnect qtGateConnectEmitData.sentMail = [true], this.doSendConnectMail ()`)
			this.doSendConnectMail ()
		} else {
			saveLog (`ImapConnect qtGateConnectEmitData.sentMail = [false], this.doSendConnectMail ()`)
			this.on ( 'pingTimeOut', () => {
				saveLog ( `ImapConnect on pingTimeOut!` )
				if ( this.timeOutSendRequestMail ) {
					return this.doSendConnectMail ()
				}
			})
		}
		this.doReady ( this.socket, () => {})

		Async.parallel ([
			next => Encrypt.readQTGatePublicKey ( next ),
			next => this.localServer.getPbkdf2 ( password, next )
		],( err, data: any[] ) => {
			if ( err ) {
				return saveLog ( `class [ImapConnect] doing Async.parallel [readQTGatePublicKey, this.localServer.getPbkdf2 ] got error! [${ JSON.stringify ( err ) }]` )
			}
	
			this.QTGatePublicKey = data[0].toString ()
			this.password = data[1].toString ( 'hex' )
			if ( !/^-----BEGIN PGP PUBLIC KEY BLOCK-----/.test ( this.QTGatePublicKey )) {
				this.QTGatePublicKey = data[1].toString ()
				this.password = data[0].toString ('hex')
			}
		})

		this.newMail = ( ret: QTGateAPIRequestCommand ) => {
			//		have not requestSerial that may from system infomation
			saveLog ( 'clearTimeout timeOutWhenSendConnectRequestMail !' )
			clearTimeout ( this.timeOutWhenSendConnectRequestMail )
			if ( ! ret.requestSerial ) {
				saveLog ( `newMail have not ret.requestSerial, ${ JSON.stringify ( ret )} doing switch ( ret.command ) `)
				
				switch ( ret.command ) {

					case 'stopGetwayConnect':
					case 'containerStop' : {
						
						return localServer.disConnectGateway()
					}

					case 'changeDocker' : {
						
						const container: IConnectCommand = ret.Args[0]
						if ( ! container ) {
							return saveLog ( `got Command from server "changeDocker" but have no data ret = [${ JSON.stringify ( ret )}]`)
						}

						if ( ! this.localServer.proxyServer || ! this.localServer.connectCommand ) {
							return saveLog ( `got Command from server "changeDocker" localServer.proxyServer or localServer.connectCommand is null!!`)
							
						}
						saveLog ( `on changeDocker container = [${ container }]` )
						return this.localServer.proxyServer.sendCommand ( 'changeDocker', container )

					}
					default: {
						return saveLog ( `QTGateAPIRequestCommand have not requestSerial!, 【${JSON.stringify ( ret )}】`)
					}
				}
				
			}
			saveLog ( `on newMail command [${ ret.command }] have requestSerial [${ ret.requestSerial }]`)
			const poolData = this.commandCallBackPool.get ( ret.requestSerial )

			if ( ! poolData || typeof poolData.CallBack !== 'function' ) {
				return saveLog ( `QTGateAPIRequestCommand got commandCallBackPool ret.requestSerial [${ ret.requestSerial }] have not callback `)
			}
			return poolData.CallBack ( null, ret )
			
		}
		
		saveLog ( `Class ImapConnect start up!` )
	}

	public request ( command: QTGateAPIRequestCommand, CallBack ) {

		saveLog ( `request command [${ command.command }] requestSerial [${ command.requestSerial }]` )
		if ( command.requestSerial ) {
			const poolData: requestPoolData = {
				CallBack: CallBack
			}
			this.commandCallBackPool.set ( command.requestSerial, poolData )
		}
			
		return this._enCrypto ( JSON.stringify ( command ), ( err1, data: string ) => {
			if ( err1 ) {
				saveLog ( `request _deCrypto got error [${ JSON.stringify ( err1 )}]` )
				return CallBack ( err1 )
			}

			return this.trySendToRemote ( Buffer.from ( data ), () => {
				return this.makeTimeOutEvent ( true )
			})
		})
		
	}

	public doingDisconnect () {
		this.destroy (1)
		this.localServer.qtGateConnectEmitData = null
	}

	private doReady ( socket: SocketIO.Socket, CallBack ) {
		saveLog( `doReady`)

		return this.once ( 'ready', () => {
			CallBack ()
			saveLog ( 'ImapConnect got response from QTGate imap server, connect ready. clearTimeout timeOutWhenSendConnectRequestMail!' )

			clearTimeout ( this.timeOutWhenSendConnectRequestMail )
			this.QTGateServerready = true
			this.imapData.canDoDelete = false
			this.qtGateConnectEmitData.qtGateConnecting = 2
			this.localServer.saveImapData ()
			this.localServer.config.connectedQTGateServer = true
			this.localServer.saveConfig ()
			socket.emit ( 'qtGateConnect', this.qtGateConnectEmitData )
			Encrypt.makeFeedbackData (( data, callback ) => {
				this.request ( data, callback )
			}, err => {
				if ( err ) {
					return saveLog ( `makeFeedbackData back ERROR [${ err.message }]`)
				}
				return saveLog ( `makeFeedbackData success!`)
			})
		})
	}

	public checkConnect ( socket: SocketIO.Socket ) {
		this.Ping ()
		return this.doReady ( socket, () => {})
	}
 	
}
