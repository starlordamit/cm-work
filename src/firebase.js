import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// const firebaseConfig = {
//     apiKey: "AIzaSyAdnh2LsSM0guetFLm5rFPLjMLQJZPktHE",
//     authDomain: "cm-work-36f2a.firebaseapp.com",
//     projectId: "cm-work-36f2a",
//     storageBucket: "cm-work-36f2a.appspot.com",
//     messagingSenderId: "819278462601",
//     appId: "1:819278462601:web:34ff841378f4dcd0d05058",
//     measurementId: "G-VCPYY912H8"
//   };
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

const getUserRole = async (uid) => {
    const userDoc = await db.collection('users').doc(uid).get();
    return userDoc.exists ? userDoc.data().role : null;
};

export { db, auth, getUserRole, googleProvider };
