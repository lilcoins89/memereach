import { beforeEach, describe, expect, it } from "vitest";
import { clearScreeningCache, heliusSolanaAdapter, isValidMintAddress } from "@/lib/solana/adapter";

const mint = "So11111111111111111111111111111111111111112";
describe("mainnet live-mode adapter", () => {
  beforeEach(() => { clearScreeningCache(); delete process.env.HELIUS_API_KEY; });
  it("keeps malformed mainnet mints out of the provider path", () => expect(isValidMintAddress("mainnet-token")).toBe(false));
  it("returns an explicit unavailable state when live credentials are absent", async () => { const result = await heliusSolanaAdapter.screenMint(mint, { force: true }); expect(result.status).toBe("unavailable"); expect(result.riskScore).toBeNull(); expect(result.reasons[0]).toMatch(/No security conclusion/); });
});
