// POST /api/profile — Step 1 sign-up: validates the form, claims a page link and publishes the page.
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/firebase/admin";
import { fieldErrors, step1Schema } from "@/lib/profile/schema";
import { createProfile, HandleTakenError, ProfileExistsError } from "@/lib/server/profiles";
import { isLang } from "@/i18n";

export async function POST(req: Request) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = step1Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid", fields: fieldErrors(parsed.error) }, { status: 400 });
  }

  try {
    const profile = await createProfile(user.uid, parsed.data, {
      phone: user.phone_number ?? null,
      email: user.email ?? null,
      lang: isLang(body?.lang) ? body.lang : "en",
      ref: typeof body?.ref === "string" && /^[a-z0-9-]{3,40}$/.test(body.ref) ? body.ref : null,
    });
    return NextResponse.json({ handle: profile.handle });
  } catch (err) {
    if (err instanceof ProfileExistsError) return NextResponse.json({ error: "exists" }, { status: 409 });
    if (err instanceof HandleTakenError) return NextResponse.json({ error: "handleTaken" }, { status: 409 });
    console.error("createProfile failed", err);
    return NextResponse.json({ error: "generic" }, { status: 500 });
  }
}
