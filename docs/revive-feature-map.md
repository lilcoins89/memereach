# Revive Adserver feature map

MemeReach inspected the public [Revive Adserver repository](https://github.com/revive-adserver/revive-adserver) without installing Composer dependencies, running PHP, or adding Revive as a project dependency.

Revive is GPL-2.0-or-later. MemeReach does **not** copy Revive source code, PHP classes, plugins, database schema, or frontend assets. The implementation below is an independent TypeScript/SQL feature model based on the product behavior visible in the repository.

## Feature behavior adopted

| Revive concept | MemeReach implementation |
| --- | --- |
| Zones and linked campaigns/banners | Existing publisher placements and `campaign_placements` link campaigns to approved inventory. |
| Delivery limitations | `deliveryRules` supports per-viewer hourly frequency caps, campaign daily impression caps, and UTC allowed hours. |
| Campaign pacing | Existing deterministic selection score includes spend pacing; delivery rules now filter candidates before scoring. |
| Invocation and event tracking | Existing `/api/ad-request` and signed publisher events remain the integration boundary. Accepted impressions update off-chain delivery counters. |
| Campaign and zone statistics | Existing analytics and ledger remain the off-chain source of truth. |

## Security boundary

All limits are server-enforced. The optional `viewerKey` is a publisher-provided pseudonymous key and is never treated as wallet identity. Event ingestion uses the signed placement token and the server-retained request context; clients cannot raise their own caps.

The demo runtime uses in-memory counters. Production uses the migration in `migrations/002_delivery_rules.sql` with atomic database updates and retention/compaction jobs. No campaign data is written on-chain, no smart contract is added, and Revive is not installed.
