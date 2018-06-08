import * as Path from 'path'
import * as Fs from 'fs'
import { fork, ChildProcess } from 'child_process'
import * as Async from 'async'

const testElectronSystem = ( CallBack ) => {
	try {
		const ele = require ( 'electron' )
	} catch ( ex ) {
		return CallBack ( ex )
	}
	return CallBack ()
}
export default class RendererProcess {
	private win = null
	private _fork: ChildProcess = null
	private file = Path.join ( __dirname, 'render', this.forkName )
	private childProcess () {

		const _fork = fork ( this.file, this.data )
		
		_fork.once ( 'close', ( code, signal ) => {
			console.log (`RendererProcess exit`)
			if ( !this.CallBack || typeof this.CallBack !== 'function' ) {
				return 
			}
			if ( !code ) {
				this.CallBack()
			} else {
				this.CallBack ( new Error ( `RendererProcess exit with code [${ code }] signal [${ signal }]`))
			}
			return this.CallBack = null
		})

		_fork.once ( 'message', message => {
			console.log (`RendererProcess [${ this.forkName }] on message`)
			if ( !this.CallBack || typeof this.CallBack !== 'function' ) {
				return 
			}
			this.CallBack ( null, message )
			this.CallBack = null
		})
	}


	private electronRendererProcess () {
		const { remote, screen, desktopCapturer } = require ( 'electron' )
		this.win = new remote.BrowserWindow ({ show: this.debug  })
		this.win.setIgnoreMouseEvents ( !this.debug )
		if ( this.debug ) {
			this.win.webContents.openDevTools()
			this.win.maximize ()
		} 
		
		this.win.once ( 'first', () => {
			this.win.once ( 'firstCallBackFinished', returnData => {
				this.win.close ()
				this.win = null
				this.CallBack ( returnData )
				return this.CallBack = null
			})
			this.win.emit ( 'firstCallBack', this.data )
		})

		this.win.once ( 'closed', () => {
			if ( this.CallBack && typeof this.CallBack === 'function' ) {
				this.CallBack ()
				return this.CallBack = null
			}
		})
		this.win.loadURL ( `file://${ Path.join ( __dirname, name +'.html')}` )
	}
	
	constructor ( private forkName: string, private data: any, private debug: boolean, private CallBack ) {
		
		testElectronSystem ( err1 => {
			
			if ( err1 ) {
				console.log ( `RendererProcess: running system have not electron.`)
				this.file += '.js'
			} else {
				
				this.file += '.html'
			}
			return Fs.access ( this.file, err => {
				if ( err ) {
					return CallBack ( err )
				}
				if ( /.js$/.test ( this.file )) {
					return this.childProcess()
				}
				return this.electronRendererProcess()
			})
			
		})
		
		
	}
	public cancel () {
		if ( this.win && typeof this.win.destroy === 'function' ) {
			return this.win.destroy()
		}
		if ( this._fork ) {
			return this._fork.kill()
		}
		console.log (`RendererProcess on cancel but have not any `)
	}

	public sendCommand ( command: string, data: any ) {
		return this.win.emit ( command, data )
	}
}