"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bell, BookOpen, CircleDollarSign, FilePlus2, Globe2, Headphones, LayoutDashboard, Library, Moon, Radar, Search, Settings2, Sparkles, Target, Users, WalletCards } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/campaigns/new", label: "Campaigns", icon: FilePlus2 },
  { href: "/campaigns/new", label: "Create Campaign", icon: Sparkles },
  { href: "/token-screening", label: "Token Intelligence", icon: Radar },
  { href: "/creative-library", label: "Creative Library", icon: Library },
  { href: "/audiences", label: "Audiences", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/billing", label: "Billing", icon: CircleDollarSign },
  { href: "/support", label: "Support", icon: Headphones },
];
const publisherNav = [
  { href: "/publishers", label: "Publisher Marketplace", icon: Globe2 },
  { href: "/inventory", label: "My Inventory", icon: WalletCards },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path === "/") return <>{children}</>;
  const active = (href: string) => path === href || (href === "/campaigns/new" && path.startsWith("/campaigns"));
  return <div className="app-frame"><aside className="app-rail"><Link href="/" className="brand"><i className="brand-mark"><span/><span/><span/></i><div className="brand-word">Meme<span>Reach</span><small>Solana advertising exchange</small></div></Link><div className="rail-label">Menu</div><nav className="nav-stack">{nav.map(({ href, label, icon: Icon }) => <Link key={label} href={href} className={`nav-item ${active(href) ? "active" : ""}`}><Icon/><span>{label}</span></Link>)}</nav><div className="rail-label publisher-label">Publisher</div><nav className="nav-stack">{publisherNav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`nav-item ${active(href) ? "active" : ""}`}><Icon/><span>{label}</span></Link>)}</nav><div className="rail-bottom"><div className="rail-promo"><div className="rail-promo-icon"><BarChart3 style={{ width: 16 }}/></div><strong>Powering Solana<br/>Meme Coin Growth</strong><p>Real reach. Real people.<br/>Real results.</p><span>↗</span></div><div className="org-chip"><div className="avatar">H</div><div><strong>Henry</strong><span>Advertiser</span></div><Settings2 style={{ width: 14, marginLeft: "auto", color: "#6d7386" }}/></div></div></aside><div className="app-main"><header className="topbar"><div className="top-search"><Search style={{ width: 17 }}/><span>Search campaigns, tokens, publishers...</span><kbd>⌘ K</kbd></div><div className="top-actions"><button className="icon-btn"><Bell style={{ width: 17 }}/><i/></button><div className="balance-chip"><WalletCards style={{ width: 17, color: "var(--green)" }}/><span><small>Available Balance</small><b>$12,450.00</b></span><button className="balance-add">+</button></div><div className="user-chip"><span className="user-avatar">H</span><span><b>Henry</b><small>Advertiser</small></span><span className="user-chevron">⌄</span></div><button className="icon-btn"><Moon style={{ width: 17 }}/></button></div></header>{children}</div></div>;
}
