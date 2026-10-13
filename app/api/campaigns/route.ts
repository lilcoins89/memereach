import { NextResponse } from "next/server";
import { createCampaign, listCampaigns } from "@/lib/db/store";
import { campaignSchema, canReadOrganization, getOrganizationId } from "@/lib/security/guards";
import { heliusSolanaAdapter } from "@/lib/solana/adapter";

export async function GET(request: Request) {
  const organizationId = getOrganizationId(request);
  if (!canReadOrganization(organizationId)) return NextResponse.json({ error: "Organization access denied", code: "ORG_FORBIDDEN" }, { status: 403 });
  return NextResponse.json({ campaigns: listCampaigns(organizationId) });
}

export async function POST(request: Request) {
  const organizationId = getOrganizationId(request);
  if (!canReadOrganization(organizationId)) return NextResponse.json({ error: "Organization access denied", code: "ORG_FORBIDDEN" }, { status: 403 });
  const parsed = campaignSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Campaign configuration is invalid", code: "INVALID_CAMPAIGN", details: parsed.error.flatten() }, { status: 400 });
  try {
    const screening = await heliusSolanaAdapter.screenMint(parsed.data.mint);
    const campaign = createCampaign({ ...parsed.data, organizationId, riskScore: screening.riskScore, screeningStatus: screening.status });
    return NextResponse.json({ campaign, screening }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Token screening could not be completed", code: "SCREENING_REQUIRED" }, { status: 422 });
  }
}
