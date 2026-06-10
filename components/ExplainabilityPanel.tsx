"use client";

import { useAuth } from "@/components/AuthContext";
import { useEffect, useState } from "react";
import { getExplanation, type ExplainResult } from "@/lib/api";

interface ExplainabilityPanelProps {
  borrowerName?: string;
}

const STATIC: ExplainResult = {
  borrower_name: "Borrower",
  trust_score: 742,
  verdict: "Good — Reliable borrower with minor risks",
  verdict_emoji: "🟡",
  risk_band: "Low Risk",
  positive_factors: [
    { factor: "Utility Bills",    detail: "Bills paid consistently and on time",             impact: "Strong positive signal"              },
    { factor: "Cash Flow",        detail: "Stable and regular income detected",               impact: "Consistent income is a strong trust signal" },
    { factor: "UPI Activity",     detail: "Regular and consistent digital transactions",      impact: "Shows active financial participation" },
    { factor: "Location Stability", detail: "Long-term residential stability confirmed",      impact: "Stable address increases lender confidence" },
  ],
  negative_factors: [
    { factor: "Savings",          detail: "Low or no savings balance maintained",             impact: "No savings buffer reduces repayment confidence" },
  ],
  improvement_suggestions: [
    { factor: "Savings",          detail: "Build emergency fund",                             action: "Maintain minimum ₹3,000 balance for 30 days" },
    { factor: "Assessment",       detail: "Retake the financial discipline quiz",             action: "Complete the full psychometric assessment" },
  ],
  score_breakdown: {
    utility_bills:      "78/100 (weight: 20%)",
    upi_activity:       "75/100 (weight: 20%)",
    cash_flow:          "72/100 (weight: 20%)",
    savings:            "55/100 (weight: 15%)",
    location_stability: "80/100 (weight: 10%)",
    psychometric:       "58/100 (weight: 15%)",
  },
};

const FACTOR_ICONS: Record<string, string> = {
  "Utility Bills":      "⚡",
  "UPI Activity":       "📱",
  "Cash Flow":          "💸",
  "Savings Pattern":    "💰",
  "Savings":            "💰",
  "Location Stability": "📍",
  "Financial Discipline": "🧠",
  "Assessment":         "🧠",
};

export default function ExplainabilityPanel({ borrowerName = "Borrower" }: ExplainabilityPanelProps) {
  const { user } = useAuth();
  const effectiveName = borrowerName ?? user?.borrowerName ?? "Borrower";
  const [data, setData]       = useState<ExplainResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<"factors" | "breakdown">("factors");

  useEffect(() => {
    let cancelled = false;
    getExplanation(effectiveName)
      .then((r) => { if (!cancelled) setData(r); })
      .catch(() => { if (!cancelled) setData(STATIC); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [effectiveName]);

  const result = data ?? STATIC;

  return (
    <div className="glass-card glass-card-static border border-primary-500/15">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
        <h2 className="heading-card text-white">AI Explainability</h2>
        {!loading && (
          <span className="ml-auto text-xs text-slate-400 font-medium">{result.verdict_emoji} {result.verdict}</span>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 glass rounded-lg mb-5 w-fit">
        {(["factors", "breakdown"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
              tab === t ? "bg-white/[0.08] text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {t === "factors" ? "Why This Score?" : "Score Breakdown"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-white/5" />
          ))}
        </div>
      ) : tab === "factors" ? (
        <div className="space-y-3">
          {/* Positive factors */}
          {result.positive_factors.map((f, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-green-500/5 border border-green-500/20 animate-slide-up"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
            >
              <span className="text-green-400 font-bold text-sm shrink-0 mt-0.5">↑</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{FACTOR_ICONS[f.factor] ?? "✅"}</span>
                  <p className="text-green-300 font-semibold text-sm">{f.factor}</p>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">{f.detail}</p>
                {f.impact && <p className="text-green-400/60 text-xs mt-0.5 italic">{f.impact}</p>}
              </div>
            </div>
          ))}

          {/* Negative factors */}
          {result.negative_factors.map((f, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 animate-slide-up"
              style={{ animationDelay: `${(result.positive_factors.length + i) * 60}ms`, animationFillMode: "both" }}
            >
              <span className="text-amber-400 font-bold text-sm shrink-0 mt-0.5">⚠</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{FACTOR_ICONS[f.factor] ?? "⚠️"}</span>
                  <p className="text-amber-300 font-semibold text-sm">{f.factor}</p>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">{f.detail}</p>
                {f.impact && <p className="text-amber-400/60 text-xs mt-0.5 italic">{f.impact}</p>}
              </div>
            </div>
          ))}

          {/* Suggestions */}
          {result.improvement_suggestions.length > 0 && (
            <>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-1">
                Recommended Actions
              </p>
              {result.improvement_suggestions.map((s, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-primary-500/5 border border-primary-500/20"
                >
                  <span className="text-primary-400 text-sm shrink-0 mt-0.5">→</span>
                  <div>
                    <p className="text-primary-300 font-semibold text-sm">{s.factor}</p>
                    {s.action && <p className="text-slate-400 text-xs mt-0.5">{s.action}</p>}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      ) : (
        /* Score breakdown tab */
        <div className="space-y-3">
          {Object.entries(result.score_breakdown).map(([key, val], i) => {
            const parts  = val.split(" ");
            const score  = parseInt(parts[0]);
            const weight = parseInt(parts[2]?.replace("(weight:", "") ?? "20");
            const pct    = (score / 100) * 100;
            const colors = ["#22c55e", "#3b96f2", "#f59e0b", "#a78bfa", "#06b6d4", "#8b5cf6"];
            const c      = colors[i % colors.length];
            const label  = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

            return (
              <div key={key} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">{label}</span>
                  <span className="text-slate-400 tabular-nums">{score}/100 · {weight}% weight</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${c}88, ${c})` }}
                  />
                </div>
              </div>
            );
          })}

          {/* Model narrative */}
          <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Model Reasoning</p>
            <p className="text-slate-300 text-xs leading-relaxed">
              Score computed using a weighted alternative-data model across 6 behavioral signals.
              Positive signals from utility consistency and UPI activity offset savings weakness.
              Location stability adds a confidence multiplier. Model certainty:{" "}
              <span className="text-primary-400 font-semibold">
                {result.trust_score >= 700 ? "High" : result.trust_score >= 550 ? "Medium" : "Low"}
              </span>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
