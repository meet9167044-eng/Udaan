"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/components/AuthContext";
import ScoreGauge from "@/components/ScoreGauge";
import NanoLoanLadder from "@/components/NanoLoanLadder";
import PsychometricModal from "@/components/PsychometricModal";

const BASE_SCORE = 623;

type TaskStatus = "completed" | "in_progress" | "pending";

interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  progress: number;
  scoreBoost: number;
  dueLabel?: string;
  icon: React.ReactNode;
  color: string;
  isPsychometric?: boolean;
}

const roadmapTasks: RoadmapTask[] = [
  {
    id: "utility",
    title: "Pay next 2 utility bills",
    description: "Electricity & broadband on time via linked UPI",
    status: "in_progress",
    progress: 50,
    scoreBoost: 12,
    dueLabel: "1 of 2 paid · Due Mar 28",
    color: "#22c55e",
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
  },
  {
    id: "balance",
    title: "Maintain ₹3,000 balance",
    description: "Keep minimum average balance for 30 consecutive days",
    status: "in_progress",
    progress: 60,
    scoreBoost: 18,
    dueLabel: "Day 18 of 30",
    color: "#3b96f2",
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>,
  },
  {
    id: "withdrawals",
    title: "Reduce sudden withdrawals",
    description: "Avoid large cash-outs; keep weekly variance under 40%",
    status: "pending",
    progress: 0,
    scoreBoost: 15,
    dueLabel: "Starts after balance milestone",
    color: "#f59e0b",
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><path d="M7 16l4-8 4 5 5-9" /></svg>,
  },
  {
    id: "psychometric",
    title: "Complete psychometric assessment",
    description: "10-min behavioural quiz to strengthen confidence score",
    status: "pending",
    progress: 0,
    scoreBoost: 22,
    dueLabel: "~10 minutes",
    color: "#a78bfa",
    isPsychometric: true,
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z" /><circle cx="12" cy="9" r="2.5" /></svg>,
  },
];

const milestones = [
  { score: 650, label: "Small Loan Unlocked",  reward: "₹5,000 nano loan eligible",       reached: false },
  { score: 680, label: "Enhanced Trust",        reward: "₹15,000 growth loan tier",         reached: false },
  { score: 710, label: "Premium Band",          reward: "₹50,000 full credit access",       reached: false },
  { score: 745, label: "Journey Complete",      reward: "Full roadmap boost applied",        reached: false },
];

function statusLabel(status: TaskStatus) {
  if (status === "completed")  return { text: "Completed",   className: "bg-green-400/10 text-green-400 border-green-400/30"   };
  if (status === "in_progress") return { text: "In progress", className: "bg-primary-500/10 text-primary-300 border-primary-500/30" };
  return                               { text: "Pending",     className: "bg-white/5 text-slate-400 border-white/10"            };
}

export default function JourneyPage() {
  const { user } = useAuth();
  const [tasks, setTasks]               = useState(roadmapTasks);
  const [showPsycho, setShowPsycho]     = useState(false);
  const [rajuMode, setRajuMode]         = useState(true);
  const [psychoBoost, setPsychoBoost]   = useState(0);

  const currentScore = rajuMode ? BASE_SCORE : 742;

  const journeyProgress = useMemo(() => {
    const total = tasks.reduce((sum, t) => sum + t.progress, 0);
    return Math.round(total / tasks.length);
  }, [tasks]);

  const earnedBoost = useMemo(() =>
    tasks.reduce((sum, t) => sum + Math.round((t.progress / 100) * t.scoreBoost), 0)
  , [tasks]);

  const totalPotentialBoost = useMemo(() =>
    tasks.reduce((sum, t) => sum + t.scoreBoost, 0)
  , [tasks]);

  const remainingBoost  = totalPotentialBoost - earnedBoost;
  const projectedScore  = currentScore + totalPotentialBoost;

  if (!user || user.role !== "borrower") {
    return <AuthGuard requiredRole="borrower"></AuthGuard>;
  }

  const borrowerName = user.borrowerName ?? "Borrower";

  const toggleTaskProgress = (id: string, isPsychometric?: boolean) => {
    if (isPsychometric) {
      setShowPsycho(true);
      return;
    }
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.progress >= 100) return { ...t, progress: 0, status: "pending" as const };
        const next = Math.min(100, t.progress + 50);
        return { ...t, progress: next, status: next >= 100 ? ("completed" as const) : ("in_progress" as const) };
      })
    );
  };

  const handlePsychoComplete = (score: number, boost: number) => {
    setPsychoBoost(boost);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === "psychometric"
          ? { ...t, progress: 100, status: "completed" as const, scoreBoost: boost, description: `Score: ${score}% — Boost: +${boost} pts` }
          : t
      )
    );
    setShowPsycho(false);
  };

  return (
    <div className="page-body" style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, #0f1a30 0%, #080c18 55%)" }}>
      {/* Psychometric modal */}
      {showPsycho && (
        <PsychometricModal
          onComplete={handlePsychoComplete}
          onClose={() => setShowPsycho(false)}
        />
      )}

      <div className="page-container pt-8 md:pt-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14 animate-fade-in">
          <div className="max-w-xl">
            <p className="section-label">Credit Builder Journey</p>
            <h1 className="heading-page text-white mt-2 mb-4">
              Build trust, <span className="gradient-text">unlock credit</span>
            </h1>
            <p className="body-md max-w-xl">
              Complete guided actions to raise your Trust Score and unlock higher loan tiers — no bureau history required.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {/* Borrower view toggle */}
            <button
              onClick={() => setRajuMode(!rajuMode)}
              className={`text-sm py-2 px-4 rounded-xl border font-medium transition-all duration-300 ${
                rajuMode
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                  : "border-white/10 bg-white/[0.02] text-slate-400 hover:text-white"
              }`}
            >
              {rajuMode ? `👤 ${borrowerName}'s View` : `Switch to ${borrowerName}`}
            </button>
            <Link href="/simulator" className="btn-outline text-sm py-2 px-4">
              Simulate Impact
            </Link>
            <Link href="/dashboard" className="btn-primary text-sm py-2 px-4">
              Trust Dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* ── Left column ────────────────────────────────── */}
          <div className="lg:col-span-1 stack-xl">
            {/* Score gauge */}
            <div className="glass-card glass-card-static flex flex-col items-center">
              <p className="text-caption uppercase tracking-widest mb-4 w-full text-center">
                {rajuMode ? `${borrowerName}'s Trust Score` : "Current Trust Score"}
              </p>
              {rajuMode && (
                <div className="mb-3 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                  <p className="text-amber-300 text-xs font-medium">Kirana Store Owner · Mumbai</p>
                </div>
              )}
              <ScoreGauge score={currentScore} maxScore={1000} minScore={0} size={200} animated={false} />
              <div className="w-full mt-4 glass rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Journey progress</span>
                  <span className="text-white font-semibold tabular-nums">{journeyProgress}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-700 to-primary-400 transition-all duration-700 ease-out"
                    style={{ width: `${journeyProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Expected score increase */}
            <div className="glass-card glass-card-static border border-primary-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-[40px] pointer-events-none" />
              <h2 className="heading-card text-white mb-6 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Expected Score Increase
              </h2>
              <div className="space-y-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Earned so far</p>
                    <p className="text-3xl font-display font-bold text-green-400 tabular-nums">+{earnedBoost}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-sm font-medium">If all complete</p>
                    <p className="text-3xl font-display font-bold gradient-text tabular-nums">+{totalPotentialBoost}</p>
                  </div>
                </div>
                <div className="glass rounded-2xl p-6 text-center border-primary-500/30 bg-primary-500/5 relative shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-500/10 to-transparent rounded-2xl pointer-events-none" />
                  <p className="text-slate-300 text-sm font-medium mb-1 tracking-wider uppercase">Projected Trust Score</p>
                  <p className="font-display text-5xl font-bold text-white tabular-nums my-2 drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
                    {projectedScore}
                  </p>
                  <p className="text-primary-300 text-sm font-medium">+{remainingBoost} pts remaining to unlock</p>
                </div>
              </div>
            </div>

            {/* Nano Loan Ladder (replaces old Loan Unlock Levels) */}
            <NanoLoanLadder borrowerName={borrowerName} />
          </div>

          {/* ── Right column ─────────────────────────────── */}
          <div className="lg:col-span-2 stack-xl">
            {/* Roadmap */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="heading-card text-white text-lg">Your Roadmap</h2>
                <span className="text-slate-400 text-xs">
                  {tasks.filter((t) => t.status === "completed").length} of {tasks.length} complete
                </span>
              </div>
              <div className="space-y-4">
                {tasks.map((task, i) => {
                  const badge  = statusLabel(task.status);
                  const earned = Math.round((task.progress / 100) * task.scoreBoost);
                  return (
                    <div
                      key={task.id}
                      className="glass-card glass-card-static animate-slide-up"
                      style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"
                          style={{
                            background: `linear-gradient(135deg, ${task.color}33, ${task.color}11)`,
                            border:     `1px solid ${task.color}44`,
                            color:       task.color,
                          }}
                        >
                          {task.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-white font-semibold">{task.title}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${badge.className}`}>
                              {badge.text}
                            </span>
                            <span className="text-green-400 text-xs font-semibold ml-auto sm:ml-0">
                              +{task.scoreBoost} pts
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm mb-3">{task.description}</p>
                          {task.dueLabel && (
                            <p className="text-slate-500 text-xs mb-3">{task.dueLabel}</p>
                          )}
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500 ease-out"
                                style={{
                                  width:      `${task.progress}%`,
                                  background: `linear-gradient(90deg, ${task.color}88, ${task.color})`,
                                }}
                              />
                            </div>
                            <span className="text-slate-300 text-xs font-medium tabular-nums w-10 text-right">
                              {task.progress}%
                            </span>
                          </div>
                          {earned > 0 && earned < task.scoreBoost && (
                            <p className="text-primary-300 text-xs mt-2">+{earned} pts earned toward this task</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleTaskProgress(task.id, task.isPsychometric)}
                          className={`text-xs py-2 px-3 shrink-0 self-start sm:self-center rounded-xl border font-medium transition-all duration-300 ${
                            task.isPsychometric && task.status !== "completed"
                              ? "border-violet-500/40 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20"
                              : "btn-outline"
                          }`}
                        >
                          {task.isPsychometric && task.status !== "completed"
                            ? "🧠 Start Quiz"
                            : task.progress >= 100
                            ? "Reset"
                            : "Mark progress"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Milestones */}
            <div className="glass-card glass-card-static">
              <h2 className="heading-card text-white mb-8">Milestones</h2>
              <div className="relative">
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-primary-500/50 via-primary-700/30 to-transparent" />
                <div className="space-y-6">
                  {milestones.map((m, i) => {
                    const active   = currentScore + earnedBoost >= m.score;
                    const upcoming = m.score <= projectedScore;
                    return (
                      <div
                        key={m.score}
                        className="flex items-start gap-4 relative animate-slide-up"
                        style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-all duration-300 ${
                            active
                              ? "bg-primary-500 border-primary-300 text-white"
                              : upcoming
                              ? "bg-primary-900/80 border-primary-600/50 text-primary-400"
                              : "bg-navy-800 border-white/10 text-slate-500"
                          }`}
                        >
                          {active ? (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          ) : (
                            <span className="text-xs font-bold">{m.score}</span>
                          )}
                        </div>
                        <div className="flex-1 pb-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-white font-semibold">{m.label}</p>
                            <span className="text-slate-500 text-xs">@ {m.score}</span>
                            {active   && <span className="text-green-400 text-xs font-medium">Reached</span>}
                            {!active && upcoming && <span className="text-primary-300 text-xs font-medium">On track</span>}
                          </div>
                          <p className="text-slate-400 text-sm mt-0.5">{m.reward}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div
              className="rounded-2xl p-10 md:p-12 text-center relative overflow-hidden border border-white/[0.08] shadow-[var(--shadow-elevated)]"
              style={{ background: "linear-gradient(160deg, #1a4a9e 0%, #0f2d6b 45%, #080c18 100%)" }}
            >
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #60b7f7 0%, transparent 50%), radial-gradient(circle at 70% 50%, #3b96f2 0%, transparent 50%)" }}
              />
              <div className="relative z-10">
                <h3 className="heading-card text-white text-xl mb-3">Complete your next action today</h3>
                <p className="text-primary-200 text-sm mb-5 max-w-md mx-auto">
                  Pay your next utility bill to move closer to the ₹50,000 unlock tier.
                </p>
                <Link href="/consent" className="btn-primary text-sm px-8 py-3 inline-block">
                  Link Accounts & Continue →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
