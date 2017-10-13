"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socketIo = require("socket.io");
const Path = require("path");
const Os = require("os");
const Http = require("http");
const Fs = require("fs");
const Async = require("async");
const Util = require("util");
const Https = require("https");
const Crypto1 = require("crypto");
const Net = require("net");
const Imap = require("./imap");
const freePort = require("portastic");
const openpgp = require('openpgp');
const Express = require('express');
const cookieParser = require('cookie-parser');
const Nodemailer = require('nodemailer');
const Uuid = require('node-uuid');
const { remote } = require('electron');
const DEBUG = false;
const QTGateFolder = Path.join(Os.homedir(), '.QTGate');
const QTGateSignKeyID = /3acbe3cbd3c1caa9/i;
const configPath = Path.join(QTGateFolder, 'config.json');
const ErrorLogFile = Path.join(QTGateFolder, 'systemError.log');
const feedbackFilePath = Path.join(QTGateFolder, '.feedBack.json');
const imapDataFileName = Path.join(QTGateFolder, 'imapData.pem');
const myIpServerUrl = ['https://ipinfo.io/ip', 'https://icanhazip.com/', 'https://diagnostic.opendns.com/myip', 'http://ipecho.net/plain', 'https://www.trackip.net/ip'];
const keyServer = 'https://pgp.mit.edu';
const QTGatePongReplyTime = 1000 * 30;
const version = remote.app.getVersion();
let mainWindow = null;
const debug = false;
const createWindow = () => {
    remote.getCurrentWindow().createWindow();
    /*
    mainWindow = new remote.BrowserWindow ({
        width: 850,
        height: 480,
        minWidth: 850,
        minHeight: 480,
        show: false,
        backgroundColor: '#ffffff',
        icon: process.platform === 'linux' ? Path.join ( __dirname, 'app/public/assets/images/512x512.png' ) : Path.join ( __dirname, 'app/qtgate.icns' )
    })
    
    mainWindow.loadURL ( `http://127.0.0.1:${ port }/` )
    if ( debug ) {
        mainWindow.webContents.openDevTools()
        mainWindow.maximize()
    }
    
    mainWindow.once ( 'closed', () => {
        mainWindow = null
    })
    mainWindow.once ('ready-to-show', () => {
        mainWindow.show()
    })
    */
};
const _doUpdate = (tag) => {
    saveLog(`_doUpdate tag = [${tag}]`);
    remote.getCurrentWindow()._doUpdate(tag, port);
};
let flag = 'w';
const saveLog = (log) => {
    const data = `${new Date().toUTCString()}: ${log}\r\n`;
    Fs.appendFile(ErrorLogFile, data, { flag: flag }, err => {
        flag = 'a';
    });
};
exports.getLocalInterface = () => {
    const ifaces = Os.networkInterfaces();
    console.log(ifaces);
    const ret = [];
    Object.keys(ifaces).forEach(n => {
        let alias = 0;
        ifaces[n].forEach(iface => {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }
            ret.push(iface.address);
            alias++;
        });
    });
    return ret;
};
const findPort = (port, CallBack) => {
    return freePort.test(port).then(isOpen => {
        if (isOpen)
            return CallBack(null, port);
        ++port;
        return findPort(port, CallBack);
    });
};
const doUrl = (url, CallBack) => {
    let ret = '';
    if (/^https/.test(url))
        return Https.get(url, res => {
            res.on('data', (data) => {
                ret += data.toString('utf8');
            });
            res.once('end', () => {
                return CallBack(null, ret);
            });
        }).once('error', err => {
            console.log('on err ');
            return CallBack(err);
        });
    return Http.get(url, res => {
        res.on('data', (data) => {
            ret += data.toString('utf8');
        });
        res.once('end', () => {
            return CallBack(null, ret);
        });
    }).once('error', err => {
        console.log('on err ');
        return CallBack(err);
    });
};
const myIpServer = (CallBack) => {
    let ret = false;
    Async.each(myIpServerUrl, (n, next) => {
        doUrl(n, (err, data) => {
            if (err) {
                return next();
            }
            if (!ret) {
                ret = true;
                return CallBack(null, data);
            }
        });
    }, () => {
        return CallBack(new Error(''));
    });
};
const getQTGateSign = (_key) => {
    const key = openpgp.key.readArmored(_key).keys;
    if (!key || !key.length)
        return false;
    const user = key[0].users;
    if (!user || !user.length || !user[0].otherCertifications || !user[0].otherCertifications.length) {
        return false;
    }
    const signID = user[0].otherCertifications[0].issuerKeyId.toHex();
    return QTGateSignKeyID.test(signID);
};
const KeyPairDeleteKeyDetail = (keyPair, passwordOK) => {
    const ret = {
        nikeName: keyPair.nikeName,
        email: keyPair.email,
        keyLength: keyPair.keyLength,
        createDate: keyPair.createDate,
        passwordOK: passwordOK,
        verified: keyPair.verified,
        publicKeyID: keyPair.publicKeyID
    };
    return ret;
};
const emitConfig = (config, passwordOK) => {
    const ret = {
        keypair: KeyPairDeleteKeyDetail(config.keypair, passwordOK),
        firstRun: config.firstRun,
        alreadyInit: config.alreadyInit,
        newVerReady: config.newVerReady,
        version: config.version,
        multiLogin: config.multiLogin,
        freeUser: config.freeUser,
        account: config.keypair.email,
        QTGateConnectImapUuid: config.QTGateConnectImapUuid,
        serverGlobalIpAddress: config.serverGlobalIpAddress,
        serverPort: config.serverPort,
        connectedQTGateServer: config.connectedQTGateServer,
        localIpAddress: exports.getLocalInterface(),
        lastConnectType: config.lastConnectType
    };
    return ret;
};
const getBitLength = (key) => {
    let size = 0;
    if (key.primaryKey.mpi.length) {
        size = (key.primaryKey.mpi[0].byteLength() * 8);
    }
    return size.toString();
};
const InitKeyPair = () => {
    const keyPair = {
        publicKey: null,
        privateKey: null,
        keyLength: null,
        nikeName: null,
        createDate: null,
        email: null,
        passwordOK: false,
        verified: false,
        publicKeyID: null
    };
    return keyPair;
};
const getKeyFingerprint = (key) => {
    return key.primaryKey.fingerprint.toUpperCase();
};
const getKeyId = (key) => {
    const id = getKeyFingerprint(key);
    return id.substr(id.length - 8);
};
const getKeyUserInfo = (UserID, keypair) => {
    if (UserID && UserID.length) {
        const temp = UserID.split(' <');
        const temp1 = temp[0].split(' (');
        const temp2 = temp1.length > 1
            ? temp1[1].split('||')
            : '';
        keypair.email = temp.length > 1
            ? temp[1].slice(0, temp[1].length - 1)
            : '';
        keypair.nikeName = temp1[0];
    }
};
const getKeyPairInfo = (publicKey, privateKey, password, CallBack) => {
    const _privateKey = openpgp.key.readArmored(privateKey);
    const _publicKey = openpgp.key.readArmored(publicKey);
    if (_privateKey.err || _publicKey.err) {
        return CallBack(new Error('key pair error'));
    }
    const privateKey1 = _privateKey.keys[0];
    const publicKey1 = _publicKey.keys;
    const ret = {
        publicKey: publicKey,
        privateKey: privateKey,
        keyLength: getBitLength(privateKey1),
        nikeName: '',
        createDate: new Date(privateKey1.primaryKey.created).toLocaleString(),
        email: '',
        passwordOK: false,
        verified: getQTGateSign(publicKey),
        publicKeyID: getKeyId(publicKey1[0])
    };
    const user = privateKey1.users;
    if (user && user.length) {
        getKeyUserInfo(user[0].userId.userid, ret);
    }
    if (!password || !privateKey1.decrypt(password))
        return CallBack(null, ret);
    ret.passwordOK = true;
    return CallBack(null, ret);
};
const InitConfig = (first, version, port) => {
    const ret = {
        firstRun: first,
        alreadyInit: false,
        multiLogin: false,
        version: version,
        newVersion: null,
        newVerReady: false,
        keypair: InitKeyPair(),
        salt: Crypto1.randomBytes(64),
        iterations: 2000 + Math.round(Math.random() * 2000),
        keylen: Math.round(16 + Math.random() * 30),
        digest: 'sha512',
        freeUser: true,
        account: null,
        QTGateConnectImapUuid: null,
        serverGlobalIpAddress: null,
        serverPort: port,
        connectedQTGateServer: false,
        localIpAddress: exports.getLocalInterface(),
        lastConnectType: 1
    };
    return ret;
};
const checkKey = (keyID, CallBack) => {
    const hkp = new openpgp.HKP(keyServer);
    const options = {
        query: keyID
    };
    hkp.lookup(options).then(key => {
        if (key) {
            return CallBack(null, key);
        }
        return CallBack(null, null);
    }).catch(err => {
        CallBack(err);
    });
};
const readQTGatePublicKey = (CallBack) => {
    const fileName = Path.join(__dirname, 'info@QTGate.com.pem');
    Fs.readFile(fileName, 'utf8', CallBack);
};
const deCryptoWithKey = (data, publicKey, privateKey, password, CallBack) => {
    const options = {
        message: openpgp.message.readArmored(data),
        publicKeys: openpgp.key.readArmored(publicKey).keys,
        privateKey: openpgp.key.readArmored(privateKey).keys[0]
    };
    if (!options.privateKey.decrypt(password)) {
        return CallBack(new Error('saveImapData key password error!'));
    }
    openpgp.decrypt(options).then(plaintext => {
        return CallBack(null, plaintext.data);
    }).catch(err => {
        return CallBack(err);
    });
};
const encryptWithKey = (data, targetKey, privateKey, password, CallBack) => {
    if (!data || !data.length || !targetKey || !targetKey.length || !privateKey || !privateKey.length) {
        return CallBack(new Error('unknow format!'));
    }
    const publicKeys = openpgp.key.readArmored(targetKey).keys;
    const privateKeys = openpgp.key.readArmored(privateKey).keys[0];
    if (!privateKeys.decrypt(password))
        return CallBack(new Error('private key password!'));
    const option = {
        data: data,
        publicKeys: publicKeys,
        privateKeys: privateKeys
    };
    openpgp.encrypt(option).then(m => {
        CallBack(null, m.data);
    }).catch(err => {
        CallBack(err);
    });
};
class RendererProcess {
    constructor(name, data, debug, CallBack) {
        this.win = null;
        this.win = new remote.BrowserWindow({ show: debug });
        this.win.setIgnoreMouseEvents(!debug);
        if (debug) {
            this.win.webContents.openDevTools();
            this.win.maximize();
        }
        this.win.once('first', () => {
            this.win.once('firstCallBackFinished', returnData => {
                this.win.close();
                this.win = null;
                CallBack(returnData);
                return CallBack = null;
            });
            this.win.emit('firstCallBack', data);
        });
        this.win.once('closed', () => {
            if (CallBack && typeof CallBack === 'function') {
                CallBack();
                return CallBack = null;
            }
        });
        this.win.loadURL(`file://${Path.join(__dirname, name + '.html')}`);
    }
    cancel() {
        if (this.win && typeof this.win.destroy === 'function') {
            return this.win.destroy();
        }
    }
}
class localServer {
    constructor(version, port) {
        this.version = version;
        this.port = port;
        this.ex_app = null;
        this.socketServer = null;
        this.httpServer = null;
        this.config = null;
        this.newKeyRequest = null;
        this.mainSocket = null;
        this.resert = false;
        this.downloading = false;
        this.QTClass = null;
        this.newRelease = null;
        this.savedPasswrod = '';
        this.imapDataPool = [];
        this.CreateKeyPairProcess = null;
        this.QTGateConnectImap = -1;
        this.sendRequestToQTGate = false;
        this.qtGateConnectEmitData = null;
        this.bufferPassword = null;
        this.clientIpAddress = null;
        this.proxyServerWindow = null;
        this.connectCommand = null;
        this.proxyServer = null;
        this.ex_app = Express();
        this.ex_app.set('views', Path.join(__dirname, 'views'));
        this.ex_app.set('view engine', 'pug');
        this.ex_app.use(cookieParser());
        this.ex_app.use(require('stylus').middleware(Path.join(__dirname, 'public')));
        this.ex_app.use(Express.static(QTGateFolder));
        this.ex_app.use(Express.static(Path.join(__dirname, 'public')));
        this.ex_app.get('/', (req, res) => {
            res.render('home', { title: 'home' });
        });
        this.ex_app.get('/doingUpdate', (req, res) => {
            res.json();
            const { ver } = req.query;
            saveLog(`/doingUpdate res.query = [${ver}]`);
            this.config.newVersion = ver;
            this.config.newVerReady = true;
            return this.saveConfig();
        });
        this.ex_app.get('/update/mac', (req, res) => {
            if (!this.config.newVerReady) {
                return res.status(204).end();
            }
            const { ver } = req.query;
            return res.status(200).json({ url: `http://127.0.0.1:${this.port}/latest/${ver}/qtgate-${ver.substr(1)}-mac.zip`, version: `${ver}`, releaseDate: new Date().toISOString() });
        });
        this.ex_app.get('/linuxUpdate', (req, res) => {
            res.render('home/linuxUpdate', req.query);
        });
        this.ex_app.get('/checkUpdate', (req, res) => {
            res.render('home/checkUpdate', req.query);
        });
        this.ex_app.get('/feedBack', (req, res) => {
            res.render('home/feedback', { imagFile: req.query });
        });
        this.ex_app.use((req, res, next) => {
            saveLog('ex_app.use 404:' + req.url);
            return res.status(404).send("Sorry can't find that!");
        });
        this.httpServer = Http.createServer(this.ex_app);
        this.socketServer = socketIo(this.httpServer);
        this.socketServer.on('connection', socket => {
            this.socketConnectListen(socket);
        });
        this.httpServer.listen(port);
        this.checkConfig();
    }
    saveConfig() {
        Fs.writeFile(configPath, JSON.stringify(this.config), { encoding: 'utf8' }, err => {
            if (err)
                return saveLog(`localServer->saveConfig ERROR: ` + err.message);
        });
    }
    saveImapData() {
        if (!this.imapDataPool || !this.imapDataPool.length) {
            return Fs.unlink(imapDataFileName, err => { });
        }
        const _data = JSON.stringify(this.imapDataPool);
        const options = {
            data: _data,
            publicKeys: openpgp.key.readArmored(this.config.keypair.publicKey).keys,
            privateKeys: openpgp.key.readArmored(this.config.keypair.privateKey).keys
        };
        Async.waterfall([
            (next) => this.getPbkdf2(this.savedPasswrod, next),
            (data, next) => {
                if (!options.privateKeys[0].decrypt(data.toString('hex'))) {
                    return next(new Error('saveImapData key password error!'));
                }
                openpgp.encrypt(options).then(ciphertext => {
                    Fs.writeFile(imapDataFileName, ciphertext.data, { encoding: 'utf8' }, next);
                }).catch(err => {
                    return next(err);
                });
            }
        ], err => {
            if (err)
                saveLog(`saveImapData error: ${JSON.stringify(err)}`);
        });
    }
    pgpDecrypt(text, CallBack) {
        if (!text || !text.length) {
            return CallBack(new Error('no text'));
        }
        const options = {
            message: null,
            publicKeys: openpgp.key.readArmored(this.config.keypair.publicKey).keys,
            privateKey: openpgp.key.readArmored(this.config.keypair.privateKey).keys[0]
        };
        Async.waterfall([
            (next) => this.getPbkdf2(this.savedPasswrod, next),
            (data, next) => {
                if (!options.privateKey.decrypt(data.toString('hex'))) {
                    return next(new Error('saveImapData key password error!'));
                }
                this.bufferPassword = data.toString('hex');
                options.message = openpgp.message.readArmored(text);
                openpgp.decrypt(options).then(plaintext => {
                    try {
                        const data = JSON.parse(plaintext.data);
                        return next(null, data);
                    }
                    catch (e) {
                        return next(new Error('readImapData try SON.parse ( plaintext.data ) catch ERROR:' + e.message));
                    }
                }).catch(err => {
                    next(err);
                });
            }
        ], (err, data) => {
            if (err) {
                return CallBack(err);
            }
            return CallBack(null, data);
        });
    }
    pgpEncrypt(text, CallBack) {
        if (!text || !text.length) {
            return CallBack(new Error('no text'));
        }
        const options = {
            data: text,
            publicKeys: openpgp.key.readArmored(this.config.keypair.publicKey).keys,
            privateKeys: openpgp.key.readArmored(this.config.keypair.privateKey).keys
        };
        Async.waterfall([
            (next) => this.getPbkdf2(this.savedPasswrod, next),
            (data, next) => {
                if (!options.privateKeys[0].decrypt(data.toString('hex'))) {
                    return next(new Error('saveImapData key password error!'));
                }
                openpgp.encrypt(options).then(ciphertext => {
                    return next(null, ciphertext.data);
                }).catch(err => {
                    return next(err);
                });
            }
        ], (err, data) => {
            if (err) {
                saveLog(`saveImapData error: ${JSON.stringify(err)}`);
                return CallBack(err);
            }
            return CallBack(null, data);
        });
    }
    readImapData(CallBack) {
        if (!this.savedPasswrod || !this.savedPasswrod.length || !this.config || !this.config.keypair || !this.config.keypair.createDate)
            return CallBack(new Error('readImapData no password or keypair data error!'));
        const options = {
            message: null,
            publicKeys: openpgp.key.readArmored(this.config.keypair.publicKey).keys,
            privateKey: openpgp.key.readArmored(this.config.keypair.privateKey).keys[0]
        };
        Async.waterfall([
            (next) => {
                Fs.access(imapDataFileName, next);
            },
            (next) => this.getPbkdf2(this.savedPasswrod, next),
            (data, next) => {
                if (!options.privateKey.decrypt(data.toString('hex'))) {
                    return next(new Error('saveImapData key password error!'));
                }
                Fs.readFile(imapDataFileName, 'utf8', next);
            },
            (data, next) => {
                options.message = openpgp.message.readArmored(data.toString());
                openpgp.decrypt(options).then(plaintext => {
                    try {
                        const data = JSON.parse(plaintext.data);
                        return next(null, data);
                    }
                    catch (e) {
                        return next(new Error('readImapData try JSON.parse ( plaintext.data ) catch ERROR:' + e.message));
                    }
                }).catch(err => {
                    next(err);
                });
            }
        ], (err, data) => {
            if (err) {
                return CallBack(err);
            }
            this.imapDataPool = data;
            return CallBack();
        });
    }
    listenAfterPassword(socket) {
        socket.on('startCheckImap', (id, imapData, CallBack) => {
            if (!id || !id.length || !imapData || !Object.keys(imapData).length) {
                saveLog(`socket.on startCheckImap but data format is error! id:[${id}] imapData:[${Util.inspect(imapData)}]`);
                return CallBack(1);
            }
            if (this.imapDataPool.length) {
                const index = this.imapDataPool.findIndex(n => { return n.email === imapData.email && n.uuid !== imapData.uuid; });
                if (index > -1) {
                    return CallBack(10);
                }
            }
            return myIpServer((err, ip) => {
                if (err || !ip) {
                    saveLog('startCheckImap isOnline false!');
                    return CallBack(2);
                }
                CallBack(null);
                this.clientIpAddress = ip;
                return this.doingCheck(id, imapData, socket);
            });
        });
        socket.on('deleteImapAccount', uuid => {
            if (!uuid && !uuid.length) {
                return saveLog(`deleteImapAccount have not uuid!`);
            }
            const index = this.imapDataPool.findIndex(n => { return n.uuid === uuid; });
            if (index < 0 || !this.imapDataPool[index].canDoDelete) {
                return saveLog(`deleteImapAccount have not uuid! or canDoDelete == false`);
            }
            saveLog(`delete imap uuid = [${uuid}]`);
            this.imapDataPool.splice(index, 1);
            this.saveImapData();
            socket.emit('ImapData', this.imapDataPool);
        });
        socket.on('getAvaliableRegion', CallBack => {
            const com = {
                command: 'getAvaliableRegion',
                Args: [],
                error: null,
                requestSerial: Crypto1.randomBytes(8).toString('hex')
            };
            return this.QTClass.request(com, (err, res) => {
                saveLog(JSON.stringify(res.Args));
                CallBack(res.Args[0]);
                //		Have gateway connect!
                if (res.Args[1]) {
                    const uu = res.Args[1];
                    if (!this.connectCommand) {
                        this.connectCommand = uu;
                    }
                    if (!this.proxyServer) {
                        const runCom = uu.connectType === 1 ? '@Opn' : 'iOpn';
                        uu.localServerIp = exports.getLocalInterface()[0];
                        this.proxyServer = new RendererProcess(runCom, uu, debug, () => {
                            saveLog(`proxyServerWindow on exit!`);
                            this.proxyServer = null;
                            this.connectCommand = null;
                        });
                    }
                    return socket.emit('QTGateGatewayConnectRequest', this.connectCommand);
                }
            });
        });
        socket.on('checkActiveEmailSubmit', (text) => {
            if (!text || !text.length || !/^-----BEGIN PGP MESSAGE-----(\r)?\n(.+)((\r)?\n)/.test(text) || !/(\r)?\n-----END PGP MESSAGE-----((\r)?\n)?/.test(text)) {
                socket.emit('checkActiveEmailError', 0);
                return saveLog(`checkActiveEmailSubmit, no text.length !`);
            }
            if (!this.QTClass) {
                socket.emit('checkActiveEmailError', 2);
                return saveLog(`checkActiveEmailSubmit, have no this.QTClass!`);
            }
            this.pgpDecrypt(text, (err, data) => {
                if (err) {
                    socket.emit('checkActiveEmailError', 1);
                    return saveLog(`checkActiveEmailSubmit ERROR:[${err}]`);
                }
                const com = {
                    command: 'activePassword',
                    Args: [data],
                    error: null,
                    requestSerial: Crypto1.randomBytes(8).toString('hex')
                };
                this.QTClass.request(com, (err, res) => {
                    if (err) {
                        return socket.emit('qtGateConnect', 5);
                    }
                    if (res.error > -1) {
                        return socket.emit('checkActiveEmailError', res.error);
                    }
                    if (res.Args && res.Args.length) {
                        const key = Buffer.from(res.Args[0], 'base64').toString();
                        this.config.keypair.publicKey = key;
                        this.config.keypair.verified = getQTGateSign(key);
                        this.saveConfig();
                        socket.emit('newKeyPairCallBack', this.config.keypair);
                        this.qtGateConnectEmitData.qtGateConnecting = 2;
                        this.qtGateConnectEmitData.error = -1;
                        return socket.emit('qtGateConnect', this.qtGateConnectEmitData);
                    }
                });
                return socket.emit('checkActiveEmailError', null);
            });
        });
        socket.on('connectQTGate', uuid => {
            const index = this.imapDataPool.findIndex(n => { return n.uuid === uuid; });
            if (index < 0)
                return;
            this.imapDataPool[index].sendToQTGate = true;
            this.emitQTGateToClient(socket, uuid);
        });
        socket.on('checkPort', (portNum, CallBack) => {
            const num = parseInt(portNum.toString());
            if (!/^[0-9]*$/.test(portNum.toString()) || !num || num < 1000 || num > 65535)
                return CallBack(true);
            return findPort(portNum, (err, kk) => {
                saveLog(`check port [${typeof portNum}] got back kk [${typeof kk}]`);
                if (kk !== portNum) {
                    return CallBack(true);
                }
                return CallBack(false);
            });
        });
        socket.on('QTGateGatewayConnectRequest', (cmd, CallBack) => {
            //		already have proxy
            if (this.proxyServer) {
                return;
            }
            return myIpServer((err, ipAddress) => {
                if (err) {
                    return saveLog(`myIpServer return error: [${err.message}]`);
                }
                if (cmd.connectType === 2) {
                    if (!Net.isIPv4(ipAddress)) {
                        ipAddress = ipAddress.split('\n')[0];
                    }
                    cmd.imapData.clientIpAddress = ipAddress;
                }
                cmd.imapData.randomPassword = Crypto1.randomBytes(15).toString('hex');
                cmd.account = this.config.keypair.email.toLocaleLowerCase();
                saveLog(`ipAddress = [${ipAddress}] Buffer [] = ${Buffer.from(ipAddress).toString('hex')}`);
                const com = {
                    command: 'connectRequest',
                    Args: [cmd],
                    error: null,
                    requestSerial: Crypto1.randomBytes(8).toString('hex')
                };
                return this.QTClass.request(com, (err, res) => {
                    const arg = res.Args[0];
                    arg.localServerIp = exports.getLocalInterface()[0];
                    saveLog(`this.proxyServer = new RendererProcess type = [${arg.connectType}] data = [${JSON.stringify(arg)}]`);
                    //		no error
                    CallBack(res);
                    if (res.error < 0) {
                        this.connectCommand = arg;
                        const runCom = arg.connectType === 1 ? '@Opn' : 'iOpn';
                        return this.proxyServer = new RendererProcess(runCom, arg, debug, () => {
                            saveLog(`proxyServerWindow on exit!`);
                            this.proxyServer = null;
                            this.connectCommand = null;
                        });
                    }
                    saveLog(`res.error [${res.error}]`);
                });
            });
        });
        socket.on('disconnectClick', CallBack => {
            this.disConnectGateway();
            this.stopGetwayConnect(arg => {
                saveLog(`stopGatwayConnect callback Args = [${JSON.stringify(arg)}]`);
                CallBack();
            });
        });
    }
    disConnectGateway() {
        saveLog('disConnectGateway.');
        this.proxyServer.cancel();
        this.socketServer.emit('disconnect');
        this.proxyServer = null;
        this.connectCommand = null;
    }
    stopGetwayConnect(CallBack) {
        const com = {
            command: 'stopGetwayConnect',
            Args: null,
            error: null,
            requestSerial: Crypto1.randomBytes(8).toString('hex')
        };
        this.QTClass.request(com, (err, res) => {
            const arg = res.Args[0];
            const connect = res.Args[1];
            saveLog(JSON.stringify(arg));
            saveLog(`Have connect\n[${connect}]`);
            //		no error
            if (arg.error < 0) {
                //		@QTGate connect
                if (arg.connectType === 1) {
                }
                //		iQTGate connect
            }
            return CallBack(arg);
        });
    }
    addInImapData(imapData) {
        const index = this.imapDataPool.findIndex(n => { return n.uuid === imapData.uuid; });
        if (index === -1) {
            const data = {
                email: imapData.email,
                imapServer: imapData.imapServer,
                imapPortNumber: imapData.imapPortNumber,
                imapSsl: imapData.imapSsl,
                imapUserName: imapData.imapUserName,
                imapUserPassword: imapData.imapUserPassword,
                imapIgnoreCertificate: imapData.imapIgnoreCertificate,
                smtpPortNumber: imapData.smtpPortNumber,
                smtpServer: imapData.smtpServer,
                smtpSsl: imapData.smtpSsl,
                smtpUserName: imapData.smtpUserName,
                smtpUserPassword: imapData.smtpUserPassword,
                smtpIgnoreCertificate: imapData.smtpIgnoreCertificate,
                imapTestResult: null,
                account: imapData.account,
                imapCheck: imapData.imapCheck,
                smtpCheck: imapData.smtpCheck,
                sendToQTGate: imapData.sendToQTGate,
                serverFolder: null,
                clientFolder: null,
                connectEmail: null,
                validated: null,
                language: imapData.language,
                timeZoneOffset: imapData.timeZoneOffset,
                randomPassword: null,
                uuid: imapData.uuid,
                canDoDelete: imapData.canDoDelete,
                clientIpAddress: null
            };
            this.imapDataPool.unshift(data);
            return 0;
        }
        const data = this.imapDataPool[index];
        // - 
        data.email = imapData.email;
        data.imapServer = imapData.imapServer;
        data.imapPortNumber = imapData.imapPortNumber;
        data.imapSsl = imapData.imapSsl;
        data.imapUserName = imapData.imapUserName;
        data.imapUserPassword = imapData.imapUserPassword;
        data.smtpPortNumber = imapData.smtpPortNumber;
        data.smtpServer = imapData.smtpServer;
        data.smtpSsl = imapData.smtpSsl;
        data.smtpUserName = imapData.smtpUserName;
        data.smtpUserPassword = imapData.smtpUserPassword;
        // -
        return index;
    }
    //- socket server 
    socketConnectListen(socket) {
        socket.on('init', (Callback) => {
            const ret = emitConfig(this.config, false);
            Callback(null, ret);
        });
        socket.on('agree', (callback) => {
            this.config.firstRun = false;
            this.config.alreadyInit = true;
            this.saveConfig();
            return callback();
        });
        socket.on('NewKeyPair', (preData) => {
            //		already have key pair
            if (this.config.keypair.createDate) {
                return socket.emit('newKeyPairCallBack', this.config.keypair);
            }
            this.savedPasswrod = preData.password;
            this.listenAfterPassword(socket);
            return this.getPbkdf2(this.savedPasswrod, (err, Pbkdf2Password) => {
                preData.password = Pbkdf2Password.toString('hex');
                this.CreateKeyPairProcess = new RendererProcess('newKeyPair', preData, false, retData => {
                    this.CreateKeyPairProcess = null;
                    if (!retData) {
                        saveLog(`CreateKeyPairProcess ON FINISHED! HAVE NO newKeyPair DATA BACK!`);
                        return this.socketServer.emit('newKeyPairCallBack', null);
                    }
                    saveLog(`RendererProcess finished [${retData}]`);
                    return getKeyPairInfo(retData.publicKey, retData.privateKey, preData.password, (err1, keyPairInfoData) => {
                        if (err1) {
                            saveLog('server.js getKeyPairInfo ERROR: ' + err1.message + '\r\n' + JSON.stringify(err));
                            return this.socketServer.emit('newKeyPairCallBack', null);
                        }
                        this.config.keypair = keyPairInfoData;
                        this.config.account = keyPairInfoData.email;
                        this.saveConfig();
                        const ret = KeyPairDeleteKeyDetail(this.config.keypair, true);
                        return this.socketServer.emit('newKeyPairCallBack', keyPairInfoData);
                    });
                });
            });
        });
        socket.on('deleteKeyPair', () => {
            const config = InitConfig(true, this.version, this.port);
            config.newVerReady = this.config.newVerReady;
            config.newVersion = this.config.newVersion;
            this.config = config;
            this.config.firstRun = false;
            this.config.alreadyInit = true;
            this.savedPasswrod = '';
            this.imapDataPool = [];
            this.saveImapData();
            this.saveConfig();
            if (this.QTClass) {
                this.QTClass.destroy(1);
                this.QTClass = null;
            }
            socket.emit('ImapData', []);
            if (this.QTClass) {
                this.QTClass.destroy(null);
                this.QTClass = null;
            }
            return socket.emit('deleteKeyPair');
        });
        socket.once('newVersionInstall', (CallBack) => {
            if (this.config.newVerReady)
                return _doUpdate(this.config.newVersion);
        });
        socket.on('checkPemPassword', (password, callBack) => {
            let keyPair = null;
            if (!password || password.length < 5 || !this.config.keypair || !this.config.keypair.createDate) {
                saveLog('server.js socket on checkPemPassword passwrod or keypair error!' +
                    `[${!password}][${password.length < 5}][${!this.config.keypair.publicKey}][${!this.config.keypair.publicKey.length}][${!this.config.keypair.privateKey}][${!this.config.keypair.privateKey.length}]`);
                return callBack(false);
            }
            if (this.savedPasswrod && this.savedPasswrod.length) {
                if (this.savedPasswrod !== password)
                    return callBack(false);
                callBack(true, this.imapDataPool);
                this.listenAfterPassword(socket);
                saveLog(`this.connectCommand && this.httpServer [${this.connectCommand && this.httpServer}]`);
                if (this.connectCommand && this.httpServer) {
                    return socket.emit('QTGateGatewayConnectRequest', this.connectCommand);
                }
                return this.emitQTGateToClient(socket, null);
            }
            return Async.waterfall([
                (next) => {
                    return this.getPbkdf2(password, next);
                },
                (data, next) => {
                    return getKeyPairInfo(this.config.keypair.publicKey, this.config.keypair.privateKey, data.toString('hex'), next);
                }
            ], (err, _keyPair) => {
                if (err) {
                    saveLog(`socket.on checkPemPassword ERROR: ${JSON.stringify(err)}`);
                    return callBack(err);
                }
                this.config.keypair = keyPair = _keyPair;
                if (!keyPair.passwordOK)
                    return callBack(keyPair.passwordOK);
                this.listenAfterPassword(socket);
                this.savedPasswrod = password;
                this.readImapData((err) => {
                    if (err) {
                        return saveLog('checkPemPassword readImapData got error! ' + err.message);
                    }
                    socket.emit('ImapData', this.imapDataPool);
                    //		check imap data
                    return this.emitQTGateToClient(socket, null);
                });
                return callBack(keyPair.passwordOK);
            });
        });
        socket.on('CancelCreateKeyPair', () => {
            if (this.CreateKeyPairProcess) {
                saveLog(`socket.on ( 'CancelCreateKeyPair') canceled!`);
                this.CreateKeyPairProcess.cancel();
            }
        });
        /*
        socket.on ( 'checkUpdateBack', ( jsonData: any ) => {
            this.config.newVersionCheckFault = true
            if ( !jsonData ) {
                return saveLog (`socket.on checkUpdateBack but have not jsonData`)
            }
            const { tag_name, assets } = jsonData
            if ( ! tag_name ) {
                return saveLog ( `socket.on checkUpdateBack but have not jsonData`)
            }
            
            this.config.newVersionCheckFault = false
            const ver = jsonData.tag_name
            console.log ( `config.version = [${ this.config.version }] ver = [${ ver }]`)
            if ( ver <= this.config.version || ! assets || assets.length < 7 ) {
                console.log ( `no new version!`)
                return saveLog ( `server.js checkVersion no new version! ver=[${ ver }], newVersion[${ this.config.newVersion }] jsonData.assets[${ jsonData.assets? jsonData.assets.length: null }]` )
            }
            saveLog ( 'server.js checkVersion have new version:' + ver )
            this.config.newVersion = ver
            //process.send ( jsonData )
            process.once ( 'message', message => {
                console.log ( `server on process.once message`, message )
                if ( message ) {
                    ++this.config.newVersionDownloadFault
                    this.saveConfig ()
                    return saveLog ( `getDownloadFiles callBack ERROR!`)
                }
                this.config.newVersionDownloadFault = 0
                this.config.newVersionCheckFault = false
                this.config.newVerReady = true
                this.saveConfig ()
            })

        })
        */
    }
    //--------------------------   check imap setup
    checkConfig() {
        Fs.access(configPath, err => {
            if (err) {
                createWindow();
                return this.config = InitConfig(true, this.version, this.port);
            }
            try {
                const config = require(configPath);
                config.salt = Buffer.from(config.salt.data);
                this.config = config;
                this.config.version = this.version;
                this.config.serverPort = this.port;
                this.config;
                if (this.config.keypair && this.config.keypair.publicKeyID)
                    return Async.waterfall([
                            next => {
                            if (!this.config.keypair.publicKey)
                                return checkKey(this.config.keypair.publicKeyID, next);
                            return next(null, null);
                        },
                        (data, next) => {
                            if (data) {
                                this.config.keypair.publicKey = data;
                            }
                            getKeyPairInfo(this.config.keypair.publicKey, this.config.keypair.privateKey, null, next);
                        }
                    ], (err, keyPair) => {
                        if (err || !keyPair) {
                            createWindow();
                            return saveLog(`checkConfig keyPair Error! [${JSON.stringify(err)}]`);
                        }
                        return myIpServer((err, ipaddress) => {
                            this.config.keypair = keyPair;
                            this.clientIpAddress = this.config.serverGlobalIpAddress = ipaddress;
                            this.saveConfig();
                            return createWindow();
                        });
                    });
                return createWindow();
            }
            catch (e) {
                saveLog('localServer->checkConfig: catch ERROR: ' + e.message);
                createWindow();
                return this.config = InitConfig(true, this.version, this.port);
            }
        });
    }
    getPbkdf2(passwrod, CallBack) {
        Crypto1.pbkdf2(passwrod, this.config.salt, this.config.iterations, this.config.keylen, this.config.digest, CallBack);
    }
    smtpVerify(imapData, CallBack) {
        const option = {
            host: Net.isIP(imapData.smtpServer) ? null : imapData.smtpServer,
            hostname: Net.isIP(imapData.smtpServer) ? imapData.smtpServer : null,
            port: imapData.smtpPortNumber,
            requireTLS: imapData.smtpSsl,
            auth: {
                user: imapData.smtpUserName,
                pass: imapData.smtpUserPassword
            },
            connectionTimeout: (1000 * 15).toString(),
            tls: imapData.smtpIgnoreCertificate ? {
                rejectUnauthorized: false
            } : imapData.smtpSsl,
        };
        const transporter = Nodemailer.createTransport(option);
        transporter.verify((err, success) => {
            DEBUG ? saveLog(`transporter.verify callback err:[${JSON.stringify(err)}] success[${success}]`) : null;
            if (err) {
                const _err = JSON.stringify(err);
                if (/Invalid login|AUTH/i.test(_err))
                    return CallBack(8);
                if (/certificate/i.test(_err))
                    return CallBack(9);
                return CallBack(10);
            }
            return CallBack();
        });
    }
    sendMailToQTGate(imapData, text, Callback) {
        const option = {
            host: imapData.smtpServer,
            port: imapData.smtpPortNumber,
            requireTLS: imapData.smtpSsl,
            auth: {
                user: imapData.smtpUserName,
                pass: imapData.smtpUserPassword
            }
        };
        const transporter = Nodemailer.createTransport(option);
        const mailOptions = {
            from: imapData.email,
            to: 'QTGate@QTGate.com',
            subject: 'QTGate',
            attachments: [{
                    content: text
                }]
        };
        transporter.sendMail(mailOptions, (err, info, infoID) => {
            if (err) {
                saveLog(`transporter.sendMail got ERROR! [${JSON.stringify(err)}]`);
                return Callback(err);
            }
            saveLog(`transporter.sendMail success!`);
            return Callback();
        });
    }
    sendEmailTest(imapData, CallBack) {
        if (!this.savedPasswrod) {
            const err = 'sendEmailToQTGate ERROR! have not password!';
            saveLog(err);
            return CallBack(new Error(err));
        }
        Async.parallel([
                next => readQTGatePublicKey(next),
                next => this.getPbkdf2(this.savedPasswrod, next)
        ], (err, data) => {
            if (err) {
                saveLog(`sendEmailToQTGate readQTGatePublicKey && getPbkdf2 got ERROR [${Util.inspect(err)}]`);
                return CallBack(err);
            }
            const qtgateCommand = {
                account: this.config.account,
                QTGateVersion: this.config.version,
                imapData: imapData,
                command: 'connect',
                error: null,
                callback: null,
                language: imapData.language,
                publicKey: this.config.keypair.publicKey
            };
            let key = data[0].toString();
            let password = data[1].toString('hex');
            if (!/^-----BEGIN PGP PUBLIC KEY BLOCK-----/.test(key)) {
                key = data[1].toString();
                password = data[0].toString('hex');
            }
            Async.waterfall([
                (next) => encryptWithKey(JSON.stringify(qtgateCommand), key, this.config.keypair.privateKey, password, next),
                (_data, next) => { this.sendMailToQTGate(imapData, _data, next); }
            ], (err1) => {
                if (err1) {
                    saveLog(`encryptWithKey && sendMailToQTGate got ERROR [${Util.inspect(err1)}]`);
                    return CallBack(err1);
                }
                return CallBack();
            });
        });
    }
    imapTest(imapData, CallBack) {
        const testNumber = 4;
        const uu = next => {
            Imap.imapAccountTest(imapData, next);
        };
        const uu1 = Array(testNumber).fill(uu);
        return Async.parallel(uu1, (err, num) => {
            if (err) {
                saveLog(`imapTest error [${err.message}]`);
                const message = err.message;
                if (message && message.length) {
                    if (/Auth|Lookup failed|Invalid|Login|username/i.test(message))
                        return CallBack(3);
                    if (/ECONNREFUSED/i.test(message))
                        return CallBack(4);
                    if (/certificate/i.test(message))
                        return CallBack(5);
                    if (/timeout/i.test(message)) {
                        return CallBack(7);
                    }
                    if (/ENOTFOUND/i.test(message)) {
                        return CallBack(6);
                    }
                }
                return CallBack(4);
            }
            let time = 0;
            num.forEach(n => {
                time += n;
            });
            const ret = Math.round(time / testNumber);
            return CallBack(null, ret);
        });
    }
    emitQTGateToClient(socket, _imapUuid) {
        let sendWhenTimeOut = true;
        if (this.qtGateConnectEmitData && this.qtGateConnectEmitData.qtGateConnecting) {
            this.qtGateConnectEmitData.qtGateConnecting = 1;
            socket.emit('qtGateConnect', this.qtGateConnectEmitData);
            return this.QTClass.checkConnect(err => {
                this.qtGateConnectEmitData.qtGateConnecting = 2;
                return socket.emit('qtGateConnect', this.qtGateConnectEmitData);
            });
        }
        if (!_imapUuid) {
            if (this.imapDataPool.length < 1) {
                return socket.emit('qtGateConnect', null);
            }
            if (!this.config.QTGateConnectImapUuid) {
                this.config.QTGateConnectImapUuid = this.imapDataPool[0].uuid;
            }
        }
        else {
            this.config.QTGateConnectImapUuid = _imapUuid;
        }
        //	sendToQTGate
        //	case 0: conform
        //	case 1: connecting
        //	case 2: connected
        //	case 3: connect error & error = error number
        //	case 4: sent conform & wait return from QTGate
        const index = this.imapDataPool.findIndex(n => { return n.uuid === this.config.QTGateConnectImapUuid; });
        if (index < 0) {
            this.config.QTGateConnectImapUuid = this.imapDataPool[0].uuid;
            this.QTGateConnectImap = 0;
        }
        else {
            this.QTGateConnectImap = index;
        }
        const imapData = this.imapDataPool[this.QTGateConnectImap];
        if (!imapData.imapCheck || !imapData.smtpCheck || !imapData.imapTestResult)
            return;
        if (!this.imapDataPool.length) {
            return;
        }
        const ret = {
            qtgateConnectImapAccount: this.config.QTGateConnectImapUuid,
            qtGateConnecting: !imapData.sendToQTGate ? 0 : 1,
            isKeypairQtgateConform: this.config.keypair.verified,
            error: null
        };
        const doConnect = () => {
            if (!this.imapDataPool.length)
                return;
            this.QTClass = new ImapConnect(imapData, this.qtGateConnectEmitData, sendWhenTimeOut, this, this.savedPasswrod, (err) => {
                if (err !== null) {
                    //		have connect error
                    if (err > 0) {
                        this.qtGateConnectEmitData.qtGateConnecting = 3;
                        this.qtGateConnectEmitData.error = err;
                        return socket.emit('qtGateConnect', this.qtGateConnectEmitData);
                    }
                    // QTGate disconnected resend connect request
                    imapData.sendToQTGate = false;
                    this.saveImapData();
                }
                this.QTClass.removeAllListeners();
                this.QTClass = null;
                return doConnect();
            }, socket);
        };
        this.qtGateConnectEmitData = ret;
        socket.emit('qtGateConnect', ret);
        if (ret.qtGateConnecting === 0) {
            return;
        }
        if (!imapData.serverFolder || !imapData.uuid || imapData.canDoDelete) {
            imapData.serverFolder = Uuid.v4();
            imapData.clientFolder = Uuid.v4();
            imapData.randomPassword = Uuid.v4();
            imapData.sendToQTGate = false;
            imapData.canDoDelete = false;
        }
        this.saveImapData();
        saveLog(JSON.stringify(imapData));
        if (!imapData.sendToQTGate || !this.config.connectedQTGateServer) {
            saveLog(`sendToQTGate == false, now send request to QTGate!`);
            sendWhenTimeOut = false;
            return this.sendEmailTest(imapData, err => {
                if (err) {
                    this.qtGateConnectEmitData.qtGateConnecting = 3;
                    this.qtGateConnectEmitData.error = 0;
                    return socket.emit('qtGateConnect', this.qtGateConnectEmitData);
                }
                imapData.sendToQTGate = true;
                this.saveImapData();
                return doConnect();
            });
        }
        doConnect();
    }
    doingCheck(id, _imapData, socket) {
        const imapData = this.imapDataPool[this.addInImapData(_imapData)];
        imapData.imapCheck = imapData.smtpCheck = false;
        imapData.imapTestResult = 0;
        this.saveImapData();
        return this.imapTest(imapData, (err, code) => {
            socket.emit(id + '-imap', err ? err : null, code);
            imapData.imapTestResult = code;
            imapData.imapCheck = code > 0;
            this.saveImapData();
            if (err)
                return;
            this.smtpVerify(imapData, (err1) => {
                socket.emit(id + '-smtp', err1 ? err1 : null);
                imapData.smtpCheck = !err1;
                this.saveImapData();
                if (err1)
                    return;
                this.emitQTGateToClient(socket, _imapData.uuid);
            });
        });
    }
    shutdown() {
        this.saveConfig();
        this.saveImapData();
        this.httpServer.close();
    }
}
exports.localServer = localServer;
class ImapConnect extends Imap.imapPeer {
    constructor(imapData, qtGateConnectEmitData, exitWhenServerNotReady, localServer, password, exit, socket) {
        super(imapData, imapData.clientFolder, imapData.serverFolder, (text, CallBack) => {
            this._enCrypto(text, CallBack);
        }, (text, CallBack) => {
            this._deCrypto(text, CallBack);
        }, err => {
            if (exit) {
                exit(this.errNumber(err));
                exit = null;
            }
        });
        this.imapData = imapData;
        this.qtGateConnectEmitData = qtGateConnectEmitData;
        this.localServer = localServer;
        this.QTGatePublicKey = null;
        this.password = null;
        this.sendReqtestMail = false;
        this.QTGateServerready = false;
        this.localGlobalIpAddress = null;
        this.commandCallBackPool = new Map();
        Async.parallel([
                next => readQTGatePublicKey(next),
                next => this.localServer.getPbkdf2(password, next)
        ], (err, data) => {
            if (err) {
                return saveLog(`class [ImapConnect] doing Async.parallel [readQTGatePublicKey, this.localServer.getPbkdf2 ] got error! [${JSON.stringify(err)}]`);
            }
            this.QTGatePublicKey = data[0].toString();
            this.password = data[1].toString('hex');
            if (!/^-----BEGIN PGP PUBLIC KEY BLOCK-----/.test(this.QTGatePublicKey)) {
                this.QTGatePublicKey = data[1].toString();
                this.password = data[0].toString('hex');
            }
        });
        const readyTime = exitWhenServerNotReady ? setTimeout(() => {
            saveLog('ImapConnect waiting timeout!, send connect request email now!');
            this.clearServerListenFolder();
            return this.localServer.sendEmailTest(imapData, err => {
                if (err) {
                    qtGateConnectEmitData.qtGateConnecting = 5;
                    qtGateConnectEmitData.error = 0;
                    return saveLog(`class [ImapConnect] connect QTGate timeout! send request mail to QTGate! ERRIR [${err.message})]`);
                }
                qtGateConnectEmitData.qtGateConnecting = 6;
                socket.emit('qtGateConnect', qtGateConnectEmitData);
                saveLog(`class [ImapConnect] connect QTGate timeout! send request mail to QTGate! success`);
            });
        }, QTGatePongReplyTime) : null;
        this.once('ready', () => {
            saveLog('ImapConnect got response from QTGate imap server, connect ready!');
            clearTimeout(readyTime);
            this.QTGateServerready = true;
            imapData.canDoDelete = false;
            qtGateConnectEmitData.qtGateConnecting = 2;
            this.localServer.saveImapData();
            this.localServer.config.connectedQTGateServer = true;
            this.localServer.saveConfig();
            socket.emit('qtGateConnect', qtGateConnectEmitData);
            makeFeedbackData((data, callback) => {
                this.request(data, callback);
            }, err => {
                if (err) {
                    return saveLog(`makeFeedbackData back ERROR [${err.message}]`);
                }
                return saveLog(`makeFeedbackData success!`);
            });
        });
        this.newMail = (ret) => {
            //		have not requestSerial that may from system infomation
            if (!ret || !ret.requestSerial) {
                switch (ret.command) {
                    case 'containerStop': {
                        saveLog(`QTGateAPIRequestCommand on containerStop! doing disConnectGateway()`);
                        localServer.disConnectGateway();
                    }
                    default: {
                        return saveLog(`QTGateAPIRequestCommand have not requestSerial!, 【${JSON.stringify(ret)}】`);
                    }
                }
            }
            const CallBack = this.commandCallBackPool.get(ret.requestSerial);
            if (!CallBack || typeof CallBack !== 'function') {
                return saveLog(`ret.requestSerial [${ret.requestSerial}] have not callback `);
            }
            return CallBack(null, ret);
        };
        saveLog(`new ImapConnect created!`);
    }
    errNumber(err) {
        if (!err || !err.message)
            return null;
        const message = err.message;
        if (/Auth|Lookup failed|Invalid|Login|username/i.test(message))
            return 3;
        if (/ECONNREFUSED/i.test(message))
            return 4;
        if (/certificate/i.test(message))
            return 5;
        if (/timeout/i.test(message)) {
            return 7;
        }
        if (/peer not ready/i.test(message))
            return 0;
        return 6;
    }
    _enCrypto(text, CallBack) {
        return encryptWithKey(text, this.QTGatePublicKey, this.localServer.config.keypair.privateKey, this.password, CallBack);
    }
    _deCrypto(text, CallBack) {
        return deCryptoWithKey(text, this.QTGatePublicKey, this.localServer.config.keypair.privateKey, this.password, CallBack);
    }
    clearServerListenFolder() {
        saveLog(`doing clearServerListenFolder!`);
        const iRead = new Imap.qtGateImapRead(this.imapData, this.imapData.serverFolder, false, true, () => { return; });
        return iRead.once('ready', () => {
            saveLog(`doing clearServerListenFolder on ready now destroyAll!`);
            iRead.destroyAll(null);
        });
    }
    request(command, CallBack) {
        this.commandCallBackPool.set(command.requestSerial, CallBack);
        this._enCrypto(JSON.stringify(command), (err1, data) => {
            if (err1) {
                saveLog(`request _deCrypto got error [${JSON.stringify(err1)}]`);
                return CallBack(err1);
            }
            this.append(data);
            saveLog(`do request command [${command.command}] finished and wait server responsr!`);
        });
    }
    checkConnect(CallBack) {
        const time = setTimeout(() => {
            this.localServer.sendEmailTest(this.imapData, err => {
                if (err)
                    return saveLog(`class [ImapConnect] checkConnect timeout! send request mail to QTGate! ERROR! [${JSON.stringify(err)}]`);
                saveLog(`class [ImapConnect] checkConnect timeout! send request mail to QTGate! success`);
            });
        }, QTGatePongReplyTime);
        this.once('ready', () => {
            clearTimeout(time);
            CallBack();
        });
        this.Ping();
    }
}
const port = remote.getCurrentWindow().rendererSidePort;
const _doUpdate1 = (tag_name, port) => {
    let url = null;
    if (process.platform === 'darwin') {
        url = `http://127.0.0.1:${port}/update/mac?ver=${tag_name}`;
    }
    else if (process.platform === 'win32') {
        url = `http://127.0.0.1:${port}/latest/${tag_name}/`;
    }
    else {
        return;
    }
    const autoUpdater = remote.require('electron').autoUpdater;
    autoUpdater.on('update-availabe', () => {
        console.log('update available');
    });
    autoUpdater.on('error', err => {
        console.log('systemError autoUpdater.on error ' + err.message);
    });
    autoUpdater.on('checking-for-update', () => {
        console.log(`checking-for-update [${url}]`);
    });
    autoUpdater.on('update-not-available', () => {
        console.log('update-not-available');
    });
    autoUpdater.on('update-downloaded', e => {
        console.log("Install?");
        autoUpdater.quitAndInstall();
    });
    autoUpdater.setFeedURL(url);
    autoUpdater.checkForUpdates();
};
const makeFeedBackDataToQTGateAPIRequestCommand = (data, Callback) => {
    const ret = {
        command: 'feedBackData',
        Args: [data],
        error: null,
        requestSerial: Crypto1.randomBytes(10).toString('hex')
    };
    if (!data.attachImagePath) {
        return Callback(null, ret);
    }
    Fs.readFile(data.attachImagePath, (err, iData) => {
        if (err) {
            return Callback(err, null);
        }
        data.attachImage = iData.toString('base64');
        ret.Args = [data];
        Fs.unlink(data.attachImagePath, () => {
            return Callback(null, ret);
        });
    });
};
const makeFeedbackData = (request, CallBack) => {
    let feedData = null;
    return Async.waterfall([
            next => Fs.access(feedbackFilePath, next),
            next => Fs.readFile(feedbackFilePath, 'utf8', next)
    ], (err, jData) => {
        if (err)
            return CallBack(err);
        try {
            feedData = JSON.parse(jData);
            return Async.each(feedData, (n, next) => {
                return makeFeedBackDataToQTGateAPIRequestCommand(n, (err, data) => {
                    if (err) {
                        return next(err);
                    }
                    return request(data, next);
                });
            }, err => {
                return Fs.unlink(feedbackFilePath, CallBack);
            });
        }
        catch (ex) {
            return CallBack(ex);
        }
    });
};
const server = new localServer(version, port);
saveLog(`
*************************** QTGate [ ${version} ] server start up on [ ${port} ] *****************************
OS: ${process.platform}, ver: ${Os.release()}, cpus: ${Os.cpus().length}, model: ${Os.cpus()[0].model}
Memory: ${Os.totalmem() / (1024 * 1024)} MB, free memory: ${Math.round(Os.freemem() / (1024 * 1024))} MB
**************************************************************************************************`);
