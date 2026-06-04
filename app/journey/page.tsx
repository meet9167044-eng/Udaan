"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ScoreGauge from "@/components/ScoreGauge";

const CURRENT_SCORE = 742;

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
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
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
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
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
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18" />
        <path d="M7 16l4-8 4 5 5-9" />
      </svg>
    ),
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
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  },
];

const milestones = [
  { score: 750, label: "Good Standing", reward: "Unlock simulator insights", reached: false },
  { score: 780, label: "Enhanced Trust", reward: "+₹3.5L loan tier", reached: false },
  { score: 800, label: "Premium Band", reward: "Priority lender matching", reached: false },
  { score: 809, label: "Journey Complete", reward: "Full roadmap boost applied", reached: false },
];

const loanUnlockLevels = [
  { minScore: 550, amount: "₹2.5L", rate: "14–16%", unlocked: true, current: false },
  { minScore: 650, amount: "₹5L", rate: "12–14%", unlocked: true, current: false },
  { minScore: 720, amount: "₹8.5L", rate: "10.5–12%", unlocked: true, current: true },
  { minScore: 780, amount: "₹12L", rate: "9.5–11%", unlocked: false, current: false },
  { minScore: 850, amount: "₹15L", rate: "8.5–10%", unlocked: false, current: false },
];

function statusLabel(status: TaskStatus) {
  if (status === "completed") return { text: "Completed", className: "bg-green-400/10 text-green-400 border-green-400/30" };
  if (status === "in_progress") return { text: "In progress", className: "bg-primary-500/10 text-primary-300 border-primary-500/30" };
  return { text: "Pending", className: "bg-white/5 text-slate-400 border-white/10" };
}

export default function JourneyPage() {
  const [tasks, setTasks] = useState(roadmapTasks);

  const journeyProgress = useMemo(() => {
    const total = tasks.reduce((sum, t) => sum + t.progress, 0);
    return Math.round(total / tasks.length);
  }, [tasks]);

  const earnedBoost = useMemo(() => {
    return tasks.reduce((sum, t) => sum + Math.round((t.progress / 100) * t.scoreBoost), 0);
  }, [tasks]);

  const totalPotentialBoost = useMemo(
    () => tasks.reduce((sum, t) => sum + t.scoreBoost, 0),
    [tasks]
  );

  const remainingBoost = totalPotentialBoost - earnedBoost;
  const projectedScore = CURRENT_SCORE + totalPotentialBoost;

  const toggleTaskProgress = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.progress >= 100) {
          return { ...t, progress: 0, status: "pending" as const };
        }
        const next = Math.min(100, t.progress + 50);
        return {
          ...t,
          progress: next,
          status: next >= 100 ? ("completed" as const) : ("in_progress" as const),
        };
      })
    );
  };

  return (
    <div
      className="page-body"
      style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, #0f1a30 0%, #080c18 55%)" }}
    >
      <div className="page-container pt-8 md:pt-12">
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
          <div className="flex gap-3">
            <Link href="/simulator" className="btn-outline text-sm py-2 px-4">
              Simulate Impact
            </Link>
            <Link href="/dashboard" className="btn-primary text-sm py-2 px-4">
              Trust Dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-1 stack-xl">
            <div className="glass-card glass-card-static flex flex-col items-center">
              <p className="text-caption uppercase tracking-widest mb-4 w-full text-center">
                Current Trust Score
              </p>
              <ScoreGauge score={CURRENT_SCORE} maxScore={1000} minScore={0} size={200} animated={false} />
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

            {/* Expected increase */}
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
                    <p className="text-3xl font-display font-bold gradient-text tabular-nums">
                      +{totalPotentialBoost}
                    </p>
                  </div>
                </div>
                <div className="glass rounded-2xl p-6 text-center border-primary-500/30 bg-primary-500/5 relative shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-500/10 to-transparent rounded-2xl pointer-events-none" />
                  <p className="text-slate-300 text-sm font-medium mb-1 tracking-wider uppercase">Projected Trust Score</p>
                  <p className="font-display text-5xl font-bold text-white tabular-nums my-2 drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">{projectedScore}</p>
                  <p className="text-primary-300 text-sm font-medium">
                    +{remainingBoost} pts remaining to unlock
                  </p>
                </div>
              </div>
            </div>

            {/* Loan unlock levels */}
            <div className="glass-card glass-card-static">
              <h2 className="heading-card text-white mb-6">Loan Unlock Levels</h2>
              <div className="space-y-2">
                {loanUnlockLevels.map((tier) => (
                  <div
                    key={tier.minScore}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                      tier.current
                        ? "border-primary-500/50 bg-primary-500/10 glow-blue"
                        : tier.unlocked
                          ? "border-green-500/20 bg-green-500/5"
                          : "border-white/5 bg-white/[0.02] opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          tier.unlocked ? "bg-green-400/20 text-green-400" : "bg-white/5 text-slate-500"
                        }`}
                      >
                        {tier.unlocked ? "✓" : "🔒"}
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{tier.amount}</p>
                        <p className="text-slate-500 text-xs">Score {tier.minScore}+ · {tier.rate}</p>
                      </div>
                    </div>
                    {tier.current && (
                      <span className="text-primary-300 text-xs font-semibold">You are here</span>
                    )}
                    {!tier.unlocked && !tier.current && (
                      <span className="text-slate-500 text-xs">+{tier.minScore - CURRENT_SCORE} pts</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Roadmap + milestones */}
          <div className="lg:col-span-2 stack-xl">
            {/* Roadmap */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="heading-card text-white text-lg">Your Roadmap</h2>
                <span className="text-slate-400 text-xs">{tasks.filter((t) => t.status === "completed").length} of {tasks.length} complete</span>
              </div>
              <div className="space-y-4">
                {tasks.map((task, i) => {
                  const badge = statusLabel(task.status);
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
                            border: `1px solid ${task.color}44`,
                            color: task.color,
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
                                  width: `${task.progress}%`,
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
                          onClick={() => toggleTaskProgress(task.id)}
                          className="btn-outline text-xs py-2 px-3 shrink-0 self-start sm:self-center"
                        >
                          {task.progress >= 100 ? "Reset" : "Mark progress"}
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
                    const active = CURRENT_SCORE + earnedBoost >= m.score;
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
                            {active && (
                              <span className="text-green-400 text-xs font-medium">Reached</span>
                            )}
                            {!active && upcoming && (
                              <span className="text-primary-300 text-xs font-medium">On track</span>
                            )}
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
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 30% 50%, #60b7f7 0%, transparent 50%), radial-gradient(circle at 70% 50%, #3b96f2 0%, transparent 50%)",
                }}
              />
              <div className="relative z-10">
                <h3 className="heading-card text-white text-xl mb-3">
                  Complete your next action today
                </h3>
                <p className="text-primary-200 text-sm mb-5 max-w-md mx-auto">
                  Pay your next utility bill to move closer to the ₹12L unlock tier.
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
