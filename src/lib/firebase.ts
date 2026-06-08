import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBeaZDeCw7undaaZsRfQh6jC9c23cdrXS4",
  authDomain: "webwrap-technology.firebaseapp.com",
  projectId: "webwrap-technology",
  storageBucket: "webwrap-technology.firebasestorage.app",
  messagingSenderId: "14838921866",
  appId: "1:14838921866:web:1b2b95dc598a379652cb73",
  measurementId: "G-K74L8C7ZHV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Helper wrappers
export { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut,
  GoogleAuthProvider,
  doc,
  setDoc,
  getDoc,
  collection
};
