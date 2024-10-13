import Dropdown from "./Dropdown";

const DropdownSelector = ({ source, destination, locations, setSource, setDestination }) => {
    const handleSourceChange = (selectedSource) => {
        setSource(selectedSource); // Set the source name
    };

    const handleDestinationChange = (selectedDestination) => {
        setDestination(selectedDestination); // Set the destination name
    };

    return (
        <div className="dropdown-container">
            <Dropdown
                label="Source"
                value={source}
                options={Object.keys(locations)}
                onChange={handleSourceChange} // Handle source selection
            />
            <Dropdown
                label="Destination"
                value={destination}
                options={Object.keys(locations)}
                onChange={handleDestinationChange} // Handle destination selection
            />
        </div>
    );
};

export default DropdownSelector;

