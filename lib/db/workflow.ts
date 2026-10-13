import type { AdCreative, AdSet, AdSetAudience, Campaign, CreativeType, DeliveryRules, ScreeningStatus } from "@/lib/types";
import { createCampaign, DEMO_ORG_ID } from "@/lib/db/store";

export type CampaignWorkflowInput = { organizationId: string; name: string; objective: string; tokenName: string; tokenSymbol: string; mint: string; budget: number; bid: number; pricingModel: "CPC" | "CPM"; placements: string[]; description: string; startAt: string; endAt: string | null; deliveryRules?: DeliveryRules; riskScore: number | null; screeningStatus: ScreeningStatus; adSets: Array<{ name: string; audience: AdSetAudience; placements: string[]; budget: number; bid: number; pricingModel: "CPC" | "CPM"; startAt: string; endAt: string | null; ads: Array<{ name: string; type: CreativeType; headline: string; body: string; assetUrl: string | null; destinationUrl: string | null; tokenMint: string; tokenSymbol: string; disclosure: boolean }> }> };

let adSets: AdSet[] = [];
let ads: AdCreative[] = [];

export function createCampaignWorkflow(input: CampaignWorkflowInput) {
  const campaign = createCampaign({ organizationId: input.organizationId || DEMO_ORG_ID, name: input.name, objective: input.objective, tokenName: input.tokenName, tokenSymbol: input.tokenSymbol, mint: input.mint, budget: input.budget, bid: input.bid, pricingModel: input.pricingModel, riskScore: input.riskScore, screeningStatus: input.screeningStatus, placements: input.placements, description: input.description, startAt: input.startAt, endAt: input.endAt, deliveryRules: input.deliveryRules });
  const createdSets = input.adSets.map((set, index) => { const adSet: AdSet = { id: `adset_${Math.random().toString(36).slice(2, 9)}`, campaignId: campaign.id, name: set.name || `Ad Set ${index + 1}`, audience: set.audience, placements: set.placements, budget: set.budget, bid: set.bid, pricingModel: set.pricingModel, startAt: set.startAt, endAt: set.endAt, status: "draft" }; adSets = [adSet, ...adSets]; return adSet; });
  const createdAds = input.adSets.flatMap((set, setIndex) => { const adSet = createdSets[setIndex]; return set.ads.map((creative, adIndex) => { const ad: AdCreative = { id: `ad_${Math.random().toString(36).slice(2, 9)}`, adSetId: adSet.id, name: creative.name || `Ad ${adIndex + 1}`, type: creative.type, headline: creative.headline, body: creative.body, assetUrl: creative.assetUrl, destinationUrl: creative.destinationUrl, tokenMint: creative.tokenMint, tokenSymbol: creative.tokenSymbol, disclosure: creative.disclosure, status: "draft" }; ads = [ad, ...ads]; return ad; }); });
  return { campaign, adSets: createdSets, ads: createdAds };
}
export function listAdSets(campaignId?: string) { return campaignId ? adSets.filter((set) => set.campaignId === campaignId) : adSets; }
export function listAds(adSetId?: string) { return adSetId ? ads.filter((ad) => ad.adSetId === adSetId) : ads; }
