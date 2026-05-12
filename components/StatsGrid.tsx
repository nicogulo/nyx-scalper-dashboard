"use client";

import { motion } from "framer-motion";

interface StatsGridProps {
  dailyPnl: number;
  tradesToday: number;
  wins: number;
  losses: number;
  totalTrades: number;
  liveSignals: number;
  errors: number;
  lastActivity: string;
}

export default function StatsGrid({
  dailyPnl,
  tradesToday,
  wins,
  losses,
  totalTrades,
  liveSignals,
  errors,
  lastActivity,
}: StatsGridProps) {
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(0) : "0";
  const pnlPositive = dailyPnl >= 0;

  const stats = [
    {
      label: "Daily PnL",
      value: `${pnlPositive ? "+" : ""}$${dailyPnl.toFixed(2)}`,
      icon: "💰",
      color: pnlPositive ? "text-emerald-400" : "text-red-400",
      glow: pnlPositive ? "glow-green" : "glow-red",
    },
    {
      label: "Trades Today",
      value: `${tradesToday}`,
      icon: "📊",
      color: "text-cyan-400",
      glow: "glow-cyan",
    },
    {
      label: "Win Rate",
      value: `${winRate}%`,
      icon: "🎯",
      color: "text-purple-400",
      glow: "glow-purple",
      sub: `${wins}W / ${losses}L`,
    },
    {
      label: "Live Signals",
      value: `${liveSignals}`,
      icon: "📡",
      color: "text-yellow-400",
      glow: "",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`rounded-xl border border-slate-700/50 bg-[#12122a] p-4 ${stat.glow}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{stat.icon}</span>
            <span className="text-xs text-slate-500 uppercase tracking-wider">
              {stat.label}
            </span>
          </div>
          <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
          {stat.sub && (
            <div className="text-xs text-slate-500 mt-1">{stat.sub}</div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
