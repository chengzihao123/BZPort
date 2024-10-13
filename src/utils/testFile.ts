import Nodes from "./sampleData";
import GeoJSONFeatureCollection from "../types/seaRouteResponseTypes";
import haversineDistance from "./airRouteUtils";
import getShortestCarRoute from "./osrmUtils";
import getShortestSeaRoute from "./searouteUtils";
import MapNode from "../types/MapNodeType";
import { Edge } from "../types/MapNodeType";
const first = Nodes[0];
const second = Nodes[1];
async function test() {

    // console.log(`Distance between ${first.name} and ${second.name}: ${haversineDistance(first, second)}`);
    const carRoute = await getShortestCarRoute(first, second);
    console.log(`Shortest car route between ${first.name} and ${second.name}: ${carRoute.distance}`);
    console.log(`Shortest car route between ${first.name} and ${second.name}: ${carRoute.duration}`);
    // console.log(carRoute.geometry);
    // write to file data.txt the geometry in json format
    // const fs = require('fs');
    // // change property name coordinates to Location
    // const LocationArr: [number, number][][][] = [];
    
    // // initialize array with null
    // for (let i = 0; i < 1; ++i) {
    //     LocationArr[i] = [];
    //     for (let j = 0; j < 1; ++j) {
    //         LocationArr[i][j] = [];
    //     }
    // }

    // // swap longitude and latitude
    // carRoute.geometry.coordinates.forEach(element => {
    //     const temp = element[0];
    //     element[0] = element[1];
    //     element[1] = temp;
    // });

    



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

function getAirEdgeBetweenAirports(Airport1: MapNode, Airport2: MapNode): Edge {
    const distance = haversineDistance(Airport1, Airport2);
    return {
        distance: distance,
        duration: distance / CARGO_AIRCRAFT_SPEED_KM_PER_H,
        Location: 
            [Airport1.Location as [number, number], 
            Airport2.Location as [number, number]]
    }
}

async function getShortestCarRouteBetweenPorts(Port1: MapNode, Port2: MapNode): Promise<Edge> {
    const carRoute = await getShortestCarRoute(Port1, Port2);
    carRoute.geometry.coordinates = swapLonLat(carRoute.geometry.coordinates);
    return {
        distance: carRoute.distance * M_TO_KM,
        duration: carRoute.duration * S_TO_H,
        Location: carRoute.geometry.coordinates
    }
}

async function getSeaEdgeBetweenPorts(Port1: MapNode, Port2: MapNode): Promise<Edge> {
    const seaRoute = await getShortestSeaRoute(Port1, Port2);
    seaRoute.features[0].geometry.coordinates = swapLonLat(seaRoute.features[0].geometry.coordinates);
    return {
        distance: seaRoute.features[0].properties.distance * M_TO_KM,
        duration: seaRoute.features[0].properties.duration * MS_TO_S * S_TO_H,
        Location: seaRoute.features[0].geometry.coordinates,
    }
}

function getAirports(Nodes: MapNode[]): MapNode[] {
    return Nodes.filter(node => node.type === 'Air');
}

function getSameContinentPorts(TargetNode: MapNode, Nodes: MapNode[]): MapNode[] {
    return Nodes.filter(node => node.Continent === TargetNode.Continent);
}

function getSeaPorts(Nodes: MapNode[]): MapNode[] {
    return Nodes.filter(node => node.type === 'Port');
}

function swapLonLat(coordinates: [number, number][]): [number, number][] {
    coordinates.forEach(element => {
        const temp = element[0];
        element[0] = element[1];
        element[1] = temp;
    });
    return coordinates;
}

async function getSeaEdges(Nodes: MapNode[]): Promise<(Edge | null)[][]> {
    const seaPorts = getSeaPorts(Nodes);
    const seaEdges: (Edge | null)[][] = [];
    for (let i = 0; i < seaPorts.length; ++i) {
        seaEdges[i] = [];
        for (let j = 0; j < seaPorts.length; ++j) {
            if (i !== j) { // Skip if comparing the same port
                try {
                    const seaEdge = await getSeaEdgeBetweenPorts(seaPorts[i], seaPorts[j]);
                    seaEdges[i][j] = seaEdge;
                } catch (error) {
                    console.error(`Failed to get sea route between ${seaPorts[i].name} and ${seaPorts[j].name}:`, error);
                    seaEdges[i][j] = null; // Store null or undefined when there's a failure
                }
            } else {
                seaEdges[i][j] = null; // Avoid self-loop (route between the same port)
            }
        }
    }
    return seaEdges;
}

function getAirEdges(Nodes: MapNode[]): (Edge | null)[][] {
    const airports = getAirports(Nodes);
    const airEdges: (Edge | null)[][] = [];
    for (let i = 0; i < airports.length; ++i) {
        airEdges[i] = [];
        for (let j = 0; j < airports.length; ++j) {
            if (i !== j) { // Skip if comparing the same airport
                const airEdge = getAirEdgeBetweenAirports(airports[i], airports[j]);
                airEdges[i][j] = airEdge;
            } else {
                airEdges[i][j] = null; // Avoid self-loop (route between the same airport)
            }
        }
    }
    return airEdges;
}

async function getCarEdges(Nodes: MapNode[]): Promise<(Edge | null)[][]> {
    const ports = getSeaPorts(Nodes);
    const carEdges: (Edge | null)[][] = [];
    for (let i = 0; i < ports.length; ++i) {
        carEdges[i] = [];
        for (let j = 0; j < ports.length; ++j) {
            if (i !== j && ports[i].Continent === ports[j].Continent) {
                try { // Skip if comparing the same port / diff continent
                    const carEdge = await getShortestCarRouteBetweenPorts(ports[i], ports[j]);
                    carEdges[i][j] = carEdge;

                } catch (error) {
                    console.error(`Failed to get car route between ${ports[i].name} and ${ports[j].name}:`, error);
                    carEdges[i][j] = null; // Store null or undefined when there's a failure
                }
            } else {
                carEdges[i][j] = null; // Avoid self-loop (route between the same port)
            }
        }
    }
    return carEdges;
}

function getAirEdgesforEachPort(Nodes: MapNode[]): void {
    const airEdges = getAirEdges(Nodes);

    Nodes.forEach((node, index) => {
        const airEdgesForNode = airEdges[index];
        /*
        write to the firebase

        */
    }
    )
}