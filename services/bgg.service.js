
export const bggApiService = {
    getOwnedGames
}




async function getOwnedGames( username ){

    
    try{

      

    } catch (err){
        loggerService.error("Cannot getOwnedGames", err)
        throw new Error ('Could not getOwnedGames')
    }
    return null
}

