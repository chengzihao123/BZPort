import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { M_TO_KM, S_TO_H } from '../constants/BackendConstants';
import { db } from '../firebase-config';
import MapNode, { Edge } from '../types/MapNodeType';
import { swapLonLat, convertLocationArrToObject } from './commonUtils';


// Function to get the shortest route using OSRM
async function getShortestCarRoute(start: MapNode, end: MapNode) {
    const lon1 = start.Location[1];
    const lat1 = start.Location[0];
    const lon2 = end.Location[1];
    const lat2 = end.Location[0];
    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=simplified&geometries=geojson`;
 
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

async function getShortestCarRouteBetweenPorts(Port1: MapNode, Port2: MapNode): Promise<Edge> {
    const carRoute = await getShortestCarRoute(Port1, Port2);
    carRoute.geometry.coordinates = swapLonLat(carRoute.geometry.coordinates);

    return {
        distance: carRoute.distance * M_TO_KM,
        duration: carRoute.duration * S_TO_H,
        Location: carRoute.geometry.coordinates.map(convertLocationArrToObject),
    }
}

async function getCarEdges(Nodes: MapNode[]): Promise<(Edge | null)[][]> {

    const carEdges: (Edge | null)[][] = [];
    for (let i = 0; i < Nodes.length; ++i) {
        carEdges[i] = [];
        for (let j = 0; j < Nodes.length; ++j) {
            const iCurr = i;
            const jCurr = j;
            if (iCurr !== jCurr && Nodes[iCurr].Continent === Nodes[jCurr].Continent) {
                
                try { 
                    
                    const carEdge = await getShortestCarRouteBetweenPorts(Nodes[iCurr], Nodes[jCurr]);
                    carEdges[iCurr][jCurr] = carEdge;

                } catch (error) {
                    console.error(`Failed to get car route between ${Nodes[iCurr].name} and ${Nodes[jCurr].name}:`, error);
                    carEdges[iCurr][jCurr] = null; // Store null or undefined when there's a failure
                }
            } else {
                carEdges[iCurr][jCurr] = null; // Avoid self-loop (route between the same port)
            }
        }
    }
    return carEdges;
}

async function getCarEdgesForIndex(Nodes: MapNode[], outerIndex: number): Promise<(Edge | null)[]> {
    const carEdgesForIndex: (Edge | null)[] = [];
    const iCurr = outerIndex; // This is the specified outer loop index

    for (let j = 0; j < Nodes.length; ++j) {
        const jCurr = j;
        if (iCurr !== jCurr && Nodes[iCurr].Continent === Nodes[jCurr].Continent) {
            try {
                const carEdge = await getShortestCarRouteBetweenPorts(Nodes[iCurr], Nodes[jCurr]);
                carEdgesForIndex[jCurr] = carEdge;
            } catch (error) {
                console.error(`Failed to get car route between ${Nodes[iCurr].name} and ${Nodes[jCurr].name}:`, error);
                carEdgesForIndex[jCurr] = null; // Store null on failure
            }
        } else {
            carEdgesForIndex[jCurr] = null; // Avoid self-loop
        }
    }

    return carEdgesForIndex;
}

async function getCarEdgeForPair(Nodes: MapNode[], outerIndex: number, innerIndex: number): Promise<Edge | null> {
    const iCurr = outerIndex;
    const jCurr = innerIndex;

    if (iCurr !== jCurr && Nodes[iCurr].Continent === Nodes[jCurr].Continent) {
        try {
            const carEdge = await getShortestCarRouteBetweenPorts(Nodes[iCurr], Nodes[jCurr]);
            return carEdge;
        } catch (error) {
            console.error(`Failed to get car route between ${Nodes[iCurr].name} and ${Nodes[jCurr].name}:`, error);
            return null;
        }
    } else {
        return null; // Avoid self-loop or nodes from different continents
    }
}

export async function writeCarEdgesForEachPort(): Promise<void> { 
    var Nodes;
    try {
        const nodesCollection = collection(db, "nodes");
        const nodesSnapshot = await getDocs(nodesCollection);
        const data: any = [];
        nodesSnapshot.forEach(doc => {
            console.log(doc.id)
            data.push({
            id: doc.id,
            ...doc.data() // Ensure your Firestore documents are structured to match MapNode
          });
        });
        Nodes = JSON.parse(JSON.stringify(data));
    } catch (error) {
        console.error("Error getting documents: ", error);
    }


    
    const carEdges = await getCarEdges(Nodes); // Assume this returns an array of Edges[] for each node 

    Nodes.forEach(async (node, index) => { 
      const idxCurr = index;
      console.log(node);
      const carEdgesForNode: (Edge | null)[] = carEdges[idxCurr]; // Ensure this follows the Edges[] format 
   
      // Get reference to the document for each node 

      const nodeDocRef = doc(db, "nodes", node.id.toString()); // Replace "nodes" with your actual collection name 
   
      // Update the 'carEdges' field for each node 
      try { 
        await updateDoc(nodeDocRef, { 
          // Use Firestore's arrayUnion to add new entries without overwriting the whole array 
          carEdges: carEdgesForNode
        }); 
   
        console.log(`Successfully updated airEdges for node ${node.id}`); 
      } catch (error) { 
        console.error(`Error updating node ${node.id}:`, error); 
      } 
    }); 
  }


  export async function writeCarEdgesForSpecifiedPort(i): Promise<void> { 
    var Nodes;
    try {
        const nodesCollection =  query(collection(db, "nodes"), orderBy("idx", "asc"));
        const nodesSnapshot = await getDocs(nodesCollection);
        const data: any = [];
        nodesSnapshot.forEach(doc => {
            // console.log(doc.id)
            data.push({
            id: doc.id,
            ...doc.data() // Ensure your Firestore documents are structured to match MapNode
          });
        });
        Nodes = JSON.parse(JSON.stringify(data));
    } catch (error) {
        console.error("Error getting documents: ", error);
    }


    
    const carEdges = await getCarEdgesForIndex(Nodes, i); // Assume this returns an array of Edges[] for each node 

      const node = Nodes[i];

    //   console.log(node);
      const carEdgesForNode: (Edge | null)[] = carEdges; // Ensure this follows the Edges[] format 
   
      // Get reference to the document for each node 

      const nodeDocRef = doc(db, "nodes", node.id.toString()); // Replace "nodes" with your actual collection name 
   
      // Update the 'carEdges' field for each node 
      try { 
        await updateDoc(nodeDocRef, { 
          // Use Firestore's arrayUnion to add new entries without overwriting the whole array 
          carEdges: carEdgesForNode
        }); 
   
        console.log(`Successfully updated airEdges for node ${node.id}`); 
      } catch (error) { 
        console.error(`Error updating node ${node.id}:`, error); 
      } 
    }; 
  

    export async function writeCarEdgeForPair(outerIndex: number, innerIndex: number): Promise<void> {
        let Nodes;
        try {
            const nodesCollection = collection(db, "nodes");
            const nodesSnapshot = await getDocs(nodesCollection);
            const data: any = [];
            nodesSnapshot.forEach(doc => {
                data.push({
                    id: doc.id, // Firestore document ID
                    ...doc.data() // Other document fields
                });
            });
            Nodes = JSON.parse(JSON.stringify(data));
        } catch (error) {
            console.error("Error getting documents: ", error);
            return;
        }
    
        // Ensure valid indices
        if (outerIndex < 0 || outerIndex >= Nodes.length || innerIndex < 0 || innerIndex >= Nodes.length) {
            console.error(`Invalid indices: outerIndex: ${outerIndex}, innerIndex: ${innerIndex}.`);
            return;
        }
    
        // Get the car edge for the specified pair of nodes
        const carEdge: Edge | null = await getCarEdgeForPair(Nodes, outerIndex, innerIndex);
    
        // Get the node reference for the outerIndex node
        const node = Nodes[outerIndex];
        const nodeDocRef = doc(db, "nodes", node.id.toString());
    
        // Update the 'carEdges' field for this specific edge
        try {
            const carEdgesFieldUpdate = { carEdges: carEdge }; // Use dot notation to update only one edge
            await updateDoc(nodeDocRef, carEdgesFieldUpdate);
            console.log(`Successfully updated carEdge between node ${outerIndex} and ${innerIndex}`);
        } catch (error) {
            console.error(`Error updating carEdge for node ${outerIndex}:`, error);
        }
    }



export default getShortestCarRoute;
