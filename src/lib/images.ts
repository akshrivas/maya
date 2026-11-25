"use client";
// Photos are shrunk in the browser before upload: faster on mobile data and cheaper to store.
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { firebase } from "@/lib/firebase/client";
import type { StoredImage } from "@/lib/profile/types";

export const MAX_INPUT_BYTES = 10 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export class ImageError extends Error {
  constructor(public key: "imageTooBig" | "imageType" | "generic") {
    super(key);
  }
}

async function resize(file: File, maxSide: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new ImageError("imageType");
  });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new ImageError("generic"))), "image/jpeg", 0.85),
  );
}

/** Resize + upload to users/{uid}/{kind}-{random}.jpg; returns the public URL and path. */
export async function uploadImage(uid: string, file: File, kind: "photo" | "cover" | "work"): Promise<StoredImage> {
  if (file.size > MAX_INPUT_BYTES) throw new ImageError("imageTooBig");
  if (file.type && !ACCEPTED.includes(file.type)) throw new ImageError("imageType");
  const blob = await resize(file, kind === "photo" ? 800 : 1600);
  const path = `users/${uid}/${kind}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}.jpg`;
  const storageRef = ref(firebase().storage, path);
  await uploadBytes(storageRef, blob, { contentType: "image/jpeg", cacheControl: "public, max-age=31536000" });
  return { url: await getDownloadURL(storageRef), path };
}

export async function removeImage(img: StoredImage | null | undefined) {
  if (!img) return;
  try {
    await deleteObject(ref(firebase().storage, img.path));
  } catch {
    // already gone — nothing to do
  }
}
