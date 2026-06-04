"use client";

import { useState } from "react";
import ScoreGauge from "@/components/ScoreGauge";
import CreditFactorCard from "@/components/CreditFactorCard";
import Link from "next/link";

const TRUST_SCORE = 742;

/* ── Trust factors (alternate data signals) ─────────────── */
const trustFactors = [
  {
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
    label: "Utility Bill Consistency",
    value: "98% on-time",
    percentage: 92,
    trend: "up" as const,
    trendText: "+3%",
    color: "#22c55e",
  },
  {
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 5 5-9"/></svg>,
    label: "Cash Flow Stability",
    value: "Stable · 14 mo",
    percentage: 88,
    trend: "up" as const,
    trendText: "+5%",
    color: "#a78bfa",
  },
  {
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>,
    label: "UPI Transaction Behavior",
    value: "Regular · High velocity",
    percentage: 85,
    trend: "stable" as const,
    trendText: "0%",
    color: "#f59e0b",
  },
  {
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    label: "GST Compliance",
    value: "Compliant · No gaps",
    percentage: 90,
    trend: "up" as const,
    trendText: "OK",
    color: "#3b96f2",
  },
  {
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
    label: "Cash-flow Utilization",
    value: "28% of inflow",
    percentage: 72,
    trend: "up" as const,
    trendText: "+8%",
    color: "#06b6d4",
  },
];

const trustMetrics = [
  { label: "Confidence Score", value: "94%", sub: "Model certainty" },
  { label: "Risk Band", value: "Low", sub: "Stable profile", valueColor: "#22c55e" },
  { label: "Eligible Loan", value: "₹8.5L", sub: "Pre-underwritten" },
];

const monthlyTrend = [42, 55, 48, 62, 58, 74];

const aiInsights = [
  { type: "positive" as const, text: "Stable monthly inflows" },
  { type: "positive" as const, text: "Consistent utility payments" },
  { type: "negative" as const, text: "High spending spike detected" },
];

/* ── Loan Offers ─────────────────────────────────────────── */
const loanOffers = [
  { bank: "HDFC Bank", type: "Personal Loan", amount: "₹5,00,000", rate: "10.5%", emi: "₹10,747/mo", badge: "Best Rate", color: "#3b96f2" },
  { bank: "Axis Bank", type: "Home Loan", amount: "₹50,00,000", rate: "8.75%", emi: "₹49,624/mo", badge: "Recommended", color: "#8b5cf6" },
  { bank: "Bajaj Finance", type: "Business Loan", amount: "₹8,50,000", rate: "11.2%", emi: "₹18,420/mo", badge: "Trust Match", color: "#22c55e" },
];

/* ── Activity Feed ───────────────────────────────────────── */
const activities = [
  { icon: "↑", text: "Trust Score increased by 18 points", time: "2 hours ago", color: "text-green-400" },
  { icon: "⚡", text: "UPI velocity signal refreshed", time: "Yesterday", color: "text-blue-400" },
  { icon: "✓", text: "Utility payment recorded — consistency updated", time: "3 days ago", color: "text-green-400" },
  { icon: "🏦", text: "Eligible loan amount revised to ₹8.5L", time: "1 week ago", color: "text-yellow-400" },
];

const trustHealth = [
  { label: "Data freshness", value: "Live", color: "#22c55e" },
  { label: "Consent active", value: "4 sources", color: "#3b96f2" },
  { label: "Alternate signals", value: "12", color: "#8b5cf6" },
  { label: "Last model run", value: "2h ago", color: "#22c55e" },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "factors" | "offers">("overview");

  return (
    <div className="page-body" style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, #0f1a30 0%, #080c18 55%)" }}>
      <div className="page-container pt-8 md:pt-12">

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <p className="section-label">Trust Dashboard</p>
            <h1 className="heading-page text-white mt-1">Rahul Mehta</h1>
            <p className="text-caption mt-3">Last updated: Today, 10:30 AM · Auto-refresh in 23h</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/simulator" id="dashboard-simulate-btn" className="btn-outline text-sm !py-2.5 !px-4">
              Simulate Trust Score
            </Link>
            <Link href="/consent" id="dashboard-consent-btn" className="btn-primary text-sm !py-2.5 !px-4">
              Manage Consent
            </Link>
          </div>
        </div>

        <div className="flex gap-1 p-1.5 glass rounded-xl mb-12 w-fit">
          {(["overview", "factors", "offers"] as const).map((tab) => (
            <button
              key={tab}
              id={`dashboard-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? "bg-white/[0.08] text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">

          {/* Left: Trust Score Card */}
          <div className="lg:col-span-1 stack-xl">
            <div className="glass-card glass-card-static flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-10">
                <h2 className="heading-card text-white">Trust Score</h2>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-500/10 text-primary-300 border border-primary-500/30">
                  UdaanScore
                </span>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-primary-500/20 blur-[60px] rounded-full pointer-events-none" />
                <ScoreGauge score={TRUST_SCORE} maxScore={1000} minScore={0} size={240} />
              </div>

              <div className="mt-8 w-full glass rounded-xl p-4 flex items-center justify-between">
                <span className="text-caption">30-day change</span>
                <span className="text-green-400 font-semibold text-sm">+23 ↑</span>
              </div>

              <div className="mt-4 w-full grid grid-cols-3 gap-3 text-center">
                {trustMetrics.map((m) => (
                  <div key={m.label} className="glass rounded-xl p-3">
                    <p
                      className="text-white font-bold text-sm"
                      style={m.valueColor ? { color: m.valueColor } : undefined}
                    >
                      {m.value}
                    </p>
                    <p className="text-caption mt-1 leading-tight">{m.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 w-full glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-caption">Monthly trend</span>
                  <span className="text-green-400 font-semibold text-sm">+18 ↑</span>
                </div>
                <div className="flex items-end justify-between gap-1.5 h-10">
                  {monthlyTrend.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-gradient-to-t from-primary-700 to-primary-400 opacity-80"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="glass-card glass-card-static">
              <h2 className="heading-card text-white mb-6">Recent Activity</h2>
              <div className="space-y-5">
                {activities.map((a, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className={`text-sm mt-0.5 ${a.color}`}>{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 body-md !text-[0.875rem]">{a.text}</p>
                      <p className="text-caption mt-1">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Content Area */}
          <div className="lg:col-span-2 stack-xl">

            {activeTab === "overview" && (
              <div className="glass-card glass-card-static border border-primary-500/15">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                  <h2 className="heading-card text-white">AI Insights</h2>
                </div>
                <ul className="space-y-3">
                  {aiInsights.map((item) => (
                    <li key={item.text} className="flex items-start gap-3 text-sm p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <span
                        className={`font-bold shrink-0 ${
                          item.type === "positive" ? "text-green-400" : "text-amber-400"
                        }`}
                      >
                        {item.type === "positive" ? "↑" : "⚠"}
                      </span>
                      <span className="text-slate-300 font-medium">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Trust Factors */}
            {(activeTab === "overview" || activeTab === "factors") && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="heading-card text-white">Trust Factor Breakdown</h2>
                  <Link href="/journey" className="text-primary-400 text-sm font-medium hover:text-primary-300 transition-colors">
                    Improve →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
                  {trustFactors.map((f) => (
                    <CreditFactorCard key={f.label} {...f} />
                  ))}
                </div>
              </div>
            )}

            {/* Loan Offers */}
            {(activeTab === "overview" || activeTab === "offers") && (
              <div>
                <div className="flex items-center justify-between mb-6 gap-4">
                  <h2 className="heading-card text-white">Pre-Approved Offers</h2>
                  <span className="text-caption shrink-0">Based on your Trust Score</span>
                </div>
                <div className="space-y-5">
                  {loanOffers.map((offer) => (
                    <div key={offer.bank} className="glass-card glass-card-static flex flex-col sm:flex-row sm:items-center gap-6 relative overflow-hidden group hover:border-primary-500/30">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
                      
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-lg shadow-inner relative z-10"
                        style={{ background: `linear-gradient(135deg, ${offer.color}33, ${offer.color}11)`, border: `1px solid ${offer.color}44`, color: offer.color }}
                      >
                        {offer.bank.split(" ").map((w) => w[0]).join("")}
                      </div>

                      <div className="flex-1 relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-bold text-base">{offer.bank}</span>
                          <span
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                            style={{ background: `${offer.color}22`, color: offer.color }}
                          >
                            {offer.badge}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">{offer.type}</p>
                      </div>

                      <div className="flex items-center gap-6 text-right relative z-10">
                        <div>
                          <p className="text-white font-display font-bold text-lg">{offer.amount}</p>
                          <p className="text-slate-400 text-xs font-medium">@ {offer.rate}</p>
                        </div>
                        <div className="hidden sm:block">
                          <p className="text-white font-bold text-sm">{offer.emi}</p>
                          <p className="text-slate-400 text-xs font-medium">EMI</p>
                        </div>
                        <button
                          id={`apply-${offer.bank.replace(/\s+/g, "-").toLowerCase()}`}
                          className="btn-primary text-xs py-2.5 px-5 shrink-0 shadow-lg"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trust Health Summary */}
            {activeTab === "overview" && (
              <div className="glass-card glass-card-static">
                <h2 className="heading-card text-white mb-8">Trust Health Summary</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-5">
                  {trustHealth.map((item) => (
                    <div key={item.label} className="glass rounded-xl p-5 text-center">
                      <p className="font-semibold text-xl tracking-tight" style={{ color: item.color }}>{item.value}</p>
                      <p className="text-caption mt-2 leading-tight">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
