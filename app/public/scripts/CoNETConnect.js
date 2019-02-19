class CoNETConnect {
    constructor(email, isKeypairBeSign, confirmRisk, account, ready) {
        this.email = email;
        this.isKeypairBeSign = isKeypairBeSign;
        this.account = account;
        this.ready = ready;
        this.showSendImapDataWarning = ko.observable(false);
        this.showConnectCoNETProcess = ko.observable(true);
        this.connectStage = ko.observable(0);
        this.connetcError = ko.observable(-1);
        this.connectedCoNET = ko.observable(false);
        this.maynotConnectConet = ko.observable(false);
        this.mayNotMakeImapConnect = ko.observable(false);
        this.Loading = ko.observable(false);
        this.keyPairSign = ko.observable(null);
        const self = this;
        if (!confirmRisk) {
            this.showSendImapDataWarning(true);
        }
        else {
            this.imapConform();
            this.Loading(true);
        }
        socketIo.on('tryConnectCoNETStage', function (err, stage, showCoGate) {
            return self.listingConnectStage(err, stage, showCoGate);
        });
    }
    listingConnectStage(err, stage, showCoGate) {
        const self = this;
        this.showConnectCoNETProcess(true);
        let processBarCount = 0;
        if (typeof err === 'number' && err > -1) {
            this.connectStage(-1);
            this.ready(err, false);
            return this.connetcError(err);
        }
        if (stage === 4) {
            this.showConnectCoNETProcess(false);
            this.connectedCoNET(true);
            processBarCount = 67;
            if (!this.isKeypairBeSign) {
                if (!this.keyPairSign()) {
                    let u = null;
                    return this.keyPairSign(u = new keyPairSign((function () {
                        self.keyPairSign(u = null);
                        self.ready(null, showCoGate);
                    })));
                }
                return;
            }
            return this.ready(null, showCoGate);
        }
        $('.keyPairProcessBar').progress({
            percent: processBarCount += 33
        });
        if (this.connectStage() === 3) {
            return;
        }
        return this.connectStage(stage);
    }
    returnToImapSetup() {
        return this.ready(0, true);
    }
    imapConform() {
        this.showSendImapDataWarning(false);
        this.connetcError(-1);
        this.Loading(true);
        return socketIo.emit11('tryConnectCoNET');
    }
}
