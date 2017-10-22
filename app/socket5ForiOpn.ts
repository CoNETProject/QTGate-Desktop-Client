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

import * as Net from 'net'
import * as Rfc1928 from './rfc1928'
import * as res from './res'
import * as os from 'os'
import * as Crypto from 'crypto'
import * as proxyServer from './proxyServer'
//	socks 5 headers

const server_res = {
	NO_AUTHENTICATION_REQUIRED: new Buffer ('0500', 'hex')
}

const isSslFromBuffer = ( buffer ) => {
	console.log ( buffer.toString ('hex'))
	const ret = /^\x16[\x2c-\xff]\x01\x00[\x00-\x05].[\x00-\x09][\x00-\x1f]|^\x80[\x0f-\xff]\x01[\x00-\x09][\x00-\x1f][\x00-\x05].\x00.\x00./.test ( buffer )
	
	console.log ( `ret [${ ret }]`)
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
	private clientIP: string = this.socket.remoteAddress.split(':')[3]||this.socket.remoteAddress
	

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
						host: this.host,
						buffer: _data.toString ( 'base64' ),
						cmd: Rfc1928.CMD.CONNECT,
						ATYP: Rfc1928.ATYP.IP_V4,
						port: this.port,
						ssl: isSslFromBuffer ( _data )
					}
	
					const id = `[${ this.clientIP }:${ this.port }][${ uuuu.uuid }] `
					console.log ( ` ${id} [${ this.host }]`, 'try use gateway\n' )
					return this.proxyServer.gateway.requestGetWay ( id, uuuu, 'Mozilla/5.0', this.socket )
					
				}
				
				return this.socket.end ( res.HTTP_403 )
			}
			return
		}

		this.socket.once ( 'data', ( _data: Buffer ) => {

			proxyServer.tryConnectHost ( this.host, this.targetDomainData, this.port, _data, this.socket, false, this.proxyServer.checkAgainTimeOut, 
				this.proxyServer.connectHostTimeOut, this.proxyServer.useGatWay, CallBack )
		})
		data.REP = Rfc1928.Replies.GRANTED
		return this.socket.write ( data.buffer )
	}

	private connectStat2_after ( retBuffer: Rfc1928.Requests, cmd: string ) {
		
			
		if ( this.ATYP === Rfc1928.ATYP.DOMAINNAME ) {
			this.targetDomainData = this.proxyServer.domainListPool.get ( this.host = retBuffer.domainName )
		} else {
			this.targetDomainData = { dns: [{ family: 4, address:this.targetIpV4 = retBuffer.ATYP_IP4Address, expire: null, connect: [] }], expire: null }
		}
		
		return proxyServer.checkDomainInBlackList ( this.proxyServer.domainBlackList, this.host || this.targetIpV4, ( err, result: boolean ) => {
			if ( result ) {
				console.log ( `[${ this.host }] Blocked!`)
				retBuffer.REP = Rfc1928.Replies.CONNECTION_NOT_ALLOWED_BY_RULESET
				return this.closeSocks5 ( retBuffer.buffer )
			}
			if ( this.host ) {
				return proxyServer.isAllBlackedByFireWall ( this.host, false, this.proxyServer.gateway, 'Mozilla/5.0', this.proxyServer.domainListPool, ( err, _hostIp ) => {
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

	private connectStat2 ( data: Buffer ) {

		const req = new Rfc1928.Requests ( data )

		this.ATYP = req.ATYP
		this.host = req.host
		this.port = req.port
		this.cmd = req.cmd
		this.clientIP = this.socket.localAddress.split (':')[3]
		const retBuffer = new Rfc1928.Requests ( data )
		retBuffer.ATYP_IP4Address = this.clientIP

		let cmd = ''

		//		IPv6 not support!
		
		
		switch ( this.cmd ) {

			case Rfc1928.CMD.CONNECT: {
				this.keep = true
				console.log ( 'got Rfc1928.CMD.CONNECT', this.ATYP )
				break
			}
			case Rfc1928.CMD.BIND: {
				cmd = 'Rfc1928.CMD.BIND'
				console.log ( 'Rfc1928.CMD.BIND request' )
				break
			}
			case Rfc1928.CMD.UDP_ASSOCIATE: {
				cmd = 'Rfc1928.CMD.UDP_ASSOCIATE'
				console.log('Rfc1928.CMD.UDP_ASSOCIATE')
				break
			}
			default:
				break
		}

		//			IPv6 not support 
		if ( retBuffer.IPv6 ) {
			this.keep = false
		}
		if ( ! this.keep ) {
			retBuffer.REP = Rfc1928.Replies.COMMAND_NOT_SUPPORTED_or_PROTOCOL_ERROR
			return this.closeSocks5 ( retBuffer.buffer )
		}

		return this.connectStat2_after ( retBuffer, cmd )
	}

	constructor ( private socket: Net.Socket, private proxyServer: proxyServer.proxyServer ) {

		this.socket.once ( 'data', ( chunk: Buffer ) => {
			return this.connectStat2 ( chunk )
		})
		this.socket.write ( server_res.NO_AUTHENTICATION_REQUIRED )
		this.socket.resume ()
	}
}
const sock4_res = {

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
	constructor ( private socket: Net.Socket, private buffer: Buffer, private proxyServer: proxyServer.proxyServer ) {
		switch ( this.cmd ) {
			case Rfc1928.CMD.CONNECT: {
				this.keep = true
				break
			}
			case Rfc1928.CMD.BIND: {
				console.log ( 'Rfc1928.CMD.BIND request' )
				break
			}
			case Rfc1928.CMD.UDP_ASSOCIATE: {
				console.log('Rfc1928.CMD.UDP_ASSOCIATE')
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
		console.log ( buffer.toString ('hex'))
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
					console.log ( ` ${id} [${ this.host }]`, 'try use gateway\n' )
					return this.proxyServer.gateway.requestGetWay ( id, uuuu, 'Mozilla/5.0', this.socket )
					
				}
				
				return this.socket.end ( res.HTTP_403 )
			}
			return
		}

		this.socket.once ( 'data', ( _data: Buffer ) => {
			console.log ( _data.toString ())
			proxyServer.tryConnectHost ( this.host, this.targetDomainData, this.port, _data, this.socket, false, this.proxyServer.checkAgainTimeOut, 
				this.proxyServer.connectHostTimeOut, this.proxyServer.useGatWay, CallBack )
		})
		console.log ( `this.socket.write ( this.req.request_granted )`)
		const buffer = this.req.request_granted ( !this.host ? null: this.targetDomainData.dns[0].address, this.port )
		this.socket.write ( buffer )
		return this.socket.resume ()
	}
	public connectStat1 () {
		if ( this.host ) {
			this.targetDomainData = this.proxyServer.domainListPool.get ( this.host )
		}
		console.log ( `connectStat1 `)
		return proxyServer.checkDomainInBlackList ( this.proxyServer.domainBlackList, this.host || this.targetIpV4, ( err, result: boolean ) => {
			if ( result ) {
				console.log ( `[${ this.host }] Blocked!`)
				return this.socket.end ( this.req.request_failed )
			}
			if ( this.host ) {
				console.log ( `this.host [${ this.host }]`)
				return proxyServer.isAllBlackedByFireWall ( this.host, false, this.proxyServer.gateway, 'Mozilla/5.0', this.proxyServer.domainListPool, ( err, _hostIp ) => {
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
			return this.connectStat2 ()
			
		})
	}
}