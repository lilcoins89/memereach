import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock3, ExternalLink, Plus, ShieldAlert } from "lucide-react";
import type { Campaign, DashboardMetrics, LedgerEntry, PublisherPlacement } from "@/lib/types";

export function MetricGrid({ metrics }: { metrics: DashboardMetrics }) {
  const cards = [
    ["Approved funding", `$${metrics.approvedFunding.toLocaleString()}`, "+$8,400 this month", ""],
    ["Available balance", `$${metrics.availableBalance.toLocaleString()}`, "58.4% of funding", ""],
    ["Reserved budget", `$${metrics.reservedBudget.toLocaleString()}`, `${metrics.activeCampaigns} active campaigns`, ""],
    ["Billable spend", `$${metrics.billableSpend.toLocaleString()}`, "Within authorized budget", ""],
    ["Impressions", metrics.impressions.toLocaleString(), "+18.6% vs prior period", ""],
    ["Valid clicks", metrics.validClicks.toLocaleString(), `${metrics.ctr.toFixed(2)}% click-through rate`, ""],
    ["Average CPC", `$${metrics.averageCpc.toFixed(2)}`, "Validated publisher events", ""],
    ["eCPM", `$${metrics.eCpm.toFixed(2)}`, "Blended across placements", ""],
  ];
  return <div className="metric-grid">{cards.map(([label, value, foot]) => <div className="metric-card" key={label}><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-foot">{foot}</div></div>)}</div>;
}

export function PerformanceChart() {
  const bars = [48, 58, 42, 68, 62, 74, 69, 86, 72, 91, 83, 95, 88, 100];
  const clicks = [23, 27, 20, 35, 30, 41, 38, 49, 41, 53, 46, 59, 52, 65];
  return <div className="panel"><div className="panel-head"><div><div className="panel-title">Delivery performance</div><div className="panel-meta">Oct 01 — Oct 13, 2026 · all approved campaigns</div></div><div className="legend"><span><i/> Impressions</span><span><i className="green"/> Valid clicks</span></div></div><div className="chart-shell">{bars.map((bar, index) => <div className="bar-col" key={index}><div className="bar" style={{ height: `${bar}%` }}/><div className="bar secondary" style={{ height: `${clicks[index]}%` }}/><div className="bar-axis">{index % 2 === 0 ? `0${index + 1}` : ""}</div></div>)}</div></div>;
}

function statusLabel(status: Campaign["status"]) { return status === "pending_review" ? "In review" : status[0].toUpperCase() + status.slice(1); }
export function CampaignTable({ campaigns }: { campaigns: Campaign[] }) {
  return <div className="panel"><div className="panel-head"><div><div className="panel-title">Campaigns</div><div className="panel-meta">Delivery is limited to approved, screened campaigns.</div></div><Link className="btn btn-ghost" href="/campaigns/new"><Plus style={{ width: 14 }}/> Draft campaign</Link></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Campaign</th><th>Status</th><th>Delivery</th><th>Spend / budget</th><th>CTR</th><th/></tr></thead><tbody>{campaigns.map((campaign) => <tr key={campaign.id}><td><span className="campaign-name">{campaign.name}</span><span className="campaign-sub">${campaign.tokenSymbol} · {campaign.objective}</span></td><td><span className={`status ${campaign.status === "approved" ? "approved" : campaign.status === "pending_review" ? "review" : "suspended"}`}>{statusLabel(campaign.status)}</span></td><td><div style={{ minWidth: 112 }}><div className="progress"><span style={{ width: `${Math.min(100, (campaign.spent / campaign.budget) * 100)}%` }}/></div><span className="campaign-sub">{campaign.impressions.toLocaleString()} imp.</span></div></td><td><span className="mono">${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}</span></td><td><span className="mono">{campaign.impressions ? `${((campaign.clicks / campaign.impressions) * 100).toFixed(2)}%` : "—"}</span></td><td><Link href={`/analytics?campaign=${campaign.id}`}><ArrowUpRight style={{ width: 15, color: "#8c91a3" }}/></Link></td></tr>)}</tbody></table></div></div>;
}

export function ActivityFeed() {
  const items = [["Creative approved", "Aurora launch week cleared moderation with disclosure checks.", "12 min ago", "ok"], ["Screening refreshed", "MARC screening is current for 30 minutes.", "14 min ago", "ok"], ["Publisher event batch", "1,204 impressions reconciled from SignalWire.", "42 min ago", "ok"], ["Funding request pending", "$9,000 manual funding request needs review.", "1 hr ago", "warn"]];
  return <div className="panel"><div className="panel-head"><div className="panel-title">Activity</div><Link className="panel-meta" href="/admin">View audit log <ExternalLink style={{ width: 12, verticalAlign: "middle" }}/></Link></div><div className="panel-body activity">{items.map(([title, copy, time, kind]) => <div className="activity-item" key={title}><div className="activity-line" style={kind === "warn" ? { background: "var(--amber)", boxShadow: "0 0 0 4px rgba(246,200,110,.1)" } : undefined}/><div><strong>{title}</strong><p>{copy}</p><time>{time}</time></div></div>)}</div></div>;
}

export function LedgerTable({ entries }: { entries: LedgerEntry[] }) { return <div className="panel"><div className="panel-head"><div><div className="panel-title">Immutable ledger</div><div className="panel-meta">Append-only off-chain accounting · USD cents</div></div><Link href="/billing" className="panel-meta">Open billing <ArrowUpRight style={{ width: 12, verticalAlign: "middle" }}/></Link></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Entry</th><th>Type</th><th>Amount</th><th>Status</th><th>Posted</th></tr></thead><tbody>{entries.map((entry) => <tr key={entry.id}><td className="mono">{entry.reference}</td><td>{entry.type.replaceAll("_", " ")}</td><td className="mono" style={{ color: entry.amountCents > 0 ? "var(--green)" : "var(--soft)" }}>{entry.amountCents > 0 ? "+" : "−"}${Math.abs(entry.amountCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td><td><span className={`status ${entry.status === "reconciled" ? "approved" : "review"}`}>{entry.status}</span></td><td className="muted">{new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td></tr>)}</tbody></table></div></div>; }

export function PlacementTable({ placements }: { placements: PublisherPlacement[] }) { return <div className="panel"><div className="panel-head"><div><div className="panel-title">Registered inventory</div><div className="panel-meta">Only approved placements can serve live ads.</div></div><Link href="/publishers" className="btn btn-ghost">Manage network</Link></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Publisher</th><th>Category</th><th>Format</th><th>Floor</th><th>Status</th></tr></thead><tbody>{placements.map((placement) => <tr key={placement.id}><td><span className="campaign-name">{placement.publisher}</span><span className="campaign-sub">{placement.domain} · {placement.monthlyImpressions.toLocaleString()} monthly</span></td><td>{placement.category}</td><td>{placement.format}</td><td className="mono">{placement.floor}</td><td><span className={`status ${placement.status === "approved" ? "approved" : placement.status === "sandbox" ? "sandbox" : "review"}`}>{placement.status}</span></td></tr>)}</tbody></table></div></div>; }
