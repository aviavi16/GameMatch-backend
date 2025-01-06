
export const bggApiService = {
    getWantedGames,
    getOwnedGames
}


async function getWantedGames( username ){

    
    try{

      

    } catch (err){
        loggerService.error("Cannot getWantedGames", err)
        throw new Error ('Could not getWantedGames')
    }
    return null
}

async function getOwnedGames( username ){

    
    try{

      

    } catch (err){
        loggerService.error("Cannot getOwnedGames", err)
        throw new Error ('Could not getOwnedGames')
    }
    return null
}

