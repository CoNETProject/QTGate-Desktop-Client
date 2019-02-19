socketIo.emit11 = function (eventName, ...args) {
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
            socketIo.once(eventName, function (...args) {
                return CallBack(...args);
            });
        }
    };
    args.length
        ? socketIo.emit(eventName, ...args, _CallBack)
        : socketIo.emit(eventName, _CallBack);
};
var coSearch_layout;
(function (coSearch_layout) {
    class coSearch {
        constructor() {
            this.tLang = ko.observable(initLanguageCookie());
            this.languageIndex = ko.observable(lang[this.tLang()]);
            this.LocalLanguage = 'up';
            this.show_mainContect = ko.observable(false);
            this.inputFocus = ko.observable(false);
            this.search_form_input = ko.observable('');
            this.showSearchButton = ko.observable(false);
            this.password = ko.observable('');
            this.passwordError = ko.observable(false);
            this.passwordInputFocus = ko.observable(true);
            this.searching = ko.observable(false);
            this.showSearchError = ko.observable(false);
            this.searchInputTextActionShow = ko.observable(false);
            this.backGroundBlue = ko.observable(false);
            this.hasFocus = ko.observable(false);
            this.searchInputText = ko.observable('');
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
            this.search_form_input.subscribe(function (_text) {
                self.showSearchError(false);
                if (!_text.length) {
                    return self.showSearchButton(false);
                }
                return self.showSearchButton(true);
            });
            this.password.subscribe(function (_text) {
                self.passwordError(false);
            });
            this.hasFocus.subscribe(function (_result) {
                if (!self.searchInputText().length) {
                    self.searchInputTextActionShow(false);
                    return self.backGroundBlue(_result);
                }
                self.searchInputTextActionShow(true);
                _result = false;
            });
            this.searchInputText.subscribe(function (_text) {
                self.searchInputTextActionShow(_text.length > 0);
            });
        }
        search_form() {
            const self = this;
            const search_text = this.search_form_input();
            return socketIo.emit11('youtube_search', search_text, function (err, data) {
                //  error
                if (typeof err === 'number') {
                    return self.showSearchError(true);
                }
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
