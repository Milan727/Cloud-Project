import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCwxKqbvSGGNt9cquEDx8j7oh52BUDEMlI",
    authDomain: "auth-52be5.firebaseapp.com",
    projectId: "auth-52be5",
    storageBucket: "auth-52be5.firebasestorage.app",
    messagingSenderId: "369027553424",
    appId: "1:369027553424:web:9fc920ef631dae22d46015",
    measurementId: "G-Y9CQFJF0YW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
