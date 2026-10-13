# MemeReach

MemeReach is an off-chain advertising exchange for Solana meme coin projects, token communities, and independent crypto publishers. It brings a campaign-management workflow similar to a modern ads console without creating an advertising smart contract, writing campaign state on-chain, or requiring wallet connection for browsing and drafting.

## What is implemented

The MVP includes a premium dark-mode landing page and console; advertiser dashboard with seeded/demo metrics; a seven-step campaign wizard; server-side mint validation and token screening adapter; approval-gated deterministic ad selection; signed short-lived publisher placement tokens; publisher inventory marketplace; publisher SDK with Sponsored labels, safe no-op behavior, and event reporting; moderation and funding API seams; manual funding/ledger model; analytics, token intelligence, admin, docs, policies, SQL migrations, and automated tests.

## Operational status

**Operational in this repository:** UI routes, server validation, Helius adapter boundary, credential-free provider fallback, screening cache, evidence timestamps, contextual ad selection, signed event validation, duplicate-event protection, demo funding idempotency, moderation authorization seam, seeded analytics, publisher SDK source, and SQL migration definitions.

**Requires credentials and production wiring:** `HELIUS_API_KEY` for live DAS enrichment; managed authentication and database persistence; Redis/queue for durable rate limiting and event workers; private asset storage; production MFA/roles; durable signed token/session storage; authorized payment or bank reconciliation; and publisher payout execution.

**Simulated/development-only:** seeded organizations, demo metrics, in-memory store, demo balances, and provider-unavailable screening when credentials are absent. The UI labels demo mode explicitly. Do not treat preview events or seeded numbers as billable production data.

## Quick start

```bash
cp .env.example .env.local
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`. To run checks:

```bash
pnpm typecheck
pnpm test
pnpm build
```

Node 20.18+ is required. The repository pins `pnpm@10.26.0`; if Corepack has a signature issue, install the same version with `npm install --global pnpm@10.26.0`.

## Integrations and secret handling

- **Helius SDK 3.2.0** is imported only in `lib/solana/adapter.ts`, which is used by server routes. It uses `createHelius` and `getAsset` from the current Kit-based ESM SDK. API keys are never prefixed with `NEXT_PUBLIC_`.
- **Helius CLI 1.0.1** is a developer/deployment support dependency. It is not executed from browser requests or campaign handlers.
- **Solana protocol** source is a technical reference for mint/account and token-program behavior. MemeReach does not build a custom validator or protocol fork.
- **Solana Web3.js 3.0.2** is isolated for future supported wallet-adapter or transaction utilities. MVP campaign operations do not submit transactions.

See [`docs/integration-report.md`](docs/integration-report.md) for inspected repository commits, runtime requirements, peer dependencies, and migration notes.

## Architecture notes

Campaign configuration, moderation, ad delivery, budgets, billing, publisher inventory, analytics, screening observations, and audit records are designed as off-chain database entities. `migrations/001_initial_schema.sql` uses integer cents for currency, bigint/numeric base units for blockchain amounts, unique idempotency keys, row-level ownership relationships, indexes, and an append-only ledger trigger. Replace `lib/db/store.ts` and `lib/db/finance.ts` with the managed database transaction layer before production.

The Solana adapter returns `unavailable` when a provider is not configured, and `failed` when a provider request errors. It records source and observation time for each signal, caches with explicit expiration, and marks incomplete data instead of treating missing observations as zero. A low risk score is never presented as a safety guarantee.

The publisher SDK is at [`sdk/memereach.js`](sdk/memereach.js). It requests inventory from `/api/ad-request`, renders a Sponsored label, reports signed impressions/clicks/conversions to `/api/events`, and silently leaves the publisher page intact when no eligible inventory exists. Use `sandbox: true` for non-billable integration testing.

## Deployment

The included `Dockerfile` builds a standalone Next.js server and listens on `PORT`/3000. Runtime secrets are injected at deployment, not during compilation. Configure the managed WebDev project with server capability, `Dockerfile`, and health path `/api/health`. Do not expose Helius keys, privileged RPC URLs, database service keys, signing secrets, private wallet keys, seed phrases, or payment-card data to browser code.

## Policy boundary

MemeReach is advertising infrastructure and measurement, not a token launchpad, trading venue, investment adviser, or guarantee of token performance. Campaigns must be clearly labeled Sponsored and may not use deceptive profit guarantees, fabricated endorsements, or impersonation. Contextual targeting is the default; the platform does not claim to know a visitor's wallet ownership, identity, holdings, or trading history without lawful basis and consent.

## Demo versus live Mainnet data

The app header includes a reversible **Demo / Mainnet** switch. Demo remains the default for safe UI testing. Mainnet mode refreshes server-side Solana slot/block time and Helius token screening every 20 seconds from `/api/mainnet-status`; it does not write campaigns on-chain. Set `HELIUS_API_KEY` and optionally `SOLANA_RPC_URL` in the server environment for live provider data. See [`docs/live-data-mode.md`](docs/live-data-mode.md) for the exact credential and fallback behavior.

## Revive-inspired delivery features

Revive Adserver was cloned only to `/tmp` for feature inspection; it is not installed, bundled, or added as a dependency. MemeReach independently implements the useful off-chain behavior—placement linking, delivery limitations, frequency caps, daily caps, UTC dayparting, signed invocation events, and delivery accounting—in TypeScript and SQL. See [`docs/revive-feature-map.md`](docs/revive-feature-map.md).

## Nested campaign workflow

The campaign studio now follows:

```text
Campaign (objective + token identity)
└── Ad Set (audience, contextual terms, geo markets, placements, budget, bid, schedule, delivery caps)
    └── Ad (token image, token video, token text, or website token link)
```

Submission is validated server-side at `/api/workflow`, token-screened through the Solana adapter, and persisted in the demo workflow store. Production persistence is represented by `migrations/003_campaign_adset_ad.sql`; moderation remains required before delivery.

## Campaign management

`/campaigns` now lists every advertiser campaign with status, screening state, spend, Ad Set count, and Ad count. `/campaigns/:id` provides the nested inspection view for audience categories, contextual terms, domains, placements, budget, schedule, and each creative. `GET /api/workflow` returns organization-scoped workflow snapshots for future database-backed management screens.

## Live Mainnet wallet funding and rewards

Billing now supports a browser Solana wallet connection, live Mainnet SOL/token-account status, server-generated funding intents, wallet-signed SOL transfers, and server-side sender/recipient/amount verification. Token rewards expose a safe claim queue and remain explicitly unavailable until a protected reward mint, treasury, and payout worker are configured. See [`docs/live-wallet.md`](docs/live-wallet.md).
