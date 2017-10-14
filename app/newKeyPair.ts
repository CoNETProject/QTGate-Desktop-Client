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

import * as openpgp from 'openpgp'
const { remote } = require ( "electron" )

const NewKeyPair = ( data: INewKeyPair, CallBack ) => {
    
    const userId = {
		name: data.nikeName,
		email: data.email
    }

    const option = {
        numBits: parseInt ( data.keyLength || '2048' ),
        passphrase: data.password,
        userIds: userId
    }

    openpgp.generateKey ( option ).then (( keypair: { publicKeyArmored: string, privateKeyArmored: string }) => {
        
        const ret: keyPair = {
            publicKey: keypair.publicKeyArmored,
            privateKey: keypair.privateKeyArmored
		}
        return CallBack( null, ret )
    }).catch ( err => {
		// ERROR
        return CallBack ( err )
    })
}

remote.getCurrentWindow().once ( 'firstCallBack', data => {

    return NewKeyPair ( data, ( err, _data ) => {
        
        if ( err ) {

            return remote.getCurrentWindow().emit ( 'firstCallBackFinished' )
        }

        remote.getCurrentWindow().emit ( 'firstCallBackFinished', _data )
    })
})

remote.getCurrentWindow().emit ( 'first' )