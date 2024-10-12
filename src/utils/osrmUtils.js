// utils/osrmUtils.js

// Function to get the shortest route using OSRM
async function getShortestCarRoute(start, end) {
    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`;

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

module.exports = { getShortestCarRoute };
