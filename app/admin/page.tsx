"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { getAllBorrowers, type BorrowerProfile } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";

const dataSources = [
  { name: "UPI / NPCI Feed",      status: "Operational", latency: "12ms",  uptime: "99.9%", color: "#22c55e" },
  { name: "HDFC Bank API",        status: "Operational", latency: "34ms",  uptime: "99.7%", color: "#22c55e" },
  { name: "Jio Utility Billing",  status: "Degraded",    latency: "210ms", uptime: "96.2%", color: "#f59e0b" },
  { name: "GST Portal",           status: "Operational", latency: "28ms",  uptime: "98.8%", color: "#22c55e" },
  { name: "Geolocation Service",  status: "Operational", latency: "8ms",   uptime: "99.5%", color: "#22c55e" },
  { name: "Psychometric Engine",  status: "Operational", latency: "55ms",  uptime: "99.1%", color: "#22c55e" },
];

const recentAlerts = [
  { type: "consent", msg: "Sunita Verma revoked bank data consent",        time: "5 min ago",   severity: "medium" },
  { type: "fraud",   msg: "Fraud flag detected: Arjun Mehta — low UPI velocity", time: "23 min ago", severity: "high" },
  { type: "consent", msg: "Priya Patel granted all 6 data sources",        time: "1 hour ago",  severity: "info" },
  { type: "system",  msg: "Jio Utility Billing latency spike detected",    time: "2 hours ago", severity: "medium" },
  { type: "fraud",   msg: "Auto-approved: Raju Sharma (score 623)",        time: "3 hours ago", severity: "info" },
];

const severityConfig = {
  high:   { color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/20",    dot: "bg-red-400"    },
  medium: { color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/20",  dot: "bg-amber-400"  },
  info:   { color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/20",   dot: "bg-blue-400"   },
};

export default function AdminPage() {
  const { user } = useAuth();
  const [borrowers, setBorrowers] = useState<BorrowerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getAllBorrowers()
      .then((res) => {
        if (!active) return;
        setBorrowers(res.borrowers);
      })
      .catch(console.error)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const avgScore = Math.round(borrowers.reduce((sum, b) => sum + b.trust_score, 0) / Math.max(1, borrowers.length));
  const highRiskCount = borrowers.filter((b) => b.risk_band.includes("High") || b.risk_band === "Rejected").length;
  const avgLoanLimit = Math.round(borrowers.reduce((sum, b) => sum + b.loan_limit, 0) / Math.max(1, borrowers.length));
  const autoApproveCount = borrowers.filter((b) => b.trust_score >= 800).length;
  const totalLoanPool = borrowers.reduce((sum, b) => sum + b.loan_limit, 0);

  const distribution = [
    { label: "Very Low", count: borrowers.filter((b) => b.risk_band === "Very Low Risk").length, color: "#22c55e" },
    { label: "Low",      count: borrowers.filter((b) => b.risk_band === "Low Risk").length,       color: "#86efac" },
    { label: "Medium",   count: borrowers.filter((b) => b.risk_band === "Medium Risk").length,    color: "#f59e0b" },
    { label: "High",     count: borrowers.filter((b) => b.risk_band.includes("High")).length,     color: "#ef4444" },
  ];
  const maxDist = Math.max(...distribution.map((d) => d.count), 1);

  const kpiCards = [
    { label: "Total Borrowers",  value: loading ? "…" : String(borrowers.length),                    sub: "on platform",             color: "#3b96f2", icon: "👥" },
    { label: "Avg Trust Score",  value: loading ? "…" : String(avgScore),                            sub: "across all borrowers",    color: "#22c55e", icon: "📊" },
    { label: "High Risk",        value: loading ? "…" : String(highRiskCount),                       sub: "require review",          color: "#ef4444", icon: "⚠️" },
    { label: "Avg Loan Limit",   value: loading ? "…" : `₹${(avgLoanLimit / 1000).toFixed(0)}K`,    sub: "per borrower",            color: "#a78bfa", icon: "💰" },
    { label: "Total Loan Pool",  value: loading ? "…" : `₹${(totalLoanPool / 100000).toFixed(1)}L`, sub: "eligible capital",         color: "#f59e0b", icon: "🏦" },
    { label: "Auto-Approve",     value: loading ? "…" : String(autoApproveCount),                   sub: "score ≥ 800",             color: "#06b6d4", icon: "✅" },
  ];

  return (
    <AuthGuard requiredRole="admin">
      <div className="page-body" style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, #0f1a30 0%, #080c18 55%)" }}>
        <div className="page-container pt-8 md:pt-12">

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <p className="section-label">Admin Console</p>
              <h1 className="heading-page text-white mt-2 mb-4">Platform Oversight</h1>
              <p className="body-md text-slate-300">
                Monitor borrower health, consent activity, data source status, and fraud alerts from a single control panel.
              </p>
            </div>
            <div className="flex flex-col gap-3 items-end">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-300 text-right">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Signed in as</p>
                <p className="mt-2 text-base font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-slate-400">Role: Admin · Full Platform Access</p>
              </div>
              <div className="flex gap-2">
                <Link href="/lender" className="btn-outline text-xs py-2 px-4">Lender View</Link>
                <Link href="/dashboard" className="btn-primary text-xs py-2 px-4">Borrower View</Link>
              </div>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-10">
            {kpiCards.map((kpi) => (
              <div key={kpi.label} className="glass-card glass-card-static glass-card-compact">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xl">{kpi.icon}</span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${kpi.color}18`, color: kpi.color }}>Live</span>
                </div>
                <p className="font-display text-2xl xl:text-3xl font-bold tabular-nums" style={{ color: kpi.color }}>{kpi.value}</p>
                <p className="text-white font-medium text-xs mt-1">{kpi.label}</p>
                <p className="text-caption text-[10px] mt-0.5">{kpi.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">

            {/* Risk Distribution */}
            <div className="glass-card glass-card-static">
              <h2 className="heading-card text-white mb-6">Risk Distribution</h2>
              {loading ? (
                <div className="text-slate-400 text-sm">Loading…</div>
              ) : (
                <div className="space-y-4">
                  {distribution.map((d) => (
                    <div key={d.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-slate-300 text-sm font-medium">{d.label} Risk</span>
                        <span className="text-white font-bold text-sm tabular-nums">{d.count}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${(d.count / maxDist) * 100}%`, background: d.color }}
                        />
                      </div>
                    </div>
                  ))}
                  {!loading && (
                    <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      <p className="text-slate-400 text-xs">Top cities: {Array.from(new Set(borrowers.map(b => b.city))).slice(0, 3).join(", ")}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Data Source Health */}
            <div className="glass-card glass-card-static lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="heading-card text-white">Data Source Health</h2>
                <span className="inline-flex items-center gap-1.5 text-xs text-green-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  5 of 6 Operational
                </span>
              </div>
              <div className="space-y-3">
                {dataSources.map((src) => (
                  <div key={src.name} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: src.color }} />
                    <span className="text-white text-sm font-medium flex-1">{src.name}</span>
                    <span className="text-xs font-semibold" style={{ color: src.color }}>{src.status}</span>
                    <span className="text-slate-500 text-xs tabular-nums">{src.latency}</span>
                    <span className="text-slate-500 text-xs tabular-nums">{src.uptime}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Alerts Feed */}
          <div className="glass-card glass-card-static mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="heading-card text-white">Recent Alerts</h2>
              <span className="text-slate-400 text-xs">Consent revocations · Fraud flags · System events</span>
            </div>
            <div className="space-y-3">
              {recentAlerts.map((alert, i) => {
                const cfg = severityConfig[alert.severity as keyof typeof severityConfig];
                return (
                  <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                    <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${cfg.dot}`} />
                    <p className="text-slate-300 text-sm flex-1">{alert.msg}</p>
                    <span className="text-slate-500 text-xs shrink-0">{alert.time}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border} shrink-0`}>
                      {alert.type}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Score Methodology note for admin */}
          <div className="glass rounded-xl p-6 border border-primary-500/15 mb-10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Score Engine: Alternative Data Scoring Model</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  6 alternative signals: Utility Bills (20%), UPI Activity (20%), Cash Flow (20%), Savings (15%), Psychometric (15%), GST/Location (10%).
                  Trained on 6,000 synthetic profiles. Score maps 0–1000. Risk bands: 800+ Very Low · 700–799 Low · 600–699 Medium · 500–599 High · &lt;500 Rejected.
                </p>
                <div className="flex gap-3 mt-3">
                  <Link href="/simulator" className="text-primary-400 text-xs font-medium hover:text-primary-300 transition-colors">
                    Open Simulator →
                  </Link>
                  <Link href="/lender" className="text-primary-400 text-xs font-medium hover:text-primary-300 transition-colors">
                    Lender Reports →
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AuthGuard>
  );
}
