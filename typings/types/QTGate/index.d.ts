
interface keypair {
	publicKey?: string
	privateKey?: string
	keyLength: string
	nikeName: string
	createDate: string
	email: string
	passwordOK: boolean
    verified: boolean
    publicKeyID: string
}
interface INewKeyPair {
    email: string
    keyLength: string
    nikeName: string
    password: string
}
interface install_config {
    alreadyInit: boolean
    multiLogin: boolean
    firstRun: boolean
    version: string
    newVersion?: string
    newVersionCheckFault?: boolean
    newVersionDownloadFault?: number 
    newVerReady?: boolean
    keypair: keypair
    salt?: Buffer
    iterations?: number
    keylen?: number
    digest?: string
    QTGateConnectImapUuid: string
    freeUser: boolean
    account: string
    serverGlobalIpAddress: string
}

interface imapConnect {
    imapServer: string
    imapUserName: string
    imapUserPassword: string
    imapPortNumber: string
    imapSsl: boolean
    imapIgnoreCertificate: boolean
}

interface newReleaseData {
    ver: string,
    RELEASE: string
}

interface IQtgateConnect {
    qtgateConnectImapAccount: string
    qtGateConnecting: number
    isKeypairQtgateConform: boolean
    error: number
}

interface IinputData extends imapConnect {
    account:string
    email: string
    smtpServer:string
    smtpUserName:string
    smtpUserPassword:string
    smtpPortNumber:string
    smtpSsl:boolean
    smtpIgnoreCertificate: boolean
    imapTestResult: number
    language: string
    clientFolder: string
    serverFolder: string
    imapCheck: boolean
    smtpCheck: boolean
    sendToQTGate: boolean
    timeZoneOffset: number
    randomPassword: string
    uuid: string
    canDoDelete: boolean
}
interface IinputData_server extends IinputData {
    connectEmail: boolean;
    validated: boolean;
}
interface QTGateAPIRequestCommand {
	command: string
	error: number
	requestSerial: string
	Args: any[]
}
interface iTransferData {
    startDate: Date
    transferDayLimit: number
    transferMonthly: number
    account: string
    resetTime: Date
    usedDayTransfer: number
    productionPackage: string
    usedMonthlyTransfer: number
    availableDayTransfer: number
    availableMonthlyTransfer: number
    usedMonthlyOverTransfer: number
    uploaded?: number
    downloaded?: number
    power: number
    timeZoneOffset: number
}
interface IConnectCommand {
    region: string
    account: string
    imapData: IinputData
    connectType: number
    transferData?: iTransferData
    error: number
    runningDocker?: string
    fingerprint: string
    gateWayIpAddress?: string
    connectPeer?: string
    AllDataToGateway: boolean
    localServerPort: number
}

interface QTGateCommand {
    account: string
    QTGateVersion: string
    command: string
    imapData?: IinputData
    language: string
    error: Error
    callback: any
    publicKey: string
}
declare namespace NodeJS {
    export interface Process extends NodeJS.EventEmitter {
        mas: boolean
    }
}
interface keyPair {
    publicKey: string;
    privateKey: string;
}