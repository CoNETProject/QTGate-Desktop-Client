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
const Async = require("async");
const Fs = require("fs");
const Stream = require("stream");
const Uuid = require("node-uuid");
const Imap = require("./imap");
const Crypto = require("crypto");
const Path = require("path");
const Os = require("os");
const QTGateFolder = Path.join(Os.homedir(), '.QTGate');
const tempFiles = Path.join(QTGateFolder, 'tempfile');
const QTGateVideo = Path.join(tempFiles, 'videoTemp');
const maxSizeForBase64 = 512 * 1024;
class splitSize extends Stream.Transform {
    constructor(size) {
        super();
        this.size = size;
        this._chunk = Buffer.allocUnsafe(0);
    }
    _transform(chunk, encode, next) {
        this._chunk = Buffer.concat([this._chunk, chunk]);
        if (this._chunk.length < this.size) {
            return next();
        }
        next(null, this._chunk);
        return this._chunk = Buffer.allocUnsafe(0);
    }
    _flush() {
        console.log(`splitSize on _flush`);
        this.push(this._chunk);
    }
}
class saveToFile extends Stream.Writable {
    constructor(fileName, domainName, exportNameArray) {
        super();
        this.fileName = fileName;
        this.domainName = domainName;
        this.exportNameArray = exportNameArray;
        this.text = this.domainName ? `Content-Type: application/octet-stream\r\nContent-Disposition: attachment\r\nMessage-ID:<${Uuid.v4()}@>${this.domainName}\r\nContent-Transfer-Encoding: base64\r\nMIME-Version: 1.0\r\n\r\n` : null;
        this._end = this.domainName ? '\r\n\r\n' : null;
        this.dir = Path.parse(this.fileName).dir;
        this.saveFileName = Path.join(this.dir, Uuid.v4());
    }
    _write(chunk, encode, next) {
        if (!chunk.length) {
            console.log(`saveToFile got !chunk.length`);
            return this.end();
        }
        this.exportNameArray.push(this.saveFileName);
        const data = this.text ? (this.text + chunk.toString() + this.end) : chunk.toString();
        return Fs.writeFile(this.saveFileName, data, err => {
            console.log(`saveToFile Fs.writeFile success!`);
            return next(err);
        });
    }
    _flush() {
        console.log(`saveToFile on _flush`);
    }
}
class encodeBase64 extends Stream.Writable {
    constructor(fileName, domainName, returnFileNames) {
        super();
        this.fileName = fileName;
        this.domainName = domainName;
        this.returnFileNames = returnFileNames;
        this.text = this.domainName ? `Content-Type: application/octet-stream\r\nContent-Disposition: attachment\r\nMessage-ID:<${Uuid.v4()}@>${this.domainName}\r\nContent-Transfer-Encoding: base64\r\nMIME-Version: 1.0\r\n\r\n` : null;
        this.dir = Path.parse(this.fileName).dir;
        this._fileName = Uuid.v4();
        this._count = 0;
        this.saveCount = 0;
        this.saveFileName = null;
    }
    nextFile1() {
        let count = (this._count++).toString();
        if (count.length === 1) {
            count = `0${count}`;
        }
        const uu = Path.join(this.dir, `${this._fileName}.${count}`);
        this.returnFileNames.push(uu);
        return uu;
    }
    saveFileHeader(chunk, CallBack) {
        this.saveFileName = this.nextFile1();
        this.saveCount = 0;
        if (!this.text) {
            return this.saveToFile(chunk, CallBack);
        }
        return Fs.appendFile(this.saveFileName, this.text, 'utf8', err => {
            if (err) {
                return CallBack(err);
            }
            return this.saveToFile(chunk, CallBack);
        });
    }
    saveToFile(chunk, CallBack) {
        const _data = chunk.toString();
        this.saveCount += chunk.length;
        return Fs.appendFile(this.saveFileName, _data, 'utf8', CallBack);
    }
    _write(chunk, encode, next) {
        //	first time
        if (!this.saveFileName) {
            return this.saveFileHeader(chunk, next);
        }
        return this.saveToFile(chunk, err => {
            if (err) {
                return next(err);
            }
            if (this.saveCount > maxSizeForBase64) {
                this.saveFileName = null;
            }
            return next();
        });
    }
}
class deCodeBase64 extends Stream.Writable {
    constructor(fileName) {
        super();
        this.fileName = fileName;
        this.length = 0;
        this.income = 0;
    }
    _write(chunk, encode, next) {
        this.income += chunk.length;
        const uu = Buffer.from(chunk.toString(), 'base64');
        this.length += uu.length;
        console.log(`total incom [${this.income}] outLength [${this.length}]`);
        return Fs.appendFile(this.fileName, uu, 'binary', next);
    }
}
const EncodeBase641 = (fileName, domainName, CallBack) => {
    const returnFiles = [];
    const fileStream = Fs.createReadStream(fileName, { encoding: 'base64' });
    const encode = new encodeBase64(fileName, domainName, returnFiles);
    fileStream.once('error', err => {
        return CallBack(err);
    });
    return fileStream.pipe(encode).once('finish', () => {
        return Fs.unlink(fileName, () => {
            return CallBack(null, returnFiles);
        });
    });
};
exports.sendFile3 = (fileName, imapPeer, CallBack) => {
    return EncodeBase641(fileName, imapPeer.domainName, (err, files) => {
        if (err) {
            return CallBack(err);
        }
        return Async.eachSeries(files, (n, next) => {
            return Imap.trySendToRemoteFromFile1Less10MB4(imapPeer, n, next);
        }, err => {
            if (err) {
                return CallBack(err);
            }
            const _file = files.map(n => {
                const uu = n.split('/videoTemp/');
                return uu[uu.length - 1];
            });
            return CallBack(null, _file);
        });
    });
};
const md5File = (fileName, CallBack) => {
    const kk = Fs.createReadStream(fileName);
    const hash = Crypto.createHash('md5');
    hash.setEncoding('hex');
    kk.once('end', () => {
        console.log(`hash.once end`);
        hash.end();
        return CallBack(null, hash.read());
    });
    kk.pipe(hash);
};
const backFileFromBase64 = (fileName, CallBack) => {
    const kk = Fs.createReadStream(fileName, { encoding: 'utf8' });
    const uu = new deCodeBase64(fileName + '.decode');
    kk.once('error', CallBack);
    kk.pipe(uu).once('finish', CallBack);
};
exports.joinFiles = (files, CallBack) => {
    const _file = files.split(',');
    let outputFileName = _file[0].split('.00')[0];
    if (!outputFileName) {
        return CallBack(new Error(' no file'));
    }
    outputFileName = Path.join(QTGateVideo, outputFileName);
    const _files = _file.map(n => {
        return Path.join(QTGateVideo, n);
        //return 'temp/' + n
    });
    Async.eachSeries(_files, (n, next) => {
        const writeS = new deCodeBase64(outputFileName);
        const readS = Fs.createReadStream(n);
        writeS.once('finish', () => {
            return next();
        });
        writeS.once('error', err => {
            return next(err);
        });
        readS.once('error', err => {
            return next(err);
        });
        return readS.pipe(writeS);
    }, err => {
        if (err) {
            return CallBack(err);
        }
        return CallBack(null, outputFileName);
    });
};
/*
sendFile3 ( Path.join ( QTGateVideo, '88d962e3-e07d-4229-8e64-ba55800fdbd0.mp4'), { domainName: null }, ( err, data ) => {
    if ( err ) {
        return console.log ( err )
    }
    console.log (`success!, tt [${ data }]`)
})

const hh = 'ce3ddfa0-c420-4c64-a6ce-ee7512ba9cfd'
const getPart = ( name: string, n: number ) => {
    const ret = []
    for ( let i = 0; i < n; i ++ ) {
        let ii = i.toString()
        if ( ii.length === 1 ) {
            ii = '0' + ii
        }
        ret.push ( `${ name }.${ii}`)
    }
    return ret
}

const uu = ['487e0d28-f6c1-40fc-baee-391b0f5027ac.00', '487e0d28-f6c1-40fc-baee-391b0f5027ac.01','487e0d28-f6c1-40fc-baee-391b0f5027ac.02','487e0d28-f6c1-40fc-baee-391b0f5027ac.03','487e0d28-f6c1-40fc-baee-391b0f5027ac.04','487e0d28-f6c1-40fc-baee-391b0f5027ac.05','487e0d28-f6c1-40fc-baee-391b0f5027ac.06']
const u = uu.join (',')

joinFiles ( getPart(hh, 6).join (','), ( err , tt ) => {
    if ( err ) {
        return console.log ( err )
    }
    console.log (`success!, tt [${ tt }]`)
})
/** */
