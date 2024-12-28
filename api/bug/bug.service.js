import { dbService } from "../../services/db.service.js"
import { loggerService } from "../../services/logger.service.js"
import { ObjectId } from 'mongodb'
import { utilService } from "../../services/util.service.js"
import { msgService } from "../msg/msg.service.js"

export const bugService = {
    query,
    getById, 
    remove, 
    add, 
    update,
    addBugNote,
    removeBugNote
}

const PAGE_SIZE = 2

async function query( filterBy = { search: ''}){

    
    try{

        const criteria = _buildCriteria(filterBy)
        loggerService.info('query for the following criteria', criteria)

        const sort = _buildSort(filterBy)

        const collection = await dbService.getCollection('bug')
        var bugCursor = await collection.find( criteria, {sort}) //skip, limit if we prefer...
    
    
        if (filterBy.pageIdx !== undefined) {  
            bugCursor.skip(filterBy.pageIdx * PAGE_SIZE).limit(PAGE_SIZE)
        }
    
        const bugs = await bugCursor.toArray()
        return bugs

    } catch (err){
        loggerService.error("Cannot get bugs", err)
        throw new Error ('Could not get bugs')
    }
}

async function getById( bugId ){
    try{
        var criteria = { _id: ObjectId.createFromHexString(bugId)}
        const collection = await dbService.getCollection('bug')
        const bug = await collection.findOne(criteria)
        if( ! bug) throw new Error ( 'could not find bug')
        bug.createdAt = bug._id.getTimestamp()

        criteria = { aboutBugId: new ObjectId(bugId)}

        bug.relatedMessages = await msgService.query(criteria)
        bug.relatedMessages = bug.relatedMessages.map(message =>{
            delete message.aboutBug
            return message
        })
        console.log('bug.relatedMessages:', bug.relatedMessages)
        return bug
    } catch (err ){
        loggerService.error(`could not find bug : ${bugId}`, err)
        throw new Error ('could not find bug')
    }
} 

async function remove( bugId){
    try{
        const { loggedinUser } = asyncLocalStorage.getStore()
        const { _id: ownerId, isAdmin } = loggedinUser

        const criteria = { _id : ObjectId.createFromHexString( bugId)}
        if(!isAdmin) criteria['owner._id'] = ownerId
        
        const collection = await dbService.getCollection('bug')
        const res =  await collection.deleteOne(criteria )
        
        if ( res.deletedCount === 0 ) throw  new Error ("Not Your Bug")
        return bugId
    } catch (err ){
        loggerService.error(`could not remove bug : ${bugId}`, err)
        throw new Error ("could not remove bug")
    }
} 

async function update( bug ){

    const bugToSave = {title : bug.title , description: bug.description , severity : bug.severity}

    try {    
        const criteria = { _id: ObjectId.createFromHexString(bug._id)}
        const collection = await dbService.getCollection('bug')
        await collection.updateOne(criteria , { $set: bugToSave })
        return bug
        
    } catch (err) {
        loggerService.error(`could not save bug: ${bug._id}`, err)
        throw  new Error ("could not save bug")
    }
}

async function add( bugToSave ){
    try {        
        const collection = await dbService.getCollection('bug')
        await collection.insertOne(bugToSave)
        console.log('bugToSave:213123213', bugToSave)
        return bugToSave
    } catch (err) {
        loggerService.error("could not save bug", err)
        throw  new Error ("could not save bug")
    }
}

async function addBugNote( bugId, note ){
    try {        
        const criteria = {_id : ObjectId.createFromHexString(bugId)}
        note.id = utilService.makeId()

        const collection = await dbService.getCollection('bug')
        await collection.updateOne(criteria, { $push: { notes: note } })
        return bugToSave
    } catch (err) {
        loggerService.error("could not save bug note", err)
        throw  new Error ("could not save bug note")
    }
}

async function removeBugNote( bugId, noteId){
    try{
        const criteria = { _id : ObjectId.createFromHexString( bugId)}
        
        const collection = await dbService.getCollection('bug')
        await collection.updateOne(criteria , {$pull : { notes : { id : noteId }}})
        
        return noteId
    } catch (err ){
        loggerService.error(`could not remove bug note : ${bugId}`, err)
        throw new Error ("could not remove bug note")
    }
} 

function _buildCriteria(filterBy){
    if(!filterBy.search) return {}
    const criteria = {
    title: { $regex: filterBy.search, $options: 'i'},
    //severity: { $gte: filterBy.}
    }
    return criteria
}

function _buildSort(filterBy){
    if (!filterBy.sortBy) return {}
    return { [filterBy.sortBy] : filterBy.sortDir }
}