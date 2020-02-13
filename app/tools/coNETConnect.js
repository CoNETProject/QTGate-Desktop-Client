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
    constructor(imapData, sockerServer, sentConnectMail, nodeEmailAddress, openKeyOption, publicKey, cmdResponse, _exit) {
        super(imapData, imapData.clientFolder, imapData.serverFolder, err => {
            console.debug(`imapPeer doing exit! err =`, err);
            this.sockerServer.emit('tryConnectCoNETStage', null, -2);
            return this.exit1(err);
        });
        this.imapData = imapData;
        this.sockerServer = sockerServer;
        this.sentConnectMail = sentConnectMail;
        this.nodeEmailAddress = nodeEmailAddress;
        this.openKeyOption = openKeyOption;
        this.publicKey = publicKey;
        this.cmdResponse = cmdResponse;
        this._exit = _exit;
        this.CoNETConnectReady = false;
        this.connectStage = -1;
        this.alreadyExit = false;
        this.timeoutWaitAfterSentrequestMail = null;
        saveLog(`=====================================  new CoNET connect()`, true);
        this.sockerServer.emit('tryConnectCoNETStage', null, 5);
        this.newMail = (mail, hashCode) => {
            return this.cmdResponse(mail, hashCode);
        };
        this.on('CoNETConnected', publicKey => {
            this.CoNETConnectReady = true;
            this.sentConnectMail = false;
            saveLog('Connected CoNET!', true);
            //console.log ( publicKey )
            clearTimeout(this.timeoutWaitAfterSentrequestMail);
            this.connectStage = 4;
            this.sockerServer.emit('tryConnectCoNETStage', null, 4, publicKey);
            return;
        });
        this.on('pingTimeOut', () => {
            console.log(`class CoNETConnect on pingTimeOut`);
            if (this.sentConnectMail) {
                return;
            }
            this.sentConnectMail = true;
            this.sockerServer.emit('tryConnectCoNETStage', null, 3);
            return this.sendRequestMail();
        });
        this.on('ping', () => {
            this.sockerServer.emit('tryConnectCoNETStage', null, 1);
            this.sockerServer.emit('tryConnectCoNETStage', null, 2);
            if (sentConnectMail) {
                console.log(`CoNETConnect class sentConnectMail = true`);
                this.sockerServer.emit('tryConnectCoNETStage', null, 3);
                return this.sendRequestMail();
            }
        });
    }
    exit1(err) {
        console.trace(`imapPeer doing exit! this.sockerServer.emit ( 'tryConnectCoNETStage', null, -1 )`);
        this.sockerServer.emit('tryConnectCoNETStage', null, -1);
        if (!this.alreadyExit) {
            this.alreadyExit = true;
            console.log(`CoNETConnect class exit1 doing this._exit() success!`);
            return this._exit(err);
        }
        console.log(`exit1 cancel already Exit [${err}]`);
    }
    setTimeWaitAfterSentrequestMail() {
        this.timeoutWaitAfterSentrequestMail = setTimeout(() => {
            return this.sockerServer.emit('tryConnectCoNETStage', null, 0);
        }, 1000 * 60 * 1.5);
    }
    sendRequestMail() {
        return Tool.sendCoNETConnectRequestEmail(this.imapData, this.openKeyOption, this.publicKey, this.nodeEmailAddress, (err) => {
            if (err) {
                return console.log(`Imap.imapPeer sentConnectMail got Error!`);
            }
            this.setTimeWaitAfterSentrequestMail();
        });
    }
    requestCoNET_v1(uuid, text, CallBack) {
        return this.sendDataToANewUuidFolder(Buffer.from(text).toString('base64'), this.imapData.serverFolder, uuid, CallBack);
    }
    getFile(fileName, CallBack) {
        let callback = false;
        if (this.alreadyExit) {
            return CallBack(new Error('alreadyExit'));
        }
        const rImap = new Imap.qtGateImapRead(this.imapData, fileName, true, mail => {
            const attr = Imap.getMailAttached(mail);
            CallBack(null, attr);
            callback = true;
            return rImap.logout();
        });
        rImap.once('error', err => {
            rImap.destroyAll(null);
            return this.getFile(fileName, CallBack);
        });
        rImap.once('end', () => {
            return console.log(`Connect Class GetFile_rImap on end!`);
        });
    }
}
exports.default = default_1;
