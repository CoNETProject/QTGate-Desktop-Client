import { exec } from 'child_process'
import { URLSearchParams } from 'url'

/**
 * 		The pageInfo object encapsulates paging information for the result set.
 */
interface youtube_search_pageInfo {
	totalResults: number
	resultsPerPage: number
}
interface youtube_search_item_thumbnails_keyItem {
	url: string			//		The image's URL.
	width: number		//		The image's width.
	height: number		//		The image's height.
}
/**
 * 	A map of thumbnail images associated with the playlist item. For each object in the map, 
 *  the key is the name of the thumbnail image, 
 *  and the value is an object that contains other information about the thumbnail.
 */
interface youtube_search_item_thumbnails {
	/**
	 * The default thumbnail image. The default thumbnail for a video – or a resource that refers to a video, 
	 * such as a playlist item or search result – is 120px wide and 90px tall. The default thumbnail for a channel is 88px wide and 88px tall.
	 */
	default?: youtube_search_item_thumbnails_keyItem

	/**
	 * A higher resolution version of the thumbnail image. 
	 * For a video (or a resource that refers to a video), 
	 * this image is 320px wide and 180px tall. For a channel, this image is 240px wide and 240px tall.
	 */
	medium?: youtube_search_item_thumbnails_keyItem

	/**
	 * A high resolution version of the thumbnail image. 
	 * For a video (or a resource that refers to a video), 
	 * this image is 480px wide and 360px tall. For a channel, 
	 * this image is 800px wide and 800px tall.
	 */
	high?: youtube_search_item_thumbnails_keyItem

	/**
	 * A high resolution version of the thumbnail image.
	 * For a video (or a resource that refers to a video), 
	 * this image is 480px wide and 360px tall. 
	 * For a channel, this image is 800px wide and 800px tall.
	 */
	standard?: youtube_search_item_thumbnails_keyItem

	/**
	 * The highest resolution version of the thumbnail image. 
	 * This image size is available for some videos and other resources that refer to videos, 
	 * like playlist items or search results. This image is 1280px wide and 720px tall.
	 */
	maxres?:youtube_search_item_thumbnails_keyItem
}

/**
 * 		The snippet object contains basic details about the playlist item, such as its title and position in the playlist.
 */
interface youtube_search_item_snippet {
	publishedAt: string							//		The date and time that the item was added to the playlist. The value is specified in ISO 8601 (YYYY-MM-DDThh:mm:ss.sZ) format.
	channelId: string							//		The ID that YouTube uses to uniquely identify the user that added the item to the playlist.
	title: string								//		The item's title.
	description: string							//		The item's description.
	thumbnails: youtube_search_item_thumbnails	//		details about the playlist item
	channelTitle: string						//		The channel title of the channel that the playlist item belongs to.
	liveBroadcastContent: string				//

}
interface youtube_search_item_id {
	kind: string 		//		Identifies the API resource's type. The value will be youtube#searchListResponse	
	videoId: string		//		The ID that YouTube uses to uniquely identify the playlist item.
}
interface youtube_search_item {
	kind: string 							//		Identifies the API resource's type. The value will be youtube#searchListResponse
	etag: string							//		The Etag of this resource.
	id: youtube_search_item_id
	snippet: youtube_search_item_snippet	//		The snippet object contains basic details about the playlist item, such as its title and position in the playlist.
}
interface youtube_search_ListResponse {
	kind: string							////		youtube#searchResult
	etag: string							//			The Etag of this resource.
	/**
	 * 	The region code that was used for the search query. 
	 *  The property value is a two-letter ISO country code that identifies the region.
	 *  The i18nRegions.list method returns a list of supported regions. The default value is US.
	 *  If a non-supported region is specified, YouTube might still select another region, rather than the default value, to handle the query.
	 */
	regionCode: string						//				
	pageInfo: youtube_search_pageInfo		//			The pageInfo object encapsulates paging information for the result set.	
	items: youtube_search_item[]			//			A list of results that match the search criteria.
}
export default class {
	private youtubeSearch ( text: string, CallBack ) {
		const url = new URLSearchParams ()
		url.append ( 'q', text )
		url.append ('maxResults','25')
		url.append ('type','video')
		url.append ('eventType','completed')
		url.append ('part', 'snippet')
		url.append ('key','AIzaSyD-xrq7pEnjhli8H75VD1vJov4Tdo8IWTI')

		const cmd = `curl -s -G -d "${ url.toString () }" https://www.googleapis.com/youtube/v3/search/`
		console.log ( cmd )
		
		return exec ( cmd,( err, stdout, stderr ) => {
			
			if ( err ) {
				return CallBack ( err )
			}
			
			let ret: youtube_search_ListResponse = null
			try {
				ret = JSON.parse ( stdout )
			}
			catch ( ex ) {
				return CallBack ( ex )
			}
			return CallBack ( null, ret.items )
		})
		
	}
	private socket_listing () {
		return this.socket.on ( 'youtube_search', ( text, CallBack1 ) => {
			console.log ( `Youtu search come!`, text )
			CallBack1 ()
			//return this.socket.emit ( 'youtube_search', 1 )
			return this.youtubeSearch ( text, ( err, data ) => {
				if ( err ) {
					console.log (`this.youtubeSearch return err!\n`, err )
					return this.socket.emit ( 'youtube_search', 1 )
				}
				console.log (`success!\n`, data )
				return this.socket.emit ( 'youtube_search', null, data )
			})
		})
	}
	
	
	constructor ( private socket: SocketIO.Socket ) {
		this.socket_listing ()
	}
}