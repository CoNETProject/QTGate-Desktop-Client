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
var coSearch_layout;
(function (coSearch_layout) {
    class coSearch {
        constructor() {
            this.socketIo = io('/CoSearch', { reconnectionAttempts: 5, timeout: 500, autoConnect: true });
            this.tLang = ko.observable(initLanguageCookie());
            this.languageIndex = ko.observable(lang[this.tLang()]);
            this.LocalLanguage = 'up';
            this.show_mainContect = ko.observable(false);
            this.inputFocus = ko.observable(false);
            this.showSearchButton = ko.observable(false);
            this.password = ko.observable('');
            this.passwordError = ko.observable(false);
            this.passwordInputFocus = ko.observable(true);
            this.searching = ko.observable(false);
            this.showSearchError = ko.observable(false);
            this.searchInputTextActionShow = ko.observable(false);
            this.searchItem = ko.observable(null);
            this.searchItemList = ko.observableArray([]);
            this.backGroundBlue = ko.observable(false);
            this.hasFocus = ko.observable(false);
            this.SearchInputNextHasFocus = ko.observable(false);
            this.searchInputText = ko.observable('');
            this.moreResultsButtomLoading = ko.observable(false);
            this.connectInformationMessage = ko.observable(new connectInformationMessage());
            this.showInputLoading = ko.observable(false);
            this.SearchNextPageLink = null;
            this.showMain = ko.observable(true);
            this.showWebPage = ko.observable(null);
            this.htmlIframe = ko.observable(false);
            this.showSubViewToolBar = ko.observable(false);
            this.safeView = ko.observable(true);
            this.selectItem = function (that, site) {
                const tindex = parseInt(lang[this.tLang()]);
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
                $('.languageText').shape('flip ' + this.LocalLanguage);
                return $('.KnockoutAnimation').transition('jiggle');
            };
            const self = this;
            /**
             *
             */
            this.socketIo.emit11 = function (eventName, ...args) {
                let CallBack = args.pop();
                if (typeof CallBack !== 'function') {
                    CallBack ? args.push(CallBack) : null;
                    CallBack = null;
                }
                const localTimeOut = setTimeout(function () {
                    //_view.refresh ()
                    //twitter_view.systemError()
                }, 10000);
                const _CallBack = function (err) {
                    clearTimeout(localTimeOut);
                    if (CallBack) {
                        self.socketIo.once(eventName, function (...args) {
                            return CallBack(...args);
                        });
                    }
                };
                args.length
                    ? self.socketIo.emit(eventName, ...args, _CallBack)
                    : self.socketIo.emit(eventName, _CallBack);
            };
            /**
             *
             *
             */
            this.password.subscribe(function (_text) {
                self.passwordError(false);
            });
            /**
             *
             *
             */
            this.hasFocus.subscribe(function (_result) {
                const self = coSearch_view;
                if (self.showMain()) {
                    if (!self.searchInputText().length) {
                        self.searchInputTextActionShow(false);
                        return self.backGroundBlue(_result);
                    }
                    self.searchInputTextActionShow(true);
                    _result = false;
                    return true;
                }
                if (!_result) {
                    return true;
                }
                if (_result) {
                    if (!self.showSubViewToolBar()) {
                        self.showSubViewToolBar(true);
                    }
                }
                return true;
            });
            this.searchInputText.subscribe(function (_text) {
                self.searchInputTextActionShow(_text.length > 0);
            });
        }
        returnSearchItems(items) {
            this.searchItem(items.param);
            this.SearchNextPageLink = items.param.nextPage;
            items.param.Result.forEach(n => {
                n['showLoading'] = ko.observable(false);
                n['snapshotReady'] = ko.observable(false);
            });
            this.searchItemList.push(...items.param.Result);
            $('.selection.dropdown').dropdown();
        }
        search_form() {
            const self = this;
            const search_text = this.searchInputText();
            this.showInputLoading(true);
            const width = window.innerWidth;
            const height = window.outerHeight * 3;
            const snapshot = {
                height: height,
                url: search_text,
                localUrl: '/tempfile/temp/d36bd96f-eb9c-4791-806c-09aad9fa3974.html',
                png: '/tempfile/temp/d36bd96f-eb9c-4791-806c-09aad9fa3974.png'
            };
            /*
            self.showInputLoading ( false )
            self.showMain ( false )
            self.hasFocus ( false )
            return self.showWebPage ( snapshot )
            /** */
            return this.socketIo.emit11('search', search_text, width, height, function (err, data, snapshot) {
                self.showInputLoading(false);
                //  error
                if (err) {
                    return self.showSearchError(true);
                }
                if (data) {
                    return self.returnSearchItems(data);
                }
                self.showMain(false);
                return self.showWebPage(snapshot);
            });
            /** */
        }
        snapshotClick(n) {
            const currentItem = this.searchItemList()[n];
            if (currentItem.showLoading()) {
                return;
            }
            //      open snapshot
            if (currentItem.snapshotReady()) {
                this.showMain(false);
                return this.showWebPage(currentItem);
            }
            const self = this;
            currentItem.showLoading(true);
            const url = currentItem.url;
            const width = $(window).width();
            const height = $(window).height();
            return this.socketIo.emit11('getSnapshop', url, width, height, function (err, data, snapshot) {
                currentItem.showLoading(false);
                if (err) {
                    return self.showSearchError(true);
                }
                currentItem.snapshotReady(true);
                currentItem['localUrl'] = snapshot.localUrl;
                currentItem['png'] = snapshot.png;
                currentItem['height'] = snapshot.height;
            });
        }
        showWebPageClose() {
            this.showMain(true);
            return this.showWebPage(null);
        }
        searchNext() {
            if (this.moreResultsButtomLoading()) {
                return;
            }
            const self = this;
            this.moreResultsButtomLoading(true);
            const nextLink = this.SearchNextPageLink;
            return this.socketIo.emit11('searchNext', nextLink, function (err, data) {
                self.moreResultsButtomLoading(false);
                //  error
                if (err) {
                    return self.showSearchError(true);
                }
                data.param.Result.forEach(n => {
                    n['showLoading'] = ko.observable(false);
                    n['snapshotReady'] = ko.observable(false);
                });
                self.searchItemList.push(...data.param.Result);
                self.SearchNextPageLink = data.param.nextPage;
                return;
            });
        }
        clearSearchText() {
            this.searchInputText('');
            this.backGroundBlue(false);
        }
    }
    coSearch_layout.coSearch = coSearch;
})(coSearch_layout || (coSearch_layout = {}));
const coSearch_view = new coSearch_layout.coSearch();
ko.applyBindings(coSearch_view, document.getElementById('body'));
$('.' + coSearch_view.tLang()).addClass('active');
