import MapNode, { Edge } from "../types/MapNodeType";
import {
    CARGO_TRUCK_CO2_EMISSIONS_KG_PER_KM_PER_TON,
    CARGO_SHIP_CO2_EMISSIONS_KG_PER_KM_PER_TON,
    CARGO_AIRCRAFT_CO2_EMISSIONS_KG_PER_KM_PER_TON
} from "../constants/BackendConstants";

export class Graph {
    nodes: MapNode[];

    constructor(nodes: MapNode[]) {
        this.nodes = nodes;
    }

    dijkstra(startId: number, endId: number, tonnage: number): { path: Edge[], totalDistance: number, totalDuration: number, totalCO2: number } | null {
        let distances: { [key: number]: number } = {};  // Store the shortest distance from start to each node
        let previousEdges: { [key: number]: Edge | null } = {};  // Store the edge leading to each node
        let previousNodes: { [key: number]: number | null } = {};  // Store the previous node leading to the current one
        let visited: Set<number> = new Set();  // Track visited nodes
        let priorityQueue: { idx: number, emissions: number }[] = [];  // Priority queue to explore nodes
        let totalCO2Emissions: { [key: number]: number } = {};  // Store CO2 emissions from start to each node
        let totalDurations: { [key: number]: number } = {};  // Store the total duration to each node

        // Initialize distances and previous arrays
        this.nodes.forEach(node => {
            distances[node.idx] = Infinity;
            previousEdges[node.idx] = null;
            previousNodes[node.idx] = null;
            totalCO2Emissions[node.idx] = Infinity;
            totalDurations[node.idx] = Infinity;
        });

        distances[startId] = 0;
        totalCO2Emissions[startId] = 0;
        totalDurations[startId] = 0;
        priorityQueue.push({ idx: startId, emissions: 0 });

        // Helper function to calculate CO2 emissions for an edge
        const calculateCO2Emissions = (edge: Edge, tonnage: number, type: string): number => {
            let emissionFactor: number;

            if (type === "air") {
                emissionFactor = CARGO_AIRCRAFT_CO2_EMISSIONS_KG_PER_KM_PER_TON;
            } else if (type  === "sea") {
                emissionFactor = CARGO_SHIP_CO2_EMISSIONS_KG_PER_KM_PER_TON;
            } else {
                emissionFactor = CARGO_TRUCK_CO2_EMISSIONS_KG_PER_KM_PER_TON;
            }

            return (edge.distance ?? Infinity) * emissionFactor * tonnage;
        };

        // Process edges and update priority queue
        const processEdges = (edges: (Edge | null)[] | null, currentNodeId: number, type: string) => {
            if (!edges) return;

            for (let edge of edges) {
                if (!edge) continue;

                let nextNode = this.findNeighborNode(currentNodeId, edge);
                if (!nextNode || visited.has(nextNode.idx)) continue;

                let newCO2Emissions = totalCO2Emissions[currentNodeId] + calculateCO2Emissions(edge, tonnage, type);
                let newDistance = distances[currentNodeId] + (edge?.distance || 0);
                let newDuration = totalDurations[currentNodeId] + (edge?.duration || 0);

                if (newCO2Emissions < totalCO2Emissions[nextNode.idx]) {
                    distances[nextNode.idx] = newDistance;
                    previousEdges[nextNode.idx] = edge;
                    previousNodes[nextNode.idx] = currentNodeId;
                    totalCO2Emissions[nextNode.idx] = newCO2Emissions;
                    totalDurations[nextNode.idx] = newDuration;

                    priorityQueue.push({ idx: nextNode.idx, emissions: newCO2Emissions });
                    priorityQueue.sort((a, b) => a.emissions - b.emissions);  // Sort by CO2 emissions
                }
            }
        };

        // Dijkstra's algorithm execution
        while (priorityQueue.length > 0) {
            let currentNode = priorityQueue.shift()!;
            if (visited.has(currentNode.idx)) continue;

            visited.add(currentNode.idx);
            let currentMapNode = this.nodes.find(n => n.idx === currentNode.idx)!;

            processEdges(currentMapNode.seaEdges, currentNode.idx, "sea");
            processEdges(currentMapNode.airEdges, currentNode.idx, "air");
            processEdges(currentMapNode.carEdges, currentNode.idx, "car");
        }

        if (totalCO2Emissions[endId] === Infinity) return null;

        // Backtrack to find the path
        let path: Edge[] = [];
        let currentId = endId;
        while (currentId !== startId) {
            let edge = previousEdges[currentId];
            if (!edge) return null;
            path.unshift(edge);  // Add edge to the path
            currentId = previousNodes[currentId]!;  // Move to the previous node
        }

        return {
            path,
            totalDistance: distances[endId],
            totalDuration: totalDurations[endId],
            totalCO2: totalCO2Emissions[endId]
        };
    }

    private findNeighborNode(currentNodeId: number, edge: Edge | null): MapNode | null {
        if (!edge) return null;
        let currentNode = this.nodes.find(n => n.idx === currentNodeId)!;
        if (edge.Location && edge.Location.length > 0) {
            let lastLocation = edge.Location[edge.Location.length - 1];
            return this.nodes.find(n => n.Location[0] === lastLocation.lat && n.Location[1] === lastLocation.lng) || null;
        }
        return null;
    }
}


// Example usage:
const nodes: MapNode[] = [
    {
        id : "1",
        idx: 1,
        Continent: "North America",
        Country: "USA",
        Location: [40.7128, -74.0060],  // New York
        name: "New York",
        type: "City",
        seaEdges: null,
        airEdges: [
            {
                distance: 500,
                duration: 90,
                Location: [{ lat: 40.7128, lng: -74.0060 }, { lat: 51.5074, lng: -0.1278 }]  // New York to London
            },
            {
                distance: 600,
                duration: 105,
                Location: [{ lat: 40.7128, lng: -74.0060 }, { lat: 48.8566, lng: 2.3522 }]  // New York to Paris
            }
        ],
        carEdges: [{
            distance: 800,
            duration: 480,
            Location: [{ lat: 40.7128, lng: -74.0060 }, { lat: 43.65107, lng: -79.347015 }]  // New York to Toronto
        }]
    },
    {
        id : "2",
        idx: 2,
        Continent: "North America",
        Country: "Canada",
        Location: [43.65107,  -79.347015],  // Toronto
        name: "Toronto",
        type: "City",
        seaEdges: null,
        airEdges: [
            {
                distance: 700,
                duration: 120,
                Location: [{ lat: 43.65107, lng: -79.347015 }, { lat: 51.5074, lng: -0.1278 }]  // Toronto to London
            },
            {
                distance: 800,
                duration: 130,
                Location: [{ lat: 43.65107, lng: -79.347015 }, { lat: 48.8566, lng: 2.3522 }]  // Toronto to Paris
            }
        ],
        carEdges: [{
            distance: 800,
            duration: 480,
            Location: [{ lat: 43.65107, lng: -79.347015 }, { lat: 40.7128, lng: -74.0060 }]  // Toronto to New York
        }]
    },
    {
        id : "3",
        idx: 3,
        Continent: "Europe",
        Country: "UK",
        Location: [51.5074, -0.1278],  // London
        name: "London",
        type: "City",
        seaEdges: [
            {
                distance: 350,
                duration: 240,
                Location: [{ lat: 51.5074, lng: -0.1278 }, { lat: 48.8566, lng: 2.3522 }]  // London to Paris by sea
            },
            {
                distance: 8500,
                duration: 960,
                Location: [{ lat: 51.5074, lng: -0.1278 }, { lat: 39.9042, lng: 116.4074 }]  // London to Beijing by sea (fictional)
            }
        ],
        airEdges: [
            {
                distance: 500,
                duration: 90,
                Location: [{ lat: 51.5074, lng: -0.1278 }, { lat: 40.7128, lng: -74.0060 }]  // London to New York
            },
            {
                distance: 700,
                duration: 120,
                Location: [{ lat: 51.5074, lng: -0.1278 }, { lat: 43.65107, lng: -79.347015 }]  // London to Toronto
            }
        ],
        carEdges: [{
            distance: 450,
            duration: 300,
            Location: [{ lat: 51.5074, lng: -0.1278 }, { lat: 48.8566, lng: 2.3522 }]  // London to Paris by car
        }]
    },
    {
        id : "4",
        idx: 4,
        Continent: "Europe",
        Country: "France",
        Location: [48.8566, 2.3522],  // Paris
        name: "Paris",
        type: "City",
        seaEdges: [
            {
                distance: 350,
                duration: 240,
                Location: [{ lat: 48.8566, lng: 2.3522 }, { lat: 51.5074, lng: -0.1278 }]  // Paris to London by sea
            }
        ],
        airEdges: [
            {
                distance: 600,
                duration: 105,
                Location: [{ lat: 48.8566, lng: 2.3522 }, { lat: 40.7128, lng: -74.0060 }]  // Paris to New York
            },
            {
                distance: 8150,
                duration: 780,
                Location: [{ lat: 48.8566, lng: 2.3522 }, { lat: 39.9042, lng: 116.4074 }]  // Paris to Beijing
            }
        ],
        carEdges: [{
            distance: 450,
            duration: 300,
            Location: [{ lat: 48.8566, lng: 2.3522 }, { lat: 51.5074, lng: -0.1278 }]  // Paris to London by car
        }]
    },
    {
        id : "5",
        idx: 5,
        Continent: "Asia",
        Country: "China",
        Location: [39.9042, 116.4074],  // Beijing
        name: "Beijing",
        type: "City",
        seaEdges: [
            {
                distance: 8500,
                duration: 960,
                Location: [{ lat: 39.9042, lng: 116.4074 }, { lat: 51.5074, lng: -0.1278 }]  // Beijing to London by sea
            }
        ],
        airEdges: [
            {
                distance: 6800,
                duration: 840,
                Location: [{ lat: 39.9042, lng: 116.4074 }, { lat: 40.7128, lng: -74.0060 }]  // Beijing to New York
            },
            {
                distance: 8150,
                duration: 780,
                Location: [{ lat: 39.9042, lng: 116.4074 }, { lat: 48.8566, lng: 2.3522 }]  // Beijing to Paris
            }
        ],
        carEdges: null
    },
    {
        id : "6",
        idx: 6,
        Continent: "Asia",
        Country: "Japan",
        Location: [35.6762, 139.6503],  // Tokyo (Japan is unreachable)
        name: "Tokyo",
        type: "City",
        seaEdges: null,
        airEdges: [
            {
                distance: 10850,
                duration: 780,
                Location: [{ lat: 35.6762, lng: 139.6503 }, { lat: 39.9042, lng: 116.4074 }]  // Tokyo to Beijing by air
            }
        ],
        carEdges: null
    }
];



// Symmetric edges have been created. Each connection from one node to another (e.g., by car, air, sea) has a corresponding reverse edge.




// const fs = require('fs');

// const jsonFilePath = 'src/utils/firestore-data.json'

// fs.readFile(jsonFilePath, 'utf8', (err, data) => {
//     if (err) {
//         console.error('Error reading the JSON file:', err);
//         return;
//     }

//     // Parse the JSON data
//     let nodes;
//     try {
//         nodes = JSON.parse(data);
//     } catch (parseError) {
//         console.error('Error parsing JSON:', parseError);
//         return;
//     }
//     const graph = new Graph(nodes);
//     for (let node of nodes) {
//         const result = graph.dijkstra(node.idx, 3, 1000);

//         if (result) {
//             console.log("Path found:", result.path);
//             console.log("Total distance:", result.totalDistance);
//             console.log("Total duration:", result.path);

//         } else {
//             console.log("No path found.", node.type, nodes[3].type);
//         }
//     }
// });
const graph = new Graph(nodes);

for (let i = 1; i < 6; i++) {
    // if (i === 6) continue;  // Skip Tokyo (unreachable)
    const result = graph.dijkstra(i,1, 1000);
    if (result) {
        console.log("Path found:", result.path);
        console.log("Total CO2 emissions:", result.totalCO2);
        console.log("Total duration:", result.totalDuration);
        console.log("Total distance:", result.totalDistance);
    } else {
        console.log("No path found.");
    }

}
