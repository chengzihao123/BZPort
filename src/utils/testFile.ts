import Nodes from "./sampleData";
import GeoJSONFeatureCollection from "../types/seaRouteResponseTypes";
import haversineDistance from "./airRouteUtils";
import getShortestCarRoute from "./osrmUtils";
import getShortestSeaRoute from "./searouteUtils";

const first = Nodes[0];
const second = Nodes[1];
async function test() {

    console.log(`Distance between ${first.name} and ${second.name}: ${haversineDistance(first, second)}`);
    const carRoute = await getShortestCarRoute(first, second);
    console.log(`Shortest car route between ${first.name} and ${second.name}: ${carRoute.distance}`);

    // for (let i = 0; i < Nodes.length; ++i) {
    //     for (let j = i + 1; j < Nodes.length; ++j) {
    //         // Create an IIFE to capture current values of i and j
    //         const currI = i;
    //         const currJ = j;
            
    //             console.log(`Distance between ${Nodes[currI].name} and ${Nodes[currJ].name}: ${haversineDistance(Nodes[i], Nodes[j])}`);
                
    //             // Await the result of the async function
    //             const carRoute = await getShortestCarRoute(Nodes[currI], Nodes[currJ]);
    //             console.log(`Shortest car route between ${Nodes[currI].name} and ${Nodes[currJ].name}: ${carRoute.distance}`);
                
    //             const seaRoute = await getShortestSeaRoute(Nodes[currI], Nodes[currJ]);
    //             console.log(`Shortest sea route between ${Nodes[currI].name} and ${Nodes[currJ].name}: ${seaRoute}`);
            
    //     }
    // }
}
test();
