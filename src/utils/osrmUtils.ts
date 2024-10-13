import MapNode from '../types/MapNodeType';

// Function to get the shortest route using OSRM
async function getShortestCarRoute(start: MapNode, end: MapNode) {
    const lon1 = start.Location[1];
    const lat1 = start.Location[0];
    const lon2 = end.Location[1];
    const lat2 = end.Location[0];
    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;
 
    try {
        const response = await fetch(osrmUrl);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            return {
                distance: route.distance,  // Distance in meters
                duration: route.duration,  // Duration in seconds
                geometry: route.geometry   // Route geometry (GeoJSON)
            };
        } else {
            throw new Error('No route found');
        }
    } catch (error) {
        console.error('Error fetching route:', error);
        throw error;
    }
}

export default getShortestCarRoute;
