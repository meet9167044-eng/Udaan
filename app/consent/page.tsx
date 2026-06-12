"use client";

import { useState, useEffect, useCallback } from "react";
import { getSession, getBorrowerName } from "@/lib/auth";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ConsentState {
  borrower_name: string;
  bank_data: boolean;
  upi_data: boolean;
  utility_bills: boolean;
  gst_data: boolean;
  location_data: boolean;
  psychometric_data: boolean;
  consented_at: string;
}

/* ── Static source metadata (icons + labels) ──────────────── */
const SOURCE_META: Record<
  keyof Omit<ConsentState, "borrower_name" | "consented_at">,
  { label: string; description: string; dataPoints: string[]; institution: string; icon: React.ReactNode }
> = {
  bank_data: {
    label: "HDFC Bank",
    institution: "Bank Account",
    description: "Account statements, transactions, EMI status",
    dataPoints: ["Balance", "Transactions", "EMI status", "Savings avg."],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
  upi_data: {
    label: "UPI / NPCI",
    institution: "UPI Network",
    description: "UPI transaction patterns, merchant payments",
    dataPoints: ["P2P transfers", "Merchant payments", "Velocity"],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  utility_bills: {
    label: "Jio / Electricity",
    institution: "Utility Bills",
    description: "Bill payment history, recharge patterns",
    dataPoints: ["Bill payments", "Plan history", "Usage patterns"],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  gst_data: {
    label: "GST Portal",
    institution: "Business Tax",
    description: "Business income, GST filings, turnover",
    dataPoints: ["GST returns", "Turnover", "Tax compliance"],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
      </svg>
    ),
  },
  location_data: {
    label: "Geolocation",
    institution: "Location Signals",
    description: "Residential stability, geo-pattern analysis",
    dataPoints: ["Home location", "Stability score", "Movement history"],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  },
  psychometric_data: {
    label: "Psychometric",
    institution: "Behavioral Assessment",
    description: "Financial behavior quiz and risk profile",
    dataPoints: ["Risk attitude", "Financial discipline", "Quiz score"],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
      </svg>
    ),
  },
};

const CONSENT_FIELDS = Object.keys(SOURCE_META) as Array<keyof typeof SOURCE_META>;

/* ── Static audit log (mock) ─────────────────────────────── */
const auditLog = [
  { action: "Data Accessed", source: "HDFC Bank", by: "UdaanScore", time: "Today, 10:30 AM", type: "read" },
  { action: "Consent Granted", source: "CIBIL Bureau", by: "You", time: "Yesterday, 3:14 PM", type: "grant" },
  { action: "Data Accessed", source: "Jio Telecom", by: "HDFC Bank", time: "3 days ago", type: "read" },
  { action: "Consent Updated", source: "GST Portal", by: "You", time: "2 weeks ago", type: "pause" },
  { action: "Consent Revoked", source: "UPI / NPCI", by: "You", time: "1 month ago", type: "revoke" },
];

const typeConfig = {
  read: { color: "text-blue-400", bg: "bg-blue-400/10", label: "Read" },
  grant: { color: "text-green-400", bg: "bg-green-400/10", label: "Granted" },
  pause: { color: "text-yellow-400", bg: "bg-yellow-400/10", label: "Updated" },
  revoke: { color: "text-red-400", bg: "bg-red-400/10", label: "Revoked" },
};

export default function ConsentVaultPage() {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [borrowerName, setBorrowerName] = useState("Raju Sharma");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Get borrower name from session
  useEffect(() => {
    const session = getSession();
    if (session?.role === "borrower") {
      setBorrowerName(session.name);
    }
  }, []);

  // Load consent from backend
  const loadConsent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/vault/consent/${encodeURIComponent(borrowerName)}`);
      if (!res.ok) throw new Error("Failed to load consent");
      const data = await res.json();
      setConsent(data);
    } catch {
      showToast("Could not load consent data. Ensure backend is running.", "error");
    } finally {
      setLoading(false);
    }
  }, [borrowerName]);

  useEffect(() => {
    loadConsent();
  }, [loadConsent]);

  // Toggle a single consent field
  const toggleField = async (field: keyof typeof SOURCE_META, value: boolean) => {
    if (!consent) return;
    setSaving(field);
    // Optimistic update
    setConsent((prev) => prev ? { ...prev, [field]: value } : prev);
    try {
      const res = await fetch(`${BASE}/vault/consent/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ borrower_name: borrowerName, [field]: value }),
      });
      if (!res.ok) throw new Error("Update failed");
      showToast(`${SOURCE_META[field].label} consent ${value ? "enabled" : "disabled"}`);
    } catch {
      // Revert on error
      setConsent((prev) => prev ? { ...prev, [field]: !value } : prev);
      showToast("Failed to update consent", "error");
    } finally {
      setSaving(null);
    }
  };

  // Revoke all consent
  const revokeAll = async () => {
    if (!window.confirm("Revoke ALL data sharing permissions? This will affect your Trust Score.")) return;
    setRevokeLoading(true);
    try {
      await fetch(`${BASE}/vault/consent/revoke/${encodeURIComponent(borrowerName)}`, { method: "DELETE" });
      showToast("All consent revoked successfully");
      await loadConsent();
    } catch {
      showToast("Failed to revoke consent", "error");
    } finally {
      setRevokeLoading(false);
    }
  };

  const activeCount = consent ? CONSENT_FIELDS.filter((f) => consent[f]).length : 0;
  const revokedCount = consent ? CONSENT_FIELDS.filter((f) => !consent[f]).length : 0;

  return (
    <div
      className="page-body relative"
      style={{ background: "radial-gradient(ellipse 85% 45% at 50% 0%, #120f2a 0%, #080c18 55%)" }}
    >
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-24 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl transition-all duration-300 ${
            toast.type === "success"
              ? "bg-green-500/20 border border-green-500/30 text-green-300"
              : "bg-red-500/20 border border-red-500/30 text-red-300"
          }`}
        >
          {toast.type === "success" ? "✓ " : "✗ "}{toast.msg}
        </div>
      )}

      <div className="page-container pt-8 md:pt-12">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8 mb-10">
          <div className="max-w-lg">
            <div className="flex items-center gap-3 mb-3">
              <p className="section-label !mb-0">Consent Vault</p>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-500/15 text-violet-300 border border-violet-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />DPDP Compliant
              </span>
            </div>
            <h1 className="heading-page text-white mt-2 mb-4">
              Your Data, <span className="gradient-text">Your Rules</span>
            </h1>
            <p className="body-md max-w-lg">
              You control exactly who can access your financial data. Toggle permissions anytime with full audit transparency.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-3 shrink-0">
            {[
              { label: "Connected",    value: activeCount,           color: "text-green-400",   bg: "border-green-500/20" },
              { label: "Revoked",      value: revokedCount,          color: "text-red-400",     bg: "border-red-500/20"   },
              { label: "Total Sources",value: CONSENT_FIELDS.length, color: "text-primary-400", bg: "border-primary-500/20" },
            ].map((s) => (
              <div key={s.label} className={`glass-card glass-card-static glass-card-compact text-center min-w-[90px] ${s.bg}`}>
                <p className={`font-display text-2xl font-bold tracking-tight ${s.color}`}>{s.value}</p>
                <p className="text-caption mt-1 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security badges */}
        <div className="flex flex-wrap gap-3 mb-12">
          {[
            { icon: "🔒", label: "256-bit AES Encrypted" },
            { icon: "🛡", label: "RBI DPDP Compliant" },
            { icon: "✓", label: "ISO 27001 Certified" },
            { icon: "👁", label: "Zero Data Selling" },
          ].map((badge) => (
            <div key={badge.label} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full glass border border-white/10 text-sm">
              <span>{badge.icon}</span>
              <span className="text-slate-300 font-medium text-xs">{badge.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Data Sources */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="heading-card text-white text-lg">Connected Data Sources</h2>
              <button
                id="consent-revoke-all"
                onClick={revokeAll}
                disabled={revokeLoading || loading}
                className="text-red-400 hover:text-red-300 text-xs font-medium border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
              >
                {revokeLoading ? "Revoking…" : "Revoke All"}
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
                {CONSENT_FIELDS.map((field) => {
                  const meta = SOURCE_META[field];
                  const isOn = consent ? consent[field] : false;
                  const isSaving = saving === field;

                  return (
                    <div
                      key={field}
                      className={`glass-card glass-card-static transition-all duration-300 ${
                        isOn ? "border-primary-500/20" : "border-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                              isOn ? "bg-primary-500/15 text-primary-400" : "bg-white/[0.04] text-slate-500"
                            }`}
                          >
                            {meta.icon}
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{meta.label}</p>
                            <p className="text-slate-500 text-xs">{meta.institution}</p>
                          </div>
                        </div>

                        {/* Toggle */}
                        <button
                          id={`consent-toggle-${field}`}
                          onClick={() => toggleField(field, !isOn)}
                          disabled={isSaving}
                          className={`relative w-11 h-6 rounded-full transition-all duration-300 shrink-0 ${
                            isOn ? "bg-primary-500" : "bg-white/10"
                          } disabled:opacity-60`}
                          aria-label={`Toggle ${meta.label}`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 flex items-center justify-center ${
                              isOn ? "translate-x-5" : "translate-x-0"
                            }`}
                          >
                            {isSaving && (
                              <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            )}
                          </span>
                        </button>
                      </div>

                      <p className="text-slate-400 text-xs mb-3 leading-relaxed">{meta.description}</p>

                      <div className="flex flex-wrap gap-1.5">
                        {meta.dataPoints.map((dp) => (
                          <span
                            key={dp}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.04] text-slate-400 border border-white/[0.06]"
                          >
                            {dp}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/[0.05]">
                        <span
                          className={`text-xs font-semibold ${isOn ? "text-green-400" : "text-slate-500"}`}
                        >
                          {isOn ? "● Sharing active" : "○ Sharing paused"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Audit log + Privacy info */}
          <div className="space-y-6">
            <div className="glass-card glass-card-static">
              <h2 className="heading-card text-white mb-6">Audit Log</h2>
              <div className="space-y-4">
                {auditLog.map((entry, i) => {
                  const cfg = typeConfig[entry.type as keyof typeof typeConfig];
                  return (
                    <div key={i} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
                              {cfg.label}
                            </span>
                            <span className="text-slate-300 text-xs truncate">{entry.source}</span>
                          </div>
                          <p className="text-slate-500 text-xs">{entry.action} by {entry.by}</p>
                        </div>
                        <span className="text-slate-500 text-xs shrink-0 text-right">{entry.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button id="audit-download" className="btn-outline text-xs w-full py-2 mt-4">
                ↓ Download Full Report
              </button>
            </div>

            {/* Data rights */}
            <div className="glass-card glass-card-static">
              <h2 className="heading-card text-white mb-6">Your Data Rights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: "👁", right: "Right to View", desc: "See all data we hold about you anytime." },
                  { icon: "✏", right: "Right to Correct", desc: "Fix inaccurate data in your profile." },
                  { icon: "🗑", right: "Right to Delete", desc: "Request permanent deletion of your data." },
                  { icon: "📦", right: "Right to Export", desc: "Download all your data in JSON format." },
                ].map((r) => (
                  <div
                    key={r.right}
                    className="flex flex-col gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl group-hover:scale-110 transition-transform">{r.icon}</span>
                      <svg className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{r.right}</p>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button id="data-rights-request" className="btn-primary text-sm w-full py-3 mt-6 shadow-[0_0_20px_rgba(37,120,230,0.15)]">
                Submit a Data Request
              </button>
            </div>

            {/* DPDP Notice */}
            <div className="glass rounded-xl p-5 border border-primary-500/15">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span className="text-primary-400 text-xs font-semibold">DPDP Act 2023</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                UdaanScore is fully compliant with India&apos;s Digital Personal Data Protection Act.
                We never sell your data or share it without your explicit consent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
