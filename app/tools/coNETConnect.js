"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Imap = require("./imap");
const Tool = require("./initSystem");
const Fs = require("fs");
const Async = require("async");
let logFileFlag = 'w';
const saveLog = (err, _console = false) => {
    if (!err) {
        return;
    }
    const data = `${new Date().toUTCString()}: ${typeof err === 'object' ? (err['message'] ? err['message'] : '') : err}\r\n`;
    _console ? console.log(data) : null;
    return Fs.appendFile(Tool.CoNETConnectLog, data, { flag: logFileFlag }, () => {
        return logFileFlag = 'a';
    });
};
const timeOutWhenSendConnectRequestMail = 1000 * 60;
const commandRequestTimeOutTime = 1000 * 10;
const requestTimeOut = 1000 * 10;
class default_1 extends Imap.imapPeer {
    constructor(imapData, sockerServer, openKeyOption, doNetSendConnectMail, cmdResponse, _exit) {
        super(imapData, imapData.clientFolder, imapData.serverFolder, (encryptText, CallBack) => {
            return Tool.encryptMessage(openKeyOption, encryptText, CallBack);
        }, (decryptText, CallBack) => {
            return Tool.decryptoMessage(openKeyOption, decryptText, CallBack);
        }, err => {
            console.log(`coNETConnect IMAP class exit with err: [${err}] doing this.exit(err)!`);
            return this.exit1(err);
        });
        this.imapData = imapData;
        this.sockerServer = sockerServer;
        this.openKeyOption = openKeyOption;
        this.doNetSendConnectMail = doNetSendConnectMail;
        this.cmdResponse = cmdResponse;
        this._exit = _exit;
        this.commandCallBackPool = new Map();
        this.CoNETConnectReady = false;
        this.connectStage = -1;
        this.alreadyExit = false;
        this.ignorePingTimeout = false;
        saveLog(`=====================================  new CoNET connect() doNetSendConnectMail = [${doNetSendConnectMail}]\n`, true);
        this.newMail = (ret) => {
            //		have not requestSerial that may from system infomation
            if (!ret.requestSerial) {
                return this.cmdResponse(ret);
            }
            const poolData = this.commandCallBackPool.get(ret.requestSerial);
            if (!poolData || typeof poolData.CallBack !== 'function') {
                return saveLog(`QTGateAPIRequestCommand got commandCallBackPool ret.requestSerial [${ret.requestSerial}] have not callback `);
            }
            clearTimeout(poolData.timeout);
            return poolData.CallBack(null, ret);
        };
        this.on('wImapReady', () => {
            console.log('on imapReady !');
            this.connectStage = 1;
            return this.sockerServer.emit('tryConnectCoNETStage', null, 1);
        });
        this.on('ready', () => {
            this.ignorePingTimeout = false;
            this.CoNETConnectReady = true;
            saveLog('Connected CoNET!', true);
            this.connectStage = 4;
            this.sockerServer.emit('tryConnectCoNETStage', null, 4, cmdResponse ? false : true);
            return this.sendFeedback();
        });
        this.on('pingTimeOut', () => {
            if (this.ignorePingTimeout) {
                return saveLog(`coNETConnect on pingTimeOut this.ignorePingTimeout = true, do nothing!`, true);
            }
            return this.destroy();
        });
        this.ignorePingTimeout = doNetSendConnectMail;
        this.sockerServer.emit('tryConnectCoNETStage', null, this.connectStage = 0);
    }
    sendFeedback() {
        return;
    }
    checkConnect(CallBack) {
        if (this.wImap && this.wImap.imapStream && this.wImap.imapStream.writable &&
            this.rImap && this.rImap.imapStream && this.rImap.imapStream.readable) {
            if (this.needPing) {
                this.once('ready', () => {
                    console.log(`wImap && rImap looks good, doing PING get ready!`);
                    return CallBack();
                });
                this.Ping();
                return console.log(`doing wait ping ready!`);
            }
            //		donot need ping send signal ready!
            this.connectStage = 4;
            this.sockerServer.emit('tryConnectCoNETStage', null, 4, this.cmdResponse ? false : true);
            return CallBack();
        }
        console.log(`checkConnect need destroy `);
        if (this.wImap && this.wImap.imapStream && this.wImap.imapStream.writable) {
            console.log(`checkConnect this.wImap GOOD! `);
        }
        else {
            console.log(`checkConnect this.rImap GOOD! `);
        }
        this.destroy(3);
        return CallBack(new Error('checkConnect no connect!'));
    }
    exit1(err) {
        if (!this.alreadyExit) {
            this.alreadyExit = true;
            console.log(`CoNETConnect class exit1 doing this._exit()`);
            return this._exit(err);
        }
        console.log(`exit1 cancel already Exit [${err}]`);
    }
    requestCoNET(command, CallBack) {
        command.requestTimes = command.requestTimes || 0;
        command.requestTimes++;
        if (command.requestTimes > 3) {
            saveLog(`request command [${command.command}] did too many times!`, true);
            return CallBack(new Error(`CoNET looks offline!`));
        }
        Async.waterfall([
            next => Tool.myIpServer(next),
            (ip, next) => this.checkConnect(next),
            next => {
                saveLog(`request command [${command.command}] requestSerial [${command.requestSerial}]`, true);
                if (command.requestSerial) {
                    const poolData = {
                        CallBack: CallBack,
                        timeout: setTimeout(() => {
                            saveLog(`request command [${command.command}] timeout! do again`, true);
                            this.commandCallBackPool.delete(command.requestSerial);
                            return this.requestCoNET(command, CallBack);
                        }, requestTimeOut)
                    };
                    this.commandCallBackPool.set(command.requestSerial, poolData);
                }
                return Tool.encryptMessage(this.openKeyOption, JSON.stringify(command), next);
            },
            (data, next) => this.trySendToRemote(Buffer.from(data), next)
        ], (err) => {
            if (err) {
                saveLog(`request got error [${err.message ? err.message : null}]`, true);
                this.commandCallBackPool.delete(command.requestSerial);
                if (typeof err.message === 'string') {
                    switch (err.message) {
                        case 'no network': {
                            return this.sockerServer.emit('tryConnectCoNETStage', 0);
                        }
                        default: {
                            return this.sockerServer.emit('tryConnectCoNETStage', 5);
                        }
                    }
                }
                return CallBack(err);
            }
            console.log(`request success!`);
        });
    }
    tryConnect1() {
        this.connectStage = 1;
        this.sockerServer.emit('tryConnectCoNETStage', null, this.connectStage = 1);
        return Tool.myIpServer((err, localIpAddress) => {
            if (err) {
                console.log(`Tool.myIpServer callback error`, err);
                this.connectStage = 0;
                return this.sockerServer.emit('tryConnectCoNETStage', 0);
            }
            console.log(`tryConnect success Tool.myIpServer [${localIpAddress}]`, true);
            if (this.doNetSendConnectMail) {
                //	 wait long time to get response from CoNET
                console.log(`this.doNetSendConnectMail = true`);
            }
            console.log(`doing checkConnect `);
            return this.checkConnect(err => {
                console.log(`tryConnect1 success!`);
                if (err) {
                    return this.exit1(err);
                }
            });
        });
    }
}
exports.default = default_1;
