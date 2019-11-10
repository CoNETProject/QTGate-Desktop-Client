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
/**
 *      check email address
 *      @param email <string>
 *      @param return <string>  Valid = '' Err = errorMessage
 */
const insideChinaEmail = /(\@|\.)(sina|sohu|qq|126|163|tom)\.com|(\.|\@)yeah\.net/i

const getNickName = function ( email: string ) {
    var ret = ''
    if ( email.length ){
        ret = email.split ('@')[0]
        ret = ret.charAt (0).toUpperCase () + ret.slice(1)
    }
    return ret
}

class IsNullValidator implements StringValidator {
    isAcceptable ( s: string ) {
        if ( s === undefined ) {
            return true
        }
        if ( s === null ) {
            return true
        }
        if ( s.length == 0 ) {
            return true
        }
    }
}
class EmailValidator implements StringValidator {
    isAcceptable ( s: string ) {
        return EmailRegexp.test( s )
    }
}

const testVal = new IsNullValidator()
const testEmail = new EmailValidator()
const checkEmail = function ( email: string ) {
    
    if ( testVal.isAcceptable ( email )) {
       return 'required'
    } 
    
    if ( ! testEmail.isAcceptable ( email ))
    {
        return 'EmailAddress'
    }
    
    return ''
}

class keyPairGenerateForm {
	public EmailAddressError = ko.observable ( false )
	public SystemAdministratorEmailAddress = ko.observable ('')
	public showInsideFireWallEmail = ko.observable ( false )
	public NickNameError = ko.observable ( false )
	public passwordError = ko.observable ( false )
	public SystemAdministratorNickName = ko.observable ('')
	public systemSetup_systemPassword = ko.observable ('')
	public showKeyPairPorcess = ko.observable ( false )
	public delete_btn_view = ko.observable ( false )
	public doingProcessBarTime = null
	public keyPairGenerateFormMessage = ko.observable ( false )
	public message_cancel = ko.observable ( false )
	public message_keyPairGenerateError = ko.observable ( false )
	public message_keyPairGenerateSuccess = ko.observable ( false )
	public showKeyPairForm = ko.observable ( true )
	public showKeyInfomation = ko.observable ( false )
	
	private checkEmailAddress ( email: string ) {
		$ ('.ui.checkbox').checkbox()
		
		this.EmailAddressError ( false )
		this.NickNameError ( false )

		if ( ! email || ! email.length ) {
			this.EmailAddressError ( true )
			return initPopupArea ()
		}
		if ( conetImapAccount.test ( email )) {
			this.EmailAddressError ( true )
			return initPopupArea ()
		}
		if ( checkEmail ( email ).length ) {

			this.EmailAddressError ( true )
			return initPopupArea ()
		}

		
		if ( ! this.SystemAdministratorNickName ().length ){
			this.SystemAdministratorNickName ( getNickName ( email ))
		}

		if ( insideChinaEmail.test ( email )) {
			this.showInsideFireWallEmail ( true )
		}
		
		return true
	}

	private checkNickname ( nickname: string ) {
		this.NickNameError ( false )
		if ( !nickname || !nickname.length ) {
			initPopupArea ()
			this.NickNameError ( true )
		}
		return true
	}

	private checkPassword ( password: string ) {
		this.passwordError(false)
		if ( !password || password.length < 5 ) {
			this.passwordError ( true )
			initPopupArea ()
		}
		return true
	}

	private stopDoingProcessBar () {
		clearTimeout ( this.doingProcessBarTime )
		this.showKeyPairPorcess ( false )
		return $('.keyPairProcessBar').progress ({
			percent: 0
		})
	}

	constructor ( private exit: ( keyPair, sessionHash: string ) => void ) {
		const self = this
		this.SystemAdministratorEmailAddress.subscribe ( function ( newValue ) {
			return self.checkEmailAddress ( newValue )
		})
		this.SystemAdministratorNickName.subscribe ( function ( newValue ) {
			return self.checkNickname ( newValue )
		})
		/*
		this.systemSetup_systemPassword.subscribe ( function ( newValue ) {
			return self.checkPassword ( newValue )
		})
		*/
	}
	
	public form_AdministratorEmail_submit () {
		const self = this
		this.checkEmailAddress ( this.SystemAdministratorEmailAddress ())
		this.checkNickname ( this.SystemAdministratorNickName ())
		this.checkPassword ( this.systemSetup_systemPassword ())
		if ( this.passwordError() || this.EmailAddressError() || this.NickNameError()) {
			return false
		}
		this.showKeyPairPorcess ( true )
		this.showKeyPairForm ( false )
		const email = this.SystemAdministratorEmailAddress ()
		const sendData: INewKeyPair = {
			password: this.systemSetup_systemPassword (),
			nikeName: this.SystemAdministratorNickName (),
			email: email
		}
		let percent = 1
		$('.keyPairProcessBar').progress ('reset')
		const timeSet = 10000
		const doingProcessBar = function () {
			clearTimeout ( self.doingProcessBarTime )
			self.doingProcessBarTime = setTimeout ( function () {
				$('.keyPairProcessBar').progress ({
					percent: percent++
				})
				if ( percent < 100 )
					return doingProcessBar ()
			}, timeSet )
		}
		

		_view.connectInformationMessage.sockEmit ( 'NewKeyPair', sendData, function ( err, keyPair, newKeyPairCallBack ) {
			self.stopDoingProcessBar ()
			self.keyPairGenerateFormMessage ( true )
			if ( !keyPair ) {
				return self.message_keyPairGenerateError ( true )
			}
			self.exit ( keyPair, newKeyPairCallBack )
			return self.message_keyPairGenerateSuccess ( true )
		}) 
		
		return doingProcessBar ()
	}

	public CloseKeyPairGenerateFormMessage () {
		this.message_cancel ( false )
		this.message_keyPairGenerateError ( false )
		this.message_keyPairGenerateSuccess ( false )
		this.keyPairGenerateFormMessage ( false )
		return this.showKeyPairForm ( true )
	}
}