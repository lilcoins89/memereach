import { NextResponse } from "next/server";
import { z } from "zod";
import { approveFunding, getFundingRequest, requestFunding } from "@/lib/db/finance";
import { canReadOrganization, getOrganizationId } from "@/lib/security/guards";

const schema = z.object({ amountCents: z.number().int().positive().max(100_000_000), reference: z.string().trim().min(3).max(120), idempotencyKey: z.string().trim().min(8).max(120) });
export async function POST(request: Request) {
  const organizationId = getOrganizationId(request);
  if (!canReadOrganization(organizationId)) return NextResponse.json({ error: "Organization access denied" }, { status: 403 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid funding request", code: "INVALID_INPUT" }, { status: 400 });
  return NextResponse.json({ request: requestFunding({ ...parsed.data, organizationId }) }, { status: 201 });
}
export async function PUT(request: Request) {
  const role = request.headers.get("x-memereach-role");
  if (role !== "platform-admin" && role !== "administrator") return NextResponse.json({ error: "Administrator authorization required" }, { status: 403 });
  const parsed = z.object({ idempotencyKey: z.string().min(8), reason: z.string().min(5) }).safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid approval", code: "INVALID_INPUT" }, { status: 400 });
  try { return NextResponse.json(approveFunding(parsed.data.idempotencyKey, parsed.data.reason)); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Approval failed" }, { status: 409 }); }
}
export async function GET(request: Request) { const key = new URL(request.url).searchParams.get("idempotencyKey"); return key && getFundingRequest(key) ? NextResponse.json({ request: getFundingRequest(key) }) : NextResponse.json({ error: "Not found" }, { status: 404 }); }
