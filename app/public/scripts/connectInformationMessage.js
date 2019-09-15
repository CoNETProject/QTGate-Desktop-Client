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
    offline: ['无互联网链接', 'インターネットに接続していないです', 'Have no Internet', '無互聯網連結']
};
class connectInformationMessage {
    constructor(socketIo) {
        this.offlineInfo = ko.observable(false);
        this.showNegative = ko.observable(false);
        this.showGreen = ko.observable(false);
        this.messageArray = ko.observable(null);
        this.first = true;
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
    }
    showOfflineMessage(err) {
        this.messageArray(messageBoxDefine[err]);
        this.showNegative(true);
        this.offlineInfo(true);
    }
    hideMessage() {
        this.offlineInfo(false);
        this.messageArray(null);
        this.showNegative(false);
    }
}
