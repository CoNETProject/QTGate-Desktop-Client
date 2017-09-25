/*---------------------------------------------------------------------------------------------
 *  Copyright (c) QTGate System Inc. All rights reserved.
 *  Licensed under the MIT License. See License in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as Net from 'net'
import * as Http from 'http'
import * as Dns from 'dns'
import HttpProxyHeader from './httpProxy'
import * as Async from 'async'
import * as Compress from './compress'
import * as util from 'util'
import * as Rfc1928 from './rfc1928'
import * as Crypto from 'crypto'

import * as Stream from 'stream'
import * as Fs from 'fs'
import * as Path from 'path'

const { remote } = require ( "electron" )

const whiteIpFile = 'whiteIpList.json'
Http.globalAgent.maxSockets = 1024
const ipConnectResetTime = 1000 * 60 * 5
const Day = 1000 * 60 * 60 * 24
const managerPagePort = 8001

const _HTTP_502 = `HTTP/1.1 502 Bad Gateway
Content-Length: 0
Connection: close
Proxy-Connection: close
Content-Type: text/html; charset=UTF-8
Cache-Control: private, max-age=0

`

const _HTTP_404 = `HTTP/1.1 404 Not Found
Content-Length: 0
Connection: close
Proxy-Connection: close
Content-Type: text/html; charset=UTF-8
Cache-Control: private, max-age=0

`

const _HTTP_599_body = 'Have not internet.\r\n無互聯網，請檢查您的網絡連結\r\nネットワークはオフラインです\r\n'
const _HTTP_599 = `HTTP/1.1 599 Have not internet
Content-Length: 100
Connection: close
Proxy-Connection: close
Content-Type: text/html; charset=UTF-8
Cache-Control: private, max-age=0

${ _HTTP_599_body }
`
const _HTTP_598_body = `Domain name can't find.\r\n無此域名\r\nこのドメイン名が見つからないです\r\n`
const _HTTP_598 = `HTTP/1.1 598 Domain name can't find
Content-Length: 100
Connection: close
Proxy-Connection: close
Content-Type: text/html; charset=UTF-8
Cache-Control: private, max-age=0

${ _HTTP_598_body }
`

const _HTTP_200 = ( body: string ) => {
	return `HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Connection: keep-alive
Content-Length: ${ body.length }

${ body }\r\n\r\n`
}

const body_403 = '<!DOCTYPE html><html><p>This domain in proxy blacklist.</p><p>這個域名被代理服務器列入黑名單</p><p>このサイドはプロクシーの禁止リストにあります</p></html>'
const HTTP_403 = `HTTP/1.1 403 Forbidden
Content-Type: text/html; charset=UTF-8
Connection: close
Proxy-Connection: close
Content-Length: 300

${ body_403 }

`
const _HTTP_PROXY_200 = `HTTP/1.1 200 Connection Established
Content-Type: text/html; charset=UTF-8

`
interface domainData {
	dns: Dns.address[]
	expire: number;
}

const testGatewayDomainName = 'www.google.com'
//	socks 5 headers
	const res_NO_AUTHENTICATION_REQUIRED = new Buffer ( '0500', 'hex' )
	const respon_se = new Buffer ( '05000001000000000000', 'hex' )
//	-
const IsSslConnect = ( buffer: Buffer ) => {
	
	const kk = buffer.toString ( 'hex', 0, 4 )
	
	return /^1603(01|02|03|00)|^80..0103|^(14|15|17)03(00|01)/.test (kk)
}

const checkDomain = ( domainList: string[], domain: string, CallBack ) => {

	if ( Net.isIP ( domain )) {
		return CallBack ( null, domainList.find ( n => { return n === domain }) ? true : false )
	}
	const domainS = domain.split ('.')
	return Async.some ( domainList, ( n, next ) => {
		const nS = n.split ('.')
		let ret = false

		for ( let i = nS.length - 1, ni = domainS.length - 1 ; i >= 0 && ni >= 0 ; i --, ni -- ) {

			const ns = nS [i]
			if ( domainS [ni].toLowerCase () !==  nS [i].toLowerCase ()) {
				break
			}

			if ( i === 0 )
				ret = true
		}

		return next ( null, ret )

	}, ( err, result ) => {

		return CallBack ( null, result )
	})
}

const otherRespon = ( path: string, host: string, port: number, UserAgent: string ) => {
	
	const option = {
		host: host,
		port: port,
		path: '/' + path,
		method: 'GET',
		headers: {
			//'Upgrade-Insecure-Requests': 1,
			Host: host + ':' + port,
			'Accept': '*/*',
			'Accept-Language': 'en-US',
			'Connection': 'keep-alive',
			'Accept-Encoding': 'gzip, deflate',
			'User-Agent': UserAgent || 'Mozilla/5.0',
		}
	}
	return option
}

const otherRequestForNet = ( path: string, host: string, port: number, UserAgent: string ) => {
	if ( path.length < 2048) 
		return `GET /${ path } HTTP/1.1\r\n` +
				`Host: ${ host }:${ port }\r\n` +
				`Accept: */*\r\n` +
				`Accept-Language: en-ca\r\n` +
				`Connection: keep-alive\r\n` +
				`Accept-Encoding: gzip, deflate\r\n` +
				`User-Agent: ${ UserAgent ? UserAgent : 'Mozilla/5.0' }\r\n\r\n`
	return 	`POST /${ Buffer.allocUnsafe ( 10 + Math.random()).toString('base64') } HTTP/1.1\r\n` +
			`Host: ${ host }:${ port }\r\n` +
			`Content-Length: ${ path.length }\r\n\r\n` +
			path + '\r\n\r\n'
}

const testLogin = ( req: Buffer, loginUserList: string ) => {
	
	const header = new HttpProxyHeader ( req )
	if ( header.isGet && header.Url.path === loginUserList )
		return true
    
	return false
}

const closeClientSocket = ( socket: Net.Socket, status: number, body: string ) => {
	if ( !socket || ! socket.writable )
		return
	let stat = _HTTP_404
	switch ( status ) {
		case 502:
			stat = _HTTP_502
			break;
		case 599:
			stat = _HTTP_599
			break;
		case 598:
			stat = _HTTP_598
			break;
		case -200:
			stat = _HTTP_PROXY_200
			socket.write ( stat )
			return socket.resume ()
		default:
			break;
	}
	socket.end ( stat )
	return socket.resume ()
}

const _connect = ( hostname: string, hostIp: string, port: number, clientSocket: Net.Socket, data: Buffer, connectHostTimeOut: number,  CallBack ) => {

	const socket = new Net.Socket()
	const ip = clientSocket.remoteAddress.split (':')[3]
	let err = null
	const id = `[${ ip }] => [${ hostname }:${ port }] `
	const hostInfo = `{${ hostIp }:${ port }}`
	let callbacked = false
	const startTime = new Date ().getTime ()
	const callBack = ( err ) => {
		if ( callbacked )
			return
		callbacked = true
		if ( socket && typeof socket.unpipe === 'function' )
			socket.unpipe ()
		if ( socket && typeof socket.end === 'function' )
			socket.end ()
		if ( socket && typeof socket.destroy === 'function' )
			socket.destroy ()
		CallBack ( err )
	}

	socket.on ( 'connect', () => {
		console.log (`${ id } socket.on connect!`)

		clearTimeout ( timeout )

		if ( callbacked ) {
			const stopTime = new Date ().getTime ()
			const connectTimeOutTime = stopTime - startTime + 500
			
			console.log (` connectHostTimeOut need change [${ connectHostTimeOut }] => [${ connectTimeOutTime }]`)
			connectHostTimeOut = connectTimeOutTime
			return socket.end ()
		}
		
		socket.pipe ( clientSocket ).pipe ( socket )

		if ( socket && socket.writable ) {
			socket.write ( data )
			return socket.resume ()
		}
			
		return callBack ( null )
		
	})

	clientSocket.on ( 'error', err => {
		callBack ( null )
		return console.log ( 'clientSocket on error', err.message )
	})

	socket.on ( 'error', err => {
		console.log ( '_connect socket on error', err.message )
		return callBack ( err )
			
	})

	socket.on ( 'end', () => {
		return callBack ( null )
	})

	const timeout = setTimeout (() => {
		err = new Error ( `${ id } _connect timeout!` )
		return callBack ( err )

	}, connectHostTimeOut )

	return socket.connect ( port, hostIp )
}

const tryConnectHost = ( hostname: string, hostIp: domainData, port: number, data: Buffer, clientSocket: Net.Socket, isSSLConnect: boolean, 
	checkAgainTimeOut: number, connectTimeOut: number, gateway: boolean, CallBack ) => {

	if ( isSSLConnect ) {
		clientSocket.once ( 'data', ( _data: Buffer ) => {
			return tryConnectHost ( hostname, hostIp, port, _data, clientSocket, false, checkAgainTimeOut, connectTimeOut, gateway, CallBack )
		})
		return closeClientSocket ( clientSocket, -200, '' )
	}


	if ( ! hostIp ) {
		console.log ( hostname, ' tryConnectHost have not hostIp CallBack!' )
		return CallBack ( new Error ( 'not hostIp' ), data )
	}

	const now = new Date ().getTime ()

	console.log ( 'tryConnectHost do Async.someSeries hostIp:' )
	console.log ( hostIp )

	Async.someSeries ( hostIp.dns, ( n, next ) => {
		console.log ( n )

		if ( n.family === 6 && ! this.hostGlobalIpV6 ) {
			return next ( null, false )
		}
			
		if ( n.connect && n.connect.length ) {
			const last = n.connect [0]
			if ( now - last < ipConnectResetTime ) {
				console.log ( n.address, ' cant connect in time range!')
				return next ( null, false )
			}
		}

		return _connect ( hostname, n.address, port, clientSocket, data, connectTimeOut, err => {

			if ( err ) {
				console.log ( '_connect callback error', err.message )
				if ( ! n.connect )
					n.connect = []
				n.connect.unshift ( new Date().getTime() )
				
				return next ( null, false )
			}
				
			return next ( null, true )
			
		})
	}, ( err, fin ) => {
		if ( fin )
			return CallBack ()
		return CallBack ( new Error ( 'all ip cant direct connect' ), data )
	})
	
}

class hostLookupResponse extends Stream.Writable {
	constructor ( private CallBack: ( err?: Error, dns?: domainData ) => void ) { super ()}
	public _write ( chunk: Buffer, enc, next ) {
		const ns = chunk.toString ( 'utf8' )
		try {
			const _ret = JSON.parse ( ns )
			const ret: domainData = {
				expire: new Date().getTime () + Day,
				dns: _ret
			}
			this.CallBack ( null, ret )
			next ()
			return this.end ()
		} catch ( e ) {
			return next ( e )
		}
	}
}

class gateWay {

	private userAgent = null

	private request ( str: string ) {
		return Buffer.from ( otherRequestForNet ( str, this.serverIp, this.serverPort, this.userAgent ), 'utf8' )
	}

	constructor ( public serverIp: string, public serverPort: number, private password: string ) {
	}

	public hostLookup ( hostName: string, userAgent: string, CallBack: ( err?: Error, data?: domainData ) => void ) {

		const _data = new Buffer ( JSON.stringify ({ hostName: hostName }), 'utf8' )
		
		const encrypt = new Compress.encryptStream ( this.password, 0, ( str: string ) => {
			return this.request ( str )
		}, err => {
			if ( err ) {
				return CallBack ( err )
			}
			const finish = new hostLookupResponse ( CallBack )
			const httpBlock = new Compress.getDecryptClientStreamFromHttp ()
			const decrypt = new Compress.decryptStream ( this.password )
			

			const _socket = Net.connect ({ port: this.serverPort, host: this.serverIp }, () => {
				httpBlock.on ( 'error', err => {
					_socket.end ( _HTTP_502 )
					return CallBack ( err )
				})
				encrypt.pipe ( _socket ).pipe ( httpBlock ).pipe ( decrypt ).pipe ( finish )
				encrypt.write ( _data )
			})
		})
		
	}

	public requestGetWay ( id: string, uuuu: VE_IPptpStream, userAgent: string, socket: Net.Socket ) {
		this.userAgent = userAgent
		const decrypt = new Compress.decryptStream ( this.password )
		const encrypt = new Compress.encryptStream ( this.password, 0, ( str: string ) => {
			return this.request ( str )
		}, err => {

			if ( err ) {
				return console.log ( 'requestGetWay new Compress.encryptStream got ERROR: ', err.message )
			}

			const httpBlock = new Compress.getDecryptClientStreamFromHttp ()
			httpBlock.on ( 'error', err => {
				socket.end ( _HTTP_404 )
			})
			const _socket = Net.connect ({ port: this.serverPort, host: this.serverIp }, () => {
				console.log ( 'requestGetWay connect:', uuuu.host, uuuu.port )
				encrypt.pipe ( _socket ).pipe ( httpBlock ).pipe ( decrypt ).pipe ( socket ).pipe ( encrypt )
				encrypt.write ( Buffer.from ( JSON.stringify ( uuuu ), 'utf8' ))
			})
		
		})
		
		
	}

	public requestGetWayTest ( id: string, uuuu: VE_IPptpStream, userAgent: string, socket: Net.Socket ) {
		console.log ('connect to test port!')
		const _socket = Net.createConnection ({ port: this.serverPort + 1, host: this.serverIp })
		
		_socket.on ( 'connect', () => {
			const ls = new Compress.printStream ('>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
			const ls1 = new Compress.printStream ('<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
			_socket.pipe ( socket ).pipe ( _socket )
			const _buf = Buffer.from ( otherRequestForNet ( Buffer.from ( JSON.stringify ( uuuu ), 'utf8' ).toString ( 'base64' ), this.serverIp, this.serverPort, this.userAgent ), 'utf8' )
			_socket.write ( _buf )
			
		})
		
		_socket.on ( 'end', () => {
			return console.log ( 'test gateway END' )
		})

		_socket.on ( 'error', error => {
			return console.log ( 'test gateway ERROR:', error.message )
		})
	}
}

const isAllBlackedByFireWall = ( hostName: string, ip6: boolean, checkAgainTime: number, gatway: gateWay, userAgent: string, domainListPool: Map < string, domainData >,
	CallBack: ( err?: Error, hostIp?: domainData ) => void ) => {

	const hostIp = domainListPool.get ( hostName )
	const now = new Date ().getTime ()
	if ( ! hostIp || hostIp.expire < now)
		return  gatway.hostLookup ( hostName, userAgent, CallBack )
	return CallBack ( null, hostIp )
}

class socks5 {

	private host: string;
	public ATYP: number;
	public port: number;
	public cmd: number;
	private keep = false
	private closeSocks5 ( buffer: Buffer ) {
		if ( this.socket ) {

			if ( this.socket.writable ) {
				this.socket.end ( buffer )
			}

			if ( typeof this.socket.removeAllListeners === 'function')
				this.socket.removeAllListeners()
			
		}
		
	}
	private connectStat2_after ( retBuffer: Rfc1928.Requests, cmd: string ) {
		if ( this.keep ) {
			this.socket.once ( 'data', ( data: Buffer ) => {
				/*
				const header = new HttpProxyHeader.httpProxy ( data )
				
				if ( this.hostList.putListSock5 ( this.host, IsSslConnect ? null : header ))
					return this.closeSocks5 ( HTTP_403 )
				
				if (  header.cachePath && this.cacheKeepTime ) {
					return this.proxyCacheSave ( header, ( err, data1: Buffer ) => {
						if ( !data1 ) {
							this.mainSsWrite = new mainSSWrite ( this.vpnServerSocket, this.masterPassword, IsSslConnect ( data ), this.id, 0 )
							this.socket.pipe ( this.mainSsWrite )
							if ( this.savePath )
								return this.save ( header.BufferWithOutKeepAlife )
							return this.save ( data )
						}
						
						this.ending = true
						return this.endConnect ( data1 )

					})
				}
				*/
				
			})

			return this.socket.write ( retBuffer.buffer )
			
		}

		return this.closeSocks5 ( retBuffer.buffer )

	}
	
	private connectStat2 ( data: Buffer ) {
		
		const req = new Rfc1928.Requests ( data )
		this.ATYP = req.ATYP
		this.host = req.host
		this.port = req.port
		this.cmd = req.cmd
		
		const localIp = this.socket.localAddress.split (':')[3]
		const retBuffer = new Rfc1928.Requests ( respon_se )
		retBuffer.ATYP_IP4Address = localIp
		
		let cmd = ''
		
		switch ( this.cmd ) {
			case Rfc1928.CMD.CONNECT:
				this.keep = true
				console.log ('got Rfc1928.CMD.CONNECT',this.ATYP)
			break

			case Rfc1928.CMD.BIND:
				cmd = 'Rfc1928.CMD.BIND'
				console.log ('Rfc1928.CMD.BIND request')
				retBuffer.REP = Rfc1928.Replies.COMMAND_NOT_SUPPORTED_or_PROTOCOL_ERROR
			break

			case Rfc1928.CMD.UDP_ASSOCIATE:
				cmd = 'Rfc1928.CMD.UDP_ASSOCIATE'
				console.log ('Rfc1928.CMD.UDP_ASSOCIATE')
				retBuffer.REP = Rfc1928.Replies.COMMAND_NOT_SUPPORTED_or_PROTOCOL_ERROR
			break
			default:
				retBuffer.REP = Rfc1928.Replies.COMMAND_NOT_SUPPORTED_or_PROTOCOL_ERROR
			break
		}

		return this.connectStat2_after ( retBuffer, cmd )
	}
	
	constructor ( private socket: Net.Socket ) {
		
		this.socket.once ( 'data', ( chunk: Buffer ) => {	
			return this.connectStat2 ( chunk )
		})

		this.socket.write ( res_NO_AUTHENTICATION_REQUIRED )
	}
}

const httpProxy = ( clientSocket: Net.Socket, buffer: Buffer, useGatWay: boolean, ip6: boolean, connectTimeOut: number,  
	domainListPool: Map < string, domainData >, gatway: gateWay, checkAgainTime: number, blackDomainList: string[] ) => {

	const httpHead = new HttpProxyHeader ( buffer )
	const hostName = httpHead.Url.hostname
	const userAgent = httpHead.headers [ 'user-agent' ]

	const CallBack = ( err?: Error, _data?: Buffer ) => {
		if ( err ) {
			if ( useGatWay && _data && _data.length && clientSocket.writable ) {
				const uuuu : VE_IPptpStream = {
					uuid: Crypto.randomBytes (10).toString ('hex'),
					host: hostName,
					buffer: _data.toString ( 'base64' ),
					cmd: Rfc1928.CMD.CONNECT,
					ATYP: Rfc1928.ATYP.IP_V4,
					port: parseInt ( httpHead.Url.port || httpHead.isHttps ? '443' : '80' )
				}


				const id = `[${ clientSocket.remoteAddress.split(':')[3] }:${ clientSocket.remotePort }][${ uuuu.uuid }] `
				console.log ( ` ${id} [${ hostName }]`, 'try use gateway\n' )
				return gatway.requestGetWay ( id, uuuu, userAgent, clientSocket )
				
			}

			return clientSocket.end ( HTTP_403 )
		}
		return
	}

	return checkDomain ( blackDomainList, hostName, ( err, result: boolean ) => {

		if ( result ) {
			return clientSocket.end ( HTTP_403 )
		}

		const port = parseInt ( httpHead.Url.port ||  httpHead.isHttps ? '443' : '80' )
		const isIp = Net.isIP ( hostName )
		const hostIp: domainData = ! isIp ? domainListPool.get ( hostName ) : { dns: [{ family: isIp, address: hostName, expire: null, connect: [] }], expire: null }
        
        if ( ! hostIp ) {
			
			return isAllBlackedByFireWall ( hostName,  ip6, checkAgainTime, gatway, userAgent, domainListPool, ( err, _hostIp ) => {
				if ( err ) {
					return closeClientSocket ( clientSocket, 504, null )
				}

				if ( ! _hostIp ) {
					console.log ( 'isAllBlackedByFireWall back no _hostIp' )
					return CallBack ( new Error ( 'have not host info' ))
				}

				domainListPool.set ( hostName, _hostIp )

				return tryConnectHost ( hostName, _hostIp, port, buffer, clientSocket, httpHead.isConnect, checkAgainTime, connectTimeOut, useGatWay, CallBack )
			})
		}

		return tryConnectHost ( hostName, hostIp, port, buffer, clientSocket, httpHead.isConnect, checkAgainTime, connectTimeOut, useGatWay, CallBack )

	})

}

const httpProxyTest = ( socket: Net.Socket, data: Buffer,  gateway: gateWay ) => {
	const httpHead = new HttpProxyHeader ( data )
	const port = parseInt ( httpHead.Url.port ||  httpHead.isHttps ? '443' : '80' )
	const hostName = httpHead.Url.hostname
	const userAgent = httpHead.headers [ 'user-agent' ]
	let first = true

	const localrequest = ( buf: Buffer ) => {
		if ( httpHead.isHttps && first ) {
			first = false
			console.log ('https connect!')
			socket.once ( 'data', _data => {
				return localrequest ( _data )
			})

			return closeClientSocket ( socket, -200, '' )
		}
		const net = Net.createConnection ( port, hostName, () => {
			const ls = new Compress.printStream ('>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
			const ls1 = new Compress.printStream ('<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
			net.pipe ( socket ).pipe( ls ).pipe ( net )
			net.write ( buf )
		})

	}

	const connectTestPort = ( buf: Buffer ) => {
		if ( httpHead.isHttps && first ) {
			first = false
			console.log ('https connect!')
			socket.once ( 'data', _data => {
				return connectTestPort ( _data )
			})

			return closeClientSocket ( socket, -200, '' )
		}
		const uuuu : VE_IPptpStream = {
			uuid: Crypto.randomBytes (10).toString ('hex'),
			host: hostName,
			buffer: buf.toString ( 'base64' ),
			cmd: Rfc1928.CMD.CONNECT,
			ATYP: Rfc1928.ATYP.IP_V4,
			port: port
		}
		const id = `[${ socket.remoteAddress.split(':')[3] }:${ socket.remotePort }][${ uuuu.uuid }]`
		console.log ( uuuu.buffer )
		return gateway.requestGetWayTest ( id, uuuu, userAgent, socket )
	}

	return connectTestPort ( data )
}

export default class proxyServer {

	private hostLocalIpv4: { network: string, address: string } []= null
	private hostLocalIpv6: string = null
	private hostGlobalIpV4: string = null
	private hostGlobalIpV6: string = null
	private network = false
	private getGlobalIpRunning = false

	private saveWhiteIpList () {
		if ( this.whiteIpList.length > 0 )
			Fs.writeFile ( Path.join( __dirname, whiteIpFile ), JSON.stringify( this.whiteIpList ), { encoding: 'utf8' }, err => {
				if ( err ) {
					return console.log ( `saveWhiteIpList save file error : ${ err.message }`)
				}
			})
	}


	private getGlobalIp = ( gateWay: gateWay ) => {
		if ( this.getGlobalIpRunning )
			return 
		this.getGlobalIpRunning = true

		gateWay.hostLookup ( testGatewayDomainName, null, ( err, data ) => {
			if ( err )
				return console.log ( 'getGlobalIp ERROR:', err.message )
			this.network = true
			this.hostLocalIpv6 ? console.log ( `LocalIpv6[ ${ this.hostLocalIpv6 } ]`) : null

			this.hostLocalIpv4.forEach ( n => {
				return console.log ( `LocalIpv4[ ${ n.address }]`)
			})

			this.hostGlobalIpV6 ? console.log ( `GlobalIpv6[ ${ this.hostGlobalIpV6 } ]`) : null
			
			this.hostGlobalIpV4 ? console.log ( `GlobalIpv4[ ${ this.hostGlobalIpV4 } ]`) : null

			const domain = data
			if ( ! domain )
				return console.log ( `[${ gateWay.serverIp } : ${ gateWay.serverPort }] Gateway connect Error!` )
			console.log ( `[${ gateWay.serverIp } : ${ gateWay.serverPort }] Gateway connect success!` )
			console.log ( '****************************************' )

		})

	}
    /*
	private getPac ( remoteIp: string, port: string ) {

		const ip6 = Net.isIP ( remoteIp )
		const hostIp = Ip.isPrivate ( remoteIp ) ? ip6 === 6 ? this.hostLocalIpv6 : Nekudo.getLocalNetWorkIp ( this.hostLocalIpv4, remoteIp ) : ip6 === 6 ? this.hostGlobalIpV6: this.hostGlobalIpV4

		const FindProxyForURL = `function FindProxyForURL ( url, host ) {return SOCKS5 ${ hostIp }:${ port };}`
		
		return _HTTP_200 ( FindProxyForURL )
	}
    */
	constructor ( private whiteIpList: string[], private domainListPool: Map < string, domainData >, 
		private port: number, private securityPath: string, private serverIp: string, private serverPort: number, private password: string, private checkAgainTimeOut: number, 
		private connectHostTimeOut: number, useGatWay: boolean, domainBlackList: string[] ) {

		const gateway = new gateWay ( serverIp, serverPort, password )

		this.getGlobalIp ( gateway )
		const server = Net.createServer ( socket => {
			const ip = socket.remoteAddress
			const isWhiteIp = this.whiteIpList.find ( n => { return n === ip }) ? true : false
			
			socket.once ( 'data', ( data: Buffer ) => {
				/*
				if ( ! isWhiteIp ) {
					console.log ('! isWhiteIp', data.toString ('utf8'))
					if ( testLogin ( data, this.securityPath )) {
						
						this.whiteIpList.push ( ip )
						this.saveWhiteIpList ()
						return socket.end ( this.getPac ( ip, port.toString ()))
					}
					
					return socket.end ()
				}
                */
				switch ( data.readUInt8 ( 0 )) {
					case 0x4:
						return console.log ( 'SOCK4 connect' )
					case 0x5:
						console.log ( 'socks5 connect' )
						return new socks5 ( socket )
					default:
						return httpProxy ( socket, data, useGatWay, this.hostGlobalIpV6 ? true : false, connectHostTimeOut, domainListPool, gateway, checkAgainTimeOut, domainBlackList )
				}
			})

			socket.on ( 'error', err => {
				console.log ( `[${ip}] socket.on error`, err.message )
			})
		})

		server.on ( 'error', err => {
			console.log ( 'proxy server :', err )
			return process.exit ( 1 )
		})

		server.listen ( port, () => {
			console.log ( '****************************************' )
			return console.log ( 'proxy start success on port :', port, 'security path = ', securityPath )
		})

	}

}

interface proxyServerInfo {
    serverAddress: string
    serverPort: number
    password: string
    allToGateway: boolean
    localPort: number
}
/*
remote.getCurrentWindow().once ( 'firstCallBack', ( data: proxyServerInfo ) => {
    const localProxyServer = new proxyServer ( [], new Map (), data.localPort, 'pac', data.serverAddress, data.serverPort, data.password, 5000, 50000, data.allToGateway, [])
})
    
remote.getCurrentWindow().emit ( 'first' )

*/