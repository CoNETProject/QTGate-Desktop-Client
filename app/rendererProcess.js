"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const Fs = require("fs");
const child_process_1 = require("child_process");
const testElectronSystem = (CallBack) => {
    try {
        const ele = require('electron');
    }
    catch (ex) {
        return CallBack(ex);
    }
    return CallBack();
};
class RendererProcess {
    constructor(forkName, data, debug, CallBack) {
        this.forkName = forkName;
        this.data = data;
        this.debug = debug;
        this.CallBack = CallBack;
        this.win = null;
        this._fork = null;
        this.file = Path.join(__dirname, 'render', this.forkName);
        testElectronSystem(err1 => {
            if (err1) {
                console.log(`RendererProcess: running system have not electron.`);
                this.file += '.js';
            }
            else {
                this.file += '.html';
            }
            return Fs.access(this.file, err => {
                if (err) {
                    return CallBack(err);
                }
                if (/.js$/.test(this.file)) {
                    return this.childProcess();
                }
                return this.electronRendererProcess();
            });
        });
    }
    childProcess() {
        const _fork = child_process_1.fork(this.file, this.data);
        _fork.once('close', (code, signal) => {
            console.log(`RendererProcess exit`);
            if (!this.CallBack || typeof this.CallBack !== 'function') {
                return;
            }
            if (!code) {
                this.CallBack();
            }
            else {
                this.CallBack(new Error(`RendererProcess exit with code [${code}] signal [${signal}]`));
            }
            return this.CallBack = null;
        });
        _fork.once('message', message => {
            console.log(`RendererProcess [${this.forkName}] on message`);
            if (!this.CallBack || typeof this.CallBack !== 'function') {
                return;
            }
            this.CallBack(null, message);
            this.CallBack = null;
        });
    }
    electronRendererProcess() {
        const { remote, screen, desktopCapturer } = require('electron');
        this.win = new remote.BrowserWindow({ show: this.debug });
        this.win.setIgnoreMouseEvents(!this.debug);
        if (this.debug) {
            this.win.webContents.openDevTools();
            this.win.maximize();
        }
        this.win.once('first', () => {
            this.win.once('firstCallBackFinished', returnData => {
                this.win.close();
                this.win = null;
                this.CallBack(returnData);
                return this.CallBack = null;
            });
            this.win.emit('firstCallBack', this.data);
        });
        this.win.once('closed', () => {
            if (this.CallBack && typeof this.CallBack === 'function') {
                this.CallBack();
                return this.CallBack = null;
            }
        });
        this.win.loadURL(`file://${Path.join(__dirname, name + '.html')}`);
    }
    cancel() {
        if (this.win && typeof this.win.destroy === 'function') {
            return this.win.destroy();
        }
        if (this._fork) {
            return this._fork.kill();
        }
        console.log(`RendererProcess on cancel but have not any `);
    }
    sendCommand(command, data) {
        return this.win.emit(command, data);
    }
}
exports.default = RendererProcess;
