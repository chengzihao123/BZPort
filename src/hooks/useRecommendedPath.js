import { useState } from 'react';
import { Graph } from '../utils/Graph.ts';

export const useRecommendedPath = (nodes) => {
    const [graph] = useState(() => new Graph(nodes));

    const handleRecommendedPath = (sourceId, destinationId) => {
        const result = graph.dijkstra(sourceId, destinationId);

        if (result) {
            return {
                path: result.path,
                totalDistance: result.totalDistance
            };
        } else {
            throw new Error("No path found");
        }
    };

    return { handleRecommendedPath };
};