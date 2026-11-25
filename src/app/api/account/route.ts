// DELETE /api/account — permanently delete the logged-in user's account and all their data.
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/firebase/admin";
import { deleteAccount } from "@/lib/server/profiles";

export async function DELETE(req: Request) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    await deleteAccount(user.uid);
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("deleteAccount failed", err);
    return NextResponse.json({ error: "generic" }, { status: 500 });
  }
}
