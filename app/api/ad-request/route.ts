import { NextResponse } from "next/server";
import { listCampaigns } from "@/lib/db/store";
import { selectCampaign, toPublicAd } from "@/lib/engine/ad-engine";
import { adRequestSchema } from "@/lib/security/guards";

export async function POST(request: Request) {
  const parsed = adRequestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid ad request", code: "INVALID_INPUT" }, { status: 400 });
  const decision = selectCampaign(parsed.data, listCampaigns(), new Date());
  if (!decision) return NextResponse.json({ ad: null, reason: "NO_ELIGIBLE_INVENTORY", sandbox: Boolean(parsed.data.sandbox) }, { status: 200 });
  return NextResponse.json({ ad: toPublicAd(decision, parsed.data), selection: { score: decision.score, reasons: decision.reasons }, sandbox: Boolean(parsed.data.sandbox) }, { headers: { "cache-control": "no-store" } });
}
