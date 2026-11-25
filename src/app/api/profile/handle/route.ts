// POST /api/profile/handle — change the page link (maya.in/<handle>).
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/firebase/admin";
import { isValidHandle } from "@/lib/profile/handle";
import { changeHandle, HandleTakenError } from "@/lib/server/profiles";

export async function POST(req: Request) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { handle } = (await req.json().catch(() => ({}))) as { handle?: string };
  const clean = String(handle ?? "").trim().toLowerCase();
  if (!isValidHandle(clean)) return NextResponse.json({ error: "invalidHandle" }, { status: 400 });
  try {
    await changeHandle(user.uid, clean);
    return NextResponse.json({ handle: clean });
  } catch (err) {
    if (err instanceof HandleTakenError) return NextResponse.json({ error: "handleTaken" }, { status: 409 });
    console.error("changeHandle failed", err);
    return NextResponse.json({ error: "generic" }, { status: 500 });
  }
}
