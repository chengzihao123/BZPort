import React from 'react';
import { useRecommendedPath } from '../hooks/useRecommendedPath';

const RecommendedPathButton = ({
                                   nodes,
                                   selectedSourceId,
                                   selectedDestinationId,
                                   onDrawPolyline
                               }) => {
    const { handleRecommendedPath } = useRecommendedPath(nodes);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    const onButtonClick = async () => {
        if (!selectedSourceId || !selectedDestinationId) {
            setError("Please select both source and destination");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = handleRecommendedPath(selectedSourceId, selectedDestinationId);

            if (result && result.path.length > 0) {
                const pathCoordinates = result.path.map(edge =>
                    edge.Location ? edge.Location.map(loc => ({ lat: loc.lat, lng: loc.lng })) : []
                );
                onDrawPolyline(pathCoordinates);
            } else {
                setError("No path found");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error calculating recommended path");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={onButtonClick}
            >
                {loading ? "Calculating..." : "Get Recommended Path"}
            </button>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        </div>
    );
};

export default RecommendedPathButton;