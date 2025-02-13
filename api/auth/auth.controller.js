/**
 * Authors note:
 * cryptr for encrypting and decrypting the mini user cookie, bcrypt for assymetric encrypting, does not decrypt (comparing new value to encrypted value)
 */
import { loggerService } from "../../services/logger.service.js"
import { bggService } from "../bgg/bgg.service.js"
import { authService } from "./auth.service.js"

export async function login(req, res) {
    const { username, password } = req.body
    try {
        const user = await authService.login(username, password)
        const loginToken = await authService.getLoginToken({ username, password } )

        loggerService.info('User login: ', user)

        res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
        res.json(user)
    } catch (err) {
        loggerService.error(' Failed to Login ', err)
		res.status(401).send( err)
    }
}

export async function signup(req, res) {
    try {
        const { username, password, bggUser } = req.body
        loggerService.debug(username, " the bgg username is: ", bggUser)

        const account = await authService.signup(username, password, bggUser)
        loggerService.debug(`auth.route (controller) - new account:` + JSON.stringify(account))

        const games = await bggService.signup(username)
        loggerService.debug(`auth.route (controller) - creating a new games array for user: ${username}`)

        const user = await authService.login(username, password)
        loggerService.info(`User signup :`, user)

        const loginToken = await authService.getLoginToken(user)
        res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })

        res.json(user)
    } catch (err) {
        loggerService.error(' Failed to Signup ', err)
        res.status(401).send(err)
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie('loginToken')
        loggerService.debug(`user logged out`)
        res.send({ msg: "Logged out succesfully" })

    } catch (err) {
        loggerService.error('Failed to logout', err)
        return res.status(400).send('Failed to logout')
    }
}

