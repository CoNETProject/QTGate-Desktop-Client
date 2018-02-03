# QTGate client, QTGate端末, Q梯客戶端
[![Build Status](https://travis-ci.org/QTGate/QTGate-Desktop-Client.svg?branch=master)](https://travis-ci.org/QTGate/QTGate-Desktop-Client)
[![Gitter](https://img.shields.io/badge/chat-on%20gitter-blue.svg)](https://gitter.im/QTGate/Lobby)
[![Known Vulnerabilities](https://snyk.io/test/github/qtgate/qtgate-desktop-client/badge.svg)](https://snyk.io/test/github/qtgate/qtgate-desktop-client)

## Download 下載 ダウンロード

### [The latest 最新版 v1.2.7](https://github.com/QTGate/QTGate-Desktop-Client/releases/latest/)

[windows32](https://github.com/QTGate/QTGate-Desktop-Client/releases/download/v1.2.7/qtgate.Setup.1.2.7.ia32.exe)

[windows64](https://github.com/QTGate/QTGate-Desktop-Client/releases/download/v1.2.7/qtgate.Setup.1.2.7.exe)

[MacOS](https://github.com/QTGate/QTGate-Desktop-Client/releases/download/v1.2.7/qtgate-1.2.7.dmg)

[Linux](https://github.com/QTGate/QTGate-Desktop-Client/releases/download/v1.2.7/qtgate_1.2.7_amd64.deb)

## Description 項目概要

**QTGate** is Privacy Enhancing Tools (PET).

**QTGate**’s OPN services allow users to stay private and secure while accessing the open internet. [QTGATE](https://www.qtgate.com).

- **QTGate** has engineered unique networking technologies used to establish “Quiet” private networks by obfuscating encrypted data packets to ensure data is secure and your identity stays protected. Designed to bypass deep packet inspection (DPI) firewalls while providing secure and private access to the open internet, anywhere in the world.QTGate keeps no logs of your online traffic and all data is encrypted using industry-tested and accepted encryption standards. Use QTGate’s OPN services to access the open internet with total protection and security.

    1. [@OPN](https://github.com/QTGate/atOPN) is our patent pending technology that creates a “Quiet” private network by obfuscating encrypted data packets over IMAP email servers, refracting the data thru our QTGate servers, to achieve an obfuscated private network. @OPN provides true anonymous internet communications, where your IP address is fully hidden to our servers and target servers.

    2. [iOPN](https://github.com/QTGate/iOPN) is designed to bypass detection that can block other internet privacy tools, such as a VPN. With features such as:
        1. **IP-Shifting** : IPs don’t stay the same, they automatically refresh every 2 hours. No one stays on a website all day, thus iOPN has a fresh IP every 2 hours to make it look like users are surfing and further help bypass detection.
        2. **Multi-gateway** : Using multiple gateways helps to further obfuscate traffic, by dispersing data over 2 or more IPs (up to 4). This helps evade detection by disguising user’s traffic to look like visiting multiple sites. A VPN transfers all the data over one IP.
        3. **Short connect** : Using iOPN looks like just normal web traffic, with short open/closed connections to target servers like regular web browsing. While a VPN tunnel looks like it’s always maintaining a connection, that makes it easy to detect.

- **QTChat** – Encrypted, peer to peer instant messaging. Privacy enhanced with no IP footprint. Privacy enhanced, encrypted video streaming and casting in secrecy.

- **QTStorage** – Encrypted, private data storage and secret sharing services.

Need help [Gitter online chat](https://gitter.im/QTGate/Lobby)
***
QTGate端末インストールです.

QTGateとは匿名ネットワークです。QTGateは三つのツールを構成しております。それらを匿名ネットワークの三銃士と言います。

- 銃士の一: QTGateゲットウェイサービス。

    QTGateゲットウェイは通信データ量をリミットするフリーユーザーをはじめ、ご利用による五つのプランはご提供しております。またスポンサーによるフリーアクセスサードもございます。
    QTGateゲットウェイを使って、静かに自由なネットワークへアクセスができるのは、二つ独自のネットワーク匿名アクセス技術を含みます。
    1. [@OPN](https://github.com/QTGate/atOPN)はIMAPプロトコルにオブファスケイション通信技術です。
    2. [iOPN](https://github.com/QTGate/iOPN)はHTTPプロトコルにオブファスケイション通信技術です。

    QTGateゲットウェイサービスは最先端のクラウドを利用しております。QTGateのコアサーバクラスタは金城鉄壁になっています、外から直接訪問することができません。QTGateのゲットウェイはグロバール地域に分布された十六のエリアからサービスをしております。
    QTGateのゲットウェイサーバーはオンデマンド仕組みです。一つサーバーを定額で少量のクライアントしか、サービスをしておりません。クライアント一人一人の通信品質を確保しています。
    ゲットウェイサーバーはIPアドレスを二時間ごとに変換します。クライアントは同時に複数のゲットウェイサーバーを束ねて安定した高速インターネットへする技術によって、大流量のVPN通信データーを分散し、
    姿を隠してネットワーク監視者から逃れます。

- 銃士の二: QTChat

    QTChatはQTGateクライアントの間、OPN技術を使ってツイッターに似たような、匿名なポイントツーポイントメッセージング コミニュケーションプラットフォームです。テキストをはじめ、写真とビデオも転送することができます。
    その特徴は強いネットワーク制限を無視する能力です。メーセージを発送したら修正と削除することができません。将来はLIVE動画配信を対応つもりです。メーセージはクライアントから暗号化され、QTGateシステムはメーセージを
    開くすることができないです。メーセージその内容はQTGateシステムに残らないです。QTGateはメーセージに責任を負えないです。

- 銃士の三: QTStorage

    安全なプライベットファイルクラウドストレージ及びシェアプラットフォームです。

ヘルプ[Gitterチャットへようこそ](https://gitter.im/QTGate/%E6%97%A5%E6%9C%AC%E8%AA%9E)
***
**Q梯**匿名網絡環境客戶端安裝程序。

**項目開發背景**
在互聯網發達的今天，世界上有越來越多的生活人離不開互聯網，但是隨之而來的網絡攻擊，偷窺隱私及網絡封鎖行為，對人們的正常網絡通訊及安全帶來了挑戰。為了解決這些問題，Q梯提供了解決方案：客戶之間無IP地址，使用Email通過公眾郵件服務器，配合加密通訊技術讓相互連結在一起，形成一個建立在互聯網之上的Q梯虛擬匿名網絡。客戶相互不需要知道彼此的IP地址卻能夠安全可靠的通訊，是Q梯匿名網絡的最大特點。目前Q梯匿名網絡支持的有6大公眾郵件服務器（Yahoo，Outlook，Apple，Gmail，Zoho，Gmx），Q梯在安裝和使用的過程中不需翻牆，系統也無需越獄。Q梯今後將朝著開放式匿名網絡系統發展，將開放API接口，讓更多的人在Q梯匿名網絡上開發自己的應用程序。
![http protocol](/resources/qtgate_network.png?raw=true)
**Q梯匿名網路應用程序**
Q梯開發團隊將提供以下三個原生應用，號稱網絡**匿名三劍客**
- 劍客一 **Q梯**(QTGate)
    * 提供永久的限流量免費用戶，各類收費用戶，還提供贊助商免流量無限制訪問的網站。**Q梯**讓您能夠悄無聲息的穿梭在互聯網中，是因為集成了**Q梯**二大網絡通訊流量混淆技術
        1. [@OPN](https://github.com/QTGate/atOPN)是IMAP協議下的網絡通訊流量混淆技術，讓您無IP地址訪問互聯網
        2. [iOPN](https://github.com/QTGate/iOPN)是HTTP協議下的網絡通訊流量訊混淆技術，讓您高速無障礙訪問互聯網
    * **Q梯**通過此客戶端提供本地代理服務器，實現全平台對應，讓其他設備如手機平板電腦等，通過設置代理來使用**Q梯**。
    * **Q梯**匿名網絡採用最尖端的雲服務集成系統，它的核心服務器集群隱藏在雲之中，不接受任何直接的訪問。
    * 顯露在外的分佈全球各地的16個代理服務器集群，有大量的按需分配的代理服務器，每台代理服務器均設置個位數的客戶上限，讓每個客戶端保持同等的通訊質量。
    * 與自建代理服務器優勢：
        1. **Q梯**是業界第一次使用超短壽命代理服務器，**每二小時變換代理IP地址**，並同時變更代理服務器和客戶端的加密密碼。
        2. **Q梯**是業界第一次讓使用者可以同時並聯多條代理線路，有效的避免了傳統代理的大流量集中在同一IP下，容易觸發監控者注意的弊端。
        3. **Q梯**是業界第一次讓使用者隨時變換，客戶端和代理服務器端通訊端口，有效避開被防火牆封閉的端口。
        4. **Q梯是隨時隨地都可以變換的私人訂製的代理服務器**

- 劍客二 **Q信**(QTChat)本功能免費
    * 類似推特的信息交流平台，用戶之間使用RSA秘鑰加密的信息推送系統，可以一對多的推送信息，其信息傳遞特徵是信息一旦發送不可編輯不可刪除。**Q信**支持文字圖片和視頻，最終將支持視頻直播功能。信息保存於各個客戶端，**Q梯**不保存也不擁有信息，**Q信**對信息本身不承擔法律責任。通過此客戶端提供本地網站服務器，讓手機等其他設備不用安裝專用軟件，都能夠使用**Q信**發送視頻，點讚和回帖。

- 劍客三 **Q梯石洞**(QTStorage)本功能免費
    * 使用Email帳戶內剩餘的容量，無限量(可申請多個email帳戶)私密文件雲存儲和分享功能。**Q梯石洞**通過此客戶端提供本地網站服務器，讓手機和其他設備不用安裝專用軟件，對文件進行操作。

[Q梯和SS，SSR的區別](https://github.com/QTGate/QTGate-Desktop-Client/wiki/QTGate%E5%92%8CSS%E5%92%8CSSR%E7%9A%84%E5%8D%80%E5%88%A5)

[Q梯教程](https://github.com/QTGate/QTGate-Desktop-Client/wiki/Q%E6%A2%AF%E7%B0%A1%E6%98%93%E6%95%99%E7%A8%8B)

[Windows操作系統IE瀏覽器不支持SOCKS5代理](https://github.com/QTGate/QTGate-Desktop-Client/wiki/WIndows%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%B5%B1%E7%94%A8%E6%88%B6%EF%BC%8C%E5%BB%BA%E8%AD%B0%E4%BD%BF%E7%94%A8Chrome%E7%80%8F%E8%A6%BD%E5%99%A8%E6%88%96%E7%81%AB%E7%8B%90%E7%80%8F%E8%A6%BD%E5%99%A8)

[Q梯舊金山代理服務區 中國網速調查](https://github.com/QTGate/QTGate-Desktop-Client/wiki/Q%E6%A2%AF%E8%88%8A%E9%87%91%E5%B1%B1%E4%BB%A3%E7%90%86%E6%9C%8D%E5%8B%99%E5%8D%80--%E4%B8%AD%E5%9C%8B%E7%B6%B2%E9%80%9F%E8%AA%BF%E6%9F%A5)


需要幫助，請聯繫我們在[Gitter會議室](https://gitter.im/QTGate/%E4%B8%AD%E6%96%87)

## QTGate platform Twitter APP Q梯平台應用程序-推特 

![http protocol](/resources/twitter.png?raw=true)

***
![http protocol](/resources/canada150.png?raw=true)
***
![http protocol](/resources/gateway_area.png?raw=true)
***
![http protocol](/resources/iOPN.png?raw=true)
***
![http protocol](/resources/vpn.email11.jpg?raw=true)
***
![http protocol](/resources/qtgate_network.png?raw=true)
***
![http protocol](/resources/QTStorage.png?raw=true)
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