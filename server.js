import express from 'express'
import path from 'path'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { loggerService } from './services/logger.service.js'
import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'

const app = express()

const coreOptions = {
    origin: [
        'http://127.0.0.1:5173',
        'http://localhost:5173'
    ],
    credentials: true
}

app.all('*', setupAsyncLocalStorage)

app.use (express.static( 'public' ))
app.use (express.json())
app.use( cookieParser())
app.use( cors ( coreOptions ))

// import {bugRoutes} from './api/bug/bug.routes.js'
// app.use('/api/bug', bugRoutes )

import {userRoutes} from './api/user/user.routes.js'
app.use('/api/user', userRoutes )

import {authRoutes} from './api/auth/auth.routes.js'
app.use('/api/auth', authRoutes )

import {bggRoutes} from './api/bgg/bgg.routes.js'
app.use('/api/bgg', bggRoutes )

const port = process.env.PORT || 3030

app.get('/**', (req, res) => {
    res.sendFile( path.resolve('public/index.html'))
})

app.listen(port, () => {
	loggerService.info(`Example app listening on port ${port}`)
})
