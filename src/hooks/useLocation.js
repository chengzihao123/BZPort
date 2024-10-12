import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";

export const useLocations = () => {
    const [locations, setLocations] = useState({});

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

    return locations;
};
