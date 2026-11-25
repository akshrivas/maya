// Proves the security rules: only the owner can edit their page; public pages are read-only.
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import { assertFails, assertSucceeds, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { makeEnv, sampleProfile } from "./helpers";

let env: RulesTestEnvironment;
const OWNER = "owner-uid";
const STRANGER = "stranger-uid";

beforeAll(async () => {
  env = await makeEnv();
});
afterAll(async () => {
  await env.cleanup();
});
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "profiles", OWNER), sampleProfile(OWNER));
    await setDoc(doc(db, "profiles", "draft-uid"), sampleProfile("draft-uid", { published: false, handle: "draft" }));
    await setDoc(doc(db, "users", OWNER), { uid: OWNER, lang: "en", verification: null, signInPhone: "+919876543210" });
    await setDoc(doc(db, "handles", "asha-verma-indore"), { uid: OWNER });
  });
});

describe("public profile pages", () => {
  it("anyone (even logged out) can read a published page", async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(db, "profiles", OWNER)));
  });

  it("nobody else can read an unpublished page", async () => {
    const db = env.authenticatedContext(STRANGER).firestore();
    await assertFails(getDoc(doc(db, "profiles", "draft-uid")));
  });

  it("a logged-out visitor cannot edit a page", async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertFails(updateDoc(doc(db, "profiles", OWNER), { name: "Hacked", updatedAt: Date.now() }));
  });

  it("another logged-in user cannot edit someone else's page", async () => {
    const db = env.authenticatedContext(STRANGER).firestore();
    await assertFails(updateDoc(doc(db, "profiles", OWNER), { name: "Hacked", updatedAt: Date.now() }));
  });

  it("nobody can delete a page directly or create one for someone else", async () => {
    const db = env.authenticatedContext(STRANGER).firestore();
    await assertFails(deleteDoc(doc(db, "profiles", OWNER)));
    await assertFails(setDoc(doc(db, "profiles", STRANGER), sampleProfile(STRANGER)));
  });
});

describe("owner editing their own page", () => {
  it("the owner can update their details", async () => {
    const db = env.authenticatedContext(OWNER).firestore();
    await assertSucceeds(
      updateDoc(doc(db, "profiles", OWNER), {
        name: "Asha Verma Tutorials",
        about: "I have been teaching maths for eight years.",
        services: [{ name: "Home tuition", priceMin: 2000, priceMax: 4000 }],
        languages: ["hi", "en"],
        updatedAt: Date.now(),
      }),
    );
  });

  it("the owner cannot change protected fields (link, badge, published, owner)", async () => {
    const db = env.authenticatedContext(OWNER).firestore();
    const ref = doc(db, "profiles", OWNER);
    await assertFails(updateDoc(ref, { handle: "someone-else", updatedAt: Date.now() }));
    await assertFails(updateDoc(ref, { verified: true, updatedAt: Date.now() }));
    await assertFails(updateDoc(ref, { uid: STRANGER, updatedAt: Date.now() }));
    await assertFails(updateDoc(ref, { createdAt: 0, updatedAt: Date.now() }));
  });

  it("invalid data is rejected", async () => {
    const db = env.authenticatedContext(OWNER).firestore();
    const ref = doc(db, "profiles", OWNER);
    await assertFails(updateDoc(ref, { name: "", updatedAt: Date.now() }));
    await assertFails(updateDoc(ref, { template: "neon", updatedAt: Date.now() }));
    await assertFails(updateDoc(ref, { intro: "x".repeat(500), updatedAt: Date.now() }));
    await assertFails(
      updateDoc(ref, { photo: { url: "https://x.test/a.jpg", path: `users/${STRANGER}/a.jpg` }, updatedAt: Date.now() }),
    );
    await assertFails(
      updateDoc(ref, {
        contact: { phone: "not-a-phone", whatsapp: "", email: "", website: "", instagram: "" },
        updatedAt: Date.now(),
      }),
    );
  });
});

describe("private user data", () => {
  it("only the owner can read it", async () => {
    await assertSucceeds(getDoc(doc(env.authenticatedContext(OWNER).firestore(), "users", OWNER)));
    await assertFails(getDoc(doc(env.authenticatedContext(STRANGER).firestore(), "users", OWNER)));
    await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), "users", OWNER)));
  });

  it("the owner can submit verification details, but cannot mark themselves verified", async () => {
    const ref = doc(env.authenticatedContext(OWNER).firestore(), "users", OWNER);
    const verification = {
      pan: "ABCDE1234F",
      businessIdType: "gst",
      businessId: "23ABCDE1234F1Z5",
      licenceName: "",
      licenceNumber: "",
      submittedAt: Date.now(),
    };
    await assertSucceeds(updateDoc(ref, { verification: { ...verification, status: "submitted" } }));
    await assertFails(updateDoc(ref, { verification: { ...verification, status: "verified" } }));
    await assertFails(updateDoc(ref, { signInPhone: "+910000000000" }));
  });
});

describe("page links (handles)", () => {
  it("anyone can check a link, nobody can claim one from the browser", async () => {
    const db = env.authenticatedContext(STRANGER).firestore();
    await assertSucceeds(getDoc(doc(db, "handles", "asha-verma-indore")));
    await assertFails(setDoc(doc(db, "handles", "new-handle"), { uid: STRANGER }));
    await assertFails(setDoc(doc(db, "handles", "asha-verma-indore"), { uid: STRANGER }));
  });
});
