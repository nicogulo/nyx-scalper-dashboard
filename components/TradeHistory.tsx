"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Trade {
  ts?: string;
  symbol?: string;
  direction?: string;
  side?: string;
  entry?: number;
  exit?: number;
  qty?: number;
  pnl?: number;
  pnl_pct?: number;
  sl?: number;
  tp?: number;
  rr?: number;
  confidence?: string;
  reason?: string;
  status?: string;
  result?: string;
  close_reason?: string;
  mode?: string;
}

type FilterMode = "all" | "live" | "testnet";

function ModeBadge({ mode }: { mode?: string }) {
  if (mode === "live-analyze" || mode === "live") {
    return (
      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white leading-tight">
        LIVE
      </span>
    );
  }
  return (
    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black leading-tight">
      TESTNET
    </span>
  );
}

export default function TradeHistory({ trades }: { trades: Trade[] }) {
  const [filter, setFilter] = useState<FilterMode>("all");

  if (!trades || trades.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-slate-700/50 bg-[#12122a] p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">📜</span>
          <span className="font-semibold text-slate-300">Trade History</span>
        </div>
        <div className="text-center py-8 text-slate-500">
          <div className="text-4xl mb-2">📊</div>
          <div>No trades yet</div>
        </div>
      </motion.div>
    );
  }

  const filtered =
    filter === "all"
      ? trades
      : trades.filter((t) => {
          const m = t.mode || "testnet";
          if (filter === "live") return m === "live-analyze" || m === "live";
          return m === "testnet";
        });

  const pills: { label: string; value: FilterMode }[] = [
    { label: "All", value: "all" },
    { label: "LIVE", value: "live" },
    { label: "TESTNET", value: "testnet" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-slate-700/50 bg-[#12122a] p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📜</span>
          <span className="font-semibold text-slate-300">
            Trade History ({filtered.length})
          </span>
        </div>
        <div className="flex gap-1">
          {pills.map((p) => (
            <button
              key={p.value}
              onClick={() => setFilter(p.value)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                filter === p.value
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-700/50 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-700/50">
              <th className="text-left py-2 px-2">Mode</th>
              <th className="text-left py-2 px-2">Time</th>
              <th className="text-left py-2 px-2">Pair</th>
              <th className="text-left py-2 px-2">Side</th>
              <th className="text-right py-2 px-2">Entry</th>
              <th className="text-right py-2 px-2">Exit</th>
              <th className="text-right py-2 px-2">PnL</th>
              <th className="text-center py-2 px-2">R:R</th>
              <th className="text-left py-2 px-2">Reason</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((trade, i) => {
              const pnl = trade.pnl || 0;
              const isWin = pnl > 0;
              const side = trade.direction || trade.side || "?";
              const isLong = side === "LONG";

              return (
                <tr
                  key={i}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-2 px-2">
                    <ModeBadge mode={trade.mode} />
                  </td>
                  <td className="py-2 px-2 text-slate-400 text-xs whitespace-nowrap">
                    {trade.ts
                      ? new Date(trade.ts).toLocaleString("id-ID", {
                          timeZone: "Asia/Jakarta",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                  <td className="py-2 px-2 font-medium text-white">
                    {trade.symbol || "-"}
                  </td>
                  <td className="py-2 px-2">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-xs font-bold ${
                        isLong
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {side}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right text-slate-300">
                    {trade.entry ? `$${trade.entry.toFixed(2)}` : "-"}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-300">
                    {trade.exit ? `$${trade.exit.toFixed(2)}` : "-"}
                  </td>
                  <td
                    className={`py-2 px-2 text-right font-bold ${
                      isWin ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {pnl !== 0
                      ? `${isWin ? "+" : ""}$${pnl.toFixed(2)}`
                      : trade.status === "PLACED"
                      ? "🔄 Open"
                      : "-"}
                  </td>
                  <td className="py-2 px-2 text-center text-slate-400">
                    {trade.rr || "-"}
                  </td>
                  <td className="py-2 px-2 text-slate-500 text-xs max-w-[200px] truncate">
                    {trade.reason || trade.close_reason || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
