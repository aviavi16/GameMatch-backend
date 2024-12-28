import { loggerService } from "../../services/logger.service.js"
import { msgService } from "./msg.service.js"

export async function getMsgs (req, res){
    try{
        const msgs = await msgService.query()
        res.send(msgs)
        
    } catch (err ){
        return res.status(400).send("Could not get msgs")
    }
}

export async function addMsg  (req, res)  {
    //const {loggedinUser} = req
    const { txt, aboutMsgId, byUserId } = req.body
    const msgToSave = {
        txt,
        aboutMsgId,
        byUserId,
    }

    try {
        const savedMsg = await msgService.add( msgToSave )
        res.send(savedMsg)
    } catch (err) {
        loggerService.error('Cannot add msg', err)
        return res.status(400).send("Could not add msg")
    }
}

export async function updateMsg (req, res) {
    //const {loggedinUser} = req
    const { msgId } = req.params


    const { txt, aboutBugId } = req.body
    const msgToSave = {
        txt,
        aboutBugId
    }
    try {
        const savedMsg = await msgService.update( msgId, msgToSave)
        res.send(savedMsg)
    } catch (err) {
        return res.status(400).send("Could not update msg")
    }
}


export async function getMsg  (req, res) {
    const {msgId} = req.params
    
    try{
        const msg = await msgService.getById ( msgId )
        res.send(msg )

    } catch (err ){
        loggerService.error('Cannot get msg', err)
        res.status(400).send("Cannot get msg")
    }
   
}

export async function removeMsg  (req, res)  {
    //const {loggedinUser} = req

    const {msgId} = req.params
    try{
        await msgService.remove( msgId  )
        res.send('OK')
    } catch (err ){
        loggerService.error(`removeMsg failed: ${err}`)
        res.status(400).send("Cannot remove msg")

    }
}