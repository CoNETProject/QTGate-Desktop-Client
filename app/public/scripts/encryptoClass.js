const requestTimeOut = 1000 * 180;
class encryptoClass {
    constructor(_keypair) {
        this._keypair = _keypair;
        this.requestPool = new Map();
        this.makeKeyReady = async () => {
            //this.CoNET_publicKey = ( await openpgp.key.readArmored ( CoNET_publicKey )).keys
            this._privateKey = (await openpgp.key.readArmored(this._keypair.privateKey)).keys;
            await this._privateKey[0].decrypt(this._keypair._password);
        };
        this.decryptMessage = (encryptoText, CallBack) => {
            return this.decryptMessageToZipStream(encryptoText, async (err, _data) => {
                if (err) {
                    return CallBack(err);
                }
                let ret = null;
                const data = Buffer.from(_data, 'base64').toString();
                if (/^-----BEGIN PGP/i.test(data)) {
                    CallBack();
                    return this.CoNET_publicKey = (await openpgp.key.readArmored(data)).keys;
                }
                try {
                    ret = JSON.parse(data);
                }
                catch (ex) {
                    return CallBack(ex);
                }
                return CallBack(null, ret);
            });
        };
        this.onDoingRequest = async (encryptoText, uuid) => {
            const request = this.requestPool.get(uuid);
            if (!request) {
                return;
            }
            return this.decryptMessage(encryptoText, (err, obj) => {
                if (err) {
                    return _view.connectInformationMessage.showErrorMessage(err);
                }
                if (obj.error !== -1) {
                    clearTimeout(request.timeOut);
                }
                return request.CallBack(null, obj);
            });
        };
        this.makeKeyReady();
        _view.connectInformationMessage.socketIo.on('doingRequest', (encryptoText, uuid) => {
            return this.onDoingRequest(encryptoText, uuid);
        });
    }
    decryptMessageToZipStream(encryptoText, CallBack) {
        const option = {
            privateKeys: this._privateKey,
            publicKeys: this.CoNET_publicKey,
            message: null
        };
        let ret = null;
        return openpgp.message.readArmored(encryptoText).then(data => {
            option.message = data;
            return openpgp.decrypt(option);
        }).then(_plaintext => {
            return CallBack(null, _plaintext.data);
        })
            .catch(ex => {
            return CallBack(ex);
        });
    }
    encrypt(message, CallBack) {
        const option = {
            privateKeys: this._privateKey,
            publicKeys: this.CoNET_publicKey,
            message: openpgp.message.fromText(message),
            compression: openpgp.enums.compression.zip
        };
        const self = this;
        return openpgp.encrypt(option).then(ciphertext => {
            return CallBack(null, ciphertext.data);
        }).catch(err => {
            return CallBack('systemError');
        });
    }
    emitRequest(cmd, CallBack) {
        const uuid = cmd.requestSerial = uuid_generate();
        const self = this;
        const option = {
            privateKeys: this._privateKey,
            publicKeys: this.CoNET_publicKey,
            message: openpgp.message.fromText(JSON.stringify(cmd)),
            compression: openpgp.enums.compression.zip
        };
        this.requestPool.set(uuid, { CallBack: CallBack, cmd: cmd, timeOut: setTimeout(() => {
                self.requestPool.delete(uuid);
                return CallBack(new Error('timeOut'));
            }, requestTimeOut) });
        return openpgp.encrypt(option).then(ciphertext => {
            return _view.connectInformationMessage.sockEmit('doingRequest', uuid, ciphertext.data, err => {
                return CallBack(err);
            });
        }).catch(err => {
            return CallBack('systemError');
        });
    }
}
