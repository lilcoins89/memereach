import { NextResponse } from "next/server";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { z } from "zod";
import { createFundingIntent } from "@/lib/db/wallet";
import { getCampaign } from "@/lib/db/store";
import { canReadOrganization, getOrganizationId } from "@/lib/security/guards";
import { createFundingBlockhash, parseWalletAddress, getSolanaCluster } from "@/lib/solana/wallet";

const schema = z.object({ walletAddress: z.string().min(32).max(44), amountSol: z.string().regex(/^\d+(\.\d{1,9})?$/), campaignId: z.string().min(3).max(80).nullable().optional() });
export async function POST(request: Request) {
  const organizationId = getOrganizationId(request);
  if (!canReadOrganization(organizationId)) return NextResponse.json({ error: "Organization access denied", code: "ORG_FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid wallet funding request", code: "INVALID_INPUT" }, { status: 400 });
  const recipient = process.env.MEMEREACH_TREASURY_PUBLIC_KEY;
  if (!recipient || !parseWalletAddress(recipient)) return NextResponse.json({ error: "Mainnet treasury is not configured", code: "TREASURY_NOT_CONFIGURED" }, { status: 503 });
  if (parsed.data.campaignId && !getCampaign(parsed.data.campaignId, organizationId)) return NextResponse.json({ error: "Campaign not found", code: "CAMPAIGN_NOT_FOUND" }, { status: 404 });
  const amountSol = Number(parsed.data.amountSol); const lamports = Math.round(amountSol * Number(LAMPORTS_PER_SOL));
  if (!Number.isSafeInteger(lamports) || lamports <= 0 || lamports > 5_000_000_000) return NextResponse.json({ error: "Funding amount must be between 0 and 5 SOL", code: "AMOUNT_OUT_OF_RANGE" }, { status: 400 });
  try { const blockhash = await createFundingBlockhash(); const intent = createFundingIntent({ organizationId, campaignId: parsed.data.campaignId || null, walletAddress: parseWalletAddress(parsed.data.walletAddress)!.toBase58(), recipient: parseWalletAddress(recipient)!.toBase58(), lamports, blockhash: blockhash.blockhash, lastValidBlockHeight: Number(blockhash.lastValidBlockHeight) }); return NextResponse.json({ intent, network: getSolanaCluster(), amountSol: parsed.data.amountSol }, { status: 201, headers: { "cache-control": "no-store" } }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create funding intent", code: "RPC_UNAVAILABLE" }, { status: 503 }); }
}
