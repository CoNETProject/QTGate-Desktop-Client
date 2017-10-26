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

import * as Compress from './compress'
import * as Dns from 'dns'
import * as Net from 'net'
import * as res from './res'
import * as Stream from 'stream'
import * as Crypto from 'crypto'
import { homedir } from 'os'
import HttpHeader from './httpProxy'

const Day = 1000 * 60 * 60 * 24

class hostLookupResponse extends Stream.Writable {
	constructor ( private CallBack: ( err?: Error, dns?: domainData ) => void ) { super ()}
	public _write ( chunk: Buffer, enc, next ) {
		//console.log ( `hostLookupResponse _write come [${ chunk.toString()}]`)
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

export default class gateWay {

	private httpHeader: HttpHeader = null

	constructor ( public serverIp: string, public serverPort: number, private password: string ) {
	}

	public hostLookup ( hostName: string, CallBack: ( err?: Error, hostIp?: domainData ) => void ) {


		const _data = new Buffer ( JSON.stringify ({ hostName: hostName }), 'utf8' )
		
		const encrypt = new Compress.encryptStream ( this.password, 1 + Math.random() * 1000, this.serverIp, this.serverPort, this.httpHeader )
		
		const finish = new hostLookupResponse ( CallBack )
		const httpBlock = new Compress.getDecryptClientStreamFromHttp ()
		const decrypt = new Compress.decryptStream ( this.password )
		

		const _socket = Net.createConnection ({ port: this.serverPort, host: this.serverIp }, () => {
			encrypt.write ( _data )
		})

		_socket.once ( 'end', () => {
			//console.log ( `_socket.once end!` )
		})

		httpBlock.once ( 'error', err => {
			console.log (`httpBlock.on error`, err )
			_socket.end ( res._HTTP_502 )
			return CallBack ( err )
		})

		decrypt.once ( 'err', err=> {

		} )
		encrypt.pipe ( _socket ).pipe ( httpBlock ).pipe ( decrypt ).pipe ( finish )

	}

	public requestGetWay ( id: string, uuuu: VE_IPptpStream, httpHeader: HttpHeader, socket: Net.Socket ) {
		if ( httpHeader )
			this.httpHeader = httpHeader
		console.trace ( 'requestGetWay',JSON.stringify ( this.httpHeader.headers ))
		const decrypt = new Compress.decryptStream ( this.password )
		const encrypt = new Compress.encryptStream ( this.password, 0, this.serverIp, this.serverPort, this.httpHeader )
		const httpBlock = new Compress.getDecryptClientStreamFromHttp ()
		httpBlock.once ( 'error', err => {
			socket.end ( res._HTTP_404 )
		})
		const _socket = Net.createConnection ({ port: this.serverPort, host: this.serverIp }, () => {
			
			encrypt.write ( Buffer.from ( JSON.stringify ( uuuu ), 'utf8' ))
		})
		encrypt.pipe ( _socket ).pipe ( httpBlock ).pipe ( decrypt ).pipe ( socket ).pipe ( encrypt )

	}

	public requestGetWayTest ( id: string, uuuu: VE_IPptpStream, userAgent: string, socket: Net.Socket ) {
		console.log ( 'connect to test port!' )
		const _socket = Net.createConnection ({ port: this.serverPort + 1, host: this.serverIp })
		
		_socket.on ( 'connect', () => {
			_socket.pipe ( socket ).pipe ( _socket )
			const _buf = Buffer.from ( Compress.otherRequestForNet ( Buffer.from ( JSON.stringify ( uuuu ), 'utf8' ).toString ( 'base64' ), this.serverIp, this.serverPort, this.httpHeader ), 'utf8' )
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