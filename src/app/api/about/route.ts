// POST /api/about — AI-written "About" from the one-line intro (Claude API). Logged-in owners only.
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/firebase/admin";
import { takeAiQuota, writeAbout } from "@/lib/server/about";

export const maxDuration = 60;

const bodySchema = z.object({
  name: z.string().trim().min(1).max(80),
  professionId: z.string().max(60),
  city: z.string().max(80),
  area: z.string().max(80).default(""),
  intro: z.string().trim().min(5).max(160),
  yearsExperience: z.number().int().min(0).max(80).nullable().default(null),
  services: z.array(z.string().max(80)).max(20).default([]),
  languages: z.array(z.string().max(3)).max(10).default([]),
  extra: z.record(z.string(), z.string().max(160)).default({}),
  lang: z.enum(["en", "hi"]).default("en"),
});

export async function POST(req: Request) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "aiUnavailable" }, { status: 503 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  if (!(await takeAiQuota(user.uid))) return NextResponse.json({ error: "aiLimit" }, { status: 429 });

  try {
    const about = await writeAbout(parsed.data);
    return NextResponse.json({ about });
  } catch (err) {
    console.error("writeAbout failed", err);
    return NextResponse.json({ error: "aiUnavailable" }, { status: 502 });
  }
}
