import { Edge } from "../types/MapNodeType";

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

function extractLocations(path: Edge[]): [number, number][] {
    const flattenedLocations: [number, number][] = []; // Array to hold the concatenated locations

    for (const edge of path) {
        if (edge.Location) {
            for (const loc of edge.Location) {
                // Ensure that loc has both lat and lng properties
                if (loc.lat !== undefined && loc.lng !== undefined) {
                    flattenedLocations.push([loc.lat, loc.lng]); // Add [lat, lng] pair to the array
                }
            }
        }
    }

    return flattenedLocations;
}





















  




  


    
    