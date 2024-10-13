import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import dockIcon from "../images/dock.png";
import airportIcon from "../images/airport.png";
import "leaflet/dist/leaflet.css";

const BZPortMap = ({ sourceCoords, destinationCoords, locations, pathVisible, calculatedPath, sourceType, destinationType }) => {
    const dockMarkerIcon = new L.Icon({
        iconUrl: dockIcon,
        iconSize: [25, 25],
        iconAnchor: [12.5, 25],
        popupAnchor: [0, -25],
    });

    const airportMarkerIcon = new L.Icon({
        iconUrl: airportIcon,
        iconSize: [25, 25],
        iconAnchor: [12.5, 25],
        popupAnchor: [0, -25],
    });

    const getIcon = (type) => {
        return type === "Air" ? airportMarkerIcon : dockMarkerIcon;
    };

    return (
        <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Render all markers if no source/destination selected */}
            {!sourceCoords && !destinationCoords &&
                Object.entries(locations).map(([name, data]) => (
                    <Marker key={name} position={data.Location} icon={getIcon(data.type)}>
                        <Popup>{name}</Popup>
                    </Marker>
                ))
            }

            {/* Source and destination markers */}
            {sourceCoords && Array.isArray(sourceCoords) && (
                <Marker position={sourceCoords} icon={getIcon(sourceType)}>
                    <Popup>Source</Popup>
                </Marker>
            )}
            {destinationCoords && Array.isArray(destinationCoords) && (
                <Marker position={destinationCoords} icon={getIcon(destinationType)}>
                    <Popup>Destination</Popup>
                </Marker>
            )}

            {/* Draw the path */}
            {pathVisible && calculatedPath.length > 0 && (
                <Polyline
                    positions={calculatedPath.flatMap(edge =>
                        edge.Location ? edge.Location.map(loc => [loc.lat, loc.lng]) : []
                    )}
                    color="blue"
                />
            )}
        </MapContainer>
    );
};

export default BZPortMap;