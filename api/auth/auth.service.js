import Cryptr from "cryptr"
import { loggerService } from "../../services/logger.service.js"
import { userService } from "../user/user.service.js"
import bcrypt from 'bcrypt'
import { bggApiService } from "../../services/bgg.service.js"

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
    if (!user) throw new Error('Invalid username or password')
        
    const { _id, bggUser} = user

    var ownedGamesByUser = await bggApiService.getOwnedGames(bggUser) 
    ownedGamesByUser = ownedGamesByUser ? ownedGamesByUser : []
    var wantedGamesByUser = await bggApiService.getWantedGames(bggUser)
    wantedGamesByUser = wantedGamesByUser ? wantedGamesByUser : []
    //TODO also check password

    const miniUser = {
        _id: _id.toString(),
        username,
        bggUser : bggUser ? bggUser : 'guest',
        likedGamesArray : wantedGamesByUser,
        superLikedGames: ownedGamesByUser
    }
    return miniUser
    // } catch (err) {
    //     loggerService.error("Could not log in", err)
    //     throw new Error("Could not log in")
    // }
}

async function signup(username, password, bggUser) {

    try {
        const saltRounds = 10
        if (!username || !password ) {
            loggerService.info('Missing credentials, should have been spotted at frontend')
            throw 'Missing required signup info'
        }

        loggerService.debug(`auth.service - signup with username: ${username}, bggUser: ${bggUser}`)

        const userExist = await userService.getByUsername(username)
        if (userExist) throw 'Username already taken'

        const hash = await bcrypt.hash(password, saltRounds)
        return userService.add({ username, password: hash, bggUser: bggUser ? bggUser : 'guest', likedGamesArray: [], superLikedGames: [] })

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
