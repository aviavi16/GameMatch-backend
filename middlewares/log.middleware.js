import { loggerService } from "../services/logger.service.js"

export function log(req, res, next){
    const {path} = req.route
    loggerService.info( `visited route ${path}`)

    next()
}