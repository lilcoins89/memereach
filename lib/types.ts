export type CampaignStatus = "draft" | "pending_review" | "approved" | "rejected" | "suspended";
export type ScreeningStatus = "verified" | "unavailable" | "failed" | "stale";
export type RiskLevel = "low" | "medium" | "high" | "unknown";

export type Campaign = {
  id: string;
  organizationId: string;
  name: string;
  tokenName: string;
  tokenSymbol: string;
  mint: string;
  objective: string;
  status: CampaignStatus;
  budget: number;
  spent: number;
  bid: number;
  pricingModel: "CPC" | "CPM";
  impressions: number;
  clicks: number;
  landingVisits: number;
  createdAt: string;
  updatedAt: string;
  startAt: string;
  endAt: string | null;
  riskScore: number | null;
  screeningStatus: ScreeningStatus;
  placements: string[];
  allowedCategories: string[];
  allowedDomains: string[];
  description: string;
};

export type ScreeningObservation = { source: string; observedAt: string; signal: string; value: string; status: "observed" | "unavailable" | "heuristic"; explanation: string };
export type TokenScreening = { mint: string; cluster: string; status: ScreeningStatus; riskScore: number | null; riskLevel: RiskLevel; confidence: "high" | "medium" | "low" | "none"; screeningVersion: string; isStale: boolean; dataCompleteness: number; tokenProgram: string | null; tokenName: string | null; tokenSymbol: string | null; decimals: number | null; supply: string | null; authorities: { mint: string | null; freeze: string | null }; observations: ScreeningObservation[]; missingData: string[]; reasons: string[]; cachedUntil: string | null };
export type PublisherPlacement = { id: string; publisher: string; domain: string; category: string; format: string; dimensions: string; floor: string; status: "approved" | "pending" | "sandbox"; monthlyImpressions: number };
export type LedgerEntry = { id: string; organizationId: string; type: "funding_credit" | "budget_reservation" | "valid_spend" | "budget_release" | "refund" | "publisher_earning" | "payout" | "admin_adjustment"; amountCents: number; currency: "USD"; status: "posted" | "pending" | "reconciled"; reference: string; createdAt: string };
export type DashboardMetrics = { approvedFunding: number; availableBalance: number; reservedBudget: number; billableSpend: number; remainingBudget: number; activeCampaigns: number; pendingReviews: number; impressions: number; validClicks: number; ctr: number; averageCpc: number; eCpm: number; landingVisits: number; conversions: number };
export type AdRequest = { placementId: string; publisherDomain: string; category: string; context?: string; sandbox?: boolean; requestId: string };
export type PublicAd = { requestId: string; campaignId: string; creativeId: string; tokenSymbol: string; headline: string; description: string; destination: string; sponsor: string; label: "Sponsored"; clickUrl: string; placementToken: string; expiresAt: string };
