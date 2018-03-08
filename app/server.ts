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
import * as Path from 'path'
import * as Os from 'os'
import Twitter from './twitter'
import * as SaveLog from './saveLog'
import localServer from './localServer'
import serviceServer from './serviceServer'
const { remote } = require ( 'electron' )

const QTGatePongReplyTime = 1000 * 30

let mainWindow = null

const reqtestTimeOut = 1000 * 30

const port = remote.getCurrentWindow().rendererSidePort
const version = remote.app.getVersion ()
const DEBUG = remote.getCurrentWindow().debug

const saveLog = SaveLog.saveLog

const server = new localServer ( version, port )

const twitter = new Twitter ( server )

//const serviceServver = new serviceServer ( server )

saveLog ( `
*************************** QTGate [ ${ version } ] server start up on [ ${ port } ] *****************************
OS: ${ process.platform }, ver: ${ Os.release() }, cpus: ${ Os.cpus().length }, model: ${ Os.cpus()[0].model }
Memory: ${ Os.totalmem()/( 1024 * 1024 ) } MB, free memory: ${ Math.round ( Os.freemem() / ( 1024 * 1024 )) } MB
**************************************************************************************************`)
