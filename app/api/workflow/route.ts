import { NextResponse } from "next/server";
import { z } from "zod";
import { createCampaignWorkflow, listWorkflowSnapshots } from "@/lib/db/workflow";
import { heliusSolanaAdapter } from "@/lib/solana/adapter";
import { canReadOrganization, getOrganizationId } from "@/lib/security/guards";

const creativeSchema = z.object({ name: z.string().trim().min(2).max(80), type: z.enum(["token_image", "token_video", "token_text", "website_link"]), headline: z.string().trim().min(3).max(120), body: z.string().trim().min(3).max(500), assetUrl: z.string().url().nullable(), destinationUrl: z.string().url().nullable(), tokenMint: z.string().trim().min(32).max(44), tokenSymbol: z.string().trim().min(1).max(12), disclosure: z.literal(true) });
const adSetSchema = z.object({ name: z.string().trim().min(2).max(80), audience: z.object({ categories: z.array(z.string().min(2)).min(1).max(20), domains: z.array(z.string().min(3)).max(50), geoMarkets: z.array(z.string().min(2)).min(1).max(30), contextualTerms: z.array(z.string().min(2)).max(30) }), placements: z.array(z.string().min(1)).min(1).max(20), budget: z.number().finite().positive().max(10_000_000), bid: z.number().finite().positive().max(1000), pricingModel: z.enum(["CPC", "CPM"]), startAt: z.string().datetime(), endAt: z.string().datetime().nullable(), ads: z.array(creativeSchema).min(1).max(20) });
const workflowSchema = z.object({ name: z.string().trim().min(3).max(80), objective: z.string().trim().min(3).max(80), tokenName: z.string().trim().min(1).max(80), tokenSymbol: z.string().trim().min(1).max(12), mint: z.string().trim().min(32).max(44), budget: z.number().finite().positive().max(10_000_000), bid: z.number().finite().positive().max(1000), pricingModel: z.enum(["CPC", "CPM"]), placements: z.array(z.string().min(1)).min(1).max(20), description: z.string().trim().min(20).max(240), startAt: z.string().datetime(), endAt: z.string().datetime().nullable(), deliveryRules: z.object({ frequencyCapPerHour: z.number().int().min(1).max(1000).optional(), dailyImpressionCap: z.number().int().min(1).max(10_000_000).optional(), allowedHoursUtc: z.array(z.number().int().min(0).max(23)).max(24).optional() }).optional(), adSets: z.array(adSetSchema).min(1).max(20) });

export async function GET(request: Request) {
  const organizationId = getOrganizationId(request);
  if (!canReadOrganization(organizationId)) return NextResponse.json({ error: "Organization access denied", code: "ORG_FORBIDDEN" }, { status: 403 });
  return NextResponse.json({ workflows: listWorkflowSnapshots(organizationId) }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const organizationId = getOrganizationId(request);
  if (!canReadOrganization(organizationId)) return NextResponse.json({ error: "Organization access denied", code: "ORG_FORBIDDEN" }, { status: 403 });
  const parsed = workflowSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Campaign workflow is invalid", code: "INVALID_WORKFLOW", details: parsed.error.flatten() }, { status: 400 });
  try {
    const screening = await heliusSolanaAdapter.screenMint(parsed.data.mint);
    const workflow = createCampaignWorkflow({ ...parsed.data, organizationId, riskScore: screening.riskScore, screeningStatus: screening.status });
    return NextResponse.json({ workflow, screening }, { status: 201 });
  } catch { return NextResponse.json({ error: "Token screening could not be completed", code: "SCREENING_REQUIRED" }, { status: 422 }); }
}
