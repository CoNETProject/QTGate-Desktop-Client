const aMin_Time = 1000 * 60
const aHour_Time = 60 * aMin_Time
const aDay = aHour_Time * 24

const splitLine = ( fullText: string ) => {
    if ( typeof fullText !== 'string' || !fullText.length ) {
        return fullText;
    }
    const uu = fullText.split (/\n/)
    if ( uu.length === 1 ) {
        return fullText
    }
    return '<p>' + uu.join ('</p><p>') + '</p>'
}
module twitter_layout {
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

        public QTGateConnect1 = ko.observable ('')

        constructor () {
            socketIo = io ({ reconnectionAttempts: 5, timeout: 1000 })
            socketIo.once ( 'connect', () => {
                return socketIo.emit ( 'init', ( err: Error, data: install_config ) => {
                    if ( !data ) {
                        return this.showServerError ( true )
                    }
                    return this.config ( data )
                    
                })
            })
            socketIo.on ( 'getTimelines', ( data: twitter_post ) => {
                data.QTGate_created_at = ko.computed (() => {
                    const now = new Date ()
                    const create = new Date ( data.created_at )
                    const offset = now.getTime () - create.getTime ()
                    if ( offset < aMin_Time ) {
                        setTimeout(() => {
                            return data.QTGate_created_at ()
                        }, 1000 )
                        return `${ Math.round ( offset / 1000 )} ${ infoDefine[ this.languageIndex()].twitter.second }`
                    }
                    if ( offset < aHour_Time ) {
                        setTimeout(() => {
                            return data.QTGate_created_at ()
                        }, aMin_Time )
                        return `${ Math.round ( offset / aMin_Time )} ${ infoDefine[ this.languageIndex()].twitter.min }`
                    }

                    if ( offset < aDay ) {
                        setTimeout(() => {
                            return data.QTGate_created_at ()
                        }, aHour_Time )
                        return `${ Math.round ( offset / aHour_Time )} ${ infoDefine[ this.languageIndex()].twitter.hour }`
                    }
                    
                    return `${ create.getMonth() } ${ create.getDay() }`
                })
                
                data.quoted_status = data.quoted_status || null
                if ( data.quoted_status ) {
                    data.quoted_status.extended_entities = data.quoted_status.extended_entities || null
                    data.quoted_status.full_text_split_line = splitLine ( data.quoted_status.full_text ) 
                }
                data.retweeted_status = data.retweeted_status || null

                if ( data.retweeted_status ) {
                    data.retweeted_status.QTGate_created_at = ko.computed (() => {
                        const now = new Date ()
                        const create = new Date ( data.retweeted_status.created_at )
                        const offset = now.getTime () - create.getTime ()
                        if ( offset < aMin_Time ) {
                            setTimeout(() => {
                                return data.QTGate_created_at ()
                            }, 1000 )
                            return `${ Math.round ( offset / 1000 )} ${ infoDefine[ this.languageIndex()].twitter.second }`
                        }
                        if ( offset < aHour_Time ) {
                            setTimeout(() => {
                                return data.QTGate_created_at ()
                            }, aMin_Time )
                            return `${ Math.round ( offset / aMin_Time )} ${ infoDefine[ this.languageIndex()].twitter.min }`
                        }
    
                        if ( offset < aDay ) {
                            setTimeout(() => {
                                return data.QTGate_created_at ()
                            }, aHour_Time )
                            return `${ Math.round ( offset / aHour_Time )} ${ infoDefine[ this.languageIndex()].twitter.hour }`
                        }
                        
                        return `${ create.getMonth() } ${ create.getDay() }`
                    })
                    data.retweeted_status.full_text_split_line = splitLine ( data.retweeted_status.full_text )
                }
                
                data.full_text_split_line = splitLine ( data.full_text )
                data.extended_entities = data.extended_entities || null
                data.favorite_count_ko = ko.observable ( data.favorite_count )
                data.favorited_ko = ko.observable ( data.favorited )
                this.currentTimelines.push ( data )
                this.currentTimelines.sort (( a, b ) => {
                    return b.id - a.id
                })
            })


        }

		public selectItem = ( that: any, site: () => number ) => {

            const tindex = lang [ this.tLang ()]
            let index =  tindex + 1
            if ( index > 3 ) {
                index = 0
            }

            this.languageIndex ( index )
            this.tLang( lang [ index ])
            $.cookie ( 'langEH', this.tLang(), { expires: 180, path: '/' })
            const obj = $( "span[ve-data-bind]" )
            
            obj.each (( index, element ) => {
                const self = this
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
            this.apiKey( data.apiKey )
            this.apiSecret ( data.apiSecret )
            this.accessToken ( data.accessToken )
            this.accessTokenSecret ( data.accessTokenSecret )
        }

        public login () {
            this.passwordError ( false )
            if ( this.password().length < 5 ) {
                return this.passwordError ( true )
            }
            return socketIo.emit ( 'password', this.password(), ( data: TwitterAccount[] ) => {
                if ( ! data  ) {
                    return this.passwordError ( true )
                }
                this.showLogin ( false )
                data.forEach ( n => {
                    this.twitterData.push ( n )
                })
                
                if ( this.twitterData().length === 0 ) {
                    return this.showAddTwitterAccount ( true )
                }
                this.currentTwitterAccount ( data[0].twitter_verify_credentials )
                
                this.makeAccountMenu ()
                this.showCurrentTimelines ( true )
                $( '#sidebarMenu' ).sidebar( 'hide' )
                return socketIo.emit ( 'getTimelines', data[0], err => {
                    if ( err ) {
                        return 
                    }
                })

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
            $('#sidebarMenu').sidebar('hide')
            return this.showAddTwitterAccount ( true )
        }

        private makeAccountMenu () {
            if ( !this.twitterData().length ) {
                return
            }
            this.showAccountMenu ( true )
            
        }

        public requestTwitterUser ( twitterAccount: TwitterAccount ) {
            this.makeCurrentAccount ( twitterAccount )
            this.showLoader ( true )
            this.resetAddAccountError ()
            this.showAddTwitterAccount ( false )
            return socketIo.emit ( 'addTwitterAccount', twitterAccount, ( data: TwitterAccount  ) => {
                this.showLoader ( false )
                if ( !data ) {
                    return this.showServerError ( true )
                }
                this.currentTwitterAccount ( data.twitter_verify_credentials )
                return this.makeAccountMenu ()
            })
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
                apiKey: this.apiKey(),
                apiSecret: this.apiSecret(),
                accessToken: this.accessToken(),
                accessTokenSecret: this.accessTokenSecret (),
                twitter_verify_credentials: null
            }
            
            return this.requestTwitterUser ( addTwitterAccount )
        }

        public selectAccount ( item: TwitterAccount, index ) {
            $( '#sidebarMenu' ).sidebar( 'hide' )
            if ( this.currentTwitterAccount().id === item.twitter_verify_credentials.id ) {
                return false
            }
            this.currentTwitterAccount ( item.twitter_verify_credentials )
            this.twitterData.unshift ( item ) 
            this.twitterData.splice ( index(), 1 )
            this.currentTimelines([])
            socketIo.emit ( 'saveAccounts', this.twitterData())
            
            return socketIo.emit ( 'getTimelines', item, err => {
                if ( err ) {
                    return 
                }
            })
            
                 
        }

        public favoriteClick ( item: twitter_post, index ) {
            const id = item.id
            item.favorited_ko ( item.favorited = ! item.favorited )
            item.favorite_count_ko ( item.favorite_count += item.favorited ? 1 : -1 )
            return socketIo.emit ( 'twitter_favorited' , this.currentTwitterAccount (), id, item.favorited, err => {
                if ( err ) {
                    return
                }
            })
        }

    }
}
const twitter_view = new twitter_layout.twitter ()
ko.applyBindings ( twitter_view , document.getElementById ( 'body' ))
const uu = '.' + twitter_view.tLang()
$( uu ).addClass( 'active' )