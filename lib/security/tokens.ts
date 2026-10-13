import { createHmac, timingSafeEqual } from "node:crypto";

const secret = () => process.env.MEMEREACH_PLACEMENT_TOKEN_SECRET || "memereach-demo-only-secret";
function encode(value: string) { return Buffer.from(value).toString("base64url"); }
function decode(value: string) { return Buffer.from(value, "base64url").toString("utf8"); }

export type PlacementClaims = { campaignId: string; placementId: string; requestId: string; expiresAt: number };
export function issuePlacementToken(claims: PlacementClaims) { const payload = encode(JSON.stringify(claims)); const signature = createHmac("sha256", secret()).update(payload).digest("base64url"); return `${payload}.${signature}`; }
export function verifyPlacementToken(token: string): PlacementClaims | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  try { if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null; const claims = JSON.parse(decode(payload)) as PlacementClaims; return claims.expiresAt > Date.now() ? claims : null; } catch { return null; }
}
