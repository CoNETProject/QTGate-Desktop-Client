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
const Compress = require("./compress");
const Net = require("net");
const res = require("./res");
const Stream = require("stream");
const Crypto = require("crypto");
const Day = 1000 * 60 * 60 * 24;
const otherRequestForNet = (path, host, port, UserAgent) => {
    if (path.length < 1024 + Math.round(Math.random() * 4000))
        return `GET /${path} HTTP/1.1\r\n` +
            `Host: ${host}${port !== 80 ? ':' + port : ''}\r\n` +
            `Accept: */*\r\n` +
            `Accept-Language: en-ca\r\n` +
            `Connection: keep-alive\r\n` +
            `Accept-Encoding: gzip, deflate\r\n` +
            `User-Agent: ${UserAgent ? UserAgent : 'Mozilla/5.0'}\r\n\r\n`;
    return `POST /${Crypto.randomBytes(10 + Math.round(Math.random() * 1500)).toString('base64')} HTTP/1.1\r\n` +
        `Host: ${host}${port !== 80 ? ':' + port : ''}\r\n` +
        `Content-Length: ${path.length}\r\n\r\n` +
        path + '\r\n\r\n';
};
class hostLookupResponse extends Stream.Writable {
    constructor(CallBack) {
        super();
        this.CallBack = CallBack;
    }
    _write(chunk, enc, next) {
        //console.log ( `hostLookupResponse _write come [${ chunk.toString()}]`)
        const ns = chunk.toString('utf8');
        try {
            const _ret = JSON.parse(ns);
            const ret = {
                expire: new Date().getTime() + Day,
                dns: _ret
            };
            this.CallBack(null, ret);
            next();
            return this.end();
        }
        catch (e) {
            return next(e);
        }
    }
}
class gateWay {
    constructor(multipleGateway) {
        this.multipleGateway = multipleGateway;
        this.userAgent = null;
        this.currentGatewayPoint = 0;
        this.RemoteServerDistroyed = false;
    }
    request(str, gateway) {
        return Buffer.from(otherRequestForNet(str, gateway.gateWayIpAddress, gateway.gateWayPort, this.userAgent), 'utf8');
    }
    getCurrentGateway() {
        if (this.multipleGateway.length === 1) {
            return this.multipleGateway[0];
        }
        if (++this.currentGatewayPoint > this.multipleGateway.length - 1) {
            this.currentGatewayPoint = 0;
        }
        return this.multipleGateway[this.currentGatewayPoint];
    }
    hostLookup(hostName, userAgent, CallBack) {
        const _data = new Buffer(JSON.stringify({ hostName: hostName }), 'utf8');
        const gateway = this.getCurrentGateway();
        const encrypt = new Compress.encryptStream(gateway.randomPassword, 3000, (str) => {
            return this.request(str, gateway);
        });
        const finish = new hostLookupResponse(CallBack);
        const httpBlock = new Compress.getDecryptClientStreamFromHttp();
        const decrypt = new Compress.decryptStream(gateway.randomPassword);
        const _socket = Net.createConnection(gateway.gateWayPort, gateway.gateWayIpAddress, () => {
            encrypt.write(_data);
        });
        _socket.once('end', () => {
            //console.log ( `_socket.once end!` )
        });
        _socket.once('error', err => {
            return CallBack(err);
        });
        httpBlock.once('error', err => {
            console.log(`httpBlock.on error`, err);
            _socket.end(res._HTTP_502);
            return CallBack(err);
        });
        decrypt.once('err', err => {
            CallBack(err);
        });
        encrypt.pipe(_socket).pipe(httpBlock).pipe(decrypt).pipe(finish);
    }
    requestGetWay(id, uuuu, userAgent, socket) {
        //			remote server was stoped
        if (this.RemoteServerDistroyed) {
            console.log(`requestGetWay this.RemoteServerDistroyed === true !`);
            return socket.end(res._HTTP_404);
        }
        this.userAgent = userAgent;
        const gateway = this.getCurrentGateway();
        //		remote gateway error
        if (!gateway) {
            return socket.end(res._HTTP_404);
        }
        const decrypt = new Compress.decryptStream(gateway.randomPassword);
        const encrypt = new Compress.encryptStream(gateway.randomPassword, 3000, (str) => {
            return this.request(str, gateway);
        });
        const httpBlock = new Compress.getDecryptClientStreamFromHttp();
        httpBlock.once('error', err => {
            socket.end(res._HTTP_404);
        });
        encrypt.once('end', () => {
            //console.log (`encrypt.once end` )
            socket.end(res._HTTP_404);
        });
        encrypt.once('error', err => {
            console.log(`encrypt.once error`, err);
            socket.end(res._HTTP_404);
        });
        const _socket = Net.createConnection(gateway.gateWayPort || 80, gateway.gateWayIpAddress, () => {
            if (encrypt && encrypt.writable) {
                return encrypt.write(Buffer.from(JSON.stringify(uuuu), 'utf8'));
            }
            console.log(`encrypt.writable == false `);
            return socket.end(res._HTTP_404);
        });
        _socket.once('error', err => {
            socket.end(res._HTTP_404);
        });
        _socket.once('end', () => {
            socket.end(res._HTTP_404);
        });
        encrypt.pipe(_socket).pipe(httpBlock).pipe(decrypt).pipe(socket).pipe(encrypt);
        //console.log ( `new requestGetWay use gateway[${ gateway.gateWayIpAddress }: ${ gateway.gateWayPort || 80 }]`)
    }
}
exports.default = gateWay;
