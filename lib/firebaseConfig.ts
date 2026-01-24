import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Firebase configuration for React Native app
// This uses the same Firebase project as your backend
const firebaseConfig = {
  apiKey: "AIzaSyCZ0FLN7BTKZ3Sg1BcHfPzsrvmJdpQq21E",
  authDomain: "abhigyan-gurukul.firebaseapp.com",
  projectId: "abhigyan-gurukul",
  storageBucket: "abhigyan-gurukul.appspot.com",
  messagingSenderId: "545033071094",
  appId: "1:545033071094:web:f3a4b5c6d7e8f9g0h1i2j3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
