import express from 'express'
import { getBug, getBugs, addBug, updateBug, removeBug, addBugNote, removeBugNote } from './bug.controller.js'
import { requireAuth } from '../../middlewares/require-auth.middleware.js'

const router = express.Router()

router.get('/', getBugs )
router.get('/:bugId', getBug )
router.put('/:bugId', requireAuth, updateBug )
router.post('/', requireAuth, addBug )
router.delete('/:bugId', requireAuth, removeBug )

router.post('/:bugId/note', requireAuth, addBugNote)
router.delete('/:bugId/note/:noteId', requireAuth, removeBugNote)

export const bugRoutes = router