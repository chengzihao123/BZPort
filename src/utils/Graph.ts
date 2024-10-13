import MapNode, { Edge } from "../types/MapNodeType";

export class Graph {
    nodes: MapNode[];

    constructor(nodes: MapNode[]) {
        this.nodes = nodes;
    }

    dijkstra(startId: number, endId: number): { path: Edge[], totalDistance: number } | null {
        let distances: { [key: number]: number } = {};  // Store the shortest distance from start to each node
        let previousEdges: { [key: number]: Edge | null } = {};  // Store the edge leading to each node
        let previousNodes: { [key: number]: number | null } = {};  // Store the previous node leading to the current one
        let visited: Set<number> = new Set();  // Track visited nodes
        let priorityQueue: { id: number, distance: number }[] = [];  // Priority queue to explore nodes

        // Initialize distances and previous arrays
        this.nodes.forEach(node => {
            distances[node.id] = Infinity;
            previousEdges[node.id] = null;
            previousNodes[node.id] = null;
        });
        distances[startId] = 0;
        priorityQueue.push({ id: startId, distance: 0 });

        // Helper function to process edges and update the priority queue
        const processEdges = (edges: Edge[] | null, currentNodeId: number) => {
            if (!edges) return;

            for (let edge of edges) {
                let nextNode = this.findNeighborNode(currentNodeId, edge);
                if (!nextNode || visited.has(nextNode.id)) continue;

                let newDistance = distances[currentNodeId] + (edge.distance || 0);

                if (newDistance < distances[nextNode.id]) {
                    distances[nextNode.id] = newDistance;
                    previousEdges[nextNode.id] = edge;
                    previousNodes[nextNode.id] = currentNodeId;
                    priorityQueue.push({ id: nextNode.id, distance: newDistance });
                    priorityQueue.sort((a, b) => a.distance - b.distance);  // Sort by distance
                }
            }
        };

        // Dijkstra's algorithm execution
        while (priorityQueue.length > 0) {
            let currentNode = priorityQueue.shift()!;
            if (visited.has(currentNode.id)) continue;

            visited.add(currentNode.id);
            let currentMapNode = this.nodes.find(n => n.id === currentNode.id)!;

            // Process all types of edges (sea, air, car)
            processEdges(currentMapNode.seaEdges, currentNode.id);
            processEdges(currentMapNode.airEdges, currentNode.id);
            processEdges(currentMapNode.carEdges, currentNode.id);
        }

        // If the end node is not reachable
        if (distances[endId] === Infinity) return null;

        // Backtrack to find the path
        let path: Edge[] = [];
        let currentId = endId;
        while (currentId !== startId) {
            let edge = previousEdges[currentId];
            if (!edge) return null;  // No path found
            path.unshift(edge);  // Add edge to the path
            currentId = previousNodes[currentId]!;  // Move to the previous node
        }

        return { path, totalDistance: distances[endId] };
    }

    // Function to find the neighbor node connected by an edge
    private findNeighborNode(currentNodeId: number, edge: Edge): MapNode | null {
        // Find a node connected by this edge based on its location
        let currentNode = this.nodes.find(n => n.id === currentNodeId)!;
        if (edge.Location && edge.Location.length > 0) {
            let lastLocation = edge.Location[edge.Location.length - 1];  // Get the last coordinate of the edge
            return this.nodes.find(n => n.Location[0] === lastLocation.lat && n.Location[1] === lastLocation.lng) || null;
        }
        return null;
    }
}


// Example usage:
const nodes: MapNode[] = [
    {
        id: 1,
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
        id: 2,
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
        id: 3,
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
        id: 4,
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
        id: 5,
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
        id: 6,
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


const graph = new Graph(nodes);


for (let i = 1; i < 6; i++) {
    // if (i === 6) continue;  // Skip Tokyo (unreachable)
    const result = graph.dijkstra(i,3

    );
    if (result) {
        console.log("Path found:", result.path);
        console.log("Total distance:", result.totalDistance);
    } else {
        console.log("No path found.");
    }

}

