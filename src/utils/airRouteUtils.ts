import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { CARGO_AIRCRAFT_SPEED_KM_PER_H } from '../constants/BackendConstants';
import { db } from '../firebase-config';
import MapNode, { Edge } from '../types/MapNodeType';
import { convertLocationArrToObject } from './commonUtils';

function getAirports(Nodes: MapNode[]): MapNode[] {
    return Nodes.filter(node => node.type === 'Air');
}

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

function getAirEdgeBetweenAirports(Airport1: MapNode, Airport2: MapNode): Edge {
    const distance = haversineDistance(Airport1, Airport2);
    return {
        distance: distance,
        duration: distance / CARGO_AIRCRAFT_SPEED_KM_PER_H,
        Location: [
            convertLocationArrToObject(Airport1.Location as [number, number]), 
            convertLocationArrToObject(Airport2.Location as [number, number])
        ]
    }
}

function getAirEdges(Nodes: MapNode[]): (Edge | null)[][] {
    const airports = getAirports(Nodes);
    const airEdges: (Edge | null)[][] = [];
    for (let i = 0; i < Nodes.length; ++i) {
        airEdges[i] = [];
        for (let j = 0; j < Nodes.length; ++j) {
            const iCurr = i;
            const jCurr = j;
            if (iCurr !== jCurr && airports.includes(Nodes[iCurr]) && airports.includes(Nodes[jCurr])) { 
                
                const airEdge = getAirEdgeBetweenAirports(Nodes[iCurr], Nodes[jCurr]);
                airEdges[iCurr][jCurr] = airEdge;
            } else {
                airEdges[iCurr][jCurr] = null; // Avoid self-loop (route between the same airport)
            }
        }
    }
    return airEdges;
}


export async function writeAirEdgesForEachPort(): Promise<void> { 
    var Nodes;
    try {
        const nodesCollection = query(collection(db, "nodes"), orderBy("idx", "asc"));
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


    
    const airEdges = getAirEdges(Nodes); // Assume this returns an array of Edges[] for each node 

    Nodes.forEach(async (node, index) => { 
      const idxCurr = index;
      console.log(node);
      const airEdgesForNode: (Edge | null)[] = airEdges[idxCurr]; // Ensure this follows the Edges[] format 
   
      // Get reference to the document for each node 

      const nodeDocRef = doc(db, "nodes", node.id.toString()); // Replace "nodes" with your actual collection name 
   
      // Update the 'airEdges' field for each node 
      try { 
        await updateDoc(nodeDocRef, { 
          // Use Firestore's arrayUnion to add new entries without overwriting the whole array 
          airEdges: airEdgesForNode
        }); 
   
        console.log(`Successfully updated airEdges for node ${node.id}`); 
      } catch (error) { 
        console.error(`Error updating node ${node.id}:`, error); 
      } 
    }); 
  }
  
export default haversineDistance;