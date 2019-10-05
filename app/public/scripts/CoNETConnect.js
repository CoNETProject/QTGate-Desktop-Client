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
    constructor(email, isKeypairBeSign, confirmRisk, account, ready) {
        this.email = email;
        this.isKeypairBeSign = isKeypairBeSign;
        this.account = account;
        this.ready = ready;
        this.showSendImapDataWarning = ko.observable(false);
        this.showConnectCoNETProcess = ko.observable(true);
        this.connectStage = ko.observable(0);
        this.connetcError = ko.observable(-1);
        this.connectedCoNET = ko.observable(false);
        this.maynotConnectConet = ko.observable(false);
        this.mayNotMakeImapConnect = ko.observable(false);
        this.Loading = ko.observable(false);
        this.listenFun = null;
        this.keyPairSign = ko.observable(null);
        const self = this;
        if (!confirmRisk) {
            this.showSendImapDataWarning(true);
        }
        else {
            this.imapConform();
            this.Loading(true);
        }
        this.listenFun = (err, stage) => {
            return self.listingConnectStage(err, stage);
        };
        _view.connectInformationMessage.socketIo.on('tryConnectCoNETStage', this.listenFun);
    }
    listingConnectStage(err, stage) {
        const self = this;
        this.showConnectCoNETProcess(true);
        let processBarCount = 0;
        if (typeof err === 'number' && err > -1) {
            this.connectStage(-1);
            this.ready(err);
            return this.connetcError(err);
        }
        if (stage === 4) {
            this.showConnectCoNETProcess(false);
            this.connectedCoNET(true);
            processBarCount = 67;
            if (!this.isKeypairBeSign) {
                if (!this.keyPairSign()) {
                    let u = null;
                    return this.keyPairSign(u = new keyPairSign((function () {
                        self.keyPairSign(u = null);
                        self.ready(null);
                    })));
                }
                return;
            }
            _view.showIconBar(true);
            return this.ready(null);
        }
        $('.keyPairProcessBar').progress({
            percent: processBarCount += 33
        });
        if (this.connectStage() === 3) {
            return;
        }
        return this.connectStage(stage);
    }
    returnToImapSetup() {
        return this.ready(0);
    }
    imapConform() {
        this.showSendImapDataWarning(false);
        this.connetcError(-1);
        this.Loading(true);
        return _view.connectInformationMessage.sockEmit('tryConnectCoNET');
    }
}
