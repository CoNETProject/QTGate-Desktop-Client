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
const Express = require("express");
const Path = require("path");
const HTTP = require("http");
const SocketIo = require("socket.io");
const Tool = require("./tools/initSystem");
const Async = require("async");
const Fs = require("fs");
const Util = require("util");
const Uuid = require("node-uuid");
const Imap = require("./tools/imap");
const coNETConnect_1 = require("./tools/coNETConnect");
const Crypto = require("crypto");
const mime = require("mime-types");
Express.static.mime.define({ 'multipart/related': ['mht'] });
//Express.static.mime.define({ 'message/rfc822' : ['mhtml','mht'] })
Express.static.mime.define({ 'application/x-mimearchive': ['mhtml', 'mht'] });
Express.static.mime.define({ 'multipart/related': ['mhtml', 'mht'] });
let logFileFlag = 'w';
const conetImapAccount = /^qtgate_test\d\d?@icloud.com$/i;
const saveLog = (err) => {
    if (!err) {
        return;
    }
    const data = `${new Date().toUTCString()}: ${typeof err === 'object' ? (err['message'] ? err['message'] : '') : err}\r\n`;
    console.log(data);
    return Fs.appendFile(Tool.ErrorLogFile, data, { flag: logFileFlag }, () => {
        return logFileFlag = 'a';
    });
};
const saveServerStartup = (localIpaddress) => {
    const info = `\n*************************** CoNET Platform [ ${Tool.packageFile.version} ] server start up *****************************\n` +
        `Access url: http://${localIpaddress}:${Tool.LocalServerPortNumber}\n`;
    saveLog(info);
};
const saveServerStartupError = (err) => {
    const info = `\n*************************** CoNET Platform [ ${Tool.packageFile.version} ] server startup falied *****************************\n` +
        `platform ${process.platform}\n` +
        `${err['message']}\n`;
    saveLog(info);
};
const imapErrorCallBack = (message) => {
    if (message && message.length) {
        if (/auth|login|log in|Too many simultaneous|UNAVAILABLE/i.test(message)) {
            return 1;
        }
        if (/ECONNREFUSED/i.test(message)) {
            return 5;
        }
        if (/OVERQUOTA/i.test(message)) {
            return 6;
        }
        if (/certificate/i.test(message)) {
            return 2;
        }
        if (/timeout|ENOTFOUND/i.test(message)) {
            return 0;
        }
        return 5;
    }
    return -1;
};
class localServer {
    constructor(cmdResponse, test) {
        this.cmdResponse = cmdResponse;
        this.expressServer = Express();
        this.httpServer = HTTP.createServer(this.expressServer);
        this.socketServer = SocketIo(this.httpServer);
        this.socketServer_CoSearch = this.socketServer.of('/CoSearch');
        this.config = null;
        this.keyPair = null;
        this.savedPasswrod = '';
        this.imapConnectData = null;
        this.localConnected = new Map();
        this.CoNETConnectCalss = null;
        this.openPgpKeyOption = null;
        this.sessionHashPool = [];
        this.Pbkdf2Password = null;
        this.nodeList = [{
                email: 'QTGate@CoNETTech.ca',
                keyID: '',
                key: ''
            }];
        this.requestPool = new Map();
        //Express.static.mime.define({ 'message/rfc822' : ['mhtml','mht'] })
        //Express.static.mime.define ({ 'multipart/related' : ['mhtml','mht'] })
        Express.static.mime.define({ 'application/x-mimearchive': ['mhtml', 'mht'] });
        this.expressServer.set('views', Path.join(__dirname, 'views'));
        this.expressServer.set('view engine', 'pug');
        this.expressServer.use(Express.static(Tool.QTGateFolder));
        this.expressServer.use(Express.static(Path.join(__dirname, 'public')));
        this.expressServer.use(Express.static(Path.join(__dirname, 'html')));
        this.expressServer.get('/', (req, res) => {
            res.render('home', { title: 'home', proxyErr: false });
        });
        this.socketServer.on('connection', socker => {
            return this.socketServerConnected(socker);
        });
        this.httpServer.once('error', err => {
            console.log(`httpServer error`, err);
            saveServerStartupError(err);
            return process.exit(1);
        });
        Async.series([
            next => Tool.checkSystemFolder(next),
            next => Tool.checkConfig(next)
        ], (err, data) => {
            if (err) {
                return saveServerStartupError(err);
            }
            this.config = data['1'];
            if (!test) {
                this.httpServer.listen(Tool.LocalServerPortNumber, () => {
                    return saveServerStartup(`localhost`);
                });
            }
        });
    }
    catchCmd(mail, uuid) {
        console.log(`Get response from CoNET uuid [${uuid}] length [${mail.length}]`);
        const socket = this.requestPool.get(uuid);
        if (!socket) {
            return console.log(`Get cmd that have no matched socket \n\n`, mail);
        }
        socket.emit('doingRequest', mail, uuid);
    }
    tryConnectCoNET(socket, sessionHash) {
        console.log(`doing tryConnectCoNET`);
        //		have CoGate connect
        let sendMail = false;
        const _exitFunction = err => {
            //console.trace ( `_exitFunction err =`, err )
            //console.log (`sessionHashPool.length = [${ this.sessionHashPool.length }]`)
            switch (err) {
                ///			connect conet had timeout
                case 1: {
                    return socket.emit('tryConnectCoNETStage', 0);
                }
                case 2: {
                    return console.log(`CoNETConnectCalss exit with 2, stop remake CoNETConnectCalss!`);
                }
                case 3: {
                    return makeConnect(sendMail = false);
                }
                case null:
                case undefined:
                default: {
                    if (!sendMail) {
                        return makeConnect(sendMail = true);
                    }
                    return makeConnect(sendMail = false);
                }
            }
        };
        const makeConnect = (sendMail) => {
            if (!this.imapConnectData.sendToQTGate || sendMail) {
                this.imapConnectData.sendToQTGate = true;
                Tool.saveEncryptoData(Tool.imapDataFileName1, this.imapConnectData, this.config, this.savedPasswrod, () => { });
                this.socketServer.emit('tryConnectCoNETStage', null, 3);
                this.socketServer.emit('systemErr', 'sendConnectRequestMail');
                return Tool.sendCoNETConnectRequestEmail(this.imapConnectData, this.openPgpKeyOption, this.config.version, this.nodeList[0].email, this.keyPair.publicKey, (err) => {
                    if (err) {
                        console.log(`sendCoNETConnectRequestEmail callback error`, err);
                        saveLog(`tryConnectCoNET sendCoNETConnectRequestEmail got error [${err.message ? err.message : JSON.stringify(err)}]`);
                        this.socketServer.emit('systemErr', err);
                        return socket.emit('tryConnectCoNETStage', imapErrorCallBack(err.message));
                    }
                    return this.CoNETConnectCalss = new coNETConnect_1.default(this.imapConnectData, this.socketServer, this.openPgpKeyOption, true, (mail, uuid) => {
                        return this.catchCmd(mail, uuid);
                    }, _exitFunction);
                });
            }
            console.log(`makeConnect without sendMail`);
            return this.CoNETConnectCalss = new coNETConnect_1.default(this.imapConnectData, this.socketServer, this.openPgpKeyOption, false, (mail, uuid) => {
                return this.catchCmd(mail, uuid);
            }, _exitFunction);
        };
        if (!this.CoNETConnectCalss || this.CoNETConnectCalss.alreadyExit) {
            saveLog(`!this.CoNETConnectCalss || this.CoNETConnectCalss.alreadyExit`);
            return makeConnect(false);
        }
        return this.CoNETConnectCalss.tryConnect1();
    }
    listenAfterPassword(socket, sessionHash) {
        //console.log (`localServer listenAfterPassword for sessionHash [${ sessionHash }]`)
        socket.on('checkImap', (emailAddress, password, timeZone, tLang, CallBack1) => {
            CallBack1();
            console.log(`localServer on checkImap!`);
            const imapServer = Tool.getImapSmtpHost(emailAddress);
            this.imapConnectData = {
                email: this.config.account,
                account: this.config.account,
                smtpServer: imapServer.smtp,
                smtpUserName: emailAddress,
                smtpPortNumber: imapServer.SmtpPort,
                smtpSsl: imapServer.smtpSsl,
                smtpIgnoreCertificate: false,
                smtpUserPassword: password,
                imapServer: imapServer.imap,
                imapPortNumber: imapServer.ImapPort,
                imapSsl: imapServer.imapSsl,
                imapUserName: emailAddress,
                imapIgnoreCertificate: false,
                imapUserPassword: password,
                timeZoneOffset: timeZone,
                language: tLang,
                imapTestResult: null,
                clientFolder: Uuid.v4(),
                serverFolder: Uuid.v4(),
                randomPassword: Uuid.v4(),
                uuid: Uuid.v4(),
                confirmRisk: false,
                clientIpAddress: null,
                ciphers: null,
                sendToQTGate: false
            };
            return this.doingCheckImap(socket);
        });
        socket.on('tryConnectCoNET', CallBack1 => {
            saveLog(`socket on tryConnectCoNET!`);
            if (!this.imapConnectData) {
                return CallBack1('systemError');
            }
            if (!this.imapConnectData.confirmRisk) {
                this.imapConnectData.confirmRisk = true;
                return Tool.saveEncryptoData(Tool.imapDataFileName1, this.imapConnectData, this.config, this.savedPasswrod, err => {
                    return this.tryConnectCoNET(socket, sessionHash);
                });
            }
            return this.tryConnectCoNET(socket, sessionHash);
        });
        socket.on('checkActiveEmailSubmit', (text, CallBack1) => {
            console.log(`on checkActiveEmailSubmit`);
            const key = Buffer.from(text, 'base64').toString();
            if (key && key.length) {
                console.log(`active key success! \n[${key}]`);
                this.keyPair.publicKey = this.config.keypair.publicKey = key;
                this.keyPair.verified = this.config.keypair.verified = true;
                return Tool.saveConfig(this.config, err => {
                    if (err) {
                        saveLog(`Tool.saveConfig return Error: [${err.message}]`);
                    }
                    CallBack1();
                });
            }
        });
        socket.on('doingRequest', (uuid, request, CallBack) => {
            this.requestPool.set(uuid, socket);
            saveLog(`doingRequest on ${uuid}`);
            return this.CoNETConnectCalss.requestCoNET_v1(uuid, request, CallBack);
        });
        socket.on('getFilesFromImap', (files, CallBack) => {
            console.log(`socket.on ('getFilesFromImap')`, files);
            if (typeof files !== 'string' || !files.length) {
                return CallBack(new Error('invalidRequest'));
            }
            const _files = files.split(',');
            console.log(`socket.on ('getFilesFromImap') _files = [${_files}] _files.length = [${_files.length}]`);
            let ret = '';
            return Async.eachSeries(_files, (n, next) => {
                console.log(`Async.eachSeries _files[${n}]`);
                return this.CoNETConnectCalss.getFile(n, (err, data) => {
                    if (err) {
                        return next(err);
                    }
                    ret += data.toString();
                    return next();
                });
            }, err => {
                if (err) {
                    return CallBack(err);
                }
                console.log(`******************** getFilesFromImap success all [${ret.length}] fies!\n\n${ret}\n\n`);
                return CallBack(null, ret);
            });
        });
        socket.on('sendMedia', (uuid, rawData, CallBack) => {
            return this.CoNETConnectCalss.sendDataToUuidFolder(Buffer.from(rawData).toString('base64'), uuid, CallBack);
        });
        socket.on('mime', (_mime, CallBack) => {
            let y = mime.lookup(_mime);
            if (!y) {
                return CallBack(new Error('no mime'));
            }
            return CallBack(null, y);
        });
    }
    doingCheckImap(socket) {
        this.imapConnectData.imapTestResult = false;
        return Async.series([
            next => Imap.imapAccountTest(this.imapConnectData, err => {
                if (err) {
                    console.log(`doingCheckImap Imap.imapAccountTest return err`, err);
                    return next(err);
                }
                console.log(`imapAccountTest success!`, typeof next);
                socket.emit('imapTest');
                return next();
            }),
            next => Tool.smtpVerify(this.imapConnectData, next)
        ], (err) => {
            if (err) {
                console.log(`doingCheckImap Async.series Error!`, err);
                return socket.emit('smtpTest', imapErrorCallBack(err.message));
            }
            this.imapConnectData.imapTestResult = true;
            return Tool.saveEncryptoData(Tool.imapDataFileName1, this.imapConnectData, this.config, this.savedPasswrod, err => {
                console.log(`socket.emit ( 'imapTestFinish' )`);
                socket.emit('imapTestFinish', this.imapConnectData);
            });
        });
    }
    getMedia(mediaString, CallBack) {
        //saveLog (` getMedia mediaString = [${ mediaString }]`)
        if (/^http[s]*\:\/\//.test(mediaString)) {
            return CallBack(null, mediaString);
        }
        const files = mediaString.split(',');
        if (!files || !files.length) {
            return CallBack(null, '');
        }
        //console.log ( files )
        return Imap.imapGetMediaFile(this.imapConnectData, files[0], CallBack);
    }
    getHTMLCompleteZIP(fileName, saveFolder, CallBack) {
        if (!fileName || !fileName.length) {
            return CallBack(new Error(`getHTMLComplete function Error: filename empty!`));
        }
        return this.getMedia(fileName, (err, data) => {
            if (err) {
                return CallBack(err);
            }
            Fs.writeFileSync(Path.join(saveFolder, fileName), data);
            return JSZip.loadAsync(Buffer.from(data.toString(), 'base64'))
                .then(zip => {
                let u = true;
                Async.each(Object.keys(zip.files), (_filename, next) => {
                    zip.files[_filename].async('nodebuffer').then(content => {
                        if (content.length) {
                            return Fs.writeFile(Path.join(saveFolder, _filename), content, next);
                        }
                        Fs.mkdir(Path.join(saveFolder, _filename), { recursive: true }, next);
                    });
                }, CallBack);
            });
        });
    }
    getVideo(m, CallBack) {
        if (!m || !m.QTDownload) {
            return CallBack();
        }
        return this.getMedia(m.QTDownload, (err, data) => {
            if (data) {
                const file = Uuid.v4() + '.mp4';
                const viode = Buffer.from(data, 'base64');
                return Fs.writeFile(Path.join(Tool.QTGateVideo, file), viode, err => {
                    m.QTDownload = `/tempfile/videoTemp/${file}`;
                    console.log(`save video file: [${file}]`);
                    return CallBack();
                });
            }
            return CallBack();
        });
    }
    passwordFail(CallBack) {
        return CallBack(null, true);
    }
    socketServerConnected(socket) {
        const clientName = `[${socket.id}][ ${socket.conn.remoteAddress}]`;
        let sessionHash = '';
        const clientObj = {
            listenAfterPasswd: false,
            socket: socket,
            login: false
        };
        saveLog(`socketServerConnected ${clientName} connect ${this.localConnected.size}`);
        socket.once('disconnect', reason => {
            saveLog(`socketServerConnected ${clientName} on disconnect ${this.localConnected.size}`);
            return this.localConnected.delete(clientName);
        });
        socket.once('init', Callback1 => {
            saveLog(`socket.on ( 'init' )`);
            const ret = Tool.emitConfig(this.config, false);
            return Callback1(null, ret);
        });
        socket.once('agreeClick', () => {
            this.config.firstRun = false;
            return Tool.saveConfig(this.config, saveLog);
        });
        socket.on('checkPemPassword', (password, CallBack1) => {
            if (!this.config.keypair || !this.config.keypair.publicKey) {
                console.log(`checkPemPassword !this.config.keypair`);
                return this.passwordFail(CallBack1);
            }
            if (!password || password.length < 5) {
                console.log(`! password `);
                return this.passwordFail(CallBack1);
            }
            if (this.savedPasswrod && this.savedPasswrod.length) {
                if (this.savedPasswrod !== password) {
                    console.log(`savedPasswrod !== password `);
                    return this.passwordFail(CallBack1);
                }
            }
            return Async.waterfall([
                next => Tool.getPbkdf2(this.config, password, next),
                (Pbkdf2Password, next) => {
                    this.Pbkdf2Password = Pbkdf2Password.toString('hex');
                    Tool.getKeyPairInfo(this.config.keypair.publicKey, this.config.keypair.privateKey, this.Pbkdf2Password, next);
                },
                (key, next) => {
                    //console.log ( `checkPemPassword Tool.getKeyPairInfo success!`)
                    if (!key.passwordOK) {
                        saveLog(`[${clientName}] on checkPemPassword had try password! [${password}]`);
                        return this.passwordFail(CallBack1);
                    }
                    this.savedPasswrod = password;
                    this.keyPair = key;
                    clientObj.listenAfterPasswd = clientObj.login = true;
                    this.localConnected.set(clientName, clientObj);
                    return Tool.makeGpgKeyOption(this.config, this.savedPasswrod, next);
                },
                (option_KeyOption, next) => {
                    //console.log (`checkPemPassword Tool.makeGpgKeyOption success!`)
                    this.openPgpKeyOption = option_KeyOption;
                    return Tool.readEncryptoFile(Tool.imapDataFileName1, password, this.config, next);
                }
            ], (err, data) => {
                //console.log (`checkPemPassword Async.waterfall success!`)
                if (err) {
                    if (!(err.message && /no such file/i.test(err.message))) {
                        CallBack1();
                        return saveLog(`Tool.makeGpgKeyOption return err [${err && err.message ? err.message : null}]`);
                    }
                }
                this.sessionHashPool.push(sessionHash = Crypto.randomBytes(10).toString('hex'));
                console.log(`this.sessionHashPool.push!\n${this.sessionHashPool}\n${this.sessionHashPool.length}`);
                this.listenAfterPassword(socket, sessionHash);
                try {
                    this.imapConnectData = JSON.parse(data);
                    this.localConnected.set(clientName, clientObj);
                    return CallBack1(null, this.imapConnectData, this.Pbkdf2Password, sessionHash);
                }
                catch (ex) {
                    return CallBack1();
                }
            });
        });
        socket.on('deleteKeyPairNext', CallBack1 => {
            CallBack1();
            console.log(`on deleteKeyPairNext`);
            const thisConnect = this.localConnected.get(clientName);
            if (this.localConnected.size > 1 && !thisConnect.login) {
                console.log(`this.localConnected = [${Util.inspect(this.localConnected, false, 2, true)}], thisConnect.login = [${thisConnect.login}]`);
                return this.socketServer.emit('deleteKeyPairNoite');
            }
            const info = `socket on deleteKeyPairNext, delete key pair now.`;
            saveLog(info);
            this.config = Tool.InitConfig();
            this.config.firstRun = false;
            this.keyPair = null;
            Tool.saveConfig(this.config, saveLog);
            if (this.CoNETConnectCalss) {
                this.CoNETConnectCalss.destroy(2);
                this.CoNETConnectCalss = null;
            }
            sessionHash = '';
            Tool.deleteImapFile();
            return this.socketServer.emit('init', null, this.config);
        });
        socket.on('NewKeyPair', (preData, CallBack1) => {
            //		already have key pair
            if (this.config.keypair && this.config.keypair.createDate) {
                return saveLog(`[${clientName}] on NewKeyPair but system already have keypair: ${this.config.keypair.publicKeyID} stop and return keypair.`);
            }
            this.savedPasswrod = preData.password;
            return Tool.getPbkdf2(this.config, this.savedPasswrod, (err, Pbkdf2Password) => {
                if (err) {
                    saveLog(`NewKeyPair getPbkdf2 Error: [${err.message}]`);
                    return CallBack1('systemError');
                }
                preData.password = Pbkdf2Password.toString('hex');
                console.log(`preData.password = [${preData.password}]`);
                return Tool.newKeyPair(preData.email, preData.nikeName, preData.password, (err, retData) => {
                    if (err) {
                        console.log(err);
                        CallBack1();
                        return saveLog(`CreateKeyPairProcess return err: [${err.message}]`);
                    }
                    if (!retData) {
                        const info = `newKeyPair return null key!`;
                        saveLog(info);
                        console.log(info);
                        return CallBack1();
                    }
                    if (!clientObj.listenAfterPasswd) {
                        clientObj.listenAfterPasswd = clientObj.login = true;
                        this.localConnected.set(clientName, clientObj);
                        this.sessionHashPool.push(sessionHash = Crypto.randomBytes(10).toString('hex'));
                        console.log(`this.sessionHashPool.push!\n${this.sessionHashPool}\n${this.sessionHashPool.length}`);
                        this.listenAfterPassword(socket, sessionHash);
                    }
                    return Tool.getKeyPairInfo(retData.publicKey, retData.privateKey, preData.password, (err, key) => {
                        if (err) {
                            const info = `Tool.getKeyPairInfo Error [${err.message ? err.message : 'null err message '}]`;
                            return CallBack1('systemError');
                        }
                        this.keyPair = this.config.keypair = key;
                        this.config.account = this.config.keypair.email;
                        return Tool.makeGpgKeyOption(this.config, this.savedPasswrod, (err, data) => {
                            if (err) {
                                return saveLog(err.message);
                            }
                            this.openPgpKeyOption = data;
                            Tool.saveConfig(this.config, saveLog);
                            return CallBack1(null, this.config.keypair, sessionHash);
                        });
                    });
                });
            });
        });
        socket.on('password', (password, Callback1) => {
            Callback1();
            if (!this.config.keypair || !this.config.keypair.publicKey) {
                console.log(`password !this.config.keypair`);
                return socket.emit('password', true);
            }
            if (!password || password.length < 5) {
                console.log(`! password `);
                return socket.emit('password', true);
            }
            if (this.savedPasswrod && this.savedPasswrod.length) {
                if (this.savedPasswrod !== password) {
                    console.log(`savedPasswrod !== password `);
                    return socket.emit('password', true);
                }
            }
            this.sessionHashPool.push(sessionHash = Crypto.randomBytes(10).toString('hex'));
            console.log(`this.sessionHashPool.push!\n${this.sessionHashPool}\n${this.sessionHashPool.length}`);
        });
    }
}
exports.default = localServer;
