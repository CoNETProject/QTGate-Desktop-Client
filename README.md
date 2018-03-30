# CoNET Platform
[![Build Status](https://travis-ci.org/QTGate/QTGate-Desktop-Client.svg?branch=master)](https://travis-ci.org/QTGate/QTGate-Desktop-Client)
[![Gitter](https://img.shields.io/badge/chat-on%20gitter-blue.svg)](https://gitter.im/QTGate/Lobby)
[![Known Vulnerabilities](https://snyk.io/test/github/qtgate/qtgate-desktop-client/badge.svg)](https://snyk.io/test/github/qtgate/qtgate-desktop-client)

## Download ダウンロード 下載

### [The latest 最新版 v1.3.4](https://github.com/QTGate/QTGate-Desktop-Client/releases/latest/)

[windows32](https://github.com/QTGate/QTGate-Desktop-Client/releases/download/v1.3.4/qtgate.Setup.1.3.4.ia32.exe)

[windows64](https://github.com/QTGate/QTGate-Desktop-Client/releases/download/v1.3.4/qtgate.Setup.1.3.4.exe)

[MacOS](https://github.com/QTGate/QTGate-Desktop-Client/releases/download/v1.3.4/qtgate-1.3.4.dmg)

[Linux deb](https://github.com/QTGate/QTGate-Desktop-Client/releases/download/v1.3.4/qtgate_1.3.4_amd64.deb)

[Linux pacman](https://github.com/QTGate/QTGate-Desktop-Client/releases/download/v1.3.4/qtgate-1.3.4.pacman)

## Description
### CoNET platform as product of [CoNET](https://github.com/QTGate/CoNET) provides a series of services that allows users to improve their security, privacy and freedom on the Internet.

- **CoGate** Advanced private custom gateway service, it has engineered unique networking technologies used to establish “Quiet” private networks by obfuscating encrypted data packets to ensure data is secure and your identity stays protected. Ability to pass thru undetectable firewalls while providing secure and private access to the open internet, anywhere in the world. CoGate keeps no logs of your online traffic and all data is encrypted using industry-tested and accepted encryption standards. Use CoGate’s services to access the open internet with total protection and security.

    1. [@OPN](https://github.com/QTGate/atOPN) is our patent pending technology that creates a “Quiet” private network by obfuscating encrypted data packets over IMAP email servers, refracting the data thru our QTGate servers, to achieve an obfuscated private network. @OPN provides true anonymous internet communications, where your IP address is fully hidden to our servers and target servers.
    2. [iOPN](https://github.com/QTGate/iOPN) is designed to bypass detection that can block other internet privacy tools, such as VPN or Tor. With features such as:
        1. **IP-Shifting** : IPs don’t stay the same, they automatically refresh every 2 hours. No one stays on a website all day, thus iOPN has a fresh IP every 2 hours to make it look like users are surfing and further help bypass detection.
        2. **Multi-gateway** : Using multiple gateways helps to further obfuscate traffic, by dispersing data over 2 or more IPs (up to 4). This helps evade detection by disguising user’s traffic to look like visiting multiple sites. A VPN transfers all the data over one IP.
        3. **Short connect** : Using iOPN looks like just normal web traffic, with short open/closed connections to target servers like regular web browsing. While a VPN tunnel looks like it’s always maintaining a connection, that makes it easy to detect.

- **CoMsg** – A Twitter-Style social media use decentralized database ( blockchain ) it provide secure and anonymous.

- **CoBox** – private data storing allow user to store encrypted and shared files append draft message use multiple email account.

- **CoMail** - Mail client on CoNET allows user keep their anonymous to access mailbox, send and receive encrypted email, it support IMAP and SMTP protocol.

- **CoNewsChannels** - News Channels is APP for popular news paper include BBC, USA Today, NYTime...

- **Co for Twitter** - Twitter client allowing user access Twitter keep anonymous, user reach Twitter who may live in a area that restricted access to Twitter.

- **Co for Google** - Google search client allowing user access Google search keep anonymous user reach Google search who may live in a area that restricted access to Twitter.

## Build 編譯 ビルド

npm run [mac|win32|win|linux]

[Multi Platform Build 如何編譯多平台APP可參照 マルチOSのビルドにつて](https://www.electron.build/multi-platform-build)

## Notice 注意事項 

This bate version have not support UDP proxy

當前版本UDP未對應

このパージョンはUDP対応しておりませんので、ご注意してください。

## License 版權 

Copyright (c) 2018 CoNET Technology Inc. All rights reserved.

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