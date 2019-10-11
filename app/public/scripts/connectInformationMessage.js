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
const messageBoxDefine = {
    offline: [' 无互联网链接 ', ' インターネットに接続していないです ', ' Have no Internet ', ' 無互聯網連結 '],
    systemError: ['CoNET客户端故障，请重启后再试', '端末故障です、CoNETを再起動してください', 'CoNET client error! Restart CoNET please!', 'CoNET客戶端故障，請重啟後再試'],
    reConnectCoNET: ['CoNET链接已中断', 'CoNETとの接続が中断され', 'CoNET connection lost.', 'CoNET的鏈接已中斷'],
    connectingToCoNET: ['正在连接CoNET...', 'CoNETへ接続中...', 'Connecting to CoNET...', '正在連結CoNET...'],
    connectedToCoNET: ['成功连接CoNET', 'CoNETに接続しました', 'Success to connect CoNET', '成功連結CoNET'],
    timeOut: [
        'CoNET节点无响应，节点可能正在忙碌中，请稍后再试',
        'CoNETノートからの応答がなかったです、サーバー側は忙しいかもしれませんが、後ほどもう一度してみてください。',
        'CoNET node not responding to requests. Maybe busy now, try again later.',
        'CoNET節點無響應，節點可能正在忙碌中，請稍後再試'
    ],
    sendConnectRequestMail: [
        '客户端正向CoNET系统发出联机请求Email。这需要额外的时间，请耐心等待。',
        '接続要請メールをCoNETシステムへ送信しました、接続を完了するまで時間がかかるのため、しばらくお待ちおください。',
        'Sending connection request email to CoNET. Please wait a moment, re-connecting to CoNET.',
        '客戶端正向CoNET發出聯網請求Email。這需要額外的時間，請耐心等待。'
    ],
    maximumRequest: [
        '您的请求已达最大值，请稍后再试',
        'レクエスト回数は制限にかかった、後ほど改めてお試しください',
        'Request maximum error. Try again later.',
        '您的請求已達最大值，請稍後再試'
    ],
    invalidRequest: [
        '无效请求',
        '無効なレクエスト',
        'Invalid request.',
        '無效請求'
    ],
    unKnowError: [
        '未知错误，请再试！如果持续发生请重启CoNET客户端或重新安装',
        '不明なエラーが発生、もしこんな状況が続くであれば、CoNET端末を再起動するか、CoNET端末を再インストールしてください。',
        'Opps. Unknow error. Try again or restart CoNET client, if still same error please re-install CoNET.',
        '未知错误，请再试！如果持续发生请重启CoNET客户端或重新安装'
    ],
    NodeInBusy: [
        '节点目前繁忙，请稍后再试', 'ノードは忙しいです。しばらくしてからもう一度お試しください', 'Node is currently busy, please try again later', '节点目前繁忙，请稍后再试'
    ]
};
class connectInformationMessage {
    constructor(url = "/") {
        this.url = url;
        this.offlineInfo = ko.observable(false);
        this.showNegative = ko.observable(false);
        this.showGreen = ko.observable(false);
        this.messageArray = ko.observable(null);
        this.socketIoOnline = true;
        this.socketIo = io(`http://localhost:3000${this.url}`, { reconnectionAttempts: 5, timeout: 500, autoConnect: true });
        this.first = true;
        const self = this;
        this.offlineInfo.subscribe(function (vv) {
            if (this.first) {
                return;
            }
            const div = $('#offlineInfo');
            if (vv) {
                return div.transition('fly down');
            }
            div.transition('fly down');
        });
        this.first = false;
        this.socketIo.on('reconnect_failed', () => {
            this.socketIoOnline = false;
            self.showErrorMessage('systemError');
        });
        this.socketIo.on('reconnect', attempt => {
            this.socketIoOnline = true;
            this.hideMessage();
        });
        this.socketIo.on('systemErr', err => {
            self.showErrorMessage(err);
        });
    }
    sockEmit(eventName, ...args) {
        const self = this;
        if (!this.socketIoOnline) {
            return this.showErrorMessage('systemError');
        }
        const argLength = args.length - 1;
        let _CallBack = null;
        if (argLength > -1 && typeof (args[argLength]) === 'function') {
            _CallBack = args.pop();
        }
        this.socketIo.emit(eventName, ...args, (err, ...data) => {
            if (err) {
                self.showErrorMessage(err);
            }
            if (_CallBack) {
                return _CallBack(err, ...data);
            }
        });
    }
    showErrorMessage(err) {
        if (!err) {
            return;
        }
        const errMes = (typeof err === "string") ? messageBoxDefine[err] : messageBoxDefine[err.message] || err.message;
        if (!errMes) {
            return;
        }
        this.hideMessage();
        this.messageArray(errMes);
        this.showNegative(true);
        this.offlineInfo(true);
    }
    showSystemError() {
        return this.showErrorMessage('systemError');
    }
    showRestartCoNET_Connect() {
        this.showErrorMessage('reConnectCoNET');
    }
    hideMessage() {
        this.offlineInfo(false);
        this.messageArray(null);
        this.showNegative(false);
    }
    getErrorIndex(err) {
        if (!err) {
            return 'unKnowError';
        }
        if (typeof err !== 'object') {
            return messageBoxDefine[err] ? err : 'unKnowError';
        }
        return messageBoxDefine[err['message']] ? err['message'] : 'unKnowError';
    }
}
