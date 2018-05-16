import * as Fs from 'fs'
import * as Path from 'path'
import * as Os from 'os'

const QTGateFolder = Path.join ( Os.homedir(), '.QTGate' )
const ErrorLogFile = Path.join ( QTGateFolder, 'systemError.log' )
let flag = 'w'
export const saveLog = ( log: string ) => {
	const data = `${ new Date().toUTCString () }: ${ log }\r\n`
	return Fs.appendFile ( ErrorLogFile, data, { flag: flag }, err => {
		return flag = 'a'
	})
}