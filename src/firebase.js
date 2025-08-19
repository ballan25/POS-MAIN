import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB2WYlxGnh5xPvv7TMaYfl3DC0s3oIfzdY",
  authDomain: "boba-cafe-4ef7b.firebaseapp.com",
  projectId: "boba-cafe-4ef7b",
  storageBucket: "boba-cafe-4ef7b.firebasestorage.app",
  messagingSenderId: "66931317230",
  appId: "1:66931317230:web:590605b32b6c78639a96ff",
  measurementId: "G-2YT7MHJ8BJ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);