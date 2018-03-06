
interface keypair {
	publicKey?: string
	privateKey?: string
	keyLength: string
	nikeName: string
	createDate: string
	email: string
	passwordOK: boolean
    verified: boolean
    publicKeyID: string
}
interface INewKeyPair {
    email: string
    keyLength: string
    nikeName: string
    password: string
}
interface install_config {
    alreadyInit: boolean
    multiLogin: boolean
    firstRun: boolean
    version: string
    newVersion?: string
    newVersionCheckFault?: boolean
    newVersionDownloadFault?: number 
    newVerReady?: boolean
    keypair: keypair
    iterations: number
    salt?: Buffer
    keylen?: number
    localIpAddress: string []
    digest?: string
    freeUser: boolean
    connectedImapDataUuid: string
    account: string
    serverGlobalIpAddress: string
    serverPort: number
    connectedQTGateServer: boolean          //      true when connect to QTGate network
    lastConnectType: number
}

interface imapConnect {
    imapServer: string
    imapUserName: string
    imapUserPassword: string
    imapPortNumber: string
    imapSsl: boolean
    imapIgnoreCertificate: boolean
}

interface newReleaseData {
    ver: string,
    RELEASE: string
}

interface IQtgateConnect {
    qtgateConnectImapAccount?: string
    qtGateConnecting?: number
    isKeypairQtgateConform?: boolean
    error?: number
    needSentMail?: boolean
    haveImapUuid?: boolean
}

interface IinputData extends imapConnect {
    account:string
    email: string
    smtpServer:string
    smtpUserName:string
    smtpUserPassword:string
    smtpPortNumber:string|string[]
    smtpSsl:boolean
    smtpIgnoreCertificate: boolean
    imapTestResult: number
    language: string
    clientFolder: string
    serverFolder: string
    imapCheck: boolean
    smtpCheck: boolean
    sendToQTGate: boolean
    timeZoneOffset: number
    randomPassword: string
    uuid: string
    canDoDelete: boolean
    clientIpAddress: string
    ciphers: string
    confirmRisk: boolean
}
interface IinputData_server extends IinputData {
    connectEmail: boolean;
    validated: boolean;
}
interface QTGateAPIRequestCommand {
	command: string
    myIpServer?: QTGate_DnsAddress []
    account?: string
	error: number
	requestSerial: string
    Args: any[]
    fingerprint?: string
    dataTransfer?: iTransferData
}
interface iTransferData {
    startDate: string
    transferDayLimit: number
    transferMonthly: number
    account: string
    resetTime: string
    usedDayTransfer: number
    productionPackage: string
    usedMonthlyTransfer: number
    availableDayTransfer: number
    availableMonthlyTransfer: number
    usedMonthlyOverTransfer: number
    uploaded?: number
    downloaded?: number
    power: number
    timeZoneOffset: number
    expire: string
    isAnnual: boolean
    paidID: string[]
    automatically: boolean
}
interface QTGate_DnsAddress {
	dnsName: string,
	ipv4: string,
	url: string
}

interface multipleGateway {
    gateWayIpAddress: string
    gateWayPort: number
    dockerName: string
    password: string
}
interface requestPoolData {
	CallBack: ( err?: Error, returnData?: any ) => void
}

interface IConnectCommand {
    region: string
    account: string
    imapData: IinputData
    connectType: number
    transferData?: iTransferData
    error?: number
    dockerName?: string
    randomPassword?: string
    runningDocker?: string
    AllDataToGateway?: boolean
    fingerprint: string
    gateWayIpAddress: string
    gateWayPort?: number
    totalUserPower?: number
    requestContainerEachPower?: number
    connectPeer?: string
    requestRegions?: string[]
    multipleGateway?: multipleGateway[]
    requestMultipleGateway?: number
    containerUUID?: string
    peerUuid?: string
    localServerIp?: string
    localServerPort: number

    requestPortNumber: number
}

interface QTGateCommand {
    account: string
    QTGateVersion: string
    command: string
    imapData?: IinputData
    language: string
    error: Error
    callback: any
    publicKey: string
}
declare namespace NodeJS {
    export interface Process extends NodeJS.EventEmitter {
        mas: boolean
    }
}
interface keyPair {
    publicKey: string;
    privateKey: string;
}
interface VE_IPptpStream {
    type?: string;
    buffer: string;
    host: string;
    port: number;
    cmd: number;
    ATYP: number;
    uuid?: string;
    length?:number;
    randomBuffer?: Buffer
    ssl: boolean
}

declare module "dns" {
    interface lookup_option {
        family?: number;
        hints?: number;
        all?: boolean
    }
    interface address {
        address: string;
        family: number;
        expire: number;
        connect?: number []
    }
    export function lookup ( domain: string, option: lookup_option , callback: ( err: Error, address: address[] ) => void ): string;

}

interface feedBackData {
    attachImagePath: string
    attachedLog: string
    comment: string
    date: string
    attachImage?: string
}

interface dnsAddress {
	address: string
	family: number
	expire: Date
	connect: Date []
}
interface domainData {
	dns: dnsAddress[]
	expire: number
}
interface regionV1 {
    regionName: string
    testHostIp: string
    testUrl: string
    testHost: string
}
interface QTGateRegions {
    icon: string
    content: string[]
    description: string[]
    meta: string[]
    canVoe: KnockoutObservable < boolean >
    canVoH: KnockoutObservable < boolean >
    available: KnockoutObservable < boolean >
    selected: KnockoutObservable < boolean >
    showExtraContent: KnockoutObservable < boolean >
    QTGateRegionsSetup: IQTGateRegionsSetup[]
    qtRegion: string
    error: KnockoutObservable<number >
    showRegionConnectProcessBar: KnockoutObservable < boolean >
    showConnectedArea: KnockoutObservable < boolean >
    ping: KnockoutObservable <number >
    downloadSpeed: KnockoutObservable <number >
}
interface iQTGatePayment {
    cardNumber?: string
    cardExpirationYear?: string
    cardPostcode?: string
    cardcvc?: string
    tokenID?: string
    isAnnual: boolean
    plan: string
    Amount: number
    autoRenew: boolean
}
interface languageMenu {
    LanguageName: string;
    showName: string;
    LanguageJsonName: string;
}

interface StringValidator {
    isAcceptable(s: string): boolean;
}

interface systemViewStatus {
    SystemPassword_submitRunning: boolean
}

interface IQTGateRegionsSetup {
    title: string
}

interface TwitterAccount {
    consumer_key: string
    consumer_secret: string
    access_token_key: string
    access_token_secret: string
    twitter_verify_credentials?: Twitter_verify_credentials
}

interface Titter_status {
    created_at: string
    id: number
    id_str: string
    text: string
    truncated: boolean
    entities: any
    source: string
    in_reply_to_status_id: any
    in_reply_to_status_id_str: any
    in_reply_to_user_id: any
    in_reply_to_user_id_str: any
    in_reply_to_screen_name: any
    geo: any
    coordinates: any
    place: any
    contributors: any
    retweeted_status: Titter_status
    is_quote_status: boolean
    retweet_count: number
    favorite_count: number
    favorited: boolean
    retweeted: boolean
    possibly_sensitive: boolean
    lang: string

}
interface Twitter_verify_credentials {
    id: number
    id_str: string
    name: string
    screen_name: string
    location: string
    description: string
    url: string
    entities: any
    protected: boolean
    followers_count: number
    friends_count: number
    listed_count: number
    created_at: string
    favourites_count: number
    utc_offset: number
    time_zone: string
    geo_enabled: boolean
    verified: boolean
    statuses_count: number
    lang: string
    status: Titter_status
    contributors_enabled: boolean
    is_translator: boolean
    is_translation_enabled: boolean
    profile_background_color: string
    profile_background_image_url: string
    profile_background_image_url_https: string
    profile_background_tile: boolean
    profile_image_url: string
    profile_image_url_https: string
    profile_banner_url: string
    profile_link_color: string
    profile_sidebar_border_color: string
    profile_sidebar_fill_color: string
    profile_text_color: string
    profile_use_background_image: boolean
    has_extended_profile: boolean
    default_profile: boolean
    default_profile_image: boolean
    following: boolean
    follow_request_sent: boolean
    notifications: boolean
    translator_type: string

}
interface twitter_size {
    h: number
    resize: string
    w: number
}
interface twitter_media_video_info_variants {
    bitrate: number
    content_type: string
    url: string
}
interface twitter_media_video_info {
    aspect_ratio: number []
    duration_millis: number
    variants: twitter_media_video_info_variants[]
    QTDownload: string
}
interface twitter_media {
    display_url?: string
    expanded_url?: string
    id?: number
    id_str?: string
    indices?: number []
    media_url?: string
    media_url_https?: string
    sizes?: {
        large: twitter_size
        medium: twitter_size
        small: twitter_size
        thumb: twitter_size
    }
    type?: string        //  photo
    url?: string
    video_info: twitter_media_video_info
}
interface twitter_extended_entities extends twitter_post {
    media: twitter_media[]
}
interface twitter_entities_media {

}
interface twitter_entities_urls {
    display_url: string
    expanded_url: string
    indices: string[]
    url: string
}
interface twitter_entities {
    hashtags: any[]
    media: twitter_entities_media[]
    symbols: any[]
    urls: twitter_entities_urls[]
}
interface tweetCountSummary {

}
interface twitter_post {
    order: number
    contributors: any
    coordinates: any
    created_at: string
    QTGate_created_at: KnockoutComputed< string >
    entities: any
    favorite_count:  number
    favorite_count_ko : KnockoutObservable < number >
    favorited_ko: KnockoutObservable < boolean >
    favoritedLoader_ko: KnockoutObservable < boolean >
    favorited:  boolean
    geo: any
    id: number
    id_str: string
    in_reply_to_screen_name: any
    in_reply_to_status_id: any
    in_reply_to_status_id_str: any
    in_reply_to_user_id: any
    in_reply_to_user_id_str: any
    is_quote_status: boolean
    quoted_status: twitter_post
    lang: string
    full_text: string
    full_text_split_line: string
    retweeted_status: twitter_post
    place: any
    possibly_sensitive: boolean
    possibly_sensitive_appealable: boolean
    retweet_count: number
    retweeted: twitter_post
    extended_entities: twitter_extended_entities
    source: string
    text: string
    truncated: boolean
    user: Twitter_verify_credentials
    tweetCountSummary: tweetCountSummary
}

interface twitter_mediaData {
	total_bytes: number
	media_type: string
    rawData: string
    media_id_string: string
}

interface twitter_postData {
    text: string,
    images: string[],
    media_data: twitter_mediaData[]
    videoSize: number
    videoFileName: string
}


interface twitter_uploadImageInitData_imageObj {
	image_type: string
	w: number
	h: number
}

interface twitter_uploadImageInitData {
	media_id: number
	media_id_string: string
	size: number
	expires_after_secs: number
	image: twitter_uploadImageInitData_imageObj
}

interface twitter_uploadImageInitData_status_processing_info {
	state: string					//				in_progress, failed, succeeded
	check_after_secs: number
	progress_percent: number
	error?: {
		code: number
		name: string
		message: string
	}
}

interface twitter_uploadImageInitData_status {
	media_id: number
	media_id_string: string
	expires_after_secs: number
	processing_info: twitter_uploadImageInitData_status_processing_info
}