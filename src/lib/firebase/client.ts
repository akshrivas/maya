"use client";
// Firebase in the browser: login, reading/saving the profile, uploading photos.
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage, type FirebaseStorage } from "firebase/storage";

export const USE_EMULATOR = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || (USE_EMULATOR ? "demo-key" : ""),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || (USE_EMULATOR ? "demo-maya" : ""),
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || (USE_EMULATOR ? "demo-maya.appspot.com" : ""),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let services: { app: FirebaseApp; auth: Auth; db: Firestore; storage: FirebaseStorage } | null = null;

export function firebase() {
  if (services) return services;
  if (!config.apiKey || !config.projectId) {
    throw new Error("Firebase is not configured. Fill in NEXT_PUBLIC_FIREBASE_* in .env.local");
  }
  const app = getApps().length ? getApp() : initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  if (USE_EMULATOR) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectStorageEmulator(storage, "127.0.0.1", 9199);
    auth.settings.appVerificationDisabledForTesting = true; // no reCAPTCHA in local tests
  }
  services = { app, auth, db, storage };
  return services;
}
