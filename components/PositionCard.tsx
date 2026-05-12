"use client";

import { motion } from "framer-motion";

interface Position {
  symbol: string;
  side: string;
  entry: number;
  size: number;
  sl: number;
  tp: number;
  highest_pnl_pct?: number;
  entry_time?: string;
}

export default function PositionCard({ positions }: { positions: Record<string, Position> }) {
  const posList = Object.entries(positions || {});

  if (posList.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-slate-700/50 bg-[#12122a] p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">📊</span>
          <span className="font-semibold text-slate-300">Open Positions</span>
        </div>
        <div className="text-center py-8 text-slate-500">
          <div className="text-4xl mb-2">📭</div>
          <div>No open positions</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-slate-700/50 bg-[#12122a] p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <span className="font-semibold text-slate-300">
            Open Positions ({posList.length})
          </span>
        </div>
      </div>
      <div className="space-y-3">
        {posList.map(([symbol, pos]) => {
          const isLong = pos.side === "LONG";
          const sideColor = isLong
            ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
            : "text-red-400 border-red-500/30 bg-red-500/10";
          const glowClass = isLong ? "glow-green" : "glow-red";

          return (
            <div
              key={symbol}
              className={`rounded-lg border ${sideColor} p-4 ${glowClass}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${isLong ? "text-emerald-400" : "text-red-400"}`}>
                    {pos.side}
                  </span>
                  <span className="font-semibold text-white">{symbol}</span>
                </div>
                <span className="text-xs text-slate-400">
                  Size: {pos.size}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-slate-500">Entry</span>
                  <div className="font-medium">${pos.entry?.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-red-400">SL</span>
                  <div className="font-medium">${pos.sl?.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-emerald-400">TP</span>
                  <div className="font-medium">${pos.tp?.toFixed(2)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
