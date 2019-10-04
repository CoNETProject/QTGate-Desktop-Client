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
class keyPairPassword {
    constructor(exit) {
        this.exit = exit;
        this.showPasswordErrorMessage = ko.observable(false);
        this.systemSetup_systemPassword = ko.observable('');
        this.passwordChecking = ko.observable(false);
        this.inputFocus = ko.observable(false);
        const self = this;
        this.systemSetup_systemPassword.subscribe(function (newValue) {
            if (!newValue || !newValue.length) {
                return;
            }
            self.showPasswordErrorMessage(false);
        });
    }
    showPasswordError() {
        this.showPasswordErrorMessage(true);
        this.systemSetup_systemPassword('');
        return initPopupArea();
    }
    keyPair_checkPemPasswordClick() {
        const self = this;
        this.showPasswordErrorMessage(false);
        if (!this.systemSetup_systemPassword() || this.systemSetup_systemPassword().length < 5) {
            return this.showPasswordError();
        }
        this.passwordChecking(true);
        return _view.connectInformationMessage.sockEmit('checkPemPassword', this.systemSetup_systemPassword(), function (err, _imapData, passwd, sessionHash) {
            self.passwordChecking(false);
            if (err || typeof _imapData === 'boolean' && _imapData) {
                return self.showPasswordError();
            }
            return self.exit(_imapData, passwd, sessionHash);
        });
    }
}
