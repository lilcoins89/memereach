import type { AdRequest, Campaign, PublicAd } from "@/lib/types";
import { issuePlacementToken } from "@/lib/security/tokens";
import { deliveryAllowed, type DeliveryContext } from "@/lib/engine/delivery-rules";

export type SelectionDecision = { campaign: Campaign; score: number; reasons: string[] };
export type DeliveryContextForCampaign = (campaign: Campaign) => DeliveryContext;

export function selectCampaign(request: AdRequest, candidates: Campaign[], now = new Date(), contextForCampaign: DeliveryContextForCampaign = () => ({ viewerHourlyImpressions: 0, campaignDailyImpressions: 0 })): SelectionDecision | null {
  const eligible = candidates.filter((campaign) => {
    if (campaign.status !== "approved" || campaign.spent >= campaign.budget || !campaign.placements.includes(request.placementId) || campaign.screeningStatus !== "verified") return false;
    if (campaign.allowedCategories.length && !campaign.allowedCategories.includes(request.category)) return false;
    if (campaign.allowedDomains.length && !campaign.allowedDomains.includes(request.publisherDomain)) return false;
    if (new Date(campaign.startAt).getTime() > now.getTime()) return false;
    if (campaign.endAt && new Date(campaign.endAt).getTime() < now.getTime()) return false;
    if (!deliveryAllowed(campaign.deliveryRules, contextForCampaign(campaign), now)) return false;
    return true;
  });
  if (!eligible.length) return null;
  const scored = eligible.map((campaign) => { const relevance = request.context?.toLowerCase().includes(campaign.objective.toLowerCase().split(" ")[0]) ? 18 : 8; const quality = 14; const pacing = Math.max(0, 16 - Math.round((campaign.spent / campaign.budget) * 16)); const bid = Math.min(40, campaign.bid * 8); const delivery = campaign.deliveryRules ? "delivery rules passed" : "standard delivery"; return { campaign, score: Number((relevance + quality + pacing + bid).toFixed(2)), reasons: [`bid ${campaign.bid.toFixed(2)}`, `context ${relevance >= 18 ? "matched" : "adjacent"}`, `pacing ${pacing}/16`, "approved + screened + contextual", delivery] }; });
  scored.sort((a, b) => b.score - a.score || a.campaign.id.localeCompare(b.campaign.id));
  return scored[0] ?? null;
}
export function toPublicAd(decision: SelectionDecision, request: AdRequest, now = new Date()): PublicAd { const campaign = decision.campaign; const expiresAt = new Date(now.getTime() + 5 * 60_000).toISOString(); return { requestId: request.requestId, campaignId: campaign.id, creativeId: `creative_${campaign.id}`, tokenSymbol: campaign.tokenSymbol, headline: campaign.name, description: campaign.description, destination: `https://memereach.example/redirect/${campaign.id}`, sponsor: `${campaign.tokenName} community`, label: "Sponsored", placementToken: issuePlacementToken({ campaignId: campaign.id, placementId: request.placementId, requestId: request.requestId, expiresAt: new Date(expiresAt).getTime() }), clickUrl: `/api/events/click?campaignId=${campaign.id}&requestId=${request.requestId}`, expiresAt }; }
export function isReplaySafe(eventId: string, seen: Set<string>) { if (!eventId || seen.has(eventId)) return false; seen.add(eventId); return true; }
