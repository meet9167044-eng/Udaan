"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { getAllBorrowers, type BorrowerProfile } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";

export default function AdminPage() {
  const { user } = useAuth();
  const [borrowers, setBorrowers] = useState<BorrowerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getAllBorrowers()
      .then((res) => {
        if (!active) return;
        setBorrowers(res.borrowers);
      })
      .catch(console.error)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const avgScore = Math.round(borrowers.reduce((sum, borrower) => sum + borrower.trust_score, 0) / Math.max(1, borrowers.length));
  const highRiskCount = borrowers.filter((borrower) => borrower.risk_band.includes("High") || borrower.risk_band === "Rejected").length;

  return (
    <AuthGuard requiredRole="admin">
      <div className="page-body" style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, #0f1a30 0%, #080c18 55%)" }}>
        <div className="page-container pt-8 md:pt-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
            <div className="max-w-2xl">
              <p className="section-label">Admin Console</p>
              <h1 className="heading-page text-white mt-2 mb-4">Platform Oversight</h1>
              <p className="body-md text-slate-300">Review borrower health, role activity and system readiness from a single admin panel.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-slate-300">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Signed in as</p>
              <p className="mt-3 text-lg font-semibold text-white">{user?.name}</p>
              <p className="text-sm text-slate-400">Role: Admin</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 mb-10">
            <div className="glass-card glass-card-static">
              <p className="text-slate-400 text-sm">Total borrowers</p>
              <p className="mt-3 text-4xl font-semibold text-white">{borrowers.length}</p>
            </div>
            <div className="glass-card glass-card-static">
              <p className="text-slate-400 text-sm">Average trust score</p>
              <p className="mt-3 text-4xl font-semibold text-white">{loading ? "..." : avgScore}</p>
            </div>
            <div className="glass-card glass-card-static">
              <p className="text-slate-400 text-sm">High-risk count</p>
              <p className="mt-3 text-4xl font-semibold text-amber-300">{loading ? "..." : highRiskCount}</p>
            </div>
          </div>

          <div className="glass-card glass-card-static p-6">
            <h2 className="heading-card text-white">Compliance snapshot</h2>
            <p className="text-slate-400 mt-2 text-sm">A quick view of risk distribution and sample borrower behavior across the platform.</p>
            {loading ? (
              <div className="mt-6 text-slate-400">Loading borrower metrics...</div>
            ) : (
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-slate-400 uppercase tracking-[0.25em] text-xs">Top cities</p>
                  <p className="mt-4 text-white">{Array.from(new Set(borrowers.map((item) => item.city))).slice(0, 3).join(", ")}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-slate-400 uppercase tracking-[0.25em] text-xs">Average loan limit</p>
                  <p className="mt-4 text-white">₹{Math.round(borrowers.reduce((sum, borrower) => sum + borrower.loan_limit, 0) / Math.max(1, borrowers.length)).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
