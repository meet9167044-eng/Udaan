"use client";

import { useMemo, useState } from "react";
import { useAuth, type UserRole } from "@/components/AuthContext";
import { useRouter } from "next/navigation";

const borrowerProfiles = [
  "Raju Sharma",
  "Priya Patel",
  "Arjun Mehta",
  "Sunita Verma",
];

const roleOptions: { value: UserRole; label: string; description: string }[] = [
  { value: "borrower", label: "Borrower", description: "Check your Trust Score, consent vault, loan journey and simulator." },
  { value: "lender", label: "Lender", description: "Review borrower risk profiles, fraud alerts and credit recommendations." },
  { value: "admin",   label: "Admin",   description: "Monitor platform metrics and governance for UdaanScore." },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("borrower");
  const [borrowerName, setBorrowerName] = useState<string>(borrowerProfiles[0]);
  const [guestName, setGuestName] = useState("Udaan User");

  const intro = useMemo(() => {
    const selected = roleOptions.find((option) => option.value === role);
    return selected?.description ?? "Select a role to continue.";
  }, [role]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const session = {
      role,
      name: role === "borrower" ? borrowerName : role === "lender" ? "Lender Partner" : "Udaan Admin",
      borrowerName: role === "borrower" ? borrowerName : undefined,
    };
    login(session);
    router.refresh();
  };

  return (
    <div className="page-body bg-[#080c18] min-h-screen py-20 text-white">
      <div className="page-container mx-auto grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-[0_40px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">UdaanScore Sign In</p>
          <h1 className="mt-6 text-4xl font-semibold">Choose your role and continue</h1>
          <p className="mt-4 max-w-xl text-slate-300">For this hackathon MVP, role-based authentication is powered by a simple client-side session. Borrowers, lenders and admins can sign in instantly.</p>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {roleOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRole(option.value)}
                className={`rounded-3xl border px-5 py-4 text-left transition ${role === option.value ? "border-primary-400 bg-primary-500/10 text-white" : "border-white/10 bg-white/5 text-slate-300 hover:border-primary-500/20 hover:bg-white/10"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-lg font-semibold">{option.label}</span>
                  {role === option.value && <span className="text-sm text-primary-300">Selected</span>}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{option.description}</p>
              </button>
            ))}
          </div>

          <div className="mt-10 border-t border-white/10 pt-8">
            <h2 className="text-xl font-semibold">Step 2: Complete sign in</h2>
            <p className="mt-2 text-slate-400">{intro}</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {role === "borrower" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Borrower profile</label>
                  <select
                    value={borrowerName}
                    onChange={(event) => setBorrowerName(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#0b1221] px-4 py-3 text-white outline-none focus:border-primary-400"
                  >
                    {borrowerProfiles.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Display name</label>
                  <input
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#0b1221] px-4 py-3 text-white outline-none focus:border-primary-400"
                  />
                </div>
              )}

              <button className="inline-flex w-full items-center justify-center rounded-full bg-primary-500 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition hover:bg-primary-400">
                Sign in as {role === "borrower" ? "Borrower" : role === "lender" ? "Lender" : "Admin"}
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/80 to-slate-900/70 p-10 shadow-[0_40px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="rounded-3xl bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.35em] text-primary-300">Why auth matters</p>
            <ul className="mt-6 space-y-4 text-slate-300 text-sm leading-relaxed">
              <li>• Borrowers get a personalized Trust Score dashboard and credit builder journey.</li>
              <li>• Lenders receive masked borrower risk profiles and fraud insights.</li>
              <li>• Admins can review platform health and user approvals.</li>
            </ul>
          </div>

          <div className="mt-8 grid gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Hackathon MVP</p>
              <p className="mt-3 text-slate-300 text-sm leading-relaxed">This demo uses client-side role selection so visitors can switch between borrower, lender, and admin experiences instantly.</p>
            </div>
            <div className="rounded-3xl border border-primary-500/20 bg-primary-500/5 p-5">
              <p className="text-sm uppercase tracking-[0.28em] text-primary-300">Tip</p>
              <p className="mt-3 text-slate-200 text-sm leading-relaxed">Use the same browser to preserve your session across pages, or refresh to reset the demo state.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
