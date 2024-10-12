interface GeoJSONFeatureCollection {
    type: "FeatureCollection";
    features: GeoJSONFeature[];
    properties: GlobalProperties;
}

interface GeoJSONFeature {
    type: "Feature";
    properties: FeatureProperties;
    geometry: GeoJSONGeometry;
}

interface GlobalProperties {
    distance: number;
    mode: string;
    departure: number; // Timestamp in milliseconds
    arrival: number; // Timestamp in milliseconds
    duration: number; // Duration in milliseconds
    speed: number; // Speed in knots
    areas: AreaFeatureCollection;
    details: any[]; // You might want to define a more specific type based on the actual structure
    secaIntersection: number;
    hraIntersection: number;
    speedInKts: number;
    intersectsIceArea: boolean;
    vessel: VesselDetails;
}

interface AreaFeatureCollection {
    type: "FeatureCollection";
    features: AreaFeature[];
    properties: null; // Can be defined as an object if needed
}

interface AreaFeature {
    type: "Feature";
    properties: AreaProperties;
    geometry: AreaGeometry;
}

interface AreaProperties {
    id: number;
    name: string;
    alternatives: any[]; // You might want to define a more specific type based on the actual structure
}

interface AreaGeometry {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
}

interface VesselDetails {
    imo: number;
    name: string;
    length: number; // Length of the vessel
    width: number; // Width of the vessel
    mmsi: number; // Maritime Mobile Service Identity
    maxDraft: number; // Maximum draft of the vessel
}

interface GeoJSONGeometry {
    type: "LineString";
    coordinates: [number, number][]; // Array of [longitude, latitude] pairs
}

// Define the FeatureProperties interface here
interface FeatureProperties {
    distance: number;
    mode: string;
    departure: number; // Timestamp in milliseconds
    arrival: number; // Timestamp in milliseconds
    duration: number; // Duration in milliseconds
    speed: number; // Speed in knots
    areas: AreaFeatureCollection;
    details: any[]; // You might want to define a more specific type based on the actual structure
    secaIntersection: number;
    hraIntersection: number;
    speedInKts: number;
    intersectsIceArea: boolean;
    vessel: VesselDetails;
}

export default GeoJSONFeatureCollection;