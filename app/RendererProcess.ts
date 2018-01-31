import * as Path from 'path'
const { remote, screen, desktopCapturer } = require ( 'electron' )


export default class RendererProcess {
	private win = null
	constructor ( name: string, data: any, debug: boolean, CallBack ) {
		this.win = new remote.BrowserWindow ({ show: debug  })
		this.win.setIgnoreMouseEvents ( !debug )
		if ( debug ) {
			this.win.webContents.openDevTools()
			this.win.maximize ()
		} 
		
		this.win.once ( 'first', () => {
			this.win.once ( 'firstCallBackFinished', returnData => {
				this.win.close ()
				this.win = null
				CallBack ( returnData )
				return CallBack = null
			})
			this.win.emit ( 'firstCallBack', data )
		})

		this.win.once ( 'closed', () => {
			if ( CallBack && typeof CallBack === 'function' ) {
				CallBack ()
				return CallBack = null
			}
		})
		this.win.loadURL ( `file://${ Path.join ( __dirname, name +'.html')}` )
	}
	public cancel ( ) {
		if ( this.win && typeof this.win.destroy === 'function' ) {
			return this.win.destroy()
		}
	}

	public sendCommand ( command: string, data: any ) {
		return this.win.emit ( command, data )
	}
}