// Fills the LOCAL emulator with 4 sample pages (one per template) to preview designs.
// Usage (while emulators run): node scripts/seed-demo.mjs
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8080";
const db = getFirestore(initializeApp({ projectId: "demo-maya" }));
const now = Date.now();

const base = {
  published: true, verified: false, country: "IN", currency: "INR", photo: null, cover: null,
  portfolio: [], videos: [], extra: {}, createdAt: now, updatedAt: now, publishedAt: now,
};

const demos = [
  {
    uid: "demo-classic", handle: "rajesh-gupta-ca-indore", template: "classic", verified: true,
    name: "CA Rajesh Gupta", professionId: "chartered_accountant", state: "Madhya Pradesh", city: "Indore", area: "Palasia", pincode: "452001",
    intro: "Helping small businesses in Indore with GST, income tax and audits for 15 years.",
    about: "I am a practising Chartered Accountant (FCA) based in Palasia, Indore. For over 15 years I have helped traders, doctors and small manufacturers stay compliant and save tax.\n\nMy team handles GST registration and returns, income tax filing, company audits and business advisory. You get one point of contact and clear answers in Hindi or English.",
    yearsExperience: 15, languages: ["hi", "en"],
    services: [
      { name: "GST registration", priceMin: 1500, priceMax: null },
      { name: "Monthly GST returns", priceMin: 800, priceMax: 2500 },
      { name: "Income tax return (salaried)", priceMin: 999, priceMax: 999 },
      { name: "Company audit", priceMin: null, priceMax: null },
    ],
    contact: { phone: "+919876543210", whatsapp: "", email: "rajesh@example.com", website: "https://example.com", instagram: "" },
    workingHours: "Mon–Sat, 10 am – 7 pm", serviceArea: "Indore and online across India",
    extra: { firmName: "Gupta & Associates", practiceAreas: "GST, income tax, audit, company law" },
  },
  {
    uid: "demo-friendly", handle: "asha-verma-tutor-indore", template: "friendly",
    name: "Asha Verma", professionId: "tutor", state: "Madhya Pradesh", city: "Indore", area: "Vijay Nagar", pincode: "452010",
    intro: "Maths and science tutor for Class 6–10. Patient teaching, weekly tests, results you can see.",
    about: "Hello! I'm Asha, and I have been teaching maths and science to school students for 8 years. I keep batches small so every child gets attention.\n\nParents get a short progress update every month.",
    yearsExperience: 8, languages: ["hi", "en"],
    services: [
      { name: "Group batch (max 6 students)", priceMin: 1500, priceMax: null },
      { name: "Home tuition", priceMin: 3000, priceMax: 5000 },
    ],
    contact: { phone: "+919123456780", whatsapp: "", email: "", website: "", instagram: "asha.tutor" },
    workingHours: "Mon–Sat, 4 pm – 8 pm", serviceArea: "Vijay Nagar, Scheme 54, Bombay Hospital area",
    testimonials: [
      { name: "Neha S.", text: "My son's maths marks went from 55 to 88 in one term. Asha ma'am explains every step patiently.", detail: "Parent, Class 9" },
      { name: "Rohit K.", text: "Weekly tests really helped me before boards.", detail: "Class 10 student" },
    ],
    extra: { subjects: "Maths, Science", classes: "Class 6–10, CBSE & MP Board", mode: "Home tuition and centre" },
  },
  {
    uid: "demo-gallery", handle: "priya-sharma-indore", template: "gallery",
    name: "Priya Sharma", professionId: "makeup_artist", state: "Madhya Pradesh", city: "Indore", area: "Sapna Sangeeta", pincode: "452001",
    intro: "Bridal and party makeup artist. Soft, glowing looks that last all night.",
    about: "", yearsExperience: 6, languages: ["hi", "en", "gu"],
    services: [
      { name: "Bridal HD makeup", priceMin: 15000, priceMax: 35000 },
      { name: "Party makeup", priceMin: 3000, priceMax: null },
      { name: "Engagement look", priceMin: 8000, priceMax: 12000 },
    ],
    videos: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
    contact: { phone: "+919988776655", whatsapp: "", email: "", website: "", instagram: "priya.mua" },
    workingHours: "By appointment", serviceArea: "Indore, Ujjain, Dewas — travel for weddings",
    testimonials: [
      { name: "Kritika J.", text: "Priya made me look like myself, only better. The makeup lasted the whole wedding night!", detail: "Bride, Feb 2026" },
    ],
    extra: { specialities: "Bridal, HD, airbrush", studioName: "Glow by Priya" },
  },
  {
    uid: "demo-bold", handle: "sharma-electricals-bhopal", template: "bold",
    name: "Sharma Electricals", professionId: "electrician", state: "Madhya Pradesh", city: "Bhopal", area: "MP Nagar", pincode: "462011",
    intro: "Wiring, fan & light fitting, inverter repair. Same-day visit in Bhopal.",
    about: "Licensed electrician with a team of 4. Clean work, fair rates, 30-day guarantee on all repairs.",
    yearsExperience: 12, languages: ["hi"],
    services: [
      { name: "Visit & inspection", priceMin: 199, priceMax: 199 },
      { name: "Fan installation", priceMin: 250, priceMax: null },
      { name: "Full house wiring", priceMin: null, priceMax: null },
      { name: "Inverter repair", priceMin: 400, priceMax: 1500 },
    ],
    contact: { phone: "+919812345678", whatsapp: "", email: "", website: "", instagram: "" },
    workingHours: "Every day, 8 am – 9 pm", serviceArea: "All of Bhopal",
    extra: { emergency: "Yes, 24×7 for emergencies", brands: "Havells, Luminous, Microtek" },
  },
];

for (const d of demos) {
  const p = { ...base, ...d };
  await db.collection("profiles").doc(p.uid).set(p);
  await db.collection("handles").doc(p.handle).set({ uid: p.uid, createdAt: now });
  console.log(`seeded /${p.handle} (${p.template})`);
}
process.exit(0);
