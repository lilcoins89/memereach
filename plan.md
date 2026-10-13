# MemeReach implementation plan

## Scope and operating mode

MemeReach is an off-chain advertising exchange for Solana meme coin projects, token communities, publishers, and platform operators. Phase 1 is implemented end to end in a credential-free development mode so the preview remains usable without pretending external infrastructure is live. The server adapter activates Helius-backed screening only when `HELIUS_API_KEY` is present; the database adapter uses the same normalized entities and migrations in both modes.

The MVP does not deploy or call an advertising smart contract, write campaign configuration on-chain, submit transactions, store payment cards or wallet keys, or require wallet connection for browsing and drafting. Manual funding, billing ledger entries, moderation, ad selection, publisher inventory, and analytics are off-chain.

## Architecture

- **Next.js 16 App Router + TypeScript** for SSR pages, authenticated-style dashboard views, and server route handlers.
- **React + Tailwind CSS 4** for the dark SaaS interface. CSS variables define the visual system so the product is legible even when utility classes are not available.
- **Server-side adapters** in `lib/solana` and `lib/db` keep Helius and persistence behind stable interfaces.
- **Zod schemas** validate campaign, screening, ad-request, and event payloads at the server boundary.
- **Demo store** provides deterministic seeded organizations, campaigns, inventory, metrics, ledger entries, and screening observations. Production deployment can replace it with Supabase/PostgreSQL or the managed database using the supplied SQL migration and the same entity boundaries.
- **Idempotency and replay protection** are implemented in the event service using in-memory keys in demo mode; production should back these keys with Redis/DB unique constraints.
- **Publisher SDK** in `sdk/memereach.js` uses signed short-lived placement tokens from a server endpoint, renders Sponsored labels, and safely no-ops when inventory is unavailable.

## Project structure

```text
app/                      App Router pages and server route handlers
components/               Navigation, metric cards, charts, campaign preview, UI primitives
lib/solana/               SolanaDataAdapter contract, Helius adapter, risk scoring, cache
lib/engine/               Deterministic ad selection and event validation
lib/db/                   Normalized demo store and database abstractions
migrations/               Off-chain schema with constraints and indexes
db/                       Additional seed/reference SQL
sdk/                      Publisher integration script
 tests/                   Vitest unit tests for screening, events, engine, and budgets
public/                   Route manifest and gateway documents
```

## Core workflows

1. Advertiser opens the dashboard, starts a campaign wizard, submits a mint address, sees a screening snapshot, chooses objective/creative/targeting/placement/budget, and sends the draft to moderation.
2. Server validates the mint format and screening input. With credentials it calls Helius SDK `createHelius({ apiKey })` and `getAsset({ id })`; without credentials it returns a clearly marked unavailable-data result with deterministic demo evidence.
3. Admin reviews queued campaigns and risk evidence, then approves or rejects. Only approved campaigns are eligible for ad selection.
4. Publisher inventory is registered and can be tested through sandbox ad requests. The selection engine filters by schedule, status, placement, category, budget, and risk policy, then ranks candidates with a documented score.
5. Publisher event endpoints validate placement tokens, deduplicate impression/click/conversion event IDs, and append billable events only after eligibility checks. Demo analytics are seeded and labeled.
6. Manual funding requests feed an immutable ledger. Historical entries are never edited; corrections use compensating entries. No on-chain payment is implied.

## External integration decisions

- **Helius SDK 3.2.0**: server-only token metadata/account lookup boundary. It is ESM-first and uses `@solana/kit`; it never runs in browser code.
- **Helius CLI 1.0.1**: declared as a developer tool only. It is not imported by request handlers and is documented for local/deployment support.
- **Solana protocol repository**: source/reference only for cluster, mint account, and token-program behavior. MemeReach does not implement a validator or protocol fork.
- **Solana Web3.js 3.0.2**: isolated optional integration dependency for future wallet-adapter and transaction utilities. The MVP does not submit transactions, so no Web3.js code is executed in normal campaign operations.

## Design system

- **Design movement**: editorial control-room minimalism with a crypto-native nocturnal palette; the page should feel like a market operations desk, not a casino.
- **Core principles**: evidence over hype; dense but calm information hierarchy; visible system status; reversible, auditable actions.
- **Color philosophy**: near-black charcoal gives long-session focus; electric violet marks product actions and intelligence; acid green is reserved for verified/healthy delivery states; amber and coral flag review or risk without sensationalism.
- **Layout paradigm**: a persistent rail plus wide canvas with asymmetric data bands. High-signal metrics sit beside a narrative activity feed; tables are treated as operational surfaces, not generic cards.
- **Signature elements**: violet edge-light on active navigation, a lime “signal” dot for evidence-backed states, and a thin graph-paper grid texture behind hero/control-room sections.
- **Interaction philosophy**: every action communicates its state; previews use progressive disclosure; destructive or high-impact actions are explicit and never hidden behind optimistic UI.
- **Animation**: 180–240ms ease-out for navigation and panel reveals; no looping distractions; subtle pulse only on live ingestion/status dots; respect `prefers-reduced-motion`.
- **Typography**: Geist Sans / system sans for UI, Geist Mono / ui-monospace for IDs, balances, timestamps, and event keys. Use compact uppercase labels sparingly for control-room metadata.
- **Brand essence**: measurable distribution for the Solana projects that need attention without giving up trust. Personality: precise, sharp, grounded.
- **Brand voice**: concise, evidence-led, crypto-literate. Example lines: “Put the right project in the right feed.” and “Screen first. Serve with receipts.”
- **Wordmark & logo**: “MemeReach” in a tight wordmark paired with a signal-beacon mark: three violet bars converging on a lime dot, representing reach constrained by evidence.
- **Signature brand color**: `#A78BFA` signal violet.

## Deployment and validation workflow

1. Install pinned dependencies with pnpm 10 and commit `pnpm-lock.yaml`.
2. Run TypeScript diagnostics, `pnpm lint`, `pnpm test`, and `pnpm build`.
3. Start the app on port 3000, verify `/`, `/manus-routes.json`, and API health behavior.
4. Run the deterministic tests for malformed mints, unavailable/rate-limited RPC, stale metadata, incomplete holder coverage, duplicate events, forged clicks, budget reservation/release, and organization isolation.
5. Create the private GitHub repository through the managed WebDev GitHub confirmation flow, push `main`, and confirm the checkpoint SHA.

## Operational boundaries

Operational in this MVP: dashboard UI, campaign wizard state, server validation routes, deterministic screening and ad selection, seeded analytics, moderation queue presentation, funding/ledger presentation, publisher inventory presentation, publisher SDK source, migrations, and automated tests.

Credential-dependent: live Helius enrichment, managed database persistence, authentication provider sessions, real asset storage, production queue/Redis, signed publisher token service, and real email/MFA.

Simulated/development-only: seeded metrics, demo organizations, demo funding balance, sandbox delivery events, and any data response when Helius credentials are absent. The UI labels these states explicitly.
