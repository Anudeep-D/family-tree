import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCKRGIeul7_ZKjWYsqzMK3H5d43f8sLmlk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "family-tree-b6210.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "family-tree-b6210",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "family-tree-b6210.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "571347859646",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:571347859646:web:e020f564113d9cffd006ef",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-G6NE26HQVP",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
