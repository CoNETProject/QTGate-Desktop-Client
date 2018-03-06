import * as Async from 'async'
import * as Fs from 'fs'
import * as Stream from 'stream'
import * as Path from 'path'
import * as Uuid from 'node-uuid'
import * as Imap from './imap'
import * as Os from 'os'
import * as Crypto from 'crypto'

const maxSizeForBase64 = 512 * 1024
class splitSize extends Stream.Transform {
	private _chunk = Buffer.allocUnsafe (0)
	constructor ( private size: number ) { super ()}
	public _transform ( chunk: Buffer, encode, next ) {
		this._chunk = Buffer.concat ([ this._chunk, chunk ])
		if ( this._chunk.length < this.size ) {
			return next ()
		}
		next ( null, this._chunk )
		return this._chunk = Buffer.allocUnsafe (0)
	}
	public _flush () {
		console.log (`splitSize on _flush`)
		this.push ( this._chunk )
	}
}

class saveToFile extends Stream.Writable {
	private text = this.domainName ? `Content-Type: application/octet-stream\r\nContent-Disposition: attachment\r\nMessage-ID:<${ Uuid.v4() }@>${ this.domainName }\r\nContent-Transfer-Encoding: base64\r\nMIME-Version: 1.0\r\n\r\n`: null
	private _end = this.domainName ? '\r\n\r\n' : null
	private dir = Path.parse ( this.fileName ).dir
	private saveFileName = Path.join ( this.dir, Uuid.v4())
	constructor ( private fileName: string, private domainName: string, private exportNameArray: string[] ) { super ()}
	public _write ( chunk: Buffer, encode, next ) {
		if ( !chunk.length ) {
			console.log (`saveToFile got !chunk.length`)
			return this.end()
		}
		
		this.exportNameArray.push ( this.saveFileName )
		const data = this.text ? ( this.text + chunk.toString() + this.end ) : chunk.toString()
		return Fs.writeFile ( this.saveFileName, data, err => {
			console.log ( `saveToFile Fs.writeFile success!`)
			return next ( err )
		})
	}

	public _flush () {
		console.log (`saveToFile on _flush`)
	}
}

class encodeBase64 extends Stream.Writable {
	
	private text = this.domainName ? `Content-Type: application/octet-stream\r\nContent-Disposition: attachment\r\nMessage-ID:<${ Uuid.v4() }@>${ this.domainName }\r\nContent-Transfer-Encoding: base64\r\nMIME-Version: 1.0\r\n\r\n`: null
	private _end = this.domainName ? '\r\n\r\n' : null
	private dir = Path.parse ( this.fileName ).dir
	private _fileName = Uuid.v4()
	private count = 0
	private saveCount = 0

	private get nextFile () {
		let count = ( this.count++ ).toString()
		if ( count.length === 1 ) {
			count = `0${ count }`
		}
		const uu = Path.join ( this.dir, `${ this._fileName }.${ count }`)
		this.returnFileNames.push ( uu )
		return uu
	}

	private saveFileName = this.nextFile
	
	constructor ( private fileName: string, private domainName: string, private returnFileNames: string[] ) { super ()}

	private saveFileHeader ( chunk, CallBack ) {
		this.saveFileName = this.nextFile
		this.count = 0
		if ( !this.text ) {
			return this.saveToFile ( chunk, CallBack )
		}
		return Fs.appendFile ( this.saveFileName, this.text, 'utf8', err => {
			if ( err ) {
				return CallBack ( err )
			}
			return this.saveToFile ( chunk, CallBack )
		})
	}

	private saveToFile ( chunk, CallBack ) {
		const _data = chunk.toString()
		this.count += chunk.length
		return Fs.appendFile ( this.saveFileName, _data, 'utf8', CallBack )
	}

	public _write ( chunk: Buffer, encode, next ) {
		const count = this.count + chunk.length
		if ( count > maxSizeForBase64 ) {
			if ( this._end ) {
				return Fs.appendFile ( this.saveFileName, this._end, 'utf8', err => {
					this.saveFileHeader ( chunk, next )
				})
			}
			return this.saveFileHeader ( chunk, next )
		}
		return this.saveToFile ( chunk, next )
	}

}

class deCodeBase64 extends Stream.Writable {
	private length = 0
	private income = 0
	constructor ( private fileName ) { super ()}
	public _write ( chunk: Buffer, encode, next ) {
		this.income += chunk.length
		const uu = Buffer.from ( chunk.toString (), 'base64')
		this.length += uu.length
		console.log (`total incom [${ this.income }] outLength [${ this.length }]`)
		return Fs.appendFile ( this.fileName, uu, 'binary', next )
	}
}


export const EncodeBase64 = ( fileName: string, domainName: string, CallBack ) => {
	
	const returnFiles = []
	const fileStream = Fs.createReadStream ( fileName, { encoding: 'base64' })
	const encode = new encodeBase64 ( fileName, domainName, returnFiles )
	fileStream.once ( 'error', err => {
		return CallBack ( err )
	})

	return fileStream.pipe ( encode ).on ( 'finish', () => {
		return CallBack ( null, returnFiles )
	})
}

export const sendFile = ( fileName: string, imapPeer: Imap.imapPeer, CallBack ) => {
	return EncodeBase64 ( fileName, imapPeer.domainName, ( err, files: string[] ) => {
		if ( err ) {
			return CallBack ( err )
		}
		return Async.eachSeries ( files, imapPeer.trySendToRemoteFromFile1Less10MB, err => {
			if ( err ) {
				return CallBack ( err )
			}
			return CallBack ( null, files.join (','))
		})
	})
}

const md5File = ( fileName: string, CallBack ) => {
	const kk = Fs.createReadStream ( fileName )
	const hash = Crypto.createHash ( 'md5' )
	hash.setEncoding('hex')
	kk.once ( 'end', () => {
		console.log (`hash.once end`)
		hash.end()
		return CallBack ( null, hash.read())
	})
	kk.pipe ( hash )
}

const backFileFromBase64 = ( fileName: string, CallBack ) => {

	const kk = Fs.createReadStream ( fileName, { encoding: 'utf8' })
	const uu = new deCodeBase64 ( fileName + '.decode')
	kk.once ( 'error', CallBack )
	kk.pipe ( uu ).once ( 'finish', CallBack )
	
}