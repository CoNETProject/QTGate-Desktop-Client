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

import * as Fs from 'fs'
import * as Path from 'path'
import * as Dns from 'dns'
import * as Net from 'net'
//import socks5 from './socket5'
import * as Crypto from 'crypto'
import HttpProxyHeader from './httpProxy'
import * as Rfc1928 from './rfc1928'
import * as res from './res'
import * as Async from 'async'
import * as imapClass from './imapClass'
import * as Socks from './socket5ForiAtOpn'
import { Socket } from 'net';
const { remote } = require ( "electron" )

interface dnsAddress {
	address: string
	family: number
	expire: Date
	connect: number[]
}

const whiteIpFile = 'whiteIpList.json'
const testGatewayDomainName = 'www.google.com'
const ipConnectResetTime = 1000 * 60 * 5
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

export const isAllBlackedByFireWall = ( hostName: string, ip6: boolean, checkAgainTime: number, imapClass: imapClass.imapClientControl, domainListPool: Map < string, domainData >,
	CallBack: ( err?: Error, hostIp?: domainData ) => void ) => {

	const hostIp = domainListPool.get ( hostName )
	const now = new Date ().getTime ()

	if ( ! hostIp || hostIp.expire < now ) {
		console.log ( `imapClass.nslookupRequest [${ hostName }]`)
		return imapClass.nslookupRequest ( hostName, ( err, ipadd ) => {
			if ( err ) {
				CallBack ( err )
				return console.log ( `imapClass.nslookupRequest callback err `, err )
			}
				
			try {
				const ret = JSON.parse ( ipadd.toString())
				return CallBack ( null, ret )
			} catch ( ex ) {
				return CallBack ( ex )
			}
			
		})
	}
		
		
	return CallBack ( null, hostIp )
}

export const checkDomainInBlackList = ( domainBlackList: string[], domain: string, CallBack ) => {
	
	if ( Net.isIP ( domain )) {
		return CallBack ( null, domainBlackList.find ( n => { return n === domain }) ? true : false )
	}
	const domainS = domain.split ('.')
	return Async.some ( domainBlackList, ( n, next ) => {
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

const httpImapProxy = ( imapClass: imapClass.imapClientControl, clientSocket: Net.Socket, buffer: Buffer, useGatWay: boolean, supportIp6: boolean, 
	connectHostTimeOut: number, domainListPool: Map < string, domainData >, checkAgainTimeOut: number, domainBlackList: string [] ) => {
	
	//
	const httpHead = new HttpProxyHeader ( buffer )
	const hostName = httpHead.Url.hostname
	const userAgent = httpHead.headers [ 'user-agent' ]
	const CallBack = ( err?: Error, _data?: Buffer ) => {
		if ( err ) {
			if ( useGatWay && _data && _data.length ) {
				const uuuu : VE_IPptpStream = {
					uuid: Crypto.randomBytes (10).toString ('hex'),
					host: hostName,
					buffer: _data.toString ( 'base64' ),
					cmd: Rfc1928.CMD.CONNECT,
					ATYP: Rfc1928.ATYP.IP_V4,
					ssl: httpHead.isHttps,
					port: parseInt ( httpHead.Url.port || httpHead.isHttps ? '443' : '80' )
				}
				const ip = clientSocket.remoteAddress.split(':')[3]|| clientSocket.remoteAddress
				const id = `[${ ip }:${ clientSocket.remotePort }][${ uuuu.uuid }] `
				console.log ( `${id} [${ hostName }] try use gateway\n` )
				return imapClass.newRemoteRequest ( clientSocket, uuuu, httpHead.isHttps )
				
			}

			return clientSocket.end ( res.HTTP_403 )
		}
		return
	}
	return checkDomainInBlackList ( domainBlackList, hostName, ( err, isBlack: boolean ) => {
		if ( isBlack ) {
			return clientSocket.end ( res.HTTP_403 )
		}
		const port = parseInt ( httpHead.Url.port ||  httpHead.isHttps ? '443' : '80' )
		const isIp = Net.isIP ( hostName )
		const hostIp: domainData = ! isIp ? domainListPool.get ( hostName ) : { dns: [{ family: isIp, address: hostName, expire: null, connect: [] }], expire: null }
		if ( ! hostIp ) {

			return isAllBlackedByFireWall ( hostName, false, checkAgainTimeOut, imapClass, domainListPool, ( err, _hostIp ) => {
				if ( err ) {
					console.log ( `isAllBlackedByFireWall [${ hostName }] got Error!`, err )
					return closeClientSocket ( clientSocket, 504, null )
				}

				if ( ! _hostIp ) {
					console.log ( 'isAllBlackedByFireWall back no _hostIp' )
					return closeClientSocket ( clientSocket, 504, null )
				}
				domainListPool.set ( hostName, _hostIp )

				return tryConnectHost ( hostName, _hostIp, port, buffer, clientSocket, httpHead.isConnect, checkAgainTimeOut, connectHostTimeOut, useGatWay, CallBack )
			})
		}

		return tryConnectHost ( hostName, hostIp, port, buffer, clientSocket, httpHead.isConnect, checkAgainTimeOut, connectHostTimeOut, useGatWay, CallBack )


	})

}

const getPac = ( hostIp: string, port: number, http: boolean, sock5: boolean ) => {
	
		const FindProxyForURL = `function FindProxyForURL ( url, host )
		{
			if ( isInNet ( dnsResolve( host ), "0.0.0.0", "255.0.0.0") ||
			isInNet( dnsResolve( host ), "172.16.0.0", "255.240.255.0") ||
			isInNet( dnsResolve( host ), "127.0.0.0", "255.255.255.0") ||
			isInNet ( dnsResolve( host ), "192.168.0.0", "255.255.0.0" ) ||
			isInNet ( dnsResolve( host ), "10.0.0.0", "255.0.0.0" )) {
				return "DIRECT";
			}
			return "${ http ? 'PROXY': ( sock5 ? 'SOCKS5' : 'SOCKS' ) } ${ hostIp }:${ port.toString() }";
		
		}`
		//return "${ http ? 'PROXY': ( sock5 ? 'SOCKS5' : 'SOCKS' ) } ${ hostIp }:${ port.toString() }; ";
		return res.Http_Pac ( FindProxyForURL )
	}
export default class imapProxyServer {
	
	private hostLocalIpv4: { network: string, address: string } []= []
	private hostLocalIpv6: string = null
	private hostGlobalIpV4: string = null
	private hostGlobalIpV6: string = null
	private network = false
	private getGlobalIpRunning = false
	public imapClass = new imapClass.imapClientControl ( this.imapData )

	private saveWhiteIpList () {
		if ( this.whiteIpList.length > 0 )
			return Fs.writeFile ( Path.join( __dirname, whiteIpFile ), JSON.stringify( this.whiteIpList ), { encoding: 'utf8' }, err => {
				if ( err ) {
					return console.log ( `saveWhiteIpList save file error : ${ err.message }`)
				}
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
	constructor ( private whiteIpList: string[], public domainListPool: Map < string, domainData >, 
		private port: number, private securityPath: string, public checkAgainTimeOut: number, private imapData: IinputData,
		public connectHostTimeOut: number, public useGatWay: boolean, public domainBlackList: string[] ) {

		const server = Net.createServer ( socket => {
			const ip = socket.remoteAddress
			const isWhiteIp = this.whiteIpList.find ( n => { return n === ip }) ? true : false
			let socks = null
			let agent = null
			socket.once ( 'data', ( data: Buffer ) => {
				const dataStr = data.toString()
				if ( /^GET \/pac/.test ( dataStr )) {
					const httpHead = new HttpProxyHeader ( data )
					agent = httpHead.headers['user-agent']
					const sock5 = /Firefox/i.test (agent) || /Windows NT|Darwin|Firefox/i.test ( agent ) && ! /CFNetwork|WOW64/i.test ( agent )
					
					
					const ret = getPac ( httpHead.host, this.port, /pacHttp/.test( dataStr ), sock5 )
					console.log ( `/GET \/pac from :[${ socket.remoteAddress }] sock5 [${ sock5 }] agent [${ agent }] httpHead.headers [${ Object.keys(httpHead.headers)}]`)
					console.log ( dataStr )
					console.log ( ret )
					return socket.end ( ret )
				}
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
					case 0x4: {
						console.log ( 'SOCK4 connect' )
						return socks = new Socks.sockt4 ( socket, data, agent, this )
					}
						
					case 0x5: {
						console.log ( 'socks5 connect' )
						return socks = new Socks.socks5 ( socket, agent, this )
					}

					default: {
						return httpImapProxy ( this.imapClass, socket, data, useGatWay, this.hostGlobalIpV6 ? true : false,  connectHostTimeOut,
							domainListPool, checkAgainTimeOut, domainBlackList )
					}
						
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

const checkAgainTimeOut = 1000 * 60 * 5
const whiteList = []
const domainBlackList = []
const domainListPool = new Map ()
const socketPath = 'pac'

remote.getCurrentWindow().once ( 'firstCallBack', ( data: IConnectCommand ) => {
	console.log ( data )
	const server = new imapProxyServer ( whiteList, domainListPool, data.localServerPort, socketPath, checkAgainTimeOut, data.imapData, 5000, data.AllDataToGateway, domainBlackList )
	
})

remote.getCurrentWindow().emit ( 'first' )
