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

 class CoNETConnect {
	public showSendImapDataWarning = ko.observable ( false )
	public showConnectCoNETProcess = ko.observable ( true )
	public connectStage = ko.observable ( 0 )
	public connetcError = ko.observable ( -1 )
	public connectedCoNET = ko.observable ( false )
	public maynotConnectConet = ko.observable ( false )
	public mayNotMakeImapConnect = ko.observable ( false )
	public Loading = ko.observable ( false )
	public listenFun = null
	public keyPairSign: KnockoutObservable< keyPairSign > = ko.observable ( null )
	constructor ( public email: string, private isKeypairBeSign: boolean, confirmRisk: boolean, public account: string, private ready: ( err ) => void ) {
		const self = this
		if ( !confirmRisk ) {
			this.showSendImapDataWarning ( true )
		} else {
			this.imapConform ()
			this.Loading ( true )
		}

		this.listenFun = (  err, stage  ) => {
			return self.listingConnectStage ( err, stage )
		}

		_view.connectInformationMessage.socketIo.on ( 'tryConnectCoNETStage', this.listenFun )
	}

	public listingConnectStage ( err, stage ) {
		const self = this
		this.showConnectCoNETProcess ( true )
		let processBarCount = 0
		if ( typeof err === 'number' && err > -1 ) {
			this.connectStage ( -1 )
			this.ready ( err )
			return this.connetcError ( err )
		}
		
		if ( stage === 4 ) {
			this.showConnectCoNETProcess ( false )
			this.connectedCoNET ( true )
			processBarCount = 67

			
			if ( !this.isKeypairBeSign ) {
				if ( !this.keyPairSign()) {
					let u = null
					return this.keyPairSign ( u = new keyPairSign (( function () {
						
						self.keyPairSign ( u = null )
						self.ready ( null )
					})))
				}
				return
			}
			_view.showIconBar ( true )
			return this.ready ( null )
			
		}
		$('.keyPairProcessBar').progress ({
			percent: processBarCount += 33
		})
		if ( this.connectStage() === 3 ) {
			return
		}
		return this.connectStage ( stage )
		
	}


	public returnToImapSetup () {
		return this.ready ( 0 )
	}

	public imapConform () {
		this.showSendImapDataWarning ( false )
		this.connetcError ( -1 )
		this.Loading ( true )
		return _view.connectInformationMessage.sockEmit ( 'tryConnectCoNET' )
	}


}

