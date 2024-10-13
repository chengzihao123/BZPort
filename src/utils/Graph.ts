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

    dijkstra(startId: string, endId: string, tonnage: number): { path: Edge[], totalDistance: number, totalDuration: number, totalCO2: number } | null {
        console.log("Dijkstra's algorithm starting from node", startId, "to node", endId);
        console.log(startId)
        console.log(endId)
        
        let distances: { [key: number]: number } = {};  // Store the shortest distance from start to each node
        let previousEdges: { [key: number]: Edge | null } = {};  // Store the edge leading to each node
        let previousNodes: { [key: number]: number | null } = {};  // Store the previous node leading to the current one
        let visited: Set<number> = new Set();  // Track visited nodes
        let priorityQueue: { idx: number, emissions: number }[] = [];  // Priority queue to explore nodes
        let totalCO2Emissions: { [key: number]: number } = {};  // Store CO2 emissions from start to each node
        let totalDurations: { [key: number]: number } = {};  // Store the total duration to each node
        console.log("This is my nodes!!")
        console.log(this.nodes)
        // Initialize distances and previous arrays
        this.nodes.forEach(node => {
            distances[node.idx] = Infinity;
            previousEdges[node.idx] = null;
            previousNodes[node.idx] = null;
            totalCO2Emissions[node.idx] = Infinity;
            totalDurations[node.idx] = Infinity;
        });
        

        const startIdx = this.nodes.find(n => n.id === startId)!.idx
        const endIdx = this.nodes.find(n => n.id === endId)!.idx
        distances[startIdx] = 0;
        totalCO2Emissions[startIdx] = 0;
        totalDurations[startIdx] = 0;
        priorityQueue.push({ idx: startIdx, emissions: 0 });

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

        if (totalCO2Emissions[endIdx] === Infinity) return null;

        // Backtrack to find the path
        let path: Edge[] = [];
        let currentIdx = endIdx;
        while (currentIdx !== startIdx) {
            let edge = previousEdges[currentIdx];
            if (!edge) return null;
            path.unshift(edge);  // Add edge to the path
            currentIdx = previousNodes[currentIdx]!;  // Move to the previous node
        }
            
        console.log(path)
        return {
            path,
            totalDistance: distances[endIdx],
            totalDuration: totalDurations[endIdx],
            totalCO2: totalCO2Emissions[endIdx]
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


