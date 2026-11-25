import "server-only";
// Firebase on the server, with full access. Used for: rendering public pages,
// claiming a page link, and deleting an account. Never imported by browser code.
import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const USE_EMULATOR = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

function init(): App {
  if (getApps().length) return getApp();

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || (USE_EMULATOR ? "demo-maya" : undefined);
  const storageBucket =
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || (USE_EMULATOR ? "demo-maya.appspot.com" : undefined);

  if (USE_EMULATOR) {
    process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8080";
    process.env.FIREBASE_AUTH_EMULATOR_HOST ||= "127.0.0.1:9099";
    process.env.FIREBASE_STORAGE_EMULATOR_HOST ||= "127.0.0.1:9199";
    return initializeApp({ projectId, storageBucket });
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin is not configured. Set NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.",
    );
  }
  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId, storageBucket });
}

export const adminAuth = () => getAuth(init());
export const adminDb = () => getFirestore(init());
export const adminBucket = () => getStorage(init()).bucket();

/** Checks the "Authorization: Bearer <token>" header and returns the logged-in user. */
export async function requireUser(req: Request) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  try {
    return await adminAuth().verifyIdToken(token, true);
  } catch {
    return null;
  }
}
