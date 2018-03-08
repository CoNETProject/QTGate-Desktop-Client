import * as Path from 'path'
import * as Fs from 'fs'
import * as Os from 'os'
import * as Async from 'async'
import * as Http from 'http'
import * as Https from 'https'
import * as Net from 'net'
import * as Crypto from 'crypto'
import * as SaveLog from './saveLog'

const QTGateSignKeyID = /3acbe3cbd3c1caa9/i
const openpgp = require ( 'openpgp' )
const keyServer = 'https://pgp.mit.edu'

const QTGateFolder = Path.join ( Os.homedir(), '.QTGate' )
const configPath = Path.join ( QTGateFolder, 'config.json' )

const feedbackFilePath = Path.join ( QTGateFolder,'.feedBack.json')

const testPingTimes = 5
const saveLog = SaveLog.saveLog

export const encryptWithKey = ( data: string, targetKey: string, privateKey: string, password: string, CallBack ) => {
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

export const deCryptoWithKey1 = ( data: string, publicKey: string, privateKey: string, password: string, CallBack ) => {
	let _return = false
	const options: any = {
		message: openpgp.message.readArmored ( data ),
		publicKeys: openpgp.key.readArmored ( publicKey ).keys,
		privateKey: openpgp.key.readArmored ( privateKey ).keys[0]
	}
	if ( ! options.privateKey.decrypt ( password )) {
		return CallBack ( new Error ('saveImapData key password error!' ))
	}
	openpgp.decrypt ( options ).then ( plaintext => {
		_return = true
		return CallBack ( null, plaintext.data )
	}).catch ( err => {
		console.log ( data )
		console.log ( err )
		if ( !_return ) {
			return CallBack ( err )
		}
		
	})
}

export const readQTGatePublicKey = ( CallBack ) => {
	const fileName = Path.join ( __dirname, 'info@QTGate.com.pem' )
	Fs.readFile ( fileName, 'utf8', CallBack )
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

const makeFeedBackDataToQTGateAPIRequestCommand = ( data: feedBackData, Callback ) => {
	const ret: QTGateAPIRequestCommand = {
		command: 'feedBackData',
		Args:[ data ],
		error: null,
		requestSerial: Crypto.randomBytes (10).toString('hex')
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

export const makeFeedbackData = ( request: ( command: QTGateAPIRequestCommand, callback ) => void, CallBack ) => {

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

export const testPing = ( hostIp: string, CallBack ) => {
	let pingTime = 0
	const test = new Array ( testPingTimes )
	test.fill ( hostIp )
	saveLog ( `start testPing [${ hostIp }]`)
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

export const getQTGateSign = ( _key ) => {
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

const myIpServerUrl = [ 'https://ipinfo.io/ip', 'https://icanhazip.com/', 'https://diagnostic.opendns.com/myip', 'http://ipecho.net/plain', 'https://www.trackip.net/ip' ]

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

export const myIpServer = ( CallBack ) => {
	let ret = false
	Async.each ( myIpServerUrl, ( n, next ) => {
		doUrl( n, ( err, data ) => {
			if ( err || ! Net.isIPv4 ( data )) {
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

export const KeyPairDeleteKeyDetail = ( keyPair: keypair, passwordOK: boolean ) => {
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

export const emitConfig = ( config: install_config, passwordOK: boolean ) => {
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

export const getKeyPairInfo = ( publicKey: string, privateKey: string, password: string, CallBack: ( err1?: Error, data?: keypair ) => void ) => {
	
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

export const InitConfig = ( first: boolean, version, port ) => {

	const ret: install_config = {
		firstRun: first,
		alreadyInit: false,
		multiLogin: false,
		version: version,
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
		serverPort: port,
		connectedQTGateServer: false,
		localIpAddress: getLocalInterface (),
		lastConnectType: 1,
		connectedImapDataUuid: null
	}
	return ret
}


export const checkKey = ( keyID: string, CallBack ) => {
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