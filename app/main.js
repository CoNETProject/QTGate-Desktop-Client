"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const localWebServer_1 = require("./localWebServer");
const test = /^true$/.test(process.argv[2]) ? true : false;
const _start = process.argv[3] || false;
exports.start = (cmd, _test) => {
    const localServer = new localWebServer_1.default(cmd, _test);
};
if (_start) {
    exports.start(null, false);
}
