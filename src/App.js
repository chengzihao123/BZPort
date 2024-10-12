import { useState } from 'react';
import './App.css';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import dockIcon from './dock.png';

function App() {
    // State to handle dropdown selections
    const [destination, setDestination] = useState('');
    const [source, setSource] = useState('');
    const [transportMode, setTransportMode] = useState('');
    const [pathVisible, setPathVisible] = useState(false);

    // Coordinates for some cities (example)
    const locations = {
        'New York': [40.7128, -74.0060],
        'London': [51.5074, -0.1278],
        'Tokyo': [35.6762, 139.6503],
        'Paris': [48.8566, 2.3522],
        'Berlin': [52.5200, 13.4050],
        'Sydney': [-33.8688, 151.2093],
    };

    // Handle Recommended Path button click
    const handleRecommendedPath = () => {
        if (destination && source && transportMode) {
            alert(`Recommended path from ${source} to ${destination}`);
            setPathVisible(true); // Show the map when path is selected
        } else {
            alert('Please select a Destination, Source, and Mode of Transport.');
            setPathVisible(false);
        }
    };

    // Get coordinates for source and destination
    const sourceCoords = locations[source] || [0, 0];
    const destinationCoords = locations[destination] || [0, 0];

    // Custom dock icon for markers
    const dockMarkerIcon = new L.Icon({
        iconUrl: dockIcon,
        iconSize: [50, 50], // Customize the size of the dock icon
        iconAnchor: [25, 50], // Adjust to center the icon properly
        popupAnchor: [0, -50], // Adjust the popup position relative to the icon
    });

    return (
        <div className="App">
            <header className="App-header">
                <div className="product-name">BZPort</div>
                <div className="header-image"></div>
            </header>

            <div className="dropdown-container">
                <div className="dropdown">
                    <label>Destination: </label>
                    <select value={destination} onChange={(e) => setDestination(e.target.value)}>
                        <option value="">Select Destination</option>
                        <option value="New York">New York</option>
                        <option value="London">London</option>
                        <option value="Tokyo">Tokyo</option>
                    </select>
                </div>

                <div className="dropdown">
                    <label>Source: </label>
                    <select value={source} onChange={(e) => setSource(e.target.value)}>
                        <option value="">Select Source</option>
                        <option value="Paris">Paris</option>
                        <option value="Berlin">Berlin</option>
                        <option value="Sydney">Sydney</option>
                    </select>
                </div>

                <button className="recommend-button" onClick={handleRecommendedPath}>
                    Recommended Path
                </button>

            </div>

            <p>
                Selected Destination: {destination || 'None'} <br/>
                Selected Source: {source || 'None'} <br />
            </p>

            {pathVisible && (
                <div className="map-container">
                    <MapContainer center={sourceCoords} zoom={2} scrollWheelZoom={false} style={{ height: '500px', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={sourceCoords} icon={dockMarkerIcon}>
                            <Popup>Source: {source}</Popup>
                        </Marker>
                        <Marker position={destinationCoords} icon={dockMarkerIcon}>
                            <Popup>Destination: {destination}</Popup>
                        </Marker>
                        <Polyline positions={[sourceCoords, destinationCoords]} color="blue" />
                    </MapContainer>
                </div>
            )}
        </div>
    );
}

export default App;
