import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdvertiserAccount, updateAdvertiserAccount } from "@/lib/db/account";
import { canReadOrganization, getOrganizationId } from "@/lib/security/guards";

const schema = z.object({ displayName: z.string().trim().min(2).max(80), legalName: z.string().trim().min(2).max(120), website: z.string().url().max(240), billingEmail: z.string().email().max(160), walletAddress: z.string().min(32).max(44).nullable() });
export async function GET(request: Request) { const organizationId = getOrganizationId(request); if (!canReadOrganization(organizationId)) return NextResponse.json({ error: "Organization access denied", code: "ORG_FORBIDDEN" }, { status: 403 }); return NextResponse.json({ account: getAdvertiserAccount(organizationId) }); }
export async function PUT(request: Request) { const organizationId = getOrganizationId(request); if (!canReadOrganization(organizationId)) return NextResponse.json({ error: "Organization access denied", code: "ORG_FORBIDDEN" }, { status: 403 }); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Invalid advertiser account", code: "INVALID_ACCOUNT", details: parsed.error.flatten() }, { status: 400 }); return NextResponse.json({ account: updateAdvertiserAccount(organizationId, parsed.data) }); }
