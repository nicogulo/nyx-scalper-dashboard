"use client";

import { motion } from "framer-motion";

interface ErrorEntry {
  ts: string;
  msg: string;
}

interface ErrorLogProps {
  errors: ErrorEntry[];
  total: number;
}

export default function ErrorLog({ errors, total }: ErrorLogProps) {
  const categorize = (msg: string) => {
    if (msg.includes("Monitor error")) return { label: "Monitor", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" };
    if (msg.includes("WS parse error")) return { label: "WS Parse", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" };
    if (msg.includes("WS disconnected")) return { label: "WS Disc", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" };
    if (msg.includes("listenKey")) return { label: "API", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" };
    if (msg.includes("WS user stream")) return { label: "WS User", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" };
    if (msg.includes("WS depth") || msg.includes("bookTicker")) return { label: "WS Data", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" };
    if (msg.includes("Failed to cancel")) return { label: "Order", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" };
    return { label: "Other", color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20" };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-slate-700/50 bg-[#12122a] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <span className="font-semibold text-slate-300">Error Log</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Total:</span>
          <span className={`text-sm font-bold ${total === 0 ? "text-emerald-400" : total < 10 ? "text-yellow-400" : "text-red-400"}`}>
            {total}
          </span>
        </div>
      </div>

      {errors.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-2xl mb-2">✨</div>
          <p className="text-sm text-slate-500">No errors — all clean!</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
          {[...errors].reverse().map((err, i) => {
            const cat = categorize(err.msg);
            return (
              <div
                key={i}
                className={`flex items-start gap-3 p-2.5 rounded-lg border ${cat.bg}`}
              >
                <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${cat.color} bg-black/30`}>
                  {cat.label}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-300 break-all">{err.msg}</p>
                </div>
                <span className="shrink-0 text-[10px] text-slate-600 whitespace-nowrap">
                  {err.ts.split(" ")[1] || ""}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
