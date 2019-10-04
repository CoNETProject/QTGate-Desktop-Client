declare const openpgp: any 

class encryptoClass {
	private _privateKey
	private CoNET_publicKey
	private makeKeyReady = async() => {
		this.CoNET_publicKey = ( await openpgp.key.readArmored ( this._keypair.CoNET_publicKey )).keys
		this._privateKey = ( await openpgp.key.readArmored ( this._keypair.privateKey )).keys[0]
		await this._privateKey.decrypt ( this._keypair._password )
	}
	constructor ( private _keypair: keypair ) {
		this.makeKeyReady ()
	}

}