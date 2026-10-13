import { address } from "@solana/kit";
import { createHelius } from "helius-sdk";
import type { ScreeningObservation, TokenScreening } from "@/lib/types";

export type SolanaDataAdapter = {
  screenMint(mint: string, options?: { force?: boolean }): Promise<TokenScreening>;
};

const CACHE_TTL_MS = 30 * 60 * 1000;
const cache = new Map<string, TokenScreening>();
const BASE58 = /^[1-9A-HJ-NP-Za-km-z]+$/;
const TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const TOKEN_2022_PROGRAM = "TokenzQdBNbLqP5VEhdkas6EPFLC1PHnU6D8vF8q9B";

export function isValidMintAddress(mint: string) {
  if (!mint || mint.length < 32 || mint.length > 44 || !BASE58.test(mint)) return false;
  try {
    const bytes = decodeBase58(mint);
    return bytes.length === 32;
  } catch {
    return false;
  }
}

function decodeBase58(value: string) {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let num = 0n;
  for (const char of value) {
    const index = alphabet.indexOf(char);
    if (index === -1) throw new Error("invalid base58 character");
    num = num * 58n + BigInt(index);
  }
  const bytes: number[] = [];
  while (num > 0n) { bytes.unshift(Number(num % 256n)); num /= 256n; }
  for (const char of value) { if (char === "1") bytes.unshift(0); else break; }
  return Uint8Array.from(bytes);
}

function observation(source: string, signal: string, value: string, status: ScreeningObservation["status"], explanation: string): ScreeningObservation {
  return { source, signal, value, status, explanation, observedAt: new Date().toISOString() };
}

function unavailableResult(mint: string, reason: string): TokenScreening {
  return {
    mint, cluster: process.env.SOLANA_CLUSTER || "mainnet-beta", status: "unavailable", riskScore: null, riskLevel: "unknown", confidence: "none", screeningVersion: "screen-v0.4", isStale: false, dataCompleteness: 0, tokenProgram: null, tokenName: null, tokenSymbol: null, decimals: null, supply: null, authorities: { mint: null, freeze: null },
    observations: [observation("Helius provider", "provider", "unavailable", "unavailable", reason)], missingData: ["Mint account", "Token metadata", "Authority state", "Holder concentration", "Liquidity and volume"], reasons: ["No security conclusion is made when provider data is unavailable."], cachedUntil: new Date(Date.now() + CACHE_TTL_MS).toISOString(),
  };
}

function failedResult(mint: string, error: unknown): TokenScreening {
  return { ...unavailableResult(mint, `Provider request failed: ${error instanceof Error ? error.message : "unknown error"}`), status: "failed", observations: [observation("Helius provider", "provider", "failed", "unavailable", "The external request failed. This is distinct from a failed token-security check.")] };
}

function toStringOrNull(value: unknown) { return typeof value === "string" ? value : null; }

export const heliusSolanaAdapter: SolanaDataAdapter = {
  async screenMint(mint, options = {}) {
    if (!isValidMintAddress(mint)) throw new Error("Invalid Solana mint address");
    const cached = cache.get(mint);
    if (cached && !options.force && cached.cachedUntil && new Date(cached.cachedUntil).getTime() > Date.now()) return { ...cached, isStale: false };

    const apiKey = process.env.HELIUS_API_KEY;
    if (!apiKey) {
      const result = unavailableResult(mint, "HELIUS_API_KEY is not configured in this environment.");
      cache.set(mint, result);
      return result;
    }

    try {
      const helius = createHelius({ apiKey });
      const asset = await helius.getAsset({ id: address(mint) });
      const raw = asset as unknown as Record<string, unknown>;
      const content = (raw.content ?? {}) as Record<string, unknown>;
      const metadata = (content.metadata ?? {}) as Record<string, unknown>;
      const ownership = (raw.ownership ?? {}) as Record<string, unknown>;
      const tokenInfo = (raw.token_info ?? {}) as Record<string, unknown>;
      const program = toStringOrNull(tokenInfo.token_program) ?? toStringOrNull(raw.interface) ?? null;
      const observed = new Date().toISOString();
      const observations: ScreeningObservation[] = [
        observation("Helius DAS getAsset", "mint_account", "present", "observed", "Helius returned an asset record for the submitted mint."),
        observation("Helius DAS getAsset", "metadata", toStringOrNull(metadata.name) ?? "unavailable", metadata.name ? "observed" : "unavailable", "Metadata is recorded as provider data and is not trusted as a project claim."),
        observation("Helius DAS getAsset", "token_program", program ?? "unavailable", program ? "observed" : "unavailable", "The provider-reported token interface/program is preserved for moderation review."),
      ];
      const missingData = [
        ...(program ? [] : ["Token program/interface"]),
        ...(tokenInfo.supply ? [] : ["Supply information"]),
        "Holder concentration coverage",
        "Market liquidity and volume",
      ];
      const score = missingData.length >= 3 ? 52 : 38;
      const result: TokenScreening = {
        mint, cluster: process.env.SOLANA_CLUSTER || "mainnet-beta", status: "verified", riskScore: score, riskLevel: score < 35 ? "low" : "medium", confidence: missingData.length > 2 ? "low" : "medium", screeningVersion: "screen-v0.4", isStale: false, dataCompleteness: Math.round(((4 - missingData.length) / 4) * 100), tokenProgram: program === TOKEN_PROGRAM || program === TOKEN_2022_PROGRAM ? program : program, tokenName: toStringOrNull(metadata.name), tokenSymbol: toStringOrNull(metadata.symbol), decimals: typeof tokenInfo.decimals === "number" ? tokenInfo.decimals : null, supply: tokenInfo.supply ? String(tokenInfo.supply) : null, authorities: { mint: null, freeze: null }, observations, missingData, reasons: ["Provider evidence is current", ...(missingData.length ? ["Missing signals reduce confidence"] : [])], cachedUntil: new Date(Date.now() + CACHE_TTL_MS).toISOString(),
      };
      cache.set(mint, result);
      return result;
    } catch (error) {
      const result = failedResult(mint, error);
      cache.set(mint, result);
      return result;
    }
  },
};

export function clearScreeningCache() { cache.clear(); }
export const SCREENING_CACHE_TTL_MS = CACHE_TTL_MS;
