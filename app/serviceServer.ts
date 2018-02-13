import * as Express from 'express'
import * as Path from 'path'
import * as Http from 'http'
import * as socketIo from 'socket.io'
import * as cookieParser from 'cookie-parser'
import * as BodyParser from 'body-parser'
import * as Os from 'os'
import LocalServer from './localServer'

const managerServerListenPort = 2000
const view_root = Path.join ( __dirname, 'views' )
const QTGateFolder = Path.join ( Os.homedir(), '.QTGate' )
let flag = 'w'
const LogFile = Path.join ( QTGateFolder, 'serviceServer.log')
const saveLog = ( log: string ) => {

    const Fs = require ('fs')
	const data = `${ new Date().toUTCString () }: ${ log }\r\n`
	Fs.appendFile ( LogFile, data, { flag: flag }, err => {
		flag = 'a'
	})
}

export default class managerServer {
    private ex_app = null
    private httpServer: Http.Server = null
    private socketServer: SocketIO.Server
    private socketConnectListen ( socket: SocketIO.Socket ) {

    }

    constructor ( private localServer: LocalServer ) {

        this.ex_app = Express ()
        this.ex_app.set ( 'views', view_root )
        this.ex_app.set ( 'view engine', 'pug' )

        this.ex_app.use ( cookieParser ())
        this.ex_app.use ( BodyParser.urlencoded({ extended: true }))

        this.ex_app.use ( Express.static ( Path.join ( __dirname, 'public' )))

        this.ex_app.get ( '/', ( req, res ) => {
            const password = req.query.password
            if ( password && localServer.checkPassword ( password )) {
                return res.render( 'serviceServer', { title: 'QTGate service' })
            }
            res.render( 'serviceServer/Login', { title: 'QTGate service' })
		})

        this.ex_app.use (( req, res, next ) => {
			saveLog ( 'ex_app.use 404:' + req.url )
            return res.status( 404 ).send ( "Sorry can't find that!" )
		})

		this.httpServer =  Http.createServer ( this.ex_app )
        this.socketServer = socketIo ( this.httpServer )

        this.socketServer.on ( 'connection', socket => {
            this.socketConnectListen ( socket )
        })

        this.httpServer.listen ( managerServerListenPort )
        saveLog ( `Manager Server start up!` )
    }
}