import { useState } from 'react';
import './style/App.css';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import dockIcon from './images/dock.png';
import Header from './components/Header';
import Dropdown from './components/Dropdown';
import RecommendedPathButton from './components/RecommendedPathButton';

function App() {
    const [destination, setDestination] = useState('');
    const [source, setSource] = useState('');
    const [pathVisible, setPathVisible] = useState(false);

    const locations = {
        'New York': [40.7128, -74.0060],
        'London': [51.5074, -0.1278],
        'Tokyo': [35.6762, 139.6503],
        'Paris': [48.8566, 2.3522],
        'Berlin': [52.5200, 13.4050],
        'Sydney': [-33.8688, 151.2093],
    };

    const handleRecommendedPath = () => {
        if (destination && source) {
            alert(`Recommended path from ${source} to ${destination}`);
            setPathVisible(true);
        } else {
            alert('Please select a Destination, Source, and Mode of Transport.');
            setPathVisible(false);
        }
    };

    const sourceCoords = locations[source] || [0, 0];
    const destinationCoords = locations[destination] || [0, 0];

    const dockMarkerIcon = new L.Icon({
        iconUrl: dockIcon,
        iconSize: [50, 50],
        iconAnchor: [25, 50],
        popupAnchor: [0, -50],
    });

    return (
        <div className="App">
            <Header />

            <div className="dropdown-container">
                <Dropdown
                    label="Destination"
                    value={destination}
                    options={['New York', 'London', 'Tokyo']}
                    onChange={setDestination}
                />
                <Dropdown
                    label="Source"
                    value={source}
                    options={['Paris', 'Berlin', 'Sydney']}
                    onChange={setSource}
                />

                <RecommendedPathButton onClick={handleRecommendedPath} />
            </div>

            <p>
                Selected Destination: {destination || 'None'} <br />
                Selected Source: {source || 'None'}
            </p>

            {pathVisible && (
                <div className="map-container">
                    <MapContainer
                        center={sourceCoords}
                        zoom={2}
                        scrollWheelZoom={false}
                        style={{ height: '500px', width: '100%' }}
                    >
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
