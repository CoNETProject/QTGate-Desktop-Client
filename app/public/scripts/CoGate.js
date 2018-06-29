const Stripe_publicKey = 'pk_live_VwEPmqkSAjDyjdia7xn4rAK9';
class coGateRegion {
    constructor(region, dataTransfer, account, isPublicImapAccount, exit) {
        this.region = region;
        this.dataTransfer = dataTransfer;
        this.account = account;
        this.isPublicImapAccount = isPublicImapAccount;
        this.exit = exit;
        this.QTConnectData = ko.observable(null);
        this.QTGateConnect1 = ko.observable('1');
        this.showQTGateConnectOption = ko.observable(false);
        this.QTGateMultipleGateway = ko.observable(1);
        this.QTGateMultipleGatewayPool = ko.observableArray([]);
        this.isFreeUser = ko.observable(/free/i.test(this.dataTransfer.productionPackage));
        this.QTGateGatewayPortError = ko.observable(false);
        this.requestPortNumber = ko.observable('80');
        this.QTGateLocalProxyPort = ko.observable('3001');
        this.localProxyPortError = ko.observable(false);
        this.QTGateConnect2 = ko.observable(false);
        this.WebRTCleak = ko.observable(true);
        this.doingProcessBarTime = null;
        this.error = ko.observable(-1);
        this.CoGateConnerting = ko.observable(false);
        this.disconnecting = ko.observable(false);
        this.localHostIP = ko.observable('');
        this.proxyInfoMacOS = ko.observable(false);
        this.proxyInfoIE = ko.observable(false);
        this.iOS = ko.observable(false);
        this.fireFox = ko.observable(false);
        this.android = ko.observable(false);
        const self = this;
        socketIo.emit11('checkPort', '3001', function (err, nextPort) {
            if (err) {
                self.QTGateLocalProxyPort(nextPort);
            }
        });
        this.requestPortNumber.subscribe(function (newValue) {
            const uu = parseInt(newValue);
            self.QTGateGatewayPortError(false);
            if (!newValue) {
                return self.requestPortNumber('80');
            }
            if (uu < 1 || uu > 65535 || uu === 22) {
                self.QTGateGatewayPortError(true);
                return $('.popupInput').popup({
                    on: 'focus',
                    movePopup: false,
                    position: 'top left',
                    inline: true
                });
            }
        });
        this.QTGateLocalProxyPort.subscribe(function (newValue) {
            const uu = parseInt(newValue);
            self.localProxyPortError(false);
            if (!newValue) {
                return self.requestPortNumber('3001');
            }
            if (uu < 3000 || uu > 65535) {
                self.localProxyPortError(true);
                return $('.popupInput').popup({
                    on: 'focus',
                    movePopup: false,
                    position: 'top left',
                    inline: true
                });
            }
            return socketIo.emit11('checkPort', newValue, function (err) {
                return self.localProxyPortError(err);
            });
        });
        setTimeout(function () {
            $('.ui.radio.checkbox.canVoH').checkbox('check').checkbox({
                onChecked: function () {
                    self.QTGateConnect1('1');
                }
            });
            $('.ui.radio.checkbox.canVoe').checkbox().checkbox({
                onChecked: function () {
                    if (self.isPublicImapAccount) {
                        self.error(5);
                        return $('.ui.radio.checkbox.canVoH').checkbox('check');
                    }
                    self.QTGateConnect1('2');
                }
            });
        }, 50);
        if (/p1/i.test(dataTransfer.productionPackage)) {
            this.QTGateMultipleGatewayPool([1, 2]);
        }
        else if (/p2/i.test(dataTransfer.productionPackage)) {
            this.QTGateMultipleGatewayPool([1, 2, 4]);
        }
        else {
            this.QTGateMultipleGatewayPool([1]);
        }
    }
    upgradeAccount() {
    }
    showQTGateConnectOptionClick() {
        this.showQTGateConnectOption(!this.showQTGateConnectOption());
        if (this.WebRTCleak()) {
            $('.checkboxWebRTC').checkbox('set checked');
        }
        else {
            $('.checkboxWebRTC').checkbox('set unchecked');
        }
    }
    QTGateGatewayConnectRequestCallBack(error, connectCommand) {
        clearTimeout(this.doingProcessBarTime);
        this.CoGateConnerting(false);
        if (typeof error === 'number' && error > -1) {
            //this.QTGateConnectRegionActive ( true )
            //this.QTGateGatewayActiveProcess ( false )
            this.error(error);
            return;
        }
        const data1 = connectCommand[0];
        this.localHostIP(data1.localServerIp[0]);
        this.QTGateLocalProxyPort(data1.localServerPort);
        //this.QTTransferData ( data1.transferData )
        return this.QTConnectData(data1);
    }
    QTGateGatewayConnectRequest() {
        const self = this;
        const connect = {
            account: this.dataTransfer.account,
            imapData: null,
            gateWayIpAddress: null,
            region: this.region.qtRegion,
            connectType: this.QTGateConnect1() === '1' ? 2 : 1,
            localServerPort: this.QTGateLocalProxyPort(),
            AllDataToGateway: !this.QTGateConnect2(),
            error: null,
            fingerprint: null,
            localServerIp: null,
            multipleGateway: [],
            requestPortNumber: this.requestPortNumber(),
            requestMultipleGateway: this.QTGateMultipleGateway(),
            webWrt: this.WebRTCleak(),
            globalIpAddress: null
        };
        this.CoGateConnerting(true);
        socketIo.emit11('QTGateGatewayConnectRequest', connect);
        return false;
    }
    showUserInfoMacOS(infoOS) {
        this.closeInfo();
        switch (infoOS) {
            default:
            case 'macOS': {
                return this.proxyInfoMacOS(true);
            }
            case 'WInIE': {
                return this.proxyInfoIE(true);
            }
            case 'iOS': {
                return this.iOS(true);
            }
            case 'fireFox': {
                return this.fireFox(true);
            }
            case 'android': {
                return this.android(true);
            }
        }
    }
    disconnectClick() {
        const self = this;
        this.disconnecting(true);
        socketIo.emit11('disconnectClick', function () {
            self.disconnecting(false);
            self.QTConnectData(null);
            self.exit();
        });
    }
    closeErrMessage() {
        this.error(-1);
    }
    selectConnectTech(n) {
        this.QTGateConnect1(n.toString());
        if (n === 2) {
            if (this.isPublicImapAccount) {
                this.error(5);
                this.QTGateConnect1('1');
            }
        }
        if (this.QTGateConnect1() === '1') {
            $('.radio.checkbox.canVoH').checkbox('set checked');
        }
        else {
            $('.radio.checkbox.canVoe').checkbox('set checked');
        }
        return false;
    }
    exit1() {
        this.exit();
    }
    closeInfo() {
        this.proxyInfoMacOS(false);
        this.proxyInfoIE(false);
        this.iOS(false);
        this.fireFox(false);
        this.android(false);
    }
}
class CoGateClass {
    constructor(isUsedPublicImapAccount) {
        this.isUsedPublicImapAccount = isUsedPublicImapAccount;
        this.QTGateRegions = ko.observableArray(_QTGateRegions);
        this.reloading = ko.observable(true);
        this.CoGateRegion = ko.observable(null);
        this.showCards = ko.observable(true);
        this.QTTransferData = ko.observable();
        this.pingCheckLoading = ko.observable(false);
        this.pingError = ko.observable(false);
        this.doingCommand = false;
        this.error = ko.observable(-1);
        this.freeAccount = ko.observable(true);
        this.CoGateAccount = ko.observable(null);
        const self = this;
        this.reloadRegion();
        socketIo.on('pingCheck', function (region, ping) {
            return self.pingCheckReturn(region, ping);
        });
        socketIo.on('pingCheckSuccess', function (err) {
            self.pingCheckLoading(false);
            if (err) {
                return;
            }
            return self.QTGateRegions.sort(function (a, b) {
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
        socketIo.on('QTGateGatewayConnectRequest', function (err, cmd) {
            if (!self.CoGateRegion()) {
                let uuu = null;
                const region = cmd[0].region;
                const regionIndex = self.QTGateRegions().findIndex(function (n) {
                    return n.qtRegion === region;
                });
                const uu = self.QTGateRegions()[regionIndex];
                self.QTTransferData(cmd[0].transferData);
                uuu = new coGateRegion(uu, self.QTTransferData(), function () {
                    self.account();
                }, isUsedPublicImapAccount, function () {
                    self.CoGateRegion(uuu = null);
                    return self.showCards(true);
                });
                self.CoGateRegion(uuu);
            }
            self.reloading(false);
            self.showCards(false);
            return self.CoGateRegion().QTGateGatewayConnectRequestCallBack(err, cmd);
        });
        socketIo.on('getAvaliableRegion', function (region, dataTransfer, config) {
            return self.getAvaliableRegionCallBack(region, dataTransfer, config);
        });
    }
    getAvaliableRegionCallBack(region, dataTransfer, config) {
        this.showCards(true);
        this.QTGateRegions().forEach(function (n) {
            const index = region.findIndex(function (nn) { return nn.regionName === n.qtRegion; });
            if (index < 0) {
                return n.available(false);
            }
            n.freeUser(region[index].freeUser);
            n.canVoe(region[index].VoE);
            return n.available(true);
        });
        this.QTGateRegions.sort(function (a, b) {
            if (a.available() === b.available()) {
                return 0;
            }
            if (b.available() && !a.available()) {
                return 1;
            }
            return -1;
        });
        this.reloading(false);
        this.doingCommand = false;
        this.QTTransferData(dataTransfer);
        this.freeAccount(/^free$/i.test(dataTransfer.productionPackage));
        /*
        const uu = checkCanDoAtQTGate ( this.emailPool )
        if ( uu > -1 ) {
            this.QTGateConnectSelectImap ( uu )
            this.canDoAtEmail ( true )
            this.showQTGateImapAccount ( false )
        } else {
            this.QTGateConnectSelectImap (0)
        }
        */
        $('.ui.dropdown').dropdown();
        /*
        this.QTTransferData ( dataTransfer )
        this.config ( config )
        this.showRegionData ( true )
        this.QTGateRegionInfo ( false )
        this.pingCheckLoading( false )
        return clearTimeout ( this.doingProcessBarTime )
        */
    }
    reloadRegion() {
        const self = this;
        this.reloading(true);
        this.doingCommand = true;
        socketIo.emit11('getAvaliableRegion');
    }
    pingCheckReturn(region, ping) {
        if (!region) {
        }
        const index = this.QTGateRegions().findIndex(function (n) { return n.qtRegion === region; });
        if (index < 0) {
            return;
        }
        const _reg = this.QTGateRegions()[index];
        if (!_reg.available) {
            return;
        }
        _reg.ping(ping);
        const fromIInputData = $(`#card-${_reg.qtRegion.replace('.', '-')}`);
        const uu = ping;
        const _ping = Math.round((500 - ping) / 100);
        fromIInputData.rating({
            initialRating: _ping > 0 ? _ping : 0
        }).rating('disable');
    }
    CardClick(index) {
        const self = this;
        const uu = this.QTGateRegions()[index];
        let uuu = null;
        this.CoGateRegion(uuu = new coGateRegion(uu, this.QTTransferData(), function () {
            self.account();
        }, this.isUsedPublicImapAccount, function () {
            self.CoGateRegion(uuu = null);
            return self.showCards(true);
        }));
        this.showCards(false);
        $('.ui.checkbox').checkbox();
        $('.dropdown').dropdown();
        return $('.popupField').popup({
            on: 'click',
            position: 'bottom center',
        });
    }
    pingCheck() {
        const self = this;
        this.doingCommand = true;
        this.pingCheckLoading(true);
        this.QTGateRegions().forEach(function (n) {
            if (!n.available())
                return;
            return n.ping(-1);
        });
        return socketIo.emit11('pingCheck', function (err, CallBack) {
            if (CallBack === -1) {
                self.QTGateRegions().forEach(function (n) {
                    n.ping(-2);
                });
                return self.pingError(true);
            }
            return self.QTGateRegions().sort(function (a, b) {
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
    account() {
        this.showCards(false);
        let uu = null;
        const self = this;
        return this.CoGateAccount(uu = new CoGateAccount(self.QTTransferData(), function (payment) {
            self.showCards(true);
            if (payment) {
                const uuuu = self.QTTransferData();
                uuuu.totalMonth = payment.totalMonth || uuuu.totalMonth;
                uuuu.productionPackage = payment.productionPackage || uuuu.productionPackage;
                uuuu.expire = payment.expire || uuuu.expire;
                uuuu.paidAmount = payment.paidAmount || uuuu.paidAmount;
                uuuu.automatically = payment.paidAmount > 0 ? true : uuuu.automatically;
                self.QTTransferData(uuuu);
            }
            return self.CoGateAccount(uu = null);
        }));
    }
}
class planUpgrade {
    constructor(planNumber, isAnnual, dataTransfer, exit) {
        this.planNumber = planNumber;
        this.isAnnual = isAnnual;
        this.dataTransfer = dataTransfer;
        this.exit = exit;
        this.totalAmount = ko.observable(0);
        this.currentPromo = ko.observable(null);
        this.plan = planArray[this.planNumber];
        this.showNote = ko.observable(false);
        this.detailArea = ko.observable(true);
        this._promo = this.dataTransfer.promo[0];
        this._promoFor = this._promo.promoFor;
        this.currentPlan = ko.observable(null);
        //public annually = this.promo ? Math.round ( this.promoPrice * this.plan.annually * 100 )/100 : this.plan.annually
        this.monthlyPay = this.plan.monthlyPay;
        this.showCancel = ko.observable(false);
        this.CurrentPlanBalance = ko.observable(-1);
        this.cardNumberFolder_Error = ko.observable(false);
        this.cvcNumber_Error = ko.observable(false);
        this.postcode_Error = ko.observable(false);
        this.cardPayment_Error = ko.observable(false);
        this.paymentDataFormat_Error = ko.observable(false);
        this.paymentCardFailed = ko.observable(false);
        this.showStripeError = ko.observable(false);
        this.payment = ko.observable(0);
        this.paymentAnnually = ko.observable(false);
        this.doingPayment = ko.observable(false);
        this.paymentSelect = ko.observable(false);
        this.doingProcessBarTime = null;
        this.showCancelSuccess = ko.observable(false);
        this.showSuccessPayment = ko.observable(false);
        this.cardExpirationYearFolder_Error = ko.observable(false);
        this.cancel_Amount = ko.observable(0);
        this.newPlanExpirationYear = ko.observable('');
        this.newPlanExpirationMonth = ko.observable('');
        this.newPlanExpirationDay = ko.observable('');
        this.samePlan = ko.observable(false);
        this.paymentError = ko.observable(false);
        this.oldPlanUpgrade = ko.observable(null);
        this.paymentData = null;
        this.isAutomaticallyAgain = ko.observable(false);
        const self = this;
        this.currentPromoIndex = this._promoFor && this._promoFor.length ? this._promoFor.findIndex(function (n) {
            return n === self.plan.name;
        }) : -1;
        if (this.currentPromoIndex > -1) {
            this.currentPromo(this._promo);
        }
        this.annually = this.currentPromo() ? Math.round(this.plan.annually * this.currentPromo().pricePromo) : this.plan.annually;
        const month = this.currentPromo() ? 12 * this.currentPromo().datePromo : 12;
        this.annuallyMonth = Math.round(this.annually / month);
        this.annually = this.annually;
        this.currentPlan(planArray[planArray.findIndex(function (n) {
            return n.name === self.dataTransfer.productionPackage;
        })]);
        if (planNumber === 2) {
            this.showNote(true);
            if (this.currentPlan().name === 'p1' && dataTransfer.isAnnual) {
            }
        }
        this.samePlan(this.currentPlan().name === planNumber);
        socketIo.on('cardToken', function (err, res) {
            const data = res.Args[0];
            self.doingPayment(false);
            if (err || typeof res.error === 'number' && res.error > -1) {
                return self.paymentError(true);
            }
            self.paymentData = data;
            self.showSuccessPayment(true);
        });
    }
    clearPaymentError() {
        this.cardNumberFolder_Error(false);
        this.cvcNumber_Error(false);
        this.postcode_Error(false);
        this.cardPayment_Error(false);
        this.paymentDataFormat_Error(false);
        return this.paymentCardFailed(false);
    }
    SuccessPaymentClose() {
        this.exit(this.paymentData);
    }
    showPayment(payment, annually) {
        this.detailArea(false);
        this.payment(payment / 100);
        this.paymentAnnually(annually);
        const currentPro = this.currentPromo().datePromo || 1;
        let month = annually ? 12 * currentPro : 1;
        let expir = getExpireWithMonths(month);
        //		check is stoped monthly again
        if (this.dataTransfer.productionPackage !== 'free') {
            if (this.dataTransfer.isAnnual) {
                const monthly = this.dataTransfer.paidAmount / this.dataTransfer.totalMonth;
                this.CurrentPlanBalance(getRemainingMonth(this.dataTransfer.expire) * monthly);
            }
            else {
                this.CurrentPlanBalance(this.currentPlan().monthlyPay);
            }
        }
        if (!annually) {
            if (this.plan.name === this.currentPlan().name) {
                this.isAutomaticallyAgain(true);
                expir = new Date(this.dataTransfer.expire);
            }
        }
        this.newPlanExpirationYear(expir.getFullYear().toString());
        const _month = expir.getMonth() + 1;
        if (_month < 10) {
            this.newPlanExpirationMonth('0' + _month.toString());
        }
        else {
            this.newPlanExpirationMonth(_month.toString());
        }
        this.newPlanExpirationDay(expir.getDate().toString());
        if (this.CurrentPlanBalance() > -1) {
            this.totalAmount(this.payment() - this.CurrentPlanBalance() / 100);
        }
        else {
            this.totalAmount(this.payment());
        }
    }
    showWaitPaymentFinished() {
        const self = this;
        this.doingPayment(true);
        this.paymentSelect(false);
        this.clearPaymentError();
        $('.paymentProcess').progress('reset');
        let percent = 0;
        const doingProcessBar = function () {
            clearTimeout(self.doingProcessBarTime);
            self.doingProcessBarTime = setTimeout(function () {
                $('.paymentProcess').progress({
                    percent: ++percent
                });
                if (percent < 100)
                    return doingProcessBar();
            }, 1000);
        };
        return doingProcessBar();
    }
    showBrokenHeart() {
        return $('.ui.basic.modal').modal('setting', 'closable', false).modal('show');
    }
    paymentCallBackFromQTGate(err, data) {
        this.paymentSelect(false);
        if (err) {
            return this.showBrokenHeart();
        }
        if (data.error === -1) {
            data.command === 'cancelPlan' ? this.showCancelSuccess(true) : this.showSuccessPayment(true);
            if (data.command === 'cancelPlan' && data.Args[1]) {
                this.cancel_Amount(data.Args[1]);
            }
            const dataTrans = data.Args[0];
            return;
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
        const self = this;
        this.clearPaymentError();
        let handler = null;
        const amount = this.totalAmount() * 100;
        if (StripeCheckout && typeof StripeCheckout.configure === 'function') {
            handler = StripeCheckout.configure({
                key: Stripe_publicKey,
                image: 'images/512x512.png',
                email: this.dataTransfer.account,
                zipCode: true,
                locale: _view.tLang() === 'tw' ? 'zh' : _view.tLang(),
                token: function (token) {
                    const payment = {
                        tokenID: token.id,
                        Amount: amount,
                        plan: self.plan.name,
                        isAnnual: self.paymentAnnually(),
                        autoRenew: true
                    };
                    self.showWaitPaymentFinished();
                    return socketIo.emit11('cardToken', payment, function (err, data) {
                        return self.paymentCallBackFromQTGate(err, data);
                    });
                }
            });
            handler.open({
                name: 'CoNET Technology Inc',
                description: `${this.plan.name} `,
                amount: amount
            });
            return window.addEventListener('popstate', function () {
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
    closeClick() {
        this.exit();
    }
}
class cancelPlan {
    constructor(planName, totalMonth, amount, startDay, expir, isAnnual, normailMonthPrice, exit) {
        this.planName = planName;
        this.totalMonth = totalMonth;
        this.amount = amount;
        this.startDay = startDay;
        this.expir = expir;
        this.isAnnual = isAnnual;
        this.normailMonthPrice = normailMonthPrice;
        this.exit = exit;
        this.passedMonth = getPassedMonth(this.startDay) + 1;
        this.passedCost = this.passedMonth * this.normailMonthPrice;
        this.balance = this.amount - this.passedCost;
        this.cancelProcess = ko.observable(false);
        this.doingProcessBarTime = null;
        this.showError = ko.observable(false);
        const self = this;
    }
    paymentCallBackFromQTGate(err, data) {
        this.cancelProcess(false);
        if (data && data.error === -1) {
            if (data.command === 'cancelPlan' && data.Args[1]) {
                const cancel_Amount = data.Args[1];
            }
            const dataTrans = data.Args[0];
            return this.exit(dataTrans);
        }
        this.showError(true);
    }
    close() {
        this.exit(null);
    }
    showWaitPaymentFinished() {
        const self = this;
        $('.paymentProcess').progress('reset');
        let percent = 0;
        const doingProcessBar = function () {
            clearTimeout(self.doingProcessBarTime);
            self.doingProcessBarTime = setTimeout(function () {
                $('.paymentProcess').progress({
                    percent: ++percent
                });
                if (percent < 100)
                    return doingProcessBar();
            }, 1000);
        };
        return doingProcessBar();
    }
    doCancel() {
        const self = this;
        this.cancelProcess(true);
        this.showWaitPaymentFinished();
        socketIo.once('cancelPlan', function (err, payment) {
            return self.paymentCallBackFromQTGate(err, payment);
        });
        socketIo.emit11('cancelPlan');
    }
}
const findCurrentPlan = function (planName) {
    return planArray.findIndex(function (n) {
        return n.name === planName;
    });
};
class CoGateAccount {
    constructor(dataTransfer, exit) {
        this.dataTransfer = dataTransfer;
        this.exit = exit;
        this.username = this.dataTransfer.account;
        this.productionPackage = this.dataTransfer.productionPackage;
        this.promo = this.dataTransfer.promo[0];
        this.currentPlan = planArray[findCurrentPlan(this.productionPackage)];
        this.freeAccount = ko.observable(/^free$/i.test(this.dataTransfer.productionPackage));
        this.userPlan = ko.observable(this.dataTransfer.productionPackage.toUpperCase());
        this.planArray = ko.observableArray(planArray);
        this.planUpgrade = ko.observable(null);
        this.promoButton = ko.observable(false);
        this.promoInput = ko.observable('');
        this.promoInputError = ko.observable(false);
        this.doingPayment = ko.observable(false);
        this.paymentCardFailed = ko.observable(false);
        this.doingProcessBarTime = null;
        this.paymentSelect = ko.observable(false);
        this.inputFocus = ko.observable(true);
        this.showCancelSuccess = ko.observable(false);
        this.showSuccessPayment = ko.observable(false);
        this.UserPermentShapeDetail = ko.observable(false);
        this.paymentDataFormat_Error = ko.observable(false);
        this.cardExpirationYearFolder_Error = ko.observable(false);
        this.cvcNumber_Error = ko.observable(false);
        this.cardNumberFolder_Error = ko.observable(false);
        this.cardPayment_Error = ko.observable(false);
        this.postcode_Error = ko.observable(false);
        this.paymentAnnually = ko.observable(this.dataTransfer.isAnnual);
        this.automatically = ko.observable(this.dataTransfer.automatically);
        this.cancelPlanData = ko.observable(null);
        this.currentPlanExpirationYear = ko.observable('');
        this.currentPlanExpirationMonth = ko.observable('');
        this.currentPlanExpirationDay = ko.observable('');
        this.doingCancelProcess = ko.observable(false);
        const plan = findCurrentPlan(this.productionPackage);
        let plus1 = 1;
        if (this.currentPlan.name === 'free') {
            plus1 = 0;
        }
        this.planArray()[1].showButton(true);
        this.planArray()[2].showButton(true);
        this.planArray()[1 + plus1].tail(true);
        if (this.dataTransfer.productionPackage === 'p1') {
            this.planArray()[1].showButton(false);
        }
        if (this.dataTransfer.productionPackage === 'p2') {
            this.planArray()[1].showButton(false);
            this.planArray()[2].showButton(false);
        }
        const date = new Date(dataTransfer.expire);
        this.currentPlanExpirationYear(date.getFullYear().toString());
        this.currentPlanExpirationMonth(date.getMonth() + 1 < 9 ? '0' + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString());
        this.currentPlanExpirationDay(date.getDate().toString());
    }
    stopShowWaitPaymentFinished() {
        this.doingPayment(false);
        clearTimeout(this.doingProcessBarTime);
        return $('.paymentProcess').progress('reset');
    }
    paymentCallBackFromQTGate(err, data) {
        this.stopShowWaitPaymentFinished();
        if (err) {
            return; //this.showBrokenHeart()
        }
        if (data.error === -1) {
            this.paymentSelect(false);
            this.showSuccessPayment(true);
            const dataTrans = data.Args[0];
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
    selectPlan1(n) {
        let uu = null;
        const self = this;
        return this.planUpgrade(uu = new planUpgrade(n, this.dataTransfer.isAnnual, this.dataTransfer, function (payment) {
            self.planUpgrade(uu = null);
            self.exit(payment);
        }));
    }
    promoButtonClick() {
        this.promoButton(true);
        this.inputFocus(true);
        return new Cleave('.promoCodeInput', {
            uppercase: true,
            delimiter: '-',
            blocks: [4, 4, 4, 4]
        });
    }
    clearPaymentError() {
        //this.cardNumberFolder_Error ( false )
        //this.cvcNumber_Error ( false )
        //this.postcode_Error ( false )
        //this.cardPayment_Error ( false )
        //this.paymentDataFormat_Error ( false )
        this.promoInputError(false);
        return this.paymentCardFailed(false);
    }
    promoApplication() {
        const self = this;
        if (this.promoInput().length < 19) {
            return this.promoInputError(true);
        }
        this.inputFocus(false);
        this.promoButton(false);
        this.showWaitPaymentFinished();
        return socketIo.emit11('promoCode', this.promoInput(), function (err, data) {
            return self.paymentCallBackFromQTGate(err, data);
        });
    }
    showWaitPaymentFinished() {
        this.doingPayment(true);
        //this.paymentSelect ( false )
        this.clearPaymentError();
        $('.paymentProcess').progress('reset');
        let percent = 0;
        const self = this;
        const doingProcessBar = function () {
            clearTimeout(self.doingProcessBarTime);
            self.doingProcessBarTime = setTimeout(function () {
                $('.paymentProcess').progress({
                    percent: ++percent
                });
                if (percent < 100)
                    return doingProcessBar();
            }, 1000);
        };
        return doingProcessBar();
    }
    cancelPlan() {
        const dataTransfer = this.dataTransfer;
        let uu = null;
        const self = this;
        this.doingPayment(true);
        return this.cancelPlanData(uu = new cancelPlan(dataTransfer.productionPackage, dataTransfer.totalMonth, dataTransfer.paidAmount, dataTransfer.startDate, dataTransfer.expire, dataTransfer.isAnnual, this.currentPlan.monthlyPay, function exit(payment) {
            self.cancelPlanData(uu = null);
            self.exit(payment);
        }));
    }
}
