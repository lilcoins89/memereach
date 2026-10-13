# MemeReach Solana / Helius integration report

**Inspection date:** 2026-10-13

## Repository observations

| Repository | Observed head / package | Runtime and guidance | MemeReach responsibility |
|---|---|---|---|
| [helius-sdk](https://github.com/helius-labs/helius-sdk) | `helius-sdk` 3.2.0; inspected commit `6e63a6bc7511acaa5959ab12563a31067e40b89b` | Node `>=20`; pnpm 10.26; ESM-first; peer on `@solana/kit` `^6.9.0`; v2+ migration replaces legacy Web3.js internals with Kit; `createHelius` is the client factory. | Server-only token/account inspection and metadata retrieval through `getAsset`; adapter boundary is prepared for token accounts and parsed events. |
| [helius-cli](https://github.com/helius-labs/helius-cli) | `helius-cli` 1.0.1; inspected commit `7f46ee93d39b86f2681e28c8a7e78c27635d0b7a` | Node package uses `@solana/kit` `^5.5.1`; global/local CLI; config and keypair tooling. | Developer/deployment support only. It is not imported or executed from ordinary browser requests. |
| [solana](https://github.com/solana-labs/solana) | Protocol source inspected at commit `7700cb3128c1f19820de67b81aa45d18f73d2ac0`; Cargo package version `2.0.0` | Rust protocol/validator source; README directs current validator work to Agave. | Reference for cluster/mint-account/token-program behavior. MemeReach does not implement a validator, fork, or custom on-chain program. |
| [solana-web3.js](https://github.com/solana-foundation/solana-web3.js) | `@solana/web3.js` package 3.0.2; inspected commit `efd679809f5725c9666a172c0b06eb6cbc1fba4b` | Node `>=20.18.0`; pnpm 10; v3+ is current development, legacy v1 is maintenance-only. | Isolated optional dependency for future wallet-adapter/transaction utilities. Not used to submit campaign operations because MVP operations are off-chain. |

## Compatibility decisions

1. Helius SDK 3.2.0 is kept behind `lib/solana/adapter.ts` and uses `createHelius` only in server code. The app does not import legacy `Helius` or assume `@solana/web3.js` v1 types.
2. Helius SDK's Kit peer dependency is pinned separately. The v3 Web3.js package is not mixed into the Helius adapter.
3. The Helius CLI is a `devDependency` and is documented as an operator tool; no request handler calls a CLI command.
4. The app uses a credential-free development adapter when `HELIUS_API_KEY` is missing. It returns `unavailable` observations, not a low-risk result, and the UI labels the result as demo/provider-unavailable.
5. Provider responses are cached with an explicit TTL and a timestamp. In production, the demo cache should move to Redis or a database table with a uniqueness key on `(mint, cluster, screening_version)`.

## Runtime and secret policy

- Node 20+ is required; the project pins `pnpm@10.26.0`.
- `HELIUS_API_KEY`, privileged RPC URLs, database DSNs, and signing secrets are server-only environment variables.
- The browser receives normalized screening results and short-lived public placement payloads only.
- No normal campaign operation requires a wallet or on-chain transaction.
- `helius-cli` is for local/deployment support and must never be exposed through an API route.

## Migration references

The Helius SDK migration guidance says v2+ is ESM-first, uses `createHelius`, prefers Kit primitives such as `address()`, and maps DAS calls to the root client (for example `helius.getAsset`). The latest changelog also notes that versioned transaction consumers should set `maxSupportedTransactionVersion: 1`; MemeReach does not send or decode campaign transactions in the MVP, so that path is intentionally not activated.
