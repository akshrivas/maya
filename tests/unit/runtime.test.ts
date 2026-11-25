// Vercel's Node runtime cannot require() ES-only modules. firebase-admin 14 pulls in such a
// module (jose 6 via jwks-rsa 4) and crashed every server page in production. This test fails
// if a dependency upgrade brings that problem back.
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("server dependencies load on Vercel's runtime", () => {
  it("firebase-admin loads without require(esm) support", () => {
    const out = execFileSync(
      process.execPath,
      [
        "--no-experimental-require-module",
        "-e",
        "require('firebase-admin/app');require('firebase-admin/auth');require('firebase-admin/firestore');require('firebase-admin/storage');console.log('ok')",
      ],
      { encoding: "utf8" },
    );
    expect(out.trim()).toBe("ok");
  });
});
