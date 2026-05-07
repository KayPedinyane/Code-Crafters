import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  browserPopupRedirectResolver,
  browserLocalPersistence,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBOdX3bNi3bene3SCj0ZYFXXGS1WVk6r6g",
  authDomain: "sa-skills.firebaseapp.com",
  projectId: "sa-skills",
  storageBucket: "sa-skills.firebasestorage.app",
  messagingSenderId: "521637600462",
  appId: "1:521637600462:web:e5f86774d7f649391ac49f",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence],
  popupRedirectResolver: browserPopupRedirectResolver,
});

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export default app;