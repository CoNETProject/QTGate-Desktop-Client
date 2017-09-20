"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 *
 *
 */
const Fs = require("fs");
const Os = require("os");
const path_1 = require("path");
const async_1 = require("async");
const freePort = require("portastic");
const url_1 = require("url");
const child_process_1 = require("child_process");
const { app, BrowserWindow, Tray, Menu, dialog, remote } = require('electron');
const handleSquirrelEvent = () => {
    if (process.argv.length === 1) {
        return false;
    }
    const appFolder = path_1.resolve(process.execPath, '..');
    const rootAtomFolder = path_1.resolve(appFolder, '..');
    const updateDotExe = path_1.resolve(path_1.join(rootAtomFolder, 'Update.exe'));
    const exeName = path_1.basename(process.execPath);
    const _spawn = (command, args) => {
        let spawnedProcess, error;
        try {
            spawnedProcess = child_process_1.spawn(command, args, { detached: true });
        }
        catch (error) { }
        return spawnedProcess;
    };
    const spawnUpdate = args => {
        return child_process_1.spawn(updateDotExe, args);
    };
    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus
            // Install desktop and start menu shortcuts
            spawnUpdate(['--createShortcut', exeName]);
            setTimeout(app.quit, 1000);
            return true;
        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers
            // Remove desktop and start menu shortcuts
            spawnUpdate(['--removeShortcut', exeName]);
            setTimeout(app.quit, 1000);
            return true;
        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated
            app.quit();
            return true;
    }
};
if (handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}
const version = app.getVersion();
const debug = false;
var lang;
(function (lang) {
    lang[lang["zh"] = 0] = "zh";
    lang[lang["ja"] = 1] = "ja";
    lang[lang["en"] = 2] = "en";
    lang[lang["tw"] = 3] = "tw";
})(lang || (lang = {}));
const QTGateFolder = path_1.join(Os.homedir(), '.QTGate');
const QTGateLatest = path_1.join(QTGateFolder, 'latest');
const logFile = path_1.join(QTGateFolder, 'systemLog.log');
let isSingleInstanceCheck = true;
let localServer1 = null;
let tray = null;
let mainWindow = null;
let updateWin = null;
exports.port = 3000 + Math.round(10000 * Math.random());
const dirTitleErr = [
    [
        '文件夹创建错误',
        'フォルダ作成エラー',
        'Create folder error',
        '文件夾創建錯誤'
    ],
    [
        'QTGate在[__folder__]位置创建文件夹错误，QTGate安装不能够继续进行，请检查您的系统。',
        'QTGateは[__folder__]にフォルダを作成エラー、QTGateはインストールができません。あなたのシステムをチェックしてください。',
        'QTGate install got error when make a folder at [__folder__], please check your OS system and do QTGate install again.',
        'QTGate在[__folder__]位置創建文件夾錯誤，QTGate安裝不能夠繼續進行，請檢查您的系統。'
    ]
];
const createWindow = () => {
    if (mainWindow) {
        if (mainWindow.isMinimized())
            mainWindow.restore();
        return mainWindow.focus();
    }
    mainWindow = new BrowserWindow({
        width: 850,
        height: 480,
        minWidth: 850,
        minHeight: 480,
        resizable: false,
        backgroundColor: '#ffffff',
        icon: process.platform === 'linux' ? path_1.join(__dirname, 'app/public/assets/images/512x512.png') : path_1.join(__dirname, 'app/qtgate.icns')
    });
    mainWindow.loadURL(`http://127.0.0.1:${exports.port}/`);
    if (debug) {
        mainWindow.webContents.openDevTools();
        mainWindow.maximize();
        //require('devtron').install()
    }
    mainWindow.once('closed', () => {
        mainWindow = null;
    });
};
const data11 = [
    {
        tray: [
            {
                label: '打开',
                click: createWindow
            },
            {
                role: 'quit',
                label: '退出',
                accelerator: 'Command+Q'
            }
        ]
    }, {
        tray: [
            {
                label: 'オープン',
                click: createWindow
            },
            {
                role: 'quit',
                label: '退出',
                accelerator: 'Command+Q'
            }
        ]
    }, {
        tray: [
            {
                label: 'open',
                click: createWindow
            },
            {
                role: 'quit',
                accelerator: 'Command+Q'
            }
        ]
    }, {
        tray: [
            {
                label: '打開',
                click: createWindow
            }, {
                role: 'quit',
                label: '退出',
                accelerator: 'Command+Q'
            }
        ]
    }
];
const showError = (title, detail, app) => {
    dialog.showErrorBox(title, detail);
    if (app)
        return app.quit();
};
const getLocalLanguage = (lang) => {
    if (/^zh-TW|^zh-HK|^zh-SG/i.test(lang))
        return 3;
    if (/^zh/i.test(lang))
        return 0;
    if (/^ja/i.test(lang))
        return 1;
    return 2;
};
let localLanguage = getLocalLanguage(app.getLocale());
const checkFolder = (folder, CallBack) => {
    Fs.access(folder, err => {
        if (err) {
            return Fs.mkdir(folder, err1 => {
                if (err1) {
                    console.log(err1);
                    return CallBack(err1);
                }
                return CallBack();
            });
        }
        return CallBack();
    });
};
const makeSingleInstance = () => {
    //  For Mac App Store build
    if (process.mas)
        return false;
    return app.makeSingleInstance(() => {
        return createWindow();
    });
};
const sendFromServer = message => {
    if (typeof message === 'string') {
        switch (message) {
            case 'createWindow': {
                return createWindow();
            }
            default: {
                return;
            }
        }
    }
};
const findPort = (CallBack) => {
    return freePort.test(exports.port).then(isOpen => {
        if (isOpen)
            return CallBack();
        ++exports.port;
        return findPort(CallBack);
    });
};
const initialize = () => {
    app.once('ready', () => {
        if ((isSingleInstanceCheck = makeSingleInstance()))
            app.exit();
        async_1.series([
            next => checkFolder(QTGateFolder, next),
            next => checkFolder(QTGateLatest, next)
        ], err => {
            if (err) {
                return showError(dirTitleErr[0][localLanguage], `${dirTitleErr[1][localLanguage].replace(/__folder__/, QTGateFolder)}:[ ${JSON.stringify(err)} ]`, app);
            }
            if (!localServer1 && !(isSingleInstanceCheck = makeSingleInstance())) {
                findPort(() => {
                    localServer1 = new BrowserWindow({ show: false });
                    localServer1.setIgnoreMouseEvents(true);
                    localServer1.rendererSidePort = exports.port;
                    localServer1.rendererCreateWindow = createWindow;
                    //localServer1.webContents.openDevTools()
                    //localServer1.maximize ()
                    localServer1.loadURL(url_1.format({
                        pathname: path_1.join(__dirname, 'index.html'),
                        protocol: 'file:',
                        slashes: true
                    }));
                });
            }
            if (!tray) {
                tray = new Tray(path_1.join(__dirname, 'app/16x16.png'));
                const contextMenu = Menu.buildFromTemplate(data11[localLanguage].tray);
                contextMenu.items[1].checked = false;
                tray.setContextMenu(contextMenu);
            }
            if (!updateWin) {
                updateWin = new BrowserWindow({ show: false });
                //updateWin.webContents.openDevTools()
                updateWin.setIgnoreMouseEvents(true);
                updateWin.rendererSidePort = exports.port;
                updateWin.loadURL(url_1.format({
                    pathname: path_1.join(__dirname, 'app/update.html'),
                    protocol: 'file:',
                    slashes: true
                }));
            }
        });
    });
    app.on('window-all-closed', () => {
        mainWindow = null;
    });
    app.on('activate', () => {
        createWindow();
    });
    app.once('quit', () => {
        if (localServer1) {
            localServer1 = null;
        }
        app.quit();
    });
};
initialize();
