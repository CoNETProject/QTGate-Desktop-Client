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
import * as proxyServer from './qtGate_emailClient'
import * as Rfc1928 from './rfc1928'
import * as Crypto from 'crypto'
import * as Util from 'util'
import * as Net from 'net'
import * as res from './res'

const isSslFromBuffer = ( buffer ) => {
	const ret = /^\x16\x03|^\x80/.test ( buffer )
	return ret
}
const server_res = {
	NO_AUTHENTICATION_REQUIRED: new Buffer ('0500', 'hex')
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
				if ( this.proxyServer.useGatWay && _data && _data.length && this.socket.writable ) {
					const uuuu : VE_IPptpStream = {
						uuid: Crypto.randomBytes (10).toString ('hex'),
						host: this.host|| this.targetIpV4,
						buffer: _data.toString ( 'base64' ),
						cmd: Rfc1928.CMD.CONNECT,
						ATYP: Rfc1928.ATYP.IP_V4,
						port: this.port,
						ssl: isSslFromBuffer ( _data )
					}
	
					const id = `[${ this.clientIP }:${ this.port }][${ Util.inspect(uuuu) }] `
					
					return this.proxyServer.imapClass.newRemoteRequest ( this.socket, uuuu, uuuu.ssl )
					
				}
				
				return this.socket.end ( res.HTTP_403 )
			}
			return
		}

		this.socket.once ( 'data', ( _data: Buffer ) => {

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
		
		return proxyServer.checkDomainInBlackList ( this.proxyServer.domainBlackList, this.host || this.targetIpV4, ( err, result: boolean ) => {
			if ( result ) {
				console.log ( `[${ this.host }] Blocked!`)
				retBuffer.REP = Rfc1928.Replies.CONNECTION_NOT_ALLOWED_BY_RULESET
				return this.closeSocks5 ( retBuffer.buffer )
			}
			if ( this.host ) {
				return proxyServer.isAllBlackedByFireWall ( this.host, false, this.proxyServer.checkAgainTimeOut, this.proxyServer.imapClass, this.proxyServer.domainListPool, ( err, _hostIp ) => {
					if ( err ) {
						console.log ( `[${ this.host }] Blocked!`)
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
				console.log (`sock5 [${ this.host }]`)
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
		if ( this.cmd === Rfc1928.CMD.UDP_ASSOCIATE )
			return console.log ('')
		return this.connectStat2_after ( req )
	}

	constructor ( private socket: Net.Socket,private agent: string, private proxyServer: proxyServer.default ) {

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
	constructor ( private socket: Net.Socket, private buffer: Buffer, private agent: string, private proxyServer: proxyServer.default ) {
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
				if ( this.proxyServer.useGatWay && _data && _data.length && this.socket.writable ) {
					const uuuu : VE_IPptpStream = {
						uuid: Crypto.randomBytes (10).toString ('hex'),
						host: this.host || this.targetIpV4 ,
						buffer: _data.toString ( 'base64' ),
						cmd: Rfc1928.CMD.CONNECT,
						ATYP: Rfc1928.ATYP.IP_V4,
						port: this.port,
						ssl: isSslFromBuffer ( _data )
					}
					const id = `[${ this.clientIP }:${ this.port }][${ uuuu.uuid }] `
					return this.proxyServer.imapClass.newRemoteRequest ( this.socket, uuuu, uuuu.ssl )
				}
				
				return this.socket.end ( res.HTTP_403 )
			}
			return
		}

		this.socket.once ( 'data', ( _data: Buffer ) => {
			console.log (`connectStat2 [${ this.host||this.targetIpV4 }]get data `)
			proxyServer.tryConnectHost ( this.host, this.targetDomainData, this.port, _data, this.socket, false, this.proxyServer.checkAgainTimeOut,
				this.proxyServer.connectHostTimeOut, this.proxyServer.useGatWay, CallBack )
		})
		const buffer = this.req.request_4_granted ( !this.host ? null: this.targetDomainData[0].address, this.port )
		this.socket.write ( buffer )
		return this.socket.resume ()
	}
	public connectStat1 () {
		if ( this.host ) {
			this.targetDomainData = this.proxyServer.domainListPool.get ( this.host )
		}
		return proxyServer.checkDomainInBlackList ( this.proxyServer.domainBlackList, this.host || this.targetIpV4, ( err, result: boolean ) => {
			if ( result ) {
				console.log ( `[${ this.host }] Blocked!`)
				return this.socket.end ( this.req.request_failed )
			}
			if ( this.host ) {
				console.log (`socks4 host [${ this.host }]`)
				return proxyServer.isAllBlackedByFireWall ( this.host, false, this.proxyServer.checkAgainTimeOut,  this.proxyServer.imapClass, this.proxyServer.domainListPool, ( err, _hostIp ) => {
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
			console.log (`socks4 ipaddress [${ this.targetIpV4 }]`)
			return this.connectStat2 ()
			
		})
	}
}