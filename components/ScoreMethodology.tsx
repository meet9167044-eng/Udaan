"use client";

import { useState } from "react";

const signals = [
  {
    key: "bills",
    label: "Utility Bill Consistency",
    weight: 20,
    color: "#22c55e",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    meaning: "Electricity, water, broadband paid on time — signals financial discipline without a bureau score.",
    howMeasured: "Payment regularity over last 6 months",
  },
  {
    key: "upi",
    label: "UPI Transaction Behavior",
    weight: 20,
    color: "#3b96f2",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M12 18h.01" />
      </svg>
    ),
    meaning: "UPI inflows, merchant payments, and velocity reveal real cash-flow patterns invisible to bureau systems.",
    howMeasured: "Transaction count, velocity, merchant diversity",
  },
  {
    key: "cashflow",
    label: "Cash Flow Stability",
    weight: 20,
    color: "#f59e0b",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18" />
        <path d="M7 16l4-8 4 5 5-9" />
      </svg>
    ),
    meaning: "Stable monthly income is the strongest repayment predictor — even more than credit history for informal workers.",
    howMeasured: "Income variance over 6 months, spike detection",
  },
  {
    key: "savings",
    label: "Savings Consistency",
    weight: 15,
    color: "#a78bfa",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    meaning: "Even ₹500/month in savings shows planning behavior and ability to absorb financial shocks.",
    howMeasured: "Average balance, savings rate, consistency score",
  },
  {
    key: "location",
    label: "GST / Location Stability",
    weight: 10,
    color: "#06b6d4",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14,2 14,8 20,8" />
      </svg>
    ),
    meaning: "Regular GST filing and stable residential location reduces lender fraud risk significantly for MSMEs.",
    howMeasured: "GST compliance rate, location change frequency",
  },
  {
    key: "quiz",
    label: "Psychometric Readiness",
    weight: 15,
    color: "#f97316",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    meaning: "Behavioral assessment captures financial risk attitude and discipline — proven effective for thin-file borrowers.",
    howMeasured: "10-minute behavioral quiz, risk attitude score",
  },
];

const scoreBands = [
  { min: 800, max: 1000, label: "Very Low Risk",  color: "#22c55e", loan: "₹1,00,000+", badge: "🟢" },
  { min: 700, max: 799,  label: "Low Risk",        color: "#86efac", loan: "₹50,000",    badge: "🟩" },
  { min: 600, max: 699,  label: "Medium Risk",     color: "#f59e0b", loan: "₹15,000",    badge: "🟡" },
  { min: 500, max: 599,  label: "High Risk",        color: "#ef4444", loan: "₹5,000",     badge: "🔴" },
  { min: 0,   max: 499,  label: "Not Eligible",     color: "#6b7280", loan: "—",           badge: "⚫" },
];

export default function ScoreMethodology({ compact = false }: { compact?: boolean }) {
  const [expanded, setExpanded] = useState(!compact);
  const [activeSignal, setActiveSignal] = useState<string | null>(null);

  return (
    <div className="glass-card glass-card-static border border-primary-500/20 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-primary-500/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between relative z-10"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600/40 to-purple-600/40 border border-primary-500/30 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-primary-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="text-white font-semibold text-sm">Score Methodology</h3>
            <p className="text-slate-500 text-xs mt-0.5">How UdaanScore calculates your Trust Score</p>
          </div>
        </div>
        <div className={`text-slate-400 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="mt-6 relative z-10">
          {/* Narrative */}
          <div className="p-4 rounded-xl bg-primary-500/8 border border-primary-500/20 mb-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              <span className="text-white font-semibold">UdaanScore</span> estimates borrower trust using{" "}
              <span className="text-primary-300 font-medium">6 alternative behavioral signals</span>. Each signal is
              normalized and weighted, then run through a{" "}
              <span className="text-primary-300 font-medium">Alternative Data Model</span> trained on 6,000 synthetic
              borrower profiles — mapped to a <span className="text-white font-semibold">0–1000 scale</span>.
            </p>
            <p className="text-slate-400 text-xs mt-2">
              Higher score = lower risk + better loan access. Loan offers are tiered by score bands, not bureau history.
            </p>
          </div>

          {/* Signal Weights */}
          <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Signal Weights</h4>
          <div className="space-y-2 mb-6">
            {signals.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSignal(activeSignal === s.key ? null : s.key)}
                className="w-full text-left"
              >
                <div className="flex items-center gap-3 mb-1">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${s.color}18`, border: `1px solid ${s.color}35`, color: s.color }}
                  >
                    {s.icon}
                  </div>
                  <span className="text-slate-300 text-xs font-medium flex-1">{s.label}</span>
                  <span className="font-bold text-xs tabular-nums" style={{ color: s.color }}>{s.weight}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/8 ml-10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${s.weight * 5}%`, background: `linear-gradient(90deg, ${s.color}55, ${s.color})` }}
                  />
                </div>
                {activeSignal === s.key && (
                  <div className="mt-2 ml-10 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-slate-300 text-xs leading-relaxed">{s.meaning}</p>
                    <p className="text-slate-500 text-[10px] mt-1.5">📏 {s.howMeasured}</p>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Score Band Table */}
          <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Risk Band Thresholds</h4>
          <div className="space-y-2">
            {scoreBands.map((band) => (
              <div key={band.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-base">{band.badge}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: band.color }}>{band.label}</p>
                  <p className="text-slate-500 text-xs">{band.min}–{band.max} score</p>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm font-bold">{band.loan}</p>
                  <p className="text-slate-500 text-[10px]">max loan</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-slate-600 text-[10px] mt-4 leading-relaxed">
            Signal weights are learned from training data using an Alternative Data Model.
            This is a hackathon prototype — not a production credit model.
          </p>
        </div>
      )}
    </div>
  );
}
