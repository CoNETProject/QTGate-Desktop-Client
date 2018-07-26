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

import * as Fs from 'fs'
import localServer from '../localWebServer'
import * as Path from 'path'
import * as Os from 'os'
import * as Async from 'async'
import * as Crypto from 'crypto'
import * as OpenPgp from 'openpgp'
import * as Util from 'util'
import * as Http from 'http'
import * as Https from 'https'
import * as Net from 'net'
import * as Nodemailer from 'nodemailer'
import { StringDecoder } from 'string_decoder'
import { DH_CHECK_P_NOT_SAFE_PRIME } from 'constants';
/**
 * 		define
 */

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

export const QTGateFolder = Path.join (  !/^android$/i.test ( process.platform ) ? Os.homedir() : Path.join(__dirname,"../../../../.."), '.CoNET' )
export const QTGateLatest = Path.join ( QTGateFolder, 'latest' )
export const QTGateTemp = Path.join ( QTGateFolder, 'tempfile' )
export const QTGateVideo = Path.join ( QTGateTemp, 'videoTemp')
export const ErrorLogFile = Path.join ( QTGateFolder, 'systemError.log' )
export const CoNETConnectLog = Path.join ( QTGateFolder, 'CoNETConnect.log' )
export const imapDataFileName1 = Path.join ( QTGateFolder, 'imapData.pem' )

export const CoNET_Home = Path.join ( __dirname )
export const CoNET_PublicKey = Path.join ( CoNET_Home, '3C272D2E.pem')

export const LocalServerPortNumber = 3000
export const configPath = Path.join ( QTGateFolder, 'config.json' )
const packageFilePath = Path.join ( '..', '..','package.json')
export const packageFile = require ( packageFilePath )
export const QTGateSignKeyID = /3acbe3cbd3c1caa9/i
export const twitterDataFileName = Path.join ( QTGateFolder, 'twitterData.pem' )

export const checkFolder = ( folder: string, CallBack: ( err?: Error ) => void ) => {
    Fs.access ( folder, err => {
        if ( err ) {
            return Fs.mkdir ( folder, err1 => {
                if ( err1 ) {
                    
                    return CallBack ( err1 )
                }
                return CallBack ()
            })
        }
        return CallBack ()
    })
}

const readQTGatePublicKey = ( CallBack ) => {
	return Fs.readFile ( CoNET_PublicKey, 'utf8', CallBack )
}

export const convertByte = ( byte: number ) => {
	if ( byte < 1000 ) {
		return `${ byte } B`
	}
	const kbyte = Math.round ( byte / 10.24 ) / 100
	if ( kbyte < 1000 ) {
		return `${ kbyte } KB`
	}
	const mbyte = Math.round ( kbyte / 10 ) / 100
	if ( mbyte < 1000 ) {
		return `${ mbyte } MB`
	}
	const gbyte = Math.round ( mbyte / 10 ) / 100
	if ( gbyte < 1000 ) {
		return `${ gbyte } GB`
	}
	const tbyte = Math.round ( mbyte / 10 ) / 100
	return `${ tbyte } TB`
}

export const checkSystemFolder = CallBack => {
	
	const callback = ( err, kkk ) => {
		if ( err ) {
			console.log ( `checkSystemFolder return error`, err )
			return CallBack ( err )
		}
		console.log (`checkSystemFolder QTGateFolder = [${ QTGateFolder }]`)
		return CallBack ()
	}
	return Async.series ([
		next => checkFolder ( QTGateFolder, next ),
        next => checkFolder ( QTGateLatest, next ),
        next => checkFolder ( QTGateTemp, next ),
        next => checkFolder ( QTGateVideo, next )
	], callback )
}

export const getLocalInterface = () => {
	const ifaces = Os.networkInterfaces()
	const ret = []
	Object.keys ( ifaces ).forEach ( n => {
		ifaces[ n ].forEach ( iface => {
			
			if ( 'IPv4' !== iface.family || iface.internal !== false ) {
				// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
				return
			}
			ret.push ( iface.address )
		})
	})
	return ret
}

export const InitConfig = () => {
	const ret: install_config = {
		firstRun: true,
		alreadyInit: false,
		multiLogin: false,
		version: packageFile.version,
		newVersion: null,
		newVerReady: false,
		keypair: InitKeyPair (),
		salt: Crypto.randomBytes ( 64 ),
		iterations: 2000 + Math.round ( Math.random () * 2000 ),
		keylen: Math.round ( 16 + Math.random() * 30 ),
		digest: 'sha512',
		freeUser: true,
		account: null,
		serverGlobalIpAddress: null,
		serverPort: LocalServerPortNumber,
		connectedQTGateServer: false,
		localIpAddress: getLocalInterface (),
		lastConnectType: 1,
		connectedImapDataUuid: null
	}
	return ret
}

export const getNickName = ( str: string ) => {
	const uu = str.split ('<')
	return uu[0]
}

export const getEmailAddress = ( str: string ) => {
	const uu = str.split ('<')
	return uu[1].substr( 0, uu[1].length -1 )
}

export const getQTGateSign = ( user: OpenPgp.key.users ) => {
    if ( !user.otherCertifications || !user.otherCertifications.length ) {
		return null
	}
	let Certification = false
	user.otherCertifications.forEach ( n => {
		if ( QTGateSignKeyID.test ( n.issuerKeyId.toHex ().toLowerCase())) {
			return Certification = true
		}
	})
	return Certification
}

export const getKeyPairInfo = ( publicKey: string, privateKey: string, password: string, CallBack: ( err?: Error, keyPair?: keypair ) => void ) => {
	if ( ! publicKey || ! privateKey ) {
		return CallBack ( new Error ('no key'))
	}
	const _privateKey = OpenPgp.key.readArmored ( privateKey )
	const _publicKey = OpenPgp.key.readArmored ( publicKey )
	if ( _privateKey.err || _publicKey.err ) {
		
		return CallBack ( new Error ('no key'))
	}
	const privateKey1 = _privateKey.keys[0]
	const publicKey1 = _publicKey.keys
	const user = publicKey1[0].users[0]
	const ret = InitKeyPair()
	
	ret.publicKey = publicKey
	ret.privateKey = privateKey
	ret.nikeName = getNickName ( user.userId.userid )
	ret.createDate = privateKey1.primaryKey.created.toDateString ()
	ret.email = getEmailAddress ( user.userId.userid )
	ret.verified = getQTGateSign ( user )
	ret.publicKeyID = publicKey1[0].primaryKey.getFingerprint().toUpperCase()
	
	ret.passwordOK = false
	if ( !password ) {
		return CallBack ( null, ret )
	}
	
	return privateKey1.decrypt ( password ).then ( keyOK => {
		ret.passwordOK = keyOK
		return CallBack ( null, ret )
	}).catch (() => {
		return CallBack ( null, ret )
	})
	
}

export const emitConfig = ( config: install_config, passwordOK: boolean ) => {
	if ( !config ) {
		return null
	}
	const ret: install_config = {
		keypair: config.keypair,
		firstRun: config.firstRun,
		alreadyInit: config.alreadyInit,
		newVerReady: config.newVerReady,
		version: config.version,
		multiLogin: config.multiLogin,
		freeUser: config.freeUser,
		account: config.keypair && config.keypair.email ? config.keypair.email : null,
		serverGlobalIpAddress: config.serverGlobalIpAddress,
		serverPort: config.serverPort,
		connectedQTGateServer: config.connectedQTGateServer,
		localIpAddress: getLocalInterface(),
		lastConnectType: config.lastConnectType,
		iterations: config.iterations,
		connectedImapDataUuid: config.connectedImapDataUuid
	}
	ret.keypair.passwordOK = false 
	return ret
}

export const saveConfig = ( config: install_config, CallBack ) => {
	return Fs.writeFile ( configPath, JSON.stringify ( config ), CallBack )
}

export const checkConfig = CallBack => {
	Fs.access ( configPath, err => {
		
		if ( err ) {
			return CallBack ( null, InitConfig ())
		}
		let config: install_config = null

		try {
			config = require ( configPath )
		} catch ( e ) {
			return CallBack ( null, InitConfig ())
		}
		config.salt = Buffer.from ( config.salt['data'] )
		
		//		update?

		config.version = packageFile.version
		config.newVerReady = false
		config.newVersion = null
		config.serverPort = LocalServerPortNumber
		config.localIpAddress = getLocalInterface ()
		config.firstRun = packageFile.firstRun || false
		if ( !config.keypair || ! config.keypair.publicKey ) {
			return CallBack ( null, config )
		}
		return getKeyPairInfo ( config.keypair.publicKey, config.keypair.privateKey, null, ( err, key: keypair ) => {
			if ( err ) {
				CallBack ( err )
				return console.log (`checkConfig getKeyPairInfo error`, err )
			}
			
			config.keypair = key
			return CallBack ( null, config )			
		})

	})
}

export const newKeyPair = ( emailAddress: string, nickname: string, password: string, CallBack ) => {
	const userId = {
		name: nickname,
		email: emailAddress
	}
	const option: OpenPgp.KeyOptions = {
		passphrase: password,
		userIds: [userId],
		curve: "ed25519",
		aead_protect: true,
		aead_protect_version: 4
	}
	return OpenPgp.generateKey ( option ).then (( keypair: { publicKeyArmored: string, privateKeyArmored: string }) => {
		
		const ret: keyPair = {
			publicKey: keypair.publicKeyArmored,
			privateKey: keypair.privateKeyArmored
		}
		return CallBack ( null, ret )
	}).catch ( err => {
		// ERROR
		return CallBack ( err )
	})
}

export const getImapSmtpHost = function ( _email: string ) {
	const email = _email.toLowerCase()
	const yahoo = ( domain: string ) => {
		
		if ( /yahoo.co.jp$/i.test ( domain ))
			return 'yahoo.co.jp';
			
		if ( /((.*\.){0,1}yahoo|yahoogroups|yahooxtra|yahoogruppi|yahoogrupper)(\..{2,3}){1,2}$/.test ( domain ))
			return 'yahoo.com';
		
		if ( /(^hotmail|^outlook|^live|^msn)(\..{2,3}){1,2}$/.test ( domain ))
			return 'hotmail.com';
			
		if ( /^(me|^icould|^mac)\.com/.test ( domain ))
			return 'me.com'

		return domain
	}

	const emailSplit = email.split ( '@' )
	
	if ( emailSplit.length !== 2 ) 
		return null
		
	const domain = yahoo ( emailSplit [1] )
	
	const ret = {
		imap: 'imap.' + domain,
		smtp: 'smtp.' + domain,
		SmtpPort: [465,587,994],
		ImapPort: 993,
		imapSsl: true,
		smtpSsl: true,
		haveAppPassword: false,
		ApplicationPasswordInformationUrl: ['']
	}
	
	switch ( domain ) {
		//		yahoo domain have two different 
		//		the yahoo.co.jp is different other yahoo.*
		case 'yahoo.co.jp': {
			ret.imap = 'imap.mail.yahoo.co.jp';
			ret.smtp = 'smtp.mail.yahoo.co.jp'
		}
		break;

		//			gmail
		case 'google.com':
		case 'googlemail.com':
		case 'gmail': {
			ret.haveAppPassword = true;
			ret.ApplicationPasswordInformationUrl = [
				'https://support.google.com/accounts/answer/185833?hl=zh-Hans',
				'https://support.google.com/accounts/answer/185833?hl=ja',
				'https://support.google.com/accounts/answer/185833?hl=en'
			]
		}
		break;

        case 'gandi.net':
            ret.imap = ret.smtp = 'mail.gandi.net'
        break
		
		//				yahoo.com
		case 'rocketmail.com':
		case 'y7mail.com':
		case 'ymail.com':
		case 'yahoo.com': {
			ret.imap = 'imap.mail.yahoo.com'
			ret.smtp = (/^bizmail.yahoo.com$/.test(emailSplit[1]))
				? 'smtp.bizmail.yahoo.com'
				: 'smtp.mail.yahoo.com'
			ret.haveAppPassword = true;
			ret.ApplicationPasswordInformationUrl = [
				'https://help.yahoo.com/kb/SLN15241.html',
				'https://help.yahoo.com/kb/SLN15241.html',
				'https://help.yahoo.com/kb/SLN15241.html'
			]
		}
		break;

        case 'mail.ee':
            ret.smtp = 'mail.ee'
            ret.imap = 'mail.inbox.ee'
        break

		
        //		gmx.com
        case 'gmx.co.uk':
        case 'gmx.de':
		case 'gmx.us':
		case 'gmx.com' : {
            ret.smtp = 'mail.gmx.com'
            ret.imap = 'imap.gmx.com'
        }
        
		break;
		
		//		aim.com
		case 'aim.com': {
			ret.imap = 'imap.aol.com'
		}
		break;
		
		//	outlook.com
		case 'windowslive.com':
		case 'hotmail.com': 
		case 'outlook.com': {
			ret.imap = 'imap-mail.outlook.com'
            ret.smtp = 'smtp-mail.outlook.com'
		}
		break;
		
		//			apple mail
        case 'icloud.com':
        case 'mac.com':
		case 'me.com': {
			ret.imap = 'imap.mail.me.com'
            ret.smtp = 'smtp.mail.me.com'
		}
		break;
		
		//			163.com
		case '126.com':
		case '163.com': {
			ret.imap = 'appleimap.' + domain
			ret.smtp = 'applesmtp.' + domain
		}
		break;
		
		case 'sina.com':
		case 'yeah.net': {
			ret.smtpSsl = false
		}
		break;
		
	}
	
	return ret
	
}

export const availableImapServer = /imap\-mail\.outlook\.com$|imap\.mail\.yahoo\.(com|co\.jp|co\.uk|au)$|imap\.mail\.me\.com$|imap\.gmail\.com$|gmx\.(com|us|net)$|imap\.zoho\.com$/i

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

const myIpServerUrl = [ 'https://ipinfo.io/ip', 'https://icanhazip.com/', 'https://diagnostic.opendns.com/myip', 'http://ipecho.net/plain', 'https://www.trackip.net/ip' ]

export const myIpServer = ( CallBack ) => {
	let ret = false
	Async.each ( myIpServerUrl, ( n, next ) => {
		return doUrl( n, ( err, data ) => {
			if ( err || ! Net.isIPv4 ( data )) {
				return next ()
			}
			if ( !ret ) {
				ret = true
				return CallBack ( null, data )
			}
		})
	}, () => {
		if ( !ret ) {
			return CallBack ( new Error ('no network'))
		}
			
	})
}

const _smtpVerify = ( imapData: IinputData, CallBack: ( err?: Error ) => void ) => {
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
	return transporter.verify ( CallBack )
		//DEBUG ? saveLog ( `transporter.verify callback [${ JSON.stringify ( err )}] success[${ success }]` ) : null
		/*
		if ( err ) {
			const _err = JSON.stringify ( err )
			if ( /Invalid login|AUTH/i.test ( _err ))
				return CallBack ( 8 )
			if ( /certificate/i.test ( _err ))
				return CallBack ( 9 )
			return CallBack ( 10 )
		}

		return CallBack()
		*/
}

export const smtpVerify = ( imapData: IinputData, CallBack: ( err? ) => void ) => {
	console.log (`doing smtpVerify!`)
	let testArray: IinputData[] = null
	let _ret = false
	let err1 = null
	if ( typeof imapData.smtpPortNumber === 'object' ) {
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
	
	return Async.each ( testArray, ( n, next ) => {
		return _smtpVerify ( n, ( err: Error ) => {

			if ( err && err.message ) {
				if ( /Invalid login|AUTH/i.test ( err.message )) {
					return next ( err )
				}
				return next ()
			}
			if ( ! _ret ) {
				_ret = true
				imapData.smtpPortNumber = n.smtpPortNumber
				imapData.smtpSsl = n.smtpSsl
				imapData.ciphers = n.ciphers
				return CallBack ()
			}
			
		})
	}, ( err: Error ) => {
		if ( err ) {
			console.log ( `smtpVerify ERROR = [${ err.message }]`)
			return CallBack ( err )
		}
		if ( ! _ret ) {
			console.log ( `smtpVerify success Async!`)
			return CallBack ()
		}
		console.log (`smtpVerify already did CallBack!`)
	})
	
}

export const getPbkdf2 = ( config: install_config, passwrod: string, CallBack ) => {
	
	return Crypto.pbkdf2 ( passwrod, config.salt, config.iterations, config.keylen, config.digest, CallBack )
}

export const makeGpgKeyOption = ( config: install_config, passwrod: string, CallBack ) => {
	const option = {
		privateKeys: OpenPgp.key.readArmored ( config.keypair.privateKey ).keys,
		publicKeys: null
	}
	return Async.waterfall ([
		next => Fs.readFile ( CoNET_PublicKey, 'utf8', next ),
		( data, next ) => {
			option.publicKeys = OpenPgp.key.readArmored ( data ).keys
			return getPbkdf2 ( config, passwrod, next )
		}
	], ( err, data: Buffer ) => {
		if ( err ) {
			return CallBack ( err )
		}
		return option.privateKeys[0].decrypt ( data.toString( 'hex' )).then ( keyOK => {
			if ( keyOK ) {
				return CallBack ( null, option )
			}
			return CallBack ( new Error ('password!'))
		}).catch ( CallBack )
	})
}

export const saveEncryptoData = ( fileName: string, data: any, config: install_config, password: string, CallBack ) => {
		
	if ( ! data ) {
		return Fs.unlink ( fileName, CallBack )
	}
	const _data = JSON.stringify ( data )
	const options = {
		data: _data,
		publicKeys: OpenPgp.key.readArmored ( config.keypair.publicKey ).keys,
		privateKeys: OpenPgp.key.readArmored ( config.keypair.privateKey ).keys
	}
	return getPbkdf2 ( config, password, ( err, data: Buffer ) => {
		if ( err ) {
			return CallBack ( err )
		}
		return options.privateKeys[0].decrypt ( data.toString( 'hex' )).then ( keyOK => {
			return OpenPgp.encrypt ( options ).then ( ciphertext => {
				return Fs.writeFile ( fileName, ciphertext.data, { encoding: 'utf8' }, CallBack )
			}).catch ( CallBack )
		}).catch ( CallBack )
		
		
	})

}

export const readEncryptoFile = ( filename: string, savedPasswrod, config: install_config, CallBack ) => {
	if ( ! savedPasswrod || ! savedPasswrod.length || ! config || ! config.keypair || ! config.keypair.createDate ) {
		return CallBack ( new Error ('readImapData no password or keypair data error!'))
	}
	const options = {
		message: null,
		publicKeys: OpenPgp.key.readArmored ( config.keypair.publicKey ).keys,
		privateKeys: OpenPgp.key.readArmored ( config.keypair.privateKey ).keys
	}
	return Async.waterfall ([
		next => Fs.access ( filename, next ),
		( acc, next ) => {
			/**
			 * 		support old nodejs 
			 */
			
			let _next = acc
			if ( typeof _next !== 'function') {
				//console.trace (` _next !== 'function' [${ typeof _next}]`)
				_next = next
			}
			getPbkdf2 ( config, savedPasswrod, _next )
		},
		( data: Buffer, next ) => {
			return options.privateKeys[0].decrypt ( data.toString( 'hex' )).then ( keyOk => {
				
				if ( !keyOk ) {
					return next ( new Error ('key password not OK!'))
				}
				return next ()
			}).catch ( err => {
				console.log (`options.privateKey.decrypt err`, err )
				next ( err )
			})
		},
		next => {
			Fs.readFile ( filename, 'utf8', next )
		}], ( err, data ) => {
			if ( err ) {
				return CallBack ( err )
			}
			try {
				options.message = OpenPgp.message.readArmored ( data.toString ())
			} catch ( ex ) {
				return CallBack ( ex )
			}
			
			return OpenPgp.decrypt ( options ).then ( data => {
				if ( data.signatures && data.signatures[0] && data.signatures[0].valid ) {
					return CallBack ( null, data.data )
				}
				return CallBack ( new Error ('signatures error!'))
			}).catch ( ex => {
				return CallBack ( ex )
			})
		})
	
}

export const encryptMessage = ( openKeyOption, message: string, CallBack ) => {
	const option = {
		privateKeys: openKeyOption.privateKeys,
		publicKeys: openKeyOption.publicKeys,
		data: message
	}
	//console.log (`encryptMessage `, message )
	return OpenPgp.encrypt ( option ).then ( ciphertext => {
		return CallBack ( null, ciphertext.data )
	}).catch ( CallBack )
}

export const decryptoMessage = ( openKeyOption, message: string, CallBack ) => {
	const option = {
		privateKeys: openKeyOption.privateKeys,
		publicKeys: openKeyOption.publicKeys,
		message: null
	}
	try {
		option.message = OpenPgp.message.readArmored ( message )
	} catch ( ex ) {
		return CallBack ( ex )
	}
	
	return OpenPgp.decrypt ( option ).then ( data => {
		
		if ( data.signatures && data.signatures.length && data.signatures.findIndex ( n => { return n.valid }) > -1 ) {
			return CallBack ( null, data.data )
			
		}
		console.log ( Util.inspect ( data ))
		return CallBack ( new Error ('signatures error!'))
	}).catch ( err =>{
		console.log ( err )
		console.log ( JSON.stringify ( message ))
		return CallBack ( err )
	})
}

const testSmtpAndSendMail = ( imapData: IinputData, CallBack ) => {
	let first = false
	if ( typeof imapData === 'object' ) {
		first = true
	}
	return smtpVerify ( imapData, err => {
		if ( err ) {
			if ( first ) {
				imapData.imapPortNumber = [25,465,587,994,2525]
				return smtpVerify ( imapData, CallBack )
			}
			return CallBack ( err )
		}
		return CallBack ()
	})
}

export const sendCoNETConnectRequestEmail = ( imapData: IinputData, openKeyOption, ver: string, publicKey: string, CallBack ) => {

	const qtgateCommand: QTGateCommand = {
		account: imapData.account,
		QTGateVersion: ver,
		imapData: imapData,
		command: 'connect',
		error: null,
		callback: null,
		language: imapData.language,
		publicKey: publicKey
	}
	return Async.waterfall ([
		next => testSmtpAndSendMail ( imapData, next ),
		next => encryptMessage ( openKeyOption, JSON.stringify ( qtgateCommand ), next ),
		( _data, next ) => {
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
				tls: !imapData.smtpSsl ? {
					rejectUnauthorized: imapData.smtpIgnoreCertificate,
					ciphers: imapData.ciphers
				} : null,
				debug: true
			}
			const transporter = Nodemailer.createTransport ( option )
			console.log ( Util.inspect ( option ))
			const mailOptions = {
				from: imapData.smtpUserName,
				to: 'QTGate@CoNETTech.ca',
				subject:'CoNET',
				attachments: [{
					content: _data
				}]
			}
			return transporter.sendMail ( mailOptions, next )
		}
	], CallBack )

}

const testPingTimes = 5

export const testPing = ( hostIp: string, CallBack ) => {
	let pingTime = 0
	const test = new Array ( testPingTimes )
	test.fill ( hostIp )
	console.log ( `start testPing [${ hostIp }]`)
	return Async.eachSeries ( test, ( n, next ) => {
		const netPing = require ('net-ping')
		const session = netPing.createSession ()
		session.pingHost ( hostIp, ( err, target, sent, rcvd ) => {
			
			session.close ()
			if ( err ) {
				console.log ( `session.pingHost ERROR, ${ err.message }`)
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

		return CallBack ( null, Math.round ( pingTime / testPingTimes ))
	})
	
}

