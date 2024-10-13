export function swapLonLat(coordinates: [number, number][]): [number, number][] {
    coordinates.forEach(element => {
        const temp = element[0];
        element[0] = element[1];
        element[1] = temp;
    });
    return coordinates;
}

export function convertLocationArrToObject(GeoLoc: [number, number]): {lat: number, lng: number} {
    const LocationObj = {
        lat: GeoLoc[0],
        lng: GeoLoc[1]
    }
    
    return LocationObj;
}




















  




  


    
    