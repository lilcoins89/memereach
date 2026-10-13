import type { RewardClaim, RewardSummary, WalletFundingIntent } from "@/lib/types";
import { parseWalletAddress } from "@/lib/solana/wallet";

const fundingIntents = new Map<string, WalletFundingIntent>();
const claims = new Map<string, RewardClaim>();
const rewards = new Map<string, { earnedUnits: number; claimableUnits: number; claimedUnits: number }>();

export function createFundingIntent(input: Omit<WalletFundingIntent, "id" | "status" | "signature" | "createdAt" | "confirmedAt">) {
  if (!parseWalletAddress(input.walletAddress) || !parseWalletAddress(input.recipient)) throw new Error("Invalid wallet or treasury address");
  const intent: WalletFundingIntent = { ...input, id: `wfi_${Math.random().toString(36).slice(2, 10)}`, status: "created", signature: null, createdAt: new Date().toISOString(), confirmedAt: null };
  fundingIntents.set(intent.id, intent); return intent;
}
export function getFundingIntent(id: string) { return fundingIntents.get(id) || null; }
export function findFundingBySignature(signature: string) { return [...fundingIntents.values()].find((intent) => intent.signature === signature) || null; }
export function confirmFundingIntent(id: string, signature: string) { const current = fundingIntents.get(id); if (!current) throw new Error("Funding intent not found"); const updated = { ...current, status: "confirmed" as const, signature, confirmedAt: new Date().toISOString() }; fundingIntents.set(id, updated); return updated; }
export function rejectFundingIntent(id: string) { const current = fundingIntents.get(id); if (!current) throw new Error("Funding intent not found"); const updated = { ...current, status: "rejected" as const }; fundingIntents.set(id, updated); return updated; }

export function getRewardSummary(walletAddress: string): RewardSummary {
  if (!parseWalletAddress(walletAddress)) throw new Error("Invalid Solana wallet address");
  const stored = rewards.get(walletAddress) || { earnedUnits: 0, claimableUnits: 0, claimedUnits: 0 };
  const rewardMint = process.env.MEMEREACH_REWARD_MINT || null;
  return { walletAddress, rewardMint, symbol: process.env.MEMEREACH_REWARD_SYMBOL || "MREACH", ...stored, status: rewardMint && process.env.MEMEREACH_REWARD_TREASURY_PUBLIC_KEY && process.env.MEMEREACH_REWARD_PAYOUT_WEBHOOK_URL ? "available" : "treasury_not_configured" };
}
export function creditReward(walletAddress: string, units: number) { const current = rewards.get(walletAddress) || { earnedUnits: 0, claimableUnits: 0, claimedUnits: 0 }; rewards.set(walletAddress, { earnedUnits: current.earnedUnits + units, claimableUnits: current.claimableUnits + units, claimedUnits: current.claimedUnits }); return getRewardSummary(walletAddress); }
export function requestRewardClaim(walletAddress: string, units: number) { const summary = getRewardSummary(walletAddress); if (summary.status !== "available") return { claim: null, summary, reason: "REWARD_TREASURY_NOT_CONFIGURED" as const }; if (units <= 0 || units > summary.claimableUnits) throw new Error("Claim amount exceeds claimable rewards"); const claim: RewardClaim = { id: `rcl_${Math.random().toString(36).slice(2, 10)}`, walletAddress, units, status: "queued", signature: null, createdAt: new Date().toISOString() }; claims.set(claim.id, claim); return { claim, summary, reason: null };
}
