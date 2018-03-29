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
import * as Http from 'http'
import ImapConnect from './ImapConnect'
import RendererProcess from './RendererProcess'
import * as Async from 'async'
import * as openpgp from 'openpgp'
import * as Fs from 'fs'
import * as Path from 'path'
import * as freePort from 'portastic'
import * as Util from 'util'
import * as Net from 'net'
import * as Crypto from 'crypto'
import * as Express from 'express'
import * as cookieParser from 'cookie-parser'
import * as socketIo from 'socket.io'
import * as Uuid from 'node-uuid'
import * as Encrypto from './encrypt'
import * as Nodemailer from 'nodemailer'
import * as Imap from './imap'
import * as Os from 'os'
import * as SaveLog from './saveLog'

const { remote, screen, desktopCapturer } = require ( 'electron' )
const QTGateFolder = Path.join ( Os.homedir(), '.QTGate' )
const configPath = Path.join ( QTGateFolder, 'config.json' )
const feedbackFilePath = Path.join ( QTGateFolder,'.feedBack.json')
const imapDataFileName = Path.join ( QTGateFolder, 'imapData.pem' )
const sendMailAttach = Path.join ( QTGateFolder, 'sendmail')
const QTGateTemp = Path.join ( QTGateFolder, 'tempfile' )
const availableImapServer = /imap\-mail\.outlook\.com$|imap\.mail\.yahoo\.(com|co\.jp|co\.uk|au)$|imap\.mail\.me\.com$|imap\.gmail\.com$|gmx\.(com|us|net)$|imap\.zoho\.com$/i

const findPort = ( port: number, CallBack ) => {
    return freePort.test ( port ).then ( isOpen => {
        if ( isOpen )
            return CallBack ( null, port )
        ++ port
        return findPort ( port, CallBack )
    })
}

const saveLog = SaveLog.saveLog

const findQTGateImap = ( imapPool: IinputData_server[] ) => {
	const index = imapPool.findIndex ( n => {
		return availableImapServer.test ( n.imapServer ) && n.imapCheck && n.smtpCheck && n.imapTestResult > 0 
    })
    return index
}

const DEBUG = true

export default class localServer {
    private ex_app = null
    private socketServer: SocketIO.Server = null
    private httpServer: Http.Server = null
	public config: install_config = null
	private newKeyRequest: INewKeyPair = null
	private mainSocket: SocketIO.Socket = null
	public resert = false
	private downloading = false
	public QTClass: ImapConnect = null
	private newRelease: newReleaseData = null
	public savedPasswrod = ''
	public imapDataPool: IinputData_server [] = []
	private CreateKeyPairProcess: RendererProcess = null
	public QTGateConnectImap: number = -1
	private sendRequestToQTGate = false
	public qtGateConnectEmitData: IQtgateConnect = null
	private bufferPassword = null
	private clientIpAddress = null
	private proxyServerWindow = null
	public connectCommand: IConnectCommand[] = []
	public proxyServer: RendererProcess = null
	public doingStopContainer = false
	public regionV1: regionV1[] = null
	public pingChecking = false
	public localProxyPort = 3000

    public saveConfig () {
        return Fs.writeFile ( configPath, JSON.stringify ( this.config ), { encoding: 'utf8' }, err => {
            if ( err ) {
                return saveLog ( `localServer->saveConfig ERROR: ` + err.message )
            }  
        })
	}
	
	public isMultipleQTGateImapData () {
		if ( this.imapDataPool.length < 2 )
			return false
		let count = 0
		this.imapDataPool.forEach ( n => {
			if ( availableImapServer.test (n.imapServer))
				count ++
		})
		if ( count > 1 )
			return true
		return false
	}

	public saveImapData () {
		
		if ( ! this.imapDataPool || !this.imapDataPool.length ) {
			return Fs.unlink ( imapDataFileName, err => {})
		}
		const _data = JSON.stringify ( this.imapDataPool )
		const options = {
			data: _data,
			publicKeys: openpgp.key.readArmored ( this.config.keypair.publicKey ).keys,
			privateKeys: openpgp.key.readArmored ( this.config.keypair.privateKey ).keys
		}
		Async.waterfall ([
			( next: any ) => this.getPbkdf2 ( this.savedPasswrod, next ),
			( data: Buffer, next: any ) => {
				if ( ! options.privateKeys[0].decrypt ( data.toString( 'hex' ))) {
					return next ( new Error ('saveImapData key password error!' ))
				}
				openpgp.encrypt( options ).then ( ciphertext => {
					Fs.writeFile ( imapDataFileName, ciphertext.data, { encoding: 'utf8' }, next )
				}).catch ( err => {
					return next ( err )
				})
			}
		], err => {
			if ( err )
				saveLog ( `saveImapData error: ${ JSON.stringify (err) }` )
		})
	}

	public pgpDecrypt ( text: string, CallBack: ( err?: Error , plaintext?: any ) => void ) {
		if ( ! text || ! text.length ) {
			return CallBack ( new Error ( 'no text' ))
		}

		const options: any = {
			message: null,
			publicKeys: openpgp.key.readArmored ( this.config.keypair.publicKey ).keys,
			privateKey: openpgp.key.readArmored ( this.config.keypair.privateKey ).keys[0]
		}
		Async.waterfall ([
			
			( next: any ) => this.getPbkdf2 ( this.savedPasswrod, next ),
			( data: Buffer, next: any ) => {
				if ( ! options.privateKey.decrypt ( data.toString( 'hex' ))) {
					
					return next ( new Error ('saveImapData key password error!' ))
				}
				this.bufferPassword = data.toString( 'hex' )
				options.message = openpgp.message.readArmored ( text )
				openpgp.decrypt ( options ).then ( plaintext => {
					try {
						data = JSON.parse ( plaintext.data )
					} catch ( e ) {
						return next ( new Error ( 'readImapData try SON.parse ( plaintext.data ) catch ERROR:'+ e.message ))
					}
                    return next ( null, data )
				}).catch ( err => {
					console.log ( `openpgp.decrypt ERROR: `, err )
					next ( err )
				})
			}
		], ( err, data ) => {
			if ( err ) {
				return CallBack ( err )
			}
			
			return CallBack ( null, data )
			
		})
	}

	public pgpEncrypt ( text: string, CallBack: ( err?: Error , plaintext?: any ) => void ) {
		
		if ( ! text || ! text.length ) {
			return CallBack ( new Error ( 'no text' ))
		}
		const options = {
			data: text,
			publicKeys: openpgp.key.readArmored ( this.config.keypair.publicKey ).keys,
			privateKeys: openpgp.key.readArmored ( this.config.keypair.privateKey ).keys
		}

		Async.waterfall ([
			( next: any ) => this.getPbkdf2 ( this.savedPasswrod, next ),
			( data: Buffer, next: any ) => {
				if ( ! options.privateKeys[0].decrypt ( data.toString( 'hex' ))) {
					return next ( new Error ( 'saveImapData key password error!' ))
				}
				openpgp.encrypt( options ).then ( ciphertext => {
					return next ( null, ciphertext.data )
					
				}).catch ( err => {
					return next ( err )
				})
			}
		], ( err, data ) => {
			if ( err ) {
				saveLog ( `saveImapData error: ${ JSON.stringify (err) }` )
				return CallBack ( err )
			}
			return CallBack ( null, data )
				
		})
	}

	private readImapData ( CallBack ) {
		if ( ! this.savedPasswrod || !this.savedPasswrod.length || !this.config || !this.config.keypair || !this.config.keypair.createDate )
			return CallBack ( new Error ('readImapData no password or keypair data error!'))
		
		const options: any = {
			message: null,
			publicKeys: openpgp.key.readArmored ( this.config.keypair.publicKey ).keys,
			privateKey: openpgp.key.readArmored ( this.config.keypair.privateKey ).keys[0]
		}
		return Async.waterfall ([
			( next: any ) => {
				Fs.access ( imapDataFileName, next )
			},
			( next: any ) => this.getPbkdf2 ( this.savedPasswrod, next ),
			( data: Buffer, next: any ) => {
				if ( ! options.privateKey.decrypt ( data.toString( 'hex' ))) {
					return next ( new Error ('saveImapData key password error!' ))
				}
				
				Fs.readFile ( imapDataFileName, 'utf8', next )
			}],( err, data: string ) => {

				if ( err ) {
					saveLog (`readImapData Async.waterfall error: [${ err.message }]`)
					return CallBack ( err )
				}
				let callback = false
				options.message = openpgp.message.readArmored ( data.toString () )
				return openpgp.decrypt ( options ).then ( plaintext => {
				
					const data = JSON.parse ( plaintext.data )
					callback = true
					return CallBack ( null, data )

				}).catch ( err => {
					if ( !callback ) {
						callback = true
						saveLog (`openpgp.decrypt catch error!: [${ err.massage}]`)
						return CallBack (`readImapData openpgp.decrypt catch error: [${ err.message }] `)
					}
				})
			})
		
	}

	private checkPort ( portNum, CallBack  ) {
		const num = parseInt ( portNum.toString())
		if (! /^[0-9]*$/.test(portNum.toString()) || !num || num < 1000 || num > 65535 )
			return CallBack ( true )
		return findPort ( portNum, ( err, kk ) => {
			saveLog( `check port [${ typeof portNum }] got back kk [${ typeof kk }]`)
			if ( kk !== portNum ) {
				return CallBack ( true )
			}
			return CallBack ( false )
		})
	}
	//			After password
	private listenAfterPassword ( socket: SocketIO.Socket ) {

		socket.on ( 'startCheckImap', ( id: string, imapData: IinputData, CallBack: ( ret: number ) => void ) => {
			
			if ( ! id || ! id.length || ! imapData || ! Object.keys ( imapData ).length ) {
				saveLog ( `socket.on startCheckImap but data format is error! id:[${ id }] imapData:[${ Util.inspect ( imapData )}]`)
				return CallBack (1)
			}
			if ( this.imapDataPool.length ) {
				const index = this.imapDataPool.findIndex ( n => { return n.email === imapData.email && n.uuid !== imapData.uuid })
				if ( index > -1 ) {
					return CallBack ( 10 )
				}
			}
			
			CallBack ( null )
			return this.doingCheck ( id, imapData, socket )
		})

		socket.on ( 'deleteImapAccount', uuid => {
			if ( ! uuid && !uuid.length ) {
				return saveLog ( `deleteImapAccount have not uuid!`)
			}
				
			const index = this.imapDataPool.findIndex ( n => { return n.uuid === uuid })
			if ( index < 0 || !this.imapDataPool [ index ].canDoDelete ) {
				return saveLog ( `deleteImapAccount have not uuid! or canDoDelete == false`)
			}
			saveLog ( `delete imap uuid = [${ uuid }]` )
			this.imapDataPool.splice ( index, 1 )
			this.saveImapData ()
			socket.emit ( 'ImapData', this.imapDataPool )
		})

		socket.on ( 'getAvaliableRegion', CallBack => {
			
			if ( !this.QTClass || typeof this.QTClass.request !== 'function') {
				CallBack ( 0 )
				return saveLog (`socket.on ( 'getAvaliableRegion') but !this.QTClass `)
			}
			const com: QTGateAPIRequestCommand = {
				command: 'getAvaliableRegion',
				Args: [],
				error: null,
				requestSerial: Crypto.randomBytes(8).toString('hex')
			}

			console.log (`socket.on ( 'getAvaliableRegion')`)

			return this.QTClass.request ( com, ( err: number, res: QTGateAPIRequestCommand ) => {
				if ( err ) {
					return saveLog ( `getAvaliableRegion QTClass.request callback error! STOP [${ err }]`)
				}
				if ( res && res.dataTransfer && res.dataTransfer.productionPackage ) {
					this.config.freeUser = /free/i.test ( res.dataTransfer.productionPackage )
				}
				saveLog (`getAvaliableRegion got return Args [0] [${ JSON.stringify ( res.Args[0] )}]`)
				CallBack ( res.Args[0], res.dataTransfer, this.config )
				
				//		Have gateway connect!
				this.saveConfig ()
				
				if ( res.Args[ 1 ]) {
					saveLog (`getAvaliableRegion got return Args [1] [${ JSON.stringify ( res.Args[1] )}]`)
					if ( ! this.proxyServer || ! this.connectCommand ) {
						const arg: IConnectCommand[] = this.connectCommand = res.Args[1]
						arg.forEach ( n => {
							n.localServerIp = Encrypto.getLocalInterface ()[0]
						})
						this.makeOpnConnect ( arg )
					}
					return socket.emit ( 'QTGateGatewayConnectRequest', -1, res.Args[ 1 ] )
				}
				saveLog (`getAvaliableRegion got return Args [2] [${ JSON.stringify ( res.Args[2] )}]`)
				this.regionV1 = res.Args[2]
			})
		})

		socket.on ( 'payment', ( payment: iQTGatePayment, CallBack ) => {
			const com: QTGateAPIRequestCommand = {
				command: 'payment',
				Args: [ payment ],
				error: null,
				requestSerial: Crypto.randomBytes(8).toString('hex')
			}
			saveLog( `socket.on payment = [${JSON.stringify ( payment )}] send to QTGate!`)
			
			return this.QTClass.request ( com, ( err: number, res: QTGateAPIRequestCommand ) => {
				saveLog ( `payment got callBack: [${ JSON.stringify ( res )}]`)
				if ( err ) {
					return saveLog (`payment got QTClass.request error!`)
				}
				if ( res.error === -1 ) {
					saveLog ( 'payment success!')
					this.config.freeUser = false
					this.saveConfig ()
				}
				return CallBack ( err, res )
			})
			
		})

		socket.on ( 'cancelPlan', CallBack => {
			const com: QTGateAPIRequestCommand = {
				command: 'cancelPlan',
				error: null,
				Args: [],
				requestSerial: Crypto.randomBytes(8).toString ('hex')
			}
			saveLog( `socket.on cancelPlan send to QTGate!`)
			
			return this.QTClass.request ( com, ( err: number, res: QTGateAPIRequestCommand ) => {
				saveLog ( `cancelPlan got callBack: [${ JSON.stringify ( res )}]`)
				if ( err ) {
					return saveLog (`cancelPlan got QTClass.request  error!`)
				}
				if ( res.error === -1 ) {
					saveLog ( 'cancelPlan success!' )
				}
				return CallBack ( err, res )
			})
		})

		socket.on ( 'cardToken', ( payment: iQTGatePayment, CallBack ) => {
			const com: QTGateAPIRequestCommand = {
				command: 'cardToken',
				error: null,
				Args: [ payment ],
				requestSerial: Crypto.randomBytes(8).toString ('hex')
			}
			saveLog( `socket.on cardToken send to QTGate!`)
			
			return this.QTClass.request ( com, ( err: number, res: QTGateAPIRequestCommand ) => {
				saveLog ( `cardToken got callBack: [${ JSON.stringify ( res )}]`)
				if ( err ) {
					return saveLog ( `cardToken got QTClass.request  error!`)
				}
				if ( res.error === -1 ) {
					saveLog ( 'cancelPlan success!' )
					this.config.freeUser = false
					this.saveConfig ()
				}
				return CallBack ( err, res )
			})
		})

		socket.on ( 'promoCode', ( promoCode, CallBack ) => {
			const com: QTGateAPIRequestCommand = {
				command: 'promoCode',
				error: null,
				Args: [ promoCode ],
				requestSerial: Crypto.randomBytes(8).toString ('hex')
			}
			
			return this.QTClass.request ( com, ( err: number, res: QTGateAPIRequestCommand ) => {
				saveLog ( `promoCode got callBack: [${ JSON.stringify ( res )}]`)
				if ( err ) {
					return saveLog (`promoCode got QTClass.request  error!`)
				}
				if ( res.error === -1 ) {
					saveLog ( 'promoCode success!' )
					this.config.freeUser = false
					this.saveConfig ()
				}
				return CallBack ( err, res )
			})
			
		})

		socket.on ( 'requestActivEmail', CallBack => {
			if ( this.config.keypair.verified )
				return CallBack (0)
			
			const com: QTGateAPIRequestCommand = {
				command: 'requestActivEmail',
				Args: [],
				error: null,
				requestSerial: Crypto.randomBytes(8).toString('hex')
			}
			return this.QTClass.request ( com, ( err: number, res: QTGateAPIRequestCommand ) => {
				if ( err )
					return saveLog (`QTClass.request error!`)
				return CallBack (res.error)
			})
		})

		socket.once ( 'exit', () => {
			remote.app.exit()
		})
		
		socket.on ( 'pingCheck', CallBack => {
			if ( process.platform === 'linux')
				return CallBack ( -1 )
			
			saveLog (`socket.on ( 'pingCheck' )`)
			if ( !this.regionV1 || this.pingChecking ) {
				saveLog (`!this.regionV1 [${ !this.regionV1 }] || this.pingChecking [${ this.pingChecking }]`)
				return CallBack()
			}
				
			this.pingChecking = true
			try {
				const netPing = require ('net-ping')
				const session = netPing.createSession ()
			} catch (ex) {
				console.log (`netPing.createSession err`, ex )
				return CallBack ( -1 )
			}
			Async.eachSeries ( this.regionV1, ( n: regionV1, next ) => {
				
				return Encrypto.testPing ( n.testHostIp, ( err, ping ) => {
					saveLog( `testPing [${ n.regionName }] return ping [${ ping }]`)
					socket.emit ( 'pingCheck', n.regionName, err? 9999: ping )
					return next ()
				})
			}, () => {
				saveLog (`pingCheck success!`)
				this.pingChecking = false
				return CallBack ()
			})
			
		})
		

		socket.once ( 'downloadCheck', CallBack => {
			if ( !this.regionV1 )
				return CallBack()
		})


		socket.on ( 'checkActiveEmailSubmit', ( text: string ) => {
			saveLog(`checkActiveEmailSubmit`)
			if ( ! text || ! text.length || !/^-----BEGIN PGP MESSAGE-----/.test ( text )) {
				socket.emit ( 'checkActiveEmailError', 0 )
				return saveLog ( `checkActiveEmailSubmit, no text.length !` )
			}
			
			if ( ! this.QTClass ) {
				socket.emit ( 'checkActiveEmailError', 2 )
				return saveLog ( `checkActiveEmailSubmit, have no this.QTClass!` )
			}

			if ( text.indexOf ('-----BEGIN PGP MESSAGE----- Version: GnuPG v1 ') > -1 ) {
                text = text.replace (/-----BEGIN PGP MESSAGE----- Version: GnuPG v1 /,'-----BEGIN__PGP__MESSAGE-----\r\nVersion:__GnuPG__v1\r\n\r\n')
                text = text.replace (/-----END PGP MESSAGE-----/, '-----END__PGP__MESSAGE-----')
                text = text.replace (/ /g, '\r\n')
                text = text.replace ( /__/g, ' ')
            }


			this.pgpDecrypt ( text, ( err, data ) => {
				if ( err ) {
					socket.emit ( 'checkActiveEmailError', 1 )
					return saveLog ( `checkActiveEmailSubmit ERROR:[${ err }]` )
				}
				const com: QTGateAPIRequestCommand = {
					command: 'activePassword',
					Args: [data],
					error: null,
					requestSerial: Crypto.randomBytes(8).toString('hex')
				}

				this.QTClass.request ( com, ( err: number, res: QTGateAPIRequestCommand ) => {
					saveLog ( `QTClass.request return res[${ JSON.stringify ( res )}]`)
					if ( err ) {
						return saveLog (`checkActiveEmailSubmit got QTClass.request error!`)
					}
					if ( res.error > -1 ) {
						saveLog ( `socket.emit ( 'checkActiveEmailError', res.error )`)
						return socket.emit ( 'checkActiveEmailError', res.error )
					}
					
					if ( res.Args && res.Args.length ) {
						
						const key = Buffer.from ( res.Args[0],'base64' ).toString()
						this.config.keypair.publicKey = key
						this.config.keypair.verified = Encrypto.getQTGateSign ( key )
						console.log ( key )
						this.saveConfig ()
						
						socket.emit ( 'KeyPairActiveCallBack', this.config.keypair )
						this.qtGateConnectEmitData.qtGateConnecting = 2
						this.qtGateConnectEmitData.error = -1
						return socket.emit ( 'qtGateConnect', this.qtGateConnectEmitData )

					}
				})
				return socket.emit ( 'checkActiveEmailError', null )
			})

		})

		//	
		socket.on ( 'connectQTGate1', uuid => {
			const index = this.imapDataPool.findIndex ( n => { return n.uuid === uuid })
			if ( index < 0 ) {
				return
			}
			if ( this.QTClass ) {
				this.QTClass.Ping ()
			}
			
			const imap = this.imapDataPool [ index ]
			saveLog ( `socket.on ( 'connectQTGate1')  uuid = [${ uuid }]`)
			imap.confirmRisk = true
			this.qtGateConnectEmitData ? this.qtGateConnectEmitData.needSentMail = true : this.qtGateConnectEmitData = { needSentMail: true }
			return this.emitQTGateToClient1 ( socket, uuid )
			
		})

		socket.on ( 'checkPort', ( portNum, CallBack ) => {
			return this.checkPort ( portNum, CallBack )
		})

		socket.on ( 'QTGateGatewayConnectRequest', ( cmd: IConnectCommand, CallBack ) => {

			//		already have proxy
			if ( this.proxyServer ) {
				return
			}
			cmd.imapData.randomPassword = Crypto.randomBytes (15).toString('hex')
			cmd.account = this.config.keypair.email.toLocaleLowerCase()
			this.localProxyPort = cmd.localServerPort
			const request = () => {
				const com: QTGateAPIRequestCommand = {
					command: 'connectRequest',
					Args: [ cmd ],
					error: null,
					requestSerial: Crypto.randomBytes(8).toString( 'hex' )
				}
				return this.QTClass.request ( com, ( err: number, res: QTGateAPIRequestCommand ) => {
					//		no error
					if ( err ) {
						return saveLog ( `request error`)
					}
					if ( res.error < 0 ) {
						const arg: IConnectCommand[] = this.connectCommand = res.Args
						arg.forEach ( n => {
							n.localServerIp = Encrypto.getLocalInterface ()[0]
						})
						
						this.makeOpnConnect ( arg )
					}

					CallBack ( res.error, res.Args )
					saveLog ( `res.error [${ res.error }]`)
				})
			}

			if ( cmd.connectType === 2 ) {
				return Encrypto.myIpServer (( err, data ) => {
					saveLog ( `getMyLocalIpAddress callback err [${ JSON.stringify ( err ) }] data [${ JSON.stringify ( data )}]`)
					cmd.imapData.clientIpAddress = data
					saveLog ( JSON.stringify ( cmd ))
					return request ()
				})
				
			}
			return request ()
			

		})

		socket.on ( 'disconnectClick', () => {
			
			this.stopGetwayConnect ()
			
		})
	}

	public requestHaveNotResponseError () {
		this.qtGateConnectEmitData.qtGateConnecting = 11
		this.socketServer.emit ( 'qtGateConnect', this.qtGateConnectEmitData )
	}

	public makeOpnConnect ( arg: IConnectCommand[] ) {
		saveLog (`makeOpnConnect arg = ${ JSON.stringify (arg)}`)
		this.connectCommand = arg
		const runCom = arg[0].connectType === 1 ? '@Opn' : 'iOpn'
		return this.proxyServer = new RendererProcess ( runCom, arg, DEBUG, () => {
			saveLog ( `proxyServerWindow on exit!`)
			this.proxyServer = null
			this.connectCommand = null
			this.socketServer.emit ( 'disconnectClickCallBack' )
		})
	}

	public disConnectGateway () {
		if ( this.proxyServer && this.proxyServer.cancel )
			this.proxyServer.cancel ()
		else {
			this.socketServer.emit ( 'disconnectClickCallBack' )
		}
		this.doingStopContainer = false
	}

	private stopGetwayConnect () {
		if ( this.doingStopContainer )
			return

		this.doingStopContainer = true
		const com: QTGateAPIRequestCommand = {
			command: 'stopGetwayConnect',
			Args: null,
			error: null,
			requestSerial: null
		}
		return this.QTClass.request ( com, null )
	}

	private addInImapData ( imapData: IinputData ) {
		const index = this.imapDataPool.findIndex ( n => { return n.uuid === imapData.uuid })
		if ( index === -1 ) {
			const data: IinputData_server = {
				email: imapData.email,
				imapServer: imapData.imapServer,
				imapPortNumber: imapData.imapPortNumber,
				imapSsl: imapData.imapSsl,
				imapUserName: imapData.imapUserName,
				imapUserPassword: imapData.imapUserPassword,
				imapIgnoreCertificate: imapData.imapIgnoreCertificate,
				smtpPortNumber: imapData.smtpPortNumber,
				smtpServer: imapData.smtpServer,
				smtpSsl: imapData.smtpSsl,
				smtpUserName: imapData.smtpUserName,
				smtpUserPassword: imapData.smtpUserPassword,
				smtpIgnoreCertificate: imapData.smtpIgnoreCertificate,
				imapTestResult: null,
				account: imapData.account,
				imapCheck: imapData.imapCheck,
				smtpCheck: imapData.smtpCheck,
				sendToQTGate: imapData.sendToQTGate,
				serverFolder: null,
				
				clientFolder: null,
				connectEmail: null,
				validated: null,
				language: imapData.language,
				timeZoneOffset: imapData.timeZoneOffset,
				randomPassword: null,
				uuid: imapData.uuid,
				canDoDelete: imapData.canDoDelete,
				clientIpAddress: null,
				ciphers: imapData.ciphers,
				confirmRisk: imapData.confirmRisk
			}
			this.imapDataPool.unshift ( data )
			return 0
		}
		const data = this.imapDataPool [ index ]
		// - 
			data.email = imapData.email
			data.imapServer = imapData.imapServer
			data.imapPortNumber = imapData.imapPortNumber
			data.imapSsl = imapData.imapSsl
			data.imapUserName = imapData.imapUserName
			data.imapUserPassword = imapData.imapUserPassword
			data.imapIgnoreCertificate = imapData.imapIgnoreCertificate
			data.smtpPortNumber = imapData.smtpPortNumber
			data.smtpServer = imapData.smtpServer
			data.smtpSsl = imapData.smtpSsl
			data.smtpUserName = imapData.smtpUserName
			data.smtpUserPassword = imapData.smtpUserPassword
			data.ciphers = imapData.ciphers
			data.smtpIgnoreCertificate = imapData.smtpIgnoreCertificate

		// -
		return index
	}

	private sendFeedBack ( CallBack ) {
		if ( !this.QTClass )
			return
		Encrypto.makeFeedbackData (( data, _callback ) => {
			this.QTClass.request ( data, _callback )
		}, CallBack )
	}

	public checkPassword ( password: string ) {
		if ( ! password || password.length < 5 || !this.config.keypair || !this.config.keypair.createDate ) {
			saveLog ( 'server.js socket on checkPemPassword passwrod or keypair error!' + 
			`[${! password }][${ password.length < 5 }][${ ! this.config.keypair.publicKey }][${ !this.config.keypair.publicKey.length }][${ !this.config.keypair.privateKey }][${!this.config.keypair.privateKey.length}]` )
			return false
		}
		if ( this.savedPasswrod && this.savedPasswrod.length ) {
					
			if ( this.savedPasswrod !== password ) {
				return false
			}
				
			return true
		}
		
		return null
	}

	private takeScreen ( CallBack ) {
		
		desktopCapturer.getSources ({ types: [ 'window', 'screen' ], thumbnailSize: screen.getPrimaryDisplay().workAreaSize	}, ( error, sources ) => {
			if ( error ) throw error
			const debug = true
			sources.forEach ( n => {

				if ( /Entire screen/i.test ( n.name )) {
					const screenshotFileName = Crypto.randomBytes(10).toString('hex') + '.png'
					const screenshotSavePath = Path.join ( QTGateTemp, screenshotFileName )
					Fs.writeFile ( screenshotSavePath, n.thumbnail.toPng(), error => {
						if ( error ) {
							console.log ( error )
							return CallBack ( error )
						}
						const ret = {
							screenshotUrl: '/tempfile/' + screenshotFileName,
							screenshotSavePath: screenshotSavePath

						}
						CallBack ( null, screenshotFileName )
						
					})
				}
			})
			
		})
		
	}

	//- socket server 
		private socketConnectListen ( socket: SocketIO.Socket ) {

			socket.on ( 'init', ( Callback ) => {
				const ret = Encrypto.emitConfig ( this.config, false )
				Callback ( null, ret )
			})

			socket.on ( 'takeScreen', CallBack => {
				return this.takeScreen(( err, imagName: string ) => {
					if ( err )
						return CallBack ( err )
					const ret = {
						screenshotUrl: '/tempfile/' + imagName,
						screenshotSavePath: Path.join ( QTGateTemp, imagName )
					}
					return CallBack ( null, ret )
				})
			})

			socket.on ( 'agree', ( callback ) => {
				this.config.firstRun = false
				this.config.alreadyInit = true
				this.saveConfig ()
				return callback ()
			})

			socket.on ( 'NewKeyPair', ( preData: INewKeyPair ) => {

				//		already have key pair
				if ( this.config.keypair.createDate ) {
					return socket.emit ( 'newKeyPairCallBack', this.config.keypair )
				}
				this.savedPasswrod = preData.password
				this.listenAfterPassword ( socket )
				return this.getPbkdf2 ( this.savedPasswrod, ( err, Pbkdf2Password: Buffer ) => {

					preData.password = Pbkdf2Password.toString ( 'hex' )
					return this.CreateKeyPairProcess = new RendererProcess ( 'newKeyPair', preData, false, retData => {
						this.CreateKeyPairProcess = null
						if ( !retData ) {
							 saveLog ( `CreateKeyPairProcess ON FINISHED! HAVE NO newKeyPair DATA BACK!`)
							return this.socketServer.emit ( 'newKeyPairCallBack', null )
						}
							
						saveLog ( `RendererProcess finished [${ retData }]` )
						return Encrypto.getKeyPairInfo ( retData.publicKey, retData.privateKey, preData.password, ( err1?: Error, keyPairInfoData?: keypair ) => {
							
							if ( err1 ) {
								saveLog ( 'server.js getKeyPairInfo ERROR: ' + err1.message + '\r\n' + JSON.stringify ( err ))
								return this.socketServer.emit ( 'newKeyPairCallBack', null )
							}
							
							this.config.keypair = keyPairInfoData
							
							this.config.account = keyPairInfoData.email
							this.saveConfig ()
							
							const ret = Encrypto.KeyPairDeleteKeyDetail ( this.config.keypair, true )
							saveLog ( `socketServer.emit newKeyPairCallBack [${ JSON.stringify ( keyPairInfoData)}]`)
							return this.socketServer.emit ( 'newKeyPairCallBack', keyPairInfoData )
		
						})
					})
									
				})
				
			})

			socket.on ( 'deleteKeyPair', () => {
				
				const config = Encrypto.InitConfig ( true, this.version, this.port )
				config.newVerReady = this.config.newVerReady
				config.newVersion = this.config.newVersion
				this.config = config
				this.config.firstRun = false
				this.config.alreadyInit = true
				this.savedPasswrod = ''
				this.imapDataPool= []
				this.saveImapData()

				this.saveConfig ()
				if ( this.QTClass ) {
					this.QTClass.doingDisconnect ()
					this.QTClass = null
				}
				socket.emit ( 'ImapData', [] )
				return socket.emit ( 'deleteKeyPair' )

			})
			
			socket.once ( 'newVersionInstall', ( CallBack: any ) => {
				if ( this.config.newVerReady )
					return _doUpdate ( this.config.newVersion, this.port )
			})
			
			socket.on ( 'checkPemPassword', ( password: string, callBack: any ) => {

				let keyPair: keypair = null
				if ( ! password || password.length < 5 || !this.config.keypair || !this.config.keypair.createDate ) {
					saveLog ( 'server.js socket on checkPemPassword passwrod or keypair error!' + 
					`[${! password }][${ password.length < 5 }][${ ! this.config.keypair.publicKey }][${ !this.config.keypair.publicKey.length }][${ !this.config.keypair.privateKey }][${!this.config.keypair.privateKey.length}]` )
					return callBack ( false )
				}
				
				if ( this.savedPasswrod && this.savedPasswrod.length ) {
					
					if ( this.savedPasswrod !== password )
						return callBack ( false )
					callBack ( true, this.imapDataPool )
					this.listenAfterPassword ( socket )
					if ( this.connectCommand && this.connectCommand.length ) {
						return socket.emit ( 'QTGateGatewayConnectRequest', -1, this.connectCommand )
					}
					//		imapDataPool have QTGateImap doing emitQTGateToClient
					
					if ( this.imapDataPool.length > 0 && findQTGateImap ( this.imapDataPool ) > -1 )
						return this.emitQTGateToClient1 ( socket, null )
					return
					
				}

				return Async.waterfall ([
					( next: any ) => {
						return this.getPbkdf2 ( password, next )
					},
					( data: Buffer, next: any ) => {
						return Encrypto.getKeyPairInfo ( this.config.keypair.publicKey, this.config.keypair.privateKey, data.toString( 'hex' ), next )
					}
				], ( err: Error,  _keyPair: keypair ) => {
					if ( err ) {
						saveLog ( `socket.on checkPemPassword ERROR: ${ JSON.stringify (err)}` )
						return callBack ( err )
					}
					this.config.keypair = keyPair = _keyPair
					if ( ! keyPair.passwordOK )
						return callBack ( keyPair.passwordOK )
					this.listenAfterPassword ( socket )
					
					this.savedPasswrod = password	
					return this.readImapData (( err: Error, data ) => {
						callBack ( keyPair.passwordOK )
						if ( err ) {
							return saveLog ( 'checkPemPassword readImapData got error! ' + err.message )
						}
						this.imapDataPool = data
						socket.emit ( 'ImapData', this.imapDataPool )
						
						//		imapDataPool have QTGateImap doing emitQTGateToClient
						
						if ( this.imapDataPool.length > 0 && findQTGateImap ( this.imapDataPool ) > -1 ) {
                            return this.emitQTGateToClient1 ( socket, this.config.connectedImapDataUuid )
                        }
						
						
					})

					
				})
			})
			
			socket.on ( 'CancelCreateKeyPair', () => {
				if ( this.CreateKeyPairProcess ) {
					saveLog (`socket.on ( 'CancelCreateKeyPair') canceled!`)
					this.CreateKeyPairProcess.cancel()
				}
			})

			socket.on ( 'feedBackSuccess', ( data: feedBackData ) => {

				const saveFeedBack = ( _data: feedBackData[] ) => {
					Async.serial ([
						next => Fs.writeFile ( feedbackFilePath, JSON.stringify( _data ), next ),
						next => this.sendFeedBack ( next )
					], err => {
						if ( err ) {
							return saveLog (`feedBackData saveFeedBack got error [${ err.message ? err.message : ''}]`)
						}
						return saveLog (`feedBackData saveFeedBack success!`)
					})
				}
				
				Fs.access ( feedbackFilePath, err => {
					if ( err ) {
						return saveFeedBack ( [data] )
					}
					const feeds: feedBackData[] = require ( feedbackFilePath )
					feeds.push ( data )
					return saveFeedBack ( feeds )
				})
			})
			
		}
	//--------------------------   check imap setup

	private checkConfig () {

		Fs.access ( configPath, err => {
			
			if ( err ) {
				saveLog (`config file error! err [${ err.message ? err.message : null }] \r\nInitConfig\r\n`)
				remote.getCurrentWindow().createWindow ()
				return this.config = Encrypto.InitConfig ( true, this.version, this.port )
			}
			try {
				const config: install_config = require ( configPath )
				config.salt = Buffer.from ( config.salt.data )
				this.config = config
				
			} catch ( e ) {
				saveLog ( 'localServer->checkConfig: catch ERROR: ' + e.message )
				remote.getCurrentWindow().createWindow ()
				return this.config = Encrypto.InitConfig ( true, this.version, this.port )
			}
            //		update?

            this.config.version = this.version
            this.config.newVerReady = false
            this.config.newVersion = null
			this.config.serverPort = this.port
			this.config.localIpAddress = Encrypto.getLocalInterface ()
            if ( this.config.keypair && this.config.keypair.publicKeyID ) {
                return Async.waterfall ([
                    next => {
                        if ( !this.config.keypair.publicKey )
                            return Encrypto.checkKey ( this.config.keypair.publicKeyID, next )
                        return next ( null, null )
                    },
                    ( data, next ) => {
                        if ( data ) {
                            this.config.keypair.publicKey = data
                        }
                        Encrypto.getKeyPairInfo ( this.config.keypair.publicKey, this.config.keypair.privateKey, null, next )
                        
                    }
                ], ( err, keyPair ) => {
                    
                    if ( err || ! keyPair ) {

                        remote.getCurrentWindow().createWindow ()
                        return saveLog( `checkConfig keyPair Error! [${ JSON.stringify ( err )}]`)
                    }
                    this.config.keypair = keyPair
                    this.saveConfig()
                    return remote.getCurrentWindow().createWindow ()
                })
            }
            
            return remote.getCurrentWindow().createWindow ()
		})
	}

	public getPbkdf2 ( passwrod: string, CallBack: any ) {
		Crypto.pbkdf2 ( passwrod, this.config.salt, this.config.iterations, this.config.keylen, this.config.digest, CallBack )
	}

    constructor ( private version, private port ) {

        this.ex_app = Express ()
        this.ex_app.set ( 'views', Path.join ( __dirname, 'views' ))
        this.ex_app.set ( 'view engine', 'pug' )

        this.ex_app.use ( cookieParser ())
		this.ex_app.use ( Express.static ( QTGateFolder ))
        this.ex_app.use ( Express.static ( Path.join ( __dirname, 'public' )))

        this.ex_app.get ( '/', ( req, res ) => {
            res.render( 'home', { title: 'home' })
		})

		this.ex_app.get ( '/canada150', ( req, res ) => {
            res.render( 'home/canada150', { title: 'home' })
		})

		this.ex_app.get ( '/doingUpdate', ( req, res ) => {
			res.json()
			
			const { ver } = req.query
			saveLog ( `/doingUpdate res.query = [${ ver }]`)
			this.config.newVersion = ver
			this.config.newVerReady = true
			return this.saveConfig ()
		})

		this.ex_app.get ( '/update/mac', ( req, res ) => {
			if ( ! this.config.newVerReady ) {
				return res.status ( 204 ).end()
			}
			const { ver } = req.query
			return res.status ( 200 ).json ({ url: `http://127.0.0.1:${ this.port }/latest/${ ver }/qtgate-${ ver.substr(1) }-mac.zip`, version: `${ ver }`,releaseDate: new Date().toISOString() })
			
		})

		this.ex_app.get ( '/linuxUpdate', ( req, res ) => {
			res.render ( 'home/linuxUpdate', req.query )
		})

		this.ex_app.get ( '/checkUpdate', ( req, res ) => {
			res.render ( 'home/checkUpdate', req.query )
		})

		this.ex_app.get ('/feedBack', ( req, res ) => {
			res.render ( 'home/feedback', { imagFile: req.query })
		})

        this.ex_app.use (( req, res, next ) => {
			saveLog ( 'ex_app.use 404:' + req.url )
            return res.status( 404 ).send ( "Sorry can't find that!" )
		})

		this.httpServer =  Http.createServer ( this.ex_app )
        this.socketServer = socketIo ( this.httpServer )

        this.socketServer.on ( 'connection', socket => {
            this.socketConnectListen ( socket )
        })

        this.httpServer.listen ( port )

		this.checkConfig ()
	}
	
	private _smtpVerify ( imapData: IinputData, CallBack: ( err?: number ) => void ) {
		const option = {
			host:  Net.isIP ( imapData.smtpServer ) ? null : imapData.smtpServer,
			hostname:  Net.isIP ( imapData.smtpServer ) ? imapData.smtpServer : null,
			port: imapData.smtpPortNumber,
			secure: imapData.smtpSsl,
			auth: {
				user: imapData.smtpUserName,
				pass: imapData.smtpUserPassword
			},
			connectionTimeout: ( 1000 * 15 ).toString (),
			tls: {
				rejectUnauthorized: imapData.smtpIgnoreCertificate,
				ciphers: imapData.ciphers
			},
			debug: true
		}
		DEBUG ? saveLog ( JSON.stringify ( option )) : null
		const transporter = Nodemailer.createTransport ( option )
		transporter.verify (( err, success ) => {
			//DEBUG ? saveLog ( `transporter.verify callback [${ JSON.stringify ( err )}] success[${ success }]` ) : null
			if ( err ) {
				const _err = JSON.stringify ( err )
				if ( /Invalid login|AUTH/i.test ( _err ))
					return CallBack ( 8 )
				if ( /certificate/i.test ( _err ))
					return CallBack ( 9 )
				return CallBack ( 10 )
			}

			return CallBack()
		})
	}

	private smtpVerify ( imapData: IinputData, CallBack: ( err?: number, imap?: IinputData ) => void ) {
		saveLog ( `smtpVerify [${ JSON.stringify ( imapData )}]`)
		let testArray: IinputData[] = null
		let _ret = false
		let err1 = 0
		if ( typeof imapData.smtpPortNumber !== 'string' ) {
			testArray = imapData.smtpPortNumber.map ( n => { 
				const ret: IinputData = JSON.parse ( JSON.stringify ( imapData ))
				ret.smtpPortNumber = n
				ret.ciphers = null
				return ret
			})
			
		} else {
			testArray = [ imapData ]
		}
		testArray = testArray.concat ( testArray.map ( n => {
			const ret: IinputData = JSON.parse ( JSON.stringify ( n ))
			ret.ciphers = 'SSLv3'
			ret.smtpSsl = false
			return ret
		}))
		Async.each ( testArray, ( n, next ) => {
			return this._smtpVerify ( n, ( err ) => {

				if ( err > 0 ) {
					saveLog ( `smtpVerify ERROR: err number = [${ err }]`)
					if ( ( ! err1 || err === 8 )) {
						saveLog ( `smtpVerify let err1 = err [${ err }]`)
						err1 = err
					}

					return next ()
				}
				next ()
				if ( ! _ret ) {
					_ret = true
					imapData = n
					saveLog ( `smtpVerify success! imapData = [${ JSON.stringify ( n )}]`)
					return CallBack ( null, n )
				}
				
				
			})
		}, () => {
			if ( ! _ret )
				return CallBack ( 10 )
		})
		
		
	}

	private sendMailToQTGate ( imapData: IinputData, text: string, didTest: boolean, Callback ) {

		if ( typeof imapData.smtpPortNumber !== 'string' ) {
			return this.smtpVerify ( imapData, ( err, newImapData ) => {
				if ( err ) {
					saveLog ( `transporter.sendMail got ERROR! [${ JSON.stringify ( err )}]` )
					imapData.smtpCheck = false
					imapData.sendToQTGate = false
					this.saveImapData()
					this.socketServer.emit ( 'checkActiveEmailError', 9 )
					return Callback ( err )
				}

				imapData = this.imapDataPool [ this.addInImapData ( newImapData )]
				return this.sendMailToQTGate ( imapData, text, true, Callback )
			})
		}

			
		const option = {
			host:  Net.isIP ( imapData.smtpServer ) ? null : imapData.smtpServer,
			hostname:  Net.isIP ( imapData.smtpServer ) ? imapData.smtpServer : null,
			port: imapData.smtpPortNumber,
			secure: imapData.smtpSsl,
			auth: {
				user: imapData.smtpUserName,
				pass: imapData.smtpUserPassword
			},
			connectionTimeout: ( 1000 * 15 ).toString (),
			tls: {
				rejectUnauthorized: imapData.smtpIgnoreCertificate,
				ciphers: imapData.ciphers
			},
			debug: true
		}
		const transporter = Nodemailer.createTransport ( option )
		const mailOptions = {
			from: imapData.email,
			to: 'QTGate@QTGate.com',
			subject:'QTGate',
			attachments: [{
				content: text
			}]
		}
		transporter.sendMail ( mailOptions, ( err: Error, info: any, infoID: any ) => {
			
			if ( err ) {
				if ( !didTest ) {
					saveLog ( `transporter.sendMail got ERROR [ ${ err.message ? err.message : JSON.stringify(err) }] try test SMTP setup!`)
					imapData.smtpPortNumber = ['25','465','587','994','2525']
					return this.sendMailToQTGate ( imapData, text, true, Callback )
				}
				return Callback ( err )
			}
			saveLog ( `transporter.sendMail success!` )
			return Callback ()
		})
	}

	public sendEmailTest ( imapData: IinputData, CallBack ) {

		if ( ! this.savedPasswrod ) {
			const err = 'sendEmailToQTGate ERROR! have not password!'
			saveLog ( err )
			return CallBack ( new Error ( err ))
		}

		Async.parallel ([
			next => Encrypto.readQTGatePublicKey ( next ),
			next => this.getPbkdf2 ( this.savedPasswrod, next )
		], ( err, data: any[] ) => {
			if ( err ) {
				saveLog ( `sendEmailToQTGate readQTGatePublicKey && getPbkdf2 got ERROR [${ Util.inspect( err ) }]`)
				return CallBack ( err )
			}
			
			const qtgateCommand: QTGateCommand = {
				account: this.config.account,
				QTGateVersion: this.config.version,
				imapData: imapData,
				command: 'connect',
				error: null,
				callback: null,
				language: imapData.language,
				publicKey: this.config.keypair.publicKey
			}
			let key = data[0].toString ()
			let password = data[1].toString ( 'hex' )
			if ( !/^-----BEGIN PGP PUBLIC KEY BLOCK-----/.test ( key )) {
				key = data[1].toString ()
				password = data[0].toString ('hex')
			}

			Async.waterfall ([
				( next: any ) => Encrypto.encryptWithKey ( JSON.stringify ( qtgateCommand ), key, this.config.keypair.privateKey, password, next ),
				//( _data: string, next: any ) => { Fs.writeFile ( sendMailAttach, _data, 'utf8', next )},
				( _data, next) => { this.sendMailToQTGate ( imapData, _data, false, next )}
			], ( err1: Error ) => {
				if ( err1 ) {
					saveLog ( `encryptWithKey && sendMailToQTGate got ERROR [${ Util.inspect( err1 ) }]`)
					return CallBack ( err1 )
				}
				imapData.sendToQTGate = true
				this.saveImapData()
				return CallBack ()

			})
		})

	}

	private imapTest ( imapData: IinputData, CallBack: ( err: number, num?: number ) => void ) {
		const testNumber = 1
		const uu = next => {
			Imap.imapAccountTest ( imapData, next )
		}
		const uu1 = Array( testNumber ).fill( uu )
		
		return Async.parallel ( uu1, ( err, num: number[] ) => {
			if ( err ) {
				saveLog (`imapTest error [${ err.message }]`)
				const message = err.message
				if ( message && message.length ) {
					if ( /auth|login|log in|Too many simultaneous|UNAVAILABLE/i.test( message )) {
						return CallBack ( 3 )
					}
						
					if ( /ECONNREFUSED/i.test ( message )) {
						return CallBack ( 4 )
					}

					if (/OVERQUOTA/i.test ( message )) {
						return CallBack ( 13 )
					}
						
					if ( /certificate/i.test ( message )) {
						return CallBack ( 5 )
					}
                        
                    if ( /timeout/i.test ( message )) {
                        return CallBack ( 7 )
					}
					if ( /ENOTFOUND/i.test ( message )) {
						return CallBack ( 6 )
					}
				}
				
				return CallBack ( 4 )
			}
			let time = 0
			num.forEach ( n => {
                time += n
            })
			
			const ret =  Math.round ( time / testNumber )
			return CallBack ( null, ret )

		})
	}

	private tryCleanupMailBox ( imapData: IinputData, CallBack  ) {
		const wImap = new Imap.qtGateImapwrite ( imapData, 'any')
		return wImap.once ( 'ready', () => {
			saveLog ( `tryCleanupMailBox wImap ready!`)
			return wImap.ListAllFolders (( err, folders: string[] ) => {

				if ( err ) {
					
					return saveLog (`tryCleanupMailBox ListAllFolders got error: [${ err.message || 'null message'}]`)
				}
				return Async.eachSeries ( folders, ( n, next ) => {
					const folderName = n.splice (',')[1]
					if ( /INBOX/i.test ( folderName )) {
						return next ()
					}
					return wImap.deleteBox ( folderName,  next )
				}, CallBack )
			})
		})
	}

	private emitQTGateToClient1 ( socket: SocketIO.Socket, _imapUuid: string ) {
		
		saveLog ( `doing emitQTGateToClient! with _imapUuid [${ _imapUuid }]` )
		this.qtGateConnectEmitData = this.qtGateConnectEmitData || {}
		this.qtGateConnectEmitData.haveImapUuid = _imapUuid && _imapUuid.length ? true : false 
		//		already connecting QTGate
		if ( !_imapUuid && this.qtGateConnectEmitData && this.qtGateConnectEmitData.qtGateConnecting && this.QTClass && typeof this.QTClass.checkConnect === 'function') {
			this.qtGateConnectEmitData.qtGateConnecting = 1
			socket.emit ( 'qtGateConnect', this.qtGateConnectEmitData )
			return this.QTClass.checkConnect ( socket )
		}
		
		if ( ! this.qtGateConnectEmitData.haveImapUuid ) {
			const index = findQTGateImap ( this.imapDataPool )
			//		have no QTGateIMAP STOP
			if ( index < 0 ) {
				return
			}
				
			//		show send mail form
			const uuImap = this.imapDataPool [ index ]
			_imapUuid = uuImap.uuid
		}
		
		//		sendMailBack
		if ( this.QTClass && this.QTClass.rImapReady ) {
			return this.QTClass.sendMailBack ()
		}
		
		
		//	sendToQTGate
		//	case 0: conform
		//	case 1: connecting
		//	case 2: connected
		//	case 3: connect error & error = error number
		//	case 4: sent conform & wait return from QTGate
		const index = this.imapDataPool.findIndex ( n => { return n.uuid === _imapUuid })
		
		if ( index < 0 ) {
			return saveLog ( `can't find index = this.imapDataPool.findIndex`)
		}
		const imapData = this.imapDataPool [ this.QTGateConnectImap = index ]
		saveLog ( `QTGateConnectImap [${ this.QTGateConnectImap }] imapData = [${ imapData.imapUserName }]`)

		if ( !imapData.imapCheck || !imapData.smtpCheck || !imapData.imapTestResult ) {
			saveLog (`!imapData.imapCheck || !imapData.smtpCheck || !imapData.imapTestResult `)
			this.qtGateConnectEmitData = {
				isKeypairQtgateConform: this.config.keypair.verified,
				qtgateConnectImapAccount:imapData.uuid,
				qtGateConnecting: 3,
				error: null
			}
			socket.emit ( 'qtGateConnect', this.qtGateConnectEmitData )
			return saveLog ( `emitQTGateToClient STOP with !imapData.imapCheck || !imapData.smtpCheck || !imapData.imapTestResult`)
		}

		saveLog ( `after === !imapData.imapCheck || !imapData.smtpCheck || !imapData.imapTestResult `)
		if ( ! imapData.serverFolder ) {
			imapData.serverFolder = Uuid.v4 ()
			imapData.clientFolder = Uuid.v4 ()
			imapData.randomPassword = Uuid.v4 ()
			this.qtGateConnectEmitData.needSentMail = true
		}
		
		this.qtGateConnectEmitData.qtgateConnectImapAccount = imapData.uuid
		this.qtGateConnectEmitData.qtGateConnecting = this.qtGateConnectEmitData.needSentMail ? 0 : 1
		this.qtGateConnectEmitData.isKeypairQtgateConform = this.config.keypair.verified
		this.qtGateConnectEmitData.error = null
		if ( !imapData.confirmRisk ) {
			saveLog (`imapData.confirmRisk false stop connect!`)
			this.qtGateConnectEmitData.qtGateConnecting = 0
			return socket.emit ( 'qtGateConnect', this.qtGateConnectEmitData )
		}
			
		const doConnect = ( sendMailIftimeOut ) => {
			if ( ! this.imapDataPool.length )
				return
			saveLog ( `doConnect with imapData [${ imapData.email }]`)
			/*
			return this.tryCleanupMailBox ( imapData, err => {
				if ( err ) {
					return saveLog ( `tryCleanupMailBox return error [${ err.message || 'no message '}]`)
				}
				return saveLog (`tryCleanupMailBox success!`)
			})
			*/
			this.QTClass = new ImapConnect ( imapData, this.qtGateConnectEmitData, sendMailIftimeOut, this, this.savedPasswrod, ( err?: number ) => {
				console.trace (`ImapConnect exit with [${ err }]`)
				if ( err !== null ) {
					//		have connect error
					if ( err > 0 ) {
						if ( err === 11 ) {
							if ( this.QTClass ) {
								this.QTClass.removeAllListeners()
								this.QTClass = null
							}
							return saveLog (`ImapConnect exit with waiting send mail`)
						}
						saveLog ( `ImapConnect exit err > 0 【${ err }】`)
						this.qtGateConnectEmitData.qtGateConnecting = 3
						this.qtGateConnectEmitData.error = err
						if ( this.QTClass ) {
							this.QTClass.removeAllListeners()
							this.QTClass = null
						}
						imapData.imapCheck = imapData.smtpCheck = false
						imapData.imapTestResult = null
						this.saveImapData ()
						socket.emit ( 'qtGateConnect', this.qtGateConnectEmitData )
						return this.qtGateConnectEmitData = null
					}
					// QTGate disconnected resend connect request
					
					this.saveImapData()
				}

				if ( this.QTClass ) {
					this.QTClass.removeAllListeners()
					this.QTClass = null
				}
				saveLog ( `Off line ! emit [qtGateConnect] qtGateConnecting = 11`)
				this.qtGateConnectEmitData.qtGateConnecting = 11
				return socket.emit ( 'qtGateConnect', this.qtGateConnectEmitData )
			}, socket )
			
		}
		
		return doConnect ( !this.qtGateConnectEmitData.needSentMail )
	}

	private doingCheck ( id: string, _imapData: IinputData, socket: SocketIO.Socket ) {
		saveLog ( `doingCheck id = [${ id }] UUID [${ _imapData.uuid }]`)
		let imapData = this.imapDataPool [ this.addInImapData ( _imapData )]
		imapData.imapCheck = imapData.smtpCheck = false
		imapData.imapTestResult = 0

		this.saveImapData ()
		if ( availableImapServer.test ( imapData.imapServer ))
			return this.imapTest ( imapData, ( err?: number, code?: number ) => {
				saveLog ( `imapTest finished! [${ id }]`)
				socket.emit ( id + '-imap', err ? err : null, code )
				imapData.imapTestResult = code
				imapData.imapCheck = code > 0
				this.saveImapData ()
				if ( err )
					return
				this.smtpVerify ( imapData, ( err1: number, newImapData ) => {
					socket.emit ( id + '-smtp', err1 ? err1: null )
					imapData.smtpCheck = ! err1
					this.saveImapData ()
					
					if ( err1 )
						return
					imapData = this.imapDataPool [ this.addInImapData ( newImapData )]
					saveLog ( `smtpVerify finished! [${ JSON.stringify ( imapData )}]`)
					this.saveImapData ()
					
					if ( ! this.QTClass || this.imapDataPool.length < 2 ) {
						this.qtGateConnectEmitData ? this.qtGateConnectEmitData.needSentMail = true : this.qtGateConnectEmitData = { needSentMail: true }
						return this.emitQTGateToClient1 ( socket, _imapData.uuid )
					}
					
					
				})
				
			})
		return Imap.imapBasicTest ( imapData, ( err, data ) => {
			if ( err ) {
				saveLog (`imapTest error [${ err.message }]`)
				const message = err.message
				if ( message && message.length ) {
					if ( /Auth|Lookup failed|Invalid|Login|username/i.test( message )) {
						return socket.emit ( id + '-imap', 3 )
					}
						
					if ( /ECONNREFUSED/i.test ( message )) {
						return socket.emit ( id + '-imap', 4 )
					}
						
					if ( /certificate/i.test ( message )) {
						return socket.emit ( id + '-imap', 5 )
					}
                        
                    if ( /timeout/i.test ( message )) {
                        return socket.emit ( id + '-imap', 7 )
					}

					if (/OVERQUOTA/i.test ( message )) {
						return socket.emit ( id + '-imap', 13 )
					}

					if ( /ENOTFOUND/i.test ( message )) {
						return socket.emit ( id + '-imap', 6 )
					}
				}
				
				return socket.emit ( id + '-imap', 4 )
			}
			socket.emit ( id + '-imap', null, 100 )
			socket.emit ( id + '-smtp', null )
		})
	}

	public shutdown () {
		this.saveConfig ()
		this.saveImapData()
		this.httpServer.close ()
	}
	
}


const _doUpdate = ( tag: string, port: number  ) => {
	saveLog ( `_doUpdate tag = [${ tag }]` )
	remote.getCurrentWindow()._doUpdate ( tag, port )
}