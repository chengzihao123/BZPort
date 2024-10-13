import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { M_TO_KM, MS_TO_S, S_TO_H } from '../constants/BackendConstants';
import { db } from '../firebase-config';
import MapNode, { Edge } from '../types/MapNodeType';
import GeoJSONFeatureCollection from '../types/seaRouteResponseTypes';
import { swapLonLat, convertLocationArrToObject } from './commonUtils';

function getSeaPorts(Nodes: MapNode[]): MapNode[] {
  return Nodes.filter(node => node.type === 'Port');
}

const getShortestSeaRoute = async (start: MapNode, end: MapNode): Promise<GeoJSONFeatureCollection> => {
    const lon1 = start.Location[1]
    const lat1 = start.Location[0]
    const lon2 = end.Location[1]
    const lat2 = end.Location[0]
    const string = lon1 + "%2C" + lat1 + "%3B" + lon2 + "%2C" + lat2;

    
    const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'x-api-key': 'PZwhYfb0O828K3Vsnat201ESu93mUyDp6bUmozdZ'
        }
      };
      
      const response = await fetch(`https://api.searoutes.com/route/v2/sea/${string}`, options)
        .then(response => response.json())
        .catch(err => console.error(err));

      return response;

}

async function getSeaEdgeBetweenPorts(Port1: MapNode, Port2: MapNode): Promise<Edge> {
  const seaRoute = await getShortestSeaRoute(Port1, Port2);
  seaRoute.features[0].geometry.coordinates = swapLonLat(seaRoute.features[0].geometry.coordinates);

  return {
      distance: seaRoute.features[0].properties.distance * M_TO_KM,
      duration: seaRoute.features[0].properties.duration * MS_TO_S * S_TO_H,
      Location: seaRoute.features[0].geometry.coordinates.map(convertLocationArrToObject),
  }
}

async function getSeaEdges(Nodes: MapNode[]): Promise<(Edge | null)[][]> {
  const seaPorts = getSeaPorts(Nodes);
  const seaEdges: (Edge | null)[][] = [];
  for (let i = 0; i < Nodes.length; ++i) {
      seaEdges[i] = [];
      for (let j = 0; j < Nodes.length; ++j) {
          if (i !== j && seaPorts.includes(Nodes[i]) && seaPorts.includes(Nodes[j])) { 
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

async function getSeaEdgesForIndex(Nodes: MapNode[], outerIndex: number): Promise<(Edge | null)[]> {
  const seaPorts = getSeaPorts(Nodes); // Get the sea ports from the Nodes
  const seaEdgesForIndex: (Edge | null)[] = [];
  const iCurr = outerIndex; // This is the specified outer loop index

  for (let j = 0; j < Nodes.length; ++j) {
      const jCurr = j;

      if (iCurr !== jCurr && seaPorts.includes(Nodes[iCurr]) && seaPorts.includes(Nodes[jCurr])) {
          try {
              const seaEdge = await getSeaEdgeBetweenPorts(seaPorts[iCurr], seaPorts[jCurr]); // Get sea edge between ports
              seaEdgesForIndex[jCurr] = seaEdge;
          } catch (error) {
              console.error(`Failed to get sea route between ${Nodes[iCurr].name} and ${Nodes[jCurr].name}:`, error);
              seaEdgesForIndex[jCurr] = null; // Store null on failure
          }
      } else {
          seaEdgesForIndex[jCurr] = null; // Avoid self-loop or non-sea-port nodes
      }
  }

  return seaEdgesForIndex;
}

export async function writeSeaEdgesForEachPort(): Promise<void> { 
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


  
  const seaEdges = await getSeaEdges(Nodes); // Assume this returns an array of Edges[] for each node 

  Nodes.forEach(async (node, index) => { 
    const idxCurr = index;
    console.log(node);
    const seaEdgesForNode: (Edge | null)[] = seaEdges[idxCurr]; // Ensure this follows the Edges[] format 
 
    // Get reference to the document for each node 

    const nodeDocRef = doc(db, "nodes", node.id.toString()); // Replace "nodes" with your actual collection name 
 
    // Update the 'seaEdges' field for each node 
    try { 
      await updateDoc(nodeDocRef, { 
        // Use Firestore's arrayUnion to add new entries without overwriting the whole array 
        seaEdges: seaEdgesForNode
      }); 
 
      console.log(`Successfully updated airEdges for node ${node.id}`); 
    } catch (error) { 
      console.error(`Error updating node ${node.id}:`, error); 
    } 
  }); 
}

export async function writeSeaEdgesForSpecifiedPort(i: number): Promise<void> { 
  let Nodes;
  try {
      const nodesCollection =  query(collection(db, "nodes"), orderBy("idx", "asc"));
      const nodesSnapshot = await getDocs(nodesCollection);
      const data: any = [];
      nodesSnapshot.forEach(doc => {
          data.push({
              id: doc.id,
              ...doc.data() // Ensure your Firestore documents are structured to match MapNode
          });
      });
      Nodes = JSON.parse(JSON.stringify(data));
  } catch (error) {
      console.error("Error getting documents: ", error);
      return;
  }

  // Fetch sea edges for the specified index (i)
  const seaEdges = await getSeaEdgesForIndex(Nodes, i); // Assume this returns an array of Edges[] for the node at index i

  const node = Nodes[i]; // Get the node at the specified index

  // Get reference to the document for this node
  const nodeDocRef = doc(db, "nodes", node.id.toString()); // Replace "nodes" with your actual collection name

  // Update the 'seaEdges' field for this node
  try { 
      await updateDoc(nodeDocRef, { 
          seaEdges: seaEdges // Ensure you're not overwriting the whole array unless you intend to
      });

      console.log(`Successfully updated seaEdges for node ${node.id}`); 
  } catch (error) { 
      console.error(`Error updating seaEdges for node ${node.id}:`, error); 
  } 
}

export default getShortestSeaRoute;