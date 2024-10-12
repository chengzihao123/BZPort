import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import dockIcon from "../images/dock.png";
import "leaflet/dist/leaflet.css";

const BZPortMap = ({ sourceCoords, destinationCoords, locations, pathVisible }) => {
    const dockMarkerIcon = new L.Icon({
        iconUrl: dockIcon,
        iconSize: [25, 25],
        iconAnchor: [12.5, 25],
        popupAnchor: [0, -25],
    });

    return (
        <MapContainer center={[20, 0]} zoom={3} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Render all markers if no source/destination selected */}
            {!sourceCoords && !destinationCoords &&
                Object.keys(locations).map((location) => (
                    <Marker key={location} position={locations[location]} icon={dockMarkerIcon}>
                        <Popup>{location}</Popup>
                    </Marker>
                ))
            }

            {/* Source and destination markers */}
            {sourceCoords && (
                <Marker position={sourceCoords} icon={dockMarkerIcon}>
                    <Popup>Source</Popup>
                </Marker>
            )}
            {destinationCoords && (
                <Marker position={destinationCoords} icon={dockMarkerIcon}>
                    <Popup>Destination</Popup>
                </Marker>
            )}

            {/* Draw the path */}
            {pathVisible && sourceCoords && destinationCoords && (
                <Polyline positions={[sourceCoords, destinationCoords]} color="blue" />
            )}
        </MapContainer>
    );
};

export default BZPortMap;
