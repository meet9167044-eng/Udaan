"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import ScoreGauge from "@/components/ScoreGauge";
import Link from "next/link";

/* ── Factor definition ───────────────────────────────────── */
interface Factor {
  id: string;
  label: string;
  weight: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  tips: string[];
  color: string;
  icon: React.ReactNode;
}

const factors: Factor[] = [
  {
    id: "utilityBills",
    label: "Utility Bill Payments",
    weight: 0.22,
    min: 0,
    max: 100,
    step: 1,
    unit: "%",
    color: "#22c55e",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    tips: [
      "Enable auto-pay on electricity, water, and broadband bills.",
      "Missed utility payments reduce Trust Score faster than bureau defaults.",
    ],
  },
  {
    id: "upiActivity",
    label: "UPI Activity",
    weight: 0.22,
    min: 0,
    max: 100,
    step: 1,
    unit: "%",
    color: "#3b96f2",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M12 18h.01" />
      </svg>
    ),
    tips: [
      "Regular UPI inflows and merchant payments strengthen behavioral signals.",
      "Avoid long gaps with zero transaction velocity.",
    ],
  },
  {
    id: "savingsConsistency",
    label: "Savings Consistency",
    weight: 0.2,
    min: 0,
    max: 100,
    step: 1,
    unit: "%",
    color: "#a78bfa",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-6 .3-6 3 0 1.8 1 3 2.5 3H14" />
        <path d="M12 22v-8" />
        <path d="M8 14h8" />
      </svg>
    ),
    tips: [
      "Maintain a steady monthly savings rate — even small amounts help.",
      "Volatile savings patterns lower confidence in repayment capacity.",
    ],
  },
  {
    id: "cashFlowStability",
    label: "Cash Flow Stability",
    weight: 0.2,
    min: 0,
    max: 100,
    step: 1,
    unit: "%",
    color: "#f59e0b",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18" />
        <path d="M7 16l4-8 4 5 5-9" />
      </svg>
    ),
    tips: [
      "Stable inflows over 6+ months significantly boost your Trust Score.",
      "Large unexplained spikes can trigger risk review.",
    ],
  },
  {
    id: "gstCompliance",
    label: "GST Compliance",
    weight: 0.16,
    min: 0,
    max: 100,
    step: 1,
    unit: "%",
    color: "#06b6d4",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14,2 14,8 20,8" />
      </svg>
    ),
    tips: [
      "File GST returns on time — gaps are a strong negative signal for MSMEs.",
      "Link GSTIN in Consent Vault for automatic compliance tracking.",
    ],
  },
];

const defaults: Record<string, number> = {
  utilityBills: 78,
  upiActivity: 75,
  savingsConsistency: 69,
  cashFlowStability: 72,
  gstCompliance: 78,
};

function factorPct(v: number, f: Factor) {
  return (v - f.min) / (f.max - f.min);
}

function calcTrustScore(values: Record<string, number>): number {
  let total = 0;
  factors.forEach((f) => {
    total += factorPct(values[f.id], f) * f.weight;
  });
  return Math.round(total * 1000);
}

function calcConfidence(values: Record<string, number>, score: number): number {
  const pcts = factors.map((f) => factorPct(values[f.id], f));
  const avg = pcts.reduce((a, b) => a + b, 0) / pcts.length;
  const variance =
    pcts.reduce((sum, p) => sum + (p - avg) ** 2, 0) / pcts.length;
  const consistencyBonus = Math.max(0, 12 - variance * 40);
  const raw = 58 + avg * 32 + (score / 1000) * 8 + consistencyBonus;
  return Math.min(99, Math.max(52, Math.round(raw)));
}

type RiskBand = "Low" | "Medium" | "High";

function calcRiskBand(score: number, values: Record<string, number>): RiskBand {
  const minFactor = Math.min(...factors.map((f) => factorPct(values[f.id], f) * 100));
  if (score >= 720 && minFactor >= 55) return "Low";
  if (score >= 580 && minFactor >= 40) return "Medium";
  return "High";
}

function calcLoanEligibility(score: number): number {
  if (score >= 850) return 1500000;
  if (score >= 780) return 1200000;
  if (score >= 720) return 850000;
  if (score >= 650) return 500000;
  if (score >= 550) return 250000;
  return 100000;
}

function formatLoan(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${(amount / 1000).toFixed(0)}K`;
}

function calcApprovalChance(score: number, confidence: number, risk: RiskBand): number {
  const riskPenalty = risk === "Low" ? 0 : risk === "Medium" ? 12 : 28;
  const raw = (score / 1000) * 72 + confidence * 0.22 - riskPenalty;
  return Math.min(98, Math.max(8, Math.round(raw)));
}

const riskColors: Record<RiskBand, string> = {
  Low: "#22c55e",
  Medium: "#f59e0b",
  High: "#ef4444",
};

/* ── Smooth animated number ──────────────────────────────── */
function useAnimatedNumber(target: number, duration = 450) {
  const [display, setDisplay] = useState(target);
  const frameRef = useRef<number | null>(null);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    const to = target;
    if (from === to) return;

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return display;
}

function MetricTile({
  label,
  value,
  sub,
  color,
  delay = 0,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  delay?: number;
}) {
  return (
    <div
      className="glass rounded-xl p-4 text-center transition-all duration-500 ease-out border-b-2"
      style={{ animationDelay: `${delay}ms`, borderBottomColor: color ? `${color}40` : "transparent" }}
    >
      <p
        className="font-display font-bold text-2xl transition-colors duration-500"
        style={color ? { color } : { color: "#fff" }}
      >
        {value}
      </p>
      <p className="text-slate-300 font-medium text-xs mt-1 leading-tight">{label}</p>
      {sub && <p className="text-slate-500 text-[10px] mt-1 font-medium">{sub}</p>}
    </div>
  );
}

export default function SimulatorPage() {
  const [values, setValues] = useState<Record<string, number>>(defaults);
  const [baseline] = useState(() => calcTrustScore(defaults));

  const currentScore = baseline;
  const futureScore = useMemo(() => calcTrustScore(values), [values]);
  const delta = futureScore - currentScore;

  const futureConfidence = useMemo(
    () => calcConfidence(values, futureScore),
    [values, futureScore]
  );
  const baselineConfidence = useMemo(
    () => calcConfidence(defaults, baseline),
    [baseline]
  );

  const futureRisk = useMemo(() => calcRiskBand(futureScore, values), [futureScore, values]);
  const baselineRisk = useMemo(() => calcRiskBand(baseline, defaults), [baseline]);

  const futureLoan = useMemo(() => calcLoanEligibility(futureScore), [futureScore]);
  const currentLoan = useMemo(() => calcLoanEligibility(baseline), [baseline]);
  const loanUnlock = Math.max(0, futureLoan - currentLoan);

  const futureApproval = useMemo(
    () => calcApprovalChance(futureScore, futureConfidence, futureRisk),
    [futureScore, futureConfidence, futureRisk]
  );

  const animFutureScore = useAnimatedNumber(futureScore);
  const animConfidence = useAnimatedNumber(futureConfidence);
  const animApproval = useAnimatedNumber(futureApproval);

  const activeTips = useMemo(() => {
    const tips: string[] = [];
    factors.forEach((f) => {
      if (factorPct(values[f.id], f) < 0.55) tips.push(f.tips[0]);
    });
    return tips.slice(0, 4);
  }, [values]);

  return (
    <div
      className="page-body"
      style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, #0f1a30 0%, #080c18 55%)" }}
    >
      <div className="page-container pt-8 md:pt-12">
        <div className="text-center mb-16 max-w-2xl mx-auto animate-fade-in">
          <p className="section-label">Trust Score Simulator</p>
          <h1 className="heading-page text-white mt-2 mb-5">
            Model Your <span className="gradient-text">Trust Future</span>
          </h1>
          <p className="body-md max-w-xl mx-auto">
            Adjust alternate-data signals to see how UPI, utilities, savings, cash flow, and GST shape
            your Trust Score — before you apply.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2 space-y-5">
            {factors.map((f, i) => {
              const v = values[f.id];
              const fillPct = factorPct(v, f) * 100;
              const isGood = fillPct >= 60;

              return (
                <div
                  key={f.id}
                  className="glass-card glass-card-static animate-slide-up"
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300"
                        style={{
                          background: `${f.color}22`,
                          border: `1px solid ${f.color}44`,
                          color: f.color,
                        }}
                      >
                        {f.icon}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{f.label}</p>
                        <p className="text-slate-400 text-xs">
                          Weight: {Math.round(f.weight * 100)}% of Trust Score
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className="font-bold text-lg tabular-nums transition-colors duration-300"
                        style={{ color: isGood ? "#22c55e" : f.color }}
                      >
                        {v}
                        {f.unit}
                      </span>
                      <div
                        className="text-xs mt-0.5 transition-colors duration-300"
                        style={{ color: isGood ? "#22c55e" : "#f59e0b" }}
                      >
                        {isGood ? "✓ Strong signal" : "⚠ Needs improvement"}
                      </div>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="h-2.5 rounded-full bg-white/10 mb-1 relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-300 ease-out"
                        style={{
                          width: `${fillPct}%`,
                          background: `linear-gradient(90deg, ${f.color}66, ${f.color})`,
                          boxShadow: `0 0 12px ${f.color}44`,
                        }}
                      />
                    </div>
                    <input
                      id={`slider-${f.id}`}
                      type="range"
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      value={v}
                      onChange={(e) =>
                        setValues((prev) => ({ ...prev, [f.id]: +e.target.value }))
                      }
                      className="absolute inset-0 w-full opacity-0 cursor-pointer h-2.5"
                      style={{ accentColor: f.color }}
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>
                        {f.min}
                        {f.unit}
                      </span>
                      <span>
                        {f.max}
                        {f.unit}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              id="simulator-reset"
              onClick={() => setValues(defaults)}
              className="btn-outline text-sm w-full py-2.5 transition-all duration-300 hover:scale-[1.01]"
            >
              ↺ Reset to Current Profile
            </button>
          </div>

          {/* Results panel */}
          <div className="stack-xl">
            <div className="glass-card glass-card-static relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/10 blur-[50px] pointer-events-none" />
              <h2 className="heading-card text-white mb-8 text-center relative z-10">Trust Score Projection</h2>

              <div className="flex items-center justify-between relative z-10">
                <div className="text-center flex-1">
                  <p className="text-slate-400 text-[10px] font-bold mb-2 uppercase tracking-widest">Current</p>
                  <div className="transition-opacity duration-500 opacity-60 scale-90">
                    <ScoreGauge score={currentScore} maxScore={1000} minScore={0} size={110} animated={false} />
                  </div>
                </div>

                <div
                  className={`flex flex-col items-center justify-center shrink-0 w-16 h-16 rounded-full border-4 shadow-xl z-20 transition-all duration-500 ${
                    delta > 0
                      ? "bg-navy-900 border-green-500/30 text-green-400 shadow-green-500/20"
                      : delta < 0
                        ? "bg-navy-900 border-red-500/30 text-red-400 shadow-red-500/20"
                        : "bg-navy-900 border-slate-700 text-slate-400"
                  }`}
                >
                  <span className="text-lg transition-transform duration-300 inline-block">
                    {delta > 0 ? "↑" : delta < 0 ? "↓" : "→"}
                  </span>
                  <span className="tabular-nums font-bold text-sm leading-none">
                    {delta > 0 ? "+" : ""}
                    {delta}
                  </span>
                </div>

                <div className="text-center flex-1">
                  <p className="text-primary-400 text-[10px] font-bold mb-2 uppercase tracking-widest">Projected</p>
                  <ScoreGauge
                    key={animFutureScore}
                    score={futureScore}
                    maxScore={1000}
                    minScore={0}
                    size={130}
                    animated
                  />
                </div>
              </div>
            </div>

            {/* Live metrics */}
            <div className="glass-card glass-card-static border border-primary-500/12">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                <h2 className="heading-card text-white">Live Outcomes</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <MetricTile
                  label="Confidence Score"
                  value={`${animConfidence}%`}
                  sub={
                    animConfidence > baselineConfidence
                      ? `+${animConfidence - baselineConfidence}% vs current`
                      : animConfidence < baselineConfidence
                        ? `${animConfidence - baselineConfidence}% vs current`
                        : "Unchanged"
                  }
                  color="#3b96f2"
                />
                <MetricTile
                  label="Risk Band"
                  value={futureRisk}
                  sub={futureRisk !== baselineRisk ? `Was ${baselineRisk}` : "Stable"}
                  color={riskColors[futureRisk]}
                />
                <MetricTile
                  label="Loan Eligibility"
                  value={formatLoan(futureLoan)}
                  sub="Pre-underwritten cap"
                  color="#22c55e"
                />
                <MetricTile
                  label="Approval Chance"
                  value={`${animApproval}%`}
                  sub="Partner lender estimate"
                  color={animApproval >= 70 ? "#22c55e" : animApproval >= 45 ? "#f59e0b" : "#ef4444"}
                />
              </div>

              {/* Approval bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Approval probability</span>
                  <span className="tabular-nums text-slate-300">{animApproval}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-700 to-primary-400 transition-all duration-500 ease-out"
                    style={{ width: `${animApproval}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Potential loan unlock */}
            <div
              className={`glass-card glass-card-static ${
                loanUnlock > 0 ? "border border-green-500/20" : ""
              }`}
            >
              <h2 className="heading-card text-white mb-3">Potential Loan Unlock</h2>
              {loanUnlock > 0 ? (
                <>
                  <p className="text-3xl font-display font-bold text-green-400 tabular-nums transition-all duration-500">
                    +{formatLoan(loanUnlock)}
                  </p>
                  <p className="text-slate-400 text-xs mt-2">
                    Additional eligibility if you reach the simulated profile (
                    {formatLoan(currentLoan)} → {formatLoan(futureLoan)}).
                  </p>
                </>
              ) : delta < 0 ? (
                <p className="text-amber-400 text-sm">
                  Simulated profile may reduce eligibility by {formatLoan(currentLoan - futureLoan)}.
                </p>
              ) : (
                <p className="text-slate-400 text-sm">
                  No new loan tier unlocked yet — raise signals to unlock higher caps.
                </p>
              )}
            </div>

            {/* AI tips */}
            <div className="glass-card glass-card-static animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-7 h-7 rounded-lg bg-primary-700/40 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-primary-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h2 className="heading-card text-white">AI Recommendations</h2>
              </div>

              {activeTips.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-2xl mb-2">🎉</p>
                  <p className="text-green-400 font-medium text-sm">Strong trust profile!</p>
                  <p className="text-slate-400 text-xs mt-1">All signals are in optimal range.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {activeTips.map((tip, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 animate-slide-up"
                      style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
                    >
                      <div className="w-5 h-5 rounded-full bg-primary-700/40 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-primary-400 text-xs font-bold">{i + 1}</span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">{tip}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Link
              href="/dashboard"
              className="btn-primary text-sm w-full py-3 text-center block"
            >
              View Trust Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
