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