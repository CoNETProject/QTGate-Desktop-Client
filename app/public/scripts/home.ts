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

class showWebPageClass {
	public showLoading = ko.observable ( true )
	public htmlIframe = ko.observable ( null )
	public showErrorMessage = ko.observable ( false )
	public showHtmlCodePage = ko.observable ( false )
	public showImgPage = ko.observable ( true )
	public showErrorMessageProcess () {
		this.showLoading ( false )
		this.showErrorMessage ( true )
	}
	public png = ko.observable ('')
	
	public close () {
		this.showImgPage ( false )
		this.showHtmlCodePage ( false )
		this.png ( null )
		this.exit ()
	}

	public imgClick () {
		this.showHtmlCodePage ( false )
		this.showImgPage ( true )
	}
	
	public htmlClick () {
		this.showHtmlCodePage ( true )
		this.showImgPage ( false )
	}

	constructor ( public showUrl: string, private zipBase64Stream: string, private zipBase64StreamUuid: string, private exit: ()=> void ) {
		const self = this
		_view.showIconBar ( false )
		
		_view.keyPairCalss.decryptMessageToZipStream ( zipBase64Stream, ( err, data ) => {
			if ( err ) {
				return self.showErrorMessageProcess ()
			}
			showHTMLComplete ( zipBase64StreamUuid, data, ( err, data: { img: string, html: string, folder: [ { filename: string, data: string }]} ) => {
				if ( err ) {
					return self.showErrorMessageProcess ()
				}
				_view.bodyBlue ( false )
				const getData =  ( filename: string, _data: string ) => {
					
					const regex = new RegExp (`${ filename }`,'g')
					
					const index = html.indexOf ( `${ filename }` )
					
					if ( index > -1 ) {
						if ( /js$/.test ( filename )) {
							_data = _data.replace ( /^data:text\/plain;/, 'data:application/javascript;')
						} else if ( /css$/.test ( filename )) {
							_data = _data.replace ( /^data:text\/plain;/, 'data:text/css;')
						} else if ( /html$|htm$/.test ( filename )) {
							_data = _data.replace ( /^data:text\/plain;/, 'data:text/html;')
						} else if ( /pdf$/.test ( filename )) {
							_data = _data.replace ( /^data:text\/plain;/, 'data:text/html;')
						} else {
							const kkk = _data
						}

						html = html.replace ( regex, _data )
						
					}
					
					
				}

				let html = data.html
				
				data.folder.forEach ( n => {
					getData ( n.filename, n.data )
				})

				
				
				self.png ( data.img )
				
				const htmlBolb = new Blob ([ html ], { type: 'text/html'})
				const _url = window.URL.createObjectURL ( htmlBolb )
				const fileReader = new FileReader()
				fileReader.onloadend = evt => {
					return window.URL.revokeObjectURL ( _url )
				}
				
				self.showLoading ( false )
				self.htmlIframe ( _url )
				
			})
		})
		
	}
}

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
		public bodyBlue = ko.observable ( true )
		public CanadaBackground = ko.observable ( false )
		
		public keyPairCalss: encryptoClass = null

        public appsManager: KnockoutObservable< appsManager > = ko.observable ( null )
        public AppList = ko.observable ( false )

        public imapData: IinputData = null
        public newVersion = ko.observable ( null )
		public sessionHash = ''
		public showLanguageSelect = ko.observable ( true )
		private demoTimeout
		private demoMainElm

		
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
                this.svgDemo_showLanguage ()
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
					self.keyPairCalss = new encryptoClass ( self.keyPair () )
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

            this.connectInformationMessage.socketIo.on ('init', ( err, config: install_config ) => {
                if ( err ) {
                    return
                }
                return self.initConfig ( config )
            })
        }
    
        constructor () {
            this.socketListen ()
            this.CanadaBackground.subscribe ( val => {
				if ( val ) {
					$.ajax ({
						url:'/scripts/CanadaSvg.js'

					}).done ( data => {
						eval ( data )
					})
				}
			})
			
        }
        
        //          change language
        public selectItem ( that?: any, site?: () => number ) {
			
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

			clearTimeout ( this.demoTimeout )
			if ( this.demoMainElm && typeof this.demoMainElm.remove === 'function' ) {
				this.demoMainElm.remove()
				this.demoMainElm = null
			}
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
				self.homeClick ()
				
            }))

        }

        public reFreshLocalServer () {
            location.reload()

        }

        public homeClick () {
			this.AppList ( true )
			this.sectionLogin ( false )
			const connectMainMenu = () => {
				let am = null
				this.appsManager ( am = new appsManager (() => {
					am = null
					return connectMainMenu ()
				}))
				
			}
            connectMainMenu ()
            this.showKeyPair ( false )
            $('.dimmable').dimmer ({ on: 'hover' })
            $('.comeSoon').popup ({
                on: 'focus',
                movePopup: false,
                position: 'top left',
                inline: true
			})
			_view.connectInformationMessage.socketIo.removeEventListener ('tryConnectCoNETStage', this.CoNETConnectClass.listenFun )
		}

		/**
		 * 
		 * 		T/t = Translate (t is relative, T is absolute) R/r = rotate(r is relative, R is absolute) S/s = scale(s is relative, S is absolute)
		 */
		
		private svgDemo_showLanguage () {
			if ( !this.sectionWelcome()) {
				return
			}
			let i = 0
			const changeLanguage = () => {
				if ( ++i === 1 ) {
					backGround_mask_circle.attr ({
						stroke: "#FF000090",
					})
					return setTimeout (() => {
						changeLanguage()
					}, 1000 )
				}
				if ( i > 5 || !this.sectionWelcome() ) {
					main.remove()
					return this.demoMainElm = main = null
				}
				this.selectItem ()
				this.demoTimeout = setTimeout (() => {
					changeLanguage ()
				}, 2000 )
			}

			const width = window.innerWidth
			const height = window.outerHeight
			let main = this.demoMainElm = Snap( width, height )
			
			const backGround_mask_circle = main.circle( width / 2, height / 2, width / 1.7 ).attr({
				fill:'#00000000',
				stroke: "#FF000020",
				strokeWidth: 5,
			})

			const wT = width/2 - 35
			const wY = 30 - height / 2
			backGround_mask_circle.animate ({
				transform: `t${ wT } ${ wY }`,
				r: 60
			}, 3000, mina.easeout, changeLanguage )

		}
    }
}

const _view = new view_layout.view ()

ko.applyBindings ( _view , document.getElementById ( 'body' ))
$(`.${ _view.tLang()}`).addClass('active')
