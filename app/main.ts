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
declare const process: any
import LocalServer from './localWebServer'
const test = /^true$/.test ( process.argv[2] ) ? true : false
const _start = process.argv [3] || false
export const start = ( cmd: () => void, _test ) => {
	const localServer = new LocalServer ( cmd, _test )
}
if ( _start ) {
	start ( null, false )
}