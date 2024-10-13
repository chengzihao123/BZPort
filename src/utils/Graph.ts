import MapNode, { Edge } from "../types/MapNodeType";

class Graph {
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
            return this.nodes.find(n => n.Location[0] === lastLocation[0] && n.Location[1] === lastLocation[1]) || null;
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
        Location: [1, 1],  // New York
        name: "New York",
        type: "City",
        seaEdges: null,
        airEdges: [
            {
                distance: 500,
                duration: 90,
                Location: [[1, 1], [3, 3]]  // New York to London by air
            },
            {
                distance: 600,
                duration: 105,
                Location: [[1, 1], [4, 4]]  // New York to Paris by air
            }
        ],
        carEdges: [{
            distance: 800,
            duration: 480,
            Location: [[1, 1], [2, 2]]  // New York to Toronto by car
        }]
    },
    {
        id: 2,
        Continent: "North America",
        Country: "Canada",
        Location: [2, 2],  // Toronto
        name: "Toronto",
        type: "City",
        seaEdges: null,
        airEdges: [{
            distance: 700,
            duration: 120,
            Location: [[2, 2], [3, 3]]  // Toronto to London by air
        }],
        carEdges: [{
            distance: 800,
            duration: 480,
            Location: [[2, 2], [1, 1]]  // Toronto to New York by car
        }]
    },
    {
        id: 3,
        Continent: "Europe",
        Country: "UK",
        Location: [3, 3],  // London
        name: "London",
        type: "City",
        seaEdges: [{
            distance: 350,
            duration: 240,
            Location: [[3, 3], [4, 4]]  // London to Paris by sea (ferry)
        }],
        airEdges: [
            {
                distance: 500,
                duration: 90,
                Location: [[3, 3], [1, 1]]  // London to New York by air
            },
            {
                distance: 700,
                duration: 120,
                Location: [[3, 3], [2, 2]]  // London to Toronto by air
            }
        ],
        carEdges: [{
            distance: 450,
            duration: 300,
            Location: [[3, 3], [4, 4]]  // London to Paris by car
        }]
    },
    {
        id: 4,
        Continent: "Europe",
        Country: "France",
        Location: [4, 4],  // Paris
        name: "Paris",
        type: "City",
        seaEdges: [{
            distance: 350,
            duration: 240,
            Location: [[4, 4], [3, 3]]  // Paris to London by sea (ferry)
        }],
        airEdges: [
            {
                distance: 600,
                duration: 105,
                Location: [[4, 4], [1, 1]]  // Paris to New York by air
            },
            {
                distance: 8150,
                duration: 780,
                Location: [[4, 4], [5, 5]]  // Paris to Beijing by air
            }
        ],
        carEdges: [{
            distance: 450,
            duration: 300,
            Location: [[4, 4], [3, 3]]  // Paris to London by car
        }]
    },
    {
        id: 5,
        Continent: "Asia",
        Country: "China",
        Location: [5, 5],  // Beijing
        name: "Beijing",
        type: "City",
        seaEdges: [{
            distance: 8500,
            duration: 960,
            Location: [[5, 5], [3, 3]]  // Beijing to London by sea (fictional sea route)
        }],
        airEdges: [
            {
                distance: 6800,
                duration: 840,
                Location: [[5, 5], [1, 1]]  // Beijing to New York by air
            },
            {
                distance: 8150,
                duration: 780,
                Location: [[5, 5], [4, 4]]  // Beijing to Paris by air
            }
        ],
        carEdges: null
    },
    {
        id: 6,
        Continent: "Asia",
        Country: "Japan",
        Location: [6, 6],  // Tokyo (Japan is unreachable)
        name: "Tokyo",
        type: "City",
        seaEdges: null,
        airEdges: [
            {
                distance: 10850,
                duration: 780,
                Location: [[6, 6], [5, 5]]  // Tokyo to Beijing by air (not symmetric)
            }
        ],
        carEdges: null
    }
];


// Symmetric edges have been created. Each connection from one node to another (e.g., by car, air, sea) has a corresponding reverse edge.


const graph = new Graph(nodes);


for (let i = 1; i < 6; i++) {
    // if (i === 6) continue;  // Skip Tokyo (unreachable)
    const result = graph.dijkstra(i,5);
    if (result) {
        console.log("Path found:", result.path);
        console.log("Total distance:", result.totalDistance);
    } else {
        console.log("No path found.");
    }

}
