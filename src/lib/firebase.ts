// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// Use default values for development if env variables are not set
const firebaseConfig = {
  apiKey: 'AIzaSyDemoKeyForDevelopment',
  authDomain: 'cipher-clash.firebaseapp.com',
  projectId: 'cipher-clash',
  storageBucket: 'cipher-clash.appspot.com',
  messagingSenderId: '123456789012',
  appId: '1:123456789012:web:abcdef1234567890'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db }; 