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

import * as http from 'http'
import * as socketIo from 'socket.io'
import * as Path from 'path'
import * as Os from 'os'
import * as Http from 'http'
import * as Fs from 'fs'
import { URL } from 'url'
import * as Async from 'async'
import * as Util from 'util'
import * as Https from 'https'
import * as Crypto1 from 'crypto'
import * as Net from 'net'
import * as Imap from './imap'
import * as freePort from 'portastic'
import * as prosyServer from './proxyServer'
import * as Stream from 'stream'
import { start } from 'repl'
import { imapAccountTest } from './imap'
//import * as Ping from 'net-ping'

import { Buffer } from 'buffer'
import { setTimeout, clearTimeout } from 'timers';

const openpgp = require ( 'openpgp' )
const Express = require ( 'express' )
const cookieParser = require ( 'cookie-parser' )
const Uuid: uuid.UUID = require ( 'node-uuid' )
const { remote, screen, desktopCapturer } = require ( 'electron' )
const Nodemailer = require ('nodemailer')

const QTGateFolder = Path.join ( Os.homedir(), '.QTGate' )
const QTGateSignKeyID = /3acbe3cbd3c1caa9/i
const configPath = Path.join ( QTGateFolder, 'config.json' )
const ErrorLogFile = Path.join ( QTGateFolder, 'systemError.log' )
const feedbackFilePath = Path.join ( QTGateFolder,'.feedBack.json')
const imapDataFileName = Path.join ( QTGateFolder, 'imapData.pem' )
const sendMailAttach = Path.join ( QTGateFolder, 'sendmail')
const QTGateTemp = Path.join ( QTGateFolder, 'tempfile' )
const myIpServerUrl = [ 'https://ipinfo.io/ip', 'https://icanhazip.com/', 'https://diagnostic.opendns.com/myip', 'http://ipecho.net/plain', 'https://www.trackip.net/ip' ]
const keyServer = 'https://pgp.mit.edu'
const QTGatePongReplyTime = 1000 * 30
const testPingTimes = 5
const availableImapServer = /imap\-mail\.outlook\.com$|imap\.mail\.yahoo\.(com|co\.jp|co\.uk|au)$|imap\.mail\.me\.com$|imap\.gmail\.com$|gmx\.(com|us|net)$|imap\.zoho\.com$/i


let mainWindow = null

const createWindow = () => {
	remote.getCurrentWindow().createWindow ()
}

const _doUpdate = ( tag: string  ) => {
	saveLog ( `_doUpdate tag = [${ tag }]` )
	remote.getCurrentWindow()._doUpdate ( tag, port )
}

let flag = 'w'

const saveLog = ( log: string ) => {
	const data = `${ new Date().toUTCString () }: ${ log }\r\n`
	Fs.appendFile ( ErrorLogFile, data, { flag: flag }, err => {
		flag = 'a'
	})
}

export const getLocalInterface = () => {
	const ifaces = Os.networkInterfaces()

	const ret = []
	Object.keys ( ifaces ).forEach ( n => {
		let alias = 0
		ifaces[n].forEach ( iface => {
			
			if ('IPv4' !== iface.family || iface.internal !== false ) {
				// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
				return
			}
			ret.push ( iface.address )
			alias ++
			
		})
	})
	return ret
}

const findPort = ( port: number, CallBack ) => {
    return freePort.test ( port ).then ( isOpen => {
        if ( isOpen )
            return CallBack ( null, port )
        ++ port
        return findPort ( port, CallBack )
    })
}

const doUrlWithIp = ( url: string, dns: string, CallBack ) => {
	let ret = ''

	const option: Http.RequestOptions = {
		host: dns,
		path: url,

	}
	const res = res => {
		res.on ( 'data', ( data: Buffer) => {
			ret += data.toString('utf8')
		})
		res.once ( 'end', () => {
			return CallBack ( null, ret )
		})
	}
	if ( /^https/i.test( option.protocol ))
		return Https.request ( option, res )
		.once ( 'error', CallBack )
	return Http.request ( option, res )
		.once ( 'error',  CallBack )
}

const doUrl = ( url: string, CallBack) => {
	let ret = ''
	const res = res => {
		res.on( 'data', (data: Buffer) => {
			ret += data.toString('utf8')
		})
		res.once ( 'end', () => {
			return CallBack( null, ret )
		})
	}
	if ( /^https/.test( url ))
		return Https.get ( url, res )
			.once ( 'error', err => {
				console.log( 'on err ', err  )
				return CallBack ( err )
			})
	return Http.get ( url, res )
		.once ( 'error', err => {
		console.log( 'on err ', err  )
		return CallBack ( err )
	})
}

const myIpServer = ( CallBack ) => {
	let ret = false
	Async.each ( myIpServerUrl, ( n, next ) => {
		doUrl( n, ( err, data ) => {
			if ( err || !Net.isIPv4 ( data )) {
				return next ()
			}
			if ( !ret ) {
				ret = true
				return CallBack ( null, data )
			}
		})
	}, () => {
		if ( !ret )
			return CallBack ( new Error (''))
	})
}

const getQTGateSign = ( _key ) => {
    const key = openpgp.key.readArmored (_key).keys
    if (! key || ! key.length )
        return false
    const user = key[0].users
    if (! user || ! user.length ||  ! user[0].otherCertifications || ! user[0].otherCertifications.length ) {
        return false
    }
	const signID = user[0].otherCertifications[0].issuerKeyId.toHex()

    return QTGateSignKeyID.test ( signID )
}

const KeyPairDeleteKeyDetail = ( keyPair: keypair, passwordOK: boolean ) => {
	const ret: keypair = {
		nikeName: keyPair.nikeName,
		email: keyPair.email,
		keyLength: keyPair.keyLength,
		createDate: keyPair.createDate,
		passwordOK: passwordOK,
		verified: keyPair.verified,
		publicKeyID: keyPair.publicKeyID
	}
	return ret
}

const emitConfig = ( config: install_config, passwordOK: boolean ) => {
	const ret: install_config = {
		keypair: KeyPairDeleteKeyDetail ( config.keypair, passwordOK ),
		firstRun: config.firstRun,
		alreadyInit: config.alreadyInit,
		newVerReady: config.newVerReady,
		version: config.version,
		multiLogin: config.multiLogin,
		freeUser: config.freeUser,
		account: config.keypair.email,
		serverGlobalIpAddress: config.serverGlobalIpAddress,
		serverPort: config.serverPort,
		connectedQTGateServer: config.connectedQTGateServer,
		localIpAddress: getLocalInterface(),
		lastConnectType: config.lastConnectType,
		iterations: config.iterations,
		connectedImapDataUuid: config.connectedImapDataUuid
	}
	return ret
}

const getBitLength = ( key: any ) => {
    let size = 0;
    if ( key.primaryKey.mpi.length ) {
        size = ( key.primaryKey.mpi [0].byteLength () * 8 )
    }
    return size.toString ()
}

const InitKeyPair = () => {
	const keyPair: keypair = {
		publicKey: null,
		privateKey: null,
		keyLength: null,
		nikeName: null,
		createDate: null,
		email: null,
		passwordOK: false,
		verified: false,
		publicKeyID: null
		
	}
	return keyPair
}

const getKeyFingerprint = ( key: any ) => {
	return key.primaryKey.fingerprint.toUpperCase()
}

const getKeyId = ( key: any ) => {
	const id = getKeyFingerprint ( key )
	return id.substr ( id.length - 8 )
}

const getKeyUserInfo = ( UserID: string, keypair: keypair ) => {
	if ( UserID && UserID.length ) {

		const temp = UserID.split ( ' <' )
        const temp1 = temp[0].split ( ' (' )
        const temp2 = temp1.length > 1 
            ? temp1[1].split ( '||' )
            : ''
        keypair.email = temp.length > 1
            ? temp [1].slice ( 0, temp [1].length - 1 )
            : ''
        keypair.nikeName = temp1 [0]
	}
}

const getKeyPairInfo = ( publicKey: string, privateKey: string, password: string, CallBack: ( err1?: Error, data?: keypair ) => void ) => {
	
	const _privateKey = openpgp.key.readArmored ( privateKey )
	const _publicKey = openpgp.key.readArmored ( publicKey )

	if ( _privateKey.err || _publicKey.err ) {
		return CallBack ( new Error ( 'key pair error' ))
	}
	
	const privateKey1: any = _privateKey.keys[0]
	const publicKey1 = _publicKey.keys

	const ret: keypair = {
			publicKey: publicKey,
			privateKey: privateKey,
			keyLength: getBitLength ( privateKey1 ),
			nikeName: '',
			createDate: new Date ( privateKey1.primaryKey.created ).toLocaleString (),
			email: '',
			passwordOK: false,
			verified: getQTGateSign ( publicKey ),
			publicKeyID: getKeyId ( publicKey1[0] )
	}

	const user = privateKey1.users

	if ( user && user.length ) {
		getKeyUserInfo ( user[0].userId.userid, ret )
	}

	if ( ! password || ! privateKey1.decrypt ( password ))
		return CallBack ( null, ret )
	ret.passwordOK = true
	return CallBack ( null, ret )
}

const InitConfig = ( first: boolean, version, port ) => {

	const ret: install_config = {
		firstRun: first,
		alreadyInit: false,
		multiLogin: false,
		version: version,
		newVersion: null,
		newVerReady: false,
		keypair: InitKeyPair (),
		salt: Crypto1.randomBytes ( 64 ),
		iterations: 2000 + Math.round ( Math.random () * 2000 ),
		keylen: Math.round ( 16 + Math.random() * 30 ),
		digest: 'sha512',
		freeUser: true,
		account: null,
		serverGlobalIpAddress: null,
		serverPort: port,
		connectedQTGateServer: false,
		localIpAddress: getLocalInterface (),
		lastConnectType: 1,
		connectedImapDataUuid: null
	}
	return ret
}

const checkKey = ( keyID: string, CallBack ) => {
	const hkp = new openpgp.HKP( keyServer )
	const options = {
		query: keyID
	}
	
	hkp.lookup ( options ).then ( key => {
		if ( key ) {
			return CallBack ( null, key )
		}
		return CallBack ( null, null )
	}).catch ( err => {
		CallBack ( err )
	})
}

const readQTGatePublicKey = ( CallBack ) => {
	const fileName = Path.join ( __dirname, 'info@QTGate.com.pem' )
	Fs.readFile ( fileName, 'utf8', CallBack )
}

const deCryptoWithKey = ( data: string, publicKey: string, privateKey: string, password: string, CallBack ) => {

	const options: any = {
		message: openpgp.message.readArmored ( data ),
		publicKeys: openpgp.key.readArmored ( publicKey ).keys,
		privateKey: openpgp.key.readArmored ( privateKey ).keys[0]
	}
	if ( ! options.privateKey.decrypt ( password )) {
		return CallBack ( new Error ('saveImapData key password error!' ))
	}
	openpgp.decrypt ( options ).then ( plaintext => {
		return CallBack ( null, plaintext.data )

	}).catch ( err => {
		return CallBack ( err )
	})
}

const encryptWithKey = ( data: string, targetKey: string, privateKey: string, password: string, CallBack ) => {
	if (!data || !data.length || !targetKey || !targetKey.length || !privateKey || !privateKey.length ) {
		return CallBack ( new Error ('unknow format!'))
	}
	const publicKeys = openpgp.key.readArmored ( targetKey ).keys
	const privateKeys = openpgp.key.readArmored ( privateKey ).keys[0]

	if ( ! privateKeys.decrypt ( password ))
		return CallBack ( new Error ('private key password!'))
	
	const option= {
		data: data,
		publicKeys: publicKeys,
		privateKeys: privateKeys
	}

	openpgp.encrypt ( option ).then ( m  => {
		CallBack ( null, m.data )
	}).catch ( err => {
		CallBack ( err )
	})
}

class emailStream extends Stream.Readable {
	private source = Buffer.from ( this.data ).toString ( 'base64' )
	constructor ( private data: string ) {
		super ()
	}

	public _read ( size )  {
		this.push ( this.source )
		this.push ( null )
	}
}

class RendererProcess {
	private win = null
	constructor ( name: string, data: any, debug: boolean, CallBack ) {
		this.win = new remote.BrowserWindow ({ show: debug  })
		this.win.setIgnoreMouseEvents ( !debug )
		if ( debug ) {
			this.win.webContents.openDevTools()
			this.win.maximize ()
		} 
		
		this.win.once ( 'first', () => {
			this.win.once ( 'firstCallBackFinished', returnData => {
				this.win.close ()
				this.win = null
				CallBack ( returnData )
				return CallBack = null
			})
			this.win.emit ( 'firstCallBack', data )
		})

		this.win.once ( 'closed', () => {
			if ( CallBack && typeof CallBack === 'function' ) {
				CallBack ()
				return CallBack = null
			}
		})
		this.win.loadURL (`file://${ Path.join ( __dirname, name +'.html')}`)
	}
	public cancel ( ) {
		if ( this.win && typeof this.win.destroy ==='function' ) {
			return this.win.destroy()
		}
	}

	public sendCommand ( command: string, data: any ) {
		return this.win.emit ( command, data )
	}
}

export class localServer {
    private ex_app = null
    private socketServer: SocketIO.Server = null
    private httpServer: Http.Server = null
	public config: install_config = null
	private newKeyRequest: INewKeyPair = null
	private mainSocket: SocketIO.Socket = null
	public resert = false
	private downloading = false
	private QTClass: ImapConnect = null
	private newRelease: newReleaseData = null
	private savedPasswrod = ''
	public imapDataPool: IinputData_server [] = []
	private CreateKeyPairProcess: RendererProcess = null
	private QTGateConnectImap: number = -1
	private sendRequestToQTGate = false
	public qtGateConnectEmitData: IQtgateConnect = null
	private bufferPassword = null
	private clientIpAddress = null
	private proxyServerWindow = null
	public connectCommand: IConnectCommand = null
	public proxyServer: RendererProcess = null
	public doingStopContainer = false
	public regionV1: regionV1[] = null
	public pingChecking = false

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

	public saveConfig () {
		Fs.writeFile ( configPath, JSON.stringify ( this.config ) , { encoding: 'utf8' }, err => {
			if ( err )
				return saveLog ( `localServer->saveConfig ERROR: ` + err.message )
		})
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
						const data = JSON.parse ( plaintext.data )
						return next ( null, data )
					} catch ( e ) {
						
						return next ( new Error ( 'readImapData try SON.parse ( plaintext.data ) catch ERROR:'+ e.message ))
					}

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
				requestSerial: Crypto1.randomBytes(8).toString('hex')
			}
			return this.QTClass.request ( com, ( err: number, res: QTGateAPIRequestCommand ) => {
				if ( err ) {
					console.log ( err )
					return saveLog ( 'getAvaliableRegion QTClass.request callback error! STOP')
				}
				if ( res && res.dataTransfer && res.dataTransfer.productionPackage ) {
					this.config.freeUser = /free/i.test ( res.dataTransfer.productionPackage )
				}
					
				CallBack ( res.Args[0], res.dataTransfer, this.config )
				saveLog ( `getAvaliableRegion ${ JSON.stringify ( res )} `)
				
				//		Have gateway connect!
				this.saveConfig ()
				
				if ( res.Args[ 1 ]) {
					const uu: IConnectCommand = res.Args[1]
					if ( ! this.proxyServer || ! this.connectCommand ) {
						this.makeOpnConnect ( uu )
					}
					return socket.emit ( 'QTGateGatewayConnectRequest', this.connectCommand )
				}

				this.regionV1 = res.Args[2]
			})
		})

		socket.on ( 'payment', ( payment: iQTGatePayment, CallBack ) => {
			const com: QTGateAPIRequestCommand = {
				command: 'payment',
				Args: [ payment ],
				error: null,
				requestSerial: Crypto1.randomBytes(8).toString('hex')
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
				requestSerial: Crypto1.randomBytes(8).toString ('hex')
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
				requestSerial: Crypto1.randomBytes(8).toString ('hex')
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
				requestSerial: Crypto1.randomBytes(8).toString ('hex')
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
				requestSerial: Crypto1.randomBytes(8).toString('hex')
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
				
				return testPing ( n.testHostIp, ( err, ping ) => {
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
					requestSerial: Crypto1.randomBytes(8).toString('hex')
				}
				console.log (`QTClass.request!`)
				this.QTClass.request ( com, ( err: number, res: QTGateAPIRequestCommand ) => {
					saveLog (`QTClass.request return res[${ JSON.stringify ( res )}]`)
					if ( err ) {
						return saveLog (`checkActiveEmailSubmit got QTClass.request error!`)
					}
					if ( res.error > -1 ) {
						saveLog (`socket.emit ( 'checkActiveEmailError', res.error )`)
						return socket.emit ( 'checkActiveEmailError', res.error )
					}
					
					if ( res.Args && res.Args.length ) {
						
						const key = Buffer.from ( res.Args[0],'base64').toString()
						this.config.keypair.publicKey = key
						this.config.keypair.verified = getQTGateSign ( key )
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
			if ( index < 0 )
				return
			const imap = this.imapDataPool [ index ]
			saveLog (`socket.on ( 'connectQTGate1')  uuid = [${ uuid }]`)
			imap.confirmRisk = true
			this.qtGateConnectEmitData ? this.qtGateConnectEmitData.needSentMail = true : this.qtGateConnectEmitData = { needSentMail: true }
			return this.emitQTGateToClient ( socket, uuid )
		})

		socket.on ( 'checkPort', ( portNum, CallBack ) => {
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
		})

		socket.on ( 'QTGateGatewayConnectRequest', ( cmd: IConnectCommand, CallBack ) => {

			//		already have proxy
			if ( this.proxyServer ) {
				return
			}

			cmd.imapData.randomPassword = Crypto1.randomBytes (15).toString('hex')
			cmd.account = this.config.keypair.email.toLocaleLowerCase()

			const request = () => {
				const com: QTGateAPIRequestCommand = {
					command: 'connectRequest',
					Args: [ cmd ],
					error: null,
					requestSerial: Crypto1.randomBytes(8).toString( 'hex' )
				}
				return this.QTClass.request ( com, ( err: number, res: QTGateAPIRequestCommand ) => {
					//		no error
					if ( err ) {
						return saveLog ( `request error`)
					}
					if ( res.error < 0 ) {
						const arg: IConnectCommand = res.Args[0]
						arg.localServerIp = getLocalInterface ()[0]
						saveLog ( `this.proxyServer = new RendererProcess type = [${ arg.connectType }] data = [${ JSON.stringify( arg )}]` )
						this.makeOpnConnect ( arg )
					}

					CallBack ( res )
					saveLog ( `res.error [${ res.error }]`)
				})
			}

			if ( cmd.connectType === 2 ) {
				return myIpServer (( err, data ) => {
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

	public makeOpnConnect ( arg: IConnectCommand ) {
		
		this.connectCommand = arg
		const runCom = arg.connectType === 1 ? '@Opn' : 'iOpn'
		saveLog ( `makeOpnConnect arg [${ JSON.stringify ( arg )}]`)
		console.trace ( arg )
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
		makeFeedbackData (( data, _callback ) => {
			this.QTClass.request ( data, _callback )
		}, CallBack )
	}

	private takeScreen ( CallBack ) {
		
		desktopCapturer.getSources ({ types: [ 'window', 'screen' ], thumbnailSize: screen.getPrimaryDisplay().workAreaSize	}, ( error, sources ) => {
			if ( error ) throw error
			const debug = true
			sources.forEach ( n => {

				if ( /Entire screen/i.test ( n.name )) {
					const screenshotFileName = Crypto1.randomBytes(10).toString('hex') + '.png'
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
				const ret = emitConfig ( this.config, false )
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
						return getKeyPairInfo ( retData.publicKey, retData.privateKey, preData.password, ( err1?: Error, keyPairInfoData?: keypair ) => {
							
							if ( err1 ) {
								saveLog ( 'server.js getKeyPairInfo ERROR: ' + err1.message + '\r\n' + JSON.stringify ( err ))
								return this.socketServer.emit ( 'newKeyPairCallBack', null )
							}
							
							this.config.keypair = keyPairInfoData
							
							this.config.account = keyPairInfoData.email
							this.saveConfig ()
							
							const ret = KeyPairDeleteKeyDetail ( this.config.keypair, true )
							saveLog ( `socketServer.emit newKeyPairCallBack [${ JSON.stringify ( keyPairInfoData)}]`)
							return this.socketServer.emit ( 'newKeyPairCallBack', keyPairInfoData )
		
						})
					})
									
				})
				
			})

			socket.on ( 'deleteKeyPair', () => {
				
				const config = InitConfig ( true, this.version, this.port )
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
					return _doUpdate ( this.config.newVersion )
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
					if ( this.connectCommand && this.httpServer ) {
						return socket.emit ( 'QTGateGatewayConnectRequest', this.connectCommand )
					}
					//		imapDataPool have QTGateImap doing emitQTGateToClient
					if ( this.imapDataPool.length > 0 && findQTGateImap ( this.imapDataPool ) > -1 )
						return this.emitQTGateToClient ( socket, null )
					return
				}

				return Async.waterfall ([
					( next: any ) => {
						return this.getPbkdf2 ( password, next )
					},
					( data: Buffer, next: any ) => {
						return getKeyPairInfo ( this.config.keypair.publicKey, this.config.keypair.privateKey, data.toString( 'hex' ), next )
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
						if ( this.imapDataPool.length > 0 && findQTGateImap ( this.imapDataPool ) > -1 )
							return this.emitQTGateToClient ( socket, this.config.connectedImapDataUuid )
						
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

			/*
			socket.on ( 'checkUpdateBack', ( jsonData: any ) => {
				this.config.newVersionCheckFault = true
				if ( !jsonData ) {
					return saveLog (`socket.on checkUpdateBack but have not jsonData`)
				}
				const { tag_name, assets } = jsonData
				if ( ! tag_name ) {
					return saveLog ( `socket.on checkUpdateBack but have not jsonData`)
				}
				
				this.config.newVersionCheckFault = false
				const ver = jsonData.tag_name
				console.log ( `config.version = [${ this.config.version }] ver = [${ ver }]`)
				if ( ver <= this.config.version || ! assets || assets.length < 7 ) {
					console.log ( `no new version!`)
					return saveLog ( `server.js checkVersion no new version! ver=[${ ver }], newVersion[${ this.config.newVersion }] jsonData.assets[${ jsonData.assets? jsonData.assets.length: null }]` )
				}
				saveLog ( 'server.js checkVersion have new version:' + ver )
				this.config.newVersion = ver
				//process.send ( jsonData )
				process.once ( 'message', message => {
					console.log ( `server on process.once message`, message )
					if ( message ) {
						++this.config.newVersionDownloadFault
						this.saveConfig ()
						return saveLog ( `getDownloadFiles callBack ERROR!`)
					}
					this.config.newVersionDownloadFault = 0
					this.config.newVersionCheckFault = false
					this.config.newVerReady = true
					this.saveConfig ()
				})

			})
			*/
			
		}
	//--------------------------   check imap setup

	
	private checkConfig () {

		Fs.access ( configPath, err => {
			
			if ( err ) {
				saveLog (`config file error! err [${ err.message ? err.message : null }] \r\nInitConfig\r\n`)
				createWindow ()
				return this.config = InitConfig ( true, this.version, this.port )
			}
			try {
				const config: install_config = require ( configPath )
				config.salt = Buffer.from ( config.salt.data )
				this.config = config
				//		update?

				this.config.version = this.version
				this.config.newVerReady = false
				this.config.newVersion = null
				
				this.config.serverPort = this.port
				
				if ( this.config.keypair && this.config.keypair.publicKeyID )
					return Async.waterfall ([
						next => {
							if ( !this.config.keypair.publicKey )
								return checkKey ( this.config.keypair.publicKeyID, next )
							return next ( null, null )
						},
						( data, next ) => {
							if ( data ) {
								this.config.keypair.publicKey = data
							}
							getKeyPairInfo ( this.config.keypair.publicKey, this.config.keypair.privateKey, null, next )
							
						}
					], ( err, keyPair ) => {
						
						if ( err || ! keyPair ) {

							createWindow ()
							return saveLog( `checkConfig keyPair Error! [${ JSON.stringify ( err )}]`)
						}
						this.config.keypair = keyPair
						this.saveConfig()
						return createWindow ( )
					})

					return createWindow ( )
			} catch ( e ) {
				saveLog ( 'localServer->checkConfig: catch ERROR: ' + e.message )
				createWindow ()
				return this.config = InitConfig ( true, this.version, this.port )
			}

		})
	}

	public getPbkdf2 ( passwrod: string, CallBack: any ) {
		Crypto1.pbkdf2 ( passwrod, this.config.salt, this.config.iterations, this.config.keylen, this.config.digest, CallBack )
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
			this._smtpVerify ( n, ( err ) => {

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
			next => readQTGatePublicKey ( next ),
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
				( next: any ) => encryptWithKey ( JSON.stringify ( qtgateCommand ), key, this.config.keypair.privateKey, password, next ),
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
					if ( /Auth|Lookup failed|Invalid|Login|username/i.test( message ))
						return CallBack ( 3 )
					if ( /ECONNREFUSED/i.test ( message ))
						return CallBack ( 4 )
					if ( /certificate/i.test ( message ))
                        return CallBack ( 5 )
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

	private emitQTGateToClient ( socket: SocketIO.Socket, _imapUuid: string ) {
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
						saveLog ( `ImapConnect exit err > 0 `)
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
						return this.emitQTGateToClient ( socket, _imapData.uuid )
					}
						
					
				})
				
			})
		return Imap.imapBasicTest ( imapData, ( err, data ) => {
			if ( err ) {
				saveLog (`imapTest error [${ err.message }]`)
				const message = err.message
				if ( message && message.length ) {
					if ( /Auth|Lookup failed|Invalid|Login|username/i.test( message ))
						return socket.emit ( id + '-imap', 3 )
					if ( /ECONNREFUSED/i.test ( message ))
						return socket.emit ( id + '-imap', 4 )
					if ( /certificate/i.test ( message ))
                        return socket.emit ( id + '-imap', 5 )
                    if ( /timeout/i.test ( message )) {
                        return socket.emit ( id + '-imap', 7 )
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

const findQTGateImap = ( imapPool: IinputData_server[] ) => {
	return imapPool.findIndex ( n => {
		return availableImapServer.test ( n.imapServer ) && n.imapCheck && n.smtpCheck && n.imapTestResult > 0 
	})
}

const sentRequestMailWaitTimeOut = 1000 * 60 * 2
const commandRequestTimeOutTime = 1000 * 30
const reqtestTimeOut = 1000 * 30
interface requestPoolData {
	CallBack: ( err?: Error, returnData?: any ) => void
}

class ImapConnect extends Imap.imapPeer {
	private QTGatePublicKey: string = null
	private password: string = null
	private sendReqtestMail = false
	private QTGateServerready = false
	public localGlobalIpAddress = null
	private sendConnectRequestMail = false
	private timeOutWhenSendConnectRequestMail: NodeJS.Timer = null

	private errNumber ( err ) {
		if ( typeof err === 'number')
			return err
		if ( !err || ! err.message )
			return null
		const message = err.message
		if ( /Auth|Lookup failed|Invalid|Login|username/i.test( message ))
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
		return encryptWithKey ( text, this.QTGatePublicKey, this.localServer.config.keypair.privateKey, this.password, CallBack )
	}

	private _deCrypto ( text, CallBack ) {
		return deCryptoWithKey ( text, this.QTGatePublicKey, this.localServer.config.keypair.privateKey, this.password, CallBack )
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
			next => readQTGatePublicKey ( next ),
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
			clearTimeout ( this.timeOutWhenSendConnectRequestMail )
			if ( ! ret.requestSerial ) {
				saveLog ( `newMail have not ret.requestSerial, doing switch ( ret.command ) `)
				
				switch ( ret.command ) {

					case 'stopGetwayConnect':
					case 'containerStop' : {
						
						return localServer.disConnectGateway()
					}

					case 'changeDocker' : {
						
						const container: IConnectCommand = ret.Args[0]
						saveLog ( `QTGateAPIRequestCommand changeDocker container = [${ JSON.stringify ( container )}]`)
						if ( ! container ) {
							return saveLog ( `got Command from server "changeDocker" but have no data ret = [${ JSON.stringify ( ret )}]`)
						}

						if ( ! this.localServer.proxyServer || ! this.localServer.connectCommand ) {
							saveLog ( `got Command from server "changeDocker" localServer.proxyServer or localServer.connectCommand is null!!`)
							return this.localServer.makeOpnConnect ( container )
						}
						return this.localServer.proxyServer.sendCommand ( 'changeDocker', container )

					}
					default: {
						return saveLog ( `QTGateAPIRequestCommand have not requestSerial!, 【${JSON.stringify ( ret )}】`)
					}
				}
				
			}
			saveLog (`on newMail command [${ ret.command }] have requestSerial [${ ret.requestSerial }]`)
			const poolData = this.commandCallBackPool.get ( ret.requestSerial )

			if ( ! poolData || typeof poolData.CallBack !== 'function' ) {
				return saveLog ( `QTGateAPIRequestCommand got commandCallBackPool ret.requestSerial [${ ret.requestSerial }] have not callback `)
			}
			console.log ( Util.inspect ( ret ))
			return poolData.CallBack ( null, ret )
			
		}
		saveLog (`Class ImapConnect start up!`)
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
			makeFeedbackData (( data, callback ) => {
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

const testPing = ( hostIp: string, CallBack ) => {
	let pingTime = 0
	const test = new Array ( testPingTimes )
	test.fill ( hostIp )
	saveLog (`start testPing [${ hostIp }]`)
	return Async.eachSeries ( test, ( n, next ) => {
		const netPing = require ('net-ping')
		const session = netPing.createSession ()
		session.pingHost ( hostIp, ( err, target, sent, rcvd ) => {
			
			session.close ()
			if ( err ) {
				saveLog (`session.pingHost ERROR, ${ err.message }`)
				return next ( err )
			}
			const ping = rcvd.getTime () - sent.getTime ()
			pingTime += ping
			return next ()
		})
	}, err => {
		if ( err ) {
			return CallBack ( new Error ('ping error'))
		}

		return CallBack ( null, Math.round ( pingTime/testPingTimes ))
	})
	
}

const makeFeedBackDataToQTGateAPIRequestCommand = ( data: feedBackData, Callback ) => {
	const ret: QTGateAPIRequestCommand = {
		command: 'feedBackData',
		Args:[ data ],
		error: null,
		requestSerial: Crypto1.randomBytes (10).toString('hex')
	}
	if ( ! data.attachImagePath ) {
		return Callback ( null, ret )
	}
	Fs.readFile ( data.attachImagePath, ( err, iData: Buffer ) => {
		if ( err ) {
			return Callback ( err, null  )
		}
		//data.attachImage = iData.toString ('base64')
		ret.Args = [data]
		Fs.unlink ( data.attachImagePath, () => {
			return Callback ( null, ret )
		})
		
	})
}

const makeFeedbackData = ( request: ( command: QTGateAPIRequestCommand, callback ) => void, CallBack ) => {

	let feedData: feedBackData[] = null
	return Async.waterfall ([
		next => Fs.access ( feedbackFilePath, next ),
		next => Fs.readFile ( feedbackFilePath, 'utf8', next )
	], ( err, jData ) => {
		if ( err )
			return CallBack ( err )
		try {
			feedData = JSON.parse ( jData )
			return Async.each ( feedData, ( n, next ) => {
				return makeFeedBackDataToQTGateAPIRequestCommand ( n, ( err, data: QTGateAPIRequestCommand ) => {
					if ( err ) {
						return next ( err )
					}
					return request ( data, next )
				})
			}, err => {
				return Fs.unlink ( feedbackFilePath, CallBack )
			})
		} catch ( ex ) {
			return CallBack ( ex )
		}
	})
}

const port = remote.getCurrentWindow().rendererSidePort
const version = remote.app.getVersion ()
const server = new localServer ( version, port )
const DEBUG = remote.getCurrentWindow().debug

saveLog ( `
*************************** QTGate [ ${ version } ] server start up on [ ${ port } ] *****************************
OS: ${ process.platform }, ver: ${ Os.release() }, cpus: ${ Os.cpus().length }, model: ${ Os.cpus()[0].model }
Memory: ${ Os.totalmem()/( 1024 * 1024 ) } MB, free memory: ${ Math.round ( Os.freemem() / ( 1024 * 1024 )) } MB
**************************************************************************************************`)
