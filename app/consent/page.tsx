"use client";

import ConsentCard from "@/components/ConsentCard";

/* ── Data sources ────────────────────────────────────────── */
const dataSources = [
  {
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
    source: "HDFC Bank",
    description: "Bank account statements, transactions",
    status: "active" as const,
    lastUpdated: "2 hours ago",
    dataPoints: ["Balance", "Transactions", "EMI status", "Savings avg."],
  },
  {
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.86 19.86 0 01.01 1.19 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v3z"/></svg>,
    source: "Jio Telecom",
    description: "Bill payment history, recharge patterns",
    status: "active" as const,
    lastUpdated: "1 day ago",
    dataPoints: ["Bill payments", "Plan history", "Usage patterns"],
  },
  {
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>,
    source: "GST Portal",
    description: "Business income, GST filings",
    status: "paused" as const,
    lastUpdated: "2 weeks ago",
    dataPoints: ["GST returns", "Turnover", "Tax compliance"],
  },
  {
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
    source: "Income Tax Dept.",
    description: "ITR filings, income declarations",
    status: "active" as const,
    lastUpdated: "3 days ago",
    dataPoints: ["ITR status", "Income history", "TDS records"],
  },
  {
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    source: "CIBIL Bureau",
    description: "Credit history, loan accounts",
    status: "active" as const,
    lastUpdated: "Today",
    dataPoints: ["Credit score", "Loan history", "Inquiries", "Repayment"],
  },
  {
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    source: "UPI / NPCI",
    description: "UPI transaction patterns",
    status: "revoked" as const,
    lastUpdated: "1 month ago",
    dataPoints: ["P2P transfers", "Merchant payments"],
  },
];

/* ── Audit log ───────────────────────────────────────────── */
const auditLog = [
  { action: "Data Accessed",   source: "HDFC Bank",       by: "UdaanScore",  time: "Today, 10:30 AM",  type: "read"   },
  { action: "Consent Granted", source: "CIBIL Bureau",    by: "You",         time: "Yesterday, 3:14 PM", type: "grant"  },
  { action: "Data Accessed",   source: "Jio Telecom",     by: "HDFC Bank",   time: "3 days ago",        type: "read"   },
  { action: "Consent Paused",  source: "GST Portal",      by: "You",         time: "2 weeks ago",       type: "pause"  },
  { action: "Consent Revoked", source: "UPI / NPCI",      by: "You",         time: "1 month ago",       type: "revoke" },
];

const typeConfig = {
  read:   { color: "text-blue-400",   bg: "bg-blue-400/10",   label: "Read"    },
  grant:  { color: "text-green-400",  bg: "bg-green-400/10",  label: "Granted" },
  pause:  { color: "text-yellow-400", bg: "bg-yellow-400/10", label: "Paused"  },
  revoke: { color: "text-red-400",    bg: "bg-red-400/10",    label: "Revoked" },
};

export default function ConsentVaultPage() {
  const activeCount = dataSources.filter((d) => d.status === "active").length;

  return (
    <div className="page-body" style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, #12102a 0%, #080c18 55%)" }}>
      <div className="page-container pt-8 md:pt-12">

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8 mb-12">
          <div className="max-w-lg">
            <p className="section-label">Consent Vault</p>
            <h1 className="heading-page text-white mt-2 mb-4">
              Your Data, <span className="gradient-text">Your Rules</span>
            </h1>
            <p className="body-md max-w-lg">
              You control exactly who can access your financial data. Toggle permissions anytime with full audit transparency.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-4 shrink-0">
            {[
              { label: "Connected",  value: activeCount,                       color: "text-green-400" },
              { label: "Paused",     value: dataSources.filter(d => d.status === "paused").length,  color: "text-yellow-400" },
              { label: "Revoked",    value: dataSources.filter(d => d.status === "revoked").length, color: "text-red-400"   },
            ].map((s) => (
              <div key={s.label} className="glass-card glass-card-static glass-card-compact text-center min-w-[88px]">
                <p className={`font-display text-2xl font-semibold tracking-tight ${s.color}`}>{s.value}</p>
                <p className="text-caption mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Security badges ──────────────────────────────── */}
        <div className="flex flex-wrap gap-3 mb-12">
          {[
            { icon: "🔒", label: "256-bit AES Encrypted" },
            { icon: "🛡",  label: "RBI DPDP Compliant" },
            { icon: "✓",  label: "ISO 27001 Certified" },
            { icon: "👁",  label: "Zero Data Selling" },
          ].map((badge) => (
            <div key={badge.label} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full glass border border-white/10 text-sm">
              <span>{badge.icon}</span>
              <span className="text-slate-300 font-medium text-xs">{badge.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">

          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="heading-card text-white text-lg">Connected Data Sources</h2>
              <button id="consent-add-source" className="btn-primary text-xs py-2 px-4">
                + Add Source
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
              {dataSources.map((source) => (
                <ConsentCard key={source.source} {...source} />
              ))}
            </div>
          </div>

          {/* ── Right: Audit log + Privacy info ─────────── */}
          <div className="stack-xl">

            <div className="glass-card glass-card-static">
              <h2 className="heading-card text-white mb-6">Audit Log</h2>
              <div className="space-y-4">
                {auditLog.map((entry, i) => {
                  const cfg = typeConfig[entry.type as keyof typeof typeConfig];
                  return (
                    <div key={i} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
                              {cfg.label}
                            </span>
                            <span className="text-slate-300 text-xs truncate">{entry.source}</span>
                          </div>
                          <p className="text-slate-500 text-xs">{entry.action} by {entry.by}</p>
                        </div>
                        <span className="text-slate-500 text-xs shrink-0 text-right">{entry.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button id="audit-download" className="btn-outline text-xs w-full py-2 mt-4">
                ↓ Download Full Report
              </button>
            </div>

            {/* Data rights */}
            <div className="glass-card glass-card-static">
              <h2 className="heading-card text-white mb-6">Your Data Rights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: "👁", right: "Right to View",   desc: "See all data we hold about you anytime." },
                  { icon: "✏",  right: "Right to Correct", desc: "Fix inaccurate data in your profile." },
                  { icon: "🗑",  right: "Right to Delete",  desc: "Request permanent deletion of your data." },
                  { icon: "📦", right: "Right to Export",  desc: "Download all your data in JSON format." },
                ].map((r) => (
                  <div key={r.right} className="flex flex-col gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <span className="text-xl group-hover:scale-110 transition-transform">{r.icon}</span>
                      <svg className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{r.right}</p>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button id="data-rights-request" className="btn-primary text-sm w-full py-3 mt-6 shadow-[0_0_20px_rgba(37,120,230,0.15)]">
                Submit a Data Request
              </button>
            </div>

            {/* DPDP Notice */}
            <div className="glass rounded-xl p-5 border border-primary-500/15">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span className="text-primary-400 text-xs font-semibold">DPDP Act 2023</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                UdaanScore is fully compliant with India&apos;s Digital Personal Data Protection Act.
                We never sell your data or share it without your explicit consent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
