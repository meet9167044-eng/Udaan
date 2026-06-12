"use client";

import { useState } from "react";

interface PsychometricModalProps {
  onComplete: (score: number, boost: number) => void;
  onClose: () => void;
}

const QUESTIONS = [
  {
    q: "When you receive unexpected income, what do you typically do first?",
    options: [
      { text: "Save at least 30% immediately",       score: 4 },
      { text: "Pay any pending bills first",          score: 3 },
      { text: "Plan my expenses for the next month",  score: 3 },
      { text: "Spend on things I've been wanting",    score: 1 },
    ],
  },
  {
    q: "How do you handle a financial emergency (e.g. medical bill)?",
    options: [
      { text: "Use my emergency savings",             score: 4 },
      { text: "Borrow from family/friends",           score: 2 },
      { text: "Take a short-term loan",               score: 2 },
      { text: "I don't have a plan",                  score: 0 },
    ],
  },
  {
    q: "How often do you track your monthly expenses?",
    options: [
      { text: "Daily – using an app or notebook",     score: 4 },
      { text: "Weekly check of my bank statement",    score: 3 },
      { text: "Occasionally when I remember",         score: 1 },
      { text: "I don't track expenses",               score: 0 },
    ],
  },
  {
    q: "If you had ₹10,000 to spare, which would you choose?",
    options: [
      { text: "Add to my savings / fixed deposit",    score: 4 },
      { text: "Repay an existing loan early",         score: 4 },
      { text: "Invest in a small business idea",      score: 3 },
      { text: "Buy something I've been wanting",      score: 1 },
    ],
  },
  {
    q: "How do you view taking a loan?",
    options: [
      { text: "A tool to grow — I plan repayment first",           score: 4 },
      { text: "Necessary sometimes but I'm cautious",              score: 3 },
      { text: "I try to avoid it unless absolutely needed",        score: 2 },
      { text: "I don't worry much about repayment terms",          score: 0 },
    ],
  },
];

export default function PsychometricModal({ onComplete, onClose }: PsychometricModalProps) {
  const [step, setStep]         = useState(0);
  const [answers, setAnswers]   = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone]         = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const progress = ((step) / QUESTIONS.length) * 100;

  const handleSelect = (score: number, idx: number) => {
    setSelected(idx);
    setTimeout(() => {
      const newAnswers = [...answers, score];
      if (step + 1 >= QUESTIONS.length) {
        const total   = newAnswers.reduce((a, b) => a + b, 0);
        const maxPoss = QUESTIONS.length * 4;
        const pct     = Math.round((total / maxPoss) * 100);
        const boost   = Math.round(10 + (pct / 100) * 12); // 10–22 pts boost
        setFinalScore(pct);
        setDone(true);
        setTimeout(() => onComplete(pct, boost), 1800);
      } else {
        setAnswers(newAnswers);
        setStep(step + 1);
        setSelected(null);
      }
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(5,7,14,0.85)", backdropFilter: "blur(16px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-lg glass-card glass-card-static animate-slide-up"
        style={{ border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 0 60px rgba(139,92,246,0.15)" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          ×
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
          </div>
          <div>
            <h2 className="heading-card text-white">Psychometric Assessment</h2>
            <p className="text-caption">5 quick questions · Boosts your Trust Score</p>
          </div>
        </div>

        {/* Progress */}
        {!done && (
          <>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-400">Question {step + 1} of {QUESTIONS.length}</span>
              <span className="text-violet-400 font-semibold">+22 pts potential</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 mb-6 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        )}

        {done ? (
          /* Done state */
          <div className="text-center py-8">
            <div className="text-6xl mb-4 animate-bounce">🧠</div>
            <h3 className="text-white font-display font-bold text-2xl mb-2">Assessment Complete!</h3>
            <p className="text-slate-400 text-sm mb-6">
              Financial Discipline Score:{" "}
              <span className="text-violet-400 font-bold text-lg">{finalScore}%</span>
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-sm font-semibold">
                Trust Score boosted · Processing…
              </span>
            </div>
          </div>
        ) : (
          /* Question */
          <div>
            <p className="text-white font-medium text-base mb-5 leading-relaxed">
              {QUESTIONS[step].q}
            </p>
            <div className="space-y-3">
              {QUESTIONS[step].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(opt.score, idx)}
                  disabled={selected !== null}
                  className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all duration-300 ${
                    selected === idx
                      ? "border-violet-500/60 bg-violet-500/15 text-violet-300"
                      : selected !== null
                      ? "border-white/5 bg-white/[0.01] text-slate-500 cursor-not-allowed"
                      : "border-white/10 bg-white/[0.02] text-slate-300 hover:border-violet-500/40 hover:bg-violet-500/5 hover:text-white"
                  }`}
                >
                  <span className="mr-3 text-slate-500 font-mono text-xs">{String.fromCharCode(65 + idx)}.</span>
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
