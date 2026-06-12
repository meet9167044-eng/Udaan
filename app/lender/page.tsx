"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Borrower {
  name: string;
  trust_score: number;
  risk_band: string;
  loan_limit: number;
  occupation: string;
  city: string;
}

interface FraudFlag {
  flag: string;
  detail: string;
  severity: "High" | "Medium" | "Low";
}

interface FraudResult {
  borrower_name: string;
  fraud_score: number;
  risk_level: string;
  badge_color: string;
  recommendation: string;
  flags_detected: number;
  flags: FraudFlag[];
  verified: boolean;
  auto_approved: boolean;
}

interface LenderReport {
  borrower_profile: { age_group: string; occupation_category: string; city_tier: string; monthly_income_range: string };
  trust_score: number;
  risk_band: string;
  confidence: string;
  recommended_loan_limit: number;
  fraud_assessment: { risk_level: string; verified: boolean; auto_approved: boolean; flags: number };
  score_strengths: { factor: string; detail: string }[];
  score_weaknesses: { factor: string; detail: string }[];
  score_breakdown: Record<string, string>;
  loans_repaid: number;
  current_nano_stage: number;
  lender_recommendation: string;
}

function getRiskColor(band: string) {
  if (band.includes("Very Low")) return "#22c55e";
  if (band.includes("Low")) return "#86efac";
  if (band.includes("Medium")) return "#f59e0b";
  if (band.includes("High")) return "#ef4444";
  return "#6b7280";
}

function getRiskBg(band: string) {
  if (band.includes("Very Low")) return "bg-green-400/10 text-green-400 border-green-400/30";
  if (band.includes("Low")) return "bg-emerald-400/10 text-emerald-400 border-emerald-400/30";
  if (band.includes("Medium")) return "bg-amber-400/10 text-amber-400 border-amber-400/30";
  if (band.includes("High")) return "bg-red-400/10 text-red-400 border-red-400/30";
  return "bg-gray-400/10 text-gray-400 border-gray-400/30";
}

export default function LenderDashboardPage() {
  const router = useRouter();
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBorrower, setSelectedBorrower] = useState<string | null>(null);
  const [report, setReport] = useState<LenderReport | null>(null);
  const [fraud, setFraud] = useState<FraudResult | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState<"score" | "loan" | "name">("score");
  const [activeTab, setActiveTab] = useState<"portfolio" | "alerts" | "report">("portfolio");

  // Auth guard
  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    // Lenders and admins can see this page, borrowers cannot
    if (session.role === "borrower") {
      router.replace("/dashboard");
    }
  }, [router]);

  // Load all borrowers
  useEffect(() => {
    fetch(`${BASE}/lender/eligible-borrowers?min_score=${minScore}`)
      .then((r) => r.json())
      .then((data) => setBorrowers(data.borrowers || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [minScore]);

  const loadReport = useCallback(async (name: string) => {
    setReportLoading(true);
    setSelectedBorrower(name);
    setActiveTab("report");
    try {
      const [reportRes, fraudRes] = await Promise.all([
        fetch(`${BASE}/lender/report/${encodeURIComponent(name)}`).then((r) => r.json()),
        fetch(`${BASE}/vault/fraud-check/${encodeURIComponent(name)}`).then((r) => r.json()),
      ]);
      setReport(reportRes);
      setFraud(fraudRes);
    } catch (e) {
      console.error(e);
    } finally {
      setReportLoading(false);
    }
  }, []);

  const sorted = [...borrowers].sort((a, b) => {
    if (sortBy === "score") return b.trust_score - a.trust_score;
    if (sortBy === "loan") return b.loan_limit - a.loan_limit;
    return a.name.localeCompare(b.name);
  });

  // Compute aggregate stats
  const avgScore = borrowers.length ? Math.round(borrowers.reduce((s, b) => s + b.trust_score, 0) / borrowers.length) : 0;
  const totalLoanPool = borrowers.reduce((s, b) => s + b.loan_limit, 0);
  const highRisk = borrowers.filter((b) => b.risk_band.includes("High") || b.risk_band === "Rejected").length;
  const autoApprove = borrowers.filter((b) => b.trust_score >= 800).length;

  // Risk distribution
  const distribution = [
    { label: "Very Low", count: borrowers.filter((b) => b.risk_band === "Very Low Risk").length, color: "#22c55e" },
    { label: "Low", count: borrowers.filter((b) => b.risk_band === "Low Risk").length, color: "#86efac" },
    { label: "Medium", count: borrowers.filter((b) => b.risk_band === "Medium Risk").length, color: "#f59e0b" },
    { label: "High", count: borrowers.filter((b) => b.risk_band.includes("High")).length, color: "#ef4444" },
  ];
  const maxDist = Math.max(...distribution.map((d) => d.count), 1);

  const session = typeof window !== "undefined" ? getSession() : null;

  return (
    <div className="page-body" style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, #071a0f 0%, #080c18 55%)" }}>
      <div className="page-container pt-8 md:pt-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <p className="section-label">Lender Intelligence</p>
            <h1 className="heading-page text-white mt-1">
              {session?.display ?? "Lender"} Dashboard
            </h1>
            <p className="text-caption mt-3">
              Portfolio overview · Fraud alerts · Risk-based borrower reports
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full glass border border-green-500/20 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-green-300 font-medium text-xs">Live Data</span>
            </div>
            <Link href="/dashboard" className="btn-outline text-sm !py-2.5 !px-4">
              Borrower View
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Borrowers", value: borrowers.length, sub: "in portfolio", color: "#3b96f2", icon: "👥" },
            { label: "Avg Trust Score", value: avgScore, sub: "across all borrowers", color: "#22c55e", icon: "📊" },
            { label: "Loan Pool", value: `₹${(totalLoanPool / 100000).toFixed(1)}L`, sub: "total eligible amount", color: "#a78bfa", icon: "💰" },
            { label: "Auto-Approve", value: autoApprove, sub: "score ≥ 800 borrowers", color: "#f59e0b", icon: "✅" },
          ].map((kpi) => (
            <div key={kpi.label} className="glass-card glass-card-static glass-card-compact">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{kpi.icon}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${kpi.color}18`, color: kpi.color }}>
                  Live
                </span>
              </div>
              <p className="font-display text-3xl font-bold text-white tabular-nums" style={{ color: kpi.color }}>
                {kpi.value}
              </p>
              <p className="text-white font-medium text-sm mt-1">{kpi.label}</p>
              <p className="text-caption text-xs mt-0.5">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1.5 glass rounded-xl mb-10 w-fit">
          {(["portfolio", "alerts", "report"] as const).map((tab) => (
            <button
              key={tab}
              id={`lender-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                activeTab === tab ? "bg-white/[0.08] text-white" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab === "alerts" ? "🚨 Fraud Alerts" : tab === "report" ? "📋 Borrower Report" : "Portfolio"}
            </button>
          ))}
        </div>

        {/* ── Portfolio Tab ─────────────────────────────────── */}
        {activeTab === "portfolio" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Borrower Table */}
            <div className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="heading-card text-white">Borrower Risk Portfolio</h2>
                <div className="flex gap-3 flex-wrap items-center">
                  <div className="flex items-center gap-2">
                    <label className="text-slate-400 text-xs font-medium">Min Score</label>
                    <select
                      id="lender-min-score"
                      value={minScore}
                      onChange={(e) => setMinScore(Number(e.target.value))}
                      className="glass border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-primary-500/50"
                    >
                      <option value={0}>All</option>
                      <option value={500}>500+</option>
                      <option value={600}>600+</option>
                      <option value={700}>700+</option>
                      <option value={800}>800+</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-slate-400 text-xs font-medium">Sort</label>
                    <select
                      id="lender-sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "score" | "loan" | "name")}
                      className="glass border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-primary-500/50"
                    >
                      <option value="score">Trust Score ↓</option>
                      <option value="loan">Loan Limit ↓</option>
                      <option value="name">Name A-Z</option>
                    </select>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="glass rounded-2xl overflow-hidden border border-white/[0.06]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="text-left px-5 py-4 text-slate-400 font-medium text-xs uppercase tracking-wider">Borrower</th>
                        <th className="text-center px-3 py-4 text-slate-400 font-medium text-xs uppercase tracking-wider">Score</th>
                        <th className="text-center px-3 py-4 text-slate-400 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Risk</th>
                        <th className="text-right px-5 py-4 text-slate-400 font-medium text-xs uppercase tracking-wider">Loan Limit</th>
                        <th className="text-right px-5 py-4 text-slate-400 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((b, i) => (
                        <tr
                          key={b.name}
                          className={`border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors cursor-pointer ${
                            selectedBorrower === b.name ? "bg-primary-500/5" : ""
                          }`}
                          onClick={() => loadReport(b.name)}
                          style={{ animationDelay: `${i * 30}ms` }}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                style={{ background: `linear-gradient(135deg, ${getRiskColor(b.risk_band)}44, ${getRiskColor(b.risk_band)}22)` }}
                              >
                                {b.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-white font-medium text-sm truncate">{b.name}</p>
                                <p className="text-slate-500 text-xs truncate">{b.occupation}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-center">
                            <span className="font-display font-bold text-white tabular-nums" style={{ color: getRiskColor(b.risk_band) }}>
                              {b.trust_score}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-center hidden sm:table-cell">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getRiskBg(b.risk_band)}`}>
                              {b.risk_band.replace(" Risk", "")}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className="text-white font-semibold tabular-nums">
                              ₹{(b.loan_limit / 1000).toFixed(0)}K
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right hidden md:table-cell">
                            <button
                              id={`view-report-${b.name.replace(/\s+/g, "-").toLowerCase()}`}
                              onClick={(e) => { e.stopPropagation(); loadReport(b.name); }}
                              className="text-primary-400 hover:text-primary-300 text-xs font-medium transition-colors"
                            >
                              Report →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Risk Distribution */}
            <div className="space-y-6">
              <div className="glass-card glass-card-static">
                <h2 className="heading-card text-white mb-8">Risk Distribution</h2>
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
                </div>
              </div>

              {/* High-risk flag */}
              {highRisk > 0 && (
                <div className="glass-card glass-card-static border border-red-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    <h3 className="text-white font-semibold text-sm">Caution Required</h3>
                  </div>
                  <p className="text-red-400 text-2xl font-display font-bold tabular-nums">{highRisk}</p>
                  <p className="text-slate-400 text-sm mt-1">borrowers in high-risk or rejected band</p>
                  <button
                    className="btn-outline text-xs py-2 w-full mt-4 border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={() => setActiveTab("alerts")}
                  >
                    View Fraud Alerts →
                  </button>
                </div>
              )}

              {/* Auto-approve summary */}
              <div className="glass-card glass-card-static border border-green-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <h3 className="text-white font-semibold text-sm">Auto-Approve Ready</h3>
                </div>
                <p className="text-green-400 text-2xl font-display font-bold tabular-nums">{autoApprove}</p>
                <p className="text-slate-400 text-sm mt-1">borrowers eligible for instant approval</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Fraud Alerts Tab ─────────────────────────────── */}
        {activeTab === "alerts" && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="heading-card text-white">Fraud & Risk Alerts</h2>
              <span className="text-slate-400 text-sm">Real-time fraud detection · Prototype rule engine</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {sorted
                .filter((b) => b.risk_band.includes("High") || b.trust_score < 600)
                .map((b) => (
                  <div
                    key={b.name}
                    className="glass-card glass-card-static border border-red-500/15 hover:border-red-500/30 transition-all duration-300 cursor-pointer"
                    onClick={() => loadReport(b.name)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                          <span className="text-red-400 text-sm font-bold">
                            {b.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{b.name}</p>
                          <p className="text-slate-500 text-xs">{b.city}</p>
                        </div>
                      </div>
                      <span className="text-red-400 text-xs font-bold bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20">
                        ⚠ Review
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="glass rounded-lg p-3">
                        <p className="text-red-400 font-bold text-lg tabular-nums">{b.trust_score}</p>
                        <p className="text-slate-500 text-xs">Trust Score</p>
                      </div>
                      <div className="glass rounded-lg p-3">
                        <p className="text-amber-400 font-bold text-sm">
                          ₹{(b.loan_limit / 1000).toFixed(0)}K
                        </p>
                        <p className="text-slate-500 text-xs">Max Limit</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getRiskBg(b.risk_band)}`}>
                      {b.risk_band}
                    </span>
                    <button
                      className="text-primary-400 hover:text-primary-300 text-xs font-medium mt-3 flex items-center gap-1 transition-colors"
                      onClick={(e) => { e.stopPropagation(); loadReport(b.name); }}
                    >
                      Full Report →
                    </button>
                  </div>
                ))}
              {sorted.filter((b) => b.risk_band.includes("High") || b.trust_score < 600).length === 0 && (
                <div className="col-span-full text-center py-16">
                  <p className="text-5xl mb-4">✅</p>
                  <p className="text-white font-semibold text-lg">No High-Risk Borrowers</p>
                  <p className="text-slate-400 text-sm mt-1">All visible borrowers are within acceptable risk bands</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Borrower Report Tab ───────────────────────────── */}
        {activeTab === "report" && (
          <div>
            {!selectedBorrower && (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">📋</p>
                <p className="text-white font-semibold text-lg">Select a Borrower</p>
                <p className="text-slate-400 text-sm mt-1 mb-6">Click any borrower row in the Portfolio tab to load their full report</p>
                <button className="btn-primary px-6 py-3" onClick={() => setActiveTab("portfolio")}>
                  ← Go to Portfolio
                </button>
              </div>
            )}

            {selectedBorrower && reportLoading && (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {selectedBorrower && !reportLoading && report && fraud && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="heading-card text-white">
                      Lender Report — <span className="text-primary-400">{selectedBorrower}</span>
                    </h2>
                    <p className="text-caption mt-1">Privacy-masked · Risk profile only · UdaanScore Prototype</p>
                  </div>
                  <button className="btn-outline text-sm !py-2 !px-4" onClick={() => setActiveTab("portfolio")}>
                    ← Back
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                  {/* Score Summary */}
                  <div className="space-y-5">
                    <div className="glass-card glass-card-static text-center">
                      <p className="text-caption mb-2">Trust Score</p>
                      <p className="font-display text-6xl font-bold tabular-nums" style={{ color: getRiskColor(report.risk_band) }}>
                        {report.trust_score}
                      </p>
                      <span className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-semibold border ${getRiskBg(report.risk_band)}`}>
                        {report.risk_band}
                      </span>
                      <div className="mt-6 text-left space-y-3 pt-5 border-t border-white/[0.06]">
                        {[
                          { label: "Confidence", value: report.confidence },
                          { label: "Recommended Limit", value: `₹${(report.recommended_loan_limit / 1000).toFixed(0)}K` },
                          { label: "Loans Repaid", value: report.loans_repaid },
                          { label: "Nano Stage", value: `Stage ${report.current_nano_stage}` },
                        ].map((m) => (
                          <div key={m.label} className="flex justify-between">
                            <span className="text-slate-400 text-sm">{m.label}</span>
                            <span className="text-white text-sm font-semibold">{m.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div
                      className={`glass-card glass-card-static border ${
                        report.lender_recommendation.includes("AUTO")
                          ? "border-green-500/30"
                          : report.lender_recommendation.includes("REJECT") || report.lender_recommendation.includes("DO NOT")
                          ? "border-red-500/30"
                          : "border-amber-500/30"
                      }`}
                    >
                      <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Recommendation</p>
                      <p className="text-white font-semibold text-sm leading-relaxed">{report.lender_recommendation}</p>
                    </div>

                    {/* Fraud Assessment */}
                    <div className={`glass-card glass-card-static border ${fraud.risk_level === "Clean" ? "border-green-500/20" : "border-red-500/30"}`}>
                      <p className="text-slate-400 text-xs uppercase tracking-widest mb-3">Fraud Assessment</p>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{fraud.risk_level === "Clean" ? "✅" : "⚠️"}</span>
                        <div>
                          <p className="text-white font-bold">{fraud.risk_level}</p>
                          <p className="text-slate-400 text-xs">{fraud.flags_detected} flag(s) detected</p>
                        </div>
                      </div>
                      <div className="flex gap-3 text-xs">
                        <span className={`px-2 py-1 rounded-lg font-medium ${fraud.verified ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                          {fraud.verified ? "✓ Verified" : "Unverified"}
                        </span>
                        <span className={`px-2 py-1 rounded-lg font-medium ${fraud.auto_approved ? "bg-green-500/15 text-green-400" : "bg-amber-500/15 text-amber-400"}`}>
                          {fraud.auto_approved ? "Auto-Approve" : "Manual Review"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score Breakdown + Strengths/Weaknesses */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Score Breakdown */}
                    <div className="glass-card glass-card-static">
                      <h3 className="heading-card text-white mb-6">Signal Breakdown</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.entries(report.score_breakdown).map(([key, val]) => (
                          <div key={key} className="glass rounded-xl p-4 text-center">
                            <p className="text-white font-bold text-lg tabular-nums">{val}</p>
                            <p className="text-slate-400 text-xs mt-1 capitalize">{key.replace(/_/g, " ")}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Strengths */}
                    <div className="glass-card glass-card-static">
                      <h3 className="text-green-400 font-semibold mb-4 flex items-center gap-2">
                        <span>✅</span> Score Strengths
                      </h3>
                      <div className="space-y-3">
                        {report.score_strengths.map((s, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/15">
                            <span className="text-green-400 text-xs font-bold mt-0.5 shrink-0">+</span>
                            <div>
                              <p className="text-white text-sm font-medium">{s.factor}</p>
                              <p className="text-slate-400 text-xs mt-0.5">{s.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Weaknesses */}
                    <div className="glass-card glass-card-static">
                      <h3 className="text-red-400 font-semibold mb-4 flex items-center gap-2">
                        <span>⚠️</span> Risk Factors
                      </h3>
                      <div className="space-y-3">
                        {report.score_weaknesses.map((w, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                            <span className="text-red-400 text-xs font-bold mt-0.5 shrink-0">−</span>
                            <div>
                              <p className="text-white text-sm font-medium">{w.factor}</p>
                              <p className="text-slate-400 text-xs mt-0.5">{w.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Profile (masked) */}
                    <div className="glass-card glass-card-static">
                      <h3 className="heading-card text-white mb-4">Borrower Profile (Privacy-Masked)</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: "Age Group", value: report.borrower_profile.age_group },
                          { label: "Occupation", value: report.borrower_profile.occupation_category },
                          { label: "City Tier", value: report.borrower_profile.city_tier },
                          { label: "Income Range", value: report.borrower_profile.monthly_income_range },
                        ].map((f) => (
                          <div key={f.label} className="glass rounded-xl p-4">
                            <p className="text-slate-400 text-xs mb-1">{f.label}</p>
                            <p className="text-white font-semibold text-sm">{f.value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-3 rounded-xl bg-primary-500/5 border border-primary-500/15">
                        <p className="text-primary-300 text-xs">
                          🔒 Identity masked per DPDP Act 2023 — only anonymized risk profile is shared with lenders
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
