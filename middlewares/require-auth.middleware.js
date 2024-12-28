import { authService } from "../api/auth/auth.service.js"
import { loggerService } from "../services/logger.service.js"

export function requireAuth(req, res, next){
    const loggedinUser  = authService.validateToken(req.cookies.loginToken)
    if( !loggedinUser) return res.status(401).send('Not Authenticated')
    req.loggedinUser = loggedinUser

    next()
}