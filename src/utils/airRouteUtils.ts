import MapNode from '../types/MapNodeType';

function haversineDistance(coords1: MapNode, coords2: MapNode): number {
    // Convert latitude and longitude from degrees to radians
    const toRadians = (degrees) => degrees * (Math.PI / 180);

    const lat1 = toRadians(coords1.Location[0]);
    const lon1 = toRadians(coords1.Location[1]);
    const lat2 = toRadians(coords2.Location[0]);
    const lon2 = toRadians(coords2.Location[1]);

    // Haversine formula
    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;

    const a = Math.sin(dlat / 2) ** 2 +
              Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Radius of the Earth in kilometers (mean radius)
    const R = 6371;

    // Calculate the distance
    const distance = R * c;
    return distance;
}

export default haversineDistance;