import * as Async from 'async'
import * as Fs from 'fs'
import * as Stream from 'stream'
import * as Path from 'path'
import * as Uuid from 'node-uuid'

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
		this.push ( this._chunk )
	}
}

class saveToFile extends Stream.Writable {
	constructor ( private fileName: string, private domainName: string, private exportNameArray: string[] ) { super ()}
	public _write ( chunk: Buffer, encode, next ) {
		const dir = Path.parse ( this.fileName ).dir

		const saveFileName = Path.join ( dir, Uuid.v4())
		
		this.exportNameArray.push ( saveFileName )
		const text = `Content-Type: application/octet-stream\r\nContent-Disposition: attachment\r\nMessage-ID:<${ Uuid.v4() }@>${ this.domainName }\r\nContent-Transfer-Encoding: base64\r\nMIME-Version: 1.0\r\n\r\n`
		return Fs.writeFile ( saveFileName, text + chunk.toString() + '\r\n\r\n', 'utf8', next )
	}
}

const splitFileSize = 1024 * 9500

export const splitFile = ( fileName: string, CallBack ) => {
	const returnFileName = []
	let _return = false
	const fileStream = Fs.createReadStream ( fileName, { encoding: 'utf8'})
	const splitStream = new splitSize ( splitFileSize )
	const writeFileStream = new saveToFile ( fileName, 'iCloud.com', returnFileName )

	fileStream.once ( 'end', () => {
		return Fs.unlink ( fileName, () => {
			return CallBack ( null, returnFileName )
		})
		
	})

	fileStream.once ( 'error', err => {
		_return = true
		return CallBack ( err )
	})

	fileStream.pipe ( splitStream ).pipe ( writeFileStream )
	
}
