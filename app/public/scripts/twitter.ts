const aMin_Time = 1000 * 60
const aHour_Time = 60 * aMin_Time
const aDay = aHour_Time * 24
let bottomDown = false

const splitLine = function ( user: any[], fullText: string, entities: twitter_entities ) {
    if ( user && user.length ) {
        user.forEach ( function ( n )  {
            const matchText = new RegExp(`( )?RT `,'g')
            fullText = fullText.replace ( `@${ n.screen_name }`, '')
            fullText = fullText.replace ( matchText, '')
        })
    }
    
    if ( typeof fullText !== 'string' || !fullText.length ) {
        return fullText;
    }
    if ( entities && entities.urls && entities.urls.length ) {
        entities.urls.forEach ( function ( n )  {
            fullText = fullText.replace ( n.url, `<a target="_blank" href="${ n.expanded_url }" style="color:#ABB8C2;">${ n.expanded_url }</a>` )
        })
    }
    fullText = fullText.replace (/https\:\/\/t.co\/\S*/, '')


    const uu = fullText.split (/\n/)

    if ( uu.length === 1 ) {
        return `<p style="margin-bottom: 0px;">${ fullText }</p>`
    }
    const ret = '<p style="margin-bottom: 0px;">' + uu.join ('</p><p style="margin-bottom: 0px;">') + '</p>'
    
    return ret

}

socketIo.emit11 = function ( eventName: string, ...args ) {
    
    let CallBack = args.pop ()
    if ( typeof CallBack !== 'function') {
        CallBack ? args.push ( CallBack ) : null
        CallBack = null
    }

    const localTimeOut = setTimeout ( function () {
        let uu = eventName
        twitter_view.systemError()
    }, 10000 )

    const _CallBack = function ( err ) {
        clearTimeout ( localTimeOut )
        
        if ( CallBack ) {
            socketIo.once ( eventName, function ( ...args ) {
                return CallBack ( ...args )
            })
        }
        
    }
    args.length
    ? socketIo.emit ( eventName, ...args, _CallBack ) 
    : socketIo.emit ( eventName, _CallBack )
}

const monthToText = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
]

const getTimeFromCreate = function ( created_at: string, twitter: twitter_layout.twitter ) {
    const now = new Date ()
    const create = new Date ( created_at )
    const offset = now.getTime () - create.getTime ()
    if ( offset < aMin_Time ) {
        setTimeout( function () {
            return getTimeFromCreate ( created_at, twitter )
        }, 1000 )
        return `${ Math.round ( offset / 1000 )} ${ infoDefine[ twitter.languageIndex()].twitter.second }`
    }
    if ( offset < aHour_Time ) {
        setTimeout( function () {
            return getTimeFromCreate ( created_at, twitter)
        }, aMin_Time )
        return `${ Math.round ( offset / aMin_Time )} ${ infoDefine[ twitter.languageIndex()].twitter.min }`
    }

    if ( offset < aDay ) {
        setTimeout( function () {
            return getTimeFromCreate ( created_at, twitter )
        }, aHour_Time )
        return `${ Math.round ( offset / aHour_Time )} ${ infoDefine[ twitter.languageIndex()].twitter.hour }`
    }
    if ( twitter.languageIndex() === 2 ) {
        return `${ monthToText[create.getMonth()] } ${ create.getDay() }`
    }
    return `${ create.getMonth() }${ infoDefine[ twitter.languageIndex()].twitter.month }${create.getDay()}${ infoDefine[ twitter.languageIndex()].twitter.day }`
}
/*
const bottomEvent = ( CallBack ) => {
	const win = $( window )
	const _document = $( document )
	return win.scroll (() => {
        const uuu = win.scrollTop() + win.height()
        const low = _document.height() - 200
        
		if (  uuu > low ) {
            if ( bottomDown ) {
                return CallBack()
            }
			bottomDown = true
		}
	})
}
*/



const initDashoffset = 50.2655
const twitterMaxTextCount = 280
const maxWidth = 2048
const MaxHeight = 2048
const convertSvgToPng = function ( svgUrlData: string, CallBack ) {
    
    let image = new Image()
    image.onload = function () {
        const canvas = document.createElement ( 'canvas' )
        let height = MaxHeight
        let width = maxWidth
        if ( image.naturalHeight > image.naturalWidth ) {
            width = Math.round (( image.naturalWidth / image.naturalHeight ) * MaxHeight )
        } else {
            height = Math.round (( image.naturalHeight / image.naturalWidth ) * maxWidth )
        }
        canvas.height = height
        canvas.width = width
        canvas.getContext ('2d').drawImage ( image, 0, 0, width, height )
        CallBack ( canvas.toDataURL ( 'image/png' ))
    }
    return image.src = svgUrlData
}
const maxVideoSize = 1024 * 150000
var BASE64_MARKER = ';base64,'
const fileReadChunkSize  = 1000 * 1024 // 1 Mbytes

function parseFile ( process, item: twitter_layout.twitterField , file, CallBack ) {
    const fileSize = file.size
    let offset = 0
    let first = 0
    
    const chunkReaderBlock = function ( _offset, length, _file ) {
        const r = new FileReader()
        const blob = _file.slice ( _offset, length + _offset )

        r.onload = function ( evt: ProgressEvent & { target: { result: string, error: Error }}) {

            if ( evt.target.error ) {
                return CallBack ( evt.target.error )
            }
            const uu = evt.target.result
            
            return socketIo.emit11 ( 'mediaFileUpdata', file.name, uu, first ++, function ( err ) {
                
                if ( err ) {
                    return CallBack ( err )
                }
                offset += length
                if ( offset >= fileSize ) {
                    return CallBack ()
                }
                process.progress ({
                    percent: Math.round ( offset * 100 / fileSize )
                })
                // of to the next chunk
                return chunkReaderBlock ( offset, fileReadChunkSize, file ) 
            })
            
        }
        r.readAsArrayBuffer ( blob )
    }

    // now let's start the read with the first block
    chunkReaderBlock ( offset, fileReadChunkSize, file )
}

const maxVideoWH = 1280 * 1024
const mixVideoWH = 32 * 32
const maxDuration = 140
const readFile = function ( ee ) {
    if ( !ee ) {
        return 
    }
    const file  = ee.files[0]

    if ( ! file || !file.type.match ( /^video.(mp4$|x\-m4v$)|^image.(png$|jpg$|jpeg$|gif$)/ )) {
        return
    }
    const uu = parseInt ( $( ee ).attr( 'itemIndex' ))
    const item = twitter_view.newTwitterField()[ uu ]
    const length = file.size
    

    if ( file.type.match ( /^video.(mp4$|x\-m4v$)/ )) {
        item.uploadVideo ( true )
        item.showToolBar ( false )
        item.videoSize = length
        const _process = $('.videoItemUpload').progress('reset').progress ({
            percent: 0
        })
        return parseFile ( _process, item, file, function ( err )  {
            item.uploadVideo ( false )
            if ( err ) {
                return item.fileReadError ( true )
            }
            //      file on end!
            
            item.video( `/videoTemp/${ file.name }`)
            const videoTag = $(`video[video-id='${ file.name }']`)

            const listenEvent = function () {
                videoTag.off ( 'loadeddata' )
                //videoTag.removeEventListener ( 'loadeddata', listenEvent )
                const oo: HTMLVideoElement = videoTag[0]
                const width = oo.videoHeight
                const height = oo.videoHeight
                const videoTimeCount = oo.duration
                const wh = width * height
                if ( wh > maxVideoWH || wh < mixVideoWH || file.size > maxVideoSize || videoTimeCount > maxDuration ) {
                    twitter_view.newTwitterFieldError ( true )
                    return item.newTwitterFieldError ( true )
                }
            }
            return videoTag.on ( 'loadeddata', listenEvent )
            
            
        })
    }
    
    const reader = new FileReader()
    reader.onload = function ( e ) {
        const rawData: string = reader.result
        const type = rawData.split(',')[0].split(':')[1]
        if ( /\/svg/i.test( type )) {
            return convertSvgToPng ( rawData,function ( _data ) {
                item.images.push ( _data )
                return twitter_view.checkNewTwrrtWindowClosable ()
            })
        }
        twitter_view.checkNewTwrrtWindowClosable ()
        item.images.push ( rawData )
    }

    return reader.readAsDataURL ( file )
}

module twitter_layout {
    export class twitterField {
        public inputText = ko.observable ('')
        public textAreaHeight = ko.observable (3)
        public stroke_dashoffset = ko.observable ( initDashoffset )
        public stroke_dashoffset_showSafe = ko.observable ( true )
        public stroke_dashoffset_showDanger = ko.observable ( false )
        public avaliableText = ko.observable ( twitterMaxTextCount )
        public showToolBar = ko.observable ( true )
        public files = ko.observable ('')
        public uuid = uuid_generate()
        public images = ko.observableArray ([])
        public video = ko.observable ('')
        
        public videoSize = 0
        private twitterLength = 0
        private lastTextlength = 0
        public textAreaError = ko.observable ( false )
        public newTwitterFieldError = ko.observable ( false )
        public fileReadError = ko.observable ( false )
        public uploadVideo = ko.observable ( false )
        public videoFileName 
        constructor ( private twitter: twitter ) {
			const self = this
            this.inputText.subscribe ( function ( ns ) {
                self.textAreaError ( false )
                const uu = twitter.newTwitterField()
                if ( ns.length === 0 && self.images().length === 0 && uu.length > 1 ) {
                    const index = self.twitter.newTwitterField().findIndex ( function ( nn ) { return nn.uuid === self.uuid })
                    if ( index > -1 ) {
                        return self.twitter.newTwitterField.splice ( index, 1 )
                    }
                    return
                }
                const CallBack = function () {
                    self.stroke_dashoffset ( initDashoffset * ( 1 - self.twitterLength / 280 ))
                    self.stroke_dashoffset_showDanger ( false )
                    self.stroke_dashoffset_showSafe ( true )
                    self.twitter.shownewTwitterApprove ( false )
                    self.avaliableText ( twitterMaxTextCount - self.twitterLength )
                    
                    if ( self.twitterLength  > 270 ) {
                        self.stroke_dashoffset_showSafe ( false )
                    }
                    if ( self.twitterLength > 280 ) {
                        self.stroke_dashoffset_showDanger ( true )
                    }
                    const lastRecordTextLength = uu[ uu.length - 1 ].inputText()
                    twitter.checkNewTwrrtWindowClosable ()
                    if ( lastRecordTextLength ) {
                        return twitter.addButtonDisabled ( false )
                    }
                    return twitter.addButtonDisabled ( true )
                }
                if ( self.lastTextlength < ns.length ) {
                    if ( ns.length - self.lastTextlength > 1 || / $/.test ( ns )) {
                        return socketIo.emit11 ( 'getTwitterTextLength', ns, function ( twTextObj: twitter_text_parseTweet ) {
                            if ( !twTextObj.valid ) {
                                self.textAreaError ( true )
                            }
                            self.twitterLength = twTextObj.weightedLength
                            CallBack ()
                        })
                    }
                    self.lastTextlength = ns.length
                    self.twitterLength += 1
                    return CallBack ()
                }
                if ( self.lastTextlength - ns.length > 1 || / $/.test ( ns )) {
                    return socketIo.emit11 ( 'getTwitterTextLength', ns, function ( twTextObj: twitter_text_parseTweet ) {
                        if ( !twTextObj.valid ) {
                            self.textAreaError ( true )
                        }
                        self.twitterLength = twTextObj.weightedLength
                        CallBack ()
                    })
                }
                self.lastTextlength = ns.length
                self.twitterLength -= 1
                return CallBack ()
                
			})
			this.videoFileName = ko.computed ( function () {
				return self.video ().replace ( '/videoTemp/','' )
			})
        }

        public textAreaClick () {
            this.twitter.newTwitterField().forEach ( function ( n ) {
                n.showToolBar ( false )
            })
            this.showToolBar ( true )
        }

        public deleteImage ( index ) {
            this.images.splice ( index, 1 )
            return this.twitter.checkNewTwrrtWindowClosable ()
        }

        public deleteVideo () {
            this.video ('')
            this.newTwitterFieldError ( false )
            this.twitter.newTwitterFieldError ( false )
            return this.twitter.checkNewTwrrtWindowClosable ()
        }
        
    }
    export class twitter {
        //- for add new Twitter account
            public apiKey = ko.observable('')
            public apiKeyError = ko.observable ( false )
            public apiSecret = ko.observable ('')
            public apiSecretError = ko.observable ( false )
            public accessToken = ko.observable ('')
            public accessTokenError = ko.observable ( false )
            public accessTokenSecret = ko.observable ('')
            public accessTokenSecretError = ko.observable ( false )
            public showAddTwitterAccount = ko.observable ( false )
        //-
        public overflowShow = ko.observable ( false )
        
        public tLang = ko.observable ( initLanguageCookie ())
        public languageIndex = ko.observable ( lang [ this.tLang() ])
        public LocalLanguage = 'up'
        public menu = Menu
        public showLogin = ko.observable ( true )
        public showServerError = ko.observable ( false )
        public password = ko.observable ('')
        public passwordError = ko.observable ( false )
        public showLoader = ko.observable ( false )
        public showAccountMenu = ko.observable ( false )
        public twitterData: KnockoutObservableArray < TwitterAccount > = ko.observableArray ([])
        public currentTwitterAccount: KnockoutObservable < Twitter_verify_credentials > = ko.observable ()
        public currentTimelines: KnockoutObservableArray< twitter_post > = ko.observableArray ([])
        public showCurrentTimelines = ko.observable ( false )
        public showAccountError = ko.observable ( false )
        public newTwitterField: KnockoutObservableArray<twitterField> = ko.observableArray ([])
        public addButtonDisabled = ko.observable ( true )
        public showDistroynewTwitter = ko.observable ( true )
        public shownewTwitterApprove = ko.observable ( false )
        public newTwitterFieldError = ko.observable ()
        public addATwitterAccount = ko.observable ( false )         //      doing add a new account 
        private processBarTime: NodeJS.Timer = null
        public config: KnockoutObservable < install_config> = ko.observable ({
            firstRun: true,
            alreadyInit: false,
            multiLogin: false,
            version: '',
            keypair: null,
            QTGateConnected: false,
            localConnectImapEmailName: null,
            needCheckEmail: false,
            localConnectImap: null,
            freeUser: null,
            account: null,
            imapConnectStatus: null,
            serverGlobalIpAddress: null,
            connectedImapDataUuid: null,
            serverPort: null,
            iterations: null,
            connectedQTGateServer: false,
            localIpAddress: null,
            lastConnectType: 1
        })

        private requestNewTimelinesCount = 0
        public QTGateConnect1 = ko.observable ('')
        private bottomEventLoader = ko.observable ( false )

        private twitterPostReturn ( data: twitter_post ) {
			const self = this
            if ( ! data ) {
                return alert ('no data ')
            }
            if ( ++this.requestNewTimelinesCount === 20 ) {
                this.bottomEventLoader( false )
            }

            const index = this.currentTimelines().findIndex( function ( n ) { return n.id_str === data.id_str })
            if ( index > -1 ) {
                this.currentTimelines.splice ( index, 1 )
            }
            data.QTGate_created_at = ko.computed( function () {
                return getTimeFromCreate( data.created_at, self )
            })

            
            data.quoted_status = data.quoted_status || null
            if ( data.quoted_status ) {
                data.quoted_status.extended_entities = data.quoted_status.extended_entities || null

                //fixVideoFolder ( data.quoted_status.extended_entities )
                const user = data.quoted_status.entities && data.quoted_status.entities.user_mentions && data.quoted_status.entities.user_mentions.length ? data.quoted_status.entities.user_mentions : null
                data.quoted_status.full_text_split_line = splitLine ( user, data.quoted_status.full_text, data.quoted_status.entities ) 
            }
            data.retweeted_status = data.retweeted_status || null

            if ( data.retweeted_status ) {
                data.retweeted_status.favorite_count_ko = ko.observable ( data.retweeted_status.favorite_count )
                data.retweeted_status.favorited_ko = ko.observable ( data.retweeted_status.favorited )
                data.retweeted_status.favoritedLoader_ko = ko.observable ( false )
                data.retweeted_status.QTGate_created_at = ko.computed ( function () {
                    return getTimeFromCreate( data.retweeted_status.created_at, self )
                })
                data.retweeted_status.extended_entities = data.retweeted_status.extended_entities || null
                //fixVideoFolder ( data.retweeted_status.extended_entities )
                
                const user = data.retweeted_status.entities && data.retweeted_status.entities.user_mentions && data.retweeted_status.entities.user_mentions.length ? data.retweeted_status.entities.user_mentions : null
                data.retweeted_status.full_text_split_line = splitLine ( user, data.retweeted_status.full_text, data.retweeted_status.entities )
                data.retweeted_status.quoted_status = data.retweeted_status.quoted_status || null
                if ( data.retweeted_status.quoted_status ) {
                    data.retweeted_status.quoted_status.extended_entities = data.retweeted_status.quoted_status.extended_entities || null

                    //fixVideoFolder ( data.retweeted_status.quoted_status.extended_entities )
                    const user = data.retweeted_status.quoted_status.entities && data.retweeted_status.quoted_status.entities.user_mentions && data.retweeted_status.quoted_status.entities.user_mentions.length 
                        ? data.retweeted_status.quoted_status.entities.user_mentions : null
                    data.retweeted_status.quoted_status.full_text_split_line = splitLine ( user, data.retweeted_status.quoted_status.full_text, data.retweeted_status.quoted_status.entities )
                }
            }
            const user = data.entities && data.entities.user_mentions && data.entities.user_mentions.length ? data.entities.user_mentions : null
            data.full_text_split_line = splitLine ( null, data.full_text, data.entities )
            data.extended_entities = data.extended_entities || null
            //fixVideoFolder ( data.extended_entities )
            data.favorite_count_ko = ko.observable ( data.retweeted_status ? data.retweeted_status.favorite_count : data.favorite_count )
            data.favorited_ko = ko.observable ( data.retweeted_status ? data.retweeted_status.favorited : data.favorited )
            data.favoritedLoader_ko = ko.observable ( false )
            this.currentTimelines.push ( data )
            $('.row.ui.shape').shape()
            return this.currentTimelines.sort ( function ( a, b ) {
                return b.id - a.id
            })
        }

        constructor () {
            const self = this
            socketIo.once ( 'connect', function () {
                return socketIo.emit11 ( 'init', function ( err: Error, data: install_config ) {
                    if ( !data ) {
                        return self.showServerError ( true )
                    }
                    return self.config ( data )
                    
                })
            })

            socketIo.on ( 'getTimelines', function ( data: twitter_post ) {
                return self.twitterPostReturn ( data )
            })

            self.newTwitterField.push ( new twitterField( self ))
        }

        public getTimeLinesNext () {
			const self = this
            if ( this.bottomEventLoader ()) {
                return
            }
            this.bottomEventLoader ( true )
            this.requestNewTimelinesCount = 0
            const maxID = this.currentTimelines()[ this.currentTimelines().length - 1 ].id
            return socketIo.emit11 ( 'getTimelinesNext', this.twitterData()[0], maxID, function ( err ) {
                return self.getTimeLineCallBack ( err )
            })
        }

		public selectItem = function ( that: any, site: () => number ) {

            const tindex = parseInt ( lang [ this.tLang ()] )
            let index =  tindex + 1
            if ( index > 3 ) {
                index = 0
            }

            this.languageIndex ( index )
            this.tLang( lang [ index ])
            $.cookie ( 'langEH', this.tLang(), { expires: 180, path: '/' })
            const obj = $( "span[ve-data-bind]" )
            
            obj.each ( function ( index, element ) {
                
                const ele = $( element )
                const data = ele.attr ( 've-data-bind' )
                if ( data && data.length ) {
                    ele.text ( eval ( data ))
                }
            })
            
            $('.languageText').shape ( 'flip ' + this.LocalLanguage )
            return $('.KnockoutAnimation').transition('jiggle')
        }

        private makeCurrentAccount ( data: TwitterAccount ) {
            this.currentTwitterAccount ( data.twitter_verify_credentials )
            this.apiKey( data.consumer_key )
            this.apiSecret ( data.consumer_secret )
            this.accessToken ( data.access_token_key )
            this.accessTokenSecret ( data.access_token_secret )
        }

        public login () {
			const self = this
            this.passwordError ( false )
            if ( this.password().length < 5 ) {
                return this.passwordError ( true )
            }
            return socketIo.emit11 ( 'password', this.password(), function ( err, data: TwitterAccount[] ) {
                if ( err ) {
                    return self.passwordError ( true )
                }
                self.showLogin ( false )
                data.forEach ( function ( n ) {
                    self.twitterData.push ( n )
                })
                
                if ( self.twitterData().length === 0 ) {
                    return self.showAddTwitterAccount ( true )
                }
                self.currentTwitterAccount ( data[0].twitter_verify_credentials )
                
                self.makeAccountMenu1 ()
                
                return $( '#sidebarMenu' ).sidebar( 'hide' )
                
            })
        }

        private resetAddAccountError () {
            this.accessTokenError ( false )
            this.accessTokenSecretError ( false )
            this.apiKeyError ( false )
            this.showLoader ( false )
            return this.apiSecretError ( false )
        }

        private addNewAccount () {
            $('#sidebarMenu').sidebar ('hide')
            this.showAddTwitterAccount ( true )
            const body = $( "html, body" )
            return body.stop().animate({ scrollTop: 0 }, 500, 'swing', function () {})
        }

        private makeAccountMenu1 () {
			const self = this
            if ( !this.twitterData().length ) {
                return
            }
            this.showAccountMenu ( true )
            this.bottomEventLoader ( true )
            
            this.requestNewTimelinesCount = 0
            
            setTimeout ( function () {
                self.bottomEventLoader ( false )
			}, 1000 * 120 )
			
            this.showCurrentTimelines ( true )
            this.currentTimelines([])
            
            return socketIo.emit11 ( 'getTimelines', this.twitterData()[0] )
            
        }

        public getTimeLineCallBack ( err: Error[] ) {
            if ( err && err.length ) {
                const _err = err[0]
                if ( /Invalid/i.test( _err.message )) {
                    this.showCurrentTwitterAppInfomation ()
                    this.accessTokenError ( true )
                    this.accessTokenSecretError ( true )
                    this.apiKeyError ( true )
                    this.apiSecretError ( true )
                    this.showLoader ( false )
                    this.showCurrentTimelines ( false )
                    return this.showAccountError ( true )
                }
            }
        }

        public requestTwitterUser ( twitterAccount: TwitterAccount ) {
            this.makeCurrentAccount ( twitterAccount )
            this.addATwitterAccount ( true )
            this.addTwitterProgress ()
            this.resetAddAccountError ()
            const self = this
            return socketIo.emit11 ( 'addTwitterAccount', twitterAccount, function ( err, data: TwitterAccount  ) {
                clearTimeout ( self.processBarTime )
                self.addATwitterAccount ( false )
                $('.AddTwitterAccountProgress').progress('reset')
                if ( !data ) {
                    return self.showServerError ( true )
                }
                if ( !data.twitter_verify_credentials ) {
                    self.apiKeyError ( true )
                    self.apiSecretError ( true )
                    self.accessTokenError ( true )
                    return self.accessTokenSecretError ( true )
                    
                }
                self.showAddTwitterAccount ( false )
                self.twitterData.push ( data )
                self.currentTwitterAccount ( data.twitter_verify_credentials )
                self.makeAccountMenu1 ()
                
            })
        }

        public showCurrentTwitterAppInfomation () {
            this.resetAddAccountError ()
            const account = this.twitterData()[0]
            this.apiKey ( account.consumer_key )
            this.apiSecret ( account.consumer_key )
            this.accessToken ( account.access_token_key )
            this.accessTokenSecret ( account.access_token_secret )
            return this.showAddTwitterAccount ( true )
        }

        private addTwitterProgress() {
            const _process = $('.AddTwitterAccountProgress').progress('reset').progress ({
                percent: 0
			})
			const self = this
            let count = 0
            const keep = function () {
                _process.progress ({
                    percent: count ++
                })
                return self.processBarTime = setTimeout ( function () {
                    return keep ()
                }, 1000 )
            }
            return keep()
        }

        public addTwitter () {
            this.resetAddAccountError ()
            if ( !this.apiKey().length ) {
                this.apiKeyError ( true )
            }
            if ( !this.apiSecret().length ) {
                this.apiSecretError ( true )
            }
            if ( !this.accessToken().length ) {
                this.accessTokenError ( true )
            }
            if ( !this.accessTokenSecret().length ) {
                this.accessTokenSecretError ( true )
            }
            if ( this.accessTokenSecretError() || this.accessTokenError() || this.apiKeyError() || this.apiSecretError ()) {
                return false
            }
            const addTwitterAccount: TwitterAccount = {
                consumer_key: this.apiKey(),
                consumer_secret: this.apiSecret(),
                access_token_key: this.accessToken(),
                access_token_secret: this.accessTokenSecret (),
                twitter_verify_credentials: null
            }
            
            return this.requestTwitterUser ( addTwitterAccount )
        }

        public selectAccount ( item: TwitterAccount, index ) {
			const self = this
            $( '#sidebarMenu' ).sidebar( 'hide' )
            if ( this.currentTwitterAccount().id === item.twitter_verify_credentials.id ) {
                return false
            }
            this.currentTwitterAccount ( item.twitter_verify_credentials )
            this.twitterData.unshift ( item ) 
            this.twitterData.splice ( index(), 1 )
            this.currentTimelines([])
            socketIo.emit ( 'saveAccounts', this.twitterData())
            this.bottomEventLoader ( true )
            this.requestNewTimelinesCount = 0
            this.showCurrentTimelines ( true )
            return socketIo.emit11 ( 'getTimelines', item )
            
                 
        }

        public favoriteClick ( item: twitter_post ) {
            
            item.favoritedLoader_ko ( true )
            
            return socketIo.emit ( 'twitter_favorited' , this.twitterData()[0], item.id_str, !item.favorited_ko(), function ( err ) {
                item.favoritedLoader_ko ( false )
                if ( err ) {
                    return
                }
                item.favorited_ko ( item.favorited = ! item.favorited )
                item.favorite_count_ko ( item.favorite_count += item.favorited ? 1 : -1 )
            })
            
        }

        public addNewTweet () {
            this.newTwitterField().forEach ( function ( n ) {
                n.showToolBar ( false )
            })
            this.newTwitterField.push ( new twitterField( this ))
            this.addButtonDisabled ( true )
            return this.checkNewTwrrtWindowClosable ()
        }

        public deleteTweetItem ( index: number ) {
            this.newTwitterField.splice ( index, 1 )
            this.addButtonDisabled ( this.newTwitterField()[ this.newTwitterField().length - 1 ].inputText().length === 0 )

        }

        public showNewTwrrtWindow () {
            this.shownewTwitterApprove ( false )
            return $('#newTwitterWindow').modal( 'show' )
        }

        public hideNewTwrrtWindow () {
            this.checkNewTwrrtWindowClosable ()
            if ( ! this.showDistroynewTwitter ()) {
                return this.distroynewTwitter()
            }
            return this.shownewTwitterApprove ( true )
        }

        public distroynewTwitter () {
            this.shownewTwitterApprove ( false )
            $( '#newTwitterWindow' ).modal ('hide')
            return this.newTwitterField ([ new twitterField ( this )])
        }

        public checkNewTwrrtWindowClosable () {
			let HideWindow = false
			const self = this
            this.newTwitterField().forEach ( function ( n ) {
                HideWindow = n.images().length > 0 || n.inputText().length > 0
                if ( n.newTwitterFieldError () ) {
                    self.newTwitterFieldError ( true )
                }
                
            })
            
            this.showDistroynewTwitter ( HideWindow )
            
                return $( '#newTwitterWindow' ).modal({
                    closable: !HideWindow
                }).modal ('show')
            
            //return $( '#newTwitterWindow' ).modal( 'setting', 'closable', true )
        }


        private newTwitterData ( twiData: twitterField ) {
            if ( ! twiData.inputText().length && ! twiData.images().length && ! twiData.videoFileName ) {
                return null
            }
            const TwitterData: twitter_postData  = {
                text: twiData.inputText(),
                images: twiData.images (),
                videoSize: twiData.videoSize,
                videoFileName: twiData.videoFileName(),
                media_data: []
            }
            return TwitterData
        }

        public newTwitterClick () {
			const self = this
            const data = []
            this.shownewTwitterApprove ( false )
            $( '#newTwitterWindow' ).modal ( 'hide' )
            $( '#newTwitterWindow' ).modal ( 'hide' )
            this.newTwitterField().forEach ( function ( n ) {
                const nn = self.newTwitterData ( n )
                if ( !nn ) {
                    return self.newTwitterField ([ new twitterField ( this )])
                }
                data.push ( nn )
            })
            if ( !data.length ) {
                return this.newTwitterField ([ new twitterField ( this )])
            }
            
            this.newTwitterField ([ new twitterField ( this )])

            return socketIo.emit11 ( 'twitter_postNewTweet', this.twitterData()[0], data, function ( err: Error, data ) {
                if ( err ) {
                    return alert ( err )
                }
                if ( data ) {
                    return self.twitterPostReturn ( data )
                }
            })

        }

        public timelinesViewSharp ( id_str: string ) {
            return $(`.shape[sharp-id='${ id_str }']`).shape ('flip over')
        }

    }
}

const twitter_view = new twitter_layout.twitter ()
ko.applyBindings ( twitter_view , document.getElementById ( 'body' ))
const uu = '.' + twitter_view.tLang()
$( uu ).addClass( 'active' )
