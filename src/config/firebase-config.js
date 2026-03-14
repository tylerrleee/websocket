import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "webchat-iot-fa057.firebaseapp.com",
  projectId: "webchat-iot-fa057",
  storageBucket: "webchat-iot-fa057.firebasestorage.app",
  messagingSenderId: "797521511079",
  appId: "1:797521511079:web:916a7962e4149d5d041182",
  measurementId: "G-W6FY8LFL68"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
