import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyCCOuUUQMB9vfLQxWLRSKPXF4wJs7Sibgs",
    authDomain: "open-sesame-c9591.firebaseapp.com",
    projectId: "open-sesame-c9591",
    storageBucket: "open-sesame-c9591.firebasestorage.app",
    messagingSenderId: "414660655910",
    appId: "1:414660655910:web:8dd197585aab24250f1fe7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
