import { NextResponse } from "next/server";
import { z } from "zod";
import { confirmFundingIntent, getFundingIntent, findFundingBySignature } from "@/lib/db/wallet";
import { verifySystemTransfer } from "@/lib/solana/wallet";

const schema = z.object({ intentId: z.string().min(6).max(80), signature: z.string().min(40).max(120) });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid funding confirmation", code: "INVALID_INPUT" }, { status: 400 });
  const intent = getFundingIntent(parsed.data.intentId);
  if (!intent) return NextResponse.json({ error: "Funding intent not found", code: "INTENT_NOT_FOUND" }, { status: 404 });
  const duplicate = findFundingBySignature(parsed.data.signature);
  if (duplicate && duplicate.id !== intent.id) return NextResponse.json({ error: "Transaction signature has already been reconciled", code: "DUPLICATE_SIGNATURE" }, { status: 409 });
  try {
    const verified = await verifySystemTransfer(parsed.data.signature, intent.recipient, intent.lamports, intent.walletAddress);
    if (!verified.ok) return NextResponse.json({ error: "Mainnet transfer could not be verified", code: verified.reason, status: intent.status }, { status: 409 });
    return NextResponse.json({ intent: confirmFundingIntent(intent.id, verified.signature), verification: verified }, { status: 200 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "RPC verification unavailable", code: "RPC_UNAVAILABLE" }, { status: 503 }); }
}
