import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const FIREBASE_ENABLED = !!(
  process.env.REACT_APP_FIREBASE_API_KEY &&
  process.env.REACT_APP_FIREBASE_PROJECT_ID
);

export let auth = null;
export let db = null;
export let googleProvider = null;

if (FIREBASE_ENABLED) {
  const app = initializeApp({
    apiKey:      process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain:  process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId:   process.env.REACT_APP_FIREBASE_PROJECT_ID,
    appId:       process.env.REACT_APP_FIREBASE_APP_ID,
  });
  auth           = getAuth(app);
  db             = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
}
