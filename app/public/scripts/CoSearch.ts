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

module coSearch_layout {
	export class coSearch {
        private socketIo = io ( '/CoSearch', { reconnectionAttempts: 5, timeout: 500, autoConnect: true })
		public tLang = ko.observable ( initLanguageCookie ())
		public languageIndex = ko.observable ( lang [ this.tLang() ])
		public LocalLanguage = 'up'
        public show_mainContect = ko.observable ( false )
        public inputFocus = ko.observable ( false )
        public showSearchButton = ko.observable ( false )
        public password = ko.observable ('')
        public passwordError = ko.observable ( false )
        public passwordInputFocus = ko.observable ( true )
        public searching = ko.observable ( false )
        public showSearchError = ko.observable ( false )
        public searchInputTextActionShow = ko.observable ( false )
        public searchItem = ko.observable ( null )
        public searchItemList = ko.observableArray ([])

        public backGroundBlue = ko.observable ( false )
        public hasFocus = ko.observable ( false )
        public SearchInputNextHasFocus = ko.observable ( false )
        public searchInputText = ko.observable ('')
        public moreResultsButtomLoading = ko.observable ( false )
        public connectInformationMessage = ko.observable ( new connectInformationMessage())
        public showInputLoading = ko.observable ( false )
        private SearchNextPageLink = null
        public showMain = ko.observable ( true )
        public showWebPage = ko.observable ( null )
        public htmlIframe = ko.observable ( false )
        public showSubViewToolBar = ko.observable ( false )
        public safeView = ko.observable ( true )
        
        
        private returnSearchItems ( items ) {
            this.searchItem ( items.param )
            this.SearchNextPageLink = items.param.nextPage
            items.param.Result.forEach ( n => {
                n['showLoading'] = ko.observable ( false )
                n['snapshotReady'] = ko.observable ( false )
            })
            this.searchItemList.push ( ...items.param.Result )

            $('.selection.dropdown').dropdown()
        }

 		constructor () {
            const self = this
            /**
             * 
             */
            this.socketIo.emit11 = function ( eventName: string, ...args ) {
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
                        self.socketIo.once ( eventName, function ( ...args ) {
                            return CallBack ( ...args )
                        })
                    }
                    
                }
                args.length
                ? self.socketIo.emit ( eventName, ...args, _CallBack ) 
                : self.socketIo.emit ( eventName, _CallBack )
            }

            
            /**
             * 
             * 
             */
            this.password.subscribe ( function ( _text: string ) {
                self.passwordError ( false )
            })

            /**
             * 
             * 
             */

            this.hasFocus.subscribe ( function ( _result: boolean ) {
                const self = coSearch_view
                if ( self.showMain () ) {
                    if ( !self.searchInputText().length ) {
                        self.searchInputTextActionShow ( false )
                        return self.backGroundBlue ( _result )
                    }
                    self.searchInputTextActionShow ( true )
                    _result = false
                    return true
                }
                if ( !_result ) {
                    return true
                }
                if ( _result ) {
                    if ( !self.showSubViewToolBar ()) {
                        self.showSubViewToolBar ( true )
                    }
                }
                return true
                
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
            const search_text = this.searchInputText ()
            this.showInputLoading ( true )
            const width = window.innerWidth
            const height = window.outerHeight * 3

            
            const snapshot = {
                height: height,
                url: search_text,
                localUrl: '/tempfile/temp/d36bd96f-eb9c-4791-806c-09aad9fa3974.html',
                png:'/tempfile/temp/d36bd96f-eb9c-4791-806c-09aad9fa3974.png'

            }
            /*
            self.showInputLoading ( false )
            self.showMain ( false )
            self.hasFocus ( false )
            return self.showWebPage ( snapshot )
            /** */
            
            
            return this.socketIo.emit11 ( 'search', search_text, width, height, function ( err, data, snapshot ) {
                self.showInputLoading ( false )
                //  error
                if ( err ) {
                    return self.showSearchError ( true )
                }
                if ( data ) {
                    return self.returnSearchItems ( data )
                }
                self.showMain ( false )
                return self.showWebPage ( snapshot )
            })
            /** */
            
        }

        public snapshotClick ( n ) {
            const currentItem = this.searchItemList()[n]
            if ( currentItem.showLoading()) {
                return 
            }
            
            //      open snapshot
            if ( currentItem.snapshotReady()) {
                this.showMain ( false )
                return this.showWebPage ( currentItem )
            }
            const self = this
            currentItem.showLoading ( true )

            const url = currentItem.url
            const width = $(window).width()
            const height = $(window).height()
            return this.socketIo.emit11 ( 'getSnapshop', url, width, height , function ( err, data, snapshot ) {
                currentItem.showLoading ( false )
                if ( err ) {
                    return self.showSearchError ( true )
                }
                currentItem.snapshotReady ( true )
                
                currentItem['localUrl']= snapshot.localUrl
                currentItem['png']= snapshot.png
                currentItem['height']= snapshot.height

            })
        }

        public showWebPageClose () {
            this.showMain ( true )
            return this.showWebPage ( null )
        }

        public searchNext () {
            if ( this.moreResultsButtomLoading ()) {
                return
            }
            const self = this
            this.moreResultsButtomLoading ( true )
            const nextLink = this.SearchNextPageLink
            return this.socketIo.emit11 ( 'searchNext', nextLink , function ( err, data ) {
                self.moreResultsButtomLoading ( false )
                //  error
                if ( err ) {
                    return self.showSearchError ( true )
                }
                data.param.Result.forEach ( n => {
                    n['showLoading'] = ko.observable ( false )
                    n['snapshotReady'] = ko.observable ( false )
                })
                self.searchItemList.push ( ...data.param.Result )
                self.SearchNextPageLink = data.param.nextPage
                
                return 
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