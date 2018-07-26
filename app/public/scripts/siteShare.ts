const uuid_generate = function () {
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

const uuID = function () {
    return uuid_generate().replace( /-/g,'')
}

Date.isLeapYear = function (year) { 
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)); 
};

Date.getDaysInMonth = function (year, month) {
    return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};

Date.prototype.isLeapYear = function () { 
    return Date.isLeapYear(this.getFullYear()); 
};


Date.prototype.getDaysInMonth = function () { 
    return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
};

Date.prototype.addMonths = function (value) {
    var n = this.getDate();
    this.setDate(1);
    this.setMonth(this.getMonth() + value);
    this.setDate(Math.min(n, this.getDaysInMonth()));
    return this;
};

const conetImapAccount = /^qtgate_test\d\d?@icloud.com$/i

const isElectronRender = typeof process === 'object'

const cookieName = 'langEH'
const passwdCookieName = 'CoNET'
const EmailRegexp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i
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

enum lang { 'zh', 'ja', 'en', 'tw' }

const initLanguageCookie = function () {
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
const DayTime = 1000 * 60 * 60 * 24
const monthTime = 30 * DayTime
const yearTime = 12 * monthTime

const getPlanPrice = function ( plan: string, isAnnualPlan: boolean ) {
	const _plan = planArray [ planArray.findIndex ( function ( n ) {
        return n.name === plan
    })]
    if ( !_plan ) {
        return null
    }
    return isAnnualPlan ? _plan.annually : _plan.monthlyPay
}

const planArray = [
    {
		name:'free',
		showName: ['免费用户','無料ユーザー','FREE USER','免費用戶'],
        monthlyPay: 0,
		annually: 0,
		annuallyMonth: 0,
        next:'p1',
        share: 0,
		internet: 0,
		tail: ko.observable ( false ),
        multi_gateway:0,
		showNote: false,
		showButton: ko.observable ( false ),
		features: [{
			title: ['代理区域','エリア','Region','代理區域'],
			detail: ['欧洲2区域','ヨーロッパ 2 エリア','2 regions in Europe','歐洲2區域'],
		},{
			title: ['服务器','サーバー','Server','伺服器'],
			detail: ['共享','共有','Share','共享'],
		},{
			title: ['月流量限制','月データ制限','Bandwidth','月流量限制'],
			detail: ['无限制','無制限','Unlimited','無限制'],
		},{
			title: ['多代理','マルチプロクシ','Multi-Gateway','多代理'],
			detail: ['1','1','1','1'],
		},{
			title: ['客户端数','端末数','Devices','客戶端數'],
			detail: ['无限制','無制限','Unlimited','無限制'],
		}]

    },{
		name:'p1',
		showName: ['普通用户','普通ユーザー','NORMAL USER','普通用戶'],
        monthlyPay: 688,
		annually: 5988,
		annuallyMonth:499,
        next:'p2',
        share: 0,
		internet: 0,
		tail: ko.observable ( false ),
        multi_gateway:0,
		showNote: false,
		showButton: ko.observable ( false ),
		features: [{
			title: ['代理区域','エリア','Region','代理區域'],
			detail: ['全球16区域','グローバル16区域','16 regions worldwide ','全球16區域'],
		},{
			title: ['服务器','サーバー','Server','伺服器'],
			detail: ['共享','共有','Share','共享'],
		},{
			title: ['月流量限制','月データ制限','Bandwidth','月流量限制'],
			detail: ['无限制','無制限','Unlimited','無限制'],
		},{
			title: ['多代理','マルチプロクシ','Multi-Gateway','多代理'],
			detail: ['2','2','2','2'],
		},{
			title: ['客户端数','端末数','Devices','客戶端數'],
			detail: ['无限制','無制限','Unlimited','無限制'],
		}]
    },{
		name:'p2',
		showName: ['超级用户','スーパーユーザー','POWER USER','超級用戶'],
        monthlyPay: 1988,
		annually: 19999,
		annuallyMonth: 1667,
        share: 0,
        internet: 0,
        multi_gateway:0,
		showNote: false,
		tail: ko.observable ( false ),
		showButton: ko.observable ( false ),
		features: [{
			title: ['代理区域','エリア','Region','代理區域'],
			detail: ['全球16区域','グローバル16区域','16 regions worldwide ','全球16區域'],
		},{
			title: ['服务器','サーバー','Server','伺服器'],
			detail: ['独占','独占','Dedicated','獨占'],
		},{
			title: ['月流量限制','月データ制限','Bandwidth','月流量限制'],
			detail: ['无限制','無制限','Unlimited','無限制'],
		},{
			title: ['多代理','マルチプロクシ','Multi-Gateway','多代理'],
			detail: ['4','4','4','4'],
		},{
			title: ['客户端数','端末数','Devices','客戶端數'],
			detail: ['无限制','無制限','Unlimited','無限制'],
		}]
    }
]

const nextExpirDate = function ( expire: string ) {
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

const getRemainingMonth = function ( expire: string ) {
    const _expire = new Date ( expire )
    const _nextExpirDate = nextExpirDate ( expire )
    return _expire.getFullYear () === _nextExpirDate.getFullYear () ? _expire.getMonth() - _nextExpirDate.getMonth() : ( 12 - _nextExpirDate.getMonth() + _expire.getMonth() )
}

const getPassedMonth = function ( start: string ) {
    const startDate = new Date ( start )
    const now = new Date ()
    const passwdYear = now.getFullYear() - startDate.getFullYear ()
    const nowMonth = now.getMonth ()
    const startMonth = startDate.getMonth ()
    const startDay = startDate.getDate()
    const nowDay = now.getDate ()
    let ret = startMonth >= nowMonth ? 12 - startMonth + nowMonth + ( passwdYear - 1 ) * 12 : passwdYear * 12 + nowMonth - startMonth - 1
    ret += startDay >= nowDay ? 0 : 1
    return ret
}

const getAmount = function ( amount ) {
    if ( !amount )
        return null
    if ( typeof amount === 'number' ) {
        amount = amount.toString()
    }
    const ret = amount.split('.')
    return ret.length === 1 ? amount + '.00' : amount 
}

const getCurrentPlanCancelBalance = function ( expiration: string, planName: string ) {
	
    const price = getPlanPrice ( planName, true )
    const normalPrice = getPlanPrice ( planName, false )
    const usedMonth = 12 - getRemainingMonth ( expiration )
	const passedCost = Math.round (( price - normalPrice * usedMonth ) * 100 ) / 100
	return passedCost > 0 ? passedCost : 0
}

const getExpire = function ( startDate: string, isAnnual: boolean ) {
	const start = new Date( startDate )
	const now = new Date ()
	const passedMonth = Math.round (( now.getTime () - start.getTime () ) / monthTime - 0.5 )
	isAnnual ? start.setFullYear ( start.getFullYear() + 1 ) : start.setMonth ( passedMonth + 1 )
	return start
}

function getExpireWithMonths ( month: number ) {
    let date = new Date()
    return date.addMonths( month )
}

const getCurrentPlanUpgradelBalance = function ( expiration: string, planName: string, isAnnual: boolean ) {
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

const infoDefine = [
	{
        perment:{
            serverTitle:'服务器'
        },

        twitter: {
            newTwitterAccount: `请输入您的推特APP信息，如何获得和设置推特账号APP信息，请点击<a target="_blank" href='https://github.com/QTGate/QTGate-Desktop-Client/wiki/Create-Twitter-APP')">这里</a>`,
            addAccount:'添加推特账户',
            following: ['正在关注','解除关注','关注'],
            followers:'关注者',
            videoSizeOver: '视频超推特限制: 尺寸 < (1280x1024)，文件 < 300MB，总时间 < 140秒，请转换视频后再上传',
            second: '秒',
            min: '分',
            retweeted: '已转推',
            hour: '小时',
            month:'月',
            day:'日',
            replying: '回复: ',
            newTwitterDistroyButtonTitle: ['放弃推文','舍弃对话串'],
            returnEdit: '回编辑',
            close:'关闭',
            newTwitterTitle: ['撰写新推文','撰写新对话串'],
            twitterBottonTitle:['发推','全部发推'],
            urlInfo: '<h3>推特客户端预览版</h3><p>用户可以无限量免费使用此客户端，免翻墙(不使用VPN，不用连结CoGate代理服务器)匿名访问(您的真实IP地址不会泄露给推特)您的推特账户。</p><p>其他设备可以输入以下网址打开此APP应用</p>',
            accountError:'推特回送错误信息提示：您输入的APP应用设定信息有误。请检查您的推特APP信息后再试。'
        },

        account:{
            title: '账户管理',
            segmentTitle:'账户: ',
            stripePayment: '银行网关支付',
            promoButton: '我有促销码',
            qtgatePayment:'CoNET网关支付',
            paymentProblem1: '支付遇到问题',
            paymentProblem:'您的当前所在区域看上去银行网关被和谐，您可以使用CoNET网关支付来完成支付',
            QTGatePayRisk: '使用CoNET安全网关支付，如果您有安全疑虑，请使用Stript安全网关支付。',
            willPayNextExpir:'自动扣款 ',
            openAutomatically: '打开自动扣款',
            CancelSuccess: function ( PlanExpire: string, isAnnual: boolean, returnAmount: number ) {
                return `中止订阅成功。您可以一直使用您的原订阅到${ new Date( PlanExpire) .toLocaleDateString() }为止。以后您将会自动成为CoNET免费用户，可以继续使用CoNET的各项免费功能。${ isAnnual ? `退款金额us$${ returnAmount }会在5个工作日内退还到您的支付卡。`: '下月起CoNET系统不再自动扣款。'} 祝您网络冲浪愉快。`
            },
            currentPlan:'当前订阅: ',
            cardPaymentErrorMessage:[
        /* 0 */ '输入的信用卡号有误，或支付系统不支持您的信用卡！',
        /* 1 */ '输入的信用卡期限有误！',
        /* 2 */ '输入的信用卡安全码有误！',
        /* 3 */ '输入的信用卡持有人邮编有误！',
        /* 4 */ '支付失败，支付无法完成请稍后再试',
        /* 5 */ '支付数据存在错误',
        /* 6 */ '您的付款被发卡行所拒绝',
        /* 7 */ '发生错误，请稍后再试',       
            
            ],
            planPrice: '订阅原价：',
            cancelPlanButton:'中止当前订阅',
            needPay: '应付金额：',
            
            currentPlanExpire: [
                '订阅截止日期：',
                '下次自动续订日',
            ],
            monthResetDay:'月数据重置日：',
            monthResetDayAfter:'',
            oldPlanBalance: '原计划剩余价值：',
            currentAnnualPlan: ['月度订阅','年度订阅'],
            MonthBandwidthTitle:'月度代理服務器限额：',
            dayBandwidthTitle:'毎日限额：',
            upgradeTitle:'升级',
            planExpirDate: function ( year: string, month: string, day: string ) { return `${ year } 年${ month }月${ day }日`},
            
            accountOptionButton: '账户选项',
            paymentProcessing:'正在通讯中...',
            cantUpgradeMonthly: '年度计划不可降级为月度计划。请先终止您当前订阅的年度计划，再重新申请此月度订阅',
            DowngradeTitle:'降级账户选项',
            cancelPlan:'终止订阅计划',
            cantCancelInformation: '您的账户如果是免费用户，CoNET测试用户，或使用优惠码产生的订阅用户，此类账户可以升级但不能被中止',
            MonthBandwidthTitle1:'传送限额',
            bandwidthBalance:'月度数据剩余量：',
            serverShareData:['共享服务器','一台独占服务器*','二台独占服务器*','四台独占服务器'],
            networkShareTitle:'代理服务器网络',
            multiOpn:'OPN并发多代理技术',
            continue:'下一步',
            paymentSuccessTitile: '謝謝您',
            paymentSuccess:'您的订阅已经完成，祝您网络冲浪愉快。',
            qtgateTeam: 'CoNET开发团队敬上',
            monthlyAutoPay: function ( monthCost: number ) { return `<span>每月自动扣款</span><span class="usDollar">@ us$</span><span class="amount">${ monthCost }</span>/月<span>` },
            annualPay: function ( annual_monthlyCost: string ) { return `<span>年付款每月只需</span><span class="usDollar">@ us$</span><span class="amount" >${ annual_monthlyCost }</span>/月<span>`},
            monthlyPay:'月收费',
            expirationYear: '信用卡期限',
            payAmountTitile:'合计支付金额',
            calcelPayment:'中止付款',
            doPayment:'确认付款',
            cardNumber: '信用卡号',
            canadaCard:'*加拿大持卡人将自动加算GST(BC)5%',
            cvcNumber: '信用卡安全码',
            aboutCancel: '关于中止订阅',
            postcodeTitle: '信用卡持有人邮编',
            serverShareData1:'使用OPN并发多代理技术，同时使用数大于独占数时，会相应分享您所独占的资源',
            internetShareData:['共享高速带宽','独享单线高速带宽*','独享双线高速带宽*','独享四线高速带宽'],
            maxmultigateway: ['最大同时可二条并发代理数','最大同时可使用四条并发代理数*','最大同时可使用四条并发代理数'],
            multiRegion:['单一代理区域并发代理','多代理区域混合并发代理','多代理区域混合并发代理','多代理区域混合并发代理'],
            downGradeMessage:'您正在操作降级您的订阅，如果操作成功您将从下月您的订阅之日起，实行新的订阅，如果您是。',
            cancelPlanMessage:'CoNET的订阅是以月为基本的单位。您的月订阅将在下月您的订阅起始日前被终止，您可以继续使用您的本月订阅计划，您将自动回到免费用户。如果您是每月自动扣款，则下月将不再扣款。如果您是年度订阅计划，您的退款将按普通每月订阅费，扣除您已经使用的月份后计算的差额，将自动返还您所支付的信用卡账号，如果您是使用促销码，或您是测试用户，您的终止订阅将不能被接受。',
            cancelPlanMessage1: function ( isAnnual: boolean, amount: number, monthlyPay: number, expire: string, passedMonth: number, totalMonth: number ) {
                return `<span>您的订阅计划是${ isAnnual ? `年度订阅，退还金额将按照您已付年订阅费 </span><span class="usDollar">us$</span><span class="amount">${ amount / 100 }</span> - 该订阅原价 <span class="usDollar">us$</span><span class="amount">${ monthlyPay /100 }</span><span> X 已使用月数(包括本月) </span><span class="amount">${ passedMonth }</span> = 应该退还的金额 <span class="usDollar">us$</span><span class="amount">${ amount - passedMonth * monthlyPay > 0 ? ( amount - passedMonth * monthlyPay ) /100 : 0 }</span><span>，将在7个工作日内，退还到您原来支付的信用卡账户。</span>`: `月订阅，您的订阅将下次更新日</span><span class="amount">${ nextExpirDate( expire ).toLocaleDateString() }</span><span>时不再被自动扣款和更新。</span>`}`
            }
        },

        QTGateDonate: {
            title: 'CoNET赞助商提供的免流量网站',
            meta_title:'捐赠者：',
            detail:'所有的CoNET用户，使用CoNET代理伺服器，访问赞助商赞助的网站时产生的流量，都不被计入。免费用户需注意的是，如本日或本月流量已用完，无法接入CoNET代理伺服器，则无法利用此功能'
        },
        
        QTGateInfo: {
            title:'功能简介',
            version:'本机版本：v',
            detail:[{
                header: '隐身匿名自由上网OPN',
                color: '#a333c8',
                icon: 'exchange',
                detail: 'CoNET通过使用<a onclick="return linkClick (`https://zh.wikipedia.org/wiki/%E9%AB%98%E7%BA%A7%E5%8A%A0%E5%AF%86%E6%A0%87%E5%87%86`)" href="#" target="_blank">AES256-GCM</a>和<a onclick="return linkClick (`https://zh.wikipedia.org/wiki/PGP`)" href="#" target="_blank">OpenPGP</a>加密Email通讯，创造了OPN匿名网络通讯技术，CoNET公司首创的@OPN技术，它全程使用加密Email通讯，客户端和代理服务器彼此不用交换IP地址来实现高速通讯。iOPN通讯技术是利用普通HTTP协议下的混淆流量加密技术，能够隐藏变换您的IP地址高速通讯。二种通讯方式都能够让您，隐身和安全及不被检出的上网，保护您的隐私，具有超强对抗网络监控,网络限制和网络阻断。'
            },{
                color: '#e03997',
                icon: 'talk outline',
                header:'无IP点对点即时加密通讯服务QTChat',
                detail:'CoNET用户之间通过email的点对点即时通讯服务，它具有传统即时通讯服务所不具有的，匿名无IP和用户之保持秘密通讯的功能。QTChat加密通讯服务可以传送文字，图片和视频文件信息，CoNET系统只负责传送信息，不拥有信息，也无法检查信息本身，所以CoNET不承担信息所有的法律责任。QTChat支持群即时通讯，将支持视频流直播服务。'
            },{
                color: '#6435c9',
                icon: 'cloud upload',
                header:'加密文件匿名网络云储存及分享功能QTStorage',
                detail:'用户通过申请多个和不同的免费email服务商账号，可以把一个文件加密拆分成多个部分，分别存储在不同的email账号下，可以保密安全和无限量的使用网络储存。用户还可以通过CoNET系统在CoNET用户之间分享秘密文件。'
            },
            {
                color: 'darkcyan',
                icon: 'spy',
                header: '阻断间谍软件向外送信功能',
                detail: 'CoNET系统连接全球DNSBL联盟数据库，用户通过订阅CoNET系统黑名单列表，并使用CoNET客户端上网，让潜伏在您电子设备内的间谍软件，它每时每刻收集的信息，不能够被送信到其信息收集服务器，能够最大限的保障您的个人隐私。'
            },{
                color: '#6435c9',
                icon: 'external share',
                header:'本地VPN服务器',
                detail:'CoNET用户在户外时可以通过连接自己家里的VPN，来使用CoNET客户端隐身安全上网。'
            }]
        },

        cover: {
            firstTitle1: 'CoNET平台',
            firstTitle2: '安全隐私自由的互联网',
            start: '开门',
            proxyStoped: 'CoGate定制代理服务器已经停止，如需使用请重新定制代理服务器。'
        },
        
        firstNote: {
            title: '欢迎使用CoNET，感谢您使用我们的产品和服务(下称“服务”)。本服务由总部设在加拿大的CoNET技术有限公司.下称“CoNET”提供。',
            firstPart: '您使用我们的服务即表示您已同意本条款。请仔细阅读。使用我们的服务，您必须遵守服务中提供的所有政策。',
            detail: [
                {
                    header: '关于我们的服务',
                    detail: '请勿滥用我们的服务，举例而言: 请勿干扰我们的服务或尝试使用除我们提供的界面和指示以外的方法访问这些服务。您仅能在法律(包括适用的出口和再出口管制法律和法规)允许的范围内使用我们的服务。如果您不同意或遵守我们的条款或政策，请不要使用我们所提供的服务，或者我们在调查可疑的不当行为，我们可以暂停或终止向您提供服务。'
                },{
                    header: null,
                    detail: '使用我们的服务并不让您拥有我们的服务或您所访问的内容的任何知识产权。除非您获得相关内容所有者的许可或通过其他方式获得法律的许可，否则您不得使用服务中的任何内容。本条款并未授予您使用我们服务中所用的任何商标或标志的权利。请勿删除、隐藏或更改我们服务上显示的或随服务一同显示的任何法律声明。'
                },{
                    header: '关于OPN无IP通讯技术和隐私保护的局限性',
                    detail: 'OPN是CoNET世界首创的使用Email的IMAP协议建造一个无IP通讯环境，在您利用CoNET进行通讯过程中，CoNET无法获得您目前所使用的IP地址（使用iOPN来连结CoNET代理服务器时，您需要向CoNET系统提供您当前的IP地址），可以最大限度的保障您的个人隐私。但是这项技术并不能够保证您的信息绝对的不被泄露，因为您的IP地址有可能被记录在您所使用的Email服务供应商，如果持有加拿大法院令寻求CoNET的Log公开，再和Email服务供应商的Log合并分析，可能会最终得到您的信息。 CoNET并不能够绝对保障您的隐私。 '
                },
                {
                    header: '关于个人隐私保护，系统日志和接收CoNET传送的信息',
                    detail: '在您使用服务的过程中，我们可能会向您发送服务公告、管理消息和其他信息。您可以选择不接收上述某些信息。'
                },{
                    header: null,
                    detail: '当您使用我们的服务时，我们为了计费处理会自动收集非常有限的数据流量信息，并存储到服务器日志中。数据流量信息仅用于计算客户应支付通讯费用而收集的，它收集的数据是：日期，用户帐号，所使用的代理区域和代理服务器IP，数据包大小，下载或上传。例如：'
                },{
                    header: null,
                    detail: '<p class="tag info">06/20/2017 18:12:16, info@CoNET.com, francisco, 104.236.162.139, 300322 byte up, 482776323 byte down.</p><p class="tag info">06/21/2017 12:04:18, info@CoNET.com, francisco, 104.236.162.139, 1435226 byte up, 11782238 byte down.</p>'
                },
                {
                    header: null,
                    detail: 'CoNET没有保存除了以上信息以外的任何其他信息。我们会配合并向持有加拿大法院令的执法机构提供此日志文件。如果您是加拿大以外地区的执法机构，有这方面信息披露的需求，请通过加拿大外交部来联系我们：'
                },{
                    header: null,
                    detail: '<a class="tag alert" href="http://www.international.gc.ca/">http://www.international.gc.ca/</a>'
                },
                {
                    header: '版权所有权',
                    detail: '该软件是CoNET的智慧产权，并且受到相关版权法，国际版权保护规定和其他在版权授与国家内的相关法律的保护。该软件包含智慧产权材料, 商业秘密及其他产权相关材料。你不能也不应该尝试修改，反向工程操作，反汇编或反编译CoNET服务，也不能由CoNET服务项目创造或衍生其他作品。'
                },
                {
                    header: null,
                    detail: '关于我们服务中的软件，CoNET授予您免许可使用费、不可转让的、非独占的全球性个人许可, 允许您使用由CoNET提供的、包含在服务中的软件。本许可仅旨在让您通过本条款允许的方式使用由CoNET提供的服务并从中受益。您不得复制、修改、发布、出售或出租我们的服务, 或所含软件的任何部分。'
                },{
                    header: '修改与终止服务',
                    detail: '我们持续改变和改善所提供的服务。我们可能会新增或移除功能或特性，也可能会暂停或彻底停止某项服务。您随时都可以停止使用服务，尽管我们并不希望您会这样做。 CoNET也可能随时停止向您提供服务，或对服务附加或设定新的限制。'
                },
                {
                    header: '服务的责任',
                    detail: '在法律允许的范围内，CoNET及其供应商和分销商不承担利润损失、收入损失或数据、财务损失或间接、特殊、后果性、惩戒性或惩罚性损害赔偿责任。'
                },{
                    header: '法律规定的贸易禁止事项',
                    detail: '当您按下同意按钮，表示您已经确认您不属于加拿大法律所规定的禁止贸易对象的列表之中。 '
                },
                {
                    header: '服务的商业使用',
                    detail: '如果您代表某家企业使用我们的服务，该企业必须接受本条款。对于因使用本服务或违反本条款而导致的或与之相关的任何索赔、起诉或诉讼，包括因索赔、损失、损害赔偿、起诉、判决、诉讼费和律师费而产生的任何责任或费用，该企业应对CoNET及其关联机构、管理人员、代理机构和员工进行赔偿并使之免受损害。'
                }, {
                    header: '本条款的变更和约束力',
                    detail: '关于本条款：我们可以修改上述条款或任何适用于某项服务的附加条款，例如，为反映法律的变更或我们服务的变化而进行的修改。您应当定期查阅本条款。我们会在本网页上公布这些条款的修改通知。我们会在适用的服务中公布附加条款的修改通知。所有修改的适用不具有追溯力，且会在公布十四天或更长时间后方始生效。但是，对服务新功能的特别修改或由于法律原因所作的修改将立即生效。如果您不同意服务的修改条款，应停止使用服务。如果本条款与附加条款有冲突，以附加条款为准。'
                }
                , {
                    header: null,
                    detail: '本条款约束CoNET与您之间的关系，且不创设任何第三方受益权。如果您不遵守本条款，且我们未立即采取行动，并不意味我们放弃我们可能享有的任何权利（例如，在将来采取行动）。如果某一条款不能被强制执行，这不会影响其他条款的效力。加拿大BC省的法律（不包括BC州的法律冲突规则）将适用于因本条款或服务引起的或与之相关的纠纷。因本条款或服务引起的或与之相关的所有索赔，只能向加拿大BC省法院提起诉讼，且您和CoNET同意上述法院拥有属人管辖权。'
                }
            ],
            disagree: '不同意',
            agreeMent: 'CoNET服务条款和隐私权'
            
        },

        linuxUpdate:{
            newVersionDownload: '点击这里下载并安装',
            step1: '请更新版本：',
            step2: '授权新版本CoNET为可执行文件',
            step2J1:'/images/linuxUpdate1_tw.jpg',
            step2J2:'/images/linuxUpdate2_tw.jpeg',
            step2_detail1: '右键点击已下载的CoNET图标，选择菜单里的文件属性',
            step2_detail2: '在权限选项里，选勾“允许档案文件执行”。',
            step3:'退出旧版本CoNET后，双击CoNET文件执行安装',
            exit: '退出CoNET',
            tryAgain:'再次尝试',
            refresh:'刷新页面'
        },

        imapInformation: {
            title: '通讯专用Email邮箱设置',
            tempImapAccount: `申请临时邮箱有困难？您可以暂时使用<a href="#" onclick="return linkClick ('https://github.com/QTGate/QTGate-Desktop-Client/wiki/iCloud%E8%87%A8%E6%99%82%E5%B8%B3%E6%88%B6')">CoNET提供的临时IMAP帐号供各位测试使用</a>`,
            infomation: `请设置CoNET通讯专用Email邮箱信息。由于此账户的用户名和密码信息会提交给CoNET系统，为了防止您的个人信息被泄漏，请新申请一个临时Email账户。目前CoNET技术对应<a href="#" onclick="return linkClick ('https://www.icloud.com/')">苹果iCloud</a>，<a href="#" onclick="return linkClick ('https://www.microsoft.com/zh-tw/outlook-com/')">微软OUTLOOK</a>，<a href="#" onclick="return linkClick ('https://tw.mail.yahoo.com/')">雅虎邮箱</a>，<a href="#" onclick="return linkClick ('https://www.zoho.com/mail/')">俄罗斯ZOHO邮箱</a>，<a href="#" onclick=" return linkClick ('https://gmail.com')">Google邮箱</a>，<a href="#" onclick="return linkClick ('https://www.gmx.com/mail/#.1559516-header-nav1-2')">美国在线GMX邮箱</a>，CoNET强力推荐使用苹果公司的Email可以达到最佳速度(@OPN无IP连结技术只对应苹果公司iCloud邮箱)。密码请使用Email服务商的<a href="#" onclick="return linkClick ('https://tw.help.yahoo.com/kb/SLN15241.html')">应用密码</a>。对于Email供应商在应用密码申请时，须<a href="#" onclick="return linkClick ('https://tw.help.yahoo.com/kb/%E9%96%8B%E5%95%9F%E5%85%A9%E6%AD%A5%E9%A9%9F%E9%A9%97%E8%AD%89-sln5013.html')" >二步认证</a>并提供手机号码接受验证码，为保护您的隐私，建议使用免费在线代理接收验证码服务。( 如<a href="#" onclick="return linkClick('http://receive-sms-online.com/')">receive-sms-online.com</a>, <a href="#" onclick="return linkClick('https://sms-online.co/receive-free-sms')" >sms-online.co</a>, <a href="#" onclick="return linkClick('https://receive-a-sms.com/')" >receive-a-sms.com</a> ) 更多请 <a href="#" onclick="return linkClick ('http://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=0&rsv_idx=1&tn=baidu&wd=%E5%85%8D%E8%B4%20%B9%E5%9C%A8%E7%BA%BF%E6%8E%A5%E6%94%B6%E6%89%8B%E6%9C%BA%E9%AA%8C%E8%AF%81%20%E7%A0%81&rsv_pq=e94f47a50001f66f&rsv_t=b03ePiy3rHH0T4FVoWB8Hx9vrVdZLzVhhErWOo4xdBpjDw%2BtGri%2BViTaVAw&rqlang=cn&rsv_enter=1&rsv_sug3=42&rsv_sug1=5&rsv_sug7=100')">百度查找</a>，<a href="#" onclick="return linkClick ('https://www.google.com/search?q=%E5%85%8D%E8%B4%B9%E5%9C%A8%E7%BA%BF%E6%8E%A5%E6%94%B6%E6%89%8B%E6%9C%BA%E9%AA%8C%E8%AF%81%E7%A0%81&oq=%E5%85%8D%E8%B4%B9%E5%9C%A8%E7%BA%BF%E6%8E%A5%E6%94%B6%E6%89%8B%E6%9C%BA%E9%AA%8C%E8%AF%81%E7%A0%81&aqs=chrome..69i57j69i60.254j0j4&sourceid=chrome&ie=UTF-8')">Google查找</a>。`,
            serverDetail: '详细设定：',
            imapServer: 'IMAP服务器设定',
            imapServerInput: 'IMAP服务器IP或域名',
            UserName: '登陆用户名称',
            Ssl: '使用Ssl加密信息传输：',
            portName: '通讯端口号：',
            otherPortNumber: '其他号码：',
            Error_portNumber: '端口号应该是从1-65535之间，并且不等于22的数字',
            smtpServer: 'SMTP服务器设定',
            smtpServerInput: 'SMTP服务器IP或域名',
            emailServerPassword: '邮箱密码(推荐使用应用专用密码)',
            imapAccountConform: function ( iamp, account ) { return `<p class="ui small header brown">警告：</p><p class="grey">当您按下提交按钮时，意味着您已经确认【<B class="red">${ iamp }</B>】是为了使用CoNET系统而特别申请的临时邮箱，您同意承担由此带来的风险，并授权CoNET系统可以使用这个Email邮箱传输信息!</p><p class="grey" >CoNET平台将会向CoNET發送包含以下信息的email：【<B class="red">${ iamp }</B>】及APP密碼，註冊【<B class="red">${ account }</B>】郵箱地址，使用語言，時區，加密公鑰。</p><p class="grey">同时您也同意并授权CoNET可以向您的注册邮箱【<B class="red">${ account }</B>】发送CoNET有关服务，促销，账户及其他信息。</p>`},
            agree: '我已经了解风险，并愿意继续',
            imapOtherCheckError: '不能连接到Email服务器，有可能您设定的服务器名称或IP，通讯端口号有误，请检查您的服务器详细设定！',
            CertificateError: 'Email服务器提示的证书不能被系统信任！您的Email服务器有可能是一个仿冒的，您如果想继续，请在下面详细设定里选择【允许连接到不被信任证书的Email服务器】，但您的Email登陆信息有可能泄漏给此服务器！',
            IgnoreCertificate: '允许连接到不被信任证书的Email服务器',
            Certificat: '如果您不确定请别选择这项，这个选择是非常危险，因为它允许连接上一个仿冒的服务器，可能泄露您的用户名和密码。',
            AuthenticationFailed: 'Email服务器提示用户名或密码错误，请仔细检查您的用户名和密码！',
            addAEmail: '添加通讯用Email账户',
            tryAgain: '再试一次',
            connectImap: '连接CoNET',
            cancelConnect: '终止CoNET连接',
            imapItemTitle: '通讯用邮箱详细信息',
            imapCheckingStep: [
                /* 0 */'正在尝试连接email服务器',
                /* 1 */'邮件服务器IMAP连接成功, 正在等待CoNET对接。',
                /* 2 */'邮件服务器SMTP连接成功',
                /* 3 */'CoNET客户端向CoNET系统发出联机请求Email。和CoNET联机需要额外的时间，请耐心等待。',
                /* 4 */'成功连接CoNET',
                /* 5 */'邮件服务器IMAP测试成功',
                /* 6 */'邮件服务器SMTP测试成功',
            ],
            imapResultTitle:'IMAP服务器CoNET通讯评分：',
            testSuccess: 'email服务器连接试验成功！',
            exitEdit: '退出编辑Email帐户',
            deleteImap: '删除IMAP账户',
            proxyPortError: '本地代理服务器的端口设定从3001-65535之间的数字，或端口号已被其他APP所占用。请尝试填入其他号码。',
            appPassword:'关于APP密码',
            imapCheckError: [
                '不能连接到邮件服务器，有可能您没有互联网，或所在网络不支持邮件IMAP通讯，请检查您的网络，或刷新页面重试一次。',
                '邮件服务器提示用户名或密码错误，请仔细检查您的用户名和密码！ ',
                '邮件服务器证书错误！您所在网络可能存在网络中间人攻击，请换网络环境后再尝试。 ',
                '邮件服务器发送邮件错误，这通常是您使用的密码是普通密码所致，请换用APP密码后再次尝试',
                '未连结互联网，请检查网络',
                '未知错误，请退出CoNET后再试。',
                '您的邮箱无可用空间错误，请检查邮箱删除不必要的邮件后再试。'
            ]
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
            emailAddress: '作为Q梯账号的Email地址',
            systemAdministratorEmail:'RSA密钥生成',
            SystemAdministratorNickName: '昵称或组织名',
            systemPassword: 'Q梯客户端密码设定',
            creatKeyPair: '创建密钥对...',
            imapEmailAddress: '邮箱账户名',
            cancel: '放弃操作',
            stopCreateKeyPair: '停止生成密钥对',
            keyPairCancel: '生成密钥对被中止',
            keyPairGenerateError: '生成密钥对发生系统错误，请重试！',
            keyPairGenerateSuccess: '完成生成密钥对',
            continueCreateKeyPair: '继续生成',
            newVersionInstallLoading:'更新中请稍候',
            KeypairLength: '请选择加密通讯用密钥对长度：这个数字越大，通讯越难被破解，但会增加通讯量和运算时间。',
            GenerateKeypair: '<em>系统正在生成用于通讯和签名的RSA加密密钥对，计算机需要运行产生大量的随机数字有，可能需要几分钟时间，尤其是长度为4096的密钥对，需要特别长的时间，请耐心等待。关于RSA加密算法的机制和原理，您可以访问维基百科：' +
                `<a href='https://zh.wikipedia.org/wiki/RSA加密演算法' target="_blank" onclick="return linkClick ('https://zh.wikipedia.org/wiki/RSA加密演算法')" >https://zh.wikipedia.org/wiki/RSA加密演算法</a></em>`,
            inputEmail: '让我们来完成设定的最后几个步骤，首先生成RSA密钥对, 它是您的系统信息加密，身份认证及和CoNET网络通讯使用的重要工具。 RSA密钥对的密码请妥善保存，Email地址栏应填入您的常用邮箱地址, 它将被用作您的CoNET网络账号。 <em style="color:brown;">需注意的是CoNET域名在某些网络限制地区可能被列入黑名单，请使用网络自由地区邮箱。</em>',
            accountEmailInfo: '由于CoNET域名在某些国家和地区被防火墙屏蔽，而不能正常收发Email，如果您是处于防火墙内的用户，建议使用防火墙外部的邮件服务商。'
        },

        Home_keyPairInfo_view: {  
            title: '密钥信息',
            emailNotVerifi: '您的密钥未获CoNET签署认证。',
            emailVerified: '您的密钥已获CoNET签署认证。',
            NickName: '昵称：',
            creatDate: '密钥创建日期：',
            keyLength: '密钥位强度：',
            password: '请输入长度大于五位的密码',
            password1: '请输入平台密码',
            keyID: '密钥对ID：',
            logout: '退出登录',
            deleteKeyPairHaveLogin: '请使用登陆后的客户端来删除您的密钥',
            deleteKeyPairInfo: '请注意：如果您没有备份您的CoNET系统的话，删除现有的密钥将使您的CoNET设定全部丢失，您有可能需要重新设置您的CoNET系统。如果您的注册Email没有变化，您的CoNET账户支付信息不会丢失！',
            delete: '削除',
            locked: '请提供您的RSA密钥以解开密钥后才能继续操作，如果您遗忘了密码，请删除此RSA密钥。',
            systemError:'发生系统错误。如果重复发生，请删除您的密钥，再次设定您的系统！'
        },

        error_message: {
            title: '错误',
            errorNotifyTitle: '系统错误',
            EmailAddress: ['请按以下格式输入你的电子邮件地址: someone@example.com.','您已有相同的Email账户','此类Email服务器CoNET暂时技术不支持。'],
            required: '请填写此字段',
            doCancel: '终止完成',
            PasswordLengthError: '密码必须设定为5个字符以上。',
            localServerError: '本地服务器错误，请重新启动CoNET！',
            finishedKeyPair: '密钥对创建完成！',
            errorKeyPair:'密钥对创建发生错误，请重试',
            Success: '完成',
            SystemPasswordError: '密钥对密码错误，请重试！如果您已忘记您的密钥对密码，请删除现有的密钥对，重新生成新的密钥对。但您的原有设定将全部丢失！',
            finishedDeleteKeyPair: '密钥对完成删除!',
            offlineError: '您的电脑未连接到互联网，请检查网络后再次尝试！',
            imapErrorMessage: [
        /* 0 */ '未能链接CoNET网络。 CoNET网络可能存在问题，请稍后再次尝试。或联系CoNET服务。 ',
        /* 1 */ '数据格式错误，请重试',
        /* 2 */ '您的电脑未连接到互联网，请检查网络后再次尝试！ ',
        /* 3 */ 'Email服务器提示IMAP用户名或密码错！这个错误通常是由于您使用的密码是普通密码，或者您的APP密码已失效，请到您的Email帐户检查您的APP密码，然后再试一次。 ',
        /* 4 */ 'Email服务器的指定连接埠连结失败，请检查您的IMAP连接埠设定，如果您在一个防火墙内部，则有可能该端口被防火墙所屏蔽，您可以尝试使用该IMAP伺服器的其他连接埠！ <a href="data-html"></a>',
        /* 5 */ '服务器证书错误！您可能正在连接到一个仿冒的Email服务器，如果您肯定这是您希望连接的服务器，请在IMAP详细设定中选择忽略证书错误。 ',
        /* 6 */ '无法获得Email服务器域名信息，请检查您的Email服务器设定！或者您的电脑没有互联网，请检查您的互联网状态。 ',
        /* 7 */ '此Email服务器看来可能不能使用CoNET网络通讯技术，请再测试一次或选择其他email服务供应商！ ',
        /* 8 */ 'Email服务器提示SMTP用户名或密码错！ ',
        /* 9 */ '服务器证书错误！您可能正在连接到一个仿冒的Email服务器，如果您肯定这是您希望连接的服务器，请在SMTP详细设定中选择忽略证书错误。 ',
        /* 10 */'SMTP连结提示未知错误',
        /* 11 */'存在相同Email账号',
        /* 12 */'您的系统还未连接到CoNET网络！ ',
        /* 13 */'您的邮箱提示您账号已无可使用容量，请清理邮箱后再试',
        /* 13 */'通讯遇到未知错误，请重试。'
            ]
            ,
            CoNET_requestError: [
                /* 0 */'CoNET无响应,正在重新建立CoNET通讯管道，请稍候。',
                /* 1 */'无效操作！'
            ],
        },

        emailConform: {
            activeViewTitle:'验证您的密钥',
            info1_1: `您的密钥还未完成验证，请点击[发送验证Email]按钮，并检查您的 【`,
            info1_2: `】 邮箱。如果存在多封CoNET的邮件时，请选择最后一封信件。请打开信件并复制邮件内容。如果您还未收到CoNET的邮件，请检查您的密钥邮箱是否准确，或者您可以删除您现有的密钥，重新生成新密钥。`,
            info2: '请复制从“-----BEGIN PGP MESSAGE----- （开始，一直到）-----END PGP MESSAGE-----” 结束的完整内容，粘贴在此输入框中。',
            emailTitle: '感谢您使用CoNET服务',
            emailDetail1: '尊敬的 ',
            emailDetail1_1: '',
            emailDetail2: '这是您的CoNET帐号激活密码，请复制下列框内的全部内容:',
            bottom1_1: '此致',
            buttom1_2: 'CoNET团队',
            conformButtom: '验 证',
            requestReturn: ['错误！您的请求被拒绝，这可能是您在短时间内多次请求所致，请稍后再试','CoNET已发送激活邮件！'],
            reSendRequest:'发送验证Email',
            formatError: [
        /** 0 **/   '内容格式错误，请复制从“-----BEGIN PGP MESSAGE----- （开始，一直到）-----END PGP MESSAGE-----” 结束的完整内容，粘贴在此输入框中。 ',
        /** 1 **/   '提供的内容不能被解密，请确认这是在您收到的最后一封从CoNET发送过来的激活信。如果还是没法完成激活，请删除您的密钥重新生成和设定。 ',
        /** 2 **/   '和CoNET连接发生错误，请退出重新尝试！ ',
        /** 3 **/   '无效激活码！如果存在多封CoNET的邮件时，请选择最后一封信件。',
        /** 4 **/   '您的CoNET看上去有问题, 请删除您的密钥，重新设置您的CoNET！ ',
        /** 5 **/   '抱歉，CoNET系统无应答，可能暂时下线，请您稍后再试。',
        /** 6 **/   '您当天的数据通讯量达到上限，请等待明天再试或升级用户类型',
        /** 7 **/   '用来通讯的Email设定有错误，请检查IMAP设定后重试，或CoNET不支持此Email类型',
        /** 8 **/   '您所选区域不能够连结，请稍候再试',
        /** 9 **/   '您的IMAP邮箱发信发生错误。请退出CoNET重试。如果持续发生此故障，您的IMAP帐号有可能被锁住，需要登陆您的IMAP邮箱网站解锁操作。 ',
        /** 10**/   '页面会话已过期，请刷新页面以继续，或退出后重新启动CoNET。',
        /** 11**/   'CoNET平台故障，请重新启动CoNET。'
            ],
            activeing: '正在通讯中'
        },

        QTGateRegion: {
            title: '高品质定制代理服务器区域',
            speedTest: '代理服务器速度测试：',
            error: [],
            CoGateRegionStoped:'所订制的代理服务器已经被停止，如需使用请再次订制.',
            pingError:'代理服务区域速度检测发生错误，请退出CoNET，以管理员身份再次打开CoNET后，再执行速度检测！',
            connectQTGate:'正在获得代理服务器区域信息...',
            available: '服务中',
            unavailable: '准备中',
            requestPortNumber: '指定代理服务器通讯端口',
            proxyDomain: '域名解释全程使用CoNET代理服务器端',
            setupCardTitle: '使用连接技术:',
            paidUse:'本区域只对收费用户开放',
            MultipleGateway: '同时并发使用代理数',
            dataTransfer: '数据通讯：',
            dataTransfer_datail: ['全程使用代理服务器','当不能到达目标时使用代理'],
            proxyDataCache: '浏览数据本地缓存:',
            proxyDataCache_detail: ['本地緩存','不緩存'],
            cacheDatePlaceholder: '缓存失效时间',
            clearCache: '立即清除所有缓存',
            localPort: '本地代理服务器端口号:',
            localPath: '本地代理服务器HTTP链接路径',
            outDoormode: '接受外網訪問',
            GlobalIp: '本机互联网IP地址:',
            option: '高级设置',
            WebRTCleak:'阻止WebRTC漏洞',
            WebRTCleakInfo: '本设置后，浏览器的即时会话，端对点通讯等将不再工作。',
            QTGateRegionERROR:['发送连接请求Email到CoNET发生送信错误， 请检查您的IMAP账号的设定。',
                                ''],
            GlobalIpInfo: '注意：当您按下【CoNET连结】时您会把您的本机互联网IP提供给CoNET系统，如果您不愿意，请选择【@OPN】技术来使用CoNET服务！没有显示【@OPN】选项，目前只在旧金山区域有效，并只支持iCloud邮箱。',
            sendConnectRequestMail: ['您的CoNET客户端没有联机CoNET网络，客户端已向CoNET系统重新发出联机请求Email。和CoNET联机需要额外的时间，请耐心等待。',
                                     '当您长时间未使用CoNET时，您的连接会被中断。'],
            cacheDatePlaceDate: [{ name:'1小时', id: 1 }, { name:'12小时', id: 12 },{ name:'1日', id: 24 }, { name:'15日', id: 360 }, { name:'1月', id: 720 }, { name:'6月', id: 4320 }, { name:'永远', id: -1 }],
            atQTGateDetail: [
        /*0*/   '世界首创的CoNET无IP互联网通讯技术，全程使用强加密Email通讯，客户端和代理服务器彼此不用知道IP地址，具有超强隐身和保护隐私功能，强抗干扰和超強防火墙穿透能力。缺点是有延迟，网络通讯响应受您所使用的email服务供应商的服务器影响，不适合游戏视频会话等通讯。目前该技术只支持iCloud邮箱。',
        /*1*/   'CoNET独创明码HTTP混淆流量加密通讯技术，能够隐藏变换您的IP地址高速通讯，隐身和保护隐私，抗干扰和超強防火墙穿透能力。缺点是需要使用您的IP来直接连结代理服务器。如果您只是需要自由访问互联网，则推荐使用本技术。',
        /*2*/   '域名解释使用CoNET代理服务器端，可以防止域名服务器缓存污染，本选项不可修改。',
        /*3*/   '互联网数据全程使用CoNET代理，可以匿名上网隐藏您的互联网形踪。',
        /*4*/   '只有当您的本地网络不能够到达您希望访问的目标时，才使用CoNET代理服务器代为连结目标主机，本选项可以加速网速，但失去隐私保护。',
        /*5*/   '通过本地缓存浏览纪录，当您再次访问目标服务器时可以增加访问速度，减少网络流量，缓存浏览纪录只针对非加密技术的HTTP浏览有效。CoNET使用强加密技术缓存浏览纪录，确保您的隐私不被泄漏。',
        /*6*/   '不保存缓存信息。',
        /*7*/   '设置缓存有效时间，您可以及时更新服务器数据,单位为小时。',
        /*8*/   '本地Proxy服务器，其他手机电脑和IPad等可通过连结此端口来使用CoNET服务。请设定为3001至65535之间的数字。',
        /*9*/   '通过设置PATH链接路径可以简单给您的Proxy服务器增加安全性，拒绝没有提供PATH的访问者使用您的Proxy服务器。',
        /*10*/  '同时使用多条代理线路数，可以有效降低大流量集中在一个代理服务线路，降低被网络监控者发现的风险。此选项仅供收费会员使用。',
        /*11*/  '指定同Q梯代理进行通讯使用的端口号，通过此设置可以规避您所在网段被通讯屏蔽的端口。',
        /* 12*/ 'Web实时通讯(WebRTC)客户端浏览器之间通过IP地址直接高速通讯技术，有时被恶意泄漏您的真实IP地址。'
                ]
            
        },

        useInfoMacOS: {
            title:'<p>本地代理服务器已在后台运行。</p>您的其他电子设备，可通过本地代理设置，来使用CoNET连接到互联网',
            title1:'MacOS 本地代理服务器设定',
            customProxy: '定制服务器生成完成：',
            proxySetupHelp:'代理设定如需帮助，请点击以下您所使用的系统图案',
            webRTCinfo:'阻止WebRTC漏洞，请使用SOCKS代理设置，检查是否漏洞还在，请点击<a target="_blank" href="/Wrt">这里</a>',
            wrtTest: '以下为测试结果：',
            localIpAddress:'如果能看到这个IP地址，由于是本地局域网地址泄漏，无关紧要。',
            globalIpAddress:'如果显示这个IP，您的浏览器泄漏了您真实的IP地址',
            proxyServerIp:'<p>代理设置选择：<span style="color: brown;">自动代理设置</p>',
            wrtTestAreaTitle: 'WebRTC漏洞数据泄漏区域',
            proxyServerPort: 'HTTP和HTTPS代理设定：',
            proxyServerPassword: 'SOCKS代理设定：',
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
                title:'选择代理设定，按图示选勾左边自动代理，选勾排除简单服务器名',
                titleImage:'',
                detail:'<p>使用HTTP和HTTPS代理请按照蓝色第一行填入，使用SOCKS代理选择蓝色第二行</p>',
                image: '/images/macosUserInfo3.jpg'
            }]
        },

        thirdParty: {
            comesoon:'即将推出',
            information: 'CoNET平台',
            app: ['Co定制代理','CoChat','Co云存储','Co邮件','Co新闻频道','CoNET定制业务','Co谷歌','Co推特', 'Co油管','Co加密货币钱包'],
            qtgateGateway: 'CoNET提供的高质量上网技术iOPN和@OPN，在CoNET全球16个区域，当场定制您专属的代理服务器，变换您的IP地址隐身无障碍的访问互联网',
            dimmer: [
                '高质量量身定制代理服务器业务，让您隐身安全不受注意的网上冲浪。 ',
                '隐身匿名去中心化不被封锁的社交媒体',
                '安全隐私文件云存储系统',
                '隐身匿名邮件客户端，可免翻墙访问Gmail',
                '免翻墙隐身匿名访问世界头条新闻',
                'QTG承接定制各类公众服务类及跨国企业私有APP业务',
                '免翻墙匿名隐身谷歌检索客户端',
                '免翻墙匿名隐身推特客户端',
                '免翻墙匿名隐身Youtube客户端，可下载视频',
                '免翻墙匿名隐身加密货币钱包和交易所'
            ]
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
            }, {
                title:'打开显示高级选项，在代理服务器设定(Proxy)中选择自动设置',
                titleImage:'',
                detail:'使用HTTP和HTTPS代理请按照蓝色第一行填入，使用SOCKS代理选择蓝色第二行',
                image: '/images/android3.jpg'
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
                title:'选择自动设置，选勾域名使用SOCKS v5',
                titleImage:'',
                detail:'使用HTTP和HTTPS代理请按照蓝色第一行填入，使用SOCKS代理选择蓝色第二行',
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
                title:'选择自动设置',
                titleImage:'',
                detail:'<p>在URL网址处填入：使用HTTP和HTTPS代理请按照蓝色第一行填入，使用SOCKS代理选择蓝色第二行</p>',
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
                title:'选择自动设置代理服务器',
                titleImage:'',
                detail:'<p>WINDOWS10系统只对应HTTP和HTTPS，如果想使用全局代理的用户，需另外安装浏览器如火狐等，然后在火狐浏览器内单独设定Proxy全局代理SOCKS</p>',
                image: '/images/windowsUseInfo4.jpg'
            }]
        },

        QTGateGateway: {
            title: 'CoNET服务使用详细',
            processing: '正在尝试连接CoNET网络...',
            error: [ 
            /* 0 */ '错误：您的账号下已经有一个正在使用CoNET代理服务器的连接，请先把它断开后再尝试连接。',
            /* 1 */ '错误：您的账号已经无可使用流量，如果您需要继续使用CoNET代理服务器，请升级您的账户类型。如果是免费用户已经使用当天100M流量，请等待到明天继续使用，如您是免费用户已经用完当月1G流量，请等待到下月继续使用。',
            /* 2 */ '错误：数据错误，请退出并重新启动CoNET！',
            /* 3 */ '非常抱歉，您请求的代理区域无资源，请选择其他区域或稍后再试',
            /* 4 */ '对不起，您所请求连接的区域不支持这样的连接技术，请换其他连接方法或选择其他区域连接',
            /* 5 */ '@OPN链接技术不支持公用iCloud邮箱，请撤换通讯用IMAP邮箱，换您自有的iCloud邮箱。'
                ],
            connected:'已连接。',
            promo: '促销活动',
            upgrade:'升级账号',
            accountManager:'账户管理',
            userType:['免费用户','付费用户'],
            datatransferToday:'日流量限额：',
            datatransferMonth:'月流量限额：',
            todaysDatatransfer: '本日可使用流量',
            monthDatatransfer: '本月可使用流量',
            gatewayInfo: ['代理服务器IP地址：','代理服务器连接端口：'],
            userInfoButton: '使用指南',
            stopGatewayButton:'停止所定制的服务器',
            disconnecting: '正在销毁中...'
        },

        topWindow: {
            title: '庆祝加拿大150周年特别提供'
        },

        feedBack: {
            title: '使用信息反馈',
            additional: '添附附加信息',
            okTitle:'发送至CoNET'
        },

        qtGateView: {
            title: '发送定制代理请求',
            mainImapAccount: 'CoNET通讯用邮箱',
            QTGateConnectStatus: 'CoNET连接状态',
            QTGateConnectResultWaiting: '已向CoNET发送连接请求Email。由于是首次连接CoNET网络，系统需要几分钟时间来完成与您的对接，请耐心等待。',
            QTGateDisconnectInfo: 'CoNET连结已断开。请选择向CoNET发送请求对接Email的IMAP帐号：',
            QTGateConnectError: ['发送连接请求Email错误，请检查IMAP邮件帐户的SMTP设定！'],
            QTGateConnectResult: ['CoNET未联机，请点击连接CoNET！', '正在和CoNET联中', '已经连接CoNET', '连接CoNET时发生错误，请修改IMAP账号设定','已经连接CoNET'],
            QTGateSign: ['您的密钥状态','还未获得CoNET信任签署,点击完成信任签署',
                '密钥获得CoNET信任签署是CoNET一个重要步骤，您今后在CoNET用户之间分享文件或传送秘密信息时，CoNET可以证明是您本人而非其他冒充者。你也可以通过您的密钥签署信任给其他CoNET用户，用以区别您自己的信任用户和非信任用户。',
                '正在获得CoNET信任签署中','系统错误，请重启CoNET后再试，如果仍然存在，请尝试重新安装CoNET。','CoNET系统错误!']
        
        }
        
	},{
        perment:{
            serverTitle:'サーバー'
        },
        twitter: {
            newTwitterAccount: `TwitterのAPPインフォーメーションを入力してください。APPインフォーメーション作成する事がわからない場合は<a target="_blank" href='https://github.com/QTGate/QTGate-Desktop-Client/wiki/Create-Twitter-APP'">ここ</a>をクリックしてください。`,
            addAccount:'Twitterアカウントを追加',
            following: ['フォロー中','フォローを解除','フォロー'],
            followers:'フォロワー',
            second: '秒',
            videoSizeOver: `ビデオがTwitter規格: 140秒、300MB、(1280x1024)を超えています`,
            month: '月',
            day:'日',
            min: '分',
            hour: '時間',
            replying: '返信先: ',
            retweeted: 'さんがリツイート',
            close:'閉じる',
            newTwitterTitle: ['ツイートする','新しいスレッドを作成'],
            returnEdit: '中止破棄',
            newTwitterDistroyButtonTitle: ['ツイートを破棄','スレッドを破棄'],
            twitterBottonTitle:['ツイート','すべてツイート'],
            urlInfo: '<h3>CoNETからのツイートクライアントのプレビュー版</h3><p>VPNやゲートウェイなど経由しなくて、ユーザはご自分のツイートアカウトにファイヤウォールを回避し安全匿名に無料無制限アクセスができます。</p><p>以下のURLを入力するとセルフォンやその他のデバイスもこちらのアプリケーションで楽しめます。</p>',
            accountError:'ツイートがアカンウトAPPインフォーメーションにエラーがありまして、通信を拒否されました、APPインフォーメーションをチェックしてください。'
        },
        
        thirdParty: {
            comesoon:'まもなく登場します。',
            information: 'CoNETプラットフォーム',
            qtgateGateway:'CoNETご提供する高品質カスタムゲットウェイサービス、グローバルに１６区域とCoNET独自のiOPNと@OPN技術により、貴方のIPアドレスをカバーして、静かに無障害にインターネットの世界へ可能です。',
            app:['CoGate', 'CoMsg', 'CoBox','CoMail','CoNews','Coカスタム','Co for','Co for','Co for','Coウォレット'],
            
            dimmer: [
                '高品質カスタムゲットウェイサービス、自由になるインターネットの世界へ',
                'ツイートスタイルの匿名ソーシャルメディア',
                '匿名プライバシーファイルストレージ',
                '匿名メール端末',
                'グロバールニュースをチェック',
                'CoNETに公衆及び私有ビジネスカスタム業務',
                '匿名Googleサーチ端末',
                '匿名Tweet端末',
                '匿名Youtube端末、ビデオダウンロードをサポート',
                '匿名ブロックチェーンウォレットとエクスチェンジ'
            ]
        }, 

        account:{
            paymentSuccessTitile: 'ありがとうございました。',
            stripePayment: 'オンライン支払い',
            promoButton: 'プロモーション入力',
            qtgatePayment:'CoNET経由でのお支払い',
            QTGatePayRisk: 'CoNETセキュリティ経由でお支払いです。遠慮の場合はStripeセキュリティでのお支払いをしてください。',
            paymentProblem1:'支払い支障がある',
            willPayNextExpir:'引落とし日に ',
            openAutomatically: '引落とし予約',
            paymentProblem:'あなた現在いる所在地ではバンク支払いがブラックされている模様です。CoNET経由でのお支払いをしてください。',
            CancelSuccess: function ( PlanExpire: string, isAnnual: boolean, returnAmount: number ) {
                return `プランキャンセルしました。${ new Date (PlanExpire).toLocaleDateString() }まで、元プランのままCoNETサービスが使えます。そのあとはCoNETのフリーユーザーと戻ります。${ isAnnual? `元プラン残りus$ ${ returnAmount }は５日ウォキンデイ内お支払い使ったカードに戻ります`:`プラン代自動落しは中止されます`}。これからもよろしくお願い申し上げます。`
            },
            paymentSuccess:'あなたのプランをアップグレードしました。これからもよろしくお願い申し上げます。',
            qtgateTeam: 'CoNETチーム全員より',
            cardPaymentErrorMessage:[
        /* 0 */ 'ご入力したカード番号に間違いがあるか、又支払いシステムはこのタイプのカードがサポートしておりません！',
        /* 1 */ 'ご入力したカードの期限に間違いがあります！',
        /* 2 */ 'ご入力したカードのセキュリティコードに間違いがあります！',
        /* 3 */ 'ご入力したカード所有者の郵便番号に間違いがあります！',
        /* 4 */ '原因不明けど、支払いが失敗しました。後ほどもう一度してみてください。',
        /* 5 */ 'お支払いデータに間違いがあります。',
        /* 6 */ 'お支払いは銀行から拒否されました。',
        /* 7 */ 'エラーが発生しました、後ほどもう一度してみてください。', 
            ],
            title: 'アカウト管理',
            segmentTitle:　'アカウトタ: ',
            cancelPlanButton:'キャンセルプラン',
            planPrice: 'プラン価値：',
            needPay: 'お支払い残高：',
            currentPlanExpire: ['プラン終了日：','次の引落とし日'],
            cantUpgradeMonthly: '年契約は月契約に戻れないです。一回年契約を中止してから月契約をしてください。',
            currentAnnualPlan: ['月契約','一年契約'],
            bandwidthBalance:'月残りデータ量：',
            paymentProcessing:'サーバーとの通信中...',
            oldPlanBalance: '元プラン残り価値：',
            currentPlan:　'現在加入中のプラン: ',
            MonthBandwidthTitle:'ゲットウェイ月制限：',
            monthResetDayAfter:'',
            cantCancelInformation: 'あなたのプランはフリーユーザー、又はCoNETテストユーザーか、クーポンを使ったのためキャンセルすることはできません。',
            monthResetDay:'月レセット日：',

            dayBandwidthTitle:'日制限：',
            upgradeTitle:'アプグランド',
            planExpirDate: function ( year: string, month: string, day: string ) { return `${ year } 年${ month }月${ day }日`},
            accountOptionButton: 'アカウトオプション',
            DowngradeTitle:'ダウングレードオプション',
            cancelPlan:'キャンセルプラン',
            networkShareTitle:'ゲットウェイ回線',
            MonthBandwidthTitle1:'データ量',
            payAmountTitile:'お支払い金額合計',
            cardNumber: 'クレジットカード番号',
            multiOpn:'OPN並列ゲットウェイ技術',
            monthlyAutoPay: function ( monthCost: number ) { return `<span>口座振替</span><span class="usDollar" >@ us$</span><span class="amount" >${ monthCost }</span>/月<span>` },
            cvcNumber: 'セキュリティコード',
            calcelPayment:'キャンセル',
            doPayment:'お支払いにします',
            postcodeTitle: 'カード所有者郵便番号',
            annualPay: function ( annual_monthlyCost: number ) { return `<span>年払いと月換算</span><span class="usDollar">@ us$</span><span class="amount" >${ annual_monthlyCost }</span>/月<span>`},
            aboutCancel: 'プランをキャンセルについて',
            expirationYear: 'カード期限',
            canadaCard:'*おカード所有者はカナダ所在者とGST(BC)5.0% 自動加算されます',
            continue:'次へ',
            multiRegion:['シンプルリジョーン並列ゲットウェイ','マルチリジョーン並列ゲットウェイ','マルチリジョーン並列ゲットウェイ','マルチリジョーン並列ゲットウェイ'],
            serverShareData:['シェアゲットウェイ','一台ゲットウェイ独占*','二台ゲットウェイ独占*','四台ゲットウェイ独占'],
            internetShareData:['シェアハイスピード回線','独占ハイスピード一回線*','独占ハイスピード二回線*','独占ハイスピード四回線'],
            monthlyPay:'プラン月額利用料',
            serverShareData1:'並列ゲットウェイ技術を使う際に、同時使う数が独占数を超える場合には、独占リソースを他人と割合にチェアする場合もあります。',
            maxmultigateway: ['最大二つ並列ゲットウェイ','最大四つ並列ゲットウェイ*','最大四つ並列ゲットウェイ'],
            cancelPlanMessage:'CoNETプランは月毎に計算し、来月のあなたの最初加入した日まで、今のプランのままご利用ですます。キャンセルした日から自動的にCoNETの無料ユーザーになります。おアカウトは(月)払いの場合は、来月の自動払いは中止となります。年払いの場合は、ご使った分に月普通料金と計算し控除してから、お支払いを使ったクレジットカードに戻ります。販促コードまたはテストユーザーにはキャンセルすることができません。',
            cancelPlanMessage1: function ( isAnnual: boolean, amount: number, monthlyPay: number, expire: string, passedMonth: number, totalMonth: number ) {
                return `<span>あなたのプランは${ isAnnual ? `一年契約です。キャンセルをした場合は、ご利用して頂いた月に普通料金と請求を計算されます。お返し金額は，お支払って頂いたプラン年契約料金 </span><span class="usDollar">us$</span><span class="amount">${ amount /100 }</span><span> - そのプランの普通月料金 </span><span class="usDollar">us$</span><span class="amount">${ monthlyPay /100 }</span><span> X ご利用して頂いた月(本月も含めて)：</span><span class="amount">${ passedMonth }</span><span> = 戻る金額 </span><span class="usDollar">us$</span><span class="amount">${ amount - passedMonth * monthlyPay > 0 ? ( amount - passedMonth * monthlyPay ) / 100 : 0 }</span><span>とまります。７日内お支払って頂いたクレジットカードへ返金とします。</span>`: `月プランです。キャンセルにすると次の更新日</span><span class="amount">${ nextExpirDate( expire ).toLocaleDateString() }</span><span>に自動更新はしませんです。</span>`}`
            }
        },

        QTGateDonate: {
            title: 'スポンサーが提供する無料アクセスウェブサイト',
            meta_title:'ドナー：',
            detail:'CoNETユーザーはCoNETのゲットウェイを経由で、スポンサーが提供するウェブサイトにアクセスする際、発生したアクセスデータ量はユーザアカウトに記入しません。ただしCoNETのフリーアカウトは当日または当月データの使用量がリミットになった場合、CoNETゲットウェイに接続ができないの場合はご利用もできないので、ご注意をしてください。'
        },

        QTGateInfo: {
            title:'機能紹介',
            version:'バージョン：v',
            detail:[{
                color: '#a333c8',
                icon: 'exchange',
                header: '自由匿名なインターネットへOPN',
                detail: '@OPNは本社の世界初のIP不要な通信技術です、<a onclick="return linkClick (`https://ja.wikipedia.org/wiki/Advanced_Encryption_Standard`)" href="#" target="_blank">AES256-GCM</a>と<a onclick="return linkClick (`https://ja.wikipedia.org/wiki/Pretty_Good_Privacy`)" href="#" target="_blank">OpenPGP</a>暗号化したEmailメッセージを通じたゲットウェイに接続します、iOPNは本社の独自のHTTPゲットウェイ暗号化高速通信技術です。どちらとも身を隠して誰も知らないうちにインターネットへ、プライバシー、ネットワーク監視とアクセスを制限・遮断にうまくすり抜けることができます。'
            },{
                color: '#e03997',
                icon: 'talk outline',
                header: 'IP不要な匿名プライバシーインスタントメッセージQTChat',
                detail:'CoNETユーザー間の無IPペアーツーペアープライバシーインスタントメッセージです。それは伝統的なインスタントメッセージより匿名とプライバシーが可能です。又グループをして複数なユーザーの間でのインスタントメッセージもご利用いただけます。文字をはじめ、写真やビデオ映像、あらゆるファイルの暗号化転送も可能です。CoNETシステムはインスタントメッセージを各ユーザへ転送することだけですから、メッセージの内容をチェックするまたはメッセージ所有することではありませんので、メッセージそのものに法的責任は、メッセージをしたユーザーが負うです。'
            },{
                color: '#6435c9',
                icon: 'cloud upload',
                header:'ファイルを匿名プライバシーストレージとシェアQTStroage',
                detail:'一つのファイルを暗号化してからスプリットし、多数のフリーメールアカンウトに保存します。無限かつ秘密プライバシーのファイルストレージ事ができます。CoNETユーザー間のファイルシェアも可能です。'
            },
            {
                color: 'darkcyan',
                icon: 'spy',
                header: 'スパイソフトウェア送信を切断',
                detail: 'CoNETシステムはグロバルDNSBLに加入し、スパイホストダータベースを更新しています。CoNETユーザはCoNETシステムをご利用してインターネットへアクセスした場合、あなたのデバイスに闇活動しているスパイソフト、収集したあなたの個人データの送信を切断することができます。'
            },{
                color: '#6435c9',
                icon: 'external share',
                header:'ローカルVPNサーバ',
                detail:'CoNETユーザは自宅のマシンにVPN接続により、外にいても楽々OPNで隠れたネットワークへご利用できます。'
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
                title:'自動プロキシをオンに',
                titleImage:'',
                detail:'<p>WINDOWS 10 システムはHTTPとHTTPSしかサポートしておりませんが、SOCKSを使うなら、他のブラウザ例えばFireFoxなどをインストールによりお使いは可能です。</p>',
                image: '/images/windowsUseInfo4.jpg'
            }]
        },

        useInfoMacOS: {
            title:'ローカルプロキシサーバはバックグランドで実行しています。他のデバイスはローカルプロキシに設定による、CoNET利用してインターネットへアクセスができます。',
            title1:'MacOS プロキシ設定',
            customProxy: 'サーバ作成しました',
            proxySetupHelp:'ヘルプなら、以下のそれぞれのOSアイコンをクリックしてください。',
            webRTCinfo:'WebRTC漏れ対応はSOCKSプロキシ設定をしてください。WebRTC漏れをテストするしたい場合は<a href="/Wrt" target="_blank">ここ</a>をクリックしてください',
            wrtTest: 'テスト結果は以下です：',
            wrtTestAreaTitle: 'WebRTC漏れデーターエリア',
            globalIpAddress:'このIPアドレスが提示したら、あなたの真実IPがWebRTC漏れてしまいます。',
            localIpAddress:'ここのIPはローカルネットワークIPアドレス漏れです、大したことはないです。',
            proxyServerIp:'<p>プロキシの設定に：<span style="color:red;">自動設置</span></p>',
            proxyServerPort: 'HTTPとHTTPSプロキシは：',
            proxyServerPassword: 'SOCKSプロキシは：',
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
                title:'プロキシ設定を選んで、自動設置をチェック、簡単ホストをチェック',
                titleImage:'',
                detail:'<p>右の入力にHTTPとHTTPSは上のブルー行を、SOCKSは下の行を入力してください。</p>',
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
                title:'自動設定を選んで、ドメインをSOCKS v5を選んで',
                titleImage:'',
                detail:'HTTPとHTTPSは上のブルー行を、SOCKSは下の行を入力してください。',
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
                title:'[詳細設定項目]の横にある下矢印をタップして、自動設定を選択します',
                titleImage:'',
                detail:'HTTPとHTTPSは上のブルー行を、SOCKSは下の行を入力してください。',
                image: '/images/android3.jpg'
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
                title:'自動設定を選択。',
                titleImage:'',
                detail:'<p>URLにHTTPとHTTPSは上のブルー行を、SOCKSは下の行を入力してください。</p>',
                image: '/images/iOS4.jpg'
            }]
        },

        cover: {
            firstTitle1: 'CoNETプラットフォーム',
            firstTitle2: '隠れて安全自由なネットワークへ',
            start: 'オプンドア',
            proxyStoped: 'カスタマーゲートウェイサーバーが停止しました、再作成をしてください。'
        },

        firstNote:  {
            title: 'CoNETの製品およびサービス（以下「本サービス」）をご利用いただきありがとうございます。本サービスはカナダCoNETテクノロジ株式会社（以下はCoNETと言い）が提供しています。',
            firstPart: 'ユーザーは、本サービスを利用することにより、本規約に同意することになります。以下を注意してお読みください。',
            detail:[
                {
                    header: '本サービスのご利用について',
                    detail: '本サービス内で入手できるすべてのポリシーを遵守してください。本サービスを不正に利用しないでください。たとえば、本サービスの妨害や、CoNETが提供するインターフェースおよび手順以外の方法による、本サービスへのアクセスを試みてはなりません。'
                },{
                    header: null,
                    detail: 'ユーザーは、法律（輸出、再輸出に関して適用される法規制を含みます）で認められている場合に限り、本サービスを利用することができます。ユーザーがCoNETの規約やポリシーを遵守しない場合、またはCoNETが不正行為と疑う行為について調査を行う場合に、CoNETはユーザーに対する本サービスの提供を一時停止または停止することができます。'
                },{
                    header: '無IP通信技術OPNネットワークはプライベートに限界があります',
                    detail: 'OPN無IP通信は弊社の革新的技術であります。あなたはCoNET端末ソフトを使ってCoNETシステムとのコミニュケーションはお客さんが無IPでプライベートな通信を行います。（但しiOPN技術を選択してゲットウェーに接続した場合は、お客さんのIPアドレスをCoNETシステムに提示するのが必要です。）でもお客さんのIPアドレスはeメールプロバイダーのログに記録していたかもしれません。裁判所命令を持つカナダの法執行機関はCoNETのログを得て、eメールプロバイダーのログと合併して、お客さんのプライベートインフォメーションを入手することも可能です。'
                },
                {
                    header: null,
                    detail: 'ユーザーは、本サービスを利用することによって、本サービスまたはアクセスするコンテンツに対するいかなる知的財産権も取得することはありません。ユーザーは、本サービスのコンテンツの所有者から許可を得た場合や、法律によって認められる場合を除き、そのコンテンツを利用することはできません。本規約は、本サービスで使用されている、いかなるブランドまたはロゴを利用する権利もユーザーに与えるものではありません。本サービス内に表示される、または、本サービスに伴って表示されるいかなる法的通知も、削除したり、隠したり、改ざんしてはなりません。'
                },
                {
                    header: '個人情報保護及びCoNETからのインフォーメーションの受信について',
                    detail: '本サービスの利用に関して、CoNETはユーザーに対してサービスの告知、管理上のメッセージ、およびその他の情報を送信することができます。ユーザーは、これらの通知について、受け取らないことを選択できる場合があります。'
                }, {
                    header: null,
                    detail: 'お客様がCoNETサービスをご利用になる際に、お客様のデータ通信料計算のために、ご利用データ量が自動的に収集および保存されます。限られたログは以下のようです。日付、お客様アカウント、ご利用ゲットウェーエリアとゲットウェーIPアドレス、データ量、アップ又はダウンロード。例：'
                },{
                    header: null,
                    detail: '<p class="tag info">06/20/2017 18:12:16, info@CoNET.com, francisco, 104.236.162.139, 300322 byte up, 482776323 byte down.</p><p class="tag info">06/21/2017 12:04:18, info@CoNET.com, francisco, 104.236.162.139, 1435226 byte up, 11782238 byte down.</p>'
                }, {
                    header: null,
                    detail: 'CoNETは以上の情報以外には保存することしません。CoNETは以上の情報をカナダーの裁判所命令を持つカナダの法執行機関に協力することがありえます。カナダ以外のこのログ情報を協力する要請のあなたは、まずカナダ外務省までお問い合わせ下さい：'
                },{
                    header: null,
                    detail: '<a class="tag alert" href="http://www.international.gc.ca/">http://www.international.gc.ca/</a>'
                }, {
                    header: 'ソフトウェアの版権について',
                    detail: 'CoNETは、本サービスの一環としてユーザーに提供するソフトウェアについて、全世界で適用され、譲渡不可で、非独占的な個人使用ライセンスを無償でユーザーに付与します。このライセンスは、CoNETが提供する本サービスを本規約により許可された方法でユーザーが使用し、その便益を享受できるようにすることを唯一の目的としています。'
                }, {
                    header: null,
                    detail: 'ユーザーは、本サービスまたは本サービスに含まれるソフトウェアのどの部分も、複製、変更、配信、販売、貸与することはできず、そのソフトウェアのソース コードのリバース エンジニアリングや抽出を試みることはできません。'
                }, {
                    header: '本サービスの変更または終了',
                    detail: 'CoNETは、常に本サービスの変更および改善を行っています。CoNETは、機能性や機能の追加や削除を行うことができ、本サービス全体を一時停止または終了することができます。ユーザーはいつでも本サービスの利用を終了することができます。CoNETもいつでも、ユーザーに対する本サービスの提供を停止し、または、本サービスに対する制限を追加または新規に設定することができます。'
                }, {
                    header: '保証および免責',
                    detail: 'CoNETは、商業上合理的な水準の技術および注意のもとに本サービスを提供し、ユーザーに本サービスの利用を楽しんでいただくことを望んでいますが、本サービスについて約束できないことがあります。'
                }, {
                    header: null,
                    detail: '本規約または追加規定に明示的に規定されている場合を除き、CoNETまたはそのサプライヤーもしくはディストリビューターのいずれも、本サービスについて具体的な保証を行いません。たとえば CoNETは、本サービス内のコンテンツ、本サービスの特定の機能、その信頼性、利用可能性、またはユーザーのニーズに応える能力について、何らの約束もしません。本サービスは「現状有姿で」提供されます。'
                }, {
                    header: '本サービスに対するCoNETの責任',
                    detail: '法律で認められる場合には、CoNETならびにそのサプライヤーおよびディストリビューターは、逸失利益、逸失売上もしくはデータの紛失、金銭的損失、または間接損害、特別損害、結果損害もしくは懲罰的損害について責任を負いません。'
                }, {
                    header: 'カナダー法律によるサービス禁止対象者',
                    detail:　'あなたはカナダー法律によってサービス禁止対象者ではありませんと確認していた事。'
                },
                {
                    header: '事業者による本サービスの利用',
                    detail: '本サービスを事業者のために利用する場合、その事業者は本規約に同意するものとします。かかる事業者は、CoNETとその関連会社、役員、代理店、従業員を、本サービスの利用または本規約への違反に関連または起因するあらゆる請求申し立て、訴訟、法的措置について、請求申し立て、損失、損害、訴訟、裁判、告訴から生じる法的責任および費用、弁護士費用を含め、免責および補償するものとします。'
                }, {
                    header: '本規約について',
                    detail: 'CoNETは、たとえば、法律の改正または本サービスの変更を反映するために、本サービスに適用する本規約または特定の本サービスについての追加規定を修正することがあります。ユーザーは定期的に本規約をご確認ください。CoNETは、本規約の修正に関する通知をこのページに表示します。'
                }, {
                    header: null,
                    detail: '追加規定の修正については、該当する本サービス内において通知を表示します。変更は、さかのぼって適用されることはなく、その変更が表示されてから 14 日以降に発効します。ただし、本サービスの新機能に対処する変更または法律上の理由に基づく変更は、直ちに発効するものとします。本サービスに関する修正された規定に同意しないユーザーは、本サービスの利用を停止してください。'
                }, {
                    header: null,
                    detail: '本規約と追加規定との間に矛盾が存在する場合には、追加規定が本規約に優先します。本規約は、CoNETとユーザーとの間の関係を規定するものです。本規約は、第三者の受益権を創設するものではありません。ユーザーが本規約を遵守しない場合に、CoNETが直ちに法的措置を講じないことがあったとしても、そのことによって、CoNETが有している権利（たとえば、将来において、法的措置を講じる権利）を放棄しようとしていることを意味するものではありません。'
                }, {
                    header: null,
                    detail: 'ある特定の規定が強制執行不可能であることが判明した場合であっても、そのことは他のいずれの規定にも影響を及ぼすものではありません。カナダBC州の抵触法を除き、本規約または本サービスに起因するまたは関連するいかなる紛争に関しても、カナダBC州の法律が適用されます。本規約または本サービスに起因するまたは関連するいかなる主張についても、カナダBC州内に所在する裁判所においてのみ裁判手続を取ることができるものとし、ユーザーとCoNETはその裁判所の対人管轄権に同意するものとします。'
                }
            ],
            disagree: 'キャンセル',
            agreeMent: 'CoNET利用規約とプライバシー'
        },

        linuxUpdate:{
            newVersionDownload: 'クリックしてダウンロードとインストール',
            step1:'最新バージョンにアップデート：',
            step2: 'CoNETを実行ファイルに許可与える。',
            step2J1:'/images/linuxUpdate1_jp.jpg',
            step2J2:'/images/linuxUpdate2_jp.jpg',
            step2_detail1: '右クリックダウンロードしたCoNETファイル、プロパティを選んでください。',
            step2_detail2: 'アクセス権にポログラムとして実行可能をチェック',
            step3:'旧バージョンCoNETを退出して、新しいCoNETバージョンをダブクリックしてインストールをします。',
            exit: '旧CoNETを退出',
            tryAgain:'もう一度',
            refresh:'リロードページ'
        },

        topWindow: {
            title: 'カナダ１５０周年特別提供'
        },
        
        imapInformation: {
            title: '通信専用Emailアカウントを登録',
            tempImapAccount: `IMAPのアカウント設定に困るなら、<a href="#" onclick="return linkClick ('https://github.com/QTGate/QTGate-Desktop-Client/wiki/IMAP%E9%80%9A%E4%BF%A1%E5%B0%82%E7%94%A8%E4%B8%80%E6%99%82%E7%9A%84%E3%81%AAiCloud%E3%82%A2%E3%82%AB%E3%83%B3%E3%82%A6%E3%83%88')">CoNETご提供している一時iCloudアカンウトをテストのご利用いただけます。</a>`,
            infomation:`CoNET通信専用emailアカンウトを設定します。このemailアカウントはあなたとCoNETお互い情報交換するのために、ユーザ名とパスワードをCoNETシステムへ提供します。個人情報漏洩の恐れ、一時的なemailアカウントを新たにつくてください。CoNET技術は只今<a href="#" onclick="return linkClick ('https://icloud.com')">Apple iCloud</a>, <a href="#" onclick="return linkClick ('https://www.microsoft.com/ja-jp/outlook-com/')">Outlook</a>, <a href="#" onclick="return linkClick ('https://login.yahoo.co.jp/config/login?.src=ym&.done=https%3A%2F%2Fmail.yahoo.co.jp%2F')">Yahoo Mail</a>, <a href="#" onclick="return linkClick ('https://gmail.com')">GMAIL</a>, <a href="#" onclick="return linkClick ('https://www.gmx.com/mail/#.1559516-header-nav1-2')">GMX</a>, <a href="#" onclick="return linkClick ('https://www.zoho.com/mail/')">HOZO</a>対応しております、APPLEのiCloudを使うお勧めです。( @OPN IPなし通信技術はiCloudのみ対応しております）</span>メールアカウントのパスワードについて、<a href="#" onclick="return linkClick ('https://support.microsoft.com/ja-jp/help/12409/microsoft-account-app-passwords-two-step-verification')">アプリパスワード</a>をご利用のをお勧めです。アプリパスワードを申請する際に、<a href="#" onclick="return linkClick ('https://support.microsoft.com/ja-jp/help/12408')">2段階認証プロセス</a>に必要なスマートフォン番号を提示が必要な場合、個人プライバシーを守るのため、( <a href="#" onclick="return linkClick('http://receive-sms-online.com/')">receive-sms-online.com</a>, <a href="#" onclick="return linkClick('https://sms-online.co/receive-free-sms')" >sms-online.co</a>, <a href="#" onclick="return linkClick('https://receive-a-sms.com/')" >receive-a-sms.com</a> ) など<a href="#" onclick="return linkClick ('http://jpnpay.com/archives/561')">オンライン無料SMS受信サービス</a>をお勧めします。`,
            serverDetail: '詳細設定：',
            imapServer: 'IMAP設定',
            imapServerInput: 'IMAPサーバー名又はIP',
            UserName: 'ログインユーザー名',
            Ssl: 'Ssl暗号化通信：',
            portName: '通信ポート番号',
            otherPortNumber: 'その他：',
            Error_portNumber: '通信ポート番号は1から65535まで、22ではないの数字です。',
            smtpServer: 'SMTP設定',
            smtpServerInput: 'SMTPサーバー名又はIP',
            emailServerPassword: 'Emailパスワード(アプリパスワードお勧め)',
            imapAccountConform: function ( iamp, account ) { return `<p class="ui small header brown">以下の事項をよく確認してから、送信ボタンを押してください：</p><p>このEmailアカンウト「<B class="red">${ iamp }</B>」はあなたがCoNETシステムを使用するのために、一時的新たに作ったEmailアカンウトです。あなたはCoNETにこのEmailアカンウトのアクセス権にすることが了承しました。</p><p>以下の内容をCoNETへ送信することを了承すること：メールアカウント「<B class="red">${ iamp }</B>」とAPPパスワード、メールアドレス「<B class="red">${ account }</B>」、使う言語、タイムゾーン、パブリックキー。</p><p>あなたはCoNETに「<B class="red">${ account }</B>」へCoNETに関わるシステム情報、支払い、アカンウト、販促などを送信することを了承と認可をします。</p>` },
            agree:'私はそのリスクが了承して続きする',
            imapOtherCheckError: 'Emailサーバーに接続ができませんでした。Emailサーバー名又はIPアドレス又は通信ポート番号に間違いがあります、詳細設定で再チェックをしてください。',
            CertificateError: 'Emailサーバーに提示したセキュリティ証明書は信頼できないものです。続くをしたい場合は、詳細設定の中の「セキュリティ証明書信頼でき無くとも接続をする」を選択してください。その場合はあなたのEmailインフォメーションを漏れる可能性があります。',
            IgnoreCertificate: 'セキュリティ証明書信頼でき無くとも接続をする',
            Certificat: '危ないこのです、この選択であなたのユーザ情報は盗聴される可能性が大きい。',
            addAEmail: '通信用Email追加',
            AuthenticationFailed: 'Emailサーバはログインエラーが提示しました。ユーザー名とパスワードを再チェックしてください。',
            tryAgain: 'もう一度試しにします',
            connectImap: 'CoNETに接続にします',
            cancelConnect: 'CoNETとの接続を中止します',
            imapItemTitle: '通信用Email詳細設定',
            imapCheckingStep: [
                /* 0 */'emailサーバへ接続しています。',
                /* 1 */'emailサーバへIMAP接続しました、CoNETからレスポンスを待ちます。',
                /* 2 */'emailサーバへSMTP接続しました',
                /* 3 */'CoNETクライアントは接続要請のメールをCoNETシステムへ送信しました、接続を完了するまで時間がかかるのためしばらくお待ちおください。',
                /* 4 */'CoNETへ接続しました',
                /* 5 */'emailサーバへIMAP接続しました'

            ],
            imapResultTitle:'IMAPサーバCoNET評価：',
            testSuccess: 'emailサーバのテストが完了しました',
            exitEdit: '退出編集Emailアカンウト',
            deleteImap: 'IMAPアカウトを削除',
            proxyPortError: 'ポート番号は3001から65535までの数字です。又指定したポートは他のアプリが使っています。番号を直してみてください。',
            appPassword:'APPパスワードについて',
            imapCheckError: [
                'Emailサーバーに接続ができませんでした。ネットワークがオフラインか、所在しているネットワークはメール通信プロトコルがサポートしておりません。ネット環境をチェンジし、ページを更新してからもう一回してみてください。',
                'Emailサーバはログインエラーが提示しました。ユーザー名とパスワードを再チェックしてください。',
                'Emailサーバーに提示したセキュリティ証明書は信頼できないものです。中間者攻撃があるネット環境にいるあもしれないです。ネット環境をチェンジしてもう一回してみてください。',
                'メール送信の際にエラーが発生しました。そのようなエラーは多分パスワードをAPPパスワードではなく、普通のパースワードを使った模様です。APPパスワードをチェックしてもう一回してみてください。',
                'ネットはインターネットに接続していない模様です。',
                'エラーが発生しました。CoNETを一回退出してからもう一回してみてください。',
                'メールストレージ容量が一杯です、不要なメールを削除してからもう一回してみてください。'
            ]
        },

        Home_keyPairInfo_view: {
            newVersionDownload: 'クリックしてダウンロードとインストール',
            title: '鍵ペアインフォメーション',
            emailNotVerifi: '鍵ペアはまだCoNETサインされていません。',
            emailVerified: '鍵ペアはCoNETサインされました。',
            NickName: 'ニックネーム：',
            creatDate:'暗号鍵ペア作成日：',
            keyLength: '暗号鍵ペアビット長さ：',
            password: '長さ5位以上のパスワードを入力してください',
            password1: '端末パスワード',
            logout: 'ログアウト',
            deleteKeyPairHaveLogin:'ログインした端末で暗号鍵ペアを削除して下さい。',
            keyID: '暗号鍵ID：',
            deleteKeyPairInfo: '鍵ペアを削除することで、現在のCoNET設定は全部なくなって、一からCoNETの設定をやり直しが必要です。但しあなたのCoNETアカウトEmailアドレスは前回と同じであれば、CoNETアカウトを戻れます。',
            delete: '削除',
            locked: 'まず鍵ペアのパスワードを入力して、鍵ペアのロックを解除してください。',
            systemError: 'システムエラーが発生しました。鍵ペアを削除して一からシステムを再設定をしてください。'
        },

		home_index_view: {
            newVersion: '新たなパージョンが用意しましたのでインストールをください。',
            newVersionInstallLoading:'更新中お待ちください',
            localIpAddress: 'ローカル',
            clickInstall:'インストール',
            internetLable: 'Internet',
            gateWayName: 'ゲットウェー',
            showing: 'システム状態',
            nextPage: '次へ',
            agree: '協議を合意し、次へ',
            imapEmailAddress:'Emailアカウト名',
            emailAddress: 'CoNETアカウトのEmailアドレス(必須), ',
            SystemAdministratorNickName: 'ニックネーム(必須)',
            creatKeyPair: '暗号鍵ペアを生成...',
            keyPairCancel: '暗号鍵ペアの生成をキャンセルしました',
            keyPairGenerateError: '暗号鍵ペアの生成にエラーが発生しました、後ほどもう一回してみて下さい',
            keyPairGenerateSuccess: '暗号鍵ペアの生成は完了しました',
            systemPassword: 'CoNET端末パスワードの設定',
            stopCreateKeyPair: '暗号鍵ペア生成をキャンセル',
            cancel: '操作停止',
            continueCreateKeyPair: '生成を続きします',
            KeypairLength: 'RSA暗号鍵ペアの長度を選んでください。この数字が長ければ、長いほど秘匿性によいですが、スピードが遅くなります。',
            systemAdministratorEmail: 'RSA暗号鍵ペア生成',
            GenerateKeypair: '<em>強秘匿性通信するのために、RSA暗号鍵ペアを生成中、大量なランダム数字が発生し、数分かかる場合もあります、4096ビットの場合、特に時間がかかります、しばらくお待ち下さい。RSA暗号技術について、ウィキペディア百科辞典を参考してください：' +
                `<a href='https://ja.wikipedia.org/wiki/RSA暗号' target="_blank" onclick="return linkClick ('https://ja.wikipedia.org/wiki/RSA暗号')">https://ja.wikipedia.org/wiki/RSA暗号</a></em>`,
            inputEmail: 'お疲れ様です、最後の設定をしましょう。このRSA暗号鍵ペアは本システムに重要な存在です、ユーザーのCoNETへ身元証明、本システムデータを秘密化、CoNETシステムとデータ通信時この暗号鍵ペアを使います。パースワードはCoNETへ保存しませんですから、大事にメモしてください。<em style="color:brown;">CoNETはネットワークの制限があるエリアにブラックリスト入って恐れがあります、ここに制限があるエリアのメールサービスを入れるとCoNETからのメールが受信不能になる可能性もあります、CoNETへ登録完了することができない場合もあります。</em>',
            accountEmailInfo:'CoNETドメイン名は、ファイヤウォールがある場合はブラックリストに入っている可能性がありますから、CoNETシステムへ登録完了することができません。その場合はファイヤウォール外側のEmailシステムを利用してください。'
        },

        error_message: {
            title: 'エラー',
            errorNotifyTitle: 'システムエラー',
            EmailAddress: ['メール アドレスを someone@example.com の形式で入力してください。', '同じEmailアカンウトが既に存在します。','入力したメールはCoNETシステム非対応です。'],
            required: 'このフィールドを入力してください。',
            PasswordLengthError: '5文字以上の長さのパスワードが必要。',
            localServerError: 'ローカルサーバーエラーが発生しました、CoNETを再起動をください！',
            finishedKeyPair: '暗号鍵ペア作成完了しました。',
            Success: '完成',
            doCancel: 'キャンセルしました',
            errorKeyPair: '暗号鍵ペア作成際エラーが発生、もう一度してください。',
            SystemPasswordError: '暗号鍵パスワードが違います。パースワードが忘れた場合、現在の鍵ペアを削除してください。この場合は、現有の設定はなくなって、一からシステム設定をやり直しが必要です。',
            finishedDeleteKeyPair: '暗号鍵ペア削除しました。',
            offlineError: 'インターネット接続されていないらしいですが、ネットワークをチェックしてもう一度お試しください！',
            imapErrorMessage: [
        /* 0 */ 'CoNETと接続ができませんでした。CoNETサービスが一時停止しています。後ほどもう一度してみてください。またはCoNETサービスにお問い合わせしてください。',
        /* 1 */ 'データフーマットエラー！', 
        /* 2 */ 'インターネット接続されていないらしいですが、ネットワークをチェックしてもう一度お試しください！',
        /* 3 */ 'mailサーバはIMAPユーザー名又はパスワードに間違いがあると提示しました！このエラーは普通パスワードを使っていましたか、またはAPPパスワードが失効と可能性もありますが、メールプロバイダのアカウトページへチェックをしてください。', 
        /* 4 */ '指定したPORTでemailサーバへIMAPの接続ができませんでした、PORT番号をチェックしてください、ファイヤウォールの中にいる場合、指定したPORTはファイアウォールにフィルタした可能性があ裏ます、IMAPサーバーのその他有効PORT番号にチェッジしてください。<a href="https://tw.help.yahoo.com/kb/SLN15241.html" target="_blank" onclick="return linkClick (`https://tw.help.yahoo.com/kb/SLN15241.html`)">应用密码</a>',
        /* 5 */ 'IMAPサーバのセキュリティ証明書信頼できません。詐欺や、お使いのコンピューターからサーバーに送信されると情報を盗み取る意図が示唆されている場合があります。',
        /* 6 */ 'Emailサーバドメインは有効ではありません、emailサーバの設定を修正してください。又このPCはインターネットに接続しておりません、ネットワークをチェックしてください。',
        /* 7 */ 'このemailサーバはCoNET通信技術サポートしていません、もう一度テストをするか、他のemailプロバイダにチェンジをしてください。',
        /* 8 */ 'emailサーバはSMTPユーザー名又はパスワードに間違いがあると提示しました！',
        /* 9 */ 'SMTPサーバのセキュリティ証明書信頼できません。詐欺や、お使いのコンピューターからサーバーに送信されると情報を盗み取る意図が示唆されている場合があります。',
        /* 10 */'SMTPサーバへ接続ができません。',
        /* 11 */'同じEmailアカンウトが既に存在します。',
        /* 12 */'CoNETと接続ができていません！',
        /* 13 */'ご利用メールアドレスのメールボックス容量がいっぱいになっています。',
        /* 14 */'通信に未知のエラーが発生しました。'
            ],
            CoNET_requestError: [
                /* 0 */'CoNETが応答していなかったです。CoNET通信を再確立しています。しばらくお待ちください！ ',
                /* 1 */'無効な操作です！'
            ]
        },

        emailConform: {
            activeViewTitle:'鍵ペア検証',
            requestReturn: ['エラー発生しました、それは短時間内多数の請求をしたことです。','検証メールを発送しました。'],
            info1_1:`鍵ペア検証は未完成です。「検証Emailを発行」を押してからメールボクス「`,
            info1_2: `」をチェックしてください。CoNETから多数メールの場合は、最後のを選んでください。CoNETからのメールが見つからない場合は、鍵ペアを生成するメールアドレスを正しいかどうか、ダブチェックしてください。または鍵ペアを削除して新しい鍵ペアを再作成をしてください。`,
            info2: 'コピーするのは「-----BEGIN PGP MESSAGE-----」から「-----END PGP MESSAGE-----」まで全ての内容をしてください。',
            emailTitle: 'CoNETをご利用頂いて誠に有難うございます',
            emailDetail1: '',
            emailDetail1_1: ' 様',
            emailDetail2: 'あなたのCoNETアカンウト検証暗号です。以下の全ての内容をコピーして、認証フィルターにペーストをしてください。',
            bottom1_1: '以上',
            bottom1_2: 'CoNETチームより',
            conformButtom: '検 証',
            reSendRequest:'検証Emailを発行',
            formatError: [
                'フォーマットエラー、コピーするのは「-----BEGIN PGP MESSAGE-----」から「-----END PGP MESSAGE-----」まで全ての内容をしてください。',
                'この内容で暗号化解除ができませんでした。鍵ペアEmailアカンウトメールボックス再検査し、CoNETから最後のを選んでください。または鍵ペアを削除して、鍵ペア再発行してください。',
                'CoNETに接続するのはエラーが発生した、一回退出し、再起動して接続をしてください。',
                '検証できません！CoNETから多数メールの場合は、最後のを選んでください。',
                'あなたのCoNETには問題があります、鍵ペアを削除して一から再セットアップしてください。',
        /*5*/   'ごめんなさい、CoNETシステムは応答してくれません、オフラインかもしれません。後からもう一度試しにしてください',
                'あなたの今日データ通信はリミットになっていますので、明日まで待ってください。またはユーザー種類をアップグレードをしてください',
                '通信用IMAPの設定にエラーがあるか又はそのタープのIMAPアカンウトがCoNETサポートしません。よくチェックしてもう一回試しにしてください。',
                '選択していたゲットウェーエリアは只今接続不能になっております、後ほどもう一度試しにしてください。',
                'IMAPアカウトでEMAIL送信する際エラーが発生しました、一回退出し、起動して見てくださいね。重複発生した場合はIMAPアカウトのウェーブページでアカウトをアンロック操作を必要かもしれない。',
                'ページセッションが終了しました。続行するにはページを更新するか、またCoNETを再起動してください',
                'CoNETプラットフォームが故障になったと思いますが、CoNETを再起動してください'
            ],
            activeing: '通信中'
        },

        QTGateRegion: {
            title: '高品質カスタマーゲートウェイサービスエリア',
            speedTest: 'スピードテスト：',
            available: 'サービス中',
            unavailable: '準備しています',
            CoGateRegionStoped:'ゲートウェイサーバーシャットダウンされました。',
            requestPortNumber: 'ゲートウェイサーバーとの通信ポート:',
            proxyDomain:'ドメイン検索はCoNETゲットウェイ側に依頼します。',
            setupCardTitle: '接続技術:',
            paidUse:'このエリアは契約ユーザーだけ使えます。',
            MultipleGateway: '並列使うゲットウェイ数',
            dataTransfer: '通信データは：',
            dataTransfer_datail: ['全てのデータをOPN経由','ターゲットサーバへ到達不能時だけ'],
            proxyDataCache: 'Webキャッシュ:',
            proxyDataCache_detail: ['Yes','No'],
            clearCache: 'クリアオールキャッシュ',
            cacheDatePlaceholder: 'Webキャッシュ有効期限',
            localPort: 'ローカルプロキシポート番号:',
            option: '詳細設定',
            localPath: 'ローカルプロキシポートPATHを指定します。',
            outDoormode: '接受外網訪問',
            WebRTCleak:'WebRTC漏れ対応',
            WebRTCleakInfo: 'EtoEのゲイムやチャットなど動作しないかもしれません。',
            pingError:'CoNETゲットウェイエリアスピードチェックエラーが発生しました。一回CoNETを終了して、管理者としてCoNETを再起動をして、スピードチェックをしてください。',
            QTGateRegionERROR:['CoNETへ接続要請メールの送信ができなかったです。IMAPアカウントの設定を調べてください。',
            ''],
            sendConnectRequestMail: [
                'CoNETクライアントはCoNETシステムとの接続が切れた。再接続要請メールをCoNETシステムへ送信しました、接続を完了するまで時間がかかるのためしばらくお待ちおください。',
                'CoNETに長い間ご利用していなっかた時、接続は切れた場合もあります。'],
            GlobalIp: 'グロバールIP:',
            GlobalIpInfo:'要注意：【CoNET接続】をおすとあなたのグロバールIPアドレスをCoNETシステムに送信しますので、それを遠慮すれば【@OPN】接続を選んでください。@OPN技術がサンフランシスコリージョンに、iCloudメールしか対応しておりません。',
            cacheDatePlaceDate: [{ name:'1時間', id: 1 }, { name:'12時間', id: 12 },{ name:'一日', id: 24 }, { name:'15日', id: 360 }, { name:'1月', id: 720 }, { name:'6月', id: 4320 }, { name:'永遠', id: -1 }],
            connectQTGate:'CoNETゲットウェーエリアインフォメーションを取得しています...',
            atQTGateDetail: [
        /*0*/   'CoNETの世界初のIP不要な通信技術です。暗号化したEmailメッセージを通じたゲットウェイに接続することで、身を隠して誰も知らないうちにインターネットへ、プライバシーと強くファイヤウォールをうまくすり抜けることができます。但しお使いメールサーバの性能に次第スピードが遅くなり、長い遅延など短所があります、ゲームやビデオチャットなどに通信障害出る可能性があります。この技術はiCloudアカンウトのみ対応です',
        /*1*/   'CoNETオリジナル技術のトラフィックをHTTPに偽装した暗号化通信技術です。あなたのIPを使ってゲットウェイに直接接続することで、高速通信とプライバシー、強くファイヤウォールをうまくすり抜けることができます。インターネット自由アクセスのためにCoNETを使うことになら、これをおすすめです。',
        /*2*/   'ドメイン検索をCoNETゲットウェイ側にすることで DNS cache pollution を防ぐことができます。この選択は必要です。',
        /*3*/   '全てインターネットデータをCoNETゲットウェイに通じてすることで、匿名でインターネットアクセスします。',
        /*4*/   'ローカルネットワークが目標サーバに到達不能な際に、CoNETゲットウェイ通じてします。このことはネットスピードがアップできますが、プライバシーが無くなります。',
        /*5*/   'アクセスしたWebサイトを一時ファイルに保持することで、高速レスポンスが利用可能となります、CoNETはいつも暗号化したデータを本機に保存します。但し暗号化通信には不対応です。',
        /*6*/   'キャッシュを保存しません。',
        /*7*/   'キャッシュ有効期限の設定によって、いつもサーバ側の最新情報を入手することができます。単位は時間です。',
        /*8*/   'ローカルプロキシサーバーが他のデバイスをこのポートに接続によってCoNETデータの通信を利用可能です。3001から65535の間の数字を入れてください。',

        /*9*/   'ローカルポロックPATHを指定することで、あなたのローカルポロックサーバを簡単セキュリティを与えられます。無断使用を禁止することができます。',
        /*10*/   '同時に使うゲットウェイ数目を指定します。この技術はネットワークの大流量をいくつかのIPアドレスに分散して、監視者から逃げられます。この機能は有料会員しかのです。',
        /*11*/   'CoNETゲットウェーとの通信ポート番号を指定します。あなた所在するネットワークの制限された通信ポートから避けることができます。',
        /*12*/   'Web Real-Time Communication (WebRTC)は、ブラウザ間で仲介なしのIPアドレス直接的な、高速やり取りを可能にするオープン標準技術です。悪用の場合は、真実のIPアドレスを検出するをWebRTC漏れと呼ばれるものです'
            ]
        },

        QTGateGateway: {
            title: 'CoNETサービス使用詳細',
            processing: 'CoNETネットワークへ接続中...',
            error: [
        /* 0 */     'エラー：あなたのアカンウトに既にCoNETゲットウェイに接続しているクライアントがありますが、その接続を退出してからもう一度接続してください。',
        /* 1 */     'エラー：あなたのアカンウトにCoNETゲットウェイデータ通信制限になっております。もし引き続きご利用を頂きたいなら、アカンウトをアップグレードにしてください。フリーアカウントの場合は毎日100M、毎月1GBの通信制限があります。',
        /* 2 */     'エラー：データフォーマットエラー、CoNETをリスタートしてください。','ごめんなさい、ご請求したゲットウェイエリアは準備中です。そのたのエリアを選ぶか、後ほど接続をしてください。',
        /* 3 */     'エラー：請求した接続方法はこのエリアに対応しておりません、他のエリアに変更するか他の接続方法へください。',
        /* 4 */     '@OPN接続をしたいなら、公衆iCloudアカウントに対応できません、ご自分のiCloudアカウントをCoNET通信アカウントにしてください。'
                ],
                    
            connected:'接続しました。',
            promo: 'プロモーション',
            upgrade:'アップグレードアカンウト',
            accountManager:'アカンウト',
            userType: ['無料ユーザー','月契約'],
            datatransferToday:'日通信量制限：',
            datatransferMonth:'月通信量制限：',
            todaysDatatransfer: '今日使える通信量',
            monthDatatransfer: '今月使える通信量',
            gatewayInfo: ['ゲットウェイIPアドレス：','ゲットウェイ接続ポート番号：'],
            userInfoButton: '使用ガイド',
            stopGatewayButton:'ゲットウェイサーバを停止します',
            disconnecting: 'ゲットウェイサーバを破壊しています'
        },
        
        qtGateView: {
            title: 'CoNETへカスタムサーバーの作成を要請',
            QTGateConnectResultWaiting: 'CoNETへ接続請求メールを送信しました。初めてのCoNETへ接続請求ですから、接続完成したまで数分かかる場合もあるかもしれませんが、暫くお待ちをください。',
            mainImapAccount: 'CoNETへ情報交換用Emailアカンウト',
            QTGateDisconnectInfo: 'CoNETと接続はしておりません、通信専用Emailを選択してCoNETへ接続メールを送信します。',
            QTGateConnectError: ['CoNETへメールの送信にエラーが発生しました。通信専用Emailをチェックしてください。'],
            QTGateConnectStatus: 'CoNET接続状態',
            QTGateConnectResult: ['未接続、クリックと接続します。', 'CoNETへ接続中.', 'CoNETに接続しました。', 'CoNETへ接続にエラーが発生しました。IMAP設定を立ち直すしてください。',
                'CoNETに接続しました。'],
            QTGateSign: ['あなたの鍵ペア状態','CoNETに信頼サインがないです','CoNETに信頼サインを取得したことで、CoNETのユーザーの間にファイル又はインフォーメーションなど秘密情報を交換する際、あなたの身元証明となります。本人以外のを区別することができます。あなたも持っている鍵ペアで他のCoNETユーサーに信頼サインすることで、あるCoNETユーサーを信頼関係確定することができます。',
                'CoNETに信頼サインを取得しています','CoNETシステムエラー、CoNETを再起動してからもう一度してみてください。もし直れないならCoNETを一から再インストールしてください。','CoNETシステムエラー']
        },

        feedBack: {
            title: 'フィードバック',
            additional: '追加情報を添付する',
            okTitle:'CoNETへ送信'
        },

	},{
        perment:{
            serverTitle:'Server'
        },
        twitter: {
            newTwitterAccount: `Please input Twitter APP information. How to create Twitter APP please click <a target="_blank" href='https://github.com/QTGate/QTGate-Desktop-Client/wiki/Create-Twitter-APP'">hear</a> to got more information.`,
            addAccount:'Add an Twitter account',
            following: ['Following','Unfollow','Follow'],
            followers:'Followers',
            second: 's',
            min: 'm',
            hour: 'h',
            videoSizeOver: `This video is over Twitter specifications: 140's or 300MB or (1280 x 1024).`,
            retweeted: 'Retweeted',
            month:'m',
            day: 'd',
            close:'Close',
            newTwitterTitle: ['Compose new Tweet', 'Compose new thread'],
            returnEdit: 'Cancel',
            replying: 'Replying to ',
            twitterBottonTitle: ['Tweet', 'Tweet all'],
            urlInfo: '<h3>Twitter client previwe version from CoNET.</h3><p>A free and no need VPN or CoGate gateway, anonymous and securety via CoNET network access your Twitter account.</p><p>You also may open this App with URL from your cellphone and other device.</p>',
            newTwitterDistroyButtonTitle: ['Discard','Discard'],
            
            accountError:'Twitter return error: Invalid or expired token. error. Please check your account APP information and try again.'
        },
        thirdParty: {
            information: 'CoNET Platform',
            comesoon:'Come soon.',
            qtgateGateway: 'CoGate gateway service. High speed, total privacy, ultra secure and easy to use. Your gateway to a secure and open internet.',
            app:['CoGate', 'CoMsg', 'CoBox', 'CoMail', 'CoNews','Co Custom', 'Co for', 'Co for','Co for','CoWallet'],
            
            dimmer: [
                'Advanced private custom gateway service',
                'Private and secure, decentralized social media',
                'Private cloud storage and file sharing',
                'Privacy email client',
                'Discover your world every day',
                'Custom business solution for public or private APPs in CoNET',
                'Privacy Google search client',
                'Privacy Tweet client',
                'Privacy Youtube client. May download Youtube video via 3rd-party webside.',
                'Privacy blockchain wallet'
            ]
        }, 
        account:{
            QTGatePayRisk: 'Your payment will be processed via CoNET’s secured payment portal. If concerned about privacy, Please use the Stripe payment portal.',
            paymentSuccessTitile: 'Thank you.',
            stripePayment: 'Bank gateway payment',
            willPayNextExpir:`We'll charge your payment at renew day `,
            openAutomatically: 'Auto-renew',
            paymentProblem1: 'Payment via CoNET',
            promoButton: 'Have Promo',
            paymentProblem:'Looks bank payment gateway was block in your area. You can payment via CoNET gateway.',
            qtgatePayment:'Payment with CoNET System',
            paymentSuccess:'Your plan has beed upgraded.',
            qtgateTeam: 'The CoNET Team',
            networkShareTitle:'Bandwidth',
            CancelSuccess: function ( PlanExpire: string, isAnnual: boolean, returnAmount: number ) {
                return `Your subscriptions was cancelled. You may keep use CoNET service with this plan until ${ new Date( PlanExpire ).toLocaleDateString() }. Restrictions apply to free accounts and accounts using promotions. ${ isAnnual ? `Refund amount us$${ returnAmount } will return to your paid card account in 5 working day.` : `Automatically canceled.` } `
            },
            currentPlanExpire: ['Plan expires on: ','Renews at','monthly reset day '],
            currentAnnualPlan: ['Monthly plan','Annual plan'],
            cardPaymentErrorMessage:[
        /* 0 */ 'Error: card number or have an unsupported card type.',
        /* 1 */ 'Error: expiration!',
        /* 2 */ 'Error: Card Security Code',
        /* 3 */ 'Error: Card owner postcode',
        /* 4 */ 'Error: payment failed. Please try again late.',
        /* 5 */ 'Error: Payment data format error!',
        /* 6 */ 'Error: Payment failed from bank.',
        /* 7 */ 'Error: Please try again late.'
            ],
            title: 'Manage account',
            segmentTitle:'Account: ',
            needPay: 'The balance: ',
            cancelPlanButton:'Cancel plan',
            currentPlan:'Current Plan: ',
            oldPlanBalance: 'Remaining of old plan: ',
            MonthBandwidthTitle:'Gateway Bandwidth：',
            dayBandwidthTitle:'Day limited：',
            bandwidthBalance:'Bandwidth remaining: ',
            upgradeTitle: 'Upgrade',
            planExpirDate: function ( year: string, month: string, day: string ) { return `${ month }/${ day } ${ year }`},
            accountOptionButton: 'Account option',
            planPrice: 'Plan price：',
            monthResetDay:'Monthly reset day: ',
            monthResetDayAfter:'th',
            cantUpgradeMonthly: 'Annual may not downgrade to monthly plan. Please cancel current plan, then select this one.',
            DowngradeTitle:'Downgrade Option',
            cancelPlan:'Cancel plan',
            cantCancelInformation: 'This subscription plan may not be cancelled. Free user plans, promotions, special codes and test program plans cannot be cancelled. ',
            multiOpn:'OPN multi-gateway technology',
            MonthBandwidthTitle1:'Bandwidth',
            serverShare:'Gateway',
            monthlyAutoPay: function ( monthCost: number ) { return `<span>Billed Monthly</span><span class="usDollar" >@ us$</span><span class="amount" >${ monthCost }</span>/mo<span>` },
            cardNumber: 'Card number',
            paymentProcessing:'Connecting...',
            calcelPayment:'Cancel',
            doPayment:'Process Payment',
            expirationYear: 'Expiration',
            postcodeTitle: 'Card owner postcode',
            payAmountTitile:'Amount',
            cvcNumber: 'Card Security Code',
            annualPay: function ( annual_monthlyCost: string ) { return `<span>Billed Annually</span><span class="usDollar">@ us$</span><span class="amount" >${ annual_monthlyCost }</span>/mo<span>`},
            canadaCard:'*For Canadian residents, GST (5%) will be applied automatically.',
            multiRegion:['multi-gateway in single region','multi-gateway in multi-regions*','multi-gateway in multi-regions*','multi-gateway in multi-regions'],
            continue:'Next step',
            serverShareData:['Shared gateway','Dedicated gateway server*','Dedicated 2 gateway server*','Dedicated 4 gateway server'],
            internetShareData:['Shared High Speed Bandwidth','Dedicated High Speed Bandwidth*','Dedicated 2 High Speed Bandwidth*','Dedicated 4 High Speed Bandwidth'],
            maxmultigateway: ['Max: 2 multi-gateway','Max: 4 multi-gateway*','Max: 4 multi-gateway'],
            monthlyPay:'Monthly pricing',
            aboutCancel: '*About Subscription cancellation',
            cancelPlanMessage: '<span>You may cancel your CoNET subscription at any time from within the this app. You will continue to have access to the CoNET services through the end of your paid period until all remaining subscription time in your account is used up. Please refer to the </span><a class="ui olive tiny label">Terms of Service</a> for cancellation and refund policy. Restrictions may apply to free plans and promotional accounts.',
            serverShareData1:'Your dedicated server will be share ratio when you connected over your dedicated count via use Multi-gateway technology.',
            cancelPlanMessage1: function ( isAnnual: boolean, amount: number, monthlyPay: number, expire: string, passedMonth: number, totalMonth: number ) {
                return `<span>Your are on ${ isAnnual ? `annual payment plan</span><span class="usDollar">us$</span><span class="amount">${ amount /100  }</span><span>. ${ passedMonth } month${ totalMonth - passedMonth > 1 ? 's': '' } are available on your account. Your refund amount will be </span><span class="usDollar">us$</span><span class="amount">${ amount - passedMonth * monthlyPay > 0 ? ( amount - passedMonth * monthlyPay ) /100 : 0 }</span>.`: `monthly, it will not be renew at </span><span class="amount">${ nextExpirDate ( expire ).toLocaleDateString() }</span><span> if you cancel this plan.</span>`}`
            }
        },

        QTGateDonate: {
            title: 'Free access website provided by sponsor.',
            meta_title:'Donor：',
            detail:`CoNET users may access these sponsored websites via CoNET OPN. Free users may not be able to access if your daily limit has been reached.`
        },

        QTGateInfo: {
            title:'Features',
            version:'Installed veriosn：v',
            detail:[{
                color: '#a333c8',
                icon: 'exchange',
                header: 'OPN: Security and Privacy while accessing the Open Internet.',
                detail: `@OPN@ uses CoNET’s “Quiet” technology to create a obfuscated private network by refracting encrypted data packets thru email servers. @OPN provides true stealth internet communications where your IP address is hidden to client or proxy servers. iOPN uses CoNET’s technology to obfuscate data traffic over HTTP. Both @OPN and iOPN offer security, protection and privacy while allowing access to the open internet. All data is kept private with encryption using <a onclick="return linkClick('https://en.wikipedia.org/wiki/Advanced_Encryption_Standard')" href="#" target="_blank">AES256-GCM</a> and <a onclick="return linkClick ('https://en.wikipedia.org/wiki/Pretty_Good_Privacy')" href="#" target="_blank">OpenPGP</a> along with CoNET’s proprietary security measures.`
            },{
                color: '#e03997',
                icon: 'talk outline',
                header:'QTChat: Private and secure, peer to peer Instant messaging with no IP address.',
                detail:'CoNET users can communicate with others via a private and secure instant messaging service. Using the @OPN stealth technology and end-to-end encryption, users are secure and messages kept private with no IP address footprint. Supports group chat with multiple users and can be used for privately transferring, pictures, files and live video streaming. Using end-to-end encryption ensures only the user and the people the user is communicating with can read what is sent, and nobody in between, not even CoNET. This is because messages are secured with an encrypted lock, and only the recipient and original message sender will have the special key needed to unlock and read them.'
            },{
                color: '#6435c9',
                icon: 'cloud upload',
                header: 'QTStroage: The secure and Private cloud storage and file sharing.',
                detail: 'Users can store and share files by using CoNET @OPN to split files into multiple parts, each encrypted to different email accounts. CoNET user can share the file privately between other users on CoNET’s OPN.'
            },
            {
                color: 'darkcyan', 
                icon: 'spy',
                header: 'Spam and Spyware detection and blocking.',
                detail: 'CoNET uses the global DNSBL database to stop spam and spyware. CoNET users will be automatically filtered from spam and spyware to stop them from transmitting your information.'
            },{
                color: '#6435c9',
                icon: 'external share',
                header:'Personal VPN connection.',
                detail:'Access your CoNET OPN services anywhere via personal VPN connection from anywhere.'
            }]
        },

        firefoxUseInfo:{
            title1:'Firefox browser can use separate proxy settings from the system settings. This allows for easy use of a proxy to access the internet without editing the system settings.',
            info:[{
                title:'CClick Firefox tool icon. Select Preferences or Options.',
                titleImage:'/images/macOsControl.jpg',
                detail: '<p><a href="https://www.mozilla.org/en-US/firefox/#" target="_blank">Download Firefox.</a></p>',
                image: '/images/firefox1.jpg'
            },{
                title:'In the General tab, scroll to the bottom, click on Settings under Network Proxy.',
                titleImage:'',
                detail:'',
                image: '/images/firefox2.jpg'
            },{
                title:'Select Automatic proxy configuration URL and insert the URL as shown in blue below (select URL for HTTP/S or SOCKS). Make sure to Check on “Proxy DNS when using SOCKS v5”. Click OK to finish setup.',
                titleImage:'',
                detail:'Chose either HTTP or Socket settings.',
                image: '/images/firefox3.jpg'
            }]
        },

        cover: {
            firstTitle1: 'CoNET Platform',
            firstTitle2: 'Security Privacy And Freedom on the Internet',
            start: 'ENTER NOW',
            proxyStoped: 'Gateway server shutdown. Please rebuild try again.'
        },

        useInfoiOS: {
            title1:'iOS device local proxy setup.',
            info:[{
                title:'Open the control panel and select the WiFi settings.',
                titleImage:'/images/macOsControl.jpg',
                detail: '',
                image: '/images/iOS1.jpg'
            },{
                title:'Select the icon on the right side of the connected Wifi name.',
                titleImage:'',
                detail:'',
                image: '/images/iOS2.jpg'
            },{
                title:'Turn On Configure Proxy',
                titleImage:'',
                detail:'',
                image: '/images/iOS3.jpg'
            },{
                title:'Select Automatic.',
                titleImage:'',
                detail:'<p>Check Automatic proxy and insert the URL as shown in blue below (select URL for HTTP/S or SOCKS). Save to finish setup.</p>',
                image: '/images/iOS4.jpg'
            }]
        },

        useInfoAndroid: {
            title1:'Android device local proxy setup.',
            info:[{
                title:`Open your device’s Settings. Under Networks, Select Wi-Fi.`,
                titleImage:'/images/androidSetup.jpg',
                detail: '',
                image: '/images/android1.jpg'
            },{
                title:'Tap and hold the connected Wi-Fi network name until a pop up menu appears. Then tap Modify network or Manage network settings.',
                titleImage:'',
                detail:'',
                image: '/images/android2.jpg'
            },{
                title:'Tap to show Advanced options. Under Proxy, select Proxy Auto-Config.',
                titleImage:'',
                detail:'Insert the PAC URL as shown in blue below (select URL for HTTP/S or SOCKS) and Save to finish setup',
                image: '/images/android3.jpg'
            }]
        },

        useInfoWindows: {
            title1:'Windows 10 proxy setup',
            info:[{
                title:'For all other Windows versions.',
                titleImage:'',
                detail: '<p>For other Windows versions’ proxy setup info, please visit <a href="#" target="_blank" onclick="return linkClick (`https://support.microsoft.com/en-us/help/135982/how-to-configure-internet-explorer-to-use-a-proxy-server`)">Microsoft website.</a></p><p>This is the data for proxy server setup:</p>',
                image: ''
            },{
                title:'Open Microsoft Edge',
                titleImage:'/images/IE10_icon.png',
                detail: 'Click the tool icon at the top of right, Scroll down menu to the bottom and select Settings.</p>',
                image: '/images/windowsUseInfo1.jpg'
            },{
                title:'Scroll to bottom of menu and click View advanced settings.',
                titleImage:'',
                detail:'',
                image: '/images/windowsUseInfo2.jpg'
            },{
                title:'Scroll down menu and click Open proxy settings.',
                titleImage:'',
                detail:'',
                image: '/images/windowsUseInfo3.jpg'
            },{
                title:'Select Proxy, turn On Automatically detect settings and Use setup script. Insert the Script address as shown in blue below. Then click save to finish.',
                titleImage:'',
                detail:'<p>Windows 10 system only supports HTTP & HTTPS proxy, SOCKS5 users will need install a browser like Firefox, then setup the SOCKS5 PROXY in Firefox.',
                image: '/images/windowsUseInfo4.jpg'
            }]
        },

        useInfoMacOS: {
            proxyServerIp:'<p>Proxy setup: <span style="color: brown;">Automatic or Auto-Config</span></p>',
            proxyServerPort: 'HTTP & HTTPS proxy setup:',
            webRTCinfo:'Stop WebRTC leak: Please use SOCKS proxy setup. Click <a href="/Wrt" target="_blank">here</a> to check WebRTC leak.',
            wrtTest: 'Test result: ',
            customProxy: 'Custom gateway server ready',
            proxySetupHelp:'Need help? Please click the icon which is your OS.',
            wrtTestAreaTitle: 'WebRTC leak area',
            proxyServerPassword: 'SOCKS proxy setup:',
            localIpAddress:'This is intronet IP address, No leak.',
            globalIpAddress:'This is your real IP address, If show this it is WebRTC leak.',
            title:'Local proxy server is running at background. All other devices can access internet via local proxy setup to use the CoNET OPN.',
            title1:'MacOS proxy setup',
            info:[{
                title:'Open the control panel, click on network.',
                titleImage:'/images/macOsControl.jpg',
                detail:'',
                image: '/images/userInfoMacos1.jpg'
            },{
                title:'click on Advanced... ',
                titleImage:'',
                detail:'',
                image: '/images/macosUserInfo2.jpg'
            },{
                title:'Select Proxies, check Automatic Proxy Configuration, check Exclude simple hostnames.',
                titleImage:'',
                detail:'<p>Insert Proxy URL shown in blue in the image below (select URL for HTTP/S or SOCKS). Click OK to finish.</p>',
                image: '/images/macosUserInfo3.jpg'
            }]
        },

        topWindow: {
            title: '150th anniversary of Canada'
        },

        firstNote:  {
            title:　'Thank you for using our products and services (the “Services” or “Service”). The Services are provided by CoNET Technology Inc. (“CoNET”).',
            firstPart: 'By using our Services, you are agreeing to these terms. Please read them carefully.',
            detail: [
                {
                    header: 'Terms of Service',
                    detail: 'This Terms of Service document (the “Terms”) outlines the terms and conditions of use of Services provided by CoNET Technology Inc. These Terms also govern the use of and access to CoNET’s content (the “Content”), which includes the CoNET’s website (the “Site”), applications (the “Apps”), and any tools, software provided by CoNET (the “Software”).'
                }, {
                    header: null,
                    detail: 'Before using CoNET’s Services, please read this agreement thoroughly. If You have any questions concerning the content of this agreement or what it implies, please contact CoNET at email address: support@CoNETTech.ca'
                }, {
                    header: null,
                    detail: 'We may suspend or stop providing our Services to you if you do not comply with our terms or policies or if we are investigating suspected misconduct. Using our Services does not give you ownership of any intellectual property rights in our Services or the content you access. You may not use content from our Services unless you obtain permission from its owner or are otherwise permitted by law. These terms do not grant you the right to use any branding or logos used in our Services. Don’t remove, obscure, or alter any legal notices displayed in or along with our Services.'
                }, {
                    header: 'Eligibility for Service',
                    detail: 'By accessing the Content or Services, you are agreeing on behalf of yourself or those you represent (“You”) to comply with and be legally bound by these Terms in their entirety. These Terms constitute a legally binding agreement (the “Agreement”) between you and CoNET. If you do not agree with any part of the Terms, you may not use our Services.'
                }, {
                    header: null,
                    detail: 'By creating an account for using our Services, you represent that you are at least eighteen (18) years of age or that you are a valid legal entity, and that the registration information you have provided is accurate and complete. If You are accepting the terms of this agreement on behalf of a company or other legal entity, You represent and warrant that You have the authority to bind that company or other legal entity to the terms of this agreement. If You are accepting this agreement on behalf of an enterprise’s end user, it is Your responsibility to communicate the information in this agreement to the enterprise end users and ensure compliance with the terms and conditions contained herein. By agreeing to these Terms, you are also agreeing to the End User License Agreement (“EULA”), which you can read on CoNET’s website.'
                },
                {
                    header: 'Privacy Policy',
                    detail: 'Your privacy is highly important to us, since privacy is every person’s natural right! CoNET is committed to your privacy and does not collect or log browsing history, traffic destination, data content, or DNS queries from Subscribers using our Services. – hence, we DO NOT store details of, or monitor the websites you access while using our Services.'
                },{
                    header: null,
                    detail: 'During your registration, we will ask you for some personal information such as your email address and/or payment information. We only collect information that are necessary for the proper delivery of the Site and Services. This information is for our eyes only and will be stored on secured servers. The little bit of information we collect is the minimal usage statistics to maintain our quality of service. We may know: choice of server location, times when our Services was used by user and amount of data transferred by one user in one day. We store this information in order learn from it, and eventually deliver the best possible experience to you. This information which is gathered and analyzed generically is also kept on secured servers. We stand by our firm commitment to our customers’ privacy by not possessing any data related to a user’s online activities.'
                }, {
                    header: null,
                    detail: 'We reserve the right to modify the Privacy Policy at any time, so please review it frequently. Your continued use of the our Services will signify your acceptance of the changes to the Privacy Policy. If you have any questions regarding our Privacy Policy and how we handle your information, please feel free to contact CoNET at the following email address: support@CoNETTech.ca'
                }, {
                    header: 'Subscriptions',
                    detail: 'CoNET Services are available to you upon registration on the Site or Software. By subscribing to the Services, you agree to become a subscriber (“Subscriber”) for the period you have elected. A full list of subscription plans and pricing is available on the Site. CoNET reserves the right to amend subscription fees or institute new fees at any time upon reasonable advance notice posted on the Site or sent via email. Any changes to the pricing will not affect the Subscriber’s current subscription period and will become effective upon subscription renewal.'
                }, {


                    header: null,
                    detail: 'When supported by your payment method, plans renew automatically by default at the completion of the billing term. By default, the renewal term is for the same duration as the billing term for the original subscription. The subscription fee will be charged automatically to the payment method you last selected. If you would like to discontinue automatic renewal, you may turn off auto-renewal. By default, auto-renewal is turned on when you use a payment method that supports auto-renewal (such as a credit card or Paypal), and turned off when you use a payment method that does not support auto-renewal (such as bitcoin).'
                }, {

                    header: null,
                    detail: 'Your Subscription is Yours and Yours only. You may not lend it, rent it, hire it out or share it with people or any other legal entity such as a company, partnership etc, who are not You yourself. Each paid subscription grants you one (1) license to use.'
                }, {


                    header: 'Subscription Cancellation and Suspension',
                    detail: 'We want you to be fully satisfied with our services. However, we will troubleshoot an issue you experience first. There are several nuances to an OPN service configuration and we solve 99% of issues encountered. '
                },{
                    header: null,
                    detail: 'You may cancel your CoNET subscription at any time, and you will continue to have access to the CoNET services through the end of your paid period until all remaining subscription time in your account is used up. Subscription plan monthly billing cycle starts on the 1st day of each month. Subscription period will end on the last day of the month cancellation was requested. Restrictions apply to free accounts and accounts using promotions.'
                },{
                    header: null,
                    detail: 'You can cancel your Subscription within the client app. Refunds are subject to the CoNET’s Refund Policy. Please let us know, via email to support@CoNETTech.ca, any reasons to your decision in stopping use of our Service so we can be better for the future. Thank you.'
                },{
                    header: null,
                    detail: 'CoNET is entitled to impose Service limits, revoke any Service, suspend it, or block any type of usage made by You at its sole discretion if it is reasonable to believe that the You violate or have violated the Terms of Service or if the way You use the Services may render CoNET liable to any offence or breach of any third party rights or disturb other users use of the Service. CoNET does not undertake to provide You with any prior notice of these measures. The application of any of these measures will not entitle You to a refund.'
                }, {
                    header: 'Refund Policy',
                    detail: 'Cancellations to annual subscription may be entitled to a pro-rated refund of your current annual subscription payment amount minus the months of service used calculated at the standard monthly rate. (For example, accounts canceling within 3 months of an annual plan will be entitled to a refund of the amount paid subtracted by the 3 months of service used at the standard monthly rate.)'
                },{
                    header: null,
                    detail: `<p>We refund annual subscription purchase only. We will refund your order if:</p><div class="ui ordered list"><div class="item">It is the first time you've ordered our Services and there have not been previous purchases on your account.</div><div class="item">If you have made less than one hundred connections to our Service and your bandwidth usage is less than 500 MB.</div><div class="item">If you haven't violated CoNET’s Terms of Service in any way.</div></div>`
                },{
                    header: null,
                    detail: `It is the first time you've ordered our Services and there have not been previous purchases on your account.`
                },{
                    header: null,
                    detail: ``
                },{

                    header: null,
                    detail: 'We will refund your order if: <p class="tag info">It is the first time you’ve ordered our Services and there have not been previous purchases on your account.</p><p class="tag info">If you have made less than one hundred connections to our Service and your bandwidth usage is less than 500 MB.</p><p class="tag info">If you haven’t violated CoNET’s Terms of Service in any way.</p><p class="tag info">As stated above, if the refund request is made within 7 days since the purchase has been made.</p><p class="tag info">Refunds are generally processed within seven (7) days, and are made to the original form of payment used for purchase. All refunds are sent in USD and therefore the refund amount could differ from the amount originally paid in local currency or bitcoin. How long it takes until you will see the refunded amount in your bank account varies according to the payment method you used, bank regulations, etc.</p>'
                }, {

                    header: 'Acceptable Use Policy',
                    detail: 'You must follow any policies made available to you within the Services. You shall use CoNET Services in compliance with all applicable laws and not for any unlawful Purpose. CoNET Services may be accessed from all around the world, so it is your responsibility to assess whether using the Apps, Services, Sites or Software is in compliance with local laws and regulations. You may only use the Services as permitted by law. Services may NOT be used for any illegal activity. Whenever you use the Apps, Services, Sites or Software, you should comply with these Terms and applicable laws, regulations, and policies. You agree to not to use the Service in a way that may result in a violation of any laws of any jurisdiction. Don’t misuse our Services. For example, don’t interfere with our Services or try to access them using a method other than the interface and the instructions that we provide. We may suspend or stop providing our Services to you if you do not comply with our terms or policies or if we are investigating suspected misconduct.'
                }, {

                    header: null,
                    detail: 'You understand that it is your responsibility to keep your CoNET account information confidential. You are responsible for all activity under your account. You agree to not make any illegal or unauthorized use of the Services through Your user id/password and not to enable access to your account to users who are not You. If you ever discover or suspect that someone has accessed your account without your authorization, you are advised to inform us immediately so that we may revoke your account credentials and issue new ones. You will be held accountable and liable for any and all actions performed on the CoNET’s servers where the login is identified by Your user id/password. In order to protect the Services from being misused or used to harm someone, CoNET reserves the right to take appropriate measures when our Services are being used contrary to these Terms and applicable laws. You agree that CoNET may terminate your account, without providing a refund for Services already paid, if you misuse the Service.'
                }, {
                    
                    header: null,
                    detail: 'In using our Services, you agree not to: <p class="tag info">Send spam, uninvited emails or  transmit unsolicited advertisements or content (i.e., “spam”), or any other versions of spam, large quantities of emails even if such are sent-off from another server and sending opt-in emails.</p><p class="tag info">Send, post, or transmit over the Service any content which is illegal, hateful, threatening, insulting, or defamatory; infringes on intellectual property rights; invades privacy; or incites violence.</p><p class="tag info">Upload, download, post, reproduce, or distribute any content that includes sexual or explicit depictions of minors.</p><p class="tag info">Attempt to access, probe, or connect to computing devices without proper authorization (i.e., port scanning, scanning for open proxies, or any form of “hacking”).</p><p class="tag info">Attempt to compile, utilize, or distribute a list of IP addresses operated by CoNET in conjunction with the Service.</p><p class="tag info">Use for distribution of viruses, hacking, cracking, network sabotage, phishing; any fraudulent behavior is strictly prohibited.</p><p class="tag info">Use the Service for anything other than lawful purposes.You shall be held responsible for any damages caused by Your negligence or exposure to vulnerabilities, whether your actions were intentional or not.</p>'
                },{
                    
                    header: 'License',
                    detail: 'Subject to your compliance with these Terms, CoNET grants to you a worldwide, non-assignable, non-exclusive and limited license to use the software provided to you by CoNET as part of the Services. This license is for the sole purpose of enabling you to use and enjoy the benefit of the Services as provided by CoNET, in the manner permitted by these terms. You may not copy, modify, distribute, sell, or lease any part of our Services or included Software, nor may you reverse engineer or attempt to extract the source code of that Software, unless laws prohibit those restrictions or you have our written permission. Using the Software and our Services in any way not expressly authorized by CoNET is strictly prohibited.'
                }, {
                    header: null,
                    detail: 'Usage of any material which is subject to CoNET’s intellectual property rights is prohibited unless you have been provided with explicit written consent by CoNET. Using our Services does not give you ownership of any intellectual property rights in our Services or the content you access. These terms do not grant you the right to use any branding or logos used in our Services. Don’t remove, obscure, or alter any legal notices displayed in or along with our Services.'
                },{
                    header: 'Disclaimers and Warranties',
                    detail: 'CoNET undertakes to provide the best Service possible in the circumstances and make the Service available at all times except for when maintenance work is being performed for repair and improvement or in case of circumstances beyond the control of the CoNET, including force majeure. The Service provided may also become unavailable due to other factors beyond the CoNET’s control such as third party service failure or malfunction. The accuracy and timeliness of data received is not guaranteed and may vary based on compressions, configuration, network congestion and other factors that may affect it. The Service’s network speed is an estimate and is no indication or guarantee to the speed which You or the Service will send or receive data. We provide our Services using a commercially reasonable level of skill and care and we hope that you will enjoy using them. But there are certain things that we don’t promise about our Services. CoNET does not monitor Your sessions for inappropriate use nor does it keep logs of Your internet activities. However, the CoNET reserves the right to monitor and investigate matters which it considers at its own discretion to be a violation or potential violations of these Terms of Use.'
                },{
                    header: null,
                    detail: 'Other than as expressly set out in these terms or additional terms, neither CoNET nor its suppliers or distributors make any specific promises about the Services. The Service, the Software and any third party services and software are provided by the CoNET on an “as is” basis and CoNET hereby disclaims all warranties of any kind, whether expressed or implied. Some jurisdictions provide for certain warranties, like the implied warranty of merchantability, fitness for a particular purpose and non-infringement. To the extent permitted by law, we exclude all warranties.'
                },{
                    header: null,
                    detail: 'CoNET also reserves the right, but is not obligated to, at its sole discretion and without providing prior notice, to block, delete, filter or restrict by any means, any materials or data it deems potential or actual violations of the restrictions set forth in these Terms of Use and also any other actions that may subject the CoNET or its customers to any liability. CoNET disclaims any and all liability for any failure on our part to prevent such materials or information from being transmitted over the Service and/or into Your computing device.'
                },{
                    header: 'Limitation of Liability',
                    detail: 'CoNET will not be liable for any damages or loss caused by viruses, denial-of-service, attacks or any other technologically harmful material that my infect Your computer, its peripherals, data stored on it or on its peripherals, computer programs or any other proprietary material due to the use of the Services or due to Your downloading of anything which is posted on the CoNET’s website or any website which is linked there to. In no event will CoNET, its suppliers, distributors,  partners, affiliates, subsidiaries, members, officers, or employees be liable for lost profits, revenues, or data, financial losses or indirect, special, consequential, exemplary, or punitive damages, or for any other loss or damages of any kind, even if they have been advised of the possibility thereof. The foregoing shall not apply to the extent prohibited by applicable law. To the extent permitted by law, the total liability of CoNET, and its suppliers and distributors, for any claims under these terms, including for any implied warranties, is limited to the amount You paid CoNET to use the Services.'
                },{
                    header: 'Indemnification',
                    detail: 'You agree to hold harmless and indemnify CoNET, its officers, directors, agents, employees,  members, partners, suppliers, their affiliates, and its or their shareholders, directors, and employees from any and all claims, suit or action arising from or related to the use of CoNET’s Services, Apps, Content, Site, or Software or violation of these terms, including any liability or expense arising from claims, losses, damages, suits, judgments, litigation costs and attorney’s’ fees. We may, at our sole discretion, assume the exclusive defense and control of any matter subject to indemnification by you. The assumption of such defense or control by us, however, shall not excuse any of your indemnity obligations. If you are using our Services on behalf of a business, that business accepts these terms.'
                },{
                    header: 'About these Terms',
                    detail: 'CoNET may update the Terms or any additional terms that apply to a Service, from time to time without notice. You understand and agree that it is your obligation to review these Terms regularly in order to stay informed on current rules and obligations. If you continue to use CoNET’s Services, Apps, Content, Site, or Software after these changes take effect, then you agree to the revised Terms. The current version of the Terms is available on the Site. Notification on any core changes to the Terms will be provided to subscribers through an email message or update to the Site. If you do not agree to the modified terms for a Service, you should discontinue your use of that Service. If there is a conflict between these terms and the additional terms, the additional terms will control for that conflict. These terms control the relationship between CoNET and you. They do not create any third party beneficiary rights.'
                },{
                    header: null,
                    detail: 'If you do not comply with these terms, and we don’t take action right away, this doesn’t mean that we are giving up any rights that we may have (such as taking action in the future). If it turns out that a particular term is not enforceable, this will not affect any other terms. All of our Content was originally written in English. Any translation of our Content is done on a best-effort basis. We cannot guarantee the accuracy of translated Content. In the event of any discrepancy between the translated Content and the English Content, the English Content shall prevail. The laws of British Columbia, Canada, excluding British Columbia’s conflict of laws rules, will apply to any disputes arising out of or relating to these Terms or the Services.'
                }
                
            ],
            disagree: 'I Disagree',
            agreeMent: 'I Agree to the CoNET Terms of Service'
        },

        linuxUpdate:{
            newVersionDownload: 'click here to download and install!',
            step1:'Update new CoNET: ',
            step2: 'Allow executing file as program',
            step2J1:'/images/linuxUpdate1.jpg',
            step2J2:'/images/linuxUpdate2.jpeg',
            step2_detail1: 'Right click downloaded CoNET file and select the properties.',
            step2_detail2: 'Check allow executing file as program in Permissions tab.',
            step3:'Exit old version of CoNET and double click the new CoNET file to run install.',
            exit: 'Exit CoNET',
            tryAgain:'Try again',
            refresh:'Refresh page.'
        },

        imapInformation: {
            title: 'Email account to use by OPN.',
            tempImapAccount: `Have problem with your IMAP enabled email account? <a href="#" onclick="return linkClick ('https://github.com/QTGate/QTGate-Desktop-Client/wiki/iCloud-temporary-account')"> Get temporary account.</a>`,
            infomation: `Please provide an IMAP enabled email account to be used to communication with CoNET network. The account name and password will be required. For your personal privacy, please consider registering a new email account to use. CoNET currently supports <a href="#" onclick="return linkClick('https://www.icloud.com/')">Apple iCloud</a>, <a href="#" onclick="return linkClick('https://outlook.live.com/owa/')">Outlook Mail</a>, <a href="#" onclick="return linkClick('https://login.yahoo.com/')">Yahoo Mail</a>, <a href="#" onclick="return linkClick('https://mail.google.com')">GMAIL</a>, <a href="#" onclick="return linkClick('https://www.gmx.com/')">GMX</a>, <a href="#" onclick="return linkClick('https://www.zoho.com/mail/')">ZOHO</a>. (@OPN currently supports iCloud mail only.) For passwords, it is recommended use a <a href="#" onclick="return linkClick('https://help.yahoo.com/kb/SLN15241.html')">generated app-specific password.</a> If using <a href="#" onclick="return linkClick('https://help.yahoo.com/kb/two-step-verification-sln5013.html')">2-step verification</a>, we recommend using a free anonymous SMS receiving site to receive SMS codes, ( such as <a href="#" onclick="return linkClick('http://receive-sms-online.com/')">receive-sms-online.com</a>, <a href="#" onclick="return linkClick('https://sms-online.co/receive-free-sms')" >sms-online.co</a>, <a href="#" onclick="return linkClick('https://receive-a-sms.com/')" >receive-a-sms.com</a>, or <a href="#" onclick="return linkClick('https://www.google.com/search?q=free+anonymous+SMS+receiving+site&oq=free+anonymous+SMS+receiving+site&aqs=chrome..69i57.268j0j4&sourceid=chrome&ie=UTF-8')" >others</a> ).`,
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
            Error_portNumber: 'Port number should be from 1 to 65535 and not be 22.',
            imapAccountConform: function ( imap, account ) { return `<p class="ui small header brown">By clicking submit you are agreeing to:</p><p class="grey">This [<B class="red">${ imap }</B>] email is a temporary account for use with CoNET services. CoNET may have full access to this account in use of CoNET’s services.</p><p>CoNET platform will send a email include: [<B class="red">${ imap }</B>] & APP password, email [<B class="red">${ account }</B>] address, public key, timezone, used language.</p><p>You may receive emails from CoNET.</p>`},
            agree: `I understand and agree to continue.`,
            imapOtherCheckError: 'Cannot connect to email server! Server name, IP address or Port number may have a mistake. Please check the details of your email setup!',
            CertificateError: 'Certificate for this email server is not trusted. Please select "Keep connected even if certificate is not trusted" in settings if you still want to connect. Your email login information maybe leaked to this email server!',
            IgnoreCertificate: 'Keep connected even when certificate is not trusted',
            Certificat: 'Warning! Do not select this if you are not sure, it may reveal your information.',
            AuthenticationFailed: 'Invalid login username or password! Please check username and password.',
            addAEmail: 'Add a new Email account',
            tryAgain: 'Try again.',
            connectImap: 'Connect to CoNET',
            cancelConnect: 'Stop connecting to CoNET.',
            imapItemTitle: 'Email account details:',
            imapCheckingStep: [
                /* 0 */'Trying to connect to email server.',
                /* 1 */'Connected to email server with IMAP. Waiting response from CoNET.',
                /* 2 */'Connected to email server with SMTP.',
                /* 3 */'Please wait a moment, connecting to CoNET network.',
                /* 4 */'Connected to CoNET',
                /* 5 */'Connected to email server with IMAP'

            ],
            imapResultTitle: 'IMAP Server CoNET Communication Rating: ',
            testSuccess: 'Email server setup success!',
            exitEdit: 'Exit edit email account',
            deleteImap: 'Delete IMAP account.',
            proxyPortError: 'Port number should be a number from 3001 to 65535. Or this port is being used by another process. Please try another port number.',
            appPassword:'About APP password.',
            imapCheckError: [
                /* 0 */'Cannot connect to email server! Your network may offline or do not support IMAP protocol. Please check your network and try again after reflash page.',
                /* 1 */'Invalid login username or password! Please check username and password.',
                /* 2 */'Certificate for this email server is not trusted. You may have Man-in-the-middle attack in your network. Try again when chenged network.',
                /* 3 */'Sent mail error. It may happened when you use normail password. Check your mail APP password.',
                /* 4 */'Your network have not internet.',
                /* 5 */'Unknow error. Please exit CoNET and try it again.',
                /* 6 */'Over Quota error. Please access your mail account, delete some mail.'
            ]
        },

        Home_keyPairInfo_view: {
            
            title: 'Key pair information',
            deleteKeyPairHaveLogin:'Please delete the key pair use the client that is logging on.',
            emailNotVerifi: 'Key pair has not been signed by CoNET yet.',
            emailVerified: 'Key pair signed by CoNET.',
            NickName: 'Nick name：',
            creatDate:'Creation date：',
            keyLength: 'Bit Length：',
            password: '5-character minimum password.',
            password1: 'Platform Password',
            logout: 'Logout',
            keyID: 'ID：',
            deleteKeyPairInfo: 'Note: By deleting your key pair, you will lose your current account settings. You will need to set up CoNET account settings again. If your email address is the same as the one used previously, you may restore your CoNET account balance.',
            delete: 'Delete',
            locked: 'Please enter your key pair password to continue.',
            systemError: 'System error! Please delete this key pair and set up CoNET again.'
        },

		home_index_view: {
            newVersion: 'A new version is ready to install.',
            newVersionInstallLoading:'Updateing...',
            localIpAddress: 'Local',
            internetLable: 'Internet',
            gateWayName:'Gateway',
            showing:'Status',
            nextPage:'next',
            agree: 'I AGREE & CONTINUE',
            emailAddress: 'CoNET Account Name ( Email Address Required )',
            imapEmailAddress: 'Email Account Name',
            creatKeyPair: 'Generate key pair...',
            cancel: 'Cancel',
            clickInstall:'Install',
            keyPairCancel: 'Generate key pair was canceled.',
            keyPairGenerateError: 'It was system error when generate key pair. Try again please.',
            keyPairGenerateSuccess: 'Generate key pair was success.',
            continueCreateKeyPair: 'Keep generate.',
            stopCreateKeyPair: 'Cancel generate key pair',
            KeypairLength: 'Select the bit length of your key pair. Larger bit lengths are stronger and harder for a hacker to crack but may result in slower network transfer speeds.',
            SystemAdministratorNickName: 'Nick name ( Required )',
            systemAdministratorEmail:'Generate RSA Key pair',
            GenerateKeypair: '<em>Generating RSA Key pair. Please wait, as it may take a few minutes. More time will be needed if you selected 4096 bit key length. Information about RSA keypair system can be found here:' +
                `<a href='hhttp://en.wikipedia.org/wiki/RSA_(cryptosystem)' target="_blank" onclick="return linkClick ('https://en.wikipedia.org/wiki/RSA_(cryptosystem)')">https://en.wikipedia.org/wiki/RSA_(cryptosystem)</a></em>`,
            systemPassword: 'CoNET Client System Password',
            inputEmail: `This RSA key is a private key used for authentication, identification and secure encryption/decryption of data transmission within CoNET’s system. The password and key are not stored by CoNET. You cannot reset your password if lost and you cannot access CoNET services without your password. Please store your password in a safe place. <em style="color: brown;">CoNET’s domain may be blocked in some regions. Please use an email account with servers outside these regions,</em>`,
            accountEmailInfo: `Because CoNET may be on a firewall's black list in some regions. It is best to choose an email account with servers outside your region’s firewall.`
        },
        
        error_message: {
            title: 'Error',
            errorNotifyTitle: 'System Error',
            EmailAddress: ['Please enter your email address in this format name@example.com.','Sorry, CoNET currently support Apple iCloud mail, Microsoft Outlook and Yahoo mail only.'],
            required: 'Please fill in this field.',
            PasswordLengthError: 'Passwords must have at least 5 characters.',
            localServerError: 'Local CoNET server error. restart please!',
            finishedKeyPair: 'Generate new key pair down.',
            Success: 'Success',
            doCancel: 'Canceled generating key pair!',
            errorKeyPair:'here was an ERROR in generating new key pair, Please try again!',
            SystemPasswordError: 'Your key pair password does not match. Please try again. If you forgot your password, please delete this key pair. Beware you will lose you current account settings.',
            finishedDeleteKeyPair: 'Key pair deleted!',
            offlineError: 'There is no internet connection detected. Please check your network and try again!',
            imapErrorMessage: [
        /* 0 */ 'There was an error in establishing connection to CoNET. Please try to connect again or try at a later time. If you continue to receive this error, please contact CoNET support. ',
        /* 1 */ 'Data format error!', 
        /* 2 */ 'This computer does not detect an internet connection. Please check your network and try again!', 
        /* 3 */ `Email server did respond to username or an error in password. You may need use APP password to pass this test if you did normal password. Or your app passwords need to be updated.`, 
        /* 4 */ `Error in connecting to email server with the current IMAP port. Please check the email account to make sure IMAP is enabled and the IMAP port settings. The port may be filtered by a firewall on your network.`, 
        /* 5 */ `There is a problem with this IMAP email server's security certificate!`, 
        /* 6 */ `Error in email server’s address. Please check the email server’s domain. Or have not internet, please check your network.`, 
        /* 7 */ 'This email provider currently looks does not support CoNET’s @OPN technology, please try do test again, or change to another email provider.', 
        /* 8 */ `Email server did respond to SMTP's username or an error in password.`, 
        /* 9 */ `There is a problem with this SMTP email server’s security certificate!`, 
        /* 10 */`Connecting to SMTP Email server received an unknown error!`, 
        /* 11 */'Please check email account!',
        /* 12 */'Does not establishing connection to CoNET yet.',
        /* 13 */'Your mail account has exceeded (over quota). ',
        /* 14 */'Twitter return unknow error, please try again.'
            ],
            CoNET_requestError: [
                /* 0 */'Did not received response from CoNET. Try reconnect to CoNET, please wait.',
                /* 1 */'Invalid request!'
            ]
        },

        emailConform: {
            activeViewTitle: 'Active your keypair.',
            emailTitle: 'Welcome to CoNET.',
            info1_1: `Please complete key pair verification. Click the button 'Request verification email' to request mail. Please check your [`,
            info1_2: '] mailbox. If you received more then one email from CoNET, please choose the newest email. If you not find the email, please double check your key pair email address. If you have an error, you may delete your key pair and generate a new key pair.',
            info2: 'Copy all content from [-----BEGIN PGP MESSAGE-----] ... to [-----END PGP MESSAGE-----]. Paste into this text box.',
            emailDetail1: 'Dear ',
            emailDetail1_1: ' ,',
            emailDetail2: 'This is your secret verification code to validate your CoNET account. Please copy and paste all the content in the text area.',
            bottom1_1: 'Best regards,',
            bottom1_2: 'The CoNET team',
            requestReturn: ['ERROR! CoNET system refuse your request, may be you did request repeatedly, please try again late.','Verification mail has been sent.'],
            conformButtom: 'Confirm',
            reSendRequest:'Request verification email',
            formatError: [
                        'Format error! Copy all content from [-----BEGIN PGP MESSAGE-----] ... to [-----END PGP MESSAGE-----]. Paste into this text box.',
                        'Oops. Find the lasest mail from CoNET in your key pair email mailbox. Or delete this key pair and rebuild new key pair please.',
                        'Connection to CoNET had an error!. Please exit and restart CoNET.',
                        'This secret verification code was invalid. If you received more then one email from CoNET, please choose the newest email. Do validate again!',
                        'Your CoNET account may have a problem, Please delete your key pair and setup again!',
            /**5**/     'Sorry there is an error in connection to CoNET, may be CoNET is offline. Please try again late.',
                        `Your data transfer has hit the daily limit today, please try again tomorrow or upgrade your user type.`,
                        'Your transfer email account may not be working, please check the IMAP account. Or your IMAP accout may not support CoNET system.',
                        'Selected region is unavailable, try again later.',
                        'Your IMAP account recieved an error. Please restart CoNET and try again. If the error is not fixed, You may need check your IMAP account setting to enable third party IMAP applications.',
                        'The page session has expired! Refresh page or restart CoNET plesee.',
                        'Sorry looks CoNET platform failure, please restart CoNET.'
                    ],

            activeing: 'sending...'
        },

        QTGateRegion: {
            title: 'Advanced private custom gateway service area.',
            available: 'Available',
            CoGateRegionStoped:'Custom gateway server was stopped.',
            speedTest: 'Speed test：',
            unavailable: 'Unavailable',
            proxyDomain:'Domain lookup via CoNET gateway side.',
            setupCardTitle: 'connecting with:',
            paidUse:'This area offer for subscription user.',
            MultipleGateway: 'Multi-Gateway:',
            dataViaGateway:'All internet data transfered via CoNET gateway.',
            dataTransfer: 'Data:',
            dataTransfer_datail: ['All data on CoNET gateway.',`Only when cannot connect to target server.`],
            proxyDataCache: 'Web cache:',
            proxyDataCache_detail: ['Yes','No'],
            clearCache: 'Delete all cache now',
            localPort:'Local proxy port number:',
            localPath:'HTTP/HTTPS conect path name:',
            requestPortNumber: 'Gateway server port number:',
            GlobalIp: 'Global IP:',
            option: 'option',
            WebRTCleak:'Stop WebRTC leak',
            WebRTCleakInfo: 'End-to-End game and chat may not work.',
            pingError:'CoNET gateway area speed check error! Please exit CoNET and reopen CoNET as administrator. Then do check speed again.',
            QTGateRegionERROR:[
                'Send connect request mail has an error. Please check your IMAP account settings.',
            ''],
            GlobalIpInfo:  `Please note: Both iOPN and @OPN will conceal your IP from others. iOPN offers the highest level of data speeds. @OPN offers additional layer of anonymity with some speed as a trade off. [@OPN] option is available in San Francisco, and currently only supports your owniClould Email. Please refer to the Terms of Service for our privacy policy.`,
            cacheDatePlaceholder: 'Web cache freshness lifetime.',
            sendConnectRequestMail:[
                'CoNET connection maybe down. Please wait a moment, re-connecting to CoNET gateway.',
                'Your connection will reset if you long time non use.'
            ],
            cacheDatePlaceDate:[{ name:'1 hour', id: 1 }, { name:'12 hour', id: 12 },{ name:'1 day', id: 24 }, { name:'15 days', id: 360 }, { name:'1 month', id: 720 }, { name:'6 months', id: 4320 }, { name:'forever', id: -1 }],
            atQTGateDetail: [
        /*0*/   `Recommended for full privacy. @OPN@ uses CoNET’s “Quiet” technology to create a obfuscated private network by refracting encrypted data packets thru email servers. @OPN provides stealth internet communications where your IP address is hidden to client or proxy servers. Gaming and video stream my not be supported due to stability and speeds affected by email server choice. Currently iCloud mail is only supported.`, 
        /*1*/   'Recommended for high speed open internet access. iOPN uses CoNET’s “Quiet” technology to obfuscate encrypted data traffic to look like normal HTTP communications. iOPN offer security and protection of privacy while allowing access to the open internet.',
        /*2*/   'Use CoNET’s gateway for domain search to get the right IP address from DNS cache. This is default.', 
        /*3*/   'Transfer all internet data over OPN.', 
        /*4*/   'Transfer select data over OPN. Only when unable to connect to certain servers. Network access may speed up but lost your privacy.',
        /*5*/   'Web cache (or HTTP cache) is an used for the temporary storage (caching) of web documents, to reduce bandwidth usage, server load, and perceived lag. CoNET always encrypts all web cache data. This does not work for HTTPS connections.',
        /*6*/   'Do not use web cache.', 
        /*7*/   'By setting the cache expiration date, you can always obtain the latest information on the server side.',
        /*8*/   'Local proxy server port number is provided for other devices to use CoNET’s OPN connection. Please set a number from 3001 to 65535.',
        /*9*/   'Local proxy server http/https access can secure your server.',
        /*10*/   'The number of gateways to use. This will further help to obfuscate traffic by using multiple servers. This is available for subscription only.',
        /*11*/   'This is your current CoNET gateway port number, You may change the port number if current one is blocked on your network.',
        /*12*/   'Web Real-Time Communication (WebRTC) is a collection of standardized technologies that allows web browsers high speed to communicate with each other directly via IP address. It also may used for detect your real IP address even you hide IP address via VPN or other tools.',
            ],
            connectQTGate: 'Connecting, Retrieving CoNET gateway information...'
        },

        QTGateGateway: {
            title: 'CoNET service user detail',
            processing: 'Trying to connect to CoNET network...',
            error: [
            /* 0 */ 'Error: Your account has a connection that is using the CoNET proxy server. Please disconnect it before attempting to connect again.',
            /* 1 */ 'Error: Bandwidth maximum. If you would like to continue using OPN, please upgrade your account. Free accounts have a bandwidth maximum of 100MB per a day, 1 GB every month.',
            /* 2 */ 'Error: Data format error. Please restart CoNET.','Error: This area does not have the resources. Please select another area or try connecting again later.',
            /* 3 */ 'Error: This region does not support OPN technology. Please select another area, or change other connect type.',
            /* 4 */ '@OPN support your own iCloud account only. Please change the email account that used to communication with CoNET.'
                ],
            connected:'connected.',
            promo: 'Promotions',
            upgrade:'Upgrade account',
            accountManager:'Account',
            userType:['Free user', 'Subscription'],
            datatransferToday:'The daily bandith limit.：',
            datatransferMonth:'The monthly bandwidth limit.：',
            todaysDatatransfer: 'Available bandwidth today.',
            monthDatatransfer: 'Available bandwidth this month.',
            gatewayInfo: ['Gateway Ip address：','Gateway connection port：'],
            userInfoButton: 'How to use?',
            stopGatewayButton:'Stop gateway server',
            disconnecting: 'Destroying...'
        },
        
        qtGateView: {
            QTGateConnectResultWaiting: 'Please wait. It will may take a few minutes to establish your connection to CoNET.',
            title: 'Send custom server request',
            mainImapAccount: 'Email account for communicating with CoNET',
            QTGateDisconnectInfo: 'CoNET disconnected. Please select an IMAP account to use for connection request. ',
            QTGateConnectStatus: 'Status of CoNET connection',
            QTGateConnectResult: [
                'CoNET disconnected, click to connect to CoNET.','Connecting to CoNET.','CoNET Connected.','Connection stopped with error! Please check IMAP account settings!',
                'CoNET Connected.'
            ],
            QTGateSign: [
                'Keypair status','Your key pair is not signed by CoNET.',
                'CoNET certification authority is a trusted thus certifying your public keys is yoursalf in CoNET users when you share files of send message to other CoNET user. You also can signing another CoNET users with your keypair for make your trust relationship.',
                'Getting CoNET certification authority.','Opps. System error. Try restart CoNET, if still have please re-install CoNET.','System error!']
        },
        
        feedBack: {
            title: 'FEEDBACK',
            additional: 'Additional info',
            okTitle:'Send to CoNET'
        },

	},{
        perment:{
            serverTitle:'伺服器'
        },
        twitter: {
            newTwitterAccount: `請輸入您的推特APP信息，如何獲得和設置推特賬號APP信息，請點擊<a target="_blank" href='https://github.com/QTGate/QTGate-Desktop-Client/wiki/Create-Twitter-APP'">這裡</a>獲得更多信息`,
            addAccount:'添加推特賬戶',
            following: ['正在關注','解除關注','關注'],
            followers:'關注者',
            second: '秒',
            min: '分',
            hour: '小時',
            retweeted: '已轉推',
            month:'月',
            day: '日',
            close:'關閉',
            replying: '回覆: ',
            videoSizeOver: '視頻超推特限制: 尺寸 <(1280x1024)，文件 <  300MB，時間 < 140秒，請轉換視頻後再上傳',
            twitterBottonTitle:['發推','全部發推'],
            newTwitterTitle: ['撰写新推文','撰写新对话串'],
            returnEdit: '回編輯',
            newTwitterDistroyButtonTitle: ['放棄推文','捨棄對話串'],
            urlInfo: '<h3>推特客户端預覽版</h3><p>用戶可以无限量免费使用此客戶端，免翻牆(不使用VPN，不用連結CoGate代理服務器)匿名訪問(您的真實IP地址不會洩露給推特)您的推特帳戶。</p><p>其他设备可以输入以下网址打开此APP应用</p>',
            accountError:'推特回送錯誤信息提示：您輸入的APP應用設定信息有誤。請檢查您的推特APP信息後再試。'
            
        },
        thirdParty: {
            information: 'CoNET平台',
            comesoon:'即將登場',
            app:['CoGate','CoChat','Co云存储','Co邮箱','Co新闻频道','CoNet業務訂製','Co谷歌','Co推特','Co for','Co加密貨幣錢包'],
            qtgateGateway: 'CoNET提供的高質量上網技術iOPN和@OPN，在CoNET全球16個區域，當場定制您專屬的代理服務器，變換您的IP地址隱身無障礙的訪問互聯網',
            
            dimmer: [
                '高質量量身定制代理伺服器業務，讓您隱身安全不受注意的網上沖浪。',
                '隱身匿名去中心化不被封鎖的社交媒體',
                '安全隱私文件雲存儲系統',
                '隱身匿名邮件客户端，可免翻牆访问Gmail',
                '免翻墙隱身匿名訪問世界頭條新闻',
                'QTG承接定制各類公眾服務類及跨國企業私有APP業務',
                '免翻牆匿名隱身谷歌檢索客戶端',
                '免翻牆匿名隱身推特客戶端',
                '免翻牆匿名隱身Youtube客戶端',
                '免翻牆匿名隱身加密貨幣錢包和交易所'
                
            ]
        }, 
        account:{
            willPayNextExpir:'自動扣款 ',
            openAutomatically: '打開自動扣款',
            QTGatePayRisk:'使用CoNET安全網關支付，如果您有安全疑慮，請使用Stript安全網關支付。',
            paymentSuccessTitile: '謝謝您',
            networkShareTitle:'代理伺服器網絡',
            stripePayment: '銀行網關支付',
            promoButton: '我有促銷碼',
            qtgatePayment:'CoNET網關支付',
            paymentProblem1:'支付遇到問題',
            paymentProblem:'您目前的所在區域看上去銀行網關被和諧，您可以使用CoNET網關支付來完成支付',
            title: '賬戶管理',
            currentPlanExpire: ['訂閱截止日期：','下一次自動續訂日','每月數據重置日'],
            CancelSuccess: function ( PlanExpire: string, isAnnual: boolean, returnAmount: number ) {
                return `中止訂閱成功。您可以一直使用您的原訂閱到${ new Date (PlanExpire).toLocaleDateString() }為止。以後您將會自動成為CoNET免費用戶，可以繼續使用CoNET的各項免費功能。 ${ isAnnual ? `退款金額us$${ returnAmount }會在5個工作日內退還到您的支付卡。 `: '下月起CoNET系統不再自動扣款。 '} 祝您網絡衝浪愉快。`
            },
            currentAnnualPlan: ['月度訂閱','年度訂閱'],
            cardPaymentErrorMessage:[
        /* 0 */ '輸入的信用卡號有誤！',
        /* 1 */ '輸入的信用卡期限有誤！',
        /* 2 */ '輸入的信用卡安全碼有誤！',
        /* 3 */ '輸入的信用卡持有人郵編有誤！',
        /* 4 */ '支付失敗，支付無法完成請稍後再試',
        /* 5 */ '支付數據存在錯誤',
        /* 6 */ '您的付款被銀行所拒絕',
        /* 7 */ '發生錯誤，請稍後再試',
            ],
            cantUpgradeMonthly: '年度計劃不可降級為月度計劃。請先終止您當前訂閱的年度計劃，再重新申請此月度訂閱',
            segmentTitle:'賬戶Email: ',
            currentPlan:'當前訂閱: ',
            oldPlanBalance: '原計劃剩餘價值：',
            needPay: '應付金額：',
            monthResetDay:'月重置日：',
            cancelPlanButton:'中止當前訂閱',
            monthResetDayAfter:'',
            bandwidthBalance:'月度數據剩余量：',
            planPrice: '訂閱價格：',
            MonthBandwidthTitle:'月度代理伺服器限額：',
            dayBandwidthTitle:'每日限額：',
            upgradeTitle:'升級',
            planExpirDate: function ( year: string, month: string, day: string ) { return `${ year } 年${ month }月${ day }日`},
            accountOptionButton: '賬戶選項',
            paymentSuccess:'您的訂閱已經完成,祝您網絡衝浪愉快。',
            qtgateTeam: 'CoNET開發團隊敬上',
            paymentProcessing:'正在通訊中...',
            DowngradeTitle:'降級賬戶選項',
            multiOpn:'OPN併發多代理技術',
            cancelPlan:'終止當前訂閱',
            cantCancelInformation: '您的賬戶可能是CoNET測試用戶，或使用優惠碼產生的訂閱用戶，此類賬戶可以升級但不能被中止',
            MonthBandwidthTitle1:'傳送限額',
            monthlyAutoPay: function (monthCost: number ) { return `<span>每月自動扣款</span><span class="usDollar">@ us$</span><span class="amount" >${ monthCost }</span>/月<span>`},
            annualPay: function ( annual_monthlyCost: string ) { return `<span>年付款每月只需</span><span class="usDollar">@ us$</span><span class="amount" >${  annual_monthlyCost }</span>/月<span>`},
            expirationYear: '信用卡期限',
            serverShare:'代理伺服器',
            cardNumber: '信用卡號',
            cvcNumber: '信用卡安全碼',
            calcelPayment:'中止付款',
            doPayment:'確認付款',
            postcodeTitle: '信用卡擁有者郵編',
            aboutCancel: '關於中止訂閱',
            payAmountTitile:'支付合計',
            canadaCard:'*加拿大持卡人將自動加算GST(BC)5%',
            multiRegion:['單一代理區域並發代理','多代理區域混合併發代理','多代理區域混合併發代理','多代理區域混合併發代理'],
            maxmultigateway: ['最大同時可二條並發代理數','最大同時可使用四條並發代理數*','最大同時可使用四條並發代理數'],
            continue:'下一步',
            serverShareData:['共享伺服器','獨佔一台伺服器*','獨佔二台伺服器*','獨佔四台伺服器'],
            monthlyPay:'月租費',
            internetShareData:['共享高速帶寬','獨享高速帶寬*','獨享雙線高速帶寬*','獨享四線高速帶寬'],
            serverShareData1:'OPN併發多代理技術，同時使用數大於獨占數時，會相應分享您所獨占的資源',
            cancelPlanMessage:'可隨時終止您的訂閱，CoNET的訂閱是以月為基本的單位。您的月訂閱將在下月您的訂閱起始日前被終止，您可以繼續使用您的本月訂閱計劃，您將自動回到免費用戶。如果您是每月自動扣款，則下月將不再扣款。如果您是年度訂閱計劃，您的退款將按普通每月訂閱費，扣除您已經使用的月份後計算的差額，將自動返還您所支付的信用卡賬號，如果您是使用促銷碼，或您是測試用戶，您的終止訂閱將不能被接受。 ',
            cancelPlanMessage1: function ( isAnnual: boolean, amount: number, monthlyPay: number, expire: string, passedMonth: number, totalMonth: number ) {
                return `<span>您的訂閱計劃是${ isAnnual ? `年度訂閱，退還金額將按照您已付年訂閱費</span><span class="usDollar">us$</span><span class="amount">${ amount /100  }</span><span> - 該訂閱原價 </span><span class="usDollar">us$</span><span class="amount">${ monthlyPay /100 }</span><span> X 已使用月數(包括本月) </span><span class="amount">${ passedMonth }</span><span> = 餘額 </span><span class="usDollar">us$</span><span class="amount">${ amount - passedMonth * monthlyPay > 0 ? ( amount - passedMonth * monthlyPay ) / 100 : 0 }</span><span>，將在7個工作日內，退還到您用來支付的信用卡帳戶。</span>`: `月訂閱，您的訂閱將下次更新日</span><span class="amount">${ nextExpirDate (expire).toLocaleDateString() }</span><span>時不再被自動扣款和更新。</span>`}`
            }
        
        },

        QTGateDonate: {
            title: 'CoNET贊助商提供的免流量網站',
            meta_title:'捐贈者：',
            detail:'所有CoNET用戶，使用CoNET代理伺服器，訪問贊助商贊助的網站時產生的流量，都不被計入。免費用戶需注意的是，如本日或本月流量已用完，無法接入CoNET代理伺服器，則無法利用此功能。'

        },

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
                title:'選擇自動設置',
                titleImage:'',
                detail:'<p>在URL網址處，HTTP和HTTPS代理按照藍色第一行填入，SOCKS代理按藍色第二行填入</p>',
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
                title:'選擇自動設置代理伺服器，選勾DNS使用SOCKS v5',
                titleImage:'',
                detail:'HTTP和HTTPS代理按照藍色第一行填入，SOCKS代理按藍色第二行填入',
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
                title:'選擇自動設置代理伺服器。',
                titleImage:'',
                detail:'<p>WINDOWS10系統只對應HTTP和HTTPS，如果想使用全局代理的用戶，需另外安裝瀏覽器如火狐等，然後在火狐瀏覽器內單獨設定Proxy全局代理SOCKS</p>',
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
                title:'打開顯示高級選項，在代理伺服器設定(Proxy)中選擇自動設置',
                titleImage:'',
                detail:'HTTP和HTTPS代理按照藍色第一行填入，SOCKS代理按藍色第二行填入',
                image: '/images/android3.jpg'
            }]
        },

        useInfoMacOS: {
            title:'本地代理伺服器已在後台運行。您的其他電子設備，可通過設置本地代理，來使用CoNET連接到互聯網',
            wrtTestAreaTitle: 'WebRTC漏洞数据泄漏区域',
            customProxy: '訂製伺服器完成',
            title1:'MacOS 本地代理伺服器設定',
            localIpAddress:'如果能看到這個IP地址，由於是本地局域網地址洩漏，無關緊要。',
            proxySetupHelp:'如需幫助，請點擊下列您的OS系統所屬圖案',
            globalIpAddress:'如果顯示這個IP，您的瀏覽器洩漏了您真實的IP地址',
            webRTCinfo:'阻止WebRTC漏洞，請使用SOCKS代理設定，檢查是否漏洞還在，請點擊<a href="/Wrt" target="_blank">這裡</a>',
            wrtTest: '以下為測試結果：',
            proxyServerIp:'<p>代理設定選擇：<span style="color: brown;">自動設定</p>',
            proxyServerPort: 'HTTP和HTTPS代理的設定為：',
            proxyServerPassword: 'SOCKS代理的設定為：',
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
                title:'點擊代理伺服器設定，選勾自動代理，選購排除簡單Host名',
                titleImage:'',
                detail:'<p>HTTP和HTTPS代理按照藍色第一行填入，SOCKS代理按藍色第二行填入</p>',
                image: '/images/macosUserInfo3.jpg'
            }]
        },

        QTGateInfo: {
            title:'功能簡介',
            version:'本機安裝版本：v',
            detail:[{
                color: '#a333c8',
                icon: 'exchange',
                header: '隱身匿名自由上網CoNET',
                detail: 'CoNET通過使用<a href="https://zh.wikipedia.org/wiki/%E9%AB%98%E7%BA%A7%E5%8A%A0%E5%AF%86%E6%A0%87%E5%87%86" target="_blank">AES256-GCM</a>和<a href="https://zh.wikipedia.org/wiki/PGP" target="_blank">OpenPGP</a >加密Email通訊，創造了OPN匿名網絡通訊技術，CoNET公司首創的@OPN技術，它全程使用加密Email通訊，客戶端和代理伺服器彼此之間不用交換IP地址，實現高速網絡通訊。iOPN通訊技術是一種HTTP協議下的加密混淆代理技術，能夠隱藏變換您的IP地址高速通訊。二種通訊方式都能夠讓您，隱身和安全及不被檢出的上網，保護您的隱私，具有超強對抗網絡監控,網絡限制和網絡阻斷。'
            },{
                color: '#e03997',
                icon: 'talk outline',
                header:'無IP點對點即時加密通訊服務QTChat',
                detail:'CoNET用戶之間通過email的點對點即時通訊服務，它具有傳統即時通訊服務所不具有的，匿名無IP和用戶之保持秘密通訊的功能。 QTChat加密通訊服務可以傳送文字，圖片和視頻文件信息，CoNET系統只負責傳送信息，不擁有信息，也無法檢查信息本身，所以CoNET不承擔信息所有的法律責任。 QTChat支持群即時通訊，將支持視頻流直播服務。'
            },{
                color: '#6435c9',
                icon: 'cloud upload',
                header:'加密文件匿名網絡雲存儲分享功能QTStorage',
                detail:'用戶通過申請多個和不同的免費email服務商賬號，可以把一個文件加密拆分成多個部分，分別存儲在不同的email賬號下，可以保密安全和無限量的使用網絡儲存。用戶還可以通過CoNET系統在CoNET用戶之間分享秘密文件。'
            },
            {
                color: 'darkcyan',
                icon: 'spy',
                header: '阻斷間諜軟件',
                detail: 'CoNET系統連接全球DNSBL聯盟數據庫，用戶通過訂閱CoNET系統黑名單列表，並使用CoNET客戶端上網，讓潛伏在您電子設備內的間諜軟件，它每時每刻收集的信息，不能夠被送信到其信息收集伺服器，能夠最大限的保障您的個人隱私。'
            },{
                color: '#6435c9',
                icon: 'external share',
                header:'本地VPN伺服器',
                detail:'CoNET用戶在戶外時可以通過連接自己家裡的VPN，來使用CoNET客戶端隱身安全上網。'
            }]
        },

        cover: {
            firstTitle1: 'CoNET平台',
            firstTitle2: '安全隱私自由的互聯網',
            start: '開門',
            proxyStoped: 'CoGate定制代理伺服器已經停止，如需使用請重新定制代理伺服器。'
        },

        topWindow: {
            title: '慶祝加拿大150週年特別提供'
        },

        firstNote:{
            title: '歡迎使用CoNET，感謝您使用我們的產品和服務(下稱“服務”)。本服務由總部設在加拿大的CoNET Technology Inc.下稱“CoNET”提供。 ',
            firstPart: '您使用我們的服務即表示您已同意本條款。請仔細閱讀。使用我們的服務，您必須遵守服務中提供的所有政策。',
            detail:[
                {
                    header: '關於我們的服務',
                    detail: '請勿濫用我們的服務，舉例而言: 請勿干擾我們的服務或嘗試使用除我們提供的界面和指示以外的方法訪問這些服務。您僅能在法律(包括適用的出口和再出口管制法律和法規)允許的範圍內使用我們的服務。如果您不同意或遵守我們的條款或政策，請不要使用我們所提供的服務，或者我們在調查可疑的不當行為，我們可以暫停或終止向您提供服務。'
                },{
                    header: null,
                    detail: '使用我們的服務並不讓您擁有我們的服務或您所訪問的內容的任何知識產權。除非您獲得相關內容所有者的許可或通過其他方式獲得法律的許可，否則您不得使用服務中的任何內容。本條款並未授予您使用我們服務中所用的任何商標或標誌的權利。請勿刪除、隱藏或更改我們服務上顯示的或隨服務一同顯示的任何法律聲明。'
                },{
                    header: '關於OPN無IP通訊技術和隱私保護的局限性',
                    detail: 'OPN是CoNET世界首創的使用Email的IMAP協議建造一個無IP通訊環境，在您利用CoNET進行通訊過程中，CoNET無法獲得您目前所使用的IP地址（使用iOPN來連結CoNET代理服務器時，您需要向CoNET系統提供您當前的IP地址），可以最大限度的保障您的個人隱私。但是這項技術並不能夠保證您的信息絕對的不被洩露，因為您的IP地址有可能被記錄在您所使用的Email服務供應商，如果持有加拿大法院令尋求CoNET的Log公開，再和Email服務供應商的Log合併分析，可能會最終得到您的信息。CoNET並不能夠絕對保障您的隱私。'
                },{
                    header: '關於個人隱私保護，系統日誌和接收CoNET傳送的信息',
                    detail: '在您使用服務的過程中，我們可能會向您發送服務公告、管理消息和其他信息。您可以選擇不接收上述某些信息。'
                },{
                    header: null,
                    detail: '當您使用我們的服務時，我們為了計費處理會自動收集非常有限的數據流量信息，並存儲到伺服器日誌中。數據流量信息僅用於計算客戶應支付通訊費用而收集的，它收集的數據是：日期，用戶帳號，所使用的代理服務區域和代理伺服器IP，數據包大小，下載或上傳。例如：'
                },{
                    header: null,
                    detail: '<p class="tag info">06/20/2017 18:12:16, info@CoNET.com, francisco, 104.236.162.139, 300322 byte up, 482776323 byte down.</p><p class="tag info">06/21/2017 12:04:18, info@CoNET.com, francisco, 104.236.162.139, 1435226 byte up, 11782238 byte down.</p>'
                },{
                    header: null,
                    detail: 'CoNET沒有保存除了以上信息以外的任何其他信息。我們會配合並向持有加拿大法院令的執法機構提供此日誌文件。如果您是加拿大以外地區的執法機構，有這方面信息披露的需求，請通過加拿大外交部來聯繫我們：'
                },{
                    header: null,
                    detail: '<a class="tag alert" href="http://www.international.gc.ca/">http://www.international.gc.ca/</a>'
                },{
                    header: '版權所有權',
                    detail: '該軟件是CoNET的智慧產權，並且受到相關版權法，國際版權保護規定和其他在版權授與國家內的相關法律的保護。該軟件包含智慧產權材料, 商業秘密及其他產權相關材料。你不能也不應該嘗試修改，反向工程操作，反彙編或反編譯CoNET服務，也不能由CoNET服務項目創造或衍生其他作品。'
                },{
                    header: null,
                    detail: '關於我們服務中的軟件，CoNET授予您免許可使用費、不可轉讓的、非獨占的全球性個人許可, 允許您使用由CoNET提供的、包含在服務中的軟件。本許可僅旨在讓您通過本條款允許的方式使用由CoNET提供的服務並從中受益。您不得複制、修改、發布、出售或出租我們的服務, 或所含軟件的任何部分。'
                },{
                    header: '修改與終止服務',
                    detail: '我們持續改變和改善所提供的服務。我們可能會新增或移除功能或特性，也可能會暫停或徹底停止某項服務。您隨時都可以停止使用服務，儘管我們並不希望您會這樣做。 CoNET也可能隨時停止向您提供服務，或對服務附加或設定新的限制。'
                },{
                    header: '服務的責任',
                    detail: '在法律允許的範圍內，CoNET及其供應商和分銷商不承擔利潤損失、收入損失或數據、財務損失或間接、特殊、後果性、懲戒性或懲罰性損害賠償責任。'
                }, {
                    header: '法律規定的貿易禁止事項',
                    detail: '當您按下同意按鈕，表示您已經確認您不屬於加拿大法律所規定的禁止貿易對象的列表之中。'
                }, {
                    header: '服務的商業使用',
                    detail: '如果您代表某家企業使用我們的服務，該企業必須接受本條款。對於因使用本服務或違反本條款而導致的或與之相關的任何索賠、起訴或訴訟，包括因索賠、損失、損害賠償、起訴、判決、訴訟費和律師費而產生的任何責任或費用，該企業應對CoNET及其關聯機構、管理人員、代理機構和員工進行賠償並使之免受損害。'
                }, {
                    header: '本條款的變更和約束力',
                    detail: '关于本条款：我们可以修改上述条款或任何适用于某项服务的附加条款，例如，为反映法律的变更或我们服务的变化而进行的修改。您应当定期查阅本条款。我们会在本网页上公布这些条款的修改通知。我们会在适用的服务中公布附加条款的修改通知。所有修改的适用不具有追溯力，且会在公布十四天或更长时间后方始生效。但是，对服务新功能的特别修改或由于法律原因所作的修改将立即生效。如果您不同意服务的修改条款，应停止使用服务。如果本条款与附加条款有冲突，以附加条款为准。'
                },{
                    header: '',
                    detail: '本条款约束CoNET与您之间的关系，且不创设任何第三方受益权。如果您不遵守本条款，且我们未立即采取行动，并不意味我们放弃我们可能享有的任何权利（例如，在将来采取行动）。如果某一条款不能被强制执行，这不会影响其他条款的效力。加拿大BC省的法律（不包括BC州的法律冲突规则）将适用于因本条款或服务引起的或与之相关的纠纷。因本条款或服务引起的或与之相关的所有索赔，只能向加拿大BC省法院提起诉讼，且您和CoNET同意上述法院拥有属人管辖权。'
                }


            ],
            disagree: '不同意',
            agreeMent: 'CoNET服務條款和隱私權'
        },

        linuxUpdate: {
            newVersionDownload: '點擊這裡下載並安裝',
            step1:'請更新版本: ',
            step2: '授權新版本CoNET為可執行文件',
            step2J1:'/images/linuxUpdate1_tw.jpg',
            step2J2:'/images/linuxUpdate2_tw.jpeg',
            step2_detail1: '右鍵點擊已下載的CoNET圖標，選擇菜單裡的文件屬性',
            step2_detail2: '在權限選項裡，選勾“允許檔案文件執行”。',
            step3:'退出舊版本CoNET後，雙擊CoNET文件執行安裝',
            exit: '退出CoNET',
            tryAgain:'再次嘗試',
            refresh:'刷新頁面'
        },

        imapInformation: {
            title: '通訊專用Email郵箱設置',
            tempImapAccount: `臨時郵箱申請有困難？您可以暫時使用<a href="#" onclick="return linkClick ('https://github.com/QTGate/QTGate-Desktop-Client/wiki/iCloud%E8%87%A8%E6%99%82%E5%B8%B3%E6%88%B6')">CoNET網絡提供的臨時IMAP帳號供各位測試</a>`,
            infomation: `請設置CoNET網絡通訊專用Email郵箱信息。由於此賬戶的用戶名和密碼信息會提交給CoNET網絡，為了防止您的個人信息被洩漏，請新申請一個臨時Email賬戶。目前CoNET網絡技術對應<a href="#" onclick="return linkClick ('https://www.icloud.com/')">Apple iCloud</a>，<a href="#" onclick="return linkClick ('https://www.microsoft.com/zh-tw/outlook-com/mobile/?WT.mc_id=mscom')">微軟OUTLOOK</a>，<a href="#" onclick="return linkClick ('http://tw.mail.yahoo.com/')">雅虎郵箱</a>，<a href="#" onclick="return linkClick ('https://www.zoho.com/mail/')">俄羅斯ZOHO郵箱</a>，<a href="#" onclick="return linkClick ('https://gmail.com')">Google郵箱</a>，<a href="#" onclick="return linkClick ('https://www.gmx.com/mail/#.1559516-header-nav1-2')">美國在線GMX郵箱</a>，CoNET強力推薦使用蘋果公司的Email可以達到最佳速度(@OPN無IP連結技術只對應蘋果公司iCloud郵箱)。密碼請使用Email服務商的<a href="#" onclick="return linkClick ('https://tw.help.yahoo.com/kb/SLN15241.html')">應用密碼</a>。對於Email供應商在應用密碼申請時，須打開<a href="#" onclick="return linkClick ('https://tw.help.yahoo.com/kb/%E9%96%8B%E5%95%9F%E5%85%A9%E6%AD%A5%E9%A9%9F%E9%A9%97%E8%AD%89-sln5013.html')">二步認證</a>並必須提供手機號碼接受驗證碼，為保護您的隱私，建議使用免費在線代理接收驗證碼服務。如 ( <a href="#" onclick="return linkClick('http://receive-sms-online.com/')">receive-sms-online.com</a>, <a href="#" onclick="return linkClick('https://sms-online.co/receive-free-sms')" >sms-online.co</a>, <a href="#" onclick="return linkClick('https://receive-a-sms.com/')" >receive-a-sms.com</a> ) 更多請 <a href="#" onclick="return linkClick ('http://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=0&rsv_idx=1&tn=baidu&wd=%E5%85%8D%E8%B4%B9%E5%9C%A8%E7%BA%BF%E6%8E%A5%E6%94%B6%E6%89%8B%E6%9C%BA%E9%AA%8C%E8%AF%81%E7%A0%81&rsv_pq=e94f47a50001f66f&rsv_t=b03ePiy3rHH0T4FVoWB8Hx9vrVdZLzVhhErWOo4xdBpjDw%2BtGri%2BViTaVAw&rqlang=cn&rsv_enter=1&rsv_sug3=42&rsv_sug1=5&rsv_sug7=100')">百度查找</a>，<a href="#" onclick="return linkClick ('https://www.google.com/search?q=%E5%85%8D%E8%B4%B9%E5%9C%A8%E7%BA%BF%E6%8E%A5%E6%94%B6%E6%89%8B%E6%9C%BA%E9%AA%8C%E8%AF%81%E7%A0%81&oq=%E5%85%8D%E8%B4%B9%E5%9C%A8%E7%BA%BF%E6%8E%A5%E6%94%B6%E6%89%8B%E6%9C%BA%E9%AA%8C%E8%AF%81%E7%A0%81&aqs=chrome..69i57j69i60.254j0j4&sourceid=chrome&ie=UTF-8')">Google查找</a>。`,
            serverDetail: '詳細設定：',
            imapServer: 'IMAP伺服器設定',
            UserName: '登陸用戶名稱',
            Ssl: '使用Ssl加密信息傳輸：',
            imapServerInput: 'IMAP伺服器IP或域名',
            portName: '通訊連接埠：',
            otherPortNumber: '其他號碼：',
            smtpServer: 'SMTP伺服器設定',
            smtpServerInput: 'SMTP伺服器設定',
            Error_portNumber: '連接埠應該是從1-65535之間，並且不是22的數字',
            emailServerPassword: '郵箱密碼(推薦使用應用專用密碼)',
            imapAccountConform: function ( iamp, account ) { return `<p class="ui small header brown">警告：</p><p class="grey">當您按下提交按鈕時，意味著您已經確認【<B class="red">${ iamp }</B>】是為了使用CoNET系統而特別申請的臨時郵箱，您同意承擔由此帶來的風險，並授權CoNET系統可以使用這個Email郵箱傳輸信息!</p><p class="grey" >CoNET平台將會向CoNET發送包含以下信息的email：【<B class="red">${ iamp }</B>】及APP密碼，註冊【<B class="red">${ account }</B>】郵箱地址，使用語言，時區，加密公鑰。 </p><p class="grey">同時您也同意並授權CoNET可以向您的註冊郵箱【<B class="red">${ account }</B>】發送CoNET有關服務，促銷，賬戶及其他信息。 </p>`},
            agree:'我已經了解風險，並願意繼續',
            imapOtherCheckError: '不能連接到Email伺服器，有可能您設定的伺服器名稱或IP，通訊連接埠有誤，請檢查您的伺服器詳細設定！',
            CertificateError: 'Email伺服器提示的證書不能被系統信任！您的Email伺服器有可能是一個仿冒的，您如果想繼續，請在詳細設定裡選擇【允許連接到不被信任證書的Email伺服器】，但您的Email登陸信息有可能洩漏給此伺服器！',
            IgnoreCertificate: '允許連接到不被信任證書的Email伺服器',
            Certificat: '如果您不確定請別選擇這項，這個選擇是非常危險，因為它允許連接上一個仿冒的伺服器，可能洩露您的用戶名和密碼。',
            AuthenticationFailed: 'Email伺服器提示用戶名或密碼錯誤，請仔細檢查您的用戶名和密碼！',
            addAEmail: '添加通訊用Email賬戶',
            tryAgain: '再試一次',
            connectImap: '連結CoNET網絡',
            cancelConnect: '終止CoNET網絡連接',
            imapItemTitle: '通訊用郵箱詳細信息',
            imapCheckingStep: [
                /* 0 */'正在尝试连接邮件伺服器',
                /* 1 */'邮件伺服器IMAP連接成功，正在等待CoNET對接。',
                /* 2 */'邮件伺服器SMTP連接成功',
                /* 3 */'CoNET客户端向CoNET系统发出联机请求Email。和CoNET联机需要额外的时间，请耐心等待。',
                /* 4 */'成功連接CoNET',
                /* 5 */'邮件伺服器IMAP連接成功'

            ],
            imapResultTitle: 'IMAP伺服器CoNET通訊評分：',
            testSuccess: '電子郵件伺服器連接試驗成功！',
            exitEdit: '退出編輯Email帳戶',
            deleteImap: '刪除IMAP帳戶',
            proxyPortError: '連接埠應該是從3001-65535之間的數字，或此端口已被其他APP所占用，請嘗試填入其他號碼。',
            appPassword:'關於APP密碼',
            imapCheckError: [
                '不能连接到郵件伺服器，有可能您沒有互聯網，或所在網絡不支持郵件IMAP通訊，請檢查您的網絡，或刷新頁面重試一次',
                '郵件伺服器提示用户名或密码错误，请仔细检查您的用户名和密码！',
                '郵件伺服器證書錯誤！您所在網絡可能存在網絡中間人攻擊，請換網絡環境後再嘗試。',
                '郵件伺服器發送郵件錯誤，這通常是您使用的密碼是普通密碼所致，請換用APP密碼後再次嘗試',
                '未連結互聯網，請檢查網絡',
                '未知錯誤，請退出CoNET後再試。',
                '您的郵箱無可用空間錯誤，請檢查郵箱刪除不必要的郵件後再試。'
            ]
        },

        Home_keyPairInfo_view: {
            deleteKeyPairHaveLogin: '請使用登陸後的客戶端來刪除您的密鑰',
            title: '密鑰信息',
            emailNotVerifi: '您的密鑰未獲CoNET簽署認證。 ',
            emailVerified: '您的密鑰已獲CoNET簽署認證。 ',
            NickName: '暱稱：',
            creatDate:'密鑰創建日期：',
            keyLength: '密鑰位強度：',
            password: '請輸入長度大於五位的密碼',
            password1: '請輸入平台密碼',
            logout:'退出登錄',
            deleteKeyPairInfo: '請注意：如果您沒有備份您的CoNET系統的話，刪除現有的密鑰將使您的CoNET網絡設定全部丟失，您有可能需要重新設置您的CoNET系統。如果您的註冊Email沒有變化，您的CoNET賬戶支付信息不會丟失！',
            delete: '刪除',
            keyID: '密鑰對ID：',
            locked: '請提供您的RSA密鑰以解開密鑰後才能繼續操作，如果您遺忘了密碼，請刪除此RSA密鑰。',
            systemError:'發生系統錯誤。如果重複發生，請刪除您的密鑰，再次設定您的系統！'
        },

		home_index_view: {
            newVersion: '新版本準備就緒，請安裝！',
            newVersionInstallLoading:'更新中請稍候',
            localIpAddress: '本機',
            clickInstall: '點擊安裝新版本',
            internetLable: '互聯網',
            gateWayName:'代理伺服器',
            showing:'系統狀態',
            nextPage:'下一頁',
            agree: '同意協議並繼續',
            imapEmailAddress:'郵箱帳戶名',
            emailAddress: 'Q梯帳戶名稱(Email地址,必填)',
            stopCreateKeyPair: '停止生成密鑰對',
            creatKeyPair: '創建密鑰對..',
            keyPairCancel: '生成密鑰對被中止',
            keyPairGenerateError: '生成密鑰對發生系統錯誤，請重試！ ',
            keyPairGenerateSuccess: '完成生成密鑰對',
            cancel: '放棄操作',
            systemPassword: 'Q梯客戶端密碼設置',
            continueCreateKeyPair: '繼續生成',
            SystemAdministratorNickName: '帳戶暱稱(必填)',
            KeypairLength: '請選擇加密通訊用密鑰對長度：這個數字越大，通訊越難被破解，但會增加通訊量和運算時間。',
            systemAdministratorEmail:'RSA密鑰生成',
            GenerateKeypair: '<em>系統正在生成用於通訊和簽名的RSA加密密鑰對，計算機需要運行產生大量的隨機數字，可能需要幾分鐘時間，尤其是長度為4096的密鑰對，需要特別長的時間，請耐心等待。關於RSA加密算法的機制和原理，您可以訪問維基百科：' +
                `<a href='#' target="_blank" onclick="return linkClick ('https://zh.wikipedia.org/wiki/RSA加密演算法')">https://zh.wikipedia.org/wiki/RSA加密演算法</a></em>`,
            inputEmail: '让我们来完成设定的最后几个步骤，首先生成RSA密鑰對, 它是您的系統信息加密，身份認證及和CoNET網絡通訊使用的重要組成部分。 RSA密鑰對的密碼請妥善保存，Email地址欄請填入您的常用邮箱地址, 它將被用作您的CoNET網絡賬號。<em style="color:brown;">需注意的是CoNET域名在某些网络限制地区可能被列入黑名单，推薦使用網絡自由地區郵箱。</em>',
            accountEmailInfo: `由於CoNET域名在某些國家和地區被防火牆屏蔽，而不能正常收發CoNET的Email，如果您是處於防火牆內的用戶，建議使用防火牆外部的郵件服務商。`
        },
        error_message: {
            title: '錯誤',
            errorNotifyTitle: '系統錯誤',
            Success: '完成',
            localServerError: '本地伺服器錯誤，請重新啟動CoNET！',
            required: '請填寫此字段',
            EmailAddress: ['請按照下列格式輸入你的電子郵件地址: someone@example.com.', '您已有相同的Email賬戶','此類Email伺服器CoNET暫時不對應。'],
            PasswordLengthError: '密碼必須設定為5個字符以上。',
            finishedKeyPair: '密鑰對創建完成',
            doCancel: '終止生成',
            errorKeyPair:'密鑰對創建發生錯誤，請重試',
            SystemPasswordError: '密鑰對密碼錯誤，請重試！如果您已忘記您的密鑰對密碼，請刪除現有的密鑰對，重新生成新的密鑰對。',
            finishedDeleteKeyPair: '密鑰對完成刪除!',
            offlineError: '您的電腦視乎未連結到互聯網，請檢查網路連結',
            imapErrorMessage: [
        /* 0 */ '未能夠與CoNET網絡對接成功。CoNET網絡可能存在問題，請稍後再次嘗試建立連結。或聯繫CoNET服務。',
        /* 1 */ '數據格式錯誤，請重試', 
        /* 2 */ '您的電腦未連接到互聯網，請檢查網絡後再次嘗試！',
        /* 3 */ 'Email伺服器提示IMAP用戶名或密碼錯！這個錯誤通常是由於您使用的密碼是普通密碼，或者您的APP密碼已失效，請到您的Email帳戶檢查您的APP密碼，然後再試一次。',
        /* 4 */ 'Email伺服器的指定連接埠連結失敗，請檢查您的IMAP連接埠設定，如果您在一個防火牆內部，則有可能該端口被防火牆所屏蔽，您可以嘗試使用該IMAP伺服器的其他連接埠！',
        /* 5 */ '伺服器證書錯誤！您可能正在連接到一個仿冒的Email伺服器，如果您肯定這是您希望連接的伺服器，請在IMAP詳細設定中選擇忽略證書錯誤。',
        /* 6 */ '無法獲得Email伺服器域名信息，請檢查您的Email伺服器設定！或您的電腦沒有連結互聯網，請檢查網絡狀態。',
        /* 7 */ '此Email伺服器看來不能使用CoNET網絡通訊技术，請再測試一次或选择其他email服务供应商！',
        /* 8 */ 'email伺服器提示SMTP用戶名或密碼錯！',
        /* 9 */ '伺服器證書錯誤！您可能正在連接到一個仿冒的Email伺服器，如果您肯定這是您希望連接的伺服器，請在SMTP詳細設定中選擇忽略證書錯誤。',
        /* 10 */'SMTP連結提示未知錯誤',
        /* 11 */'您已有相同的Email賬戶',
        /* 12 */'您的系統還未連接到CoNET網絡！',
        /* 13 */'您的郵箱提示您賬號已無可使用容量，請清理郵箱後再試',
        /* 14 */'通訊遇到未知錯誤，請重試！',
                ],
            
            CoNET_requestError: [
                /* 0 */'CoNET無響應,正在重新建立CoNET通訊管道，請稍候！',
                /* 1 */'無效操作！'
            ]
        },

        emailConform: {
            activeViewTitle:'驗證您的密鑰',
            emailTitle: '感謝您使用CoNET服務',
            info1_1: '您的密鑰還未完成驗證，請點擊按鈕[發送驗證Email]，並檢查您的【',
            info1_2: '】郵箱。如果存在多封CoNET的郵件時，請選擇最後一封信件。請打開信件並複制郵件內容。如果您還未收到CoNET的郵件，請檢查您的密鑰郵箱是否準確，或者您可以刪除您現有的密鑰，重新生成新的密鑰。',
            info2: '複制內容從“-----BEGIN PGP MESSAGE----- （ 開始，一直到 ）----- END PGP MESSAGE-----” 結束的完整內容，粘貼到此輸入框中',
            emailDetail1: '尊敬的 ',
            emailDetail1_1: '',
            reSendRequest:'發送驗證Email',
            requestReturn: ['錯誤！您的請求被拒絕，這可能是您在短時間內多次請求所致，請稍後再試','CoNET系統已發送激活郵件！'],
            emailDetail2: '這是您的CoNET帳號激活密碼，請複制下列框內的全部內容:',
            bottom1_1:'此致',
            bottom1_2:'CoNET團隊',
            conformButtom: '驗 證',
            formatError: [  '內容格式錯誤，請複制從“-----BEGIN PGP MESSAGE----- （開始，一直到）-----END PGP MESSAGE-----” 結束的完整內容，粘貼在此輸入框中。',
                            '提供的內容不能被解密，請確認這是在您收到的最後一封從CoNET發送過來的激活信。如果還是沒法完成激活，請刪除您的密鑰重新生成和設定。',
                            '和CoNET網絡連接發生錯誤，請退出重新嘗試！',
                            '無效激活碼！如果存在多封CoNET的郵件時，請選擇最後一封信件。',
                            '您的CoNET看上去有問題, 請刪除您的密鑰，重新設置您的CoNET！',
                            'CoNET網絡系統無應答故障，可能暫時下線中，請稍後再試。 ',
                            '您當天的數據通訊量達到上限，請等待明天再試或升級用戶類型',
                            '用來通訊的Email設定有錯誤，請檢查IMAP設定後重試，或CoNET網絡不支持此Email類型',
                            '您所選區域不能夠連結，請稍候再試',
                            '您的IMAP郵箱發信發生錯誤。請退出CoNET重試。如果持續發生此故障，您的IMAP帳號有可能被鎖住，需要登陸您的IMAP郵箱網站解鎖操作。',
                            '頁面會話已過期，請刷新頁面以繼續，或退出後重新啟動CoNET。',
                            'CoNET平台故障，請重新啟動CoNET。'
        
                        ],
            activeing: '正在通訊中'
        },

        QTGateRegion: {
            title: '高品質訂製代理伺服器區域',
            available: '服務中',
            speedTest: '代理伺服器速度測試',
            CoGateRegionStoped:'所訂製的代理伺服器已經被停止，如需使用請再次訂製.',
            unavailable: '準備中',
            proxyDomain: '域名解釋全程使用CoNET代理伺服器端',
            setupCardTitle: '使用連接技術:',
            paidUse:'本區域只對收費用戶開放',
            MultipleGateway: '同時併發使用代理數:',
            connectQTGate:'正在獲得代理伺服器區域信息...',
            dataTransfer: '數據通訊:',
            dataTransfer_datail: ['全程使用CoNET代理伺服器','當不能夠到達目標時使用'],
            proxyDataCache: '瀏覽數據本地緩存:',
            proxyDataCache_detail: ['本地緩存','不緩存'],
            dataViaGateway: '全部互聯網數據通過CoNET代理伺服器',
            cacheDatePlaceholder: '緩存失效時間',
            requestPortNumber: '代理伺服器通訊連接埠',
            clearCache: '立即清除所有緩存',
            GlobalIp: '本機互聯網IP地址:',
            option: '高級設置',
            WebRTCleak:'阻止WebRTC漏洞',
            WebRTCleakInfo: '本設置後，瀏覽器的即時會話，端對點通訊等將不再工作。',
            pingError:'代理服務區域速度檢測錯誤發生，請退出CoNET，以管理員身份再次打開CoNET後，再執行速度檢測！',
            QTGateRegionERROR:['發送連接請求Email到CoNET系統發生送信錯誤， 請檢查您的IMAP賬號的設定。 ',
                              ''],
            sendConnectRequestMail: ['客戶端未連結到CoNET網絡，已向CoNET重新發出聯網請求Email。這需要額外的時間，請耐心等待。',
                                     '當長時間未連結CoNET網絡，您的連接會被中斷。'],
            
            GlobalIpInfo:'注意：當您按下【CoNET連結】時您會把您的本機互聯網IP提供給CoNET網絡，如果您不願意，請選擇【@OPN】技術來使用CoNET服務！沒有顯示【@OPN】選項是@OPN連結技術，只在洛杉磯區域，並只支持使用iCloud郵箱。',
            localPort: '本地代理伺服器連接埠:',
            cacheDatePlaceDate: [{ name:'1小时', id: 1 }, { name:'12小时', id: 12 },{ name:'1日', id: 24 }, { name:'15日', id: 360 }, { name:'1月', id: 720 }, { name:'6月', id: 4320 }, { name:'永遠', id: -1 }],
            atQTGateDetail: [
        /*0*/   '世界首创的CoNET无IP互联网通讯技术，全程使用強加密Email通訊，客户端和代理服务器彼此不用知道IP地址，具有超强隐身和保护隐私，超強防火牆穿透能力。缺点是有延遲，网络通讯响应受您所使用的email服务供应商的伺服器影响，不適合遊戲視頻會話等通訊。目前該技術只支持iCloud郵箱。',
        /*1*/   'CoNET獨創HTTP明碼強加密混淆流量代理技術，能夠隱藏變換您的IP地址高速通訊，隐身和保护隐私，抗干擾超強防火牆穿透能力。缺點是需要使用您的IP來直接連結代理伺服器。如果您只是需要自由訪問互聯網，則推薦使用本技術。',
        /*2*/   '域名解釋使用CoNET代理伺服器端，可以防止域名伺服器緩存污染，本選擇不可修改。',
        /*3*/   '互聯網數據全程使用CoNET代理，可以匿名上網隱藏您的互聯網形踪。',
        /*4*/   '只有當本地網絡不能夠到達您希望訪問的目標時，才使用CoNET代為您連結目標伺服器，本選項可以加速網速，但無隱私。',
        /*5*/   '通過本地緩存瀏覽紀錄，當您再次訪問目標伺服器時可以增加訪問速度，減少網絡流量，緩存瀏覽記錄只針對非加密技術的HTTP瀏覽有效。CoNET使用強加密技術緩存瀏覽紀錄，確保您的隱私不被洩漏',
        /*6*/   '不保存緩存信息。',
        /*7*/   '設置緩存有效時間，您可以及時更新伺服器數據，單位為小時。',
        /*8*/   '本地Proxy服务器，其他手机电脑和IPad等可通過连结此端口來使用CoNET服务。請設定為3001至65535之間的數字',
        /*9*/   '通過設置PATH鏈接路徑可以簡單給您的Proxy伺服器增加安全性，拒絕沒有提供PATH的訪問者使用您的Proxy伺服器。',
        /*10*/  '同時使用多條代理線路數，可以有效降低大流量集中在一個代理服務線路，降低被網絡監控者發現的風險。此選項僅供收費會員使用。',
        /*11*/  '指定同Q梯代理進行通訊使用的連接埠，通過此設置可以規避您所在網段被通訊屏蔽的連接埠。',
        /*12*/  'Web实时通讯(WebRTC)是客戶端的瀏覽器之間，通過IP地址直接高速通訊技術，有時被惡用洩漏您的真實IP地址。'
            ]
        },

        QTGateGateway: {
            title: 'CoNET服務使用詳細',
            promo: '促銷活動',
            processing: '正在嘗試连接CoNET網絡...',
            error: [
                '錯誤：您的賬號下已經有一個正在使用CoNET代理伺服器的連接，請先把它斷開後再嘗試連接。', 
                '錯誤：您的賬號已經無可使用流量，如果您需要繼續使用CoNET代理伺服器，請升級您的賬戶類型。如果是免費用戶已經使用當天100M流量，請等待到明天繼續使用，如您是免費用戶已經用完當月1G流量，請等待到下月繼續使用。',
                '錯誤：數據錯誤，請退出並重新啟動CoNET！','非常抱歉，您請求的代理區域無資源，請選擇其他區域或稍後再試',
                '對不起，您所請求連接的區域不支持這樣的連接技術，請換其他連接方法或選擇其他區域連接',
                '@OPN链接技术不支持公用iCloud邮箱，请撤換通訊用IMAP郵箱，換您自有的iCloud邮箱。'
            ],
            connected:'已連接。',
            upgrade:'升級賬號',
            accountManager:'賬號管理',
            userType:['免費用戶','付費用戶'],
            datatransferToday:'日流量限額：',
            datatransferMonth:'月流量限額：',
            todaysDatatransfer: '本日可使用流量',
            monthDatatransfer: '本月可使用流量',
            gatewayInfo: ['代理伺服器IP地址：','代理伺服器連接端口：'],
            userInfoButton: '使用指南',
            stopGatewayButton:'停止所定制伺服器',
            disconnecting: '正在銷毀中...'
        },
        
        qtGateView: {
            title: '發送訂製請求',
            QTGateConnectResultWaiting: '已向CoNET網絡發送連接請求Email。由於是首次連接CoNET網絡，系統需要幾分鐘時間來完成與您的對接，請耐心等待。',
            mainImapAccount: 'CoNET網絡通訊用郵箱',
            QTGateDisconnectInfo: 'CoNET網絡已斷開。請選擇CoNET網絡通訊用IMAP帳號',
            QTGateConnectStatus: 'CoNET網絡連接狀態',
            QTGateConnectResult: ['CoNET網絡未連結，請點擊連接CoNET網絡', '正在連接CoNET網絡', '已經連接CoNET網絡', '連接連接CoNET網絡時發生錯誤，請修改IMAP賬號設定',
                    '已經連接CoNET網絡'],
            QTGateSign: ['您的密鑰狀態','還未獲得CoNET網絡信任簽署,點擊完成信任簽署',
                '密钥获得CoNET網絡信任签署是一个重要步骤，您今后在CoNET網絡用户之间分享文件或传送秘密信息时，CoNET網絡可以證明是您本人而非其他冒充者。你也可以通过您的密钥签署信任给其他CoNET網絡用户，用以区别您自己的信任用户和非信任用户。',
                '正在獲得CoNET信任簽署中','系統錯誤，請重啓CoNET後再試，如果仍然存在，請嘗試重新安裝CoNET。', 'CoNET系統錯誤!']

        },

        feedBack: {
            title: '使用信息反饋',
            additional: '添附附加信息',
            okTitle:'發送至CoNET'
        },
	}
]

const linkClick = function ( url: string ) {
    return window.open ( url, '_blank')
}

function cmpVersions ( a: string, b: string ) {
    let diff
    const regExStrip0 = /(\.0+)+$/
    const segmentsA = a.replace( regExStrip0, '').split('.')
    const segmentsB = b.replace( regExStrip0, '').split('.')
    const l = Math.min ( segmentsA.length, segmentsB.length )

    for ( let i = 0; i < l; i++ ) {
        diff = parseInt ( segmentsA[i], 10 ) - parseInt ( segmentsB[i], 10 )
        if ( diff ) {
            return diff
        }
    }
    return segmentsA.length - segmentsB.length;
}

function scrollToTop () {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

const socketIo = io ({ reconnectionAttempts: 5, timeout: 500, autoConnect: true })
const QTGateRegionsSetup: IQTGateRegionsSetup[] = [
    {
        title: '@OPN'
    },
    {
        title: 'iOPN'
    }
]
const _QTGateRegions: QTGateRegions[] = [
    {
        icon: 'india',
        content: ['班加罗尔','バンガロール','Bangalore','班加羅爾'],
        meta: ['亚洲・印度','アジア・インド','India. Asia.','亞洲・印度'],
        description: ['','','',''],
        canVoe: ko.observable(false),
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
        downloadSpeed: ko.observable (-2),
        freeUser: ko.observable(false)

    },{
        icon: 'singapore',
        content: ['新加坡','シンガポール','Singapore','新加坡'],
        meta: ['亚洲・新加坡','アジア・シンガポール','Singapore. Asia.','亞洲・新加坡'],
        description: ['','','',''],
        canVoe: ko.observable(false),
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
        downloadSpeed: ko.observable (-2),
        freeUser: ko.observable(false)
    },{
        icon: 'japan',
        content: ['东京','東京','Tokyo','東京'],
        meta: ['亚洲・日本','アジア・日本','Japan. Asia.','亞洲・日本'],
        description: ['','','',''],
        canVoe: ko.observable(false),
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
        downloadSpeed: ko.observable (-2),
        freeUser: ko.observable(false)
    },{
        icon: 'france',
        content: ['巴黎','パリ','Paris','巴黎'],
        meta: ['欧洲・法国','ヨーロッパ・フランス','France. Europe.','歐洲・法國'],
        description: ['','','',''],
        canVoe: ko.observable(false),
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
        downloadSpeed: ko.observable (-2),
        freeUser: ko.observable(true)
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
        canVoe: ko.observable(false),
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
        downloadSpeed: ko.observable (-2),
        freeUser: ko.observable(false)
    },{
        icon: 'germany',
        content: ['法兰克福','フランクフルト','Frankfurt','法蘭克福'],
        meta: ['欧洲・德国','ヨーロッパ・ドイツ','Germany. Europe.','歐洲・德國'],
        description: ['','','',''],
        canVoe: ko.observable(false),
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
        downloadSpeed: ko.observable (-2),
        freeUser: ko.observable(false)

    },{
        icon: 'united kingdom',
        content: ['爱尔兰','アイルランド','Ireland','愛爾蘭'],
        meta: ['欧洲・英国','ヨーロッパ・英国','United Kingdom. Europe.','歐洲・英國'],
        description: ['','','',''],
        canVoe: ko.observable(false),
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
        downloadSpeed: ko.observable (-2),
        freeUser: ko.observable(false)
    },{
        icon: 'united kingdom',
        content: ['伦敦','ロンドン','London','倫敦'],
        meta: ['欧洲・英国','ヨーロッパ・英国','United Kingdom. Europe.','歐洲・英國'],
        description: ['','','',''],
        canVoe: ko.observable(false),
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
        downloadSpeed: ko.observable (-2),
        freeUser: ko.observable(false)
    },{
        icon: 'australia',
        content: ['悉尼','シドニー','Sydney','悉尼'],
        meta: ['澳洲・澳大利亚','オーストラリア','Australia.','澳洲・澳大利亚'],
        description: ['','','',''],
        canVoe: ko.observable(false),
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
        downloadSpeed: ko.observable (-2),
        freeUser: ko.observable(false)
    },{
        icon: 'united states',
        content: ['纽约','ニューヨーク','New York City','紐約'],
        meta: ['北美洲东海岸・美国','北アメリカ東海岸・アメリカ','USA. North American Eastern.','北美洲東海岸・美國'],
        description: ['','','',''],
        canVoe: ko.observable(false),
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
        downloadSpeed: ko.observable (-2),
        freeUser: ko.observable(false)

    },{
        icon: 'canada',
        content: ['多伦多','トロント','Toronto','多倫多'],
        meta: ['北美洲东海岸・加拿大','北アメリカ東海岸・カナダ','Canada. North American Eastern.','北美洲東海岸・加拿大'],
        description: ['','','',''],
        canVoe: ko.observable(false),
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
        downloadSpeed: ko.observable (-2),
        freeUser: ko.observable(false)
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
        downloadSpeed: ko.observable (-2),
        freeUser: ko.observable(false)
    },{
        icon: 'hong kong',
        content: ['香港','香港','Hong Kong','香港'],
        meta: ['亚洲・中国','アジア・中国','China. Asia.','亞洲・中國'],
        description: ['','','',''],
        canVoe: ko.observable(false),
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
        downloadSpeed: ko.observable (-2),
        freeUser: ko.observable(false)
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
        downloadSpeed: ko.observable (-2),
        freeUser: ko.observable(false)
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
        downloadSpeed: ko.observable (-2),
        freeUser: ko.observable(false)
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
        downloadSpeed: ko.observable (-2),
        freeUser: ko.observable(false)
    }
]