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
/// 
const Net = require("net");
const Tls = require("tls");
const Stream = require("stream");
const Event = require("events");
const Uuid = require("node-uuid");
const Async = require("async");
const Crypto = require("crypto");
const Util = require("util");
const path_1 = require("path");
const timers_1 = require("timers");
const buffer_1 = require("buffer");
const Fs = require("fs");
const Tool = require("./initSystem");
const Upload = require("./uploadFile");
const MAX_INT = 9007199254740992;
const debug = false;
const pingFailureTime = 1000 * 60;
const ErrorLogFile = path_1.join(Tool.QTGateFolder, 'imap.log');
const ErrorLogFileStream = path_1.join(Tool.QTGateFolder, 'imapStream.log');
let flag = 'w';
const saveLog = (log, _console = true) => {
    const Fs = require('fs');
    const data = `${new Date().toUTCString()}: ${log}\r\n`;
    _console ? console.log(data) : null;
    Fs.appendFile(ErrorLogFile, data, { flag: flag }, err => {
        flag = 'a';
    });
};
const debugOut = (text, isIn, serialID) => {
    const log = `【${new Date().toISOString()}】【${serialID}】${isIn ? '<=' : '=>'} 【${text}】`;
    saveLog(log);
};
const idleInterval = 1000 * 60; // 3 mins
const noopInterval = 1000;
const socketTimeOut = 1000 * 5;
class ImapServerSwitchStream extends Stream.Transform {
    constructor(imapServer, exitWithDeleteBox, debug) {
        super();
        this.imapServer = imapServer;
        this.exitWithDeleteBox = exitWithDeleteBox;
        this.debug = debug;
        this._buffer = buffer_1.Buffer.alloc(0);
        this.Tag = null;
        this.cmd = null;
        this.callback = false;
        this.doCommandCallback = null;
        this._login = false;
        this.first = true;
        this.idleCallBack = null;
        this.isWaitLogout = false;
        this.waitLogoutCallBack = null;
        this._newMailChunk = buffer_1.Buffer.alloc(0);
        this.idleResponsrTime = null;
        this.canDoLogout = false;
        this.ready = false;
        this.appendWaitResponsrTimeOut = null;
        this.runningCommand = null;
        //private nextRead = true
        this.idleNextStop = null;
        this.reNewCount = 0;
        this.isImapUserLoginSuccess = false;
        this.waitingDoingIdleStop = false;
    }
    commandProcess(text, cmdArray, next, callback) { }
    serverCommandError(err, CallBack) {
        this.imapServer.emit('error', err);
        if (CallBack)
            CallBack(err);
    }
    idleStop() {
        if (!this.imapServer.idleSupport || this.runningCommand !== 'idle' || this.waitingDoingIdleStop) {
            return; //saveLog ( `[${ this.imapServer.imapSerialID }]idleStop() skep! ! this.imapServer.idleSupport || this.runningCommand !== 'idle' = [ true ]`)
        }
        this.waitingDoingIdleStop = true;
        timers_1.clearTimeout(this.idleNextStop);
        timers_1.clearTimeout(this.idleResponsrTime);
        this.cmd = this.runningCommand = `DONE`;
        const cc = Crypto.randomBytes(10).toString('base64');
        this.debug ? debugOut(this.cmd + `【${cc}】`, false, this.imapServer.imapSerialID) : null;
        if (this.writable) {
            this.idleResponsrTime = timers_1.setTimeout(() => {
                console.log(`【${new Date().toISOString()}】[${cc}]====================[ IDLE DONE time out ]`);
                this.imapServer.destroyAll(null);
            }, 30000);
            return this.push(this.cmd + '\r\n');
        }
        return this.imapServer.destroyAll(null);
    }
    doCapability(capability) {
        this.imapServer.serverSupportTag = capability;
        this.imapServer.idleSupport = /IDLE/i.test(capability);
        this.imapServer.condStoreSupport = /CONDSTORE/i.test(capability);
        this.imapServer.literalPlus = /LITERAL\+/i.test(capability);
        const ii = /X\-GM\-EXT\-1/i.test(capability);
        const ii1 = /CONDSTORE/i.test(capability);
        const listenFolder = this.imapServer.listenFolder;
        return this.imapServer.fetchAddCom = `(${ii ? 'X-GM-THRID X-GM-MSGID X-GM-LABELS ' : ''}${ii1 ? 'MODSEQ ' : ''}BODY[])`;
    }
    preProcessCommane(commandLine, _next, callback) {
        const cmdArray = commandLine.split(' ');
        this.debug ? debugOut(`${commandLine}`, true, this.imapServer.imapSerialID) : null;
        if (this._login) {
            switch (commandLine[0]) {
                case '+': /////       +
                case '*': { /////       *
                    return this.commandProcess(commandLine, cmdArray, _next, callback);
                }
                case 'I': //  IDLE
                case 'D': //  NODE
                case 'N': //  NOOP
                case 'A': { /////       A
                    timers_1.clearTimeout(this.appendWaitResponsrTimeOut);
                    timers_1.clearTimeout(this.idleResponsrTime);
                    this.runningCommand = false;
                    if (this.Tag !== cmdArray[0]) {
                        return this.serverCommandError(new Error(`this.Tag[${this.Tag}] !== cmdArray[0] [${cmdArray[0]}]\ncommandLine[${commandLine}]`), callback);
                    }
                    if (/^ok$/i.test(cmdArray[1])) {
                        if (/^IDLE$/i.test(cmdArray[0]))
                            timers_1.clearTimeout(this.idleResponsrTime);
                        this.doCommandCallback(null, commandLine);
                        return callback();
                    }
                    const errs = cmdArray.slice(2).join(' ');
                    this.doCommandCallback(new Error(errs));
                    return callback();
                }
                default:
                    return this.serverCommandError(new Error(`_commandPreProcess got switch default error!`), callback);
            }
        }
        return this.login(commandLine, cmdArray, _next, callback);
    }
    checkFetchEnd() {
        if (this._buffer.length <= this.imapServer.fetching) {
            return null;
        }
        const body = this._buffer.slice(0, this.imapServer.fetching);
        const uu = this._buffer.slice(this.imapServer.fetching);
        let index1 = uu.indexOf('\r\n* ');
        let index = uu.indexOf('\r\nA');
        index = index < 0 || index1 > 0 && index > index1 ? index1 : index;
        if (index < 0)
            return null;
        this._buffer = uu.slice(index + 2);
        this.imapServer.fetching = null;
        return body;
    }
    _transform(chunk, encoding, next) {
        this.callback = false;
        //console.log ('************************************** ImapServerSwitchStream _transform chunk **************************************')
        //console.log ( chunk.toString ())
        //console.log ('************************************** ImapServerSwitchStream _transform chunk **************************************')
        this._buffer = buffer_1.Buffer.concat([this._buffer, chunk]);
        const doLine = () => {
            const __CallBack = () => {
                let index = -1;
                if (!this._buffer.length || (index = this._buffer.indexOf('\r\n')) < 0) {
                    if (!this.callback) {
                        //      this is for IDLE do DONE command
                        //this.emit ( 'hold' )
                        this.callback = true;
                        return next();
                    }
                    //      did next with other function
                    return;
                }
                const _buf = this._buffer.slice(0, index);
                if (_buf.length) {
                    return this.preProcessCommane(_buf.toString(), next, () => {
                        this._buffer = this._buffer.slice(index + 2);
                        return doLine();
                    });
                }
                if (!this.callback) {
                    this.callback = true;
                    return next();
                }
                return;
            };
            if (this.imapServer.fetching) {
                //console.log ('************************************** ImapServerSwitchStream _transform chunk **************************************')
                //console.log ( this._buffer.toString ())
                //console.log ('************************************** ImapServerSwitchStream _transform chunk **************************************')
                const _buf1 = this.checkFetchEnd();
                //  have no fill body get next chunk
                if (!_buf1) {
                    if (!this.callback) {
                        this.callback = true;
                        return next();
                    }
                    return;
                }
                /*
                console.log ('************************************** ImapServerSwitchStream _transform chunk **************************************')
                console.log ( _buf1.length )
                console.log ( _buf1.toString ())
                */
                this.imapServer.newMail(_buf1);
            }
            return __CallBack();
        };
        return doLine();
    }
    capability() {
        this.doCommandCallback = (err) => {
            if (this.imapServer.listenFolder) {
                return this.createBox(true, this.imapServer.listenFolder, (err, newMail) => {
                    if (err) {
                        console.log(`========================= [${this.imapServer.imapSerialID}] openBox Error do this.end ()`, err);
                        return this.imapServer.destroyAll(err);
                    }
                    /*
                    if ( this.isWaitLogout ) {
                        console.log (`capability this.waitLogout = true doing logout_process ()`)
                        return this.logout_process ( this.waitLogoutCallBack )
                    }
                    */
                    if (/^inbox$/i.test(this.imapServer.listenFolder)) {
                        console.log(`capability open inbox !`);
                        this.canDoLogout = this.ready = true;
                        return this.imapServer.emit('ready');
                    }
                    if (newMail && typeof this.imapServer.newMail === 'function') {
                        this.imapServer.emit('ready');
                        //console.log (`[${ this.imapServer.imapSerialID }]capability doing newMail = true`)
                        return this.doNewMail();
                    }
                    if (typeof this.imapServer.newMail === 'function') {
                        this.idleNoop();
                    }
                    this.canDoLogout = this.ready = true;
                    this.imapServer.emit('ready');
                });
            }
            this.canDoLogout = this.ready = true;
            this.imapServer.emit('ready');
        };
        this.commandProcess = (text, cmdArray, next, callback) => {
            switch (cmdArray[0]) {
                case '*': { /////       *
                    //          check imap server is login ok
                    if (/^CAPABILITY$/i.test(cmdArray[1]) && cmdArray.length > 2) {
                        const kkk = cmdArray.slice(2).join(' ');
                        this.doCapability(kkk);
                    }
                    return callback();
                }
                default:
                    return callback();
            }
        };
        this.Tag = `A${this.imapServer.TagCount1()}`;
        this.cmd = `${this.Tag} CAPABILITY`;
        this.debug ? debugOut(this.cmd, false, this.imapServer.imapSerialID) : null;
        if (this.writable)
            return this.push(this.cmd + '\r\n');
        return this.imapServer.destroyAll(null);
    }
    doNewMail() {
        this.reNewCount--;
        this.canDoLogout = false;
        this.runningCommand = 'doNewMail';
        this.seachUnseen((err, newMailIds, havemore) => {
            if (err) {
                return this.imapServer.destroyAll(err);
            }
            if (!newMailIds || !newMailIds.length) {
                this.runningCommand = null;
                return this.idleNoop();
            }
            let haveMoreNewMail = false;
            return Async.waterfall([
                next => this.fetch(newMailIds, next),
                (_moreNew, next) => {
                    haveMoreNewMail = _moreNew;
                    return this.flagsDeleted(newMailIds, next);
                },
                next => {
                    return this.expunge(next);
                }
            ], (err, newMail) => {
                this.runningCommand = null;
                if (err) {
                    saveLog(`ImapServerSwitchStream [${this.imapServer.imapSerialID}] doNewMail ERROR! [${err.message}]`);
                    return this.imapServer.destroyAll(err);
                }
                if (haveMoreNewMail || havemore || newMail) {
                    return this.doNewMail();
                }
                return this.idleNoop();
            });
        });
    }
    checkLogout(CallBack) {
        if (!this.isWaitLogout) {
            //console.log (`[${ this.imapServer.imapSerialID }] checkLogout have not waiting logout`)
            return CallBack();
        }
        const _callBack = () => {
            if (this.exitWithDeleteBox) {
                return this.deleteBox(() => {
                    return this.logout_process(CallBack);
                });
            }
            return this.logout_process(CallBack);
        };
        if (!this.canDoLogout) {
            this.isWaitLogout = true;
            this.idleCallBack = _callBack;
            return; //console.trace (`[${ this.imapServer.imapSerialID }] checkLogout canDoLogout = false, set this.isWaitLogout = true &&  this.idleCallBack = CallBack`)
        }
        return _callBack();
    }
    idleNoop() {
        if (this.isWaitLogout) {
            if (this.idleCallBack && typeof this.idleCallBack === 'function') {
                return this.idleCallBack();
            }
            return console.log(`idleNoop have this.isWaitLogout but have not this.idleCallBack ${typeof this.idleCallBack}`);
        }
        this.canDoLogout = true;
        let newSwitchRet = false;
        this.runningCommand = 'idle';
        if (!this.ready) {
            this.ready = true;
            this.imapServer.emit('ready');
        }
        this.doCommandCallback = (err => {
            if (err) {
                return this.imapServer.destroyAll(null);
            }
            this.waitingDoingIdleStop = false;
            this.runningCommand = null;
            if (this.idleCallBack) {
                this.idleCallBack();
                return this.idleCallBack = null;
            }
            //console.log(`IDLE DONE newSwitchRet = [${newSwitchRet}] nextRead = [${this.nextRead}]`)
            if (newSwitchRet || this.reNewCount > 0) {
                return this.doNewMail();
            }
            if (this.imapServer.idleSupport) {
                return this.idleNoop();
            }
            timers_1.setTimeout(() => {
                return this.idleNoop();
            }, noopInterval);
        });
        this.idleNextStop = this.imapServer.idleSupport
            ? timers_1.setTimeout(() => {
                this.idleStop();
            }, idleInterval)
            : null;
        this.commandProcess = (text, cmdArray, next, callback) => {
            switch (cmdArray[0]) {
                case '+':
                case '*': {
                    timers_1.clearTimeout(this.idleResponsrTime);
                    if (/^RECENT$|^FETCH$|^EXISTS$/i.test(cmdArray[2])) {
                        if (parseInt(cmdArray[1])) {
                            newSwitchRet = true;
                            if (!this.callback) {
                                this.callback = true;
                                next();
                            }
                            this.idleStop();
                            /*
                            if ( this.nextRead ) {
                                clearTimeout(idleNoopTime)
                                return this.idleStop()
                            }
                                
                            console.log(`idle got RECENT, but this.nextRead === false [${this.nextRead}]`)
                            */
                        }
                        return callback();
                    }
                    if (this.isWaitLogout) {
                        this.idleStop();
                    }
                    return callback();
                }
                default:
                    return callback();
            }
        };
        const name = this.imapServer.idleSupport ? 'IDLE' : 'NOOP';
        this.Tag = `${name}`;
        this.cmd = `${name} ${name}`;
        this.debug ? debugOut(this.cmd, false, this.imapServer.imapSerialID) : null;
        if (this.writable) {
            this.idleResponsrTime = timers_1.setTimeout(() => {
                console.log(`【${new Date().toISOString()}】====================[ do IDLE time out ]`);
                this.imapServer.destroyAll(null);
            }, 10000);
            return this.push(this.cmd + '\r\n');
        }
        return this.imapServer.destroyAll(null);
    }
    login(text, cmdArray, next, _callback) {
        this.doCommandCallback = (err) => {
            if (!err) {
                this.isImapUserLoginSuccess = true;
                return this.capability();
            }
            return this.imapServer.destroyAll(err);
        };
        this.commandProcess = (text, cmdArray, next, callback) => {
            switch (cmdArray[0]) {
                case '+':
                case '*': {
                    return callback();
                }
                default:
                    return callback();
            }
        };
        switch (cmdArray[0]) {
            case '*': { /////       *
                //          check imap server is login ok
                if (/^ok$/i.test(cmdArray[1]) && this.first) {
                    this.first = false;
                    this.Tag = `A${this.imapServer.TagCount1()}`;
                    this.cmd = `${this.Tag} LOGIN "${this.imapServer.IMapConnect.imapUserName}" "${this.imapServer.IMapConnect.imapUserPassword}"`;
                    this.debug ? debugOut(this.cmd, false, this.imapServer.imapSerialID) : null;
                    this.callback = this._login = true;
                    if (this.writable) {
                        return next(null, this.cmd + '\r\n');
                    }
                    this.imapServer.destroyAll(null);
                }
                //
                return _callback();
            }
            default:
                return this.serverCommandError(new Error(`login switch default ERROR!`), _callback);
        }
    }
    createBox(openBox, folderName, CallBack) {
        this.doCommandCallback = (err) => {
            if (err) {
                if (err.message && !/exists/i.test(err.message)) {
                    return CallBack(err);
                }
            }
            if (openBox) {
                return this.openBox(CallBack);
            }
            return CallBack();
        };
        this.commandProcess = (text, cmdArray, next, callback) => {
            return callback();
        };
        this.Tag = `A${this.imapServer.TagCount1()}`;
        this.cmd = `${this.Tag} CREATE "${folderName}"`;
        this.debug ? debugOut(this.cmd, false, this.imapServer.imapSerialID) : null;
        if (this.writable) {
            return this.push(this.cmd + '\r\n');
        }
        return this.imapServer.destroyAll(null);
    }
    openBox(CallBack) {
        let newSwitchRet = false;
        this.doCommandCallback = (err) => {
            if (err) {
                return this.createBox(true, this.imapServer.listenFolder, CallBack);
            }
            CallBack(null, newSwitchRet);
        };
        this.commandProcess = (text, cmdArray, next, _callback) => {
            switch (cmdArray[0]) {
                case '*': {
                    if (/^EXISTS$/i.test(cmdArray[2])) {
                        if (parseInt(cmdArray[1])) {
                            newSwitchRet = true;
                        }
                    }
                    return _callback();
                }
                default:
                    return _callback();
            }
        };
        const conText = this.imapServer.condStoreSupport ? ' (CONDSTORE)' : '';
        this.Tag = `A${this.imapServer.TagCount1()}`;
        this.cmd = `${this.Tag} SELECT "${this.imapServer.listenFolder}"${conText}`;
        this.debug ? debugOut(this.cmd, false, this.imapServer.imapSerialID) : null;
        if (this.writable)
            return this.push(this.cmd + '\r\n');
        this.imapServer.destroyAll(null);
    }
    _logout(CallBack) {
        //console.trace (`doing _logout typeof CallBack = [${ typeof CallBack }]`)
        if (!this.isImapUserLoginSuccess) {
            return CallBack();
        }
        this.doCommandCallback = (err, info) => {
            console.trace(`_logout doin doCommandCallback `, err, info, typeof CallBack);
            return CallBack();
        };
        timers_1.clearTimeout(this.idleResponsrTime);
        this.commandProcess = (text, cmdArray, next, _callback) => {
            //console.log (`_logout doing this.commandProcess `)
            this.isImapUserLoginSuccess = false;
            return _callback();
        };
        this.Tag = `A${this.imapServer.TagCount1()}`;
        this.cmd = `${this.Tag} LOGOUT`;
        this.debug ? debugOut(this.cmd, false, this.imapServer.imapSerialID) : null;
        if (this.writable) {
            return this.push(this.cmd + '\r\n');
        }
        if (CallBack && typeof CallBack === 'function') {
            return CallBack();
        }
    }
    append(text, CallBack) {
        //console.log (`[${ this.imapServer.imapSerialID }] ImapServerSwitchStream append => [${ text.length }]`)
        this.canDoLogout = false;
        this.doCommandCallback = (err, info) => {
            this.canDoLogout = true;
            //console.log (`[${ this.imapServer.imapSerialID }] ImapServerSwitchStream doCommandCallback `)
            this.checkLogout(() => {
                //console.log (`[${ this.imapServer.imapSerialID }] ImapServerSwitchStream CallBack `)
                CallBack(err, info);
            });
        };
        let out = `Content-Type: application/octet-stream\r\nContent-Disposition: attachment\r\nMessage-ID:<${Uuid.v4()}@>${this.imapServer.domainName}\r\nContent-Transfer-Encoding: base64\r\nMIME-Version: 1.0\r\n\r\n${text}`;
        this.commandProcess = (text1, cmdArray, next, _callback) => {
            switch (cmdArray[0]) {
                case '*':
                case '+': {
                    if (!this.imapServer.literalPlus && out.length && !this.callback) {
                        console.log(`====> append ! this.imapServer.literalPlus && out.length && ! this.callback = [${!this.imapServer.literalPlus && out.length && !this.callback}]`);
                        this.debug ? debugOut(out, false, this.imapServer.imapSerialID) : null;
                        this.callback = true;
                        next(null, out + '\r\n');
                    }
                    return _callback();
                }
                default:
                    return _callback();
            }
        };
        this.Tag = `A${this.imapServer.TagCount1()}`;
        this.cmd = `APPEND "${this.imapServer.writeFolder}" {${out.length}${this.imapServer.literalPlus ? '+' : ''}}`;
        this.cmd = `${this.Tag} ${this.cmd}`;
        const time = out.length / 1000 + 2000;
        this.debug ? debugOut(this.cmd, false, this.imapServer.imapSerialID) : null;
        if (!this.writable) {
            //console.log (`[${ this.imapServer.imapSerialID }] ImapServerSwitchStream append !this.writable doing imapServer.socket.end ()`)
            return this.imapServer.socket.end();
        }
        this.push(this.cmd + '\r\n');
        this.appendWaitResponsrTimeOut = timers_1.setTimeout(() => {
            console.log(`IMAP append TIMEOUT stop IMAP this.imapServer.socket.end ()`);
            return this.imapServer.socket.end();
            this.imapServer.emit('end');
        }, time);
        //console.log (`*************************************  append time = [${ time }] `)
        if (this.imapServer.literalPlus) {
            console.log(``);
            this.push(out + '\r\n');
            out = null;
        }
    }
    appendStream(readStream, length, CallBack) {
        this.canDoLogout = false;
        this.doCommandCallback = () => {
            this.canDoLogout = true;
            this.checkLogout(CallBack);
        };
        let out = `Content-Type: application/octet-stream\r\nContent-Disposition: attachment\r\nMessage-ID:<${Uuid.v4()}@>${this.imapServer.domainName}\r\nContent-Transfer-Encoding: base64\r\nMIME-Version: 1.0\r\n\r\n`;
        this.commandProcess = (text1, cmdArray, next, _callback) => {
            switch (cmdArray[0]) {
                case '*':
                case '+': {
                    if (!this.imapServer.literalPlus && out.length && !this.callback) {
                        this.debug ? debugOut(out, false, this.imapServer.imapSerialID) : null;
                        this.callback = true;
                        readStream.once('end', () => {
                            console.log(`========> stream on end!`);
                        });
                        next(null, out);
                        readStream.pipe(this.imapServer.imapStream);
                    }
                    return _callback();
                }
                default:
                    return _callback();
            }
        };
        const _length = out.length + length;
        this.Tag = `A${this.imapServer.TagCount1()}`;
        this.cmd = `APPEND "${this.imapServer.writeFolder}" {${_length}${this.imapServer.literalPlus ? '+' : ''}}`;
        this.cmd = `${this.Tag} ${this.cmd}`;
        const time = out.length / 1000 + 2000;
        this.debug ? debugOut(this.cmd, false, this.imapServer.imapSerialID) : null;
        if (!this.writable)
            return this.imapServer.socket.end();
        this.push(this.cmd + '\r\n');
        this.appendWaitResponsrTimeOut = timers_1.setTimeout(() => {
            return this.imapServer.socket.end();
        }, time);
        //console.log (`*************************************  append time = [${ time }] `)
        if (this.imapServer.literalPlus) {
            readStream.once('end', () => {
                console.log(`========> stream on end!`);
            });
            this.push(out + '\r\n');
            readStream.pipe(this.imapServer.imapStream);
            out = null;
        }
    }
    seachUnseen(callabck) {
        let newSwitchRet = null;
        let moreNew = false;
        this.doCommandCallback = (err) => {
            if (err)
                return callabck(err);
            return callabck(null, newSwitchRet, moreNew);
        };
        this.commandProcess = (text, cmdArray, next, _callback) => {
            switch (cmdArray[0]) {
                case '*': {
                    if (/^SEARCH$/i.test(cmdArray[1])) {
                        const uu1 = cmdArray[2] && cmdArray[2].length > 0 ? parseInt(cmdArray[2]) : 0;
                        if (cmdArray.length > 2 && uu1) {
                            if (!cmdArray[cmdArray.length - 1].length)
                                cmdArray.pop();
                            const uu = cmdArray.slice(2).join(',');
                            if (/\,/.test(uu[uu.length - 1]))
                                uu.substr(0, uu.length - 1);
                            newSwitchRet = uu;
                            moreNew = cmdArray.length > 3;
                        }
                    }
                    return _callback();
                }
                default:
                    return _callback();
            }
        };
        this.Tag = `A${this.imapServer.TagCount1()}`;
        this.cmd = `${this.Tag} UID SEARCH UNSEEN`;
        this.debug ? debugOut(this.cmd, false, this.imapServer.imapSerialID) : null;
        if (this.writable)
            return this.push(this.cmd + '\r\n');
        return this.imapServer.destroyAll(null);
    }
    fetch(fetchNum, callback) {
        this.doCommandCallback = (err) => {
            //console.log (`ImapServerSwitchStream doing doCommandCallback [${ newSwitchRet }]`)
            return callback(err, newSwitchRet);
        };
        let newSwitchRet = false;
        this.commandProcess = (text1, cmdArray, next, _callback) => {
            switch (cmdArray[0]) {
                case '*': {
                    if (/^FETCH$/i.test(cmdArray[2]) && /BODY\[\]/i.test(cmdArray[cmdArray.length - 2])) {
                        const last = cmdArray[cmdArray.length - 1];
                        if (/\{\d+\}/.test(last)) {
                            this.imapServer.fetching = parseInt(last.substr(1, last.length - 2));
                        }
                        return _callback();
                    }
                    if (/^RECENT$/i.test(cmdArray[2]) && parseInt(cmdArray[1]) > 0) {
                        newSwitchRet = true;
                    }
                    return _callback();
                }
                default:
                    return _callback();
            }
        };
        //console.log (`ImapServerSwitchStream doing UID FETCH `)
        this.cmd = `UID FETCH ${fetchNum} ${this.imapServer.fetchAddCom}`;
        this.Tag = `A${this.imapServer.TagCount1()}`;
        this.cmd = `${this.Tag} ${this.cmd}`;
        this.debug ? debugOut(this.cmd, false, this.imapServer.imapSerialID) : null;
        if (this.writable) {
            return this.push(this.cmd + '\r\n');
        }
        return this.imapServer.logout();
    }
    deleteBox(CallBack) {
        this.doCommandCallback = CallBack;
        this.commandProcess = (text1, cmdArray, next, _callback) => {
            return _callback();
        };
        this.cmd = `DELETE "${this.imapServer.listenFolder}"`;
        this.Tag = `A${this.imapServer.TagCount1()}`;
        this.cmd = `${this.Tag} ${this.cmd}`;
        this.debug ? debugOut(this.cmd, false, this.imapServer.imapSerialID) : null;
        if (this.writable)
            return this.push(this.cmd + '\r\n');
        return this.imapServer.destroyAll(null);
    }
    deleteAMailBox(boxName, CallBack) {
        this.doCommandCallback = err => {
            return CallBack(err);
        };
        this.commandProcess = (text1, cmdArray, next, _callback) => {
            return _callback();
        };
        this.cmd = `DELETE "${boxName}"`;
        this.Tag = `A${this.imapServer.TagCount1()}`;
        this.cmd = `${this.Tag} ${this.cmd}`;
        this.debug ? debugOut(this.cmd, false, this.imapServer.imapSerialID) : null;
        if (this.writable)
            return this.push(this.cmd + '\r\n');
        return this.imapServer.destroyAll(null);
    }
    logout(callback) {
        if (this.isWaitLogout) {
            return callback();
        }
        this.isWaitLogout = true;
        this.checkLogout(callback);
    }
    logout_process(callback) {
        //console.trace ('logout')
        if (!this.writable) {
            console.log(`logout_process [! this.writable] run return callback ()`);
            if (callback && typeof callback === 'function') {
                return callback();
            }
        }
        const doLogout = () => {
            return this._logout(callback);
        };
        if (this.imapServer.listenFolder && this.runningCommand) {
            //console.trace ()
            //saveLog  (`logout_process [${ this.imapServer.imapSerialID }] this.imapServer.listenFolder && this.runningCommand = [${ this.runningCommand }]`)
            this.idleCallBack = doLogout;
            return this.idleStop();
        }
        doLogout();
    }
    flagsDeleted(num, CallBack) {
        this.doCommandCallback = err => {
            //saveLog ( `ImapServerSwitchStream this.flagsDeleted [${ this.imapServer.listenFolder }] doing flagsDeleted success! typeof CallBack = [${ typeof CallBack }]`)
            return CallBack(err);
        };
        this.commandProcess = (text1, cmdArray, next, _callback) => {
            return _callback();
        };
        this.cmd = `UID STORE ${num} FLAGS.SILENT (\\Deleted)`;
        this.Tag = `A${this.imapServer.TagCount1()}`;
        this.cmd = `${this.Tag} ${this.cmd}`;
        this.debug ? debugOut(this.cmd, false, this.imapServer.imapSerialID) : null;
        if (this.writable)
            return this.push(this.cmd + '\r\n');
        return this.imapServer.destroyAll(null);
    }
    expunge(CallBack) {
        let newSwitchRet = false;
        this.doCommandCallback = err => {
            return CallBack(err, newSwitchRet);
        };
        this.commandProcess = (text, cmdArray, next, _callback) => {
            switch (cmdArray[0]) {
                case '*': {
                    if (/^RECENT$|^EXPUNGE$/i.test(cmdArray[2]) && parseInt(cmdArray[1]) > 0) {
                        newSwitchRet = true;
                    }
                    return _callback();
                }
                default:
                    return _callback();
            }
        };
        this.Tag = `A${this.imapServer.TagCount1()}`;
        this.cmd = `${this.Tag} EXPUNGE`;
        this.debug ? debugOut(this.cmd, false, this.imapServer.imapSerialID) : null;
        if (this.writable)
            return this.push(this.cmd + '\r\n');
        return this.imapServer.destroyAll(null);
    }
    listAllMailBox(CallBack) {
        let boxes = [];
        this.doCommandCallback = (err) => {
            if (err)
                return CallBack(err);
            return CallBack(null, boxes);
        };
        this.commandProcess = (text, cmdArray, next, _callback) => {
            switch (cmdArray[0]) {
                case '*': {
                    saveLog(`IMAP listAllMailBox this.commandProcess text = [${text}]`);
                    if (/^LIST/i.test(cmdArray[1])) {
                        boxes.push(cmdArray[2] + ',' + cmdArray[4]);
                    }
                    return _callback();
                }
                default:
                    return _callback();
            }
        };
        this.Tag = `A${this.imapServer.TagCount1()}`;
        this.cmd = `${this.Tag} LIST "" "*"`;
        this.debug ? debugOut(this.cmd, false, this.imapServer.imapSerialID) : null;
        if (this.writable)
            return this.push(this.cmd + '\r\n');
        return this.imapServer.destroyAll(null);
    }
}
class qtGateImap extends Event.EventEmitter {
    constructor(IMapConnect, listenFolder, deleteBoxWhenEnd, writeFolder, debug, newMail) {
        super();
        this.IMapConnect = IMapConnect;
        this.listenFolder = listenFolder;
        this.deleteBoxWhenEnd = deleteBoxWhenEnd;
        this.writeFolder = writeFolder;
        this.debug = debug;
        this.newMail = newMail;
        this.imapStream = new ImapServerSwitchStream(this, this.deleteBoxWhenEnd, this.debug);
        this.newSwitchRet = null;
        this.newSwitchError = null;
        this.fetching = null;
        this.tagcount = 0;
        this.domainName = this.IMapConnect.imapUserName.split('@')[1];
        this.serverSupportTag = null;
        this.idleSupport = null;
        this.condStoreSupport = null;
        this.literalPlus = null;
        this.fetchAddCom = '';
        this.imapEnd = false;
        this.imapSerialID = Crypto.createHash('md5').update(this.listenFolder + this.writeFolder).digest('hex').toUpperCase();
        this.port = typeof this.IMapConnect.imapPortNumber === 'object' ? this.IMapConnect.imapPortNumber[0] : this.IMapConnect.imapPortNumber;
        this.connectTimeOut = null;
        //saveLog ( `new qtGateImap imapSerialID [${ this.imapSerialID }] listenFolder [${ this.listenFolder }] writeFolder [${ this.writeFolder }]`, true )
        this.connect();
        this.once(`error`, err => {
            saveLog(`[${this.imapSerialID}] this.on error ${err && err.message ? err.message : null}`);
            this.imapEnd = true;
            this.destroyAll(err);
        });
    }
    TagCount1() {
        if (++this.tagcount < MAX_INT)
            return this.tagcount;
        return this.tagcount = 0;
    }
    connect() {
        const _connect = () => {
            timers_1.clearTimeout(this.connectTimeOut);
            this.socket.pipe(this.imapStream).pipe(this.socket);
        };
        if (!this.IMapConnect.imapSsl) {
            this.socket = Net.createConnection({ port: this.port, host: this.IMapConnect.imapServer }, _connect);
        }
        else {
            this.socket = Tls.connect({ rejectUnauthorized: !this.IMapConnect.imapIgnoreCertificate, host: this.IMapConnect.imapServer, port: this.port }, _connect);
        }
        this.socket.once('error', err => {
            this.destroyAll(err);
        });
        this.socket.once('end', () => {
            this.destroyAll(null);
        });
        this.connectTimeOut = timers_1.setTimeout(() => {
            console.log(`qtGateImap on connect socket tiemout! this.imapStream.end`);
            if (this.socket) {
                if (this.socket.destroy)
                    return this.socket.destroy();
                this.socket.end();
            }
            this.imapStream.end();
        }, socketTimeOut);
    }
    destroyAll(err) {
        this.imapStream.logout(() => {
            this.imapEnd = true;
            if (this.socket && typeof this.socket.end === 'function') {
                this.socket.end();
            }
            this.emit('end', err);
        });
    }
    logout() {
        if (this.imapEnd) {
            return;
        }
        this.imapEnd = true;
        return this.imapStream.logout(() => {
            if (this.socket && typeof this.socket.end === 'function') {
                this.socket.end();
            }
            return this.emit('end');
        });
    }
}
exports.qtGateImap = qtGateImap;
const appendFromFile1 = (imap, fileName, CallBack) => {
    return Fs.stat(fileName, (err, stat) => {
        if (err) {
            saveLog(`[]appendFromFile s.stat got error! [${err.message}]`);
            return CallBack(err);
        }
        imap.canDoLogout = false;
        imap.doCommandCallback = (err, info) => {
            saveLog(`appendFromFile doCommandCallback err [${err}], info [${info}]`);
            imap.canDoLogout = true;
            return imap.checkLogout(() => {
                return CallBack(err, info);
            });
        };
        let readFile = Fs.createReadStream(fileName, { encoding: 'utf8' });
        readFile.once('close', () => {
            saveLog(`appendFromFile readFile.once close! imap.writable [${imap.writable}]`);
            if (imap.writable) {
                return imap.push('\r\n\r\n');
            }
            //imap.resume()
            //return Fs.unlink ( fileName, () => {})
        });
        imap.commandProcess = (text1, cmdArray, _next, _callback) => {
            switch (cmdArray[0]) {
                case '*':
                case '+': {
                    if (!imap.imapServer.literalPlus && readFile && !imap.callback) {
                        imap.callback = true;
                        readFile.on('data', (chunk) => {
                            return _next(chunk);
                        });
                        _next();
                    }
                    return _callback();
                }
                default:
                    return _callback();
            }
        };
        imap.Tag = `A${imap.imapServer.TagCount1()}`;
        imap.cmd = `${imap.Tag} APPEND "${imap.imapServer.writeFolder}" {${stat.size}${imap.imapServer.literalPlus ? '+' : ''}}`;
        const time = stat.size / 1000 + 2000;
        imap.debug ? debugOut(imap.cmd, false, this.imapServer.imapSerialID) : null;
        if (!imap.writable) {
            return imap.imapServer.socket.end();
        }
        imap.push(imap.cmd + '\r\n');
        imap.appendWaitResponsrTimeOut = timers_1.setTimeout(() => {
            return imap.imapServer.socket.end();
        }, time);
        //console.log (`*************************************  append time = [${ time }] `)
        if (imap.imapServer.literalPlus) {
            return readFile.on('data', (chunk) => {
                if (imap.writable) {
                    //saveLog (`appendFromFile append stream length [${ chunk.length }]`)
                    return imap.push(chunk.toString());
                }
                return imap.imapServer.socket.end();
            });
        }
    });
};
class qtGateImapwrite extends qtGateImap {
    constructor(IMapConnect, writeFolder) {
        super(IMapConnect, null, false, writeFolder, debug, null);
        this.canAppend = false;
        this.appendPool = [];
        this.appenfFilesPool = [];
        this.once('ready', () => {
            this.canAppend = true;
        });
    }
    appendFromFile3(fileName, CallBack) {
        if (!this.canAppend) {
            return this.appenfFilesPool.push({
                fileName: fileName,
                CallBack: CallBack
            });
        }
        this.canAppend = false;
        return appendFromFile1(this.imapStream, fileName, err => {
            this.canAppend = true;
            //saveLog ( `qtGateImapwrite appendFromFile CallBack err = [${ err && err.message ? err.message : null }]`)
            CallBack(err);
            if (this.appenfFilesPool.length) {
                const uu = this.appenfFilesPool.shift();
                return this.appendFromFile3(uu.fileName, uu.CallBack);
            }
        });
    }
    append1(text, _callback) {
        return this.imapStream.append(text, _callback);
    }
    ListAllFolders(CallBack) {
        if (!this.canAppend) {
            return CallBack(new Error('not ready!'));
        }
        return this.imapStream.listAllMailBox(CallBack);
    }
    deleteBox(boxName, CallBack) {
        return this.imapStream.deleteAMailBox(boxName, CallBack);
    }
    deleteAllBox(folders, CallBack) {
        const uu = folders.shift();
        if (!uu) {
            return CallBack();
        }
        const uuu = uu.split(',')[1];
        if (!uuu || /\//.test(uuu)) {
            return this.deleteAllBox(folders, CallBack);
        }
        return this.deleteBox(uuu, err1 => {
            if (err1) {
                console.log(uu, uuu);
                console.log(err1);
            }
            return this.deleteAllBox(folders, CallBack);
        });
    }
}
exports.qtGateImapwrite = qtGateImapwrite;
class qtGateImapRead extends qtGateImap {
    constructor(IMapConnect, listenFolder, deleteBoxWhenEnd, newMail) {
        super(IMapConnect, listenFolder, deleteBoxWhenEnd, null, debug, newMail);
        this.openBox = false;
        this.once('ready', () => {
            this.openBox = true;
        });
    }
    fetchAndDelete(Uid, CallBack) {
        if (!this.openBox) {
            return CallBack(new Error('not ready!'));
        }
        return Async.series([
            next => this.imapStream.fetch(Uid, next),
            next => this.imapStream.flagsDeleted(Uid, next),
            next => this.imapStream.expunge(next)
        ], CallBack);
    }
}
exports.qtGateImapRead = qtGateImapRead;
exports.getMailAttached = (email) => {
    const attachmentStart = email.indexOf('\r\n\r\n');
    if (attachmentStart < 0) {
        console.log(`getMailAttached error! can't faind mail attahced start!`);
        return null;
    }
    const attachment = email.slice(attachmentStart + 4);
    return buffer_1.Buffer.from(attachment.toString(), 'base64');
};
exports.getMailAttachedBase64 = (email) => {
    const attachmentStart = email.indexOf('\r\n\r\n');
    if (attachmentStart < 0) {
        console.log(`getMailAttached error! can't faind mail attahced start!`);
        return null;
    }
    const attachment = email.slice(attachmentStart + 4);
    return attachment.toString();
};
exports.imapBasicTest = (IMapConnect, CallBack) => {
    saveLog(`start imapBasicTest imap [${JSON.stringify(IMapConnect)}]`);
    let callbackCall = false;
    let append = false;
    let timeout = null;
    const listenFolder = 'INBOX';
    let getText = false;
    const ramdomText = Crypto.randomBytes(1024 * 100);
    const doCallBack = (err, ret) => {
        if (!callbackCall) {
            callbackCall = true;
            timers_1.clearTimeout(timeout);
            return CallBack(err, ret);
        }
    };
    let wImap = new qtGateImapwrite(IMapConnect, listenFolder);
    const doCatchMail = (id, _CallBack) => {
        let didFatch = false;
        let err = null;
        let rImap = new qtGateImapRead(IMapConnect, listenFolder, false, mail => {
            saveLog(`new mail`);
            const attach = exports.getMailAttached(mail);
            if (!attach) {
                err = new Error(`imapAccountTest ERROR: can't read attachment!`);
            }
            else if (ramdomText.compare(attach) !== 0) {
                err = new Error(`imapAccountTest ERROR: attachment changed!`);
            }
            else {
                getText = true;
            }
        });
        rImap.once('ready', () => {
            rImap.fetchAndDelete(id, _err => {
                didFatch = true;
                if (_err) {
                    err = _err;
                }
                saveLog(`rImap.fetchAndDelete finished by err [${err && err.message ? err.message : null}]`);
                rImap.logout();
                rImap = null;
            });
        });
        rImap.once('end', err => {
            if (!didFatch) {
                saveLog(`doCatchMail rImap.once end but didFatch = false try again!`);
                return doCatchMail(id, _CallBack);
            }
            _CallBack(err, getText);
        });
    };
    wImap.once('ready', () => {
        saveLog(`imapBasicTest wImap.once ( 'ready' )`);
        wImap.append1(ramdomText.toString('base64'), (err, code) => {
            append = true;
            if (err) {
                saveLog(`wImap.append got error [${err.message}]`);
                return doCallBack(err, null);
            }
            if (!code) {
                saveLog(`wImap.append got no append id!`);
                return doCallBack(new Error(`no append id!`), null);
            }
            const uid = code.substring(code.search(/\[/), code.search(/\]/)).split(' ')[2];
            wImap.logout();
            wImap = null;
            doCatchMail(uid, doCallBack);
        });
    });
    wImap.once('end', err => {
        if (!append && !err) {
            saveLog(`imapBasicTest wImap.once ( 'end', err = [${err && err.message ? err.message : 'undefine'}] but !startTime do imapBasicTest again! )`);
            return exports.imapBasicTest(IMapConnect, CallBack);
        }
        return doCallBack(err, null);
    });
    wImap.once('error', err => {
        return doCallBack(err, null);
    });
};
exports.imapAccountTest = (IMapConnect, CallBack) => {
    saveLog(`start test imap [${IMapConnect.imapUserName}]`, true);
    let callbackCall = false;
    let startTime = null;
    let wImap = null;
    const listenFolder = Uuid.v4();
    const ramdomText = Crypto.randomBytes(20);
    let timeout = null;
    const doCallBack = (err, ret) => {
        if (!callbackCall) {
            saveLog(`imapAccountTest doing callback err [${err && err.messgae ? err.messgae : `undefine `}] ret [${ret ? ret : 'undefine'}]`);
            callbackCall = true;
            timers_1.clearTimeout(timeout);
            return CallBack(err, ret);
        }
    };
    let rImap = new qtGateImapRead(IMapConnect, listenFolder, false, mail => {
        rImap.logout();
        rImap = null;
        const attach = exports.getMailAttached(mail);
        saveLog(`test rImap on new mail! `);
        if (!attach) {
            return doCallBack(new Error(`imapAccountTest ERROR: can't read attachment!`), null);
        }
        if (ramdomText.compare(attach) !== 0) {
            return doCallBack(new Error(`imapAccountTest ERROR: attachment changed!`), null);
        }
        return doCallBack(null, new Date().getTime() - startTime);
    });
    rImap.once('ready', () => {
        saveLog(`rImap.once ( 'ready' ) do new qtGateImapwrite`);
        wImap = new qtGateImapwrite(IMapConnect, listenFolder);
        let sendMessage = false;
        wImap.once('ready', () => {
            saveLog(`wImap.once ( 'ready' )`);
            wImap.append1(ramdomText.toString('base64'), err => {
                sendMessage = true;
                wImap.logout();
                wImap = null;
                if (err) {
                    rImap.logout();
                    rImap = null;
                    saveLog(`wImap.append err [${err.message ? err.message : 'none err.message'}]`);
                    return doCallBack(err, null);
                }
                startTime = new Date().getTime();
                timeout = timers_1.setTimeout(() => {
                    if (rImap) {
                        rImap.logout();
                    }
                    if (wImap) {
                        wImap.logout();
                    }
                    saveLog(`imapAccountTest doing timeout`);
                    doCallBack(new Error('timeout'), null);
                }, pingPongTimeOut);
            });
        });
        wImap.once('end', () => {
            if (!sendMessage) {
                rImap.logout();
                rImap = null;
                saveLog(`wImap.once ( 'end') before send message! do imapAccountTest again!`);
                return exports.imapAccountTest(IMapConnect, CallBack);
            }
        });
    });
    rImap.once('end', err => {
        saveLog(`rImap.once ( 'end' ) [${err && err.message ? err.message : 'err = undefine'}]`, true);
        if (!callbackCall && !err) {
            saveLog(`rImap.once ( 'end') before finished test! do imapAccountTest again!`, true);
            return exports.imapAccountTest(IMapConnect, CallBack);
        }
        return doCallBack(err, null);
    });
    rImap.once('error', err => {
        saveLog(`rImap.once ( 'error' ) [${err.message}]`, true);
        return doCallBack(err, null);
    });
};
exports.imapGetMediaFile = (IMapConnect, fileName, CallBack) => {
    let rImap = new qtGateImapRead(IMapConnect, fileName, true, mail => {
        rImap.logout();
        const retText = exports.getMailAttachedBase64(mail);
        return CallBack(null, retText);
    });
};
const pingPongTimeOut = 1000 * 10;
class imapPeer extends Event.EventEmitter {
    constructor(imapData, listenBox, writeBox, enCrypto, deCrypto, exit) {
        super();
        this.imapData = imapData;
        this.listenBox = listenBox;
        this.writeBox = writeBox;
        this.enCrypto = enCrypto;
        this.deCrypto = deCrypto;
        this.exit = exit;
        this.mailPool = [];
        this.domainName = this.imapData.imapUserName.split('@')[1];
        this.waitingReplyTimeOut = null;
        this.pingUuid = null;
        this.doingDestroy = false;
        this.peerReady = false;
        this.readyForSendMail = false;
        this.makeWImap = false;
        this.makeRImap = false;
        this.pingCount = 1;
        this.needPing = false;
        this.needPingTimeOut = null;
        this.rImap = null;
        this.sendMailPool = [];
        this.wImap = null;
        saveLog(`doing peer account [${imapData.imapUserName}] listen with[${listenBox}], write with [${writeBox}] `);
        this.newWriteImap();
    }
    mail(email) {
        const attr = exports.getMailAttached(email).toString();
        return this.deCrypto(attr, (err, data) => {
            if (err) {
                saveLog(email.toString());
                saveLog('******************');
                saveLog(attr);
                saveLog('****************************************');
                return saveLog(`deCrypto GOT ERROR! [${err.message}]`);
            }
            let uu = null;
            try {
                uu = JSON.parse(data);
            }
            catch (ex) {
                return saveLog(`imapPeer mail deCrypto JSON.parse got ERROR [${ex.message}] data=[${Util.inspect(data)}]`, true);
            }
            if (uu.ping && uu.ping.length) {
                saveLog(`GOT PING [${uu.ping}]`, true);
                if (!this.peerReady) {
                    if (/outlook\.com/i.test(this.imapData.imapServer)) {
                        saveLog(`doing outlook server support!`);
                        return timers_1.setTimeout(() => {
                            saveLog(`outlook replyPing ()`, true);
                            this.replyPing(uu);
                            return this.Ping();
                        }, 5000);
                    }
                    this.replyPing(uu);
                    return saveLog(`THIS peerConnect have not ready send ping!`, true);
                }
                return this.replyPing(uu);
            }
            if (uu.pong && uu.pong.length) {
                //saveLog ( `===> new PONG come!`, true )
                if (!this.pingUuid) {
                    return saveLog(`GOT in the past PONG [${uu.pong}]!`, true);
                }
                if (this.pingUuid !== uu.pong) {
                    return saveLog(`GOT unknow PONG [${uu.pong}]!`, true);
                }
                saveLog(`imapPeer connected Clear waitingReplyTimeOut!`, true);
                this.pingUuid = null;
                this.peerReady = true;
                this.pingCount = 0;
                this.needPingTimeOut = timers_1.setTimeout(() => {
                    this.needPing = true;
                }, pingFailureTime);
                timers_1.clearTimeout(this.waitingReplyTimeOut);
                this.sendAllMail();
                return this.emit('ready');
            }
            return this.newMail(uu);
        });
    }
    trySendToRemote(email, CallBack) {
        if (!this.wImap.canAppend) {
            return this.mailPool.push({
                CallBack: CallBack,
                mail: email
            });
        }
        this.wImap.canAppend = false;
        return this.wImap.append1(email.toString('base64'), err => {
            this.wImap.canAppend = true;
            if (err) {
                return this.trySendToRemote(email, CallBack);
            }
            CallBack(err);
            if (this.mailPool.length) {
                const uu = this.mailPool.shift();
                if (uu) {
                    return this.trySendToRemote(uu.mail, uu.CallBack);
                }
            }
        });
    }
    replyPing(uu) {
        return this.encryptAndAppendWImap1(JSON.stringify({ pong: uu.ping }), err => {
            if (err) {
                saveLog(`reply Ping ERROR! [${err.message ? err.message : null}]`);
            }
        });
    }
    encryptAndAppendWImap1(mail, CallBack) {
        if (!this.wImap || this.wImap.imapEnd || !this.wImap.imapStream.writable) {
            const info = `encryptAndAppendWImap error: no wImap`;
            CallBack(new Error(info));
            this.newWriteImap();
            return saveLog(info);
        }
        if (!this.wImap.canAppend) {
            const info = `encryptAndAppendWImap error: canAppend = false`;
            CallBack(new Error(info));
            return saveLog(info);
        }
        this.wImap.canAppend = false;
        return Async.waterfall([
            next => this.enCrypto(mail, next),
            (data, next) => {
                //saveLog (`encryptAndAppendWImap1 doing this.wImap.append1 typeof next = [${ typeof next }]`)
                return this.wImap.append1(buffer_1.Buffer.from(data).toString('base64'), next);
            }
        ], err => {
            //console.log (`encryptAndAppendWImap1 Async.waterfall success`, err )
            this.wImap.canAppend = true;
            return CallBack(err);
        });
    }
    setTimeOutOfPing() {
        timers_1.clearTimeout(this.waitingReplyTimeOut);
        timers_1.clearTimeout(this.needPingTimeOut);
        this.needPing = false;
        //saveLog ( `Make Time Out for a Ping`, true )
        return this.waitingReplyTimeOut = timers_1.setTimeout(() => {
            saveLog(`ON setTimeOutOfPing this.emit ( 'pingTimeOut' ) `, true);
            if (this.pingCount < 3) {
                console.log(`this.ping < 3 do ping again!`);
                return this.Ping();
            }
            console.log(`this.ping > 3 do pingTimeOut`);
            return this.emit('pingTimeOut');
        }, pingPongTimeOut);
    }
    Ping() {
        this.pingUuid = Uuid.v4();
        //saveLog ( `Ping! ${ this.pingUuid }`, true )
        this.pingCount++;
        return this.encryptAndAppendWImap1(JSON.stringify({ ping: this.pingUuid }), err => {
            if (err) {
                if (err.message && /TRYCREATE/i.test(err.message)) {
                    saveLog(`Outlook mail support emit [wFolder]`);
                    timers_1.clearTimeout(this.waitingReplyTimeOut);
                    return this.emit('wFolder');
                }
                if (/no wImap/i.test(err.message)) {
                    return saveLog(`Doing ping got no imap err stop! [${err.message ? err.message : null}]`, true);
                }
                saveLog(`Doing ping got ERROR! try again [${err.message ? err.message : null}]`, true);
                return timers_1.setTimeout(() => {
                    return this.Ping();
                }, 1000);
            }
            return this.setTimeOutOfPing();
        });
    }
    sendAllMail() {
        if (!this.sendMailPool.length || !this.peerReady) {
            return; //saveLog ( `sendAllMail do nothing! sendMailPool.length [${ this.sendMailPool.length }] peerReady [${ this.peerReady }]`)
        }
        const uu = this.sendMailPool.pop();
        if (!uu) {
            saveLog(`sendAllMail this.sendMailPool.pop () got nothing!`);
            return this.sendAllMail();
        }
        return this.trySendToRemote(uu, err => {
            if (err) {
                //      stop send all mail
                return saveLog(`sendAllMail this.trySendToRemote got err! stop[${err.message ? err.message : null}]`);
            }
            return this.sendAllMail();
        });
    }
    newWriteImap() {
        if (this.makeWImap || this.wImap && this.wImap.imapStream && this.wImap.imapStream.writable) {
            return console.log(`newWriteImap this.wImap.imapStream.writable = [${this.wImap.imapStream.writable}] this.makeWImap [${this.makeWImap}]`);
        }
        this.makeWImap = true;
        //saveLog ( `====== > newWriteImap`, true )
        this.wImap = new qtGateImapwrite(this.imapData, this.writeBox);
        this.wImap.once('end', err => {
            console.log(`this.wImap.once end ! [${err && err.message ? err.message : null}]!`, true);
            //return this.destroy ( 1 )
        });
        this.wImap.once('error', err => {
            return this.destroy(1);
        });
        this.wImap.once('ready', () => {
            saveLog(`wImap.once ( 'ready') doing this.makeWImap = false`, true);
            this.makeWImap = false;
            const supportOutlook = () => {
                return this.makeWriteFolder(() => {
                    console.log(`supportOutlook makeWriteFolder callback!`);
                    return this.Ping();
                });
            };
            this.once(`wFolder`, () => {
                this.wImap.destroyAll(null);
                return supportOutlook();
            });
            this.newReadImap();
            return this.Ping();
        });
    }
    newReadImap() {
        if (this.makeRImap || this.rImap && this.rImap.imapStream && this.rImap.imapStream.readable) {
            return saveLog(`newReadImap have rImap.imapStream.readable = true, stop!`, true);
        }
        this.makeRImap = true;
        //saveLog ( `=====> newReadImap!`, true )
        this.rImap = new qtGateImapRead(this.imapData, this.listenBox, false, email => {
            this.mail(email);
        });
        this.rImap.once('ready', () => {
            this.makeRImap = false;
            //saveLog ( `this.rImap.once on ready `)
        });
        this.rImap.once('error', err => {
            this.makeRImap = false;
            saveLog(`rImap on Error [${err.message}]`, true);
            if (err && err.message && /auth|login|log in|Too many simultaneous|UNAVAILABLE/i.test(err.message)) {
                return this.destroy(1);
            }
            if (this.rImap && this.rImap.destroyAll && typeof this.rImap.destroyAll === 'function') {
                return this.rImap.destroyAll(null);
            }
        });
        this.rImap.once('end', err => {
            console.log(`imapPeer rImap on END!`);
            this.rImap = null;
            this.makeRImap = false;
            if (!this.doingDestroy && !err) {
                return this.newReadImap();
            }
            if (typeof this.exit === 'function') {
                this.exit(err);
                return this.exit = null;
            }
        });
    }
    makeWriteFolder(CallBack) {
        let uu = new qtGateImapRead(this.imapData, this.writeBox, false, null);
        uu.once('ready', () => {
            console.log(`makeWriteFolder on ready! `);
            uu.destroyAll(null);
            CallBack();
        });
        uu.once('error', err => {
            saveLog(`makeWriteFolder error! do again!`);
            uu = null;
            return this.makeWriteFolder(CallBack);
        });
        uu.once('end', () => {
            uu = null;
            return CallBack();
        });
    }
    destroy(err) {
        console.trace('destroy');
        timers_1.clearTimeout(this.waitingReplyTimeOut);
        if (this.doingDestroy) {
            console.log(`destroy but this.doingDestroy = ture`);
            return;
        }
        this.doingDestroy = true;
        this.peerReady = false;
        if (this.wImap) {
            this.wImap.logout();
        }
        if (this.rImap) {
            this.rImap.logout();
        }
        if (this.removeAllListeners && typeof this.removeAllListeners === 'function')
            this.removeAllListeners();
        if (this.exit && typeof this.exit === 'function') {
            this.exit(err);
            this.exit = null;
        }
    }
    sendDone() {
        return Async.waterfall([
            next => this.enCrypto(JSON.stringify({ done: new Date().toISOString() }), next),
            (data, next) => this.trySendToRemote(buffer_1.Buffer.from(data), next)
        ], (err) => {
            if (err)
                return saveLog(`sendDone got error [${err.message}]`);
        });
    }
}
exports.imapPeer = imapPeer;
exports.sendMediaData = (imapPeer, mediaData, CallBack) => {
    const writeBox = Uuid.v4();
    let _return = false;
    let _err = null;
    let wImap = new qtGateImapwrite(imapPeer.imapData, writeBox);
    wImap.once('error', err => {
        _err = err;
        wImap.logout();
        if (err.message && /auth|login|log in|Too many simultaneous|UNAVAILABLE/i.test(err.message)) {
            if (!_return) {
                _return = true;
                return CallBack(err);
            }
            return;
        }
        return exports.sendMediaData(imapPeer, mediaData, CallBack);
    });
    wImap.once('end', err => {
        wImap = null;
        //saveLog ( `trySendToRemoteFromFile on end! err = [${ err }]` )
        if (!_return) {
            _return = true;
            return CallBack(_err, writeBox);
        }
    });
    wImap.once('ready', () => {
        //saveLog ( `trySendToRemoteFromFile wImap on ready for [${ fileName }]`)
        return Async.series([
            next => wImap.imapStream.createBox(false, writeBox, next),
            next => wImap.append1(mediaData, next)
        ], err => {
            _err = err;
            wImap.logout();
        });
    });
};
exports.trySendToRemoteFromFile1Less10MB4 = (imapPeer, fileName, CallBack) => {
    //saveLog (`doing trySendToRemoteFromFile1Less10MB fileName = [${ fileName }]`)
    const filePath = fileName.split('/videoTemp/');
    const writeBox = filePath[filePath.length - 1];
    let _return = false;
    let wImap = new qtGateImapwrite(imapPeer.imapData, writeBox);
    wImap.once('error', err => {
        wImap.logout();
        if (err && err.message && /auth|login|log in|Too many simultaneous|UNAVAILABLE/i.test(err.message)) {
            if (!_return) {
                _return = true;
                return CallBack(err);
            }
            return;
        }
        return exports.trySendToRemoteFromFile1Less10MB4(imapPeer, fileName, CallBack);
    });
    wImap.once('end', err => {
        wImap = null;
        Fs.unlink(fileName, () => {
            //saveLog ( `trySendToRemoteFromFile on end! err = [${ err }]` )
            if (!_return) {
                _return = true;
                return CallBack(err);
            }
        });
    });
    wImap.once('ready', () => {
        //saveLog ( `trySendToRemoteFromFile wImap on ready for [${ fileName }]`)
        return Async.series([
            next => wImap.imapStream.createBox(false, writeBox, next),
            next => wImap.appendFromFile3(fileName, next),
            next => wImap.logout()
        ], (err) => {
            if (err) {
                return wImap.destroyAll(err);
            }
        });
    });
};
const saveLogForstreamImap = (log) => {
    const Fs = require('fs');
    const data = `${new Date().toUTCString()}: ${log}\r\n`;
    Fs.appendFile(ErrorLogFileStream, data, { flag: flag }, err => {
        flag = 'a';
    });
};
const debugOutStream = (text, isIn) => {
    const log = `【${new Date().toISOString()}】${isIn ? '<=' : '=>'} 【${text}】`;
    saveLogForstreamImap(log);
};
exports.imapGetMediaFilesFromString = (IMapConnect, files, folder, CallBack) => {
    const fileArray = files.split(',');
    if (!fileArray.length) {
        return CallBack(new Error(' no file!'));
    }
    Async.eachSeries(fileArray, (n, next) => {
        Async.waterfall([
            _next => exports.imapGetMediaFile(IMapConnect, n, _next),
            (mediaData, _next) => Fs.writeFile(path_1.join(folder, n), mediaData, 'utf8', _next)
        ], next);
    }, err => {
        if (err) {
            return CallBack(err);
        }
        return Upload.joinFiles(files, CallBack);
    });
};
