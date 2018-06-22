declare const Cleave
declare const StripeCheckout
const Stripe_publicKey = 'pk_live_VwEPmqkSAjDyjdia7xn4rAK9'

class coGateRegion {
	public QTConnectData = ko.observable ( null )
	public QTGateConnect1 = ko.observable ('1')
	public showQTGateConnectOption = ko.observable (false)
	public QTGateMultipleGateway = ko.observable ( 1 )
	public QTGateMultipleGatewayPool = ko.observableArray ([])
	public isFreeUser = ko.observable ( /free/i.test( this.dataTransfer.productionPackage ))
	public QTGateGatewayPortError = ko.observable ( false )
	public requestPortNumber = ko.observable ('80')
	public QTGateLocalProxyPort = ko.observable ('3001')
	public localProxyPortError = ko.observable ( false )
	public QTGateConnect2 = ko.observable ( false )
	public WebRTCleak = ko.observable ( true )
	private doingProcessBarTime = null
	public error = ko.observable ( -1 )
	public CoGateConnerting = ko.observable ( false )
	public disconnecting = ko.observable ( false )
	public localHostIP = ko.observable ( '')
	public proxyInfoMacOS = ko.observable ( false )
	public proxyInfoIE = ko.observable ( false )
	public iOS = ko.observable ( false )
	public fireFox = ko.observable ( false )
	public android = ko.observable ( false )

	constructor ( public region: QTGateRegions, public dataTransfer: iTransferData, public account: ()=> void, private isPublicImapAccount: boolean, private exit: () => void ) {
		const self = this

		socketIo.emit11 ( 'checkPort', '3001', function ( err, nextPort ) {
			if ( err ) {
				self.QTGateLocalProxyPort ( nextPort )
			}
			
		})

		this.requestPortNumber.subscribe ( function ( newValue: string ) {
			const uu = parseInt ( newValue )
			self.QTGateGatewayPortError ( false )
			if ( !newValue ) {
				return self.requestPortNumber ( '80')
			}
			if ( uu < 1 || uu > 65535 || uu === 22 ) {
				self.QTGateGatewayPortError ( true )
				return $( '.popupInput' ).popup ({
					on: 'focus',
					movePopup: false,
					position: 'top left',
					inline: true
				})
			}
		})

		this.QTGateLocalProxyPort.subscribe ( function ( newValue: string ) {
			const uu = parseInt ( newValue )
			self.localProxyPortError ( false )
			if ( !newValue ) {
				return self.requestPortNumber ( '3001' )
			}

			if ( uu < 3000 || uu > 65535 ) {
				self.localProxyPortError ( true )
				return $( '.popupInput' ).popup ({
					on: 'focus',
					movePopup: false,
					position: 'top left',
					inline: true
				})
			}

			return socketIo.emit11 ( 'checkPort', newValue, function ( err ) {
				return self.localProxyPortError ( err )
			})

		})

		setTimeout ( function () {
			$('.ui.radio.checkbox.canVoH').checkbox('check').checkbox ({
				onChecked: function () {
					self.QTGateConnect1 ('1')
				}
				
			 })
			 $('.ui.radio.checkbox.canVoe').checkbox().checkbox ({
				onChecked: function () {
					if ( self.isPublicImapAccount ) {
						self.error ( 5 )
						return $('.ui.radio.checkbox.canVoH').checkbox('check')
					}
					self.QTGateConnect1 ('2')
				}
				
			 })
		}, 50 )

		if ( /p1/i.test ( dataTransfer.productionPackage )) {
			this.QTGateMultipleGatewayPool ([1,2])
		} else if ( /p2/i.test ( dataTransfer.productionPackage )) {
			this.QTGateMultipleGatewayPool ([1,2,4])
		} else {
			this.QTGateMultipleGatewayPool ([1])
		}
		
		
	}

	public upgradeAccount () {

	}

	public showQTGateConnectOptionClick () {
		this.showQTGateConnectOption ( !this.showQTGateConnectOption())
		
		if ( this.WebRTCleak()) {
			$('.checkboxWebRTC').checkbox ('set checked')
		} else {
			$('.checkboxWebRTC').checkbox ('set unchecked')
		}
	}

	public QTGateGatewayConnectRequestCallBack ( error, connectCommand: IConnectCommand ) {
		clearTimeout ( this.doingProcessBarTime )
		this.CoGateConnerting ( false )
		
		if ( typeof error ==='number' && error > -1 ) {
			
			//this.QTGateConnectRegionActive ( true )
			//this.QTGateGatewayActiveProcess ( false )
			this.error ( error )
			return 
		}
		
		if ( connectCommand.error > -1  ) {
			return this.error ( connectCommand.error )
		}
		const data1 = connectCommand[0]
		this.localHostIP ( data1.localServerIp[0] )
		this.QTGateLocalProxyPort ( data1.localServerPort )
		//this.QTTransferData ( data1.transferData )
		return this.QTConnectData ( data1 )
		
	}

	public QTGateGatewayConnectRequest () {
		const self = this
		const connect: IConnectCommand = {

			account: this.dataTransfer.account,
			imapData: null,
			gateWayIpAddress: null,
			region: this.region.qtRegion,
			connectType: this.QTGateConnect1() === '1' ? 2 : 1,
			localServerPort: this.QTGateLocalProxyPort(),
			AllDataToGateway: !this.QTGateConnect2 (),
			error: null,
			fingerprint: null,
			localServerIp: null,
			multipleGateway: [],
			requestPortNumber: this.requestPortNumber (),
			requestMultipleGateway: this.QTGateMultipleGateway(),
			webWrt: this.WebRTCleak (),
			globalIpAddress: null
		}
		this.CoGateConnerting ( true )
		
		
		socketIo.emit11 ( 'QTGateGatewayConnectRequest', connect )
		
		return false
		
	}

	public showUserInfoMacOS ( infoOS: string ) {
		this.closeInfo ()
		switch ( infoOS ) {

			default:
			case 'macOS' : {
				return this.proxyInfoMacOS ( true )
			}
			case 'WInIE': {
				return this.proxyInfoIE ( true )
			}
			case 'iOS': {
				return this.iOS ( true )
			}
			case 'fireFox': {
				return this.fireFox ( true )
			}
			case 'android': {
				return this.android ( true )
			}
		}
	}
	public disconnectClick () {
		const self = this
		this.disconnecting ( true )
		socketIo.emit11 ( 'disconnectClick', function () {
			self.disconnecting ( false )
			self.QTConnectData ( null )
			self.exit ()
			
		})
	}

	public closeErrMessage () {
		this.error ( -1 )
	}

	public selectConnectTech ( n: number ) {
		this.QTGateConnect1 ( n.toString() )
		if ( n === 2 ) {
			if ( this.isPublicImapAccount ) {
				this.error ( 5 )
				this.QTGateConnect1 ('1')
				
			}

		}
		if ( this.QTGateConnect1 () === '1') {
			$('.radio.checkbox.canVoH').checkbox ('set checked')
		} else {
			$('.radio.checkbox.canVoe').checkbox ('set checked')
		}
		return false 
	}

	public exit1 () {
		this.exit ()
	}

	public closeInfo () {
		this.proxyInfoMacOS ( false )
		this.proxyInfoIE ( false )
		this.iOS ( false )
		this.fireFox ( false )
		this.android ( false )
	}
} 

class CoGateClass {
	public QTGateRegions = ko.observableArray ( _QTGateRegions )
	public reloading = ko.observable ( true )
	public CoGateRegion: KnockoutObservable < coGateRegion > = ko.observable (null)
	public showCards = ko.observable ( true )
	public QTTransferData: KnockoutObservable < iTransferData > = ko.observable ( )
	public pingCheckLoading = ko.observable ( false )
	public pingError = ko.observable ( false )
	public doingCommand = false
	public error = ko.observable ( -1 )
	public freeAccount = ko.observable ( true )
	public CoGateAccount: KnockoutObservable < CoGateAccount > = ko.observable ( null )

	private getAvaliableRegionCallBack ( region: regionV1 [], dataTransfer: iTransferData, config: install_config ) {
		this.showCards ( true )
		this.QTGateRegions().forEach( function ( n ) {
			const index = region.findIndex ( function ( nn )  { return nn.regionName === n.qtRegion })
			if ( index < 0 ) {
				
				return n.available( false )
			}
			n.freeUser( region[index].freeUser )
			n.canVoe ( region[index].VoE )
			return n.available ( true )
		})
		this.QTGateRegions.sort ( function ( a, b ) { 
			if ( a.available() === b.available() )   {
				return 0
			}
				
			if ( b.available() && !a.available() ) {
				return 1
			}
			return -1
		})
		this.reloading ( false )
		this.doingCommand = false
		
		this.QTTransferData ( dataTransfer )
		this.freeAccount ( /^free$/i.test( dataTransfer.productionPackage ))
		/*
		const uu = checkCanDoAtQTGate ( this.emailPool )
		if ( uu > -1 ) {
			this.QTGateConnectSelectImap ( uu )
			this.canDoAtEmail ( true )
			this.showQTGateImapAccount ( false )
		} else {
			this.QTGateConnectSelectImap (0)
		}
		*/
		$ ('.ui.dropdown').dropdown()
		/*
		this.QTTransferData ( dataTransfer )
		this.config ( config )
		this.showRegionData ( true )
		this.QTGateRegionInfo ( false )
		this.pingCheckLoading( false )
		return clearTimeout ( this.doingProcessBarTime )
		*/
	}

	private reloadRegion () {
		const self = this
		this.reloading ( true )
		this.doingCommand = true
		socketIo.emit11 ( 'getAvaliableRegion' )
	}

	private pingCheckReturn ( region: string, ping: number ) {
		const index = this.QTGateRegions().findIndex ( function ( n ) { return n.qtRegion === region })
			if ( index < 0 ) {
				return
			}
			
                
            const _reg = this.QTGateRegions()[ index ]
            if ( !_reg.available ) {
				return
			}
                
            _reg.ping ( ping )
            const fromIInputData = $(`#card-${ _reg.qtRegion.replace('.','-')}`)
            const uu = ping
            const _ping = Math.round((500 - ping)/100)

            fromIInputData.rating ({
                initialRating: _ping > 0 ? _ping : 0
            }).rating ('disable')
	}

	constructor ( private isUsedPublicImapAccount: boolean ) {
		const self = this
		this.reloadRegion ()

		socketIo.on ( 'pingCheck', function ( region: string, ping: number ) {
			return self.pingCheckReturn ( region, ping )
		})

		socketIo.on ('pingCheckSuccess', function () {
			self.pingCheckLoading ( false )
			return self.QTGateRegions.sort ( function ( a, b ) {
				const _a = a.ping()
				const _b = b.ping()
				if ( a.available() === b.available()) {
					if ( !a.available ())
						return 0
					if ( _b > 0 && _a > _b )
						return 1
					return -1
				}  
					
				if ( b.available() && !a.available() ) {
					return 1
				}
				return -1
			})
		})

		socketIo.on ( 'QTGateGatewayConnectRequest', function ( err, cmd: IConnectCommand,  ) {
			
			if ( ! self.CoGateRegion() ) {
				let uuu: coGateRegion = null
				const region = cmd[0].region
				const regionIndex = self.QTGateRegions().findIndex ( function ( n ) {
					return n.qtRegion === region
				})
				const uu = self.QTGateRegions()[ regionIndex ]
				uuu = new coGateRegion ( uu, self.QTTransferData(), function () {
					self.account ()
				}, isUsedPublicImapAccount, function () {
					self.CoGateRegion ( uuu = null )
					return self.showCards ( true )
				})
				self.CoGateRegion ( uuu )

				
			}
			self.reloading ( false )
			self.showCards ( false )
			return self.CoGateRegion().QTGateGatewayConnectRequestCallBack ( err, cmd )
		})

		socketIo.on ( 'getAvaliableRegion', function ( region: regionV1 [], dataTransfer: iTransferData, config: install_config ) {
			return self.getAvaliableRegionCallBack ( region, dataTransfer, config )
		})
	}

	public CardClick ( index: number ) {
		const self = this
		const uu = this.QTGateRegions()[ index ]
		let uuu = null
		this.CoGateRegion ( uuu = new coGateRegion ( uu, this.QTTransferData(), function () {
			self.account ()
		}, this.isUsedPublicImapAccount,function () {
			self.CoGateRegion ( uuu = null )
			return self.showCards ( true )
		}))
		this.showCards ( false )
		$('.ui.checkbox').checkbox ()
		$('.dropdown').dropdown()
		return $('.popupField').popup({
			on:'click',
			position: 'bottom center',
		})

	}

	public pingCheck () {
		const self = this
		this.doingCommand = true
		this.pingCheckLoading ( true )
		this.QTGateRegions().forEach ( function ( n ) {
			if ( ! n.available ())
				return
			return n.ping ( -1 )
		})

		return socketIo.emit11 ( 'pingCheck', function ( err, CallBack ) {
			
			if ( CallBack === -1 ) {
				self.QTGateRegions().forEach ( function ( n ) {
					n.ping ( -2 )
				})
				return self.pingError ( true )
			}
			return self.QTGateRegions().sort ( function ( a, b ) {
				const _a = a.ping()
				const _b = b.ping()
				
				if ( a.available() === b.available()) {
					if ( !a.available ())
						return 0
					if ( _b > 0 && _a > _b )
						return 1
					return -1
				}  
					
				if ( b.available() && !a.available() ) {
					return 1
				}
				return -1
			})
			
		})
	}

	public account () {
		
		this.showCards ( false )
		let uu = null
		const self = this
		return this.CoGateAccount ( uu = new CoGateAccount ( self.QTTransferData (), function ( payment: iTransferData ) {
			self.showCards ( true )
			if ( payment ) {
				const uuuu = self.QTTransferData()
				uuuu.totalMonth = payment.totalMonth || uuuu.totalMonth
				uuuu.productionPackage = payment.productionPackage || uuuu.productionPackage
				uuuu.expire = payment.expire || uuuu.expire
				uuuu.paidAmount = payment.paidAmount || uuuu.paidAmount

				uuuu.automatically = payment.paidAmount > 0 ? true : uuuu.automatically
				self.QTTransferData ( uuuu )
			}
			return self.CoGateAccount ( uu = null )
		}))
		
	}

}



class planUpgrade {

	public annually: number
	public annuallyMonth: number 
	public totalAmount = ko.observable (0)
	public currentPromoIndex: number



	public currentPromo: KnockoutObservable < CoPromo > = ko.observable (null) 
	private plan = planArray[ this.planNumber ]
	public showNote = ko.observable ( false )
	public detailArea = ko.observable ( true )
	public _promo = this.dataTransfer.promo[0]
	public _promoFor = this._promo.promoFor
	public currentPlan = ko.observable ( null )
	

	//public annually = this.promo ? Math.round ( this.promoPrice * this.plan.annually * 100 )/100 : this.plan.annually
	
	public monthlyPay = this.plan.monthlyPay
	public showCancel = ko.observable ( false )
	public CurrentPlanBalance = ko.observable (-1)
	public cardNumberFolder_Error = ko.observable ( false )
	public cvcNumber_Error = ko.observable ( false )
	public postcode_Error = ko.observable ( false )
	public cardPayment_Error = ko.observable ( false )
	public paymentDataFormat_Error = ko.observable ( false )
	public paymentCardFailed = ko.observable ( false )
	public showStripeError = ko.observable ( false )
	public payment = ko.observable (0)
	public paymentAnnually = ko.observable ( false )
	public doingPayment = ko.observable ( false )
	public paymentSelect = ko.observable ( false )
	private doingProcessBarTime = null
	public showCancelSuccess = ko.observable ( false )
	public showSuccessPayment = ko.observable ( false )
	public cardExpirationYearFolder_Error = ko.observable ( false )
	public cancel_Amount = ko.observable (0)
	public newPlanExpirationYear = ko.observable ('')
	public newPlanExpirationMonth = ko.observable ('')
	public newPlanExpirationDay = ko.observable ('')
	public samePlan = ko.observable ( false )
	public paymentError = ko.observable ( false )
	public oldPlanUpgrade = ko.observable ( null )
	public paymentData = null
	public isAutomaticallyAgain = ko.observable ( false )
	private clearPaymentError () {
		this.cardNumberFolder_Error ( false )
		this.cvcNumber_Error ( false )
		this.postcode_Error ( false )
		this.cardPayment_Error ( false )
		this.paymentDataFormat_Error ( false )
		return this.paymentCardFailed ( false )

	}


	constructor ( public planNumber: number, public isAnnual: boolean, private dataTransfer: iTransferData, private exit: ( payment ? ) => void ) {
		const self = this
		this.currentPromoIndex = this._promoFor && this._promoFor.length ? this._promoFor.findIndex ( function ( n ) {
			return n === self.plan.name
		}) : -1
		if ( this.currentPromoIndex > -1 ) {
			this.currentPromo ( this._promo )
		}
		
		this.annually = this.currentPromo() ?  Math.round ( this.plan.annually * this.currentPromo().pricePromo ) : this.plan.annually
		const month = this.currentPromo() ? 12 * this.currentPromo().datePromo : 12
		this.annuallyMonth = Math.round ( this.annually / month )
		this.annually = this.annually
		this.currentPlan ( planArray [ planArray.findIndex ( function ( n ) { 
			return n.name === self.dataTransfer.productionPackage
		})])
		
		if ( planNumber === 2 ) {
			this.showNote ( true )
			if ( this.currentPlan().name === 'p1' && dataTransfer.isAnnual ) {
				
			}
			
		}
		this.samePlan ( this.currentPlan().name === planNumber )
		
		socketIo.on ( 'cardToken', function ( err, res: QTGateAPIRequestCommand ) {
			const data = res.Args[0]
			self.doingPayment ( false )
			if ( err || typeof res.error === 'number' && res.error > -1 ) {
				return self.paymentError ( true )
			}
			self.paymentData = data
			self.showSuccessPayment ( true )
			
		})
	}

	public SuccessPaymentClose () {
		this.exit ( this.paymentData )
	}


	public showPayment ( payment: number, annually: boolean ) {
		this.detailArea ( false )
		this.payment ( payment/100 )
		this.paymentAnnually ( annually )
		const currentPro = this.currentPromo().datePromo || 1
		let month = annually ? 12 * currentPro : 1

		
		let expir = getExpireWithMonths ( month )
		//		check is stoped monthly again
		if ( this.dataTransfer.productionPackage !== 'free') {
			if ( this.dataTransfer.isAnnual ) {
				const monthly = this.dataTransfer.paidAmount / this.dataTransfer.totalMonth
				this.CurrentPlanBalance ( getRemainingMonth ( this.dataTransfer.expire ) * monthly )
			} else {
				this.CurrentPlanBalance ( this.currentPlan().monthlyPay )
			}
		} 

		if ( !annually ) {
			if ( this.plan.name === this.currentPlan().name ) {
				this.isAutomaticallyAgain ( true )
				expir = new Date ( this.dataTransfer.expire )
			} 
		} 
		this.newPlanExpirationYear ( expir.getFullYear ().toString())
		const _month = expir.getMonth () + 1
		if ( _month < 10 ) {
			this.newPlanExpirationMonth ( '0' + _month.toString() )
		} else {
			this.newPlanExpirationMonth ( _month.toString() )
		}
		
		this.newPlanExpirationDay ( expir.getDate ().toString())
		if ( this.CurrentPlanBalance() > -1 ) {
			this.totalAmount ( this.payment() - this.CurrentPlanBalance()/100)
		} else {
			this.totalAmount ( this.payment())
		}
		
	}

	private showWaitPaymentFinished () {
		const self = this
		this.doingPayment ( true )
		this.paymentSelect ( false )
		this.clearPaymentError ()
		$('.paymentProcess').progress ('reset')
		let percent = 0
		const doingProcessBar = function () {
			clearTimeout ( self.doingProcessBarTime )
			self.doingProcessBarTime = setTimeout ( function () {
				$('.paymentProcess').progress ({
					percent: ++ percent
				})
				if ( percent < 100 )
					return doingProcessBar ()
			}, 1000 )
		}
		return doingProcessBar ()
	}


	public showBrokenHeart () {
		return $( '.ui.basic.modal').modal ('setting', 'closable', false ).modal ( 'show' )
	}

	private paymentCallBackFromQTGate ( err, data: QTGateAPIRequestCommand ) {
		this.paymentSelect ( false )
			if ( err ) {
				return this.showBrokenHeart()
			}
			if ( data.error === -1 ) {
				
				data.command === 'cancelPlan' ? this.showCancelSuccess ( true ) : this.showSuccessPayment ( true )
				if ( data.command === 'cancelPlan' && data.Args[1]) {
					this.cancel_Amount ( data.Args[1])
				}
				
				const dataTrans: iTransferData = data.Args[0]

				
				
				return 
			}
			
			const errMessage = data.Args[0]
			if ( data.error === 0 ) {
				this.paymentSelect ( true )
				return this.paymentDataFormat_Error ( true )
			}
				
			if ( /expiration/i.test ( errMessage )) {
				return this.cardExpirationYearFolder_Error ( true )
			}

			if ( /cvc/i.test ( errMessage )) {
				return this.cvcNumber_Error ( true )
			}

			if ( /card number/i.test ( errMessage )) {
				return this.cardNumberFolder_Error ( true )
			}

			if ( /format/i.test ( errMessage )) {
				return this.cardPayment_Error ( true )
			}

			if ( /postcode/.test (errMessage)) {
				return this.postcode_Error ( true )
			}

			this.paymentSelect ( true )
			return this.paymentCardFailed ( true )
	}

	public openStripeCard () {
		const self = this
		this.clearPaymentError ()
		let handler = null
		const amount = this.totalAmount() * 100
		if ( StripeCheckout && typeof StripeCheckout.configure === 'function' ){
			handler = StripeCheckout.configure ({
				key: Stripe_publicKey,
				image: 'images/512x512.png',
				email: this.dataTransfer.account,
				zipCode: true,
				locale: _view.tLang() === 'tw' ? 'zh': _view.tLang(),
				token: function ( token ) {
					
					const payment: iQTGatePayment = {
						tokenID: token.id,
						Amount: amount,
						plan: self.plan.name,
						isAnnual: self.paymentAnnually (),
						autoRenew: true
						
					}
					self.showWaitPaymentFinished ()
					
					return socketIo.emit11 ( 'cardToken', payment, function ( err, data: QTGateAPIRequestCommand ) {
						return self.paymentCallBackFromQTGate ( err, data )
					})
					
				}
			})
			handler.open ({
				name: 'CoNET Technology Inc',
				description: `${ this.plan.name } `,
				amount: amount
			})

			return window.addEventListener( 'popstate', function () {
				handler.close()
			})
			
		}
		if ( !this.showStripeError ()) {
			this.showStripeError ( true )
			$('.showStripeErrorIconConnect').popup ({
				position: 'top center'
			})
			return $('.showStripeErrorIcon').transition ('flash')
		}
		

	}


	public closeClick () {
		this.exit ()
	}
	
}

class cancelPlan {
	public passedMonth = getPassedMonth ( this.startDay ) + 1
	public passedCost = this.passedMonth * this.normailMonthPrice
	public balance = this.amount - this.passedCost
	public cancelProcess = ko.observable ( false )
	private doingProcessBarTime = null
	public showError = ko.observable ( false )
	
	constructor ( public planName: string, public totalMonth, public amount, private startDay: string, public expir: string, public isAnnual , 
		private normailMonthPrice: number, private exit: ( payment ) => void ) {
			const self = this

		}
	private paymentCallBackFromQTGate ( err, data: QTGateAPIRequestCommand ) {
		this.cancelProcess ( false )
		
		if ( data && data.error === -1 ) {
			
			if ( data.command === 'cancelPlan' && data.Args[1]) {
				const cancel_Amount = data.Args[1]
			}
			
			const dataTrans: iTransferData = data.Args[0]
			return this.exit ( dataTrans )
			
		}
		this.showError ( true )
	}

	public close () {
		this.exit( null )
	}

	private showWaitPaymentFinished () {
		const self = this
		
		$('.paymentProcess').progress ('reset')
		let percent = 0
		const doingProcessBar = function () {
			clearTimeout ( self.doingProcessBarTime )
			self.doingProcessBarTime = setTimeout ( function () {
				$('.paymentProcess').progress ({
					percent: ++ percent
				})
				if ( percent < 100 )
					return doingProcessBar ()
			}, 1000 )
		}
		return doingProcessBar ()
	}

	public doCancel () {
		const self = this
		this.cancelProcess ( true )
		this.showWaitPaymentFinished ()
		socketIo.once ( 'cancelPlan', function ( err, payment ) {
			return self.paymentCallBackFromQTGate ( err, payment )
		})
		socketIo.emit11 ( 'cancelPlan' )
	}
}

const findCurrentPlan = function ( planName: string ) {
	return planArray.findIndex ( function ( n ) {
		return n.name === planName
	})
}

class CoGateAccount {
	public username = this.dataTransfer.account
	public productionPackage = this.dataTransfer.productionPackage
	public promo = this.dataTransfer.promo[0]
	public currentPlan = planArray[ findCurrentPlan ( this.productionPackage )]
	public freeAccount = ko.observable ( /^free$/i.test( this.dataTransfer.productionPackage ))
	public userPlan = ko.observable ( this.dataTransfer.productionPackage.toUpperCase() )
	public planArray = ko.observableArray ( planArray )
	public planUpgrade: KnockoutObservable < planUpgrade > = ko.observable ( null )
	public promoButton = ko.observable ( false )
	public promoInput = ko.observable ('')
	public promoInputError = ko.observable ( false )
	public doingPayment = ko.observable ( false )
	public paymentCardFailed = ko.observable ( false )
	private doingProcessBarTime = null
	public paymentSelect = ko.observable ( false )
	public inputFocus = ko.observable ( true )
	public showCancelSuccess = ko.observable ( false )
	public showSuccessPayment = ko.observable ( false )
	public UserPermentShapeDetail = ko.observable ( false )
	public paymentDataFormat_Error = ko.observable ( false )
	public cardExpirationYearFolder_Error = ko.observable ( false )
	public cvcNumber_Error = ko.observable ( false )
	public cardNumberFolder_Error = ko.observable ( false )
	public cardPayment_Error = ko.observable ( false )
	public postcode_Error = ko.observable ( false )
	public paymentAnnually = ko.observable ( this.dataTransfer.isAnnual )
	public automatically = ko.observable ( this.dataTransfer.automatically )
	public cancelPlanData: KnockoutObservable < cancelPlan > = ko.observable ( null )
	

	public currentPlanExpirationYear = ko.observable ('')
	public currentPlanExpirationMonth = ko.observable ('')
	public currentPlanExpirationDay = ko.observable ('')

	public doingCancelProcess = ko.observable ( false )


	private stopShowWaitPaymentFinished () {
		this.doingPayment ( false  )
		clearTimeout ( this.doingProcessBarTime )
		return $('.paymentProcess').progress ('reset')
	}

	private paymentCallBackFromQTGate ( err, data: QTGateAPIRequestCommand ) {
		
		this.stopShowWaitPaymentFinished ()
		if ( err ) {
			return //this.showBrokenHeart()
		}
		if ( data.error === -1 ) {
			this.paymentSelect ( false )
			this.showSuccessPayment ( true )
			const dataTrans: iTransferData = data.Args[0]
			return this.UserPermentShapeDetail ( false )
		}
		
		const errMessage = data.Args[0]
		if ( data.error === 0 ) {
			this.paymentSelect ( true )
			return this.paymentDataFormat_Error ( true )
		}
			
		if ( /expiration/i.test ( errMessage )) {
			return this.cardExpirationYearFolder_Error ( true )
		}

		if ( /cvc/i.test ( errMessage )) {
			return this.cvcNumber_Error ( true )
		}

		if ( /card number/i.test ( errMessage )) {
			return this.cardNumberFolder_Error ( true )
		}

		if ( /format/i.test ( errMessage )) {
			return this.cardPayment_Error ( true )
		}

		if ( /postcode/.test (errMessage)) {
			return this.postcode_Error ( true )
		}

		this.paymentSelect ( true )
		return this.paymentCardFailed ( true )
	}
	
	constructor ( private dataTransfer: iTransferData, public exit: ( payment ) => void ) {
		const plan = findCurrentPlan ( this.productionPackage )
		
		
		let plus1 = 1
		if ( this.currentPlan.name === 'free') {
			plus1 = 0
		}
		this.planArray()[1].showButton (true )
		this.planArray()[2].showButton (true )
		
		this.planArray()[ 1 + plus1 ].tail ( true )
		if ( this.dataTransfer.productionPackage === 'p1') {
			this.planArray()[1].showButton (false )
		}
		if ( this.dataTransfer.productionPackage === 'p2') {
			this.planArray()[1].showButton (false )
			this.planArray()[2].showButton (false )
		}
		const date = new Date ( dataTransfer.expire )
		this.currentPlanExpirationYear ( date.getFullYear().toString() )
		this.currentPlanExpirationMonth ( date.getMonth () + 1 < 9 ? '0'+ (date.getMonth () + 1).toString() : (date.getMonth () + 1).toString() )
		
		this.currentPlanExpirationDay ( date.getDate ().toString())
	}

	public selectPlan1 ( n: number ) {
		let uu = null
		const self = this
		return this.planUpgrade ( uu = new planUpgrade ( n, this.dataTransfer.isAnnual, this.dataTransfer, function ( payment ) {
			self.planUpgrade ( uu = null )
			self.exit ( payment )
		}))

	}

	public promoButtonClick () {
		this.promoButton ( true )
		this.inputFocus ( true )
		return new Cleave ( '.promoCodeInput', {
			uppercase: true,
			delimiter: '-',
			blocks: [4, 4, 4, 4]
		})
	}

	private clearPaymentError () {
		//this.cardNumberFolder_Error ( false )
		//this.cvcNumber_Error ( false )
		//this.postcode_Error ( false )
		//this.cardPayment_Error ( false )
		//this.paymentDataFormat_Error ( false )
		this.promoInputError ( false )
		return this.paymentCardFailed ( false )
	}

	public promoApplication () {
		const self = this
		if ( this.promoInput().length < 19 ) {
			return this.promoInputError ( true )
		}
		this.inputFocus ( false )
		this.promoButton ( false )
		this.showWaitPaymentFinished ()
		
		
		return socketIo.emit11 ( 'promoCode', this.promoInput(), function ( err, data: QTGateAPIRequestCommand ) {
			return self.paymentCallBackFromQTGate ( err, data )
			
		})
		
	}

	private showWaitPaymentFinished () {

		this.doingPayment ( true )
		//this.paymentSelect ( false )
		this.clearPaymentError ()
		$('.paymentProcess').progress ('reset')
		let percent = 0
		const self = this
		const doingProcessBar = function () {
			clearTimeout ( self.doingProcessBarTime )
			self.doingProcessBarTime = setTimeout ( function () {
				$('.paymentProcess').progress ({
					percent: ++ percent
				})
				if ( percent < 100 )
					return doingProcessBar ()
			}, 1000 )
		}
		return doingProcessBar ()
	}

	public cancelPlan () {
		const dataTransfer = this.dataTransfer
		let uu = null
		const self = this
		this.doingPayment ( true )
		return this.cancelPlanData ( uu = new cancelPlan ( dataTransfer.productionPackage, dataTransfer.totalMonth, dataTransfer.paidAmount, dataTransfer.startDate, dataTransfer.expire, dataTransfer.isAnnual, this.currentPlan.monthlyPay, 
			function exit ( payment ) {
				self.cancelPlanData ( uu = null )
				self.exit ( payment )
			}))
	}

	
}