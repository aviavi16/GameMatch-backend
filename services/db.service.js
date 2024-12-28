import { MongoClient } from 'mongodb';
import { config } from '../config/index.js';

/*
 * Requires the MongoDB Node.js Driver
 * https://mongodb.github.io/node-mongodb-native
 */

export const dbService = {
    getCollection,
}

var dbConnection = null

async function getCollection(collectionName){
    const db = await _connect()
    return db.collection(collectionName)
}

async function _connect(){
    if ( dbConnection) return dbConnection
    try {
        const client = await MongoClient.connect( config.dbURL )
        return dbConnection = client.db(config.dbName)
    } catch (err) {
       console.log("Cannot connect to DB", err)
    }
}
