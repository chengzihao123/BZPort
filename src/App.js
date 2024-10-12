import { useEffect, useState } from "react";
import "./style/App.css";
import { db } from "./firebase-config";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import dockIcon from "./images/dock.png";
import Header from "./components/Header";
import Dropdown from "./components/Dropdown";
import RecommendedPathButton from "./components/RecommendedPathButton";
import { collection, getDocs } from "firebase/firestore";

function App() {
  const [destination, setDestination] = useState("");
  const [source, setSource] = useState("");
  const [locations, setLocations] = useState({});
  const [pathVisible, setPathVisible] = useState(false);

  // Fetch locations from Firestore on component mount
  useEffect(() => {
    const fetchData = async () => {
      const itemsCollection = collection(db, "nodes");
      const snapshot = await getDocs(itemsCollection);
      const nodesList = snapshot.docs.map((doc) => doc.data());

      const newLocations = {};
      nodesList.forEach((node) => {
        newLocations[node.name] = node.Location;
      });
      setLocations(newLocations);
    };

    fetchData();
  }, []);

  const handleRecommendedPath = () => {
    if (destination && source) {
      alert(`Recommended path from ${source} to ${destination}`);
      setPathVisible(true);
    } else {
      alert("Please select a Destination, Source, and Mode of Transport.");
      setPathVisible(false);
    }
  };

  const sourceCoords = locations[source] || null;
  const destinationCoords = locations[destination] || null;

  const dockMarkerIcon = new L.Icon({
    iconUrl: dockIcon,
    iconSize: [25, 25],
    iconAnchor: [12.5, 25],
    popupAnchor: [0, -25],
  });

  return (
      <div className="App">
        <Header />

        <div className="dropdown-container">
          <Dropdown
              label="Destination"
              value={destination}
              options={Object.keys(locations)} // Dynamic options based on Firestore data
              onChange={setDestination}
          />
          <Dropdown
              label="Source"
              value={source}
              options={Object.keys(locations)} // Dynamic options based on Firestore data
              onChange={setSource}
          />

          <RecommendedPathButton onClick={handleRecommendedPath} />
        </div>

        <p>
          Selected Destination: {destination || "None"} <br />
          Selected Source: {source || "None"}
        </p>

        <div className="map-container">
          <MapContainer
              center={[20, 0]} // Initial center of the map, can be adjusted as needed
              zoom={2}
              scrollWheelZoom={false}
              style={{ height: "500px", width: "100%" }}
          >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Render all locations as markers if no specific source/destination is selected */}
            {!source && !destination &&
                Object.keys(locations).map((location) => (
                    <Marker
                        key={location}
                        position={locations[location]}
                        icon={dockMarkerIcon}
                    >
                      <Popup>{location}</Popup>
                    </Marker>
                ))
            }

            {/* Render source and destination markers if selected */}
            {sourceCoords && (
                <Marker position={sourceCoords} icon={dockMarkerIcon}>
                  <Popup>Source: {source}</Popup>
                </Marker>
            )}

            {destinationCoords && (
                <Marker position={destinationCoords} icon={dockMarkerIcon}>
                  <Popup>Destination: {destination}</Popup>
                </Marker>
            )}

            {/* Render path between source and destination if both are selected */}
            {pathVisible && sourceCoords && destinationCoords && (
                <Polyline
                    positions={[sourceCoords, destinationCoords]}
                    color="blue"
                />
            )}
          </MapContainer>
        </div>
      </div>
  );
}

export default App;
