import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDGZDXlCKFHEOXAeNiF4XBko141ipQElYQ",
  authDomain: "geotask-238df.firebaseapp.com",
  projectId: "geotask-238df",
  storageBucket: "geotask-238df.firebasestorage.app",
  messagingSenderId: "935537407910",
  appId: "1:935537407910:web:858e6423fdb6b8ebf7c167",
  measurementId: "G-38KYXRLRVY"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
