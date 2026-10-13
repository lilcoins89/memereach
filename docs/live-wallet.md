# Live Mainnet wallet integration

MemeReach now supports wallet connection for the two product actions that genuinely need wallet ownership or blockchain payment: **campaign budget funding** and **token reward claims**. Browsing, campaign drafting, screening, moderation, and analytics remain wallet-optional.

## Funding flow

1. The user connects a browser Solana wallet such as Phantom.
2. MemeReach reads the wallet address and live SOL/token-account state through `/api/wallet/status` using server-side Solana RPC.
3. The browser requests `/api/wallet/funding-intent` with the wallet address, SOL amount, and optional campaign ID.
4. The server validates the organization, amount, campaign, treasury address, and Mainnet blockhash. The treasury public key and RPC credentials never enter browser code.
5. The browser constructs a normal System Program transfer and asks the wallet to sign it.
6. The browser sends only the signature to `/api/wallet/funding-confirm`.
7. The server reads the confirmed Mainnet transaction and requires an exact sender, recipient, and minimum lamport amount before marking the off-chain funding intent confirmed.
8. USD campaign credits remain an off-chain ledger/admin reconciliation responsibility. No campaign data is written on-chain.

## Rewards flow

Publisher reward balances and claims are represented by the off-chain reward ledger. A claim becomes available only when all of these server-only settings are configured:

- `MEMEREACH_REWARD_MINT`
- `MEMEREACH_REWARD_TREASURY_PUBLIC_KEY`
- `MEMEREACH_REWARD_PAYOUT_WEBHOOK_URL`

The payout worker behind the webhook must perform the actual SPL-token transfer using its own protected signer or custody service, then write the verified signature back to the reward claim. MemeReach does not accept or store private keys in environment variables, browser storage, or the database. Until the worker is configured, the UI explicitly reports `treasury_not_configured` instead of pretending a reward is payable.

## Required server configuration

```env
SOLANA_CLUSTER=mainnet-beta
SOLANA_RPC_URL=https://your-server-only-rpc.example
HELIUS_API_KEY=server-only-helius-key
MEMEREACH_TREASURY_PUBLIC_KEY=mainnet-treasury-address
MEMEREACH_REWARD_MINT=mainnet-reward-mint
MEMEREACH_REWARD_SYMBOL=MREACH
MEMEREACH_REWARD_TREASURY_PUBLIC_KEY=reward-treasury-address
MEMEREACH_REWARD_PAYOUT_WEBHOOK_URL=https://your-protected-payout-worker.example/claims
```

Never configure these as `NEXT_PUBLIC_*`. The browser only receives a public treasury address and a short-lived blockhash/intent. Seed phrases and private keys are never requested.
