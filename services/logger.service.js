import fs from 'fs'
import { asyncLocalStorage } from './als.service.js'

export const loggerService  = {
    debug,
    info,
    warn,
    error
}

const logDir = './logs'

function debug( ...args){
    doLog('DEBUG', ...args)
}

function info( ...args){
    doLog('INFO', ...args)
}

function warn( ...args){
    doLog('WARN', ...args)
}

function error( ...args){
    doLog('ERROR', ...args)
}

if( !fs.existsSync(logDir )){
    fs.mkdirSync ( logDir)
}

function _getTime(){
    let now = new Date()
    return now.toLocaleString( 'he' )
}

function isError (e) {
    return e && e.stack && e.message
}

function customStringify(arg) {
    return JSON.stringify(arg, (key, value) => {
        if (value instanceof RegExp) {
            return value.toString(); // Convert regex to string
        }
        return value;
    })
}

function doLog(level, ...args) {
	const store = asyncLocalStorage.getStore()
    const userId = store?.loggedinUser?._id

    const strs = args.map(arg => (typeof arg === 'string' || isError(arg) ) ? arg : customStringify(arg))
    if(userId) strs.push(userId)

    var line = strs.join(' | ')
    line = `${_getTime()} - ${level} - ${line}\n`
    console.log(line)
    fs.appendFile('./logs/backend.log', line, (err) => {
        if (err) console.log('FATAL: cannot write to log file')
    })
}