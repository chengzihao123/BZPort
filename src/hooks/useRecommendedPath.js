import { useState } from 'react';
import { Graph } from '../utils/Graph.ts';

export const useRecommendedPath = (nodes) => {
    console.log("invoking useRecommendedPath", nodes);


    const handleRecommendedPath = (sourceId, destinationId) => {
        const graph = new Graph(nodes);
        const result = graph.dijkstra(sourceId, destinationId, 1000);

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