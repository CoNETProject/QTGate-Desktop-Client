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
import * as cookieParser from 'cookie-parser'
import * as Os from 'os'
import * as HTTP from 'http'
import * as SocketIo from 'socket.io'
import * as Tool from './tools/initSystem'
import * as Async from 'async'
import * as Fs from 'fs'
import * as Util from 'util'
import * as freePort from 'portastic'
import * as Uuid from 'node-uuid'
import * as Imap from './tools/imap'
import CoNETConnectCalss from './tools/coNETConnect'
import * as Crypto from 'crypto'
import * as ProxyServer from './tools/proxyServer'
import * as Jimp from 'jimp'
import * as UploadFile from './tools/uploadFile'
import * as Twitter_text from 'twitter-text'

interface localConnect {
	socket: SocketIO.Socket
	login: boolean
	listenAfterPasswd: boolean
}

let logFileFlag = 'w'
const conetImapAccount = /^qtgate_test\d\d?@icloud.com$/i
const tweetImageMaxWidth = 1024
const tweetImageMaxHeight = 512

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
	const info = `\n*************************** CoNET Platform [ ${ Tool.packageFile.version } ] server start up *****************************\n` +
			`Access url: http://${localIpaddress}:${ Tool.LocalServerPortNumber }\n`

	console.log ( info )
	saveLog ( info )
}

const saveServerStartupError = ( err: {} ) => {
	const info = `\n*************************** CoNET Platform [ ${ Tool.packageFile.version } ] server startup falied *****************************\n` +
			`platform ${ process.platform }\n` +
			`${ err['message'] }\n`
	console.log ( info )
	saveLog ( info )
}

const yy: Map <string, number > = new Map ()

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

const findPort = ( port: number, CallBack ) => {
    return freePort.test ( port ).then ( isOpen => {
        if ( isOpen )
            return CallBack ( null, port )
        ++ port
        return findPort ( port, CallBack )
    })
}

export default class localServer {
	private expressServer = Express()
	private httpServer = HTTP.createServer ( this.expressServer )
	private socketServer = SocketIo ( this.httpServer )
	public config: install_config  = null
	public keyPair: keypair = null
	public savedPasswrod: string = ''
	public imapConnectData: IinputData = null
	public localConnected: Map < string, localConnect > = new Map ()
	private CoNETConnectCalss: CoNETConnectCalss = null
	private openPgpKeyOption = null
	private pingChecking = false
	private regionV1: regionV1[] = null
	private connectCommand: IConnectCommand[] = null
	private dataTransfer: iTransferData = null
	private proxyServer: ProxyServer.proxyServer = null
	private whiteIpList = []
	private domainBlackList = []
	private domainPool: Map < string, domainData > = new Map ()
	private twitterDataInit = false
	private twitterData: TwitterAccount[] = []
	private currentTwitterAccount = -1
	private doingCreateTweetData = false 

	public CoNET_systemError () {
		return this.socketServer.emit ( 'CoNET_systemError' )
	}
	
	private tryConnectCoNET ( socket: SocketIO.Socket ) {

		//		have CoGate connect
		if ( this.connectCommand && this.connectCommand.length ) {
			socket.emit ( 'tryConnectCoNETStage', -1, 4, true )
			setTimeout (() => {
				socket.emit ( 'QTGateGatewayConnectRequest', null, this.connectCommand )
			}, 200 )
			
		}

		let sendMail = false
		const exit = err => {
			console.trace ( `tryConnectCoNET exit! err =`, err )
			switch ( err ) {
				///			connect conet had timeout
				case 1: {
					return socket.emit ( 'tryConnectCoNETStage', 0 )
				}
				case 2: {
					return console.log (`CoNETConnectCalss exit with 2, stop remake CoNETConnectCalss!`)
				}
				case 3: {
					return makeConnect ( sendMail = false )
				}
				case null:
				case undefined:
				default: {
					 
					if ( ! sendMail ) {
						return makeConnect ( sendMail = true )
					}

					return makeConnect ( sendMail = false )
				}
			}
			
		}

		const catchUnSerialCmd = ( cmd: QTGateAPIRequestCommand ) => {

		}

		const makeConnect = ( sendMail: boolean ) => {
			
			if ( !this.imapConnectData.sendToQTGate || sendMail ) {
				this.imapConnectData.sendToQTGate = true
				Tool.saveEncryptoData ( Tool.imapDataFileName1, this.imapConnectData, this.config, this.savedPasswrod, () => {})
				this.socketServer.emit ( 'tryConnectCoNETStage', null, 3 )
				return Tool.sendCoNETConnectRequestEmail ( this.imapConnectData, this.openPgpKeyOption, this.config.version, this.keyPair.publicKey, ( err: Error ) => {
					if ( err ) {
						console.log (`sendCoNETConnectRequestEmail callback error`, err )
						saveLog ( `tryConnectCoNET sendCoNETConnectRequestEmail got error [${ err.message ? err.message : JSON.stringify ( err ) }]`)
						return socket.emit ( 'tryConnectCoNETStage', imapErrorCallBack ( err.message ))
					}
					
					socket.emit ( 'tryConnectCoNETStage', null, 3 )
					return this.CoNETConnectCalss = new CoNETConnectCalss ( this.imapConnectData, this.socketServer, this.openPgpKeyOption, true, catchUnSerialCmd, exit )
				})
			
			}
			console.log ( `makeConnect without sendMail`)
			return this.CoNETConnectCalss = new CoNETConnectCalss ( this.imapConnectData, this.socketServer, this.openPgpKeyOption, false, catchUnSerialCmd, exit )
			
		}
		
		if ( !this.CoNETConnectCalss || this.CoNETConnectCalss.alreadyExit ) {
			return makeConnect ( false )
		}
		
		return this.CoNETConnectCalss.tryConnect1 ()
		
	}

	private sendRequest ( socket: SocketIO.Socket, cmd: QTGateAPIRequestCommand, CallBack ) {
		if ( !this.openPgpKeyOption) {
			console.log ( `sendrequest keypair error! !this.config [${ !this.config }] !this.keyPair[${ !this.keyPair }]`)
			return CallBack (1)
		}
		if ( !this.CoNETConnectCalss ) {
			console.log (`sendrequest no CoNETConnectCalss`)
			this.tryConnectCoNET ( socket )
			return CallBack ( 0 )
		}
		saveLog (`sendRequest send [${ cmd.command }]`)

		cmd.requestSerial = Crypto.randomBytes(8).toString('hex')

		return this.CoNETConnectCalss.requestCoNET ( cmd, ( err, res: QTGateAPIRequestCommand ) => {
			saveLog ( `request response [${ cmd.command }]`)
			if ( err ) {
				CallBack ( err )
				return saveLog ( `QTClass.request error! [${ err }]`)
			}
			return CallBack ( null, res )
		})
		
	}

	private checkPort ( portNum, socket: SocketIO.Socket ) {

		
		const num = parseInt ( portNum.toString())
		if (! /^[0-9]*$/.test( portNum.toString()) || !num || num < 3000 || num > 65535 ) {
			return socket.emit ( 'checkPort', true )
		}
		if ( this.proxyServer && this.proxyServer.port ) {
			console.log ( `this.proxyServer = true, typeof this.proxyServer.port = [${ typeof this.proxyServer.port }] typeof portNum = [${ typeof portNum }]`)
			if ( portNum.toString () === this.proxyServer.port )
			return socket.emit ( 'checkPort', true, this.proxyServer.port )
		}
		console.log ( `this.proxyServer && this.proxyServer.port = [${ this.proxyServer && this.proxyServer.port }] typeof this.proxyServer [${ typeof this.proxyServer }] `)
		return findPort ( portNum, ( err, kk ) => {
			saveLog( `check port [${ typeof portNum }] got back kk [${ typeof kk }]`)
			if ( kk !== portNum ) {
				return socket.emit ( 'checkPort', true, kk )
			}
			return socket.emit ( 'checkPort' )
		})
	}

	public makeOpnConnect ( arg: IConnectCommand[] ) {
		const uu = arg[0]
		saveLog (`makeOpnConnect arg = ${ JSON.stringify (arg)}`)
		if ( this.proxyServer && typeof this.proxyServer.reNew === 'function' ) {
			console.log (`find this.proxyServer && typeof this.proxyServer.reNew === 'function'`)
			return this.proxyServer.reNew ( arg )
		}
		this.proxyServer = new ProxyServer.proxyServer ( this.whiteIpList, this.domainPool, uu.localServerPort, 'pac', 5000, arg, 50000, true, this.domainBlackList, uu.localServerIp[0], Tool.LocalServerPortNumber )
		console.log (`this.proxyServer = new ProxyServer.proxyServer! this.proxyServer && this.proxyServer.port = [${ this.proxyServer && this.proxyServer.port }]`)
		
	}

	private requestConnectCoGate ( socket: SocketIO.Socket, cmd: IConnectCommand ) {
		//const arg = [{"account":"peter1@conettech.ca","imapData":{"imapPortNumber":"993","smtpPortNumber":587,"imapServer":"imap-mail.outlook.com","imapIgnoreCertificate":false,"smtpIgnoreCertificate":false,"imapSsl":true,"smtpSsl":false,"imapUserName":"proxyviaemai@outlook.com","imapUserPassword":"ajuwrcylbrobvykn","account":"Peter1@CoNETTech.ca","smtpServer":"smtp-mail.outlook.com","smtpUserName":"proxyviaemai@outlook.com","smtpUserPassword":"ajuwrcylbrobvykn","email":"Peter1@CoNETTech.ca","imapTestResult":true,"language":"en","timeZoneOffset":420,"serverFolder":"1f4953ea-6ffe-4e58-bf46-fd7a52867a41","clientFolder":"7b6b9c13-2a30-4682-adcb-751b0643020f","randomPassword":"8a510536516b92d361f94fb624310b","clientIpAddress":"172.218.175.40","requestPortNumber":null},"gateWayIpAddress":"51.15.192.239","region":"paris","connectType":2,"localServerPort":"3001","AllDataToGateway":true,"error":-1,"fingerprint":"052568B9D9742E64C6C0A5D288C08CEAC728A0D9","localServerIp":"172.218.175.40","multipleGateway":[{"gateWayIpAddress":"51.15.192.239","gateWayPort":80,"dockerName":"scaleway-decdbb5e-bb23-4e15-8d46-544d245fcab3","password":"cb5ea121c8fa2a00e91535f921184ce8"}],"requestPortNumber":80,"requestMultipleGateway":1,"webWrt":true,"connectPeer":"ddkjksi32bjsaclbkvf","totalUserPower":2,"transferData":{"account":"peter1@conettech.ca","availableDayTransfer":102400000,"usedMonthlyOverTransfer":0,"productionPackage":"free","transferDayLimit":102400000,"transferMonthly":1024000000,"startDate":"2018-04-25T00:00:00.000Z","availableMonthlyTransfer":1024000000,"resetTime":"2018-06-02T17:17:24.288Z","usedDayTransfer":0,"timeZoneOffset":420,"usedMonthlyTransfer":0,"power":1,"isAnnual":false,"expire":"2018-05-24T00:00:00.000Z","customsID":"","paidID":[],"automatically":false},"requestContainerEachPower":2,"peerUuid":"703145fc-740c-43b6-b1c8-aca935602bd7","containerUUID":"4c6c0c5b-73f9-4fb9-9bcb-c7bc6d05fe8a","runningDocker":"scaleway-decdbb5e-bb23-4e15-8d46-544d245fcab3","dockerName":"scaleway-decdbb5e-bb23-4e15-8d46-544d245fcab3","gateWayPort":80,"randomPassword":"cb5ea121c8fa2a00e91535f921184ce8"}]
		//this.connectCommand = arg
		//socket.emit ( 'QTGateGatewayConnectRequest', null, this.connectCommand )
		
		
		if ( this.connectCommand ) {
			return socket.emit ( 'QTGateGatewayConnectRequest', null, this.connectCommand )
		}
		cmd.account = this.config.keypair.email.toLocaleLowerCase()
					
		//			@OPN connect
		
		const request = () => {
			
			const com: QTGateAPIRequestCommand = {
				command: 'connectRequest',
				Args: [ cmd ],
				error: null,
				requestSerial: Crypto.randomBytes(8).toString( 'hex' )
			}
			
			
			
			
			return this.sendRequest ( socket, com, ( err: number, res: QTGateAPIRequestCommand ) => {
				//		no error
				if ( err ) {
					socket.emit ( 'QTGateGatewayConnectRequest', err )
					return console.log ( `on QTGateGatewayConnectRequest CoNETConnectCalss.request return error`, err )
				}
				if ( res.error < 0 ) {

					const arg: IConnectCommand[] = this.connectCommand = res.Args
					
					this.makeOpnConnect ( arg )
					return socket.emit ( 'QTGateGatewayConnectRequest', null, this.connectCommand )
					
				}

				return socket.emit ( 'QTGateGatewayConnectRequest', res.error )
				
			})
			
			
		}

		//		iOPN connect 
		if ( cmd.connectType === 2 ) {
			return Tool.myIpServer (( err, data ) => {
				if ( err ) {
					return saveLog (`on QTGateGatewayConnectRequest Tool.myIpServer return error =[${ err.message ? err.message : null }]`)
				}
				if ( ! data ) {
					return saveLog (`on QTGateGatewayConnectRequest Tool.myIpServer return no data!`)
				}
				saveLog (`on QTGateGatewayConnectRequest Tool.myIpServer return localHostIP [${ data }]`)
				cmd.globalIpAddress = data
				cmd.localServerIp = Tool.getLocalInterface()
				return request ()
			})
			
		}

		return request ()
		
	}

	private listenAfterPassword ( socket: SocketIO.Socket ) {
		
		socket.on ( 'checkImap', ( emailAddress: string, password: string, timeZone, tLang, CallBack1 ) => {
			CallBack1 ()
			return Tool.myIpServer (( err?, ip? ) => {
				if ( err || !ip ) {
					saveLog (`on checkImap Tool.myIpServer got error! [${ err.message ? err.message : null}]` )
					return socket.emit ( 'smtpTest', 4 )
				}
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
		})

		socket.on ( 'tryConnectCoNET', CallBack1 => {
			CallBack1 ()
			if ( !this.imapConnectData ) {
				return this.CoNET_systemError ()
				
			}
			if ( !this.imapConnectData.confirmRisk ) {
				this.imapConnectData.confirmRisk = true
				return Tool.saveEncryptoData (  Tool.imapDataFileName1,this.imapConnectData, this.config, this.savedPasswrod, err => {
					return this.tryConnectCoNET ( socket )
				})
			}
			return this.tryConnectCoNET ( socket )
			
		})

		socket.on ( 'requestActivEmail', CallBack1 => {
			CallBack1 ()
			saveLog (`on requestActivEmail`)
			const com: QTGateAPIRequestCommand = {
				command: 'requestActivEmail',
				Args: [],
				error: null
				
			}

			return this.sendRequest ( socket, com, ( err: number, res: QTGateAPIRequestCommand ) => {
				console.log (`requestActivEmail sendrequest callback! `)
				return socket.emit ( 'requestActivEmail', err, res )
			})
			
		})

		socket.on ( 'checkActiveEmailSubmit', ( text, CallBack1 ) => {
			CallBack1()
			saveLog (`on checkActiveEmailSubmit`)
			if ( ! text || ! text.length || !/^-----BEGIN PGP MESSAGE-----/.test ( text )) {
				socket.emit  ( 'checkActiveEmailSubmit', 0 )
				return saveLog ( `checkActiveEmailSubmit, no text.length ! [${ text }]` )
			}


			return Tool.decryptoMessage ( this.openPgpKeyOption, text, ( err, data ) => {
				if ( err ) {
					socket.emit  ('checkActiveEmailSubmit', 1 )

					return saveLog ( `checkActiveEmailSubmit, decryptoMessage error [${ err.message ? err.message : null }]\n${text}` )
				}
				let pass = null
				try {
					pass = JSON.parse ( data )
				} catch ( ex ) {
					return socket.emit  ('checkActiveEmailSubmit', 1 )
				}
				
				
				const com: QTGateAPIRequestCommand = {
					command: 'activePassword',
					Args: [ pass ],
					error: null
				}
				console.log ( Util.inspect ( com ))
				
				return this.sendRequest ( socket, com, ( err, data: QTGateAPIRequestCommand ) => {
					if ( err ) {
						return socket.emit  ('checkActiveEmailSubmit', err )
					}
					if ( data.error > -1 ) {
						return socket.emit  ('checkActiveEmailSubmit', null, data )
					}
					const key = Buffer.from ( data.Args[0], 'base64' ).toString ()
					if ( key && key.length ) {
						saveLog (`active key success!`)
						socket.emit  ('checkActiveEmailSubmit')
						this.keyPair.publicKey = this.config.keypair.publicKey = key
						this.keyPair.verified = this.config.keypair.verified = true 
						return Tool.saveConfig ( this.config, err => {
							
						})
						
					}
					
				})
				
			})
		})

		socket.on ( 'getAvaliableRegion', CallBack1 => {

			CallBack1 ()
			console.log (`on getAvaliableRegion`)
			if ( this.connectCommand && this.connectCommand.length ) {
				console.log (`getAvaliableRegion have this.connectCommand `)
				//socket.emit ('getAvaliableRegion', this.regionV1, this.dataTransfer, this.config )
				socket.emit ( 'getAvaliableRegion', this.regionV1, this.dataTransfer, this.config )
				return setTimeout (() => {
					return socket.emit ( 'QTGateGatewayConnectRequest', -1, this.connectCommand )
				}, 500 )
				

			}
			const com: QTGateAPIRequestCommand = {
				command: 'getAvaliableRegion',
				Args: [],
				error: null
			}

			return this.sendRequest ( socket, com, ( err: number, res: QTGateAPIRequestCommand ) => {
				if ( err ) {
					return saveLog ( `getAvaliableRegion QTClass.request callback error! STOP [${ err }]`)
				}
				if ( res && res.dataTransfer && res.dataTransfer.productionPackage ) {
					this.config.freeUser = /free/i.test ( res.dataTransfer.productionPackage )
				}
				this.dataTransfer = res.dataTransfer
				
				console.log (`dataTransfer `, Util.inspect ( this.dataTransfer, false, 2, true ))
				socket.emit ( 'getAvaliableRegion', res.Args[2], res.dataTransfer, this.config )
				
				//		Have gateway connect!
				//this.saveConfig ()
				
				
				this.regionV1 = res.Args[2]
			})
		})

		socket.on ( 'pingCheck', CallBack1 => {
			CallBack1 ()
			if ( process.platform === 'linux') {
				return socket.emit ( 'pingCheckSuccess', true )
			}
				
			
			if ( !this.regionV1 || this.pingChecking ) {
				saveLog ( `!this.regionV1 [${ !this.regionV1 }] || this.pingChecking [${ this.pingChecking }]`)
				return socket.emit ( 'pingCheck' )
			}
				
			this.pingChecking = true
			try {
				const netPing = require ('net-ping')
				const session = netPing.createSession ()
			} catch ( ex ) {
				console.log ( `netPing.createSession err`, ex )
				return socket.emit ( 'pingCheckSuccess', true )
			}
			Async.eachSeries ( this.regionV1, ( n: regionV1, next ) => {
				
				return Tool.testPing ( n.testHostIp, ( err, ping ) => {
					saveLog( `testPing [${ n.regionName }] return ping [${ ping }]`)
					socket.emit ( 'pingCheck', n.regionName, err? 9999: ping )
					return next ()
				})
			}, () => {
				saveLog (`pingCheck success!`)
				this.pingChecking = false
				return socket.emit ( 'pingCheckSuccess' )
			})
			
		})

		socket.on ( 'promoCode', ( promoCode, CallBack1 ) => {
			CallBack1 ()
			const com: QTGateAPIRequestCommand = {
				command: 'promoCode',
				error: null,
				Args: [ promoCode ]
			}
			saveLog (`on promoCode`)
			return this.sendRequest ( socket, com, ( err: number, res: QTGateAPIRequestCommand ) => {
				saveLog ( `promoCode got callBack: [${ JSON.stringify ( res )}]`)
				if ( err ) {
					socket.emit ( 'promoCode', err )
					return saveLog (`promoCode got QTClass.request  error!`)
				}
				if ( res.error === -1 ) {
					saveLog ( 'promoCode success!' )
					this.config.freeUser = false
					Tool.saveConfig ( this.config, () => {

					})
				}
				return socket.emit ( 'promoCode', err, res )
			})
		})

		socket.on ( 'checkPort', ( portNum, CallBack1 ) => {
			CallBack1()
			return this.checkPort ( portNum, socket )
		})

		socket.on ( 'QTGateGatewayConnectRequest', ( cmd: IConnectCommand, CallBack1 ) => {
			CallBack1 ()
			return this.requestConnectCoGate ( socket, cmd )
		})

		socket.on ( 'disconnectClick', CallBack1 => {
			CallBack1 ()
			return this.stopGetwayConnect ( socket, true, null )
		})

		socket.on ( 'cardToken', ( payment: iQTGatePayment, CallBack1 ) => {
			const com: QTGateAPIRequestCommand = {
				command: 'cardToken',
				error: null,
				Args: [ payment ]
			}
			CallBack1 ()
			console.log ( `socket.on cardToken send to QTGate!`, Util.inspect ( com, false, 2, true ))
			
			return this.sendRequest ( socket, com, ( err: number, res: QTGateAPIRequestCommand ) => {
				saveLog ( `cardToken got callBack: [${ JSON.stringify ( res )}]`)
				if ( err ) {
					return saveLog ( `cardToken got QTClass.request  error!`)
				}
				if ( res.error === -1 ) {
					saveLog ( 'cancelPlan success!' )
					this.config.freeUser = false
					Tool.saveConfig ( this.config, err => {

					})
				}
				socket.emit ( 'cardToken', err, res )
				
			})
			
		})

		socket.on ( 'cancelPlan', ( CallBack1 ) => {
			CallBack1 ()
			const com: QTGateAPIRequestCommand = {
				command: 'cancelPlan',
				error: null,
				Args: []
			}
			return this.sendRequest ( socket, com, ( err: number, res: QTGateAPIRequestCommand ) => {
				socket.emit ( 'cancelPlan', err, res )
			})
		})

	}

	private doingCheckImap ( socket: SocketIO.Socket ) {
		this.imapConnectData.imapTestResult = false
		return Async.series ([
			next => Imap.imapAccountTest ( this.imapConnectData, err => {
				if ( err ) {
					console.log (`doingCheckImap Imap.imapAccountTest return err`, err )
					return next ( err )
				}
				console.log (`imapAccountTest success!`, typeof next )
				socket.emit ( 'imapTest' )
				return next ()
			}),
			next => Tool.smtpVerify ( this.imapConnectData, next )
		], ( err: Error ) => {
			console.log (`doingCheckImap Async.series success!`)
			if ( err ) {
				return socket.emit ( 'smtpTest', imapErrorCallBack ( err.message ))
			}
			this.imapConnectData.imapTestResult = true
			return Tool.saveEncryptoData ( Tool.imapDataFileName1, this.imapConnectData, this.config, this.savedPasswrod, err => {
				console.log (`socket.emit ( 'imapTestFinish' )`)
				socket.emit ( 'imapTestFinish' , this.imapConnectData )
			})
			
		})
			
		
	}

	private deleteCurrentAccount () {
		if ( this.currentTwitterAccount < 0 ) {
			return 
		}
		this.twitterData.splice ( this.currentTwitterAccount, 1 )
		return Tool.saveEncryptoData ( Tool.twitterDataFileName, this.twitterData, this.config, this.savedPasswrod, err => {
			if ( err ) {
				return saveLog (`saveANEWTwitterData got error: ${ err.messgae }`)
			}
			
		})
	}

	private setCurrentTwitterAccount ( account: TwitterAccount ) {
		
		this.currentTwitterAccount = this.twitterData.findIndex ( n => {
			return n.access_token_secret === account.access_token_secret
		})
		
	}

	private TwitterError ( err, CallBack ) {
		if ( typeof err === 'object') {
			console.log (`TwitterError err = [${ Util.inspect ( err )}]`)
			if ( err.message && /Invalid or expired token/i.test( err.message )) {
				console.log ( `Twitter account error!`)
				this.deleteCurrentAccount ()
				return CallBack ( 1 )
			}
		}
		return CallBack ( 2 )
	}

	private getTimelines ( socket: SocketIO.Socket, account: TwitterAccount, CallBack ) {
		
		const com: QTGateAPIRequestCommand = {
			command: 'twitter_home_timeline',
			Args: [ account ],
			error: null,
			requestSerial: Crypto.randomBytes(8).toString ('hex' )
		}
		let count = 0
		return this.sendRequest ( socket, com, ( err, res: QTGateAPIRequestCommand ) => {
			count ++
			if ( err ) {
				return CallBack ()
			}

			if ( res.error ) {
				return this.TwitterError ( res.error, CallBack )
			}
			
			if ( res.Args && res.Args.length > 0 ) {
				let uu: twitter_post = null
				try {
					uu = JSON.parse ( Buffer.from ( res.Args [0], 'base64' ).toString ())
				} catch ( ex ) {
					this.TwitterError ( 2, CallBack )
					return saveLog ( `getTimelines QTClass.request return JSON.parse Error! _return [${ ex } ]` )
				}
				if ( count >= uu.CoNET_totalTwitter - 1 ) {
					console.log (`socket.emit ( 'getTimelinesEnd' )`)
					socket.emit ( 'getTimelinesEnd' )
				}
				console.log (`Total Tweets [${ uu.CoNET_totalTwitter }] current [${count }]`)
				return CallBack ( null, uu )
			}
			
			
		})
	}

	private getMedia ( mediaString: string, CallBack ) {
		//saveLog (` getMedia mediaString = [${ mediaString }]`)
		if ( /^http[s]*\:\/\//.test ( mediaString )) {
			return CallBack ( null, mediaString )
		}
		const files = mediaString.split (',')
		if ( !files || !files.length ) {
			return CallBack ( null, '')
		}
		//console.log ( files )
		return Imap.imapGetMediaFile ( this.imapConnectData, files[0], CallBack )
	}

	private getVideo ( m: twitter_media_video_info, CallBack ) {
		if ( !m || !m.QTDownload ) {
			return CallBack ()
		}
		return this.getMedia ( m.QTDownload, ( err, data ) => {
			if ( data ) {
				const file = Uuid.v4() + '.mp4'
				const viode = Buffer.from ( data, 'base64' )
				return Fs.writeFile ( Path.join ( Tool.QTGateVideo, file ), viode, err => {
					m.QTDownload = `/tempfile/videoTemp/${ file }`
					console.log (`save video file: [${ file }]`)
					return CallBack ()
				})
			}
			return CallBack ()
			
		})
	}

	private getQuote_status ( tweet: twitter_post, CallBack ) {
		saveLog ( `doing getQuote_status [${ tweet.id_str }]`)
		if ( tweet.quoted_status ) {
			
			const entities = tweet.quoted_status.extended_entities = tweet.quoted_status.extended_entities || null
			if ( entities && entities.media && entities.media.length ) {
				console.log (`getTweetMediaData [${ entities.media.map ( n => { return n.media_url_https })}]`)
				return this.getTweetMediaData ( tweet.quoted_status.extended_entities.media, CallBack )
			}
		}
		if ( tweet.retweeted_status ) {
			const entities = tweet.retweeted_status.extended_entities = tweet.retweeted_status.extended_entities || null
			if ( entities && entities.media && entities.media.length ) {
				console.log (`getTweetMediaData [${ entities.media.map ( n => { return n.media_url_https })}]`)
				return this.getTweetMediaData ( tweet.retweeted_status.extended_entities.media, CallBack )
			}
		}
		return CallBack ()
	}

	private getTweetMediaData ( media: twitter_media[], CallBack  ) {
		const uu = media && media.length && media[0].video_info ? media[0].video_info : null
		if ( uu && uu.QTDownload ) {
			return this.getVideo ( uu, CallBack )
		}
		return Async.eachSeries ( media, ( n: twitter_media, next ) => {
			n.video_info = null
			return this.getMedia ( n.media_url_https, ( err, data ) => {
				if ( err ) {
					return next ()
				}
				n.media_url_https = data ? `data:image/png;base64,${ data }` : n.media_url_https
				return next ()
			})
		}, CallBack )

	}

	private createTweetData_next ( tweet: twitter_post, err: Error, data: string[][], CallBack ) {
		//saveLog ( `createTweetData_next CallBack: data = [${ data.map ( n => { return n.length })}]`)
		tweet.user.profile_image_url_https = `data:image/png;base64,${ data [0]}`
		if ( tweet.retweeted && tweet.retweeted.user ) {
			tweet.retweeted.user.profile_image_url_https = `data:image/png;base64,${ data [1]}`
		}
		if ( tweet.retweeted_status && tweet.retweeted_status.user ) {
			tweet.retweeted_status.user.profile_image_url_https  = `data:image/png;base64,${ data [1]}`
		}
		
		if ( !tweet.retweeted_status && tweet.extended_entities && tweet.extended_entities.media && tweet.extended_entities.media.length ) {
			return this.getTweetMediaData ( tweet.extended_entities.media, err => {
				return this.getQuote_status ( tweet, CallBack )
			})
		}
		return this.getQuote_status ( tweet, CallBack )
	}

	private getTimelinesNext ( socket, account: TwitterAccount, max_id: number, CallBack ) {
		delete account['twitter_verify_credentials']
		const com: QTGateAPIRequestCommand = {
			command: 'twitter_home_timelineNext',
			Args: [ account, max_id ],
			error: null,
			requestSerial: Crypto.randomBytes(8).toString ('hex' )
		}

		return this.sendRequest ( socket, com, ( err, res: QTGateAPIRequestCommand ) => {

			if ( err ) {
				return CallBack ()
			}
			if ( res.error ) {
				this.TwitterError ( res.error, CallBack )
			}
			
			if ( res.Args && res.Args.length > 0 ) {

				let uu: twitter_post[] = null

				try {
					uu= JSON.parse ( Buffer.from ( res.Args [0], 'base64' ).toString ())
				} catch ( ex ) {
					return saveLog (`getTimelines QTClass.request return JSON.parse Error!`)
				}
				
				return CallBack ( null, uu )
			}
			
			
		})
	}

	private createTweetData ( tweet: twitter_post, CallBack ) {
		/*
		if ( this.doingCreateTweetData ) {
			return this.tweetTimeLineDataPool.push ({
				post: tweet,
				CallBack: CallBack
			})
		}
		this.doingCreateTweetData = true
		*/
		if ( !tweet ) {
			saveLog ( `createTweetData got Null tweet data `)
			return CallBack ( new Error ('have no tweet data!'))
		}
		
		const action = [
			next => this.getMedia ( tweet.user.profile_image_url_https, next )
		]
		if ( tweet.retweeted && tweet.retweeted.user ) {
			action.push (
				next => this.getMedia ( tweet.retweeted.user.profile_image_url_https, next )
			)
		}
		if ( tweet.retweeted_status && tweet.retweeted_status.user ) {
			action.push (
				next => this.getMedia ( tweet.retweeted_status.user.profile_image_url_https, next )
			)
		}
		return Async.series ( action, ( err, data ) => {
			
			return this.createTweetData_next ( tweet, err, data, err1 => {
				this.doingCreateTweetData = false
				CallBack ( null, tweet )
				/*
				if ( this.tweetTimeLineDataPool.length ) {
					const uu = this.tweetTimeLineDataPool.shift ()
					return this.createTweetData ( uu.post, uu.CallBack )
				}
				*/
			})
		})
        
	}

	private getPictureBase64ToTwitter_mediaData ( mediaData: string, CallBack ) {
		
		const media = mediaData.split(',')
		const type = media[0].split(';')[0].split (':')[1]
		const _media = Buffer.from ( media[1], 'base64')
		const ret: twitter_mediaData = {
			total_bytes: media[1].length,
			media_type: type,
			rawData: media[1],
			media_id_string: null
		}
		const uploadDataPool = []
		
		//if ( mediaData.length > maxImageLength) {
			const exportImage = ( _type, img ) => {
				return img.getBuffer ( _type, ( err, _buf: Buffer ) => {
					if ( err ) {
						return CallBack ( err )
					}
					ret.rawData = _buf.toString( 'base64' )
					ret.total_bytes = _buf.length

					return CallBack ( null, ret )
				})
			}
			return Jimp.read ( _media, ( err, image ) => {
				if ( err ) {
					return CallBack ( err )
				}
				const uu = image.bitmap
				if ( uu.height > uu.width ) {
					image.resize ( Jimp.AUTO, tweetImageMaxHeight )
				} else {
					image.resize ( tweetImageMaxWidth, Jimp.AUTO )
				}
				if ( /\/PNG/i.test ( type )) {
					return image.deflateStrategy ( 1, () => {
						return exportImage ( type, image )
					})
				}
				if ( /\/(JPEG|JPG)/i.test ( type )) {
					return image.quality ( 100, () => {
						return exportImage ( type, image )
					})
				}
				//		BMP and all other to PNG
				ret.media_type = 'image/png'
				return image.deflateStrategy ( 4, () => {
					return exportImage ( ret.media_type, image )
				})
			})
		//}
		
		//return CallBack ( null, ret )
		
	}

	private QT_PictureMediaUpload ( data: twitter_postData, CallBack ) {
		let imageIndex = 0
		return Async.eachSeries ( data.images, ( n: string, next ) => {
			return Async.waterfall ([
				_next => this.getPictureBase64ToTwitter_mediaData ( n, _next ),
				( media: twitter_mediaData, _next ) => {
					media.media_id_string = Path.join ( Tool.QTGateVideo,  Uuid.v4 ())
					data.media_data.push ( media )
					return Fs.writeFile ( media.media_id_string, Buffer.from ( media.rawData, 'base64' ), 'binary', _next )
				},
				_next => {

					return UploadFile.sendFile3 ( data.media_data[ data.media_data.length - 1 ].media_id_string, this.CoNETConnectCalss, ( err, files: string[] ) => {
						if ( err ) {
							saveLog (`QT_PictureMediaUpload UploadFile.sendFile error: [${ err.message }]`)
							return _next ( err )
						}
						const media = data.media_data[ imageIndex ++ ]
						media.media_id_string = files.join (',')
						delete media.rawData
						return _next ()
					})
				}
			], next )
		}, CallBack )
		
	}

	private QT_VideoMediaUpload ( data: twitter_postData, CallBack ) {
		return UploadFile.sendFile3 ( Path.join ( Tool.QTGateVideo, data.videoFileName), this.CoNETConnectCalss, ( err, files: string[] ) => {
			if ( err ) {
				return CallBack ( err )
			}
			saveLog (`QT_VideoMediaUpload got files ${ files }`)
			data.videoFileName = files.join (',')
			return CallBack ()
		})
	}

	private postTweetViaQTGate ( socket, account: TwitterAccount, postData: twitter_postData, Callback ) {
		
		const post = err => {
			if ( err ) {
				saveLog ( `postTweetViaQTGate post got error: [${ err.message }] `)
				return Callback ( err )
			}

			delete account['twitter_verify_credentials']
			delete postData.images
			const com: QTGateAPIRequestCommand = {
				command: 'twitter_post',
				Args: [ account, postData ],
				error: null,
				requestSerial: Crypto.randomBytes( 10 ).toString ( 'hex' )
			}
			console.log (`[twitter_post]\n${ Util.inspect ( postData )}`)
			/*
			Imap.imapGetMediaFilesFromString ( this.localServer.QTClass.imapData, postData.videoFileName, QTGateVideo, ( err1, data ) => {
				if ( err1 ) {
					saveLog ( `Imap.imapGetMediaFilesFromString got error [${ err }]`)
				}
				saveLog ( `Imap.imapGetMediaFilesFromString success! [${ data }]`)
			})
			*/
			return this.sendRequest ( socket, com, Callback )
			
		}
		if ( postData.images && postData.images.length ) {
			return this.QT_PictureMediaUpload ( postData, post )
		}
		if ( postData.videoFileName ) {
			return this.QT_VideoMediaUpload ( postData, post )
		}
		return post ( null )
	}

	private tweetTimeCallBack ( socket: SocketIO.Socket, err, tweets: twitter_post, postReturn: boolean ) {
		
		if ( err ) {
			socket.emit ( 'getTimelines', err )
			return console.log ( `socket.on ( 'getTimelines' return [${ err }]`)
			
		}
		
		return this.createTweetData ( tweets, ( err, tweet: twitter_post ) => {
			
			if ( err ) {
				return console.log (`getTweetCount error`, err )
			}
			console.log (`*************** socket.emit [${ tweet.CoNET_totalTwitter }:${ tweet.CoNET_currentTwitter + 1 }]`)
			return socket.emit ( 'getTimelines', tweet, postReturn )
			
			
		})
	}

	private listenAfterTwitterLogin ( socket: SocketIO.Socket ) {


		socket.on ( 'addTwitterAccount', ( addTwitterAccount: TwitterAccount, CallBack1 ) => {
			CallBack1()
			delete addTwitterAccount ['twitter_verify_credentials']
			const com: QTGateAPIRequestCommand = {
				command: 'twitter_account',
				Args: [ addTwitterAccount ],
				error: null
			}
			return this.sendRequest ( socket, com, ( err, res: QTGateAPIRequestCommand ) => {
				if ( err ) {
					return socket.emit ('addTwitterAccount' )
					
				}
				
				if ( res.Args && res.Args.length > 0 ) {
					let uu = null
					try {
						uu = JSON.parse ( Buffer.from ( res.Args [0], 'base64').toString ())
					} catch ( ex ) {
						socket.emit ('addTwitterAccount')
						return saveLog (`getTwitterAccountInfo QTClass.request return JSON.parse Error!`)
					}
					if ( uu && uu.twitter_verify_credentials ) {
						console.log (`addTwitterAccount ${ Util.inspect ( uu, false, 2, true )}`)
						socket.emit ('addTwitterAccount', null, uu )
						this.twitterData.push ( uu )
						return Tool.saveEncryptoData ( Tool.twitterDataFileName, this.twitterData, this.config, this.savedPasswrod, err => {
							if ( err ) {
								return saveLog (`saveANEWTwitterData got error: ${ err.messgae }`)
							}
							
						})

					}
					
					
				}
				
				return socket.emit ('addTwitterAccount')
			})
		})

		socket.on ( 'getTimelines', ( item: TwitterAccount, CallBack1 ) => {
			CallBack1()
			delete item ['twitter_verify_credentials']
			this.setCurrentTwitterAccount ( item )
			
			return this.getTimelines ( socket, item, ( err, tweets: twitter_post ) => {
				return this.tweetTimeCallBack ( socket, err, tweets, false )
				
			})
		})

		socket.on ( 'mediaFileUpdata', ( uploadId, data: Buffer, part: number, CallBack1 ) => {
			CallBack1 ()
			const fileName = Path.join ( Tool.QTGateVideo, uploadId )
			//		the end!
			const CallBack = err => {
				return socket.emit ( 'mediaFileUpdata', err )
			}
			if ( !part ) {
				Fs.writeFile ( fileName, data, 'binary', CallBack )
			} else {
				Fs.appendFile ( fileName, data, 'binary',CallBack )
			}
		})

		socket.on ( 'getTimelinesNext', ( item: TwitterAccount, maxID: number, CallBack1 ) => {
			CallBack1 ()
			return this.getTimelinesNext ( socket, item, maxID, ( err, tweets: twitter_post ) => {
				return this.tweetTimeCallBack ( socket, err, tweets, false )
				
			})
		})

		socket.on ( 'twitter_postNewTweet', ( account: TwitterAccount, postData: twitter_postData[], CallBack1 ) => {
			CallBack1 ()
			if ( !account || !postData.length ) {
				return console.log ( 'on twitter_postNewTweet but format error!' )
			}
			console.log ( Util.inspect ( postData, false, 4, true ))
			
			return this.postTweetViaQTGate ( socket, account, postData[0], ( err, res ) => {
				if ( res.Args && res.Args.length > 0 ) {
					let uu: twitter_post = null
					try {
						uu = JSON.parse ( Buffer.from ( res.Args [0], 'base64' ).toString ())
					} catch ( ex ) {
						return socket.emit ( 'getTimelines', 2 )
						
					}
					console.log (`postTweetViaQTGate return\n`, Util.inspect ( uu ))
					uu.user.profile_image_url_https = this.twitterData[this.currentTwitterAccount].twitter_verify_credentials.profile_image_url_https
					return socket.emit ( 'getTimelines', uu, true )
				}
				if ( err ) {
					return socket.emit ( 'twitter_postNewTweet', err )
				}
				
			})
		})

		socket.on ( 'getTwitterTextLength', ( twitterText: string, CallBack1 ) => {
			CallBack1 ()
			return socket.emit ( 'getTwitterTextLength', Twitter_text.parseTweet ( twitterText ))
		})

		return socket.on ( 'saveAccounts', ( twitterAccounts: TwitterAccount[], CallBack1 ) => {
			CallBack1 ()
			this.twitterData = twitterAccounts
			return Tool.saveEncryptoData ( Tool.twitterDataFileName, this.twitterData, this.config, this.savedPasswrod, err => {
				if ( err ) {
					return saveLog (`saveTwitterData error [${ err.message ? err.message : ''}]`)
				}
			})
		})

	}

	private socketServerConnected ( socket: SocketIO.Socket ) {
		const client = `[${ socket.id }][ ${ socket.conn.remoteAddress }]`
		this.localConnected.set ( client, { socket: socket, login: false, listenAfterPasswd: false } )

		socket.once ( 'disconnect', reason => {
			//saveLog ( `socketServerConnected ${ client } on disconnect`)
			return this.localConnected.delete ( client )
		})

		socket.on ( 'init', Callback1 => {
			Callback1()
			const ret = Tool.emitConfig ( this.config, false )
			return socket.emit ( 'init', null, ret )
		})

		socket.once ( 'agreeClick', CallBack1 => {
			CallBack1 ()
			this.config.firstRun = false
			return Tool.saveConfig ( this.config, saveLog )
		})

		socket.on ( 'checkPemPassword', ( password: string, CallBack1 ) => {
			CallBack1 ()
			if ( !this.config.keypair || !this.config.keypair.publicKey ) {
				console.log (`checkPemPassword !this.config.keypair`)
				return socket.emit ( 'checkPemPassword', null, true )
				
			}
			if ( !password || password.length < 5 ) {
				console.log (`! password `)
				return socket.emit ( 'checkPemPassword', null, true )
			}
			if ( this.savedPasswrod && this.savedPasswrod.length ) {
				if ( this.savedPasswrod !== password ) {
					console.log (`savedPasswrod !== password `)
					return socket.emit ( 'checkPemPassword', null, true )
				}

			}
			
			return Async.waterfall ([
				next => Tool.getPbkdf2 ( this.config, password, next ),
				( Pbkdf2Password: Buffer, next ) => Tool.getKeyPairInfo ( this.config.keypair.publicKey, this.config.keypair.privateKey, Pbkdf2Password.toString('hex'), next ),
				( key, next ) => {
					if ( ! key.passwordOK ) {
						const info = `[${ client }] on checkPemPassword had try password! [${ password }]`
						
						saveLog ( info )
						return socket.emit ( 'checkPemPassword', null, true )
					}
					this.savedPasswrod = password
					this.localConnected.set ( client, { socket: socket, login: true, listenAfterPasswd: true })
					this.listenAfterPassword ( socket )
					this.keyPair = key
					return Tool.makeGpgKeyOption ( this.config, this.savedPasswrod, next )
				},
				( option_KeyOption, next ) => {
					
					this.openPgpKeyOption = option_KeyOption
					return Tool.readEncryptoFile ( Tool.imapDataFileName1, password, this.config, next )
			}], ( err: Error, data: string ) => {
				if ( err ) {
					socket.emit ( 'checkPemPassword' )
					return saveLog (`Tool.makeGpgKeyOption return err [${ err && err.message ? err.message : null }]` )
				}
				
				try {
					this.imapConnectData = JSON.parse ( data )
					return socket.emit ( 'checkPemPassword', null, this.imapConnectData )
				} catch ( ex ) {
					return socket.emit ( 'checkPemPassword' )
				}
				
			})
			
		})

		socket.on ( 'deleteKeyPairNext', CallBack1 => {
			
			CallBack1 ()
			const thisConnect = this.localConnected.get ( client )

			if ( this.localConnected.size > 1 && ! thisConnect.login ) {
				
				return this.socketServer.emit ( 'deleteKeyPairNoite' )
			}
			const info = `socket on deleteKeyPairNext, delete key pair now.`
			console.log ( info )
			saveLog ( info )
			this.config = Tool.InitConfig ()
			this.config.firstRun = false
			this.keyPair = null
			Tool.saveConfig ( this.config, saveLog )
			if ( this.CoNETConnectCalss ) {
				this.CoNETConnectCalss.destroy ( 2 )
				this.CoNETConnectCalss = null
			}
			return this.socketServer.emit ( 'init', null, this.config )
		})

		socket.on ( 'NewKeyPair', ( preData: INewKeyPair, CallBack1 ) => {
			CallBack1 ()
			//		already have key pair
			if ( this.config.keypair && this.config.keypair.createDate ) {
				return saveLog (`[${ client }] on NewKeyPair but system already have keypair: ${ this.config.keypair.publicKeyID } stop and return keypair.`)
			}

			this.savedPasswrod = preData.password
			return Tool.getPbkdf2 ( this.config, this.savedPasswrod, ( err, Pbkdf2Password: Buffer ) => {
				if ( err ) {
					saveLog (`NewKeyPair getPbkdf2 Error: [${ err.message }]`)
					return this.CoNET_systemError ()
				}
				
				preData.password = Pbkdf2Password.toString ( 'hex' )

				saveLog ( `NewKeyPair doing CreateKeyPairProcess`)
				return Tool.newKeyPair( preData.email, preData.nikeName, preData.password, ( err, retData )=> {
					if ( err ) {
						console.log ( err )
						this.socketServer.emit ( 'newKeyPairCallBack' )
						return saveLog (`CreateKeyPairProcess return err: [${ err.message }]`)
					}
					
				
					if ( ! retData ) {
						const info = `newKeyPair return null key!`
						saveLog ( info )
						console.log ( info )
						return this.socketServer.emit ( 'newKeyPairCallBack' )
					}
					const kk = this.localConnected.get ( client )
					if ( !kk.listenAfterPasswd ) {
						kk.listenAfterPasswd = true
						this.localConnected.set ( client, kk )
						this.listenAfterPassword ( socket )
					}
					return Tool.getKeyPairInfo ( retData.publicKey, retData.privateKey, preData.password, ( err, key ) => {
						if ( err ) {
							const info = `Tool.getKeyPairInfo Error [${ err.message ? err.message : 'null err message '}]`
							return this.CoNET_systemError ()
						}
						this.keyPair = this.config.keypair = key
						this.config.account = this.config.keypair.email
						return Tool.makeGpgKeyOption ( this.config, this.savedPasswrod, ( err, data ) => {
							if ( err ) {
								return saveLog ( err.message )
							}
							this.openPgpKeyOption = data
							Tool.saveConfig ( this.config, saveLog )
							return this.socketServer.emit ( 'newKeyPairCallBack', this.config.keypair )
						})
						
					})
				})
								
			})
			
		})

		socket.on ( 'password', ( password: string, Callback1 ) => {
			Callback1()
            if ( !this.config.keypair || !this.config.keypair.publicKey ) {
				console.log ( `password !this.config.keypair`)
				return socket.emit ( 'password', true )
			}

			if ( !password || password.length < 5 ) {
				console.log (`! password `)
				return socket.emit ( 'password', true )
			}

			if ( this.savedPasswrod && this.savedPasswrod.length ) {
				if ( this.savedPasswrod !== password ) {
					console.log (`savedPasswrod !== password `)
					return socket.emit ( 'password', true )
				}

			}

            
			this.listenAfterTwitterLogin ( socket )

			if ( this.twitterDataInit ) {
				return socket.emit ( 'password', null, this.twitterData )
			}
			this.twitterDataInit = true
			return Tool.readEncryptoFile ( Tool.twitterDataFileName, password, this.config, ( err, data ) => {
				if ( data && data.length ) {
					
					try {
						this.twitterData = JSON.parse ( data )
					} catch ( ex ) {
						return socket.emit ( 'password', true )
					}
					
					return socket.emit ( 'password', null, this.twitterData )
				}
				return socket.emit ( 'password', true )
			})
            
			
		})
	}

	private stopGetwayConnect ( socket, sendToCoNET: boolean, region: string ) {
		
	
		if ( this.connectCommand && this.connectCommand.length ) {
			region = this.connectCommand[0].region
			this.connectCommand = this.dataTransfer = null
		}
		
		if ( this.proxyServer && typeof this.proxyServer.exit === 'function') {
			console.log (`this.proxyServer = null`)
			this.proxyServer.exit ()
		}

		if ( sendToCoNET ) {
			const com: QTGateAPIRequestCommand = {
				command: 'stopGetwayConnect',
				Args: null,
				error: null
			}
			return this.sendRequest ( socket, com, ( err, retCmd: QTGateAPIRequestCommand ) => {
				return socket.emit ('disconnectClick', region )
			})
		}
		
	}

	

	constructor( private cmdResponse: ( cmd: QTGateAPIRequestCommand ) => void, test: boolean ) {
		
		this.expressServer.set ( 'views', Path.join ( __dirname, 'views' ))
		this.expressServer.set ( 'view engine', 'pug' )
		this.expressServer.use ( cookieParser ())
		this.expressServer.use ( Express.static ( Tool.QTGateFolder ))
		this.expressServer.use ( Express.static ( Path.join ( __dirname, 'public' )))

		this.expressServer.get ( '/', ( req, res ) => {

            res.render( 'home', { title: 'home', proxyErr: false  })
		})

		this.expressServer.get ( '/twitter', ( req, res ) => {
			console.log ( `get twitter`)
			if ( !this.config.keypair || !this.config.keypair.publicKey || !this.CoNETConnectCalss ) {
				
				return res.render( 'home', { title: 'home', proxyErr: false  })
				
			}
			
			res.render( 'twitter', { title: 'CoNET for Twitter' })
			
		})

		this.expressServer.get ( '/proxyErr', ( req, res ) => {
			console.log ( `get /proxyErr`)
            res.render( 'home', { title: 'CoNET for Twitter', proxyErr: true })
		})

		this.expressServer.get ( '/doingUpdate', ( req, res ) => {
			res.json()
			
			const { ver } = req.query
			saveLog ( `/doingUpdate res.query = [${ ver }]`)
			this.config.newVersion = ver
			this.config.newVerReady = true
			return Tool.saveConfig ( this.config, err => {

			})
		})

		this.expressServer.get ( '/Wrt', ( req, res ) => {
			let globalIp = ''
			if ( this.connectCommand && this.connectCommand.length ) {
				globalIp = this.connectCommand[0].localServerIp[0]
			} else {
				console.log (`Wrt doing Tool.myIpServer`)
				return Tool.myIpServer (( err, data ) => {
					if ( err ) {
						globalIp = 'ERR'
					} else {
						globalIp = data
					}
					console.log (`Wrt doing Tool.myIpServer [${ globalIp }]`)
					res.render( 'home/Wrt', { title: 'Wrt', localIP: Tool.getLocalInterface (), globalIP: globalIp })
				})
			}
			console.log (`Wrt doingthis.connectCommand[0].localServerIp [${ globalIp }]`)
            res.render( 'home/Wrt', { title: 'Wrt', localIP: Tool.getLocalInterface (), globalIP: globalIp })
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
					return saveServerStartup ( this.config.localIpAddress[0] )
				})
			}
		})
		
	}

	private catchUnSerialCmd ( cmd: QTGateAPIRequestCommand ) {
		switch ( cmd.command ) {
			//		
			case 'containerStop': {
				
				return this.stopGetwayConnect ( this.socketServer, false, cmd.region )
			}

			default: {
				if ( this.cmdResponse && typeof this.cmdResponse === 'function' ) {
					return this.cmdResponse ( cmd )
				}
				saveLog (`catchUnSerialCmd unknow command: [${ cmd.command }]`)

			}
		}

	}

}

