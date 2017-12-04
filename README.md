# QTGATE client - Open Source
[![Build Status](https://travis-ci.org/QTGate/QTGate-Desktop-Client.svg?branch=master)](https://travis-ci.org/QTGate/QTGate-Desktop-Client)
[![Gitter](https://img.shields.io/badge/chat-on%20gitter-blue.svg)](https://gitter.im/QTGate/Lobby)

## Description 概要

This is QTGATE client software install build  
QTGATE is a service that use email IMAP protocol to make a virtual tunnel that exchanges packets between clients and servers. [QTGATE](https://www.qtgate.com).
The excellent point is QTGATE exchanges data by email account, client and server do not need IP address. Nobody know where you from even QTGATE system.
QTGate have a local proxy server support HTTP HTTPS SOCKS 4,4a,5. All other devices can use QTGate via ths local proxy server.

這是 QTGATE 客戶端 install.  
QTGATE是一种安全通讯手段，通过eMail的IMAP协议建立一个虚拟的专用通道，连接客户端和代理服务器，它的奇妙之处在于客户端和服务器彼此不用知道相互的IP地址，而是通过共用一个eMail账号进行数据交换，QTGATE系统把VPN包加密后，利用IMAP进行通讯，能最大限度的保护您的网络通讯不被检测和干扰，建立一个私密的网络安全环境。
QTGATE提供本地Proxy服務器對應HTTP, HTTPS, SOCKS 4,4a,5。其他設備可以通過設置proxy來使用QTGate.

このプロジェクトはQTGATE端末用ソフトです.
QTGATEとは、eMailの通信プロトコルIMAPを使用して、端末とサーバの間に、仮想のネットワークトンネルを構築し、さらにVPNをカプセル化にしたことで、どんな端末からも利用することができます。QTGATEの一番重要な特徴は，端末とサーバの通信がIPアドレスではなく、一つのeMailアカウントを使います。それによって世界中に安全と自由な通信ができるようになります。
QTGATEはローカルプロキシサーバを提供して、HTTP, HTTPS, SOCKS 4,4a,5をカバーすることで、他のデバイスはローカルプロキシサーバを経由QTGATEサービスをご利用いただきます。
![http protocol](/resources/canada150.png?raw=true)

![http protocol](/resources/vpn.email11.jpg?raw=true)

## Download 下載 ダウンロード

### [The latest 最新版](https://github.com/QTGate/QTGate-Desktop-Client/releases/latest/)

* Windows32: qtgate.Setup.?.?.?.ia32.exe
* Windows64: qtgate.Setup.?.?.?.exe
* MacOS: qtgate-?.?.?.dmg
* Linux: qtgate_?.?.?_amd64.deb


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