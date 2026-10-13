import type { PublisherAccount, PublisherOnboarding, PublisherPlacement } from "@/lib/types";
import { DEMO_ORG_ID, listPlacements } from "@/lib/db/store";

let publishers: PublisherAccount[] = [{ id: "pub_signalwire", organizationId: DEMO_ORG_ID, name: "SignalWire", website: "https://signalwire.news", domain: "signalwire.news", category: "Solana ecosystem", ownerWallet: null, status: "approved", createdAt: "2026-08-20T00:00:00.000Z" }];
let submittedPlacements: PublisherPlacement[] = [];
export function listPublisherAccounts(organizationId = DEMO_ORG_ID) { return publishers.filter((publisher) => publisher.organizationId === organizationId); }
export function listManagedPlacements() { return [...listPlacements(), ...submittedPlacements]; }
export function submitPublisherOnboarding(organizationId: string, input: PublisherOnboarding) {
  const id = `pub_${Math.random().toString(36).slice(2, 9)}`; const publisher: PublisherAccount = { id, organizationId, name: input.name, website: input.website, domain: input.domain.toLowerCase(), category: input.category, ownerWallet: input.ownerWallet || null, status: "pending_review", createdAt: new Date().toISOString() }; publishers = [publisher, ...publishers];
  const placement: PublisherPlacement = { id: `plc_${Math.random().toString(36).slice(2, 9)}`, publisher: input.name, domain: input.domain.toLowerCase(), category: input.category, format: input.format, dimensions: input.dimensions, floor: input.floor, status: "pending", monthlyImpressions: 0 }; submittedPlacements = [placement, ...submittedPlacements];
  return { publisher, placement };
}
