import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig={apiKey:"AIzaSyBVZtM0-iUeVia48NUY7g-HQJB5n8grEOQ",authDomain:"tempero-da-vovo-marly.firebaseapp.com",projectId:"tempero-da-vovo-marly",storageBucket:"tempero-da-vovo-marly.firebasestorage.app",messagingSenderId:"439340542302",appId:"1:439340542302:web:6f3c88e5791347844d87cf"};
const app=getApps().length?getApps()[0]:initializeApp(firebaseConfig);
export const auth=getAuth(app); export const db=getFirestore(app);
