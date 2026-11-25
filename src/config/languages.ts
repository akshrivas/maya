// Languages a professional can say they speak (shown on their page).
// Codes are ISO 639-1 so they work in any country. Names are shown in the language itself.
export const SPOKEN_LANGUAGES: { code: string; name: string }[] = [
  { code: "hi", name: "हिन्दी" },
  { code: "en", name: "English" },
  { code: "bn", name: "বাংলা" },
  { code: "mr", name: "मराठी" },
  { code: "te", name: "తెలుగు" },
  { code: "ta", name: "தமிழ்" },
  { code: "gu", name: "ગુજરાતી" },
  { code: "kn", name: "ಕನ್ನಡ" },
  { code: "ml", name: "മലയാളം" },
  { code: "pa", name: "ਪੰਜਾਬੀ" },
  { code: "or", name: "ଓଡ଼ିଆ" },
  { code: "ur", name: "اردو" },
  { code: "as", name: "অসমীয়া" },
  { code: "ne", name: "नेपाली" },
  { code: "ar", name: "العربية" },
];

export function spokenLanguageName(code: string): string {
  return SPOKEN_LANGUAGES.find((l) => l.code === code)?.name ?? code;
}
