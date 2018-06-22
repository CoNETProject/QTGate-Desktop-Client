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



interface ReadonlyArray<T> {
    /**
     * Returns the value of the first element in the array where predicate is true, and undefined
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    find<S extends T>(predicate: (this: void, value: T, index: number, obj: ReadonlyArray<T>) => value is S, thisArg?: any): S | undefined;
    find(predicate: (value: T, index: number, obj: ReadonlyArray<T>) => boolean, thisArg?: any): T | undefined;

    /**
     * Returns the index of the first element in the array where predicate is true, and -1
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    findIndex(predicate: (value: T, index: number, obj: ReadonlyArray<T>) => boolean, thisArg?: any): number;
}


interface Map<K, V> {
    clear(): void;
    delete(key: K): boolean;
    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void;
    get(key: K): V | undefined;
    has(key: K): boolean;
    set(key: K, value: V): this;
    readonly size: number;
}

interface MapConstructor {
    new (): Map<any, any>;
    new <K, V>(entries?: ReadonlyArray<[K, V]>): Map<K, V>;
    readonly prototype: Map<any, any>;
}
declare var Map: MapConstructor;

interface ReadonlyMap<K, V> {
    forEach(callbackfn: (value: V, key: K, map: ReadonlyMap<K, V>) => void, thisArg?: any): void;
    get(key: K): V | undefined;
    has(key: K): boolean;
    readonly size: number;
}

interface WeakMap<K extends object, V> {
    delete(key: K): boolean;
    get(key: K): V | undefined;
    has(key: K): boolean;
    set(key: K, value: V): this;
}

interface WeakMapConstructor {
    new (): WeakMap<object, any>;
    new <K extends object, V>(entries?: ReadonlyArray<[K, V]>): WeakMap<K, V>;
    readonly prototype: WeakMap<object, any>;
}
declare var WeakMap: WeakMapConstructor;

interface Set<T> {
    add(value: T): this;
    clear(): void;
    delete(value: T): boolean;
    forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void;
    has(value: T): boolean;
    readonly size: number;
}

interface SetConstructor {
    new (): Set<any>;
    new <T>(values?: ReadonlyArray<T>): Set<T>;
    readonly prototype: Set<any>;
}
declare var Set: SetConstructor;

interface ReadonlySet<T> {
    forEach(callbackfn: (value: T, value2: T, set: ReadonlySet<T>) => void, thisArg?: any): void;
    has(value: T): boolean;
    readonly size: number;
}

interface WeakSet<T extends object> {
    add(value: T): this;
    delete(value: T): boolean;
    has(value: T): boolean;
}

interface WeakSetConstructor {
    new (): WeakSet<object>;
    new <T extends object>(values?: ReadonlyArray<T>): WeakSet<T>;
    readonly prototype: WeakSet<object>;
}
declare var WeakSet: WeakSetConstructor;

interface imapConnect {
    imapServer: string
    imapUserName: string
    imapUserPassword: string
    imapPortNumber: number|number[]
    imapSsl: boolean
    imapIgnoreCertificate: boolean
}

interface keypair {
	publicKey?: string
	privateKey?: string
	keyLength: number
	nikeName: string
	createDate: string
	email: string
	passwordOK: boolean
    verified: boolean
    publicKeyID: string
    showLoginPasswordField?: KnockoutObservable < boolean >
    delete_btn_view?: KnockoutObservable < boolean >
    delete_btn_click?: () => void
    showConform?: KnockoutObservable < boolean >
    deleteKeyPairNext?: () => void
    keyPairPassword?: KnockoutObservable < keyPairPassword >
    showDeleteKeyPairNoite?: KnockoutObservable < boolean >
}


interface StringValidator {
    isAcceptable(s: string): boolean;
}
interface INewKeyPair {
    email: string
    nikeName: string
    password: string
}

interface keyPair {
    publicKey: string;
    privateKey: string;
}

interface imapData {
    email: string
}

interface requestPoolData {
    CallBack: ( err?: Error, returnData?: any ) => void
    timeout: any
}

interface regionV1 {
    regionName: string
    testHostIp: string
    testUrl: string
    testHost: string
    freeUser: boolean
    VoE: boolean
}

interface IinputData extends imapConnect {
    account:string
    email: string
    smtpServer:string
    smtpUserName:string
    smtpUserPassword:string
    smtpPortNumber:number|number[]
    smtpSsl:boolean
    smtpIgnoreCertificate: boolean
    imapTestResult: boolean
    language: string
    clientFolder: string
    serverFolder: string
    timeZoneOffset: number
    randomPassword: string
    uuid: string
    clientIpAddress: string
    ciphers: string
    confirmRisk: boolean
    sendToQTGate: boolean
}

interface CoPromo {
    datePromo: number
    pricePromo: number
    promoDetail: string[]
    promoFor: string[]
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
    totalMonth: number
    paidAmount: number
    automatically: boolean
    promo: CoPromo[]
}

interface multipleGateway {
    gateWayIpAddress: string
    gateWayPort: number
    dockerName: string
    password: string
}


interface QTGate_DnsAddress {
	dnsName: string,
	ipv4: string,
	url: string
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
    localServerIp?: string[]
    localServerPort: string
    webWrt?: boolean
    requestPortNumber: string
    globalIpAddress: string
}

interface QTGateAPIRequestCommand {
	command: string
    myIpServer?: QTGate_DnsAddress []
    account?: string
	error: number
	requestSerial?: string
    Args: any[]
    fingerprint?: string
    dataTransfer?: iTransferData
    requestTimes?: number
    region?: string
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

interface IQTGateRegionsSetup {
    title: string
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
    freeUser: KnockoutObservable < boolean >
}

interface domainData {
	dns: dnsAddress[]
	expire: number
}
interface dnsAddress {
	address: string
	family: number
	expire: Date
	connect: Date []
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

interface proxyServerInfo {
    serverAddress: string
    serverPort: number
    password: string
    allToGateway: boolean
    localPort: number
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
    showUser: KnockoutObservable < boolean >
    CoNET_totalTwitter: number
    CoNET_currentTwitter: number
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

interface TwitterAccount {
    consumer_key: string
    consumer_secret: string
    access_token_key: string
    access_token_secret: string
    twitter_verify_credentials?: Twitter_verify_credentials
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


interface twitter_text_parseTweet {
    weightedLength: number
    valid: boolean
    permillage: number
    validRangeStart: number
    validRangeEnd: number
    displayRangeStart: number
    displayRangeEnd: number
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

declare namespace SemanticUI {

}

declare namespace SocketIOClient {
    interface Emitter {
        emit11
    }
}

interface DateConstructor {
    isLeapYear: ( year: number ) => boolean
    getDaysInMonth: (year: number, month: number ) => number
    
    
}

interface Date {
    isLeapYear: ()=> boolean
    getDaysInMonth: () => number
    addMonths: ( n: number ) => Date
}
