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
    const keyPair = {
        publicKey: null,
        privateKey: null,
        keyLength: null,
        nikeName: null,
        createDate: null,
        email: null,
        passwordOK: false,
        verified: false,
        publicKeyID: null
    };
    return keyPair;
};
const url = 'https://api.github.com/repos/QTGate/QTGate-Desktop-Client/releases/latest';
socketIo.emit11 = function (eventName, ...args) {
    let CallBack = args.pop();
    if (typeof CallBack !== 'function') {
        CallBack ? args.push(CallBack) : null;
        CallBack = null;
    }
    const localTimeOut = setTimeout(function () {
        let uu = eventName;
        _view.systemError();
    }, 10000);
    const _CallBack = function (err) {
        clearTimeout(localTimeOut);
        if (CallBack) {
            socketIo.once(eventName, function (...args) {
                return CallBack(...args);
            });
        }
    };
    args.length
        ? socketIo.emit(eventName, ...args, _CallBack)
        : socketIo.emit(eventName, _CallBack);
};
const makeKeyPairData = function (view, keypair) {
    const length = keypair.publicKeyID.length;
    keypair.publicKeyID = keypair.publicKeyID.substr(length - 16);
    let keyPairPasswordClass = new keyPairPassword(function (_imapData) {
        //      password OK
        keypair.keyPairPassword(keyPairPasswordClass = null);
        keypair.passwordOK = true;
        keypair.showLoginPasswordField(false);
        view.showIconBar(true);
        view.showKeyPair(false);
        if (_imapData && _imapData.imapTestResult) {
            return view.imapSetupClassExit(_imapData);
        }
        let uu = null;
        return view.imapSetup(uu = new imapForm(keypair.email, _imapData, function (imapData) {
            view.imapSetup(uu = null);
            view.imapSetupClassExit(imapData);
        }));
    });
    keypair.keyPairPassword = ko.observable(keyPairPasswordClass);
    keypair.showLoginPasswordField = ko.observable(false);
    keypair.delete_btn_view = ko.observable(true);
    keypair.showConform = ko.observable(false);
    keypair.delete_btn_click = function () {
        keypair.delete_btn_view(false);
        return keypair.showConform(true);
    };
    keypair.deleteKeyPairNext = function () {
        socketIo.emit11('deleteKeyPairNext');
        view.showIconBar(false);
        view.connectedCoNET(false);
        view.connectToCoNET(false);
        return keypair.delete_btn_view(false);
    };
    socketIo.once('deleteKeyPairNoite', function () {
        return keypair.showDeleteKeyPairNoite(true);
    });
    keypair.showDeleteKeyPairNoite = ko.observable(false);
};
const initPopupArea = function () {
    const popItem = $('.activating.element').popup('hide');
    const inline = popItem.hasClass('inline');
    return popItem.popup({
        on: 'focus',
        movePopup: false,
        position: 'top left',
        inline: inline
    });
};
const appList = [
    {
        name: 'CoGate',
        likeCount: ko.observable(0),
        liked: ko.observable(false),
        commentCount: ko.observable(),
        titleColor: '#0066cc',
        css: 'width: 6em;height: 6em;display: block;',
        comeSoon: false,
        show: true,
        click: function (view) {
            return view.CoGateClick();
        },
        image: '/images/CoGate.png'
    }, {
        name: 'CoMsg',
        likeCount: ko.observable(0),
        liked: ko.observable(false),
        commentCount: ko.observable(0),
        titleColor: '#006600',
        comeSoon: true,
        css: 'width: 6em;height: 6em;display: block;',
        show: true,
        image: '/images/CoMsg.png',
        click: function (view) { return; },
    }, {
        name: 'CoBox',
        likeCount: ko.observable(0),
        liked: ko.observable(false),
        commentCount: ko.observable(0),
        titleColor: '#990000',
        comeSoon: true,
        css: 'width: 6em;height: 6em;display: block;',
        show: true,
        image: '/images/CoBox.png',
        click: function (view) { return; },
    }, {
        name: 'CoMail',
        likeCount: ko.observable(0),
        liked: ko.observable(false),
        commentCount: ko.observable(0),
        titleColor: '#09b83e',
        comeSoon: true,
        css: 'width: 6em;height: 6em;display: block;',
        show: true,
        image: '/images/coMail.png',
        click: function (view) { return; },
    },
    {
        name: 'coNews',
        likeCount: ko.observable(0),
        liked: ko.observable(false),
        commentCount: ko.observable(0),
        titleColor: 'grey',
        comeSoon: true,
        css: 'width: 6em;height: 6em;display: block;',
        show: true,
        image: '/images/coNews.png',
        click: function (view) { return; },
    },
    {
        name: 'CoCustom',
        likeCount: ko.observable(0),
        liked: ko.observable(false),
        commentCount: ko.observable(0),
        titleColor: '#09b83e',
        comeSoon: false,
        css: 'width: 6em;height: 6em;display: block;',
        show: true,
        image: '/images/512x512.png',
        click: function (view) { return; },
    }, {
        name: 'CoGoogle',
        likeCount: ko.observable(0),
        liked: ko.observable(false),
        commentCount: ko.observable(0),
        titleColor: '#4885ed',
        comeSoon: true,
        css: 'width: 6em;height: 6em;display: block;',
        show: true,
        image: '/images/Google__G__Logo.svg',
        click: function (view) { return; },
    }, {
        name: 'CoTweet',
        likeCount: ko.observable(0),
        liked: ko.observable(false),
        commentCount: ko.observable(0),
        titleColor: '#00aced',
        comeSoon: false,
        css: 'width: 6em;height: 6em;display: block;',
        show: true,
        image: '/images/Twitter_Logo_Blue.svg',
        click: function (view) {
            return window.open('/twitter', '_blank');
        }
    },
    {
        name: 'CoYoutube',
        likeCount: ko.observable(0),
        liked: ko.observable(false),
        titleColor: '#00aced',
        comeSoon: true,
        css: 'width: 6em;height: 6em;display: block;',
        show: true,
        image: '/images/1024px-YouTube_Logo_2017.svg.png',
        click: function (view) { return; },
    },
    {
        name: 'CoYoutube',
        likeCount: ko.observable(0),
        liked: ko.observable(false),
        titleColor: '#00aced',
        comeSoon: true,
        css: 'width: 6em;height: 6em;display: block;',
        show: true,
        image: '/images/wallet.png',
        click: function (view) { return; },
    }
];
var view_layout;
(function (view_layout) {
    class view {
        constructor() {
            this.sectionLogin = ko.observable(false);
            this.sectionAgreement = ko.observable(false);
            this.sectionWelcome = ko.observable(true);
            this.isFreeUser = ko.observable(true);
            this.QTTransferData = ko.observable(false);
            this.LocalLanguage = 'up';
            this.menu = Menu;
            this.CoNETLocalServerError = ko.observable(false);
            this.modalContent = ko.observable('');
            this.keyPairGenerateForm = ko.observable();
            this.tLang = ko.observable(initLanguageCookie());
            this.languageIndex = ko.observable(lang[this.tLang()]);
            this.localServerConfig = ko.observable();
            this.keyPair = ko.observable(InitKeyPair());
            this.hacked = ko.observable(false);
            this.imapSetup = ko.observable();
            this.showIconBar = ko.observable(false);
            this.connectToCoNET = ko.observable(false);
            this.connectedCoNET = ko.observable(false);
            this.showKeyPair = ko.observable(false);
            this.CoGate = ko.observable(false);
            this.CoGateClass = ko.observable(null);
            this.showCoGateButton = ko.observable(false);
            this.showCoGate = ko.observable(false);
            this.CoNETConnect = ko.observable(null);
            this.AppList = ko.observable(false);
            this.CoGateRegionStoped = ko.observable(false);
            this.imapData = null;
            this.newVersion = ko.observable('');
            this.socketListen();
        }
        systemError() {
            this.modalContent(infoDefine[this.languageIndex()].emailConform.formatError[10]);
            $('#CoNETError').modal('setting', 'closable', false).modal('show');
            return this.CoNETLocalServerError(true);
        }
        afterInitConfig() {
            this.keyPair(this.localServerConfig().keypair);
            if (this.keyPair() && this.keyPair().keyPairPassword() && typeof this.keyPair().keyPairPassword().inputFocus === 'function') {
                this.keyPair().keyPairPassword().inputFocus(true);
            }
        }
        listingConnectStage(err, stage) {
            if (stage > -1) {
                this.showIconBar(true);
                this.connectToCoNET(true);
                this.showKeyPair(false);
                if (stage === 4) {
                    this.connectToCoNET(false);
                    this.connectedCoNET(true);
                    if (this.showCoGate()) {
                        this.homeClick();
                    }
                }
            }
        }
        initConfig(config) {
            const self = this;
            this.showKeyPair(true);
            if (config.keypair && config.keypair.publicKeyID) {
                /**
                 *
                 *      Key pair ready
                 *
                 */
                makeKeyPairData(this, config.keypair);
                if (!config.keypair.passwordOK) {
                    config.keypair.showLoginPasswordField(true);
                }
            }
            else {
                /**
                 *
                 *      No key pair
                 *
                 */
                this.clearImapData();
                config.keypair = null;
                let _keyPairGenerateForm = new keyPairGenerateForm(function (_keyPair) {
                    /**
                     *      key pair ready
                     */
                    makeKeyPairData(self, _keyPair);
                    _keyPair.passwordOK = true;
                    let keyPairPassword = _keyPair.keyPairPassword();
                    _keyPair.keyPairPassword(keyPairPassword = null);
                    config.keypair = _keyPair;
                    self.keyPair(_keyPair);
                    self.showIconBar(true);
                    self.showKeyPair(false);
                    initPopupArea();
                    let uu = null;
                    self.imapSetup(uu = new imapForm(config.account, null, function (imapData) {
                        self.imapSetup(uu = null);
                        return self.imapSetupClassExit(imapData);
                    }));
                    return self.keyPairGenerateForm(_keyPairGenerateForm = null);
                });
                this.keyPairGenerateForm(_keyPairGenerateForm);
            }
            this.localServerConfig(config);
            this.afterInitConfig();
        }
        clearImapData() {
            let imap = this.imapSetup();
            this.imapSetup(imap = null);
        }
        socketListen() {
            let self = this;
            socketIo.once('reconnect_failed', function (err) {
                if (self.CoNETLocalServerError()) {
                    return;
                }
                return self.systemError();
            });
            socketIo.on('reconnect_attempt', function () {
                //return self.systemError()
            });
            socketIo.once('CoNET_systemError', function () {
                return self.systemError();
            });
            socketIo.on('init', function (err, config) {
                $.getJSON(url)
                    .done(function (json) {
                    if (!json) {
                        return;
                    }
                    const localVersion = 'v' + config.version;
                    if (json.tag_name <= localVersion) {
                        return;
                    }
                    self.newVersion(json.tag_name);
                });
                return self.initConfig(config);
            });
            socketIo.on('CoNET_offline', function () {
                self.modalContent(infoDefine[self.languageIndex()].emailConform.formatError[5]);
                $('#CoNETError').modal('setting', 'closable', false).modal('show');
                return self.CoNETLocalServerError(true);
            });
            socketIo.on('disconnectClick', function (region) {
                self.CoGateRegionStoped(true);
            });
            socketIo.emit11('init');
        }
        //          change language
        selectItem(that, site) {
            const tindex = lang[this.tLang()];
            let index = tindex + 1;
            if (index > 3) {
                index = 0;
            }
            this.languageIndex(index);
            this.tLang(lang[index]);
            $.cookie('langEH', this.tLang(), { expires: 180, path: '/' });
            const obj = $("span[ve-data-bind]");
            obj.each(function (index, element) {
                const ele = $(element);
                const data = ele.attr('ve-data-bind');
                if (data && data.length) {
                    ele.text(eval(data));
                }
            });
            $('.languageText').shape(`flip ${this.LocalLanguage}`);
            $('.KnockoutAnimation').transition('jiggle');
            return initPopupArea();
        }
        //          start click
        openClick() {
            this.sectionWelcome(false);
            if (this.localServerConfig().firstRun) {
                return this.sectionAgreement(true);
            }
            this.sectionLogin(true);
            return initPopupArea();
        }
        agreeClick() {
            socketIo.emit11('agreeClick');
            this.sectionAgreement(false);
            this.localServerConfig().firstRun = false;
            return this.openClick();
        }
        CoGateClick() {
            this.showKeyPair(false);
            if (this.CoGate()) {
                let uu = this.CoGateClass();
                if (uu.doingCommand || uu.CoGateRegion()) {
                    return;
                }
                this.CoGate(false);
                return this.CoGateClass(uu = null);
            }
            this.CoGateClass(new CoGateClass(conetImapAccount.test(this.imapData.imapUserName)));
            this.CoGate(true);
        }
        refresh() {
            if (typeof require === 'undefined') {
                this.modalContent(infoDefine[this.languageIndex()].emailConform.formatError[11]);
                return this.hacked(true);
            }
            const { remote } = require('electron');
            return remote.app.quit();
        }
        showKeyInfoClick() {
            this.showKeyPair(true);
            this.CoGate(false);
            this.AppList(false);
            let uu = this.CoGateClass();
            return this.CoGateClass(uu = null);
        }
        imapSetupClassExit(_imapData) {
            const self = this;
            let uu = null;
            this.imapData = _imapData;
            return this.CoNETConnect(uu = new CoNETConnect(_imapData.imapUserName, this.keyPair().verified, _imapData.confirmRisk, this.keyPair().email, function ConnectReady(err, showCoGate) {
                if (err) {
                    self.CoNETConnect(uu = null);
                    return self.imapSetup(uu = new imapForm(_imapData.account, null, function (imapData) {
                        self.imapSetup(uu = null);
                        return self.imapSetupClassExit(imapData);
                    }));
                }
                this.connectedCoNET(true);
                //self.showCoGate ( showCoGate )
                if (showCoGate) {
                    self.showCoGate(true);
                    return self.homeClick();
                }
                self.AppList(true);
                $('.dimmable').dimmer({ on: 'hover' });
                $('.comeSoon').popup({
                    on: 'focus',
                    movePopup: false,
                    position: 'top left',
                    inline: true
                });
            }));
        }
        reFreshLocalServer() {
            location.reload();
        }
        homeClick() {
            this.AppList(true);
            this.CoGate(false);
            this.showKeyPair(false);
            $('.dimmable').dimmer({ on: 'hover' });
            $('.comeSoon').popup({
                on: 'focus',
                movePopup: false,
                position: 'top left',
                inline: true
            });
        }
    }
    view_layout.view = view;
})(view_layout || (view_layout = {}));
const _view = new view_layout.view();
ko.applyBindings(_view, document.getElementById('body'));
$(`.${_view.tLang()}`).addClass('active');
