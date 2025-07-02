import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Pour React Native Firebase Auth avec persistance :
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAxvpV7PiUkc-LpXC9i4jy4x9DE3pgXtlk",
  authDomain: "reactchat-208c3.firebaseapp.com",
  projectId: "reactchat-208c3",
  storageBucket: "reactchat-208c3.firebasestorage.app",
  messagingSenderId: "577513204106",
  appId: "1:577513204106:web:441c57ec4980aed700c073"
};

// Initialise Firebase
const app = initializeApp(firebaseConfig);

// Initialise Firebase Auth avec persistance sur AsyncStorage
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
