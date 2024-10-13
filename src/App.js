import BZPortMap from "./components/Map";
import { useLocations } from "./hooks/useLocation";
import DropdownSelector from "./components/DropdownSelector";
import Header from "./components/Header";
import RecommendedPathButton from "./components/RecommendedPathButton";
import { useState } from "react";
import { useRecommendedPath } from './hooks/useRecommendedPath.js';

function App() {
  const [destination, setDestination] = useState(""); // Name of the destination
  const [source, setSource] = useState(""); // Name of the source
  const [pathVisible, setPathVisible] = useState(false);
  const [calculatedPath, setCalculatedPath] = useState([]);
  const locations = useLocations();

  // Extract IDs based on selected source and destination
  const sourceId = source ? locations[source]?.id : null;
  const destinationId = destination ? locations[destination]?.id : null;

  const { handleRecommendedPath } = useRecommendedPath(Object.values(locations));

  const onRecommendedPath = async () => {
    if (sourceId && destinationId) {
      try {
        const result = await handleRecommendedPath(sourceId, destinationId);
        if (result && result.path) {
          setCalculatedPath(result.path);
          setPathVisible(true);
        } else {
          alert("No path found between the selected source and destination.");
          setPathVisible(false);
        }
      } catch (error) {
        console.error("Error calculating path:", error);
        alert("An error occurred while calculating the path.");
        setPathVisible(false);
      }
    } else {
      alert("Please select a Destination and Source.");
      setPathVisible(false);
    }
  };

  const sourceCoords = locations[source] ? locations[source].Location : null;
  const destinationCoords = locations[destination] ? locations[destination].Location : null;

  return (
      <div className="App">
        <Header />
        <div className="controls-container">
          <DropdownSelector
              source={source}
              destination={destination}
              locations={locations}
              setSource={setSource}
              setDestination={setDestination}
          />
          <RecommendedPathButton
              nodes={Object.values(locations)} // Pass the correct nodes
              selectedSourceId={sourceId} // Pass the source ID
              selectedDestinationId={destinationId} // Pass the destination ID
              onDrawPolyline={onRecommendedPath} // Ensure this is the correct function
          />
        </div>
        <BZPortMap
            sourceCoords={sourceCoords}
            destinationCoords={destinationCoords}
            locations={locations}
            pathVisible={pathVisible}
            calculatedPath={calculatedPath}
            sourceType={source ? locations[source].type : null}
            destinationType={destination ? locations[destination].type : null}
        />
      </div>
  );
}

export default App;
