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


import * as Crypto from 'crypto'
import * as Url from 'url'
import * as Net from 'net'
import * as Async from 'async'

const cacheFileType = /\.jpeg$|\.html$|\.css$|\.gif$|\.js$|\.jpg$|\.png$|\.svg$|\.xml$/i


export default class httpProxy {
	public commandWithLine: string[]
	public text: string
	public _parts: string []
	public headers: Object
	
	constructor ( public buffer: Buffer ) {
		this.text = buffer.toString( 'utf8' )
		this._parts = this.text.split ('\r\n\r\n')
		this.commandWithLine = this._parts[0].split ( /\r\n/ )
		let u = '{'
		for ( let i = 1, k = 0; i < this.commandWithLine.length; i ++ ) {
			const line = this.commandWithLine [i].split (': ')

			if ( line.length !== 2 ) {
				if ( /^host$/i.test( line [0]))
					continue
				break
			}
			if ( k++ !== 0 )
				u += ','
			u += `"${ line[0].toLowerCase() }": ${ JSON.stringify(line[1]) }`
		}
		u +='}'

		this.headers = JSON.parse ( u )
		
	}

	get parts () {
		return Math.round ( this._parts.length / 2 )
	}

	get nextPart () {
		const part = '\r\n\r\n'
		if ( this.parts > 1 ) {
			const part1 = this.text.indexOf ( part )
			const part2 = this.text.indexOf ( part, part1 + 1 )
			const kk = this.buffer.slice ( part2 + 4 )
			if ( kk.length )
				return kk
		}
		return new Buffer (0)
	}

	get isHttps () {

		return ( this.isConnect && this.Url.port === '443' )
	}
	
	get isHttpRequest () {
		return ( /^connect|^get|^put|^delete|^post|^OPTIONS|^HEAD|^TRACE/i.test ( this.commandWithLine[0] ))
	}

	get command () {
		return this.commandWithLine
	}

	get Url () {
		let http = this.commandWithLine[0].split (' ')[1]
		http = !/^http/i.test ( http ) ? 'http://' + http : http
		return Url.parse ( http )
	}

	get isConnect () {

		return ( /^connect /i.test ( this.commandWithLine[0] ) )
	}

	get isGet () {
		return /^GET /i.test ( this.commandWithLine[0] )
	}

	get isPost () {
		return /^port/i.test ( this.commandWithLine[0] )
	}

	get host () {
		return this.headers['host'].split(':')[0]
	}

	get cachePath () {
		if ( !this.isGet || ! this.isCanCacheFile )
			return null
		return Crypto.createHash ( 'md5' ).update ( this.Url.host + this.Url.href ).digest( 'hex' )
	}

	get isCanCacheFile () {
		return cacheFileType.test ( this.commandWithLine[0].split(' ')[1] )
	}

	get getProxyAuthorization () {
		for ( let i = 1; i < this.commandWithLine.length; i ++ ) {
			const y = this.commandWithLine [i]
			if ( /^Proxy-Authorization: Basic /i.test( y )) {
				const n = y.split ( ' ' )
				if ( n.length === 3 ) {
					return new Buffer ( n[2], 'base64' ).toString ( 'utf8' )
				}
				return
			}
		}
		return
	}

	get BufferWithOutKeepAlife () {
		if ( !this.isGet || !this.isCanCacheFile )
			return this.buffer
		
		let ss = ''
		this.commandWithLine.forEach ( n => {
			ss += n.replace ( 'keep-alive', 'close' ) + '\r\n'
		})
		ss += '\r\n\r\n'
		
		return new Buffer ( ss , 'utf8' )
	}

	get Body () {
		const length = parseInt ( this.headers[ 'content-length' ])
		if ( !length )
			return null
		const body = this._parts [1]
		if ( body && body.length && body.length === length )
			return body
		
		return null
		
	}

	get preBodyLength () {
		const body = this._parts [1]
		return body.length
	}

	get Port () {
		console.log ( this.commandWithLine )
		const uu = this.commandWithLine[0].split(/\/\//)
		if ( uu.length > 1 ) {
			const kk = uu[1].split (':')
			if ( kk.length > 1 ) {
				const ret = kk[1].split (' ')[0]
				console.log ( `ret = [${ ret }]`)
				return parseInt ( ret )
			}
			return 80
		}
		const vv = this.commandWithLine[0].split(':')
		if ( vv.length > 1 ) {
			const kk = vv[1].split (' ')[0]
			return parseInt ( kk )
		}

		return 443
	}

	get BodyLength () {
		return parseInt ( this.headers[ 'content-length' ])
	}

}


