// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Demo Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "upi-fraud-detector-demo.firebaseapp.com", 
  databaseURL: "https://upi-fraud-detector-demo-default-rtdb.firebaseio.com",
  projectId: "upi-fraud-detector-demo",
  storageBucket: "upi-fraud-detector-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const database = getDatabase(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
