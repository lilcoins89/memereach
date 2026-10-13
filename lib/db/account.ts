import type { AdvertiserAccount } from "@/lib/types";
import { DEMO_ORG_ID } from "@/lib/db/store";

let account: AdvertiserAccount = { id: "acct_henry", organizationId: DEMO_ORG_ID, displayName: "Henry", legalName: "Moonshot Arcade Labs", website: "https://moonshot-arcade.example", billingEmail: "ops@moonshot-arcade.example", role: "owner", walletAddress: null, status: "active", createdAt: "2026-09-01T00:00:00.000Z" };
export function getAdvertiserAccount(organizationId = DEMO_ORG_ID) { return account.organizationId === organizationId ? account : null; }
export function updateAdvertiserAccount(organizationId: string, input: Partial<Pick<AdvertiserAccount, "displayName" | "legalName" | "website" | "billingEmail" | "walletAddress">>) { const current = getAdvertiserAccount(organizationId); if (!current) return null; account = { ...current, ...input }; return account; }
