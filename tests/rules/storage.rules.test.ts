// Proves photo upload rules: only the owner can upload/delete, images only, under 5 MB.
import { afterAll, beforeAll, describe, it } from "vitest";
import { assertFails, assertSucceeds, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { deleteObject, getBytes, ref, uploadBytes } from "firebase/storage";
import { makeEnv } from "./helpers";

let env: RulesTestEnvironment;
const OWNER = "owner-uid";
const image = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4]);

beforeAll(async () => {
  env = await makeEnv();
});
afterAll(async () => {
  await env.cleanup();
});

describe("photo storage", () => {
  it("the owner can upload an image to their own folder; anyone can view it", async () => {
    const storage = env.authenticatedContext(OWNER).storage();
    await assertSucceeds(uploadBytes(ref(storage, `users/${OWNER}/photo.jpg`), image, { contentType: "image/jpeg" }));
    await assertSucceeds(getBytes(ref(env.unauthenticatedContext().storage(), `users/${OWNER}/photo.jpg`)));
  });

  it("nobody can upload into someone else's folder", async () => {
    const storage = env.authenticatedContext("stranger").storage();
    await assertFails(uploadBytes(ref(storage, `users/${OWNER}/x.jpg`), image, { contentType: "image/jpeg" }));
    await assertFails(
      uploadBytes(ref(env.unauthenticatedContext().storage(), `users/${OWNER}/y.jpg`), image, { contentType: "image/jpeg" }),
    );
  });

  it("only images are allowed, and they must be under 5 MB", async () => {
    const storage = env.authenticatedContext(OWNER).storage();
    await assertFails(uploadBytes(ref(storage, `users/${OWNER}/file.pdf`), image, { contentType: "application/pdf" }));
    const big = new Uint8Array(5 * 1024 * 1024 + 1);
    await assertFails(uploadBytes(ref(storage, `users/${OWNER}/big.jpg`), big, { contentType: "image/jpeg" }));
  });

  it("only the owner can delete", async () => {
    await assertFails(deleteObject(ref(env.authenticatedContext("stranger").storage(), `users/${OWNER}/photo.jpg`)));
    await assertSucceeds(deleteObject(ref(env.authenticatedContext(OWNER).storage(), `users/${OWNER}/photo.jpg`)));
  });
});
