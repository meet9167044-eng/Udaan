"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { getAllBorrowers, type BorrowerProfile } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";

export default function LenderPage() {
  const { user } = useAuth();
  const [borrowers, setBorrowers] = useState<BorrowerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getAllBorrowers()
      .then((res) => {
        if (!active) return;
        setBorrowers(res.borrowers.sort((a, b) => b.trust_score - a.trust_score));
      })
      .catch(console.error)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <AuthGuard requiredRole="lender">
      <div className="page-body" style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, #0f1a30 0%, #080c18 55%)" }}>
        <div className="page-container pt-8 md:pt-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
            <div className="max-w-2xl">
              <p className="section-label">Lender Dashboard</p>
              <h1 className="heading-page text-white mt-2 mb-4">Borrower Risk Intelligence</h1>
              <p className="body-md text-slate-300">Review borrower Trust Scores, fraud signals, and loan recommendation guidance for fast underwriting decisions.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-slate-300">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Signed in as</p>
              <p className="mt-3 text-lg font-semibold text-white">{user?.name}</p>
              <p className="text-sm text-slate-400">Role: Lender</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 mb-10">
            <div className="glass-card glass-card-static">
              <p className="text-slate-400 text-sm">Borrowers monitored</p>
              <p className="mt-3 text-4xl font-semibold text-white">{borrowers.length}</p>
            </div>
            <div className="glass-card glass-card-static">
              <p className="text-slate-400 text-sm">High-risk alerts</p>
              <p className="mt-3 text-4xl font-semibold text-amber-300">{borrowers.filter((b) => b.risk_band.includes("High") || b.risk_band === "Rejected").length}</p>
            </div>
            <div className="glass-card glass-card-static">
              <p className="text-slate-400 text-sm">Top score</p>
              <p className="mt-3 text-4xl font-semibold text-white">{borrowers[0]?.trust_score ?? "--"}</p>
            </div>
          </div>

          <div className="glass-card glass-card-static p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="heading-card text-white">Borrower scorebook</h2>
                <p className="text-slate-400 mt-2 text-sm">Sorted by Trust Score and risk band for quick decision-making.</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <span className="rounded-full bg-slate-800/70 px-4 py-2 text-xs uppercase tracking-[0.25em] text-slate-400">Role-based report</span>
                <span className="rounded-full bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-emerald-300">Fraud-aware</span>
              </div>
            </div>

            {loading ? (
              <div className="text-slate-400">Loading borrower data...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-300">
                  <thead className="text-slate-400 uppercase tracking-[0.18em] text-xs">
                    <tr>
                      <th className="pb-4 pr-4">Borrower</th>
                      <th className="pb-4 pr-4">Trust Score</th>
                      <th className="pb-4 pr-4">Risk Band</th>
                      <th className="pb-4 pr-4">Loan Limit</th>
                      <th className="pb-4">City</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {borrowers.slice(0, 10).map((borrower) => (
                      <tr key={borrower.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 pr-4 font-medium text-white">{borrower.name}</td>
                        <td className="py-4 pr-4 font-semibold text-white">{borrower.trust_score}</td>
                        <td className="py-4 pr-4 text-slate-300">{borrower.risk_band}</td>
                        <td className="py-4 pr-4 text-slate-300">₹{borrower.loan_limit.toLocaleString()}</td>
                        <td className="py-4 text-slate-300">{borrower.city}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
