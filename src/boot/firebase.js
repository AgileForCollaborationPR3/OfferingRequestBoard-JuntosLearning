// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB2HWNUccbYdJzZ16j-W_8753keIHFseJI",
  authDomain: "a4c-juntoslearning.firebaseapp.com",
  projectId: "a4c-juntoslearning",
  storageBucket: "a4c-juntoslearning.firebasestorage.app",
  messagingSenderId: "472469023067",
  appId: "1:472469023067:web:b04c27488156d290b9127e",
  measurementId: "G-CKGM9JPH7G",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Set Firebase Auth persistence
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Firebase persistence set to local.");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error.message);
  });

export { app, analytics, auth, db };
