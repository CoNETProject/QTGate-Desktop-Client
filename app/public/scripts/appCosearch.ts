


let appScript = {
	info: {
		totalResults: ['大约有','約','About','大約有'],
		totalResults1: ['条记录','件','results','條記錄'],
		moreResults: ['更多结果','結果をさらに表示','More Results','更多結果'],
		searchToolBarMenu: [
			[
				'网站','ウェイブ','Website','網頁'
			],[
				'新闻','ニュース','News','新聞'
			],[
				'图片','画像','Picture','圖片'
			],[
				'视频','ビデオ','Video','視頻'
			]
		]
	},

	showMain: ko.observable ( true ),
	showWebPage: ko.observable ( null ), 
	htmlIframe: ko.observable ( false ),
	showSnapshop: ko.observable ( false ),
	searchItemsArray: ko.observable (),
	hasFocusShowTool: ko.observable ( false ),
	backGroundBlue: ko.observable ( false ),
	searchItem: ko.observable ( null ),
	showMainSearchForm: ko.observable ( true ),
	showSearchSetupForm: ko.observable ( false ),
	showSearchError: ko.observable ( false ),
	showInputLoading: ko.observable ( false ),
	errorMessageIndex: ko.observable ( -1 ),
	searchInputText: ko.observable (''),
	hasFocus: ko.observable ( false ),
	passwordError: ko.observable ( false ),
	searchSetupIcon: ko.observable ( bingIcon ),
	password: ko.observable (''),
	searchInputTextActionShow: ko.observable ( false ),
	SearchInputNextHasFocus: ko.observable ( false ),
	showSearchesRelated: ko.observable ( false ),
	searchItemList: ko.observableArray ([]),
	loadingGetResponse: ko.observable ( false ),
	conetResponse: ko.observable ( false ),
	searchInputTextShow: ko.observable (''),
	currentlyShowItems: ko.observable ( 0 ),
	newsButtonShowLoading: ko.observable ( false ),

	newsItemsArray: ko.observable (),
	newsButtonShowError: ko.observable ( false ),
	newsButtonErrorIndex: ko.observable ( null ),
	newsLoadingGetResponse: ko.observable ( false ),
	newsConetResponse: ko.observable ( false ), 

	nextButtonShowError: ko.observable ( false ),
	moreResultsButtomLoading: ko.observable ( false ),

	imageButtonShowLoading: ko.observable ( false ),
	imageButtonShowError: ko.observable ( false ),
	imageButtonErrorIndex: ko.observable ( -1 ),
	imageLoadingGetResponse: ko.observable ( false ),
	imageConetResponse: ko.observable ( false ),
	imageItemsArray: ko.observable (),
	searchSimilarImagesList: ko.observableArray ([]),
	showSearchSimilarImagesResult: ko.observable ( false ),
	imageSearchItemArray: ko.observable (),

	videoButtonShowLoading: ko.observable ( false ),
	videoItemsArray: ko.observable (),
	videoButtonShowError: ko.observable ( false ),
	videoButtonErrorIndex: ko.observable ( -1 ),
	videoLoadingGetResponse: ko.observable ( false ),
	videoConetResponse: ko.observable ( false ),

	nextButtonErrorIndex: ko.observable ( false ),
	nextButtonConetResponse: ko.observable ( false ),
	nextButtonLoadingGetResponse: ko.observable ( false ),


	//	['originImage']

	initSearchData: ( self ) => {
		self.searchItem ( null )
		self.searchItemList ([])
		self.showInputLoading ( true )
		self.showSearchesRelated ( false )
		self.newsItemsArray ( null )
		self.imageItemsArray ( null )
		self.showSearchesRelated ( null )
		self.videoItemsArray ( null )
		self.imageSearchItemArray ( null )
		
	},

	showResultItems: ( self, items ) => {
		self.searchItem ( items )
		self.searchItemList ( items.Result )
		$('.selection.dropdown').dropdown()
	},

	searchSetupClick: ( self, event ) => {
		self.showSearchSetupForm ( true )
		self.backGroundBlue ( true )
		
		/*
		$('#coSearchBackGround').one ( 'click', function() {
			self.backGroundClick ()
			$('#coSearchForm').off ('click')
		})
		$('#coSearchForm').one ( 'click', function() {
			self.backGroundClick ()
			$('#coSearchBackGround').off ('click')
		})
		*/
		return false
	},

	searchInputCloseError: ( self, event ) => {
		self.showSearchError ( false )
		self.errorMessageIndex (null)
		
	},

	returnSearchResultItemsInit: ( items ) => {
			
		items.Result.forEach ( n => {
			n['showLoading'] = ko.observable ( false )
			n['conetResponse'] = ko.observable ( false )
			n['loadingGetResponse'] = ko.observable ( false )
			n['snapshotReady'] = ko.observable ( false )
			n['snapshotClass'] = null
			n['snapshotData'] = null
			n['snapshotUuid'] = null
			n['id'] = uuid_generate ()
			n['showError'] = ko.observable ( false )
			n['errorIndex'] = ko.observable ( -1 )
			if ( !n['newsBrand'] ) {
				n['newsBrand'] = null
			}
			if ( n.imageInfo ) {
				if ( !n.imageInfo['videoTime'] ) {
					n.imageInfo['videoTime'] = null
				}
			}
			if ( n.clickUrl ) {
				const url = new URLSearchParams ( n.clickUrl )
				n['webUrlHref'] = url.get ( 'imgrefurl' )
				n['imgUrlHref'] = url.get ( '/imgres?imgurl' )
			}
			
			n['showImageLoading'] = ko.observable ( false )
			n['showImageError'] = ko.observable ( false )
			n['snapshotImageReady'] = ko.observable ( false )
			n['loadingImageGetResponse'] = ko.observable ( false )
			n['conetImageResponse'] = ko.observable ( false )
			n['imageErrorIndex'] = ko.observable (-1)
		})
		
	},

	search_form: ( self, event ) => {

		if ( self.showInputLoading()) {
			return 
		}
		
		if ( !_view.CanadaBackground ()) {
			_view.CanadaBackground ( true )
		}
		if ( !self.showMainSearchForm()) {
			self.showMainSearchForm( true )
		}
		const search_text = self.searchInputText ()
		
		const width = window.innerWidth
		const height = window.outerHeight
		
		self.initSearchData ( self )

		const com: QTGateAPIRequestCommand = {
			command: 'CoSearch',
			Args: null,
			error: null,
			subCom: null
		}
		/**
		 * 			web page address
		 */

		if ( /^http[s]?:\/\//.test( search_text )) {
			com.Args = [ search_text, width, height ]
			com.subCom = 'getSnapshop'
			
		} else {
			com.Args = [ 'google', search_text ]
			com.subCom = 'webSearch'
		}

		const errorProcess = ( err ) => {
			self.showInputLoading ( false )
			self.searchInputText ( '' )
			self.errorMessageIndex ( _view.connectInformationMessage.getErrorIndex( err ))
			return self.showSearchError ( true )
		}

		/**
		 * 
		 * 		test Unit
		 */

		

		return _view.keyPairCalss.emitRequest ( com, ( err, com: QTGateAPIRequestCommand ) => {
			
			if ( err ) {
				return errorProcess ( err )
			}

			if ( !com ) {
				return self.loadingGetResponse ( true )
			}

			if ( com.error === -1 ) {
				self.loadingGetResponse ( false )
				return self.conetResponse ( true )
			}

			

			if ( com.error ) {
				return errorProcess ( com.error )
			}

			if ( com.subCom === 'webSearch') {
				self.showInputLoading ( false )
				
				const args = com.Args
				self.searchInputTextShow ( search_text )
				
				self.returnSearchResultItemsInit ( args.param )
				self.searchItemsArray ( args.param )
				self.showResultItems ( self, args.param )
				_view.CanadaBackground ( false )
				return self.showMainSearchForm ( false )
			}
			
			const arg: string = com.Args[0]
			const uuid = arg.split(',')[0].split ('.')[0]
			return _view.connectInformationMessage.sockEmit ( 'getFilesFromImap', arg, ( err, buffer: string ) => {
				if ( err ) {
					return errorProcess ( err )
				}
				return _view.keyPairCalss.decryptMessageToZipStream ( buffer, ( err, data ) => {
					if ( err ) {
						return errorProcess ( err )
					}
					self.showInputLoading ( false )
					_view.CanadaBackground ( false )
					self.showMainSearchForm ( false )
					self.showMain ( false )
					self.showSnapshop ( true )
					let y = null
					self.showWebPage ( y = new showWebPageClass ( search_text, buffer, uuid , () => {
						self.showWebPage ( y = null )
						self.showMain ( true )
						self.showSnapshop ( false )
						_view.CanadaBackground ( true )
						self.showMainSearchForm ( true )
					}))
				})
				
			})
			
		})
		

	},

	searchSetup: ( key: string, self, event ) => {
		self.showSearchSetupForm ( false )
		self.backGroundBlue ( false )
		switch ( key ) {
			case 'b': {
				return self.searchSetupIcon ( bingIcon )
			}
			case 'd': {
				return self.searchSetupIcon ( duckduckgoIcon )
			}
			case 'y': {
				return self.searchSetupIcon ( YahooIcon )
			}
			default: {
				self.searchSetupIcon ( googleIcon )
			}
		}
	},

	startup: ( self ) => {
		self.password.subscribe (( _text: string ) => {
			self.passwordError ( false )
		})

		self.hasFocus.subscribe (( _result: boolean ) => {
			
			
			if ( _result ) {
				self.hasFocusShowTool ( true )
				return self.backGroundBlue ( true )
			} 
			
			/*
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
			*/
			
		})
		
		self.searchInputText.subscribe (( _text: string ) => {
			
			self.searchInputTextActionShow ( _text.length > 0 )
			
		})

		self.SearchInputNextHasFocus.subscribe (( hasFocus: boolean ) => {
			if ( hasFocus ) {
				self.showSearchesRelated ( true )
			}
		})
		
		_view.showIconBar ( false )
		_view.CanadaBackground ( true )
	},

	nextButtonErrorClick: ( self ) => {
		
		self.nextButtonShowError ( false )
		self.nextButtonErrorIndex ( null )
	},

	webItemsClick: ( self, event ) => {
		self.currentlyShowItems ( 0 )
		self.showResultItems ( self, self.searchItemsArray ())
	},

	searchNext: ( self, event ) => {
		const nextLink = self.searchItem().nextPage
		if ( self.moreResultsButtomLoading () || !nextLink ) {
			return
		}

		
		self.moreResultsButtomLoading ( true )
		

		function showError ( err ) {
			self.moreResultsButtomLoading ( false )
			self.nextButtonErrorIndex (  _view.connectInformationMessage.getErrorIndex ( err ))
			self.nextButtonShowError ( true )
			
		}

		

		let currentArray = null
		const com: QTGateAPIRequestCommand = {
			command: 'CoSearch',
			Args: [ 'google', nextLink ],
			error: null,
			subCom: null
		}

		switch ( self.currentlyShowItems ()) {
			  //      google search
			case 0: {
				com.subCom = 'searchNext'
				currentArray = self.searchItemsArray()
				break
			}
			//      news
			case 1: {
				com.subCom = 'newsNext'
				currentArray = self.newsItemsArray()
				break
			}

			case 2: {
				com.subCom = 'imageSearchNext'
				currentArray = self.imageSearchItemArray()
				break
			}

			default: {
				com.subCom = 'videoNext'
				currentArray = self.videoItemsArray()
				break
			}
		}

		/** */
		
		
		return _view.keyPairCalss.emitRequest ( com, ( err, com: QTGateAPIRequestCommand ) => {
			
			if ( err ) {
				return showError ( err )
			}

			if ( !com ) {
				return self.nextButtonLoadingGetResponse ( true )
			}

			if ( com.error === -1 ) {
				self.nextButtonLoadingGetResponse ( false )
				return self.nextButtonConetResponse ( true )
			}

			if ( com.error ) {
				return showError ( com.error  )
			}
			self.moreResultsButtomLoading ( false )
			self.nextButtonLoadingGetResponse ( false )
			self.nextButtonConetResponse ( false )
			const args = com.Args
			self.returnSearchResultItemsInit ( args.param )
			currentArray.Result.push ( ...args.param.Result )
			currentArray.nextPage = args.param.nextPage
			return self.showResultItems ( self, currentArray )

		})
		
	},

	createNewsResult: ( self, newsResult ) => {
		const newsItems = JSON.parse ( JSON.stringify ( self.searchItemsArray ()))
		newsItems.Result = newsResult.Result
		newsItems.nextPage = newsResult.nextPage
		newsItems.totalResults = newsResult.totalResults
		return newsItems
	},

	newsButtonClick: ( self, event ) => {

		if ( self.newsButtonShowLoading ()) {
			return 
		}
		
		if ( self.newsButtonShowError ()) {
			self.newsButtonShowError( false )
			return self.newsButtonErrorIndex ( null )
		}

		self.newsButtonShowLoading ( true )

		const errorProcess = ( err ) => {
			self.newsButtonShowLoading ( false )
			self.newsLoadingGetResponse ( false )
			self.newsConetResponse ( false )
			self.newsButtonErrorIndex ( _view.connectInformationMessage.getErrorIndex( err ))
			return self.newsButtonShowError ( true )
		}
		if ( ! self.newsItemsArray() ) {

			if ( !self.searchItemsArray().action || !self.searchItemsArray().action.news ) {
				return errorProcess ('invalidRequest')
			}
			


			const com: QTGateAPIRequestCommand = {
				command: 'CoSearch',
				Args: [ 'google', self.searchItemsArray().action.news ],
				error: null,
				subCom: 'newsNext'
			}

			return _view.keyPairCalss.emitRequest ( com,( err, com: QTGateAPIRequestCommand ) => {
			
				if ( err ) {

					return errorProcess ( err )
				}
	
				if ( !com ) {
					return self.newsLoadingGetResponse ( true )
				}
	
				if ( com.error === -1 ) {
					self.newsLoadingGetResponse ( false )
					return self.newsConetResponse ( true )
				}
	
				if ( com.error ) {
					return errorProcess ( com.error  )
				}


				self.newsButtonShowLoading ( false )
				self.newsConetResponse ( false )
				self.newsLoadingGetResponse ( false )

				const args = com.Args
				self.newsItemsArray ( self.createNewsResult( self, args.param ))
				self.returnSearchResultItemsInit ( self.newsItemsArray () )
	
			})

		}

		self.currentlyShowItems(1)
		self.newsButtonShowLoading ( false )
		return self.showResultItems ( self, self.newsItemsArray() )

	},

	imageButtonClick: ( self, event ) => {

		if ( self.imageButtonShowLoading ()) {
			return 
		}
		
		if ( self.imageButtonShowError ()) {
			self.imageButtonShowError ( false )
			return self.imageButtonErrorIndex ( null )
		}

		const errorProcess = ( err ) => {
			self.imageButtonShowLoading ( false )
			self.imageLoadingGetResponse ( false )
			self.imageConetResponse ( false )
			self.imageButtonErrorIndex ( _view.connectInformationMessage.getErrorIndex( err ))
			return self.imageButtonShowError ( true )
		}

		if ( ! self.imageItemsArray() ) {
			const imageLink =  self.searchItemsArray() && self.searchItemsArray().action && self.searchItemsArray().action.image ? self.searchItemsArray().action.image : self.imageSearchItemArray().searchesRelated[1]
			const com: QTGateAPIRequestCommand = {
				command: 'CoSearch',
				Args: [ 'google', imageLink ],
				error: null,
				subCom: 'imageNext'
			}
			self.imageButtonShowLoading ( true )
			
			
			return _view.keyPairCalss.emitRequest ( com,( err, com: QTGateAPIRequestCommand ) => {
				
				if ( err ) {
					return errorProcess ( err )
				}

				if ( !com ) {
					self.imageConetResponse ( false )
					return self.imageLoadingGetResponse ( true )
				}

				if ( com.error === -1 ) {
					self.imageLoadingGetResponse ( false )
					return self.imageConetResponse ( true )
				}
				const args = com.Args

				if ( com.error ) {
					return errorProcess ( com.error )
				}

				if ( !args.param || !args.param.Result || !args.param.Result.length ) {
					return errorProcess ( 'timeOut' )
				}

				self.imageButtonShowLoading ( false )
				self.imageConetResponse ( false )
				self.imageLoadingGetResponse ( false )

				
				self.imageItemsArray ( args.param )
				self.returnSearchResultItemsInit ( self.imageItemsArray () )

			})
			/** */

		}


		
		self.searchSimilarImagesList( self.imageItemsArray().Result  )
		self.showMain ( false )
		self.showSearchSimilarImagesResult ( true )
		
	},

	getSnapshotClick: ( self, index ) => {
		const currentItem = self.searchItemList()[ index ]
		currentItem.showLoading ( true )
		const showError = err => {
			currentItem.showLoading ( false )
			currentItem.loadingGetResponse ( false )
			currentItem.conetResponse ( false )
			currentItem.errorIndex ( _view.connectInformationMessage.getErrorIndex ( err ))
			currentItem.showError ( true )
			const currentElm = $(`#${ currentItem.id }`)
			return currentElm.popup ({
				on: 'click',
				inline: true,
				onHidden: function () {
					currentItem.showError ( false )
					currentItem.errorIndex ( null )
					
				}
			})
		}

		const callBack = ( err?, com?: QTGateAPIRequestCommand ) => {
			if ( err ) {
				return showError ( err )
			}
			if ( !com ) {
				currentItem.loadingGetResponse ( true )
				return currentItem.conetResponse ( false )
			}
			if ( com.error === -1 ) {
				currentItem.loadingGetResponse ( false )
				return currentItem.conetResponse ( true )
			}
			if ( com.error ) {
				return showError ( com.error )
			}
			
			const arg: string = com.Args[0]
			currentItem.snapshotUuid = arg.split(',')[0].split ('.')[0]
			return _view.connectInformationMessage.sockEmit ( 'getFilesFromImap', arg, ( err, buffer: string ) => {
				if ( err ) {
					return showError ( err )
				}
				return _view.keyPairCalss.decryptMessageToZipStream ( buffer, ( err, data ) => {
					if ( err ) {
						return showError ( err )
					}
					currentItem.snapshotReady ( true )
					currentItem.showLoading ( false )
					currentItem.loadingGetResponse ( false )
					currentItem.conetResponse ( false )
					return currentItem.snapshotData = buffer
					
				})

				
			})
			
			
		}

		const url = currentItem.url
		const width = $(window).width()
		const height = $(window).height()
		
		const com: QTGateAPIRequestCommand = {
			command: 'CoSearch',
			Args: [ url, width, height ],
			error: null,
			subCom: 'getSnapshop'
		}

		return _view.keyPairCalss.emitRequest ( com, callBack )
	},

	showSnapshotClick: ( self, index ) => {
		self.showMain ( false )
		self.showSnapshop ( true )
		const currentItem = self.searchItemList()[ index ]
		let y = null
		

		self.showWebPage ( y = new showWebPageClass ( currentItem.url, currentItem.snapshotData, currentItem.snapshotUuid , () => {
			self.showWebPage ( y = null )
			self.showMain ( true )
			self.showSnapshop ( false )
			
		}))
	},

	searchesRelatedSelect: ( self, index ) => {

		self.searchInputText ( self.searchItem().searchesRelated[index].text )
		self.showSearchesRelated ( false )
	},

	closeSimilarImagesResult: ( self ) => {
		self.searchSimilarImagesList ([])
		self.showMain ( true )
		self.showSearchSimilarImagesResult ( false )
	},

	videoButtonClick: ( self ) => {

		if ( self.videoButtonShowLoading ()) {
			return 
		}
		
		if ( self.videoButtonShowError ()) {
			self.videoButtonShowError ( false )
			return self.imageButtonErrorIndex ( null )
		}

		const errorProcess = ( err ) => {
			self.videoButtonShowLoading ( false )
			self.videoLoadingGetResponse ( false )
			self.videoConetResponse ( false )
			self.videoButtonErrorIndex ( _view.connectInformationMessage.getErrorIndex ( err ))
			return self.videoButtonShowError ( true )
		}

		if ( ! self.videoItemsArray() ) {

			if ( !self.searchItemsArray().action || !self.searchItemsArray().action.video ) {
				return errorProcess ('invalidRequest')
			}

			const com: QTGateAPIRequestCommand = {
				command: 'CoSearch',
				Args: [ 'google', self.searchItemsArray().action.video ],
				error: null,
				subCom: 'videoNext'
			}

			self.videoButtonShowLoading ( true )
			
			
			return _view.keyPairCalss.emitRequest ( com,( err, com: QTGateAPIRequestCommand ) => {
				
				if ( err ) {
					return errorProcess ( err )
				}

				if ( !com ) {
					self.videoConetResponse ( false )
					return self.videoLoadingGetResponse ( true )
				}

				if ( com.error === -1 ) {
					self.videoLoadingGetResponse ( false )
					return self.videoConetResponse ( true )
				}

				if ( com.error ) {
					return errorProcess ( com.error  )
				}


				self.videoButtonShowLoading ( false )
				self.videoLoadingGetResponse ( false )
				self.videoConetResponse ( false )

				const args = com.Args
				self.videoItemsArray ( self.createNewsResult( self, args.param ))
				self.returnSearchResultItemsInit ( self.videoItemsArray () )

			})
			/** */

		
		}
		self.currentlyShowItems(3)
		
		return self.showResultItems ( self, self.videoItemsArray() )

	},

	getPictureBase64MaxSize_mediaData: ( mediaData: string, imageMaxWidth: number, imageMaxHeight: number, CallBack ) => {
		
		const media = mediaData.split(',')
		const type = media[0].split(';')[0].split (':')[1]
		const _media = Buffer.from ( media[1], 'base64')
		
		const ret: twitter_mediaData = {
			total_bytes: media[1].length,
			media_type: 'image/png',
			rawData: media[1],
			media_id_string: null
		}
		
		
		//if ( mediaData.length > maxImageLength) {
		const exportImage = ( _type, img ) => {
			return img.getBuffer ( _type, ( err, _buf: Buffer ) => {
				if ( err ) {
					return CallBack ( err )
				}
				ret.rawData = _buf.toString( 'base64' )
				ret.total_bytes = _buf.length

				return CallBack ( null, ret )
			})
		}

		return Jimp.read ( _media, ( err, image ) => {
			if ( err ) {
				return CallBack ( err )
			}
			const uu = image.bitmap

			if ( uu.height +  uu.width > imageMaxHeight + imageMaxWidth ) {
				if ( uu.height > uu.widt ) {
					image.resize ( Jimp.AUTO, imageMaxHeight )
				} else {
					image.resize ( imageMaxWidth, Jimp.AUTO )
				}
			
			}
			//		to PNG

			return image.deflateStrategy ( 2, () => {
				return exportImage ( ret.media_type, image )
			})
			

		})
		//}
		
		//return CallBack ( null, ret )
		
	},

	imageSearch: ( ee ) => {
		
			
			const self = _view.appsManager().appScript()

			const errorProcess = ( err ) => {
				self.showInputLoading ( false )
				self.searchInputText ( '' )
				self.errorMessageIndex ( _view.connectInformationMessage.getErrorIndex( err ))
				return self.showSearchError ( true )
			}

			const showItems = ( iResult ) => {
				self.showInputLoading ( false )
				self.currentlyShowItems ( 2 )
				self.returnSearchResultItemsInit ( iResult )
				self.imageSearchItemArray ( iResult )
				self.searchInputText ( iResult.searchesRelated[0])
				self.showResultItems ( self, self.imageSearchItemArray ())
			}

			if ( !ee || !ee.files || !ee.files.length ) {
				return
			}

			const file = ee.files[0]

			if ( !file || !file.type.match ( /^image.(png$|jpg$|jpeg$|gif$)/ )) {
				return
			}
			const reader = new FileReader()

			reader.onload = e => {
				
				const rawData = reader.result.toString()
				self.showInputLoading ( true )
				self.searchInputText (' ')
				self.searchItem ( null )
				
				self.searchItemList ([])

				return self.getPictureBase64MaxSize_mediaData ( rawData, 1024, 1024, ( err, data ) => {
					if ( err ) {
						return errorProcess ( err )
					}

					const uuid = uuid_generate() + '.png'

					return _view.keyPairCalss.encrypt ( data.rawData, ( err, textData ) => {

						if ( err ) {
							return errorProcess ( err )
						}
						self.initSearchData ( self )

						return _view.connectInformationMessage.sockEmit ( 'sendMedia', uuid, textData, err => {

							if ( err ) {
								return errorProcess ( err )
							}
	
							const com: QTGateAPIRequestCommand = {
								command: 'CoSearch',
								Args: [ 'google', uuid ],
								error: null,
								subCom: 'imageSearch'
							}
							
							return _view.keyPairCalss.emitRequest ( com, ( err, com: QTGateAPIRequestCommand ) => {

								if ( err ) {
									return errorProcess ( err )
								}

								if ( !com ) {
									return self.loadingGetResponse ( true )
								}

								if ( com.error === -1 ) {
									self.loadingGetResponse ( false )
									return self.conetResponse ( true )
								}
				
				
								if ( com.error ) {
									return errorProcess ( com.error  )
								}

								_view.CanadaBackground ( false )
								self.showMainSearchForm( false )
								return showItems ( com.Args.param )
				
							})
						})
						
					})
					
				})
				
			}

			if ( !_view.CanadaBackground ()) {
				_view.CanadaBackground ( true )
			}
			if ( !self.showMainSearchForm()) {
				self.showMainSearchForm( true )
			}
			return reader.readAsDataURL ( file )
		
	},

	imagesResultClick: ( self, index: number, image: string ) => {
		const _img = self.searchSimilarImagesList ()[ index ]
		const currentElm = $(`#${ _img.id }-1`)
		/**
		 * 
		 * 			get web side
		 * 
		 */
		
		if ( _img.showError()) {
			return _img.showError ( false )
		}

		if ( _img.showImageError ()) {
			return _img.showImageError ( false )
		}

		if ( image === 'link' ) {
			if ( _img.showLoading() ) {
				return
			}
			const url = _img.webUrlHref

			if ( _img['snapshotData'] ) {
				self.showMain ( false )
				self.showSnapshop ( true )
				self.showSearchSimilarImagesResult  ( false )

				let y = null
				

				return self.showWebPage ( y = new showWebPageClass ( url, _img['snapshotData'], _img['snapshotUuid'] , () => {
					self.showWebPage ( y = null )
					self.showMain ( true )
					self.showSnapshop ( false )
					self.showSearchSimilarImagesResult  ( true )
				}))
			}

			const errorProcess = ( err ) => {
				_img.errorIndex ( _view.connectInformationMessage.getErrorIndex( err ))
				_img.showLoading ( false )
				_img.snapshotReady ( false )
				_img.loadingGetResponse ( false )
				_img.conetResponse ( false )
				
				const currentElm = $(`#${ _img.id }`)
				currentElm.popup ({
					on: 'click',
					inline: true,
					onHidden: function () {
						_img.showError ( false )
						_img.errorIndex ( null )
						
					}
				})
				return _img.showError ( true )
			}

			
			
			
			_img.showLoading ( true )

			const callBack = ( err?, com?: QTGateAPIRequestCommand ) => {
				if ( err ) {
					return errorProcess ( err )
				}
				if ( !com ) {
					_img.loadingGetResponse ( true )
					return _img.conetResponse ( false )
				}
				if ( com.error === -1 ) {
					_img.loadingGetResponse ( false )
					return _img.conetResponse ( true )
				}
				if ( com.error ) {
					return errorProcess ( com.error )
				}
				
				const arg: string = com.Args[0]
				_img['snapshotUuid'] = arg.split(',')[0].split ('.')[0]
				return _view.connectInformationMessage.sockEmit ( 'getFilesFromImap', arg, ( err, buffer: string ) => {
					if ( err ) {
						return errorProcess ( err )
					}

					return _view.keyPairCalss.decryptMessageToZipStream ( buffer, ( err, data ) => {
						if ( err ) {
							return errorProcess ( err )
						}

						_img.snapshotReady ( true )
						_img.showLoading ( false )
						_img.loadingGetResponse ( false )
						_img.conetResponse ( false )
						return _img['snapshotData'] = buffer
						
					})
	
					
				})
				
				
			}
	
			
			const width = $(window).width()
			const height = $(window).height()
			
			const com: QTGateAPIRequestCommand = {
				command: 'CoSearch',
				Args: [ url, width, height ],
				error: null,
				subCom: 'getSnapshop'
			}
	
			return _view.keyPairCalss.emitRequest ( com, callBack )
		}



		/**
		 * n['showImageLoading'] = ko.observable ( false )
			n['snapshotImageReady'] = ko.observable ( false )
			n['loadingImageGetResponse'] = ko.observable ( false )
			n['conetImageResponse'] = ko.observable ( false )
			n['showImageError'] = ko.observable ( false )
			n['imageErrorIndex'] = ko.observable (-1)
		 */
		if ( image === 'img') {
			if ( _img.showImageLoading() ) {
				return 
			}
			if ( _img['imgOriginalData'] ) {
				const uu = 1
				return
			}

			const errorProcess = ( err ) => {
				_img.imageErrorIndex (_view.connectInformationMessage.getErrorIndex( err ))
				
				_img.showImageLoading ( false )
				_img.snapshotImageReady ( false )
				_img.loadingImageGetResponse ( false )
				_img.conetImageResponse ( false )
				_img.showImageError ( true )
				
				currentElm.popup ({	
					inline: true,
					onHidden: function () {
						_img.showImageError ( false )
						
					}
				})
				return
			}

			const callBack = ( err?, com?: QTGateAPIRequestCommand ) => {
				if ( err ) {
					return errorProcess ( err )
				}
				if ( !com ) {
					_img.loadingGetResponse ( true )
					return _img.conetResponse ( false )
				}
				if ( com.error === -1 ) {
					_img.loadingGetResponse ( false )
					return _img.conetResponse ( true )
				}
				if ( com.error ) {
					return errorProcess ( com.error )
				}
				
				const arg: string = com.Args[0]
				_img['snapshotUuid'] = arg.split(',')[0].split ('.')[0]
				return _view.connectInformationMessage.sockEmit ( 'getFilesFromImap', arg, ( err, buffer: string ) => {
					if ( err ) {
						return errorProcess ( err )
					}

					return _view.keyPairCalss.decryptMessageToZipStream ( buffer, ( err, data ) => {
						if ( err ) {
							return errorProcess ( err )
						}

						_img.snapshotReady ( true )
						_img.showLoading ( false )
						_img.loadingGetResponse ( false )
						_img.conetResponse ( false )
						return _img['snapshotData'] = buffer
						
					})
	
					
				})
				
				
			}

			const com: QTGateAPIRequestCommand = {
				command: 'CoSearch',
				Args: [ _img.imgUrlHref ],
				error: null,
				subCom: 'getFile'
			}
	
			return _view.keyPairCalss.emitRequest ( com, callBack )


			setTimeout (() => {
				_img.loadingImageGetResponse ( true )
				setTimeout (() => {
					_img.loadingImageGetResponse ( false )
					_img.conetImageResponse ( true )
					setTimeout (() => {
						_img.loadingImageGetResponse ( false )
						_img.conetImageResponse ( false )
						_img.snapshotImageReady ( true )
						_img.showImageLoading ( false )
					}, 1000 )
				}, 1000 )
			}, 1000 )

			_img.showImageLoading ( true )

		}


		
	}


}

declare const TimelineMax
