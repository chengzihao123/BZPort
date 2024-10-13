import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";

export const useLocations = () => {
  const [locations, setLocations] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const itemsCollection = collection(db, "nodes");
      const snapshot = await getDocs(itemsCollection);
      const nodesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log("Fetched nodes:", nodesList);

      const newLocations = {};
      nodesList.forEach((node) => {
        newLocations[node.name] = {
          id: node.id,
          Location: node.Location,
          type: node.type,
          Continent: node.Continent,
          Country: node.Country,
          name: node.name,
        };
      });
      console.log("Processed locations:", newLocations);
      setLocations(newLocations);
    };

    fetchData();
  }, []);

  return locations;
};