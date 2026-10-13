import { NextResponse } from "next/server";
import { z } from "zod";
import { getAnalyticsSnapshot } from "@/lib/db/analytics";
import { canReadOrganization, getOrganizationId } from "@/lib/security/guards";
export async function GET(request: Request) { const organizationId = getOrganizationId(request); if (!canReadOrganization(organizationId)) return NextResponse.json({ error: "Organization access denied", code: "ORG_FORBIDDEN" }, { status: 403 }); const range = z.enum(["7d", "30d", "90d"]).catch("30d").parse(new URL(request.url).searchParams.get("range") || "30d"); return NextResponse.json({ analytics: getAnalyticsSnapshot(organizationId, range) }, { headers: { "cache-control": "no-store" } }); }
