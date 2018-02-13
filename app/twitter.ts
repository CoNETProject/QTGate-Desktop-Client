import * as Net from 'net'
import * as Express from 'express'
import * as Path from 'path'
import * as cookieParser from 'cookie-parser'
import * as Os from 'os'
import * as Http from 'http'
import * as Crypto from 'crypto'
import * as socketIo from 'socket.io'
import * as Encrypto from './encrypt'
import * as Fs from 'fs'
import * as Async from 'async'
import LocalServer from './localServer'
import * as openpgp from 'openpgp'
import * as Https from 'https'
import * as Util from 'util'

const QTGateFolder = Path.join ( Os.homedir(), '.QTGate' )
const Twitter_root = Path.join ( QTGateFolder, 'twitter' )
const view_root = Path.join ( __dirname, 'views' )
const ErrorLogFile = Path.join ( QTGateFolder, 'twitter.log')
let flag = 'w'
const configPath = Path.join ( QTGateFolder, 'config.json' )
const twitterListenPort = 2001
const twitterDataFileName = Path.join ( QTGateFolder, 'twitterData.pem' )

const saveLog = ( log: string ) => {

    const Fs = require ('fs')
	const data = `${ new Date().toUTCString () }: ${ log }\r\n`
	Fs.appendFile ( ErrorLogFile, data, { flag: flag }, err => {
		flag = 'a'
	})
}

export default class twitter1 {
    private ex_app
    private httpServer
    private socketServer
    private serverReady = false
	private twitterData: TwitterAccount[] = []
	private twitterDataInit = false

	private addTwitterAccount ( account: TwitterAccount ) {
		if ( ! this.twitterData.length ) {
			return this.twitterData.push ( account )
		}
		const index = this.twitterData.findIndex ( n => {
			return ( n.access_token_key.split('-')[0] === account.access_token_key.split('-')[0] )
		})
		if ( index < 0 ) {
			return this.twitterData.push ( account )
		}
		this.twitterData.splice ( index, 1 )
		return this.twitterData.push ( account )
	}

    private readTwitterData ( CallBack ) {
		if ( ! this.serverReady )
			return CallBack ( new Error ('readTwitterData no password or keypair data error!'))
		
		const options: any = {
			message: null,
			publicKeys: openpgp.key.readArmored ( this.localServer.config.keypair.publicKey ).keys,
			privateKey: openpgp.key.readArmored ( this.localServer.config.keypair.privateKey ).keys[0]
		}
		return Async.waterfall ([
			( next: any ) => {
				Fs.access ( twitterDataFileName, next )
			},
			( next: any ) => this.localServer.getPbkdf2 ( this.localServer.savedPasswrod, next ),
			( data: Buffer, next: any ) => {
				if ( ! options.privateKey.decrypt ( data.toString( 'hex' ))) {
					return next ( new Error ('saveImapData key password error!' ))
				}
				
				Fs.readFile ( twitterDataFileName, 'utf8', next )
			}],( err, data: string ) => {

				if ( err ) {
					saveLog ( `readTwitterData Async.waterfall error: [${ err.message }]`)
					return CallBack ( err )
				}
				let callback = false
				options.message = openpgp.message.readArmored ( data.toString () )
				return openpgp.decrypt ( options ).then ( plaintext => {
				
					const data = JSON.parse ( plaintext.data )
					callback = true
					return CallBack ( null, data )

				}).catch ( err => {
					if ( !callback ) {
						callback = true
						saveLog (`openpgp.decrypt catch error!: [${ err.massage}]`)
						return CallBack (`readTwitterData openpgp.decrypt catch error: [${ err.message }] `)
					}
				})
			})
		
	}

	private saveTwitterData ( CallBack ) {
		const _data = JSON.stringify ( this.twitterData )
		const options = {
			data: _data,
			publicKeys: openpgp.key.readArmored ( this.localServer.config.keypair.publicKey ).keys,
			privateKeys: openpgp.key.readArmored ( this.localServer.config.keypair.privateKey ).keys
		}
		return Async.waterfall ([
			( next: any ) => this.localServer.getPbkdf2 ( this.localServer.savedPasswrod, next ),
			( data: Buffer, next: any ) => {
				if ( ! options.privateKeys[0].decrypt ( data.toString( 'hex' ))) {
					return next ( new Error ('saveImapData key password error!' ))
				}
				openpgp.encrypt( options ).then ( ciphertext => {
					Fs.writeFile ( twitterDataFileName, ciphertext.data, { encoding: 'utf8' }, next )
				}).catch ( err => {
					return next ( err )
				})
			}
		], CallBack )
	}

	private saveANEWTwitterData ( account: TwitterAccount, CallBack ) {
		this.addTwitterAccount ( account )
		if ( ! this.twitterData || !this.twitterData.length ) {
			return Fs.unlink ( twitterDataFileName, CallBack )
		}
		return this.saveTwitterData ( CallBack )
	}

	private listenAfterLogin ( socket: SocketIOClient.Socket ) {
		socket.on ( 'addTwitterAccount', ( addTwitterAccount: TwitterAccount, CallBack ) => {
			delete addTwitterAccount['twitter_verify_credentials']
			return this.getTwitterAccountInfo ( addTwitterAccount, ( err, data: TwitterAccount ) => {
				if ( err ) {
					return CallBack ()
				}
				if ( data && data.twitter_verify_credentials ) {
					CallBack ( data )
					return this.saveANEWTwitterData ( data, err => {
						if ( err ) {
							return saveLog (`saveANEWTwitterData got error: ${ err.messgae }`)
						}
					})
				}
				return CallBack ()
			})
		})

		socket.on ( 'getTimelinesNext', ( item: TwitterAccount, maxID: number, CallBack ) => {
			return this.getTimelinesNext ( item, maxID, ( err, tweets: twitter_post ) => {
				if ( err ) {
					return CallBack ( err )
				}
				if ( tweets ) {
					return socket.emit ( 'getTimelines', tweets )
				}
				
			})
		})

		socket.on ( 'getTimelines', ( item: TwitterAccount, CallBack ) => {
			return this.getTimelines ( item, ( err, tweets: twitter_post ) => {
				if ( err ) {
					return CallBack ( err )
				}

				return socket.emit ( 'getTimelines', tweets )
			})
		})

		socket.on ( 'twitter_favorited', ( account: TwitterAccount, id: string, favorited: boolean, CallBack ) => {
			return this.setFavorited ( account, id, favorited, CallBack )
		})

		return socket.on ( 'saveAccounts', ( twitterAccounts: TwitterAccount[] ) => {
			this.twitterData = twitterAccounts
			return this.saveTwitterData ( err => {
				if ( err ) {
					return saveLog (`saveTwitterData error [${ err.message ? err.message : ''}]`)
				}
			})
		})


		
	}

    private socketConnectListen ( socket: SocketIOClient.Socket ) {
        socket.on ( 'init', Callback => {
            if ( this.localServer.qtGateConnectEmitData && this.localServer.qtGateConnectEmitData.qtGateConnecting === 2 && this.localServer.config &&
                this.localServer.config.keypair.verified ) {
                this.serverReady = true
                return Callback ( null, this.localServer.config )
            }
            return Callback ()
		})
		
        socket.on ( 'password', ( password: string, Callback ) => {

            if ( !this.serverReady || !password || !password.length ) {
                return Callback ()
            }
            if ( password === this.localServer.savedPasswrod ) {
				this.listenAfterLogin ( socket )
                if ( this.twitterDataInit ) {
					return Callback ( this.twitterData )
				}
				this.twitterDataInit = true
				return this.readTwitterData (( err, data ) => {
					if ( data && data.length ) {
						this.twitterData = data
					}
					
					return Callback ( this.twitterData )
				})
            }
			return Callback ()
        })
    }

    constructor ( private localServer: LocalServer ) {
        this.ex_app = Express ()
        this.ex_app.set ( 'views', view_root )
        this.ex_app.set ( 'view engine', 'pug' )

        this.ex_app.use ( cookieParser ())
		this.ex_app.use ( Express.static ( Twitter_root ))
        this.ex_app.use ( Express.static ( Path.join ( __dirname, 'public' )))

        this.ex_app.get ( '/', ( req, res ) => {
            res.render( 'twitter', { title: 'twitter' })
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

        this.httpServer.listen ( twitterListenPort )
        saveLog ( `Twitter Server start up!` )

	}

	private getTwitterAccountInfo ( account: TwitterAccount, CallBack ) {
		delete account['twitter_verify_credentials']
		const com: QTGateAPIRequestCommand = {
			command: 'twitter_account',
			Args: [ account ],
			error: null,
			requestSerial: Crypto.randomBytes( 10 ).toString ( 'hex' )
		}
		return this.localServer.QTClass.request ( com, ( err, res: QTGateAPIRequestCommand ) => {
			if ( err ) {
				return CallBack ()
			}
			
			if ( res.Args && res.Args.length > 0 ) {
				let uu = null
				try {
					uu = JSON.parse ( Buffer.from ( res.Args [0], 'base64').toString ())
				} catch ( ex ) {
					return saveLog (`getTwitterAccountInfo QTClass.request return JSON.parse Error!`)
				}

				return CallBack (  null, uu )
			}
			
			return CallBack ( res.error )
			
			
		})
	}

	private getTimelinesNext ( account: TwitterAccount, max_id: number, CallBack ) {
		delete account['twitter_verify_credentials']
		const com: QTGateAPIRequestCommand = {
			command: 'twitter_home_timelineNext',
			Args: [ account, max_id ],
			error: null,
			requestSerial: Crypto.randomBytes(8).toString ('hex' )
		}

		return this.localServer.QTClass.request ( com, ( err, res: QTGateAPIRequestCommand ) => {

			if ( err ) {
				return CallBack ()
			}
			
			if ( res.Args && res.Args.length > 0 ) {
				let uu:twitter_post = null
				try {
					uu = JSON.parse ( Buffer.from ( res.Args [0], 'base64').toString ())
				} catch ( ex ) {
					return saveLog (`getTimelines QTClass.request return JSON.parse Error!`)
				}
				saveLog (`twitter_home_timeline order [${ uu.order }]`)
				return CallBack (  null, uu )
			}
			if ( res.error ) {
				console.log ( `this.localServer.QTClass.request ERROR typeof res.error = ${ typeof res.error  }`)
				
				return CallBack ( res.error )
			}
			
		})
	}

	private getTimelines ( account: TwitterAccount, CallBack ) {
		delete account['twitter_verify_credentials']
		
		const com: QTGateAPIRequestCommand = {
			command: 'twitter_home_timeline',
			Args: [ account ],
			error: null,
			requestSerial: Crypto.randomBytes(8).toString ('hex' )
		}
		console.log ( Util.inspect ( account ))
		return this.localServer.QTClass.request ( com, ( err, res: QTGateAPIRequestCommand ) => {

			if ( err ) {
				return CallBack ()
			}
			
			if ( res.Args && res.Args.length > 0 ) {
				let uu:twitter_post = null
				try {
					uu = JSON.parse ( Buffer.from ( res.Args [0], 'base64').toString ())
				} catch ( ex ) {
					return saveLog (`getTimelines QTClass.request return JSON.parse Error!`)
				}
				saveLog (`twitter_home_timeline order [${ uu.order }]`)
				return CallBack (  null, uu )
			}
			if ( res.error ) {
				console.log ( `this.localServer.QTClass.request ERROR typeof res.error = ${ typeof res.error  }`)
				
				return CallBack ( res.error )
			}
			
		})
	}

	private setFavorited ( account: TwitterAccount, id: string, favorited: boolean, CallBack ) {
		delete account['twitter_verify_credentials']
		const com: QTGateAPIRequestCommand = {
			command: 'twitter_set_favorited',
			Args: [ account, id, favorited ],
			error: null,
			requestSerial: Crypto.randomBytes( 10 ).toString ( 'hex' )
		}
		
		
		return this.localServer.QTClass.request ( com, ( err, res: QTGateAPIRequestCommand ) => {

			if ( err ) {
				return CallBack ('err')
			}
			
			if ( res.error > -1 ) {
				console.log ( `this.localServer.QTClass.request ERROR typeof res.error = ${ typeof res.error  }`)
				return CallBack ( res.error )
			}
			return CallBack ()

		})
		
	}

}

const getUrlBuffer = ( url: string, CallBack ) => {
    return Https.get ( url, res => {
        const { statusCode } = res
        const contentType = res.headers['content-type']
        let error
        if ( statusCode !== 200 ) {
            res.resume()
            return CallBack ( new Error ( 'Request Failed.\n' + `Status Code: ${ statusCode }`))
        }
        let rawData = Buffer.allocUnsafe(0)
        
        res.on ( 'data', ( chunk: Buffer ) => { rawData = Buffer.concat ([ rawData, chunk ])})
        res.once ( 'end', () => {
            return CallBack ( null, rawData )
        })

    }).once ( 'error', e => {
        return CallBack ( e )
    })
}

const getQuote_status = ( n: twitter_post, CallBack ) => {
    if ( n.quoted_status ) {
        n.quoted_status.extended_entities = n.quoted_status.extended_entities || null
        if ( n.quoted_status.extended_entities && n.quoted_status.extended_entities.media && n.quoted_status.extended_entities.media.length ) {
            return getUrlBuffer ( n.quoted_status.extended_entities.media[0].media_url_https, ( err, data ) => {
                if ( err ) {
                    return CallBack ( null, n )
                }
                n.quoted_status.extended_entities.media[0].media_url_https = `data:image/jpg;base64,${ data.toString ( 'base64' ) }`
                return CallBack ( null, n )
            })
        }
    }
    return CallBack ( null, n )
}