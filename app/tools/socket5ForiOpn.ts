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
import * as Rfc1928 from './rfc1928'
import * as res from './res'
import * as os from 'os'
import * as Crypto from 'crypto'
import * as proxyServer from './proxyServer'
import * as Dgram from 'dgram'
import * as Util from 'util'

//	socks 5 headers

const server_res = {
	NO_AUTHENTICATION_REQUIRED: new Buffer ('0500', 'hex')
}

const isSslFromBuffer = ( buffer ) => {
	const ret = /^\x16\x03|^\x80/.test ( buffer )
	return ret
}

export class socks5 {
	private host: string = null
	public ATYP: number = null
	public port: number = null
	public cmd: number = null
	public targetIpV4: string = null
	public targetDomainData: domainData = null
	private keep = false
	private clientIP: string = this.socket.remoteAddress.split(':')[3] || this.socket.remoteAddress
	

	private closeSocks5 ( buffer: Buffer ) {
		console.log (`close proxy socket!`)
		if ( this.socket ) {
			if ( this.socket.writable ) {
				this.socket.end ( buffer )
			}

			if ( typeof this.socket.removeAllListeners === 'function' )
				this.socket.removeAllListeners()
		}
	}

	private connectStat3 ( data: Rfc1928.Requests ) {
		
		const CallBack = ( err?: Error, _data?: Buffer ) => {
			if ( err ) {
				if ( this.proxyServer.useGatWay && _data && _data.length && this.socket.writable && this.proxyServer.gateway ) {
					const uuuu : VE_IPptpStream1 = {
						uuid: Crypto.randomBytes (10).toString ('hex'),
						host: this.host|| this.targetIpV4,
						buffer: _data.toString ( 'base64' ),
						cmd: Rfc1928.CMD.CONNECT,
						ATYP: Rfc1928.ATYP.IP_V4,
						port: this.port,
						ssl: isSslFromBuffer ( _data )
					}
					//console.log ( Util.inspect ( uuuu ))
					//console.log (`doing gateway.requestGetWay ssl [${ uuuu.ssl }][${ uuuu.host }:${ uuuu.port }] cmd [${ uuuu.cmd }]`)
					const id = `[${ this.clientIP }:${ this.port }][${ Util.inspect(uuuu) }] `
					
					return this.proxyServer.gateway.requestGetWay ( id, uuuu, this.agent, this.socket )
					
				}
				console.log (`SOCK5 ! this.proxyServer.gateway STOP socket`)
				return this.socket.end ( res.HTTP_403 )
			}
			return
		}

		this.socket.once ( 'data', ( _data: Buffer ) => {
			//			gateway shutdown
			if ( !this.proxyServer.gateway ) {
				//console.log (`SOCK5 !this.proxyServer.gateway STOP sokcet! res.HTTP_403`)
				return this.socket.end ( res._HTTP_PROXY_302( this.proxyServer.localhost, this.proxyServer.managerServerPort ) )
			}
			proxyServer.tryConnectHost ( this.host || this.targetIpV4 , this.targetDomainData, this.port, _data, this.socket, false, this.proxyServer.checkAgainTimeOut, 
				this.proxyServer.connectHostTimeOut, this.proxyServer.useGatWay, CallBack )
		})
		data.REP = Rfc1928.Replies.GRANTED
		return this.socket.write ( data.buffer )
	}

	private connectStat2_after ( retBuffer: Rfc1928.Requests ) {

		if ( this.ATYP === Rfc1928.ATYP.DOMAINNAME ) {
			this.targetDomainData = this.proxyServer.domainListPool.get ( this.host )
		} else {
			this.targetDomainData = { dns: [{ family: 4, address: this.targetIpV4, expire: null, connect: [] }], expire: null }
		}

		//			gateway shutdown
		if ( !this.proxyServer.gateway ) {
			return this.connectStat3 ( retBuffer )
		}
		return proxyServer.checkDomainInBlackList ( this.proxyServer.domainBlackList, this.host || this.targetIpV4, ( err, result: boolean ) => {
			if ( result ) {
				console.log ( `host [${ this.host }] Blocked!`)
				retBuffer.REP = Rfc1928.Replies.CONNECTION_NOT_ALLOWED_BY_RULESET
				return this.closeSocks5 ( retBuffer.buffer )
			}
			if ( this.host && !this.proxyServer.useGatWay ) {
				return proxyServer.isAllBlackedByFireWall ( this.host, false, this.proxyServer.gateway, this.agent, this.proxyServer.domainListPool, ( err, _hostIp ) => {
					if ( err ) {
						console.log ( `host [${ this.host }] Blocked!`)
						retBuffer.REP = Rfc1928.Replies.CONNECTION_NOT_ALLOWED_BY_RULESET
						return this.closeSocks5 ( retBuffer.buffer )
					}
	
					if ( ! _hostIp ) {
						console.log ( 'isAllBlackedByFireWall back no _hostIp' )
						retBuffer.REP = Rfc1928.Replies.HOST_UNREACHABLE
						return this.closeSocks5 ( retBuffer.buffer )
					}

					this.proxyServer.domainListPool.set ( this.host, _hostIp )
					this.targetDomainData = _hostIp
					return this.connectStat3 ( retBuffer )
				})
			}
			return this.connectStat3 ( retBuffer )
			
		})
	}
	/*
	private udpProcess ( data: Rfc1928.Requests ) {
		data.REP = Rfc1928.Replies.GRANTED
		return this.socket.write ( data.buffer )
	}
	*/
	private connectStat2 ( data: Buffer ) {

		const req = new Rfc1928.Requests ( data )

		this.ATYP = req.ATYP
		this.host = req.domainName
		this.port = req.port
		this.cmd = req.cmd
		this.targetIpV4 = req.ATYP_IP4Address

		//.serverIP = this.socket.localAddress.split (':')[3]

		//		IPv6 not support!
		
		switch ( this.cmd ) {

			case Rfc1928.CMD.CONNECT: {
				//console.log (`sock5 [${ this.host }]`)
				this.keep = true
				break
			}
			case Rfc1928.CMD.BIND: {
				console.log ( `Rfc1928.CMD.BIND request data[${ data.toString('hex')}]` )
				break
			}
			case Rfc1928.CMD.UDP_ASSOCIATE: {
				this.keep = true
				console.log( `Rfc1928.CMD.UDP_ASSOCIATE data[${ data.toString ('hex')}]` )
				break
			}
			default:
				break
		}

		//			IPv6 not support 
		if ( req.IPv6 ) {
			this.keep = false
		}
		if ( ! this.keep ) {
			req.REP = Rfc1928.Replies.COMMAND_NOT_SUPPORTED_or_PROTOCOL_ERROR
			return this.closeSocks5 ( req.buffer )
		}
		if ( this.cmd === Rfc1928.CMD.UDP_ASSOCIATE ) {
			return console.log ('this.cmd === Rfc1928.CMD.UDP_ASSOCIATE skip!')
		}
			
		return this.connectStat2_after ( req )
	}

	constructor ( private socket: Net.Socket,private agent: string, private proxyServer: proxyServer.proxyServer ) {
		//console.log (`new socks 5`)
		this.socket.once ( 'data', ( chunk: Buffer ) => {
			return this.connectStat2 ( chunk )
		})
		this.socket.write ( server_res.NO_AUTHENTICATION_REQUIRED )
		this.socket.resume ()
	}
}

export class sockt4 {
	private req = new Rfc1928.socket4Requests ( this.buffer )
	private host = this.req.domainName
	private port = this.req.port
	private cmd = this.req.cmd
	private targetIpV4 = this.req.targetIp
	private targetDomainData: domainData = null
	private clientIP = this.socket
	private keep = false
	constructor ( private socket: Net.Socket, private buffer: Buffer, private agent: string, private proxyServer: proxyServer.proxyServer ) {
		console.log (`new socks 4`)
		switch ( this.cmd ) {
			case Rfc1928.CMD.CONNECT: {
				this.keep = true
				break
			}
			case Rfc1928.CMD.BIND: {
				console.log ( 'establish a TCP/IP port binding' )
				console.log ( this.req.buffer.toString('hex'))
				break
			}
			case Rfc1928.CMD.UDP_ASSOCIATE: {
				console.log ( 'associate a UDP port')
				console.log ( this.req.buffer.toString('hex') )
				break
			}
			default:
			break
		}
		if ( ! this.keep ) {
			this.socket.end ( this.req.request_failed )
			return
		}
		this.socket.pause ()
		this.connectStat1 ()

	}
	public connectStat2 () {
		const CallBack = ( err?: Error, _data?: Buffer ) => {
			if ( err ) {
				if ( this.proxyServer.useGatWay && _data && _data.length && this.socket.writable && this.proxyServer.gateway ) {
					const uuuu : VE_IPptpStream1 = {
						uuid: Crypto.randomBytes (10).toString ('hex'),
						host: this.host || this.targetIpV4 ,
						buffer: _data.toString ( 'base64' ),
						cmd: Rfc1928.CMD.CONNECT,
						ATYP: Rfc1928.ATYP.IP_V4,
						port: this.port,
						ssl: isSslFromBuffer ( _data )
					}
					const id = `[${ this.clientIP }:${ this.port }][${ uuuu.uuid }] `
					return this.proxyServer.gateway.requestGetWay ( id, uuuu, this.agent, this.socket )
				}
				console.log (`SOCK4 connectStat2 this.proxyServer.gateway === null`)
				return this.socket.end ( res.HTTP_403 )
			}
			return
		}

		this.socket.once ( 'data', ( _data: Buffer ) => {
			console.log (`connectStat2 [${ this.host||this.targetIpV4 }]get data `)
			if ( !this.proxyServer.gateway ) {
				console.log (`SOCK4 !this.proxyServer.gateway STOP sokcet! res.HTTP_403`)
				this.socket.end ( res._HTTP_PROXY_302 ( this.proxyServer.localhost, this.proxyServer.managerServerPort ) )
			}
			proxyServer.tryConnectHost ( this.host, this.targetDomainData, this.port, _data, this.socket, false, this.proxyServer.checkAgainTimeOut, 
				this.proxyServer.connectHostTimeOut, this.proxyServer.useGatWay, CallBack )
		})
		const buffer = this.req.request_4_granted ( !this.host ? null: this.targetDomainData.dns[0].address, this.port )
		this.socket.write ( buffer )
		return this.socket.resume ()
	}
	public connectStat1 () {
		if ( this.host ) {
			this.targetDomainData = this.proxyServer.domainListPool.get ( this.host )
		}
		//		gateway server shutdoan
		if ( !this.proxyServer.gateway ) {
			return this.connectStat2 ()
		}
		return proxyServer.checkDomainInBlackList ( this.proxyServer.domainBlackList, this.host || this.targetIpV4, ( err, result: boolean ) => {
			if ( result ) {
				console.log ( `[${ this.host }] Blocked!`)
				return this.socket.end ( this.req.request_failed )
			}
			if ( this.host && !this.proxyServer.useGatWay ) {
				console.log (`socks4 host [${ this.host }]`)
				return proxyServer.isAllBlackedByFireWall ( this.host, false, this.proxyServer.gateway, this.agent, this.proxyServer.domainListPool, ( err, _hostIp ) => {
					if ( err ) {
						console.log ( `[${ this.host }] Blocked!`)
						return this.socket.end ( this.req.request_failed )
					}
	
					if ( ! _hostIp ) {
						console.log ( 'isAllBlackedByFireWall back no _hostIp' )
						return this.socket.end ( this.req.request_failed )
					}
					
					this.proxyServer.domainListPool.set ( this.host, _hostIp )
					this.targetDomainData = _hostIp
					return this.connectStat2 ()
				})
			}
			console.log ( `socks4 ipaddress [${ this.targetIpV4 }]`)
			return this.connectStat2 ()
			
		})
	}
}
/*
export class UdpDgram {
	private server: Dgram.Socket = null
	public port = 0

	private createDgram () {
		this.server = Dgram.createSocket ( 'udp4' )
		
		this.server.once ( 'error', err => {
			console.log ( 'server.once error close server!', err  )
			this.server.close ()
		})

		this.server.on ( 'message', ( msg: Buffer, rinfo ) => {
			console.log(`UdpDgram server msg: ${ msg.toString('hex') } from ${ rinfo.address }:${ rinfo.port }`)
		})

		this.server.once ( 'listening', () => {
			const address = this.server.address()
			this.port = address.port
			console.log ( `server listening ${ address.address }:${ address.port }` )
		})

		this.server.bind ({ port: 0 } , ( err, kkk ) => {
			if ( err ) {
				return console.log ( `server.bind ERROR`, err )
			}
			console.log ( kkk )
		})
	}
	constructor () {
		this.createDgram ()
	}
}
*/
