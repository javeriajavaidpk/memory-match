import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBs1WmFfAzNLEyhCh3nGsokuaialVSdL1Y",
  authDomain: "kids-super-memory.firebaseapp.com",
  projectId: "kids-super-memory",
  storageBucket: "kids-super-memory.firebasestorage.app",
  messagingSenderId: "849452296181",
  appId: "1:849452296181:web:aa0a4f3cd27af178aa22bc",
  measurementId: "G-0SL8S5L370"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);