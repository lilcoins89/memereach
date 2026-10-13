import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, Radar, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return <main className="public-frame">
    <nav className="public-nav"><Link href="/" className="brand"><i className="brand-mark"><span/><span/><span/></i><div className="brand-word">MemeReach<small>signal with receipts</small></div></Link><div className="top-actions"><Link href="/docs" className="btn btn-ghost">Docs</Link><Link href="/dashboard" className="btn btn-primary">Open console <ArrowRight style={{ width: 14 }}/></Link></div></nav>
    <section className="hero-public"><div><div className="eyebrow">Solana-native media buying</div><h1>Reach the <em>right feeds.</em><br/>Keep the receipts.</h1><p>MemeReach is an off-chain advertising exchange for meme coin creators, crypto communities, and independent publishers. Screen projects, buy measurable distribution, and keep every decision auditable.</p><div className="hero-actions"><Link href="/campaigns/new" className="btn btn-primary">Draft a campaign <ArrowRight style={{ width: 14 }}/></Link><Link href="/publishers" className="btn">Explore publisher inventory</Link></div><div className="tag-row" style={{ marginTop: 24 }}><span className="tag selected">No on-chain campaign contract</span><span className="tag">Manual funding first</span><span className="tag">Contextual by default</span></div></div><div className="terminal"><div className="terminal-top"><i/><i/><i/><span style={{ marginLeft: "auto", color: "#5f6577", font: "10px var(--font-mono)" }}>screening / live view</span></div><div className="terminal-body"><pre><span className="purple">$ memereach screen</span> MARC

<span className="green">✓</span> mint account        present
<span className="green">✓</span> token program       Token Program
<span className="green">✓</span> authorities         revoked
<span style={{color:"#f6c86e"}}>~</span> holder coverage     78% / incomplete
<span style={{color:"#f6c86e"}}>~</span> market data         unavailable

risk score             <span className="purple">28 / 100</span>
evidence quality       medium
cache expires          29m 41s

<span className="green">→</span> review stays human. delivery stays off-chain.</pre></div></div></section>
    <section className="public-section"><div className="eyebrow">The operating system for crypto distribution</div><h2 className="section-title">A campaign desk built for evidence.</h2><div className="feature-grid"><div className="feature"><Radar style={{ color: "var(--violet)" }}/><h3>Screen before you serve</h3><p>Helius-backed metadata and account observations, explicit timestamps, missing-data warnings, and a risk score that never pretends to be a safety guarantee.</p></div><div className="feature"><BarChart3 style={{ color: "var(--green)" }}/><h3>Measure the whole path</h3><p>Validated impressions, clicks, landing visits, and conversions flow into a compact analytics surface with clear demo and production states.</p></div><div className="feature"><ShieldCheck style={{ color: "var(--amber)" }}/><h3>Keep control in the ledger</h3><p>Manual funding, atomic budget reservations, moderation, and append-only off-chain accounting. No wallet connection is needed to start drafting.</p></div></div></section>
    <section className="public-section" style={{ borderTop: "1px solid var(--line)" }}><div className="grid-2"><div><div className="eyebrow">Built for both sides of the feed</div><h2 className="section-title" style={{ fontSize: 32, marginTop: 10 }}>One approved campaign.<br/>Many trusted surfaces.</h2><p className="muted" style={{ maxWidth: 540, fontSize: 13, lineHeight: 1.7 }}>Advertisers get a guided workflow from mint submission to moderation. Publishers get registered inventory, sandbox testing, and a lightweight SDK that fails safely when no eligible ad exists.</p></div><div className="signal-card"><h3><CheckCircle2 style={{ width: 14, verticalAlign: "middle", color: "var(--green)" }}/> Current release boundaries</h3><p>Live in this MVP: campaign operations, token screening adapter, moderation queue, seeded analytics, publisher inventory, and SQL migrations. Credential-dependent: Helius enrichment, managed persistence, auth, signed placement tokens, and production event workers.</p></div></div></section>
    <footer className="footer"><span>© 2026 MemeReach. Sponsored distribution, not investment advice.</span><span><Link href="/policies">Policies</Link> · <Link href="/docs">Integration docs</Link></span></footer>
  </main>;
}
