import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import type { WalletSnapshot } from "@/lib/types";

const TOKEN_PROGRAM_ADDRESS = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

export function getSolanaCluster() { return process.env.SOLANA_CLUSTER || "mainnet-beta"; }
export function getSolanaRpcUrl() {
  if (process.env.SOLANA_RPC_URL) return process.env.SOLANA_RPC_URL;
  if (process.env.HELIUS_API_KEY) return `https://mainnet.helius-rpc.com/?api-key=${encodeURIComponent(process.env.HELIUS_API_KEY)}`;
  const cluster = getSolanaCluster();
  return cluster === "devnet" ? clusterApiUrl("devnet") : cluster === "testnet" ? clusterApiUrl("testnet") : clusterApiUrl("mainnet-beta");
}
export function getSolanaConnection() { return new Connection(getSolanaRpcUrl(), "confirmed"); }
export function parseWalletAddress(value: string) { try { return new PublicKey(value); } catch { return null; } }

export async function getWalletSnapshot(walletAddress: string): Promise<WalletSnapshot> {
  const owner = parseWalletAddress(walletAddress);
  if (!owner) throw new Error("Invalid Solana wallet address");
  const connection = getSolanaConnection();
  const [lamportsValue, slot, accounts] = await Promise.all([connection.getBalance(owner, "confirmed"), connection.getSlot("confirmed"), connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ADDRESS }, "confirmed")]);
  const lamports = Number(lamportsValue); const tokenAccounts = accounts.value.map((account) => { const parsed = account.account.data as unknown as { parsed?: { info?: { mint?: string; tokenAmount?: { amount?: string; decimals?: number } } } }; const info = parsed.parsed?.info; return { mint: info?.mint || "unknown", amount: info?.tokenAmount?.amount || "0", decimals: info?.tokenAmount?.decimals || 0, symbol: null }; }).filter((account) => account.amount !== "0");
  return { address: owner.toBase58(), cluster: getSolanaCluster(), lamports, sol: lamports / Number(LAMPORTS_PER_SOL), slot: Number(slot), tokenAccounts };
}

export async function createFundingBlockhash() { const latest = await getSolanaConnection().getLatestBlockhash("confirmed"); return latest; }

export async function verifySystemTransfer(signature: string, expectedRecipient: string, expectedLamports: number, expectedSender: string) {
  const recipient = parseWalletAddress(expectedRecipient); const sender = parseWalletAddress(expectedSender);
  if (!recipient || !sender || !signature.trim()) return { ok: false as const, reason: "INVALID_ADDRESS_OR_SIGNATURE" };
  const tx = await getSolanaConnection().getParsedTransaction(signature.trim(), { commitment: "confirmed", maxSupportedTransactionVersion: 0 });
  if (!tx || tx.meta?.err) return { ok: false as const, reason: "TRANSACTION_NOT_CONFIRMED" };
  const instructions = tx.transaction.message.instructions as unknown as Array<{ program?: string; parsed?: { type?: string; info?: { source?: string; destination?: string; lamports?: number } } }>;
  const transfer = instructions.find((instruction) => instruction.program === "system" && instruction.parsed?.type === "transfer" && instruction.parsed.info?.destination === recipient.toBase58() && instruction.parsed.info?.source === sender.toBase58() && Number(instruction.parsed.info?.lamports || 0) >= expectedLamports);
  if (!transfer) return { ok: false as const, reason: "TRANSFER_DETAILS_MISMATCH" };
  return { ok: true as const, slot: tx.slot, blockTime: tx.blockTime, lamports: Number(transfer.parsed?.info?.lamports || 0), signature: signature.trim() };
}
