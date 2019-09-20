"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const Crypto = require("crypto");
const Util = require("util");
const Fs = require("fs");
const Path = require("path");
const Tool = require("./initSystem");
const uploadFile_1 = require("./uploadFile");
const searchImageMaxWidth = 2048;
const searchImageMaxHeight = 2048;
const saveSnapshop = (src, sessionHash, _CallBack) => {
    const ret = {
        mHtml: `${sessionHash}.mht`,
        png: `${sessionHash}.png`
    };
    return Fs.writeFile(Path.join(Tool.QTGateTemp, ret.mHtml), src.mHtml, 'UTF8', err => {
        if (err) {
            return _CallBack(err);
        }
        return Fs.writeFile(Path.join(Tool.QTGateTemp, ret.png), Buffer.from(src.png, 'base64'), 'binary', _err => {
            if (_err) {
                return _CallBack(err);
            }
            ret.mHtml = '/tempfile/' + ret.mHtml;
            ret.png = '/tempfile/' + ret.png;
            return _CallBack(null, ret);
        });
    });
};
const searchCommandNextSelect = ['searchNext', 'newsNext', 'imageNext', 'videoNext'];
class coSearchServer {
    constructor(sessionHash, socket, saveLog, clientName, localServer) {
        this.sessionHash = sessionHash;
        this.socket = socket;
        this.saveLog = saveLog;
        this.localServer = localServer;
        socket.on(`search`, (searchText, width, height, CallBack) => {
            saveLog(`coSearchServer [${clientName}] on [search] [${searchText}] `);
            const com = {
                command: 'CoSearch',
                Args: null,
                error: null,
                subCom: null,
                requestSerial: Crypto.randomBytes(8).toString('hex')
            };
            if (Tool.checkUrl(searchText)) {
                console.log(`on getSnapshop \nurl=[${searchText}]\nwidth=[${width}]\nheight=[${height}]`);
                //const fileName = '4e4e29bc-3963-4551-b218-660022dd906e'
                //socket.emit ( 'search', null, null, { url: searchText, localUrl: `/tempfile/temp/${ fileName }.html`, png: `/tempfile/temp/${ fileName }.png`, height: height } )
                com.Args = [searchText, sessionHash, width, height];
                com.subCom = 'getSnapshop';
                return localServer.sendRequest(socket, com, sessionHash, (err, res) => {
                    if (err) {
                        return saveLog(`coSearchServer [${clientName}] getSnapshop on ERROR[${err.message}] `);
                    }
                    if (res && res.error === -1) {
                        return console.log(`Get process response !`);
                    }
                    console.log(`getSnapshop get result ${Util.inspect(res.Args, false, 3, true)} typeof res.Args = [${typeof res.Args}] `);
                    localServer.getHTMLCompleteZIP(res.Args[0], Tool.QTGateTemp, err => {
                        if (err) {
                            return console.log(`localServer.getHTMLCompleteZIP get ERROR`, err);
                        }
                        const u = res.Args[0];
                        const fileName = u.split('.')[0];
                        CallBack(null, null, { localUrl: `/tempfile/temp/${fileName}.html`, png: `/tempfile/temp/${fileName}.png`, height: height });
                    });
                });
            }
            com.Args = [sessionHash, 'google', searchText];
            com.subCom = 'webSearch';
            //const uuu = {"command":"webSearch","Args":{"command":"GoogleSearch","sessionHash":"24dc2b9d-59c2-4d43-bb93-32d5a3d48621","param":{"resultLength":9,"totalResults":"1,850,000","Result":[{"title":"郭文貴- 維基百科，自由的百科全書 - Wikipedia","url":"https://zh.wikipedia.org/zh-hant/%E9%83%AD%E6%96%87%E8%B4%B5","description":"郭文貴是山東省莘縣人，戶籍地為北京大興區。在其發布於2017年5月11日的「報平安」視頻中，他表示自己在2017年是48歲（虛歲），生日是5月10日（1970年）。","urlShow":"https://zh.wikipedia.org/zh-hant/郭文贵","beforeTime":{"number":null,"unit":null}},{"title":"中南海鬥爭「白熱化」 郭文貴再爆驚人內幕- 自由財經","url":"https://ec.ltn.com.tw/article/breakingnews/2798534","description":"郭文貴表示，前中國證監會主席劉士余的落馬，證明中南海鬥爭「已經白熱化」。（圖擷自郭媒體網站）. 〔財經頻道／綜合報導〕中共中央紀委國家監委 ...","urlShow":"https://ec.ltn.com.tw/article/breakingnews/2798534","beforeTime":{"number":null,"unit":"unknow"}},{"title":"FOX主播Trish Regan 回應官媒毫無懼色｜郭文貴直播  最新爆料 ...","url":"https://www.youtube.com/watch?v=se13zT52wwQ","description":"2019年5月23日福斯電視女主播翠西·裡根（Trish Regan）意外成為中共貿易戰攻擊的新目標，她用其特有的美式主播方式，強硬回擊中共大外宣。","urlShow":"https://www.youtube.com/watch?v=se13zT52wwQ","beforeTime":{"number":null,"unit":"unknow"}},{"title":"\"先知\"郭文貴曾說中郭台銘將參選這次再爆人民幣將大換版!  【國際大 ...","url":"https://www.youtube.com/watch?v=D169n2hiJko","description":"▶ 1:52深度節目及國際時事都在這裡【從台灣看見世界的故事】 ➲新聞HD直播三立LIVE新聞https://goo.gl/7FaFJW ➲追蹤消失的國界粉絲團：http://bit.ly/ ...","urlShow":"https://www.youtube.com/watch?v=D169n2hiJko","beforeTime":{"number":null,"unit":null}},{"title":"郭文貴直播05月18日：沒有猛料，兌現一些承諾而已； - YouTube","url":"https://www.youtube.com/watch?v=2fPPzEmVEEI","description":"▶ 1:50:20中共想當亞洲老大①4-5年前就籌備當時沒想到美國選出個川普做夢都沒想到出來個郭文貴沒想到會出華為事件②這次在鳥巢開會大家注意幾個細節 ...","urlShow":"https://www.youtube.com/watch?v=2fPPzEmVEEI","beforeTime":{"number":null,"unit":null}},{"title":"節目缺錢說一聲！ 郭文貴「霸氣力挺」感動彭P｜政經關不了（精華版 ...","url":"https://www.youtube.com/watch?v=VZMJsnA_SNw","description":"▶ 2:00該集完整版：https://youtu.be/B1-FWjVxrp0 ➤《政經關不了》Facebook粉絲專頁：http://www.facebook.com/TrueVoiceofTaiwan ➤《政經 ...","urlShow":"https://www.youtube.com/watch?v=VZMJsnA_SNw","beforeTime":{"number":null,"unit":null}},{"title":"長青藏錄：VOA斷播事件- 郭文貴錯在哪裏？ - YouTube","url":"https://www.youtube.com/watch?v=gprib_3bwSU","description":"▶ 52:21跳過片頭:: 00:00:10 ○郭文貴錯在哪裏？","urlShow":"https://www.youtube.com/watch?v=gprib_3bwSU","beforeTime":{"number":null,"unit":null}},{"title":"#郭文貴hashtag on Twitter","url":"https://twitter.com/hashtag/%E9%83%AD%E6%96%87%E8%B2%B4","description":"See Tweets about #郭文貴on Twitter. See what people are saying and join the conversation.","urlShow":"https://twitter.com/hashtag/郭文貴","beforeTime":{"number":null,"unit":null}},{"title":"郭文貴- 中國禁聞網 - 禁闻","url":"https://www.bannedbook.org/bnews/zh-tw/tag/%E9%83%AD%E6%96%87%E8%B4%B5/","description":"編者按：2019年2月27日博訊老闆韋石在他自己的推特上污衊阿波羅網是江蘇國安運營等。阿波羅網要求韋石提供證據[…] 日期：2019年05月15日| 分類：圖片新聞 ...","urlShow":"https://www.bannedbook.org/bnews/zh-tw/tag/郭文贵/","beforeTime":{"number":null,"unit":null}}],"searchesRelated":[{"text":"郭文貴youtube","searchKey":"/search?q=%E9%83%AD%E6%96%87%E8%B2%B4youtube&sa=X&ved=2ahUKEwiUoZDGkbbiAhUFBGMBHbLqB14Q1QIoAHoECAgQAQ"},{"text":"郭文貴是誰","searchKey":"/search?q=%E9%83%AD%E6%96%87%E8%B2%B4%E6%98%AF%E8%AA%B0&sa=X&ved=2ahUKEwiUoZDGkbbiAhUFBGMBHbLqB14Q1QIoAXoECAgQAg"},{"text":"郭文貴最新消息","searchKey":"/search?q=%E9%83%AD%E6%96%87%E8%B2%B4%E6%9C%80%E6%96%B0%E6%B6%88%E6%81%AF&sa=X&ved=2ahUKEwiUoZDGkbbiAhUFBGMBHbLqB14Q1QIoAnoECAgQAw"},{"text":"郭文貴爆料","searchKey":"/search?q=%E9%83%AD%E6%96%87%E8%B2%B4%E7%88%86%E6%96%99&sa=X&ved=2ahUKEwiUoZDGkbbiAhUFBGMBHbLqB14Q1QIoA3oECAgQBA"},{"text":"郭文貴習近平","searchKey":"/search?q=%E9%83%AD%E6%96%87%E8%B2%B4%E7%BF%92%E8%BF%91%E5%B9%B3&sa=X&ved=2ahUKEwiUoZDGkbbiAhUFBGMBHbLqB14Q1QIoBHoECAgQBQ"},{"text":"郭文貴兒子","searchKey":"/search?q=%E9%83%AD%E6%96%87%E8%B2%B4%E5%85%92%E5%AD%90&sa=X&ved=2ahUKEwiUoZDGkbbiAhUFBGMBHbLqB14Q1QIoBXoECAgQBg"},{"text":"郭文貴twitter","searchKey":"/search?q=%E9%83%AD%E6%96%87%E8%B2%B4twitter&sa=X&ved=2ahUKEwiUoZDGkbbiAhUFBGMBHbLqB14Q1QIoBnoECAgQBw"},{"text":"郭文貴台灣","searchKey":"/search?q=%E9%83%AD%E6%96%87%E8%B2%B4%E5%8F%B0%E7%81%A3&sa=X&ved=2ahUKEwiUoZDGkbbiAhUFBGMBHbLqB14Q1QIoB3oECAgQCA"},{"text":"郭文貴ptt","searchKey":"/search?q=%E9%83%AD%E6%96%87%E8%B2%B4ptt&sa=X&ved=2ahUKEwiUoZDGkbbiAhUFBGMBHbLqB14Q1QIoCHoECAgQCQ"},{"text":"郭文貴香港","searchKey":"/search?q=%E9%83%AD%E6%96%87%E8%B2%B4%E9%A6%99%E6%B8%AF&sa=X&ved=2ahUKEwiUoZDGkbbiAhUFBGMBHbLqB14Q1QIoCXoECAgQCg"}],"nextPage":"/search?q=%E9%83%AD%E6%96%87%E8%B2%B4&ei=2evoXNTQEIWIjLsPstWf8AU&start=10&sa=N&ved=0ahUKEwiUoZDGkbbiAhUFBGMBHbLqB14Q8NMDCKQB","action":{"video":"/search?q=%E9%83%AD%E6%96%87%E8%B2%B4&source=lnms&tbm=vid&sa=X&ved=0ahUKEwiUoZDGkbbiAhUFBGMBHbLqB14Q_AUIDygC","image":"/search?q=%E9%83%AD%E6%96%87%E8%B2%B4&source=lnms&tbm=isch&sa=X&ved=0ahUKEwiUoZDGkbbiAhUFBGMBHbLqB14Q_AUIECgD","news":"/search?q=%E9%83%AD%E6%96%87%E8%B2%B4&source=lnms&tbm=nws&sa=X&ved=0ahUKEwiUoZDGkbbiAhUFBGMBHbLqB14Q_AUIDigB"}},"publicKeyID":null,"HtmlDockerClass":null,"dockerName":"GoogleSearch"},"error":null,"requestSerial":"ab845d0064b7abe6","requestTimes":2,"account":"peter@conettech.ca","fingerprint":"3E4354727A628E1B3CBFB710350078DB22DFABF7"}
            //socket.emit ( 'search', null, uuu.Args )
            return localServer.sendRequest(socket, com, sessionHash, (err, res) => {
                if (err) {
                    CallBack(err);
                    return saveLog(`coSearchServer [${clientName}] search sendRequest on ERROR[${err.message}] `);
                }
                if (res && res.error === -1) {
                    CallBack(res.error);
                    return saveLog(`CoNET responer error! ${Util.inspect(res, false, 3, true)}`);
                }
                return CallBack(null, res.Args);
            });
        });
        socket.on('searchNext', (currentlyList, nextLink, callback1) => {
            callback1();
            const com = {
                command: 'CoSearch',
                Args: [sessionHash, 'google', nextLink],
                error: null,
                subCom: searchCommandNextSelect[currentlyList],
                requestSerial: Crypto.randomBytes(8).toString('hex')
            };
            console.log(`on searchNext currentlyList [${currentlyList}] [${nextLink}]`);
            return localServer.sendRequest(socket, com, sessionHash, (err, res) => {
                if (err) {
                    return saveLog(`coSearchServer [${clientName}] search sendRequest on ERROR[${err.message}] `);
                }
                if (res && res.error === -1) {
                    return console.log(`Get process response !`);
                }
                return socket.emit('searchNext', null, res.Args);
            });
        });
        socket.on('getSnapshop', (url, width, height, callback1) => {
            callback1();
            const com = {
                command: 'CoSearch',
                Args: [url, sessionHash, width, height],
                error: null,
                subCom: 'getSnapshop',
                requestSerial: Crypto.randomBytes(8).toString('hex')
            };
            console.log(`on getSnapshop \nurl=[${url}]\nwidth=[${width}]\nheight=[${height}]`);
            return localServer.sendRequest(socket, com, sessionHash, (err, res) => {
                if (err) {
                    return saveLog(`coSearchServer [${clientName}] getSnapshop on ERROR[${err.message}] `);
                }
                if (res && res.error === -1) {
                    return console.log(`getSnapshop Get process response !`);
                }
                console.log(`getSnapshop get result ${res.Args} typeof res.Args = [${typeof res.Args}] `);
                localServer.getHTMLCompleteZIP(res.Args[0], Tool.QTGateTemp, err => {
                    if (err) {
                        return console.log(`localServer.getHTMLCompleteZIP get ERROR`, err);
                    }
                    const u = res.Args[0];
                    const fileName = u.split('.')[0];
                    socket.emit('getSnapshop', null, null, { localUrl: `/tempfile/temp/${fileName}.html`, png: `/tempfile/temp/${fileName}.png`, height: height });
                });
            });
        });
        socket.on('searcImage', (rawImage, callback1) => {
            callback1();
            return uploadFile_1.getPictureBase64MaxSize_mediaData(rawImage, searchImageMaxWidth, searchImageMaxHeight, (err, data) => {
                if (err) {
                    return socket.emit('searcImage', 0);
                }
                console.log(data.length);
            });
        });
    }
}
exports.default = coSearchServer;
