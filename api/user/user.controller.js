import { loggerService } from "../../services/logger.service.js"
import { authService } from "../auth/auth.service.js"
import { userService } from "./user.service.js"

export async function getUsers (req, res){
    const { search, sortBy, pageIdx  } = req.query
    const filterBy = { search, sortBy, pageIdx: +pageIdx || undefined } //to cast to numbers if the filter is int
    try{
        const users = await userService.query( filterBy )
        res.send(users)
        
    } catch (err ){
        loggerService.error("could not get users", err)
        return res.status(400).send("could not get users")
    }
}

export async function updateUser (req, res) {
    const {username, fullname } = req.body
    const userToSave = {
        username,
        fullname
    }

    try {
        const savedUser = await userService.save( userToSave )
        res.send(savedUser)
    } catch (error) {
        loggerService.error("could not update user", err)
        return res.status(400).send("could not update user")
    }
}

export async function addUser  (req, res)  {
    try {
        const { username, password, fullname  } = req.body 
        const account = await authService.signup( username, password , fullname)
        loggerService.debug(`user.route (controller) - new account:` + JSON.stringify(account)  )

        res.send(account)
    } catch (err) {
        loggerService.error("could not add user", err)
        return res.status(400).send("could not add user")
    }
}

export async function getUser  (req, res) {
    const {userId} = req.params
   
    try{
        const user = await userService.getById ( userId )
        res.send(user )

    } catch (err ){
        loggerService.error("could not remove user", err)
        res.status(400).send("could not get user")
    }  
}

export async function removeUser  (req, res)  {
    const {userId} = req.params
    try{
        await userService.remove( userId )
        res.send('OK')
    } catch (err ){
        loggerService.error("could not remove user", err)
        res.status(400).send("could not remove user")
    }


}
