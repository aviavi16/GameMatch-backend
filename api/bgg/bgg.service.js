import { dbService } from "../../services/db.service.js";
import { loggerService } from "../../services/logger.service.js";
import { ObjectId } from 'mongodb';
import { utilService } from "../../services/util.service.js";
import { msgService } from "../msg/msg.service.js";

export const bggService = {
    query,
    getById,
    remove,
    add,
    update,
    addBugNote,
    removeBugNote,
    fetchBGGData,
    fetchBGGHottest,
    fetchGameByTitle,
    fetchGameById
};

const PAGE_SIZE = 2;

async function query(filterBy = { search: '' }) {
    try {
        const criteria = _buildCriteria(filterBy);
        loggerService.info('query for the following criteria', criteria);

        const sort = _buildSort(filterBy);

        const collection = await dbService.getCollection('bug');
        var bugCursor = await collection.find(criteria, { sort });

        if (filterBy.pageIdx !== undefined) {
            bugCursor.skip(filterBy.pageIdx * PAGE_SIZE).limit(PAGE_SIZE);
        }

        const bugs = await bugCursor.toArray();
        return bugs;
    } catch (err) {
        loggerService.error("Cannot get bugs", err);
        throw new Error('Could not get bugs');
    }
}

async function getById(bugId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(bugId) };
        const collection = await dbService.getCollection('bug');
        const bug = await collection.findOne(criteria);
        if (!bug) throw new Error('Could not find bug');
        bug.createdAt = bug._id.getTimestamp();

        criteria.aboutBugId = new ObjectId(bugId);
        bug.relatedMessages = await msgService.query(criteria);
        bug.relatedMessages = bug.relatedMessages.map(message => {
            delete message.aboutBug;
            return message;
        });

        return bug;
    } catch (err) {
        loggerService.error(`Could not find bug: ${bugId}`, err);
        throw new Error('Could not find bug');
    }
}

async function remove(bugId) {
    try {
        const { loggedinUser } = asyncLocalStorage.getStore();
        const { _id: ownerId, isAdmin } = loggedinUser;

        const criteria = { _id: ObjectId.createFromHexString(bugId) };
        if (!isAdmin) criteria['owner._id'] = ownerId;

        const collection = await dbService.getCollection('bug');
        const res = await collection.deleteOne(criteria);

        if (res.deletedCount === 0) throw new Error("Not Your Bug");
        return bugId;
    } catch (err) {
        loggerService.error(`Could not remove bug: ${bugId}`, err);
        throw new Error("Could not remove bug");
    }
}

async function update(bug) {
    const bugToSave = { title: bug.title, description: bug.description, severity: bug.severity };

    try {
        const criteria = { _id: ObjectId.createFromHexString(bug._id) };
        const collection = await dbService.getCollection('bug');
        await collection.updateOne(criteria, { $set: bugToSave });
        return bug;
    } catch (err) {
        loggerService.error(`Could not save bug: ${bug._id}`, err);
        throw new Error("Could not save bug");
    }
}

async function add(bugToSave) {
    try {
        const collection = await dbService.getCollection('bug');
        await collection.insertOne(bugToSave);
        return bugToSave;
    } catch (err) {
        loggerService.error("Could not save bug", err);
        throw new Error("Could not save bug");
    }
}

async function addBugNote(bugId, note) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(bugId) };
        note.id = utilService.makeId();

        const collection = await dbService.getCollection('bug');
        await collection.updateOne(criteria, { $push: { notes: note } });
        return note;
    } catch (err) {
        loggerService.error("Could not save bug note", err);
        throw new Error("Could not save bug note");
    }
}

async function removeBugNote(bugId, noteId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(bugId) };

        const collection = await dbService.getCollection('bug');
        await collection.updateOne(criteria, { $pull: { notes: { id: noteId } } });

        return noteId;
    } catch (err) {
        loggerService.error(`Could not remove bug note: ${bugId}`, err);
        throw new Error("Could not remove bug note");
    }
}

async function fetchBGGData(username) {
    try {
        const res = await fetch(`https://www.boardgamegeek.com/xmlapi2/collection?username=${username}&subtype=boardgame&own=1`);
        if (!res.ok) throw new Error(`Failed to fetch data from ${url}`);
        const data = await res.text();
        return data;
    } catch (err) {
        loggerService.error('Failed to fetch BGG data', err);
        throw new Error('Could not fetch BGG data');
    }
}

async function fetchBGGHottest() {
    try {
        const res = await fetch(`https://www.boardgamegeek.com/xmlapi2/hot?boardgame`);
        if (!res.ok) throw new Error(`Failed to fetch data from ${url}`);
        const data = await res.text();
        return data;
    } catch (err) {
        loggerService.error('Failed to fetch BGG data', err);
        throw new Error('Could not fetch BGG data');
    }
}

async function fetchGameByTitle( gameTitle ) {
    try {
        const res = await fetch(`https://www.boardgamegeek.com/xmlapi2/search?query=${gameTitle}`);
        if (!res.ok) throw new Error(`Failed to fetch data from ${url}`);
        const data = await res.text();
        return data;
    } catch (err) {
        loggerService.error('Failed to fetch BGG data', err);
        throw new Error('Could not fetch BGG data');
    }
}

async function fetchGameById( gameId ) {
    try {
        const res = await fetch(`https://www.boardgamegeek.com/xmlapi2/thing?id=${gameId}`);
        console.log('res:', res)
        if (!res.ok) throw new Error(`Failed to fetch data from ${url}`);
        const data = await res.text();
        return data;
    } catch (err) {
        loggerService.error('Failed to fetch BGG data', err);
        throw new Error('Could not fetch BGG data');
    }
}

function _buildCriteria(filterBy) {
    if (!filterBy.search) return {};
    const criteria = {
        title: { $regex: filterBy.search, $options: 'i' },
    };
    return criteria;
}

function _buildSort(filterBy) {
    if (!filterBy.sortBy) return {};
    return { [filterBy.sortBy]: filterBy.sortDir };
}
