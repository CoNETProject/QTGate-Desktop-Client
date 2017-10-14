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

/// <reference path="../typings/types/v7/index.d.ts" />
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
import socket5 from './socket5'
import gateWay from './gateway'
import * as Os from 'os'
const { remote } = require ( "electron" )

const whiteIpFile = 'whiteIpList.json'
Http.globalAgent.maxSockets = 1024
const ipConnectResetTime = 1000 * 60 * 5
/**
 * 			IPv6 support!
 */
const hostGlobalIpV6 = false

const managerPagePort = 8001

const testGatewayDomainName = 'www.google.com'

//	-
const IsSslConnect = ( buffer: Buffer ) => {
	
	const kk = buffer.toString ( 'hex', 0, 4 )
	
	return /^1603(01|02|03|00)|^80..0103|^(14|15|17)03(00|01)/.test (kk)
}

const checkDomainInBlackList = ( BlackLisk: string[], domain: string, CallBack ) => {

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

	if ( gateway || ! hostIp ) {
		return CallBack ( new Error ('useGateWay!'), data )
	}

	const now = new Date ().getTime ()

	console.log ( 'tryConnectHost do Async.someSeries hostIp:' )
	console.log ( hostIp )

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

const isAllBlackedByFireWall = ( hostName: string, ip6: boolean, checkAgainTime: number, gatway: gateWay, userAgent: string, domainListPool: Map < string, domainData >,
	CallBack: ( err?: Error, hostIp?: domainData ) => void ) => {

	const hostIp = domainListPool.get ( hostName )
	const now = new Date ().getTime ()
	if ( ! hostIp || hostIp.expire < now )
		return  gatway.hostLookup ( hostName, userAgent, ( err, ipadd ) => {
			return CallBack ( err, ipadd )
		})
	return CallBack ( null, hostIp )
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
					port: parseInt ( httpHead.Url.port || httpHead.isHttps ? '443' : '80' ),
					ssl: httpHead.isHttps
				}

				const id = `[${ clientSocket.remoteAddress.split(':')[3] }:${ clientSocket.remotePort }][${ uuuu.uuid }] `
				console.log ( ` ${id} [${ hostName }]`, 'try use gateway\n' )
				return gatway.requestGetWay ( id, uuuu, userAgent, clientSocket )
				
			}

			return clientSocket.end ( res.HTTP_403 )
		}
		return
	}

	return checkDomainInBlackList ( blackDomainList, hostName, ( err, result: boolean ) => {

		if ( result ) {
			return clientSocket.end ( res.HTTP_403 )
		}

		const port = parseInt ( httpHead.Url.port ||  httpHead.isHttps ? '443' : '80' )
		const isIp = Net.isIP ( hostName )
		const hostIp: domainData = ! isIp ? domainListPool.get ( hostName ) : { dns: [{ family: isIp, address: hostName, expire: null, connect: [] }], expire: null }
        
        if ( ! hostIp ) {
			console.log ( `domain connect to [${ hostName }]`)
			return isAllBlackedByFireWall ( hostName,  ip6, checkAgainTime, gatway, userAgent, domainListPool, ( err, _hostIp ) => {
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
*/
export default class proxyServer {

	private hostLocalIpv4: { network: string, address: string } []= []
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
			console.log ( data )
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
						return new socket5 ( socket )
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
			console.log (`remote server: [${ serverIp }]:[${ serverPort }]`)
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
let flag = 'w'
const QTGateFolder = Path.join ( Os.homedir(), '.QTGate' )
const proxyLogFile = Path.join ( QTGateFolder, 'proxy.log' )
const saveLog = ( log: string ) => {
	const data = `${ new Date().toUTCString () }: ${ log }\r\n`
	Fs.appendFile ( proxyLogFile, data, { flag: flag }, err => {
		flag = 'a'
	})
}


remote.getCurrentWindow().once ( 'firstCallBack', ( data: IConnectCommand ) => {
	console.log ( data )
	const server = new proxyServer ([], new Map(), data.localServerPort, 'pac', data.gateWayIpAddress, data.gateWayPort, data.imapData.randomPassword,
		 5000, 50000, data.AllDataToGateway, [] )
	
})

remote.getCurrentWindow().emit ( 'first' )
