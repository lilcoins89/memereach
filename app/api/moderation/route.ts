import { NextResponse } from "next/server";
import { approveCampaign, getCampaign, suspendCampaign } from "@/lib/db/store";
import { z } from "zod";

const schema = z.object({ campaignId: z.string().min(3), action: z.enum(["approve", "reject", "suspend"]), reason: z.string().trim().min(5).max(500) });
export async function POST(request: Request) {
  const role = request.headers.get("x-memereach-role");
  if (role !== "platform-admin" && role !== "administrator") return NextResponse.json({ error: "Administrator authorization required", code: "ADMIN_FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid moderation action", code: "INVALID_ACTION" }, { status: 400 });
  const campaign = getCampaign(parsed.data.campaignId);
  if (!campaign) return NextResponse.json({ error: "Campaign not found", code: "NOT_FOUND" }, { status: 404 });
  const updated = parsed.data.action === "approve" ? approveCampaign(campaign.id) : suspendCampaign(campaign.id);
  return NextResponse.json({ campaign: updated, audit: { action: parsed.data.action, reason: parsed.data.reason, actorRole: role, at: new Date().toISOString() } });
}
