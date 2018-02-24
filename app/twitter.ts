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
import * as Jimp from 'jimp'
import * as Imap from './imap'
import * as Uuid from 'node-uuid'

import * as Twitter from 'twitter'
import * as Twitter_text from 'twitter-text'


const QTGateFolder = Path.join ( Os.homedir(), '.QTGate' )
const tempFiles = Path.join ( QTGateFolder, 'tempfile' )
const QTGateVideo = Path.join ( tempFiles, 'videoTemp' )
const view_root = Path.join ( __dirname, 'views' )
const ErrorLogFile = Path.join ( QTGateFolder, 'twitter.log')
let flag = 'w'
const configPath = Path.join ( QTGateFolder, 'config.json' )
const twitterListenPort = 2000
const twitterDataFileName = Path.join ( QTGateFolder, 'twitterData.pem' )
const maxImageLength = 1024 * 1000 * 5
const tweetImageMaxWidth = 1024
const tweetImageMaxHeight = 512
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
	private doingCreateTweetData = false
	private tweetTimeLineDataPool: { post: twitter_post, CallBack } [] = []

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

	private getMedia ( mediaString: string, CallBack ) {
		const files = mediaString.split (',')
		let ret = Buffer.allocUnsafe(0)
		//console.log ( files )
		Async.eachSeries ( files, ( n, next ) => {
			if ( /^http[s]*\:\/\//.test( n ) ) {
				console.log (`unknow file name: [${ n }] skip` )
				return next ()
			}
			return Imap.readMedia ( this.localServer.imapDataPool [ this.localServer.QTGateConnectImap ], n, ( err, data: Buffer ) => {
				if ( err ) {
					return next ( err )
				}
				ret = Buffer.concat ([ ret, data ])
				next ()
			})
		}, err  => {
			if ( err ) {
				console.log (`getMedia error try again`, err )
				
				return this.getMedia ( mediaString, CallBack )
			}
			
			return CallBack ( null, ret.toString( 'base64' ).replace ( /\r\n/g, '' ))
		})
	}

	private getTweetMediaData ( media: twitter_media[], CallBack  ) {
		const uu = media && media.length && media[0].video_info ? media[0].video_info : null
		if ( uu && uu.QTDownload ) {
			return this.getVideo ( uu, CallBack )
		}
		Async.eachSeries ( media, ( n: twitter_media, next ) => {
			n.video_info = null
			return this.getMedia ( n.media_url_https, ( err, data ) => {
				if ( err ) {
					return next ()
				}
				n.media_url_https = data ? `data:image/png;base64,${ data }` : n.media_url_https
				return next ()
			})
		}, CallBack )

	}

	private getQuote_status ( tweet: twitter_post, CallBack ) {
		if ( tweet.quoted_status ) {
			
			const entities = tweet.quoted_status.extended_entities = tweet.quoted_status.extended_entities || null
			if ( entities && entities.media && entities.media.length ) {
				console.log (`getTweetMediaData [${ entities.media.map ( n => { return n.media_url_https })}]`)
				return this.getTweetMediaData ( tweet.quoted_status.extended_entities.media, CallBack )
			}
		}
		if ( tweet.retweeted_status ) {
			const entities = tweet.retweeted_status.extended_entities = tweet.retweeted_status.extended_entities || null
			if ( entities && entities.media && entities.media.length ) {
				console.log (`getTweetMediaData [${ entities.media.map ( n => { return n.media_url_https })}]`)
				return this.getTweetMediaData ( tweet.retweeted_status.extended_entities.media, CallBack )
			}
		}
		return CallBack ()
	}

	private getVideo ( m: twitter_media_video_info, CallBack ) {
		if ( !m || !m.QTDownload ) {
			return CallBack ()
		}
		return this.getMedia ( m.QTDownload, ( err, data ) => {
			if ( data ) {
				const file = Uuid.v4() + '.mp4'
				const viode = Buffer.from ( data, 'base64' )
				return Fs.writeFile ( Path.join ( QTGateVideo, file ), viode, err => {
					m.QTDownload = `/videoTemp/${ file }`
					console.log (`save video file: [${ file }]`)
					return CallBack ()
				})
			}
			return CallBack ()
			
		})
	}

	private createTweetData_next ( tweet: twitter_post, err: Error, data: string[][], CallBack ) {
		
		tweet.user.profile_image_url_https = `data:image/png;base64,${ data [0]}`
		if ( tweet.retweeted && tweet.retweeted.user ) {
			tweet.retweeted.user.profile_image_url_https = `data:image/png;base64,${ data [1]}`
		}
		if ( tweet.retweeted_status && tweet.retweeted_status.user ) {
			tweet.retweeted_status.user.profile_image_url_https  = `data:image/png;base64,${ data [1]}`
		}
		
		if ( !tweet.retweeted_status && tweet.extended_entities && tweet.extended_entities.media && tweet.extended_entities.media.length ) {
			return this.getTweetMediaData ( tweet.extended_entities.media, err => {
				return this.getQuote_status ( tweet, CallBack )
			})
		}
		return this.getQuote_status ( tweet, CallBack )
	}


	private createTweetData ( tweet: twitter_post, CallBack ) {
		
		if ( this.doingCreateTweetData ) {
			return this.tweetTimeLineDataPool.push ({
				post: tweet,
				CallBack: CallBack
			})
		}
		this.doingCreateTweetData = true
		
		if ( !tweet ) {
			saveLog (`createTweetData got Null tweet data `)
			return CallBack ( new Error ('have no tweet data!'))
		}
		const action = [
			next => this.getMedia ( tweet.user.profile_image_url_https, next )
		]
		if ( tweet.retweeted && tweet.retweeted.user ) {
			action.push (
				next => this.getMedia ( tweet.retweeted.user.profile_image_url_https, next )
			)
		}
		if ( tweet.retweeted_status && tweet.retweeted_status.user ) {
			action.push (
				next => this.getMedia ( tweet.retweeted_status.user.profile_image_url_https, next )
			)
		}
		return Async.series ( action, ( err, data ) => {
			
			return this.createTweetData_next ( tweet, err, data, err1 => {
				this.doingCreateTweetData = false
				CallBack ( null, tweet )
				if ( this.tweetTimeLineDataPool.length ) {
					const uu = this.tweetTimeLineDataPool.shift ()
					return this.createTweetData ( uu.post, uu.CallBack )
				}
			})
		})
        
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
					return this.createTweetData ( tweets, ( err, tweet ) => {
						return socket.emit ( 'getTimelines', tweet )
					})
				}
				
			})
		})

		socket.on ( 'getTimelines', ( item: TwitterAccount, CallBack ) => {
			delete item ['twitter_verify_credentials']
			return this.getTimelines ( item, ( err, tweets: twitter_post ) => {
				if ( err ) {
					return CallBack ( err )
				}
				
				return this.createTweetData ( tweets, ( err, tweet: twitter_post ) => {
					console.log (`this.createTweetData CallBack!`)
					
						if ( err ) {
							console.log (`getTweetCount error`, err )
						}
						
						return socket.emit ( 'getTimelines', tweet )
					
					
				})
				
			})
		})

		socket.on ( 'twitter_favorited', ( account: TwitterAccount, id: string, favorited: boolean, CallBack ) => {
			return this.setFavorited ( account, id, favorited, CallBack )
		})

		socket.on ( 'twitter_postNewTweet', ( account: TwitterAccount, postData: twitter_postData[], CallBack ) => {
			if ( !account || !postData.length ) {
				return CallBack ('format error!')
			}
			delete account[ 'twitter_verify_credentials']
			return this.postTweet ( account, postData[0], CallBack )
		})

		socket.on ( 'getTwitterTextLength', ( twitterText: string, CallBack ) => {
			return CallBack ( Twitter_text.parseTweet ( twitterText ))
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

	private getMedia1 ( mediaData: string, CallBack ) {
		
		const media = mediaData.split(',')
		const type = media[0].split(';')[0].split (':')[1]
		const _media = Buffer.from ( media[1], 'base64')
		const ret: twitter_mediaData = {
			total_bytes: media[1].length,
			media_type: type,
			rawData: media[1],
			media_id_string: null
		}
		
		//if ( mediaData.length > maxImageLength) {
			const exportImage = ( _type, img ) => {
				return img.getBuffer ( _type, ( err, _buf: Buffer ) => {
					if ( err ) {
						return CallBack ( err )
					}
					ret.rawData = _buf.toString( 'base64' )
					ret.total_bytes = _buf.length

					return CallBack ( null, ret )
				})
			}
			return Jimp.read ( _media, ( err, image ) => {
				if ( err ) {
					return CallBack ( err )
				}
				const uu = image.bitmap
				if ( uu.height > uu.width ) {
					image.resize ( Jimp.AUTO, tweetImageMaxHeight )
				} else {
					image.resize ( tweetImageMaxWidth, Jimp.AUTO )
				}
				if ( /\/PNG/i.test ( type )) {
					return image.deflateStrategy ( 1, () => {
						return exportImage ( type, image )
					})
				}
				if ( /\/(JPEG|JPG)/i.test ( type )) {
					return image.quality ( 100, () => {
						return exportImage ( type, image )
					})
				}
				//		BMP and all other to PNG
				ret.media_type = 'image/png'
				return image.deflateStrategy ( 4, () => {
					return exportImage ( ret.media_type, image )
				})
			})
		//}
		
		//return CallBack ( null, ret )
		
	}

	private waitingMediaUpdataStatusSuccess ( client, media_id: string, CallBack ) {
		
		return client.post ( 'media/upload', { command: 'STATUS', media_id: media_id }, ( err, status: twitter_uploadImageInitData_status ) => {
			if ( err ) {
				return CallBack ( err )
			}
			const process = status.processing_info
			if ( process.error ) {
				return CallBack ( new Error ( status.processing_info.error.message ))
			}
			if ( process.state === 'succeeded') {
				return CallBack ()
			}
			console.log ( `waitingMediaUpdataStatusSuccess status = [${ process.state }] doing check again! [${ process.check_after_secs }]`)
			return setTimeout (() => {
				return this.waitingMediaUpdataStatusSuccess ( client, media_id, CallBack )
			}, process.check_after_secs )
			
		})
	}

	private _mediaUpdata ( client, mediaData: twitter_mediaData, CallBack ) {
		
		return Async.waterfall ([
			next => {
				client.post ('media/upload',{ command: 'INIT', total_bytes: mediaData.total_bytes, media_type: mediaData.media_type }, next )
			},
			( tweet: twitter_uploadImageInitData, response, next ) => {
				mediaData.media_id_string = tweet.media_id_string
				return client.post ( 'media/upload', { command: 'APPEND', media_id: mediaData.media_id_string, media_data: mediaData.rawData, segment_index: 0 }, next )
			},
			( a, b, next ) => {
				return client.post ( 'media/upload', { command: 'FINALIZE', media_id: mediaData.media_id_string }, next )
			},
			( status: twitter_uploadImageInitData_status, b, next ) => {
				if ( !status.processing_info ) {
					return next ()
				}
				return this.waitingMediaUpdataStatusSuccess ( client, mediaData.media_id_string, next )
			}
		], CallBack )
		
	}

	private _uploadMedia ( account: TwitterAccount, data: twitter_postData, CallBack ) {
		const client = Twitter ( account )
		
			return Async.eachSeries ( data.media_data, ( nn, _next ) => {
				return this._mediaUpdata ( client, nn, _next )
			}, ( err, mediaData: twitter_uploadImageInitData[]) => {
				if ( err ) {
					return CallBack ( err )
				}
				const option = {
					status: data.text,
					media_ids: ''
				}
				let comm = 0
				data.media_data.forEach ( n => {
					if ( comm ++ > 0 ) {
						option.media_ids += ','
					}
					return option.media_ids += `${ n.media_id_string }`
				})
				
				client.post ( 'statuses/update', option, ( err1, twReturn, req ) => {
					if ( err1 ) {
						return CallBack ( err1 )
					}
					return CallBack ( null, twReturn )
				})
			})
		
		
	}

	private _uploadMedia1 ( data: twitter_postData, CallBack ) {
		return Async.eachSeries ( data.media_data, ( nn, _next ) => {
			
		})
	}

	private postTweet ( account: TwitterAccount, postData: twitter_postData, Callback ) {
		if ( postData.images && postData.images.length ) {
			postData.media_data = []
			
			return Async.eachSeries ( postData.images, ( n, next ) => {
				return this.getMedia1 ( n, ( err, data: twitter_mediaData ) => {
					if ( err ) {
						return next ( err )
					}
					postData.media_data.push ( data )
					return next ()
				})
			}, err => {
				if ( err ) {
					return Callback ( err )
				}
				return this._uploadMedia ( account, postData, Callback )
			})
			

		}
		
		return this._uploadMedia ( account, postData, Callback )
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
		this.ex_app.use ( Express.static ( tempFiles ))
        this.ex_app.use ( Express.static ( Path.join ( __dirname, 'public' )))

        this.ex_app.get ( '/Twitter', ( req, res ) => {
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
		Async.waterfall ([
			next => Fs.readdir ( QTGateVideo, next ),
			( files: string[], next ) => Async.eachSeries ( files.map ( n => { return Path.join ( QTGateVideo, n )}), Fs.unlink, next )
		], err => {
			if ( err ) {
				return console.log (`Fs.readdir error [${ err }]`)
			}
			console.log (`Cleanup video temp success.`)
		})

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

				let uu: twitter_post = null

				try {
					uu = JSON.parse ( Buffer.from ( res.Args [0], 'base64' ).toString ())
				} catch ( ex ) {
					return saveLog (`getTimelines QTClass.request return JSON.parse Error!`)
				}

				saveLog ( `twitter_home_timeline order [${ uu.order }]` )
				return CallBack ( null, uu )
			}
			if ( res.error ) {
				console.log ( `this.localServer.QTClass.request ERROR typeof res.error = ${ typeof res.error  }` )
				return CallBack ( res.error )
			}
			
		})
	}

	private getTimelines ( account: TwitterAccount, CallBack ) {
		
		const com: QTGateAPIRequestCommand = {
			command: 'twitter_home_timeline',
			Args: [ account ],
			error: null,
			requestSerial: Crypto.randomBytes(8).toString ('hex' )
		}

		return this.localServer.QTClass.request ( com, ( err, res: QTGateAPIRequestCommand ) => {

			if ( err ) {
				return CallBack ()
			}
			
			if ( res.Args && res.Args.length > 0 ) {
				let uu: twitter_post = null
				try {
					uu = JSON.parse ( Buffer.from ( res.Args [0], 'base64' ).toString ())
				} catch ( ex ) {
					return saveLog ( `getTimelines QTClass.request return JSON.parse Error!` )
				}
				saveLog ( `twitter_home_timeline order [${ uu.order }]` )
				return CallBack ( null, uu )
			}
			if ( res.error ) {
				console.log ( `this.localServer.QTClass.request ERROR typeof res.error = ${ typeof res.error }`)
				
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