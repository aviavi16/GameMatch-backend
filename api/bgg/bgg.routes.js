import express from 'express';
import { 
    getBGGCollection, 
    addBGGItem,
    getBGGHottest, 
    updateBGGItem, 
    removeBGGItem, 
    addBGGNote, 
    removeBGGNote ,
    getGameById,
    getGameByName,
    addLog,
    getImageById,
    getUserData
} from './bgg.controller.js'
import { requireAuth } from '../../middlewares/require-auth.middleware.js';

const router = express.Router();

// CRUD for BGG items
router.get('/hottest',  getBGGHottest); // Fetch all collections
router.get('/liked', requireAuth, getUserData); // Fetch all collections
router.get('/log', addLog); // Fetch all collections
router.get('/search/:gameId', getGameById);
router.get('/search/image/:gameIds', getImageById);
router.get('/search/title/:gameTitle', getGameByName);
router.get('/:username', getBGGCollection);
router.put('/add', requireAuth, addBGGItem); // update the likedArray: Add a new item to existing user
router.put('/:itemId', requireAuth, updateBGGItem); // Update an item
router.delete('/:itemId', requireAuth, removeBGGItem); // Remove an item

// Notes functionality
router.post('/:itemId/note', requireAuth, addBGGNote); // Add a note to an item
router.delete('/:itemId/note/:noteId', requireAuth, removeBGGNote); // Remove a specific note from an item

export const bggRoutes = router;
