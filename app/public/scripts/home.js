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
const uuid_generate = () => {
    let lut = [];
    for (let i = 0; i < 256; i++) {
        lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
    }
    let d0 = Math.random() * 0xffffffff | 0;
    let d1 = Math.random() * 0xffffffff | 0;
    let d2 = Math.random() * 0xffffffff | 0;
    let d3 = Math.random() * 0xffffffff | 0;
    return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
        lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
        lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
        lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
};
const insideChinaEmail = /(\@|\.)(sina|sohu|qq|126|163|tom)\.com|(\.|\@)yeah\.net/i;
const uuID = () => {
    return uuid_generate().replace(/-/g, '');
};
const isElectronRender = typeof process === 'object';
let socketIo = null;
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
const Menu = {
    'zh': [{
            LanguageJsonName: 'zh',
            showName: '简体中文',
            icon: 'flag-icon-cn'
        },
        {
            LanguageJsonName: 'en',
            showName: '英文/English',
            icon: 'flag-icon-gb'
        },
        {
            LanguageJsonName: 'ja',
            showName: '日文/日本語',
            icon: 'flag-icon-jp'
        }, {
            LanguageJsonName: 'tw',
            showName: '繁体字中文/正體字中文',
            icon: 'flag-icon-tw'
        }],
    'ja': [{
            LanguageJsonName: 'ja',
            showName: '日本語',
            icon: 'flag-icon-jp'
        },
        {
            LanguageJsonName: 'en',
            showName: '英語/English',
            icon: 'flag-icon-gb'
        },
        {
            LanguageJsonName: 'zh',
            showName: '簡体字中国語/简体中文',
            icon: 'flag-icon-cn'
        }, {
            LanguageJsonName: 'tw',
            showName: '繁体字中国語/正體字中文',
            icon: 'flag-icon-tw'
        }],
    'en': [{
            LanguageJsonName: 'en',
            showName: 'English',
            icon: 'flag-icon-gb'
        },
        {
            LanguageJsonName: 'ja',
            showName: 'Japanese/日本語',
            icon: 'flag-icon-jp'
        },
        {
            LanguageJsonName: 'zh',
            showName: 'Simplified Chinese/简体中文',
            icon: 'flag-icon-cn'
        },
        {
            LanguageJsonName: 'tw',
            showName: 'Traditional Chinese/正體字中文',
            icon: 'flag-icon-tw'
        }],
    'tw': [
        {
            LanguageJsonName: 'tw',
            showName: '正體字中文',
            icon: 'flag-icon-tw'
        }, {
            LanguageJsonName: 'en',
            showName: '英文/English',
            icon: 'flag-icon-gb'
        },
        {
            LanguageJsonName: 'ja',
            showName: '日文/日本語',
            icon: 'flag-icon-jp'
        },
        {
            LanguageJsonName: 'zh',
            showName: '簡體字中文/简体中文',
            icon: 'flag-icon-cn'
        }
    ]
};
const cookieName = 'langEH';
const passwdCookieName = 'QTGate';
const EmailRegexp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
const initLanguageCookie = () => {
    var cc = $.cookie(cookieName);
    if (!cc) {
        cc = window.navigator.language;
    }
    if (!cc)
        cc = 'en';
    cc = cc.substr(0, 2).toLocaleLowerCase();
    switch (cc) {
        case 'zh':
            break;
        case 'en':
            break;
        case 'ja':
            break;
        case 'tw':
            break;
        default:
            cc = 'en';
    }
    $.cookie("langEH", cc, { expires: 180, path: '/' });
    $("html").trigger('languageMenu', cc);
    return cc;
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
var lang;
(function (lang) {
    lang[lang["zh"] = 0] = "zh";
    lang[lang["ja"] = 1] = "ja";
    lang[lang["en"] = 2] = "en";
    lang[lang["tw"] = 3] = "tw";
})(lang || (lang = {}));
const QTGateRegionsSetup = [
    {
        title: '@OPN'
    },
    {
        title: 'iOPN'
    }
];
const infoDefine = [
    {
        account: {
            title: '账户管理',
            segmentTitle: '账户: ',
            currentPlan: '当前订阅: ',
            MonthBandwidthTitle: '月度代理服務器数据传送限额：',
            dayBandwidthTitle: '毎日限额：',
            upgradeTitle: '升级账户选项',
            DowngradeTitle: '降级账户选项',
            cancelPlan: '终止月度订阅计划',
            MonthBandwidthTitle1: '传送限额',
            serverShareData: ['共享服务器', '一台独占*', '二台独占*', '四台独占'],
            continue: '下一步',
            monthlyPay: '月收费',
            serverShareData1: '使用同时链接多台代理技术，同时使用台数大于独占数时，会相应分享您所独占的资源',
            internetShareData: ['共享高速带宽', '独享单线高速带宽*', '独享双线高速带宽*', '独享四线高速带宽'],
            maxmultigateway: ['最大同时可二条并发代理数', '最大同时可使用四条并发代理数'],
            downGradeMessage: '您正在操作降级您的订阅，如果操作成功您将从下月您的订阅之日起，实行新的订阅，如果您是。',
            cancelPlanMessage: 'QTGate的订阅是以月为基本的单位。您的月订阅将在下月您的订阅起始日前被终止，您可以继续使用您的本月订阅计划，您将自动回到免费用户。如果您是每月自动扣款，则下月将不再扣款。如果您是年度订阅计划，您的退款将按普通每月订阅费，扣除您已经使用的月份后计算的差额，将自动返还您所支付的信用卡账号，如果您是使用促销码，或您是测试用户，您的终止订阅将不能被接受。'
        },
        QTGateDonate: {
            title: 'QTGate赞助商提供的免流量网站',
            meta_title: '捐赠者：'
        },
        QTGateInfo: {
            title: 'QTGate功能简介',
            version: '本机QTGate版本：v',
            detail: [{
                    header: '隐身匿名自由上网',
                    color: '#a333c8',
                    icon: 'exchange',
                    detail: 'QTGate通过使用<a onclick="return linkClick (`https://zh.wikipedia.org/wiki/%E9%AB%98%E7%BA%A7%E5%8A%A0%E5%AF%86%E6%A0%87%E5%87%86`)" href="#" target="_blank">AES256-GCM</a>和<a onclick="return linkClick (`https://zh.wikipedia.org/wiki/PGP`)" href="#" target="_blank">OpenPGP</a>加密Email通讯，创造了OPN匿名网络通讯技术，QTGate公司首创的@OPN技术，它全程使用加密Email通讯，客户端和代理服务器彼此不用交换IP地址来实现高速通讯。iOPN通讯技术是利用普通HTTP协议下的混淆流量加密技术，能够隐藏变换您的IP地址高速通讯。二种通讯方式都能够让您，隐身和安全及不被检出的上网，保护您的隐私，具有超强对抗网络监控,网络限制和网络阻断。'
                }, {
                    color: '#e03997',
                    icon: 'talk outline',
                    header: '无IP点对点即时加密通讯服务QTChat',
                    detail: 'QTGate用户之间通过email的点对点即时通讯服务，它具有传统即时通讯服务所不具有的，匿名无IP和用户之保持秘密通讯的功能。QTChat加密通讯服务可以传送文字，图片和视频文件信息，QTGate系统只负责传送信息，不拥有信息，也无法检查信息本身，所以QTGate不承担信息所有的法律责任。QTChat支持群即时通讯，将支持视频流直播服务。'
                }, {
                    color: '#6435c9',
                    icon: 'cloud upload',
                    header: '加密文件匿名网络云储存及分享功能QTStorage',
                    detail: '用户通过申请多个和不同的免费email服务商账号，可以把一个文件加密拆分成多个部分，分别存储在不同的email账号下，可以保密安全和无限量的使用网络储存。用户还可以通过QTGate系统在QTGate用户之间分享秘密文件。'
                },
                {
                    color: 'darkcyan',
                    icon: 'spy',
                    header: '阻断间谍软件向外送信功能',
                    detail: 'QTGate系统连接全球DNSBL联盟数据库，用户通过订阅QTGate系统黑名单列表，并使用QTGate客户端上网，让潜伏在您电子设备内的间谍软件，它每时每刻收集的信息，不能够被送信到其信息收集服务器，能够最大限的保障您的个人隐私。'
                }, {
                    color: '#6435c9',
                    icon: 'external share',
                    header: '本地VPN服务器',
                    detail: 'QTGate用户在户外时可以通过连接自己家里的VPN，来使用QTGate客户端隐身安全上网。'
                }]
        },
        cover: {
            firstTitle1: '让您上网从此隐身',
            firstTitle2: '自由安全风雨无阻',
            start: '开门'
        },
        firstNote: {
            title: '欢迎使用QTGate，感谢您使用我们的产品和服务(下称“服务”)。本服务由总部设在加拿大的QTGate Systems Inc.下称“QTGate”提供。',
            firstPart: '您使用我们的服务即表示您已同意本条款。请仔细阅读。使用我们的服务，您必须遵守服务中提供的所有政策。',
            detail: [
                {
                    header: '关于我们的服务',
                    detail: '请勿滥用我们的服务，举例而言: 请勿干扰我们的服务或尝试使用除我们提供的界面和指示以外的方法访问这些服务。您仅能在法律(包括适用的出口和再出口管制法律和法规)允许的范围内使用我们的服务。如果您不同意或遵守我们的条款或政策，请不要使用我们所提供的服务，或者我们在调查可疑的不当行为，我们可以暂停或终止向您提供服务。'
                }, {
                    header: null,
                    detail: '使用我们的服务并不让您拥有我们的服务或您所访问的内容的任何知识产权。除非您获得相关内容所有者的许可或通过其他方式获得法律的许可，否则您不得使用服务中的任何内容。本条款并未授予您使用我们服务中所用的任何商标或标志的权利。请勿删除、隐藏或更改我们服务上显示的或随服务一同显示的任何法律声明。'
                }, {
                    header: '关于OPN无IP通讯技术和隐私保护的局限性',
                    detail: 'OPN是QTGate世界首创的使用Email的IMAP协议建造一个无IP通讯环境，在您利用QTGate进行通讯过程中，QTGate无法获得您目前所使用的IP地址（使用iOPN来连结QTGate代理服务器时，您需要向QTGate系统提供您当前的IP地址），可以最大限度的保障您的个人隐私。但是这项技术并不能够保证您的信息绝对的不被泄露，因为您的IP地址有可能被记录在您所使用的Email服务供应商，如果持有加拿大法院令寻求QTGate的Log公开，再和Email服务供应商的Log合并分析，可能会最终得到您的信息。 QTGate并不能够绝对保障您的隐私。 '
                },
                {
                    header: '关于个人隐私保护，系统日志和接收QTGate传送的信息',
                    detail: '在您使用服务的过程中，我们可能会向您发送服务公告、管理消息和其他信息。您可以选择不接收上述某些信息。'
                }, {
                    header: null,
                    detail: '当您使用我们的服务时，我们为了计费处理会自动收集非常有限的数据流量信息，并存储到服务器日志中。数据流量信息仅用于计算客户应支付通讯费用而收集的，它收集的数据是：日期，用户帐号，所使用的代理区域和代理服务器IP，数据包大小，下载或上传。例如：'
                }, {
                    header: null,
                    detail: '<p class="tag info">06/20/2017 18:12:16, info@qtgate.com, francisco, 104.236.162.139, 300322 byte up, 482776323 byte down.</p><p class="tag info">06/21/2017 12:04:18, info@qtgate.com, francisco, 104.236.162.139, 1435226 byte up, 11782238 byte down.</p>'
                },
                {
                    header: null,
                    detail: 'QTGate没有保存除了以上信息以外的任何其他信息。我们会配合并向持有加拿大法院令的执法机构提供此日志文件。如果您是加拿大以外地区的执法机构，有这方面信息披露的需求，请通过加拿大外交部来联系我们：'
                }, {
                    header: null,
                    detail: '<a class="tag alert" href="http://www.international.gc.ca/">http://www.international.gc.ca/</a>'
                },
                {
                    header: '版权所有权',
                    detail: '该软件是QTGate的智慧产权，并且受到相关版权法，国际版权保护规定和其他在版权授与国家内的相关法律的保护。该软件包含智慧产权材料, 商业秘密及其他产权相关材料。你不能也不应该尝试修改，反向工程操作，反汇编或反编译QTGate服务，也不能由QTGate服务项目创造或衍生其他作品。'
                },
                {
                    header: null,
                    detail: '关于我们服务中的软件，QTGate授予您免许可使用费、不可转让的、非独占的全球性个人许可, 允许您使用由QTGate提供的、包含在服务中的软件。本许可仅旨在让您通过本条款允许的方式使用由QTGate提供的服务并从中受益。您不得复制、修改、发布、出售或出租我们的服务, 或所含软件的任何部分。'
                }, {
                    header: '修改与终止服务',
                    detail: '我们持续改变和改善所提供的服务。我们可能会新增或移除功能或特性，也可能会暂停或彻底停止某项服务。您随时都可以停止使用服务，尽管我们并不希望您会这样做。 QTGate也可能随时停止向您提供服务，或对服务附加或设定新的限制。'
                },
                {
                    header: '服务的责任',
                    detail: '在法律允许的范围内，QTGate及其供应商和分销商不承担利润损失、收入损失或数据、财务损失或间接、特殊、后果性、惩戒性或惩罚性损害赔偿责任。'
                }, {
                    header: '法律规定的贸易禁止事项',
                    detail: '当您按下同意按钮，表示您已经确认您不属于加拿大法律所规定的禁止贸易对象的列表之中。 '
                },
                {
                    header: '服务的商业使用',
                    detail: '如果您代表某家企业使用我们的服务，该企业必须接受本条款。对于因使用本服务或违反本条款而导致的或与之相关的任何索赔、起诉或诉讼，包括因索赔、损失、损害赔偿、起诉、判决、诉讼费和律师费而产生的任何责任或费用，该企业应对QTGate及其关联机构、管理人员、代理机构和员工进行赔偿并使之免受损害。'
                }, {
                    header: '本条款的变更和约束力',
                    detail: '关于本条款：我们可以修改上述条款或任何适用于某项服务的附加条款，例如，为反映法律的变更或我们服务的变化而进行的修改。您应当定期查阅本条款。我们会在本网页上公布这些条款的修改通知。我们会在适用的服务中公布附加条款的修改通知。所有修改的适用不具有追溯力，且会在公布十四天或更长时间后方始生效。但是，对服务新功能的特别修改或由于法律原因所作的修改将立即生效。如果您不同意服务的修改条款，应停止使用服务。如果本条款与附加条款有冲突，以附加条款为准。'
                },
                {
                    header: null,
                    detail: '本条款约束QTGate与您之间的关系，且不创设任何第三方受益权。如果您不遵守本条款，且我们未立即采取行动，并不意味我们放弃我们可能享有的任何权利（例如，在将来采取行动）。如果某一条款不能被强制执行，这不会影响其他条款的效力。加拿大BC省的法律（不包括BC州的法律冲突规则）将适用于因本条款或服务引起的或与之相关的纠纷。因本条款或服务引起的或与之相关的所有索赔，只能向加拿大BC省法院提起诉讼，且您和QTGate同意上述法院拥有属人管辖权。'
                }
            ],
            disagree: '不同意',
            agreeMent: 'QTGate服务条款和隐私权'
        },
        linuxUpdate: {
            newVersionDownload: '点击这里下载并安装',
            step1: '下载新版本',
            step2: '授权新版本QTGate为可执行文件',
            step2J1: '/images/linuxUpdate1_tw.jpg',
            step2J2: '/images/linuxUpdate2_tw.jpeg',
            step2_detail1: '右键点击已下载的QTGate图标，选择菜单里的文件属性',
            step2_detail2: '在权限选项里，选勾“允许档案文件执行”。',
            step3: '退出旧版本QTGate后，双击QTGate文件执行安装',
            exit: '退出QTGate'
        },
        imapInformation: {
            title: '通讯专用Email邮箱设置',
            infomation: `请设置QTGate通讯专用Email邮箱信息。由于此账户的用户名和密码信息会提交给QTGate系统，为了防止您的个人信息被泄漏，请新申请一个临时Email账户。目前QTGate技术对应<a href="#" onclick="return linkClick ('https://www.icloud.com/')">苹果iCloud</a>，<a href="#" onclick="return linkClick ('https://www.microsoft.com/zh-tw/outlook-com/')">微软OUTLOOK</a>，<a href="#" onclick="return linkClick ('https://tw.mail.yahoo.com/')">雅虎邮箱</a>，<a href="#" onclick="return linkClick ('https://www.zoho.com/mail/')">俄罗斯ZOHO邮箱</a>，<a href="#" onclick=" return linkClick ('https://gmail.com')">Google邮箱</a>，<a href="#" onclick="return linkClick ('https://www.gmx.com/mail/#.1559516-header-nav1-2')">美国在线GMX邮箱</a>，QTGate强力推荐使用苹果公司的Email可以达到最佳速度(@OPN无IP连结技术只对应苹果公司iCloud邮箱)。密码请使用Email服务商的<a href="#" onclick="return linkClick ('https://tw.help.yahoo.com/kb/SLN15241.html')">应用密码</a>。对于Email供应商在应用密码申请时，须<a href="#" onclick="return linkClick ('https://tw.help.yahoo.com/kb/%E9%96%8B%E5%95%9F%E5%85%A9%E6%AD%A5%E9%A9%9F%E9%A9%97%E8%AD%89-sln5013.html')" >二步认证</a>并提供手机号码接受验证码，为保护您的隐私，建议使用免费在线代理接收验证码服务。( 如<a href="#" onclick="return linkClick('http://receive-sms-online.com/')">receive-sms-online.com</a>, <a href="#" onclick="return linkClick('https://sms-online.co/receive-free-sms')" >sms-online.co</a>, <a href="#" onclick="return linkClick('https://receive-a-sms.com/')" >receive-a-sms.com</a> ) 更多请 <a href="#" onclick="return linkClick ('http://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=0&rsv_idx=1&tn=baidu&wd=%E5%85%8D%E8%B4%20%B9%E5%9C%A8%E7%BA%BF%E6%8E%A5%E6%94%B6%E6%89%8B%E6%9C%BA%E9%AA%8C%E8%AF%81%20%E7%A0%81&rsv_pq=e94f47a50001f66f&rsv_t=b03ePiy3rHH0T4FVoWB8Hx9vrVdZLzVhhErWOo4xdBpjDw%2BtGri%2BViTaVAw&rqlang=cn&rsv_enter=1&rsv_sug3=42&rsv_sug1=5&rsv_sug7=100')">百度查找</a>，<a href="#" onclick="return linkClick ('https://www.google.com/search?q=%E5%85%8D%E8%B4%B9%E5%9C%A8%E7%BA%BF%E6%8E%A5%E6%94%B6%E6%89%8B%E6%9C%BA%E9%AA%8C%E8%AF%81%E7%A0%81&oq=%E5%85%8D%E8%B4%B9%E5%9C%A8%E7%BA%BF%E6%8E%A5%E6%94%B6%E6%89%8B%E6%9C%BA%E9%AA%8C%E8%AF%81%E7%A0%81&aqs=chrome..69i57j69i60.254j0j4&sourceid=chrome&ie=UTF-8')">Google查找</a>。`,
            serverDetail: '详细设定：',
            imapServer: 'IMAP服务器设定',
            imapServerInput: 'IMAP服务器IP或域名',
            UserName: '登陆用户名称',
            Ssl: '使用Ssl加密信息传输：',
            portName: '通讯端口号：',
            otherPortNumber: '其他号码：',
            Error_portNumber: '端口号应该是从1-65535之间的数字',
            smtpServer: 'SMTP服务器设定',
            smtpServerInput: 'SMTP服务器IP或域名',
            emailServerPassword: '邮箱密码(推荐使用应用专用密码)',
            imapAccountConform: '<p><dt>警告：</dt></p>当您按下提交按钮时，意味着您已经确认：这个邮箱并不是您常用的邮箱，这是为了使用QTGate系统而特别申请的临时邮箱，您同意承担由此带来的风险，并授权QTGate系统可以使用这个Email邮箱传输信息!',
            agree: '我已经了解风险，并愿意继续',
            imapOtherCheckError: '不能连接到Email服务器，有可能您设定的服务器名称或IP，通讯端口号有误，请检查您的服务器详细设定！',
            CertificateError: 'Email服务器提示的证书不能被系统信任！您的Email服务器有可能是一个仿冒的，您如果想继续，请在下面详细设定里选择【允许连接到不被信任证书的Email服务器】，但您的Email登陆信息有可能泄漏给此服务器！',
            IgnoreCertificate: '允许连接到不被信任证书的Email服务器',
            Certificat: '如果您不确定请别选择这项，这个选择是非常危险，因为它允许连接上一个仿冒的服务器，可能泄露您的用户名和密码。',
            AuthenticationFailed: 'Email服务器提示用户名或密码错误，请仔细检查您的用户名和密码！',
            addAEmail: '添加通讯用Email账户',
            tryAgain: '再试一次',
            connectImap: '连接QTGate',
            cancelConnect: '终止QTGate连接',
            imapItemTitle: '通讯用邮箱详细信息',
            imapCheckingStep: ['正在尝试连接email服务器', 'email伺服器IMAP連接成功', 'email伺服器SMTP連接成功'],
            imapResultTitle: 'IMAP服务器QTGate通讯评分：',
            testSuccess: 'email服务器连接试验成功！',
            exitEdit: '退出编辑Email帐户',
            deleteImap: '删除IMAP账户',
            proxyPortError: '端口号应该是从1000-65535之间的数字，或此端口号已被其他APP所占用。请尝试其他号码。',
            appPassword: '关于APP密码'
        },
        home_index_view: {
            newVersion: '新版本准备就绪，请安装！',
            clickInstall: '点击安装新版本',
            showing: '系统状态',
            internetLable: '互联网',
            gateWayName: '代理服务器',
            localIpAddress: '本机',
            nextPage: '下一页',
            agree: '同意协议并继续',
            emailAddress: 'Email地址(必填)',
            systemAdministratorEmail: 'RSA密钥生成',
            SystemAdministratorNickName: '昵称或组织名(必填)',
            systemPassword: '密码',
            creatKeyPair: '创建密钥对...',
            cancel: '放弃操作',
            stopCreateKeyPair: '停止生成密钥对',
            continueCreateKeyPair: '继续生成',
            newVersionInstallLoading: '更新中请稍候',
            KeypairLength: '请选择加密通讯用密钥对长度：这个数字越大，通讯越难被破解，但会增加通讯量和运算时间。',
            GenerateKeypair: '<em>系统正在生成用于通讯和签名的RSA加密密钥对，计算机需要运行产生大量的随机数字有，可能需要几分钟时间，尤其是长度为4096的密钥对，需要特别长的时间，请耐心等待。关于RSA加密算法的机制和原理，您可以访问维基百科：' +
                `<a href='https://zh.wikipedia.org/wiki/RSA加密演算法' target="_blank" onclick="return linkClick ('https://zh.wikipedia.org/wiki/RSA加密演算法')" >https://zh.wikipedia.org/wiki/RSA加密演算法</a></em>`,
            inputEmail: '让我们来完成设定的最后几个步骤，首先生成RSA密钥对, 它是您的系统信息加密，身份认证及和QTGate通讯使用的重要工具。 RSA密钥对的密码请妥善保存，Email地址栏应填入您的常用Email地址, 它将被用作您的QTGate账号。<em style="color:red;">需注意的是QTGate.com域名在某些网络限制地区被列入屏蔽名单，如果您使用的是网络限制地区email服务，您有可能接收不到由QTGate发回的账号确认Email，以完成QTGate设定。</em>',
            accountEmailInfo: '由于QTGate域名在某些国家和地区被防火墙屏蔽，而不能正常收发Email，如果您是处于防火墙内的用户，建议使用防火墙外部的邮件服务商。'
        },
        Home_keyPairInfo_view: {
            title: '密钥信息',
            emailNotVerifi: '您的密钥未获QTGate签署认证。',
            emailVerified: '您的密钥已获QTGate签署认证。',
            NickName: '创建人称谓：',
            creatDate: '密钥创建日期：',
            keyLength: '密钥位强度：',
            password: '请输入长度大于五位的密码',
            password1: '请输入密钥对密码',
            keyID: '密钥对ID：',
            logout: '退出登录',
            deleteKeyPairInfo: '请注意：如果您没有备份您的QTGate系统的话，删除现有的密钥将使您的QTGate设定全部丢失，您有可能需要重新设置您的QTGate系统。如果您的注册Email没有变化，您的QTGate账户支付信息不会丢失！',
            delete: '削除',
            locked: '请提供您的RSA密钥以解开密钥后才能继续操作，如果您遗忘了密码，请删除此RSA密钥。',
            systemError: '发生系统错误。如果重复发生，请删除您的密钥，再次设定您的系统！'
        },
        error_message: {
            title: '错误',
            errorNotifyTitle: '系统错误',
            EmailAddress: ['请按以下格式输入你的电子邮件地址: someone@example.com.', '您已有相同的Email账户', '此类Email服务器暂时QTGate技术不能对应。'],
            required: '请填写此字段',
            doCancel: '终止完成',
            PasswordLengthError: '密码必须设定为5个字符以上。',
            localServerError: '本地服务器错误，请重新启动QTGate！',
            finishedKeyPair: '密钥对创建完成！',
            errorKeyPair: '密钥对创建发生错误，请重试',
            Success: '完成',
            SystemPasswordError: '密钥对密码错误，请重试！如果您已忘记您的密钥对密码，请删除现有的密钥对，重新生成新的密钥对。但您的原有设定将全部丢失！',
            finishedDeleteKeyPair: '密钥对完成删除!',
            offlineError: '您的电脑未连接到互联网，请检查网络后再次尝试！',
            imapErrorMessage: ['',
                '数据格式错误，请重试',
                '您的电脑未连接到互联网，请检查网络后再次尝试！',
                'Email伺服器提示IMAP用户名或密码错！这个错误通常是由于您使用的密码是普通密码，或者您的APP密码已失效，请到您的Email帐户检查您的APP密码，然后再试一次。',
                'Email伺服器的指定連接埠連結失敗，請檢查您的IMAP連接埠設定，如果您在一個防火牆內部，則有可能該端口被防火牆所屏蔽，您可以嘗試使用該IMAP伺服器的其他連接埠！<a href="data-html"></a>',
                '服务器证书错误！您可能正在连接到一个仿冒的Email服务器，如果您肯定这是您希望连接的服务器，请在IMAP详细设定中选择忽略证书错误。', '无法获得Email服务器域名信息，请检查您的Email服务器设定！',
                '此Email服务器看来可能不能使用QTGate通讯技术，请再测试一次或选择其他email服务供应商！',
                'Email服务器提示SMTP用户名或密码错！ ',
                '服务器证书错误！您可能正在连接到一个仿冒的Email服务器，如果您肯定这是您希望连接的服务器，请在SMTP详细设定中选择忽略证书错误。 ', 'SMTP连结提示未知错误', '存在相同Email账号']
        },
        emailConform: {
            activeViewTitle: '验证您的密钥',
            info1_1: `您的密钥还未完成验证，QTGate已向您的密钥邮箱发送了一封加密邮件，请检查您的 【`,
            info1_2: `】 邮箱。如果存在多封从QTGate过来的邮件时，以最后一封为准，打开信件并复制邮件内容。`,
            info2: '请复制从“-----BEGIN PGP MESSAGE----- （开始，一直到）-----END PGP MESSAGE-----” 结束的完整内容，粘贴在此输入框中。',
            emailTitle: '感谢您使用QTGate服务',
            emailDetail1: '尊敬的 ',
            emailDetail1_1: '',
            emailDetail2: '这是您的QTGate帐号激活密码，请复制下列框内的全部内容:',
            bottom1_1: '此致',
            buttom1_2: 'QTGate团队',
            conformButtom: '验 证',
            formatError: [
                '内容格式错误，请复制从“-----BEGIN PGP MESSAGE----- （开始，一直到）-----END PGP MESSAGE-----” 结束的完整内容，粘贴在此输入框中。 ',
                '提供的内容不能被解密，请确认这是在您收到的最后一封从QTGate发送过来的激活信。如果还是没法完成激活，请删除您的密钥重新生成和设定。 ',
                '和QTGate连接发生错误，请退出重新尝试！ ',
                '无效激活码！ QTGate系统已重新发送新的激活Email，并断开与您的连接。请退出QTGate重新启动QTGate后，检查您的邮箱重做激活。 ',
                '您的QTGate看上去有问题, 请删除您的密钥，重新设置您的QTGate！ ',
                'QTGate系统故障，请稍后再试。 ',
                '您当天的数据通讯量达到上限，请等待明天再试或升级用户类型',
                '用来通讯的Email设定有错误，请检查IMAP设定后重试，或QTGate不支持此Email类型',
                '您所选区域不能够连结，请稍候再试',
                '您的IMAP邮箱发信发生错误。请退出QTGate重试。如果持续发生此故障，您的IMAP帐号有可能被锁住，需要登陆您的IMAP邮箱网站解锁操作。 ',
                'QTGate程序发生错误，请退出后重启QTGate！',
                '您是高手，不用我多说了。'
            ],
            activeing: '正在通讯中'
        },
        QTGateRegion: {
            title: 'QTGate代理服务器区域选择',
            speedTest: '代理服务器速度测试：',
            error: [],
            pingError: '代理服务区域速度检测发生错误，请退出QTGate，以管理员身份再次打开QTGate后，再执行速度检测！',
            connectQTGate: '正在获得代理服务器区域信息...',
            available: '服务中',
            unavailable: '准备中',
            proxyDomain: '域名解释全程使用QTGate代理服务器端',
            setupCardTitle: '使用连接技术:',
            MultipleGateway: '同时并发使用代理数：',
            dataTransfer: '数据通讯：',
            dataTransfer_datail: ['全程使用代理服务器', '当本地不能够到达目标主机时使用'],
            proxyDataCache: '浏览数据本地缓存:',
            proxyDataCache_detail: ['本地緩存', '不緩存'],
            cacheDatePlaceholder: '缓存失效时间',
            clearCache: '立即清除所有缓存',
            localPort: '本地代理服务器端口号:',
            localPath: '本地代理服务器HTTP链接路径',
            outDoormode: '接受外網訪問',
            GlobalIp: '本机互联网IP地址:',
            QTGateRegionERROR: ['发送连接请求Email到QTGate系统发生送信错误， 请检查您的IMAP账号的设定。',
                ''],
            GlobalIpInfo: '注意：当您按下【QTGate连结】时您会把您的本机互联网IP提供给QTGate系统，如果您不愿意，请选择【@OPN】技术来使用QTGate服务！没有【@OPN】选项是因为@QTGate技术只能对应iCloud邮箱。',
            sendConnectRequestMail: ['您的QTGate客户端没有和QTgate系统联机，客户端已向QTgate系统重新发出联机请求Email。和QTgate系统联机需要额外的时间，请耐心等待。',
                '当免费用户连续24小时内没有使用客户端，您的连接会被中断。付费用户情况下QTgate系统可保持持续联机一个月。'],
            cacheDatePlaceDate: [{ name: '1小时', id: 1 }, { name: '12小时', id: 12 }, { name: '1日', id: 24 }, { name: '15日', id: 360 }, { name: '1月', id: 720 }, { name: '6月', id: 4320 }, { name: '永远', id: -1 }],
            atQTGateDetail: ['世界首创的QTGate无IP互联网通讯技术，全程使用强加密Email通讯，客户端和代理服务器彼此不用知道IP地址，具有超强隐身和保护隐私功能，强抗干扰和超強防火墙穿透能力。缺点是有延迟，网络通讯响应受您所使用的email服务供应商的服务器影响，不适合游戏视频会话等通讯。目前该技术只支持iCloud邮箱。',
                'QTGate独创普通HTTP混淆流量加密通讯技术，能够隐藏变换您的IP地址高速通讯，隐身和保护隐私，抗干扰和超強防火墙穿透能力。缺点是需要使用您的IP来直接连结代理服务器。如果您只是需要自由访问互联网，则推荐使用本技术。',
                '域名解释使用QTGate代理服务器端，可以防止域名服务器缓存污染，本选项不可修改。', '互联网数据全程使用QTGate代理，可以匿名上网隐藏您的互联网形踪。', '只有当您的本地网络不能够到达您希望访问的目标时，才使用QTGate代理服务器代为连结目标主机，本选项可以节省您的QTGate流量。',
                '通过本地缓存浏览纪录，当您再次访问目标服务器时可以增加访问速度，减少网络流量，缓存浏览纪录只针对非加密技术的HTTP浏览有效。QTGate使用强加密技术缓存浏览纪录，确保您的隐私不被泄漏。', '不保存缓存信息。',
                '设置缓存有效时间，您可以及时更新服务器数据,单位为小时。', '本地Proxy服务器，其他手机电脑和IPad等可通过连结此端口来使用QTGate服务。请设定为3001至65535之间的数字。',
                '通过设置PATH链接路径可以简单给您的Proxy服务器增加安全性，拒绝没有提供PATH的访问者使用您的Proxy服务器。']
        },
        useInfoMacOS: {
            title: '<p>本地代理服务器已在后台运行，MacOS和Windows用户可以关闭本窗口。</p>您的其他电子设备，可通过设置本地Proxy伺服器，来使用QTGate连接到互联网',
            title1: 'MacOS 本地代理服务器设定',
            proxyServerIp: '<p>代理设置选择：<span style="color: red;">自动代理设置</p>',
            proxyServerPort: 'HTTP和HTTPS代理设定：',
            proxyServerPassword: 'SOCKS代理设定：',
            info: [{
                    title: '打开控制面板，点击网络',
                    titleImage: '/images/macOsControl.jpg',
                    detail: '',
                    image: '/images/userInfoMacos1.jpg'
                }, {
                    title: '选择网络【高级...】',
                    titleImage: '',
                    detail: '',
                    image: '/images/macosUserInfo2.jpg'
                }, {
                    title: '选择代理设定，按图示选勾左边自动代理，选勾排除简单服务器名',
                    titleImage: '',
                    detail: '<p>使用HTTP和HTTPS代理请按照蓝色第一行填入，使用SOCKS代理选择蓝色第二行</p>',
                    image: '/images/macosUserInfo3.jpg'
                }]
        },
        useInfoAndroid: {
            title1: '安卓设备本地代理服务器设定',
            info: [{
                    title: '打开控制面板选择WiFi',
                    titleImage: '/images/androidSetup.jpg',
                    detail: '',
                    image: '/images/android1.jpg'
                }, {
                    title: '长按当前WiFi连接名称等待菜单出现，选择菜单的修改设定',
                    titleImage: '',
                    detail: '',
                    image: '/images/android2.jpg'
                }, {
                    title: '打开显示高级选项，在代理服务器设定(Proxy)中选择自动设置',
                    titleImage: '',
                    detail: '使用HTTP和HTTPS代理请按照蓝色第一行填入，使用SOCKS代理选择蓝色第二行',
                    image: '/images/android3.jpg'
                }]
        },
        firefoxUseInfo: {
            title1: '火狐浏览器它单独设定代理服务，可以不影响系统而轻松使用代理上网',
            info: [{
                    title: '打开火狐，点击右上角工具图标，选择设定',
                    titleImage: '/images/macOsControl.jpg',
                    detail: '<p><a href="https://www.mozilla.org/zh-CN/firefox/#/" target="_blank">下载Firefox</a></p>',
                    image: '/images/firefox1.jpg'
                }, {
                    title: '选择常规后，滚动画面至最下部，在网络代理处点击详细设定',
                    titleImage: '',
                    detail: '',
                    image: '/images/firefox2.jpg'
                }, {
                    title: '选择自动设置，选勾域名使用SOCKS v5',
                    titleImage: '',
                    detail: '使用HTTP和HTTPS代理请按照蓝色第一行填入，使用SOCKS代理选择蓝色第二行',
                    image: '/images/firefox3.jpg'
                }]
        },
        useInfoiOS: {
            title1: 'iOS设备本地代理服务器设定',
            info: [{
                    title: '打开控制面板，点击Wi-Fi',
                    titleImage: '/images/macOsControl.jpg',
                    detail: '',
                    image: '/images/iOS1.jpg'
                }, {
                    title: '选择当前WiFi的圈i符号',
                    titleImage: '',
                    detail: '',
                    image: '/images/iOS2.jpg'
                }, {
                    title: '选择底部的设置代理服务器',
                    titleImage: '',
                    detail: '',
                    image: '/images/iOS3.jpg'
                }, {
                    title: '选择自动设置',
                    titleImage: '',
                    detail: '<p>在URL网址处填入：使用HTTP和HTTPS代理请按照蓝色第一行填入，使用SOCKS代理选择蓝色第二行</p>',
                    image: '/images/iOS4.jpg'
                }]
        },
        useInfoWindows: {
            title1: 'Windows 10 代理服务器设定',
            info: [{
                    title: '关于Windows其他版本设定',
                    titleImage: '',
                    detail: '<p>Windows其他版本的代理服务器设定请参照<a href="#" onclick="return linkClick (`https://support.microsoft.com/ja-jp/help/135982/how-to-configure-internet-explorer-to-use-a-proxy-server`)">微软公司网站</a></p><p>请按以下参数设置本地代理服务器：</p>',
                    image: ''
                },
                {
                    title: '启动Internet Explorer',
                    titleImage: '/images/IE10_icon.png',
                    detail: '<p>点击右上角工具图标，滑动菜单至最下部选择【设定】</p>',
                    image: '/images/windowsUseInfo1.jpg'
                }, {
                    title: '滑动菜单至最下部选择高级设定',
                    titleImage: '',
                    detail: '',
                    image: '/images/windowsUseInfo2.jpg'
                }, {
                    title: '再次滑动菜单选择打开代理服务器设定',
                    titleImage: '',
                    detail: '',
                    image: '/images/windowsUseInfo3.jpg'
                }, {
                    title: '选择自动设置代理服务器',
                    titleImage: '',
                    detail: '<p>WINDOWS10系统只对应HTTP和HTTPS，如果想使用全局代理的用户，需另外安装浏览器如火狐等，然后在火狐浏览器内单独设定Proxy全局代理SOCKS</p>',
                    image: '/images/windowsUseInfo4.jpg'
                }]
        },
        QTGateGateway: {
            title: 'QTGate服务使用详细',
            processing: '正在尝试连接QTGate代理服务器...',
            error: ['错误：您的账号下已经有一个正在使用QTGate代理服务器的连接，请先把它断开后再尝试连接。',
                '错误：您的账号已经无可使用流量，如果您需要继续使用QTGate代理服务器，请升级您的账户类型。如果是免费用户已经使用当天100M流量，请等待到明天继续使用，如您是免费用户已经用完当月1G流量，请等待到下月继续使用。',
                '错误：数据错误，请退出并重新启动QTGate！', '非常抱歉，您请求的代理区域无资源，请选择其他区域或稍后再试', '对不起，您所请求连接的区域不支持这样的连接技术，请换其他连接方法或选择其他区域连接'],
            connected: '已连接。',
            userType: ['免费用户', '付费用户'],
            datatransferToday: '每日可使用流量限额：',
            datatransferMonth: '每月可使用流量限额：',
            todaysDatatransfer: '本日可使用流量',
            monthDatatransfer: '本月可使用流量',
            gatewayInfo: ['代理服务器IP地址：', '代理服务器连接端口：'],
            userInfoButton: '使用指南',
            stopGatewayButton: '切断连接',
            disconnecting: '正在切断中'
        },
        topWindow: {
            title: '庆祝加拿大150周年特别提供'
        },
        feedBack: {
            title: '使用信息反馈',
            additional: '添附附加信息',
            okTitle: '发送至QTGate'
        },
        qtGateView: {
            title: 'QTGate连接',
            mainImapAccount: 'QTGate通讯用邮箱',
            QTGateConnectStatus: 'QTGate连接状态',
            QTGateConnectResultWaiting: '已向QTGate系统发送连接请求Email。由于是首次连接QTGate系统，系统需要几分钟时间来完成与您的对接，请耐心等待。',
            QTGateDisconnectInfo: 'QTGate连结已断开。请选择向QTGate发送请求对接Email的IMAP帐号：',
            QTGateConnectError: ['给QTGate发送连接请求Email出现发送错误，请检查IMAP邮件帐户的SMTP设定！'],
            QTGateConnectResult: ['QTGate未联机，请点击连接QTGate！', '正在和QTGate联机中', '已经连接QTGate', '连接QTGate时发生错误，请修改IMAP账号设定', '已经连接QTGate'],
            QTGateSign: ['您的密钥状态', '还未获得QTGate信任签署,点击完成信任签署',
                '密钥获得QTGate信任签署是QTGate一个重要步骤，您今后在QTGate用户之间分享文件或传送秘密信息时，QTGate可以证明是您本人而非其他冒充者。你也可以通过您的密钥签署信任给其他QTGate用户，用以区别您自己的信任用户和非信任用户。',
                '正在获得QTGate信任签署中', '系统错误，请重启QTGate后再试，如果仍然存在，请尝试重新安装QTGate。', 'QTGate系统错误!']
        }
    }, {
        account: {
            title: 'アカウト管理',
            segmentTitle: 'アカウトタ: ',
            currentPlan: '現在加入中のプラン: ',
            MonthBandwidthTitle: '月ゲットウェイ利用可能データ量：',
            dayBandwidthTitle: '毎日利用可能データ量：',
            upgradeTitle: 'アップグレードオプション',
            DowngradeTitle: 'ダウングレードオプション',
            cancelPlan: 'キャンセルプラン',
            MonthBandwidthTitle1: 'データ量',
            continue: '次へ',
            serverShareData: ['シェアゲットウェイ', '一台独占*', '二台独占*', '四台独占'],
            internetShareData: ['シェアハイスピード回線', '独占ハイスピード一回線*', '独占ハイスピード二回線*', '独占ハイスピード四回線'],
            monthlyPay: 'プラン月額利用料',
            serverShareData1: '並列ゲットウェイ技術を使う際に、同時使う台数が独占台数を超える場合には、独占リソースを他人と割合にチェアします。',
            maxmultigateway: ['最大二つ並列ゲットウェイ', '最大四つ並列ゲットウェイ'],
            cancelPlanMessage: 'QTGateプランは月毎に計算し、来月のあなたの最初加入した日まで、今のプランのままご利用ですます。キャンセルした日から自動的にQTGateの無料ユーザーになります。おアカウトは(月)払いの場合は、来月の自動払いは中止となります。年払いの場合は、ご使った分に月普通料金と計算し控除してから、お支払いを使ったクレジットカードに戻ります。販促コードまたはテストユーザーにはキャンセルすることができません。'
        },
        QTGateDonate: {
            title: 'スポンサーが提供する無料アクセスウェブサイト',
            meta_title: 'ドナー：'
        },
        QTGateInfo: {
            title: 'QTGate機能紹介',
            version: '本機QTGateバージョン：v',
            detail: [{
                    color: '#a333c8',
                    icon: 'exchange',
                    header: '自由匿名なインターネットへ',
                    detail: '@OPNは本社の世界初のIP不要な通信技術です、<a onclick="return linkClick (`https://ja.wikipedia.org/wiki/Advanced_Encryption_Standard`)" href="#" target="_blank">AES256-GCM</a>と<a onclick="return linkClick (`https://ja.wikipedia.org/wiki/Pretty_Good_Privacy`)" href="#" target="_blank">OpenPGP</a>暗号化したEmailメッセージを通じたゲットウェイに接続します、iOPNは本社の独自のHTTPゲットウェイ暗号化高速通信技術です。どちらとも身を隠して誰も知らないうちにインターネットへ、プライバシー、ネットワーク監視とアクセスを制限・遮断にうまくすり抜けることができます。'
                }, {
                    color: '#e03997',
                    icon: 'talk outline',
                    header: 'IP不要な匿名プライバシーインスタントメッセージQTChat',
                    detail: 'QTGateユーザー間の無IPペアーツーペアープライバシーインスタントメッセージです。それは伝統的なインスタントメッセージより匿名とプライバシーが可能です。又グループをして複数なユーザーの間でのインスタントメッセージもご利用いただけます。文字をはじめ、写真やビデオ映像、あらゆるファイルの暗号化転送も可能です。QTGateシステムはインスタントメッセージを各ユーザへ転送することだけですから、メッセージの内容をチェックするまたはメッセージ所有することではありませんので、メッセージそのものに法的責任は、メッセージをしたユーザーが負うです。'
                }, {
                    color: '#6435c9',
                    icon: 'cloud upload',
                    header: 'ファイルを匿名プライバシーストレージとシェアQTStroage',
                    detail: '一つのファイルを暗号化してからスプリットし、多数のフリーメールアカンウトに保存します。無限かつ秘密プライバシーのファイルストレージ事ができます。QTGateユーザー間のファイルシェアも可能です。'
                },
                {
                    color: 'darkcyan',
                    icon: 'spy',
                    header: 'スパイソフトウェア送信を切断',
                    detail: 'QTGateシステムはグロバルDNSBLに加入し、スパイホストダータベースを更新しています。QTGateユーザはQTGateシステムをご利用してインターネットへアクセスした場合、あなたのデバイスに闇活動しているスパイソフト、収集したあなたの個人データの送信を切断することができます。'
                }, {
                    color: '#6435c9',
                    icon: 'external share',
                    header: 'ローカルVPNサーバ',
                    detail: 'QTGateユーザは自宅のマシンにVPN接続により、外にいても楽々OPNで隠れたネットワークへご利用できます。'
                }]
        },
        useInfoWindows: {
            title1: 'Windows10ロカールプロキシ設定',
            info: [{
                    title: ' その他Windowsバージョンの設定について',
                    titleImage: '',
                    detail: '<p>Windowsその他バージョンの設定は<a target="_blank" href="#" onclick="return linkClick (`https://support.microsoft.com/ja-jp/help/135982/how-to-configure-internet-explorer-to-use-a-proxy-server`)">Microsoft社のページ</a>をご参照してください。</p><p>設定する際使うデータは以下です：</p>',
                    image: ''
                },
                {
                    title: 'Internet Explorerを開く',
                    titleImage: '/images/IE10_icon.png',
                    detail: '<p>右上部のツールボタンをクリックして、メニューの一番下にある設定を選択してください。</p>',
                    image: '/images/windowsUseInfo1.jpg'
                }, {
                    title: 'メニューを一番下にスクロールして高級設定をクリック',
                    titleImage: '',
                    detail: '',
                    image: '/images/windowsUseInfo2.jpg'
                }, {
                    title: '再びメニューを下にスクロールして、オプンプロキシ設定をクリック',
                    titleImage: '',
                    detail: '',
                    image: '/images/windowsUseInfo3.jpg'
                }, {
                    title: '自動プロキシをオンに',
                    titleImage: '',
                    detail: '<p>WINDOWS 10 システムはHTTPとHTTPSしかサポートしておりませんが、SOCKSを使うなら、他のブラウザ例えばFireFoxなどをインストールによりお使いは可能です。</p>',
                    image: '/images/windowsUseInfo4.jpg'
                }]
        },
        useInfoMacOS: {
            title: 'ローカルプロキシサーバはバックグランドで実行しています。MacoSとWindowsユーザーはこのウィンドウを閉じても構わないです。他のデバイスはローカルプロキシに設定による、QTGate利用してインターネットへアクセスができます。',
            title1: 'MacOS プロキシ設定',
            proxyServerIp: '<p>プロキシの設定に：<span style="color:red;">自動設置</span></p>',
            proxyServerPort: 'HTTPとHTTPSプロキシは：',
            proxyServerPassword: 'SOCKSプロキシは：',
            info: [{
                    title: 'コントロールパネルを開いて、ネットワークをクリックしてください。',
                    titleImage: '/images/macOsControl.jpg',
                    detail: '',
                    image: '/images/userInfoMacos1.jpg'
                }, {
                    title: '詳細...をクリックしてください ',
                    titleImage: '',
                    detail: '',
                    image: '/images/macosUserInfo2.jpg'
                }, {
                    title: 'プロキシ設定を選んで、自動設置をチェック、簡単ホストをチェック',
                    titleImage: '',
                    detail: '<p>右の入力にHTTPとHTTPSは上のブルー行を、SOCKSは下の行を入力してください。</p>',
                    image: '/images/macosUserInfo3.jpg'
                }]
        },
        firefoxUseInfo: {
            title1: 'Firefoxブラウザーは単独プロキシ設定で、システムに影響なしでプロキシをご利用してインタネットアクセスができます。',
            info: [{
                    title: 'Firefoxをオプンしてツールアイコンをクリックして、設置を選んでください。',
                    titleImage: '/images/macOsControl.jpg',
                    detail: '<p><a href="https://www.mozilla.org/ja/firefox/#" target="_blank">Firefoxダウンロード</a></p>',
                    image: '/images/firefox1.jpg'
                }, {
                    title: '一番下にスクロールしてプロキシネットワークに、詳細設定を選択します',
                    titleImage: '',
                    detail: '',
                    image: '/images/firefox2.jpg'
                }, {
                    title: '自動設定を選んで、ドメインをSOCKS v5を選んで',
                    titleImage: '',
                    detail: 'HTTPとHTTPSは上のブルー行を、SOCKSは下の行を入力してください。',
                    image: '/images/firefox3.jpg'
                }]
        },
        useInfoAndroid: {
            title1: 'Androidロカールプロキシ設定',
            info: [{
                    title: `端末の設定アプリを開きます。[Wi-Fi]をタップします`,
                    titleImage: '/images/androidSetup.jpg',
                    detail: '',
                    image: '/images/android1.jpg'
                }, {
                    title: 'Wi-Fiネットワーク名を押し続けます。[ネットワークを変更]をタップします',
                    titleImage: '',
                    detail: '',
                    image: '/images/android2.jpg'
                }, {
                    title: '[詳細設定項目]の横にある下矢印をタップして、自動設定を選択します',
                    titleImage: '',
                    detail: 'HTTPとHTTPSは上のブルー行を、SOCKSは下の行を入力してください。',
                    image: '/images/android3.jpg'
                }]
        },
        useInfoiOS: {
            title1: 'iOSロカールプロキシ設定',
            info: [{
                    title: 'コントロールパネルを開いて、WiFiをタップしてください',
                    titleImage: '/images/macOsControl.jpg',
                    detail: '',
                    image: '/images/iOS1.jpg'
                }, {
                    title: 'Wi-Fiネットワーク名の右にあるまるiアイコンをタップしてください',
                    titleImage: '',
                    detail: '',
                    image: '/images/iOS2.jpg'
                }, {
                    title: '一番下のプロキシ設定をタップしてください',
                    titleImage: '',
                    detail: '',
                    image: '/images/iOS3.jpg'
                }, {
                    title: '自動設定を選択。',
                    titleImage: '',
                    detail: '<p>URLにHTTPとHTTPSは上のブルー行を、SOCKSは下の行を入力してください。</p>',
                    image: '/images/iOS4.jpg'
                }]
        },
        cover: {
            firstTitle1: 'これからあなたのデバイスを',
            firstTitle2: '隠れて安全自由なネットワークへ',
            start: 'オプンドア'
        },
        firstNote: {
            title: 'QTGateの製品およびサービス（以下「本サービス」）をご利用いただきありがとうございます。本サービスはカナダQTGateシステムズ株式会社が提供しています。',
            firstPart: 'ユーザーは、本サービスを利用することにより、本規約に同意することになります。以下を注意してお読みください。',
            detail: [
                {
                    header: '本サービスのご利用について',
                    detail: '本サービス内で入手できるすべてのポリシーを遵守してください。本サービスを不正に利用しないでください。たとえば、本サービスの妨害や、QTGateが提供するインターフェースおよび手順以外の方法による、本サービスへのアクセスを試みてはなりません。'
                }, {
                    header: null,
                    detail: 'ユーザーは、法律（輸出、再輸出に関して適用される法規制を含みます）で認められている場合に限り、本サービスを利用することができます。ユーザーがQTGateの規約やポリシーを遵守しない場合、またはQTGateが不正行為と疑う行為について調査を行う場合に、QTGateはユーザーに対する本サービスの提供を一時停止または停止することができます。'
                }, {
                    header: '無IP通信技術OPNネットワークはプライベートに限界があります',
                    detail: 'OPN無IP通信は弊社の革新的技術であります。あなたはQTGate端末ソフトを使ってQTGateシステムとのコミニュケーションはお客さんが無IPでプライベートな通信を行います。（但しiOPN技術を選択してゲットウェーに接続した場合は、お客さんのIPアドレスをQTGateシステムに提示するのが必要です。）でもお客さんのIPアドレスはeメールプロバイダーのログに記録していたかもしれません。裁判所命令を持つカナダの法執行機関はQTGateのログを得て、eメールプロバイダーのログと合併して、お客さんのプライベートインフォメーションを入手することも可能です。'
                },
                {
                    header: null,
                    detail: 'ユーザーは、本サービスを利用することによって、本サービスまたはアクセスするコンテンツに対するいかなる知的財産権も取得することはありません。ユーザーは、本サービスのコンテンツの所有者から許可を得た場合や、法律によって認められる場合を除き、そのコンテンツを利用することはできません。本規約は、本サービスで使用されている、いかなるブランドまたはロゴを利用する権利もユーザーに与えるものではありません。本サービス内に表示される、または、本サービスに伴って表示されるいかなる法的通知も、削除したり、隠したり、改ざんしてはなりません。'
                },
                {
                    header: '個人情報保護及びQTGateからのインフォーメーションの受信について',
                    detail: '本サービスの利用に関して、QTGateはユーザーに対してサービスの告知、管理上のメッセージ、およびその他の情報を送信することができます。ユーザーは、これらの通知について、受け取らないことを選択できる場合があります。'
                }, {
                    header: null,
                    detail: 'お客様がQTGateサービスをご利用になる際に、お客様のデータ通信料計算のために、ご利用データ量が自動的に収集および保存されます。限られたログは以下のようです。日付、お客様アカウント、ご利用ゲットウェーエリアとゲットウェーIPアドレス、データ量、アップ又はダウンロード。例：'
                }, {
                    header: null,
                    detail: '<p class="tag info">06/20/2017 18:12:16, info@qtgate.com, francisco, 104.236.162.139, 300322 byte up, 482776323 byte down.</p><p class="tag info">06/21/2017 12:04:18, info@qtgate.com, francisco, 104.236.162.139, 1435226 byte up, 11782238 byte down.</p>'
                }, {
                    header: null,
                    detail: 'QTGateは以上の情報以外には保存することしません。QTGateは以上の情報をカナダーの裁判所命令を持つカナダの法執行機関に協力することがありえます。カナダ以外のこのログ情報を協力する要請のあなたは、まずカナダ外務省までお問い合わせ下さい：'
                }, {
                    header: null,
                    detail: '<a class="tag alert" href="http://www.international.gc.ca/">http://www.international.gc.ca/</a>'
                }, {
                    header: 'ソフトウェアの版権について',
                    detail: 'QTGateは、本サービスの一環としてユーザーに提供するソフトウェアについて、全世界で適用され、譲渡不可で、非独占的な個人使用ライセンスを無償でユーザーに付与します。このライセンスは、QTGateが提供する本サービスを本規約により許可された方法でユーザーが使用し、その便益を享受できるようにすることを唯一の目的としています。'
                }, {
                    header: null,
                    detail: 'ユーザーは、本サービスまたは本サービスに含まれるソフトウェアのどの部分も、複製、変更、配信、販売、貸与することはできず、そのソフトウェアのソース コードのリバース エンジニアリングや抽出を試みることはできません。'
                }, {
                    header: '本サービスの変更または終了',
                    detail: 'QTGateは、常に本サービスの変更および改善を行っています。QTGateは、機能性や機能の追加や削除を行うことができ、本サービス全体を一時停止または終了することができます。ユーザーはいつでも本サービスの利用を終了することができます。QTGateもいつでも、ユーザーに対する本サービスの提供を停止し、または、本サービスに対する制限を追加または新規に設定することができます。'
                }, {
                    header: '保証および免責',
                    detail: 'QTGateは、商業上合理的な水準の技術および注意のもとに本サービスを提供し、ユーザーに本サービスの利用を楽しんでいただくことを望んでいますが、本サービスについて約束できないことがあります。'
                }, {
                    header: null,
                    detail: '本規約または追加規定に明示的に規定されている場合を除き、QTGateまたはそのサプライヤーもしくはディストリビューターのいずれも、本サービスについて具体的な保証を行いません。たとえば QTGateは、本サービス内のコンテンツ、本サービスの特定の機能、その信頼性、利用可能性、またはユーザーのニーズに応える能力について、何らの約束もしません。本サービスは「現状有姿で」提供されます。'
                }, {
                    header: '本サービスに対するQTGateの責任',
                    detail: '法律で認められる場合には、QTGateならびにそのサプライヤーおよびディストリビューターは、逸失利益、逸失売上もしくはデータの紛失、金銭的損失、または間接損害、特別損害、結果損害もしくは懲罰的損害について責任を負いません。'
                }, {
                    header: 'カナダー法律によるサービス禁止対象者',
                    detail: 'あなたはカナダー法律によってサービス禁止対象者ではありませんと確認していた事。'
                },
                {
                    header: '事業者による本サービスの利用',
                    detail: '本サービスを事業者のために利用する場合、その事業者は本規約に同意するものとします。かかる事業者は、QTGateとその関連会社、役員、代理店、従業員を、本サービスの利用または本規約への違反に関連または起因するあらゆる請求申し立て、訴訟、法的措置について、請求申し立て、損失、損害、訴訟、裁判、告訴から生じる法的責任および費用、弁護士費用を含め、免責および補償するものとします。'
                }, {
                    header: '本規約について',
                    detail: 'QTGateは、たとえば、法律の改正または本サービスの変更を反映するために、本サービスに適用する本規約または特定の本サービスについての追加規定を修正することがあります。ユーザーは定期的に本規約をご確認ください。QTGateは、本規約の修正に関する通知をこのページに表示します。'
                }, {
                    header: null,
                    detail: '追加規定の修正については、該当する本サービス内において通知を表示します。変更は、さかのぼって適用されることはなく、その変更が表示されてから 14 日以降に発効します。ただし、本サービスの新機能に対処する変更または法律上の理由に基づく変更は、直ちに発効するものとします。本サービスに関する修正された規定に同意しないユーザーは、本サービスの利用を停止してください。'
                }, {
                    header: null,
                    detail: '本規約と追加規定との間に矛盾が存在する場合には、追加規定が本規約に優先します。本規約は、QTGateとユーザーとの間の関係を規定するものです。本規約は、第三者の受益権を創設するものではありません。ユーザーが本規約を遵守しない場合に、QTGateが直ちに法的措置を講じないことがあったとしても、そのことによって、QTGateが有している権利（たとえば、将来において、法的措置を講じる権利）を放棄しようとしていることを意味するものではありません。'
                }, {
                    header: null,
                    detail: 'ある特定の規定が強制執行不可能であることが判明した場合であっても、そのことは他のいずれの規定にも影響を及ぼすものではありません。カナダBC州の抵触法を除き、本規約または本サービスに起因するまたは関連するいかなる紛争に関しても、カナダBC州の法律が適用されます。本規約または本サービスに起因するまたは関連するいかなる主張についても、カナダBC州内に所在する裁判所においてのみ裁判手続を取ることができるものとし、ユーザーとQTGateはその裁判所の対人管轄権に同意するものとします。'
                }
            ],
            disagree: 'キャンセル',
            agreeMent: 'QTGate利用規約とプライバシー'
        },
        linuxUpdate: {
            newVersionDownload: 'クリックしてダウンロードとインストール',
            step1: 'ダウンロードニューバージョン',
            step2: 'QTGateを実行ファイルに許可与える。',
            step2J1: '/images/linuxUpdate1_jp.jpg',
            step2J2: '/images/linuxUpdate2_jp.jpg',
            step2_detail1: '右クリックダウンロードしたQTGateファイル、プロパティを選んでください。',
            step2_detail2: 'アクセス権にポログラムとして実行可能をチェック',
            step3: '旧バージョンQTGateを退出して、新しいQTGateバージョンをダブクリックしてインストールをします。',
            exit: '旧QTGateを退出'
        },
        topWindow: {
            title: 'カナダ１５０周年特別提供'
        },
        imapInformation: {
            title: '通信専用Emailアカウントを登録',
            infomation: `QTGate通信専用emailアカンウトを設定します。このemailアカウントはあなたとQTGateお互い情報交換するのために、ユーザ名とパスワードをQTGateシステムへ提供します。個人情報漏洩の恐れ、一時的なemailアカウントを新たにつくてください。QTGate技術は只今<a href="#" onclick="return linkClick ('https://icloud.com')">Apple iCloud</a>, <a href="#" onclick="return linkClick ('https://www.microsoft.com/ja-jp/outlook-com/')">Outlook</a>, <a href="#" onclick="return linkClick ('https://login.yahoo.co.jp/config/login?.src=ym&.done=https%3A%2F%2Fmail.yahoo.co.jp%2F')">Yahoo Mail</a>, <a href="#" onclick="return linkClick ('https://gmail.com')">GMAIL</a>, <a href="#" onclick="return linkClick ('https://www.gmx.com/mail/#.1559516-header-nav1-2')">GMX</a>, <a href="#" onclick="return linkClick ('https://www.zoho.com/mail/')">HOZO</a>対応しております、APPLEのiCloudを使うお勧めです。( @OPN IPなし通信技術はiCloudのみ対応しております）</span>メールアカウントのパスワードについて、<a href="#" onclick="return linkClick ('https://support.microsoft.com/ja-jp/help/12409/microsoft-account-app-passwords-two-step-verification')">アプリパスワード</a>をご利用のをお勧めです。アプリパスワードを申請する際に、<a href="#" onclick="return linkClick ('https://support.microsoft.com/ja-jp/help/12408')">2段階認証プロセス</a>に必要なスマートフォン番号を提示が必要な場合、個人プライバシーを守るのため、( <a href="#" onclick="return linkClick('http://receive-sms-online.com/')">receive-sms-online.com</a>, <a href="#" onclick="return linkClick('https://sms-online.co/receive-free-sms')" >sms-online.co</a>, <a href="#" onclick="return linkClick('https://receive-a-sms.com/')" >receive-a-sms.com</a> ) など<a href="#" onclick="return linkClick ('http://jpnpay.com/archives/561')">オンライン無料SMS受信サービス</a>をお勧めします。`,
            serverDetail: '詳細設定：',
            imapServer: 'IMAP設定',
            imapServerInput: 'IMAPサーバー名又はIP',
            UserName: 'ログインユーザー名',
            Ssl: 'Ssl暗号化通信：',
            portName: '通信ポート番号',
            otherPortNumber: 'その他：',
            Error_portNumber: '通信ポート番号は1から65535までの数字です。',
            smtpServer: 'SMTP設定',
            smtpServerInput: 'SMTPサーバー名又はIP',
            emailServerPassword: 'Emailパスワード(アプリパスワードお勧め)',
            imapAccountConform: '<p><dt>以下の事項を確認してから送信ボタンを押してください：</dt></p>このEmailアカンウトはあなたのよく使っているEmailアカンウトと違って、QTGateシステムを使用するのために、一時的新たに作ったEmailアカンウトです。あなたはQTGateにこのEmailアカンウトのフールアクセス権にすることが了承しました。',
            agree: '私はそのリスクが了承して続きする',
            imapOtherCheckError: 'Emailサーバーに接続ができませんでした。Emailサーバー名又はIPアドレス又は通信ポート番号に間違いがあります、詳細設定で再チェックをしてください。',
            CertificateError: 'Emailサーバーに提示したセキュリティ証明書は信頼できないものです。続くをしたい場合は、詳細設定の中の「セキュリティ証明書信頼でき無くとも接続をする」を選択してください。その場合はあなたのEmailインフォメーションを漏れる可能性があります。',
            IgnoreCertificate: 'セキュリティ証明書信頼でき無くとも接続をする',
            Certificat: '危ないこのです、この選択であなたのユーザ情報は盗聴される可能性が大きい。',
            addAEmail: '通信用Email追加',
            AuthenticationFailed: 'Emailサーバはログインエラーが提示しました。ユーザー名とパスワードを再チェックしてください。',
            tryAgain: 'もう一度試しにします',
            connectImap: 'QTGateに接続にします',
            cancelConnect: 'QTGateとの接続を中止します',
            imapItemTitle: '通信用Email詳細設定',
            imapCheckingStep: ['emailサーバへ接続しています。', 'emailサーバへIMAP接続しました', 'emailサーバへSMTP接続しました'],
            imapResultTitle: 'IMAPサーバQTGate評価：',
            testSuccess: 'emailサーバのテストが完了しました',
            exitEdit: '退出編集Emailアカンウト',
            deleteImap: 'IMAPアカウトを削除',
            proxyPortError: 'ポート番号は1000から65535までの数字です。又はこのポート番号は他のアプリが使っています。他の番号にチェンジしてください。',
            appPassword: 'APPパスワードについて'
        },
        Home_keyPairInfo_view: {
            newVersionDownload: 'クリックしてダウンロードとインストール',
            title: '鍵ペアインフォメーション',
            emailNotVerifi: '鍵ペアはまだQTGateサインされていません。',
            emailVerified: '鍵ペアはQTGateサインされました。',
            NickName: 'ニックネーム：',
            creatDate: '暗号鍵ペア作成日：',
            keyLength: '暗号鍵ペアビット長さ：',
            password: '長さ5位以上のパスワードを入力してください',
            password1: '鍵ペアパスワード',
            logout: 'ログアウト',
            keyID: '暗号鍵ID：',
            deleteKeyPairInfo: '鍵ペアを削除することで、現在のQTGate設定は全部なくなって、一からQTGateの設定をやり直しが必要です。但しあなたのQTGateアカウトEmailアドレスは前回と同じであれば、QTGateアカウトを戻れます。',
            delete: '削除',
            locked: 'まず鍵ペアのパスワードを入力して、鍵ペアのロックを解除してください。',
            systemError: 'システムエラーが発生しました。鍵ペアを削除して一からシステムを再設定をしてください。'
        },
        home_index_view: {
            newVersion: '新たなパージョンが用意しましたのでインストールをください。',
            newVersionInstallLoading: '更新中お待ちください',
            localIpAddress: 'ローカル',
            clickInstall: 'インストール',
            internetLable: 'Internet',
            gateWayName: 'ゲットウェー',
            showing: 'システム状態',
            nextPage: '次へ',
            agree: '協議を合意し、次へ',
            emailAddress: 'Emailアドレス(必須)',
            SystemAdministratorNickName: 'ニックネーム(必須)',
            creatKeyPair: '暗号鍵ペアを生成...',
            systemPassword: 'パスワード',
            stopCreateKeyPair: '暗号鍵ペア生成をキャンセル',
            cancel: '操作停止',
            continueCreateKeyPair: '生成を続きします',
            KeypairLength: 'RSA暗号鍵ペアの長度を選んでください。この数字が長ければ、長いほど秘匿性によいですが、スピードが遅くなります。',
            systemAdministratorEmail: 'RSA暗号鍵ペア生成',
            GenerateKeypair: '<em>強秘匿性通信するのために、RSA暗号鍵ペアを生成中、大量なランダム数字が発生し、数分かかる場合もあります、4096ビットの場合、特に時間がかかります、しばらくお待ち下さい。RSA暗号技術について、ウィキペディア百科辞典を参考してください：' +
                `<a href='https://ja.wikipedia.org/wiki/RSA暗号' target="_blank" onclick="return linkClick ('https://ja.wikipedia.org/wiki/RSA暗号')">https://ja.wikipedia.org/wiki/RSA暗号</a></em>`,
            inputEmail: 'お疲れ様です、最後の設定をしましょう。このRSA暗号鍵ペアは本システムに重要な存在です、ユーザーのQTGateへ身元証明、本システムデータを秘密化、QTGateシステムとデータ通信時この暗号鍵ペアを使います。パースワードはQTGateへ保存しませんですから、大事にメモしてください。<em style="color:red;">QTGateはネットワークの制限があるエリアにブラックリスト入っております、あなたはQTGateからのemailは受信不能になりますから、QTGateユーザへ登録完了することができない恐れがございます。</em>',
            accountEmailInfo: 'QTGateドメイン名は、ファイヤウォールがある場合はブラックリストに入っている可能性がありますから、QTGateシステムへ登録完了することができません。その場合はファイヤウォール外側のEmailシステムを利用してください。'
        },
        error_message: {
            title: 'エラー',
            errorNotifyTitle: 'システムエラー',
            EmailAddress: ['メール アドレスを someone@example.com の形式で入力してください。', '同じEmailアカンウトが既に存在します。', '入力したメールはQTGateシステム非対応です。'],
            required: 'このフィールドを入力してください。',
            PasswordLengthError: '5文字以上の長さのパスワードが必要。',
            localServerError: 'ローカルサーバーエラーが発生しました、QTGateを再起動をください！',
            finishedKeyPair: '暗号鍵ペア作成完了しました。',
            Success: '完成',
            doCancel: 'キャンセルしました',
            errorKeyPair: '暗号鍵ペア作成際エラーが発生、もう一度してください。',
            SystemPasswordError: '暗号鍵パスワードが違います。パースワードが忘れた場合、現在の鍵ペアを削除してください。この場合は、現有の設定はなくなって、一からシステム設定をやり直しが必要です。',
            finishedDeleteKeyPair: '暗号鍵ペア削除しました。',
            offlineError: 'インターネット接続されていないらしいですが、ネットワークをチェックしてもう一度お試しください！',
            imapErrorMessage: ['',
                'データフーマットエラー！',
                'インターネット接続されていないらしいですが、ネットワークをチェックしてもう一度お試しください！',
                'mailサーバはIMAPユーザー名又はパスワードに間違いがあると提示しました！このエラーは普通パスワードを使っていましたか、またはAPPパスワードが失効と可能性もありますが、メールプロバイダのアカウトページへチェックをしてください。',
                '指定したPORTでemailサーバへIMAPの接続ができませんでした、PORT番号をチェックしてください、ファイヤウォールの中にいる場合、指定したPORTはファイアウォールにフィルタした可能性があ裏ます、IMAPサーバーのその他有効PORT番号にチェッジしてください。<a href="https://tw.help.yahoo.com/kb/SLN15241.html" target="_blank" onclick="return linkClick (`https://tw.help.yahoo.com/kb/SLN15241.html`)">应用密码</a>',
                'IMAPサーバのセキュリティ証明書信頼できません。詐欺や、お使いのコンピューターからサーバーに送信されると情報を盗み取る意図が示唆されている場合があります。',
                'emailサーバドメインは有効ではありません、emailサーバの設定を修正してください。',
                'このemailサーバはQTGate通信技術サポートしていません、もう一度テストをするか、他のemailプロバイダにチェンジをしてください。',
                'emailサーバはSMTPユーザー名又はパスワードに間違いがあると提示しました！',
                'SMTPサーバのセキュリティ証明書信頼できません。詐欺や、お使いのコンピューターからサーバーに送信されると情報を盗み取る意図が示唆されている場合があります。',
                'SMTPサーバへ接続ができません。',
                '同じEmailアカンウトが既に存在します。']
        },
        emailConform: {
            activeViewTitle: '鍵ペア検証',
            info1_1: `鍵ペア検証は未完成です。QTGateは宛先 「`,
            info1_2: `」 に検証メールをしました。メールボックスをチェックしてください。QTGateから多数メールの場合は、最後のを選んでください。`,
            info2: 'コピーするのは「-----BEGIN PGP MESSAGE-----」から「-----END PGP MESSAGE-----」まで全ての内容をしてください。',
            emailTitle: 'QTGateをご利用頂いて誠に有難うございます',
            emailDetail1: '',
            emailDetail1_1: ' 様',
            emailDetail2: 'あなたのQTGateアカンウト検証暗号です。以下の全ての内容をコピーして、認証フィルターにペーストをしてください。',
            bottom1_1: '以上',
            bottom1_2: 'QTGateチームより',
            conformButtom: '検 証',
            formatError: [
                'フォーマットエラー、コピーするのは「-----BEGIN PGP MESSAGE-----」から「-----END PGP MESSAGE-----」まで全ての内容をしてください。',
                'この内容で暗号化解除ができませんでした。鍵ペアEmailアカンウトメールボックス再検査し、QTGateから最後のを選んでください。または鍵ペアを削除して、鍵ペア再発行してください。',
                'QTGateに接続するのはエラーが発生した、一回退出し、再起動して接続をしてください。',
                '検証できません！QTGateシステムは接続を切断しました、新たな検証をQTGateアカンウトメールボックスに届きます、まずQTGate再起動してから、再検証をください。',
                'あなたのQTGateは問題があります、鍵ペアを削除して一から再セットアップしてください。',
                'QTGateシステムは故障があります、後からもう一度試しにしてください',
                'あなたの今日データ通信はリミットになっていますので、明日まで待ってください。またはユーザー種類をアップグレードをしてください',
                '通信用IMAPの設定にエラーがあるか又はそのタープのIMAPアカンウトがQTGateサポートしません。よくチェックしてもう一回試しにしてください。',
                '選択していたゲットウェーエリアは只今接続不能になっております、後ほどもう一度試しにしてください。',
                'IMAPアカウトでEMAIL送信する際エラーが発生しました、一回退出し、起動して見てくださいね。重複発生した場合はIMAPアカウトのウェーブページでアカウトをアンロック操作を必要かもしれない。',
                'QTGateエラーが発生したした。一回退出してQTGateを再起動してください。',
                'アララーー、あなたには負けるそ。'
            ],
            activeing: '通信中'
        },
        QTGateRegion: {
            title: 'QTGateゲットウェイエリア',
            speedTest: 'スピードテスト：',
            available: 'サービス中',
            unavailable: '準備しています',
            proxyDomain: 'ドメイン検索はQTGateゲットウェイ側に依頼します。',
            setupCardTitle: '接続技術:',
            MultipleGateway: '並列使うゲットウェイ数：',
            dataTransfer: '通信データは：',
            dataTransfer_datail: ['全てのデータをOPN経由', 'ターゲットサーバ到達不能時だけ'],
            proxyDataCache: 'Webキャッシュ:',
            proxyDataCache_detail: ['Yes', 'No'],
            clearCache: 'クリアオールキャッシュ',
            cacheDatePlaceholder: 'Webキャッシュ有効期限',
            localPort: 'ローカルプロキシポート番号:',
            localPath: 'ローカルプロキシポートPATHを指定します。',
            outDoormode: '接受外網訪問',
            pingError: 'QTGateゲットウェイエリアスピードチェックエラーが発生しました。一回QTGateを終了して、管理者としてQTGateを再起動をして、スピードチェックをしてください。',
            QTGateRegionERROR: ['QTGateへ接続要請メールの送信ができなかったです。IMAPアカウントの設定を調べてください。',
                ''],
            sendConnectRequestMail: ['QTGateクライアントはQTGateシステムとの接続が切れた。再接続要請メールをQTGateシステムへ送信しました、接続を完了するまで時間がかかるのためしばらくお待ちおください。',
                'フリーユーザアカンウトには24時間以内、QTGateをご利用していなっかたの場合、QTGateシステムは接続を切る事にします。QTGateシステムは有料ユーザーにはが一ヶ月長時間接続できます。'],
            GlobalIp: 'グロバールIP:',
            GlobalIpInfo: '要注意：【QTGate接続】をおすとあなたのグロバールIPアドレスをQTGateシステムに送信しますので、それを遠慮すれば【@OPN】接続を選んでください。【@OPN】が見つからない場合は@OPN技術がiCloudしか対応しておりません。',
            cacheDatePlaceDate: [{ name: '1時間', id: 1 }, { name: '12時間', id: 12 }, { name: '一日', id: 24 }, { name: '15日', id: 360 }, { name: '1月', id: 720 }, { name: '6月', id: 4320 }, { name: '永遠', id: -1 }],
            connectQTGate: 'QTGateゲットウェーエリアインフォメーションを取得しています...',
            atQTGateDetail: ['QTGateの世界初のIP不要な通信技術です。暗号化したEmailメッセージを通じたゲットウェイに接続することで、身を隠して誰も知らないうちにインターネットへ、プライバシーと強くファイヤウォールをうまくすり抜けることができます。但しお使いメールサーバの性能に次第スピードが遅くなり、長い遅延など短所があります、ゲームやビデオチャットなどに通信障害出る可能性があります。この技術はiCloudアカンウトのみ対応です',
                'QTGateオリジナル技術のトラフィックをHTTPに偽装した暗号化通信技術です。あなたのIPを使ってゲットウェイに直接接続することで、高速通信とプライバシー、強くファイヤウォールをうまくすり抜けることができます。インターネット自由アクセスのためにQTGateを使うことになら、これをおすすめです。',
                'ドメイン検索をQTGateゲットウェイ側にすることで DNS cache pollution を防ぐことができます。この選択は必要です。', '全てインターネットデータをQTGateゲットウェイに通じてすることで、匿名でインターネットアクセスします。',
                'ローカルネットワークが目標サーバに到達不能な際に、QTGateゲットウェイ通じてします。このことでQTGateデータ通信量節約することができます。', 'アクセスしたWebサイトを一時ファイルに保持することで、高速レスポンスが利用可能となります、QTGateはいつも暗号化したデータを本機に保存します。但し暗号化通信には不対応です。',
                'キャッシュ有効期限の設定によって、いつもサーバ側の最新情報を入手することができます。単位は時間です。', 'ローカルプロキシサーバーが他のデバイスをこのポートに接続によってQTGateデータの通信を利用可能です。3001から65535の間の数字を入れてください。',
                'ローカルポロックPATHを指定することで、あなたのローカルポロックサーバを簡単セキュリティを与えられます。無断使用を禁止することができます。']
        },
        QTGateGateway: {
            title: 'QTGateサービス使用詳細',
            processing: 'QTGateゲットウェイへ接続中...',
            error: ['エラー：あなたのアカンウトに既にQTGateゲットウェイに接続しているクライアントがありますが、その接続を退出してからもう一度接続してください。',
                'エラー：あなたのアカンウトにQTGateゲットウェイデータ通信制限になっております。もし引き続きご利用を頂きたいなら、アカンウトをアップグレードにしてください。フリーアカウントの場合は毎日100M、毎月1GBの通信制限があります。',
                'エラー：データフォーマットエラー、QTGateをリスタートしてください。', 'ごめんなさい、ご請求したゲットウェイエリアは準備中です。そのたのエリアを選ぶか、後ほど接続をしてください。',
                'エラー：請求した接続方法はこのエリアに対応しておりません、他のエリアに変更するか他の接続方法へください。'],
            connected: '接続しました。',
            userType: ['無料ユーザー', '月契約ユーザー'],
            datatransferToday: '毎日使える通信量：',
            datatransferMonth: '毎月使える通信量：',
            todaysDatatransfer: '今日使える量',
            monthDatatransfer: '今月使える量',
            gatewayInfo: ['ゲットウェイIPアドレス：', 'ゲットウェイ接続ポート番号：'],
            userInfoButton: '使用ガイド',
            stopGatewayButton: 'ゲットウェイ接続を切る',
            disconnecting: '接続を切っています'
        },
        qtGateView: {
            title: 'QTGates接続',
            QTGateConnectResultWaiting: 'QTGateシステムへ接続請求メールを送信しました。初めてのQTGateシステムへ接続請求ですから、接続完成したまで数分かかる場合もあるかもしれませんが、暫くお待ちをください。',
            mainImapAccount: 'QTGateへ情報交換用Emailアカンウト',
            QTGateDisconnectInfo: 'QTGateと接続はしておりません、通信専用Emailを選択してQTGateへ接続メールを送信します。',
            QTGateConnectError: ['QTGateへメールの送信にエラーが発生しました。通信専用Emailをチェックしてください。'],
            QTGateConnectStatus: 'QTGate接続状態',
            QTGateConnectResult: ['未接続、クリックと接続します。', 'QTGateへ接続中.', 'QTGateに接続しました。', 'QTGateへ接続にエラーが発生しました。IMAP設定を立ち直すしてください。',
                'QTGateに接続しました。'],
            QTGateSign: ['あなたの鍵ペア状態', 'QTGateに信頼サインがないです', 'QTGateに信頼サインを取得したことで、QTGateシステムにユーザーの間にファイル又はインフォーメーションなど秘密情報を交換する際、あなたの身元証明となります。本人以外のを区別することができます。あなたも持っている鍵ペアで他のQTGateユーサーに信頼サインすることで、あるQTGateユーサーを信頼関係確定することができます。',
                'QTGateに信頼サインを取得しています', 'QTGateシステムエラー、QTGateを再起動してからもう一度してみてください。もし直れないならQTGateを一から再インストールしてください。', 'QTGateシステムエラー']
        },
        feedBack: {
            title: 'フィードバック',
            additional: '追加情報を添付する',
            okTitle: 'QTGateへ送信'
        },
    }, {
        account: {
            title: 'Manage account',
            segmentTitle: 'Account: ',
            currentPlan: 'Current Plan: ',
            MonthBandwidthTitle: 'Gateway Month Bandwidth：',
            dayBandwidthTitle: 'Day limited：',
            upgradeTitle: 'Upgrade Option',
            DowngradeTitle: 'Downgrade Option',
            cancelPlan: 'Cancel plan',
            MonthBandwidthTitle1: 'Bandwidth',
            serverShare: 'Gateway',
            continue: 'Next step',
            serverShareData: ['Share gateway', '1 Dedicated*', '2 Dedicated*', '4 Dedicated'],
            internetShareData: ['Share high speed internet', 'Dedicated 1 high speed internet*', 'Dedicated 2 high speed internet*', 'Dedicated 4 high speed internet'],
            maxmultigateway: ['Max 2 multi-gateway', 'Max 4 multi-gateway'],
            monthlyPay: 'Monthly pricing',
            cancelPlanMessage: 'You may cancel your QTGate subscription at any time, and you will continue to have access to the QTGate services through the end of your paid period until all remaining subscription time in your account is used up. Restrictions apply to free accounts and accounts using promotions.',
            serverShareData1: 'Your dedicated server will be share ratio when you connected over your dedicated count via use Multi-gateway technology.'
        },
        QTGateDonate: {
            title: 'Free access website provided by sponsor.',
            meta_title: 'Donor：'
        },
        QTGateInfo: {
            title: 'QTGate Features',
            version: 'Installed QTGate veriosn：v',
            detail: [{
                    color: '#a333c8',
                    icon: 'exchange',
                    header: 'Security and Privacy while accessing the Open Internet',
                    detail: `@OPN@ uses QTGate’s “Quiet” technology to create a obfuscated private network by refracting encrypted data packets thru email servers. @OPN provides true stealth internet communications where your IP address is hidden to client or proxy servers. iOPN uses QTGate’s technology to obfuscate data traffic over HTTP. Both @OPN and iOPN offer security, protection and privacy while allowing access to the open internet. All data is kept private with encryption using <a onclick="return linkClick('https://en.wikipedia.org/wiki/Advanced_Encryption_Standard')" href="#" target="_blank">AES256-GCM</a> and <a onclick="return linkClick ('https://en.wikipedia.org/wiki/Pretty_Good_Privacy')" href="#" target="_blank">OpenPGP</a> along with QTGate’s proprietary security measures.`
                }, {
                    color: '#e03997',
                    icon: 'talk outline',
                    header: 'QTChat: Private and secure, peer to peer Instant messaging with no IP address.',
                    detail: 'QTGate users can communicate with others via a private and secure instant messaging service. Using the @OPN stealth technology and end-to-end encryption, users are secure and messages kept private with no IP address footprint. Supports group chat with multiple users and can be used for privately transferring, pictures, files and live video streaming. Using end-to-end encryption ensures only the user and the people the user is communicating with can read what is sent, and nobody in between, not even QTGate. This is because messages are secured with an encrypted lock, and only the recipient and original message sender will have the special key needed to unlock and read them.'
                }, {
                    color: '#6435c9',
                    icon: 'cloud upload',
                    header: 'QTStroage: The secure and Private cloud storage and file sharing.',
                    detail: 'Users can store and share files by using QTGate @OPN to split files into multiple parts, each encrypted to different email accounts. QTGate user can share the file privately between other users on QTGate’s OPN.'
                },
                {
                    color: 'darkcyan',
                    icon: 'spy',
                    header: 'Spam and Spyware detection and blocking.',
                    detail: 'QTGate system uses the global DNSBL database to stop spam and spyware. QTGate users will be automatically filtered from spam and spyware to stop them from transmitting your information.'
                }, {
                    color: '#6435c9',
                    icon: 'external share',
                    header: 'Personal VPN connection.',
                    detail: 'Access your QTGate OPN services anywhere via personal VPN connection from anywhere.'
                }]
        },
        firefoxUseInfo: {
            title1: 'Firefox browser can use separate proxy settings from the system settings. This allows for easy use of a proxy to access the internet without editing the system settings.',
            info: [{
                    title: 'CClick Firefox tool icon. Select Preferences or Options.',
                    titleImage: '/images/macOsControl.jpg',
                    detail: '<p><a href="https://www.mozilla.org/en-US/firefox/#" target="_blank">Download Firefox.</a></p>',
                    image: '/images/firefox1.jpg'
                }, {
                    title: 'In the General tab, scroll to the bottom, click on Settings under Network Proxy.',
                    titleImage: '',
                    detail: '',
                    image: '/images/firefox2.jpg'
                }, {
                    title: 'Select Automatic proxy configuration URL and insert the URL as shown in blue below (select URL for HTTP/S or SOCKS). Make sure to Check on “Proxy DNS when using SOCKS v5”. Click OK to finish setup.',
                    titleImage: '',
                    detail: 'Chose either HTTP or Socket settings.',
                    image: '/images/firefox3.jpg'
                }]
        },
        cover: {
            firstTitle1: 'Browse Quietly',
            firstTitle2: 'Your Gateway to a Secure and Open Internet',
            start: 'ENTER NOW'
        },
        useInfoiOS: {
            title1: 'iOS device local proxy setup.',
            info: [{
                    title: 'Open the control panel and select the WiFi settings.',
                    titleImage: '/images/macOsControl.jpg',
                    detail: '',
                    image: '/images/iOS1.jpg'
                }, {
                    title: 'Select the icon on the right side of the connected Wifi name.',
                    titleImage: '',
                    detail: '',
                    image: '/images/iOS2.jpg'
                }, {
                    title: 'Turn On Configure Proxy',
                    titleImage: '',
                    detail: '',
                    image: '/images/iOS3.jpg'
                }, {
                    title: 'Select Automatic.',
                    titleImage: '',
                    detail: '<p>Check Automatic proxy and insert the URL as shown in blue below (select URL for HTTP/S or SOCKS). Save to finish setup.</p>',
                    image: '/images/iOS4.jpg'
                }]
        },
        useInfoAndroid: {
            title1: 'Android device local proxy setup.',
            info: [{
                    title: `Open your device’s Settings. Under Networks, Select Wi-Fi.`,
                    titleImage: '/images/androidSetup.jpg',
                    detail: '',
                    image: '/images/android1.jpg'
                }, {
                    title: 'Tap and hold the connected Wi-Fi network name until a pop up menu appears. Then tap Modify network or Manage network settings.',
                    titleImage: '',
                    detail: '',
                    image: '/images/android2.jpg'
                }, {
                    title: 'Tap to show Advanced options. Under Proxy, select Proxy Auto-Config.',
                    titleImage: '',
                    detail: 'Insert the PAC URL as shown in blue below (select URL for HTTP/S or SOCKS) and Save to finish setup',
                    image: '/images/android3.jpg'
                }]
        },
        useInfoWindows: {
            title1: 'Windows 10 proxy setup',
            info: [{
                    title: 'For all other Windows versions.',
                    titleImage: '',
                    detail: '<p>For other Windows versions’ proxy setup info, please visit <a href="#" target="_blank" onclick="return linkClick (`https://support.microsoft.com/en-us/help/135982/how-to-configure-internet-explorer-to-use-a-proxy-server`)">Microsoft website.</a></p><p>This is the data for proxy server setup:</p>',
                    image: ''
                }, {
                    title: 'Open Microsoft Edge',
                    titleImage: '/images/IE10_icon.png',
                    detail: 'Click the tool icon at the top of right, Scroll down menu to the bottom and select Settings.</p>',
                    image: '/images/windowsUseInfo1.jpg'
                }, {
                    title: 'Scroll to bottom of menu and click View advanced settings.',
                    titleImage: '',
                    detail: '',
                    image: '/images/windowsUseInfo2.jpg'
                }, {
                    title: 'Scroll down menu and click Open proxy settings.',
                    titleImage: '',
                    detail: '',
                    image: '/images/windowsUseInfo3.jpg'
                }, {
                    title: 'Select Proxy, turn On Automatically detect settings and Use setup script. Insert the Script address as shown in blue below. Then click save to finish.',
                    titleImage: '',
                    detail: '<p>Windows 10 system only supports HTTP & HTTPS proxy, SOCKS5 users will need install a browser like Firefox, then setup the SOCKS5 PROXY in Firefox.',
                    image: '/images/windowsUseInfo4.jpg'
                }]
        },
        useInfoMacOS: {
            proxyServerIp: '<p>Proxy setup: <span style="color: red;">Automatic or Auto-Config</span></p>',
            proxyServerPort: 'HTTP & HTTPS proxy setup:',
            proxyServerPassword: 'SOCKS proxy setup:',
            title: 'Local proxy server is running at background. MacOS and windows user may close this window. All other devices can access internet via local proxy setup to use the QTGate OPN.',
            title1: 'MacOS proxy setup',
            info: [{
                    title: 'Open the control panel, click on network.',
                    titleImage: '/images/macOsControl.jpg',
                    detail: '',
                    image: '/images/userInfoMacos1.jpg'
                }, {
                    title: 'click on Advanced... ',
                    titleImage: '',
                    detail: '',
                    image: '/images/macosUserInfo2.jpg'
                }, {
                    title: 'Select Proxies, check Automatic Proxy Configuration, check Exclude simple hostnames.',
                    titleImage: '',
                    detail: '<p>Insert Proxy URL shown in blue in the image below (select URL for HTTP/S or SOCKS). Click OK to finish.</p>',
                    image: '/images/macosUserInfo3.jpg'
                }]
        },
        topWindow: {
            title: '150th anniversary of Canada'
        },
        firstNote: {
            title: 'Thank you for using our products and services (the “Services” or “Service”). The Services are provided by QTGate Systems Inc. (“QTGate”).',
            firstPart: 'By using our Services, you are agreeing to these terms. Please read them carefully.',
            detail: [
                {
                    header: 'Terms of Service',
                    detail: 'This Terms of Service document (the “Terms”) outlines the terms and conditions of use of Services provided by QTGate Systems Inc. These Terms also govern the use of and access to QTGate’s content (the “Content”), which includes the QTGate’s website (the “Site”), applications (the “Apps”), and any software provided by QTGate (the “Software”).'
                }, {
                    header: null,
                    detail: 'Before using QTGate’s Services, please read this agreement thoroughly. If You have any questions concerning the content of this agreement or what it implies, please contact QTGate at email address: support@QTGate.com'
                }, {
                    header: null,
                    detail: 'We may suspend or stop providing our Services to you if you do not comply with our terms or policies or if we are investigating suspected misconduct. Using our Services does not give you ownership of any intellectual property rights in our Services or the content you access. You may not use content from our Services unless you obtain permission from its owner or are otherwise permitted by law. These terms do not grant you the right to use any branding or logos used in our Services. Don’t remove, obscure, or alter any legal notices displayed in or along with our Services.'
                }, {
                    header: 'Eligibility for Service',
                    detail: 'By accessing the Content or Services, you are agreeing on behalf of yourself or those you represent (“You”) to comply with and be legally bound by these Terms in their entirety. These Terms constitute a legally binding agreement (the “Agreement”) between you and QTGate. If you do not agree with any part of the Terms, you may not use our Services.'
                }, {
                    header: null,
                    detail: 'By creating an account for using our Services, you represent that you are at least eighteen (18) years of age or that you are a valid legal entity, and that the registration information you have provided is accurate and complete. If You are accepting the terms of this agreement on behalf of a company or other legal entity, You represent and warrant that You have the authority to bind that company or other legal entity to the terms of this agreement. If You are accepting this agreement on behalf of an enterprise’s end user, it is Your responsibility to communicate the information in this agreement to the enterprise end users and ensure compliance with the terms and conditions contained herein. By agreeing to these Terms, you are also agreeing to the End User License Agreement (“EULA”), which you can read on QTGate’s website.'
                },
                {
                    header: 'Privacy Policy',
                    detail: 'Your privacy is highly important to us, since privacy is every person’s natural right! QTGate is committed to your privacy and does not collect or log browsing history, traffic destination, data content, or DNS queries from Subscribers using our Services. – hence, we DO NOT store details of, or monitor the data sent over our network or the websites you access while using our Services.'
                }, {
                    header: null,
                    detail: 'During your registration, we will ask you for some personal information such as your email address and/or payment information. We only collect information that are necessary for the proper delivery of the Site and Services. This information is for our eyes only and will be stored on secured servers. We collect minimal usage statistics to maintain our quality of service. We may know: choice of server location, times when our Services was used by user and amount of data transferred by one user in one day. We store this information in order learn from it, and eventually deliver the best possible experience to you. This information which is gathered and analyzed generically is also kept on secured servers. We stand by our firm commitment to our customers’ privacy by not possessing any data related to a user’s online activities.'
                }, {
                    header: null,
                    detail: 'We reserve the right to modify the Privacy Policy at any time, so please review it frequently. Your continued use of the our Services will signify your acceptance of the changes to the Privacy Policy. If you have any questions regarding our Privacy Policy and how we handle your information, please feel free to contact QTGate at the following email address:  support@QTGate.com'
                }, {
                    header: 'Subscriptions',
                    detail: 'QTGate Services are available to you upon registration on the Site or Software. By subscribing to the Services, you agree to become a subscriber (“Subscriber”) for the period you have elected. A full list of subscription plans and pricing is available on the Site. QTGate reserves the right to amend subscription fees or institute new fees at any time upon reasonable advance notice posted on the Site or sent via email. Any changes to the pricing will not affect the Subscriber’s current subscription period and will become effective upon subscription renewal.'
                }, {
                    header: null,
                    detail: 'When supported by your payment method, plans renew automatically by default at the completion of the billing term. By default, the renewal term is for the same duration as the billing term for the original subscription. The subscription fee will be charged automatically to the payment method you last selected. If you would like to discontinue automatic renewal, you may turn off auto-renewal. By default, auto-renewal is turned on when you use a payment method that supports auto-renewal (such as a credit card or Paypal), and turned off when you use a payment method that does not support auto-renewal (such as bitcoin).'
                }, {
                    header: null,
                    detail: 'Your Subscription is Yours and Yours only. You may not lend it, rent it, hire it out or share it with people or any other legal entity such as a company, partnership etc, who are not You yourself. Each paid subscription grants you one (1) license to use.'
                }, {
                    header: 'Subscription Cancellation and Suspension',
                    detail: 'You can cancel your Subscription by simply sending us a request via email to support@QTGate.com. Refund are subject to the QTGate’s Refund Policy. QTGate is entitled to impose Service limits, revoke any Service, suspend it, or block any type of usage made by You at its sole discretion if it is reasonable to believe that the You violate or have violated the Terms of Service or if the way You use the Services may render QTGate liable to any offence or breach of any third party rights or disturb other users use of the Service. QTGate does not undertake to provide You with any prior notice of these measures. The application of any of these measures will not entitle You to a refund.'
                }, {
                    header: 'Refund Policy',
                    detail: 'If you would like to get a refund, please notify us by email at support@QTGate.com  no later than 7 days from the date on which you purchased the subscription. Please let us know in the email your user name and the reason you wish to stop using our Service and get your money back so we can be better for the future.'
                }, {
                    header: null,
                    detail: 'We will refund your order if: <p class="tag info">It is the first time you’ve ordered our Services and there have not been previous purchases on your account.</p><p class="tag info">If you have made less than one hundred connections to our Service and your bandwidth usage is less than 500 MB.</p><p class="tag info">If you haven’t violated QTGate’s Terms of Service in any way.</p><p class="tag info">As stated above, if the refund request is made within 7 days since the purchase has been made.</p><p class="tag info">Refunds are generally processed within seven (7) days, and are made to the original form of payment used for purchase. All refunds are sent in USD and therefore the refund amount could differ from the amount originally paid in local currency or bitcoin. How long it takes until you will see the refunded amount in your bank account varies according to the payment method you used, bank regulations, etc.</p>'
                }, {
                    header: 'Acceptable Use Policy',
                    detail: 'You must follow any policies made available to you within the Services. You shall use QTGate Services in compliance with all applicable laws and not for any unlawful Purpose. QTGate Services may be accessed from all around the world, so it is your responsibility to assess whether using the Apps, Services, Sites or Software is in compliance with local laws and regulations. You may only use the Services as permitted by law. Services may NOT be used for any illegal activity. Whenever you use the Apps, Services, Sites or Software, you should comply with these Terms and applicable laws, regulations, and policies. You agree to not to use the Service in a way that may result in a violation of any laws of any jurisdiction. Don’t misuse our Services. For example, don’t interfere with our Services or try to access them using a method other than the interface and the instructions that we provide. We may suspend or stop providing our Services to you if you do not comply with our terms or policies or if we are investigating suspected misconduct.'
                }, {
                    header: null,
                    detail: 'You understand that it is your responsibility to keep your QTGate account information confidential. You are responsible for all activity under your account. You agree to not make any illegal or unauthorized use of the Services through Your user id/password and not to enable access to your account to users who are not You. If you ever discover or suspect that someone has accessed your account without your authorization, you are advised to inform us immediately so that we may revoke your account credentials and issue new ones. You will be held accountable and liable for any and all actions performed on the QTGate’s servers where the login is identified by Your user id/password. In order to protect the Services from being misused or used to harm someone, QTGate reserves the right to take appropriate measures when our Services are being used contrary to these Terms and applicable laws. You agree that QTGate may terminate your account, without providing a refund for Services already paid, if you misuse the Service.'
                }, {
                    header: null,
                    detail: 'In using our Services, you agree not to: <p class="tag info">Send spam, uninvited emails or  transmit unsolicited advertisements or content (i.e., “spam”), or any other versions of spam, large quantities of emails even if such are sent-off from another server and sending opt-in emails.</p><p class="tag info">Send, post, or transmit over the Service any content which is illegal, hateful, threatening, insulting, or defamatory; infringes on intellectual property rights; invades privacy; or incites violence.</p><p class="tag info">Upload, download, post, reproduce, or distribute any content that includes sexual or explicit depictions of minors.</p><p class="tag info">Attempt to access, probe, or connect to computing devices without proper authorization (i.e., port scanning, scanning for open proxies, or any form of “hacking”).</p><p class="tag info">Attempt to compile, utilize, or distribute a list of IP addresses operated by QTGate in conjunction with the Service.</p><p class="tag info">Use for distribution of viruses, hacking, cracking, network sabotage, phishing; any fraudulent behavior is strictly prohibited.</p><p class="tag info">Use the Service for anything other than lawful purposes.You shall be held responsible for any damages caused by Your negligence or exposure to vulnerabilities, whether your actions were intentional or not.</p>'
                }, {
                    header: 'License',
                    detail: 'Subject to your compliance with these Terms, QTGate grants to you a worldwide, non-assignable, non-exclusive and limited license to use the software provided to you by QTGate as part of the Services. This license is for the sole purpose of enabling you to use and enjoy the benefit of the Services as provided by QTGate, in the manner permitted by these terms. You may not copy, modify, distribute, sell, or lease any part of our Services or included Software, nor may you reverse engineer or attempt to extract the source code of that Software, unless laws prohibit those restrictions or you have our written permission. Using the Software and our Services in any way not expressly authorized by QTGate is strictly prohibited.'
                }, {
                    header: null,
                    detail: 'Usage of any material which is subject to QTGate’s intellectual property rights is prohibited unless you have been provided with explicit written consent by QTGate. Using our Services does not give you ownership of any intellectual property rights in our Services or the content you access. These terms do not grant you the right to use any branding or logos used in our Services. Don’t remove, obscure, or alter any legal notices displayed in or along with our Services.'
                }, {
                    header: 'Disclaimers and Warranties',
                    detail: 'QTGate undertakes to provide the best Service possible in the circumstances and make the Service available at all times except for when maintenance work is being performed for repair and improvement or in case of circumstances beyond the control of the QTGate, including force majeure. The Service provided may also become unavailable due to other factors beyond the QTGate’s control such as third party service failure or malfunction. The accuracy and timeliness of data received is not guaranteed and may vary based on compressions, configuration, network congestion and other factors that may affect it. The Service’s network speed is an estimate and is no indication or guarantee to the speed which You or the Service will send or receive data. We provide our Services using a commercially reasonable level of skill and care and we hope that you will enjoy using them. But there are certain things that we don’t promise about our Services. QTGate does not monitor Your sessions for inappropriate use nor does it keep logs of Your internet activities. However, the QTGate reserves the right to monitor and investigate matters which it considers at its own discretion to be a violation or potential violations of these Terms of Use.'
                }, {
                    header: null,
                    detail: 'Other than as expressly set out in these terms or additional terms, neither QTGate nor its suppliers or distributors make any specific promises about the Services. The Service, the Software and any third party services and software are provided by the QTGate on an “as is” basis and QTGate hereby disclaims all warranties of any kind, whether expressed or implied. Some jurisdictions provide for certain warranties, like the implied warranty of merchantability, fitness for a particular purpose and non-infringement. To the extent permitted by law, we exclude all warranties.'
                }, {
                    header: null,
                    detail: 'QTGate also reserves the right, but is not obligated to, at its sole discretion and without providing prior notice, to block, delete, filter or restrict by any means, any materials or data it deems potential or actual violations of the restrictions set forth in these Terms of Use and also any other actions that may subject the QTGate or its customers to any liability. QTGate disclaims any and all liability for any failure on our part to prevent such materials or information from being transmitted over the Service and/or into Your computing device.'
                }, {
                    header: 'Limitation of Liability',
                    detail: 'QTGate will not be liable for any damages or loss caused by viruses, denial-of-service, attacks or any other technologically harmful material that my infect Your computer, its peripherals, data stored on it or on its peripherals, computer programs or any other proprietary material due to the use of the Services or due to Your downloading of anything which is posted on the QTGate’s website or any website which is linked there to. In no event will QTGate Systems Inc., its suppliers, distributors,  partners, affiliates, subsidiaries, members, officers, or employees be liable for lost profits, revenues, or data, financial losses or indirect, special, consequential, exemplary, or punitive damages, or for any other loss or damages of any kind, even if they have been advised of the possibility thereof. The foregoing shall not apply to the extent prohibited by applicable law. To the extent permitted by law, the total liability of QTGate, and its suppliers and distributors, for any claims under these terms, including for any implied warranties, is limited to the amount You paid QTGate to use the Services.'
                }, {
                    header: 'Indemnification',
                    detail: 'You agree to hold harmless and indemnify QTGate, its officers, directors, agents, employees,  members, partners, suppliers, their affiliates, and its or their shareholders, directors, and employees from any and all claims, suit or action arising from or related to the use of QTGate’s Services, Apps, Content, Site, or Software or violation of these terms, including any liability or expense arising from claims, losses, damages, suits, judgments, litigation costs and attorney’s’ fees. We may, at our sole discretion, assume the exclusive defense and control of any matter subject to indemnification by you. The assumption of such defense or control by us, however, shall not excuse any of your indemnity obligations. If you are using our Services on behalf of a business, that business accepts these terms.'
                }, {
                    header: 'About these Terms',
                    detail: 'QTGate may update the Terms or any additional terms that apply to a Service, from time to time without notice. You understand and agree that it is your obligation to review these Terms regularly in order to stay informed on current rules and obligations. If you continue to use QTGate’s Services, Apps, Content, Site, or Software after these changes take effect, then you agree to the revised Terms. The current version of the Terms is available on the Site. Notification on any core changes to the Terms will be provided to subscribers through an email message or update to the Site. If you do not agree to the modified terms for a Service, you should discontinue your use of that Service. If there is a conflict between these terms and the additional terms, the additional terms will control for that conflict. These terms control the relationship between QTGate and you. They do not create any third party beneficiary rights.'
                }, {
                    header: null,
                    detail: 'If you do not comply with these terms, and we don’t take action right away, this doesn’t mean that we are giving up any rights that we may have (such as taking action in the future). If it turns out that a particular term is not enforceable, this will not affect any other terms. All of our Content was originally written in English. Any translation of our Content is done on a best-effort basis. We cannot guarantee the accuracy of translated Content. In the event of any discrepancy between the translated Content and the English Content, the English Content shall prevail. The laws of British Columbia, Canada, excluding British Columbia’s conflict of laws rules, will apply to any disputes arising out of or relating to these Terms or the Services.'
                }
            ],
            disagree: 'I Disagree',
            agreeMent: 'I Agree to the QTGate Terms of Service'
        },
        linuxUpdate: {
            newVersionDownload: 'click here to download and install!',
            step1: 'Download latest QTGate version.',
            step2: 'Allow executing file as program',
            step2J1: '/images/linuxUpdate1.jpg',
            step2J2: '/images/linuxUpdate2.jpeg',
            step2_detail1: 'Right click downloaded QTGate file and select the properties.',
            step2_detail2: 'Check allow executing file as program in Permissions tab.',
            step3: 'Exit old version of QTGate and double click the new QTGate file to run install.',
            exit: 'Exit QTGate.'
        },
        imapInformation: {
            title: 'Email account to use by OPN.',
            infomation: `Please provide an IMAP enabled email account to be used with QTGate’s OPN services. The account name and password will be required. For your personal privacy, please consider registering a new email account to use. QTGate currently supports <a href="#" onclick="return linkClick('https://www.icloud.com/')">Apple iCloud</a>, <a href="#" onclick="return linkClick('https://outlook.live.com/owa/')">Outlook Mail</a>, <a href="#" onclick="return linkClick('https://login.yahoo.com/')">Yahoo Mail</a>, <a href="#" onclick="return linkClick('https://mail.google.com')">GMAIL</a>, <a href="#" onclick="return linkClick('https://www.gmx.com/')">GMX</a>, <a href="#" onclick="return linkClick('https://www.zoho.com/mail/')">ZOHO</a>. (@OPN currently supports iCloud mail only.) For passwords, it is recommended use a <a href="#" onclick="return linkClick('https://help.yahoo.com/kb/SLN15241.html')">generated app-specific password.</a> If using <a href="#" onclick="return linkClick('https://help.yahoo.com/kb/two-step-verification-sln5013.html')">2-step verification</a>, we recommend using a free anonymous SMS receiving site to receive SMS codes, ( such as <a href="#" onclick="return linkClick('http://receive-sms-online.com/')">receive-sms-online.com</a>, <a href="#" onclick="return linkClick('https://sms-online.co/receive-free-sms')" >sms-online.co</a>, <a href="#" onclick="return linkClick('https://receive-a-sms.com/')" >receive-a-sms.com</a>, or <a href="#" onclick="return linkClick('https://www.google.com/search?q=free+anonymous+SMS+receiving+site&oq=free+anonymous+SMS+receiving+site&aqs=chrome..69i57.268j0j4&sourceid=chrome&ie=UTF-8')" >others</a> ).`,
            serverDetail: 'settings:',
            imapServer: 'IMAP server setup',
            imapServerInput: 'IMAP server name or IP address',
            UserName: 'Login username',
            Ssl: 'By SSL connection:',
            portName: 'Port number:',
            otherPortNumber: 'Other:',
            smtpServer: 'SMTP server setup',
            smtpServerInput: 'SMTP server name or IP address',
            emailServerPassword: 'Email account password ( app password )',
            Error_portNumber: 'Port number should be from 1 to 65535.',
            imapAccountConform: '<p><dt>By clicking submit you are agreeing to this:</dt></p>This email is a temporary account for use with QTGate services. You agree QTGate may have full access to this account for transferring data between you and QTGate.',
            agree: `I understand and agree to continue.`,
            imapOtherCheckError: 'Cannot connect to email server! Server name, IP address or Port number may have a mistake. Please check the details of your email setup!',
            CertificateError: 'Certificate for this email server is not trusted. Please select "Keep connected even if certificate is not trusted" in settings if you still want to connect. Your email login information maybe leaked to this email server!',
            IgnoreCertificate: 'Keep connected even when certificate is not trusted',
            Certificat: 'Warning! Do not select this if you are not sure, it may reveal your information.',
            AuthenticationFailed: 'Invalid login username or password! Please check username and password.',
            addAEmail: 'Add a new Email account',
            tryAgain: 'Try again.',
            connectImap: 'Connect to QTGate',
            cancelConnect: 'Stop connecting to QTGate.',
            imapItemTitle: 'Email account details:',
            imapCheckingStep: ['Trying to connect to email server.', 'Connected to email server with IMAP.', 'Connected to email server with SMTP.'],
            imapResultTitle: 'IMAP Server QTGate Communication Rating: ',
            testSuccess: 'Email server setup success!',
            exitEdit: 'Exit edit email account',
            deleteImap: 'Delete IMAP account.',
            proxyPortError: 'Port number should be a number from 1000 to 65535. Or this port is being used by another process. Please try another port number.',
            appPassword: 'About APP password.'
        },
        Home_keyPairInfo_view: {
            title: 'Key pair information',
            emailNotVerifi: 'Key pair has not been signed by QTGate yet.',
            emailVerified: 'Key pair signed by QTGate.',
            NickName: 'Nick name：',
            creatDate: 'Creation date：',
            keyLength: 'Bit Length：',
            password: '5-character minimum password.',
            password1: 'Key pair password.',
            logout: 'Logout',
            keyID: 'ID：',
            deleteKeyPairInfo: 'Note: By deleting your key pair, you will lose your current account settings. You will need to set up QTGate account settings again. If your email address is the same as the one used previously, you may restore your QTGate account balance.',
            delete: 'Delete',
            locked: 'Please enter your key pair password to continue.',
            systemError: 'System error! Please delete this key pair and set up QTGate again.'
        },
        home_index_view: {
            newVersion: 'A new version is ready to install.',
            newVersionInstallLoading: 'Updateing...',
            localIpAddress: 'Local',
            internetLable: 'Internet',
            gateWayName: 'Gateway',
            showing: 'Status',
            nextPage: 'next',
            agree: 'I AGREE & CONTINUE',
            emailAddress: 'Email Address ( Required )',
            creatKeyPair: 'Generate key pair...',
            cancel: 'Cancel',
            clickInstall: 'Install',
            continueCreateKeyPair: 'Keep generate.',
            stopCreateKeyPair: 'Cancel generate key pair',
            KeypairLength: 'Select the bit length of your key pair. Larger bit lengths are stronger and harder for a hacker to crack but may result in slower network transfer speeds.',
            SystemAdministratorNickName: 'Nick name ( Required )',
            systemAdministratorEmail: 'Generate RSA Key pair',
            GenerateKeypair: '<em>Generating RSA Key pair. Please wait, as it may take a few minutes. More time will be needed if you selected 4096 bit key length. Information about RSA keypair system can be found here:' +
                `<a href='hhttp://en.wikipedia.org/wiki/RSA_(cryptosystem)' target="_blank" onclick="return linkClick ('https://en.wikipedia.org/wiki/RSA_(cryptosystem)')">https://en.wikipedia.org/wiki/RSA_(cryptosystem)</a></em>`,
            systemPassword: 'Password',
            inputEmail: `This RSA key is a private key used for authentication, identification and secure encryption/decryption of data transmission within QTGate’s system. The password and key are not stored by QTGate. You cannot reset your password if lost and you cannot access QTGate services without your password. Please store your password in a safe place. <em style="color: red;">QTGate’s domain may be blocked in some regions. Please use an email account with servers outside these regions,</em>`,
            accountEmailInfo: `Because QTGate may be on a firewall's black list in some regions. It is best to choose an email account with servers outside your region’s firewall.`
        },
        error_message: {
            title: 'Error',
            errorNotifyTitle: 'System Error',
            EmailAddress: ['Please enter your email address in this format name@example.com.', 'Sorry, QTGate currently support Apple iCloud mail, Microsoft Outlook and Yahoo mail only.'],
            required: 'Please fill in this field.',
            PasswordLengthError: 'Passwords must have at least 5 characters.',
            localServerError: 'Local QTGate server error. restart please!',
            finishedKeyPair: 'Generate new key pair down.',
            Success: 'Success',
            doCancel: 'Canceled generating key pair!',
            errorKeyPair: 'here was an ERROR in generating new key pair, Please try again!',
            SystemPasswordError: 'Your key pair password does not match. Please try again. If you forgot your password, please delete this key pair. Beware you will lose you current account settings.',
            finishedDeleteKeyPair: 'Key pair deleted!',
            offlineError: 'There is no internet connection detected. Please check your network and try again!',
            imapErrorMessage: [
                '',
                'Data format error!',
                'This computer does not detect an internet connection. Please check your network and try again!',
                `Email server did respond to username or an error in password. You may need use APP password to pass this test if you did normal password. Or your app passwords need to be updated.`,
                `Can't connect to email server with the port. Please check the IMAP port number. This port may be filtered by a firewall in your network.`,
                `There is a problem with this IMAP email server's security certificate!`,
                `Error in email server’s address. Please check the email server’s domain.`,
                'This email provider currently looks does not support QTGate’s @OPN technology, please try do test again, or change to another email provider.',
                `Email server did respond to SMTP's username or an error in password.`,
                `There is a problem with this SMTP email server’s security certificate!`,
                `Connecting to SMTP Email server received an unknown error!`, 'Please check email account!'
            ]
        },
        emailConform: {
            activeViewTitle: 'Active your keypair.',
            emailTitle: 'Welcome to QTGate.',
            info1_1: 'Key pair verification is not complete. A verification email from QTGate has been sent. Please check your [',
            info1_2: '] mailbox. If you have one more then one mail from QTGate in your mailbox, please choose the newest one.',
            info2: 'Copy all content from [-----BEGIN PGP MESSAGE-----] ... to [-----END PGP MESSAGE-----]. Paste into this text box.',
            emailDetail1: 'Dear ',
            emailDetail1_1: ' ,',
            emailDetail2: 'This is your secret verification code to validate your QTGate account. Please copy and paste all the content in the text area.',
            bottom1_1: 'Best regards,',
            bottom1_2: 'The QTGate team',
            conformButtom: 'Conform',
            formatError: [
                'Format error! Copy all content from [-----BEGIN PGP MESSAGE-----] ... to [-----END PGP MESSAGE-----]. Paste into this text box.',
                'Oops. Find the lasest mail from QTGate in your key pair email mailbox. Or delete this key pair and rebuild new key pair please.',
                'Connection to QTGate had an error!. Please exit and restart QTGate.',
                'This secret verification code was invalid. QTGate disconnected. A new verification email was sent to your mail box. Please restart QTGate and check your email. Do validate again!',
                'Your QTGate account may have a problem, Please delete your key pair and setup again!',
                'There is an error in connection to QTGate, Please try again late.',
                `Your data transfer has hit the daily limit today, please try again tomorrow or upgrade your user type.`,
                'Your transfer email account may not be working, please check the IMAP account. Or your IMAP accout may not support QTGate system.',
                'Selected region is unavailable, try again later.',
                'Your IMAP account recieved an error. Please restart QTGate and try again. If the error is not fixed, You may need check your IMAP account setting to enable third party IMAP applications.',
                'QTGate system error! Plesee restart QTGate.',
                'Oooooops! How are you today?'
            ],
            activeing: 'sending...'
        },
        QTGateRegion: {
            title: 'QTGate gateway area',
            available: 'Available',
            speedTest: 'Speed test：',
            unavailable: 'Unavailable',
            proxyDomain: 'Domain lookup via QTGate gateway side.',
            setupCardTitle: 'connecting with:',
            MultipleGateway: 'multi-gateway count:',
            dataViaGateway: 'All internet data transfered via QTGate gateway.',
            dataTransfer: 'Data:',
            dataTransfer_datail: ['All data on QTGate gateway.', `Only when cannot connect to target server.`],
            proxyDataCache: 'Web cache:',
            proxyDataCache_detail: ['Yes', 'No'],
            clearCache: 'Delete all cache now',
            localPort: 'Local proxy port number:',
            localPath: 'HTTP/HTTPS conect path name:',
            GlobalIp: 'Global IP:',
            pingError: 'QTGate gateway area speed check error! Please exit QTGate and reopen QTGate as administrator. Then do check speed again.',
            QTGateRegionERROR: ['Send connect request mail has an error. Please check your IMAP account settings.',
                ''],
            GlobalIpInfo: `Please note: When connecting to iOPN, your IP will be visible only to QTGate. Rest assured, your privacy is safe as QTGate does not log IP nor store any communications data. For stealth IP connection, please use @OPN. If [@OPN] option is not available, you may need to check your IMAP email account. (currently @OPN only supports iClould IMAP.)`,
            cacheDatePlaceholder: 'Web cache freshness lifetime.',
            sendConnectRequestMail: ['QTGate connection maybe down. A connection request mail was sent to QTGate system. Please wait a moment.',
                'Free user connection will be down when user has not used QTGate in the last 24 hours. QTGate system keeps connected for 1 month for paid users.'],
            cacheDatePlaceDate: [{ name: '1 hour', id: 1 }, { name: '12 hour', id: 12 }, { name: '1 day', id: 24 }, { name: '15 days', id: 360 }, { name: '1 month', id: 720 }, { name: '6 months', id: 4320 }, { name: 'forever', id: -1 }],
            atQTGateDetail: [
                `Recommended for full privacy. @OPN@ uses QTGate’s “Quiet” technology to create a obfuscated private network by refracting encrypted data packets thru email servers. @OPN provides stealth internet communications where your IP address is hidden to client or proxy servers. Gaming and video stream my not be supported due to stability and speeds affected by email server choice. Currently iCloud mail is only supported.`,
                'Recommended for high speed open internet access. iOPN uses QTGate’s “Quiet” technology to obfuscate encrypted data traffic to look like normal HTTP communications. iOPN offer security and protection of privacy while allowing access to the open internet.',
                'Use QTGate’s gateway for domain search to get the right IP address from DNS cache. This is default.',
                'Transfer all internet data over OPN.',
                'Transfer select data over OPN. Only when unable to connect to certain servers. This may save data on your account transfer limits.',
                'Web cache (or HTTP cache) is an used for the temporary storage (caching) of web documents, to reduce bandwidth usage, server load, and perceived lag. QTGate always encrypts all web cache data. This does not work for HTTPS connections.',
                'Do not use web cache.',
                'By setting the cache expiration date, you can always obtain the latest information on the server side.',
                'Local proxy server port number is provided for other devices to use QTGate’s OPN connection. Please set a number from 3001 to 65535.',
                'Local proxy server http/https access can secure your server.'
            ],
            connectQTGate: 'Connecting, Retrieving QTGate gateway information...'
        },
        QTGateGateway: {
            title: 'QTGate service user detail',
            processing: 'Trying to connect to QTGate gateway...',
            error: ['Error: Your account has a connection that is using the QTGate proxy server. Please disconnect it before attempting to connect again.',
                'Error: Bandwidth maximum. If you would like to continue using OPN, please upgrade your account. Free accounts have a bandwidth maximum of 100MB per a day, 1 GB every month.',
                'Error: Data format error. Please restart QTGate.', 'Error: This area does not have the resources. Please select another area or try connecting again later.',
                'Error: This region does not support OPN technology. Please select another area, or change other connect type.'],
            connected: 'connected.',
            userType: ['Free user', 'Subscript'],
            datatransferToday: 'The daily bandith limit.：',
            datatransferMonth: 'The monthly bandwidth limit.：',
            todaysDatatransfer: 'Available today.',
            monthDatatransfer: 'Available this month.',
            gatewayInfo: ['Gateway Ip address：', 'Gateway connection port：'],
            userInfoButton: 'How to use?',
            stopGatewayButton: 'Disconnect',
            disconnecting: 'Disconnecting'
        },
        qtGateView: {
            QTGateConnectResultWaiting: 'Please wait. It will take a few minutes to respond to your connection request to QTGate.',
            title: 'QTGate connect',
            mainImapAccount: 'Email account for communicating with QTGate',
            QTGateDisconnectInfo: 'Lost QTGate connect. Please select IMAP account to send email for request connect.',
            QTGateConnectStatus: 'Status of QTGate connection',
            QTGateConnectResult: [
                'QTGate disconnected, click to connect to QTGate.', 'Connecting to QTGate.', 'QTGate Connected.', 'Connection stopped with error! Please check IMAP account settings!',
                'QTGate Connected.'
            ],
            QTGateSign: ['Keypair status', 'Your key pair is not signed by QTGate.',
                'QTGate certification authority is a trusted thus certifying your public keys is yoursalf in QTGate users when you share files of send message to other QTGate user. You also can signing another QTGate users with your keypair for make your trust relationship.',
                'Getting QTGate certification authority.', 'Opps. System error. Try restart QTGate, if still have please re-install QTGate.', 'System error!']
        },
        feedBack: {
            title: 'FEEDBACK',
            additional: 'Additional info',
            okTitle: 'Send to QTGate'
        },
    }, {
        account: {
            title: '賬戶管理',
            segmentTitle: '賬戶Email: ',
            currentPlan: '當前訂閱: ',
            MonthBandwidthTitle: '月度可使用代理伺服器數據傳送限額：',
            dayBandwidthTitle: '每日限額：',
            upgradeTitle: '升級賬戶選項',
            DowngradeTitle: '降級賬戶選項',
            cancelPlan: '終止當前月租',
            MonthBandwidthTitle1: '傳送限額',
            serverShare: '代理伺服器',
            continue: '下一步',
            serverShareData: ['共享伺服器', '獨佔一台*', '獨佔二台*', '獨佔四台'],
            monthlyPay: '月租費',
            internetShareData: ['共享高速帶寬', '獨享高速帶寬*', '獨享雙線高速帶寬*', '獨享四線高速帶寬'],
            serverShareData1: '使用同時鏈接多台代理技術，使用台數大於獨占數時，會相應分享您所獨占的資源',
            maxmultigateway: ['最大同時可二條並發代理', '最大同時可四條並發代理'],
            cancelPlanMessage: 'QTGate的訂閱是以月為基本的單位。您的月訂閱將在下月您的訂閱起始日前被終止，您可以繼續使用您的本月訂閱計劃，您將自動回到免費用戶。如果您是每月自動扣款，則下月將不再扣款。如果您是年度訂閱計劃，您的退款將按普通每月訂閱費，扣除您已經使用的月份後計算的差額，將自動返還您所支付的信用卡賬號，如果您是使用促銷碼，或您是測試用戶，您的終止訂閱將不能被接受。 '
        },
        QTGateDonate: {
            title: 'QTGate贊助商提供的免流量網站',
            meta_title: '捐贈者：'
        },
        useInfoiOS: {
            title1: 'iOS設備本地代理伺服器設定',
            info: [{
                    title: '打開控制面板，點擊Wi-Fi',
                    titleImage: '/images/macOsControl.jpg',
                    detail: '',
                    image: '/images/iOS1.jpg'
                }, {
                    title: '選擇當前WiFi的圈i符號',
                    titleImage: '',
                    detail: '',
                    image: '/images/iOS2.jpg'
                }, {
                    title: '選擇底部的設置代理伺服器',
                    titleImage: '',
                    detail: '',
                    image: '/images/iOS3.jpg'
                }, {
                    title: '選擇自動設置',
                    titleImage: '',
                    detail: '<p>在URL網址處，HTTP和HTTPS代理按照藍色第一行填入，SOCKS代理按藍色第二行填入</p>',
                    image: '/images/iOS4.jpg'
                }]
        },
        firefoxUseInfo: {
            title1: '火狐瀏覽器它單獨設定代理服務，可以不影響系統而輕鬆使用代理上網',
            info: [{
                    title: '打開火狐，點擊右上角工具圖標，選擇設定',
                    titleImage: '/images/macOsControl.jpg',
                    detail: '<p><a href="https://www.mozilla.org/zh-TW/firefox/#" target="_blank">下载Firefox</a></p>',
                    image: '/images/firefox1.jpg'
                }, {
                    title: '選擇常規項，滾動畫面至最下部，在網絡代理處，點擊詳細設定',
                    titleImage: '',
                    detail: '',
                    image: '/images/firefox2.jpg'
                }, {
                    title: '選擇自動設置代理伺服器，選勾DNS使用SOCKS v5',
                    titleImage: '',
                    detail: 'HTTP和HTTPS代理按照藍色第一行填入，SOCKS代理按藍色第二行填入',
                    image: '/images/firefox3.jpg'
                }]
        },
        useInfoWindows: {
            title1: 'Windows10本地代理伺服器設定',
            info: [{
                    title: '關於Windows其他版本',
                    titleImage: '',
                    detail: '<p>Windows其他版本的代理伺服器設定請參照<a target="_blank" href="#" onclick="return linkClick (`https://support.microsoft.com/ja-jp/help/135982/how-to-configure-internet-explorer-to-use-a-proxy-server`)">微軟公司網站</a></p><p>请按以下参数设置本地代理伺服器：</p>',
                    image: ''
                }, {
                    title: '啟動Internet Explorer',
                    titleImage: '/images/IE10_icon.png',
                    detail: '<p>點擊右上角工具圖標，滑動設定菜單至最下部選擇【設定】</p>',
                    image: '/images/windowsUseInfo1.jpg'
                }, {
                    title: '滑動菜單至最下部點擊高級設定',
                    titleImage: '',
                    detail: '',
                    image: '/images/windowsUseInfo2.jpg'
                }, {
                    title: '再次滑動菜單，點擊打開代理伺服器設定',
                    titleImage: '',
                    detail: '',
                    image: '/images/windowsUseInfo3.jpg'
                }, {
                    title: '選擇自動設置代理伺服器。',
                    titleImage: '',
                    detail: '<p>WINDOWS10系統只對應HTTP和HTTPS，如果想使用全局代理的用戶，需另外安裝瀏覽器如火狐等，然後在火狐瀏覽器內單獨設定Proxy全局代理SOCKS</p>',
                    image: '/images/windowsUseInfo4.jpg'
                }]
        },
        useInfoAndroid: {
            title1: '安卓設備本地代理伺服器設定',
            info: [{
                    title: '打开控制面板，选择Wi-Fi设定',
                    titleImage: '/images/androidSetup.jpg',
                    detail: '',
                    image: '/images/android1.jpg'
                }, {
                    title: '長按當前WiFi連接名稱等待菜單出現，選擇菜單的修改設定',
                    titleImage: '',
                    detail: '',
                    image: '/images/android2.jpg'
                }, {
                    title: '打開顯示高級選項，在代理伺服器設定(Proxy)中選擇自動設置',
                    titleImage: '',
                    detail: 'HTTP和HTTPS代理按照藍色第一行填入，SOCKS代理按藍色第二行填入',
                    image: '/images/android3.jpg'
                }]
        },
        useInfoMacOS: {
            title: '本地代理伺服器已在後台運行，MacOS和Windows用戶可以關閉本窗口。您的其他電子設備，可通過設置本地Proxy伺服器，來使用QTGate連接到互聯網',
            title1: 'MacOS 本地代理伺服器設定',
            proxyServerIp: '<p>代理設定選擇：<span style="color: red;">自動設定</p>',
            proxyServerPort: 'HTTP和HTTPS代理的設定為：',
            proxyServerPassword: 'SOCKS代理的設定為：',
            info: [{
                    title: '打開控制面板，點擊【網絡】',
                    titleImage: '/images/macOsControl.jpg',
                    detail: '',
                    image: '/images/userInfoMacos1.jpg'
                }, {
                    title: '選擇網絡【高級...】',
                    titleImage: '',
                    detail: '',
                    image: '/images/macosUserInfo2.jpg'
                }, {
                    title: '點擊代理伺服器設定，選勾自動代理，選購排除簡單Host名',
                    titleImage: '',
                    detail: '<p>HTTP和HTTPS代理按照藍色第一行填入，SOCKS代理按藍色第二行填入</p>',
                    image: '/images/macosUserInfo3.jpg'
                }]
        },
        QTGateInfo: {
            title: 'QTGate功能簡介',
            version: '本機安裝的QTGate版本：v',
            detail: [{
                    color: '#a333c8',
                    icon: 'exchange',
                    header: '隱身匿名自由上網QTGate',
                    detail: 'QTGate通過使用<a href="https://zh.wikipedia.org/wiki/%E9%AB%98%E7%BA%A7%E5%8A%A0%E5%AF%86%E6%A0%87%E5%87%86" target="_blank">AES256-GCM</a>和<a href="https://zh.wikipedia.org/wiki/PGP" target="_blank">OpenPGP</a >加密Email通訊，創造了OPN匿名網絡通訊技術，QTGate公司首創的@OPN技術，它全程使用加密Email通訊，客戶端和代理伺服器彼此之間不用交換IP地址，實現高速網絡通訊。iOPN通訊技術是一種HTTP協議下的加密混淆代理技術，能夠隱藏變換您的IP地址高速通訊。二種通訊方式都能夠讓您，隱身和安全及不被檢出的上網，保護您的隱私，具有超強對抗網絡監控,網絡限制和網絡阻斷。'
                }, {
                    color: '#e03997',
                    icon: 'talk outline',
                    header: '無IP點對點即時加密通訊服務QTChat',
                    detail: 'QTGate用戶之間通過email的點對點即時通訊服務，它具有傳統即時通訊服務所不具有的，匿名無IP和用戶之保持秘密通訊的功能。 QTChat加密通訊服務可以傳送文字，圖片和視頻文件信息，QTGate系統只負責傳送信息，不擁有信息，也無法檢查信息本身，所以QTGate不承擔信息所有的法律責任。 QTChat支持群即時通訊，將支持視頻流直播服務。'
                }, {
                    color: '#6435c9',
                    icon: 'cloud upload',
                    header: '加密文件匿名網絡雲存儲分享功能QTStorage',
                    detail: '用戶通過申請多個和不同的免費email服務商賬號，可以把一個文件加密拆分成多個部分，分別存儲在不同的email賬號下，可以保密安全和無限量的使用網絡儲存。用戶還可以通過QTGate系統在QTGate用戶之間分享秘密文件。'
                },
                {
                    color: 'darkcyan',
                    icon: 'spy',
                    header: '阻斷間諜軟件',
                    detail: 'QTGate系統連接全球DNSBL聯盟數據庫，用戶通過訂閱QTGate系統黑名單列表，並使用QTGate客戶端上網，讓潛伏在您電子設備內的間諜軟件，它每時每刻收集的信息，不能夠被送信到其信息收集伺服器，能夠最大限的保障您的個人隱私。'
                }, {
                    color: '#6435c9',
                    icon: 'external share',
                    header: '本地VPN伺服器',
                    detail: 'QTGate用戶在戶外時可以通過連接自己家裡的VPN，來使用QTGate客戶端隱身安全上網。'
                }]
        },
        cover: {
            firstTitle1: '讓您上網從此隱身',
            firstTitle2: '自由安全風雨無阻',
            start: '開門'
        },
        topWindow: {
            title: '慶祝加拿大150週年特別提供'
        },
        firstNote: {
            title: '歡迎使用QTGate，感謝您使用我們的產品和服務(下稱“服務”)。本服務由總部設在加拿大的QTGate Systems Inc.下稱“QTGate”提供。 ',
            firstPart: '您使用我們的服務即表示您已同意本條款。請仔細閱讀。使用我們的服務，您必須遵守服務中提供的所有政策。',
            detail: [
                {
                    header: '關於我們的服務',
                    detail: '請勿濫用我們的服務，舉例而言: 請勿干擾我們的服務或嘗試使用除我們提供的界面和指示以外的方法訪問這些服務。您僅能在法律(包括適用的出口和再出口管制法律和法規)允許的範圍內使用我們的服務。如果您不同意或遵守我們的條款或政策，請不要使用我們所提供的服務，或者我們在調查可疑的不當行為，我們可以暫停或終止向您提供服務。'
                }, {
                    header: null,
                    detail: '使用我們的服務並不讓您擁有我們的服務或您所訪問的內容的任何知識產權。除非您獲得相關內容所有者的許可或通過其他方式獲得法律的許可，否則您不得使用服務中的任何內容。本條款並未授予您使用我們服務中所用的任何商標或標誌的權利。請勿刪除、隱藏或更改我們服務上顯示的或隨服務一同顯示的任何法律聲明。'
                }, {
                    header: '關於OPN無IP通訊技術和隱私保護的局限性',
                    detail: 'OPN是QTGate世界首創的使用Email的IMAP協議建造一個無IP通訊環境，在您利用QTGate進行通訊過程中，QTGate無法獲得您目前所使用的IP地址（使用iOPN來連結QTGate代理服務器時，您需要向QTGate系統提供您當前的IP地址），可以最大限度的保障您的個人隱私。但是這項技術並不能夠保證您的信息絕對的不被洩露，因為您的IP地址有可能被記錄在您所使用的Email服務供應商，如果持有加拿大法院令尋求QTGate的Log公開，再和Email服務供應商的Log合併分析，可能會最終得到您的信息。QTGate並不能夠絕對保障您的隱私。'
                }, {
                    header: '關於個人隱私保護，系統日誌和接收QTGate傳送的信息',
                    detail: '在您使用服務的過程中，我們可能會向您發送服務公告、管理消息和其他信息。您可以選擇不接收上述某些信息。'
                }, {
                    header: null,
                    detail: '當您使用我們的服務時，我們為了計費處理會自動收集非常有限的數據流量信息，並存儲到伺服器日誌中。數據流量信息僅用於計算客戶應支付通訊費用而收集的，它收集的數據是：日期，用戶帳號，所使用的代理服務區域和代理伺服器IP，數據包大小，下載或上傳。例如：'
                }, {
                    header: null,
                    detail: '<p class="tag info">06/20/2017 18:12:16, info@qtgate.com, francisco, 104.236.162.139, 300322 byte up, 482776323 byte down.</p><p class="tag info">06/21/2017 12:04:18, info@qtgate.com, francisco, 104.236.162.139, 1435226 byte up, 11782238 byte down.</p>'
                }, {
                    header: null,
                    detail: 'QTGate沒有保存除了以上信息以外的任何其他信息。我們會配合並向持有加拿大法院令的執法機構提供此日誌文件。如果您是加拿大以外地區的執法機構，有這方面信息披露的需求，請通過加拿大外交部來聯繫我們：'
                }, {
                    header: null,
                    detail: '<a class="tag alert" href="http://www.international.gc.ca/">http://www.international.gc.ca/</a>'
                }, {
                    header: '版權所有權',
                    detail: '該軟件是QTGate的智慧產權，並且受到相關版權法，國際版權保護規定和其他在版權授與國家內的相關法律的保護。該軟件包含智慧產權材料, 商業秘密及其他產權相關材料。你不能也不應該嘗試修改，反向工程操作，反彙編或反編譯QTGate服務，也不能由QTGate服務項目創造或衍生其他作品。'
                }, {
                    header: null,
                    detail: '關於我們服務中的軟件，QTGate授予您免許可使用費、不可轉讓的、非獨占的全球性個人許可, 允許您使用由QTGate提供的、包含在服務中的軟件。本許可僅旨在讓您通過本條款允許的方式使用由QTGate提供的服務並從中受益。您不得複制、修改、發布、出售或出租我們的服務, 或所含軟件的任何部分。'
                }, {
                    header: '修改與終止服務',
                    detail: '我們持續改變和改善所提供的服務。我們可能會新增或移除功能或特性，也可能會暫停或徹底停止某項服務。您隨時都可以停止使用服務，儘管我們並不希望您會這樣做。 QTGate也可能隨時停止向您提供服務，或對服務附加或設定新的限制。'
                }, {
                    header: '服務的責任',
                    detail: '在法律允許的範圍內，QTGate及其供應商和分銷商不承擔利潤損失、收入損失或數據、財務損失或間接、特殊、後果性、懲戒性或懲罰性損害賠償責任。'
                }, {
                    header: '法律規定的貿易禁止事項',
                    detail: '當您按下同意按鈕，表示您已經確認您不屬於加拿大法律所規定的禁止貿易對象的列表之中。'
                }, {
                    header: '服務的商業使用',
                    detail: '如果您代表某家企業使用我們的服務，該企業必須接受本條款。對於因使用本服務或違反本條款而導致的或與之相關的任何索賠、起訴或訴訟，包括因索賠、損失、損害賠償、起訴、判決、訴訟費和律師費而產生的任何責任或費用，該企業應對QTGate及其關聯機構、管理人員、代理機構和員工進行賠償並使之免受損害。'
                }, {
                    header: '本條款的變更和約束力',
                    detail: '关于本条款：我们可以修改上述条款或任何适用于某项服务的附加条款，例如，为反映法律的变更或我们服务的变化而进行的修改。您应当定期查阅本条款。我们会在本网页上公布这些条款的修改通知。我们会在适用的服务中公布附加条款的修改通知。所有修改的适用不具有追溯力，且会在公布十四天或更长时间后方始生效。但是，对服务新功能的特别修改或由于法律原因所作的修改将立即生效。如果您不同意服务的修改条款，应停止使用服务。如果本条款与附加条款有冲突，以附加条款为准。'
                }, {
                    header: '',
                    detail: '本条款约束QTGate与您之间的关系，且不创设任何第三方受益权。如果您不遵守本条款，且我们未立即采取行动，并不意味我们放弃我们可能享有的任何权利（例如，在将来采取行动）。如果某一条款不能被强制执行，这不会影响其他条款的效力。加拿大BC省的法律（不包括BC州的法律冲突规则）将适用于因本条款或服务引起的或与之相关的纠纷。因本条款或服务引起的或与之相关的所有索赔，只能向加拿大BC省法院提起诉讼，且您和QTGate同意上述法院拥有属人管辖权。'
                }
            ],
            disagree: '不同意',
            agreeMent: 'QTGate服務條款和隱私權'
        },
        linuxUpdate: {
            newVersionDownload: '點擊這裡下載並安裝',
            step1: '下載新版本',
            step2: '授權新版本QTGate為可執行文件',
            step2J1: '/images/linuxUpdate1_tw.jpg',
            step2J2: '/images/linuxUpdate2_tw.jpeg',
            step2_detail1: '右鍵點擊已下載的QTGate圖標，選擇菜單裡的文件屬性',
            step2_detail2: '在權限選項裡，選勾“允許檔案文件執行”。',
            step3: '退出舊版本QTGate後，雙擊QTGate文件執行安裝',
            exit: '退出QTGate'
        },
        imapInformation: {
            title: '通訊專用Email郵箱設置',
            infomation: `請設置QTGate通訊專用Email郵箱信息。由於此賬戶的用戶名和密碼信息會提交給QTGate系統，為了防止您的個人信息被洩漏，請新申請一個臨時Email賬戶。目前QTGate技術對應<a href="#" onclick="return linkClick ('https://www.icloud.com/')">Apple iCloud</a>，<a href="#" onclick="return linkClick ('https://www.microsoft.com/zh-tw/outlook-com/mobile/?WT.mc_id=mscom')">微軟OUTLOOK</a>，<a href="#" onclick="return linkClick ('http://tw.mail.yahoo.com/')">雅虎郵箱</a>，<a href="#" onclick="return linkClick ('https://www.zoho.com/mail/')">俄羅斯ZOHO郵箱</a>，<a href="#" onclick="return linkClick ('https://gmail.com')">Google郵箱</a>，<a href="#" onclick="return linkClick ('https://www.gmx.com/mail/#.1559516-header-nav1-2')">美國在線GMX郵箱</a>，QTGate強力推薦使用蘋果公司的Email可以達到最佳速度(@OPN無IP連結技術只對應蘋果公司iCloud郵箱)。密碼請使用Email服務商的<a href="#" onclick="return linkClick ('https://tw.help.yahoo.com/kb/SLN15241.html')">應用密碼</a>。對於Email供應商在應用密碼申請時，須打開<a href="#" onclick="return linkClick ('https://tw.help.yahoo.com/kb/%E9%96%8B%E5%95%9F%E5%85%A9%E6%AD%A5%E9%A9%9F%E9%A9%97%E8%AD%89-sln5013.html')">二步認證</a>並必須提供手機號碼接受驗證碼，為保護您的隱私，建議使用免費在線代理接收驗證碼服務。如 ( <a href="#" onclick="return linkClick('http://receive-sms-online.com/')">receive-sms-online.com</a>, <a href="#" onclick="return linkClick('https://sms-online.co/receive-free-sms')" >sms-online.co</a>, <a href="#" onclick="return linkClick('https://receive-a-sms.com/')" >receive-a-sms.com</a> ) 更多請 <a href="#" onclick="return linkClick ('http://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=0&rsv_idx=1&tn=baidu&wd=%E5%85%8D%E8%B4%B9%E5%9C%A8%E7%BA%BF%E6%8E%A5%E6%94%B6%E6%89%8B%E6%9C%BA%E9%AA%8C%E8%AF%81%E7%A0%81&rsv_pq=e94f47a50001f66f&rsv_t=b03ePiy3rHH0T4FVoWB8Hx9vrVdZLzVhhErWOo4xdBpjDw%2BtGri%2BViTaVAw&rqlang=cn&rsv_enter=1&rsv_sug3=42&rsv_sug1=5&rsv_sug7=100')">百度查找</a>，<a href="#" onclick="return linkClick ('https://www.google.com/search?q=%E5%85%8D%E8%B4%B9%E5%9C%A8%E7%BA%BF%E6%8E%A5%E6%94%B6%E6%89%8B%E6%9C%BA%E9%AA%8C%E8%AF%81%E7%A0%81&oq=%E5%85%8D%E8%B4%B9%E5%9C%A8%E7%BA%BF%E6%8E%A5%E6%94%B6%E6%89%8B%E6%9C%BA%E9%AA%8C%E8%AF%81%E7%A0%81&aqs=chrome..69i57j69i60.254j0j4&sourceid=chrome&ie=UTF-8')">Google查找</a>。`,
            serverDetail: '詳細設定：',
            imapServer: 'IMAP伺服器設定',
            UserName: '登陸用戶名稱',
            Ssl: '使用Ssl加密信息傳輸：',
            imapServerInput: 'IMAP伺服器IP或域名',
            portName: '通訊連接埠：',
            otherPortNumber: '其他號碼：',
            smtpServer: 'SMTP伺服器設定',
            smtpServerInput: 'SMTP伺服器設定',
            Error_portNumber: '連接埠應該是從1-65535之間的數字',
            emailServerPassword: '郵箱密碼(推薦使用應用專用密碼)',
            imapAccountConform: '<p><dt>警告：</dt></p>當您按下提交按鈕時，意味著您已經確認：這個郵箱並不是您常用的郵箱，這是為了使用QTGate系統而特別申請的臨時郵箱，您同意承擔由此帶來的風險，並授權QTGate系統可以使用這個Email郵箱傳輸信息!',
            agree: '我已經了解風險，並願意繼續',
            imapOtherCheckError: '不能連接到Email伺服器，有可能您設定的伺服器名稱或IP，通訊連接埠有誤，請檢查您的伺服器詳細設定！',
            CertificateError: 'Email伺服器提示的證書不能被系統信任！您的Email伺服器有可能是一個仿冒的，您如果想繼續，請在詳細設定裡選擇【允許連接到不被信任證書的Email伺服器】，但您的Email登陸信息有可能洩漏給此伺服器！',
            IgnoreCertificate: '允許連接到不被信任證書的Email伺服器',
            Certificat: '如果您不確定請別選擇這項，這個選擇是非常危險，因為它允許連接上一個仿冒的伺服器，可能洩露您的用戶名和密碼。',
            AuthenticationFailed: 'Email伺服器提示用戶名或密碼錯誤，請仔細檢查您的用戶名和密碼！',
            addAEmail: '添加通訊用Email賬戶',
            tryAgain: '再試一次',
            connectImap: '連結QTGate',
            cancelConnect: '終止QTGate連接',
            imapItemTitle: '通訊用郵箱詳細信息',
            imapCheckingStep: ['正在嘗試連接email伺服器', 'IMAP成功登陸email伺服器', 'SMTP成功登陸email伺服器'],
            imapResultTitle: 'IMAP伺服器QTGate通訊評分：',
            testSuccess: '電子郵件伺服器連接試驗成功！',
            exitEdit: '退出編輯Email帳戶',
            deleteImap: '刪除IMAP帳戶',
            proxyPortError: '連接埠應該是從1000-65535之間的數字，或此端口已被其他APP所占用，請再嘗試其他號碼。',
            appPassword: '關於APP密碼'
        },
        Home_keyPairInfo_view: {
            title: '密鑰信息',
            emailNotVerifi: '您的密鑰未獲QTGate簽署認證。 ',
            emailVerified: '您的密鑰已獲QTGate簽署認證。 ',
            NickName: '創建人稱謂：',
            creatDate: '密鑰創建日期：',
            keyLength: '密鑰位強度：',
            password: '請輸入長度大於五位的密碼',
            password1: '請輸入密鑰密碼',
            logout: '退出登錄',
            deleteKeyPairInfo: '請注意：如果您沒有備份您的QTGate系統的話，刪除現有的密鑰將使您的QTGate設定全部丟失，您有可能需要重新設置您的QTGate系統。如果您的註冊Email沒有變化，您的QTGate賬戶支付信息不會丟失！',
            delete: '刪除',
            keyID: '密鑰對ID：',
            locked: '請提供您的RSA密鑰以解開密鑰後才能繼續操作，如果您遺忘了密碼，請刪除此RSA密鑰。',
            systemError: '發生系統錯誤。如果重複發生，請刪除您的密鑰，再次設定您的系統！'
        },
        home_index_view: {
            newVersion: '新版本準備就緒，請安裝！',
            newVersionInstallLoading: '更新中請稍候',
            localIpAddress: '本機',
            clickInstall: '點擊安裝新版本',
            internetLable: '互聯網',
            gateWayName: '代理伺服器',
            showing: '系統狀態',
            nextPage: '下一頁',
            agree: '同意協議並繼續',
            emailAddress: 'Email地址(必填)',
            stopCreateKeyPair: '停止生成密鑰對',
            creatKeyPair: '創建密鑰對..',
            cancel: '放棄操作',
            systemPassword: '密碼',
            continueCreateKeyPair: '繼續生成',
            SystemAdministratorNickName: '暱稱或組織名(必填)',
            KeypairLength: '請選擇加密通訊用密鑰對長度：這個數字越大，通訊越難被破解，但會增加通訊量和運算時間。',
            systemAdministratorEmail: 'RSA密鑰生成',
            GenerateKeypair: '<em>系統正在生成用於通訊和簽名的RSA加密密鑰對，計算機需要運行產生大量的隨機數字，可能需要幾分鐘時間，尤其是長度為4096的密鑰對，需要特別長的時間，請耐心等待。關於RSA加密算法的機制和原理，您可以訪問維基百科：' +
                `<a href='#' target="_blank" onclick="return linkClick ('https://zh.wikipedia.org/wiki/RSA加密演算法')">https://zh.wikipedia.org/wiki/RSA加密演算法</a></em>`,
            inputEmail: '让我们来完成设定的最后几个步骤，首先生成RSA密鑰對, 它是您的系統信息加密，身份認證及和QTGate通訊使用的重要工具。 RSA密鑰對的密碼請妥善保存，Email地址欄應填入您的常用Email地址, 它將被用作您的QTGate賬號。<em style="color:red;">需注意的是QTGate.com域名在某些网络限制地区被列入屏蔽名单，如果您使用的是网络限制地区email服务，您將有可能接收不到由QTGate發回的賬號確認Email，以完成QTGate設定。</em>',
            accountEmailInfo: `由於QTGate域名在某些國家和地區被防火牆屏蔽，而不能正常收發QTGate的Email，如果您是處於防火牆內的用戶，建議使用防火牆外部的郵件服務商。`
        },
        error_message: {
            title: '錯誤',
            errorNotifyTitle: '系統錯誤',
            Success: '完成',
            localServerError: '本地伺服器錯誤，請重新啟動QTGate！',
            required: '請填寫此字段',
            EmailAddress: ['請按照下列格式輸入你的電子郵件地址: someone@example.com.', '您已有相同的Email賬戶', '此類Email伺服器暫時QTGate技術不能對應。'],
            PasswordLengthError: '密碼必須設定為5個字符以上。',
            finishedKeyPair: '密鑰對創建完成',
            doCancel: '終止生成',
            errorKeyPair: '密鑰對創建發生錯誤，請重試',
            SystemPasswordError: '密鑰對密碼錯誤，請重試！如果您已忘記您的密鑰對密碼，請刪除現有的密鑰對，重新生成新的密鑰對。',
            finishedDeleteKeyPair: '密鑰對完成刪除!',
            offlineError: '您的電腦視乎未連結到互聯網，請檢查網路連結',
            imapErrorMessage: ['',
                '數據格式錯誤，請重試',
                '您的電腦未連接到互聯網，請檢查網絡後再次嘗試！',
                'Email伺服器提示IMAP用戶名或密碼錯！這個錯誤通常是由於您使用的密碼是普通密碼，或者您的APP密碼已失效，請到您的Email帳戶檢查您的APP密碼，然後再試一次。',
                'Email伺服器的指定連接埠連結失敗，請檢查您的IMAP連接埠設定，如果您在一個防火牆內部，則有可能該端口被防火牆所屏蔽，您可以嘗試使用該IMAP伺服器的其他連接埠！',
                '伺服器證書錯誤！您可能正在連接到一個仿冒的Email伺服器，如果您肯定這是您希望連接的伺服器，請在IMAP詳細設定中選擇忽略證書錯誤。',
                '無法獲得Email伺服器域名信息，請檢查您的Email伺服器設定！',
                '此Email伺服器看來不能使用QTGate通訊技术，請再測試一次或选择其他email服务供应商！',
                'email伺服器提示SMTP用戶名或密碼錯！',
                '伺服器證書錯誤！您可能正在連接到一個仿冒的Email伺服器，如果您肯定這是您希望連接的伺服器，請在SMTP詳細設定中選擇忽略證書錯誤。',
                'SMTP連結提示未知錯誤',
                '您已有相同的Email賬戶']
        },
        emailConform: {
            activeViewTitle: '驗證您的密鑰',
            emailTitle: '感謝您使用QTGate服務',
            info1_1: '您的密鑰還未完成驗證，QTGate已向您的密鑰郵箱發送了一封加密郵件，請檢查您的【',
            info1_2: '】郵箱。如果存在多封從QTGate過來的郵件時，以最後一封為準，打開信件並複制郵件。',
            info2: '複制內容從“-----BEGIN PGP MESSAGE----- （ 開始，一直到 ）----- END PGP MESSAGE-----” 結束的完整內容，粘貼到此輸入框中',
            emailDetail1: '尊敬的 ',
            emailDetail1_1: '',
            emailDetail2: '這是您的QTGate帳號激活密碼，請複制下列框內的全部內容:',
            bottom1_1: '此致',
            bottom1_2: 'QTGate團隊',
            conformButtom: '驗 證',
            formatError: ['內容格式錯誤，請複制從“-----BEGIN PGP MESSAGE----- （開始，一直到）-----END PGP MESSAGE-----” 結束的完整內容，粘貼在此輸入框中。',
                '提供的內容不能被解密，請確認這是在您收到的最後一封從QTGate發送過來的激活信。如果還是沒法完成激活，請刪除您的密鑰重新生成和設定。',
                '和QTGate連接發生錯誤，請退出重新嘗試！',
                '無效激活碼！ QTGate系統已重新發送新的激活Email，並斷開與您的連接。請退出QTGate重新啟動QTGate後，檢查您的郵箱重做激活。',
                '您的QTGate看上去有問題, 請刪除您的密鑰，重新設置您的QTGate！',
                'QTGate系統故障，請稍後再試。 ',
                '您當天的數據通訊量達到上限，請等待明天再試或升級用戶類型',
                '用來通訊的Email設定有錯誤，請檢查IMAP設定後重試，或QTGate不支持此Email類型',
                '您所選區域不能夠連結，請稍候再試',
                '您的IMAP郵箱發信發生錯誤。請退出QTGate重試。如果持續發生此故障，您的IMAP帳號有可能被鎖住，需要登陸您的IMAP郵箱網站解鎖操作。',
                'QTGate程序發生錯誤，請退出後重新啟動QTGate。',
                '嗯，高手過招身手非凡啊！'
            ],
            activeing: '正在通訊中'
        },
        QTGateRegion: {
            title: 'QTGate代理伺服器區域',
            available: '服務中',
            speedTest: '代理伺服器速度測試',
            unavailable: '準備中',
            proxyDomain: '域名解釋全程使用QTGate代理伺服器端',
            setupCardTitle: '使用連接技術:',
            MultipleGateway: '同時併發使用代理數：',
            connectQTGate: '正在獲得代理伺服器區域信息...',
            dataTransfer: '數據通訊:',
            dataTransfer_datail: ['全程使用QTGate代理伺服器', '當本地不能夠到達目標伺服器時使用'],
            proxyDataCache: '瀏覽數據本地緩存:',
            proxyDataCache_detail: ['本地緩存', '不緩存'],
            dataViaGateway: '全部互聯網數據通過QTGate代理伺服器',
            cacheDatePlaceholder: '緩存失效時間',
            clearCache: '立即清除所有緩存',
            GlobalIp: '本機互聯網IP地址:',
            pingError: '代理服務區域速度檢測錯誤發生，請退出QTGate，以管理員身份再次打開QTGate後，再執行速度檢測！',
            QTGateRegionERROR: ['發送連接請求Email到QTGate系統發生送信錯誤， 請檢查您的IMAP賬號的設定。 ',
                ''],
            sendConnectRequestMail: ['您的QTGate客戶端沒有和QTgate系統聯機，客戶端已向QTgate系統重新發出聯機請求Email。和QTgate系統聯機需要額外的時間，請耐心等待。 ',
                '當免費用戶連續24小時內沒有使用客戶端，您的連接會被中斷。付費用戶情況下QTgate系統可保持持續聯機一個月。 '],
            GlobalIpInfo: '注意：當您按下【QTGate連結】時您會把您的本機互聯網IP提供給QTGate系統，如果您不願意，請選擇【@OPN】技術來使用QTGate服務！沒有【@OPN】選項是因為@QOPN只能對應iCloud郵箱。',
            localPort: '本地代理伺服器連接埠:',
            cacheDatePlaceDate: [{ name: '1小时', id: 1 }, { name: '12小时', id: 12 }, { name: '1日', id: 24 }, { name: '15日', id: 360 }, { name: '1月', id: 720 }, { name: '6月', id: 4320 }, { name: '永遠', id: -1 }],
            atQTGateDetail: ['世界首创的QTGate无IP互联网通讯技术，全程使用強加密Email通訊，客户端和代理服务器彼此不用知道IP地址，具有超强隐身和保护隐私，超強防火牆穿透能力。缺点是有延遲，网络通讯响应受您所使用的email服务供应商的伺服器影响，不適合遊戲視頻會話等通訊。目前該技術只支持iCloud郵箱。',
                'QTGate獨創HTTP強加密混淆流量代理技術，能夠隱藏變換您的IP地址高速通訊，隐身和保护隐私，抗干擾超強防火牆穿透能力。缺點是需要使用您的IP來直接連結代理伺服器。如果您只是需要自由訪問互聯網，則推薦使用本技術。',
                '域名解釋使用QTGate代理伺服器端，可以防止域名伺服器緩存污染，本選擇不可修改。', '互聯網數據全程使用QTGate代理，可以匿名上網隱藏您的互聯網形踪。', '只有當本地網絡不能夠到達您希望訪問的目標時，才使用QTGate代為您連結目標伺服器，本選項可以節省您的QTGate流量。',
                '通過本地緩存瀏覽紀錄，當您再次訪問目標伺服器時可以增加訪問速度，減少網絡流量，緩存瀏覽記錄只針對非加密技術的HTTP瀏覽有效。QTGate使用強加密技術緩存瀏覽紀錄，確保您的隱私不被洩漏', '不保存緩存信息。',
                '設置緩存有效時間，您可以及時更新伺服器數據，單位為小時。', '本地Proxy服务器，其他手机电脑和IPad等可通過连结此端口來使用QTGate服务。請設定為3001至65535之間的數字', '通過設置PATH鏈接路徑可以簡單給您的Proxy伺服器增加安全性，拒絕沒有提供PATH的訪問者使用您的Proxy伺服器。']
        },
        QTGateGateway: {
            title: 'QTGate服務使用詳細',
            processing: '正在嘗試连接QTGate代理服务器...',
            error: ['錯誤：您的賬號下已經有一個正在使用QTGate代理伺服器的連接，請先把它斷開後再嘗試連接。', '錯誤：您的賬號已經無可使用流量，如果您需要繼續使用QTGate代理伺服器，請升級您的賬戶類型。如果是免費用戶已經使用當天100M流量，請等待到明天繼續使用，如您是免費用戶已經用完當月1G流量，請等待到下月繼續使用。',
                '錯誤：數據錯誤，請退出並重新啟動QTGate！', '非常抱歉，您請求的代理區域無資源，請選擇其他區域或稍後再試', '對不起，您所請求連接的區域不支持這樣的連接技術，請換其他連接方法或選擇其他區域連接'],
            connected: '已連接。',
            userType: ['免費用戶', '付費用戶'],
            datatransferToday: '當日可使用流量限額：',
            datatransferMonth: '本月可使用流量限額：',
            todaysDatatransfer: '本日可使用流量',
            monthDatatransfer: '本月可使用流量',
            gatewayInfo: ['代理伺服器IP地址：', '代理伺服器連接端口：'],
            userInfoButton: '使用指南',
            stopGatewayButton: '切斷連接',
            disconnecting: '正在切斷中'
        },
        qtGateView: {
            title: 'QTGate連接',
            QTGateConnectResultWaiting: '已向QTGate系統發送連接請求Email。由於是首次連接QTGate系統，系統需要幾分鐘時間來完成與您的對接，請耐心等待。',
            mainImapAccount: 'QTGate通訊用郵箱',
            QTGateDisconnectInfo: 'QTGate連結已斷開。請選擇向QTGate發送請求對接的IMAP帳號',
            QTGateConnectStatus: 'QTGate連接狀態',
            QTGateConnectResult: ['QTGate未聯機，請點擊連接QTGate！', '正在和QTGate聯機中', '已經連接QTGate', '連接QTGate時發生錯誤，請修改IMAP賬號設定',
                '已經連接QTGate'],
            QTGateSign: ['您的密鑰狀態', '還未獲得QTGate信任簽署,點擊完成信任簽署',
                '密钥获得QTGate信任签署是QTGate一个重要步骤，您今后在QTGate用户之间分享文件或传送秘密信息时，QTGate可以證明是您本人而非其他冒充者。你也可以通过您的密钥签署信任给其他QTGate用户，用以区别您自己的信任用户和非信任用户。',
                '正在獲得QTGate信任簽署中', '系統錯誤，請重啓QTGate後再試，如果仍然存在，請嘗試重新安裝QTGate。', 'QTGate系統錯誤!']
        },
        feedBack: {
            title: '使用信息反饋',
            additional: '添附附加信息',
            okTitle: '發送至QTGate'
        },
    }
];
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
    }, {
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
    requestMultipleGateway: null
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
                ciphers: null
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
            this.showQTGateImapAccount = ko.observable(true);
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
            //-
            //- QTGate connect
            this.showSendIMAPToQTGateInfo = ko.observable(false);
            this.commandStatus = ko.observable('');
            this.QTGateRegionInfo = ko.observable(false);
            this.QTGateConnect_SelectTech = ko.observable(-1);
            this.QTGateConnect1 = ko.observable('');
            this.QTGateMultipleGateway = ko.observable(1);
            this.QTGateMultipleGatewayPool = ko.observableArray([1, 2]);
            this.QTGateConnect2 = ko.observable(false);
            this.QTGateConnectSelectImap = ko.observable(0);
            this.QTGateAllData = ko.observable(false);
            this.QTGateCacheUse = ko.observable(false);
            this.QTGate_CacheTime = ko.observable(0);
            this.QTGate_showDeleteCacheButton = ko.observable(false);
            this.QTGateLocalProxyPort = ko.observable(3001);
            this.QTGateLoacalProxyPath = ko.observable((Math.random() * 100000).toString());
            this.localProxyPortError = ko.observable(false);
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
                    return;
                const check = /^-----BEGIN PGP MESSAGE-----/.test(text);
                this.conformTextErrorNumber(0);
                if (!check) {
                    this.conformTextError(true);
                    $('.activating.element').popup({
                        on: 'click',
                        position: 'left center',
                        target: '#SendToQTGateTextArea',
                        onHidden: () => {
                            this.conformTextError(false);
                        }
                    });
                }
                return (check);
            });
            this.cancelPlan = ko.observable(false);
            this.connectQTGateShow = ko.observable(false);
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
                if (this.emailPool().length > 1)
                    this.showQTGateImapAccount(false);
                if (index === -1)
                    return this.showAddImapDataButton(true);
            });
            socketIo.on('deleteKeyPair', () => {
                return window.location.replace('/');
            });
            socketIo.on('config', config => {
                return this.config(config);
            });
            socketIo.on('checkActiveEmailError', err => {
                if (err !== null && err > -1) {
                    if (err === 3 || err === 4 || err === 2 || err === 9) {
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
                this.imapInputFormActive(true);
                this.QTGateConnectActive(true);
                this.reSendConnectMail(false);
                $('.ui.dropdown').dropdown();
                this.menuClick(3, true);
                //      have no imap data
                if (!data) {
                    //      show imap manager area
                    this.menuClick(2, true);
                    return this.QTGateConnectActive(false);
                }
                if (data && data.qtgateConnectImapAccount) {
                    const uu = this.emailPool().findIndex(n => { return n.uuid === data.qtgateConnectImapAccount; });
                    this.QTGateConnectSelectImap(uu);
                }
                this.QTGateConnecting(data.qtGateConnecting);
                if (data.qtGateConnecting === 3) {
                    this.QTGateConnectActive(false);
                    this.QTGateConnectRegionActive(false);
                    this.menuClick(2, true);
                    const index = this.emailPool().findIndex(n => { return n.uuid === data.qtgateConnectImapAccount; });
                    const imapData = this.emailPool()[index];
                    imapData.appPaassword(true);
                    return imapData.callBackError(3);
                    /*
                    this.showActiveMail ( true )
                    this.QTGateConnecting ( data.qtGateConnecting )
                    this.QTGateConnectActive ( true )

                    this.QTGateConnectError ( data.error )
                    return $( '.activating.element' ).popup({
                        on: 'click',
                        onHidden: () => {
                            this.emailPool()[ this.QTGateConnectSelectImap()].callBackError ( data.error )
                            this.MenuItems ([ false, false, true, false, false ])
                            this.QTGateConnectActive ( false )
                        },
                        position: 'bottom left'
                    })
                    */
                }
                if (!this.keyPair().verified) {
                    if (data.qtGateConnecting === 6) {
                        return this.connectQTGateShow(true);
                    }
                    this.showActiveMail(true);
                    this.QTGateConnectActive(true);
                    this.QTGateConnectError(data.error);
                    //      connected to QTGate system
                    if (data.qtGateConnecting > 1) {
                        this.connectQTGateShow(false);
                    }
                    if (data.qtGateConnecting === 2) {
                        return $('.activating.element').popup({
                            on: 'click',
                            onHidden: () => {
                                $('#QTGateSignInformationPopupa').hide();
                            },
                            position: 'bottom left'
                        });
                    }
                    //      send verified ERROR!
                    if (data.qtGateConnecting === 5) {
                        return $('.activating.element').popup({
                            on: 'click',
                            onHidden: () => {
                            },
                            position: 'bottom left'
                        });
                    }
                    return $('.QTGateConnect').accordion('refresh');
                }
                this.showActiveMail(false);
                if (data.qtGateConnecting === 2) {
                    return setTimeout(() => {
                        return socketIo.emit('getAvaliableRegion', (region, dataTransfer, config) => {
                            return this.getAvaliableRegionCallBack(region, dataTransfer, config);
                        });
                    }, 2000);
                }
                const process = $('#connectImformationProcess');
                let percent = 0;
                const doingProcessBar = () => {
                    clearTimeout(this.doingProcessBarTime);
                    this.doingProcessBarTime = setTimeout(() => {
                        process.progress({
                            percent: ++percent
                        });
                        if (percent < 100)
                            return doingProcessBar();
                    }, 1000);
                };
                this.QTGateConnectRegionActive(true);
                //      first connect 
                if (data.qtGateConnecting === 1) {
                    process.progress('reset');
                    doingProcessBar();
                    this.QTGateRegionInfo(true);
                    this.menuClick(3, true);
                    return this.QTGateConnectActive(false);
                }
                //          timeout!
                if (data.qtGateConnecting === 6) {
                    return this.sendConnectRequestMail(true);
                }
                //          send request mail error
                if (data.qtGateConnecting === 5) {
                    clearTimeout(this.doingProcessBarTime);
                    process.addClass('error');
                    this.emailPool()[this.QTGateConnectSelectImap()].callBackError(data.error);
                    return this.QTGateRegionERROR(0);
                }
                if (data.qtGateConnecting === 3 && data.error === 10) {
                    const index = this.emailPool().findIndex(n => { return availableImapServer.test(n.iMapServerName()); });
                    if (index > -1) {
                        this.QTGateConnectSelectImap(index);
                    }
                    $('.ui.dropdown').dropdown();
                    return this.reSendConnectMail(true);
                }
                this.QTGateRegionInfo(false);
                //$('.mainAccordion').accordion('refresh')
                return this.QTGateConnectActive(false);
            });
            //          gateway disconnect!
            socketIo.on('disconnectClickCallBack', resopn => {
                this.disconnecting(true);
                if (this.selectedQTGateRegion()) {
                    this.selectedQTGateRegion().showConnectedArea(false);
                    this.ConnectGatewayShow(false);
                    this.disconnecting(false);
                    return this.selectedQTGateRegionCancel();
                }
            });
            socketIo.once('reconnect_error', err => {
                if (this.modalContent().length)
                    return;
                this.modalContent(infoDefine[this.languageIndex()].emailConform.formatError[10]);
                return $('.ui.basic.modal').modal('setting', 'closable', false).modal('show');
            });
            socketIo.on('disconnectClickCallBack', () => {
                return this.desconnectCallBack();
            });
            socketIo.on('QTGateGatewayConnectRequest', data => {
                return this.QTGateGatewayConnectRequestCallBack(this, data);
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
                    requestMultipleGateway: this.QTGateMultipleGateway()
                };
                data.error(-1);
                //root.QTGateConnectRegionActive ( false )
                //root.QTGateGatewayActiveProcess ( true )
                const process = $('.regionConnectProcessBar').progress('reset');
                let doingProcessBarTime = null;
                let percent = 0;
                const doingProcessBar = () => {
                    clearTimeout(doingProcessBarTime);
                    doingProcessBarTime = setTimeout(() => {
                        process.progress({
                            percent: ++percent
                        });
                        if (percent < 100)
                            return doingProcessBar();
                    }, 1000);
                };
                doingProcessBar();
                data.showExtraContent(false);
                data.showRegionConnectProcessBar(true);
                socketIo.emit('QTGateGatewayConnectRequest', connect, (_data) => {
                    clearTimeout(doingProcessBarTime);
                    data.showRegionConnectProcessBar(false);
                    if (_data.error > -1) {
                        data.showExtraContent(true);
                        //this.QTGateConnectRegionActive ( true )
                        //this.QTGateGatewayActiveProcess ( false )
                        data.error(_data.error);
                        return this.menuClick(3, true);
                    }
                    const data1 = _data.Args[0];
                    return this.QTGateGatewayConnectRequestCallBack(this, data1);
                });
                return false;
            });
        }
        QTGateGatewayConnectRequestCallBack(_self, _data) {
            const self = _self || this;
            self.QTTransferData(_data.transferData);
            self.QTConnectData(_data);
            $('.userDetail').progress();
            const index = self.QTGateRegions().findIndex((n) => { return n.qtRegion === _data.region; });
            if (index < 0) {
                return;
            }
            const data = self.QTGateRegions()[index];
            this.QTGateConnectRegionActive(true);
            this.menuClick(3, false);
            this.selectedQTGateRegion(data);
            data.selected(true);
            data.showExtraContent(false);
            data.available(true);
            this.ConnectGatewayShow(true);
            return data.showConnectedArea(true);
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
            this.pingCheckLoading(true);
            socketIo.emit('getAvaliableRegion', (region, dataTransfer, config) => {
                return this.getAvaliableRegionCallBack(region, dataTransfer, config);
            });
        }
        desconnectCallBack() {
            this.selectedQTGateRegion().showConnectedArea(false);
            this.ConnectGatewayShow(false);
            this.selectedQTGateRegionCancel();
            this.disconnecting(false);
            socketIo.emit('getAvaliableRegion', (region, dataTransfer, config) => {
                return this.getAvaliableRegionCallBack(region, dataTransfer, config);
            });
        }
        disconnectClick() {
            this.disconnecting(true);
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
    }
    view_layout.view = view;
})(view_layout || (view_layout = {}));
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
        multi_gateway: 0
    }, {
        name: 'p1',
        monthly: 50,
        monthlyPay: 3.88,
        annually: 34.56,
        next: 'p2',
        share: 0,
        internet: 0,
        multi_gateway: 0
    }, {
        name: 'p2',
        monthly: 300,
        monthlyPay: 6.88,
        annually: 60,
        next: 'p3',
        share: 0,
        internet: 0,
        multi_gateway: 0
    }, {
        name: 'p3',
        monthly: 1000,
        monthlyPay: 19.88,
        annually: 199.88,
        next: 'p4',
        share: 1,
        internet: 1,
        multi_gateway: 1
    }, {
        name: 'p4',
        monthly: 2000,
        monthlyPay: 39.88,
        annually: 399.88,
        next: 'p5',
        share: 2,
        internet: 2,
        multi_gateway: 1
    }, {
        name: 'p5',
        monthly: 4000,
        monthlyPay: 79.88,
        annually: 799.88,
        share: 3,
        internet: 3,
        multi_gateway: 1
    }
];
const linkClick = (url) => {
    const { shell } = require('electron');
    event.preventDefault();
    shell.openExternal(url);
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
