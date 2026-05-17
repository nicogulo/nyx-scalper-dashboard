"use client";

import { motion } from "framer-motion";

interface StatsGridProps {
  dailyPnl: number;
  dailyFees: number;
  dailyNet: number;
  tradesToday: number;
  wins: number;
  losses: number;
  totalTrades: number;
  liveSignals: number;
  errors: number;
  lastActivity: string;
  overallNet: number;
  overallPnl: number;
  overallFees: number;
  overallTrades: number;
  overallWins: number;
  overallLosses: number;
}

export default function StatsGrid({
  dailyPnl,
  dailyFees,
  dailyNet,
  tradesToday,
  wins,
  losses,
  totalTrades,
  liveSignals,
  errors,
  lastActivity,
  overallNet,
  overallPnl,
  overallFees,
  overallTrades,
  overallWins,
  overallLosses,
}: StatsGridProps) {
  const dailyWinRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(0) : "0";
  const dailyPositive = dailyNet >= 0;
  const overallWinRate = overallTrades > 0 ? ((overallWins / overallTrades) * 100).toFixed(0) : "0";
  const overallPositive = overallNet >= 0;

  const stats = [
    {
      label: "Daily NET PnL",
      value: `${dailyPositive ? "+" : ""}$${dailyNet.toFixed(2)}`,
      sub: `Gross: $${dailyPnl >= 0 ? "+" : ""}${dailyPnl.toFixed(2)} | Fees: -$${dailyFees.toFixed(2)}`,
      icon: "💰",
      color: dailyPositive ? "text-emerald-400" : "text-red-400",
      glow: dailyPositive ? "glow-green" : "glow-red",
    },
    {
      label: "Overall NET PnL",
      value: `${overallPositive ? "+" : ""}$${overallNet.toFixed(2)}`,
      sub: `${overallTrades} trades · ${overallWins}W/${overallLosses}L · Fees: -$${overallFees.toFixed(2)}`,
      icon: "📈",
      color: overallPositive ? "text-emerald-400" : "text-red-400",
      glow: overallPositive ? "glow-green" : "glow-red",
    },
    {
      label: "Win Rate",
      value: `${overallWinRate}%`,
      icon: "🎯",
      color: "text-purple-400",
      glow: "glow-purple",
      sub: `Today: ${dailyWinRate}% (${wins}W/${losses}L) · Overall: ${overallWins}W/${overallLosses}L`,
    },
    {
      label: "Trades Today",
      value: `${tradesToday}`,
      icon: "📊",
      color: "text-cyan-400",
      glow: "glow-cyan",
      sub: `Live Signals: ${liveSignals}`,
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
