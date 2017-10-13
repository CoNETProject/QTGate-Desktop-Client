import * as Net from 'net'
import * as Rfc1928 from './rfc1928'
import * as res from './res'
import * as os from 'os'
//	socks 5 headers
const res_NO_AUTHENTICATION_REQUIRED = new Buffer ( '0500', 'hex' )
const respon_se = new Buffer ( '05000001000000000000', 'hex' )
export default class socks5 {
	private host: string
	public ATYP: number
	public port: number
	public cmd: number
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
		const retBuffer = new Rfc1928.Requests ( data )
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