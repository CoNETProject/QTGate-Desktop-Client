
window.URL = window.URL || window.webkitURL
declare const JSZip
const getFilenameMime = ( fileName: string, CallBack ) => {
	const exc = fileName.split ('.')
	const exc1 = exc[ exc.length - 1 ]
	const ret = $.cookie (`mime.${ exc1 }`)
	if ( ret && ret.length ) {
		return CallBack ( null, ret )
	}
	return _view.connectInformationMessage.sockEmit ('mime', fileName, ( err, data ) => {
		if ( err ) {
			return CallBack ( err )
		}
		$.cookie ( `mime.${ exc1 }`, data, { expires: 720, path: '/' })
		return CallBack ( null, data )
	})
	
}

const showHTMLComplete = ( uuid: string, zipStream: string, CallBack ) => {
	const errCallBack = err => {
		CallBack ( err )
	}
	return JSZip.loadAsync ( zipStream, { base64: true }).then ( zip => {
		const ret = {
			img: null,
			html: null,
			folder: new Map()
		}
		const allFiles = Object.keys ( zip.files )
		let currentFileName = ''
	
		const getZipFile = ( filename, __CallBack ) => {

			return getFilenameMime ( filename, ( err, mime ) => {
				if ( err ) {
					return __CallBack ( err )
				}
				if ( /^text\//.test ( mime )) {
					return zip.files [ filename ].async ( 'string' ).then ( __CallBack, errCallBack )
				}
				return zip.files [ filename ].async ('uint8array').then ( __CallBack, errCallBack )
			})
		}

		const _CallBack = content => {
			
			
			
			if ( content && content.length ) {
				
				const processFile = () => {
					return getFilenameMime ( currentFileName, ( err, mine ) => {
						if ( err ) {
							return
						}
						
						
						switch ( currentFileName ) {
							case `temp/${ uuid }.html`: {
								return ret.html = content
								
							}
							case `temp/${ uuid }.png`: {
								return ret.img = content
								
							}
							
							default: {
								const contentBlob = new Blob ([ content ], { type: mine })
								ret.folder.set ( currentFileName.replace( 'temp/','./' ), contentBlob )
							}
			
						}
						
					})
				}
	
				processFile ()
			}
			
			if ( allFiles.length ) {
				return getZipFile ( currentFileName = allFiles.shift(),  _CallBack )
			}
			
			return CallBack ( null, ret )
			
		}

		return getZipFile ( currentFileName = allFiles.shift(),  _CallBack )
		

	}, errCallBack )
}
