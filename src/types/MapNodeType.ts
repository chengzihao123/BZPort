interface MapNode {
    id : number;
    Continent: string;
    Country: string;
    Location: Number[];
    name: string;
    type: string;
    seaEdges: Edge[] | null;
    airEdges: Edge[] | null;
    carEdges: Edge[] | null;
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