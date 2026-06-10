"use client";

import { useAuth } from "@/components/AuthContext";
import { useEffect, useState } from "react";
import { getNanoLadder, repayLoan, type NanoLadderResult, type NanoStage } from "@/lib/api";

interface NanoLoanLadderProps {
  borrowerName?: string;
}

const LADDER_AMOUNTS = [2000, 5000, 15000, 50000];
const LADDER_LABELS  = ["Starter Nano Loan", "Small Loan", "Growth Loan", "Scale Loan"];
const LADDER_ICONS   = ["🌱", "🌿", "🌳", "🚀"];
const LADDER_COLORS  = ["#22c55e", "#3b96f2", "#8b5cf6", "#f59e0b"];

const STATIC_RESULT: NanoLadderResult = {
  borrower_name: "Borrower",
  trust_score: 623,
  current_stage: 2,
  current_loan_limit: 5000,
  ladder: [
    { stage: 1, loan_amount: 2000,  label: "Starter Nano Loan", min_score_required: 400, score_boost_on_repay: 15, description: "Your first step into the credit world",           status: "completed" },
    { stage: 2, loan_amount: 5000,  label: "Small Loan",         min_score_required: 500, score_boost_on_repay: 25, description: "Building trust with consistent repayment",         status: "active"    },
    { stage: 3, loan_amount: 15000, label: "Growth Loan",        min_score_required: 600, score_boost_on_repay: 40, description: "Expanding your financial capacity",                status: "unlocked"  },
    { stage: 4, loan_amount: 50000, label: "Scale Loan",         min_score_required: 700, score_boost_on_repay: 60, description: "Full trust established — significant funding",      status: "locked"    },
  ],
  next_unlock: { stage: 3, loan_amount: 15000, score_needed: 0, label: "Growth Loan" },
};

function formatAmount(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

function StageCard({
  stage, onRepay, repaying,
}: {
  stage: NanoStage;
  onRepay: () => void;
  repaying: boolean;
}) {
  const color   = LADDER_COLORS[stage.stage - 1];
  const icon    = LADDER_ICONS[stage.stage - 1];
  const isActive    = stage.status === "active";
  const isCompleted = stage.status === "completed";
  const isUnlocked  = stage.status === "unlocked";
  const isLocked    = stage.status === "locked";

  return (
    <div
      className={`relative flex items-start gap-4 p-4 rounded-2xl border transition-all duration-500 ${
        isActive
          ? "border-primary-500/40 bg-primary-500/5 shadow-[0_0_24px_rgba(59,150,242,0.1)]"
          : isCompleted
          ? "border-green-500/30 bg-green-500/5"
          : isUnlocked
          ? "border-white/10 bg-white/[0.02]"
          : "border-white/5 bg-white/[0.01] opacity-50"
      }`}
    >
      {/* Stage icon */}
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl ${
          isLocked ? "grayscale opacity-40" : ""
        }`}
        style={
          !isLocked
            ? { background: `${color}20`, border: `1px solid ${color}40` }
            : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }
        }
      >
        {isCompleted ? "✅" : isLocked ? "🔒" : icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span
            className="font-display font-bold text-lg"
            style={{ color: isLocked ? "#64748b" : color }}
          >
            {formatAmount(stage.loan_amount)}
          </span>
          <span className="text-slate-400 text-xs">{stage.label}</span>
          {isActive && (
            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30 animate-pulse">
              Current
            </span>
          )}
          {isCompleted && (
            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
              Repaid ✓
            </span>
          )}
          {isLocked && (
            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-slate-500 border border-white/10">
              +{stage.min_score_required} pts
            </span>
          )}
        </div>

        <p className="text-slate-400 text-xs leading-relaxed mb-2">{stage.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Score boost on repay:{" "}
            <span className="text-green-400 font-semibold">+{stage.score_boost_on_repay} pts</span>
          </span>

          {isActive && (
            <button
              onClick={onRepay}
              disabled={repaying}
              className="btn-primary text-xs py-1.5 px-3"
            >
              {repaying ? "Processing…" : "Mark Repaid →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NanoLoanLadder({ borrowerName = "Borrower" }: NanoLoanLadderProps) {
  const { user } = useAuth();
  const effectiveName = borrowerName ?? user?.borrowerName ?? "Borrower";
  const [data, setData]         = useState<NanoLadderResult | null>(null);
  const [loading, setLoading]   = useState(true);
  const [repaying, setRepaying] = useState(false);
  const [toast, setToast]       = useState<string | null>(null);

  const fetchLadder = () => {
    setLoading(true);
    getNanoLadder(effectiveName)
      .then(setData)
      .catch(() => setData(STATIC_RESULT))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLadder(); }, [borrowerName]);

  const handleRepay = async () => {
    const result = data ?? STATIC_RESULT;
    const activeStage = result.ladder.find((s) => s.status === "active");
    if (!activeStage) return;

    setRepaying(true);
    try {
      const res = await repayLoan(borrowerName, activeStage.loan_amount);
      setToast(`🎉 Score boosted +${res.score_boost} pts! New score: ${res.new_score}`);
      fetchLadder();
    } catch {
      // Optimistic update for demo
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          ladder: prev.ladder.map((s) =>
            s.status === "active"
              ? { ...s, status: "completed" as const }
              : s.status === "unlocked"
              ? { ...s, status: "active" as const }
              : s
          ),
        };
      });
      setToast("🎉 Loan repaid! Score updated.");
    } finally {
      setRepaying(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const result = data ?? STATIC_RESULT;
  const completedCount = result.ladder.filter((s) => s.status === "completed").length;
  const progressPct = (completedCount / 4) * 100;

  return (
    <div className="glass-card glass-card-static relative overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-green-500/90 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xl animate-slide-up whitespace-nowrap">
          {toast}
        </div>
      )}

      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-400/10 border border-amber-400/20">
          <span className="text-lg">🪜</span>
        </div>
        <div>
          <h2 className="heading-card text-white">Nano Loan Ladder</h2>
          <p className="text-caption">Build credit through progressive repayment</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 mb-6">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-400">Journey Progress</span>
          <span className="text-white font-semibold tabular-nums">{completedCount} of 4 completed</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Stages */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {result.ladder.map((stage) => (
            <StageCard
              key={stage.stage}
              stage={stage}
              onRepay={handleRepay}
              repaying={repaying}
            />
          ))}
        </div>
      )}

      {/* Next unlock hint */}
      {result.next_unlock && result.next_unlock.score_needed > 0 && (
        <div className="mt-4 p-3.5 rounded-xl bg-primary-500/5 border border-primary-500/20">
          <p className="text-primary-300 text-xs font-medium">
            📈 Need{" "}
            <span className="font-bold">{result.next_unlock.score_needed} more pts</span>{" "}
            to unlock {formatAmount(result.next_unlock.loan_amount)} {result.next_unlock.label}
          </p>
        </div>
      )}
    </div>
  );
}
