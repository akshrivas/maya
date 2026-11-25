import { expect, test, type Page } from "@playwright/test";
import { resetEmulators, signUp } from "./helpers";

test.beforeEach(async () => {
  await resetEmulators();
});

async function open(page: Page, section: RegExp) {
  await page.getByRole("button", { name: section }).click();
}

// A tiny valid PNG (1x1 pixel), so photo uploads can be tested without real files.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

test("profile save: edit details on the dashboard and see them on the public page", async ({ page }) => {
  const handle = await signUp(page);
  await expect(page.getByText(/your page is live/i)).toBeVisible();
  await expect(page.getByText("Profile 40% complete")).toBeVisible();

  await open(page, /^About you/);
  await page.locator("#about").fill(
    "I have taught maths and science for eight years. Small batches, weekly tests and regular updates for parents.",
  );

  await open(page, /^Services & prices/);
  await page.getByRole("button", { name: /add a service/i }).click();
  await page.getByLabel("Service name").fill("Home tuition");
  await page.getByLabel(/price from/i).fill("2000");
  await page.getByLabel(/price up to/i).fill("4000");

  await open(page, /^More details/);
  await page.getByLabel(/years of experience/i).fill("8");
  await page.getByRole("button", { name: "English" }).click();

  await page.getByRole("button", { name: /save changes/i }).click();
  await expect(page.getByText(/saved\. your page is updated/i)).toBeVisible();
  await expect(page.getByText(/Profile \d+% complete/)).not.toHaveText("Profile 40% complete");

  await page.goto(`/${handle}`);
  await expect(page.getByText("Small batches, weekly tests")).toBeVisible();
  await expect(page.getByText("Home tuition")).toBeVisible();
  await expect(page.getByText("₹2,000 – ₹4,000")).toBeVisible();
  await expect(page.getByText("8+ years")).toBeVisible();
});

test("invalid input is caught before saving", async ({ page }) => {
  await signUp(page);
  await open(page, /^Contact & links/);
  await page.getByLabel(/^Email/).fill("not-an-email");
  await page.getByRole("button", { name: /save changes/i }).click();
  await expect(page.getByText("Enter a valid email address")).toBeVisible();
});

test("upload a profile photo and switch template", async ({ page }) => {
  const handle = await signUp(page);
  await open(page, /^Photos/);
  await page.getByTestId("upload-photo").setInputFiles({ name: "me.png", mimeType: "image/png", buffer: PNG });
  await expect(page.getByRole("button", { name: /change photo/i })).toBeVisible({ timeout: 15_000 });

  await open(page, /^Page design/);
  await page.getByRole("radio", { name: /bold/i }).click();
  await expect(page.getByRole("radio", { name: /bold/i })).toHaveAttribute("aria-checked", "true");

  await page.goto(`/${handle}`);
  await expect(page.getByRole("img", { name: "Asha Verma" })).toBeVisible();
  await expect(page.locator("header.bg-\\[\\#ffd400\\]")).toBeVisible(); // Bold template
});

test("AI writes the About section (Claude API simulated in tests)", async ({ page }) => {
  await signUp(page);
  await page.route("**/api/about", (route) =>
    route.fulfill({ json: { about: "Namaste! I am Asha, a maths and science tutor in Indore." } }),
  );
  await open(page, /^About you/);
  await page.getByRole("button", { name: /write my about with ai/i }).click();
  await expect(page.locator("#about")).toHaveValue(/I am Asha/);
});

test("change the page link; the old link stops working", async ({ page, request }) => {
  const handle = await signUp(page);
  await open(page, /^Page link/);
  await page.getByLabel(/your page link/i).fill("asha-maths-classes");
  await page.getByRole("button", { name: /change link/i }).click();
  await expect(page.getByTestId("page-link")).toHaveText(/asha-maths-classes/);
  expect((await request.get(`/asha-maths-classes`)).status()).toBe(200);
  expect((await request.get(`/${handle}`)).status()).toBe(404);
});

/** Looks inside the emulators with admin access ("Bearer owner") to count what's stored. */
async function countLeftovers() {
  const admin = { Authorization: "Bearer owner" };
  const docs = async (col: string) => {
    const r = await fetch(`http://127.0.0.1:8080/v1/projects/demo-maya/databases/(default)/documents/${col}`, { headers: admin });
    return ((await r.json()).documents ?? []).length;
  };
  const files = await fetch("http://127.0.0.1:9199/v0/b/demo-maya.appspot.com/o?prefix=users/", { headers: admin }).then((r) => r.json());
  const accounts = await fetch("http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/projects/demo-maya/accounts:query", {
    method: "POST",
    headers: { ...admin, "Content-Type": "application/json" },
    body: "{}",
  }).then((r) => r.json());
  return {
    users: await docs("users"),
    profiles: await docs("profiles"),
    handles: await docs("handles"),
    files: (files.items ?? []).length,
    accounts: Number(accounts.recordsCount ?? 0),
  };
}

test("delete my account and data removes everything", async ({ page, request }) => {
  const handle = await signUp(page);
  // Upload a photo first so we can check it is deleted too.
  await open(page, /^Photos/);
  await page.getByTestId("upload-photo").setInputFiles({ name: "me.png", mimeType: "image/png", buffer: PNG });
  await expect(page.getByRole("button", { name: /change photo/i })).toBeVisible({ timeout: 15_000 });
  // (Local photo storage isn't wiped between tests, so count files relative to now.)
  const before = await countLeftovers();
  expect(before).toMatchObject({ users: 1, profiles: 1, handles: 1, accounts: 1 });
  expect(before.files).toBeGreaterThanOrEqual(1);

  await open(page, /^Account/);
  await page.getByRole("button", { name: /delete my account and data/i }).click();
  await page.getByLabel(/type your page link/i).fill(handle);
  await page.getByRole("button", { name: /delete everything/i }).click();
  await page.waitForURL("**/?deleted=1");
  await expect(page.getByText(/account and data have been deleted/i)).toBeVisible();
  expect((await request.get(`/${handle}`)).status()).toBe(404);
  expect(await countLeftovers()).toEqual({ users: 0, profiles: 0, handles: 0, accounts: 0, files: before.files - 1 });
});
