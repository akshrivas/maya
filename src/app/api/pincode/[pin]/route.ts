// GET /api/pincode/452010 — looks up state, city (district) and areas for an Indian pincode
// using India Post's public data, so the user doesn't have to type them.
import { NextResponse } from "next/server";

type PostOffice = { Name: string; District: string; State: string; Block?: string };

export async function GET(_req: Request, { params }: { params: Promise<{ pin: string }> }) {
  const { pin } = await params;
  if (!/^[1-9]\d{5}$/.test(pin)) return NextResponse.json({ error: "invalidPincode" }, { status: 400 });
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
      next: { revalidate: 60 * 60 * 24 * 30 }, // pincodes rarely change: cache for 30 days
      signal: AbortSignal.timeout(5000),
    });
    const json = (await res.json()) as { Status: string; PostOffice: PostOffice[] | null }[];
    const offices = json?.[0]?.PostOffice;
    if (json?.[0]?.Status !== "Success" || !offices?.length) {
      return NextResponse.json({ error: "notFound" }, { status: 404 });
    }
    return NextResponse.json(
      {
        state: offices[0].State,
        city: offices[0].District,
        areas: [...new Set(offices.map((o) => o.Name))].sort(),
      },
      { headers: { "Cache-Control": "public, max-age=86400" } },
    );
  } catch {
    // Lookup service down: the form still works, the user just types the details.
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
