
import fs from 'fs'
import { Parser } from 'xml2js'

export const utilService = {
    makeId,
    saveToStorage,
    loadFromStorage,
    readJsonFile, 
    writeJsonFile,
    getHottestCollectionFromXml,
    getUserCollectionFromXml
}

function makeId(length = 5) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function saveToStorage(key, value) {
    localStorage[key] = JSON.stringify(value);
}

function loadFromStorage(key, defaultValue = null) {
    var value = localStorage[key] || defaultValue;
    return JSON.parse(value);
}

function readJsonFile( path ){
    const str = fs.readFileSync ( path, 'utf8' )
    const data = JSON.parse(str) 
    return data
}

function writeJsonFile ( path , data ){
    return new Promise( (reslove, reject) => {
        const json = JSON.stringify (data, null, 2)
        fs.writeFile ( path , json , err => {
            if( err )
                return reject (err )
            reslove()
        })
    })
}

export async function getHottestCollectionFromXml(hottestXml) {
    const parser = new Parser({ explicitArray: false, attrkey: '$' });
    let res = [];

    try {
        const parsedData = await parser.parseStringPromise(hottestXml);

        const items = parsedData.items.item; // Adjust based on actual XML structure

        items.forEach(item => {
            const gameObject = {
                name: item.name.$.value,
                id: item.$.id,
            };
            res.push(gameObject);
        });

    } catch (error) {
        console.error('Error parsing XML:', error);
    }
    return res;
}

export async function getUserCollectionFromXml( userCollectionXml ) {
    const parser = new Parser({ explicitArray: false, attrkey: '$' });
    let res = [];
    console.log('entering getUserCollectionFromXml:')
    try {
        const parsedData = await parser.parseStringPromise(userCollectionXml);

        const items = parsedData.items.item; // Adjust based on actual XML structure
        items.forEach(item => {
            const gameObject = {
                name: item.name._, // Get the name value
                id: item.$.objectid, // Get the object ID
            };
            res.push(gameObject);
        });

    } catch (error) {
        console.error('Error parsing XML:', error);
    }
    return res;
}

export function getExistingProperties(obj){
    const trueObj = {}
    for (const key in obj){
        const val = obj[key]
        if ( val || typeof val === 'boolean')
            trueObj[key] = val
    }
    return trueObj
}

export function debounce( func , time ){
    let timeoutId
    return ( ...args ) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout( () => {
            func( ...args)
        }, time )
    }
}

