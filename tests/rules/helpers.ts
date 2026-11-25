import "firebase/compat/firestore";
import "firebase/compat/storage";
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import type { Profile } from "@/lib/profile/types";

export const PROJECT_ID = "demo-maya";

export async function makeEnv(): Promise<RulesTestEnvironment> {
  return initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: readFileSync("firestore.rules", "utf8"), host: "127.0.0.1", port: 8080 },
    storage: { rules: readFileSync("storage.rules", "utf8"), host: "127.0.0.1", port: 9199 },
  });
}

export function sampleProfile(uid: string, overrides: Partial<Profile> = {}): Profile {
  const now = Date.now();
  return {
    uid,
    handle: "asha-verma-indore",
    published: true,
    template: "friendly",
    verified: false,
    name: "Asha Verma",
    professionId: "tutor",
    country: "IN",
    state: "Madhya Pradesh",
    city: "Indore",
    area: "Vijay Nagar",
    pincode: "452010",
    intro: "Maths tutor for Class 6-10 with 8 years of experience",
    about: "",
    photo: null,
    cover: null,
    yearsExperience: null,
    services: [],
    currency: "INR",
    portfolio: [],
    videos: [],
    languages: [],
    contact: { phone: "+919876543210", whatsapp: "", email: "", website: "", instagram: "" },
    workingHours: "",
    serviceArea: "",
    extra: {},
    testimonials: [],
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
    ...overrides,
  };
}
