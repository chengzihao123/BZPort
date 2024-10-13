interface MapNode {
    id : string;
    idx: number;
    Continent: string;
    Country: string;
    Location: Number[];
    name: string;
    type: string;
    seaEdges: (Edge | null)[] | null;
    airEdges: (Edge | null)[] | null;
    carEdges: (Edge | null)[] | null;
}

export interface Edge {
    distance: number | null;
    duration: number | null;
    Location:{
        lat: number;
        lng: number;
    }[] | null;
}


export default MapNode;