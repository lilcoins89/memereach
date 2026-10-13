import { CalendarDays, ChevronDown, Download } from "lucide-react";
import { DashboardMetrics, PerformanceOverview, CampaignStatusCard, TopTokensCard, TopPublishersCard, RecentCampaignsCard, RecentActivityCard, QuickActionsCard, ReachPromoCard } from "@/components/demo-dashboard";
import { LiveMainnetPanel } from "@/components/live-mainnet-panel";
import { getDashboardMetrics, listCampaigns } from "@/lib/db/store";

export default function DashboardPage() {
  const metrics = getDashboardMetrics();
  const campaigns = listCampaigns();
  return <main className="page reference-page"><div className="reference-welcome"><div><h1>Welcome back, <span>Henry</span> <small>👋</small></h1><p>Here&apos;s what&apos;s happening with your Solana meme coin campaigns.</p></div><div className="reference-toolbar"><button className="btn reference-date"><CalendarDays style={{ width: 15 }}/> Last 30 days <ChevronDown style={{ width: 14 }}/></button><button className="btn"><Download style={{ width: 14 }}/> Export</button></div></div><LiveMainnetPanel/><DashboardMetrics metrics={metrics}/><PerformanceOverview/><div className="reference-card-grid"><CampaignStatusCard/><TopTokensCard/><TopPublishersCard/><RecentCampaignsCard campaigns={campaigns}/></div><div className="reference-bottom-grid"><RecentActivityCard/><QuickActionsCard/><ReachPromoCard/></div><div className="demo-strip"><strong>Demo workspace.</strong> Campaign, billing, publisher, and analytics records remain seeded until the managed database and event worker are connected. Mainnet mode refreshes network/token observations without writing campaign data on-chain.</div></main>;
}
