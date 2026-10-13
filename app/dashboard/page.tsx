import { ArrowRight, CalendarDays, Download, Filter } from "lucide-react";
import { CampaignTable, ActivityFeed, MetricGrid, PerformanceChart } from "@/components/dashboard-widgets";
import { getDashboardMetrics, listCampaigns } from "@/lib/db/store";

export default function DashboardPage() {
  const metrics = getDashboardMetrics();
  const campaigns = listCampaigns();
  return <main className="page"><div className="hero-row"><div><div className="eyebrow">Advertiser workspace / overview</div><h1>Good morning, Moonshot.</h1><p>Keep your distribution loop measurable. Two campaigns are delivering; one draft is waiting on moderation.</p></div><div style={{ display: "flex", gap: 8 }}><button className="btn"><CalendarDays style={{ width: 14 }}/> Oct 01 — Oct 13</button><button className="btn"><Download style={{ width: 14 }}/> Export CSV</button></div></div><MetricGrid metrics={metrics}/><div className="grid-2"><PerformanceChart/><ActivityFeed/></div><div style={{ marginTop: 14 }}><CampaignTable campaigns={campaigns}/></div><div className="callout" style={{ marginTop: 14 }}><strong style={{ color: "var(--green)" }}>Demo data mode.</strong> Metrics are seeded for preview and tests. Connect the managed database, auth provider, and event worker before treating them as billable production data. <a href="/docs" style={{ color: "var(--text)", textDecoration: "underline" }}>Read the operations guide <ArrowRight style={{ width: 12, verticalAlign: "middle" }}/></a></div></main>;
}
