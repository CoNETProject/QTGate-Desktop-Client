"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Fs = require("fs");
const Os = require("os");
const Path = require("path");
const Async = require("async");
const { autoUpdater, BrowserWindow } = require("electron");
const preQTGateFolder = Path.join(Os.homedir(), '.QTGate');
const QTGateFolder = Path.join(Os.homedir(), '.QTGate/latest');
const _doUpdate = (url) => {
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
const hideWindowDownload = (downloadUrl, saveFilePath, Callback) => {
    if (!downloadUrl) {
        return console.log(`hideWindowDownload downloadUrl string null error`);
    }
    Fs.access(saveFilePath, err => {
        if (!err) {
            console.log(`[${saveFilePath}] already have skip!`);
            return Callback();
        }
        let win = new BrowserWindow({ visible: false });
        win.setIgnoreMouseEvents(true);
        let startTime = 0;
        let downloadBytes = 0;
        win.webContents.session.once('will-download', (event, item, webContents) => {
            item.setSavePath(saveFilePath);
            startTime = new Date().getTime();
            console.log(`start download file from [${downloadUrl}]\r\n saveTo [${saveFilePath}]`);
            /*
            const DEBUG = true
                item.on ( 'updated', ( event, state ) => {
                    if ( state === 'interrupted') {
                        if ( DEBUG )
                            console.log ( 'hideWindowDownload: Download is interrupted but can be resumed' + item.getURL() )
                        return
                    }
    
                    if ( item.isPaused ()) {
                        if ( DEBUG )
                            console.log ( 'hideWindowDownload: Download is interrupted but can be resumed' + item.getURL())
                        return
                    }
                    downloadBytes = item.getReceivedBytes()
                    if ( DEBUG )
                        console.log ( `${item.getFilename()} Received bytes: ${item.getReceivedBytes()}`)
                    return
                })
            */
            item.once('done', (event, state) => {
                const stopTime = new Date().getTime();
                win.destroy();
                if (state === 'completed') {
                    const fileLength = Math.round(downloadBytes / 1024);
                    const speed = fileLength / ((stopTime - startTime) / 1000);
                    console.log(`hideWindowDownload: success: [${item.getFilename()}] totalBytes[${fileLength}] KBytes speed[${speed}]Kb/s`);
                    console.log(`BrowserWindow.getAllWindows() = [${BrowserWindow.getAllWindows().length}]`);
                    return Callback();
                }
                console.log(`${downloadUrl} Download failed: ${state}`);
                return Fs.unlink(saveFilePath, err => {
                    return Callback(new Error(state));
                });
            });
        });
        win.once('closed', () => {
            console.log(`${downloadUrl} on closed, windows = [${BrowserWindow.getAllWindows().length}]`);
            win = null;
        });
        return win.loadURL(downloadUrl);
    });
};
const checkUpdateFolder = (updateFolder, CallBack) => {
    return Fs.readdir(updateFolder, (err, files) => {
        if (err) {
            return Fs.mkdir(updateFolder, err1 => {
                if (err1) {
                    console.log(`Fs.mkdir [${updateFolder}] got ERROR: `, err1);
                    return CallBack(err1);
                }
                return CallBack();
            });
        }
        return CallBack();
    });
};
const getUrlFromAssets = (fileName, assets) => {
    try {
        const index = assets.findIndex(m => { return m.name.toLowerCase() === fileName.toLowerCase(); });
        return assets[index].browser_download_url;
    }
    catch (e) {
        return null;
    }
};
const getDownloadFiles = (name, assets, CallBack) => {
    const updateFolder = Path.join(QTGateFolder, name);
    const verName = name.substr(1);
    checkUpdateFolder(updateFolder, err => {
        if (err) {
            return console.log(`checkUpdateFolder got error! stop getDownloadFiles`, err);
        }
        console.log(`getDownloadFiles updateFolder =[${updateFolder}]`);
        const downloadFiles = [];
        switch (process.platform) {
            case 'win32': {
                downloadFiles.push('RELEASES');
                downloadFiles.push(`qtgate-${verName}-delta.nupkg`);
                downloadFiles.push(`qtgate.Setup.${verName}.exe`);
                downloadFiles.push(`qtgate-${verName}-full.nupkg`);
                break;
            }
            case 'darwin': {
                downloadFiles.push(`qtgate-${verName}-mac.zip`);
                break;
            }
            default: {
                downloadFiles.push(`qtgate-${verName}-x86_64.AppImage`);
                break;
            }
        }
        console.log(`downloadFiles = ${downloadFiles} `);
        return Async.eachSeries(downloadFiles, (n, next) => {
            hideWindowDownload(getUrlFromAssets(n, assets), Path.join(updateFolder, n), next);
        }, CallBack);
    });
};
const getVersion = (CallBack) => {
    const saveFile = Path.join(preQTGateFolder, 'ver.json');
    return Async.serial([
        next => Fs.unlink(saveFile, next),
        next => hideWindowDownload('https://api.github.com/repos/QTGate/QTGate-desktop-client/releases/latest', saveFile, next)
    ], err => {
        if (err) {
            console.log(`getVersion return error`, err);
            return CallBack(err);
        }
        console.log(`getVersion success`);
    });
};
exports.doUpdate = (tag_name, assets) => {
    return getDownloadFiles(tag_name, assets, err => {
        if (err) {
            return console.log(err);
        }
        if (process.platform === 'darwin') {
            const url = `http://127.0.0.1:3000/update/mac?ver=${tag_name}`;
            return _doUpdate(url);
        }
        if (process.platform === 'win32') {
            return _doUpdate(`http://127.0.0.1:3000/latest/${tag_name}/`);
        }
    });
};
