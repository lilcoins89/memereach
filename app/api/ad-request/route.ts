import { NextResponse } from "next/server";
import { listCampaigns } from "@/lib/db/store";
import { selectCampaign, toPublicAd } from "@/lib/engine/ad-engine";
import { getDeliveryContext, rememberRequestViewer } from "@/lib/engine/delivery-rules";
import { adRequestSchema } from "@/lib/security/guards";

export async function POST(request: Request) {
  const parsed = adRequestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid ad request", code: "INVALID_INPUT" }, { status: 400 });
  const viewerKey = parsed.data.viewerKey || `anonymous:${parsed.data.publisherDomain}`;
  const now = new Date();
  const decision = selectCampaign(parsed.data, listCampaigns(), now, (campaign) => getDeliveryContext(campaign.id, viewerKey, now));
  if (!decision) return NextResponse.json({ ad: null, reason: "NO_ELIGIBLE_INVENTORY", deliveryRulesApplied: true, sandbox: Boolean(parsed.data.sandbox) }, { status: 200 });
  rememberRequestViewer(parsed.data.requestId, viewerKey);
  return NextResponse.json({ ad: toPublicAd(decision, parsed.data, now), selection: { score: decision.score, reasons: decision.reasons }, delivery: decision.campaign.deliveryRules || null, sandbox: Boolean(parsed.data.sandbox) }, { headers: { "cache-control": "no-store" } });
}
