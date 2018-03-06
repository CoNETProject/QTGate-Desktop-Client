/*!
 * Copyright 2017 QTGate systems Inc. All Rights Reserved.
 *
 * QTGate systems Inc.
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



declare const semantic
declare const Cleave
declare const StripeCheckout
declare const Stripe

const animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend'

const insideChinaEmail = /(\@|\.)(sina|sohu|qq|126|163|tom)\.com|(\.|\@)yeah\.net/i

const Stripe_publicKey = 'pk_live_VwEPmqkSAjDyjdia7xn4rAK9'
/**
 * 			getImapSmtpHost
 * 		@param email <string>
 * 		@return Imap & Smtp info
 */

const getImapSmtpHost = ( _email: string ) => {
	const email = _email.toLowerCase()
	const yahoo = ( domain: string ) => {
		
		if ( /yahoo.co.jp$/i.test ( domain ))
			return 'yahoo.co.jp';
			
		if ( /((.*\.){0,1}yahoo|yahoogroups|yahooxtra|yahoogruppi|yahoogrupper)(\..{2,3}){1,2}$/.test ( domain ))
			return 'yahoo.com';
		
		if ( /(^hotmail|^outlook|^live|^msn)(\..{2,3}){1,2}$/.test ( domain ))
			return 'hotmail.com';
			
		if ( /^(me|^icould|^mac)\.com/.test ( domain ))
			return 'me.com'

		return domain
	}

	const emailSplit = email.split ( '@' )
	
	if ( emailSplit.length !== 2 ) 
		return null
		
	const domain = yahoo ( emailSplit [1] )
	
	const ret = {
		imap: 'imap.' + domain,
		smtp: 'smtp.' + domain,
		SmtpPort: [465,587,994],
		ImapPort: 993,
		imapSsl: true,
		smtpSsl: true,
		haveAppPassword: false,
		ApplicationPasswordInformationUrl: ['']
	}
	
	switch ( domain ) {
		//		yahoo domain have two different 
		//		the yahoo.co.jp is different other yahoo.*
		case 'yahoo.co.jp': {
			ret.imap = 'imap.mail.yahoo.co.jp';
			ret.smtp = 'smtp.mail.yahoo.co.jp'
		}
		break;

		//			gmail
		case 'google.com':
		case 'googlemail.com':
		case 'gmail': {
			ret.haveAppPassword = true;
			ret.ApplicationPasswordInformationUrl = [
				'https://support.google.com/accounts/answer/185833?hl=zh-Hans',
				'https://support.google.com/accounts/answer/185833?hl=ja',
				'https://support.google.com/accounts/answer/185833?hl=en'
			]
		}
		break;

        case 'gandi.net':
            ret.imap = ret.smtp = 'mail.gandi.net'
        break
		
		//				yahoo.com
		case 'rocketmail.com':
		case 'y7mail.com':
		case 'ymail.com':
		case 'yahoo.com': {
			ret.imap = 'imap.mail.yahoo.com'
			ret.smtp = (/^bizmail.yahoo.com$/.test(emailSplit[1]))
				? 'smtp.bizmail.yahoo.com'
				: 'smtp.mail.yahoo.com'
			ret.haveAppPassword = true;
			ret.ApplicationPasswordInformationUrl = [
				'https://help.yahoo.com/kb/SLN15241.html',
				'https://help.yahoo.com/kb/SLN15241.html',
				'https://help.yahoo.com/kb/SLN15241.html'
			]
		}
		break;

        case 'mail.ee':
            ret.smtp = 'mail.ee'
            ret.imap = 'mail.inbox.ee'
        break

		
        //		gmx.com
        case 'gmx.co.uk':
        case 'gmx.de':
		case 'gmx.us':
		case 'gmx.com' : {
            ret.smtp = 'mail.gmx.com'
            ret.imap = 'imap.gmx.com'
        }
        
		break;
		
		//		aim.com
		case 'aim.com': {
			ret.imap = 'imap.aol.com'
		}
		break;
		
		//	outlook.com
		case 'windowslive.com':
		case 'hotmail.com': 
		case 'outlook.com': {
			ret.imap = 'imap-mail.outlook.com'
            ret.smtp = 'smtp-mail.outlook.com'
		}
		break;
		
		//			apple mail
        case 'icloud.com':
        case 'mac.com':
		case 'me.com': {
			ret.imap = 'imap.mail.me.com'
            ret.smtp = 'smtp.mail.me.com'
		}
		break;
		
		//			163.com
		case '126.com':
		case '163.com': {
			ret.imap = 'appleimap.' + domain
			ret.smtp = 'applesmtp.' + domain
		}
		break;
		
		case 'sina.com':
		case 'yeah.net': {
			ret.smtpSsl = false
		}
		break;
		
	}
	
	return ret
	
}

class IsNullValidator implements StringValidator {
    isAcceptable ( s: string ) {
        if ( s === undefined ) {
            return true;
        }
        if ( s === null ) {
            return true;
        }
        if ( s.length == 0 ) {
            return true;
        }
    }
}

class EmailValidator implements StringValidator {
    isAcceptable ( s: string ) {
        return EmailRegexp.test( s );
    }
}

const testVal = new IsNullValidator()
const testEmail = new EmailValidator()
const oneDayTime = 186400000 
/**
 *      check email address
 *      @param email <string>
 *      @param return <string>  Valid = '' Err = errorMessage
 */
const checkEmail = ( email: string ) => {
    
    if ( testVal.isAcceptable ( email )) {
       return 'required'
    } 
    
    if ( ! testEmail.isAcceptable ( email ))
    {
        return 'EmailAddress'
    }
    
    return ''
}

const getNickName = ( email: string ) => {
    var ret = '';
    if ( email.length ){
        ret = email.split ('@')[0];
        ret = ret.charAt (0).toUpperCase () + ret.slice(1);
    }
    return ret;
}

const initKeyPair: keypair = {
    keyLength: '',
    email: '',
    nikeName: '',
    createDate: '',
    passwordOK: false,
    verified: false,
    publicKeyID: ''
}

const QTGateRegionsSetup: IQTGateRegionsSetup[] = [
    {
        title: '@OPN'
    },
    {
        title: 'iOPN'
    }
]

const nextExpirDate = ( expire: string ) => {
    const now = new Date ()
    const _expire = new Date ( expire )
    _expire.setHours ( 0,0,0,0 )
    if ( now.getTime() > _expire.getTime ()) {
        return _expire
    }
    const nextExpirDate = new Date ( expire )
    nextExpirDate.setMonth ( now.getMonth())
    nextExpirDate.setFullYear ( now.getFullYear())

    if ( nextExpirDate.getTime() < now.getTime ()) {
        nextExpirDate.setMonth ( now.getMonth() + 1 )
        return nextExpirDate
    }

    return _expire
}

const getRemainingMonth = ( expire: string ) => {
    const _expire = new Date ( expire )
    const _nextExpirDate = nextExpirDate ( expire )
    return _expire.getFullYear () === _nextExpirDate.getFullYear () ? _expire.getMonth() - _nextExpirDate.getMonth() : ( 12 - _nextExpirDate.getMonth() + _expire.getMonth() )
}

const getAmount = ( amount ) => {
    if ( !amount )
        return null
    if ( typeof amount === 'number' ) {
        amount = amount.toString()
    }
    const ret = amount.split('.')
    return ret.length === 1 ? amount + '.00' : amount 
}

const _QTGateRegions: QTGateRegions[] = [
    {
        icon: 'india',
        content: ['班加罗尔','バンガロール','Bangalore','班加羅爾'],
        meta: ['亚洲・印度','アジア・インド','India. Asia.','亞洲・印度'],
        description: ['','','',''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable ( false ),
        showExtraContent: ko.observable ( false ),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'Asia.Bangalore',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable ( false ),
        showConnectedArea: ko.observable ( false ),
        ping: ko.observable ( -2 ),
        downloadSpeed: ko.observable (-2)

    },{
        icon: 'singapore',
        content: ['新加坡','シンガポール','Singapore','新加坡'],
        meta: ['亚洲・新加坡','アジア・シンガポール','Singapore. Asia.','亞洲・新加坡'],
        description: ['','','',''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable ( false ),
        showExtraContent: ko.observable ( false ),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'singapore',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable ( false ),
        showConnectedArea: ko.observable ( false ),
        ping: ko.observable ( -2 ),
        downloadSpeed: ko.observable (-2)
    },{
        icon: 'japan',
        content: ['东京','東京','Tokyo','東京'],
        meta: ['亚洲・日本','アジア・日本','Japan. Asia.','亞洲・日本'],
        description: ['','','',''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable ( false ),
        showExtraContent: ko.observable ( false ),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'tokyo',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable ( false ),
        showConnectedArea: ko.observable ( false ),
        ping: ko.observable ( -2 ),
        downloadSpeed: ko.observable (-2)
    },{
        icon: 'france',
        content: ['巴黎','パリ','Paris','巴黎'],
        meta: ['欧洲・法国','ヨーロッパ・フランス','France. Europe.','歐洲・法國'],
        description: ['','','',''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable ( false ),
        showExtraContent: ko.observable ( false ),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'paris',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable ( false ),
        showConnectedArea: ko.observable ( false ),
        ping: ko.observable ( -2 ),
        downloadSpeed: ko.observable (-2)
    }
    /*
    ,{
        icon: 'netherlands',
        content: ['阿姆斯特丹1','アムステルダム1','Amsterdam1','阿姆斯特丹1'],
        meta: ['欧洲・荷兰','ヨーロッパ・オランダ','Netherlands. Europe.','歐洲・荷蘭'],
        description: ['','','',''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable ( false ),
        showExtraContent: ko.observable ( false ),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'amsterdam1',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable ( false ),
        showConnectedArea: ko.observable ( false ),
        ping: ko.observable ( -2 ),
        downloadSpeed: ko.observable (-2)
    }
    */
    ,{
        icon: 'netherlands',
        content: ['阿姆斯特丹','アムステルダム','Amsterdam','阿姆斯特丹'],
        meta: ['欧洲・荷兰','ヨーロッパ・オランダ','Netherlands. Europe.','歐洲・荷蘭'],
        description: ['','','',''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable ( false ),
        showExtraContent: ko.observable ( false ),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'amsterdam',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable ( false ),
        showConnectedArea: ko.observable ( false ),
        ping: ko.observable ( -2 ),
        downloadSpeed: ko.observable (-2)
    },{
        icon: 'germany',
        content: ['法兰克福','フランクフルト','Frankfurt','法蘭克福'],
        meta: ['欧洲・德国','ヨーロッパ・ドイツ','Germany. Europe.','歐洲・德國'],
        description: ['','','',''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable ( false ),
        showExtraContent: ko.observable ( false ),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion:'frankfurt',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable ( false ),
        showConnectedArea: ko.observable ( false ),
        ping: ko.observable ( -2 ),
        downloadSpeed: ko.observable (-2)

    },{
        icon: 'united kingdom',
        content: ['爱尔兰','アイルランド','Ireland','愛爾蘭'],
        meta: ['欧洲・英国','ヨーロッパ・英国','United Kingdom. Europe.','歐洲・英國'],
        description: ['','','',''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable ( false ),
        showExtraContent: ko.observable ( false ),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'Ireland',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable ( false ),
        showConnectedArea: ko.observable ( false ),
        ping: ko.observable ( -2 ),
        downloadSpeed: ko.observable (-2)
    },{
        icon: 'united kingdom',
        content: ['伦敦','ロンドン','London','倫敦'],
        meta: ['欧洲・英国','ヨーロッパ・英国','United Kingdom. Europe.','歐洲・英國'],
        description: ['','','',''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable ( false ),
        showExtraContent: ko.observable ( false ),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'London',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable ( false ),
        showConnectedArea: ko.observable ( false ),
        ping: ko.observable ( -2 ),
        downloadSpeed: ko.observable (-2)
    },{
        icon: 'australia',
        content: ['悉尼','シドニー','Sydney','悉尼'],
        meta: ['澳洲・澳大利亚','オーストラリア','Australia.','澳洲・澳大利亚'],
        description: ['','','',''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable ( false ),
        showExtraContent: ko.observable ( false ),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'Sydney',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable ( false ),
        showConnectedArea: ko.observable ( false ),
        ping: ko.observable ( -2 ),
        downloadSpeed: ko.observable (-2)
    },{
        icon: 'united states',
        content: ['纽约','ニューヨーク','New York City','紐約'],
        meta: ['北美洲东海岸・美国','北アメリカ東海岸・アメリカ','USA. North American Eastern.','北美洲東海岸・美國'],
        description: ['','','',''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable ( false ),
        showExtraContent: ko.observable ( false ),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'new-york-city',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable ( false ),
        showConnectedArea: ko.observable ( false ),
        ping: ko.observable ( -2 ),
        downloadSpeed: ko.observable (-2)

    },{
        icon: 'canada',
        content: ['多伦多','トロント','Toronto','多倫多'],
        meta: ['北美洲东海岸・加拿大','北アメリカ東海岸・カナダ','Canada. North American Eastern.','北美洲東海岸・加拿大'],
        description: ['','','',''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable ( false ),
        showExtraContent: ko.observable ( false ),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'toronto',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable ( false ),
        showConnectedArea: ko.observable ( false ),
        ping: ko.observable ( -2 ),
        downloadSpeed: ko.observable (-2)
    },{
        icon: 'united states',
        content: ['旧金山','サンフランシスコ','San Francisco','舊金山'],
        meta: ['北美洲西海岸・美国・旧金山','北アメリカ西海岸・アメリカ','USA. North American Western.','北美洲西海岸・美國'],
        description: ['','','',''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable ( false ),
        showExtraContent: ko.observable ( false ),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'francisco',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable ( false ),
        showConnectedArea: ko.observable ( false ),
        ping: ko.observable ( -2 ),
        downloadSpeed: ko.observable (-2)
    },{
        icon: 'hong kong',
        content: ['香港','香港','Hong Kong','香港'],
        meta: ['亚洲・中国','アジア・中国','China. Asia.','亞洲・中國'],
        description: ['','','',''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable ( false ),
        showExtraContent: ko.observable ( false ),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'HK',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable ( false ),
        showConnectedArea: ko.observable ( false ),
        ping: ko.observable ( -2 ),
        downloadSpeed: ko.observable (-2)
    },{
        icon: 'china',
        content: ['上海市','上海市','Shanghai','上海市'],
        meta: ['亚洲・中国','アジア・中国','China. Asia.','亞洲・中國'],
        description: ['','','',''],
        canVoe: ko.observable(false),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable ( false ),
        showExtraContent: ko.observable ( false ),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'shanghai',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable ( false ),
        showConnectedArea: ko.observable ( false ),
        ping: ko.observable ( -2 ),
        downloadSpeed: ko.observable (-2)
    },{
        icon: 'china',
        content: ['北京市','北京市','Beijing','北京市'],
        meta: ['亚洲・中国','アジア・中国','China. Asia.','亞洲・中國'],
        description: ['','','',''],
        canVoe: ko.observable(false),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable ( false ),
        showExtraContent: ko.observable ( false ),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'beijing',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable ( false ),
        showConnectedArea: ko.observable ( false ),
        ping: ko.observable ( -2 ),
        downloadSpeed: ko.observable (-2)
    },{
        icon: 'china',
        content: ['无锡市','無錫市','Wuxi','無錫市'],
        meta: ['亚洲・中国江苏省','アジア・中国江蘇省','Jiangsu China. Asia.','亞洲・中國江蘇省'],
        description: ['','','',''],
        canVoe: ko.observable(false),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable ( false ),
        showExtraContent: ko.observable ( false ),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'Wuxi',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable ( false ),
        showConnectedArea: ko.observable ( false ),
        ping: ko.observable ( -2 ),
        downloadSpeed: ko.observable (-2)
    }
]

const checkCanDoAtQTGateReg = /^imap\.mail\.me\.com$/
const checkCanDoAtQTGate = ( imapArray: KnockoutObservableArray < view_layout.emailPoolData > ) => {
    return imapArray().findIndex ( n => { return checkCanDoAtQTGateReg.test ( n.iMapServerName()) && n.imapCheckResult() > 0 })
}
const availableImapServer = /imap\-mail\.outlook\.com$|imap\.mail\.yahoo\.(com|co\.jp|co\.uk|au)$|imap\.mail\.me\.com$|imap\.gmail\.com$|gmx\.(com|us|net)$|imap\.zoho\.com$/i
const dummyIConnectCommand: IConnectCommand = {
    connectPeer: null,
    connectType: null,
    localServerIp: null,
    localServerPort: null,
    account: null,
    AllDataToGateway: null,
    region: null,
    imapData: null,
    error: null,
    fingerprint: null,
    multipleGateway: null,
    requestPortNumber: null,
    requestMultipleGateway: null,
    transferData: null,
    runningDocker: null,
    gateWayIpAddress: null,
    gateWayPort: 0,
    totalUserPower: 0,
    requestContainerEachPower: 0,
    containerUUID: null,
    peerUuid: null,

}

const donateArray = [{
    image:[
        'https://user-images.githubusercontent.com/19976150/32689499-0e193bac-c69b-11e7-9297-4ed714522497.png',
        'https://user-images.githubusercontent.com/19976150/32689499-0e193bac-c69b-11e7-9297-4ed714522497.png',
        'https://user-images.githubusercontent.com/19976150/32689499-0e193bac-c69b-11e7-9297-4ed714522497.png',
        'https://user-images.githubusercontent.com/19976150/32689499-0e193bac-c69b-11e7-9297-4ed714522497.png'],
    header: ['维基百科','ウィキペディア','Wikipedia','維基百科'],
    meta:['匿名北美慈善团体','ある北米チャリティー','Anonymous North American charity','匿名北美慈善團體'],
    description:[
        '维基百科是一个自由内容、公开编辑且多语言的网络百科全书协作项目，通过Wiki技术使得包括您在内的所有人都可以简单地使用网页浏览器修改其中的内容。维基百科一字取自于本网站核心技术“Wiki”以及具有百科全书之意的“encyclopedia”共同创造出来的新混成词“Wikipedia”，当前维基百科由维基媒体基金会负责运营。',
        'ウィキペディアは、信頼されるフリーなオンライン百科事典、それも質・量ともに史上最大の百科事典を、共同作業で創り上げることを目的とするプロジェクト、およびその成果である百科事典本体です。',
        'Wikipedia is a free online encyclopedia with the aim to allow anyone to edit articles. Wikipedia is the largest and most popular general reference work on the Internet, and is ranked the fifth-most popular website. Wikipedia is owned by the nonprofit Wikimedia Foundation.',
        '維基百科是一個自由內容、公開編輯且多語言的網絡百科全書協作項目，通過Wiki技術使得包括您在內的所有人都可以簡單地使用網頁瀏覽器修改其中的內容。維基百科一字取自於本網站核心技術“Wiki”以及具有百科全書之意的“encyclopedia”共同創造出來的新混成詞“Wikipedia”，當前維基百科由維基媒體基金會負責運營。']
}]

const checkSmtpImapAccountSetup = ( email: string, uuid: string, imap: view_layout.emailPoolData ) => {
    
    if ( checkEmail ( email ).length ) {
        imap.emailAddressShowError ( true )
        imap.EmailAddressErrorType (0)
        $('.activating.element').popup ({
            on: 'focus',
            movePopup: false
        })
        return false
    }
    if ( imap.root.emailPool().length ) {
        const index = imap.root.emailPool().findIndex ( n => { return n.emailAddress () === email && n.uuid !== uuid })
        if ( index > -1 ) {
            imap.emailAddressShowError ( true )
            imap.EmailAddressErrorType ( 1 )
            $('.activating.element').popup({
                on: 'focus',
                movePopup: false
            })
            return false
        }
    }
    
    const data = getImapSmtpHost ( email )
    if ( !imap.root.haveQTGateImapAccount() && ! availableImapServer.test ( data.imap )) {
        imap.emailAddressShowError ( true )
        imap.EmailAddressErrorType ( 2 )
        $('.activating.element').popup({
            on: 'focus',
            movePopup: false
        })
        return false
    }
    
    imap.emailAddressSuccess ( true )
    //if (!$(`#${ imap.uuid }-imap`).hasClass('active')) {
        imap.iMapServerName ( data.imap )
        imap.iMapServerLoginName ( email )
        imap.iMapSecure ( data.imapSsl )
        imap.imapPortChecked ( data.ImapPort.toString ())
        imap.imapIgnoreCertificate ( false )
    //}
    
    //if (!$(`#${ imap.uuid }-smtp`).hasClass('active')) {
        imap.SmtpServerName ( data.smtp )
        imap.SmtpServerLoginName ( email )
        imap.smtpSecure ( data.smtpSsl )
        imap.smtpPortChecked ( data.SmtpPort[0].toString ())
        imap.smtpIgnoreCertificate ( false )
    //}
    //this.showImapSmtpdetailTreeView (true)
        
    return true
}

const imapAccountGoCheckClick = ( imap: view_layout.emailPoolData ) => {
    if ( checkEmail ( imap.emailAddress()).length ) {
        checkSmtpImapAccountSetup ( imap.emailAddress(), imap.uuid, imap )
        return false
    }
    if ( !checkSmtpImapAccountSetup ( imap.emailAddress(), imap.uuid, imap ))
        return false
    imap.imapCheckOk ( false )
    imap.smtpCheckOk ( false )
    imap.imapDataEditShow ( false )
    imap.runningCheck ( true )
    let percent = 0
    imap.imapCheckingStep (0)

    imap.process.progress ('reset')
    const doingProcessBar = () => {
        clearTimeout ( imap.doingProcessBarTime )
        imap.doingProcessBarTime = setTimeout (() => {
            imap.process.progress ({
                percent: ++ percent
            })
            if ( percent < 100 )
                return doingProcessBar ()
        }, 200 )
    }

    doingProcessBar ()

    socketIo.emit ( 'startCheckImap', imap.progressBarCss(), imap.GetImapData (), ( ret: number ) => {

        if ( ret )
            return imap.callBackError ( ret )
        
        socketIo.once ( imap.progressBarCss() + '-imap', ( err: number, result: number )  => {
            if ( err ) {
                imap.appPaassword ( err === 3 )
                return imap.callBackError ( err )
            }

            socketIo.once ( imap.progressBarCss() + '-smtp', ( err: string )  => {
                if ( err ) {
                    return imap.callBackError ( err )
                }
                    
                percent = 98
                imap.smtpCheckOk ( true )
                imap.process.addClass( 'success' )
                const fromIInputData = $('.rating')
                fromIInputData.rating ( 'disable' )
                imap.root.canShowAddAImapButton ()
                imap.process.removeClass( 'success' )
                imap.runningCheck ( false )
                imap.showImapTestSuccess ( false )
                return imap.imapCheckingStep (2)

            })
            percent = 33
            imap.imapCheckResult ( result )
            imap.dataRating ( result < 500 ? 3 : result < 1000 ? 2 : 1 )
            
            imap.imapCheckOk ( true )
            return imap.imapCheckingStep (1)
            
        })
        percent = 0
        return imap.imapCheckingStep (0)
        
    })
}

module view_layout {
    export class emailPoolData {
        public GetImapData () {
            const data: IinputData = {
                email: this.emailAddress (),
                account: this.root.config().keypair.email,
                imapServer: this.iMapServerName (),
                imapPortNumber: this.imapPortChecked() === 'other' ? this.iMapServerPortNumber () : this.imapPortChecked(),
                imapSsl: this.iMapSecure (),
                imapUserName: this.iMapServerLoginName (),
                imapUserPassword: this.iMapServerLoginPassword (),
                smtpServer: this.SmtpServerName (),
                smtpSsl: this.smtpSecure (),
                smtpPortNumber: this.edited ? ( this.smtpPortChecked() === 'other' ? this.smtpServerPortNumber() : this.smtpPortChecked()) : ['465','587','994'],
                smtpUserName: this.SmtpServerLoginName (),
                smtpUserPassword: this.smtpServerLoginPassword (),
                smtpIgnoreCertificate: this.smtpIgnoreCertificate (),
                imapIgnoreCertificate: this.imapIgnoreCertificate (),
                imapTestResult: null,
                language: this.root.tLang(),
                serverFolder: null,
                clientFolder: null,
                sendToQTGate: null,
                smtpCheck: null,
                imapCheck: null,
                timeZoneOffset: new Date ().getTimezoneOffset (),
                randomPassword:  null,
                uuid: this.uuid,
                canDoDelete: false,
                clientIpAddress: null,
                ciphers: null,
                confirmRisk: null
                
            }
            return data 
        }

        // - DATA
            public emailAddress = ko.observable ('')
            public password = ko.observable ('')
            public iMapServerName = ko.observable ('')
            public iMapServerLoginName = ko.observable ('')
            public iMapServerLoginPassword = ko.observable ('')
            public iMapSecure = ko.observable ( true )
            public iMapServerPortNumber = ko.observable ('993')
            public imapPortChecked = ko.observable ( '' )
            public SmtpServerName = ko.observable ('')
            public SmtpServerLoginName = ko.observable ('')
            public smtpSecure = ko.observable ( true )
            public smtpServerLoginPassword = ko.observable ('')
            public smtpPortChecked = ko.observable ( '' )
            public VpnviaEmailCheckOK = ko.observable ( false )
            public smtpServerPortNumber = ko.observable ( '994' )
            public imapIgnoreCertificate = ko.observable ( false )
            public smtpIgnoreCertificate = ko.observable ( false )

        // * DATA
        // - view
            public imapPortArray = [ '143', '993', 'other' ]
            public smtpPortArray = [ '25','465','587','994','2525','other' ]
            public emailAddressSuccess = ko.observable ( false )
            public emailAddressShowError = ko.observable ( false )
            public EmailAddressErrorType = ko.observable (0)
            public passwordShowError = ko.observable ( false )
            public passwordSuccess = ko.observable ( false )
            public showDeleteImapConform = ko.observable ( false )
            public showImapSmtpdetailTreeView = ko.observable ( false )
            public nodeCollapsed = ko.observable ( true )
            public imapHostNameErr = ko.observable ( false )
            public imapAuthenticationFailed = ko.observable ( false )
            public CertificateError = ko.observable ( false )
            public imapOtherCheckError = ko.observable ( false )
            public smtpOtherCheckError = ko.observable ( false )
            public smtpAuthenticationFailed = ko.observable ( false )
            public iMapServerPortNumberError = ko.observable ( false )
            public smtpServerPortNumberError = ko.observable ( false )
            public smtpHostNameErr = ko.observable ( false )
            public emailAddressDoingCheck = ko.observable ( false )
            public imapCheckOk = ko.observable ( false )
            public smtpCheckOk = ko.observable ( false )
            public imapCheckResult = ko.observable ( 0 )
            public runningCheck = ko.observable ( false )
            public imapStatusBarAlert = ko.observable ( false )
            public smtpStatusBarAlert = ko.observable ( false )
            public imapCheckCallBack = ko.observable ( false )
            public smtpCheckCallBack = ko.observable ( false )
            public progressBarCss = ko.observable (uuID())
            public emailAccountWarning = ko.observable ( false )
            public QTGateBarAlert = ko.observable ( false )
            public QTGateCheckOk = ko.observable ( false )
            public QTGateCallBack = ko.observable ( false )
            public QTGateConnect = ko.observable ( false )
            public imapDataEditShow = ko.observable ( true )
            public imapDataEnited = ko.observable ( true )      //  user name or password changed
            public showConnectingToImapServer = ko.observable ( false )
            public ImapErr = ko.observable ( false )
            public ImapAccountConnected = ko.observable ( false )
            public imapDeletebtn_view = ko.observable ( false )
            public uuid = uuID()
            public errorMessage = ko.observable([])
            public imapCheckingStep = ko.observable (0)
            public doingProcessBarTime = null
            public showImapTestSuccess = ko.observable ( false )
            public imapCheckReturnError = ko.observable (0)
            public dataRating = ko.observable (0)
            public saved = ko.observable ( false )
            public canDoDelete = ko.observable ( false )
            public showDeleteArea = ko.observable ( false )
            public sendToQTGate = ko.observable ( false )
            public process = $(`#${ this.uuid }>.progress`)
            public edited = false
            public appPaassword = ko.observable ( false )
            public isQTGateImapAccount = ko.computed (() => {
                return availableImapServer.test ( this.iMapServerName())
            })
            
            
        // * view
        constructor ( public root: view ) {
            this.emailAddress.subscribe (( newValue: string ) => {
                this.passwordShowError ( false )
                this.emailAddressShowError ( false )
                this.imapAuthenticationFailed ( false )
                this.smtpAuthenticationFailed ( false )
                checkSmtpImapAccountSetup ( newValue, this.uuid, this )
                this.imapDataEnited ( true )
                this.appPaassword ( true )
            })

            this.password.subscribe ( newValue => {
                this.passwordShowError ( false )
                this.emailAddressShowError ( false )
                this.imapAuthenticationFailed ( false )
                this.smtpAuthenticationFailed ( false )
                if ( newValue.length ) {
                    this.passwordSuccess ( true )
                    this.iMapServerLoginPassword ( newValue )
                    this.smtpServerLoginPassword ( newValue )
                    return true
                }
                this.passwordSuccess ( false )
                this.imapDataEnited ( true )
            })

            this.iMapServerPortNumber.subscribe ( newValue => {
                this.iMapServerPortNumberError ( false )
                const num = parseInt ( newValue )
                if (! /^[0-9]*$/.test ( newValue ) || ! num || num <= 0 || num > 65535 ) {
                    this.iMapServerPortNumberError ( true )
                    $('.activating.element').popup({
                        on: 'focus',
                        movePopup: false
                    })
                }
                return

                
            })

            this.smtpServerPortNumber.subscribe ( newValue => {
                this.smtpServerPortNumberError ( false )
                const num = parseInt ( newValue )
                if ( ! /^[0-9]*$/.test ( newValue ) || ! num || num <= 0 || num > 65535 ) {
                    this.smtpServerPortNumberError ( true )
                    $('.activating.element').popup({
                        on: 'focus',
                        movePopup: false
                    })
                }
                return
            })
            
        }

        public getMailIcon = ko.computed (() => {
            let imapServer = null
            if ( ! ( imapServer = this.iMapServerName ()).length )
                return null
            const domain = imapServer.split ('@')
            if ( ! domain.length )
                return null
            if ( /\.me\.com$/i.test ( domain )) {
                return '/images/iCloud.svg'
            }
            if ( /\.yahoo\.com$/i.test ( domain )) {
                return '/images/Yahoo_Logo.svg'
            }

            if ( /\.aol\.com$/i.test( domain )) {
                return '/images/AOL_logo.svg'
            }

            if ( /\.outlook\.com$/i.test ( domain )) {
                return '/images/Outlook.com_logo_and_wordmark.svg'
            }
            if ( /\.gmx\.com$/i.test ( domain )) {
                return '/images/Gmx_email_logo_2.svg'
            }
            if ( /\.gmail\.com$/i.test ( domain )) {
                return '/images/Logo_Google_2013_Official.svg'
            }
            if ( /\.zoho\.com$/i.test ( domain ))
                return '/images/zoho-seeklogo.com.svg'
            return null
        })

        public fromIInputData ( data: IinputData ) {
            this.emailAddress ( data.email )
            this.password ( data.imapUserPassword )
            if ( this.imapPortArray.findIndex ( n => { return n === data.imapPortNumber}) !== -1 ) {
                this.imapPortChecked ( data.imapPortNumber )
            } else {
                this.imapPortChecked ( 'other' )
                this.iMapServerPortNumber ( data.imapPortNumber )
            }
            
            this.iMapServerName ( data.imapServer )
            this.iMapSecure ( data.imapSsl )
            this.uuid = data.uuid
            this.iMapServerLoginPassword ( data.imapUserPassword )
            this.iMapServerLoginName ( data.imapUserName )
            this.smtpServerLoginPassword ( data.smtpUserPassword )
            this.SmtpServerName ( data.smtpServer )
            this.SmtpServerLoginName ( data.smtpUserName )
            this.smtpSecure ( data.smtpSsl )
            this.imapIgnoreCertificate ( data.imapIgnoreCertificate )
            this.smtpIgnoreCertificate ( data.smtpIgnoreCertificate )
            if ( this.smtpPortArray.findIndex ( n => { return n === data.smtpPortNumber[0]}) !== -1 ) {
                this.smtpPortChecked ( data.smtpPortNumber[0] )
            } else {
                this.smtpPortChecked ( 'other' )
                this.smtpServerPortNumber ( data.smtpPortNumber[0] )
            }
            this.imapCheckOk ( data.imapCheck )
            this.imapCheckResult ( data.imapTestResult )
            this.smtpCheckOk ( data.smtpCheck )
            this.imapDataEditShow ( !data.imapTestResult ? true : false )
            this.imapDataEnited ( false )
            this.imapDeletebtn_view ( false )
            this.saved ( true )
            this.sendToQTGate ( data.sendToQTGate )
            this.canDoDelete ( data.canDoDelete )
            this.showDeleteArea ( false )
            this.dataRating ( data.imapTestResult < 500 ? 3 : data.imapTestResult < 1000 ? 2 : 1 )
        }

        private progressBarInterval: NodeJS.Timer

        public callBackError = ( ret ) => {
            clearTimeout ( this.doingProcessBarTime )
            this.imapCheckReturnError ( ret )
            if ( this.process )
                this.process.addClass( 'error' )
            $('.ImapDetailAccordionTitle').accordion()
            return $( '.activating.element' ).popup({
                on: 'click',
                movePopup: false,
                position:'left center',
                onHidden: () => {
                    if ( this.process ) {
                        this.process.removeClass( 'error' )
                    }
                    this.showImapSmtpdetailTreeView ( true )
                    this.imapCheckReturnError (0)
                    this.runningCheck ( false )
                    this.imapDataEditShow ( true )
                }
            })
        }

        public imapAccountGoCheckClick () {
            return imapAccountGoCheckClick ( this )
        }

        public cancelDoingCheck () {
            this.root.emailAddressDoingCheck ( false )
            this.emailAddressDoingCheck ( false )
            clearInterval ( this.progressBarInterval )
        }

        public imapEmailAddressClick () {
            //      do not show when ImapAccountConnected
            if ( this.ImapAccountConnected )
                return
                
            this.imapDataEditShow ( this.imapDataEditShow () )
        }

        public deleteClick () {
            const uu = $(`#${ this.uuid }`)
            uu.addClass ('ui blurring').find('.imapItemCardContent').addClass ('ui dimmer')
            uu.dimmer ('show')
            this.imapDeletebtn_view ( true )
            if ( this.root.emailPool().length < 1 ) {
                this.root.QTGateConnectActive ( false )
                this.root.QTGateConnectRegionActive ( false ) 
            }
        }

        public calcenDeteleClick () {
            $(`#${this.emailAddress()}`).dimmer( 'hide');
            this.imapDeletebtn_view ( false ) 
        }

        public calcelEdit () {
            if ( ! this.emailAddress().length ) {
                const index = this.root.emailPool().findIndex ( n => n.uuid === this.uuid )
                if ( index !== -1 ) 
                    this.root.emailPool.splice ( index, 1 )
                this.root.canShowAddAImapButton ()
            }
            this.imapDataEditShow ( false )
        }

        public deleteImap () {
            const index = this.root.emailPool().findIndex ( n => n.uuid === this.uuid )
            if ( index !== -1 )
                this.root.emailPool.splice ( index, 1 )
            this.imapDataEditShow ( false )
            socketIo.emit ( 'deleteImapAccount', this.uuid )
            if ( !this.root.emailPool().length )
                this.root.addANewImapData ( this.root )
            this.root.canShowAddAImapButton ()
        }

        public ImapDetailAccordionTitleClick () {
            this.edited = true
            const self = this
            const body = $( "html, body" )
            return body.stop().animate({ scrollTop: 0 }, 100, 'swing', () => { 
                return self.root.overflowShow ( true )
            })
        }
    }

	export class view {
        public overflowShow = ko.observable ( false )
        private MakeNotify ( note: string, _title: string, type: string, addNode: string, keepTime: number ) {
            const self = this
            const title = _title ? 'infoDefine [ self.languageIndex ()].error_message.' + _title : ''

            let detail = note ? `infoDefine [ self.languageIndex ()].error_message.${ note }` : null
                detail += addNode ? `<p>${ addNode }</p>`: ''
        }

        public MakeErrorNotify ( note: string, addNote: string ) {
            return this.MakeNotify ( note, 'errorNotifyTitle', 'alert', addNote, null )
        }

        private MakeInfoNotify ( note: string, addNote: string ) {
            return this.MakeNotify ( note, 'Success', 'success', addNote, 5000 )
        }

        private CancelCreateKeyPairSent = false
        public modalContent = ko.observable('')
        public menu = Menu
        public infoDefine = infoDefine
        public documentReady = ko.observable ( false )
		public tLang = ko.observable ( initLanguageCookie ())
        public languageIndex = ko.observable ( lang [ this.tLang() ])
        public systemSetup_systemPassword: KnockoutObservable < string > = ko.observable ( '' )
        public ImapErr = ko.observable ( false )
        public ImapAccountConnected = ko.observable ( false )
        public QTGateConnecting = ko.observable (-1)
        public conformTextErrorNumber = ko.observable (-1)
        public status: KnockoutObservable < systemViewStatus > = ko.observable ({
            SystemPassword_submitRunning: false
        })

        public topWindow = ko.observable ( true )

        public newVersionInstall () {
            this.newVersionInstallLoading ( true )
            return socketIo.emit ( 'newVersionInstall' )
        }



        // - new keyPair FORM manager
            public SystemAdministratorEmailAddress = ko.observable ( '' )
            public EmailAddressError = ko.observable ( false )
            public NickNameError = ko.observable ( false )
            public SystemAdministratorNickName = ko.observable ( '' )

            public keyPairLengthSelect = ko.observable ( '2048' )
            public SystemPassword_submitRunning = ko.observable ( false )
            public newKeyPairRunningCancelButtonShow = ko.observable ( false )
            public keyPairGenerateFormActive = ko.observable ( false )
            public delete_btn_view = ko.observable ( false )
            public showVersionUpdata = ko.observable ( true )
            public showInsideFireWallEmail = ko.observable ( false )
            public connectEmail = ko.observable ('')
            public showKeyPairInformation = ko.observable ( false )
            private doingProcessBarTime = null
        // - end FORM manager

        // - keyPair info manager
            public keyPair = ko.observable ( initKeyPair )
            public keyPair_delete_btn_view = ko.observable ( false )
            public keyPair_unLock_btn_view = ko.observable ( false )
            public keyPair_logoutPanel_view = ko.observable ( false )
            public logoutPanel_view = ko.observable ( false )
            public passwordError = ko.observable ( false )
            public passwordChecking = ko.observable ( false )
            public imapInputFormActive = ko.observable ( false )
            public showPasswordErrorMessage = ko.observable ( false )
            public conformFormShow = ko.observable ( false )
            public keyLengthInfoShow = ko.observable ( false )
            public showAddImapDataButton = ko.observable ( false )
            public QTGateRegions = ko.observableArray ( _QTGateRegions )
            public QTGateRegionsSetup = ko.observableArray ( QTGateRegionsSetup )
            public selectedQTGateRegion: KnockoutObservable <QTGateRegions> = ko.observable ( this.QTGateRegions()[0])
            public showSystemError = ko.observable ( false )
            public feed = ko.observableArray ([])
            
            public deletePasswordNext () {
                socketIo.emit ( 'deleteKeyPair' )
            }

        // - keyPair info manager
            public keyPairInfomationView = ko.observable ( false )
        // - linuxUpdate pages
            public linuxUpdateStep = ko.observable ( true )
            
        // - linuxUpdate pages
        // - IMAP email setup view
            public emailAddressDoingCheck = ko.observable ( false )
            public cancelImapConnect = ko.observable ( false )
            public emailPool: KnockoutObservableArray < emailPoolData > = ko.observableArray ([])
            public showQTGateImapAccount = ko.observable ( false )


        // - IMAP email setup view
        // - conformMailForm
            public checkActiveEmailError = ko.observable ( false )
            public conformText = ko.observable ('')
            public conformTextError = ko.observable ( false )
            public checkingActiveEmail = ko.observable ( false )
            public showConformMailForm = ko.observable ( false )
            public connectingImapAccount = ko.observable ( false )
            public QTGateConnectActive = ko.observable ( false )
            public QTGateConnectRegionActive = ko.observable ( false )
            public QTGateConnectError = ko.observable (0)
            public showTimeoutMessage = ko.observable ( false )
            public UserPermentShapeDetail = ko.observable ( false )

        //-
        //- QTGate connect
            public showSendIMAPToQTGateInfo = ko.observable ( false )
            public commandStatus = ko.observable ('')
            public QTGateRegionInfo = ko.observable ( false )

            public QTGateConnect_SelectTech = ko.observable(-1)
            public QTGateConnect1 = ko.observable ('')
            public QTGateMultipleGateway = ko.observable (1)
            public QTGateMultipleGatewayPool = ko.observableArray ([1,2,4])
            public QTGateConnect2 = ko.observable ( false )
            public QTGateConnectSelectImap = ko.observable (0)
            public QTGateAllData = ko.observable ( false )
            public QTGateCacheUse = ko.observable ( false )
            public QTGate_CacheTime = ko.observable (0)
            public QTGate_showDeleteCacheButton = ko.observable ( false )
            public QTGateLocalProxyPort = ko.observable (3001)
            public QTGateLoacalProxyPath = ko.observable (( Math.random() * 100000 ).toString() )
            public localProxyPortError = ko.observable ( false )
            public QTGateGatewayPortError = ko.observable ( false )
            public QTGateGatewayActive = ko.observable ( false )
            public QTGateGatewayActiveProcess = ko.observable ( false )
            public QTGateGatewayError = ko.observable ( -1 )
            public QTTransferData: KnockoutObservable < iTransferData > = ko.observable ( )
            public QTConnectData: KnockoutObservable < IConnectCommand > = ko.observable ( dummyIConnectCommand )
            public MenuItems = ko.observable ([ false, true, false, false, false ])
            public showKeyPairPorcess = ko.observable ( false )
            public showDisconnectbutton = ko.observable ( true )
            public ConnectGatewayShow = ko.observable ( false )
            public portNumberError = ko.observable ( false )
            public canDoAtEmail = ko.observable ( false )
            public reSendConnectMail = ko.observable ( false )
            public showRegionData = ko.observable ( false )
            public QTGateAccountPlan = ko.observable ()
            public QTGconnected = ko.observable ( false )

        //-
        //- Donate
            public donateDataPool = ko.observableArray ( donateArray )
        //-
        public config: KnockoutObservable < install_config> = ko.observable ({
            firstRun: true,
            alreadyInit: false,
            multiLogin: false,
            version: '',
            keypair: null,
            QTGateConnected: false,
            localConnectImapEmailName: null,
            needCheckEmail: false,
            localConnectImap: null,
            freeUser: null,
            account: null,
            imapConnectStatus: null,
            serverGlobalIpAddress: null,
            connectedImapDataUuid: null,
            serverPort: null,
            iterations: null,
            connectedQTGateServer: false,
            localIpAddress: null,
            lastConnectType: 1
        })

		constructor () {
            this.QTGateLocalProxyPort.subscribe ( newValue => {
                this.localProxyPortError ( false )
                const num = parseInt ( newValue.toString())
                if (! /^[0-9]*$/.test ( newValue.toString()) || !num || num < 1000 || num > 65535 ) {
                    this.localProxyPortError ( true )
                    return $( '.activating.element').popup({
                        on: 'focus',
                        movePopup: false
                    })
                }
                return socketIo.emit ( 'checkPort', newValue, err => {
                    return this.localProxyPortError ( err )
                })
            })

            this.cardExpirationYear.subscribe ( newValue => {
                this.clearPaymentError ()
                if ( ! newValue || ! newValue.length)
                    return
                if ( newValue.length < 7 )
                    return this.cardExpirationYearFolder_Error ( true )

                const now = new Date().getTime ()
                const value = new Date ( new Date ( '1/'+ newValue ).getTime() + oneDayTime ).getTime()
                if ( value - now > 0 )
                    return
                this.cardExpirationYearFolder_Error ( true )
            })

            this.cardNumber.subscribe ( newValue => {
                return this.clearPaymentError ()
            })

            this.cardPostcode.subscribe ( newValue => {
                return this.clearPaymentError ()
            })

            this.cardcvc.subscribe ( newValue => {
                return this.clearPaymentError ()
            })

            this.requestPortNumber.subscribe ( newValue => {
                this.QTGateGatewayPortError ( false )
                if ( newValue < 1 || newValue > 65535 ) {
                    this.QTGateGatewayPortError ( true )
                    return $( '.activating.element').popup ({
                        on: 'focus',
                        movePopup: false
                    })
                }
            })

            this.SystemAdministratorEmailAddress.subscribe ( newValue => {
                $ ('.ui.checkbox').checkbox()
                const email = newValue
                this.EmailAddressError ( false )
                this.NickNameError ( false )
                if ( !email.length )
                    return true
                if ( checkEmail ( email ).length ) {

                    this.EmailAddressError ( true )
                    $( '.activating.element').popup({
                        on: 'focus',
                        movePopup: false
                    })
                }

				
                if ( ! this.SystemAdministratorNickName ().length ){
                    this.SystemAdministratorNickName ( getNickName ( email ))
                }

                if ( insideChinaEmail.test ( email ) ) {
                    this.showInsideFireWallEmail ( true )
                }
                
                return true
                
            })

            this.systemSetup_systemPassword.subscribe ( newValue => {
                this.passwordError ( false )
                this.NickNameError ( false )
                this.showPasswordErrorMessage ( false )
                if ( ! newValue.length )
                    return
                if ( newValue.length < 5 ) {

                
                    this.showPasswordErrorMessage ( false )
                    $( '.activating.element').popup({
                        on: 'focus',
                        movePopup: false,
                        position: 'bottom'
                    })
                    return this.passwordError ( true )
                }
            })

            socketIo = io ({ reconnectionAttempts: 5, timeout: 1000 })

            socketIo.once ( 'connect', () => {
                return socketIo.emit ( 'init', ( err: Error, data: install_config ) => {
                    
                    this.config ( data )
                    if ( ! data.keypair.createDate )
                        this.keyPairGenerateFormActive ( true )
                    else
                        this.showKeyPairInformation ( true )
                    this.QTGateConnect1 ( data.lastConnectType ? data.lastConnectType.toString() : '1' )
                    this.keyPair ( data.keypair )
                    
                    return $( '.activating.element' ).popup({
                        on: 'focus',
                        position: 'bottom left',
                        
                    })
                })
            })

            socketIo.on ( 'newKeyPairCallBack', ( data: keypair ) => {
                
                if ( ! data ) {
                    if ( this.CancelCreateKeyPairSent )
                        return this.CancelCreateKeyPairSent = false
                    return this.MakeErrorNotify ( 'errorKeyPair', null )
                }
                this.keyPair ( data )
                this.showAddImapDataButton ( false )
                this.passwordError ( false )
                this.SystemPassword_submitRunning ( false )
                this.keyPair_delete_btn_view ( false )
                this.newKeyPairRunningCancelButtonShow ( false )
                this.showKeyPairPorcess ( false )
                this.showKeyPairInformation ( true )
                this.emailPool ( [ new emailPoolData ( this )] )
                this.imapInputFormActive ( true )
                return this.MenuItems ([ false, false, true, false, false ])
                
            })

            socketIo.on ( 'KeyPairActiveCallBack', ( data: keypair ) => {
                return this.keyPair ( data )
            })

            socketIo.on ( 'ImapData', ( data: IinputData[]) => {
                this.imapInputFormActive ( true )
                this.showQTGateImapAccount ( true )
                if ( ! data || ! data.length )
                    return
                this.emailPool ([])
                data.forEach ( n => {
                    const temp = new emailPoolData ( this )
                    temp.fromIInputData ( n )
                    this.emailPool.push ( temp )
                })
                const fromIInputData = $( '.rating' )
                fromIInputData.rating ( 'disable' )
                const index = this.emailPool().findIndex ( n => { return n.emailAddress ().length === 0 })
                if ( index < 0 ) {
                    return this.showAddImapDataButton ( true )
                }
                return this.showQTGateImapAccount ( false )
                    
            })

            socketIo.on ( 'deleteKeyPair', () => {
                return window.location.replace ('/')
            })

            socketIo.on ( 'config', config => {
                return this.config( config ) 
            })

            socketIo.on ( 'checkActiveEmailError', err => {
                if ( err !== null && err > -1 ) {
                    if ( err === 9 ) {
                        //      err = 3     password have not match from QTGate system
                        //      err = 4     unformat data from QTGate system
                        //      err = 6     QTGate connect pair timeout from server.js
                        this.modalContent ( infoDefine[ this.languageIndex() ].emailConform.formatError [ err ] )
                        return $( '.ui.basic.modal').modal('setting', 'closable', false).modal ( 'show' )
                    }
                    this.conformTextError ( true )
                    this.conformTextErrorNumber ( err )
                    this.QTGateConnecting ( 2 )
                    return $( '.activating.element1' ).popup({
                        on: 'click',
                        position: 'left center',
                        target: '#SendToQTGateTextArea',
                        onHidden: () => {
                            this.conformTextError ( false )
                        }
                    })
                }
                return this.QTGateConnecting ( 4 )
                
            })

            
            socketIo.on ( 'qtGateConnect', ( data: IQtgateConnect ) => {
                return this.qtGateConnectEvent111 ( data )
                
            })
            
            socketIo.once ( 'reconnect_error', err => {
                if ( this.modalContent().length )
                    return
                this.modalContent ( infoDefine[ this.languageIndex() ].emailConform.formatError [ 10 ] )
                return $( '.ui.basic.modal').modal ('setting', 'closable', false).modal ( 'show' )
            })


            socketIo.on ( 'QTGateGatewayConnectRequest', ( err, data ) => {
                return this.QTGateGatewayConnectRequestCallBack ( err, data )
            })

            socketIo.on ( 'pingCheck', ( region: string, ping: number ) => {
                return this.pingCheckReturn ( region, ping )
            })
        }

        public showBrokenHeart () {
            return $( '.ui.basic.modal').modal ('setting', 'closable', false ).modal ( 'show' )
        }
        public showSendImapDataConfirm = ko.observable ( false )

        private showAppWindows () {
            
            this.menuClick ( 9, true )
            $('.dimmable').dimmer ({ on: 'hover' })
            return $('.comeSoon').popup ()
        }

        private qtGateConnectEvent111 (  data: IQtgateConnect ) {

            //     reset show send request mail need more time
            this.connectQTGateShow ( false )
            //      have no imap data
            if ( ! data ) {
                //      show imap manager area
                this.menuClick ( 2, true )
                return this.QTGateConnectActive ( false )
            }
            this.sendConnectRequestMail ( false )
            this.reSendConnectMail ( false )
            this.menuClick ( 3, true )
            this.QTGateConnectActive ( !this.keyPair().verified )
            this.QTGateConnectRegionActive ( this.keyPair().verified )
            //      progress bar area
            this.QTGateRegionInfo ( this.keyPair().verified )

            if ( data && data.qtgateConnectImapAccount && data.qtgateConnectImapAccount.length ) {
                const uu = this.emailPool().findIndex ( n => { return n.uuid === data.qtgateConnectImapAccount })
                this.QTGateConnectSelectImap ( uu )
            }
            const imapData = this.QTGateConnecting ( this.QTGateConnectSelectImap ())
            this.QTGateConnecting ( data.qtGateConnecting )
            
            switch ( data.qtGateConnecting ) {

                //          show send imap data 
                case 0: {

                    this.QTGateRegionInfo ( false )
                    this.reSendConnectMail ( true )
                    return this.showSendImapDataConfirm ( true )
                }

                //          show send request mail need more time
                case 6: {
                    this.sendConnectRequestMail( true )
                    return this.connectQTGateShow ( true )
                }

                //          connecting finished
                case 2: {
                    this.QTGateRegionInfo ( true )
                    this.QTGconnected ( true )
                    this.stopGetRegionProcessBar ()
                    if ( this.keyPair().verified ) {
                        return this.showAppWindows ()
                    }
                        
                    return 
                }

                case 3: {
                    return 
                }

                case 1: {
                    if ( this.keyPair().verified ) {
                        this.showSendImapDataConfirm ( false )
                        this.showGetRegionProcessBarStart ()
                    }
                    return 
                }

                //      QTGate connecting disconnect
                case 11: {
                    this.stopGetRegionProcessBar()
                    return this.showTimeoutMessage ( true )
                }

                default : {
                    return alert ( `switch data.qtGateConnecting goto default! data.qtGateConnecting = [${ data.qtGateConnecting }]`)
                }
            }
        }

        private stopGetRegionProcessBar () {
            const process = $ ( '#connectImformationProcess' )
            clearTimeout ( this.doingProcessBarTime )
            process.progress ( 'reset' )
            this.showConnectImformationProcess ( false )
        }

        private showActiveAccountForm () {
            this.menuClick ( 3, true )
            return this.imapInputFormActive ( false )
        }

        private showWillSendImapInfoEmailToQTGateComfirm () {
            this.showActiveAccountForm ()
            
        }

        private percent = 0
        public showConnectImformationProcess = ko.observable ( false )
        private showGetRegionProcessBarStart () {

            const process = $ ( '#connectImformationProcess' )
            const doingProcessBar = () => {
                clearTimeout ( this.doingProcessBarTime )
                this.doingProcessBarTime = setTimeout (() => {
                    process.progress ({
                        percent: ++ this.percent
                    })
                    if ( this.percent < 100 )
                        return doingProcessBar ()
                }, 1000 )
            }
            this.menuClick ( 9, true )
            this.showConnectImformationProcess ( true )
            return doingProcessBar()
        }

        private showSentImapMail_waitingConnecting () {
            this.showActiveAccountForm ()
            this.showTimeoutMessage ( false )
            
            if ( this.keyPair().verified )
                return this.sendConnectRequestMail ( true )
            return this.connectQTGateShow ( true )
        }

        public sendConnectRequestMail = ko.observable (false)
        public QTGateRegionERROR = ko.observable (-1 )
        public LocalLanguage = 'up'
        public showActiveMail = ko.observable ( false )

		public selectItem = ( that: any, site: () => number ) => {

            const self = this
            const tindex = lang [ self.tLang ()]
            let index =  tindex + 1
            if ( index > 3 ) {
                index = 0
            }

            self.languageIndex ( index )
            self.tLang( lang [ index ])
            $.cookie ( 'langEH', self.tLang(), { expires: 180, path: '/' })
            const obj = $( "span[ve-data-bind]" )
            
            obj.each (( index, element ) => {
                const self = this
                const ele = $( element )
                const data = ele.attr ( 've-data-bind' )
                if ( data && data.length ) {
                    ele.text ( eval ( data ))
                }
            })
            
            $('.languageText').shape ( 'flip ' + this.LocalLanguage )
            return $('.KnockoutAnimation').transition('jiggle')
        }
        
        public showMainScreen () {
           
            $( '.mainScreen').addClass ( 'animated slideInRight' ).show().one ( animationEnd, () => {
                $( '.mainScreen' ).removeClass ( 'animated slideInRight' )
                $( '.mainScreen1' ).animate({
                    opacity: "show"
                  }, 800 )
                const body = $( "html, body" )
                return body.stop().animate({ scrollTop: 0 }, 100, 'swing', () => {})
            })
            return socketIo.emit ( 'agree', () => {
                const kk = this.config()
                kk.firstRun = false
                return this.config ( kk )
            })
        }

        public agreeClick () {
            $( '#cover1' ).remove ()
            this.overflowShow ( false )
            $ ( '#firstNode' ).addClass ( 'animated slideOutLeft' ).one ( animationEnd, () => {
                $ ( '#firstNode' ).removeClass ( 'animated slideOutLeft' ).hide ()
                
            })
            
            return this.showMainScreen ()

        }

        public tileClick ( data: string ) {
            const self = this
            self.keyPairLengthSelect ( data )
            return true
        }

        private showMainScreenBackOverflowShow = null

        public showFeedBackWin() {
            $( '.mainScreen').hide ()
            $( '#feedBackView').addClass ( 'animated bounceIn' ).show().one ( animationEnd, () => {
                $( '#feedBackView' ).removeClass ( 'animated bounceIn' )
            })
            this.showMainScreenBackOverflowShow = this.overflowShow()
            this.overflowShow ( true )
        }

        public returnMainWin ( winName: string ) {
            $( winName ).hide()
            
            $( '.mainScreen').animate({
                opacity: "show"
              }, 800 )
            const body = $("html, body")
            return body.stop().animate({ scrollTop: 0 }, 100, 'swing', () => { 
                return this.overflowShow ( this.showMainScreenBackOverflowShow )
            })

        }

        public showUserInfoMacOS ( view: string, _self: view ) {
            $('.mainScreen').hide ()
            $( view).animate({
                opacity: "show"
              }, 800 )
            _self.showMainScreenBackOverflowShow = _self.overflowShow()
            _self.overflowShow ( true )
        }
        
        public feedBackAttachImg = ko.observable ('')
        public feedBackAttachImgPath = ko.observable ('')
        public attachedLog = ko.observable ('')

        public feedBackTextArea = ko.observable ('')
        public hacked = ko.observable ( false )
        public UserPermentShape = ko.observable ( false )

        public takeScreen () {
            return socketIo.emit ('takeScreen', ( err, img ) => {
                if ( err ) {
                    return alert ( err.message )
                }
                this.feedBackAttachImg ( img.screenshotUrl )
                this.showFeedBackWin ()

                this.attachedLog ()
                return this.feedBackAttachImgPath ( img.screenshotSavePath )
            })
        }

        public feedBackSuccess () {
            this.returnMainWin ('#feedBackView')
            
            const data: feedBackData = {
                attachedLog: this.attachedLog(),
                attachImagePath: this.feedBackAttachImgPath (),
                comment: this.feedBackTextArea(),
                date: new Date ().toISOString ()
            }
            return socketIo.emit ('feedBackSuccess', data )
           
            
        }

        public openFeedBackAttachImg() {
            const { shell } = require ( 'electron' )
            return shell.openExternal (`file://${ this.feedBackAttachImgPath()}`)
        }

        public openFeedBackAttachLog () {
            const Fs = require ('fs')
            const path = require ( 'path' )
            const Os = require ('os')
            const QTGateFolder = path.join ( Os.homedir(), '.QTGate/systemError.log' )
            return Fs.readFile ( QTGateFolder, 'utf8', ( err, data: string ) => {
                if ( err )
                    return
                const u = data.split ('\n')
                const uuu = '<p>' + u.join ('</p><p>') + '</p>'

                this.attachedLog ( uuu )

            })
        }

        public CancelCreateKeyPair () {
            socketIo.emit ( 'CancelCreateKeyPair' )
            clearTimeout ( this.doingProcessBarTime )
            this.SystemPassword_submitRunning ( false )
            this.newKeyPairRunningCancelButtonShow ( false )
            this.showKeyPairInformation ( false )
            this.keyPairGenerateFormActive ( true )
            this.showKeyPairPorcess ( false )
            return this.CancelCreateKeyPairSent = true
        }

        public canShowAddAImapButton () {
            const index = this.emailPool().findIndex ( n => { return n.emailAddress ().length === 0 })
            if ( index === -1 ) {
                return this.showAddImapDataButton ( true )
            }
            return this.showAddImapDataButton ( false )
        }

        public addANewImapData ( _self ) {
            
            const index = _self.emailPool().findIndex ( n => { return n.emailAddress ().length === 0 })
            if ( index === -1 ) {
                const temp = new emailPoolData ( _self )
                _self.emailPool.push ( temp )
                _self.showAddImapDataButton ( false )
            }
            
        }

        public form_AdministratorEmail_submit () {

            //self.SystemEmailErrorItem ( '' )
            this.EmailAddressError ( false )
            this.passwordError ( false )
            this.NickNameError ( false )
            let email = this.SystemAdministratorEmailAddress ()
            
          
            //   check email
            
            if ( checkEmail ( email ).length ) {
                this.EmailAddressError ( true )
                
                
            }
            //    check nick name
            if (! this.SystemAdministratorNickName ().length ){
                this.NickNameError ( true )
                
            }
            
            //    check password
            if ( this.systemSetup_systemPassword ().length < 5 ) {
                this.passwordError ( true )
                
            }
            if ( this.passwordError () || this.EmailAddressError () || this.passwordError ()) {
                $('.activating.element').popup({
                    on: 'focus',
                    movePopup: false
                })
                return true
            }
                

            this.SystemPassword_submitRunning ( true )
            this.newKeyPairRunningCancelButtonShow ( true )
            this.delete_btn_view ( false )
            this.keyPairGenerateFormActive ( false ) 
            const sendData: INewKeyPair = {
                password: this.systemSetup_systemPassword (),
                keyLength: this.keyPairLengthSelect (),
                nikeName: this.SystemAdministratorNickName (),
                email: email
            }

            const callBack = ( err?: Error ) => {
                this.SystemPassword_submitRunning ( false )
                this.newKeyPairRunningCancelButtonShow ( false )
                $('.ui.accordion').accordion('refresh')
                //$.cookie ( passwdCookieName, this.systemSetup_systemPassword ())
                if ( err )
                        this.MakeErrorNotify ( 'finishedKeyPair', err.message )
                    else
                        this.MakeInfoNotify ( 'finishedKeyPair', null )
                
            }
            let percent = 1
            $('.keyPairProcessBar').progress ('reset')
            const timeSet = parseInt ( sendData.keyLength ) * 0.2
            const doingProcessBar = () => {
                clearTimeout ( this.doingProcessBarTime )
                this.doingProcessBarTime = setTimeout (() => {
                    $('.keyPairProcessBar').progress ({
                        percent: ++ percent
                    })
                    if ( percent < 100 )
                        return doingProcessBar ()
                }, timeSet )
            }
            doingProcessBar ()
            this.showKeyPairPorcess ( true )
            $.removeCookie ( passwdCookieName )

            socketIo.emit ( 'NewKeyPair', sendData ) 

            return false       //    ！！！！，Page will reflash if return true;
            
        }

        public startClick () {
            $('.ui.accordion').accordion()
            $('.ui.checkbox').checkbox()
            $ ( '.languageItem' ).removeClass ( 'languageTextCoverColor')
            this.overflowShow ( false )
            $ ( '#cover1' ).addClass ('animated slideOutLeft').one ( animationEnd, () => {
                setTimeout (() => {
                    if ( ! this.config().firstRun ) {
                        return $( '#cover1' ).remove ()
                    }
                    return $( '#cover1' ).removeClass ( 'animated slideOutLeft' )
                }, 2000 )
                
            })
            if ( this.config().firstRun )
                return $( '#firstNode').addClass ( 'animated slideInRight' ).show().one ( animationEnd, () => {
                    this.overflowShow ( true )
                    $( '#firstNode' ).removeClass ( 'animated slideInRight' )
                })
            return this.showMainScreen ()
        }

        public disAgreeClick () {
            $ ( '.languageItem' ).addClass ( 'languageTextCoverColor' )
            
            $ ( '#cover1' ).show().addClass ( 'animated slideInLeft' ).one ( animationEnd, () => {
                $ ( '#cover1' ).removeClass ( 'animated slideInLeft' ).show()
            })
            $ ( '#firstNode' ).addClass ( 'animated slideOutRight' ).one ( animationEnd, () => {
                $ ( '#firstNode' ).removeClass ( 'animated slideOutRight' ).hide ()
            })
        }

        public UserPerment = ko.observable ( false )

        public keyPair_checkPemPasswordClick () {
            this.passwordError ( false )
            this.showSystemError ( false )
            this.keyPair_delete_btn_view ( false)
            this.keyPair_unLock_btn_view ( false )
            this.passwordChecking ( true )
            this.showPasswordErrorMessage ( false )
            const password = this.systemSetup_systemPassword ()
            this.commandStatus('checkActiveEmailSubmit')
            socketIo.emit ( 'checkPemPassword', password, ( data: keypair, iinputData: IinputData[] ) => {
                this.passwordChecking ( false )
                this.showQTGateImapAccount( true )
                if ( typeof data !== 'boolean' ) {
                    this.showSystemError ( true )
                    return true
                }
                
                if ( data ) {
                    const key = this.keyPair()
                    key.passwordOK = true

                    this.keyPair( key )
                    this.imapInputFormActive ( true )
                    this.MenuItems([false, false, true, false ])
                    if ( ! iinputData || ! iinputData.length ) {
                        return this.emailPool ([ new emailPoolData ( this ) ])
                    }
                    

                    iinputData.forEach ( n => {
                        const emailPool = new emailPoolData ( this )
                        emailPool.fromIInputData ( n )
                        
                        this.emailPool.push ( emailPool )
                        const fromIInputData = $( '.rating' )
                        fromIInputData.rating ('disable')
                        
                    })
                    if ( this.emailPool().length > 1 ) {
                        this.showQTGateImapAccount( false )
                    }
                    this.canShowAddAImapButton ()
                    /*
                    const index = this.emailPool().findIndex ( n => { return n.sendToQTGate()})
                    if ( index < 0 ) {
                        return this.qtgateImapAccount ( 0 )
                    }
                    this.emailPool()[0].emailAddress
                    
                    return this.qtgateImapAccount ( index )
                    */
                }
                
                this.showPasswordErrorMessage ( true )
                $( '.activating.element' ).popup({
                    on: 'focus',
                    movePopup: false
                })
                return true

            })
        }

        public showPlanetElement ( elem ) { 
            if ( elem.nodeType === 1 )
                $ (elem).hide().slideDown() 
        }

        public hidePlanetElement ( elem ) { 
            if ( elem.nodeType === 1) 
                $(elem).slideUp(() => { 
                    $(elem).remove(); 
                }) 
        }

        public conformButtom = ko.computed (() => {
            this.conformTextError ( false )
            const text = this.conformText ()
            if ( ! text.length )
                return false
            return true
        })

        public checkActiveEmailSubmit () {
            this.checkActiveEmailError ( false )
            this.checkingActiveEmail ( true )
            this.QTGateConnecting ( 4 )
            let text = this.conformText ()
            //      Outlook Mail 
            
            return socketIo.emit ( 'checkActiveEmailSubmit', text )

        }

        public connectQTGateShow = ko.observable ( false )
        /*
        public connectQTGate () {
            //this.connectQTGateShow ( true )
            //this.QTGateConnecting ( 1 )
            socketIo.emit ( 'connectQTGate1', this.emailPool()[ this.QTGateConnectSelectImap() ].uuid )
        }
        */
        public connectQTGate1 () {
            this.showTimeoutMessage ( false )
            this.showActiveMail ( false )
            this.showSendImapDataConfirm ( false )
            this.showGetRegionProcessBarStart ()
            socketIo.emit ( 'connectQTGate1', this.emailPool()[ this.QTGateConnectSelectImap() ].uuid )
        }

        public selectedQTGateRegionCancel () {

            this.selectedQTGateRegion().selected ( false )
            this.selectedQTGateRegion().showExtraContent ( false )
            this.ConnectGatewayShow ( false )
            this.QTGateConnectRegionActive( true )
            this.menuClick ( 3, true )
            return false
        }

        public QTGateRegionCardClick ( index: number ) {
            
            const uu = this.QTGateRegions()[ index ]
            uu.selected ( true )
            this.selectedQTGateRegion ( uu )
            uu.showExtraContent ( true )
            this.ConnectGatewayShow ( true )
            const body = $( "html, body" )
            body.stop().animate ({ scrollTop: 0 }, 100, 'swing', () => { 
                return this.overflowShow ( true )
            })
            return $('.popupField').popup({
                on:'click',
                position: 'bottom center',
            })
        }

        public menuClick ( index: number, scroll: boolean ) {
            const uu = new Array (8).fill ( false )
            uu[index] = true
            this.UserPerment ( false )
            this.MenuItems ( uu )
            const body = $( "html, body" )
            return body.stop().animate({ scrollTop: 0 }, 100, 'swing', () => { 
                return this.overflowShow ( scroll )
            })
           
        }

        public QTGateConnect1Click (em) {
            const uu = $( em ).val ()
            this.QTGateConnect1 ( uu.toString ())
        }

        public requestPortNumber= ko.observable (80)

        public QTGateGatewayConnectRequest () {
            const data = this.selectedQTGateRegion ()
            return socketIo.emit ( 'checkPort', this.QTGateLocalProxyPort(), err => {
                if ( err ) {
                    return this.localProxyPortError ( err )
                }
                const connect: IConnectCommand = {
                    account: this.config().account,
                    imapData: this.emailPool()[this.QTGateConnectSelectImap()].GetImapData(),
                    gateWayIpAddress: null,
                    region: data.qtRegion,
                    connectType: this.QTGateConnect1() === '1' ? 2 : 1,
                    localServerPort: this.QTGateLocalProxyPort(),
                    AllDataToGateway: !this.QTGateConnect2 (),
                    error: null,
                    fingerprint: null,
                    localServerIp: null,
                    multipleGateway: [],
                    requestPortNumber: this.requestPortNumber (),
                    requestMultipleGateway: this.QTGateMultipleGateway()
                    
                }
                
                data.error ( -1 )
                //root.QTGateConnectRegionActive ( false )
                //root.QTGateGatewayActiveProcess ( true )
    
                const process = $('.regionConnectProcessBar').progress('reset')
                clearTimeout ( this.doingProcessBarTime )
                this.percent = 0
                const doingProcessBar = () => {
                    clearTimeout ( this.doingProcessBarTime )
                    this.doingProcessBarTime = setTimeout(() => {
                        process.progress ({
                            percent: ++ this.percent
                        })
                        if ( this.percent < 100 )
                            return doingProcessBar()
                    }, 1000 )
                }
    
                doingProcessBar()
                data.showExtraContent ( false )
                data.showRegionConnectProcessBar ( true )
                
                socketIo.emit( 'QTGateGatewayConnectRequest', connect, ( err, _data: IConnectCommand[] ) => {
                    return this.QTGateGatewayConnectRequestCallBack ( err, _data  )
                })
                return false
            })
            

        }

        private QTGateGatewayConnectRequestCallBack ( error, connectCommand: IConnectCommand[] ) {
            clearTimeout ( this.doingProcessBarTime )
            const selectedQTGateRegion = this.selectedQTGateRegion ()
            selectedQTGateRegion.showRegionConnectProcessBar ( false )
            if ( error > -1 ) {
                selectedQTGateRegion.showExtraContent ( true )
                //this.QTGateConnectRegionActive ( true )
                //this.QTGateGatewayActiveProcess ( false )
                selectedQTGateRegion.error ( error )
                return this.menuClick ( 3, true )
            }
            const data1 = connectCommand[0]
            if ( data1 ) {
                this.QTTransferData ( data1.transferData )
                this.QTConnectData ( data1 )
                const index = this.QTGateRegions().findIndex (( n: QTGateRegions ) => { return n.qtRegion === data1.region })
                if ( index < 0 ) {
                    return
                }
                const data = this.QTGateRegions()[ index ]
                this.selectedQTGateRegion ( data )
                data.selected ( true )
                data.showExtraContent ( false )
                data.available ( true )
                this.config().freeUser = /free/.test( data1.transferData.productionPackage ) ? true : false
                this.config(this.config())
                
                $( '.userDetail' ).progress()
                this.QTGateConnectRegionActive ( true )
                this.menuClick ( 3, false )
                
                this.ConnectGatewayShow ( true )
                return data.showConnectedArea ( true )
            }
            
            
           

        }

        public disconnecting = ko.observable ( false )
        
        private getAvaliableRegionCallBack ( region: string [], dataTransfer: iTransferData, config: install_config ) {
            this.QTGateRegions().forEach( n => {
                const index = region.findIndex ( nn => { return nn === n.qtRegion })
                if ( index < 0 )
                    return n.available( false )
                return n.available ( true )
            })
            this.QTGateRegions.sort (( a, b ) => { 
                if ( a.available() === b.available() )  
                    return 0
                if ( b.available() && !a.available() ) {
                    return 1
                }
                return -1
            })
            const uu = checkCanDoAtQTGate ( this.emailPool )
            if ( uu > -1 ) {
                this.QTGateConnectSelectImap ( uu )
                this.canDoAtEmail ( true )
                this.showQTGateImapAccount ( false )
            } else {
                this.QTGateConnectSelectImap (0)
            }
            
            $ ('.ui.dropdown').dropdown()
            this.QTTransferData ( dataTransfer )
            this.config ( config )
            this.showRegionData ( true )
            this.QTGateRegionInfo ( false )
            this.pingCheckLoading( false )
            return clearTimeout ( this.doingProcessBarTime )
        }

        public getAvaliableRegion () {
            if ( this.pingCheckLoading ( )) {
                return
            }
            this.pingCheckLoading ( true )
            this.showRegionData ( false )
            socketIo.emit ( 'getAvaliableRegion', ( region: string [], dataTransfer: iTransferData, config: install_config ) => {
                if ( region && region.length )
                    return this.getAvaliableRegionCallBack ( region, dataTransfer, config )
            })
        }

        private desconnectCallBack () {
            this.selectedQTGateRegion().showConnectedArea( false )
            this.ConnectGatewayShow ( false )
            this.selectedQTGateRegionCancel () 
            this.disconnecting ( false )
            return this.getAvaliableRegion ()
        }

        public getCurrentPlan = ko.computed (() => {
            if ( !this.QTTransferData())
                return null
            return planArray[ planArray.findIndex ( n => {
                return n.name === this.QTTransferData().productionPackage
            })]
        })

        public getPaymentPlan = ko.computed(() => {
            if ( !this.QTGateAccountPlan())
                return null
            return planArray[ planArray.findIndex ( n => {
                return n.name === this.QTGateAccountPlan()
            })]
        })

       
        public getNextPlanArray = ko.computed (() => {
            if ( ! this.QTTransferData())
                return ko.observableArray([])
            const index = planArray.findIndex ( n => {
                return n.name === this.QTTransferData().productionPackage
            })
            return ko.observableArray(planArray.slice( index+1 ))
        })

        public getBackPlanArray = ko.computed (() => {
            if ( !this.QTTransferData())
                return ko.observableArray([])
            const index =  planArray.findIndex ( n => {
                return n.name === this.QTTransferData().productionPackage
            })
            return ko.observableArray( planArray.slice( 0, index ))
        })
  
        public disconnectClick () {
            this.disconnecting ( true )

            socketIo.once ( 'disconnectClickCallBack', () => {
                return this.desconnectCallBack ()
            })
            return socketIo.emit ( 'disconnectClick')
        }

        public newVersionInstallLoading = ko.observable ( false )

        public exit () {
            if ( typeof require === 'undefined') {
                this.modalContent ( infoDefine[ this.languageIndex() ].emailConform.formatError [ 11 ] )
                return this.hacked ( true )
            }
            const { remote } = require ('electron')
            return remote.app.quit()
        }

        public pingCheckLoading = ko.observable ( false )
        public pingError = ko.observable ( false )

        public pingCheck () {
            if ( this.pingCheckLoading()) {
                return
            }
            this.pingCheckLoading ( true )
            this.QTGateRegions().forEach ( n => {
                if ( !n.available())
                    return
                return n.ping ( -1 )
            })
            return socketIo.emit ( 'pingCheck', CallBack => {
                this.pingCheckLoading ( false )
                if ( CallBack === -1 ) {
                    this.QTGateRegions().forEach ( n => {
                        n.ping ( -2 )
                    })
                    return this.pingError ( true )
                }
                return this.QTGateRegions.sort (( a, b ) => {
                    const _a = a.ping()
                    const _b = b.ping()
                    if ( a.available() === b.available()) {
                        if ( !a.available ())
                            return 0
                        if ( _b > 0 && _a > _b )
                            return 1
                        return -1
                    }  
                        
                    if ( b.available() && !a.available() ) {
                        return 1
                    }
                    return -1
                })
                
            })
        }

        public downloadCheck () {
           return socketIo.emit ( 'downloadCheck')
        }

        public pingCheckReturn ( region: string, ping: number ) {
            const index = this.QTGateRegions().findIndex ( n => { return n.qtRegion === region })
            if ( index < 0 )
                return
            const _reg = this.QTGateRegions()[index]
            if ( !_reg.available )
                return
            _reg.ping ( ping )
            const fromIInputData = $(`#card-${ _reg.qtRegion.replace('.','-')}`)
            const uu = ping
            const _ping = Math.round((500 - ping)/100)

            fromIInputData.rating ({
                initialRating: _ping > 0 ? _ping : 0
            }).rating('disable')
        }

        public appPassword ( imapServer: string ) {
            
            const { shell } = require ( 'electron' )
            let url = ''
            switch ( imapServer ) {
                
                case 'imap.gmx.com' : {
                    url = 'https://support.gmx.com/pop-imap/toggle.html'
                    break
                }
                case 'imap.mail.yahoo.com': {
                    switch ( this.languageIndex() ) {
                        case 0: {
                            url = 'https://tw.help.yahoo.com/kb/account/%E7%94%A2%E7%94%9F%E7%AC%AC%E4%B8%89%E6%96%B9%E6%87%89%E7%94%A8%E7%A8%8B%E5%BC%8F%E5%AF%86%E7%A2%BC-sln15241.html?impressions=true'
                            break
                        }
                        case 3: {
                            url = 'https://tw.help.yahoo.com/kb/account/%E7%94%A2%E7%94%9F%E7%AC%AC%E4%B8%89%E6%96%B9%E6%87%89%E7%94%A8%E7%A8%8B%E5%BC%8F%E5%AF%86%E7%A2%BC-sln15241.html?impressions=true'
                            break
                        }
                        case 1:
                        case 2:
                        default: {
                            url = `https://help.yahoo.com/kb/account/create-third-party-password-sln15241.html`
                            break
                        }
                    }
                    break
                }
                case 'imap-mail.outlook.com': {
                    switch ( this.languageIndex() ) {
                        case 0: {
                            url = 'https://support.office.com/zh-cn/article/%E4%B8%BA-Office-365-%E5%88%9B%E5%BB%BA%E5%BA%94%E7%94%A8%E5%AF%86%E7%A0%81-3e7c860f-bda4-4441-a618-b53953ee1183?omkt=zh-CN&ui=zh-CN&rs=zh-CN&ad=CN'
                            break
                        }
                        case 3: {
                            url = 'https://support.office.com/zh-tw/article/%E7%82%BA-Office-365-%E5%BB%BA%E7%AB%8B-App-%E5%AF%86%E7%A2%BC-3e7c860f-bda4-4441-a618-b53953ee1183?omkt=zh-TW&ui=zh-TW&rs=zh-TW&ad=TW'
                            break
                        }
                        case 1: {
                            url = 'https://support.office.com/ja-jp/article/Office-365-%E3%81%AE%E3%82%A2%E3%83%97%E3%83%AA-%E3%83%91%E3%82%B9%E3%83%AF%E3%83%BC%E3%83%89%E3%82%92%E4%BD%9C%E6%88%90%E3%81%99%E3%82%8B-3e7c860f-bda4-4441-a618-b53953ee1183?omkt=ja-JP&ui=ja-JP&rs=ja-JP&ad=JP'
                            break
                        }
                        case 2:
                        default: {
                            url = `https://support.office.com/en-us/article/Create-an-app-password-for-Office-365-3e7c860f-bda4-4441-a618-b53953ee1183`
                            break
                        }
                    }
                    break
                }
                case 'imap.gmail.com' : {
                    switch ( this.languageIndex() ) {
                        case 0: {
                            url = 'https://support.google.com/accounts/answer/185833?hl=zh-Hans'
                            break
                        }
                        case 3: {
                            url = 'https://support.google.com/accounts/answer/185833?hl=zh-Hant'
                            break
                        }
                        case 2: {
                            url = 'https://support.google.com/accounts/answer/185833?hl=ja'
                            break
                        }
                        case 1:
                        default: {
                            url = `https://support.google.com/accounts/answer/185833?hl=en`
                            break
                        }
                    }
                    break
                }

                case 'imap.zoho.com': {
                    url= 'https://www.zoho.com/mail/help/imap-access.html#EnableIMAP'
                    break
                }

                default:
                case 'imap.mail.me.com' : {
                    switch ( this.languageIndex() ) {
                        case 0: {
                            url = 'https://support.apple.com/zh-cn/HT204397'
                            break
                        }
                        case 1:
                            url = 'https://support.apple.com/ja-jp/HT204397'
                            break
                        case 3: {
                            url = 'https://support.apple.com/zh-tw/HT204397'
                            break
                        }
                        case 2:
                        default: {
                            url = `https://support.apple.com/en-ca/HT204397`
                            break
                        }
                    }
                    break
                }
                
            }
            event.preventDefault ()
            shell.openExternal ( url )
        }

        public haveQTGateImapAccount = ko.computed (() => {
            const index = this.emailPool ().findIndex ( n => { return availableImapServer.test ( n.iMapServerName()) })
            return index > -1
        })

        public requestActivEmailrunning = ko.observable ( false )
        public showSentActivEmail = ko.observable (-1)

        public requestActivEmail () {
            this.requestActivEmailrunning ( true )
            this.showSentActivEmail (-1)
            return socketIo.emit ( 'requestActivEmail', CallBack => {
                this.requestActivEmailrunning ( false )
                if ( CallBack < 0 ){
                    return this.showSentActivEmail (1)
                }
                return this.showSentActivEmail (CallBack)
            })
        }

        private clearPaymentError () {
            this.cardNumberFolder_Error ( false )
            this.cvcNumber_Error ( false )
            this.postcode_Error ( false )
            this.cardPayment_Error ( false )
            this.paymentDataFormat_Error ( false )
            this.promoInputError ( false )
            return this.paymentCardFailed ( false )
        }

        public showStripeError = ko.observable ( false )
        public cardType = ko.observable ('')
        private tokenId = null

        private clearAllPaymentErrorTimeUP () {
            return setTimeout (() => {
                //this.showSuccessPayment ( false )
                //this.showCancelSuccess ( false )
                return this.clearPaymentError ()
            }, 5000 )
        }

        private paymentCallBackFromQTGate ( err, data: QTGateAPIRequestCommand ) {
            this.stopShowWaitPaymentFinished ()
                if ( err ) {
                    return this.showBrokenHeart()
                }
                if ( data.error === -1 ) {
                    this.paymentSelect ( false )
                    data.command === 'cancelPlan' ? this.showCancelSuccess ( true ) : this.showSuccessPayment ( true )
                    if ( data.command === 'cancelPlan' && data.Args[1]) {
                        this.cancel_Amount ( data.Args[1])
                    }
                    this.config().freeUser = false
                    const dataTrans: iTransferData = data.Args[0]

                    this.QTTransferData ( dataTrans )
                    this.config().freeUser = false
                    this.config ( this.config ())
                    
                    return this.UserPermentShapeDetail ( false )
                }
                
                const errMessage = data.Args[0]
                if ( data.error === 0 ) {
                    this.paymentSelect ( true )
                    return this.paymentDataFormat_Error ( true )
                }
                    
                if ( /expiration/i.test ( errMessage )) {
                    return this.cardExpirationYearFolder_Error ( true )
                }

                if ( /cvc/i.test ( errMessage )) {
                    return this.cvcNumber_Error ( true )
                }

                if ( /card number/i.test ( errMessage )) {
                    return this.cardNumberFolder_Error ( true )
                }

                if ( /format/i.test ( errMessage )) {
                    return this.cardPayment_Error ( true )
                }

                if ( /postcode/.test (errMessage)) {
                    return this.postcode_Error ( true )
                }

                this.paymentSelect ( true )
                return this.paymentCardFailed ( true )
        }

        public openStripeCard () {
            this.clearPaymentError ()
            let handler = null
            const amount = Math.round (( this.selectPlanPrice() - this.showCurrentPlanBalance()) * 100 )
            if ( StripeCheckout && typeof StripeCheckout.configure === 'function' ){
                handler = StripeCheckout.configure ({
                    key: Stripe_publicKey,
                    image: 'images/512x512.png',
                    email: this.config().account,
                    zipCode: true,
                    locale: this.tLang() === 'tw' ? 'zh': this.tLang(),
                    token: token => {
                        
                        const payment: iQTGatePayment = {
                            tokenID: token.id,
                            Amount: amount,
                            plan: this.getPaymentPlan().name,
                            isAnnual: this.isAnnual (),
                            autoRenew: this.autoRenew ()
                            
                        }
                        this.showWaitPaymentFinished () 
                        return socketIo.emit ( 'cardToken', payment, ( err, data: QTGateAPIRequestCommand ) => {
                            return this.paymentCallBackFromQTGate ( err, data )
                        })
                    }
                })
                handler.open ({
                    name: 'QTGate Systems Inc',
                    description: `${ this.getPaymentPlan().name }:${ this.getPaymentPlan().monthly }GB`,
                    amount: amount
                })

                return window.addEventListener( 'popstate', () => {
                    handler.close()
                })
                
            }
            if ( !this.showStripeError ()) {
                this.showStripeError ( true )
                $('.showStripeErrorIconConnect').popup ({
                    position: 'top center'
                })
                return $('.showStripeErrorIcon').transition ('flash')
            }
            

        }

        public cancelSubscriptionButton () {
            if ( this.QTTransferData() && !this.QTTransferData().paidID ) {
                return
            }
            this.cancelPlanButton ( true )
        }

        public canShowCancelSubscriptionButton = ko.computed(() => {
            return this.QTTransferData() && this.QTTransferData().paidID && ( this.QTTransferData().isAnnual || this.QTTransferData().automatically )
        })

        public paymentSelect = ko.observable ( false )

        public showPayment ( paice: number, isAnnual: boolean ) {
            this.clearPaymentError ()
            if ( !StripeCheckout || typeof StripeCheckout.configure !== 'function' || !Stripe || typeof Stripe !== 'function' ) {
                this.showStripeError ( true )
                $('.showStripeError').popup ({
                    position: 'top center',
                    delay: {
                        show: 300,
                        hide: 800
                    }
                })
            }
            this.cardpaStripe ( true )
            this.autoRenew ( !isAnnual )
            this.isAnnual ( isAnnual )
            this.paymentSelect ( true )
            
            new Cleave ( '.paymaneCardNumber', {
                creditCard: true,
                onCreditCardTypeChanged: type => {
                    this.cardType ( type )
                }
            })
            new Cleave ( '.paymaneExpiration', {
                date: true,
                datePattern: ['m', 'Y'],
                delimiter: '/'
            })
            new Cleave ('.paymaneCVC', {
                numeral: true,
                numeralIntegerScale: 4,
                delimiter: ''
            })
            
            $('.CancelMessage').popup ({
                position: 'right center',
                on: 'click',
                delay: {
                    show: 300,
                    hide: 800
                }
            })
            
        }

        private showWaitPaymentFinished () {

            this.doingPayment ( true )
            this.paymentSelect ( false )
            this.clearPaymentError ()
            $('.paymentProcess').progress ('reset')
            let percent = 0
            const doingProcessBar = () => {
                clearTimeout ( this.doingProcessBarTime )
                this.doingProcessBarTime = setTimeout (() => {
                    $('.paymentProcess').progress ({
                        percent: ++ percent
                    })
                    if ( percent < 100 )
                        return doingProcessBar ()
                }, 1000 )
            }
            return doingProcessBar ()
        }

        private stopShowWaitPaymentFinished () {
            this.doingPayment ( false  )
            clearTimeout ( this.doingProcessBarTime )
            return $('.paymentProcess').progress ('reset')
        }

        public paymentPlan = ko.observable ()
        public isAnnual = ko.observable (false)
        public cardpay = ko.observable ( false )
        public cardNumber = ko.observable ('')
        public cardcvc = ko.observable ('')
        public cardExpirationYear = ko.observable ('')
        public cardExpirationYearFolder_Error = ko.observable ( false )
        public cardPostcode = ko.observable ('')
        public doingPayment = ko.observable ( false )
        public cardpaStripe = ko.observable ( false )
        public stripeCheckoutEnable = ko.observable ( false )
        public Alipay_error = ko.observable ( false )
        public autoRenew = ko.observable ( false )

        public doPayment () {
            this.clearPaymentError ()
            if ( this.cardType() === 'discover' || this.cardType() === 'diners' || this.cardType() === 'jcb') {
                this.cardNumberFolder_Error ( true )
                return this.cardNotSupport ( true )
            }
            const amount = Math.round (( this.selectPlanPrice() - this.showCurrentPlanBalance()) * 100 )
            const payment: iQTGatePayment = {
                Amount: amount,
                cardNumber: this.cardNumber (),
                cardExpirationYear: this.cardExpirationYear(),
                cardPostcode: this.cardPostcode (),
                cardcvc: this.cardcvc (),
                isAnnual: this.isAnnual (),
                plan: this.getPaymentPlan().name,
                autoRenew: this.autoRenew ()

            }
            this.showWaitPaymentFinished ()
           
            
            return socketIo.emit ( 'payment', payment, ( err, data: QTGateAPIRequestCommand ) => {
                return this.paymentCallBackFromQTGate ( err, data )
                
            })
            
        }

        public currentPlanPrice = ko.computed (() => {
            if ( !this.getCurrentPlan() || ! this.getCurrentPlan().monthlyPay )
                return ''
            return ' $' + this.getCurrentPlan().monthlyPay
        })

        public showCurrentPlanExpire = ko.computed (() => {
            if ( this.config().freeUser|| !this.getCurrentPlan() || !this.QTTransferData() ||  !this.QTTransferData().expire )
                return null
            return new Date (this.QTTransferData().expire).toLocaleDateString()
        })

        public showBandwidthRemaining = ko.computed (() => {
            if ( !this.getCurrentPlan() || !this.QTTransferData())
                return null
            return Math.round (this.QTTransferData().availableMonthlyTransfer * 100 / this.QTTransferData().transferMonthly) + '%'
        })

        public showUserDetail () {
            
            if ( ! this.keyPair().passwordOK || ! this.getCurrentPlan()) {
                return
            }
            this.showSuccessPayment ( false )
            this.showCancelSuccess ( false )
            this.UserPerment ( true )
            if ( !this.QTTransferData().paidID ) {
                $('.CancelPlanButton').popup({
                    position: 'top right',
                    delay: {
                        show: 300,
                        hide: 800
                    }
                })
            }
            if ( this.QTTransferData().isAnnual ) {
                $('.MonthlyPlanButton').popup ({
                    position: 'top right',
                    delay: {
                        show: 300,
                        hide: 800
                    }
                })
            }
            return $( '#getNextPlanArray').dropdown({ 
                onChange: value => { 
                    this.QTGateAccountPlan ( value )
                    this.UserPermentShapeDetail ( true )
                    return $('.CancelMessage').popup({
                        position: 'bottom right',
                        on: 'click',
                        delay: {
                            show: 300,
                            hide: 800
                        }
                    })
                }
            })
            
        }

        public showCurrentPlanBalance = ko.computed (() => {
            if ( ! this.getCurrentPlan() || ! this.QTTransferData ())
                return null
            return getCurrentPlanUpgradelBalance ( this.QTTransferData().expire, this.QTTransferData().productionPackage, this.QTTransferData().isAnnual )
        })

        public selectPlanPrice = ko.computed (() => {
            if ( !this.getPaymentPlan ())
                return null
            return getPlanPrice ( this.getPaymentPlan ().name, this.isAnnual ())
        })

        public totalAmount = ko.computed (() => {
            const amount = ( Math.round (( this.selectPlanPrice() - this.showCurrentPlanBalance()) * 100 ) / 100 ).toString ()
            if ( !/\./.test( amount )) {
                return amount + '.00'
            }
            return amount
        })

        public showSuccessPayment = ko.observable ( false )
        public cancelPlanButton = ko.observable ( false )
        public cancelPlanProcess = ko.observable ( false )
        public cardNumberFolder_Error = ko.observable ( false )
        public cvcNumber_Error = ko.observable ( false )
        public postcode_Error = ko.observable ( false )
        public cardPayment_Error = ko.observable ( false )
        public paymentDataFormat_Error = ko.observable ( false )
        public paymentCardFailed = ko.observable ( false )
        public cardNotSupport = ko.observable ( false )
        public showQTGateConnectOption = ko.observable ( false )

        public cardErrorMessage = ko.computed (() => {
            //輸入的信用卡號有誤！'，'輸入的信用卡期限有誤！'，'輸入的信用卡安全碼有誤！'，'輸入的信用卡持有人郵編有誤！
            if ( this.cardNumberFolder_Error())
                return 0
            if ( this.cvcNumber_Error())
                return 2
            if ( this.postcode_Error())
                return 3
            if ( this.cardExpirationYearFolder_Error())
                return 1
            if ( this.cardPayment_Error ())
                return 4
            if ( this.paymentDataFormat_Error())
                return 5
            if ( this.paymentCardFailed ())
                return 6
            return null
        })

        public cancelPlan () {
            this.cancelPlanProcess ( true )
            return socketIo.emit ( 'cancelPlan', callback => {
                this.cancelPlanProcess ( false )
            })
        }

        public upgradeAccount () {
            this.menuClick ( 1, false )
            this.UserPerment ( true )
            return this.showUserDetail()
        }

        public showCancelSuccess = ko.observable ( false )
        public cancel_Amount = ko.observable (0)

        public doCancelPlan () {
            
            this.showWaitPaymentFinished ()
            return socketIo.emit ( 'cancelPlan', ( err, data: QTGateAPIRequestCommand ) => {
                return this.paymentCallBackFromQTGate ( err, data )
                
            })
        }

        public promoButton = ko.observable ( false )
        public promoInput = ko.observable ('')

        public showPromoForm () {
            this.promoButton ( true )
            return new Cleave ( '.promoCodeInput', {
                uppercase: true,
                delimiter: '-',
                blocks: [4, 4, 4, 4]
            })

        }

        public promoInputError = ko.observable ( false )
        public promoApplication () {
            if ( this.promoInput().length < 19 ) {
                return this.promoInputError ( true )
            }
            this.clearPaymentError ()
            this.promoButton ( false )
            this.showWaitPaymentFinished ()
            return socketIo.emit ( 'promoCode', this.promoInput(), ( err, data: QTGateAPIRequestCommand ) => {
                return this.paymentCallBackFromQTGate ( err, data )
                
            })
        }

        public getMonthData = ko.computed(() => {
            if ( !this.QTTransferData()){
                return { data: null, ch: null }
            }
            const data = this.QTTransferData().transferMonthly
            let ch = 0
            const ret = Math.round ( data / (ch = oneMB)) > 1000 ? ( Math.round ( data / ( ch = oneGB )) > 1000 ?  Math.round ( data / ( ch =oneTB )) :  Math.round ( data / oneGB )): Math.round ( data / oneMB ) 
            return { data: ret, ch: ch === oneMB ? 'MB' : ( ch === oneGB ) ? 'GB' : 'TB' }
        })

        public getMonthAvailableData = ko.computed(() => {
            if ( !this.QTTransferData()){
                return { data: null, ch: null }
            }
            const data = this.QTTransferData().transferMonthly - this.QTTransferData().availableDayTransfer 
            let ch = 0
            const ret = Math.round ( data / (ch = oneMB)) > 1000 ? ( Math.round ( data / ( ch = oneGB )) > 1000 ?  Math.round ( data / ( ch =oneTB )) :  Math.round ( data / oneGB )): Math.round ( data / oneMB ) 
            return { data: ret, ch: ch === oneMB ? 'MB' : ( ch === oneGB ) ? 'GB' : 'TB' }
        })

        public showThirdPartyApp = ko.observable ( false )

        public twitterClick () {
            if ( this.config() && this.config().localIpAddress && this.config().localIpAddress.length ) {
                const { shell } = require ( 'electron' )
                event.preventDefault ()
                return shell.openExternal ( `https://www.github.com` )
                //return shell.openExternal ( `http://${ this.config().localIpAddress[0] }:2000/Twitter` )
            }
            return
        }

        public QTGateAppClick () {
            this.getAvaliableRegion ()
            return this.menuClick ( 3, true )
        }

        public appList = ko.observableArray( appList )
    }
    

}
const appList = [
    {
        name: 'QTGate',
        likeCount: ko.observable ( 0 ),
        liked: ko.observable ( false ),
        commentCount: ko.observable(),
        titleColor: '#0066cc',
        comeSoon: false,
        show: true,
        click: ( view: view_layout.view ) => { return view.QTGateAppClick () },
        image: '/images/qtgateGateway.png'
    },{
        name: 'QTChat',
        likeCount: ko.observable (0),
        liked: ko.observable (false),
        commentCount: ko.observable(0),
        titleColor: '#006600',
        comeSoon: true,
        show: true,
        image: '/images/qtchat.png',
        click: ( view: view_layout.view ) => { return },
    },{
        name: 'QTStorage',
        likeCount: ko.observable (0),
        liked: ko.observable (false),
        commentCount: ko.observable(0),
        titleColor: '#990000',
        comeSoon: true,
        show: true,
        image: '/images/qtStorage.png',
        click: ( view: view_layout.view ) => { return },
    },{
        name: 'QTCustom',
        likeCount: ko.observable (0),
        liked: ko.observable (false),
        commentCount: ko.observable(0),
        titleColor: '#09b83e',
        comeSoon: false,
        show: true,
        image: '/images/512x512.png',
        click: ( view: view_layout.view ) => { return },
    },{
        name: 'QTGoogle',
        likeCount: ko.observable (0),
        liked: ko.observable (false),
        commentCount: ko.observable(0),
        titleColor: '#4885ed',
        comeSoon: true,
        show: true,
        image: '/images/Google__G__Logo.svg',
        click: ( view: view_layout.view ) => { return },
    },{
        name: 'QTTweet',
        likeCount: ko.observable (0),
        liked: ko.observable (false),
        commentCount: ko.observable(0),
        titleColor: '#00aced',
        comeSoon: false,
        show: true,
        image: '/images/Twitter_Logo_Blue.svg',
        click: ( view: view_layout.view ) => { 
            const { shell } = require ( 'electron' )
            event.preventDefault ()
            return shell.openExternal ( `http://${ view.config().localIpAddress[0] }:2000/Twitter` )
        },
    },

    {
        name: 'QTInstagram',
        likeCount: ko.observable (0),
        liked: ko.observable (false),
        commentCount: ko.observable(0),
        titleColor: '#cd486b',
        show: false,
        image: '/images/Instagram_logo_2016.svg',
        comeSoon: true,
        click: ( view: view_layout.view ) => { return },
    }
    
    ,{
        name: 'QTNYTime',
        likeCount: ko.observable (0),
        liked: ko.observable (false),
        commentCount: ko.observable(0),
        titleColor: 'grey',
        comeSoon: true,
        show: true,
        image: '/images/nyt.png',
        click: ( view: view_layout.view ) => { return },
    },
    
    {
        name: 'QTWeChat',
        likeCount: ko.observable (0),
        liked: ko.observable (false),
        commentCount: ko.observable(0),
        titleColor: '#09b83e',
        comeSoon: true,
        show: false,
        image: '/images/wechat.svg',
        click: ( view: view_layout.view ) => { return },
    }
    
    ,{
        name: 'QTBitcoin',
        show: true,
        likeCount: ko.observable (0),
        liked: ko.observable ( false ),
        commentCount: ko.observable(0),
        titleColor: '#FF9900',
        comeSoon: true,
        image: '/images/Bitcoin.svg',
        click: ( view: view_layout.view ) => { return },
    }
]
const oneMB = 1024 * 1000
const oneGB = 1024 * 1000 * 1000
const oneTB = 1024 * 1000 * 1000 * 1000

const planArray = [
    {
        name:'free',
        monthly:1,
        day:100,
        monthlyPay: 0,
        annually: 0,
        next:'p1',
        share: 0,
        internet: 0,
        multi_gateway:0,
        showNote: false

    },{
        name:'p1',
        monthly:50,
        monthlyPay: '3.88',
        annually: '34.56',
        next:'p2',
        share: 0,
        internet: 0,
        multi_gateway:0,
        showNote: false
    },{
        name:'p2',
        monthly: 300,
        monthlyPay: '6.88',
        annually: '58.00',
        next:'p3',
        share: 0,
        internet: 0,
        multi_gateway:0,
        showNote: false
    },{
        name:'p3',
        monthly: 1000,
        monthlyPay: '19.88',
        annually: '167.00',
        next:'p4',
        share: 1,
        internet: 1,
        multi_gateway:1,
        showNote: true
    },{
        name:'p4',
        monthly: 2000,
        monthlyPay: '39.88',
        annually: '335.00',
        next:'p5',
        share: 2,
        internet: 2,
        multi_gateway:1,
        showNote: true
    },{
        name:'p5',
        monthly: 4000,
        monthlyPay: '79.88',
        annually: '670.00',
        share: 3,
        internet: 3,
        multi_gateway:2,
        showNote: false
    }
]
const DayTime = 1000 * 60 * 60 * 24
const monthTime = 30 * DayTime
const yearTime = 12 * monthTime

const getPlanPrice = ( plan: string, isAnnualPlan: boolean ) => {
	switch ( plan ) {
		//		1GB/month 100MB/day
		case 'free': {
			return 0
		}
		//		50GB/month
		case 'p1': {
			return isAnnualPlan ? 34.56: 3.88
		}
		//		300GB/month
		case 'p2': {
			return isAnnualPlan ? 58.00: 6.88
		}
		//		1TB/month
		case 'p3': {
			return isAnnualPlan ? 167.00: 19.88
		}
		//		2TB/month
		case 'p4': {
			return isAnnualPlan ? 335.00: 39.88
		}
		//		4TB/month
		case 'p5': {
			return isAnnualPlan ? 670.00: 79.88
		}
		//		ERROR
		default: {
			return parseInt ('none')
		}

	}
}

const getCurrentPlanCancelBalance = ( expiration: string, planName: string ) => {
	
    const price = getPlanPrice ( planName, true )
    const normalPrice = getPlanPrice ( planName, false )
    const usedMonth = 12 - getRemainingMonth ( expiration )
	const passedCost = Math.round (( price - normalPrice * usedMonth ) * 100 ) / 100
	return passedCost > 0 ? passedCost : 0
}

const getExpire = ( startDate: Date, isAnnual: boolean ) => {
	const start = new Date( startDate )
	const now = new Date ()
	const passedMonth = Math.round (( now.getTime () - start.getTime () ) / monthTime - 0.5 )
	isAnnual ? start.setFullYear ( start.getFullYear() + 1 ) : start.setMonth ( passedMonth + 1 )
	return start
}

const getCurrentPlanUpgradelBalance = ( expiration: string, planName: string, isAnnual: boolean ) => {
	if ( !isAnnual ) {
        return getPlanPrice ( planName, false )
    }
    const price = getPlanPrice ( planName, true )
    if ( !price )
        return null
    const usedMonth = 12 - getRemainingMonth ( expiration ) + 1
	const passedCost = Math.round (( price -  price * usedMonth / 12 ) * 100 ) / 100
	return passedCost
}

const view = new view_layout.view ()
ko.applyBindings ( view , document.getElementById ( 'body' ))
const u = '.' + view.tLang()
$( u ).addClass('active')
$('#firstNode').hide ()
$('.mainScreen').hide ()
$('.mainScreenMenu').hide ()
  $('.message .close').on('click', function() {
    $(this).closest('.message').transition('fade').remove()
})
$('.activating.element').popup({
    on: 'focus'
})
$('.mainAccordion').accordion({
})
$('.useInfoView').hide ()
$( '.mainScreen1' ).hide()
$( '#feedBackView').hide ()
