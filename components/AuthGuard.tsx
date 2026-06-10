"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthContext";

interface AuthGuardProps {
  requiredRole: "borrower" | "lender" | "admin";
  children: React.ReactNode;
}

export default function AuthGuard({ requiredRole, children }: AuthGuardProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="page-body flex min-h-screen items-center justify-center bg-[#080c18] text-white px-6 py-24">
        <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/5 p-12 text-center shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Authentication Required</p>
          <h1 className="mt-6 text-3xl font-semibold">Please sign in to continue</h1>
          <p className="mt-4 text-slate-300">UdaanScore uses role-based access so the right dashboard opens for borrowers, lenders, and admins.</p>
          <Link href="/auth/login" className="mt-8 inline-flex rounded-full bg-primary-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-400 transition-colors">
            Sign in / Switch role
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== requiredRole) {
    return (
      <div className="page-body flex min-h-screen items-center justify-center bg-[#080c18] text-white px-6 py-24">
        <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/5 p-12 text-center shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Access Denied</p>
          <h1 className="mt-6 text-3xl font-semibold">You need a different role</h1>
          <p className="mt-4 text-slate-300">You are signed in as <span className="font-semibold text-white">{user.role}</span>. This page requires a <span className="font-semibold text-white">{requiredRole}</span> account.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/auth/login" className="inline-flex rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/15 transition">
              Switch role
            </Link>
            <button onClick={() => window.location.assign("/")} className="inline-flex rounded-full border border-white/10 bg-transparent px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5 transition">
              Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
