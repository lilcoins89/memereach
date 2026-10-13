import { z } from "zod";

export const campaignSchema = z.object({
  name: z.string().trim().min(3).max(80),
  tokenName: z.string().trim().min(1).max(80),
  tokenSymbol: z.string().trim().min(1).max(12),
  mint: z.string().trim().min(32).max(44),
  objective: z.string().trim().min(3).max(60),
  budget: z.number().finite().positive().max(10_000_000),
  bid: z.number().finite().positive().max(1000),
  pricingModel: z.enum(["CPC", "CPM"]),
  placements: z.array(z.string().min(1)).min(1).max(20),
  description: z.string().trim().min(20).max(240),
});

export const screeningSchema = z.object({ mint: z.string().trim().min(1).max(64), force: z.boolean().optional() });
export const adRequestSchema = z.object({ placementId: z.string().min(1).max(80), publisherDomain: z.string().min(3).max(200), category: z.string().min(2).max(80), context: z.string().max(300).optional(), sandbox: z.boolean().optional(), requestId: z.string().min(8).max(120) });
export const eventSchema = z.object({ eventId: z.string().min(8).max(120), eventType: z.enum(["impression", "click", "conversion"]), campaignId: z.string().min(3).max(80), placementId: z.string().min(3).max(80), requestId: z.string().min(8).max(120), token: z.string().min(8).max(500) });

export function getOrganizationId(request: Request) { return request.headers.get("x-memereach-org") || "org-demo"; }
export function canReadOrganization(organizationId: string) { return organizationId === "org-demo"; }
