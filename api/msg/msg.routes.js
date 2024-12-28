import express from 'express'
import { addMsg, getMsg, getMsgs, removeMsg, updateMsg } from './msg.controller.js'
import { requireAuth } from '../../middlewares/require-auth.middleware.js'

const router = express.Router()

router.get('/', getMsgs )
router.get('/:msgId', getMsg )
router.put('/:msgId', updateMsg )
router.post('/', addMsg )
router.delete('/:msgId', removeMsg )

export const msgRoutes = router