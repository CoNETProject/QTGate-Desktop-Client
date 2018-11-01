module youtube_layout {
	export class youtube {
		public tLang = ko.observable ( initLanguageCookie ())
		public languageIndex = ko.observable ( lang [ this.tLang() ])
		public LocalLanguage = 'up'
        public show_mainContect = ko.observable ( false )
        public inputFocus = ko.observable ( false )
        public search_form_input = ko.observable ('')
        public showSearchButton = ko.observable ( false )
        public password = ko.observable ('')
        public passwordError = ko.observable ( false )
        public passwordInputFocus = ko.observable ( true )
        public searching = ko.observable ( false )
        public showSearchError = ko.observable ( false )
		constructor () {
            const self = this
            this.search_form_input.subscribe ( function ( _text: string ) {
                if ( !_text.length ) {
                    return self.showSearchButton ( false )
                }
                return self.showSearchButton ( true )
            })
            this.password.subscribe ( function ( _text: string ) {
                self.passwordError ( false )
            })
		}
		public selectItem = function ( that: any, site: () => number ) {

            const tindex = parseInt ( lang [ this.tLang ()] )
            let index =  tindex + 1
            if ( index > 3 ) {
                index = 0
            }

            this.languageIndex ( index )
            this.tLang( lang [ index ])
            $.cookie ( 'langEH', this.tLang(), { expires: 180, path: '/' })
            const obj = $( "span[ve-data-bind]" )
            
            obj.each ( function ( index, element ) {
                
                const ele = $( element )
                const data = ele.attr ( 've-data-bind' )
                if ( data && data.length ) {
                    ele.text ( eval ( data ))
                }
            })
            
            $('.languageText').shape ( 'flip ' + this.LocalLanguage )
            return $('.KnockoutAnimation').transition('jiggle')
        }
        public search_form () {
            const self = this
            const search_text = this.search_form_input()

            return socketIo.emit11 ( 'youtube_search', search_text , function ( err, data ) {
                //  error
                if ( typeof err === 'number') {
                    return self.showSearchError ( true )
                }
            })
        }

        public login () {
            const password = this.password ()
            const self = this
            if ( !password.length || password.length < 5 ) {
                return this.passwordError ( true )
            }
            this.searching ( true )
            return socketIo.emit11 ( 'password_youtube', password, function ( err, data ) {
                self.searching ( false )
                if ( err ) {
                    return self.passwordError ( true )
                }
                self.show_mainContect ( true )
                self.inputFocus ( true )
            })
        }
	}
}
const youtube_view = new youtube_layout.youtube ()
ko.applyBindings ( youtube_view , document.getElementById ( 'body' ))
const youtube_uu = '.' + youtube_view.tLang()
$( youtube_uu ).addClass( 'active' )