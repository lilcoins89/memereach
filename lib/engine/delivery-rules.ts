import type { DeliveryRules } from "@/lib/types";

export type DeliveryContext = { viewerHourlyImpressions: number; campaignDailyImpressions: number };
const hourly = new Map<string, number>();
const daily = new Map<string, number>();
const requestViewers = new Map<string, string>();

function hourKey(campaignId: string, viewerKey: string, now: Date) { return `${campaignId}:${viewerKey}:${now.toISOString().slice(0, 13)}`; }
function dayKey(campaignId: string, now: Date) { return `${campaignId}:${now.toISOString().slice(0, 10)}`; }
export function getDeliveryContext(campaignId: string, viewerKey: string, now = new Date()): DeliveryContext { return { viewerHourlyImpressions: hourly.get(hourKey(campaignId, viewerKey, now)) || 0, campaignDailyImpressions: daily.get(dayKey(campaignId, now)) || 0 }; }
export function recordImpression(campaignId: string, viewerKey: string, now = new Date()) { const hour = hourKey(campaignId, viewerKey, now); const day = dayKey(campaignId, now); hourly.set(hour, (hourly.get(hour) || 0) + 1); daily.set(day, (daily.get(day) || 0) + 1); }
export function rememberRequestViewer(requestId: string, viewerKey: string) { requestViewers.set(requestId, viewerKey); }
export function getRequestViewer(requestId: string) { return requestViewers.get(requestId) || "anonymous"; }
export function clearDeliveryState() { hourly.clear(); daily.clear(); requestViewers.clear(); }
export function deliveryAllowed(rules: DeliveryRules | undefined, context: DeliveryContext, now = new Date()) {
  if (!rules) return true;
  if (rules.allowedHoursUtc?.length && !rules.allowedHoursUtc.includes(now.getUTCHours())) return false;
  if (rules.frequencyCapPerHour && context.viewerHourlyImpressions >= rules.frequencyCapPerHour) return false;
  if (rules.dailyImpressionCap && context.campaignDailyImpressions >= rules.dailyImpressionCap) return false;
  return true;
}
