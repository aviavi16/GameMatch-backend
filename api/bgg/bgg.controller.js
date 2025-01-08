import { loggerService } from "../../services/logger.service.js";
import { utilService } from "../../services/util.service.js";
import { bggService } from "./bgg.service.js";

export async function getBGGHottest(req, res) {
    try {
        const collection = await bggService.fetchBGGHottest();
        loggerService.debug( `hottest collection was fetched from bgg api succesfully`)
        var collectionsArray = await utilService.getHottestCollectionFromXml(collection)
        res.send(collectionsArray);
    } catch (err) {
        loggerService.error("Cannot get BGG Hottest collections", err);
        return res.status(400).send("Cannot get BGG Hottest collections");
    }
}

export async function getBGGCollection(req, res) {

    const { username } = req.params;
    try {
        const collection = await bggService.fetchBGGData(username);
        loggerService.debug( `user collection was fetched from bgg api succesfully`)
        var collectionsArray = await utilService.getUserCollectionFromXml(collection)
        res.send(collectionsArray);
    } catch (err) {
        loggerService.error("Cannot get BGG collection", err);
        return res.status(400).send("Cannot get BGG collection");
    }
}

export async function getGameByName(req, res) {

    const { gameTitle } = req.params;
    try {
        const gameData = await bggService.fetchGameByTitle(gameTitle);
        res.send(gameData);
    } catch (err) {
        loggerService.error("Cannot get GameByTitle", err);
        return res.status(400).send("Cannot get GameByTitle");
    }
}

export async function getGameById(req, res) {

    const { gameId } = req.params;
    try {
        const gameData = await bggService.fetchGameById(gameId);
        res.send(gameData);
    } catch (err) {
        loggerService.error("Cannot get fetchGameById", err);
        return res.status(400).send("Cannot get fetchGameById");
    }
}

export async function addBGGItem(req, res) {
    const { loggedinUser, body: bggItem } = req;

    try {
        bggItem.owner = loggedinUser;
        const savedItem = await bggService.add(bggItem);
        res.json(savedItem);
    } catch (err) {
        loggerService.error("Cannot add BGG item", err);
        return res.status(400).send("Could not add BGG item");
    }
}

export async function updateBGGItem(req, res) {
    const { loggedinUser } = req;
    const { _id, name, description } = req.body; // Customize fields based on your data model

    const itemToSave = {
        _id,
        name,
        description,
    };

    try {
        const savedItem = await bggService.update(itemToSave, loggedinUser);
        res.send(savedItem);
    } catch (err) {
        loggerService.error("Cannot update BGG item", err);
        return res.status(400).send("Could not update BGG item");
    }
}

export async function removeBGGItem(req, res) {
    const { loggedinUser } = req;
    const { itemId } = req.params;

    try {
        await bggService.remove(itemId, loggedinUser);
        res.send("OK");
    } catch (err) {
        loggerService.error(`removeBGGItem failed: ${err}`);
        return res.status(400).send("Cannot remove BGG item");
    }
}

export async function addBGGNote(req, res) {
    const { loggedinUser } = req;

    try {
        const itemId = req.params.itemId;
        const note = {
            text: req.body.text,
            by: loggedinUser,
        };
        const savedNote = await bggService.addNote(itemId, note);
        res.json(savedNote);
    } catch (err) {
        loggerService.error(`add BGG note failed: ${err}`);
        return res.status(400).send("Could not add BGG note");
    }
}

export async function removeBGGNote(req, res) {
    try {
        const { itemId, noteId } = req.params;

        const removedNote = await bggService.removeNote(itemId, noteId);
        res.send(removedNote);
    } catch (err) {
        loggerService.error(`Failed to remove BGG note: ${err}`);
        return res.status(400).send("Cannot remove BGG note");
    }
}

export async function getBGGData(req, res) {
    const targetUrl = req.query.url;

    try {
        const data = await bggService.fetchBGGData(targetUrl);
        res.status(200).send(data); // Send raw text response to the client
    } catch (error) {
        loggerService.error("Cannot fetch BGG data", error);
        res.status(500).send({ error: error.message });
    }
}
