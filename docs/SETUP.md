# Setting up Maya for real (Firebase, Claude, Vercel, domain)

Follow these in order. It takes about 30–45 minutes. Keep a notepad open: you'll collect a few values
to paste into Vercel at the end (Step 4). Never share the **secret** values in chat or email.

---

## Step 1 — Firebase project (login, database, photo storage)

### 1a. Create the project
1. Go to https://console.firebase.google.com and sign in with your Google account.
2. Click **Create a project**. Name it `maya` (Firebase may add a suffix, e.g. `maya-1a2b3`; that full name is your **project ID**).
3. Google Analytics: you can turn it **off** (not needed). Click **Create project**.

### 1b. Turn on billing (Blaze plan) — required
Firebase only sends real OTP SMS and stores photos on the pay-as-you-go **Blaze** plan. It has a free allowance,
and a small pilot (a few hundred professionals) should cost very little. SMS is the main cost.
1. Bottom-left, click **Upgrade** → **Blaze** → link or create a billing account.
2. Set a **budget alert** (e.g. ₹1,000/month) when it offers. You'll get an email if costs climb.

### 1c. Register the web app (gives you the 6 public values)
1. On the project home page, click the **</>** (Web) icon. Nickname: `maya-web`. Don't tick Firebase Hosting (we use Vercel).
2. It shows a `firebaseConfig` block. Copy these into your notepad:

| From `firebaseConfig` | Goes into |
|---|---|
| `apiKey` | `NEXT_PUBLIC_FIREBASE_API_KEY` |
| `authDomain` | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` |
| `storageBucket` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `NEXT_PUBLIC_FIREBASE_APP_ID` |

(These are safe to be public; the security rules protect the data.)

### 1d. Turn on login methods
1. Left menu: **Build → Authentication → Get started**.
2. **Sign-in method** tab → **Phone** → Enable → Save.
3. **Add new provider → Google** → Enable → pick your support email → Save.
4. **Settings** tab → **SMS region policy** → **Allow** only **India**. This blocks SMS fraud from other countries.
5. *(Optional, for testing without real SMS)*: Sign-in method → Phone → **Phone numbers for testing** → add `+91 99999 00001` with code `123456`.

### 1e. Create the database (Firestore)
1. **Build → Firestore Database → Create database**.
2. Edition: **Standard**. Location: **asia-south1 (Mumbai)**. This can't be changed later.
3. Start in **production mode** → Create.

### 1f. Create photo storage
1. **Build → Storage → Get started**.
2. Location: **asia-south1 (Mumbai)** (same as the database). Production mode → Done.

### 1g. Server key (SECRET)
1. Gear icon (top-left) → **Project settings → Service accounts** tab → **Generate new private key** → Generate.
2. A `.json` file downloads. Open it with Notepad/TextEdit and copy:
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` (the whole thing, from `-----BEGIN` to `END PRIVATE KEY-----\n`) → `FIREBASE_PRIVATE_KEY`
3. Store the file somewhere safe (a password manager), then delete it from Downloads. **Never upload it to GitHub.**

### 1h. Publish the security rules
These rules make sure only owners can edit their page. On a computer with this project and Node.js installed, run:

```bash
npx firebase login
```

```bash
npx firebase deploy --only firestore:rules,storage --project YOUR-PROJECT-ID
```

(Or ask me to walk you through it, or I can do it for you if you give the session access.)

---

## Step 2 — Claude API key (for the AI-written About)

1. Go to https://console.anthropic.com and sign in / sign up.
2. **Billing**: add a payment method and some credit (e.g. $10). Each AI About costs a fraction of a rupee. Each person is limited to 10 per day.
3. **API keys → Create key**. Name it `maya-production`. Copy it **once** (it starts with `sk-ant-`) → `ANTHROPIC_API_KEY`.
4. Recommended: **Limits** → set a monthly spend limit.

---

## Step 3 — Put the code on the `main` branch

The code is on GitHub in the branch `claude/trusting-clarke-rgmeka`. Vercel publishes the `main` branch.
Ask me to open a pull request, then click **Merge** on GitHub (or merge the branch yourself).
From then on, every change merged into `main` goes live automatically.

---

## Step 4 — Vercel (hosting)

1. Go to https://vercel.com and **Sign up with GitHub** (Hobby plan is free to start. A commercial launch needs the Pro plan).
2. **Add New… → Project** → import `akshrivas/maya`.
3. Framework is detected as **Next.js**. Leave build settings as they are.
4. Open **Environment Variables** and add each one (from your notepad):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://maya.in` (or your Vercel address for now, e.g. `https://maya-xyz.vercel.app`) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | from Step 1c |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | from Step 1c |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | from Step 1c |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | from Step 1c |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | from Step 1c |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | from Step 1c |
| `FIREBASE_CLIENT_EMAIL` | from Step 1g |
| `FIREBASE_PRIVATE_KEY` | from Step 1g (paste exactly as in the file, including `\n`) |
| `ANTHROPIC_API_KEY` | from Step 2 |

Do **not** add `NEXT_PUBLIC_USE_FIREBASE_EMULATOR` (that's only for local testing).

5. Click **Deploy**. After ~1 minute you get an address like `https://maya-xyz.vercel.app`.
6. In Firebase → **Authentication → Settings → Authorized domains → Add domain**: add that `maya-xyz.vercel.app` address
   (otherwise login is refused).

**Smoke test:** open the Vercel address on your phone → Get your free page → log in with your number → fill Step 1 →
your page should be live. Open it, tap WhatsApp/Call/Share.

---

## Step 5 — Domain (maya.in or another)

1. Buy the domain (any registrar, or in Vercel: **Domains → Buy**).
2. Vercel → your project → **Settings → Domains → Add** → `maya.in` (and `www.maya.in`, set to redirect to `maya.in`).
3. Vercel shows DNS records (an `A` record and/or `CNAME`). Add them at your registrar. It can take up to a few hours.
4. Firebase → Authentication → Settings → **Authorized domains** → add `maya.in`.
5. Vercel → Settings → Environment Variables → change `NEXT_PUBLIC_SITE_URL` to `https://maya.in` → **Redeploy**
   (Deployments → ⋯ → Redeploy). This makes share links and QR codes use the real domain.

---

## Before public launch (checklist)

- [ ] Lawyer reviews `src/content/legal.ts` (privacy policy + terms) for the DPDP Act, and adds the Grievance Officer's name and email.
- [ ] Firebase budget alert and Anthropic spend limit are set.
- [ ] SMS region policy allows India only.
- [ ] Try sign-up on a cheap Android phone on mobile data.
