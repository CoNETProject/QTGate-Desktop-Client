"use strict";
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
const requestTimeOut = 1000 * 60;
class default_1 extends Imap.imapPeer {
    constructor(imapData, sockerServer, openKeyOption, doNetSendConnectMail, cmdResponse, _exit) {
        super(imapData, imapData.clientFolder, imapData.serverFolder, (encryptText, CallBack) => {
            return Tool.encryptMessage(openKeyOption, encryptText, CallBack);
        }, (decryptText, CallBack) => {
            return Tool.decryptoMessage(openKeyOption, decryptText, CallBack);
        }, err => {
            return this.exit1(err);
        });
        this.imapData = imapData;
        this.sockerServer = sockerServer;
        this.openKeyOption = openKeyOption;
        this.doNetSendConnectMail = doNetSendConnectMail;
        this.cmdResponse = cmdResponse;
        this._exit = _exit;
        this.CoNETConnectReady = false;
        this.connectStage = -1;
        this.alreadyExit = false;
        this.ignorePingTimeout = false;
        saveLog(`=====================================  new CoNET connect() doNetSendConnectMail = [${doNetSendConnectMail}]\n`, true);
        this.newMail = (mail, hashCode) => {
            return this.cmdResponse(mail, hashCode);
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
            this.sockerServer.emit('systemErr', 'connectedToCoNET');
            return;
        });
        this.on('pingTimeOut', () => {
            if (this.ignorePingTimeout) {
                return saveLog(`coNETConnect on pingTimeOut this.ignorePingTimeout = true, do nothing!`, true);
            }
            return this.destroy();
        });
        this.ignorePingTimeout = doNetSendConnectMail;
        this.sockerServer.emit('tryConnectCoNETStage', null, this.connectStage = 0);
        this.sockerServer.emit('systemErr', 'connectingToCoNET');
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
            console.log(`CoNETConnect class exit1 doing this._exit() success!`);
            return this._exit(err);
        }
        console.log(`exit1 cancel already Exit [${err}]`);
    }
    requestCoNET_v1(uuid, text, CallBack) {
        const self = this;
        return Async.waterfall([
            next => self.checkConnect(next),
            next => {
                return self.trySendToRemote(Buffer.from(text), uuid, next);
            }
        ], (err) => {
            if (err) {
                saveLog(`requestCoNET_v1 got error [${err.message ? err.message : null}]`);
                if (typeof err.message === 'string') {
                    switch (err.message) {
                        case 'no network': {
                            return self.sockerServer.emit('tryConnectCoNETStage', 0);
                        }
                        default: {
                            return self.sockerServer.emit('tryConnectCoNETStage', 5);
                        }
                    }
                }
                return CallBack(err);
            }
            CallBack();
        });
    }
    tryConnect1() {
        this.connectStage = 1;
        this.sockerServer.emit('tryConnectCoNETStage', null, this.connectStage = 1);
        if (this.doNetSendConnectMail) {
            //	 wait long time to get response from CoNET
            console.log(`this.doNetSendConnectMail = true`);
        }
        console.log(`doing checkConnect `);
        return this.checkConnect(err => {
            if (err) {
                return this.exit1(err);
            }
        });
    }
    getFile(fileName, CallBack) {
        let callback = false;
        if (this.alreadyExit) {
            return CallBack(new Error('alreadyExit'));
        }
        const rImap = new Imap.qtGateImapRead(this.imapData, fileName, true, mail => {
            const attr = Imap.getMailAttached(mail);
            console.log(`====================================>\n\nImap.imapPeer getFile return new mail ==> [${mail.length}] attr ==> [${attr.length}]\n\n`);
            CallBack(null, attr);
            callback = true;
            return rImap.destroyAll(null);
        });
        rImap.once('error', err => {
            if (!callback) {
                return CallBack(err);
            }
        });
        rImap.once('end', () => {
            return console.log(`Connect Class GetFile_rImap on end!`);
        });
    }
}
exports.default = default_1;
