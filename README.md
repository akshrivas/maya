# Maya

Any professional can sign up for free and get their own public page, e.g. `maya.in/priya-sharma-indore`.
This repository is the MVP from the FSD: **professional onboarding + their public page**, nothing else.

**What's in it**

| | |
|---|---|
| Sign-up | Mobile OTP (+91) or Google · Step 1 form (~1 min) publishes the page instantly |
| Public page | Server-rendered for SEO · WhatsApp & Call buttons · share link + QR code · "Get your free page on Maya" link · 4 templates |
| Dashboard | Profile completion bar · edit Steps 1–3 any time · photos · template picker · change link · AI-written About · delete account |
| Languages | English + Hindi (all text in `src/i18n/`) |
| Global-ready | Phone numbers stored with country code, `country` + `currency` on every profile, professions stored by universal ID |

**Built with:** Next.js (App Router, TypeScript) + Tailwind · Firebase Auth, Firestore, Storage · Claude API · Vercel.

---

## 1. Run it on your computer (no accounts needed)

You need [Node.js 20+](https://nodejs.org) and [Java 21+](https://adoptium.net) (Java is used by Firebase's local emulator).

```bash
npm install
```

```bash
npm run dev:local
```

Open http://localhost:3000. This uses **local, fake Firebase** (the "emulator"): nothing touches real data and no SMS is sent.
When you log in with any 10-digit mobile number, the OTP code is printed in the terminal
(and visible at http://localhost:4000 → Authentication).

To fill the local site with 4 sample pages (one per template), run this in a second terminal while `dev:local` is running:

```bash
node scripts/seed-demo.mjs
```

Then open http://localhost:3000/rajesh-gupta-ca-indore, `/asha-verma-tutor-indore`, `/priya-sharma-indore`, `/sharma-electricals-bhopal`.

## 2. Run the tests

```bash
npm run test:all
```

That runs, in order:

| Command | What it checks |
|---|---|
| `npm run typecheck` | The code has no type errors |
| `npm test` | Validation, phone formatting, page links, completion %, saving logic, Hindi has every English text |
| `npm run test:rules` | Security rules: strangers can't edit your page, private data stays private, photo upload limits |
| `npm run test:e2e` | A real (phone-sized) browser: sign up with OTP → page live, profile save, photo upload, templates, link change, AI About, delete account |

## 3. Settings (environment variables)

All settings live in environment variables. `.env.example` lists every one with an explanation.
For the real site, copy it to `.env.local` (on your computer) or paste the values into Vercel (for the live site).
**Never commit `.env.local`** (git already ignores it).

| Variable | Secret? | Where it comes from |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | no | Your site address, e.g. `https://maya.in` |
| `NEXT_PUBLIC_FIREBASE_*` (6 values) | no | Firebase console → Project settings → Your apps → Web app |
| `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | **yes** | Firebase console → Project settings → Service accounts → Generate new private key |
| `ANTHROPIC_API_KEY` | **yes** | console.anthropic.com → API keys |

## 4. Deploy

The step-by-step guide for creating the Firebase project, the Claude key, Vercel and the domain is in
**[docs/SETUP.md](docs/SETUP.md)**. In short:

1. Create the Firebase project, turn on Phone + Google sign-in, Firestore and Storage.
2. Publish the security rules: `npx firebase login` then `npx firebase deploy --only firestore:rules,storage`
3. Import this GitHub repo in Vercel, paste the environment variables, deploy.
4. Add your domain in Vercel, and add it to Firebase → Authentication → Settings → Authorized domains.

## 5. Updating the site

- **Change text** (English or Hindi): `src/i18n/en.ts` and `src/i18n/hi.ts`. The tests fail if a Hindi text is missing.
- **Add a profession**: add a row in `src/config/professions.ts` (with its English and Hindi name).
- **Legal pages**: `src/content/legal.ts`. These are **placeholders and must be reviewed by a lawyer** before launch.
- **Open a new country**: add it to `LAUNCH_COUNTRIES` in `src/config/countries.ts`.
- **Change security rules**: edit `firestore.rules` / `storage.rules`, run `npm run test:rules`, then publish them with the `firebase deploy` command above. (Rules are **not** deployed by Vercel.)
- **Deploying an update**: push to the GitHub branch Vercel watches (usually `main`). Vercel rebuilds and publishes automatically in ~1 minute. Every pull request also gets its own preview link.

## 6. Running Maya day to day

- **Give someone a verified badge**: Firebase console → Firestore → `users/<their id>` → check the `verification` numbers. If they're genuine, set `verification.status` to `"verified"`, then in `profiles/<same id>` set `verified` to `true`. To reject, set `verification.status` to `"rejected"`.
- **Remove a page that breaks the terms**: in `profiles/<id>` set `published` to `false` (the page shows "doesn't exist").
- **Metrics in the FSD**: `profiles` has `createdAt` / `publishedAt` (time to live page) and `users.signupRef` (which page link brought a new sign-up). Profile completion is computed by `src/lib/profile/completion.ts`.

## 7. How it's organised

```
src/
  app/
    page.tsx                  Home page
    [handle]/page.tsx         Public page (server-rendered)
    (app)/login               Phone OTP + Google
    (app)/onboarding          Step 1 → page goes live
    (app)/dashboard           Completion bar, editing, share/QR, verification, delete
    api/profile               Create page (claims a unique link) · api/profile/handle: change link
    api/about                 AI-written About (Claude API)
    api/account               Delete account and data
    api/pincode/[pin]         Pincode → state/city/areas (India Post)
    privacy, terms            Placeholder legal pages
  components/templates/       Classic, Friendly, Gallery, Bold
  components/page/            Shared page parts (buttons, share sheet, sections)
  config/                     Countries, professions, templates, languages
  i18n/                       English + Hindi text
  lib/                        Firebase setup, validation, completion %, page links, images
firestore.rules, storage.rules  Security rules
tests/                        unit/, rules/, e2e/
```

**Data (Firestore)**

| Collection | Who can read | Who can write |
|---|---|---|
| `profiles/{uid}` | Everyone, if `published` | Owner (allowed fields only); server creates/deletes |
| `users/{uid}` | Owner only | Owner (language, verification); server creates |
| `handles/{handle}` | Everyone | Server only (guarantees unique links) |
| `aiUsage/{uid_day}` | Nobody | Server only (daily AI limit) |

## 8. Known limits and decisions

- **Page links** use `name-city` (FSD open question), editable from the dashboard. Names typed only in Hindi get `profession-city`.
- **Aadhaar is not collected** for verification until the legal review. PAN, GST/Udyam/shop licence and professional licence numbers are stored privately.
- **Google sign-ups** type their mobile number in Step 1. It isn't OTP-verified (only phone sign-ups are).
- **Videos** are YouTube/Instagram links, not uploads (storage cost and mobile data).
- **Pincode autofill** uses India Post's free public service. If it's down, people just type their city and state.
- **AI About**: 10 uses per person per day. The text is always editable before saving.
- Out of scope (as agreed): referrals programme, analytics dashboard, bulk onboarding for associations.
