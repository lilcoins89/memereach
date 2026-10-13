import { describe, expect, it } from "vitest";
import { createCampaignWorkflow } from "@/lib/db/workflow";

describe("nested campaign workflow", () => {
  it("persists Campaign -> Ad Set -> Ad hierarchy", () => {
    const result = createCampaignWorkflow({ organizationId: "org-demo", name: "Workflow test", objective: "Token awareness", tokenName: "Test Token", tokenSymbol: "TEST", mint: "So11111111111111111111111111111111111111112", budget: 1000, bid: 1, pricingModel: "CPM", placements: ["plc_test"], description: "A sufficiently descriptive nested workflow test campaign.", startAt: "2026-10-15T00:00:00.000Z", endAt: null, riskScore: null, screeningStatus: "unavailable", adSets: [{ name: "Audience one", audience: { categories: ["Solana ecosystem"], domains: [], geoMarkets: ["Global"], contextualTerms: ["solana"] }, placements: ["plc_test"], budget: 500, bid: 1, pricingModel: "CPM", startAt: "2026-10-15T00:00:00.000Z", endAt: null, ads: [{ name: "Text ad", type: "token_text", headline: "Test headline", body: "Test body", assetUrl: null, destinationUrl: "https://example.com", tokenMint: "So11111111111111111111111111111111111111112", tokenSymbol: "TEST", disclosure: true }] }, { name: "Audience two", audience: { categories: ["Crypto education"], domains: [], geoMarkets: ["EU"], contextualTerms: ["token"] }, placements: ["plc_test"], budget: 500, bid: 1, pricingModel: "CPC", startAt: "2026-10-15T00:00:00.000Z", endAt: null, ads: [{ name: "Link ad", type: "website_link", headline: "Visit site", body: "Learn more", assetUrl: null, destinationUrl: "https://example.com", tokenMint: "So11111111111111111111111111111111111111112", tokenSymbol: "TEST", disclosure: true }] }] });
    expect(result.campaign.id).toMatch(/^cmp_/);
    expect(result.adSets).toHaveLength(2);
    expect(result.ads).toHaveLength(2);
    expect(result.ads.every((ad) => ad.disclosure)).toBe(true);
    expect(result.ads[0].adSetId).toBe(result.adSets[0].id);
  });
});
