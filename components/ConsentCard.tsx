"use client";

import { useState } from "react";

interface ConsentCardProps {
  icon: React.ReactNode;
  source: string;
  description: string;
  status: "active" | "paused" | "revoked";
  lastUpdated: string;
  dataPoints: string[];
}

export default function ConsentCard({
  icon, source, description, status, lastUpdated, dataPoints,
}: ConsentCardProps) {
  const [enabled, setEnabled] = useState(status === "active");
  const [isRevoked, setIsRevoked] = useState(status === "revoked");
  const [showRevokeModal, setShowRevokeModal] = useState(false);

  const statusConfig = {
    active:  { color: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/20",  dot: "bg-green-400"  },
    paused:  { color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", dot: "bg-yellow-400" },
    revoked: { color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/20",    dot: "bg-red-400"    },
  };

  const currentStatus = isRevoked ? "revoked" : enabled ? "active" : "paused";
  const cfg = statusConfig[currentStatus];

  const handleRevoke = () => {
    setIsRevoked(true);
    setEnabled(false);
    setShowRevokeModal(false);
  };

  return (
    <>
      <div className={`glass-card glass-card-static transition-opacity duration-300 ${!enabled && !isRevoked ? "opacity-75" : isRevoked ? "opacity-50 grayscale" : ""}`}>
        <div className="flex items-start justify-between gap-6 mb-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-primary-400 shrink-0">
              {icon}
            </div>
            <div className="min-w-0">
              <h3 className="heading-card text-white">{source}</h3>
              <p className="text-caption mt-1">{description}</p>
            </div>
          </div>

          {!isRevoked && (
            <button
              id={`consent-toggle-${source.replace(/\s+/g, "-").toLowerCase()}`}
              onClick={() => setEnabled(!enabled)}
              className={`relative w-11 h-6 rounded-full shrink-0 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 ${
                enabled ? "bg-primary-600" : "bg-white/10"
              }`}
              aria-label={`Toggle ${source} consent`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${
                  enabled ? "left-6" : "left-1"
                }`}
              />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            <span className={`w-2 h-2 rounded-full ${cfg.dot} ${enabled && !isRevoked ? "animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" : ""}`} />
            {isRevoked ? "Revoked" : enabled ? "Active" : "Paused"}
          </span>
          <span className="text-caption font-medium">Updated {lastUpdated}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {dataPoints.map((dp) => (
            <span
              key={dp}
              className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-caption"
            >
              {dp}
            </span>
          ))}
        </div>

        {!isRevoked && (
          <div className="pt-4 mt-2 border-t border-white/[0.06] flex justify-end">
            <button
              onClick={() => setShowRevokeModal(true)}
              className="text-xs font-semibold text-slate-500 hover:text-red-400 transition-colors px-2 py-1"
            >
              Revoke Access Permanently
            </button>
          </div>
        )}
      </div>

      {/* Revoke Modal */}
      {showRevokeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: "rgba(5,7,14,0.85)", backdropFilter: "blur(8px)" }}
        >
          <div className="relative w-full max-w-sm glass-card glass-card-static animate-slide-up border-red-500/30">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5 mx-auto text-red-400 text-xl">
              !
            </div>
            <h3 className="heading-card text-center text-white mb-2">Revoke {source}?</h3>
            <p className="text-slate-400 text-sm text-center mb-6">
              If you revoke access, we will immediately delete the synced data. Your Trust Score may drop significantly.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRevokeModal(false)}
                className="btn-outline flex-1 text-sm py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                className="flex-1 text-sm py-2 px-4 rounded-xl font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                Yes, Revoke
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
