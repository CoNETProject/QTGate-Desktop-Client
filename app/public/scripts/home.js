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
const animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
const insideChinaEmail = /(\@|\.)(sina|sohu|qq|126|163|tom)\.com|(\.|\@)yeah\.net/i;
const Stripe_publicKey = 'pk_live_VwEPmqkSAjDyjdia7xn4rAK9';
/**
 * 			getImapSmtpHost
 * 		@param email <string>
 * 		@return Imap & Smtp info
 */
const getImapSmtpHost = (_email) => {
    const email = _email.toLowerCase();
    const yahoo = (domain) => {
        if (/yahoo.co.jp$/i.test(domain))
            return 'yahoo.co.jp';
        if (/((.*\.){0,1}yahoo|yahoogroups|yahooxtra|yahoogruppi|yahoogrupper)(\..{2,3}){1,2}$/.test(domain))
            return 'yahoo.com';
        if (/(^hotmail|^outlook|^live|^msn)(\..{2,3}){1,2}$/.test(domain))
            return 'hotmail.com';
        if (/^(me|^icould|^mac)\.com/.test(domain))
            return 'me.com';
        return domain;
    };
    const emailSplit = email.split('@');
    if (emailSplit.length !== 2)
        return null;
    const domain = yahoo(emailSplit[1]);
    const ret = {
        imap: 'imap.' + domain,
        smtp: 'smtp.' + domain,
        SmtpPort: [465, 587, 994],
        ImapPort: 993,
        imapSsl: true,
        smtpSsl: true,
        haveAppPassword: false,
        ApplicationPasswordInformationUrl: ['']
    };
    switch (domain) {
        //		yahoo domain have two different 
        //		the yahoo.co.jp is different other yahoo.*
        case 'yahoo.co.jp':
            {
                ret.imap = 'imap.mail.yahoo.co.jp';
                ret.smtp = 'smtp.mail.yahoo.co.jp';
            }
            break;
        //			gmail
        case 'google.com':
        case 'googlemail.com':
        case 'gmail':
            {
                ret.haveAppPassword = true;
                ret.ApplicationPasswordInformationUrl = [
                    'https://support.google.com/accounts/answer/185833?hl=zh-Hans',
                    'https://support.google.com/accounts/answer/185833?hl=ja',
                    'https://support.google.com/accounts/answer/185833?hl=en'
                ];
            }
            break;
        case 'gandi.net':
            ret.imap = ret.smtp = 'mail.gandi.net';
            break;
        //				yahoo.com
        case 'rocketmail.com':
        case 'y7mail.com':
        case 'ymail.com':
        case 'yahoo.com':
            {
                ret.imap = 'imap.mail.yahoo.com';
                ret.smtp = (/^bizmail.yahoo.com$/.test(emailSplit[1]))
                    ? 'smtp.bizmail.yahoo.com'
                    : 'smtp.mail.yahoo.com';
                ret.haveAppPassword = true;
                ret.ApplicationPasswordInformationUrl = [
                    'https://help.yahoo.com/kb/SLN15241.html',
                    'https://help.yahoo.com/kb/SLN15241.html',
                    'https://help.yahoo.com/kb/SLN15241.html'
                ];
            }
            break;
        case 'mail.ee':
            ret.smtp = 'mail.ee';
            ret.imap = 'mail.inbox.ee';
            break;
        //		gmx.com
        case 'gmx.co.uk':
        case 'gmx.de':
        case 'gmx.us':
        case 'gmx.com':
            {
                ret.smtp = 'mail.gmx.com';
                ret.imap = 'imap.gmx.com';
            }
            break;
        //		aim.com
        case 'aim.com':
            {
                ret.imap = 'imap.aol.com';
            }
            break;
        //	outlook.com
        case 'windowslive.com':
        case 'hotmail.com':
        case 'outlook.com':
            {
                ret.imap = 'imap-mail.outlook.com';
                ret.smtp = 'smtp-mail.outlook.com';
            }
            break;
        //			apple mail
        case 'icloud.com':
        case 'mac.com':
        case 'me.com':
            {
                ret.imap = 'imap.mail.me.com';
                ret.smtp = 'smtp.mail.me.com';
            }
            break;
        //			163.com
        case '126.com':
        case '163.com':
            {
                ret.imap = 'appleimap.' + domain;
                ret.smtp = 'applesmtp.' + domain;
            }
            break;
        case 'sina.com':
        case 'yeah.net':
            {
                ret.smtpSsl = false;
            }
            break;
    }
    return ret;
};
class IsNullValidator {
    isAcceptable(s) {
        if (s === undefined) {
            return true;
        }
        if (s === null) {
            return true;
        }
        if (s.length == 0) {
            return true;
        }
    }
}
class EmailValidator {
    isAcceptable(s) {
        return EmailRegexp.test(s);
    }
}
const testVal = new IsNullValidator();
const testEmail = new EmailValidator();
const oneDayTime = 186400000;
/**
 *      check email address
 *      @param email <string>
 *      @param return <string>  Valid = '' Err = errorMessage
 */
const checkEmail = (email) => {
    if (testVal.isAcceptable(email)) {
        return 'required';
    }
    if (!testEmail.isAcceptable(email)) {
        return 'EmailAddress';
    }
    return '';
};
const getNickName = (email) => {
    var ret = '';
    if (email.length) {
        ret = email.split('@')[0];
        ret = ret.charAt(0).toUpperCase() + ret.slice(1);
    }
    return ret;
};
const initKeyPair = {
    keyLength: '',
    email: '',
    nikeName: '',
    createDate: '',
    passwordOK: false,
    verified: false,
    publicKeyID: ''
};
const QTGateRegionsSetup = [
    {
        title: '@OPN'
    },
    {
        title: 'iOPN'
    }
];
const nextExpirDate = (expire) => {
    const now = new Date();
    const _expire = new Date(expire);
    _expire.setHours(0, 0, 0, 0);
    if (now.getTime() > _expire.getTime()) {
        return _expire;
    }
    const nextExpirDate = new Date(expire);
    nextExpirDate.setMonth(now.getMonth());
    nextExpirDate.setFullYear(now.getFullYear());
    if (nextExpirDate.getTime() < now.getTime()) {
        nextExpirDate.setMonth(now.getMonth() + 1);
        return nextExpirDate;
    }
    return _expire;
};
const getRemainingMonth = (expire) => {
    const _expire = new Date(expire);
    const _nextExpirDate = nextExpirDate(expire);
    return _expire.getFullYear() === _nextExpirDate.getFullYear() ? _expire.getMonth() - _nextExpirDate.getMonth() : (12 - _nextExpirDate.getMonth() + _expire.getMonth());
};
const getAmount = (amount) => {
    if (!amount)
        return null;
    if (typeof amount === 'number') {
        amount = amount.toString();
    }
    const ret = amount.split('.');
    return ret.length === 1 ? amount + '.00' : amount;
};
const _QTGateRegions = [
    {
        icon: 'india',
        content: ['班加罗尔', 'バンガロール', 'Bangalore', '班加羅爾'],
        meta: ['亚洲・印度', 'アジア・インド', 'India. Asia.', '亞洲・印度'],
        description: ['', '', '', ''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable(false),
        showExtraContent: ko.observable(false),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'Asia.Bangalore',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable(false),
        showConnectedArea: ko.observable(false),
        ping: ko.observable(-2),
        downloadSpeed: ko.observable(-2)
    }, {
        icon: 'singapore',
        content: ['新加坡', 'シンガポール', 'Singapore', '新加坡'],
        meta: ['亚洲・新加坡', 'アジア・シンガポール', 'Singapore. Asia.', '亞洲・新加坡'],
        description: ['', '', '', ''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable(false),
        showExtraContent: ko.observable(false),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'singapore',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable(false),
        showConnectedArea: ko.observable(false),
        ping: ko.observable(-2),
        downloadSpeed: ko.observable(-2)
    }, {
        icon: 'japan',
        content: ['东京', '東京', 'Tokyo', '東京'],
        meta: ['亚洲・日本', 'アジア・日本', 'Japan. Asia.', '亞洲・日本'],
        description: ['', '', '', ''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable(false),
        showExtraContent: ko.observable(false),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'tokyo',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable(false),
        showConnectedArea: ko.observable(false),
        ping: ko.observable(-2),
        downloadSpeed: ko.observable(-2)
    }, {
        icon: 'france',
        content: ['巴黎', 'パリ', 'Paris', '巴黎'],
        meta: ['欧洲・法国', 'ヨーロッパ・フランス', 'France. Europe.', '歐洲・法國'],
        description: ['', '', '', ''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable(false),
        showExtraContent: ko.observable(false),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'paris',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable(false),
        showConnectedArea: ko.observable(false),
        ping: ko.observable(-2),
        downloadSpeed: ko.observable(-2)
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
    ,
    {
        icon: 'netherlands',
        content: ['阿姆斯特丹', 'アムステルダム', 'Amsterdam', '阿姆斯特丹'],
        meta: ['欧洲・荷兰', 'ヨーロッパ・オランダ', 'Netherlands. Europe.', '歐洲・荷蘭'],
        description: ['', '', '', ''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable(false),
        showExtraContent: ko.observable(false),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'amsterdam',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable(false),
        showConnectedArea: ko.observable(false),
        ping: ko.observable(-2),
        downloadSpeed: ko.observable(-2)
    }, {
        icon: 'germany',
        content: ['法兰克福', 'フランクフルト', 'Frankfurt', '法蘭克福'],
        meta: ['欧洲・德国', 'ヨーロッパ・ドイツ', 'Germany. Europe.', '歐洲・德國'],
        description: ['', '', '', ''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable(false),
        showExtraContent: ko.observable(false),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'frankfurt',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable(false),
        showConnectedArea: ko.observable(false),
        ping: ko.observable(-2),
        downloadSpeed: ko.observable(-2)
    }, {
        icon: 'united kingdom',
        content: ['爱尔兰', 'アイルランド', 'Ireland', '愛爾蘭'],
        meta: ['欧洲・英国', 'ヨーロッパ・英国', 'United Kingdom. Europe.', '歐洲・英國'],
        description: ['', '', '', ''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable(false),
        showExtraContent: ko.observable(false),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'Ireland',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable(false),
        showConnectedArea: ko.observable(false),
        ping: ko.observable(-2),
        downloadSpeed: ko.observable(-2)
    }, {
        icon: 'united kingdom',
        content: ['伦敦', 'ロンドン', 'London', '倫敦'],
        meta: ['欧洲・英国', 'ヨーロッパ・英国', 'United Kingdom. Europe.', '歐洲・英國'],
        description: ['', '', '', ''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable(false),
        showExtraContent: ko.observable(false),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'London',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable(false),
        showConnectedArea: ko.observable(false),
        ping: ko.observable(-2),
        downloadSpeed: ko.observable(-2)
    }, {
        icon: 'australia',
        content: ['悉尼', 'シドニー', 'Sydney', '悉尼'],
        meta: ['澳洲・澳大利亚', 'オーストラリア', 'Australia.', '澳洲・澳大利亚'],
        description: ['', '', '', ''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable(false),
        showExtraContent: ko.observable(false),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'Sydney',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable(false),
        showConnectedArea: ko.observable(false),
        ping: ko.observable(-2),
        downloadSpeed: ko.observable(-2)
    }, {
        icon: 'united states',
        content: ['纽约', 'ニューヨーク', 'New York City', '紐約'],
        meta: ['北美洲东海岸・美国', '北アメリカ東海岸・アメリカ', 'USA. North American Eastern.', '北美洲東海岸・美國'],
        description: ['', '', '', ''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable(false),
        showExtraContent: ko.observable(false),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'new-york-city',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable(false),
        showConnectedArea: ko.observable(false),
        ping: ko.observable(-2),
        downloadSpeed: ko.observable(-2)
    }, {
        icon: 'canada',
        content: ['多伦多', 'トロント', 'Toronto', '多倫多'],
        meta: ['北美洲东海岸・加拿大', '北アメリカ東海岸・カナダ', 'Canada. North American Eastern.', '北美洲東海岸・加拿大'],
        description: ['', '', '', ''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable(false),
        showExtraContent: ko.observable(false),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'toronto',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable(false),
        showConnectedArea: ko.observable(false),
        ping: ko.observable(-2),
        downloadSpeed: ko.observable(-2)
    }, {
        icon: 'united states',
        content: ['旧金山', 'サンフランシスコ', 'San Francisco', '舊金山'],
        meta: ['北美洲西海岸・美国・旧金山', '北アメリカ西海岸・アメリカ', 'USA. North American Western.', '北美洲西海岸・美國'],
        description: ['', '', '', ''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable(false),
        showExtraContent: ko.observable(false),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'francisco',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable(false),
        showConnectedArea: ko.observable(false),
        ping: ko.observable(-2),
        downloadSpeed: ko.observable(-2)
    }, {
        icon: 'hong kong',
        content: ['香港', '香港', 'Hong Kong', '香港'],
        meta: ['亚洲・中国', 'アジア・中国', 'China. Asia.', '亞洲・中國'],
        description: ['', '', '', ''],
        canVoe: ko.observable(true),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable(false),
        showExtraContent: ko.observable(false),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'HK',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable(false),
        showConnectedArea: ko.observable(false),
        ping: ko.observable(-2),
        downloadSpeed: ko.observable(-2)
    }, {
        icon: 'china',
        content: ['上海市', '上海市', 'Shanghai', '上海市'],
        meta: ['亚洲・中国', 'アジア・中国', 'China. Asia.', '亞洲・中國'],
        description: ['', '', '', ''],
        canVoe: ko.observable(false),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable(false),
        showExtraContent: ko.observable(false),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'shanghai',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable(false),
        showConnectedArea: ko.observable(false),
        ping: ko.observable(-2),
        downloadSpeed: ko.observable(-2)
    }, {
        icon: 'china',
        content: ['北京市', '北京市', 'Beijing', '北京市'],
        meta: ['亚洲・中国', 'アジア・中国', 'China. Asia.', '亞洲・中國'],
        description: ['', '', '', ''],
        canVoe: ko.observable(false),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable(false),
        showExtraContent: ko.observable(false),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'beijing',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable(false),
        showConnectedArea: ko.observable(false),
        ping: ko.observable(-2),
        downloadSpeed: ko.observable(-2)
    }, {
        icon: 'china',
        content: ['无锡市', '無錫市', 'Wuxi', '無錫市'],
        meta: ['亚洲・中国江苏省', 'アジア・中国江蘇省', 'Jiangsu China. Asia.', '亞洲・中國江蘇省'],
        description: ['', '', '', ''],
        canVoe: ko.observable(false),
        canVoH: ko.observable(true),
        available: ko.observable(false),
        selected: ko.observable(false),
        showExtraContent: ko.observable(false),
        QTGateRegionsSetup: QTGateRegionsSetup,
        qtRegion: 'Wuxi',
        error: ko.observable(-1),
        showRegionConnectProcessBar: ko.observable(false),
        showConnectedArea: ko.observable(false),
        ping: ko.observable(-2),
        downloadSpeed: ko.observable(-2)
    }
];
const checkCanDoAtQTGateReg = /^imap\.mail\.me\.com$/;
const checkCanDoAtQTGate = (imapArray) => {
    return imapArray().findIndex(n => { return checkCanDoAtQTGateReg.test(n.iMapServerName()) && n.imapCheckResult() > 0; });
};
const availableImapServer = /imap\-mail\.outlook\.com$|imap\.mail\.yahoo\.(com|co\.jp|co\.uk|au)$|imap\.mail\.me\.com$|imap\.gmail\.com$|gmx\.(com|us|net)$|imap\.zoho\.com$/i;
const dummyIConnectCommand = {
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
};
const donateArray = [{
        image: [
            'https://user-images.githubusercontent.com/19976150/32689499-0e193bac-c69b-11e7-9297-4ed714522497.png',
            'https://user-images.githubusercontent.com/19976150/32689499-0e193bac-c69b-11e7-9297-4ed714522497.png',
            'https://user-images.githubusercontent.com/19976150/32689499-0e193bac-c69b-11e7-9297-4ed714522497.png',
            'https://user-images.githubusercontent.com/19976150/32689499-0e193bac-c69b-11e7-9297-4ed714522497.png'
        ],
        header: ['维基百科', 'ウィキペディア', 'Wikipedia', '維基百科'],
        meta: ['匿名北美慈善团体', 'ある北米チャリティー', 'Anonymous North American charity', '匿名北美慈善團體'],
        description: [
            '维基百科是一个自由内容、公开编辑且多语言的网络百科全书协作项目，通过Wiki技术使得包括您在内的所有人都可以简单地使用网页浏览器修改其中的内容。维基百科一字取自于本网站核心技术“Wiki”以及具有百科全书之意的“encyclopedia”共同创造出来的新混成词“Wikipedia”，当前维基百科由维基媒体基金会负责运营。',
            'ウィキペディアは、信頼されるフリーなオンライン百科事典、それも質・量ともに史上最大の百科事典を、共同作業で創り上げることを目的とするプロジェクト、およびその成果である百科事典本体です。',
            'Wikipedia is a free online encyclopedia with the aim to allow anyone to edit articles. Wikipedia is the largest and most popular general reference work on the Internet, and is ranked the fifth-most popular website. Wikipedia is owned by the nonprofit Wikimedia Foundation.',
            '維基百科是一個自由內容、公開編輯且多語言的網絡百科全書協作項目，通過Wiki技術使得包括您在內的所有人都可以簡單地使用網頁瀏覽器修改其中的內容。維基百科一字取自於本網站核心技術“Wiki”以及具有百科全書之意的“encyclopedia”共同創造出來的新混成詞“Wikipedia”，當前維基百科由維基媒體基金會負責運營。'
        ]
    }];
const checkSmtpImapAccountSetup = (email, uuid, imap) => {
    if (checkEmail(email).length) {
        imap.emailAddressShowError(true);
        imap.EmailAddressErrorType(0);
        $('.activating.element').popup({
            on: 'focus',
            movePopup: false
        });
        return false;
    }
    if (imap.root.emailPool().length) {
        const index = imap.root.emailPool().findIndex(n => { return n.emailAddress() === email && n.uuid !== uuid; });
        if (index > -1) {
            imap.emailAddressShowError(true);
            imap.EmailAddressErrorType(1);
            $('.activating.element').popup({
                on: 'focus',
                movePopup: false
            });
            return false;
        }
    }
    const data = getImapSmtpHost(email);
    if (!imap.root.haveQTGateImapAccount() && !availableImapServer.test(data.imap)) {
        imap.emailAddressShowError(true);
        imap.EmailAddressErrorType(2);
        $('.activating.element').popup({
            on: 'focus',
            movePopup: false
        });
        return false;
    }
    imap.emailAddressSuccess(true);
    //if (!$(`#${ imap.uuid }-imap`).hasClass('active')) {
    imap.iMapServerName(data.imap);
    imap.iMapServerLoginName(email);
    imap.iMapSecure(data.imapSsl);
    imap.imapPortChecked(data.ImapPort.toString());
    imap.imapIgnoreCertificate(false);
    //}
    //if (!$(`#${ imap.uuid }-smtp`).hasClass('active')) {
    imap.SmtpServerName(data.smtp);
    imap.SmtpServerLoginName(email);
    imap.smtpSecure(data.smtpSsl);
    imap.smtpPortChecked(data.SmtpPort[0].toString());
    imap.smtpIgnoreCertificate(false);
    //}
    //this.showImapSmtpdetailTreeView (true)
    return true;
};
const imapAccountGoCheckClick = (imap) => {
    if (checkEmail(imap.emailAddress()).length) {
        checkSmtpImapAccountSetup(imap.emailAddress(), imap.uuid, imap);
        return false;
    }
    if (!checkSmtpImapAccountSetup(imap.emailAddress(), imap.uuid, imap))
        return false;
    imap.imapCheckOk(false);
    imap.smtpCheckOk(false);
    imap.imapDataEditShow(false);
    imap.runningCheck(true);
    let percent = 0;
    imap.imapCheckingStep(0);
    imap.process.progress('reset');
    const doingProcessBar = () => {
        clearTimeout(imap.doingProcessBarTime);
        imap.doingProcessBarTime = setTimeout(() => {
            imap.process.progress({
                percent: ++percent
            });
            if (percent < 100)
                return doingProcessBar();
        }, 200);
    };
    doingProcessBar();
    socketIo.emit('startCheckImap', imap.progressBarCss(), imap.GetImapData(), (ret) => {
        if (ret)
            return imap.callBackError(ret);
        socketIo.once(imap.progressBarCss() + '-imap', (err, result) => {
            if (err) {
                imap.appPaassword(err === 3);
                return imap.callBackError(err);
            }
            socketIo.once(imap.progressBarCss() + '-smtp', (err) => {
                if (err) {
                    return imap.callBackError(err);
                }
                percent = 98;
                imap.smtpCheckOk(true);
                imap.process.addClass('success');
                const fromIInputData = $('.rating');
                fromIInputData.rating('disable');
                imap.root.canShowAddAImapButton();
                imap.process.removeClass('success');
                imap.runningCheck(false);
                imap.showImapTestSuccess(false);
                return imap.imapCheckingStep(2);
            });
            percent = 33;
            imap.imapCheckResult(result);
            imap.dataRating(result < 500 ? 3 : result < 1000 ? 2 : 1);
            imap.imapCheckOk(true);
            return imap.imapCheckingStep(1);
        });
        percent = 0;
        return imap.imapCheckingStep(0);
    });
};
var view_layout;
(function (view_layout) {
    class emailPoolData {
        // * view
        constructor(root) {
            this.root = root;
            // - DATA
            this.emailAddress = ko.observable('');
            this.password = ko.observable('');
            this.iMapServerName = ko.observable('');
            this.iMapServerLoginName = ko.observable('');
            this.iMapServerLoginPassword = ko.observable('');
            this.iMapSecure = ko.observable(true);
            this.iMapServerPortNumber = ko.observable('993');
            this.imapPortChecked = ko.observable('');
            this.SmtpServerName = ko.observable('');
            this.SmtpServerLoginName = ko.observable('');
            this.smtpSecure = ko.observable(true);
            this.smtpServerLoginPassword = ko.observable('');
            this.smtpPortChecked = ko.observable('');
            this.VpnviaEmailCheckOK = ko.observable(false);
            this.smtpServerPortNumber = ko.observable('994');
            this.imapIgnoreCertificate = ko.observable(false);
            this.smtpIgnoreCertificate = ko.observable(false);
            // * DATA
            // - view
            this.imapPortArray = ['143', '993', 'other'];
            this.smtpPortArray = ['25', '465', '587', '994', '2525', 'other'];
            this.emailAddressSuccess = ko.observable(false);
            this.emailAddressShowError = ko.observable(false);
            this.EmailAddressErrorType = ko.observable(0);
            this.passwordShowError = ko.observable(false);
            this.passwordSuccess = ko.observable(false);
            this.showDeleteImapConform = ko.observable(false);
            this.showImapSmtpdetailTreeView = ko.observable(false);
            this.nodeCollapsed = ko.observable(true);
            this.imapHostNameErr = ko.observable(false);
            this.imapAuthenticationFailed = ko.observable(false);
            this.CertificateError = ko.observable(false);
            this.imapOtherCheckError = ko.observable(false);
            this.smtpOtherCheckError = ko.observable(false);
            this.smtpAuthenticationFailed = ko.observable(false);
            this.iMapServerPortNumberError = ko.observable(false);
            this.smtpServerPortNumberError = ko.observable(false);
            this.smtpHostNameErr = ko.observable(false);
            this.emailAddressDoingCheck = ko.observable(false);
            this.imapCheckOk = ko.observable(false);
            this.smtpCheckOk = ko.observable(false);
            this.imapCheckResult = ko.observable(0);
            this.runningCheck = ko.observable(false);
            this.imapStatusBarAlert = ko.observable(false);
            this.smtpStatusBarAlert = ko.observable(false);
            this.imapCheckCallBack = ko.observable(false);
            this.smtpCheckCallBack = ko.observable(false);
            this.progressBarCss = ko.observable(uuID());
            this.emailAccountWarning = ko.observable(false);
            this.QTGateBarAlert = ko.observable(false);
            this.QTGateCheckOk = ko.observable(false);
            this.QTGateCallBack = ko.observable(false);
            this.QTGateConnect = ko.observable(false);
            this.imapDataEditShow = ko.observable(true);
            this.imapDataEnited = ko.observable(true); //  user name or password changed
            this.showConnectingToImapServer = ko.observable(false);
            this.ImapErr = ko.observable(false);
            this.ImapAccountConnected = ko.observable(false);
            this.imapDeletebtn_view = ko.observable(false);
            this.uuid = uuID();
            this.errorMessage = ko.observable([]);
            this.imapCheckingStep = ko.observable(0);
            this.doingProcessBarTime = null;
            this.showImapTestSuccess = ko.observable(false);
            this.imapCheckReturnError = ko.observable(0);
            this.dataRating = ko.observable(0);
            this.saved = ko.observable(false);
            this.canDoDelete = ko.observable(false);
            this.showDeleteArea = ko.observable(false);
            this.sendToQTGate = ko.observable(false);
            this.process = $(`#${this.uuid}>.progress`);
            this.edited = false;
            this.appPaassword = ko.observable(false);
            this.isQTGateImapAccount = ko.computed(() => {
                return availableImapServer.test(this.iMapServerName());
            });
            this.getMailIcon = ko.computed(() => {
                let imapServer = null;
                if (!(imapServer = this.iMapServerName()).length)
                    return null;
                const domain = imapServer.split('@');
                if (!domain.length)
                    return null;
                if (/\.me\.com$/i.test(domain)) {
                    return '/images/iCloud.svg';
                }
                if (/\.yahoo\.com$/i.test(domain)) {
                    return '/images/Yahoo_Logo.svg';
                }
                if (/\.aol\.com$/i.test(domain)) {
                    return '/images/AOL_logo.svg';
                }
                if (/\.outlook\.com$/i.test(domain)) {
                    return '/images/Outlook.com_logo_and_wordmark.svg';
                }
                if (/\.gmx\.com$/i.test(domain)) {
                    return '/images/Gmx_email_logo_2.svg';
                }
                if (/\.gmail\.com$/i.test(domain)) {
                    return '/images/Logo_Google_2013_Official.svg';
                }
                if (/\.zoho\.com$/i.test(domain))
                    return '/images/zoho-seeklogo.com.svg';
                return null;
            });
            this.callBackError = (ret) => {
                clearTimeout(this.doingProcessBarTime);
                this.imapCheckReturnError(ret);
                if (this.process)
                    this.process.addClass('error');
                $('.ImapDetailAccordionTitle').accordion();
                return $('.activating.element').popup({
                    on: 'click',
                    movePopup: false,
                    position: 'left center',
                    onHidden: () => {
                        if (this.process) {
                            this.process.removeClass('error');
                        }
                        this.showImapSmtpdetailTreeView(true);
                        this.imapCheckReturnError(0);
                        this.runningCheck(false);
                        this.imapDataEditShow(true);
                    }
                });
            };
            this.emailAddress.subscribe((newValue) => {
                this.passwordShowError(false);
                this.emailAddressShowError(false);
                this.imapAuthenticationFailed(false);
                this.smtpAuthenticationFailed(false);
                checkSmtpImapAccountSetup(newValue, this.uuid, this);
                this.imapDataEnited(true);
                this.appPaassword(true);
            });
            this.password.subscribe(newValue => {
                this.passwordShowError(false);
                this.emailAddressShowError(false);
                this.imapAuthenticationFailed(false);
                this.smtpAuthenticationFailed(false);
                if (newValue.length) {
                    this.passwordSuccess(true);
                    this.iMapServerLoginPassword(newValue);
                    this.smtpServerLoginPassword(newValue);
                    return true;
                }
                this.passwordSuccess(false);
                this.imapDataEnited(true);
            });
            this.iMapServerPortNumber.subscribe(newValue => {
                this.iMapServerPortNumberError(false);
                const num = parseInt(newValue);
                if (!/^[0-9]*$/.test(newValue) || !num || num <= 0 || num > 65535) {
                    this.iMapServerPortNumberError(true);
                    $('.activating.element').popup({
                        on: 'focus',
                        movePopup: false
                    });
                }
                return;
            });
            this.smtpServerPortNumber.subscribe(newValue => {
                this.smtpServerPortNumberError(false);
                const num = parseInt(newValue);
                if (!/^[0-9]*$/.test(newValue) || !num || num <= 0 || num > 65535) {
                    this.smtpServerPortNumberError(true);
                    $('.activating.element').popup({
                        on: 'focus',
                        movePopup: false
                    });
                }
                return;
            });
        }
        GetImapData() {
            const data = {
                email: this.emailAddress(),
                account: this.root.config().keypair.email,
                imapServer: this.iMapServerName(),
                imapPortNumber: this.imapPortChecked() === 'other' ? this.iMapServerPortNumber() : this.imapPortChecked(),
                imapSsl: this.iMapSecure(),
                imapUserName: this.iMapServerLoginName(),
                imapUserPassword: this.iMapServerLoginPassword(),
                smtpServer: this.SmtpServerName(),
                smtpSsl: this.smtpSecure(),
                smtpPortNumber: this.edited ? (this.smtpPortChecked() === 'other' ? this.smtpServerPortNumber() : this.smtpPortChecked()) : ['465', '587', '994'],
                smtpUserName: this.SmtpServerLoginName(),
                smtpUserPassword: this.smtpServerLoginPassword(),
                smtpIgnoreCertificate: this.smtpIgnoreCertificate(),
                imapIgnoreCertificate: this.imapIgnoreCertificate(),
                imapTestResult: null,
                language: this.root.tLang(),
                serverFolder: null,
                clientFolder: null,
                sendToQTGate: null,
                smtpCheck: null,
                imapCheck: null,
                timeZoneOffset: new Date().getTimezoneOffset(),
                randomPassword: null,
                uuid: this.uuid,
                canDoDelete: false,
                clientIpAddress: null,
                ciphers: null,
                confirmRisk: null
            };
            return data;
        }
        fromIInputData(data) {
            this.emailAddress(data.email);
            this.password(data.imapUserPassword);
            if (this.imapPortArray.findIndex(n => { return n === data.imapPortNumber; }) !== -1) {
                this.imapPortChecked(data.imapPortNumber);
            }
            else {
                this.imapPortChecked('other');
                this.iMapServerPortNumber(data.imapPortNumber);
            }
            this.iMapServerName(data.imapServer);
            this.iMapSecure(data.imapSsl);
            this.uuid = data.uuid;
            this.iMapServerLoginPassword(data.imapUserPassword);
            this.iMapServerLoginName(data.imapUserName);
            this.smtpServerLoginPassword(data.smtpUserPassword);
            this.SmtpServerName(data.smtpServer);
            this.SmtpServerLoginName(data.smtpUserName);
            this.smtpSecure(data.smtpSsl);
            this.imapIgnoreCertificate(data.imapIgnoreCertificate);
            this.smtpIgnoreCertificate(data.smtpIgnoreCertificate);
            if (this.smtpPortArray.findIndex(n => { return n === data.smtpPortNumber[0]; }) !== -1) {
                this.smtpPortChecked(data.smtpPortNumber[0]);
            }
            else {
                this.smtpPortChecked('other');
                this.smtpServerPortNumber(data.smtpPortNumber[0]);
            }
            this.imapCheckOk(data.imapCheck);
            this.imapCheckResult(data.imapTestResult);
            this.smtpCheckOk(data.smtpCheck);
            this.imapDataEditShow(!data.imapTestResult ? true : false);
            this.imapDataEnited(false);
            this.imapDeletebtn_view(false);
            this.saved(true);
            this.sendToQTGate(data.sendToQTGate);
            this.canDoDelete(data.canDoDelete);
            this.showDeleteArea(false);
            this.dataRating(data.imapTestResult < 500 ? 3 : data.imapTestResult < 1000 ? 2 : 1);
        }
        imapAccountGoCheckClick() {
            return imapAccountGoCheckClick(this);
        }
        cancelDoingCheck() {
            this.root.emailAddressDoingCheck(false);
            this.emailAddressDoingCheck(false);
            clearInterval(this.progressBarInterval);
        }
        imapEmailAddressClick() {
            //      do not show when ImapAccountConnected
            if (this.ImapAccountConnected)
                return;
            this.imapDataEditShow(this.imapDataEditShow());
        }
        deleteClick() {
            const uu = $(`#${this.uuid}`);
            uu.addClass('ui blurring').find('.imapItemCardContent').addClass('ui dimmer');
            uu.dimmer('show');
            this.imapDeletebtn_view(true);
            if (this.root.emailPool().length < 1) {
                this.root.QTGateConnectActive(false);
                this.root.QTGateConnectRegionActive(false);
            }
        }
        calcenDeteleClick() {
            $(`#${this.emailAddress()}`).dimmer('hide');
            this.imapDeletebtn_view(false);
        }
        calcelEdit() {
            if (!this.emailAddress().length) {
                const index = this.root.emailPool().findIndex(n => n.uuid === this.uuid);
                if (index !== -1)
                    this.root.emailPool.splice(index, 1);
                this.root.canShowAddAImapButton();
            }
            this.imapDataEditShow(false);
        }
        deleteImap() {
            const index = this.root.emailPool().findIndex(n => n.uuid === this.uuid);
            if (index !== -1)
                this.root.emailPool.splice(index, 1);
            this.imapDataEditShow(false);
            socketIo.emit('deleteImapAccount', this.uuid);
            if (!this.root.emailPool().length)
                this.root.addANewImapData(this.root);
            this.root.canShowAddAImapButton();
        }
        ImapDetailAccordionTitleClick() {
            this.edited = true;
            const self = this;
            const body = $("html, body");
            return body.stop().animate({ scrollTop: 0 }, 100, 'swing', () => {
                return self.root.overflowShow(true);
            });
        }
    }
    view_layout.emailPoolData = emailPoolData;
    class view {
        constructor() {
            this.overflowShow = ko.observable(false);
            this.CancelCreateKeyPairSent = false;
            this.modalContent = ko.observable('');
            this.menu = Menu;
            this.infoDefine = infoDefine;
            this.documentReady = ko.observable(false);
            this.tLang = ko.observable(initLanguageCookie());
            this.languageIndex = ko.observable(lang[this.tLang()]);
            this.systemSetup_systemPassword = ko.observable('');
            this.ImapErr = ko.observable(false);
            this.ImapAccountConnected = ko.observable(false);
            this.QTGateConnecting = ko.observable(-1);
            this.conformTextErrorNumber = ko.observable(-1);
            this.status = ko.observable({
                SystemPassword_submitRunning: false
            });
            this.topWindow = ko.observable(true);
            // - new keyPair FORM manager
            this.SystemAdministratorEmailAddress = ko.observable('');
            this.EmailAddressError = ko.observable(false);
            this.NickNameError = ko.observable(false);
            this.SystemAdministratorNickName = ko.observable('');
            this.keyPairLengthSelect = ko.observable('2048');
            this.SystemPassword_submitRunning = ko.observable(false);
            this.newKeyPairRunningCancelButtonShow = ko.observable(false);
            this.keyPairGenerateFormActive = ko.observable(false);
            this.delete_btn_view = ko.observable(false);
            this.showVersionUpdata = ko.observable(true);
            this.showInsideFireWallEmail = ko.observable(false);
            this.connectEmail = ko.observable('');
            this.showKeyPairInformation = ko.observable(false);
            this.doingProcessBarTime = null;
            // - end FORM manager
            // - keyPair info manager
            this.keyPair = ko.observable(initKeyPair);
            this.keyPair_delete_btn_view = ko.observable(false);
            this.keyPair_unLock_btn_view = ko.observable(false);
            this.keyPair_logoutPanel_view = ko.observable(false);
            this.logoutPanel_view = ko.observable(false);
            this.passwordError = ko.observable(false);
            this.passwordChecking = ko.observable(false);
            this.imapInputFormActive = ko.observable(false);
            this.showPasswordErrorMessage = ko.observable(false);
            this.conformFormShow = ko.observable(false);
            this.keyLengthInfoShow = ko.observable(false);
            this.showAddImapDataButton = ko.observable(false);
            this.QTGateRegions = ko.observableArray(_QTGateRegions);
            this.QTGateRegionsSetup = ko.observableArray(QTGateRegionsSetup);
            this.selectedQTGateRegion = ko.observable(this.QTGateRegions()[0]);
            this.showSystemError = ko.observable(false);
            this.feed = ko.observableArray([]);
            // - keyPair info manager
            this.keyPairInfomationView = ko.observable(false);
            // - linuxUpdate pages
            this.linuxUpdateStep = ko.observable(true);
            // - linuxUpdate pages
            // - IMAP email setup view
            this.emailAddressDoingCheck = ko.observable(false);
            this.cancelImapConnect = ko.observable(false);
            this.emailPool = ko.observableArray([]);
            this.showQTGateImapAccount = ko.observable(false);
            // - IMAP email setup view
            // - conformMailForm
            this.checkActiveEmailError = ko.observable(false);
            this.conformText = ko.observable('');
            this.conformTextError = ko.observable(false);
            this.checkingActiveEmail = ko.observable(false);
            this.showConformMailForm = ko.observable(false);
            this.connectingImapAccount = ko.observable(false);
            this.QTGateConnectActive = ko.observable(false);
            this.QTGateConnectRegionActive = ko.observable(false);
            this.QTGateConnectError = ko.observable(0);
            this.showTimeoutMessage = ko.observable(false);
            this.UserPermentShapeDetail = ko.observable(false);
            //-
            //- QTGate connect
            this.showSendIMAPToQTGateInfo = ko.observable(false);
            this.commandStatus = ko.observable('');
            this.QTGateRegionInfo = ko.observable(false);
            this.QTGateConnect_SelectTech = ko.observable(-1);
            this.QTGateConnect1 = ko.observable('');
            this.QTGateMultipleGateway = ko.observable(1);
            this.QTGateMultipleGatewayPool = ko.observableArray([1, 2, 4]);
            this.QTGateConnect2 = ko.observable(false);
            this.QTGateConnectSelectImap = ko.observable(0);
            this.QTGateAllData = ko.observable(false);
            this.QTGateCacheUse = ko.observable(false);
            this.QTGate_CacheTime = ko.observable(0);
            this.QTGate_showDeleteCacheButton = ko.observable(false);
            this.QTGateLocalProxyPort = ko.observable(3001);
            this.QTGateLoacalProxyPath = ko.observable((Math.random() * 100000).toString());
            this.localProxyPortError = ko.observable(false);
            this.QTGateGatewayPortError = ko.observable(false);
            this.QTGateGatewayActive = ko.observable(false);
            this.QTGateGatewayActiveProcess = ko.observable(false);
            this.QTGateGatewayError = ko.observable(-1);
            this.QTTransferData = ko.observable();
            this.QTConnectData = ko.observable(dummyIConnectCommand);
            this.MenuItems = ko.observable([false, true, false, false, false]);
            this.showKeyPairPorcess = ko.observable(false);
            this.showDisconnectbutton = ko.observable(true);
            this.ConnectGatewayShow = ko.observable(false);
            this.portNumberError = ko.observable(false);
            this.canDoAtEmail = ko.observable(false);
            this.reSendConnectMail = ko.observable(false);
            this.showRegionData = ko.observable(false);
            this.QTGateAccountPlan = ko.observable();
            this.QTGconnected = ko.observable(false);
            //-
            //- Donate
            this.donateDataPool = ko.observableArray(donateArray);
            //-
            this.config = ko.observable({
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
            });
            this.showSendImapDataConfirm = ko.observable(false);
            this.percent = 0;
            this.showConnectImformationProcess = ko.observable(false);
            this.sendConnectRequestMail = ko.observable(false);
            this.QTGateRegionERROR = ko.observable(-1);
            this.LocalLanguage = 'up';
            this.showActiveMail = ko.observable(false);
            this.selectItem = (that, site) => {
                const self = this;
                const tindex = lang[self.tLang()];
                let index = tindex + 1;
                if (index > 3) {
                    index = 0;
                }
                self.languageIndex(index);
                self.tLang(lang[index]);
                $.cookie('langEH', self.tLang(), { expires: 180, path: '/' });
                const obj = $("span[ve-data-bind]");
                obj.each((index, element) => {
                    const self = this;
                    const ele = $(element);
                    const data = ele.attr('ve-data-bind');
                    if (data && data.length) {
                        ele.text(eval(data));
                    }
                });
                $('.languageText').shape('flip ' + this.LocalLanguage);
                return $('.KnockoutAnimation').transition('jiggle');
            };
            this.showMainScreenBackOverflowShow = null;
            this.feedBackAttachImg = ko.observable('');
            this.feedBackAttachImgPath = ko.observable('');
            this.attachedLog = ko.observable('');
            this.feedBackTextArea = ko.observable('');
            this.hacked = ko.observable(false);
            this.UserPermentShape = ko.observable(false);
            this.UserPerment = ko.observable(false);
            this.conformButtom = ko.computed(() => {
                this.conformTextError(false);
                const text = this.conformText();
                if (!text.length)
                    return false;
                return true;
            });
            this.connectQTGateShow = ko.observable(false);
            this.requestPortNumber = ko.observable(80);
            this.disconnecting = ko.observable(false);
            this.getCurrentPlan = ko.computed(() => {
                if (!this.QTTransferData())
                    return null;
                return planArray[planArray.findIndex(n => {
                    return n.name === this.QTTransferData().productionPackage;
                })];
            });
            this.getPaymentPlan = ko.computed(() => {
                if (!this.QTGateAccountPlan())
                    return null;
                return planArray[planArray.findIndex(n => {
                    return n.name === this.QTGateAccountPlan();
                })];
            });
            this.getNextPlanArray = ko.computed(() => {
                if (!this.QTTransferData())
                    return ko.observableArray([]);
                const index = planArray.findIndex(n => {
                    return n.name === this.QTTransferData().productionPackage;
                });
                return ko.observableArray(planArray.slice(index + 1));
            });
            this.getBackPlanArray = ko.computed(() => {
                if (!this.QTTransferData())
                    return ko.observableArray([]);
                const index = planArray.findIndex(n => {
                    return n.name === this.QTTransferData().productionPackage;
                });
                return ko.observableArray(planArray.slice(0, index));
            });
            this.newVersionInstallLoading = ko.observable(false);
            this.pingCheckLoading = ko.observable(false);
            this.pingError = ko.observable(false);
            this.haveQTGateImapAccount = ko.computed(() => {
                const index = this.emailPool().findIndex(n => { return availableImapServer.test(n.iMapServerName()); });
                return index > -1;
            });
            this.requestActivEmailrunning = ko.observable(false);
            this.showSentActivEmail = ko.observable(-1);
            this.showStripeError = ko.observable(false);
            this.cardType = ko.observable('');
            this.tokenId = null;
            this.canShowCancelSubscriptionButton = ko.computed(() => {
                return this.QTTransferData() && this.QTTransferData().paidID && (this.QTTransferData().isAnnual || this.QTTransferData().automatically);
            });
            this.paymentSelect = ko.observable(false);
            this.paymentPlan = ko.observable();
            this.isAnnual = ko.observable(false);
            this.cardpay = ko.observable(false);
            this.cardNumber = ko.observable('');
            this.cardcvc = ko.observable('');
            this.cardExpirationYear = ko.observable('');
            this.cardExpirationYearFolder_Error = ko.observable(false);
            this.cardPostcode = ko.observable('');
            this.doingPayment = ko.observable(false);
            this.cardpaStripe = ko.observable(false);
            this.stripeCheckoutEnable = ko.observable(false);
            this.Alipay_error = ko.observable(false);
            this.autoRenew = ko.observable(false);
            this.currentPlanPrice = ko.computed(() => {
                if (!this.getCurrentPlan() || !this.getCurrentPlan().monthlyPay)
                    return '';
                return ' $' + this.getCurrentPlan().monthlyPay;
            });
            this.showCurrentPlanExpire = ko.computed(() => {
                if (this.config().freeUser || !this.getCurrentPlan() || !this.QTTransferData() || !this.QTTransferData().expire)
                    return null;
                return new Date(this.QTTransferData().expire).toLocaleDateString();
            });
            this.showBandwidthRemaining = ko.computed(() => {
                if (!this.getCurrentPlan() || !this.QTTransferData())
                    return null;
                return Math.round(this.QTTransferData().availableMonthlyTransfer * 100 / this.QTTransferData().transferMonthly) + '%';
            });
            this.showCurrentPlanBalance = ko.computed(() => {
                if (!this.getCurrentPlan() || !this.QTTransferData())
                    return null;
                return getCurrentPlanUpgradelBalance(this.QTTransferData().expire, this.QTTransferData().productionPackage, this.QTTransferData().isAnnual);
            });
            this.selectPlanPrice = ko.computed(() => {
                if (!this.getPaymentPlan())
                    return null;
                return getPlanPrice(this.getPaymentPlan().name, this.isAnnual());
            });
            this.totalAmount = ko.computed(() => {
                const amount = (Math.round((this.selectPlanPrice() - this.showCurrentPlanBalance()) * 100) / 100).toString();
                if (!/\./.test(amount)) {
                    return amount + '.00';
                }
                return amount;
            });
            this.showSuccessPayment = ko.observable(false);
            this.cancelPlanButton = ko.observable(false);
            this.cancelPlanProcess = ko.observable(false);
            this.cardNumberFolder_Error = ko.observable(false);
            this.cvcNumber_Error = ko.observable(false);
            this.postcode_Error = ko.observable(false);
            this.cardPayment_Error = ko.observable(false);
            this.paymentDataFormat_Error = ko.observable(false);
            this.paymentCardFailed = ko.observable(false);
            this.cardNotSupport = ko.observable(false);
            this.showQTGateConnectOption = ko.observable(false);
            this.cardErrorMessage = ko.computed(() => {
                //輸入的信用卡號有誤！'，'輸入的信用卡期限有誤！'，'輸入的信用卡安全碼有誤！'，'輸入的信用卡持有人郵編有誤！
                if (this.cardNumberFolder_Error())
                    return 0;
                if (this.cvcNumber_Error())
                    return 2;
                if (this.postcode_Error())
                    return 3;
                if (this.cardExpirationYearFolder_Error())
                    return 1;
                if (this.cardPayment_Error())
                    return 4;
                if (this.paymentDataFormat_Error())
                    return 5;
                if (this.paymentCardFailed())
                    return 6;
                return null;
            });
            this.showCancelSuccess = ko.observable(false);
            this.cancel_Amount = ko.observable(0);
            this.promoButton = ko.observable(false);
            this.promoInput = ko.observable('');
            this.promoInputError = ko.observable(false);
            this.getMonthData = ko.computed(() => {
                if (!this.QTTransferData()) {
                    return { data: null, ch: null };
                }
                const data = this.QTTransferData().transferMonthly;
                let ch = 0;
                const ret = Math.round(data / (ch = oneMB)) > 1000 ? (Math.round(data / (ch = oneGB)) > 1000 ? Math.round(data / (ch = oneTB)) : Math.round(data / oneGB)) : Math.round(data / oneMB);
                return { data: ret, ch: ch === oneMB ? 'MB' : (ch === oneGB) ? 'GB' : 'TB' };
            });
            this.getMonthAvailableData = ko.computed(() => {
                if (!this.QTTransferData()) {
                    return { data: null, ch: null };
                }
                const data = this.QTTransferData().transferMonthly - this.QTTransferData().availableDayTransfer;
                let ch = 0;
                const ret = Math.round(data / (ch = oneMB)) > 1000 ? (Math.round(data / (ch = oneGB)) > 1000 ? Math.round(data / (ch = oneTB)) : Math.round(data / oneGB)) : Math.round(data / oneMB);
                return { data: ret, ch: ch === oneMB ? 'MB' : (ch === oneGB) ? 'GB' : 'TB' };
            });
            this.showThirdPartyApp = ko.observable(false);
            this.appList = ko.observableArray(appList);
            this.QTGateLocalProxyPort.subscribe(newValue => {
                this.localProxyPortError(false);
                const num = parseInt(newValue.toString());
                if (!/^[0-9]*$/.test(newValue.toString()) || !num || num < 1000 || num > 65535) {
                    this.localProxyPortError(true);
                    return $('.activating.element').popup({
                        on: 'focus',
                        movePopup: false
                    });
                }
                return socketIo.emit('checkPort', newValue, err => {
                    return this.localProxyPortError(err);
                });
            });
            this.cardExpirationYear.subscribe(newValue => {
                this.clearPaymentError();
                if (!newValue || !newValue.length)
                    return;
                if (newValue.length < 7)
                    return this.cardExpirationYearFolder_Error(true);
                const now = new Date().getTime();
                const value = new Date(new Date('1/' + newValue).getTime() + oneDayTime).getTime();
                if (value - now > 0)
                    return;
                this.cardExpirationYearFolder_Error(true);
            });
            this.cardNumber.subscribe(newValue => {
                return this.clearPaymentError();
            });
            this.cardPostcode.subscribe(newValue => {
                return this.clearPaymentError();
            });
            this.cardcvc.subscribe(newValue => {
                return this.clearPaymentError();
            });
            this.requestPortNumber.subscribe(newValue => {
                this.QTGateGatewayPortError(false);
                if (newValue < 1 || newValue > 65535) {
                    this.QTGateGatewayPortError(true);
                    return $('.activating.element').popup({
                        on: 'focus',
                        movePopup: false
                    });
                }
            });
            this.SystemAdministratorEmailAddress.subscribe(newValue => {
                $('.ui.checkbox').checkbox();
                const email = newValue;
                this.EmailAddressError(false);
                this.NickNameError(false);
                if (!email.length)
                    return true;
                if (checkEmail(email).length) {
                    this.EmailAddressError(true);
                    $('.activating.element').popup({
                        on: 'focus',
                        movePopup: false
                    });
                }
                if (!this.SystemAdministratorNickName().length) {
                    this.SystemAdministratorNickName(getNickName(email));
                }
                if (insideChinaEmail.test(email)) {
                    this.showInsideFireWallEmail(true);
                }
                return true;
            });
            this.systemSetup_systemPassword.subscribe(newValue => {
                this.passwordError(false);
                this.NickNameError(false);
                this.showPasswordErrorMessage(false);
                if (!newValue.length)
                    return;
                if (newValue.length < 5) {
                    this.showPasswordErrorMessage(false);
                    $('.activating.element').popup({
                        on: 'focus',
                        movePopup: false,
                        position: 'bottom'
                    });
                    return this.passwordError(true);
                }
            });
            socketIo = io({ reconnectionAttempts: 5, timeout: 1000 });
            socketIo.once('connect', () => {
                return socketIo.emit('init', (err, data) => {
                    this.config(data);
                    if (!data.keypair.createDate)
                        this.keyPairGenerateFormActive(true);
                    else
                        this.showKeyPairInformation(true);
                    this.QTGateConnect1(data.lastConnectType ? data.lastConnectType.toString() : '1');
                    this.keyPair(data.keypair);
                    return $('.activating.element').popup({
                        on: 'focus',
                        position: 'bottom left',
                    });
                });
            });
            socketIo.on('newKeyPairCallBack', (data) => {
                if (!data) {
                    if (this.CancelCreateKeyPairSent)
                        return this.CancelCreateKeyPairSent = false;
                    return this.MakeErrorNotify('errorKeyPair', null);
                }
                this.keyPair(data);
                this.showAddImapDataButton(false);
                this.passwordError(false);
                this.SystemPassword_submitRunning(false);
                this.keyPair_delete_btn_view(false);
                this.newKeyPairRunningCancelButtonShow(false);
                this.showKeyPairPorcess(false);
                this.showKeyPairInformation(true);
                this.emailPool([new emailPoolData(this)]);
                this.imapInputFormActive(true);
                return this.MenuItems([false, false, true, false, false]);
            });
            socketIo.on('KeyPairActiveCallBack', (data) => {
                return this.keyPair(data);
            });
            socketIo.on('ImapData', (data) => {
                this.imapInputFormActive(true);
                this.showQTGateImapAccount(true);
                if (!data || !data.length)
                    return;
                this.emailPool([]);
                data.forEach(n => {
                    const temp = new emailPoolData(this);
                    temp.fromIInputData(n);
                    this.emailPool.push(temp);
                });
                const fromIInputData = $('.rating');
                fromIInputData.rating('disable');
                const index = this.emailPool().findIndex(n => { return n.emailAddress().length === 0; });
                if (index < 0) {
                    return this.showAddImapDataButton(true);
                }
                return this.showQTGateImapAccount(false);
            });
            socketIo.on('deleteKeyPair', () => {
                return window.location.replace('/');
            });
            socketIo.on('config', config => {
                return this.config(config);
            });
            socketIo.on('checkActiveEmailError', err => {
                if (err !== null && err > -1) {
                    if (err === 9) {
                        //      err = 3     password have not match from QTGate system
                        //      err = 4     unformat data from QTGate system
                        //      err = 6     QTGate connect pair timeout from server.js
                        this.modalContent(infoDefine[this.languageIndex()].emailConform.formatError[err]);
                        return $('.ui.basic.modal').modal('setting', 'closable', false).modal('show');
                    }
                    this.conformTextError(true);
                    this.conformTextErrorNumber(err);
                    this.QTGateConnecting(2);
                    return $('.activating.element1').popup({
                        on: 'click',
                        position: 'left center',
                        target: '#SendToQTGateTextArea',
                        onHidden: () => {
                            this.conformTextError(false);
                        }
                    });
                }
                return this.QTGateConnecting(4);
            });
            socketIo.on('qtGateConnect', (data) => {
                return this.qtGateConnectEvent111(data);
            });
            socketIo.once('reconnect_error', err => {
                if (this.modalContent().length)
                    return;
                this.modalContent(infoDefine[this.languageIndex()].emailConform.formatError[10]);
                return $('.ui.basic.modal').modal('setting', 'closable', false).modal('show');
            });
            socketIo.on('QTGateGatewayConnectRequest', (err, data) => {
                return this.QTGateGatewayConnectRequestCallBack(err, data);
            });
            socketIo.on('pingCheck', (region, ping) => {
                return this.pingCheckReturn(region, ping);
            });
        }
        MakeNotify(note, _title, type, addNode, keepTime) {
            const self = this;
            const title = _title ? 'infoDefine [ self.languageIndex ()].error_message.' + _title : '';
            let detail = note ? `infoDefine [ self.languageIndex ()].error_message.${note}` : null;
            detail += addNode ? `<p>${addNode}</p>` : '';
        }
        MakeErrorNotify(note, addNote) {
            return this.MakeNotify(note, 'errorNotifyTitle', 'alert', addNote, null);
        }
        MakeInfoNotify(note, addNote) {
            return this.MakeNotify(note, 'Success', 'success', addNote, 5000);
        }
        newVersionInstall() {
            this.newVersionInstallLoading(true);
            return socketIo.emit('newVersionInstall');
        }
        deletePasswordNext() {
            socketIo.emit('deleteKeyPair');
        }
        showBrokenHeart() {
            return $('.ui.basic.modal').modal('setting', 'closable', false).modal('show');
        }
        showAppWindows() {
            this.menuClick(9, true);
            $('.dimmable').dimmer({ on: 'hover' });
            return $('.comeSoon').popup();
        }
        qtGateConnectEvent111(data) {
            //     reset show send request mail need more time
            this.connectQTGateShow(false);
            //      have no imap data
            if (!data) {
                //      show imap manager area
                this.menuClick(2, true);
                return this.QTGateConnectActive(false);
            }
            this.sendConnectRequestMail(false);
            this.reSendConnectMail(false);
            this.menuClick(3, true);
            this.QTGateConnectActive(!this.keyPair().verified);
            this.QTGateConnectRegionActive(this.keyPair().verified);
            //      progress bar area
            this.QTGateRegionInfo(this.keyPair().verified);
            if (data && data.qtgateConnectImapAccount && data.qtgateConnectImapAccount.length) {
                const uu = this.emailPool().findIndex(n => { return n.uuid === data.qtgateConnectImapAccount; });
                this.QTGateConnectSelectImap(uu);
            }
            const imapData = this.QTGateConnecting(this.QTGateConnectSelectImap());
            this.QTGateConnecting(data.qtGateConnecting);
            switch (data.qtGateConnecting) {
                //          show send imap data 
                case 0: {
                    this.QTGateRegionInfo(false);
                    this.reSendConnectMail(true);
                    return this.showSendImapDataConfirm(true);
                }
                //          show send request mail need more time
                case 6: {
                    this.sendConnectRequestMail(true);
                    return this.connectQTGateShow(true);
                }
                //          connecting finished
                case 2: {
                    this.QTGateRegionInfo(true);
                    this.QTGconnected(true);
                    this.stopGetRegionProcessBar();
                    if (this.keyPair().verified) {
                        return this.showAppWindows();
                    }
                    return;
                }
                case 3: {
                    return;
                }
                case 1: {
                    if (this.keyPair().verified) {
                        this.showSendImapDataConfirm(false);
                        this.showGetRegionProcessBarStart();
                    }
                    return;
                }
                //      QTGate connecting disconnect
                case 11: {
                    this.stopGetRegionProcessBar();
                    return this.showTimeoutMessage(true);
                }
                default: {
                    return alert(`switch data.qtGateConnecting goto default! data.qtGateConnecting = [${data.qtGateConnecting}]`);
                }
            }
        }
        stopGetRegionProcessBar() {
            const process = $('#connectImformationProcess');
            clearTimeout(this.doingProcessBarTime);
            process.progress('reset');
            this.showConnectImformationProcess(false);
        }
        showActiveAccountForm() {
            this.menuClick(3, true);
            return this.imapInputFormActive(false);
        }
        showWillSendImapInfoEmailToQTGateComfirm() {
            this.showActiveAccountForm();
        }
        showGetRegionProcessBarStart() {
            const process = $('#connectImformationProcess');
            const doingProcessBar = () => {
                clearTimeout(this.doingProcessBarTime);
                this.doingProcessBarTime = setTimeout(() => {
                    process.progress({
                        percent: ++this.percent
                    });
                    if (this.percent < 100)
                        return doingProcessBar();
                }, 1000);
            };
            this.menuClick(9, true);
            this.showConnectImformationProcess(true);
            return doingProcessBar();
        }
        showSentImapMail_waitingConnecting() {
            this.showActiveAccountForm();
            this.showTimeoutMessage(false);
            if (this.keyPair().verified)
                return this.sendConnectRequestMail(true);
            return this.connectQTGateShow(true);
        }
        showMainScreen() {
            $('.mainScreen').addClass('animated slideInRight').show().one(animationEnd, () => {
                $('.mainScreen').removeClass('animated slideInRight');
                $('.mainScreen1').animate({
                    opacity: "show"
                }, 800);
                const body = $("html, body");
                return body.stop().animate({ scrollTop: 0 }, 100, 'swing', () => { });
            });
            return socketIo.emit('agree', () => {
                const kk = this.config();
                kk.firstRun = false;
                return this.config(kk);
            });
        }
        agreeClick() {
            $('#cover1').remove();
            this.overflowShow(false);
            $('#firstNode').addClass('animated slideOutLeft').one(animationEnd, () => {
                $('#firstNode').removeClass('animated slideOutLeft').hide();
            });
            return this.showMainScreen();
        }
        tileClick(data) {
            const self = this;
            self.keyPairLengthSelect(data);
            return true;
        }
        showFeedBackWin() {
            $('.mainScreen').hide();
            $('#feedBackView').addClass('animated bounceIn').show().one(animationEnd, () => {
                $('#feedBackView').removeClass('animated bounceIn');
            });
            this.showMainScreenBackOverflowShow = this.overflowShow();
            this.overflowShow(true);
        }
        returnMainWin(winName) {
            $(winName).hide();
            $('.mainScreen').animate({
                opacity: "show"
            }, 800);
            const body = $("html, body");
            return body.stop().animate({ scrollTop: 0 }, 100, 'swing', () => {
                return this.overflowShow(this.showMainScreenBackOverflowShow);
            });
        }
        showUserInfoMacOS(view, _self) {
            $('.mainScreen').hide();
            $(view).animate({
                opacity: "show"
            }, 800);
            _self.showMainScreenBackOverflowShow = _self.overflowShow();
            _self.overflowShow(true);
        }
        takeScreen() {
            return socketIo.emit('takeScreen', (err, img) => {
                if (err) {
                    return alert(err.message);
                }
                this.feedBackAttachImg(img.screenshotUrl);
                this.showFeedBackWin();
                this.attachedLog();
                return this.feedBackAttachImgPath(img.screenshotSavePath);
            });
        }
        feedBackSuccess() {
            this.returnMainWin('#feedBackView');
            const data = {
                attachedLog: this.attachedLog(),
                attachImagePath: this.feedBackAttachImgPath(),
                comment: this.feedBackTextArea(),
                date: new Date().toISOString()
            };
            return socketIo.emit('feedBackSuccess', data);
        }
        openFeedBackAttachImg() {
            const { shell } = require('electron');
            return shell.openExternal(`file://${this.feedBackAttachImgPath()}`);
        }
        openFeedBackAttachLog() {
            const Fs = require('fs');
            const path = require('path');
            const Os = require('os');
            const QTGateFolder = path.join(Os.homedir(), '.QTGate/systemError.log');
            return Fs.readFile(QTGateFolder, 'utf8', (err, data) => {
                if (err)
                    return;
                const u = data.split('\n');
                const uuu = '<p>' + u.join('</p><p>') + '</p>';
                this.attachedLog(uuu);
            });
        }
        CancelCreateKeyPair() {
            socketIo.emit('CancelCreateKeyPair');
            clearTimeout(this.doingProcessBarTime);
            this.SystemPassword_submitRunning(false);
            this.newKeyPairRunningCancelButtonShow(false);
            this.showKeyPairInformation(false);
            this.keyPairGenerateFormActive(true);
            this.showKeyPairPorcess(false);
            return this.CancelCreateKeyPairSent = true;
        }
        canShowAddAImapButton() {
            const index = this.emailPool().findIndex(n => { return n.emailAddress().length === 0; });
            if (index === -1) {
                return this.showAddImapDataButton(true);
            }
            return this.showAddImapDataButton(false);
        }
        addANewImapData(_self) {
            const index = _self.emailPool().findIndex(n => { return n.emailAddress().length === 0; });
            if (index === -1) {
                const temp = new emailPoolData(_self);
                _self.emailPool.push(temp);
                _self.showAddImapDataButton(false);
            }
        }
        form_AdministratorEmail_submit() {
            //self.SystemEmailErrorItem ( '' )
            this.EmailAddressError(false);
            this.passwordError(false);
            this.NickNameError(false);
            let email = this.SystemAdministratorEmailAddress();
            //   check email
            if (checkEmail(email).length) {
                this.EmailAddressError(true);
            }
            //    check nick name
            if (!this.SystemAdministratorNickName().length) {
                this.NickNameError(true);
            }
            //    check password
            if (this.systemSetup_systemPassword().length < 5) {
                this.passwordError(true);
            }
            if (this.passwordError() || this.EmailAddressError() || this.passwordError()) {
                $('.activating.element').popup({
                    on: 'focus',
                    movePopup: false
                });
                return true;
            }
            this.SystemPassword_submitRunning(true);
            this.newKeyPairRunningCancelButtonShow(true);
            this.delete_btn_view(false);
            this.keyPairGenerateFormActive(false);
            const sendData = {
                password: this.systemSetup_systemPassword(),
                keyLength: this.keyPairLengthSelect(),
                nikeName: this.SystemAdministratorNickName(),
                email: email
            };
            const callBack = (err) => {
                this.SystemPassword_submitRunning(false);
                this.newKeyPairRunningCancelButtonShow(false);
                $('.ui.accordion').accordion('refresh');
                //$.cookie ( passwdCookieName, this.systemSetup_systemPassword ())
                if (err)
                    this.MakeErrorNotify('finishedKeyPair', err.message);
                else
                    this.MakeInfoNotify('finishedKeyPair', null);
            };
            let percent = 1;
            $('.keyPairProcessBar').progress('reset');
            const timeSet = parseInt(sendData.keyLength) * 0.2;
            const doingProcessBar = () => {
                clearTimeout(this.doingProcessBarTime);
                this.doingProcessBarTime = setTimeout(() => {
                    $('.keyPairProcessBar').progress({
                        percent: ++percent
                    });
                    if (percent < 100)
                        return doingProcessBar();
                }, timeSet);
            };
            doingProcessBar();
            this.showKeyPairPorcess(true);
            $.removeCookie(passwdCookieName);
            socketIo.emit('NewKeyPair', sendData);
            return false; //    ！！！！，Page will reflash if return true;
        }
        startClick() {
            $('.ui.accordion').accordion();
            $('.ui.checkbox').checkbox();
            $('.languageItem').removeClass('languageTextCoverColor');
            this.overflowShow(false);
            $('#cover1').addClass('animated slideOutLeft').one(animationEnd, () => {
                setTimeout(() => {
                    if (!this.config().firstRun) {
                        return $('#cover1').remove();
                    }
                    return $('#cover1').removeClass('animated slideOutLeft');
                }, 2000);
            });
            if (this.config().firstRun)
                return $('#firstNode').addClass('animated slideInRight').show().one(animationEnd, () => {
                    this.overflowShow(true);
                    $('#firstNode').removeClass('animated slideInRight');
                });
            return this.showMainScreen();
        }
        disAgreeClick() {
            $('.languageItem').addClass('languageTextCoverColor');
            $('#cover1').show().addClass('animated slideInLeft').one(animationEnd, () => {
                $('#cover1').removeClass('animated slideInLeft').show();
            });
            $('#firstNode').addClass('animated slideOutRight').one(animationEnd, () => {
                $('#firstNode').removeClass('animated slideOutRight').hide();
            });
        }
        keyPair_checkPemPasswordClick() {
            this.passwordError(false);
            this.showSystemError(false);
            this.keyPair_delete_btn_view(false);
            this.keyPair_unLock_btn_view(false);
            this.passwordChecking(true);
            this.showPasswordErrorMessage(false);
            const password = this.systemSetup_systemPassword();
            this.commandStatus('checkActiveEmailSubmit');
            socketIo.emit('checkPemPassword', password, (data, iinputData) => {
                this.passwordChecking(false);
                this.showQTGateImapAccount(true);
                if (typeof data !== 'boolean') {
                    this.showSystemError(true);
                    return true;
                }
                if (data) {
                    const key = this.keyPair();
                    key.passwordOK = true;
                    this.keyPair(key);
                    this.imapInputFormActive(true);
                    this.MenuItems([false, false, true, false]);
                    if (!iinputData || !iinputData.length) {
                        return this.emailPool([new emailPoolData(this)]);
                    }
                    iinputData.forEach(n => {
                        const emailPool = new emailPoolData(this);
                        emailPool.fromIInputData(n);
                        this.emailPool.push(emailPool);
                        const fromIInputData = $('.rating');
                        fromIInputData.rating('disable');
                    });
                    if (this.emailPool().length > 1) {
                        this.showQTGateImapAccount(false);
                    }
                    this.canShowAddAImapButton();
                    /*
                    const index = this.emailPool().findIndex ( n => { return n.sendToQTGate()})
                    if ( index < 0 ) {
                        return this.qtgateImapAccount ( 0 )
                    }
                    this.emailPool()[0].emailAddress
                    
                    return this.qtgateImapAccount ( index )
                    */
                }
                this.showPasswordErrorMessage(true);
                $('.activating.element').popup({
                    on: 'focus',
                    movePopup: false
                });
                return true;
            });
        }
        showPlanetElement(elem) {
            if (elem.nodeType === 1)
                $(elem).hide().slideDown();
        }
        hidePlanetElement(elem) {
            if (elem.nodeType === 1)
                $(elem).slideUp(() => {
                    $(elem).remove();
                });
        }
        checkActiveEmailSubmit() {
            this.checkActiveEmailError(false);
            this.checkingActiveEmail(true);
            this.QTGateConnecting(4);
            let text = this.conformText();
            //      Outlook Mail 
            return socketIo.emit('checkActiveEmailSubmit', text);
        }
        /*
        public connectQTGate () {
            //this.connectQTGateShow ( true )
            //this.QTGateConnecting ( 1 )
            socketIo.emit ( 'connectQTGate1', this.emailPool()[ this.QTGateConnectSelectImap() ].uuid )
        }
        */
        connectQTGate1() {
            this.showTimeoutMessage(false);
            this.showActiveMail(false);
            this.showSendImapDataConfirm(false);
            this.showGetRegionProcessBarStart();
            socketIo.emit('connectQTGate1', this.emailPool()[this.QTGateConnectSelectImap()].uuid);
        }
        selectedQTGateRegionCancel() {
            this.selectedQTGateRegion().selected(false);
            this.selectedQTGateRegion().showExtraContent(false);
            this.ConnectGatewayShow(false);
            this.QTGateConnectRegionActive(true);
            this.menuClick(3, true);
            return false;
        }
        QTGateRegionCardClick(index) {
            const uu = this.QTGateRegions()[index];
            uu.selected(true);
            this.selectedQTGateRegion(uu);
            uu.showExtraContent(true);
            this.ConnectGatewayShow(true);
            const body = $("html, body");
            body.stop().animate({ scrollTop: 0 }, 100, 'swing', () => {
                return this.overflowShow(true);
            });
            return $('.popupField').popup({
                on: 'click',
                position: 'bottom center',
            });
        }
        menuClick(index, scroll) {
            const uu = new Array(8).fill(false);
            uu[index] = true;
            this.UserPerment(false);
            this.MenuItems(uu);
            const body = $("html, body");
            return body.stop().animate({ scrollTop: 0 }, 100, 'swing', () => {
                return this.overflowShow(scroll);
            });
        }
        QTGateConnect1Click(em) {
            const uu = $(em).val();
            this.QTGateConnect1(uu.toString());
        }
        QTGateGatewayConnectRequest() {
            const data = this.selectedQTGateRegion();
            return socketIo.emit('checkPort', this.QTGateLocalProxyPort(), err => {
                if (err) {
                    return this.localProxyPortError(err);
                }
                const connect = {
                    account: this.config().account,
                    imapData: this.emailPool()[this.QTGateConnectSelectImap()].GetImapData(),
                    gateWayIpAddress: null,
                    region: data.qtRegion,
                    connectType: this.QTGateConnect1() === '1' ? 2 : 1,
                    localServerPort: this.QTGateLocalProxyPort(),
                    AllDataToGateway: !this.QTGateConnect2(),
                    error: null,
                    fingerprint: null,
                    localServerIp: null,
                    multipleGateway: [],
                    requestPortNumber: this.requestPortNumber(),
                    requestMultipleGateway: this.QTGateMultipleGateway()
                };
                data.error(-1);
                //root.QTGateConnectRegionActive ( false )
                //root.QTGateGatewayActiveProcess ( true )
                const process = $('.regionConnectProcessBar').progress('reset');
                clearTimeout(this.doingProcessBarTime);
                this.percent = 0;
                const doingProcessBar = () => {
                    clearTimeout(this.doingProcessBarTime);
                    this.doingProcessBarTime = setTimeout(() => {
                        process.progress({
                            percent: ++this.percent
                        });
                        if (this.percent < 100)
                            return doingProcessBar();
                    }, 1000);
                };
                doingProcessBar();
                data.showExtraContent(false);
                data.showRegionConnectProcessBar(true);
                socketIo.emit('QTGateGatewayConnectRequest', connect, (err, _data) => {
                    return this.QTGateGatewayConnectRequestCallBack(err, _data);
                });
                return false;
            });
        }
        QTGateGatewayConnectRequestCallBack(error, connectCommand) {
            clearTimeout(this.doingProcessBarTime);
            const selectedQTGateRegion = this.selectedQTGateRegion();
            selectedQTGateRegion.showRegionConnectProcessBar(false);
            if (error > -1) {
                selectedQTGateRegion.showExtraContent(true);
                //this.QTGateConnectRegionActive ( true )
                //this.QTGateGatewayActiveProcess ( false )
                selectedQTGateRegion.error(error);
                return this.menuClick(3, true);
            }
            const data1 = connectCommand[0];
            if (data1) {
                this.QTTransferData(data1.transferData);
                this.QTConnectData(data1);
                const index = this.QTGateRegions().findIndex((n) => { return n.qtRegion === data1.region; });
                if (index < 0) {
                    return;
                }
                const data = this.QTGateRegions()[index];
                this.selectedQTGateRegion(data);
                data.selected(true);
                data.showExtraContent(false);
                data.available(true);
                this.config().freeUser = /free/.test(data1.transferData.productionPackage) ? true : false;
                this.config(this.config());
                $('.userDetail').progress();
                this.QTGateConnectRegionActive(true);
                this.menuClick(3, false);
                this.ConnectGatewayShow(true);
                return data.showConnectedArea(true);
            }
        }
        getAvaliableRegionCallBack(region, dataTransfer, config) {
            this.QTGateRegions().forEach(n => {
                const index = region.findIndex(nn => { return nn === n.qtRegion; });
                if (index < 0)
                    return n.available(false);
                return n.available(true);
            });
            this.QTGateRegions.sort((a, b) => {
                if (a.available() === b.available())
                    return 0;
                if (b.available() && !a.available()) {
                    return 1;
                }
                return -1;
            });
            const uu = checkCanDoAtQTGate(this.emailPool);
            if (uu > -1) {
                this.QTGateConnectSelectImap(uu);
                this.canDoAtEmail(true);
                this.showQTGateImapAccount(false);
            }
            else {
                this.QTGateConnectSelectImap(0);
            }
            $('.ui.dropdown').dropdown();
            this.QTTransferData(dataTransfer);
            this.config(config);
            this.showRegionData(true);
            this.QTGateRegionInfo(false);
            this.pingCheckLoading(false);
            return clearTimeout(this.doingProcessBarTime);
        }
        getAvaliableRegion() {
            if (this.pingCheckLoading()) {
                return;
            }
            this.pingCheckLoading(true);
            this.showRegionData(false);
            socketIo.emit('getAvaliableRegion', (region, dataTransfer, config) => {
                if (region && region.length)
                    return this.getAvaliableRegionCallBack(region, dataTransfer, config);
            });
        }
        desconnectCallBack() {
            this.selectedQTGateRegion().showConnectedArea(false);
            this.ConnectGatewayShow(false);
            this.selectedQTGateRegionCancel();
            this.disconnecting(false);
            return this.getAvaliableRegion();
        }
        disconnectClick() {
            this.disconnecting(true);
            socketIo.once('disconnectClickCallBack', () => {
                return this.desconnectCallBack();
            });
            return socketIo.emit('disconnectClick');
        }
        exit() {
            if (typeof require === 'undefined') {
                this.modalContent(infoDefine[this.languageIndex()].emailConform.formatError[11]);
                return this.hacked(true);
            }
            const { remote } = require('electron');
            return remote.app.quit();
        }
        pingCheck() {
            if (this.pingCheckLoading()) {
                return;
            }
            this.pingCheckLoading(true);
            this.QTGateRegions().forEach(n => {
                if (!n.available())
                    return;
                return n.ping(-1);
            });
            return socketIo.emit('pingCheck', CallBack => {
                this.pingCheckLoading(false);
                if (CallBack === -1) {
                    this.QTGateRegions().forEach(n => {
                        n.ping(-2);
                    });
                    return this.pingError(true);
                }
                return this.QTGateRegions.sort((a, b) => {
                    const _a = a.ping();
                    const _b = b.ping();
                    if (a.available() === b.available()) {
                        if (!a.available())
                            return 0;
                        if (_b > 0 && _a > _b)
                            return 1;
                        return -1;
                    }
                    if (b.available() && !a.available()) {
                        return 1;
                    }
                    return -1;
                });
            });
        }
        downloadCheck() {
            return socketIo.emit('downloadCheck');
        }
        pingCheckReturn(region, ping) {
            const index = this.QTGateRegions().findIndex(n => { return n.qtRegion === region; });
            if (index < 0)
                return;
            const _reg = this.QTGateRegions()[index];
            if (!_reg.available)
                return;
            _reg.ping(ping);
            const fromIInputData = $(`#card-${_reg.qtRegion.replace('.', '-')}`);
            const uu = ping;
            const _ping = Math.round((500 - ping) / 100);
            fromIInputData.rating({
                initialRating: _ping > 0 ? _ping : 0
            }).rating('disable');
        }
        appPassword(imapServer) {
            const { shell } = require('electron');
            let url = '';
            switch (imapServer) {
                case 'imap.gmx.com': {
                    url = 'https://support.gmx.com/pop-imap/toggle.html';
                    break;
                }
                case 'imap.mail.yahoo.com': {
                    switch (this.languageIndex()) {
                        case 0: {
                            url = 'https://tw.help.yahoo.com/kb/account/%E7%94%A2%E7%94%9F%E7%AC%AC%E4%B8%89%E6%96%B9%E6%87%89%E7%94%A8%E7%A8%8B%E5%BC%8F%E5%AF%86%E7%A2%BC-sln15241.html?impressions=true';
                            break;
                        }
                        case 3: {
                            url = 'https://tw.help.yahoo.com/kb/account/%E7%94%A2%E7%94%9F%E7%AC%AC%E4%B8%89%E6%96%B9%E6%87%89%E7%94%A8%E7%A8%8B%E5%BC%8F%E5%AF%86%E7%A2%BC-sln15241.html?impressions=true';
                            break;
                        }
                        case 1:
                        case 2:
                        default: {
                            url = `https://help.yahoo.com/kb/account/create-third-party-password-sln15241.html`;
                            break;
                        }
                    }
                    break;
                }
                case 'imap-mail.outlook.com': {
                    switch (this.languageIndex()) {
                        case 0: {
                            url = 'https://support.office.com/zh-cn/article/%E4%B8%BA-Office-365-%E5%88%9B%E5%BB%BA%E5%BA%94%E7%94%A8%E5%AF%86%E7%A0%81-3e7c860f-bda4-4441-a618-b53953ee1183?omkt=zh-CN&ui=zh-CN&rs=zh-CN&ad=CN';
                            break;
                        }
                        case 3: {
                            url = 'https://support.office.com/zh-tw/article/%E7%82%BA-Office-365-%E5%BB%BA%E7%AB%8B-App-%E5%AF%86%E7%A2%BC-3e7c860f-bda4-4441-a618-b53953ee1183?omkt=zh-TW&ui=zh-TW&rs=zh-TW&ad=TW';
                            break;
                        }
                        case 1: {
                            url = 'https://support.office.com/ja-jp/article/Office-365-%E3%81%AE%E3%82%A2%E3%83%97%E3%83%AA-%E3%83%91%E3%82%B9%E3%83%AF%E3%83%BC%E3%83%89%E3%82%92%E4%BD%9C%E6%88%90%E3%81%99%E3%82%8B-3e7c860f-bda4-4441-a618-b53953ee1183?omkt=ja-JP&ui=ja-JP&rs=ja-JP&ad=JP';
                            break;
                        }
                        case 2:
                        default: {
                            url = `https://support.office.com/en-us/article/Create-an-app-password-for-Office-365-3e7c860f-bda4-4441-a618-b53953ee1183`;
                            break;
                        }
                    }
                    break;
                }
                case 'imap.gmail.com': {
                    switch (this.languageIndex()) {
                        case 0: {
                            url = 'https://support.google.com/accounts/answer/185833?hl=zh-Hans';
                            break;
                        }
                        case 3: {
                            url = 'https://support.google.com/accounts/answer/185833?hl=zh-Hant';
                            break;
                        }
                        case 2: {
                            url = 'https://support.google.com/accounts/answer/185833?hl=ja';
                            break;
                        }
                        case 1:
                        default: {
                            url = `https://support.google.com/accounts/answer/185833?hl=en`;
                            break;
                        }
                    }
                    break;
                }
                case 'imap.zoho.com': {
                    url = 'https://www.zoho.com/mail/help/imap-access.html#EnableIMAP';
                    break;
                }
                default:
                case 'imap.mail.me.com': {
                    switch (this.languageIndex()) {
                        case 0: {
                            url = 'https://support.apple.com/zh-cn/HT204397';
                            break;
                        }
                        case 1:
                            url = 'https://support.apple.com/ja-jp/HT204397';
                            break;
                        case 3: {
                            url = 'https://support.apple.com/zh-tw/HT204397';
                            break;
                        }
                        case 2:
                        default: {
                            url = `https://support.apple.com/en-ca/HT204397`;
                            break;
                        }
                    }
                    break;
                }
            }
            event.preventDefault();
            shell.openExternal(url);
        }
        requestActivEmail() {
            this.requestActivEmailrunning(true);
            this.showSentActivEmail(-1);
            return socketIo.emit('requestActivEmail', CallBack => {
                this.requestActivEmailrunning(false);
                if (CallBack < 0) {
                    return this.showSentActivEmail(1);
                }
                return this.showSentActivEmail(CallBack);
            });
        }
        clearPaymentError() {
            this.cardNumberFolder_Error(false);
            this.cvcNumber_Error(false);
            this.postcode_Error(false);
            this.cardPayment_Error(false);
            this.paymentDataFormat_Error(false);
            this.promoInputError(false);
            return this.paymentCardFailed(false);
        }
        clearAllPaymentErrorTimeUP() {
            return setTimeout(() => {
                //this.showSuccessPayment ( false )
                //this.showCancelSuccess ( false )
                return this.clearPaymentError();
            }, 5000);
        }
        paymentCallBackFromQTGate(err, data) {
            this.stopShowWaitPaymentFinished();
            if (err) {
                return this.showBrokenHeart();
            }
            if (data.error === -1) {
                this.paymentSelect(false);
                data.command === 'cancelPlan' ? this.showCancelSuccess(true) : this.showSuccessPayment(true);
                if (data.command === 'cancelPlan' && data.Args[1]) {
                    this.cancel_Amount(data.Args[1]);
                }
                this.config().freeUser = false;
                const dataTrans = data.Args[0];
                this.QTTransferData(dataTrans);
                this.config().freeUser = false;
                this.config(this.config());
                return this.UserPermentShapeDetail(false);
            }
            const errMessage = data.Args[0];
            if (data.error === 0) {
                this.paymentSelect(true);
                return this.paymentDataFormat_Error(true);
            }
            if (/expiration/i.test(errMessage)) {
                return this.cardExpirationYearFolder_Error(true);
            }
            if (/cvc/i.test(errMessage)) {
                return this.cvcNumber_Error(true);
            }
            if (/card number/i.test(errMessage)) {
                return this.cardNumberFolder_Error(true);
            }
            if (/format/i.test(errMessage)) {
                return this.cardPayment_Error(true);
            }
            if (/postcode/.test(errMessage)) {
                return this.postcode_Error(true);
            }
            this.paymentSelect(true);
            return this.paymentCardFailed(true);
        }
        openStripeCard() {
            this.clearPaymentError();
            let handler = null;
            const amount = Math.round((this.selectPlanPrice() - this.showCurrentPlanBalance()) * 100);
            if (StripeCheckout && typeof StripeCheckout.configure === 'function') {
                handler = StripeCheckout.configure({
                    key: Stripe_publicKey,
                    image: 'images/512x512.png',
                    email: this.config().account,
                    zipCode: true,
                    locale: this.tLang() === 'tw' ? 'zh' : this.tLang(),
                    token: token => {
                        const payment = {
                            tokenID: token.id,
                            Amount: amount,
                            plan: this.getPaymentPlan().name,
                            isAnnual: this.isAnnual(),
                            autoRenew: this.autoRenew()
                        };
                        this.showWaitPaymentFinished();
                        return socketIo.emit('cardToken', payment, (err, data) => {
                            return this.paymentCallBackFromQTGate(err, data);
                        });
                    }
                });
                handler.open({
                    name: 'QTGate Systems Inc',
                    description: `${this.getPaymentPlan().name}:${this.getPaymentPlan().monthly}GB`,
                    amount: amount
                });
                return window.addEventListener('popstate', () => {
                    handler.close();
                });
            }
            if (!this.showStripeError()) {
                this.showStripeError(true);
                $('.showStripeErrorIconConnect').popup({
                    position: 'top center'
                });
                return $('.showStripeErrorIcon').transition('flash');
            }
        }
        cancelSubscriptionButton() {
            if (this.QTTransferData() && !this.QTTransferData().paidID) {
                return;
            }
            this.cancelPlanButton(true);
        }
        showPayment(paice, isAnnual) {
            this.clearPaymentError();
            if (!StripeCheckout || typeof StripeCheckout.configure !== 'function' || !Stripe || typeof Stripe !== 'function') {
                this.showStripeError(true);
                $('.showStripeError').popup({
                    position: 'top center',
                    delay: {
                        show: 300,
                        hide: 800
                    }
                });
            }
            this.cardpaStripe(true);
            this.autoRenew(!isAnnual);
            this.isAnnual(isAnnual);
            this.paymentSelect(true);
            new Cleave('.paymaneCardNumber', {
                creditCard: true,
                onCreditCardTypeChanged: type => {
                    this.cardType(type);
                }
            });
            new Cleave('.paymaneExpiration', {
                date: true,
                datePattern: ['m', 'Y'],
                delimiter: '/'
            });
            new Cleave('.paymaneCVC', {
                numeral: true,
                numeralIntegerScale: 4,
                delimiter: ''
            });
            $('.CancelMessage').popup({
                position: 'right center',
                on: 'click',
                delay: {
                    show: 300,
                    hide: 800
                }
            });
        }
        showWaitPaymentFinished() {
            this.doingPayment(true);
            this.paymentSelect(false);
            this.clearPaymentError();
            $('.paymentProcess').progress('reset');
            let percent = 0;
            const doingProcessBar = () => {
                clearTimeout(this.doingProcessBarTime);
                this.doingProcessBarTime = setTimeout(() => {
                    $('.paymentProcess').progress({
                        percent: ++percent
                    });
                    if (percent < 100)
                        return doingProcessBar();
                }, 1000);
            };
            return doingProcessBar();
        }
        stopShowWaitPaymentFinished() {
            this.doingPayment(false);
            clearTimeout(this.doingProcessBarTime);
            return $('.paymentProcess').progress('reset');
        }
        doPayment() {
            this.clearPaymentError();
            if (this.cardType() === 'discover' || this.cardType() === 'diners' || this.cardType() === 'jcb') {
                this.cardNumberFolder_Error(true);
                return this.cardNotSupport(true);
            }
            const amount = Math.round((this.selectPlanPrice() - this.showCurrentPlanBalance()) * 100);
            const payment = {
                Amount: amount,
                cardNumber: this.cardNumber(),
                cardExpirationYear: this.cardExpirationYear(),
                cardPostcode: this.cardPostcode(),
                cardcvc: this.cardcvc(),
                isAnnual: this.isAnnual(),
                plan: this.getPaymentPlan().name,
                autoRenew: this.autoRenew()
            };
            this.showWaitPaymentFinished();
            return socketIo.emit('payment', payment, (err, data) => {
                return this.paymentCallBackFromQTGate(err, data);
            });
        }
        showUserDetail() {
            if (!this.keyPair().passwordOK || !this.getCurrentPlan()) {
                return;
            }
            this.showSuccessPayment(false);
            this.showCancelSuccess(false);
            this.UserPerment(true);
            if (!this.QTTransferData().paidID) {
                $('.CancelPlanButton').popup({
                    position: 'top right',
                    delay: {
                        show: 300,
                        hide: 800
                    }
                });
            }
            if (this.QTTransferData().isAnnual) {
                $('.MonthlyPlanButton').popup({
                    position: 'top right',
                    delay: {
                        show: 300,
                        hide: 800
                    }
                });
            }
            return $('#getNextPlanArray').dropdown({
                onChange: value => {
                    this.QTGateAccountPlan(value);
                    this.UserPermentShapeDetail(true);
                    return $('.CancelMessage').popup({
                        position: 'bottom right',
                        on: 'click',
                        delay: {
                            show: 300,
                            hide: 800
                        }
                    });
                }
            });
        }
        cancelPlan() {
            this.cancelPlanProcess(true);
            return socketIo.emit('cancelPlan', callback => {
                this.cancelPlanProcess(false);
            });
        }
        upgradeAccount() {
            this.menuClick(1, false);
            this.UserPerment(true);
            return this.showUserDetail();
        }
        doCancelPlan() {
            this.showWaitPaymentFinished();
            return socketIo.emit('cancelPlan', (err, data) => {
                return this.paymentCallBackFromQTGate(err, data);
            });
        }
        showPromoForm() {
            this.promoButton(true);
            return new Cleave('.promoCodeInput', {
                uppercase: true,
                delimiter: '-',
                blocks: [4, 4, 4, 4]
            });
        }
        promoApplication() {
            if (this.promoInput().length < 19) {
                return this.promoInputError(true);
            }
            this.clearPaymentError();
            this.promoButton(false);
            this.showWaitPaymentFinished();
            return socketIo.emit('promoCode', this.promoInput(), (err, data) => {
                return this.paymentCallBackFromQTGate(err, data);
            });
        }
        twitterClick() {
            if (this.config() && this.config().localIpAddress && this.config().localIpAddress.length) {
                const { shell } = require('electron');
                event.preventDefault();
                return shell.openExternal(`https://www.github.com`);
                //return shell.openExternal ( `http://${ this.config().localIpAddress[0] }:2000/Twitter` )
            }
            return;
        }
        QTGateAppClick() {
            this.getAvaliableRegion();
            return this.menuClick(3, true);
        }
    }
    view_layout.view = view;
})(view_layout || (view_layout = {}));
const appList = [
    {
        name: 'QTGate',
        likeCount: ko.observable(0),
        liked: ko.observable(false),
        commentCount: ko.observable(),
        titleColor: '#0066cc',
        comeSoon: false,
        show: true,
        click: (view) => { return view.QTGateAppClick(); },
        image: '/images/qtgateGateway.png'
    }, {
        name: 'QTChat',
        likeCount: ko.observable(0),
        liked: ko.observable(false),
        commentCount: ko.observable(0),
        titleColor: '#006600',
        comeSoon: true,
        show: true,
        image: '/images/qtchat.png',
        click: (view) => { return; },
    }, {
        name: 'QTStorage',
        likeCount: ko.observable(0),
        liked: ko.observable(false),
        commentCount: ko.observable(0),
        titleColor: '#990000',
        comeSoon: true,
        show: true,
        image: '/images/qtStorage.png',
        click: (view) => { return; },
    }, {
        name: 'QTCustom',
        likeCount: ko.observable(0),
        liked: ko.observable(false),
        commentCount: ko.observable(0),
        titleColor: '#09b83e',
        comeSoon: false,
        show: true,
        image: '/images/512x512.png',
        click: (view) => { return; },
    }, {
        name: 'QTGoogle',
        likeCount: ko.observable(0),
        liked: ko.observable(false),
        commentCount: ko.observable(0),
        titleColor: '#4885ed',
        comeSoon: true,
        show: true,
        image: '/images/Google__G__Logo.svg',
        click: (view) => { return; },
    }, {
        name: 'QTTweet',
        likeCount: ko.observable(0),
        liked: ko.observable(false),
        commentCount: ko.observable(0),
        titleColor: '#00aced',
        comeSoon: false,
        show: true,
        image: '/images/Twitter_Logo_Blue.svg',
        click: (view) => {
            const { shell } = require('electron');
            event.preventDefault();
            return shell.openExternal(`http://${view.config().localIpAddress[0]}:2000/Twitter`);
        },
    },
    {
        name: 'QTInstagram',
        likeCount: ko.observable(0),
        liked: ko.observable(false),
        commentCount: ko.observable(0),
        titleColor: '#cd486b',
        show: false,
        image: '/images/Instagram_logo_2016.svg',
        comeSoon: true,
        click: (view) => { return; },
    },
    {
        name: 'QTNYTime',
        likeCount: ko.observable(0),
        liked: ko.observable(false),
        commentCount: ko.observable(0),
        titleColor: 'grey',
        comeSoon: true,
        show: true,
        image: '/images/nyt.png',
        click: (view) => { return; },
    },
    {
        name: 'QTWeChat',
        likeCount: ko.observable(0),
        liked: ko.observable(false),
        commentCount: ko.observable(0),
        titleColor: '#09b83e',
        comeSoon: true,
        show: false,
        image: '/images/wechat.svg',
        click: (view) => { return; },
    },
    {
        name: 'QTBitcoin',
        show: true,
        likeCount: ko.observable(0),
        liked: ko.observable(false),
        commentCount: ko.observable(0),
        titleColor: '#FF9900',
        comeSoon: true,
        image: '/images/Bitcoin.svg',
        click: (view) => { return; },
    }
];
const oneMB = 1024 * 1000;
const oneGB = 1024 * 1000 * 1000;
const oneTB = 1024 * 1000 * 1000 * 1000;
const planArray = [
    {
        name: 'free',
        monthly: 1,
        day: 100,
        monthlyPay: 0,
        annually: 0,
        next: 'p1',
        share: 0,
        internet: 0,
        multi_gateway: 0,
        showNote: false
    }, {
        name: 'p1',
        monthly: 50,
        monthlyPay: '3.88',
        annually: '34.56',
        next: 'p2',
        share: 0,
        internet: 0,
        multi_gateway: 0,
        showNote: false
    }, {
        name: 'p2',
        monthly: 300,
        monthlyPay: '6.88',
        annually: '58.00',
        next: 'p3',
        share: 0,
        internet: 0,
        multi_gateway: 0,
        showNote: false
    }, {
        name: 'p3',
        monthly: 1000,
        monthlyPay: '19.88',
        annually: '167.00',
        next: 'p4',
        share: 1,
        internet: 1,
        multi_gateway: 1,
        showNote: true
    }, {
        name: 'p4',
        monthly: 2000,
        monthlyPay: '39.88',
        annually: '335.00',
        next: 'p5',
        share: 2,
        internet: 2,
        multi_gateway: 1,
        showNote: true
    }, {
        name: 'p5',
        monthly: 4000,
        monthlyPay: '79.88',
        annually: '670.00',
        share: 3,
        internet: 3,
        multi_gateway: 2,
        showNote: false
    }
];
const DayTime = 1000 * 60 * 60 * 24;
const monthTime = 30 * DayTime;
const yearTime = 12 * monthTime;
const getPlanPrice = (plan, isAnnualPlan) => {
    switch (plan) {
        //		1GB/month 100MB/day
        case 'free': {
            return 0;
        }
        //		50GB/month
        case 'p1': {
            return isAnnualPlan ? 34.56 : 3.88;
        }
        //		300GB/month
        case 'p2': {
            return isAnnualPlan ? 58.00 : 6.88;
        }
        //		1TB/month
        case 'p3': {
            return isAnnualPlan ? 167.00 : 19.88;
        }
        //		2TB/month
        case 'p4': {
            return isAnnualPlan ? 335.00 : 39.88;
        }
        //		4TB/month
        case 'p5': {
            return isAnnualPlan ? 670.00 : 79.88;
        }
        //		ERROR
        default: {
            return parseInt('none');
        }
    }
};
const getCurrentPlanCancelBalance = (expiration, planName) => {
    const price = getPlanPrice(planName, true);
    const normalPrice = getPlanPrice(planName, false);
    const usedMonth = 12 - getRemainingMonth(expiration);
    const passedCost = Math.round((price - normalPrice * usedMonth) * 100) / 100;
    return passedCost > 0 ? passedCost : 0;
};
const getExpire = (startDate, isAnnual) => {
    const start = new Date(startDate);
    const now = new Date();
    const passedMonth = Math.round((now.getTime() - start.getTime()) / monthTime - 0.5);
    isAnnual ? start.setFullYear(start.getFullYear() + 1) : start.setMonth(passedMonth + 1);
    return start;
};
const getCurrentPlanUpgradelBalance = (expiration, planName, isAnnual) => {
    if (!isAnnual) {
        return getPlanPrice(planName, false);
    }
    const price = getPlanPrice(planName, true);
    if (!price)
        return null;
    const usedMonth = 12 - getRemainingMonth(expiration) + 1;
    const passedCost = Math.round((price - price * usedMonth / 12) * 100) / 100;
    return passedCost;
};
const view = new view_layout.view();
ko.applyBindings(view, document.getElementById('body'));
const u = '.' + view.tLang();
$(u).addClass('active');
$('#firstNode').hide();
$('.mainScreen').hide();
$('.mainScreenMenu').hide();
$('.message .close').on('click', function () {
    $(this).closest('.message').transition('fade').remove();
});
$('.activating.element').popup({
    on: 'focus'
});
$('.mainAccordion').accordion({});
$('.useInfoView').hide();
$('.mainScreen1').hide();
$('#feedBackView').hide();
