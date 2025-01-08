import express from 'express';
import { 
    getBGGCollection, 
    getBGGHottest, 
    addBGGItem, 
    updateBGGItem, 
    removeBGGItem, 
    addBGGNote, 
    removeBGGNote ,
    getGameById,
    addLog,
} from './bgg.controller.js'
import { requireAuth } from '../../middlewares/require-auth.middleware.js';

const router = express.Router();

// CRUD for BGG items
router.get('/hottest', getBGGHottest); // Fetch all collections
router.get('/log', addLog); // Fetch all collections
router.get('/search/:gameId', getGameById);
router.get('/:username', getBGGCollection);
router.post('/', requireAuth, addBGGItem); // Add a new item
router.put('/:itemId', requireAuth, updateBGGItem); // Update an item
router.delete('/:itemId', requireAuth, removeBGGItem); // Remove an item

// Notes functionality
router.post('/:itemId/note', requireAuth, addBGGNote); // Add a note to an item
router.delete('/:itemId/note/:noteId', requireAuth, removeBGGNote); // Remove a specific note from an item

export const bggRoutes = router;
