var youtube_layout;
(function (youtube_layout) {
    class youtube {
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
                if (!_text.length) {
                    return self.showSearchButton(false);
                }
                return self.showSearchButton(true);
            });
            this.password.subscribe(function (_text) {
                self.passwordError(false);
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
        login() {
            const password = this.password();
            const self = this;
            if (!password.length || password.length < 5) {
                return this.passwordError(true);
            }
            this.searching(true);
            return socketIo.emit11('password_youtube', password, function (err, data) {
                self.searching(false);
                if (err) {
                    return self.passwordError(true);
                }
                self.show_mainContect(true);
                self.inputFocus(true);
            });
        }
    }
    youtube_layout.youtube = youtube;
})(youtube_layout || (youtube_layout = {}));
const youtube_view = new youtube_layout.youtube();
ko.applyBindings(youtube_view, document.getElementById('body'));
const youtube_uu = '.' + youtube_view.tLang();
$(youtube_uu).addClass('active');
