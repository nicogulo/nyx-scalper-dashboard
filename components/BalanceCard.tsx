"use client";

import { motion } from "framer-motion";

interface BalanceCardProps {
  label: string;
  wallet: number;
  available: number;
  unrealized: number;
  icon: string;
  color: "cyan" | "purple";
  error?: boolean;
}

export default function BalanceCard({
  label,
  wallet,
  available,
  unrealized,
  icon,
  color,
  error,
}: BalanceCardProps) {
  const borderColor =
    color === "cyan" ? "border-cyan-500/30" : "border-purple-500/30";
  const glowClass = color === "cyan" ? "glow-cyan" : "glow-purple";
  const accentColor =
    color === "cyan" ? "text-cyan-400" : "text-purple-400";
  const pnlColor = unrealized >= 0 ? "text-emerald-400" : "text-red-400";

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl border ${borderColor} bg-[#12122a] p-5 ${glowClass}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{icon}</span>
          <span className={`font-semibold ${accentColor}`}>{label}</span>
        </div>
        <div className="text-red-400 text-sm">⚠️ API Error</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`rounded-xl border ${borderColor} bg-[#12122a] p-5 card-hover ${glowClass}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className={`font-semibold ${accentColor}`}>{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
          <span className="text-xs text-slate-400">Live</span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
            Wallet
          </div>
          <div className="text-2xl font-bold tracking-tight">
            ${wallet.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
              Available
            </div>
            <div className="text-sm font-medium text-slate-300">
              ${available.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
              Unrealized
            </div>
            <div className={`text-sm font-bold ${pnlColor}`}>
              {unrealized >= 0 ? "+" : ""}$
              {unrealized.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
