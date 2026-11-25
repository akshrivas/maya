// The profession list for the Step 1 dropdown.
// `id` is the universal, language-neutral name stored in the database.
// `names` holds what people see in each language; `aliases` help search ("CA", "vakil").
// To add a profession: add a row. To add a language: add a key to `names`.

import type { Lang } from "@/i18n";
import type { TemplateId } from "./templates";

export type CategoryId = "professional" | "health" | "education" | "creative" | "trades" | "other";

type Localized = Record<Lang, string>;

export type ExtraField = { key: string; label: Localized; placeholder?: Localized };

export type Category = {
  id: CategoryId;
  names: Localized;
  defaultTemplate: TemplateId;
  extraFields: ExtraField[];
};

export type Profession = {
  id: string;
  category: CategoryId;
  names: Localized;
  aliases?: string[];
};

export const CATEGORIES: Record<CategoryId, Category> = {
  professional: {
    id: "professional",
    names: { en: "Professional services", hi: "प्रोफ़ेशनल सेवाएँ" },
    defaultTemplate: "classic",
    extraFields: [
      { key: "firmName", label: { en: "Firm / office name", hi: "फ़र्म / ऑफ़िस का नाम" } },
      {
        key: "practiceAreas",
        label: { en: "Areas of practice", hi: "काम के क्षेत्र" },
        placeholder: { en: "e.g. GST, income tax, audits", hi: "जैसे GST, इनकम टैक्स, ऑडिट" },
      },
    ],
  },
  health: {
    id: "health",
    names: { en: "Health & wellness", hi: "स्वास्थ्य और वेलनेस" },
    defaultTemplate: "friendly",
    extraFields: [
      {
        key: "qualification",
        label: { en: "Qualification", hi: "योग्यता" },
        placeholder: { en: "e.g. MBBS, MD", hi: "जैसे MBBS, MD" },
      },
      { key: "clinicName", label: { en: "Clinic / centre name", hi: "क्लिनिक / सेंटर का नाम" } },
    ],
  },
  education: {
    id: "education",
    names: { en: "Education & coaching", hi: "शिक्षा और कोचिंग" },
    defaultTemplate: "friendly",
    extraFields: [
      {
        key: "subjects",
        label: { en: "Subjects / skills taught", hi: "विषय / स्किल" },
        placeholder: { en: "e.g. Maths, Science", hi: "जैसे गणित, विज्ञान" },
      },
      {
        key: "classes",
        label: { en: "Classes / levels", hi: "कक्षाएँ / लेवल" },
        placeholder: { en: "e.g. Class 6–10, CBSE", hi: "जैसे कक्षा 6–10, CBSE" },
      },
      {
        key: "mode",
        label: { en: "Mode", hi: "तरीका" },
        placeholder: { en: "Online / home tuition / centre", hi: "ऑनलाइन / घर पर / सेंटर" },
      },
    ],
  },
  creative: {
    id: "creative",
    names: { en: "Creative & beauty", hi: "क्रिएटिव और ब्यूटी" },
    defaultTemplate: "gallery",
    extraFields: [
      {
        key: "specialities",
        label: { en: "Specialities", hi: "ख़ासियत" },
        placeholder: { en: "e.g. Bridal, party, HD makeup", hi: "जैसे ब्राइडल, पार्टी, HD मेकअप" },
      },
      { key: "studioName", label: { en: "Studio / brand name", hi: "स्टूडियो / ब्रांड का नाम" } },
    ],
  },
  trades: {
    id: "trades",
    names: { en: "Home services & repairs", hi: "घरेलू सेवाएँ और रिपेयर" },
    defaultTemplate: "bold",
    extraFields: [
      {
        key: "emergency",
        label: { en: "Emergency / same-day service", hi: "इमरजेंसी / उसी दिन सेवा" },
        placeholder: { en: "e.g. Yes, 24×7", hi: "जैसे हाँ, 24×7" },
      },
      {
        key: "brands",
        label: { en: "Brands / equipment handled", hi: "ब्रांड / उपकरण" },
        placeholder: { en: "e.g. LG, Samsung, Voltas", hi: "जैसे LG, Samsung, Voltas" },
      },
    ],
  },
  other: {
    id: "other",
    names: { en: "Other", hi: "अन्य" },
    defaultTemplate: "classic",
    extraFields: [],
  },
};

export const PROFESSIONS: Profession[] = [
  // Professional services
  { id: "chartered_accountant", category: "professional", names: { en: "Chartered Accountant (CA)", hi: "चार्टर्ड अकाउंटेंट (CA)" }, aliases: ["ca", "accountant", "audit"] },
  { id: "lawyer", category: "professional", names: { en: "Lawyer / Advocate", hi: "वकील / एडवोकेट" }, aliases: ["advocate", "vakil", "attorney", "legal"] },
  { id: "company_secretary", category: "professional", names: { en: "Company Secretary (CS)", hi: "कंपनी सेक्रेटरी (CS)" }, aliases: ["cs"] },
  { id: "tax_consultant", category: "professional", names: { en: "Tax Consultant", hi: "टैक्स कंसल्टेंट" }, aliases: ["gst", "itr", "tax"] },
  { id: "financial_advisor", category: "professional", names: { en: "Financial Advisor", hi: "फ़ाइनेंशियल एडवाइज़र" }, aliases: ["mutual fund", "investment"] },
  { id: "insurance_agent", category: "professional", names: { en: "Insurance Agent", hi: "इंश्योरेंस एजेंट" }, aliases: ["lic", "bima"] },
  { id: "real_estate_agent", category: "professional", names: { en: "Real Estate Agent", hi: "प्रॉपर्टी डीलर" }, aliases: ["property", "broker", "realtor"] },
  { id: "architect", category: "professional", names: { en: "Architect", hi: "आर्किटेक्ट" } },
  { id: "civil_engineer", category: "professional", names: { en: "Civil Engineer / Contractor", hi: "सिविल इंजीनियर / ठेकेदार" }, aliases: ["contractor", "builder", "thekedar"] },
  { id: "software_developer", category: "professional", names: { en: "Software / Web Developer", hi: "सॉफ़्टवेयर / वेब डेवलपर" }, aliases: ["developer", "it", "website"] },
  { id: "digital_marketer", category: "professional", names: { en: "Digital Marketer", hi: "डिजिटल मार्केटर" }, aliases: ["seo", "social media"] },
  // Health & wellness
  { id: "doctor", category: "health", names: { en: "Doctor", hi: "डॉक्टर" }, aliases: ["physician", "clinic"] },
  { id: "dentist", category: "health", names: { en: "Dentist", hi: "डेंटिस्ट" }, aliases: ["dental"] },
  { id: "physiotherapist", category: "health", names: { en: "Physiotherapist", hi: "फ़िज़ियोथेरेपिस्ट" }, aliases: ["physio"] },
  { id: "dietitian", category: "health", names: { en: "Dietitian / Nutritionist", hi: "डाइटीशियन / न्यूट्रिशनिस्ट" }, aliases: ["diet", "nutrition"] },
  { id: "psychologist", category: "health", names: { en: "Psychologist / Counsellor", hi: "साइकोलॉजिस्ट / काउंसलर" }, aliases: ["therapist", "counselor"] },
  { id: "yoga_trainer", category: "health", names: { en: "Yoga Trainer", hi: "योग ट्रेनर" }, aliases: ["yoga"] },
  { id: "fitness_trainer", category: "health", names: { en: "Fitness Trainer", hi: "फ़िटनेस ट्रेनर" }, aliases: ["gym", "personal trainer"] },
  { id: "veterinarian", category: "health", names: { en: "Veterinarian", hi: "पशु चिकित्सक" }, aliases: ["vet", "pet doctor"] },
  { id: "ayurveda_practitioner", category: "health", names: { en: "Ayurveda Practitioner", hi: "आयुर्वेद वैद्य" }, aliases: ["ayurvedic", "vaidya"] },
  // Education & coaching
  { id: "tutor", category: "education", names: { en: "Tutor", hi: "ट्यूटर" }, aliases: ["teacher", "tuition", "coaching"] },
  { id: "music_teacher", category: "education", names: { en: "Music Teacher", hi: "संगीत शिक्षक" }, aliases: ["guitar", "singing", "music"] },
  { id: "dance_teacher", category: "education", names: { en: "Dance Teacher", hi: "डांस टीचर" }, aliases: ["dance"] },
  { id: "language_trainer", category: "education", names: { en: "Language / Spoken English Trainer", hi: "भाषा / स्पोकन इंग्लिश ट्रेनर" }, aliases: ["english", "ielts"] },
  { id: "career_counsellor", category: "education", names: { en: "Career Counsellor", hi: "करियर काउंसलर" } },
  // Creative & beauty
  { id: "makeup_artist", category: "creative", names: { en: "Makeup Artist", hi: "मेकअप आर्टिस्ट" }, aliases: ["bridal", "mua"] },
  { id: "beautician", category: "creative", names: { en: "Beautician / Salon", hi: "ब्यूटीशियन / सैलून" }, aliases: ["parlour", "parlor", "salon"] },
  { id: "mehendi_artist", category: "creative", names: { en: "Mehendi Artist", hi: "मेहंदी आर्टिस्ट" }, aliases: ["henna", "mehndi"] },
  { id: "photographer", category: "creative", names: { en: "Photographer / Videographer", hi: "फ़ोटोग्राफ़र / वीडियोग्राफ़र" }, aliases: ["photo", "video", "wedding"] },
  { id: "fashion_designer", category: "creative", names: { en: "Fashion Designer / Boutique", hi: "फ़ैशन डिज़ाइनर / बुटीक" }, aliases: ["boutique"] },
  { id: "tailor", category: "creative", names: { en: "Tailor", hi: "दर्ज़ी" }, aliases: ["darzi", "stitching"] },
  { id: "interior_designer", category: "creative", names: { en: "Interior Designer", hi: "इंटीरियर डिज़ाइनर" }, aliases: ["interiors"] },
  { id: "event_planner", category: "creative", names: { en: "Event / Wedding Planner", hi: "इवेंट / वेडिंग प्लानर" }, aliases: ["decorator", "wedding"] },
  { id: "caterer", category: "creative", names: { en: "Caterer / Home Chef", hi: "कैटरर / होम शेफ़" }, aliases: ["catering", "tiffin", "cook"] },
  { id: "baker", category: "creative", names: { en: "Baker / Cake Artist", hi: "बेकर / केक आर्टिस्ट" }, aliases: ["cake"] },
  { id: "graphic_designer", category: "creative", names: { en: "Graphic Designer", hi: "ग्राफ़िक डिज़ाइनर" }, aliases: ["logo", "design"] },
  // Home services & repairs
  { id: "electrician", category: "trades", names: { en: "Electrician", hi: "इलेक्ट्रीशियन" }, aliases: ["bijli", "wiring"] },
  { id: "plumber", category: "trades", names: { en: "Plumber", hi: "प्लंबर" }, aliases: ["pipe", "nal"] },
  { id: "carpenter", category: "trades", names: { en: "Carpenter", hi: "बढ़ई" }, aliases: ["furniture", "badhai"] },
  { id: "painter", category: "trades", names: { en: "Painter", hi: "पेंटर" }, aliases: ["painting", "putty"] },
  { id: "ac_technician", category: "trades", names: { en: "AC / Appliance Repair", hi: "AC / उपकरण रिपेयर" }, aliases: ["ac", "fridge", "washing machine", "repair"] },
  { id: "mechanic", category: "trades", names: { en: "Car / Bike Mechanic", hi: "कार / बाइक मैकेनिक" }, aliases: ["garage", "auto"] },
  { id: "pest_control", category: "trades", names: { en: "Pest Control", hi: "पेस्ट कंट्रोल" }, aliases: ["termite"] },
  { id: "packers_movers", category: "trades", names: { en: "Packers & Movers", hi: "पैकर्स एंड मूवर्स" }, aliases: ["shifting", "transport"] },
  { id: "cleaning_service", category: "trades", names: { en: "Cleaning Service", hi: "सफ़ाई सेवा" }, aliases: ["housekeeping", "deep cleaning"] },
  { id: "driver", category: "trades", names: { en: "Driver / Taxi", hi: "ड्राइवर / टैक्सी" }, aliases: ["cab", "taxi"] },
  // Other
  { id: "other", category: "other", names: { en: "Other", hi: "अन्य" } },
];

const byId = new Map(PROFESSIONS.map((p) => [p.id, p]));

export function getProfession(id: string): Profession | undefined {
  return byId.get(id);
}

export function professionName(id: string, lang: Lang): string {
  const p = byId.get(id);
  return p ? p.names[lang] || p.names.en : id;
}

export function professionCategory(id: string): Category {
  return CATEGORIES[byId.get(id)?.category ?? "other"];
}

/** Search across every language name and aliases. */
export function searchProfessions(query: string, lang: Lang): Profession[] {
  const q = query.trim().toLowerCase();
  const sorted = [...PROFESSIONS].sort((a, b) =>
    a.id === "other" ? 1 : b.id === "other" ? -1 : a.names[lang].localeCompare(b.names[lang]),
  );
  if (!q) return sorted;
  // Best matches first: a name starting with the query, then a word starting with it,
  // then anything containing it (including aliases like "vakil").
  const score = (p: Profession) => {
    if (p.id === "other") return 9;
    const names = Object.values(p.names).map((n) => n.toLowerCase());
    if (names.some((n) => n.startsWith(q))) return 0;
    if (names.some((n) => n.split(/[\s/()]+/).some((w) => w.startsWith(q)))) return 1;
    if (p.aliases?.some((a) => a.startsWith(q))) return 2;
    if (names.some((n) => n.includes(q)) || p.aliases?.some((a) => a.includes(q))) return 3;
    return -1;
  };
  return sorted
    .map((p) => ({ p, s: score(p) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => a.s - b.s)
    .map((x) => x.p);
}
