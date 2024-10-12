import MapNode from '../types/MapNodeType';

const getShortestSeaRoute = async (start: MapNode, end: MapNode): Promise<string> => {
    const lon1 = start.Location[1]
    const lat1 = start.Location[0]
    const lon2 = end.Location[1]
    const lat2 = end.Location[0]
    const string = lon1 + "%2C" + lat1 + "%3B" + lon2 + "%2C" + lat2;
    return(`https://api.searoutes.com/route/v2/sea/${string}`);
    
    // const options = {
    //     method: 'GET',
    //     headers: {
    //       accept: 'application/json',
    //       'x-api-key': 'PZwhYfb0O828K3Vsnat201ESu93mUyDp6bUmozdZ'
    //     }
    //   };
      
    //   fetch(`https://api.searoutes.com/route/v2/sea/${string}`, options)
    //     .then(response => response.json())
    //     .then(response => console.log(response))
    //     .catch(err => console.error(err));
}

export default getShortestSeaRoute;