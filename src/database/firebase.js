import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; 

const firebaseConfig = {
  apiKey: "AIzaSyByIFwHdrcIbYoP_xdWqeeX0NmFHUz7qFE",
  authDomain: "eventapp-93d80.firebaseapp.com",
  projectId: "eventapp-93d80",
  storageBucket: "eventapp-93d80.firebasestorage.app",
  messagingSenderId: "286412954290",
  appId: "1:286412954290:web:8686bed86d4bd2976a87ab"
};


const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db = getFirestore(app);

export { auth, db };