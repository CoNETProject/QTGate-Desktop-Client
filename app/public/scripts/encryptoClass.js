class encryptoClass {
    constructor(_keypair) {
        this._keypair = _keypair;
        this.makeKeyReady = async () => {
            this.CoNET_publicKey = (await openpgp.key.readArmored(this._keypair.CoNET_publicKey)).keys;
            this._privateKey = (await openpgp.key.readArmored(this._keypair.privateKey)).keys[0];
            await this._privateKey.decrypt(this._keypair._password);
        };
        this.makeKeyReady();
    }
}
