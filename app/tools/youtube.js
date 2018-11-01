"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const url_1 = require("url");
class default_1 {
    constructor(socket) {
        this.socket = socket;
        this.socket_listing();
    }
    youtubeSearch(text, CallBack) {
        const url = new url_1.URLSearchParams();
        url.append('q', text);
        url.append('maxResults', '25');
        url.append('eventType', 'completed');
        url.append('part', 'snippet');
        url.append('key', 'AIzaSyD-xrq7pEnjhli8H75VD1vJov4Tdo8IWTI');
        const cmd = `curl -s -G -d "${url.toString()}" https://www.googleapis.com/youtube/v3/search/`;
        console.log(cmd);
        return child_process_1.exec(cmd, (err, stdout, stderr) => {
            if (err) {
                return CallBack(err);
            }
            console.log(`stdout\n${stdout}`);
            console.log(`stdout\n${stderr}`);
            let ret = null;
            try {
                ret = JSON.parse(stdout);
            }
            catch (ex) {
                return CallBack(ex);
            }
            return CallBack(ret);
        });
    }
    socket_listing() {
        return this.socket.on('youtube_search', (text, CallBack1) => {
            console.log(`Youtu search come!`, text);
            CallBack1();
            return this.socket.emit('youtube_search', 1);
            return this.youtubeSearch(text, (err, data) => {
                if (err) {
                    console.log(`this.youtubeSearch return err!`);
                    return this.socket.emit('youtube_search', 1);
                }
                console.log(`success!`);
                return this.socket.emit('youtube_search', null, data);
            });
        });
    }
}
exports.default = default_1;
