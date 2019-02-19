socketIo.emit11 = function ( eventName: string, ...args ) {
    
    let CallBack = args.pop ()
    if ( typeof CallBack !== 'function') {
        CallBack ? args.push ( CallBack ) : null
        CallBack = null
    }

    const localTimeOut = setTimeout ( function () {
        //_view.refresh ()
        //twitter_view.systemError()
    }, 10000 )

    const _CallBack = function ( err ) {
        clearTimeout ( localTimeOut )
        
        if ( CallBack ) {
            socketIo.once ( eventName, function ( ...args ) {
                return CallBack ( ...args )
            })
        }
        
    }
    args.length
    ? socketIo.emit ( eventName, ...args, _CallBack ) 
    : socketIo.emit ( eventName, _CallBack )
}
module coSearch_layout {
	export class coSearch {
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
        public searchInputTextActionShow = ko.observable ( false )


        public backGroundBlue = ko.observable ( false )
        public hasFocus = ko.observable ( false )
        public searchInputText = ko.observable ('')

		constructor () {
            const self = this
            this.search_form_input.subscribe ( function ( _text: string ) {
                self.showSearchError ( false )
                if ( !_text.length ) {
                    return self.showSearchButton ( false )
                }
                return self.showSearchButton ( true )
            })
            this.password.subscribe ( function ( _text: string ) {
                self.passwordError ( false )
            })
            this.hasFocus.subscribe ( function ( _result: boolean ) {
                if ( !self.searchInputText().length ) {
                    self.searchInputTextActionShow ( false )
                    return self.backGroundBlue ( _result )
                }
                self.searchInputTextActionShow ( true )
                _result = false
            })
            this.searchInputText.subscribe ( function (_text: string ){
                
                self.searchInputTextActionShow ( _text.length > 0 )
                

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

        public clearSearchText () {
            this.searchInputText('')
            this.backGroundBlue ( false )
        }
	}
}



const coSearch_view = new coSearch_layout.coSearch ()
ko.applyBindings ( coSearch_view , document.getElementById ( 'body' ))
$( '.' + coSearch_view.tLang() ).addClass( 'active' )