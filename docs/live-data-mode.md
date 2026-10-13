# Live data mode

MemeReach has a reversible **Demo / Mainnet** switch in the authenticated-style app header.

## Demo

Demo is the default. Dashboard campaign, billing, publisher, and analytics records use seeded in-memory data. This is safe for UI testing and does not require credentials.

## Mainnet

Select **Mainnet** in the header. The browser stores the preference locally and reloads the app; no code change or rebuild is required to return to Demo.

Mainnet requests are server-only:

- `/api/mainnet-status` fetches the current Solana `getSlot` and `getBlockTime` through `SOLANA_RPC_URL`, Helius RPC when `HELIUS_API_KEY` is available, or the public Solana mainnet RPC as a read-only fallback.
- The submitted mint is screened through the server-side Helius SDK adapter with `force: true` for a fresh observation.
- The response is cached for 15 seconds to avoid excessive provider traffic and exposes the cluster, slot, observation time, provider path, token status, risk score, completeness, and unavailable/error state.
- API keys and RPC URLs never reach the browser.

Set `HELIUS_API_KEY` and optionally `SOLANA_RPC_URL` in the server environment for the strongest live path. If neither is configured, network slot data may still use the public Solana RPC while token screening remains explicitly `unavailable`; it is never presented as a passed security check.

## Important boundary

Mainnet mode currently makes **network and token observations live**. Campaign configuration, moderation, billing, publisher inventory, and analytics remain off-chain demo data until the managed database, authentication, and event-worker integrations are connected. No campaign operation submits a blockchain transaction.
