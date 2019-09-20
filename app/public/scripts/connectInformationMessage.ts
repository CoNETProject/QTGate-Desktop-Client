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
const messageBoxDefine = {
	
	offline:[' 无互联网链接 ',' インターネットに接続していないです ',' Have no Internet ',' 無互聯網連結 '],
	systemError: ['CoNET客户端故障，请重启后再试','端末故障です、CoNETを再起動してください','CoNET client error! Restart CoNET please!','CoNET客戶端故障，請重啟後再試'],
	reConnectCoNET: ['CoNET链接已中断','CoNETとの接続が中断され','CoNET connection lost.','CoNET的鏈接已中斷'],
	connectingToCoNET: ['正在连接CoNET...','CoNETへ接続中...','Connecting to CoNET...','正在連結CoNET...'],
	connectedToCoNET:['成功连接CoNET','CoNETに接続しました','Success to connect CoNET','成功連結CoNET'],
	sendConnectRequestMail: [
		'客户端正向CoNET系统发出联机请求Email。这需要额外的时间，请耐心等待。',
		'接続要請メールをCoNETシステムへ送信しました、接続を完了するまで時間がかかるのため、しばらくお待ちおください。',
		'Sending connection request email to CoNET. Please wait a moment, re-connecting to CoNET.',
		'客戶端正向CoNET發出聯網請求Email。這需要額外的時間，請耐心等待。']
}


class connectInformationMessage {
	public offlineInfo = ko.observable ( false )
	public showNegative = ko.observable ( false )
	public showGreen = ko.observable ( false )
	public messageArray = ko.observable ( null )
	public socketIoOnline = true
	public socketIo =  io ( `http://localhost:3000${ this.url }`, { reconnectionAttempts: 5, timeout: 500, autoConnect: true })

	private first = true
	constructor ( private url: string = "/") {

		const self = this

		this.offlineInfo.subscribe ( function (vv) {
			if ( this.first ) {
				return
			}
			const div =  $('#offlineInfo')
			if ( vv ) {
				return div.transition('fly down')
			}
			div.transition('fly down')
		})

		this.first = false

		this.socketIo.on ( 'reconnect_failed', () => {
			this.socketIoOnline = false
			self.showErrorMessage ( 'systemError' )
		})

		this.socketIo.on ( 'reconnect', attempt => {
			this.socketIoOnline = true
			this.hideMessage ()
		})

		this.socketIo.on ( 'systemErr', err => {
			self.showErrorMessage ( err )
		})


		
	}

	public sockEmit ( eventName: string, ...args ) {
		const self = this
		if ( ! this.socketIoOnline ) {
			return this.showErrorMessage ( 'systemError' )
		}
		const argLength = args.length - 1
		let _CallBack = null
	
		if ( argLength > -1 && typeof ( args[ argLength ]) === 'function' ) {
			_CallBack = args.pop ()
		}



		this.socketIo.emit ( eventName, ...args, ( err, ...data ) => {
			if ( err ) {
				self.showErrorMessage ( err )
			}

			if ( _CallBack ) {
				return _CallBack ( err, ...data )
			}
		})
	}

	public showErrorMessage ( err ) {
		if ( !err ) {
			return
		}

		const errMes = ( typeof err === "string" ) ? messageBoxDefine[ err ] : messageBoxDefine[ err.message ] || err.message
		if ( !errMes ) {
			return
		}
		this.hideMessage()
		this.messageArray ( errMes )
		this.showNegative ( true )
		this.offlineInfo ( true )
	}

	public showSystemError () {
		return this.showErrorMessage ( 'systemError' )
	}

	public showRestartCoNET_Connect () {
		this.showErrorMessage ( 'reConnectCoNET' )
	}
	
	public hideMessage() {
		this.offlineInfo ( false )
		this.messageArray ( null )
		this.showNegative ( false )

	}
}

