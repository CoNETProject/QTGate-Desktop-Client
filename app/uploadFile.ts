import * as Async from 'async'
import * as Fs from 'fs'
import * as Stream from 'stream'

import * as Uuid from 'node-uuid'
import * as Imap from './imap'

import * as Crypto from 'crypto'

import * as Path from 'path'
import * as Os from 'os'

const QTGateFolder = Path.join ( Os.homedir(), '.QTGate' )
const tempFiles = Path.join ( QTGateFolder, 'tempfile' )
const QTGateVideo = Path.join ( tempFiles, 'videoTemp' )

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

	private dir = Path.parse ( this.fileName ).dir
	private _fileName = Uuid.v4()
	private _count = 0
	private saveCount = 0

	private get nextFile () {
		let count = ( this._count++ ).toString()
		if ( count.length === 1 ) {
			count = `0${ count }`
		}
		const uu = Path.join ( this.dir, `${ this._fileName }.${ count }`)
		this.returnFileNames.push ( uu )
		return uu
	}

	private saveFileName = null
	
	constructor ( private fileName: string, private domainName: string, private returnFileNames: string[] ) { 
		super ()

	}

	private saveFileHeader ( chunk: Buffer, CallBack ) {
		this.saveFileName = this.nextFile
		this.saveCount = 0
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
		this.saveCount += chunk.length
		return Fs.appendFile ( this.saveFileName, _data, 'utf8', CallBack )
	}

	public _write ( chunk: Buffer, encode, next ) {
		//	first time
		if ( !this.saveFileName ) {
			return this.saveFileHeader ( chunk, next )
		}
		return this.saveToFile ( chunk, err => {
			if ( err ) {
				return next ( err )
			}
			if ( this.saveCount > maxSizeForBase64 ) {
				this.saveFileName = null
			}
			return next ()
		})
		
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


const EncodeBase641 = ( fileName: string, domainName: string, CallBack ) => {
	
	const returnFiles = []
	const fileStream = Fs.createReadStream ( fileName, { encoding: 'base64' })
	
	const encode = new encodeBase64 ( fileName, domainName, returnFiles )
	fileStream.once ( 'error', err => {
		return CallBack ( err )
	})

	return fileStream.pipe ( encode ).once ( 'finish', () => {
		return Fs.unlink ( fileName, () => {
			return CallBack ( null, returnFiles )
		})
		
	})
}

export const sendFile3 = ( fileName: string, imapPeer: Imap.imapPeer, CallBack ) => {
	
	return EncodeBase641 ( fileName, imapPeer.domainName, ( err, files: string[] ) => {
		if ( err ) {
			return CallBack ( err )
		}
		
		
		return Async.eachSeries ( files, ( n, next ) => {
			return Imap.trySendToRemoteFromFile1Less10MB4  ( imapPeer, n, next )
		}, err => {
			if ( err ) {
				return CallBack ( err )
			}
			const _file = files.map ( n => {
				const uu = n.split ('/videoTemp/')
				return uu[ uu.length - 1 ]
			})
			return CallBack ( null, _file )
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

export const joinFiles = ( files: string , CallBack ) => {
    const _file = files.split (',')
	let outputFileName = _file[0].split('.00')[0]
	
    if ( ! outputFileName ) {
        return CallBack ( new Error (' no file'))
	}
	outputFileName = Path.join ( QTGateVideo, outputFileName )
    const _files = _file.map ( n => {
		return Path.join ( QTGateVideo, n )
        //return 'temp/' + n
    })
	
	
    Async.eachSeries ( _files, ( n, next ) => {
		const writeS = new deCodeBase64 ( outputFileName )
		const readS = Fs.createReadStream ( n )
		
        writeS.once ('finish', () => {
			
			return next ()
		})
		writeS.once ( 'error', err => {
			
			return next ( err )
		})
		readS.once ( 'error', err => {
			
			return next ( err )
		})
		return readS.pipe ( writeS )
    }, err => {
		if ( err ) {
			return CallBack ( err )
		}
		return CallBack ( null, outputFileName )
	})
}
/*
sendFile3 ( Path.join ( QTGateVideo, '88d962e3-e07d-4229-8e64-ba55800fdbd0.mp4'), { domainName: null }, ( err, data ) => {
	if ( err ) {
		return console.log ( err )
	}
	console.log (`success!, tt [${ data }]`)
})

const hh = 'ce3ddfa0-c420-4c64-a6ce-ee7512ba9cfd'
const getPart = ( name: string, n: number ) => {
	const ret = []
	for ( let i = 0; i < n; i ++ ) {
		let ii = i.toString()
		if ( ii.length === 1 ) {
			ii = '0' + ii
		}
		ret.push ( `${ name }.${ii}`)
	}
	return ret
}

const uu = ['487e0d28-f6c1-40fc-baee-391b0f5027ac.00', '487e0d28-f6c1-40fc-baee-391b0f5027ac.01','487e0d28-f6c1-40fc-baee-391b0f5027ac.02','487e0d28-f6c1-40fc-baee-391b0f5027ac.03','487e0d28-f6c1-40fc-baee-391b0f5027ac.04','487e0d28-f6c1-40fc-baee-391b0f5027ac.05','487e0d28-f6c1-40fc-baee-391b0f5027ac.06']
const u = uu.join (',')

joinFiles ( getPart(hh, 6).join (','), ( err , tt ) => {
	if ( err ) {
		return console.log ( err )
	}
	console.log (`success!, tt [${ tt }]`)
})
/** */

