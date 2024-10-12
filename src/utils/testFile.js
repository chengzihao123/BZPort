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

// // Import the function from the utils folder
// const { getShortestCarRoute } = require('./utils/osrmUtils');

// Example coordinates: San Francisco and New York
const start = [-122.4194, 37.7749]; // San Francisco
const end = [-73.935242, 40.730610]; // New York

// Call the function and log the results
getShortestCarRoute(start, end)
    .then(route => {
        console.log('Distance (meters):', route.distance);
        console.log('Duration (seconds):', route.duration);
        // console.log('Route geometry:', route.geometry);
    })
    .catch(error => {
        console.error('Error:', error);
    });
