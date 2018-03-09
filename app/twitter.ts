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
import * as UploadFile from './uploadFile'
import * as Twitter from 'twitter'
import * as Twitter_text from 'twitter-text'
import * as ImapPeer from './imapClass'


const QTGateFolder = Path.join ( Os.homedir(), '.QTGate' )
const tempFiles = Path.join ( QTGateFolder, 'tempfile' )
const QTGateVideo = Path.join ( tempFiles, 'videoTemp' )
const view_root = Path.join ( __dirname, 'views' )
const ErrorLogFile = Path.join ( QTGateFolder, 'twitter.log' )
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
interface uploadFileBuffer {
	part: number
	serial: string
	_buf: Buffer
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
		saveLog (` getMedia mediaString = [${ mediaString }]`)
		if ( /^http[s]*\:\/\//.test ( mediaString )) {
			return CallBack ( null, mediaString )
		}
		const files = mediaString.split (',')
		if ( !files || !files.length ) {
			return CallBack ( null, '')
		}
		//console.log ( files )
		return Imap.imapGetMediaFile ( this.localServer.imapDataPool [ this.localServer.QTGateConnectImap ], files[0], CallBack )
	}

	private getTweetMediaData ( media: twitter_media[], CallBack  ) {
		const uu = media && media.length && media[0].video_info ? media[0].video_info : null
		if ( uu && uu.QTDownload ) {
			return this.getVideo ( uu, CallBack )
		}
		return Async.eachSeries ( media, ( n: twitter_media, next ) => {
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
		saveLog ( `doing getQuote_status [${ tweet.id_str }]`)
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
/*
	private getVideo2222233 ( m: twitter_media_video_info, CallBack ) {
		
		if ( !m || !m.QTDownload ) {
			return CallBack ()
		}
		if ( /^http[s]*\:\/\//.test ( m.QTDownload )) {
			return CallBack ( null, m.QTDownload )
		}
		saveLog ( `doing getVideo [${ m.QTDownload }]`)
		let files = m.QTDownload.split (',')
		const video = Uuid.v4()
		const writeFile = Path.join ( QTGateVideo, video )
		return Async.eachSeries ( files, ( n, next ) => Imap.readMediaToFile ( this.localServer.imapDataPool [ this.localServer.QTGateConnectImap ], n, QTGateVideo, next ), err => {
			saveLog ( `doing readMediaToFile CallBack [${ m.QTDownload }]`)
			if ( err ) {
				return CallBack ( err )
			}
			files = []
			return Async.eachSeries ( files, ( n, next ) => {
				const readFile = Path.join ( QTGateVideo, n )
				const uu = Fs.createReadStream ( readFile )
				const ww = Fs.createWriteStream ( writeFile, { flags: 'a'})
				ww.once ( 'finish', () => {
					return Fs.unlink ( readFile, () =>{
						return next ()
					})
				})
				uu.once ('error', err => {
					return next ( err )
				})
				return uu.pipe ( ww )
			})
		}, err => {
			if ( err ) {
				m.QTDownload = ''
				return CallBack ( err )
			}
			m.QTDownload = `/videoTemp/${ video }`
			saveLog ( `save video file: [${ video }]`)
			return CallBack ()
		})

	}
*/
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
		saveLog ( `createTweetData_next CallBack: data = [${ data.map ( n => { return n.length })}]`)
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
		/*
		if ( this.doingCreateTweetData ) {
			return this.tweetTimeLineDataPool.push ({
				post: tweet,
				CallBack: CallBack
			})
		}
		this.doingCreateTweetData = true
		*/
		if ( !tweet ) {
			saveLog ( `createTweetData got Null tweet data `)
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
				/*
				if ( this.tweetTimeLineDataPool.length ) {
					const uu = this.tweetTimeLineDataPool.shift ()
					return this.createTweetData ( uu.post, uu.CallBack )
				}
				*/
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
				CallBack ( data )
				if ( data && data.twitter_verify_credentials ) {
					
					return this.saveANEWTwitterData ( data, err => {
						if ( err ) {
							return saveLog (`saveANEWTwitterData got error: ${ err.messgae }`)
						}
					})
				}
				
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
			let getTimelinesCount = 0
			return this.getTimelines ( item, ( err, tweets: twitter_post ) => {
				getTimelinesCount ++
				if ( err ) {
					saveLog (`socket.on ( 'getTimelines' return [${ getTimelinesCount }] error, [${ err.message }]`)
					return CallBack ( err )
				}
				saveLog ( `doinging createTweetData for count [${ getTimelinesCount }]`)
				return this.createTweetData ( tweets, ( err, tweet: twitter_post ) => {
					saveLog (`createTweetData CallBack! [${ getTimelinesCount }]`)
					
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
			saveLog ( `twitter_postNewTweet doing postTweetViaQTGate`)
			return this.postTweetViaQTGate ( account, postData[0], ( err, data ) => {
				if ( err ) {
					return CallBack ( err )
				}
				
			})
		})

		socket.on ( 'getTwitterTextLength', ( twitterText: string, CallBack ) => {
			return CallBack ( Twitter_text.parseTweet ( twitterText ))
		})

		socket.on ( 'mediaFileUpdata', ( uploadId, data: Buffer, part: number, CallBack ) => {
			
			const fileName = Path.join ( QTGateVideo, uploadId )
			//		the end!
			
			if ( !part ) {
				Fs.writeFile ( fileName, data, 'binary', CallBack )
			} else {
				Fs.appendFile ( fileName, data, 'binary',CallBack )
			}
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

	private getPictureBase64ToTwitter_mediaData ( mediaData: string, CallBack ) {
		
		const media = mediaData.split(',')
		const type = media[0].split(';')[0].split (':')[1]
		const _media = Buffer.from ( media[1], 'base64')
		const ret: twitter_mediaData = {
			total_bytes: media[1].length,
			media_type: type,
			rawData: media[1],
			media_id_string: null
		}
		const uploadDataPool = []
		
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

	private _mediaVideoUpload ( client, mediaData: twitter_postData, CallBack ) {
		if ( !mediaData.videoFileName || !mediaData.videoFileName.length ) {
			return CallBack ()
		}
		const data: twitter_mediaData = {
			media_id_string: '',
			media_type: 'video/mp4',
			total_bytes: mediaData.videoSize,
			rawData: null
		}
		mediaData.media_data = [data]
		const files = mediaData.videoFileName.split (',')
		let part = 0
		return Async.waterfall ([
			next => client.post ( 'media/upload',{ command: 'INIT', total_bytes: mediaData.videoSize, media_type: 'video/mp4' }, next ),
			( tweet: twitter_uploadImageInitData, response, next ) => {
				data.media_id_string = tweet.media_id_string
				Async.eachSeries ( files, ( n, _next ) => {
					Fs.readFile ( n, 'utf8', ( _err, _buf ) => {
						if ( _err ) {
							return _next ( _err )
						}
						return client.post ( 'media/upload', { command: 'APPEND', media_id: data.media_id_string, media_data: _buf, segment_index: part++ }, ( err, a, b ) => {
							if ( err ) {
								return _next ( err )
							}
							return _next ()
						})
					})
				}, next )
			},
			next => {
				client.post ( 'media/upload', { command: 'FINALIZE', media_id: data.media_id_string }, next )
			},
			( status: twitter_uploadImageInitData_status, b, next ) => {
				if ( ! status.processing_info ) {
					return next ()
				}
				return this.waitingMediaUpdataStatusSuccess ( client, data.media_id_string, next )
			}
		], CallBack )
	}

	private QT_PictureMediaUpload ( data: twitter_postData, CallBack ) {
		let imageIndex = 0
		return Async.eachSeries ( data.images, ( n: string, next ) => {
			return Async.waterfall ([
				_next => this.getPictureBase64ToTwitter_mediaData ( n, _next ),
				( media: twitter_mediaData, _next ) => {
					media.media_id_string = Path.join ( QTGateVideo,  Uuid.v4 ())
					data.media_data.push ( media )
					return Fs.writeFile ( media.media_id_string, Buffer.from ( media.rawData, 'base64' ), 'binary', _next )
				},
				_next => {

					return UploadFile.sendFile3 ( data.media_data[ data.media_data.length - 1 ].media_id_string, this.localServer.QTClass, ( err, files: string[] ) => {
						if ( err ) {
							saveLog (`QT_PictureMediaUpload UploadFile.sendFile error: [${ err.message }]`)
							return _next ( err )
						}
						const media = data.media_data[ imageIndex ++ ]
						media.media_id_string = files.join (',')
						delete media.rawData
						return _next ()
					})
				}
			], next )
		}, CallBack )
		
	}

	private _mediaUpdata ( client, mediaData: twitter_mediaData, CallBack ) {
		
		return Async.waterfall ([
			next => {
				client.post ( 'media/upload',{ command: 'INIT', total_bytes: mediaData.total_bytes, media_type: mediaData.media_type }, next )
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
/*
	private _mediaVideoUpdata ( client, data: twitter_postData, CallBack ) {
		return Async.waterfall ([
			next => UploadFile.EncodeBase641 ( data.videoFileName, null, next ),
			( files: string[], next ) => {
				data.videoFileName = files.join (',')
				return this._mediaVideoUpload ( client, data, next )
			},
			next => this._afterMediaUpload ( null, data, client, next )
		], CallBack )
	}
*/
	private _afterMediaUpload ( err, data: twitter_postData, client, CallBack ) {
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
	}	
/*
	private _uploadMedia ( account: TwitterAccount, data: twitter_postData, CallBack ) {
		const client = Twitter ( account )

		if ( data.images && data.images.length ) {
			data.media_data = []
			return Async.eachSeries ( data.images, ( nn, _next ) => {
				Async.waterfall ([
					next => this.getMedia1 ( nn, next ),
					( media_data: twitter_mediaData, next ) => {
						data.media_data.push ( media_data )
						this._mediaUpdata ( client, media_data, next )
					}
				], _next )
				
			}, err => {
				return this._afterMediaUpload ( err, data, client, CallBack )
			})
		}
		if ( data.videoFileName && data.videoFileName.length ) {
			data.videoFileName = Path.join ( QTGateVideo, data.videoFileName )
			return this._mediaVideoUpdata ( client, data, CallBack )
		}
		return  this._afterMediaUpload ( null, data, client, CallBack )
		
	}
*/
	private QT_VideoMediaUpload ( data: twitter_postData, CallBack ) {
		return UploadFile.sendFile3 ( Path.join ( QTGateVideo, data.videoFileName), this.localServer.QTClass, ( err, files: string[] ) => {
			if ( err ) {
				return CallBack ( err )
			}
			saveLog (`QT_VideoMediaUpload got files ${ files }`)
			data.videoFileName = files.join (',')
			return CallBack ()
		})
	}

	private postTweetViaQTGate ( account: TwitterAccount, postData: twitter_postData, Callback ) {
		const post = err => {
			if ( err ) {
				saveLog (`postTweetViaQTGate post got error: [${ err.message }] `)
				return Callback ( err )
			}

			delete account['twitter_verify_credentials']
			delete postData.images
			const com: QTGateAPIRequestCommand = {
				command: 'twitter_post',
				Args: [ account, postData ],
				error: null,
				requestSerial: Crypto.randomBytes( 10 ).toString ( 'hex' )
			}
			/*
			Imap.imapGetMediaFilesFromString ( this.localServer.QTClass.imapData, postData.videoFileName, QTGateVideo, ( err1, data ) => {
				if ( err1 ) {
					saveLog ( `Imap.imapGetMediaFilesFromString got error [${ err }]`)
				}
				saveLog ( `Imap.imapGetMediaFilesFromString success! [${ data }]`)
			})
			*/
			return this.localServer.QTClass.request ( com, Callback )
			
		}
		if ( postData.images && postData.images.length ) {
			return this.QT_PictureMediaUpload ( postData, post )
		}
		if ( postData.videoFileName ) {
			return this.QT_VideoMediaUpload ( postData, post )
		}
		return post ( null )
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

				let uu: twitter_post[] = null

				try {
					uu= JSON.parse ( Buffer.from ( res.Args [0], 'base64' ).toString ())
				} catch ( ex ) {
					return saveLog (`getTimelines QTClass.request return JSON.parse Error!`)
				}

				
				return CallBack ( null, uu )
			}
			if ( res.error ) {
				saveLog ( `this.localServer.QTClass.request ERROR typeof res.error = ${ typeof res.error  }` )
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
		let _return = 0
		return this.localServer.QTClass.request ( com, ( err, res: QTGateAPIRequestCommand ) => {
			_return ++
			if ( err ) {
				return CallBack ()
			}
			
			if ( res.Args && res.Args.length > 0 ) {
				let uu: twitter_post = null
				try {
					uu = JSON.parse ( Buffer.from ( res.Args [0], 'base64' ).toString ())
				} catch ( ex ) {
					return saveLog ( `getTimelines QTClass.request return JSON.parse Error! _return [ ]` )
				}
				
				return CallBack ( null, uu )
			}
			if ( res.error ) {
				saveLog ( `this.localServer.QTClass.request ERROR typeof res.error = ${ typeof res.error }`)
				
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