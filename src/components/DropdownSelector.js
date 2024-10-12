import Dropdown from "./Dropdown";

const DropdownSelector = ({ source, destination, locations, setSource, setDestination }) => {
    return (
        <div className="dropdown-container">
            <Dropdown
                label="Source"
                value={source}
                options={Object.keys(locations)}
                onChange={setSource}
            />
            <Dropdown
                label="Destination"
                value={destination}
                options={Object.keys(locations)}
                onChange={setDestination}
            />
        </div>
    );
};

export default DropdownSelector;
