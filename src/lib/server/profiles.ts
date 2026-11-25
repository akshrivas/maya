import "server-only";
import { adminAuth, adminBucket, adminDb } from "@/lib/firebase/admin";
import { COUNTRIES } from "@/config/countries";
import { professionCategory } from "@/config/professions";
import { baseHandle, handleCandidates, isValidHandle } from "@/lib/profile/handle";
import type { Step1Data } from "@/lib/profile/schema";
import { TERMS_VERSION, type PrivateUser, type Profile } from "@/lib/profile/types";

export class ProfileExistsError extends Error {}
export class HandleTakenError extends Error {}

/**
 * Sign-up: creates the public page, the private user record and the page link in one
 * transaction, so two people can never end up with the same link. The page is live at once.
 */
export async function createProfile(
  uid: string,
  data: Step1Data,
  signIn: { phone: string | null; email: string | null; lang: string; ref?: string | null },
): Promise<Profile> {
  const db = adminDb();
  const now = Date.now();
  const base = baseHandle(data.name, data.city, data.professionId);
  const candidates = handleCandidates(base);

  return db.runTransaction(async (tx) => {
    const profileRef = db.collection("profiles").doc(uid);
    const handleRefs = candidates.map((h) => db.collection("handles").doc(h));
    const [existing, ...handleSnaps] = await tx.getAll(profileRef, ...handleRefs);
    if (existing.exists) throw new ProfileExistsError();

    const free = handleSnaps.findIndex((s) => !s.exists);
    if (free === -1) throw new HandleTakenError();
    const handle = candidates[free];

    const profile: Profile = {
      uid,
      handle,
      published: true,
      template: professionCategory(data.professionId).defaultTemplate,
      verified: false,
      name: data.name,
      professionId: data.professionId,
      country: data.country,
      state: data.state,
      city: data.city,
      area: data.area,
      pincode: data.pincode,
      intro: data.intro,
      about: "",
      photo: null,
      cover: null,
      yearsExperience: null,
      services: [],
      currency: COUNTRIES[data.country].currency,
      portfolio: [],
      videos: [],
      languages: [],
      contact: { phone: data.phone, whatsapp: "", email: signIn.email ?? "", website: "", instagram: "" },
      workingHours: "",
      serviceArea: "",
      extra: {},
      testimonials: [],
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
    };

    const user: PrivateUser = {
      uid,
      signInPhone: signIn.phone,
      signInEmail: signIn.email,
      lang: signIn.lang,
      consent: { termsVersion: TERMS_VERSION, acceptedAt: now },
      verification: null,
      signupRef: signIn.ref ?? null,
      createdAt: now,
    };

    tx.create(profileRef, profile);
    tx.create(db.collection("users").doc(uid), user);
    tx.create(handleRefs[free], { uid, createdAt: now });
    return profile;
  });
}

/** Change the page link. The old link is released. */
export async function changeHandle(uid: string, newHandle: string): Promise<void> {
  if (!isValidHandle(newHandle)) throw new HandleTakenError();
  const db = adminDb();
  await db.runTransaction(async (tx) => {
    const profileRef = db.collection("profiles").doc(uid);
    const newRef = db.collection("handles").doc(newHandle);
    const [profile, taken] = await tx.getAll(profileRef, newRef);
    if (!profile.exists) throw new Error("No profile");
    const oldHandle = profile.get("handle") as string;
    if (oldHandle === newHandle) return;
    if (taken.exists) throw new HandleTakenError();
    tx.create(newRef, { uid, createdAt: Date.now() });
    tx.delete(db.collection("handles").doc(oldHandle));
    tx.update(profileRef, { handle: newHandle, updatedAt: Date.now() });
  });
}

/** Used by the public page. Returns null if the link doesn't exist or isn't published. */
export async function getPublishedProfile(handle: string): Promise<Profile | null> {
  if (!/^[a-z0-9-]{1,60}$/.test(handle)) return null;
  const db = adminDb();
  const link = await db.collection("handles").doc(handle).get();
  if (!link.exists) return null;
  const snap = await db.collection("profiles").doc(link.get("uid")).get();
  if (!snap.exists) return null;
  const profile = snap.data() as Profile;
  if (!profile.published || profile.handle !== handle) return null;
  return profile;
}

/** For the sitemap: every published page link. */
export async function listPublishedHandles(limit = 5000): Promise<{ handle: string; updatedAt: number }[]> {
  const snap = await adminDb()
    .collection("profiles")
    .where("published", "==", true)
    .select("handle", "updatedAt")
    .limit(limit)
    .get();
  return snap.docs.map((d) => ({ handle: d.get("handle"), updatedAt: d.get("updatedAt") }));
}

/**
 * "Delete my account and data": removes the public page, its link, private data,
 * every uploaded photo and finally the login itself. Safe to run twice.
 */
export async function deleteAccount(uid: string): Promise<void> {
  const db = adminDb();
  const profileRef = db.collection("profiles").doc(uid);
  const profile = await profileRef.get();
  const batch = db.batch();
  if (profile.exists) {
    const handle = profile.get("handle") as string | undefined;
    if (handle) {
      const link = await db.collection("handles").doc(handle).get();
      if (link.exists && link.get("uid") === uid) batch.delete(link.ref);
    }
    batch.delete(profileRef);
  }
  batch.delete(db.collection("users").doc(uid));
  const usage = await db.collection("aiUsage").where("uid", "==", uid).get();
  usage.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();

  await adminBucket().deleteFiles({ prefix: `users/${uid}/` }).catch((e) => {
    console.error("deleteAccount: storage cleanup failed", e);
  });

  await adminAuth()
    .deleteUser(uid)
    .catch((e: { code?: string }) => {
      if (e.code !== "auth/user-not-found") throw e;
    });
}
