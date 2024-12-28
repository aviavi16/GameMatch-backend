import { ObjectId } from "mongodb"
import { loggerService } from "../../services/logger.service.js"
import { utilService } from "../../services/util.service.js"
import { dbService } from "../../services/db.service.js"

export const userService = {
    query,
    getById,
    getByUsername,
    remove,
    add,
    update,
    getEmptyUser,
}

const PAGE_SIZE = 2

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        const sort = _buildSort(filterBy)

        const collection = await dbService.getCollection('user')
        var userCursor = await collection.find( criteria, {sort}) //skip, limit if we prefer...
        
        if (filterBy.pageIdx !== undefined) {  
            userCursor.skip(filterBy.pageIdx * PAGE_SIZE).limit(PAGE_SIZE)
        }

       const users = await userCursor.toArray()
       return users
    } catch (err) {
        loggerService.error('Could not get users', err)
        throw new Error('Could not get users')
    }
}

async function getById(userId) {
    console.log('userId:', userId)
    const criteria = { _id: ObjectId.createFromHexString(userId )}

    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.find(criteria)
        if (!user) throw new Error(`User not found by userId : ${userId}`)
        user = { ...user }
        delete user.password
        return user
    } catch (err) {
        loggerService.error(`Could not get user: ${userId}`, err)
        throw new Error("Could not get user")
    }
}

async function getByUsername(username) {
    const criteria = { username }

    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne(criteria)
        console.log('user:', user)
        return user
    } catch (err) {
        loggerService.error(`Could not get user by username: ${username}`, err)
        throw new Error("Could not get user by username")
    }
}

async function remove(userId) {
    const criteria = { _id: ObjectId.createFromHexString(userId )}

    try {
        const collection = await dbService.getCollection('user')
        const res = await collection.deleteOne(criteria)
        if (res.deletedCount === 0) throw new Error(`Could not remove user: ${userId}`)
        return userId
    } catch (err) {
        loggerService.error(`Could not remove user : ${userId}`, err)
        throw new Error("Could not remove user")
    }
}

async function update(user) {
    const criteria = { _id: user._id }
    const userToSave = { username: user.username, fullname: user.fullname}
    try {
        const collection = await dbService.getCollection('user')
        await collection.updateOne(criteria, { $set : userToSave})
        return user
    } catch (err) {
        loggerService.error(`Could not update user`, err)
        throw new Error("Could not update user")
    }
}

async function add(userToSave) {
    try {
        const collection = await dbService.getCollection('user')
        await collection.insertOne(userToSave)
        return userToSave
    } catch (err) {
        loggerService.error(`Could not add user`, err)
        throw new Error("Could not add user")

    }
    return userToSave
}

function getEmptyUser() {
    try {
        const emptyUser = {
            _id: utilService.makeId(),
            username: '',
            fullname: '',
            password: '',
            score: 10000,
            img: '',
            createdAt: 0,
            isAdmin: false,
        }
        return emptyUser
    } catch (err) {
        loggerService.error(`Could not get empty user`, err)
    }
}

function _buildCriteria(filterBy){
    if ( ! filterBy.search) return {}
    const criteria = {
    username: { $regex: filterBy.search, $options: 'i'},
    //fullname: { $gte: filterBy.}
    }
    return criteria
}

function _buildSort(filterBy){
    if (!filterBy.sortBy) return {}
    return { [filterBy.sortBy] : filterBy.sortDir }
}