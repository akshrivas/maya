import { expect, test } from "@playwright/test";
import { resetEmulators, signUp } from "./helpers";

test.beforeEach(async () => {
  await resetEmulators();
});

test("sign up with phone OTP, finish Step 1, and the public page is live", async ({ page, request }) => {
  const started = Date.now();
  const handle = await signUp(page);
  expect(handle).toBe("asha-verma-indore");
  // FSD goal: sign-up to live page in under 2 minutes (automated run is much faster).
  expect(Date.now() - started).toBeLessThan(120_000);

  // The page is rendered on the server: the raw HTML already contains the content (good for SEO).
  const res = await request.get(`/${handle}`);
  expect(res.status()).toBe(200);
  const html = await res.text();
  expect(html).toContain("Asha Verma");
  expect(html).toContain("application/ld+json");
  expect(html).toContain('<meta property="og:title"');

  // What a visitor sees
  await page.goto(`/${handle}`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Asha Verma");
  await expect(page.getByText("Maths and science tutor").first()).toBeVisible(); // intro in the header
  const wa = page.getByRole("link", { name: "WhatsApp" }).first();
  await expect(wa).toHaveAttribute("href", /^https:\/\/wa\.me\/919876543210\?text=/);
  await expect(page.getByRole("link", { name: "Call" }).first()).toHaveAttribute("href", "tel:+919876543210");
  await expect(page.getByRole("link", { name: /get your free page on maya/i })).toHaveAttribute("href", `/?ref=${handle}`);

  // Share sheet with link + QR code
  await page.getByRole("button", { name: "Share" }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText(`localhost:3000/${handle}`);
  await expect(dialog.getByRole("img", { name: /qr code/i })).toBeVisible();
  await expect(dialog.getByRole("link", { name: /download qr/i })).toBeVisible();
});

test("a second person with the same name and city gets a different link", async ({ page, browser }) => {
  const first = await signUp(page, { phone: "9876543210" });
  const ctx2 = await browser.newContext({ ...test.info().project.use });
  const page2 = await ctx2.newPage();
  const second = await signUp(page2, { phone: "9123456780" });
  expect(first).toBe("asha-verma-indore");
  expect(second).toBe("asha-verma-indore-2");
  await ctx2.close();
});

test("unknown links show a friendly not-found page", async ({ page }) => {
  const res = await page.goto("/no-such-person-here");
  expect(res?.status()).toBe(404);
  await expect(page.getByText(/this page doesn't exist/i)).toBeVisible();
});

test("signing up requires accepting the terms", async ({ page }) => {
  const { loginWithPhone, mockPincode } = await import("./helpers");
  await mockPincode(page);
  await loginWithPhone(page);
  await page.waitForURL("**/onboarding");
  await page.getByRole("button", { name: /make my page live/i }).click();
  await expect(page.getByText(/please accept the terms/i)).toBeVisible();
  await expect(page).toHaveURL(/onboarding/);
});
