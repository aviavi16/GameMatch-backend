import { ObjectId } from "mongodb"
import { dbService } from "../../services/db.service.js"
import { loggerService } from "../../services/logger.service.js"

export const msgService = {
    query,
    getById, 
    remove, 
    add, 
    update,
}

async function query(filterBy = {}){


    try{   
        const criteria = filterBy 
        
        const collection = await dbService.getCollection('msg')
    
        const msgs = await collection.aggregate([
            {
                $match: criteria,
            },
            {
                $lookup: {
                    localField: 'aboutBugId',
                    from: 'bug', foreignField: '_id',
                    as: 'aboutBug'
                }
            },
            {
                $unwind: '$aboutBug'
            },
            {
                $lookup: {
                    localField: 'byUserId',
                    from: 'user', foreignField: '_id',
                    as: 'byUser',
                },
            },
            {
                $unwind: '$byUser'
            },
            {
                $project : {
                    'txt': true,
                    'aboutBug._id' : true,'aboutBug.title' : true, 'aboutBug.severity' : true,
                    'byUser._id' : true,'byUser.fullname' : true,
                }
            }
        ]).toArray()
        console.log('msgs:', msgs)
        return msgs
    } catch (err){
        loggerService.error("Cannot get msgs", err)
        throw new Error ('Could not get msgs')
    }
}

async function getById( msgId ){
    try{
        const criteria = { _id: ObjectId.createFromHexString(msgId)}
        const collection = await dbService.getCollection('msg')
        const msg = await collection.findOne(criteria)
        if( ! msg) throw new Error ( 'could not find msg')
        msg.createdAt = msg._id.getTimestamp()
        return msg
    } catch (err ){
        loggerService.error(`could not find msg : ${msgId}`, err)
        throw new Error ('could not find msg')
    }
} 

async function remove( msgId){
    try{
        //const { _id: ownerId, isAdmin} = loggedinUser
        const criteria = { _id : ObjectId.createFromHexString( msgId)}
        //if( !isAdmin) criteria['owner._id'] = ownerId
        const collection = await dbService.getCollection('msg')
        const res =  await collection.deleteOne(criteria )
        
        if ( res.deletedCount === 0 ) throw  new Error ("Not Your Msg")
        return msgId
    } catch (err ){
        loggerService.error(`could not remove msg : ${msgId}`, err)
        throw new Error ("could not remove msg")
    }
} 

async function update( msgId, msg ){

    const msgToSave = {txt : msg.txt , aboutBugId: msg.aboutBugId }
    try {    
        const criteria = {  _id : ObjectId.createFromHexString( msgId)}
        const collection = await dbService.getCollection('msg')
        await collection.updateOne(criteria , { $set: msgToSave })
        return msg
        
    } catch (err) {
        loggerService.error(`could not update msg: ${msg._id}`, err)
        throw  new Error ("could not update msg")
    }
}

async function add( msgToSave ){
    try {        
        const collection = await dbService.getCollection('msg')
        await collection.insertOne(msgToSave)
        return msgToSave
    } catch (err) {
        loggerService.error("could not add msg", err)
        throw  new Error ("could not add msg")
    }
}