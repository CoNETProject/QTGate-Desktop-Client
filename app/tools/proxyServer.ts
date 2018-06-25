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

import * as Net from 'net'
import * as Http from 'http'
import * as Dns from 'dns'
import HttpProxyHeader from './httpProxy'
import * as Async from 'async'
import * as Compress from './compress'
import * as util from 'util'
import * as Rfc1928 from './rfc1928'
import * as Crypto from 'crypto'
import * as res from './res'
import * as Stream from 'stream'
import * as Fs from 'fs'
import * as Path from 'path'
import * as Socks from './socket5ForiOpn'
import gateWay from './gateway'
import * as Os from 'os'
import * as Util from 'util'
const whiteIpFile = 'whiteIpList.json'
Http.globalAgent.maxSockets = 1024
const ipConnectResetTime = 1000 * 60 * 5
let flag = 'w'
const QTGateFolder = Path.join ( Os.homedir(), '.QTGate' )
const proxyLogFile = Path.join ( QTGateFolder, 'proxy.log' )
const saveLog = ( log: string ) => {
	const data = `${ new Date().toUTCString () }: ${ log }\r\n`
	Fs.appendFile ( proxyLogFile, data, { flag: flag }, err => {
		flag = 'a'
	})
}

/**
 * 			IPv6 support!
 */
const hostGlobalIpV6 = false

const managerPagePort = 8001

const testGatewayDomainName = 'www.google.com'

export const checkDomainInBlackList = ( BlackLisk: string[], domain: string, CallBack ) => {

	if ( Net.isIP ( domain )) {
		
		return CallBack ( null, BlackLisk.find ( n => { return n === domain }) ? true : false )
	}

	const domainS = domain.split ('.')
	return Async.some ( BlackLisk, ( n, next ) => {
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

const testLogin = ( req: Buffer, loginUserList: string ) => {
	
	const header = new HttpProxyHeader ( req )
	if ( header.isGet && header.Url.path === loginUserList )
		return true
    
	return false
}

const closeClientSocket = ( socket: Net.Socket, status: number, body: string ) => {
	if ( !socket || ! socket.writable )
		return
	let stat = res._HTTP_404
	switch ( status ) {
		case 502:
			stat = res._HTTP_502
			break;
		case 599:
			stat = res._HTTP_599
			break;
		case 598:
			stat = res._HTTP_598
			break;
		case -200:
			stat = res._HTTP_PROXY_200
			socket.write ( stat )
			return socket.resume ()
		default:
			break;
	}
	socket.end ( stat )
	return socket.resume ()
}

const _connect = ( hostname: string, hostIp: string, port: number, clientSocket: Net.Socket, data: Buffer, connectHostTimeOut: number,  CallBack ) => {
	console.log (`direct _connect!`)
	const socket = new Net.Socket()
	const ip = clientSocket.remoteAddress.split (':')[3]|| clientSocket.remoteAddress
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
		console.log ( `${ id } socket.on connect!`)

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

export const tryConnectHost = ( hostname: string, hostIp: domainData, port: number, data: Buffer, clientSocket: Net.Socket, isSSLConnect: boolean, 
	checkAgainTimeOut: number, connectTimeOut: number, gateway: boolean, CallBack ) => {

	if ( isSSLConnect ) {
		clientSocket.once ( 'data', ( _data: Buffer ) => {
			return tryConnectHost ( hostname, hostIp, port, _data, clientSocket, false, checkAgainTimeOut, connectTimeOut, gateway, CallBack )
		})
		return closeClientSocket ( clientSocket, -200, '' )
	}

	if ( gateway || ! hostIp ) {
		return CallBack ( new Error ( 'useGateWay!'), data )
	}

	const now = new Date ().getTime ()

	Async.someSeries ( hostIp.dns, ( n, next ) => {
		console.log ( n )

		if ( n.family === 6 && ! hostGlobalIpV6 ) {
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

export const isAllBlackedByFireWall = ( hostName: string, ip6: boolean, gatway: gateWay, userAgent: string, domainListPool: Map < string, domainData >,
	CallBack: ( err?: Error, hostIp?: domainData ) => void ) => {

	const hostIp = domainListPool.get ( hostName )
	const now = new Date ().getTime ()
	if ( ! hostIp || hostIp.expire < now )
		return  gatway.hostLookup ( hostName, userAgent, ( err, ipadd ) => {
			return CallBack ( err, ipadd )
		})
	return CallBack ( null, hostIp )
}

const isSslFromBuffer = ( buffer ) => {

	const ret = /^\x16\x03|^\x80/.test ( buffer )
	return ret
}

const httpProxy = ( clientSocket: Net.Socket, buffer: Buffer, useGatWay: boolean, ip6: boolean, connectTimeOut: number,  
	domainListPool: Map < string, domainData >, _gatway: gateWay, checkAgainTime: number, blackDomainList: string[], lostManagerServerIP: string , lostManagerServerPort: number ) => {

	const httpHead = new HttpProxyHeader ( buffer )
	const hostName = httpHead.Url.hostname
	const userAgent = httpHead.headers [ 'user-agent' ]

	const CallBack = ( err?: Error, _data?: Buffer ) => {

		if ( err ) {
			
			if ( useGatWay && _data && _data.length && clientSocket.writable ) {
				const uuuu : VE_IPptpStream1 = {
					uuid: Crypto.randomBytes (10).toString ('hex'),
					host: hostName,
					buffer: _data.toString ( 'base64' ),
					cmd: Rfc1928.CMD.CONNECT,
					ATYP: Rfc1928.ATYP.IP_V4,
					port: httpHead.Port,
					ssl: isSslFromBuffer ( _data )
				}

				const id = `[${ clientSocket.remoteAddress.split(':')[3] }:${ clientSocket.remotePort }][${ uuuu.uuid }] `
				if ( _gatway && typeof _gatway.requestGetWay === 'function' ) {
					return _gatway.requestGetWay ( id, uuuu, userAgent, clientSocket )
				}
				
				
			}

			
		}
		return clientSocket.end ( res.HTTP_403 )
		
	}

	
	if ( !_gatway || typeof _gatway.requestGetWay !== 'function') {
		console.log (`httpProxy !gateWay stop SOCKET res._HTTP_PROXY_302 `)
		return clientSocket.end ( res._HTTP_PROXY_302 ( lostManagerServerIP, lostManagerServerPort ))
	}

	console.log ( `new http proxy request`)
	return checkDomainInBlackList ( blackDomainList, hostName, ( err, result: boolean ) => {
		
		if ( result ) {
			console.log (`checkDomainInBlackList CallBack result === true`)
			return clientSocket.end ( res.HTTP_403 )
		}
		
		const port = parseInt ( httpHead.Url.port ||  httpHead.isHttps ? '443' : '80' )
		const isIp = Net.isIP ( hostName )
		const hostIp: domainData = ! isIp ? domainListPool.get ( hostName ) : { dns: [{ family: isIp, address: hostName, expire: null, connect: [] }], expire: null }
        
        if ( ! hostIp && ! useGatWay ) {

			return isAllBlackedByFireWall ( hostName,  ip6, _gatway, userAgent, domainListPool, ( err, _hostIp ) => {
				if ( err ) {
					console.log ( `[${ hostName }] Blocked!`)
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
/*
declare const isInNet:( a: string, y: string, z: string ) => string
declare const dnsResolve :( a: any ) => string
function FindProxyForURL ( url, host )
{
	if ( isInNet ( dnsResolve( host ), "0.0.0.0", "255.0.0.0") ||
		isInNet( dnsResolve( host ), "172.16.0.0", "255.240.255.0") ||
		isInNet( dnsResolve( host ), "127.0.0.0", "255.255.255.0") ||
		isInNet ( dnsResolve( host ), "192.168.0.0", "255.255.0.0" ) ||
		isInNet ( dnsResolve( host ), "10.0.0.0", "255.0.0.0" )) {
		return "DIRECT";
	}
	return "${ http ? 'PROXY': ( sock5 ? 'SOCKS5' : 'SOCKS' ) } ${ hostIp }:${ port.toString() }";
}
*/
const getPac = ( hostIp: string, port: string, http: boolean, sock5: boolean ) => {

	const FindProxyForURL = `function FindProxyForURL ( url, host )
	{
		if ( isInNet ( dnsResolve( host ), "0.0.0.0", "255.0.0.0") ||
		isInNet( dnsResolve( host ), "172.16.0.0", "255.240.255.0") ||
		isInNet( dnsResolve( host ), "127.0.0.0", "255.255.255.0") ||
		isInNet ( dnsResolve( host ), "192.168.0.0", "255.255.0.0" ) ||
		isInNet ( dnsResolve( host ), "10.0.0.0", "255.0.0.0" )) {
			return "DIRECT";
		}
		return "${ http ? 'PROXY': ( sock5 ? 'SOCKS5' : 'SOCKS' ) } ${ hostIp }:${ port }";
	
	}`
	//return "${ http ? 'PROXY': ( sock5 ? 'SOCKS5' : 'SOCKS' ) } ${ hostIp }:${ port.toString() }; ";
	return res.Http_Pac ( FindProxyForURL )
}

export class proxyServer {
	private hostLocalIpv4: { network: string, address: string } []= []
	private hostLocalIpv6: string = null
	private hostGlobalIpV4: string = null
	private hostGlobalIpV6: string = null
	private network = false
	private getGlobalIpRunning = false
	private server: Net.Server = null
	public gateway = new gateWay ( this.multipleGateway )
	
	private saveWhiteIpList () {
		if ( this.whiteIpList.length > 0 )
			Fs.writeFile ( Path.join( __dirname, whiteIpFile ), JSON.stringify( this.whiteIpList ), { encoding: 'utf8' }, err => {
				if ( err ) {
					return console.log ( `saveWhiteIpList save file error : ${ err.message }`)
				}
			})
	}

	private getGlobalIp = ( gateWay: gateWay ) => {
		if ( this.getGlobalIpRunning ) {

			return console.log (`getGlobalIp getGlobalIpRunning === true!, skip!`)
		}
			
		this.getGlobalIpRunning = true
		saveLog ( `doing getGlobalIp!`)
		gateWay.hostLookup ( testGatewayDomainName, null, ( err, data ) => {
			this.getGlobalIpRunning = false
			if ( err ) {
				return console.log ( 'getGlobalIp ERROR:', err.message )
			}
				
			console.log ( Util.inspect ( data ))
			
			this.hostLocalIpv6 ? console.log ( `LocalIpv6[ ${ this.hostLocalIpv6 } ]`) : null

			this.hostLocalIpv4.forEach ( n => {
				return console.log ( `LocalIpv4[ ${ n.address }]`)
			})

			this.hostGlobalIpV6 ? console.log ( `GlobalIpv6[ ${ this.hostGlobalIpV6 } ]`) : null
			
			this.hostGlobalIpV4 ? console.log ( `GlobalIpv4[ ${ this.hostGlobalIpV4 } ]`) : null

			const domain = data
			if ( ! domain ) {
				return console.log ( `[] Gateway connect Error!` )
			}
			this.network = true
			console.log ( '*************** Gateway connect ready *************************' )

		})

	}
    
	constructor ( public whiteIpList: string[], public domainListPool: Map < string, domainData >, 
		public port: string, private securityPath: string,  public checkAgainTimeOut: number, private multipleGateway: IConnectCommand[],
		public connectHostTimeOut: number, public useGatWay: boolean, public domainBlackList: string[], public localhost: string, public managerServerPort: number ) {
		this.getGlobalIp ( this.gateway )
		let socks = null
		this.server = Net.createServer ( socket => {
			const ip = socket.remoteAddress
			const isWhiteIp = this.whiteIpList.find ( n => { return n === ip }) ? true : false
			let agent = 'Mozilla/5.0'
				//	windows 7 GET PAC User-Agent: Mozilla/5.0 (compatible; IE 11.0; Win32; Trident/7.0)

			//		proxy auto setup support
			socket.once ( 'data', ( data: Buffer ) => {
				const dataStr = data.toString()
				if ( /^GET \/pac/.test ( dataStr )) {
					const httpHead = new HttpProxyHeader ( data )
					agent = httpHead.headers['user-agent']
					const sock5 = /Firefox/i.test ( agent ) || /Windows NT|WinHttp-Autoproxy-Service|Darwin/i.test ( agent ) && ! /CFNetwork|WOW64/i.test ( agent )
					
					
					const ret = getPac ( httpHead.host, this.port, /pacHttp/.test( dataStr ), sock5 )
					console.log ( `/GET \/pac from :[${ socket.remoteAddress }] sock5 [${ sock5 }] agent [${ agent }] httpHead.headers [${ Object.keys( httpHead.headers )}]`)
					console.log ( dataStr )
					console.log ( ret )
					return socket.end ( ret )
				}
				
				switch ( data.readUInt8 ( 0 )) {

					case 0x4:
						return socks = new Socks.sockt4 ( socket, data, agent, this )
					case 0x5:
						return socks = new Socks.socks5 ( socket, agent, this )
					default:
						return httpProxy ( socket, data, useGatWay, this.hostGlobalIpV6 ? true : false, connectHostTimeOut, domainListPool, this.gateway,
							checkAgainTimeOut, domainBlackList, this.localhost, this.managerServerPort )
				}
			})

			socket.on ( 'error', err => {
				socks = null
				//console.log ( `[${ip}] socket.on error`, err.message )
			})
			socket.once ( 'end', () => {
				socks = null
			})
		})

		this.server.on ( 'error', err => {
			console.log ( 'proxy server :', err )
			
		})

		this.server.listen ( port, () => {
			return console.log ( 'proxy start success on port :', port, 'security path = ', securityPath )
		})



	}

	public exit () {
		console.log (`************ proxyServer on exit ()`)
		this.gateway = null
	}


	public reNew ( multipleGateway: IConnectCommand[] ) {
		
		this.gateway = new gateWay ( this.multipleGateway = multipleGateway  )
	}

	public changeDocker ( data: IConnectCommand ) {

		const index = this.multipleGateway.findIndex ( n => { return n.containerUUID === data.containerUUID })
		if ( index < 0 ) {
			this.multipleGateway.push ( data )
			return saveLog (`on changeDocker [${ data.containerUUID }] Add it`)
		}
		this.multipleGateway [ index ] = data
		return this.gateway = new gateWay ( this.multipleGateway )
	}

}


