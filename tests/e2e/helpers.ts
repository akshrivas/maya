import type { Page } from "@playwright/test";

const PROJECT = "demo-maya";
const AUTH = "http://127.0.0.1:9099";
const FIRESTORE = "http://127.0.0.1:8080";

/** Wipe the emulator data so every test starts clean. */
export async function resetEmulators() {
  await fetch(`${FIRESTORE}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: "DELETE" });
  await fetch(`${AUTH}/emulator/v1/projects/${PROJECT}/accounts`, { method: "DELETE" });
}

/** The auth emulator doesn't send SMS; it exposes the OTP codes here instead. */
export async function latestOtp(phone: string): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const res = await fetch(`${AUTH}/emulator/v1/projects/${PROJECT}/verificationCodes`);
    const { verificationCodes = [] } = (await res.json()) as { verificationCodes?: { phoneNumber: string; code: string }[] };
    const match = verificationCodes.filter((c) => c.phoneNumber === phone).pop();
    if (match) return match.code;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`No OTP for ${phone}`);
}

/** India Post's pincode service isn't reachable from tests, so answer it locally. */
export async function mockPincode(page: Page) {
  await page.route("**/api/pincode/452010", (route) =>
    route.fulfill({
      json: { state: "Madhya Pradesh", city: "Indore", areas: ["Vijay Nagar", "Palasia"] },
    }),
  );
}

export async function loginWithPhone(page: Page, national = "9876543210") {
  await page.goto("/login");
  await page.getByLabel(/mobile number/i).fill(national);
  await page.getByRole("button", { name: /send otp/i }).click();
  const code = await latestOtp(`+91${national}`);
  await page.getByLabel(/otp code/i).fill(code);
  await page.getByRole("button", { name: /verify/i }).click();
}

/** Complete sign-up Step 1 and return the new page's handle. */
export async function signUp(page: Page, opts: { name?: string; phone?: string } = {}) {
  await mockPincode(page);
  await loginWithPhone(page, opts.phone);
  await page.waitForURL("**/onboarding");
  await page.getByLabel(/your name or business name/i).fill(opts.name ?? "Asha Verma");
  await page.getByLabel(/what do you do/i).fill("tutor");
  await page.getByRole("option", { name: "Tutor", exact: true }).click();
  await page.getByLabel(/pincode/i).fill("452010");
  await page.getByLabel(/^city/i).and(page.locator("input")).waitFor();
  await page.waitForFunction(() => (document.getElementById("city") as HTMLInputElement)?.value === "Indore");
  await page.getByLabel(/describe your work/i).fill("Maths and science tutor for Class 6 to 10, CBSE and MP Board");
  await page.locator("#acceptTerms").check();
  await page.getByRole("button", { name: /make my page live/i }).click();
  await page.waitForURL("**/dashboard**");
  const link = page.getByTestId("page-link");
  await link.waitFor();
  const href = (await link.getAttribute("href"))!;
  return href.split("/").pop()!;
}
