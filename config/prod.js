export default {
    dbURL : process.env.MONGO_URL || 'somecloud://urlUserAndPassword',
    dbName : process.env.DB_NAME || 'GameMatchDb' 
}