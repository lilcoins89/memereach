import { describe, expect, it } from "vitest";
import { getAdvertiserAccount, updateAdvertiserAccount } from "@/lib/db/account";
import { getAnalyticsSnapshot } from "@/lib/db/analytics";
import { listManagedPlacements, submitPublisherOnboarding } from "@/lib/db/publisher";

describe("business workflows", () => {
  it("updates an organization-scoped advertiser account", () => { const before = getAdvertiserAccount("org-demo")!; const updated = updateAdvertiserAccount("org-demo", { displayName: "Henry Labs" }); expect(updated?.displayName).toBe("Henry Labs"); expect(getAdvertiserAccount("wrong-org")).toBeNull(); updateAdvertiserAccount("org-demo", { displayName: before.displayName }); });
  it("submits a publisher and pending placement for moderation", () => { const result = submitPublisherOnboarding("org-demo", { name: "Test Publisher", website: "https://test-publisher.example", domain: "test-publisher.example", category: "Crypto education", placementName: "Homepage card", format: "Native card", dimensions: "Responsive", floor: "$1.20 CPM" }); expect(result.publisher.status).toBe("pending_review"); expect(result.placement.status).toBe("pending"); expect(listManagedPlacements().some((placement) => placement.id === result.placement.id)).toBe(true); });
  it("computes an analytics breakdown from campaigns", () => { const snapshot = getAnalyticsSnapshot("org-demo", "30d"); expect(snapshot.campaignCount).toBeGreaterThan(0); expect(snapshot.breakdown.length).toBe(snapshot.campaignCount); expect(snapshot.ctr).toBeGreaterThan(0); expect(snapshot.refreshedAt).toBeTruthy(); });
});
