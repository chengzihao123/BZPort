import BZPortMap from "./components/Map";
import { useLocations } from "./hooks/useLocation";
import DropdownSelector from "./components/DropdownSelector";
import Header from "./components/Header";
import RecommendedPathButton from "./components/RecommendedPathButton";
import { useState } from "react";

function App() {
  const [destination, setDestination] = useState("");
  const [source, setSource] = useState("");
  const [pathVisible, setPathVisible] = useState(false);
  const locations = useLocations();

  const handleRecommendedPath = () => {
    if (destination && source) {
      alert(`Recommended path from ${source} to ${destination}`);
      setPathVisible(true);
    } else {
      alert("Please select a Destination, Source, and Mode of Transport.");
      setPathVisible(false);
    }
  };

  const sourceCoords = locations[source] ? locations[source].location : null;
  const destinationCoords = locations[destination]
    ? locations[destination].location
    : null;

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
        <RecommendedPathButton onClick={handleRecommendedPath} />
      </div>
      <BZPortMap
        sourceCoords={sourceCoords}
        destinationCoords={destinationCoords}
        locations={locations}
        pathVisible={pathVisible}
        sourceType={source ? locations[source].type : null}
        destinationType={destination ? locations[destination].type : null}
      />
    </div>
  );
}

export default App;
