import { beforeEach, describe, expect, it } from "vitest";
import { createFundingIntent } from "@/lib/db/wallet";
import { getRewardSummary } from "@/lib/db/wallet";
import { getSolanaCluster, parseWalletAddress } from "@/lib/solana/wallet";

const wallet = "So11111111111111111111111111111111111111112";
describe("Mainnet wallet integration", () => {
  beforeEach(() => { delete process.env.MEMEREACH_REWARD_MINT; delete process.env.MEMEREACH_REWARD_TREASURY_PUBLIC_KEY; delete process.env.MEMEREACH_REWARD_PAYOUT_WEBHOOK_URL; });
  it("validates wallet addresses through Solana Web3.js", () => { expect(parseWalletAddress(wallet)?.toBase58()).toBe(wallet); expect(parseWalletAddress("not-a-wallet")).toBeNull(); expect(getSolanaCluster()).toBe("mainnet-beta"); });
  it("creates an idempotent-style funding intent without private key material", () => { const intent = createFundingIntent({ organizationId: "org-demo", campaignId: "cmp_aurora", walletAddress: wallet, recipient: wallet, lamports: 250_000_000, blockhash: "demo-blockhash", lastValidBlockHeight: 100 }); expect(intent.status).toBe("created"); expect(intent.signature).toBeNull(); expect(intent.lamports).toBe(250_000_000); });
  it("distinguishes unavailable reward treasury from a zero balance", () => { const summary = getRewardSummary(wallet); expect(summary.status).toBe("treasury_not_configured"); expect(summary.claimableUnits).toBe(0); expect(summary.rewardMint).toBeNull(); });
});
