import { NextResponse } from "next/server";
import { z } from "zod";
import { getRewardSummary, requestRewardClaim } from "@/lib/db/wallet";

export async function GET(request: Request) {
  const address = new URL(request.url).searchParams.get("address");
  if (!address) return NextResponse.json({ error: "Wallet address is required", code: "INVALID_INPUT" }, { status: 400 });
  try { return NextResponse.json({ rewards: getRewardSummary(address) }, { headers: { "cache-control": "no-store" } }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Rewards unavailable", code: "REWARDS_UNAVAILABLE" }, { status: 422 }); }
}

export async function POST(request: Request) {
  const parsed = z.object({ walletAddress: z.string().min(32).max(44), units: z.number().finite().positive().max(1_000_000_000) }).safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid reward claim", code: "INVALID_INPUT" }, { status: 400 });
  try { const result = requestRewardClaim(parsed.data.walletAddress, parsed.data.units); if (!result.claim) return NextResponse.json(result, { status: 503 }); return NextResponse.json(result, { status: 202 }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Reward claim rejected", code: "CLAIM_REJECTED" }, { status: 409 }); }
}
