import { beforeEach, describe, expect, it } from "vitest";
import { clearDeliveryState, deliveryAllowed, getDeliveryContext, recordImpression } from "@/lib/engine/delivery-rules";
import { selectCampaign } from "@/lib/engine/ad-engine";
import type { AdRequest, Campaign } from "@/lib/types";

const now = new Date("2026-10-13T14:00:00.000Z");
const campaign: Campaign = { id: "cmp_cap", organizationId: "org-demo", name: "Cap test", tokenName: "Test", tokenSymbol: "TST", mint: "So11111111111111111111111111111111111111112", objective: "Token awareness", status: "approved", budget: 100, spent: 1, bid: 1, pricingModel: "CPM", impressions: 1, clicks: 0, landingVisits: 0, createdAt: "", updatedAt: "", startAt: "2026-01-01T00:00:00.000Z", endAt: null, riskScore: 20, screeningStatus: "verified", placements: ["plc_test"], allowedCategories: [], allowedDomains: [], description: "A sufficiently descriptive test campaign.", deliveryRules: { frequencyCapPerHour: 2, dailyImpressionCap: 3, allowedHoursUtc: [14] } };
const request: AdRequest = { placementId: "plc_test", publisherDomain: "example.com", category: "Solana ecosystem", requestId: "req_cap_123", viewerKey: "publisher-viewer-1" };

describe("Revive-inspired delivery rules", () => {
  beforeEach(() => clearDeliveryState());
  it("filters a campaign outside its UTC daypart", () => expect(selectCampaign(request, [campaign], new Date("2026-10-13T15:00:00.000Z"))).toBeNull());
  it("enforces per-viewer hourly frequency caps", () => { recordImpression(campaign.id, request.viewerKey!, now); recordImpression(campaign.id, request.viewerKey!, now); expect(selectCampaign(request, [campaign], now, () => getDeliveryContext(campaign.id, request.viewerKey!, now))).toBeNull(); });
  it("enforces campaign daily caps while allowing another viewer until the cap is reached", () => { recordImpression(campaign.id, "viewer-a", now); recordImpression(campaign.id, "viewer-b", now); recordImpression(campaign.id, "viewer-c", now); expect(selectCampaign({ ...request, viewerKey: "viewer-d" }, [campaign], now, () => getDeliveryContext(campaign.id, "viewer-d", now))).toBeNull(); });
});
