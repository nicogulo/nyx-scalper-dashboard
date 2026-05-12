"use client";

import { motion } from "framer-motion";

interface Position {
  symbol: string;
  side: string;
  size: number;
  entry: number;
  markPrice: number;
  unrealizedProfit: number;
  leverage: string;
}

export default function PositionCard({
  testnet,
  live,
}: {
  testnet: Position[] | { error: string };
  live: Position[] | { error: string };
}) {
  const renderPositions = (
    label: string,
    icon: string,
    positions: Position[] | { error: string },
    color: string
  ) => {
    const hasError = !Array.isArray(positions);
    const posList = Array.isArray(positions) ? positions : [];

    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span>{icon}</span>
          <span className={`text-sm font-semibold ${color}`}>{label}</span>
          {!hasError && (
            <span className="text-xs text-slate-500 ml-auto">
              {posList.length} position{posList.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {hasError ? (
          <div className="text-red-400 text-xs">⚠️ API Error</div>
        ) : posList.length === 0 ? (
          <div className="text-slate-500 text-xs py-2">No open positions</div>
        ) : (
          <div className="space-y-2">
            {posList.map((pos) => {
              const isLong = pos.side === "LONG";
              const pnlColor = pos.unrealizedProfit >= 0 ? "text-emerald-400" : "text-red-400";
              const sideBg = isLong ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400";
              const borderGlow = pos.unrealizedProfit >= 0 ? "border-emerald-500/30 glow-green" : "border-red-500/30 glow-red";

              return (
                <div key={pos.symbol} className={`rounded-lg border ${borderGlow} p-3`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${sideBg}`}>
                        {pos.side}
                      </span>
                      <span className="font-semibold text-white text-sm">{pos.symbol}</span>
                      <span className="text-xs text-slate-500">{pos.leverage}x</span>
                    </div>
                    <span className={`font-bold text-sm ${pnlColor}`}>
                      {pos.unrealizedProfit >= 0 ? "+" : ""}${pos.unrealizedProfit.toFixed(2)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Entry</span>
                      <div className="text-slate-300">${pos.entry.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Mark</span>
                      <div className="text-slate-300">${pos.markPrice.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Size</span>
                      <div className="text-slate-300">{pos.size}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-slate-700/50 bg-[#12122a] p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📊</span>
        <span className="font-semibold text-slate-300">Open Positions</span>
      </div>
      <div className="space-y-4">
        {renderPositions("Testnet", "🧪", testnet, "text-cyan-400")}
        <div className="border-t border-slate-700/30" />
        {renderPositions("Live", "🔴", live, "text-purple-400")}
      </div>
    </motion.div>
  );
}
