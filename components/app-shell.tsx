"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, CircleDollarSign, FilePlus2, Globe2, LayoutDashboard, Radar, Settings2, ShieldCheck, Sparkles } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/campaigns/new", label: "Campaigns", icon: FilePlus2 },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/publishers", label: "Publisher network", icon: Globe2 },
  { href: "/billing", label: "Funding & billing", icon: CircleDollarSign },
];
const ops = [
  { href: "/token-screening", label: "Token intelligence", icon: Radar },
  { href: "/admin", label: "Admin console", icon: ShieldCheck },
  { href: "/docs", label: "Docs & help", icon: BookOpen },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isLanding = path === "/";
  if (isLanding) return <>{children}</>;
  return <div className="app-frame">
    <aside className="app-rail">
      <Link href="/" className="brand"><i className="brand-mark"><span/><span/><span/></i><div className="brand-word">MemeReach<small>signal with receipts</small></div></Link>
      <div className="rail-label">Workspace</div>
      <nav className="nav-stack">{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`nav-item ${path === href || (href === "/campaigns/new" && path.startsWith("/campaigns")) ? "active" : ""}`}><Icon/><span>{label}</span></Link>)}</nav>
      <div className="rail-label" style={{ marginTop: 28 }}>Operations</div>
      <nav className="nav-stack">{ops.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`nav-item ${path === href ? "active" : ""}`}><Icon/><span>{label}</span></Link>)}</nav>
      <div className="rail-bottom"><div className="org-chip"><div className="avatar">MR</div><div><strong>Moonshot Arcade</strong><span>Advertiser · owner</span></div><Settings2 style={{ width: 14, marginLeft: "auto", color: "#6d7386" }}/></div></div>
    </aside>
    <div className="app-main">
      <header className="topbar"><div className="crumb">Workspace / <b>{path === "/dashboard" ? "overview" : path.replace("/", "").replaceAll("/", " / ")}</b></div><div className="top-actions"><div className="mode-pill"><span className="signal-dot"/> Demo data mode</div><Link className="btn btn-primary" href="/campaigns/new"><Sparkles style={{ width: 14 }}/> New campaign</Link></div></header>
      {children}
    </div>
  </div>;
}
