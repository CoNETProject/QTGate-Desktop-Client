/*!
 * Copyright 2017 QTGate systems Inc. All Rights Reserved.
 *
 * QTGate systems Inc.
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

 export const _HTTP_502 = `HTTP/1.1 502 Bad Gateway
Content-Length: 0
Connection: close
Proxy-Connection: close
Content-Type: text/html; charset=UTF-8
Cache-Control: private, max-age=0

`

export const _HTTP_404 = `HTTP/1.1 404 Not Found
Content-Length: 0
Connection: close
Proxy-Connection: close
Content-Type: text/html; charset=UTF-8
Cache-Control: private, max-age=0

`

export const _HTTP_599_body = 'Have not internet.\r\n無互聯網，請檢查您的網絡連結\r\nネットワークはオフラインです\r\n'
export const _HTTP_599 = `HTTP/1.1 599 Have not internet
Content-Length: 100
Connection: close
Proxy-Connection: close
Content-Type: text/html; charset=UTF-8
Cache-Control: private, max-age=0

${ _HTTP_599_body }
`
export const _HTTP_598_body = `Domain name can't find.\r\n無此域名\r\nこのドメイン名が見つからないです\r\n`
export const _HTTP_598 = `HTTP/1.1 598 Domain name can't find
Content-Length: 100
Connection: close
Proxy-Connection: close
Content-Type: text/html; charset=UTF-8
Cache-Control: private, max-age=0

${ _HTTP_598_body }
`
export const Http_Pac = ( body: string ) => {
	return `HTTP/1.1 200 OK
Content-Type: application/x-ns-proxy-autoconfig
Connection: keep-alive
Content-Length: ${ body.length }

${ body }\r\n\r\n`
}
export const _HTTP_200 = ( body: string ) => {
	return `HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Connection: keep-alive
Content-Length: ${ body.length }

${ body }\r\n\r\n`
}

export const body_403 = '<!DOCTYPE html><html><p>This domain in proxy blacklist.</p><p>這個域名被代理服務器列入黑名單</p><p>このサイドはプロクシーの禁止リストにあります</p></html>'
export const HTTP_403 = `HTTP/1.1 403 Forbidden
Content-Type: text/html; charset=UTF-8
Connection: close
Proxy-Connection: close
Content-Length: 300

${ body_403 }

`
export const _HTTP_PROXY_200 = `HTTP/1.1 200 Connection Established
Content-Type: text/html; charset=UTF-8

`
