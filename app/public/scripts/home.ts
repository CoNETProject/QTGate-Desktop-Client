/*!
 * Copyright 2018 CoNET Technology Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


const InitKeyPair = function () {
	const keyPair: keypair = {
		publicKey: null,
		privateKey: null,
		keyLength: null,
		nikeName: null,
		createDate: null,
		email: null,
		passwordOK: false,
		verified: false,
		publicKeyID: null,
		_password: null
	}
	return keyPair
}

const url = 'https://api.github.com/repos/QTGate/QTGate-Desktop-Client/releases/latest'

const makeKeyPairData = function ( view: view_layout.view, keypair: keypair ) {
    const length = keypair.publicKeyID.length
    keypair.publicKeyID = keypair.publicKeyID.substr ( length - 16 )
        
    let keyPairPasswordClass = new keyPairPassword ( function ( _imapData: IinputData, passwd: string, sessionHash: string ) {
        //      password OK

        keypair.keyPairPassword ( keyPairPasswordClass = null )
		keypair.passwordOK = true
		keypair._password = passwd
        keypair.showLoginPasswordField ( false )
        view.keyPairCalss = new encryptoClass ( keypair )
        view.showKeyPair ( false )
        if ( _imapData && _imapData.imapTestResult ) {
            return view.imapSetupClassExit ( _imapData, sessionHash )
        }
        let uu = null
        return view.imapSetup ( uu = new imapForm ( keypair.email, _imapData, function ( imapData: IinputData ) {
            view.imapSetup ( uu = null )
            view.imapSetupClassExit ( imapData, sessionHash )
        }))
        
    })
    
    keypair.keyPairPassword = ko.observable( keyPairPasswordClass )
    keypair.showLoginPasswordField = ko.observable ( false )
    keypair.delete_btn_view = ko.observable ( true )
    keypair.showConform = ko.observable ( false )
    keypair['showDeleteKeyPairNoite'] = ko.observable ( false )
    keypair.delete_btn_click = function () {
        keypair.delete_btn_view ( false )
        return keypair.showConform ( true )
    }
    
    
    keypair.deleteKeyPairNext = function () {
        
        view.connectInformationMessage.sockEmit ( 'deleteKeyPairNext', () => {
            view.showIconBar ( false )
            view.connectedCoNET ( false )
            view.connectToCoNET ( false )
            view.CoNETConnect (view.CoNETConnectClass = null)
            view.imapSetup ( view.imapFormClass = null )
            keypair.showDeleteKeyPairNoite ( false )
            return keypair.delete_btn_view ( false )
        })
        
        
        
    }

    
}

const initPopupArea = function () {
    const popItem = $( '.activating.element' ).popup('hide')
    const inline = popItem.hasClass ('inline')
    return popItem.popup({
        on: 'focus',
        movePopup: false,
        position: 'top left',
        inline: inline
    })
}

const appList = [
    {
        //                      1
        name: 'CoGate',
        likeCount: ko.observable ( 0 ),
        liked: ko.observable ( false ),
        commentCount: ko.observable(),
        titleColor: '#0066cc',
        css: 'width: 6em;height: 6em;display: block;',
        comeSoon: false,
        show: false,
        click: function ( view: view_layout.view ) { 
            return 
        },
        image: '/images/CoGate.png'
    },{
        //                      2
        name: 'CoChat',
        likeCount: ko.observable (0),
        liked: ko.observable (false),
        commentCount: ko.observable(0),
        titleColor: '#006600',
        comeSoon: true,
        css: 'width: 6em;height: 6em;display: block;',
        show: true,
        image: '/images/CoMsg.png',
        click: function ( view: view_layout.view ) { return },
    },{
        //                      3
        name: 'CoBox',
        likeCount: ko.observable (0),
        liked: ko.observable (false),
        commentCount: ko.observable(0),
        titleColor: '#990000',
        comeSoon: true,
        css: 'width: 6em;height: 6em;display: block;',
        show: true,
        image: '/images/CoBox.png',
        click: function ( view: view_layout.view ) { return },
    },{
        //                      4
        name: 'CoMail',
        likeCount: ko.observable (0),
        liked: ko.observable (false),
        commentCount: ko.observable(0),
        titleColor: '#09b83e',
        comeSoon: true,
        css: 'width: 6em;height: 6em;display: block;',
        show: false,
        image: '/images/coMail.png',
        click: function ( view: view_layout.view ) { return },
    },
    {
        //                      5
        name: 'coNews',
        likeCount: ko.observable (0),
        liked: ko.observable (false),
        commentCount: ko.observable(0),
        titleColor: 'grey',
        comeSoon: true,
        css: 'width: 6em;height: 6em;display: block;',
        show: false,
        image: '/images/coNews.png',
        click: function ( view: view_layout.view ) { return },
    },
    {
        //                      7
        name: 'CoSearch',
        likeCount: ko.observable (0),
        liked: ko.observable (false),
        commentCount: ko.observable(0),
        titleColor: '#4885ed',
        comeSoon: false,
        css: 'width: 6em;height: 6em;display: block;',
        show: true,
        image: '/images/CoSearchIcon.svg',
        click: function ( view: view_layout.view ) {
            
            return window.open ( `/coSearch?sessionHash=${ view.sessionHash }`, '_blank' )
        },
    },{
        //                      8
        name: 'CoTweet',
        likeCount: ko.observable (0),
        liked: ko.observable (false),
        commentCount: ko.observable(0),
        titleColor: '#00aced',
        comeSoon: false,
        css: 'width: 6em;height: 6em;display: block;',
        show: false,
        image: '/images/Twitter_Logo_Blue.svg',
        click: function ( view: view_layout.view ) { 
            return
            //return window.open ('/twitter', '_blank')
        }
    },
    {
        //                      9
        name: 'CoYoutube',
        likeCount: ko.observable (0),
        liked: ko.observable (false),
        titleColor: '#00aced',
        comeSoon: true,
        css: 'width: 6em;height: 6em;display: block;',
        show: false,
        image: '/images/1024px-YouTube_Logo_2017.svg.png',
        click: function ( view: view_layout.view ) {
            return 
            //return window.open ('/youtube', '_blank')
        },
    },
    {
        name: 'CoWallet',
        likeCount: ko.observable (0),
        liked: ko.observable (false),
        titleColor: '#00aced',
        comeSoon: true,
        css: 'width: 6em;height: 6em;display: block;',
        show: true,
        image: '/images/wallet.png',
        click: function ( view: view_layout.view ) { return },

    },
    {
        //                      6
        name: 'CoCustom',
        likeCount: ko.observable (0),
        liked: ko.observable (false),
        commentCount: ko.observable(0),
        titleColor: '#09b83e',
        comeSoon: false,
        css: 'width: 6em;height: 6em;display: block;',
        show: true,
        image: '/images/512x512.png',
        click: function ( view: view_layout.view ) { return },
    }
    
]

module view_layout {
    export class view {
        public connectInformationMessage = new connectInformationMessage( '/' )
        public sectionLogin = ko.observable ( false )
        public sectionAgreement = ko.observable ( false )
        public sectionWelcome = ko.observable ( true )
        public isFreeUser = ko.observable ( true )
        public QTTransferData = ko.observable ( false )
        public LocalLanguage = 'up'
        public menu = Menu
        public modalContent = ko.observable ('')
        public keyPairGenerateForm: KnockoutObservable< keyPairGenerateForm> = ko.observable ()
        public tLang = ko.observable ( initLanguageCookie ())
        public languageIndex = ko.observable ( lang [ this.tLang() ])
        public localServerConfig: KnockoutObservable < install_config > = ko.observable ()
        public keyPair: KnockoutObservable < keypair > = ko.observable ( InitKeyPair ())
        public hacked = ko.observable ( false )
        public imapSetup: KnockoutObservable < imapForm > = ko.observable ()
        public showIconBar = ko.observable ( false )
        public connectToCoNET = ko.observable ( false )
        public connectedCoNET = ko.observable ( false )
        public showKeyPair = ko.observable ( false )
        public CoNETConnectClass: CoNETConnect = null
        public imapFormClass: imapForm = null
        public CoNETConnect: KnockoutObservable < CoNETConnect > = ko.observable ( null )
		public appMenuObj = {}
		public bodyBlue = ko.observable ( true )
		
		public keyPairCalss: encryptoClass = null

        public appsManager: KnockoutObservable< appsManager > = ko.observable ( null )
        public AppList = ko.observable ( false )

        public imapData: IinputData = null
        public newVersion = ko.observable ( null )
		public sessionHash = ''
		public showLanguageSelect = ko.observable ( true )

        private afterInitConfig ( ) {
            
            this.keyPair ( this.localServerConfig ().keypair )
            if ( this.keyPair() && this.keyPair().keyPairPassword() &&  typeof this.keyPair().keyPairPassword().inputFocus ==='function' ) {
				this.keyPair().keyPairPassword().inputFocus( true )
				this.sectionLogin ( false )
            }
        }
    
        private initConfig ( config: install_config ) {
            const self = this
            this.showKeyPair ( true )
            if ( config.keypair && config.keypair.publicKeyID ) {
                /**
                 * 
                 *      Key pair ready
                 * 
                 */
                makeKeyPairData ( this, config.keypair )
                if ( ! config.keypair.passwordOK ) {
                    config.keypair.showLoginPasswordField ( true )
                }
                
                
            } else {
                /**
                 * 
                 *      No key pair
                 * 
                 */
                
                this.clearImapData ()
                config.keypair = null
                let _keyPairGenerateForm =  new keyPairGenerateForm ( function ( _keyPair: keypair, sessionHash: string ) {
                    /**
                     *      key pair ready
                     */
                    makeKeyPairData ( self, _keyPair )
                    _keyPair.passwordOK = true
                    let keyPairPassword = _keyPair.keyPairPassword ()
                    _keyPair.keyPairPassword ( keyPairPassword = null )
                    config.keypair = _keyPair
                    
                    self.keyPair ( _keyPair )
                
                    self.showKeyPair ( false )
                    initPopupArea ()
                    let uu = null
                    self.imapSetup ( uu = new imapForm ( config.account, null, function ( imapData: IinputData ) {
                        self.imapSetup ( uu = null )
                        return self.imapSetupClassExit ( imapData, sessionHash )
                    }))
                    return self.keyPairGenerateForm ( _keyPairGenerateForm = null )

                })
                this.keyPairGenerateForm ( _keyPairGenerateForm )
            }
            this.localServerConfig ( config )
            this.afterInitConfig ()
            
        }

        private clearImapData () {
            
            let imap = this.imapSetup()
            this.imapSetup( imap = null )
        }
    
        private socketListen () {
            let self = this

            
            this.connectInformationMessage.sockEmit ( 'init', ( err, config: install_config) => {
                if ( err ) {
                    return
                }
                return self.initConfig ( config )
            })

            this.connectInformationMessage.socketIo.on ('init', ( err, config: install_config) => {
                if ( err ) {
                    return
                }
                return self.initConfig ( config )
            })
        }
    
        constructor () {
            this.socketListen ()
            
        }
        
        //          change language
        public selectItem ( that: any, site: () => number ) {
    
            const tindex = lang [ this.tLang ()]
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
            
            $('.languageText').shape (`flip ${ this.LocalLanguage }`)
            $('.KnockoutAnimation').transition('jiggle')
            return initPopupArea()
        }
        //          start click
        public openClick () {
            if ( !this.connectInformationMessage.socketIoOnline ) {
                return this.connectInformationMessage.showSystemError ()
            }
            
			this.sectionWelcome ( false )
			/*
            if ( this.localServerConfig().firstRun ) {
                return this.sectionAgreement ( true )
			}
			*/
            this.sectionLogin ( true )
            return initPopupArea ()
            
        }

        public deletedKeypairResetView () {
            this.imapSetup (null)
            
        }
    
        public agreeClick () {
            
            this.connectInformationMessage.sockEmit ( 'agreeClick' )
            this.sectionAgreement ( false )
            this.localServerConfig().firstRun = false
            return this.openClick()
            
        }

        public refresh () {
            if ( typeof require === 'undefined' ) {
                this.modalContent ( infoDefine[ this.languageIndex() ].emailConform.formatError [ 11 ] )
                return this.hacked ( true )
            }
            const { remote } = require ('electron')
            if ( remote && remote.app && typeof remote.app.quit === 'function' ) {
                return remote.app.quit()
            }
            
        }

        public showKeyInfoClick () {
            this.sectionLogin ( true )
            this.showKeyPair ( true )
            this.AppList ( false )
            this.appsManager ( null )
        }

        public imapSetupClassExit ( _imapData: IinputData, sessionHash: string ) {
            const self = this
            this.imapData = _imapData
            this.sessionHash = sessionHash
            return this.CoNETConnect ( this.CoNETConnectClass = new CoNETConnect ( _imapData.imapUserName, this.keyPair().verified, _imapData.confirmRisk, this.keyPair().email, 
            function ConnectReady ( err ) {
                if ( typeof err ==='number' && err > -1 ) {
                    self.CoNETConnect ( this.CoNETConnectClass = null )
                    return self.imapSetup ( this.imapFormClass = new imapForm ( _imapData.account, null, function ( imapData: IinputData ) {
                        self.imapSetup ( this.imapFormClass = null )
                        return self.imapSetupClassExit ( imapData, sessionHash )
                    }))
                    
                    
                    
                }
                self.connectedCoNET ( true )
                self.AppList ( true )
                self.appsManager ( new appsManager ( self.appMenuObj ))
                $('.dimmable').dimmer ({ on: 'hover' })
                $('.comeSoon').popup ({
                    on: 'focus',
                    movePopup: false,
                    position: 'top left',
                    inline: true
				})
				_view.connectInformationMessage.socketIo.removeEventListener ('tryConnectCoNETStage', self.CoNETConnectClass.listenFun )
            }))

        }

        public reFreshLocalServer () {
            location.reload()

        }

        public homeClick () {
			this.AppList ( true )
			this.sectionLogin ( false )
            this.appsManager ( new appsManager ( this.appMenuObj ))
            this.showKeyPair ( false )
            $('.dimmable').dimmer ({ on: 'hover' })
            $('.comeSoon').popup ({
                on: 'focus',
                movePopup: false,
                position: 'top left',
                inline: true
            })
        }
    }
}

const _view = new view_layout.view ()

ko.applyBindings ( _view , document.getElementById ( 'body' ))
$(`.${ _view.tLang()}`).addClass('active')
