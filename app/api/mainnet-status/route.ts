import { NextResponse } from "next/server";
import { DEMO_MINT } from "@/lib/db/store";
import { heliusSolanaAdapter, isValidMintAddress } from "@/lib/solana/adapter";

const cache = new Map<string, { expiresAt: number; value: Record<string, unknown> }>();
const CACHE_MS = 15_000;

async function rpcCall(method: string, params: unknown[]) {
  const rpcUrl = process.env.SOLANA_RPC_URL || (process.env.HELIUS_API_KEY ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}` : "https://api.mainnet-beta.solana.com");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6500);
  try {
    const response = await fetch(rpcUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }), signal: controller.signal, cache: "no-store" });
    if (!response.ok) throw new Error(`RPC HTTP ${response.status}`);
    const payload = await response.json() as { result?: unknown; error?: { message?: string } };
    if (payload.error) throw new Error(payload.error.message || "RPC request failed");
    return payload.result;
  } finally { clearTimeout(timer); }
}

export async function GET(request: Request) {
  const mint = new URL(request.url).searchParams.get("mint") || DEMO_MINT;
  if (!isValidMintAddress(mint)) return NextResponse.json({ error: "Invalid Solana mint address", code: "INVALID_MINT" }, { status: 400 });
  const cached = cache.get(mint);
  if (cached && cached.expiresAt > Date.now()) return NextResponse.json(cached.value, { headers: { "cache-control": "private, max-age=15" } });
  const observedAt = new Date().toISOString();
  try {
    const [slot, blockTime, token] = await Promise.all([rpcCall("getSlot", [{ commitment: "confirmed" }]), rpcCall("getBlockTime", [await rpcCall("getSlot", [{ commitment: "confirmed" }])]), heliusSolanaAdapter.screenMint(mint, { force: true })]);
    const value = { live: true, cluster: "mainnet-beta", provider: process.env.HELIUS_API_KEY ? "helius-sdk + helius-rpc" : "public-solana-rpc + helius-sdk-unavailable", slot: typeof slot === "number" ? slot : null, blockTime: typeof blockTime === "number" ? new Date(blockTime * 1000).toISOString() : null, observedAt, token: { mint: token.mint, name: token.tokenName, symbol: token.tokenSymbol, status: token.status, riskScore: token.riskScore, dataCompleteness: token.dataCompleteness, cachedUntil: token.cachedUntil } };
    cache.set(mint, { expiresAt: Date.now() + CACHE_MS, value });
    return NextResponse.json(value, { headers: { "cache-control": "private, max-age=15" } });
  } catch (error) {
    const value = { live: false, cluster: "mainnet-beta", provider: process.env.HELIUS_API_KEY ? "helius-sdk/rpc failed" : "credentials not configured", slot: null, blockTime: null, observedAt, token: { mint, name: null, symbol: null, status: "unavailable", riskScore: null, dataCompleteness: 0, cachedUntil: null }, error: error instanceof Error ? error.message : "Mainnet provider unavailable" };
    return NextResponse.json(value, { status: 503, headers: { "cache-control": "private, no-store" } });
  }
}
