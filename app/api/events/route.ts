import { NextResponse } from "next/server";
import { getCampaign } from "@/lib/db/store";
import { eventSchema } from "@/lib/security/guards";
import { verifyPlacementToken } from "@/lib/security/tokens";

const seenEvents = new Set<string>();
const validRequests = new Set<string>();
export async function POST(request: Request) {
  const parsed = eventSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid event payload", code: "INVALID_EVENT" }, { status: 400 });
  const event = parsed.data;
  const claims = verifyPlacementToken(event.token);
  if (!claims || claims.requestId !== event.requestId || claims.campaignId !== event.campaignId || claims.placementId !== event.placementId) return NextResponse.json({ error: "Placement token is invalid, expired, or forged", code: "FORGED_CONTEXT" }, { status: 403 });
  const campaign = getCampaign(event.campaignId);
  if (!campaign || campaign.status !== "approved" || campaign.screeningStatus !== "verified" || !campaign.placements.includes(event.placementId)) return NextResponse.json({ error: "Campaign is not eligible for event ingestion", code: "INELIGIBLE_CAMPAIGN" }, { status: 409 });
  if (event.eventType === "impression") validRequests.add(event.requestId);
  if (event.eventType !== "impression" && !validRequests.has(event.requestId)) return NextResponse.json({ error: "Event request context is not recognized", code: "FORGED_CONTEXT" }, { status: 403 });
  if (seenEvents.has(event.eventId)) return NextResponse.json({ accepted: true, duplicate: true, eventId: event.eventId }, { status: 200 });
  seenEvents.add(event.eventId);
  return NextResponse.json({ accepted: true, duplicate: false, billable: event.eventType !== "conversion", eventId: event.eventId }, { status: 202 });
}
