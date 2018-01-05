# QTGate client, QTGate端末, 赳梯客戶端
[![Build Status](https://travis-ci.org/QTGate/QTGate-Desktop-Client.svg?branch=master)](https://travis-ci.org/QTGate/QTGate-Desktop-Client)
[![Gitter](https://img.shields.io/badge/chat-on%20gitter-blue.svg)](https://gitter.im/QTGate/Lobby)
[![Known Vulnerabilities](https://snyk.io/test/github/qtgate/qtgate-desktop-client/badge.svg)](https://snyk.io/test/github/qtgate/qtgate-desktop-client)
## Description 項目概要

**QTGate** client software install build.
QTGate’s OPN services allow users to stay private and secure while accessing the open internet. [QTGATE](https://www.qtgate.com).
**QTGate** has engineered unique networking technologies used to establish “Quiet” private networks by obfuscating encrypted data packets to ensure data is secure and your identity stays protected. Designed to bypass deep packet inspection (DPI) firewalls while providing secure and private access to the open internet, anywhere in the world.
QTGate keeps no logs of your online traffic and all data is encrypted using industry-tested and accepted encryption standards. Use QTGate’s OPN services to access the open internet with total protection and security.

[@OPN](https://github.com/QTGate/atOPN) is our patent pending technology that creates a “Quiet” private network by obfuscating encrypted data packets over IMAP email servers, refracting the data thru our QTGate servers, to achieve an obfuscated private network. @OPN provides true anonymous internet communications, where your IP address is fully hidden to our servers and target servers.

[iOPN](https://github.com/QTGate/iOPN) uses our technology to create a “Quiet” private network by obfuscating encrypted data traffic over HTTP, refracting the data thru our QTGate servers, to achieve an obfuscated private network. iOPN offer faster connections than the standard privacy enhancing tools with the add benefits of QTGate’s OPN.

***

這是**赳梯**客戶端安裝程序.
**赳梯**是匿名網絡環境。它有三個匿名工具號稱匿名三劍客。
- 赳梯代理服務器讓您能夠悄無聲息的穿梭在互聯網中
    * [@OPN](https://github.com/QTGate/atOPN)是IMAP協議下的網絡通訊混淆技術，讓您無IP地址訪問互聯網
    * [iOPN](https://github.com/QTGate/iOPN)是HTTP協議下的網絡通訊混淆技術，讓您高速無障礙訪問互聯網
    赳梯匿名網絡採用最尖端的雲服務集成系統，它的核心服務器群隱藏在雲之中，不接受任何直接的訪問。
    顯露在外的各個代理服務區域中，有大量的按需分配的代理服務器，每台代理服務器均設置個位數的客戶上限，能幹讓每個客戶端保持同等的通訊質量。每台代理服務器每二個小時變換IP地址，並更新和客戶端加密密碼。

![http protocol](/resources/canada150.png?raw=true)

![http protocol](/resources/vpn.email11.jpg?raw=true)

## Download 下載 ダウンロード

### [The latest 最新版 v1.2.1](https://github.com/QTGate/QTGate-Desktop-Client/releases/latest/)

[v 1.2.1 for windows32](https://github.com/QTGate/QTGate-Desktop-Client/releases/download/v1.2.1/qtgate.Setup.1.2.1.ia32.exe)

[v 1.2.1 for windows64](https://github.com/QTGate/QTGate-Desktop-Client/releases/download/v1.2.1/qtgate.Setup.1.2.1.exe)

[v 1.2.1 for MacOS](https://github.com/QTGate/QTGate-Desktop-Client/releases/download/v1.2.1/qtgate-1.2.1.dmg)

[v 1.2.1 for Linux](https://github.com/QTGate/QTGate-Desktop-Client/releases/download/v1.2.1/qtgate_1.2.1_amd64.deb)



## Build 編譯 ビルド

npm run [mac|win32|win|linux]

[Multi Platform Build 如何編譯多平台APP可參照 マルチOSのビルドにつて](https://www.electron.build/multi-platform-build)

## Notice 注意事項 

This bate version have not support UDP proxy

當前版本UDP未對應

このパージョンはUDP対応しておりませんので、ご注意してください。

## License 版權 

Copyright (c) QTGate Systems Inc. All rights reserved.

Licensed under the [MIT](LICENSE) License.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.