import Cryptr from "cryptr"
import { loggerService } from "../../services/logger.service.js"
import { userService } from "../user/user.service.js"
import bcrypt from 'bcrypt'

const cryptr = new Cryptr(process.env.SECRET || 'Secret-api-1234')

export const authService = {
    login,
    signup,
    validateToken,
    getLoginToken,
}

async function login(username, password) {
    // try {
    loggerService.debug(`auth.service - login with username: ${username}`)

    const user = await userService.getByUsername(username)
    if (!user) return Promise.reject('Invalid username or password')
    
    //TODO also check password
    const { _id, fullname, img, score, isAdmin } = user

    const miniUser = {
        _id: _id.toString(),
        fullname,
        img,
        score,
        isAdmin
    }

    return miniUser
    // } catch (err) {
    //     loggerService.error("Could not log in", err)
    //     throw new Error("Could not log in")
    // }
}

async function signup(username, password, fullname, img, score) {

    try {
        const saltRounds = 10
        if (!username || !password || !fullname) {
            loggerService.info('Missing credentials, should have been spotted at frontend')
            throw 'Missing required signup info'
        }

        loggerService.debug(`auth.service - signup with username: ${username}, fullname: ${fullname}`)

        const userExist = await userService.getByUsername(username)
        if (userExist) throw 'Username already taken'

        const hash = await bcrypt.hash(password, saltRounds)
        return userService.add({ username, password: hash, fullname, img, score })

    } catch (err) {
        loggerService.error("Could not sign up", err)
        throw new Error("Could not sign up")

    }

}

async function getLoginToken(user) {
    const str = JSON.stringify(user)
    const encryptedStr = cryptr.encrypt(str)
    return encryptedStr
}

function validateToken(token) {
    try {
        const json = cryptr.decrypt(token)
        const loggedinUser = JSON.parse(json)
        return loggedinUser
    } catch (err) {
        loggerService.debug('Invalid login token ', err)
    }
    return null
}
