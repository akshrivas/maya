// All English text shown in the app lives here.
// To add a language: copy hi.ts, translate the values, and register it in index.ts.
export const en = {
  meta: {
    title: "Maya — your free professional page",
    description:
      "Professionals get their own page on Maya, free. Sign up in 2 minutes and share your link on WhatsApp.",
  },
  common: {
    appName: "Maya",
    language: "Language",
    save: "Save",
    saving: "Saving…",
    saved: "Saved",
    cancel: "Cancel",
    back: "Back",
    next: "Next",
    continue: "Continue",
    loading: "Loading…",
    error: "Something went wrong. Please try again.",
    optional: "Optional",
    required: "Required",
    logout: "Log out",
  },
  nav: {
    login: "Log in",
    dashboard: "My page",
    privacy: "Privacy",
    terms: "Terms",
  },
  home: {
    badge: "Free for every professional",
    headline: "Your own professional page, live in 2 minutes",
    sub: "Doctors, tutors, CAs, electricians, makeup artists — get a beautiful page with WhatsApp and Call buttons. Share it anywhere.",
    cta: "Get your free page",
    point1Title: "Live instantly",
    point1Body: "Fill a 1-minute form and your page is online at {host}/your-name.",
    point2Title: "Customers reach you directly",
    point2Body: "WhatsApp and Call buttons on your page. No middlemen, no commission.",
    point3Title: "AI writes your intro",
    point3Body: "Give us one line about yourself. We turn it into a full introduction.",
    point4Title: "Share everywhere",
    point4Body: "Link and QR code for WhatsApp status, Instagram bio and visiting cards.",
    exampleName: "Priya Sharma",
    exampleRole: "Makeup Artist · Indore",
  },
  legal: {
    placeholderNotice:
      "Placeholder text. This page must be reviewed by a lawyer before launch.",
    lastUpdated: "Last updated",
    privacyTitle: "Privacy policy",
    termsTitle: "Terms of use",
  },
  footer: {
    getYourPage: "Get your free page on Maya",
    madeWith: "Made with Maya",
  },
};

// Same shape as `en`, but every value can be any string.
type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
export type Dict = Widen<typeof en>;
