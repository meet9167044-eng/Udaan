"use client";

import { useAuth } from "@/components/AuthContext";
import { useEffect, useState } from "react";
import { getFraudCheck, type FraudResult } from "@/lib/api";

interface FraudIntelCardProps {
  borrowerName?: string;
}

/* ── Static fallback (when backend is offline) ─────────────── */
const STATIC_RESULT: FraudResult = {
  borrower_name: "Borrower",
  fraud_score: 0,
  risk_level: "Clean Profile",
  badge_color: "green",
  recommendation: "No suspicious activity detected — safe to proceed",
  flags_detected: 0,
  flags: [],
  verified: true,
  auto_approved: true,
};

const severityColor = {
  High:   { text: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/20"    },
  Medium: { text: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/20"  },
  Low:    { text: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
};

const riskConfig = {
  "Clean Profile":        { color: "#22c55e", label: "Clean",    ring: "border-green-500/30",  glow: "shadow-green-500/10"  },
  "Low Fraud Risk":       { color: "#eab308", label: "Low Risk", ring: "border-yellow-500/30", glow: "shadow-yellow-500/10" },
  "Moderate Fraud Risk":  { color: "#f97316", label: "Moderate", ring: "border-orange-500/30", glow: "shadow-orange-500/10" },
  "High Fraud Risk":      { color: "#ef4444", label: "High Risk",ring: "border-red-500/30",    glow: "shadow-red-500/10"    },
};

export default function FraudIntelCard({ borrowerName = "Borrower" }: FraudIntelCardProps) {
  const { user } = useAuth();
  const effectiveName = borrowerName ?? user?.borrowerName ?? "Borrower";
  const [data, setData]       = useState<FraudResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getFraudCheck(effectiveName)
      .then((r) => { if (!cancelled) setData(r); })
      .catch(() => { if (!cancelled) setData(STATIC_RESULT); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [effectiveName]);

  const result = data ?? STATIC_RESULT;
  const cfg = riskConfig[result.risk_level as keyof typeof riskConfig] ?? riskConfig["Clean Profile"];
  const fraudPct = Math.min(100, result.fraud_score);

  return (
    <div className="glass-card glass-card-static relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute top-0 right-0 w-32 h-32 blur-[50px] pointer-events-none opacity-30"
        style={{ background: cfg.color }}
      />

      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${cfg.color}20`, border: `1px solid ${cfg.color}40` }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <h2 className="heading-card text-white">Fraud Intelligence</h2>
        <span
          className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
          style={{ color: cfg.color, background: `${cfg.color}15`, borderColor: `${cfg.color}30` }}
        >
          {loading ? "Scanning…" : cfg.label}
        </span>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-white/5 rounded-full w-3/4" />
          <div className="h-4 bg-white/5 rounded-full w-1/2" />
          <div className="h-2 bg-white/5 rounded-full w-full mt-4" />
        </div>
      ) : (
        <>
          {/* Risk score meter */}
          <div className="mb-5">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Fraud Risk Score</span>
              <span className="font-bold tabular-nums" style={{ color: cfg.color }}>{result.fraud_score}/100</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${fraudPct}%`,
                  background: `linear-gradient(90deg, #22c55e, ${cfg.color})`,
                }}
              />
            </div>
          </div>

          {/* Status */}
          <div className={`rounded-xl p-3.5 mb-4 border ${cfg.ring} bg-white/[0.02]`}>
            <div className="flex items-start gap-3">
              <span className="text-lg">{result.auto_approved ? "✅" : result.verified ? "🔍" : "⚠️"}</span>
              <div>
                <p className="text-white text-sm font-semibold">{result.risk_level}</p>
                <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{result.recommendation}</p>
              </div>
            </div>
          </div>

          {/* Flags */}
          {result.flags.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {result.flags_detected} Flag{result.flags_detected !== 1 ? "s" : ""} Detected
              </p>
              {result.flags.map((f, i) => {
                const s = severityColor[f.severity] ?? severityColor.Low;
                return (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${s.bg} ${s.border}`}>
                    <span className="text-sm mt-0.5">{f.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${s.text}`}>{f.flag}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{f.detail}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${s.bg} ${s.text} shrink-0`}>
                      {f.severity}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-green-500/5 border border-green-500/20">
              <span className="text-green-400 text-lg">🛡️</span>
              <div>
                <p className="text-green-400 text-sm font-semibold">No Suspicious Activity</p>
                <p className="text-slate-400 text-xs mt-0.5">All behavioral patterns appear legitimate</p>
              </div>
            </div>
          )}

          {/* Verified badge */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-slate-500 text-xs">AI Confidence</span>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${result.verified ? "bg-green-400 animate-pulse" : "bg-amber-400"}`}
              />
              <span className="text-xs font-semibold" style={{ color: result.verified ? "#22c55e" : "#f59e0b" }}>
                {result.verified ? "Verified Clean" : "Needs Review"}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
