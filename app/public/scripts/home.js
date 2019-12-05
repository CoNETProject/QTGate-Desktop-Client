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
        publicKeyID: null,
        _password: null
    };
    return keyPair;
};
const makeKeyPairData = function (view, keypair) {
    const length = keypair.publicKeyID.length;
    keypair.publicKeyID = keypair.publicKeyID.substr(length - 16);
    let keyPairPasswordClass = new keyPairPassword(function (_imapData, passwd, sessionHash) {
        //      password OK
        keypair.keyPairPassword(keyPairPasswordClass = null);
        keypair.passwordOK = true;
        keypair._password = passwd;
        keypair.showLoginPasswordField(false);
        view.keyPairCalss = new encryptoClass(keypair);
        view.showKeyPair(false);
        if (_imapData && _imapData.imapTestResult) {
            return view.imapSetupClassExit(_imapData, sessionHash);
        }
        let uu = null;
        return view.imapSetup(uu = new imapForm(keypair.email, _imapData, function (imapData) {
            view.imapSetup(uu = null);
            view.imapSetupClassExit(imapData, sessionHash);
        }));
    });
    keypair.keyPairPassword = ko.observable(keyPairPasswordClass);
    keypair.showLoginPasswordField = ko.observable(false);
    keypair.delete_btn_view = ko.observable(true);
    keypair.showConform = ko.observable(false);
    keypair['showDeleteKeyPairNoite'] = ko.observable(false);
    keypair.delete_btn_click = function () {
        keypair.delete_btn_view(false);
        return keypair.showConform(true);
    };
    keypair.deleteKeyPairNext = function () {
        view.connectInformationMessage.sockEmit('deleteKeyPairNext', () => {
            view.showIconBar(false);
            view.connectedCoNET(false);
            view.connectToCoNET(false);
            view.CoNETConnect(view.CoNETConnectClass = null);
            view.imapSetup(view.imapFormClass = null);
            keypair.showDeleteKeyPairNoite(false);
            return keypair.delete_btn_view(false);
        });
    };
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
class showWebPageClass {
    constructor(showUrl, zipBase64Stream, zipBase64StreamUuid, exit) {
        this.showUrl = showUrl;
        this.zipBase64Stream = zipBase64Stream;
        this.zipBase64StreamUuid = zipBase64StreamUuid;
        this.exit = exit;
        this.showLoading = ko.observable(true);
        this.htmlIframe = ko.observable(null);
        this.showErrorMessage = ko.observable(false);
        this.showHtmlCodePage = ko.observable(false);
        this.showImgPage = ko.observable(true);
        this.png = ko.observable('');
        const self = this;
        _view.showIconBar(false);
        _view.keyPairCalss.decryptMessageToZipStream(zipBase64Stream, (err, data) => {
            if (err) {
                return self.showErrorMessageProcess();
            }
            showHTMLComplete(zipBase64StreamUuid, data, (err, data) => {
                if (err) {
                    return self.showErrorMessageProcess();
                }
                _view.bodyBlue(false);
                const getData = (filename, _data) => {
                    const regex = new RegExp(`${filename}`, 'g');
                    const index = html.indexOf(`${filename}`);
                    if (index > -1) {
                        if (/js$/.test(filename)) {
                            _data = _data.replace(/^data:text\/plain;/, 'data:application/javascript;');
                        }
                        else if (/css$/.test(filename)) {
                            _data = _data.replace(/^data:text\/plain;/, 'data:text/css;');
                        }
                        else if (/html$|htm$/.test(filename)) {
                            _data = _data.replace(/^data:text\/plain;/, 'data:text/html;');
                        }
                        else if (/pdf$/.test(filename)) {
                            _data = _data.replace(/^data:text\/plain;/, 'data:text/html;');
                        }
                        else {
                            const kkk = _data;
                        }
                        html = html.replace(regex, _data);
                    }
                };
                let html = data.html;
                data.folder.forEach(n => {
                    getData(n.filename, n.data);
                });
                self.png(data.img);
                const htmlBolb = new Blob([html], { type: 'text/html' });
                const _url = window.URL.createObjectURL(htmlBolb);
                const fileReader = new FileReader();
                fileReader.onloadend = evt => {
                    return window.URL.revokeObjectURL(_url);
                };
                self.showLoading(false);
                self.htmlIframe(_url);
            });
        });
    }
    showErrorMessageProcess() {
        this.showLoading(false);
        this.showErrorMessage(true);
    }
    close() {
        this.showImgPage(false);
        this.showHtmlCodePage(false);
        this.png(null);
        this.exit();
    }
    imgClick() {
        this.showHtmlCodePage(false);
        this.showImgPage(true);
    }
    htmlClick() {
        this.showHtmlCodePage(true);
        this.showImgPage(false);
    }
}
var view_layout;
(function (view_layout) {
    class view {
        constructor() {
            this.connectInformationMessage = new connectInformationMessage('/');
            this.sectionLogin = ko.observable(false);
            this.sectionAgreement = ko.observable(false);
            this.sectionWelcome = ko.observable(true);
            this.isFreeUser = ko.observable(true);
            this.QTTransferData = ko.observable(false);
            this.LocalLanguage = 'up';
            this.menu = Menu;
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
            this.CoNETConnectClass = null;
            this.imapFormClass = null;
            this.CoNETConnect = ko.observable(null);
            this.bodyBlue = ko.observable(true);
            this.CanadaBackground = ko.observable(false);
            this.keyPairCalss = null;
            this.appsManager = ko.observable(null);
            this.AppList = ko.observable(false);
            this.imapData = null;
            this.newVersion = ko.observable(null);
            this.sessionHash = '';
            this.showLanguageSelect = ko.observable(true);
            this.socketListen();
            this.CanadaBackground.subscribe(val => {
                if (val) {
                    $.ajax({
                        url: '/scripts/CanadaSvg.js'
                    }).done(data => {
                        eval(data);
                    });
                }
            });
        }
        afterInitConfig() {
            this.keyPair(this.localServerConfig().keypair);
            if (this.keyPair() && this.keyPair().keyPairPassword() && typeof this.keyPair().keyPairPassword().inputFocus === 'function') {
                this.keyPair().keyPairPassword().inputFocus(true);
                this.sectionLogin(false);
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
                this.svgDemo_showLanguage();
                this.clearImapData();
                config.keypair = null;
                let _keyPairGenerateForm = new keyPairGenerateForm(function (_keyPair, sessionHash) {
                    /**
                     *      key pair ready
                     */
                    makeKeyPairData(self, _keyPair);
                    _keyPair.passwordOK = true;
                    let keyPairPassword = _keyPair.keyPairPassword();
                    _keyPair.keyPairPassword(keyPairPassword = null);
                    config.keypair = _keyPair;
                    self.keyPair(_keyPair);
                    self.showKeyPair(false);
                    initPopupArea();
                    let uu = null;
                    self.keyPairCalss = new encryptoClass(self.keyPair());
                    self.imapSetup(uu = new imapForm(config.account, null, function (imapData) {
                        self.imapSetup(uu = null);
                        return self.imapSetupClassExit(imapData, sessionHash);
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
            this.connectInformationMessage.sockEmit('init', (err, config) => {
                if (err) {
                    return;
                }
                return self.initConfig(config);
            });
            this.connectInformationMessage.socketIo.on('init', (err, config) => {
                if (err) {
                    return;
                }
                return self.initConfig(config);
            });
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
            clearTimeout(this.demoTimeout);
            if (this.demoMainElm && typeof this.demoMainElm.remove === 'function') {
                this.demoMainElm.remove();
                this.demoMainElm = null;
            }
            if (!this.connectInformationMessage.socketIoOnline) {
                return this.connectInformationMessage.showSystemError();
            }
            this.sectionWelcome(false);
            /*
            if ( this.localServerConfig().firstRun ) {
                return this.sectionAgreement ( true )
            }
            */
            this.sectionLogin(true);
            return initPopupArea();
        }
        deletedKeypairResetView() {
            this.imapSetup(null);
        }
        agreeClick() {
            this.connectInformationMessage.sockEmit('agreeClick');
            this.sectionAgreement(false);
            this.localServerConfig().firstRun = false;
            return this.openClick();
        }
        refresh() {
            if (typeof require === 'undefined') {
                this.modalContent(infoDefine[this.languageIndex()].emailConform.formatError[11]);
                return this.hacked(true);
            }
            const { remote } = require('electron');
            if (remote && remote.app && typeof remote.app.quit === 'function') {
                return remote.app.quit();
            }
        }
        showKeyInfoClick() {
            this.sectionLogin(true);
            this.showKeyPair(true);
            this.AppList(false);
            this.appsManager(null);
        }
        imapSetupClassExit(_imapData, sessionHash) {
            const self = this;
            this.imapData = _imapData;
            this.sessionHash = sessionHash;
            return this.CoNETConnect(this.CoNETConnectClass = new CoNETConnect(_imapData.imapUserName, this.keyPair().verified, _imapData.confirmRisk, this.keyPair().email, function ConnectReady(err) {
                if (typeof err === 'number' && err > -1) {
                    self.CoNETConnect(this.CoNETConnectClass = null);
                    return self.imapSetup(this.imapFormClass = new imapForm(_imapData.account, null, function (imapData) {
                        self.imapSetup(this.imapFormClass = null);
                        return self.imapSetupClassExit(imapData, sessionHash);
                    }));
                }
                self.connectedCoNET(true);
                self.homeClick();
            }));
        }
        reFreshLocalServer() {
            location.reload();
        }
        homeClick() {
            this.AppList(true);
            this.sectionLogin(false);
            const connectMainMenu = () => {
                let am = null;
                this.appsManager(am = new appsManager(() => {
                    am = null;
                    return connectMainMenu();
                }));
            };
            connectMainMenu();
            this.showKeyPair(false);
            $('.dimmable').dimmer({ on: 'hover' });
            $('.comeSoon').popup({
                on: 'focus',
                movePopup: false,
                position: 'top left',
                inline: true
            });
            _view.connectInformationMessage.socketIo.removeEventListener('tryConnectCoNETStage', this.CoNETConnectClass.listenFun);
        }
        /**
         *
         * 		T/t = Translate (t is relative, T is absolute) R/r = rotate(r is relative, R is absolute) S/s = scale(s is relative, S is absolute)
         */
        svgDemo_showLanguage() {
            if (!this.sectionWelcome()) {
                return;
            }
            let i = 0;
            const changeLanguage = () => {
                if (++i === 1) {
                    backGround_mask_circle.attr({
                        stroke: "#FF000090",
                    });
                    return setTimeout(() => {
                        changeLanguage();
                    }, 1000);
                }
                if (i > 5 || !this.sectionWelcome()) {
                    main.remove();
                    return this.demoMainElm = main = null;
                }
                this.selectItem();
                this.demoTimeout = setTimeout(() => {
                    changeLanguage();
                }, 2000);
            };
            const width = window.innerWidth;
            const height = window.outerHeight;
            let main = this.demoMainElm = Snap(width, height);
            const backGround_mask_circle = main.circle(width / 2, height / 2, width / 1.7).attr({
                fill: '#00000000',
                stroke: "#FF000020",
                strokeWidth: 5,
            });
            const wT = width / 2 - 35;
            const wY = 30 - height / 2;
            backGround_mask_circle.animate({
                transform: `t${wT} ${wY}`,
                r: 60
            }, 3000, mina.easeout, changeLanguage);
        }
    }
    view_layout.view = view;
})(view_layout || (view_layout = {}));
const _view = new view_layout.view();
ko.applyBindings(_view, document.getElementById('body'));
$(`.${_view.tLang()}`).addClass('active');
