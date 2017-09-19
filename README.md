# QTGATE client - Open Source

[![Gitter](https://img.shields.io/badge/chat-on%20gitter-blue.svg)](https://gitter.im/QTGate/Lobby)

## Description 概要

This is QTGATE client software install build  
QTGATE is a service that use email IMAP protocol to make a virtual tunnel that exchanges packets between clients and servers. [QTGATE](https://www.qtgate.com).
The excellent point is QTGATE exchanges data by email account, client and server do not need IP address. Nobody know where you from even QTGATE system.

這是 QTGATE 客戶端 install.  
QTGATE是一种安全通讯手段，通过eMail的IMAP协议建立一个虚拟的专用通道，连接客户端和代理服务器，它的奇妙之处在于客户端和服务器彼此不用知道相互的IP地址，而是通过共用一个eMail账号进行数据交换，QTGATE系统把VPN包加密后，利用IMAP进行通讯，能最大限度的保护您的网络通讯不被检测和干扰，建立一个私密的网络安全环境。

このプロジェクトはQTGATE端末用ソフトです.  
QTGATEとは、eMailの通信プロトコルIMAPを使用して、端末とサーバの間に、仮想のネットワークトンネルを構築し、さらにVPNをカプセル化にしたことで、どんな端末からも利用することができます。QTGATEの一番重要な特徴は，端末とサーバの通信がIPアドレスではなく、一つのeMailアカウントを使います。それによって世界中に安全と自由な通信ができるようになります。
![http protocol](/resources/startScreen.jpeg?raw=true)

![http protocol](/resources/vpn.email11.jpg?raw=true)


## Build 編譯 ビルド

bozon package [mac|windows|linux]

[Multi Platform Build 如何編譯多平台APP可參照 マルチOSのビルドにつて](https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build)

## Notice 注意事項 

This bate version only support http & https proxy
當前版本只對應 http 和 https proxy
このパージョンは　http と https proxy　しか対応していますので、ご注意してください。

## License 版權 

Copyright (c) QTGate Systems Inc. All rights reserved.

Licensed under the [MIT](LICENSE) License.