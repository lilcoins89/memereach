import { NextResponse } from "next/server";
import { getWalletSnapshot } from "@/lib/solana/wallet";

export async function GET(request: Request) {
  const address = new URL(request.url).searchParams.get("address");
  if (!address) return NextResponse.json({ error: "Wallet address is required", code: "INVALID_INPUT" }, { status: 400 });
  try { return NextResponse.json({ wallet: await getWalletSnapshot(address) }, { headers: { "cache-control": "no-store" } }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Wallet status unavailable", code: "WALLET_STATUS_UNAVAILABLE" }, { status: 422 }); }
}
