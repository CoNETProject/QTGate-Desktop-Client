/*---------------------------------------------------------------------------------------------
 *  Copyright (c) QTGate System Inc. All rights reserved.
 *  Licensed under the MIT License. See License in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

interface languageMenu {
    LanguageName: string;
    showName: string;
    LanguageJsonName: string;
}
declare const semantic

interface StringValidator {
    isAcceptable(s: string): boolean;
}
const animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend'
interface systemViewStatus {
    SystemPassword_submitRunning: boolean
}

const uuid_generate = () => {
    let lut: Array < string > = [];
    for ( let i = 0; i < 256; i++ ) {
            lut [i] = ( i < 16 ? '0' : '') + ( i ).toString ( 16 );
        }
    let d0 = Math.random () * 0xffffffff | 0;
    let d1 = Math.random () * 0xffffffff | 0;
    let d2 = Math.random () * 0xffffffff | 0;
    let d3 = Math.random () * 0xffffffff | 0;
    return  lut[ d0 & 0xff ]+ lut [d0 >> 8 & 0xff ] + lut [ d0 >> 16 & 0xff ] + lut [ d0 >> 24 & 0xff ] + '-' +
        lut [ d1 & 0xff ]+ lut [ d1 >> 8 & 0xff ] +'-'+ lut [ d1 >> 16 & 0x0f | 0x40 ] + lut[ d1 >> 24& 0xff ] + '-' +
        lut [ d2 & 0x3f | 0x80 ]+ lut [ d2 >> 8 & 0xff ] + '-' + lut [ d2 >> 16 & 0xff]+ lut [ d2 >> 24 & 0xff ] +
        lut [ d3 & 0xff ]+ lut [ d3 >> 8 & 0xff ] + lut [ d3 >> 16 & 0xff] + lut [ d3 >> 24 & 0xff ];
}
const insideChinaEmail = /(\@|\.)(sina|sohu|qq|126|163|tom)\.com|(\.|\@)yeah\.net/i
const uuID = () => {
    return uuid_generate().replace( /-/g,'')
}

const isElectronRender = typeof process === 'object'
const socketIo: SocketIOClient.Socket = io ()
/**
 * 			getImapSmtpHost
 * 		@param email <string>
 * 		@return Imap & Smtp info
 */
const getImapSmtpHost = ( email: string ) => {
	
	const yahoo = ( domain: string ) => {
		
		if ( /yahoo.co.jp$/.test ( domain ))
			return 'yahoo.co.jp';
			
		if ( /((.*\.){0,1}yahoo|yahoogroups|yahooxtra|yahoogruppi|yahoogrupper)(\..{2,3}){1,2}$/.test ( domain ))
			return 'yahoo.com';
		
		if ( /(^hotmail|^outlook|^live|^msn)(\..{2,3}){1,2}$/.test ( domain ))
			return 'hotmail.com';
			
		if ( /^(me|^icould|^mac)\.com/.test ( domain ))
			return 'me.com'

		return domain
	}

	const emailSplit = email.split ( '@' );
	
	if ( emailSplit.length !== 2 ) 
		return null
		
	const domain = yahoo ( emailSplit [1] )
	
	const ret = {
		imap: 'imap.' + domain,
		smtp: 'smtp.' + domain,
		SmtpPort: [587,465],
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
			ret.SmtpPort = [465]
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
		
		case 'gmx.com' : {
			ret.smtp = 'mail.gmx.com'
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
			ret.SmtpPort = [465]
		}
		break;
		
		case 'sina.com':
		case 'yeah.net': {
			ret.SmtpPort = [465]
			ret.smtpSsl = false
		}
		break;
		
	}
	
	return ret
	
}

const Menu = {
            'zh':[{
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
            },{
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
            },{
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
            'tw':[
            {
                LanguageJsonName: 'tw',
                showName: '正體字中文',
                icon: 'flag-icon-tw'
            },{
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
            }]
        }
const cookieName = 'langEH'
const passwdCookieName = 'QTGate'
const EmailRegexp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i

const initLanguageCookie = () => {
    var cc: string = $.cookie( cookieName )
    
    if ( !cc ) {
        cc = window.navigator.language
    }

    if ( !cc )
        cc = 'en'
    cc = cc.substr (0, 2).toLocaleLowerCase()
    switch ( cc ) {
        case 'zh':
            break
        case 'en':
            break
        case 'ja':
            break
        case 'tw':
            break;
        default:
            cc = 'en'
    }
    $.cookie ( "langEH", cc, { expires: 180, path: '/' })
    $ ( "html" ).trigger( 'languageMenu', cc )
    return cc
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

enum lang { 'zh', 'ja', 'en', 'tw' }
interface IQTGateRegionsSetup {
    title: string
}
const transfer: iTransferData = {
    productionPackage: 'free',
    usedMonthlyOverTransfer: 1073741824,
    account: null,
    availableDayTransfer: 104857600,
    power: 1,
    usedMonthlyTransfer: 0,
    timeZoneOffset: 420,
    usedDayTransfer: 0,
    resetTime: new Date (),
    availableMonthlyTransfer: 1073741824,
    startDate: new Date (),
    transferMonthly: 1073741824,
    transferDayLimit: 104857600
}

const QTGateRegionsSetup: IQTGateRegionsSetup[] = [
    {
        title: '@OPN'
    },
    {
        title: 'iOPN'
    }
]

const infoDefine = [
	{
        
        QTGateInfo: {
            title:'QTGate功能简介',
            version:'本机QTGate版本：v',
            detail:[{
                header: '隐身匿名自由上网',
                color: '#a333c8',
                icon: 'exchange',
                detail: 'QTGate通过使用<a onclick="return linkClick (`https://zh.wikipedia.org/wiki/%E9%AB%98%E7%BA%A7%E5%8A%A0%E5%AF%86%E6%A0%87%E5%87%86`)" href="#" target="_blank">AES256-GCM</a>和<a onclick="return linkClick (`https://zh.wikipedia.org/wiki/PGP`)" href="#" target="_blank">OpenPGP</a>加密Email通讯，创造了OPN匿名网络通讯技术，QTGate公司首创的@OPN技术，它全程使用加密Email通讯，客户端和代理服务器彼此不用交换IP地址来实现高速通讯。iOPN通讯技术是利用普通HTTP协议下的混淆流量加密技术，能够隐藏变换您的IP地址高速通讯。二种通讯方式都能够让您，隐身和安全及不被检出的上网，保护您的隐私，具有超强对抗网络监控,网络限制和网络阻断。'
            },
            {
                color: 'darkcyan',
                icon: 'spy',
                header: '阻断间谍软件向外送信功能(下一版本)',
                detail: 'QTGate系统连接全球DNSBL联盟数据库，用户通过订阅QTGate系统黑名单列表，并使用QTGate客户端上网，让潜伏在您电子设备内的间谍软件，它每时每刻收集的信息，不能够被送信到其信息收集服务器，能够最大限的保障您的个人隐私。'
            },{
                color: '#6435c9',
                icon: 'external share',
                header:'本地VPN服务器(下一版本)',
                detail:'QTGate用户在户外时可以通过连接自己家里的VPN，来使用QTGate客户端隐身安全上网。'
            },{
                color: '#6435c9',
                icon: 'cloud upload',
                header:'加密文件匿名网络云储存及分享功能(下一版本)',
                detail:'用户通过申请多个和不同的免费email服务商账号，可以把一个文件加密拆分成多个部分，分别存储在不同的email账号下，可以保密安全和无限量的使用网络储存。用户还可以通过QTGate系统在QTGate用户之间分享秘密文件。'
            },{
                color: '#e03997',
                icon: 'talk outline',
                header:'无IP点对点即时加密通讯服务(下一版本)',
                detail:'QTGate用户之间通过email的点对点即时通讯服务，它具有传统即时通讯服务所不具有的，匿名无IP和用户之保持秘密通讯的功能。QTGate加密通讯服务可以传送文字，图片和视频文件信息。QTGate加密通讯服务支持群即时通讯。'
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
                },{
                    header: null,
                    detail: '使用我们的服务并不让您拥有我们的服务或您所访问的内容的任何知识产权。除非您获得相关内容所有者的许可或通过其他方式获得法律的许可，否则您不得使用服务中的任何内容。本条款并未授予您使用我们服务中所用的任何商标或标志的权利。请勿删除、隐藏或更改我们服务上显示的或随服务一同显示的任何法律声明。'
                },
                {
                    header: '关于个人隐私保护，系统日志和接收QTGate传送的信息',
                    detail: '在您使用服务的过程中，我们可能会向您发送服务公告、管理消息和其他信息。您可以选择不接收上述某些信息。'
                },{
                    header: null,
                    detail: '当您使用我们的服务时，我们为了计费处理会自动收集非常有限的数据流量信息，并存储到服务器日志中。数据流量信息仅用于计算客户应支付通讯费用而收集的，它收集的数据是：日期，用户帐号，数据包大小，下载或上传。例如：'
                },{
                    header: null,
                    detail: '<p class="tag info">06/20/2017 18:12:16, info@qtgate.com, 300322 byte up, 482776323 byte down.</p><p class="tag info">06/21/2017 12:04:18, info@qtgate.com, 1435226 byte up, 11782238 byte down.</p>'
                },
                {
                    header: null,
                    detail: 'QTGate没有保存除了以上信息以外的任何其他信息。我们会配合并向持有加拿大法院令的执法机构提供此日志文件。如果您是加拿大以外地区的执法机构，有这方面信息披露的需求，请通过加拿大外交部来联系我们：'
                },{
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
                },{
                    header: '修改与终止服务',
                    detail: '我们持续改变和改善所提供的服务。我们可能会新增或移除功能或特性，也可能会暂停或彻底停止某项服务。您随时都可以停止使用服务，尽管我们并不希望您会这样做。 QTGate也可能随时停止向您提供服务，或对服务附加或设定新的限制。'
                },
                {
                    header: '服务的责任',
                    detail: '在法律允许的范围内，QTGate及其供应商和分销商不承担利润损失、收入损失或数据、财务损失或间接、特殊、后果性、惩戒性或惩罚性损害赔偿责任。'
                },{
                    header: '法律规定的贸易禁止事项',
                    detail: '当您按下同意按钮，表示您已经确认您不属于加拿大法律所规定的禁止贸易对象的列表之中。 '
                },
                {
                    header: '服务的商业使用',
                    detail: '如果您代表某家企业使用我们的服务，该企业必须接受本条款。对于因使用本服务或违反本条款而导致的或与之相关的任何索赔、起诉或诉讼，包括因索赔、损失、损害赔偿、起诉、判决、诉讼费和律师费而产生的任何责任或费用，该企业应对QTGate及其关联机构、管理人员、代理机构和员工进行赔偿并使之免受损害。'
                }, {
                    header: '本条款的变更和约束力',
                    detail: '关于本条款：我们可以修改上述条款或任何适用于某项服务的附加条款，例如，为反映法律的变更或我们服务的变化而进行的修改。您应当定期查阅本条款。我们会在本网页上公布这些条款的修改通知。我们会在适用的服务中公布附加条款的修改通知。所有修改的适用不具有追溯力，且会在公布十四天或更长时间后方始生效。但是，对服务新功能的特别修改或由于法律原因所作的修改将立即生效。如果您不同意服务的修改条款，应停止使用服务。如果本条款与附加条款有冲突，以附加条款为准。'
                }
                , {
                    header: null,
                    detail: '本条款约束QTGate与您之间的关系，且不创设任何第三方受益权。如果您不遵守本条款，且我们未立即采取行动，并不意味我们放弃我们可能享有的任何权利（例如，在将来采取行动）。如果某一条款不能被强制执行，这不会影响其他条款的效力。加拿大BC省的法律（不包括BC州的法律冲突规则）将适用于因本条款或服务引起的或与之相关的纠纷。因本条款或服务引起的或与之相关的所有索赔，只能向加拿大BC省法院提起诉讼，且您和QTGate同意上述法院拥有属人管辖权。'
                }
            ],
            disagree: '不同意',
            agreeMent: 'QTGate服务条款和隐私权'
            
        },

        linuxUpdate:{
            newVersionDownload: '点击这里下载并安装',
            step1: '下载新版本',
            step2: '授权新版本QTGate为可执行文件',
            step2J1:'/images/linuxUpdate1_tw.jpg',
            step2J2:'/images/linuxUpdate2_tw.jpeg',
            step2_detail1: '右键点击已下载的QTGate图标，选择菜单里的文件属性',
            step2_detail2: '在权限选项里，选勾“允许档案文件执行”。',
            step3:'退出旧版本QTGate后，双击QTGate文件执行安装',
            exit: '退出QTGate'
        },

        imapInformation: {
            title: '通讯专用Email邮箱设置',
            infomation: '请设置QTGate通讯专用Email邮箱信息。由于此账户的用户名和密码信息会提交给QTGate系统，为了防止您的个人信息被泄漏，请新申请一个临时Email账户。目前QTGate技术只对应<span style="color: red;">苹果公司Email，微软OUTLOOK，雅虎公司Email三家，QTGate强力推荐使用苹果公司的Email可以达到最佳速度。</span>，请在以上三家公司申请一个新的免费邮箱。关于密码，推荐使用Email服务商的<a href="https://tw.help.yahoo.com/kb/SLN15241.html" target="_blank" onclick="return linkClick (`https://tw.help.yahoo.com/kb/SLN15241.html`)">应用密码</a>',
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
            imapCheckingStep: ['正在尝试连接email服务器','email伺服器IMAP連接成功','email伺服器SMTP連接成功'],
            imapResultTitle:'IMAP服务器QTGate通讯评分：',
            testSuccess: 'email服务器连接试验成功！',
            exitEdit: '退出编辑Email帐户',
            deleteImap: '删除IMAP账户',
            proxyPortError: '端口号应该是从1000-65535之间的数字，或此端口号已被其他APP所占用。请尝试其他号码。'

        },

		home_index_view: {
            newVersion: '新版本准备就绪，请安装！',
            clickInstall: '点击安装新版本',
            showing: '系统状态',
            internetLable: '互联网',
            gateWayName:'代理服务器',
            localIpAddress: '本机',
            nextPage:'下一页',
            agree: '同意协议并继续',
            emailAddress: 'Email地址(必填)',
            systemAdministratorEmail:'RSA密钥生成',
            SystemAdministratorNickName: '昵称或组织名(必填)',
            systemPassword: '密码',
            creatKeyPair: '创建密钥对...',
            cancel: '放弃操作',
            stopCreateKeyPair: '停止生成密钥对',
            continueCreateKeyPair: '继续生成',
            KeypairLength: '请选择加密通讯用密钥对长度：这个数字越大，通讯越难被破解，但会增加通讯量和运算时间。',
            GenerateKeypair: '<em>系统正在生成用于通讯和签名的RSA加密密钥对，计算机需要运行产生大量的随机数字有，可能需要几分钟时间，尤其是长度为4096的密钥对，需要特别长的时间，请耐心等待。关于RSA加密算法的机制和原理，您可以访问维基百科：' +
                `<a href='https://zh.wikipedia.org/wiki/RSA加密演算法' target="_blank" onclick="return linkClick ('https://zh.wikipedia.org/wiki/RSA加密演算法')" >https://zh.wikipedia.org/wiki/RSA加密演算法</a></em>`,
            inputEmail: '让我们来完成设定的最后几个步骤，首先生成RSA密钥对, 它是您的系统信息加密，身份认证及和QTGate通讯使用的重要工具。 RSA密钥对的密码请妥善保存，Email地址栏应填入您的常用Email地址, 它将被用作您的QTGate账号。<em style="color:red;">需注意的是QTGate.com域名在某些网络限制地区被列入屏蔽名单，如果您使用的是网络限制地区email服务，您将不能够完成设定QTGate设定。</em>',
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
            systemError:'发生系统错误。如果重复发生，请删除您的密钥，再次设定您的系统！'
        },

        error_message: {
            title: '错误',
            errorNotifyTitle: '系统错误',
            EmailAddress: ['请按以下格式输入你的电子邮件地址: someone@example.com.','您已有相同的Email账户','此类Email服务器暂时QTGate技术不能对应,请选择Apple公司，微软Outlook, Yahoo公司的Email服务。'],
            required: '请填写此字段',
            doCancel: '终止完成',
            PasswordLengthError: '密码必须设定为5个字符以上。',
            localServerError: '本地服务器错误，请重新启动QTGate！',
            finishedKeyPair: '密钥对创建完成！',
            errorKeyPair:'密钥对创建发生错误，请重试',
            Success: '完成',
            SystemPasswordError: '密钥对密码错误，请重试！如果您已忘记您的密钥对密码，请删除现有的密钥对，重新生成新的密钥对。但您的原有设定将全部丢失！',
            finishedDeleteKeyPair: '密钥对完成删除!',
            offlineError: '您的电脑未连接到互联网，请检查网络后再次尝试！',
            imapErrorMessage: ['','数据格式错误，请重试', '您的电脑未连接到互联网，请检查网络后再次尝试！','email服务器提示用户名或密码错！',
                'Email伺服器的指定端口號連結失敗，請檢查您的IMAP端口號設定，如果您在一個防火牆內部，則有可能該端口被防火牆所屏蔽，您可以嘗試使用該IMAP伺服器的其他端口號！<a href="data-html"></a>',
                '服务器证书错误！您可能正在连接到一个仿冒的Email服务器，如果您肯定这是您希望连接的服务器，请在IMAP详细设定中选择忽略证书错误。','无法获得Email服务器域名信息，请检查您的Email服务器设定！',
                '此Email伺服器不能使用QTGate通訊技术。请选择其他email服务供应商！','email服务器提示SMTP用户名或密码错！ ',
                '服务器证书错误！您可能正在连接到一个仿冒的Email服务器，如果您肯定这是您希望连接的服务器，请在SMTP详细设定中选择忽略证书错误。 ','SMTP连结提示未知错误', '存在相同Email账号']
        },

        emailConform: {
            activeViewTitle:'验证您的密钥',
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
            formatError: ['内容格式错误，请复制从“-----BEGIN PGP MESSAGE----- （开始，一直到）-----END PGP MESSAGE-----” 结束的完整内容，粘贴在此输入框中。',
                '提供的内容不能被解密，请确认这是在您收到的最后一封从QTGate发送过来的激活信。如果还是没法完成激活，请删除您的密钥重新生成和设定。',
                'QTGate未连接错误，请退出QTGate重新启动！','无效激活码！系统已经重新发送新的激活Email，请检查邮箱重做激活。','您的QTGate看上去有问题, 请删除您的密钥，重新设置您的QTGate！',
                'QTGate系统故障，请稍后再试。','您当天的数据通讯量达到上限，请等待明天再试或升级用户类型','用来通讯的Email设定有错误，请检查IMAP设定后重试，或此Email类型QTGate不支持',
                '您所选区域不能够连结，请稍候再试'],
            activeing: '正在通讯中'
        },

        QTGateRegion: {
            title: 'QTGate代理服务器区域选择',
            error: [],
            connectQTGate:'正在获得代理服务器区域信息...',
            available: '服务中',
            unavailable: '准备中',
            proxyDomain: '域名解释全程使用QTGate代理服务器端',
            setupCardTitle: '使用连接技术:',
            dataTransfer: '数据通讯：',
            dataTransfer_datail: ['全程使用代理服务器','当本地不能够到达目标主机时使用'],
            proxyDataCache: '浏览数据本地缓存:',
            proxyDataCache_detail: ['本地緩存','不緩存'],
            cacheDatePlaceholder: '缓存失效时间',
            clearCache: '立即清除所有缓存',
            localPort: '本地代理服务器端口号:',
            localPath: '本地代理服务器HTTP链接路径',
            outDoormode: '接受外網訪問',
            GlobalIp: '本机互联网IP地址:',
            QTGateRegionERROR:['发送连接请求Email到QTGate系统发生送信错误， 请检查您的IMAP账号的设定。',
                                ''],
            GlobalIpInfo: '注意：当您按下【QTGate连结】时您会把您的本机互联网IP提供给QTGate系统，如果您不愿意，请选择【@QTGate】技术来使用QTGate服务！',
            sendConnectRequestMail: ['您的QTGate客户端没有和QTgate系统联机，客户端已向QTgate系统重新发出联机请求Email。和QTgate系统联机需要额外的时间，请耐心等待。',
                                     '当免费用户连续24小时内没有使用客户端，您的连接会被中断。付费用户情况下QTgate系统可保持持续联机一个月。'],
            cacheDatePlaceDate: [{ name:'1小时', id: 1 }, { name:'12小时', id: 12 },{ name:'1日', id: 24 }, { name:'15日', id: 360 }, { name:'1月', id: 720 }, { name:'6月', id: 4320 }, { name:'永远', id: -1 }],
            atQTGateDetail: ['世界首创的QTGate无IP互联网通讯技术，全程使用强加密Email通讯，客户端和代理服务器彼此不用知道IP地址，具有超强隐身和保护隐私功能，强抗干扰和超強防火墙穿透能力。缺点是有延迟，网络通讯响应受您所使用的email服务供应商的服务器影响，不适合游戏视频会话等通讯。',
                            'QTGate独创普通HTTP混淆流量加密通讯技术，能够隐藏变换您的IP地址高速通讯，隐身和保护隐私，抗干扰和超強防火墙穿透能力。缺点是需要使用您的IP来直接连结代理服务器。如果您只是需要自由访问互联网，则推荐使用本技术。',
                            '域名解释使用QTGate代理服务器端，可以防止域名服务器缓存污染，本选项不可修改。','互联网数据全程使用QTGate代理，可以匿名上网隐藏您的互联网形踪。','只有当您的本地网络不能够到达您希望访问的目标时，才使用QTGate代理服务器代为连结目标主机，本选项可以节省您的QTGate流量。',
                            '通过本地缓存浏览纪录，当您再次访问目标服务器时可以增加访问速度，减少网络流量，缓存浏览纪录只针对非加密技术的HTTP浏览有效。QTGate使用强加密技术缓存浏览纪录，确保您的隐私不被泄漏。','不保存缓存信息。',
                            '设置缓存有效时间，您可以及时更新服务器数据,单位为小时。','本地Proxy服务器，其他手机电脑和IPad等可通过连结此端口来使用QTGate服务。请设定为3001至65535之间的数字。',
                            '通过设置PATH链接路径可以简单给您的Proxy服务器增加安全性，拒绝没有提供PATH的访问者使用您的Proxy服务器。']
            
        },

        useInfoMacOS: {
            title:'您的其他电子设备，可通过设置本地Proxy服务器，来使用QTGate连接互联网',
            title1:'MacOS 本地代理服务器设定',
            proxyServerIp:'本地代理服务器地址：',
            proxyServerPort: '本地代理服务器端口：',
            proxyServerPassword: '本地代理服务器登陆用户名和密码：无需设定',
            info:[{
                title:'打开控制面板，点击网络',
                titleImage:'/images/macOsControl.jpg',
                detail: '',
                image: '/images/userInfoMacos1.jpg'
            },{
                title:'选择网络【高级...】',
                titleImage:'',
                detail:'',
                image: '/images/macosUserInfo2.jpg'
            },{
                title:'代理设定',
                titleImage:'',
                detail:'<p>1.选勾左边 Web代理(HTTP)，并在右边Web代理服务器按图示的蓝色数字填入。</p><p>2.选勾左边 安全Web代理(HTTPS)，并在右边安全Web代理服务器，按图示的蓝色数字填入，完成按【好】结束设定。</p>',
                image: '/images/macosUserInfo3.jpg'
            }]
        },
        useInfoAndroid: {
            title1:'安卓设备本地代理服务器设定',
            info:[{
                title:'打开控制面板选择WiFi',
                titleImage:'/images/androidSetup.jpg',
                detail: '',
                image: '/images/android1.jpg'
            },{
                title:'长按当前WiFi连接名称等待菜单出现，选择菜单的修改设定',
                titleImage:'',
                detail:'',
                image: '/images/android2.jpg'
            },{
                title:'打开显示高级选项，在代理服务器设定(Proxy)中选择手动设置',
                titleImage:'',
                detail:'',
                image: '/images/android3.jpg'
            },{
                title:'按下列画面中蓝色的数字填入代理服务器名称和端口号，关闭窗口以完成设置',
                titleImage:'',
                detail:'',
                image: '/images/android4.jpg'
            }]
        },
        firefoxUseInfo:{
            title1:'火狐浏览器它单独设定代理服务，可以不影响系统而轻松使用代理上网',
            info:[{
                title:'打开火狐，点击右上角工具图标，选择设定',
                titleImage:'/images/macOsControl.jpg',
                detail: '<p><a href="https://www.mozilla.org/zh-CN/firefox/#/" target="_blank">下载Firefox</a></p>',
                image: '/images/firefox1.jpg'
            },{
                title:'选择常规后，滚动画面至最下部，在网络代理处点击详细设定',
                titleImage:'',
                detail:'',
                image: '/images/firefox2.jpg'
            },{
                title:'选择手动设置代理服务器，按图示蓝色数字填入HTTP代理服务器名称和端口号，选勾本设定适用所有协议，点击好完成设置',
                titleImage:'',
                detail:'',
                image: '/images/firefox3.jpg'
            }]
        },
        useInfoiOS: {
            title1:'iOS设备本地代理服务器设定',
            info:[{
                title:'打开控制面板，点击Wi-Fi',
                titleImage:'/images/macOsControl.jpg',
                detail: '',
                image: '/images/iOS1.jpg'
            },{
                title:'选择当前WiFi的圈i符号',
                titleImage:'',
                detail:'',
                image: '/images/iOS2.jpg'
            },{
                title:'选择底部的设置代理服务器',
                titleImage:'',
                detail:'',
                image: '/images/iOS3.jpg'
            },{
                title:'选择手动设置，在代理服务器名称和端口号处填入对应的蓝色数字，按保存完成设置',
                titleImage:'',
                detail:'',
                image: '/images/iOS4.jpg'
            }]
        },
        useInfoWindows: {
            title1:'Windows 10 代理服务器设定',
            info:[{
                title:'关于Windows其他版本设定',
                titleImage:'',
                detail: '<p>Windows其他版本的代理服务器设定请参照<a href="#" onclick="return linkClick (`https://support.microsoft.com/ja-jp/help/135982/how-to-configure-internet-explorer-to-use-a-proxy-server`)">微软公司网站</a></p><p>请按以下参数设置本地代理服务器：</p>',
                image: ''
            },
                {
                title:'启动Internet Explorer',
                titleImage:'/images/IE10_icon.png',
                detail: '<p>点击右上角工具图标，滑动菜单至最下部选择【设定】</p>',
                image: '/images/windowsUseInfo1.jpg'
            },{
                title:'滑动菜单至最下部选择高级设定',
                titleImage:'',
                detail:'',
                image: '/images/windowsUseInfo2.jpg'
            },{
                title:'再次滑动菜单选择打开代理服务器设定',
                titleImage:'',
                detail:'',
                image: '/images/windowsUseInfo3.jpg'
            },{
                title:'选择手动设置代理服务器，按图示蓝色数字填入代理服务器地址及代理服务器端口号，然后点击保存完成设定。',
                titleImage:'',
                detail:'',
                image: '/images/windowsUseInfo4.jpg'
            }]
        },

        QTGateGateway: {
            title: 'QTGate服务使用详细',
            processing: '正在尝试连接QTGate代理服务器...',
            error: ['错误：您的账号下已经有一个正在使用QTGate代理服务器的连接，请先把它断开后再尝试连接。',
                    '错误：您的账号已经无可使用流量，如果您需要继续使用QTGate代理服务器，请升级您的账户类型。如果是免费用户已经使用当天100M流量，请等待到明天继续使用，如您是免费用户已经用完当月1G流量，请等待到下月继续使用。',
                    '错误：数据错误，请退出并重新启动QTGate！'],
            connected:'已连接。',
            userType:['免费用户','付费用户'],
            datatransferToday:'每日可使用流量限额：',
            datatransferMonth:'每月可使用流量限额：',
            todaysDatatransfer: '本日可使用流量',
            monthDatatransfer: '本月可使用流量',
            gatewayInfo: ['代理服务器IP地址：','代理服务器连接端口：'],
            userInfoButton: '使用指南',
            stopGatewayButton:'切断连接',
            disconnecting: '正在切断中'
        },

        topWindow: {
            title: '庆祝加拿大150周年特别提供'
        },

        feedBack: {
            title: '使用信息反馈',
            additional: '添附附加信息',
            okTitle:'发送至QTGate'
        },


        qtGateView: {
            title: 'QTGate连接',
            mainImapAccount: 'QTGate通讯用邮箱',
            QTGateConnectStatus: 'QTGate连接状态',
            QTGateSignButton: '',
            QTGateConnectError: ['给QTGate发送连接请求Email出现发送错误，请检查IMAP邮件帐户的SMTP设定！'],
            QTGateConnectResult: ['QTGate未联机，请点击连接QTGate！', '正在和QTGate联机中', '已经连接QTGate', '连接QTGate时发生错误，请修改IMAP账号设定','已经连接QTGate'],
            QTGateSign: ['您的密钥状态','还未获得QTGate信任签署,点击完成信任签署',
                '密钥获得QTGate信任签署是QTGate一个重要步骤，您今后在QTGate用户之间分享文件或传送秘密信息时，QTGate可以证明是您本人而非其他冒充者。你也可以通过您的密钥签署信任给其他QTGate用户，用以区别您自己的信任用户和非信任用户。',
                '正在获得QTGate信任签署中','系统错误，请重启QTGate后再试，如果仍然存在，请尝试重新安装QTGate。','QTGate系统错误!']
        
        }
	},{
        QTGateInfo: {
            title:'QTGate機能紹介',
            version:'本機QTGateバージョン：v',
            detail:[{
                color: '#a333c8',
                icon: 'exchange',
                header: '自由匿名なインターネットへ',
                detail: '@OPNは本社の世界初のIP不要な通信技術です、<a onclick="return linkClick (`https://ja.wikipedia.org/wiki/Advanced_Encryption_Standard`)" href="#" target="_blank">AES256-GCM</a>と<a onclick="return linkClick (`https://ja.wikipedia.org/wiki/Pretty_Good_Privacy`)" href="#" target="_blank">OpenPGP</a>暗号化したEmailメッセージを通じたゲットウェイに接続します、iOPNは本社の独自のHTTPゲットウェイ暗号化高速通信技術です。どちらとも身を隠して誰も知らないうちにインターネットへ、プライバシー、ネットワーク監視とアクセスを制限・遮断にうまくすり抜けることができます。'
            },
            {
                color: 'darkcyan',
                icon: 'spy',
                header: 'スパイソフトウェア送信を切断（次のバージョンにご提供予定）',
                detail: 'QTGateシステムはグロバルDNSBLに加入し、スパイホストダータベースを更新しています。QTGateユーザはQTGateシステムをご利用してインターネットへアクセスした場合、あなたのデバイスに闇活動しているスパイソフト、収集したあなたの個人データの送信を切断することができます。'
            },{
                color: '#6435c9',
                icon: 'external share',
                header:'ローカルVPNサーバ（次のバージョンにご提供予定）',
                detail:'QTGateユーザは自宅のマシンにVPN接続により、外にいても楽々OPNで隠れたネットワークへご利用できます。'
            },{
                color: '#6435c9',
                icon: 'cloud upload',
                header:'ファイルを匿名プライバシーストレージとシェア（次のバージョンにご提供予定）',
                detail:'一つのファイルを暗号化してからスプリットし、多数のフリーメールアカンウトに保存します。無限かつ秘密プライバシーのファイルストレージ事ができます。QTGateユーザー間のファイルシェアも可能です。'
            },{
                color: '#e03997',
                icon: 'talk outline',
                header: 'IP不要な匿名プライバシーインスタントメッセージ（次のバージョンにご提供予定）',
                detail:'QTGateユーザー間の無IPペアーツーペアープライバシーインスタントメッセージです。それは伝統的なインスタントメッセージより匿名とプライバシーが可能です。又グループをして複数なユーザーの間でのインスタントメッセージもご利用いただけます。文字をはじめ、写真やビデオ映像、あらゆるファイルの暗号化転送も可能です。'
            }]
        },
        useInfoWindows: {
            title1:'Windows10ロカールプロキシ設定',
            info:[{
                title:' その他Windowsバージョンの設定について',
                titleImage:'',
                detail: '<p>Windowsその他バージョンの設定は<a target="_blank" href="#" onclick="return linkClick (`https://support.microsoft.com/ja-jp/help/135982/how-to-configure-internet-explorer-to-use-a-proxy-server`)">Microsoft社のページ</a>をご参照してください。</p><p>設定する際使うデータは以下です：</p>',
                image: ''
            },
                {
                title:'Internet Explorerを開く',
                titleImage:'/images/IE10_icon.png',
                detail: '<p>右上部のツールボタンをクリックして、メニューの一番下にある設定を選択してください。</p>',
                image: '/images/windowsUseInfo1.jpg'
            },{
                title:'メニューを一番下にスクロールして高級設定をクリック',
                titleImage:'',
                detail:'',
                image: '/images/windowsUseInfo2.jpg'
            },{
                title:'再びメニューを下にスクロールして、オプンプロキシ設定をクリック',
                titleImage:'',
                detail:'',
                image: '/images/windowsUseInfo3.jpg'
            },{
                title:'手動プロキシをオンにして、アドレスとポート番号は図の提示した、ブルー色番号と同じ物入れてください。保存をクリックと設定を完了します。',
                titleImage:'',
                detail:'',
                image: '/images/windowsUseInfo4.jpg'
            }]
        },
        useInfoMacOS: {
            title:'他のデバイスはローカルプロキシに設定による、QTGate利用してインターネットへアクセスができます。',
            title1:'MacOS プロキシ設定',
            proxyServerIp:'プロキシサーバアドレス：',
            proxyServerPort: 'サーバポート：',
            proxyServerPassword: '登録ユーザ名とパスワード：なし',
            info:[{
                title:'コントロールパネルを開いて、ネットワークをクリックしてください。',
                titleImage:'/images/macOsControl.jpg',
                detail:'',
                image: '/images/userInfoMacos1.jpg'
            },{
                title:'詳細...をクリックしてください ',
                titleImage:'',
                detail:'',
                image: '/images/macosUserInfo2.jpg'
            },{
                title:'プロキシ設定をします',
                titleImage:'',
                detail:'<p>1）Webプロキシ(HTTP)をチェックして、Webプロキシサーバに図に書いているブルー色番号を入力してください。</p><p>2）Webプロキシ(HTTPS)をチェックして、Webプロキシサーバに同じく図に書いているブルー色番号を入力してください、完成したらOKボタンを押して完了です。</p>',
                image: '/images/macosUserInfo3.jpg'
            }]
        },
        firefoxUseInfo:{
            title1:'Firefoxブラウザーは単独プロキシ設定で、システムに影響なしでプロキシをご利用してインタネットアクセスができます。',
            info:[{
                title:'Firefoxをオプンしてツールアイコンをクリックして、設置を選んでください。',
                titleImage:'/images/macOsControl.jpg',
                detail: '<p><a href="https://www.mozilla.org/ja/firefox/#" target="_blank">Firefoxダウンロード</a></p>',
                image: '/images/firefox1.jpg'
            },{
                title:'一番下にスクロールしてプロキシネットワークに、詳細設定を選択します',
                titleImage:'',
                detail:'',
                image: '/images/firefox2.jpg'
            },{
                title:'手動で設定を選んで、HTTPプロキシサーバ名とポート番号を図の様同じく入力して、オールポロトコルをチェックしてOKを押して設定を完了します。',
                titleImage:'',
                detail:'',
                image: '/images/firefox3.jpg'
            }]
        },
        useInfoAndroid: {
            title1:'Androidロカールプロキシ設定',
            info:[{
                title:`端末の設定アプリを開きます。[Wi-Fi]をタップします`,
                titleImage:'/images/androidSetup.jpg',
                detail: '',
                image: '/images/android1.jpg'
            },{
                title:'Wi-Fiネットワーク名を押し続けます。[ネットワークを変更]をタップします',
                titleImage:'',
                detail:'',
                image: '/images/android2.jpg'
            },{
                title:'[詳細設定項目]の横にある下矢印をタップして、手動で設定を選択します',
                titleImage:'',
                detail:'',
                image: '/images/android3.jpg'
            },{
                title:'プロキシホスト名とポート番号は図のブルー色数字と同じように入力してください',
                titleImage:'',
                detail:'',
                image: '/images/android4.jpg'
            }]
        },
        useInfoiOS: {
            title1:'iOSロカールプロキシ設定',
            info:[{
                title:'コントロールパネルを開いて、WiFiをタップしてください',
                titleImage:'/images/macOsControl.jpg',
                detail: '',
                image: '/images/iOS1.jpg'
            },{
                title:'Wi-Fiネットワーク名の右にあるまるiアイコンをタップしてください',
                titleImage:'',
                detail:'',
                image: '/images/iOS2.jpg'
            },{
                title:'一番下のプロキシ設定をタップしてください',
                titleImage:'',
                detail:'',
                image: '/images/iOS3.jpg'
            },{
                title:'手動で設定を選択し、プロキシサーバ名とポート番号に図のブルー色数字と同じように入力して、保存して設置を完了します。',
                titleImage:'',
                detail:'',
                image: '/images/iOS4.jpg'
            }]
        },

        cover: {
            firstTitle1: 'これからあなたのデバイスを',
            firstTitle2: '隠れて安全自由なネットワークへ',
            start: 'オプンドア'
        },

        firstNote:  {
            title: 'QTGateの製品およびサービス（以下「本サービス」）をご利用いただきありがとうございます。本サービスはカナダQTGateシステムズ株式会社が提供しています。',
            firstPart: 'ユーザーは、本サービスを利用することにより、本規約に同意することになります。以下を注意してお読みください。',
            detail:[
                {
                    header: '本サービスのご利用について',
                    detail: '本サービス内で入手できるすべてのポリシーを遵守してください。本サービスを不正に利用しないでください。たとえば、本サービスの妨害や、QTGateが提供するインターフェースおよび手順以外の方法による、本サービスへのアクセスを試みてはなりません。'
                },{
                    header: null,
                    detail: 'ユーザーは、法律（輸出、再輸出に関して適用される法規制を含みます）で認められている場合に限り、本サービスを利用することができます。ユーザーがQTGateの規約やポリシーを遵守しない場合、またはQTGateが不正行為と疑う行為について調査を行う場合に、QTGateはユーザーに対する本サービスの提供を一時停止または停止することができます。'
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
                    detail: 'お客様がQTGateサービスをご利用になる際に、お客様のデータ通信料計算のために、ご利用データ量が自動的に収集および保存されます。限られたログは以下のようです。日付、お客様アカウント、データ量、アップ又はダウンロード。例：'
                },{
                    header: null,
                    detail: '<p class="tag info">06/20/2017 18:12:16, info@qtgate.com, 300322 byte up, 482776323 byte down.</p><p class="tag info">06/21/2017 12:04:18, info@qtgate.com, 1435226 byte up, 11782238 byte down.</p>'
                }, {
                    header: null,
                    detail: 'QTGateは以上の情報以外には保存することしません。QTGateは以上の情報をカナダーの裁判所命令を持つカナダの法執行機関に協力することがありえます。カナダ以外のこのログ情報を協力する要請のあなたは、まずカナダ外務省までお問い合わせ下さい：'
                },{
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
                    detail:　'あなたはカナダー法律によってサービス禁止対象者ではありませんと確認していた事。'
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

        linuxUpdate:{
            newVersionDownload: 'クリックしてダウンロードとインストール',
            step1:'ダウンロードニューバージョン',
            step2: 'QTGateを実行ファイルに許可与える。',
            step2J1:'/images/linuxUpdate1_jp.jpg',
            step2J2:'/images/linuxUpdate2_jp.jpg',
            step2_detail1: '右クリックダウンロードしたQTGateファイル、プロパティを選んでください。',
            step2_detail2: 'アクセス権にポログラムとして実行可能をチェック',
            step3:'旧バージョンQTGateを退出して、新しいQTGateバージョンをダブクリックしてインストールをします。',
            exit: '旧QTGateを退出'
        },

        topWindow: {
            title: 'カナダ１５０周年特別提供'
        },

        imapInformation: {
            title: '通信専用Emailアカーンドを登録',
            infomation:'QTGate通信専用emailアカンウトを設定します。このemailアカウントはあなたとQTGateお互い情報交換するのために、ユーザ名とパスワードをQTGateシステムへ提供します。個人情報漏洩の恐れ、一時的なemailアカウントを新たにつくてください。<span style="color: red;">QTGate技術は只今APPLEメール、マイクロソフトOutlookとYahooしか対応しておりません、APPLEメールサービスを使うお勧めです。</span>メールアカウントのパスワードについて、<a href="https://support.google.com/accounts/answer/185833?hl=ja" target="_blank" onclick="return linkClick (`https://support.google.com/accounts/answer/185833?hl=ja`)">アプリパスワード</a>の利用をお勧めです',
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
            agree:'私はそのリスクが了承して続きする',
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
            imapCheckingStep: ['emailサーバへ接続しています。','emailサーバへIMAP接続しました','emailサーバへSMTP接続しました'],
            imapResultTitle:'IMAPサーバQTGate評価：',
            testSuccess: 'emailサーバのテストが完了しました',
            exitEdit: '退出編集Emailアカンウト',
            deleteImap: 'IMAPアカウトを削除',
            proxyPortError: 'ポート番号は1000から65535までの数字です。又はこのポート番号は他のアプリが使っています。他の番号にチェンジしてください。'
        },

        Home_keyPairInfo_view: {
            newVersionDownload: 'クリックしてダウンロードとインストール',
            title: '鍵ペアインフォメーション',
            emailNotVerifi: '鍵ペアはまだQTGateサインされていません。',
            emailVerified: '鍵ペアはQTGateサインされました。',
            NickName: 'ニックネーム：',
            creatDate:'暗号鍵ペア作成日：',
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
            localIpAddress: 'ローカル',
            clickInstall:'インストール',
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
            inputEmail: 'お疲れ様です、最後の設定をしましょう。このRSA暗号鍵ペアは本システムに重要な存在です、ユーザーのQTGateへ身元証明、本システムデータを秘密化、QTGateシステムとデータ通信時この暗号鍵ペアを使います。パースワードはQTGateへ保存しませんですから、大事にメモしてください。<em style="color:red;">QTGateはネットワークの制限があるアリアにブラックリスト入っております、そのアリアにあるemailアカウントを使うのは遠慮してください。</em>',
            accountEmailInfo:'QTGateドメイン名は、ファイヤウォールがある場合はブラックリストに入っている可能性がありますから、QTGateシステムへ登録完了することができません。その場合はファイヤウォール外側のEmailシステムを利用してください。'
        },

        error_message: {
            title: 'エラー',
            errorNotifyTitle: 'システムエラー',
            EmailAddress: ['メール アドレスを someone@example.com の形式で入力してください。', '同じEmailアカンウトが既に存在します。','入力したメールはQTGateシステム非対応です。QTGateは只今APPLEメール、マイクロソフトOutlookとYahooしか対応しておりません'],
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
            imapErrorMessage: ['','データフーマットエラー！', 'インターネット接続されていないらしいですが、ネットワークをチェックしてもう一度お試しください！','emailサーバはIMAPユーザー名又はパスワードに間違いがあると提示しました！', 
                '指定したPORTでemailサーバへIMAPの接続ができませんでした、PORT番号をチェックしてください、ファイヤウォールの中にいる場合、指定したPORTはファイアウォールにフィルタした可能性があ裏ます、IMAPサーバーのその他有効PORT番号にチェッジしてください。<a href="https://tw.help.yahoo.com/kb/SLN15241.html" target="_blank" onclick="return linkClick (`https://tw.help.yahoo.com/kb/SLN15241.html`)">应用密码</a>',
                'IMAPサーバのセキュリティ証明書信頼できません。詐欺や、お使いのコンピューターからサーバーに送信されると情報を盗み取る意図が示唆されている場合があります。',
                'emailサーバドメインは有効ではありません、emailサーバの設定を修正してください。','このemailサーバはQTGate通信技術サポートしていません、他のemailプロバイダにチェンジをしてください。',
                'emailサーバはSMTPユーザー名又はパスワードに間違いがあると提示しました！','SMTPサーバのセキュリティ証明書信頼できません。詐欺や、お使いのコンピューターからサーバーに送信されると情報を盗み取る意図が示唆されている場合があります。',
                'SMTPサーバへ接続ができません。','同じEmailアカンウトが既に存在します。']
        },

        emailConform: {
            activeViewTitle:'鍵ペア検証',
            info1_1:`鍵ペア検証は未完成です。QTGateは宛先 「`,
            info1_2: `」 に検証メールをしました。メールボックスをチェックしてください。QTGateから多数メールの場合は、最後のを選んでください。`,
            info2: 'コピーするのは「-----BEGIN PGP MESSAGE-----」から「-----END PGP MESSAGE-----」まで全ての内容をしてください。',
            emailTitle: 'QTGateをご利用頂いて誠に有難うございます',
            emailDetail1: '',
            emailDetail1_1: ' 様',
            emailDetail2: 'あなたのQTGateアカンウト検証暗号です。以下の全ての内容をコピーして、認証フィルターにペーストをしてください。',
            bottom1_1: '以上',
            bottom1_2: 'QTGateチームより',
            conformButtom: '検 証',
            formatError: ['フォーマットエラー、コピーするのは「-----BEGIN PGP MESSAGE-----」から「-----END PGP MESSAGE-----」まで全ての内容をしてください。',
                'この内容で暗号化解除ができませんでした。鍵ペアEmailアカンウトメールボックス再検査し、QTGateから最後のを選んでください。または鍵ペアを削除して、鍵ペア再発行してください。',
                'QTGateに接続していません、QTGateを退出してもう一回起動してください。','検証できません！QTGate新たな検証をQTGateアカンウトメールボックスに届きますので、再検証をください。',
                'あなたのQTGateは問題があります、鍵ペアを削除して一から再セットアップしてください。','QTGateシステムは故障があります、後からもう一度試しにしてください',
                'あなたの今日データ通信はリミットになっていますので、明日まで待ってください。またはユーザー種類をアップグレードをしてください',
                '通信用IMAPの設定にエラーがあるか又はそのタープのIMAPアカンウトがQTGateサポートしません。よくチェックしてもう一回試しにしてください。',
                '選択していたゲットウェーエリアは只今接続不能になっております、後ほどもう一度試しにしてください。'],
            activeing: '通信中'
        },

        QTGateRegion: {
            title: 'QTGateゲットウェイエリア',
            available: 'サービス中',
            unavailable: '準備しています',
            proxyDomain:'ドメイン検索はQTGateゲットウェイ側に依頼します。',
            setupCardTitle: '接続技術:',
            dataTransfer: '通信データは：',
            dataTransfer_datail: ['全てのデータをOPN経由','ターゲットサーバ到達不能時だけ'],
            proxyDataCache: 'Webキャッシュ:',
            proxyDataCache_detail: ['Yes','No'],
            clearCache: 'クリアオールキャッシュ',
            cacheDatePlaceholder: 'Webキャッシュ有効期限',
            localPort: 'ローカルプロキシポート番号:',
            localPath: 'ローカルプロキシポートPATHを指定します。',
            outDoormode: '接受外網訪問',
            QTGateRegionERROR:['QTGateへ接続要請メールの送信ができなかったです。IMAPアカウントの設定を調べてください。',
            ''],
            sendConnectRequestMail: ['QTGateクライアントはQTGateシステムとの接続が切れた。再接続要請メールをQTGateシステムへ送信しました、接続を完了するまで時間がかかるのためしばらくお待ちおください。',
                                    'フリーユーザアカンウトには24時間以内、QTGateをご利用していなっかたの場合、QTGateシステムは接続を切る事にします。QTGateシステムは有料ユーザーにはが一ヶ月長時間接続できます。'],
            GlobalIp: 'グロバールIP:',
            GlobalIpInfo:'要注意：【QTGate接続】をおすとあなたのグロバールIPアドレスをQTGateシステムに送信しますので、それを遠慮すれば【@QTGate】接続を選んでください。',
            cacheDatePlaceDate: [{ name:'1時間', id: 1 }, { name:'12時間', id: 12 },{ name:'一日', id: 24 }, { name:'15日', id: 360 }, { name:'1月', id: 720 }, { name:'6月', id: 4320 }, { name:'永遠', id: -1 }],
            connectQTGate:'QTGateゲットウェーエリアインフォメーションを取得しています...',
            atQTGateDetail: ['QTGateの世界初のIP不要な通信技術です。暗号化したEmailメッセージを通じたゲットウェイに接続することで、身を隠して誰も知らないうちにインターネットへ、プライバシーと強くファイヤウォールをうまくすり抜けることができます。但しお使いメールサーバの性能に次第スピードが遅くなり、長い遅延など短所があります、ゲームやビデオチャットなどに通信障害出る可能性があります。',
                            'QTGateオリジナル技術のトラフィックをHTTPに偽装した暗号化通信技術です。あなたのIPを使ってゲットウェイに直接接続することで、高速通信とプライバシー、強くファイヤウォールをうまくすり抜けることができます。インターネット自由アクセスのためにQTGateを使うことになら、これをおすすめです。',
                            'ドメイン検索をQTGateゲットウェイ側にすることで DNS cache pollution を防ぐことができます。この選択は必要です。','全てインターネットデータをQTGateゲットウェイに通じてすることで、匿名でインターネットアクセスします。',
                            'ローカルネットワークが目標サーバに到達不能な際に、QTGateゲットウェイ通じてします。このことでQTGateデータ通信量節約することができます。','アクセスしたWebサイトを一時ファイルに保持することで、高速レスポンスが利用可能となります、QTGateはいつも暗号化したデータを本機に保存します。但し暗号化通信には不対応です。',
                            'キャッシュ有効期限の設定によって、いつもサーバ側の最新情報を入手することができます。単位は時間です。','ローカルプロキシサーバーが他のデバイスをこのポートに接続によってQTGateデータの通信を利用可能です。3001から65535の間の数字を入れてください。',
                            'ローカルポロックPATHを指定することで、あなたのローカルポロックサーバを簡単セキュリティを与えられます。無断使用を禁止することができます。']
        },

        QTGateGateway: {
            title: 'QTGateサービス使用詳細',
            processing: 'QTGateゲットウェイへ接続中...',
            error: ['エラー：あなたのアカンウトに既にQTGateゲットウェイに接続しているクライアントがありますが、その接続を退出してからもう一度接続してください。',
                    'エラー：あなたのアカンウトにQTGateゲットウェイデータ通信制限になっております。もし引き続きご利用を頂きたいなら、アカンウトをアップグレードにしてください。フリーアカウントの場合は毎日100M、毎月1GBの通信制限があります。',
                    'エラー：データフォーマットエラー、QTGateをリスタートしてください。'],
            connected:'接続しました。',
            userType: ['無料ユーザー','月契約ユーザー'],
            datatransferToday:'毎日使える通信量：',
            datatransferMonth:'毎月使える通信量：',
            todaysDatatransfer: '今日使える量',
            monthDatatransfer: '今月使える量',
            gatewayInfo: ['ゲットウェイIPアドレス：','ゲットウェイ接続ポート番号：'],
            userInfoButton: '使用ガイド',
            stopGatewayButton:'ゲットウェイ接続を切る',
            disconnecting: '接続を切っています'
        },
        
        qtGateView: {
            title: 'QTGates接続',
            mainImapAccount: 'QTGateへ情報交換用Emailアカンウト',
            QTGateConnectError: ['QTG'],
            QTGateConnectStatus: 'QTGate接続状態',
            QTGateConnectResult: ['未接続、クリックと接続します。', 'QTGateへ接続中.', 'QTGateに接続しました。', 'QTGateへ接続にエラーが発生しました。IMAP設定を立ち直すしてください。',
                'QTGateに接続しました。'],
            QTGateSign: ['あなたの鍵ペア状態','QTGateに信頼サインがないです','QTGateに信頼サインを取得したことで、QTGateシステムにユーザーの間にファイル又はインフォーメーションなど秘密情報を交換する際、あなたの身元証明となります。本人以外のを区別することができます。あなたも持っている鍵ペアで他のQTGateユーサーに信頼サインすることで、あるQTGateユーサーを信頼関係確定することができます。',
                'QTGateに信頼サインを取得しています','QTGateシステムエラー、QTGateを再起動してからもう一度してみてください。もし直れないならQTGateを一から再インストールしてください。','QTGateシステムエラー']
        },

        feedBack: {
            title: 'フィードバック',
            additional: '追加情報を添付する',
            okTitle:'QTGateへ送信'
        },

	},{
        QTGateInfo: {
            title:'QTGate Features',
            version:'Installed QTGate veriosn：v',
            detail:[{
                color: '#a333c8',
                icon: 'exchange',
                header: 'Security anonymous free internet access',
                detail: `The @OPN is world's first no IP Internet communication technology, client and proxy server do not know each other IP address. The iOPN is QTGate original technogy that disguise the traffic looks like normal HTTP protocol,. Both doing hide your IP address high-speed communication, stealth and protection of privacy via encrypt with <a onclick="return linkClick ('https://en.wikipedia.org/wiki/Advanced_Encryption_Standard')" href="#" target="_blank">AES256-GCM</a> and <a onclick="return linkClick ('https://en.wikipedia.org/wiki/Pretty_Good_Privacy')" href="#" target="_blank">OpenPGP</a>, strong anti-interference, firewall transparency.`
            },
            {
                color: 'darkcyan',
                icon: 'spy',
                header: 'Spy softwear ( Next version. )',
                detail: 'The QTGate system subscribe the global DNSBL database. QTGate user may stop spy softwear send your information to spy host when user doing internet via a QTGate client soft. Even you do need know the spy softwear running in background at device.'
            },{
                color: '#6435c9',
                icon: 'external share',
                header:'Local VPN server. ( Next version. )',
                detail:'QTGate user may keep use OPN security network at out door via VPN connect to home network.'
            },{
                color: '#6435c9',
                icon: 'cloud upload',
                header: 'Anonymous file cloud security storage and share ( Next version. )',
                detail: 'QTGate user crypto a file and split to multiple parts, append to different free email account. Unlimited file cloud stroge. QTGate user can share the file secret files between QTGate users via QTGate system.'
            },{
                color: '#e03997',
                icon: 'talk outline',
                header:'No IP address peer to peer security anonymous Instant messaging ( Next version. )',
                detail:'QTGate provide Instant messaging service via email system. It is peer to peer, no need IP address, security transfer message, pictures, video and any kind files, also support group chart with multiple users.'
            }]
        },
        firefoxUseInfo:{
            title1:'Firefox browser it set up a separate proxy service, you can easy to use proxy access Internet without touch system setup.',
            info:[{
                title:'Click Firefox tool icon. Select Preferences.',
                titleImage:'/images/macOsControl.jpg',
                detail: '<p><a href="https://www.mozilla.org/en-US/firefox/#" target="_blank">Download Firefox.</a></p>',
                image: '/images/firefox1.jpg'
            },{
                title:'Click General, scroll to buttom, click the settings... at Net Working.',
                titleImage:'',
                detail:'',
                image: '/images/firefox2.jpg'
            },{
                title:'Chooess Manual proxy configuration, fill HTTP proxy and Port same as the blue in the picture. Check Use this proxy server for all protocols. Click OK to finish setup.',
                titleImage:'',
                detail:'',
                image: '/images/firefox3.jpg'
            }]
        },
        cover: {
            firstTitle1: 'Protect Your Personal Privacy Online',
            firstTitle2: 'Achieve a Secure and Open Internet Experience',
            start: 'TRY NOW'
        },
        useInfoiOS: {
            title1:'iOS device local proxy setup.',
            info:[{
                title:'Open the control panel. Type the WiFi.',
                titleImage:'/images/macOsControl.jpg',
                detail: '',
                image: '/images/iOS1.jpg'
            },{
                title:'Type the icon of the Wifi name right side that is connect now.',
                titleImage:'',
                detail:'',
                image: '/images/iOS2.jpg'
            },{
                title:'Type Proxy ',
                titleImage:'',
                detail:'',
                image: '/images/iOS3.jpg'
            },{
                title:'Check Manual then fill Proxy host name and port number follow the blue number that in the picture. type Save to finish setup.',
                titleImage:'',
                detail:'',
                image: '/images/iOS4.jpg'
            }]
        },
        useInfoAndroid: {
            title1:'Android device local proxy setup.',
            info:[{
                title:`Open your device’s Settings app. Tap Network & Internet and then Wi-Fi.`,
                titleImage:'/images/androidSetup.jpg',
                detail: '',
                image: '/images/android1.jpg'
            },{
                title:'Touch and hold the Wi-Fi network name until a popup menu come. Then tap Modify network from the menu',
                titleImage:'',
                detail:'',
                image: '/images/android2.jpg'
            },{
                title:'Tap the Down arrow at Advanced options. Pick the Manual.',
                titleImage:'',
                detail:'',
                image: '/images/android3.jpg'
            },{
                title:'Enter the proxy server details follow the blue text in picture.',
                titleImage:'',
                detail:'',
                image: '/images/android4.jpg'
            }]
        },
        useInfoWindows: {
            title1:'Windows 10 proxy setup',
            info:[{
                title:'About all other Windows version.',
                titleImage:'',
                detail: '<p>All other Windows version proxy setup please visit <a href="#" target="_blank" onclick="return linkClick (`https://support.microsoft.com/en-us/help/135982/how-to-configure-internet-explorer-to-use-a-proxy-server`)">Microsoftweb side.</a></p><p>This is the data for setup proxy server:</p>',
                image: ''
            },{
                title:'Open Internet Explorer',
                titleImage:'/images/IE10_icon.png',
                detail: '<p>Click the tool icon at the top of right, scroll menu down to bottom select Settings.</p>',
                image: '/images/windowsUseInfo1.jpg'
            },{
                title:'Scroll menu to bottom and click View advanced settings.',
                titleImage:'',
                detail:'',
                image: '/images/windowsUseInfo2.jpg'
            },{
                title:'Scroll menu again click Open proxy settings.',
                titleImage:'',
                detail:'',
                image: '/images/windowsUseInfo3.jpg'
            },{
                title:'Open Use a proxy server, fill Address and Port that same as blue number in the picture. Then cliek save to finish.',
                titleImage:'',
                detail:'',
                image: '/images/windowsUseInfo4.jpg'
            }]
        },
        useInfoMacOS: {
            proxyServerIp:'Proxy server address:',
            proxyServerPort: 'Server port:',
            proxyServerPassword: 'Proxy server login username and password: none',
            title:'All other devices can doing internet via local proxy setup use the QTGate system.',
            title1:'MacOS proxy setup',
            info:[{
                title:'Open the control panel, click the network.',
                titleImage:'/images/macOsControl.jpg',
                detail:'',
                image: '/images/userInfoMacos1.jpg'
            },{
                title:'click The Advanced... ',
                titleImage:'',
                detail:'',
                image: '/images/macosUserInfo2.jpg'
            },{
                title:'Setup Proxies.',
                titleImage:'',
                detail:'<p>1. Check the Web Proxy(HTTP) on the lift side, then fill the number to the Web Proxy Server on right side with the blue number in image.</p><p>2. Check the Secure Web Proxy (HTTPS) on the lift side, then fill the same number to the Secure Web Proxy Server on right side with the the blue number in image. And click OK to finish.</p>',
                image: '/images/macosUserInfo3.jpg'
            }]
        },

        topWindow: {
            title: '150th anniversary of Canada'
        },

        firstNote:  {
            title:　'Thanks for using GTGate products and services (“Services”). The Services are provided by QTGate Systems Inc. (QTGate), located at CANADA.',
            firstPart: 'By using our Services, you are agreeing to these terms. Please read them carefully.',
            detail: [
                {
                    header: 'Using our Services',
                    detail: 'You must follow any policies made available to you within the Services. Don’t misuse our Services. For example, don’t interfere with our Services or try to access them using a method other than the interface and the instructions that we provide. You may use our Services only as permitted by law, including applicable export and re-export control laws and regulations.'
                }, {
                    header: null,
                    detail: 'We may suspend or stop providing our Services to you if you do not comply with our terms or policies or if we are investigating suspected misconduct. Using our Services does not give you ownership of any intellectual property rights in our Services or the content you access. You may not use content from our Services unless you obtain permission from its owner or are otherwise permitted by law. These terms do not grant you the right to use any branding or logos used in our Services. Don’t remove, obscure, or alter any legal notices displayed in or along with our Services.'
                }, {
                    header: 'Privacy Policy and Information we collect',
                    detail: 'In connection with your use of the Services, we may send you service announcements, administrative messages, and other information. You may opt out of some of those communications. When you use our services, for calculating communication charges we automatically collect and store communication data in server logs. The logs will limited as: Date footprinting, user account, package byte, Ingress or Egress. For example:'
                }, {
                    header: null,
                    detail: '<p class="tag info">06/20/2017 18:12:16, info@qtgate.com, 300322 byte up, 482776323 byte down.</p><p class="tag info">06/21/2017 12:04:18, info@qtgate.com, 1435226 byte up, 11782238 byte down.</p>'
                },
                {
                    header: null,
                    detail: 'QTGate does not save any information other than the above information. We will cooperate and provide this log information to law enforcement agencies holding Canadian court orders. If you are the law enforcement agencies outside of Canada, please contact us through the Canadian Foreign Office at:'
                },{
                    header: null,
                    detail: '<a class="tag alert" href="http://www.international.gc.ca/">http://www.international.gc.ca/</a>'
                }, {
                    header: 'Copyright',
                    detail: 'QTGate gives you a personal, worldwide, royalty-free, non-assignable and non-exclusive license to use the software provided to you by QTGate as part of the Services. This license is for the sole purpose of enabling you to use and enjoy the benefit of the Services as provided by QTGate, in the manner permitted by these terms. You may not copy, modify, distribute, sell, or lease any part of our Services or included software, nor may you reverse engineer or attempt to extract the source code of that software.'
                }, {
                    header: 'Modifying and Terminating our Services',
                    detail: 'We are constantly changing and improving our Services. We may add or remove functionalities or features, and we may suspend or stop a Service altogether. You can stop using our Services at any time, although we’ll be sorry to see you go. QTGate may also stop providing Services to you, or add or create new limits to our Services at any time.'
                }, {
                    header: 'Our Warranties and Disclaimers',
                    detail: 'Our Warranties and Disclaimers: We provide our Services using a commercially reasonable level of skill and care and we hope that you will enjoy using them. But there are certain things that we don’t promise about our Services.'
                }, {
                    header: null,
                    detail: 'OTHER THAN AS EXPRESSLY SET OUT IN THESE TERMS OR ADDITIONAL TERMS, NEITHER QTGate NOR ITS SUPPLIERS OR DISTRIBUTORS MAKE ANY SPECIFIC PROMISES ABOUT THE SERVICES. FOR EXAMPLE, WE DON’T MAKE ANY COMMITMENTS ABOUT THE CONTENT WITHIN THE SERVICES, THE SPECIFIC FUNCTIONS OF THE SERVICES, OR THEIR RELIABILITY, AVAILABILITY, OR ABILITY TO MEET YOUR NEEDS. WE PROVIDE THE SERVICES “AS IS”.'
                }, {
                    header: 'Liability for our Services',
                    detail: 'WHEN PERMITTED BY LAW, QTGATE, AND QTGATE’S SUPPLIERS AND DISTRIBUTORS, WILL NOT BE RESPONSIBLE FOR LOST PROFITS, REVENUES, OR DATA, FINANCIAL LOSSES OR INDIRECT, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES.'
                }, {
                    header: 'Business uses of our Services',
                    detail: 'If you are using our Services on behalf of a business, that business accepts these terms. It will hold harmless and indemnify QTGate and its affiliates, officers, agents, and employees from any claim, suit or action arising from or related to the use of the Services or violation of these terms, including any liability or expense arising from claims, losses, damages, suits, judgments, litigation costs and attorneys’ fees.'
                }, {
                    header: 'About these Terms',
                    detail: 'We may modify these terms or any additional terms that apply to a Service to, for example, reflect changes to the law or changes to our Services. You should look at the terms regularly. We’ll post notice of modifications to these terms on this page. We’ll post notice of modified additional terms in the applicable Service. Changes will not apply retroactively and will become effective no sooner than fourteen days after they are posted. However, changes addressing new functions for a Service or changes made for legal reasons will be effective immediately.'
                }, {
                    header: null,
                    detail: 'If you do not agree to the modified terms for a Service, you should discontinue your use of that Service. If there is a conflict between these terms and the additional terms, the additional terms will control for that conflict. These terms control the relationship between QTGate and you. They do not create any third party beneficiary rights. If you do not comply with these terms, and we don’t take action right away, this doesn’t mean that we are giving up any rights that we may have (such as taking action in the future). if it turns out that a particular term is not enforceable, this will not affect any other terms. The laws of BC, Canada., excluding BC’s conflict of laws rules, will apply to any disputes arising out of or relating to these terms or the Services. All claims arising out of or relating to these terms or the Services will be litigated exclusively in the federal or state courts of BC, Canada, and you and QTGate consent to personal jurisdiction in those courts.'
                }
                
            ],
            disagree: 'Disagree',
            agreeMent: 'QTGate service Terms and Privacy'
        },

        linuxUpdate:{
            newVersionDownload: 'click here to download and install!',
            step1:'Download the new QTGate.',
            step2: 'Allow executing file as program',
            step2J1:'/images/linuxUpdate1.jpg',
            step2J2:'/images/linuxUpdate2.jpeg',
            step2_detail1: 'Right click downloaded QTGate file and select the properties.',
            step2_detail2: 'Check the allow executing file as program in Permissions tab.',
            step3:'Exit old version QTGate and double click the new QTGate file to run install.',
            exit: 'Exit QTGate.'
        },

        imapInformation: {
            title: 'Transfer email account setup.',
            infomation: 'The IMAP email account will use for communicate between QTGate system and you. You may provide the account name and password to QTGate system. For your personal information privacy, please register a new free email account.<span style="color: red;"> QTGate system support Apple mail, Yahoo mail and Microsoft Outlook mail only. The best one is Apple mail. </span> About password we recommand use <a href="https://help.yahoo.com/kb/SLN15241.html" target="_blank" onclick="return linkClick (`https://help.yahoo.com/kb/SLN15241.html`)">third-party app passwords.</a>',
            serverDetail: 'settings:',
            imapServer: 'IMAP server setup',
            imapServerInput: 'IMAP server name or IP address',
            UserName: 'Login user name',
            Ssl: 'By Ssl connect:',
            portName: 'Port number:',
            otherPortNumber: 'Other:',
            Error_portNumber: 'Port number should be Numbers from 1 to 65535.',
            smtpServer: 'SMTP server setup',
            smtpServerInput: 'SMTP server name or IP address',
            emailServerPassword: 'Email account password ( app password )',
            imapAccountConform: '<p><dt>By clicking submit you are agreeing to this:</dt></p>This email is a temporary account for use QTGate system. You agree QTGate can full access this account for transfer data between you and QTGate.',
            agree: `I understand the risk and want keep`,
            imapOtherCheckError: 'Cannot connect to email server! Server name or IP address or Port number may have mistake. Please check the detail of email setup!',
            CertificateError: 'Certificate for this email server is not trusted. Please select "Keep connect even certificate is not trusted" in settings if you still want connect. your email login information may leak to this Email server!',
            IgnoreCertificate: 'Keep connect even certificate is not trusted',
            Certificat: 'Dangerous thing! Do not choose this if you not sure. Because you may revealed your information.',
            AuthenticationFailed: 'Invalid login username or password! Please check username and password.',
            addAEmail: 'Add a new Email account',
            tryAgain: 'Try again.',
            connectImap: 'Connect to QTGate',
            cancelConnect: 'Stop connect to QTGate.',
            imapItemTitle: 'Email account details:',
            imapCheckingStep: ['Try connect to email server.','Connected to email server with IMAP.','Connected to email server with SMTP.'],
            imapResultTitle: 'IMAP Server QTGate Communication Rating: ',
            testSuccess: 'Email server setup success!',
            exitEdit: 'Exit edit email account',
            deleteImap: 'Delete IMAP account.',
            proxyPortError: 'Port number should be Numbers from 1000 to 65535. Or this port is using by another process. please try other number.'
        },

        Home_keyPairInfo_view: {
            
            title: 'Key pair information',
            emailNotVerifi: 'Keypair does not signed by QTGate yet.',
            emailVerified: 'Keypair has signed by QTGate.',
            NickName: 'Nick name：',
            creatDate:'Key pair created date：',
            keyLength: 'Key pair bit Length：',
            password: '5-character minimum password.',
            password1: 'Key pair password.',
            logout: 'Logout',
            keyID: 'Key pair ID：',
            deleteKeyPairInfo: 'Note: Delete key pair will lost all your system setup. You may setup QTGate agian from first step. If your email address is same as this one. You may back your QTGate account balance.',
            delete: 'Delete',
            locked: 'Please enter your key pair password to unlock this key pair to continue.',
            systemError: 'System error! Please delete the key pair and re-setup QTGate.'
        },

		home_index_view: {
            newVersion: 'A new version is ready to install.',
            localIpAddress: 'Local',
            internetLable: 'Internet',
            gateWayName:'Gateway',
            showing:'Status',
            nextPage:'next',
            agree: 'I AGREE & CONTINUE',
            emailAddress: 'Email Address ( Required )',
            creatKeyPair: 'Generate key pair...',
            cancel: 'Cancel',
            clickInstall:'Install',
            continueCreateKeyPair: 'Keep generate.',
            stopCreateKeyPair: 'Cancel generate key pair',
            KeypairLength: 'Select the bit length of your key pair. as long as stronger and harder for a hacker to crack but may slow network transfer.',
            SystemAdministratorNickName: 'Nick name ( Required )',
            systemAdministratorEmail:'Generate RSA Key pair',
            GenerateKeypair: '<em>Generate RSA Key pair. It may take a few minutes. It will need more long time when you chooess 4096 bit key length. About RSA keypair system can be found here: ' +
                `<a href='hhttp://en.wikipedia.org/wiki/RSA_(cryptosystem)' target="_blank" onclick="return linkClick ('https://en.wikipedia.org/wiki/RSA_(cryptosystem)')">https://en.wikipedia.org/wiki/RSA_(cryptosystem)</a></em>`,
            systemPassword: 'Password',
            inputEmail: `This RSA key pair will used for all data for this system and transfer data with QTGate system, also that is your proof of identity in QTGate system. The password of the key pair is not send to QTGate, this is mean you can't running QTGate system again if you lost your password. Please memo your password. <em style="color: red;">QTGate domain looks in block list at some area there have regulate the Internet domestically. Please use the email that in outside these area.</em>`,
            accountEmailInfo: `Because QTGate looks in firewall's black list at some area. The best way is chooess your outside firewall's mail account.`
        },
        
        error_message: {
            title: 'Error',
            errorNotifyTitle: 'System Error',
            EmailAddress: ['Please enter your email address in the format someone@example.com.','Have same email account!','Sorry, QTGate system support Apple mail, Microsoft Outlook and Yahoo mail only.'],
            required: 'Please fill in this field.',
            PasswordLengthError: 'Passwords must have at least 5 characters.',
            localServerError: 'Local QTGate server error. restart please!',
            finishedKeyPair: 'Generate new keypair down.',
            Success: 'Success',
            doCancel: 'Canceled generate keypair!',
            errorKeyPair:'Generate new keypair had ERROR, try again!',
            SystemPasswordError: 'Your keypair password did not match. Please try again. If you forgot your password, pless delete this key pair. That will let you lost all setup.',
            finishedDeleteKeyPair: 'Key pair deleted!',
            offlineError: 'Looks have not internet connect. Please check your network and try again!',
            imapErrorMessage: ['','Data format error!','Looks this computer have not internet connect. Please check your network and try again!', `Email server did responer IMAP's username or password ERROR!`,
                `Can't connect to email server with the port. Please check the IMAP port number. This port may be filtering by firewall If you in a firewall network.`,
                `There is a problem with this IMAP email server's security certificate!`,`Email server can't get ipaddress error. Please check the email server domain.`,
                'This email provider have not support QTGate technology, please change other email provider.',`Email server did responer SMTP's username or password ERROR!`, 
                `There is a problem with this SMTP email server's security certificate!`,`Connect to SMTP Email server got unknow error!`,'Have same email account!']
        },

        emailConform: {
            activeViewTitle: 'Active your keypair.',
            emailTitle: 'Welcome to choose QTGate service.',
            info1_1: 'Keypair verify have not complete. A verification email from QTGate had sent. Please check your [',
            info1_2: '] mailbox. If you have one more mails from QTGate in your mailbox. Please chooses the latest one.',
            info2: 'Copy all content from [-----BEGIN PGP MESSAGE-----] ... to [-----END PGP MESSAGE-----]. Paste into this text box.',
            emailDetail1: 'Dear ',
            emailDetail1_1: ' ,',
            emailDetail2: 'This is your secret verification code to validate your QTGate account. Please copy and paste all the content in the text area.',
            bottom1_1: 'Best regards,',
            bottom1_2: 'The QTGate team',
            conformButtom: 'Conform',
            formatError: ['Format error! Copy all content from [-----BEGIN PGP MESSAGE-----] ... to [-----END PGP MESSAGE-----]. Paste into this text box.',
                        'Oops. This may not decrypt. Find the lasest mail from QTGate in your key pair email mailbox. Or delete this key pair and rebuild new key pair please.',
                        'QTGate disconnect error!. Please exit and restart QTGate.','This secret verification code was invalid. A new verification email was sent to your mail box. Please check your email.',
                        'Your QTGate looks have problem, Please delete your key pair and do setup again from first!','QTGate system looks have problem, Please try again late.',
                        `Your data transfer is limit today, please try again tomorrow or upgrade your user type.`,
                        'Selected region has unavailable, try again later.'],
            activeing: 'sending...'
        },

        QTGateRegion: {
            title: 'QTGate gateway area',
            available: 'Available',
            unavailable: 'Unavailable',
            proxyDomain:'Domain lookup via QTGate gateway side.',
            setupCardTitle: 'connecting with:',
            dataViaGateway:'All internet data transfer via QTGate gateway.',
            dataTransfer: 'Data:',
            dataTransfer_datail: ['All data via QTGate gateway.',`When can not connect to target server only.`],
            proxyDataCache: 'Web cache:',
            proxyDataCache_detail: ['Yes','No'],
            clearCache: 'Delete all cache now',
            localPort:'Local proxy port number:',
            localPath:'HTTP/HTTPS conect path name:',
            GlobalIp: 'Global IP:',
            QTGateRegionERROR:['Send connect request mail got error. Please check your IMAP account setup.',
            ''],
            GlobalIpInfo:'Note: When you press [QTGate], you will send your Internet IP to the QTGate system, if you do like that please choose [@QTGate] technology to use QTGate service!',
            cacheDatePlaceholder: 'Web cache freshness lifetime.',
            sendConnectRequestMail:['QTGate connect looks down. A connect request mail was sent to QTGate system. Please wait for a moment.',
                                    'Free user connect will be down when user had not use QTGate last 24 hours. QTGate system keep connection 1 month for paid user.'],
            cacheDatePlaceDate:[{ name:'1 hour', id: 1 }, { name:'12 hour', id: 12 },{ name:'1 day', id: 24 }, { name:'15 days', id: 360 }, { name:'1 month', id: 720 }, { name:'6 months', id: 4320 }, { name:'forever', id: -1 }],
            atQTGateDetail: [`The world's first QTGate no IP Internet communication technology, client and proxy server do not know each other IP address, security and reliability, firewall transparency. The network communication response by the email service provider you use the impact of the server, not suitable for video games and video chat.`,
                            'QTGate original encryption technogy it can disguise the traffic looks like normal HTTP protocol, to hide your IP address high-speed communication, stealth and protection of privacy, strong anti-interference, firewall transparency. You need to use your IP to connect proxy server. This is best chooses If you just want freedom of internet.',
                            'Use QTGate gateway side domain lookup can always get right IP address from DNS cache pollution. This is the default.','All internet data transfer via QTGate gateway dose anonymity network.',
                            'When target server can not connect then data transfer via QTGate gateway. This chooese will save your QTGate data transfer.',
                            'Web cache (or HTTP cache) is an information technology for the temporary storage (caching) of web documents, to reduce bandwidth usage, server load, and perceived lag. QTGate always crypto all web cache data. This is not working for HTTPS connect.', 'Do not use web cache.',
                            'By setting the cache expiration date, you can always obtain the latest information on the server side. The unit is time.',
                            'Local proxy server port number is provide all other devices use QTGate network connect. Please setup a number from 3001 to 65535.','Local proxy server http/https access PATH can seculity your server.'],
            connectQTGate: 'Connecting to QTGate for getting gateway area information...'
        },

        QTGateGateway: {
            title: 'QTGate service use detail',
            processing: 'Try to connecting QTGate gateway...',
            error: ['Error: Your account has a connection that is using the QTGate proxy server. Please disconnect it before attempting to connect again.',
                    'Error: Bandwidt maximum. If you want to continue using it, please upgrade your account. Free account have bandwidth is maximum of 100MB each day, 1 GB every month.',
                    'Error: Data format error. Please restart QTGate.'],
            connected:'connected.',
            userType:['free', 'Subscript'],
            datatransferToday:'The limit of bandwidth each day.：',
            datatransferMonth:'The limit of bandwidth each month.：',
            todaysDatatransfer: 'Available today.',
            monthDatatransfer: 'Available month.',
            gatewayInfo: ['Gateway Ip address：','Gateway connect port：'],
            userInfoButton: 'How to use?',
            stopGatewayButton:'Disconnect',
            disconnecting: 'Disconnecting'
        },
        
        qtGateView: {
            title: 'QTGate connect',
            mainImapAccount: 'Email account for communicate with QTGate',
            QTGateConnectStatus: 'Status of QTGate connect',
            QTGateConnectResult: [
                'QTGate disconnect, click to connect to QTGate.','Connecting to QTGate.','QTGate Connected.','Connect sotp wieh error! Please fix the IMAP account setup!',
                'QTGate Connected.'
            ],
            QTGateSign: ['Keypair status','Your keypair has not get sign from QTGate.',
                'QTGate certification authority is a trusted thus certifying your public keys is yoursalf in QTGate users when you share files of send message to other QTGate user. You also can signing another QTGate users with your keypair for make your trust relationship.',
                'Getting QTGate certification authority.','Opps. System error. Try restart QTGate, if still have please re-install QTGate.','System error!']
        },
        
        feedBack: {
            title: 'FEEDBACK',
            additional: 'Additional info',
            okTitle:'Send to QTGate'
        },

	}, {
        useInfoiOS: {
            title1:'iOS設備本地代理伺服器設定',
            info:[{
                title:'打開控制面板，點擊Wi-Fi',
                titleImage:'/images/macOsControl.jpg',
                detail: '',
                image: '/images/iOS1.jpg'
            },{
                title:'選擇當前WiFi的圈i符號',
                titleImage:'',
                detail:'',
                image: '/images/iOS2.jpg'
            },{
                title:'選擇底部的設置代理伺服器',
                titleImage:'',
                detail:'',
                image: '/images/iOS3.jpg'
            },{
                title:'選擇手動設置，在代理伺服器名稱和端口號處填入對應的藍色數字，按保存完成設置',
                titleImage:'',
                detail:'',
                image: '/images/iOS4.jpg'
            }]
        },
        firefoxUseInfo:{
            title1:'火狐瀏覽器它單獨設定代理服務，可以不影響系統而輕鬆使用代理上網',
            info:[{
                title:'打開火狐，點擊右上角工具圖標，選擇設定',
                titleImage:'/images/macOsControl.jpg',
                detail: '<p><a href="https://www.mozilla.org/zh-TW/firefox/#" target="_blank">下载Firefox</a></p>',
                image: '/images/firefox1.jpg'
            },{
                title:'選擇常規項，滾動畫面至最下部，在網絡代理處，點擊詳細設定',
                titleImage:'',
                detail:'',
                image: '/images/firefox2.jpg'
            },{
                title:'選擇手動設置代理伺服器，按圖示藍色數字填入HTTP代理伺服器名稱和端口號，選勾本設定適用所有協議，點擊好完成設置',
                titleImage:'',
                detail:'',
                image: '/images/firefox3.jpg'
            }]
        },
        useInfoWindows: {
            title1:'Windows10本地代理伺服器設定',
            info:[{
                title:'關於Windows其他版本',
                titleImage:'',
                detail: '<p>Windows其他版本的代理伺服器設定請參照<a target="_blank" href="#" onclick="return linkClick (`https://support.microsoft.com/ja-jp/help/135982/how-to-configure-internet-explorer-to-use-a-proxy-server`)">微軟公司網站</a></p><p>请按以下参数设置本地代理伺服器：</p>',
                image: ''
            },{
                title:'啟動Internet Explorer',
                titleImage:'/images/IE10_icon.png',
                detail:'<p>點擊右上角工具圖標，滑動設定菜單至最下部選擇【設定】</p>',
                image:'/images/windowsUseInfo1.jpg'
            },{
                title:'滑動菜單至最下部點擊高級設定',
                titleImage:'',
                detail:'',
                image: '/images/windowsUseInfo2.jpg'
            },{
                title:'再次滑動菜單，點擊打開代理伺服器設定',
                titleImage:'',
                detail:'',
                image: '/images/windowsUseInfo3.jpg'
            },{
                title:'選擇手動設置代理伺服器，按圖示藍色數字填入伺服器地址及伺服器端口號，然後點擊保存完成設定。',
                titleImage:'',
                detail:'',
                image: '/images/windowsUseInfo4.jpg'
            }]
        },
        useInfoAndroid: {
            title1:'安卓設備本地代理伺服器設定',
            info:[{
                title:'打开控制面板，选择Wi-Fi设定',
                titleImage:'/images/androidSetup.jpg',
                detail: '',
                image: '/images/android1.jpg'
            },{
                title:'長按當前WiFi連接名稱等待菜單出現，選擇菜單的修改設定',
                titleImage:'',
                detail:'',
                image: '/images/android2.jpg'
            },{
                title:'打開顯示高級選項，在代理伺服器設定(Proxy)中選擇手動設置',
                titleImage:'',
                detail:'',
                image: '/images/android3.jpg'
            },{
                title:'按下列畫面中藍色的數字填入代理伺服器名稱和端口號，關閉窗口以完成設置',
                titleImage:'',
                detail:'',
                image: '/images/android4.jpg'
            }]
        },
        useInfoMacOS: {
            title:'您的其他電子設備，可通過設置本地Proxy伺服器，來使用QTGate連接到互聯網',
            title1:'MacOS 本地代理伺服器設定',
            proxyServerIp:'本地代理伺服器地址：',
            proxyServerPort: '本地代理伺服器端口：',
            proxyServerPassword: '本地代理伺服器登陸用戶名和密碼：無需設定',
            info:[{
                
                title:'打開控制面板，點擊【網絡】',
                titleImage:'/images/macOsControl.jpg',
                detail:'',
                image: '/images/userInfoMacos1.jpg'
            },{
                title:'選擇網絡【高級...】',
                titleImage:'',
                detail:'',
                image: '/images/macosUserInfo2.jpg'
            },{
                title:'代理伺服器設定',
                titleImage:'',
                detail:'<p>1. 選勾左邊 網頁代理伺服器(HTTP)，並在右邊代理伺服器填入圖示藍色數字</p><p>2. 選勾左邊 安全網頁代理伺服器(HTTPS)，在右端安全代理伺服器，相同地填入圖示藍色數字，按【好】結束設定</p>',
                image: '/images/macosUserInfo3.jpg'
            }]
        },
        QTGateInfo: {
            title:'QTGate功能簡介',
            version:'本機安裝的QTGate版本：v',
            detail:[{
                color: '#a333c8',
                icon: 'exchange',
                header: '隱身匿名自由上網',
                detail: 'QTGate通過使用<a href="https://zh.wikipedia.org/wiki/%E9%AB%98%E7%BA%A7%E5%8A%A0%E5%AF%86%E6%A0%87%E5%87%86" target="_blank">AES256-GCM</a>和<a href="https://zh.wikipedia.org/wiki/PGP" target="_blank">OpenPGP</a >加密Email通訊，創造了OPN匿名網絡通訊技術，QTGate公司首創的@OPN技術，它全程使用加密Email通訊，客戶端和代理伺服器彼此之間不用交換IP地址，實現高速網絡通訊。iOPN通訊技術是一種HTTP協議下的加密混淆代理技術，能夠隱藏變換您的IP地址高速通訊。二種通訊方式都能夠讓您，隱身和安全及不被檢出的上網，保護您的隱私，具有超強對抗網絡監控,網絡限制和網絡阻斷。'
            },
            {
                color: 'darkcyan',
                icon: 'spy',
                header: '阻斷間諜軟件（下一版本）',
                detail: 'QTGate系統連接全球DNSBL聯盟數據庫，用戶通過訂閱QTGate系統黑名單列表，並使用QTGate客戶端上網，讓潛伏在您電子設備內的間諜軟件，它每時每刻收集的信息，不能夠被送信到其信息收集伺服器，能夠最大限的保障您的個人隱私。'
            },{
                color: '#6435c9',
                icon: 'external share',
                header:'本地VPN伺服器(下一版本)',
                detail:'QTGate用戶在戶外時可以通過連接自己家裡的VPN，來使用QTGate客戶端隱身安全上網。'
            },{
                color: '#6435c9',
                icon: 'cloud upload',
                header:'加密文件匿名網絡雲存儲分享功能（下一版本）',
                detail:'用戶通過申請多個和不同的免費email服務商賬號，可以把一個文件加密拆分成多個部分，分別存儲在不同的email賬號下，可以保密安全和無限量的使用網絡儲存。用戶還可以通過QTGate系統在QTGate用戶之間分享秘密文件。'
            },{
                color: '#e03997',
                icon: 'talk outline',
                header:'無IP點對點即時加密通訊服務（下一版本）',
                detail:'QTGate用戶之間通過email的點對點即時通訊服務，它具有傳統即時通訊服務所不具有的，匿名無IP和用戶之保持秘密通訊的功能。 QTGate加密通訊服務可以傳送文字，圖片和視頻文件信息。 QTGate加密通訊服務支持群即時通訊。'
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

        firstNote:{
            title: '歡迎使用QTGate，感謝您使用我們的產品和服務(下稱“服務”)。本服務由總部設在加拿大的QTGate Systems Inc.下稱“QTGate”提供。 ',
            firstPart: '您使用我們的服務即表示您已同意本條款。請仔細閱讀。使用我們的服務，您必須遵守服務中提供的所有政策。',
            detail:[
                {
                    header: '關於我們的服務',
                    detail: '請勿濫用我們的服務，舉例而言: 請勿干擾我們的服務或嘗試使用除我們提供的界面和指示以外的方法訪問這些服務。您僅能在法律(包括適用的出口和再出口管制法律和法規)允許的範圍內使用我們的服務。如果您不同意或遵守我們的條款或政策，請不要使用我們所提供的服務，或者我們在調查可疑的不當行為，我們可以暫停或終止向您提供服務。'
                },{
                    header: null,
                    detail: '使用我們的服務並不讓您擁有我們的服務或您所訪問的內容的任何知識產權。除非您獲得相關內容所有者的許可或通過其他方式獲得法律的許可，否則您不得使用服務中的任何內容。本條款並未授予您使用我們服務中所用的任何商標或標誌的權利。請勿刪除、隱藏或更改我們服務上顯示的或隨服務一同顯示的任何法律聲明。'
                },{
                    header: '關於個人隱私保護，系統日誌和接收QTGate傳送的信息',
                    detail: '在您使用服務的過程中，我們可能會向您發送服務公告、管理消息和其他信息。您可以選擇不接收上述某些信息。'
                },{
                    header: null,
                    detail: '當您使用我們的服務時，我們為了計費處理會自動收集非常有限的數據流量信息，並存儲到伺服器日誌中。數據流量信息僅用於計算客戶應支付通訊費用而收集的，它收集的數據是：日期，用戶帳號，數據包大小，下載或上傳。例如：'
                },{
                    header: null,
                    detail: '<p class="tag info">06/20/2017 18:12:16, info@qtgate.com, 300322 byte up, 482776323 byte down.</p><p class="tag info">06/21/2017 12:04:18, info@qtgate.com, 1435226 byte up, 11782238 byte down.</p>'
                },{
                    header: null,
                    detail: 'QTGate沒有保存除了以上信息以外的任何其他信息。我們會配合並向持有加拿大法院令的執法機構提供此日誌文件。如果您是加拿大以外地區的執法機構，有這方面信息披露的需求，請通過加拿大外交部來聯繫我們：'
                },{
                    header: null,
                    detail: '<a class="tag alert" href="http://www.international.gc.ca/">http://www.international.gc.ca/</a>'
                },{
                    header: '版權所有權',
                    detail: '該軟件是QTGate的智慧產權，並且受到相關版權法，國際版權保護規定和其他在版權授與國家內的相關法律的保護。該軟件包含智慧產權材料, 商業秘密及其他產權相關材料。你不能也不應該嘗試修改，反向工程操作，反彙編或反編譯QTGate服務，也不能由QTGate服務項目創造或衍生其他作品。'
                },{
                    header: null,
                    detail: '關於我們服務中的軟件，QTGate授予您免許可使用費、不可轉讓的、非獨占的全球性個人許可, 允許您使用由QTGate提供的、包含在服務中的軟件。本許可僅旨在讓您通過本條款允許的方式使用由QTGate提供的服務並從中受益。您不得複制、修改、發布、出售或出租我們的服務, 或所含軟件的任何部分。'
                },{
                    header: '修改與終止服務',
                    detail: '我們持續改變和改善所提供的服務。我們可能會新增或移除功能或特性，也可能會暫停或徹底停止某項服務。您隨時都可以停止使用服務，儘管我們並不希望您會這樣做。 QTGate也可能隨時停止向您提供服務，或對服務附加或設定新的限制。'
                },{
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
                },{
                    header: '',
                    detail: '本条款约束QTGate与您之间的关系，且不创设任何第三方受益权。如果您不遵守本条款，且我们未立即采取行动，并不意味我们放弃我们可能享有的任何权利（例如，在将来采取行动）。如果某一条款不能被强制执行，这不会影响其他条款的效力。加拿大BC省的法律（不包括BC州的法律冲突规则）将适用于因本条款或服务引起的或与之相关的纠纷。因本条款或服务引起的或与之相关的所有索赔，只能向加拿大BC省法院提起诉讼，且您和QTGate同意上述法院拥有属人管辖权。'
                }


            ],
            disagree: '不同意',
            agreeMent: 'QTGate服務條款和隱私權'
        },

        linuxUpdate: {
            newVersionDownload: '點擊這裡下載並安裝',
            step1:'下載新版本',
            step2: '授權新版本QTGate為可執行文件',
            step2J1:'/images/linuxUpdate1_tw.jpg',
            step2J2:'/images/linuxUpdate2_tw.jpeg',
            step2_detail1: '右鍵點擊已下載的QTGate圖標，選擇菜單裡的文件屬性',
            step2_detail2: '在權限選項裡，選勾“允許檔案文件執行”。',
            step3:'退出舊版本QTGate後，雙擊QTGate文件執行安裝',
            exit: '退出QTGate'
        },

        imapInformation: {
            title: '通訊專用Email郵箱設置',
            infomation: '請設置QTGate通訊專用Email郵箱信息。由於此賬戶的用戶名和密碼信息會提交給QTGate系統，為了防止您的個人信息被洩漏，請新申請一個臨時Email賬戶。目前QTGate技術只對應<span style="color: red;">蘋果公司Email，微軟OUTLOOK，雅虎公司Email三家，QTGate強力推薦使用蘋果公司的Email可以達到最佳速度。</span>密碼推薦使用Email服務商的<a href="https://tw.help.yahoo.com/kb/SLN15241.html" target="_blank" onclick="return linkClick (`https://tw.help.yahoo.com/kb/SLN15241.html`)">應用密碼</a>',
            serverDetail: '詳細設定：',
            imapServer: 'IMAP伺服器設定',
            UserName: '登陸用戶名稱',
            Ssl: '使用Ssl加密信息傳輸：',
            imapServerInput: 'IMAP伺服器IP或域名',
            portName: '通訊端口號：',
            otherPortNumber: '其他號碼：',
            smtpServer: 'SMTP伺服器設定',
            smtpServerInput: 'SMTP伺服器設定',
            Error_portNumber: '端口號應該是從1-65535之間的數字',
            emailServerPassword: '郵箱密碼(推薦使用應用專用密碼)',
            imapAccountConform: '<p><dt>警告：</dt></p>當您按下提交按鈕時，意味著您已經確認：這個郵箱並不是您常用的郵箱，這是為了使用QTGate系統而特別申請的臨時郵箱，您同意承擔由此帶來的風險，並授權QTGate系統可以使用這個Email郵箱傳輸信息!',
            agree:'我已經了解風險，並願意繼續',
            imapOtherCheckError: '不能連接到Email伺服器，有可能您設定的伺服器名稱或IP，通訊端口號有誤，請檢查您的伺服器詳細設定！',
            CertificateError: 'Email伺服器提示的證書不能被系統信任！您的Email伺服器有可能是一個仿冒的，您如果想繼續，請在詳細設定裡選擇【允許連接到不被信任證書的Email伺服器】，但您的Email登陸信息有可能洩漏給此伺服器！',
            IgnoreCertificate: '允許連接到不被信任證書的Email伺服器',
            Certificat: '如果您不確定請別選擇這項，這個選擇是非常危險，因為它允許連接上一個仿冒的伺服器，可能洩露您的用戶名和密碼。',
            AuthenticationFailed: 'Email伺服器提示用戶名或密碼錯誤，請仔細檢查您的用戶名和密碼！',
            addAEmail: '添加通訊用Email賬戶',
            tryAgain: '再試一次',
            connectImap: '連結QTGate',
            cancelConnect: '終止QTGate連接',
            imapItemTitle: '通訊用郵箱詳細信息',
            imapCheckingStep: ['正在嘗試連接email伺服器','IMAP成功登陸email伺服器','SMTP成功登陸email伺服器'],
            imapResultTitle: 'IMAP伺服器QTGate通訊評分：',
            testSuccess: '電子郵件伺服器連接試驗成功！',
            exitEdit: '退出編輯Email帳戶',
            deleteImap: '刪除IMAP帳戶',
            proxyPortError: '端口號應該是從1000-65535之間的數字，或此端口已被其他APP所占用，請再嘗試其他號碼。'
        },

        Home_keyPairInfo_view: {
            
            title: '密鑰信息',
            emailNotVerifi: '您的密鑰未獲QTGate簽署認證。 ',
            emailVerified: '您的密鑰已獲QTGate簽署認證。 ',
            NickName: '創建人稱謂：',
            creatDate:'密鑰創建日期：',
            keyLength: '密鑰位強度：',
            password: '請輸入長度大於五位的密碼',
            password1: '請輸入密鑰密碼',
            logout:'退出登錄',
            deleteKeyPairInfo: '請注意：如果您沒有備份您的QTGate系統的話，刪除現有的密鑰將使您的QTGate設定全部丟失，您有可能需要重新設置您的QTGate系統。如果您的註冊Email沒有變化，您的QTGate賬戶支付信息不會丟失！',
            delete: '刪除',
            keyID: '密鑰對ID：',
            locked: '請提供您的RSA密鑰以解開密鑰後才能繼續操作，如果您遺忘了密碼，請刪除此RSA密鑰。',
            systemError:'發生系統錯誤。如果重複發生，請刪除您的密鑰，再次設定您的系統！'
        },

		home_index_view: {
            newVersion: '新版本準備就緒，請安裝！',
            localIpAddress: '本機',
            clickInstall: '點擊安裝新版本',
            internetLable: '互聯網',
            gateWayName:'代理伺服器',
            showing:'系統狀態',
            nextPage:'下一頁',
            agree: '同意協議並繼續',
            emailAddress: 'Email地址(必填)',
            stopCreateKeyPair: '停止生成密鑰對',
            creatKeyPair: '創建密鑰對..',
            cancel: '放棄操作',
            systemPassword: '密碼',
            continueCreateKeyPair: '繼續生成',
            SystemAdministratorNickName: '暱稱或組織名(必填)',
            KeypairLength: '請選擇加密通訊用密鑰對長度：這個數字越大，通訊越難被破解，但會增加通訊量和運算時間。',
            systemAdministratorEmail:'RSA密鑰生成',
            GenerateKeypair: '<em>系統正在生成用於通訊和簽名的RSA加密密鑰對，計算機需要運行產生大量的隨機數字有，可能需要幾分鐘時間，尤其是長度為4096的密鑰對，需要特別長的時間，請耐心等待。關於RSA加密算法的機制和原理，您可以訪問維基百科：' +
                `<a href='https://zh.wikipedia.org/wiki/RSA加密演算法' target="_blank" onclick="return linkClick ('https://zh.wikipedia.org/wiki/RSA加密演算法')">https://zh.wikipedia.org/wiki/RSA加密演算法</a></em>`,
            inputEmail: '让我们来完成设定的最后几个步骤，首先生成RSA密鑰對, 它是您的系統信息加密，身份認證及和QTGate通訊使用的重要工具。 RSA密鑰對的密碼請妥善保存，Email地址欄應填入您的常用Email地址, 它將被用作您的QTGate賬號。<em style="color:red;">需注意的是QTGate.com域名在某些网络限制地区被列入屏蔽名单，如果您使用的是网络限制地区email服务，您将不能够完成设定QTGate设定。</em>',
            accountEmailInfo: `由於QTGate域名在某些國家和地區被防火牆屏蔽，而不能正常收發QTGate的Email，如果您是處於防火牆內的用戶，建議使用防火牆外部的郵件服務商。`
        },
        
        error_message: {
            title: '錯誤',
            errorNotifyTitle: '系統錯誤',
            Success: '完成',
            localServerError: '本地伺服器錯誤，請重新啟動QTGate！',
            required: '請填寫此字段',
            EmailAddress: ['請按照下列格式輸入你的電子郵件地址: someone@example.com.', '您已有相同的Email賬戶','此類Email伺服器暫時QTGate技術不能對應,請選擇Apple公司，微軟Outlook, Yahoo公司的Email服務。'],
            PasswordLengthError: '密碼必須設定為5個字符以上。',
            finishedKeyPair: '密鑰對創建完成',
            doCancel: '終止生成',
            errorKeyPair:'密鑰對創建發生錯誤，請重試',
            SystemPasswordError: '密鑰對密碼錯誤，請重試！如果您已忘記您的密鑰對密碼，請刪除現有的密鑰對，重新生成新的密鑰對。',
            finishedDeleteKeyPair: '密鑰對完成刪除!',
            offlineError: '您的電腦視乎未連結到互聯網，請檢查網路連結',
            imapErrorMessage: ['','數據格式錯誤，請重試', '您的電腦未連接到互聯網，請檢查網絡後再次嘗試！','email伺服器提示IMAP用戶名或密碼錯！',
                'Email伺服器的指定端口號連結失敗，請檢查您的IMAP端口號設定，如果您在一個防火牆內部，則有可能該端口被防火牆所屏蔽，您可以嘗試使用該IMAP伺服器的其他端口號！',
                '伺服器證書錯誤！您可能正在連接到一個仿冒的Email伺服器，如果您肯定這是您希望連接的伺服器，請在IMAP詳細設定中選擇忽略證書錯誤。',
                '無法獲得Email伺服器域名信息，請檢查您的Email伺服器設定！','此Email伺服器不能使用QTGate通訊技术。请选择其他email服务供应商！',
                'email伺服器提示SMTP用戶名或密碼錯！','伺服器證書錯誤！您可能正在連接到一個仿冒的Email伺服器，如果您肯定這是您希望連接的伺服器，請在SMTP詳細設定中選擇忽略證書錯誤。','SMTP連結提示未知錯誤','您已有相同的Email賬戶']
        },

        emailConform: {
            activeViewTitle:'驗證您的密鑰',
            emailTitle: '感謝您使用QTGate服務',
            info1_1: '您的密鑰還未完成驗證，QTGate已向您的密鑰郵箱發送了一封加密郵件，請檢查您的【',
            info1_2: '】郵箱。如果存在多封從QTGate過來的郵件時，以最後一封為準，打開信件並複制郵件。',
            info2: '複制內容從“-----BEGIN PGP MESSAGE----- （ 開始，一直到 ）----- END PGP MESSAGE-----” 結束的完整內容，粘貼到此輸入框中',
            emailDetail1: '尊敬的 ',
            emailDetail1_1: '',
            emailDetail2: '這是您的QTGate帳號激活密碼，請複制下列框內的全部內容:',
            bottom1_1:'此致',
            bottom1_2:'QTGate團隊',
            conformButtom: '驗 證',
            formatError: ['內容格式錯誤。複制內容從“-----BEGIN PGP MESSAGE----- （ 開始，一直到 ）----- END PGP MESSAGE-----” 結束的完整內容，粘貼到此輸入框中',
                '提供的內容不能被解密，請確認這是在您收到的最後一封從QTGate發送過來的激活信。如果還是沒法完成激活，請刪除您的密鑰重新生成和設定。',
                'QTGate未連接錯誤，請退出QTGate重新啟動！','無效激活碼！系統已經重新發送新的激活Email，請檢查郵箱重做激活。', '您的QTGate看上去有問題, 請刪除您的密鑰，重新設置您的QTGate！',
                'QTGate系統故障，請稍後再試。','您當天的數據通信量達到上限,請等待明天再試或升級用戶類型','用來通訊的Email設定有錯誤，請檢查IMAP設定後重試，或此Email類型不被QTGate支持',
                '您所選區域不能夠連結，請稍候再試'],
            activeing: '正在通訊中'
        },

        QTGateRegion: {
            title: 'QTGate代理伺服器區域',
            available: '服務中',
            unavailable: '準備中',
            proxyDomain: '域名解釋全程使用QTGate代理伺服器端',
            setupCardTitle: '使用連接技術:',
            connectQTGate:'正在獲得代理伺服器區域信息...',
            dataTransfer: '數據通訊:',
            dataTransfer_datail: ['全程使用QTGate代理伺服器','當本地不能夠到達目標伺服器時使用'],
            proxyDataCache: '瀏覽數據本地緩存:',
            proxyDataCache_detail: ['本地緩存','不緩存'],
            dataViaGateway: '全部互聯網數據通過QTGate代理伺服器',
            cacheDatePlaceholder: '緩存失效時間',
            clearCache: '立即清除所有緩存',
            GlobalIp: '本機互聯網IP地址:',
            QTGateRegionERROR:['發送連接請求Email到QTGate系統發生送信錯誤， 請檢查您的IMAP賬號的設定。 ',
                              ''],
            sendConnectRequestMail: ['您的QTGate客戶端沒有和QTgate系統聯機，客戶端已向QTgate系統重新發出聯機請求Email。和QTgate系統聯機需要額外的時間，請耐心等待。 ',
                                     '當免費用戶連續24小時內沒有使用客戶端，您的連接會被中斷。付費用戶情況下QTgate系統可保持持續聯機一個月。 '],
            
            GlobalIpInfo:'注意：當您按下【QTGate連結】時您會把您的本機互聯網IP提供給QTGate系統，如果您不願意，請選擇【@QTGate】技術來使用QTGate服務！',
            localPort: '本地代理伺服器端口號:',
            cacheDatePlaceDate: [{ name:'1小时', id: 1 }, { name:'12小时', id: 12 },{ name:'1日', id: 24 }, { name:'15日', id: 360 }, { name:'1月', id: 720 }, { name:'6月', id: 4320 }, { name:'永遠', id: -1 }],
            atQTGateDetail: ['世界首创的QTGate无IP互联网通讯技术，全程使用強加密Email通訊，客户端和代理服务器彼此不用知道IP地址，具有超强隐身和保护隐私，超強防火牆穿透能力。缺点是有延遲，网络通讯响应受您所使用的email服务供应商的伺服器影响，不適合遊戲視頻會話等通訊。',
                            'QTGate獨創HTTP強加密混淆流量代理技術，能夠隱藏變換您的IP地址高速通訊，隐身和保护隐私，抗干擾超強防火牆穿透能力。缺點是需要使用您的IP來直接連結代理伺服器。如果您只是需要自由訪問互聯網，則推薦使用本技術。',
                            '域名解釋使用QTGate代理伺服器端，可以防止域名伺服器緩存污染，本選擇不可修改。','互聯網數據全程使用QTGate代理，可以匿名上網隱藏您的互聯網形踪。','只有當本地網絡不能夠到達您希望訪問的目標時，才使用QTGate代為您連結目標伺服器，本選項可以節省您的QTGate流量。',
                            '通過本地緩存瀏覽紀錄，當您再次訪問目標伺服器時可以增加訪問速度，減少網絡流量，緩存瀏覽記錄只針對非加密技術的HTTP瀏覽有效。QTGate使用強加密技術緩存瀏覽紀錄，確保您的隱私不被洩漏','不保存緩存信息。',
                            '設置緩存有效時間，您可以及時更新伺服器數據，單位為小時。','本地Proxy服务器，其他手机电脑和IPad等可通過连结此端口來使用QTGate服务。請設定為3001至65535之間的數字','通過設置PATH鏈接路徑可以簡單給您的Proxy伺服器增加安全性，拒絕沒有提供PATH的訪問者使用您的Proxy伺服器。']
        },

        QTGateGateway: {
            title: 'QTGate服務使用詳細',
            processing: '正在嘗試连接QTGate代理服务器...',
            error: ['錯誤：您的賬號下已經有一個正在使用QTGate代理伺服器的連接，請先把它斷開後再嘗試連接。', '錯誤：您的賬號已經無可使用流量，如果您需要繼續使用QTGate代理伺服器，請升級您的賬戶類型。如果是免費用戶已經使用當天100M流量，請等待到明天繼續使用，如您是免費用戶已經用完當月1G流量，請等待到下月繼續使用。',
                    '錯誤：數據錯誤，請退出並重新啟動QTGate！'],
            connected:'已連接。',
            userType:['免費用戶','付費用戶'],
            datatransferToday:'當日可使用流量限額：',
            datatransferMonth:'本月可使用流量限額：',
            todaysDatatransfer: '本日可使用流量',
            monthDatatransfer: '本月可使用流量',
            gatewayInfo: ['代理伺服器IP地址：','代理伺服器連接端口：'],
            userInfoButton: '使用指南',
            stopGatewayButton:'切斷連接',
            disconnecting: '正在切斷中'
        },
        
        qtGateView: {
            title: 'QTGate連接',
            mainImapAccount: 'QTGate通訊用郵箱',
            QTGateConnectStatus: 'QTGate連接狀態',
            QTGateConnectResult: ['QTGate未聯機，請點擊連接QTGate！', '正在和QTGate聯機中', '已經連接QTGate', '連接QTGate時發生錯誤，請修改IMAP賬號設定',
                    '已經連接QTGate'],
            QTGateSign: ['您的密鑰狀態','還未獲得QTGate信任簽署,點擊完成信任簽署',
                '密钥获得QTGate信任签署是QTGate一个重要步骤，您今后在QTGate用户之间分享文件或传送秘密信息时，QTGate可以證明是您本人而非其他冒充者。你也可以通过您的密钥签署信任给其他QTGate用户，用以区别您自己的信任用户和非信任用户。',
                '正在獲得QTGate信任簽署中','系統錯誤，請重啓QTGate後再試，如果仍然存在，請嘗試重新安裝QTGate。', 'QTGate系統錯誤!']

        },
        feedBack: {
            title: '使用信息反饋',
            additional: '添附附加信息',
            okTitle:'發送至QTGate'
        },
	}
]

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
        showConnectedArea: ko.observable ( false )

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
        showConnectedArea: ko.observable ( false )
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
        showConnectedArea: ko.observable ( false )
    },{
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
        showConnectedArea: ko.observable ( false )
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
        showConnectedArea: ko.observable ( false )

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
        showConnectedArea: ko.observable ( false )
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
        showConnectedArea: ko.observable ( false )
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
        showConnectedArea: ko.observable ( false )
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
        showConnectedArea: ko.observable ( false )

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
        showConnectedArea: ko.observable ( false )
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
        showConnectedArea: ko.observable ( false )
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
        showConnectedArea: ko.observable ( false )
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
        showConnectedArea: ko.observable ( false )
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
        showConnectedArea: ko.observable ( false )
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
        showConnectedArea: ko.observable ( false )
    }
]
const availableImapServer = /imap\-mail\.outlook\.com$|imap\.mail\.yahoo\.com$|imap\.mail\.me\.com$|imap\.mail\.yahoo\.co\.jp$/i
const dummyIConnectCommand: IConnectCommand = {
    connectPeer: null,
    connectType: null,
    localServerIp: null,
    localServerPort: null
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
                smtpPortNumber: this.smtpPortChecked() === 'other' ? this.smtpServerPortNumber() : this.smtpPortChecked(),
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
                clientIpAddress: null
                
            }
            return data 
        }

        private checkSmtpImapAccountSetup = ( email: string, uuid: string ) => {
            
            if ( checkEmail ( email ).length ) {
                this.emailAddressShowError ( true )
                this.EmailAddressErrorType (0)
                $('.activating.element').popup({
                    on: 'focus',
                    movePopup: false
                })
                return false
            }
            if ( this.root.emailPool().length ) {
                const index = this.root.emailPool().findIndex ( n => { return n.emailAddress () === email && n.uuid !== uuid })
                if ( index > -1 ) {
                    this.emailAddressShowError ( true )
                    this.EmailAddressErrorType ( 1 )
                    $('.activating.element').popup({
                        on: 'focus',
                        movePopup: false
                    })
                    return false
                }
            }
            
            const data = getImapSmtpHost ( email )
            if ( ! availableImapServer.test (data.imap)) {
                this.emailAddressShowError(true)
                this.EmailAddressErrorType(2)
                $('.activating.element').popup({
                    on: 'focus',
                    movePopup: false
                })
                return false
            }
            
            this.emailAddressSuccess(true)
            if (!$(`#${ this.uuid }-imap`).hasClass('active')) {
                this.iMapServerName ( data.imap )
                this.iMapServerLoginName ( email )
                this.iMapSecure ( data.imapSsl )
                this.imapPortChecked ( data.ImapPort.toString ())
                this.imapIgnoreCertificate ( false )
            }
            
            if (!$(`#${ this.uuid }-smtp`).hasClass('active')) {
                this.SmtpServerName ( data.smtp )
                this.SmtpServerLoginName ( email )
                this.smtpSecure ( data.smtpSsl )
                this.smtpPortChecked ( data.SmtpPort[0].toString ())
                this.smtpIgnoreCertificate ( false )
            }
            //this.showImapSmtpdetailTreeView (true)
                
            return true
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
            private doingProcessBarTime = null
            public showImapTestSuccess = ko.observable ( false )
            public imapCheckReturnError = ko.observable (0)
            public dataRating = ko.observable (0)
            public saved = ko.observable ( false )
            public canDoDelete = ko.observable ( false )
            public showDeleteArea = ko.observable ( false )
            public sendToQTGate = ko.observable ( false )
            private process = $(`#${ this.uuid }>.progress`)
            
        // * view
        constructor ( private root: view ) {
            this.emailAddress.subscribe (( newValue: string ) => {
                this.passwordShowError ( false )
                this.emailAddressShowError ( false )
                this.imapAuthenticationFailed ( false )
                this.smtpAuthenticationFailed ( false )
                this.checkSmtpImapAccountSetup ( newValue, this.uuid )
                this.imapDataEnited ( true )
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
            if ( this.smtpPortArray.findIndex ( n => { return n === data.smtpPortNumber}) !== -1 ) {
                this.smtpPortChecked ( data.smtpPortNumber )
            } else {
                this.smtpPortChecked ( 'other' )
                this.smtpServerPortNumber ( data.smtpPortNumber )
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
            if ( checkEmail ( this.emailAddress()).length ) {
                this.checkSmtpImapAccountSetup ( this.emailAddress(), this.uuid )
                return false
            }
            if ( !this.checkSmtpImapAccountSetup ( this.emailAddress(), this.uuid ))
                return false
            this.imapCheckOk ( false )
            this.smtpCheckOk ( false )
            this.imapDataEditShow ( false )
            this.runningCheck ( true )
            let percent = 0
            this.imapCheckingStep (0)

            this.process.progress ('reset')
            const doingProcessBar = () => {
                clearTimeout ( this.doingProcessBarTime )
                this.doingProcessBarTime = setTimeout (() => {
                    this.process.progress ({
                        percent: ++ percent
                    })
                    if ( percent < 100 )
                        return doingProcessBar ()
                }, 200 )
            }

            doingProcessBar ()

            socketIo.emit ( 'startCheckImap', this.progressBarCss(), this.GetImapData (), ( ret: number ) => {

                if ( ret )
                    return this.callBackError ( ret )
                
                socketIo.once ( this.progressBarCss() + '-imap', ( err: number, result: number )  => {
                    if ( err ) {
                        return this.callBackError ( err )
                    }
                        
                
                    socketIo.once ( this.progressBarCss() + '-smtp', ( err: string )  => {
                        if ( err )
                            return this.callBackError ( err )
                        percent = 98
                        this.smtpCheckOk ( true )
                        this.process.addClass( 'success' )
                        this.showImapTestSuccess ( true )
                        const fromIInputData = $('.rating')
                        fromIInputData.rating ( 'disable' )
                        this.root.canShowAddAImapButton ()
                        this.process.removeClass( 'success' )
                        this.runningCheck ( false )
                        this.showImapTestSuccess ( false )
                        return this.imapCheckingStep (2)

                    })
                    percent = 33
                    this.imapCheckResult ( result )
                    this.dataRating ( result < 500 ? 3 : result < 1000 ? 2 : 1 )
                    
                    this.imapCheckOk ( true )
                    return this.imapCheckingStep (1)
                    
                })
                percent = 0
                return this.imapCheckingStep (0)
                
            })
            
            
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

        public menu = Menu
        public infoDefine = infoDefine
        public documentReady = ko.observable ( false )
		public tLang = ko.observable ( initLanguageCookie ())
        public languageIndex = ko.observable ( lang [ this.tLang() ])
        public systemSetup_systemPassword: KnockoutObservable< string > = ko.observable ( '' )
        public ImapErr = ko.observable ( false )
        public ImapAccountConnected = ko.observable ( false )
        public QTGateConnecting = ko.observable (-1)
        public conformTextErrorNumber = ko.observable (-1)
        public status: KnockoutObservable < systemViewStatus > = ko.observable ({
            SystemPassword_submitRunning: false
        })

        public topWindow = ko.observable ( true )

        public newVersionInstall () {
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
            public selectedQTGateRegion: KnockoutObservable <QTGateRegions> = ko.observable (this.QTGateRegions()[0])
            public showSystemError = ko.observable ( false )
            public feed = ko.observableArray ([])

            public deletePasswordNext () {
                socketIo.emit ( 'deleteKeyPair' )
                
            }
            private 

        // - keyPair info manager
            public keyPairInfomationView = ko.observable ( false )
        // - linuxUpdate pages
            public linuxUpdateStep = ko.observable ( true )
            
        // - linuxUpdate pages
        // - IMAP email setup view
            public emailAddressDoingCheck = ko.observable ( false )
            public cancelImapConnect = ko.observable ( false )
            public emailPool: KnockoutObservableArray < emailPoolData > = ko.observableArray ([])
            


        // - IMAP email setup view
        // - conformMailForm
            public checkActiveEmailError = ko.observable ( false )
            public conformText = ko.observable ('')
            public conformTextError = ko.observable ( false )
            public checkingActiveEmail = ko.observable ( false )
            public showConformMailForm = ko.observable ( false )
            public connectingImapAccount = ko.observable ( false )
            public qtgateImapAccount = ko.observable (0)
            public QTGateConnectActive = ko.observable ( false )
            public QTGateConnectRegionActive = ko.observable ( false )
            public QTGateConnectError = ko.observable (0)
            

        //-
        //- QTGate connect
            public showSendIMAPToQTGateInfo = ko.observable ( false )
            public commandStatus = ko.observable ('')
            public QTGateRegionInfo = ko.observable ( false )

            public QTGateConnect_SelectTech = ko.observable(-1)
            public QTGateConnect1 = ko.observable ('')
            public QTGateConnect2 = ko.observable ( false )
            public QTGateAllData = ko.observable ( false )
            public QTGateCacheUse = ko.observable ( false )
            public QTGate_CacheTime = ko.observable (0)
            public QTGate_showDeleteCacheButton = ko.observable ( false )
            public QTGateLocalProxyPort = ko.observable (3001)
            public QTGateLoacalProxyPath = ko.observable (( Math.random() * 100000 ).toString() )
            public localProxyPortError = ko.observable ( false )
            public QTGateGatewayActive = ko.observable ( false )
            public QTGateGatewayActiveProcess = ko.observable ( false )
            public QTGateGatewayError = ko.observable ( -1 )
            public QTTransferData = ko.observable ( transfer )
            public QTConnectData = ko.observable ( dummyIConnectCommand )
            public MenuItems = ko.observable ([ false, true, false, false, false ])
            public showKeyPairPorcess = ko.observable ( false )
            public showDisconnectbutton = ko.observable ( true )
            public ConnectGatewayShow = ko.observable ( false )
            public portNumberError = ko.observable ( false )

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
            QTGateConnectImapUuid: null,
            serverGlobalIpAddress: null,
            serverPort: null,
            connectedQTGateServer: false,
            localIpAddress: null,
            lastConnectType: 1
        })

		constructor () {
            this.QTGateLocalProxyPort.subscribe ( newValue => {
                this.localProxyPortError ( false )
                const num = parseInt ( newValue.toString())
                if (! /^[0-9]*$/.test(newValue.toString()) || !num || num < 1000 || num > 65535 ) {
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

            socketIo.emit ( 'init', ( err: Error, data: install_config ) => {

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

            socketIo.on ( 'newKeyPairCallBack', ( data: keypair ) => {
                
                if ( ! data ) {
                    if ( this.CancelCreateKeyPairSent )
                        return this.CancelCreateKeyPairSent = false
                    return this.MakeErrorNotify ( 'errorKeyPair', null )
                }
                
                this.keyPair ( data )
                
                if ( ! this.emailPool() || ! this.emailPool().length ) {
                    this.showAddImapDataButton ( false )
                    this.passwordError ( false )
                    this.SystemPassword_submitRunning ( false )
                    this.keyPair_delete_btn_view ( false )
                    this.newKeyPairRunningCancelButtonShow ( false )
                    this.showKeyPairPorcess ( false )
                    this.showKeyPairInformation ( true )
                    this.emailPool ( [ new emailPoolData ( this )] )
                    this.imapInputFormActive ( true )
                    return this.MenuItems ([false, false, true, false, false ])
                }
            })

            socketIo.on ( 'ImapData', ( data: IinputData[]) => {
                this.imapInputFormActive ( true )
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
                if ( index === -1 )
                    return this.showAddImapDataButton ( true )
            })

            socketIo.on ( 'deleteKeyPair', () => {
                this.keyPair ( initKeyPair )
                this.config().keypair = this.keyPair ()
                this.keyPairGenerateFormActive ( true )
                this.passwordError ( false )
                this.showConformMailForm ( false )
                this.ImapErr ( false )
                this.ImapAccountConnected ( false )
                this.emailAddressDoingCheck ( false )
                this.showConformMailForm ( false )
                return this.showKeyPairInformation ( false )
            })

            socketIo.on ( 'checkActiveEmailError', ( err, status ) => {
                if ( err !== null && err > -1 ) {
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
                this.imapInputFormActive ( true )
                this.QTGateConnectActive ( true )
                this.menuClick ( 3, true )
                //      have no imap data 
                if ( ! data ) {
                    //      show imap manager area
                    this.menuClick ( 2, true )
                    return this.QTGateConnectActive ( false )
                }
                /*
                if ( typeof data === 'boolean' ) {
                    
                    this.QTGateRegionInfo ( true )
                    $('.mainAccordion').accordion ('refresh')
                    this.QTGateConnectActive( false )
                    return socketIo.emit ( 'getAvaliableRegion', ( region: string [] ) => {
                        _QTGateRegions.forEach ( n => {
                            const index = region.findIndex ( nn => { return nn === n.qtRegion })
                            if ( index < 0 )
                                return n.available( false )
                            return n.available ( true )
                        })
                    })
                }
                */
                
                if ( !this.keyPair().verified ) {

                    const uu = this.emailPool().findIndex ( n => { return n.uuid === data.qtgateConnectImapAccount })
                    
                    this.qtgateImapAccount ( uu )
                    
                    this.QTGateConnecting ( data.qtGateConnecting )
                    
                    
                    this.QTGateConnectActive ( true )
                    this.QTGateConnectError ( data.error )

                    //      connected to QTGate system
                    if ( data.qtGateConnecting === 2 ) {
                        return $( '.activating.element' ).popup ({
                            on: 'click',
                            onHidden: () => {
                                $('#QTGateSignInformationPopupa').hide()
                            },
                            position: 'bottom left'
                        })
                    }

                    //      IMAP connect error!
                    if ( data.qtGateConnecting === 3 ) {
                        
                        return $( '.activating.element' ).popup({
                            on: 'click',
                            onHidden: () => {
                                this.emailPool()[ this.qtgateImapAccount()].callBackError ( data.error )
                                this.MenuItems ([false, false, true, false, false])
                                this.QTGateConnectActive ( false )
                            },
                            position: 'bottom left'
                        })

                    }
                    //      send verified ERROR!
                    if ( data.qtGateConnecting === 5 ) {
                        return $( '.activating.element' ).popup({
                            on: 'click',
                            onHidden: () => {
                            },
                            position: 'bottom left'
                        })
                    }
    
                    $('.QTGateConnect').accordion ( 'refresh' )
                    return $('#QTGateConnecting').removeClass( 'transition hidden' )
                }

                const process = $ ( '#connectImformationProcess' )
                let percent = 0
                const doingProcessBar = () => {
                    clearTimeout ( this.doingProcessBarTime )
                    this.doingProcessBarTime = setTimeout (() => {
                        process.progress ({
                            percent: ++ percent
                        })
                        if ( percent < 100 )
                            return doingProcessBar ()
                    }, 1000 )
                }
                this.QTGateConnectRegionActive ( true )
                //      first connect 
                if ( data.qtGateConnecting === 1 ) {
                    process.progress ( 'reset' )
                    doingProcessBar ()
                    this.QTGateRegionInfo ( true )
                    this.menuClick ( 3, true )
                    
                    return this.QTGateConnectActive ( false )
                }

                //          timeout!
                if ( data.qtGateConnecting === 6 ) {
                    return this.sendConnectRequestMail ( true )
                }
                //          send request mail error
                if ( data.qtGateConnecting === 5 ) {
                    clearTimeout ( this.doingProcessBarTime )
                    process.addClass ('error')
                    this.emailPool()[ this.qtgateImapAccount()].callBackError ( data.error )
                    return this.QTGateRegionERROR(0)
                    
                }

                if ( data.qtGateConnecting === 2 ) {
                    
                    socketIo.emit ( 'getAvaliableRegion', ( region: string [] ) => {
                        _QTGateRegions.forEach ( n => {
                            const index = region.findIndex ( nn => { return nn === n.qtRegion })
                            if ( index < 0 )
                                return n.available( false )
                            return n.available ( true )
                        })
                    })
                }
                

                this.QTGateRegionInfo ( false )
                //$('.mainAccordion').accordion('refresh')
                return this.QTGateConnectActive( false )
            })

            socketIo.on ( 'QTGateGatewayConnectRequest', data => {
                this.QTGateGatewayConnectRequestCallBack ( this, data )
            })

        }
        public sendConnectRequestMail = ko.observable (false)
        public QTGateRegionERROR = ko.observable (-1 )
        public LocalLanguage = 'up'

		public selectItem = ( that: any, site: () => number ) => {

            const self = this
            const tindex = lang [ self.tLang ()]
            let index =  tindex + 1
            if ( index > 3 ) {
                index = 0
            }
            //self.tLang ( site.LanguageJsonName )
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
        public takeScreen ()  {
            
            const { desktopCapturer, remote } = require ( 'electron' )
            const path = require ( 'path' )
            const Os = require ('os')
            const Fs = require ('fs')
            
            desktopCapturer.getSources({ types: [ 'window', 'screen' ], thumbnailSize: { width: 850, height: 480 }}, ( error, sources ) => {
                if ( error ) throw error
                const debug = true
                sources.forEach ( n => {
                    if ( n.name === 'QTGate' ) {
                        const QTGateFolder = path.join ( Os.homedir(), '.QTGate/tempfile' )
                        const screenshotFileName = uuID() + '.png'
                        const screenshotSavePath = path.join ( QTGateFolder, screenshotFileName )
                        
                        const screenshotUrl = '/tempfile/' + screenshotFileName
                        Fs.writeFile ( screenshotSavePath, n.thumbnail.toPng(), error => {
                            if ( error ) return console.log ( error )
                            this.feedBackAttachImg ( screenshotUrl )
                            this.showFeedBackWin ()

                            this.attachedLog ()
                            this.feedBackAttachImgPath ( screenshotSavePath )
                            /*
                            let win = new remote.BrowserWindow ({
                                minWidth: 900,
                                minHeight: 600,
                                backgroundColor: '#ffffff',
                            })
                            if ( debug ) {
                                win.webContents.openDevTools()
                                win.maximize()
                                
                            }
                            win.loadURL ( `http://127.0.0.1:${ this.config().serverPort }/feedBack?imagFile=${ screenshotUrl }` )
                            win.once ( 'closed', () => {
                                win = null
                            })
                            */
                        })
                    }
                })
                
            })
            
        }
        
        public feedBackTextArea = ko.observable ('')

        public feedBackSuccess () {
            this.returnMainWin ('#feedBackView')
            const Fs = require ('fs')
            const Os = require ('os')
            const path = require ( 'path' )
            const savePath = path.join ( Os.homedir(), '.QTGate/.feedBack.json')

            const data: feedBackData = {
                attachedLog: this.attachedLog(),
                attachImagePath: this.feedBackAttachImgPath (),
                comment: this.feedBackTextArea(),
                date: new Date ().toISOString ()
            }
            Fs.access ( savePath, err => {
                if ( err ) {
                    return Fs.writeFile ( savePath, JSON.stringify( [data] ), err => {})
                }
                const feeds: feedBackData[] = require (savePath)
                feeds.push ( data )
                return Fs.writeFile ( savePath, JSON.stringify( feeds ), err => {})
            })
            
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
                    this.canShowAddAImapButton ()

                    const index = this.emailPool().findIndex ( n => { return n.sendToQTGate()})
                    if ( index < 0 ) {
                        return this.qtgateImapAccount ( 0 )
                    }
                    this.emailPool()[0].emailAddress
                    
                    return this.qtgateImapAccount ( index )
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
                return
            const check = /^-----BEGIN PGP MESSAGE-----(\r)?\n(.+)((\r)?\n)/.test ( text ) && /(\r)?\n-----END PGP MESSAGE-----((\r)?\n)?/.test ( text )
            this.conformTextErrorNumber ( 0 )
            if ( ! check ) {
                this.conformTextError ( true )
                $( '.activating.element' ).popup({
                    on: 'click',
                    position: 'left center',
                    target: '#SendToQTGateTextArea',
                    onHidden: () => {
                        this.conformTextError ( false )
                    }
                })
            }

            return ( check )
        })

        public checkActiveEmailSubmit () {
            this.checkActiveEmailError ( false )
            this.checkingActiveEmail ( true )
            this.QTGateConnecting ( 4 )
            
            return socketIo.emit ( 'checkActiveEmailSubmit', this.conformText ())

        }

        public connectQTGate () {
            this.emailPool()[ this.qtgateImapAccount() ]
            socketIo.emit ( 'connectQTGate', this.emailPool()[ this.qtgateImapAccount() ].uuid )
        }

        public QTGateRegionCardClick ( index: number ) {

            const uu = this.QTGateRegions()[ index ]
            uu.selected ( true )
            this.selectedQTGateRegion ( uu )
            uu.showExtraContent ( true )
            this.ConnectGatewayShow ( true )
            const body = $( "html, body" )
            body.stop().animate({ scrollTop: 0 }, 100, 'swing', () => { 
                return this.overflowShow ( false )
            })
            return $('.popupField').popup({
                on:'click',
                position: 'bottom center',
            })
        }

        public selectedQTGateRegionCancel () {

            this.selectedQTGateRegion().selected ( false )
            this.selectedQTGateRegion().showExtraContent ( false )
            this.ConnectGatewayShow ( false )
            this.QTGateConnectRegionActive( true )
            this.menuClick ( 3, true )
            return false
        }

        public menuClick ( index: number, scroll: boolean ) {
            const uu = new Array (8).fill ( false )
            uu[index] = true
            this.MenuItems ( uu )
            const body = $( "html, body" )
            return body.stop().animate({ scrollTop: 0 }, 100, 'swing', () => { 
                return this.overflowShow ( scroll )
            })
           
        }

        public QTGateConnect1Click (em) {
            const uu = $(em).val ()
            this.QTGateConnect1 (uu.toString ())
        }

        public QTGateGatewayConnectRequest () {
            const data = this.selectedQTGateRegion()
            return socketIo.emit ('checkPort', this.QTGateLocalProxyPort(), err => {
                if ( err ) {
                    return this.localProxyPortError ( err )
                }
                const connect: IConnectCommand = {
                    account: this.config().account,
                    imapData: this.emailPool()[0].GetImapData(),
                    gateWayIpAddress: null,
                    region: data.qtRegion,
                    connectType: this.QTGateConnect1() === '1' ? 2 : 1,
                    localServerPort: this.QTGateLocalProxyPort(),
                    AllDataToGateway: !this.QTGateConnect2 (),
                    error: null,
                    fingerprint: null,
                    localServerIp: null
                    
                }
                
                data.error ( -1 )
                //root.QTGateConnectRegionActive ( false )
                //root.QTGateGatewayActiveProcess ( true )
    
                const process = $('.regionConnectProcessBar').progress('reset')
                let doingProcessBarTime = null
                let percent = 0
                const doingProcessBar = () => {
                    clearTimeout ( doingProcessBarTime )
                    doingProcessBarTime = setTimeout(() => {
                        process.progress ({
                            percent: ++percent
                        })
                        if ( percent < 100 )
                            return doingProcessBar()
                    }, 1000 )
                }
    
                doingProcessBar()
                data.showExtraContent ( false )
                data.showRegionConnectProcessBar ( true )
                
                socketIo.emit( 'QTGateGatewayConnectRequest', connect, _data => {
                    clearTimeout ( doingProcessBarTime )
                    data.showRegionConnectProcessBar ( false )
                    if ( _data.error > -1 ) {
                        data.showExtraContent ( true )
                        //this.QTGateConnectRegionActive ( true )
                        //this.QTGateGatewayActiveProcess ( false )
                        return data.error ( _data.error )
                    }
                    return this.QTGateGatewayConnectRequestCallBack ( this, _data  )
                    
                })
                
                return false
            })
            

        }

        private QTGateGatewayConnectRequestCallBack ( _self: view, _data: IConnectCommand ) {
            const self = _self|| this
            self.QTTransferData ( _data.transferData )
            self.QTConnectData ( _data )
            $( '.userDetail' ).progress()
            const index = self.QTGateRegions().findIndex (( n: QTGateRegions ) => { return n.qtRegion === _data.region })
            if ( index < 0 ) {
                return
            }

            const data = self.QTGateRegions()[ index ]
            this.QTGateConnectRegionActive ( true )
            this.menuClick ( 3, false )
            this.selectedQTGateRegion ( data )
            data.selected ( true )
            data.showExtraContent ( false )
            data.available ( true )
            this.ConnectGatewayShow ( true )
            return data.showConnectedArea ( true )

        }
        public disconnecting = ko.observable ( false )
        public disconnectClick () {
            
            this.disconnecting ( true )
            socketIo.emit ( 'disconnectClick', () => {
                this.selectedQTGateRegion().showConnectedArea( false )
                this.ConnectGatewayShow ( false )
                this.selectedQTGateRegionCancel () 
                this.disconnecting ( false )
            })
        }


	}
}
const linkClick = ( url: string ) => {
    const { shell } = require ( 'electron' )
    event.preventDefault ()
    shell.openExternal ( url )
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