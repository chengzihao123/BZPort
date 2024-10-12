import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-mPSZCEvcKQlhh-PvpmYtzVEyU4i3dmQ",
  authDomain: "bzport-2024.firebaseapp.com",
  projectId: "bzport-2024",
  storageBucket: "bzport-2024.appspot.com",
  messagingSenderId: "737595967575",
  appId: "1:737595967575:web:f4675780d4c85ea806bb12",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
