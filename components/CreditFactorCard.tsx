"use client";

import { motion } from "framer-motion";

interface CreditFactorCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  percentage: number;
  trend: "up" | "down" | "stable";
  trendText: string;
  color: string;
}

export default function CreditFactorCard({
  icon, label, value, percentage, trend, trendText, color,
}: CreditFactorCardProps) {
  const trendColor =
    trend === "up"     ? "text-green-400" :
    trend === "down"   ? "text-red-400"   : "text-slate-400";

  const trendIcon =
    trend === "up"   ? "↑" :
    trend === "down" ? "↓" : "→";

  return (
    <motion.div 
      whileHover={{ scale: 1.02, boxShadow: `0 8px 30px ${color}15`, borderColor: `${color}30` }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="glass-card flex flex-col gap-5 cursor-default"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${color}14`, border: `1px solid ${color}28`, color }}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-caption font-medium mb-1">{label}</p>
            <p className="text-white font-semibold text-base tracking-tight">{value}</p>
          </div>
        </div>
        <span className={`text-sm font-medium shrink-0 ${trendColor}`}>
          {trendIcon} {trendText}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-caption">
          <span>Trust contribution</span>
          <span className="text-slate-300 font-medium tabular-nums">{percentage}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${color}66, ${color})`,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}