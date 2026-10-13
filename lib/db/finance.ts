import { listLedger, DEMO_ORG_ID } from "@/lib/db/store";
import type { LedgerEntry } from "@/lib/types";

const fundingRequests = new Map<string, { id: string; organizationId: string; amountCents: number; reference: string; status: "pending" | "approved" | "rejected"; idempotencyKey: string }>();
const approvedKeys = new Set<string>();

export function requestFunding(input: { amountCents: number; reference: string; idempotencyKey: string; organizationId?: string }) {
  const existing = fundingRequests.get(input.idempotencyKey);
  if (existing) return existing;
  const request = { id: `fnd_${Math.random().toString(36).slice(2, 9)}`, organizationId: input.organizationId || DEMO_ORG_ID, amountCents: input.amountCents, reference: input.reference, status: "pending" as const, idempotencyKey: input.idempotencyKey };
  fundingRequests.set(input.idempotencyKey, request);
  return request;
}

export function approveFunding(idempotencyKey: string, reason: string) {
  if (!reason.trim()) throw new Error("approval reason required");
  if (approvedKeys.has(idempotencyKey)) return { duplicate: true, request: fundingRequests.get(idempotencyKey), ledger: listLedger() };
  const request = fundingRequests.get(idempotencyKey);
  if (!request) throw new Error("funding request not found");
  if (request.status !== "pending") throw new Error("funding request is not pending");
  request.status = "approved";
  approvedKeys.add(idempotencyKey);
  const ledger: LedgerEntry = { id: `led_${Math.random().toString(36).slice(2, 9)}`, organizationId: request.organizationId, type: "funding_credit", amountCents: request.amountCents, currency: "USD", status: "reconciled", reference: request.reference, createdAt: new Date().toISOString() };
  return { duplicate: false, request, ledger };
}

export function getFundingRequest(idempotencyKey: string) { return fundingRequests.get(idempotencyKey); }
