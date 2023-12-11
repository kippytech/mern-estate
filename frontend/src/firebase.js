// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-51f20.firebaseapp.com",
  projectId: "mern-estate-51f20",
  storageBucket: "mern-estate-51f20.appspot.com",
  messagingSenderId: "711918368897",
  appId: "1:711918368897:web:8228448fce8e9ba2ad7580"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);